import PDFDocument from 'pdfkit';
import { Op } from 'sequelize';
import {
  Collection,
  Client,
  Unit,
  WasteType,
  User,
  GravimetricData,
  Recipient,
  Image,
} from '@database/models';
import { ApprovalStatus } from '@shared/types';
import { DashboardFilters, DashboardData } from './dashboard.types';
import { DashboardService } from './dashboard.service';
import { downloadImagesAsBuffers } from '@shared/utils/image-download.util';

type PDFDocumentType = InstanceType<typeof PDFDocument>;

interface CollectionExportData {
  collectionDate: string;
  clientName: string;
  unitName: string;
  wasteTypeName: string;
  totalWeightKg: number;
  treatmentType: string;
  recipientName: string;
  status: string;
  approvalStatus: string;
  userName: string;
  unitAddress: string;
  unitCity: string;
  images: Array<{
    url: string;
    urlSmall: string | null;
    description: string | null;
    capturedAt: Date | null;
    latitude: number | null;
    longitude: number | null;
  }>;
  imageCount: number;
}

const TREATMENT_TYPES: Record<string, string> = {
  RECYCLING: 'Reciclagem',
  COMPOSTING: 'Compostagem',
  INCINERATION: 'Incineração',
  LANDFILL: 'Aterro',
  REUSE: 'Reaproveitamento',
  ANIMAL_FEEDING: 'Alimentação Animal',
};

const APPROVAL_STATUS: Record<string, string> = {
  PENDING_APPROVAL: 'Pendente',
  APPROVED: 'Aprovado',
  REJECTED: 'Rejeitado',
};

const COLLECTION_STATUS: Record<string, string> = {
  IN_PROGRESS: 'Em Progresso',
  COMPLETED: 'Concluído',
  CANCELLED: 'Cancelado',
};

export class DashboardExportService {
  private dashboardService: DashboardService;

  constructor() {
    this.dashboardService = new DashboardService();
  }

  async getCollectionsForExport(filters: DashboardFilters): Promise<CollectionExportData[]> {
    const dateFilter = this.buildDateFilter(filters);

    const whereConditions: Record<string, unknown> = {
      ...dateFilter,
      approvalStatus: ApprovalStatus.APPROVED,
    };
    if (filters.clientId) {
      whereConditions.clientId = filters.clientId;
    }

    const collections = await Collection.findAll({
      where: whereConditions,
      order: [['collectionDate', 'DESC']],
      include: [
        {
          model: Client,
          as: 'client',
          attributes: ['name'],
        },
        {
          model: Unit,
          as: 'unit',
          attributes: ['name', 'address', 'city'],
        },
        {
          model: WasteType,
          as: 'wasteType',
          attributes: ['name'],
        },
        {
          model: User,
          as: 'user',
          attributes: ['name'],
        },
        {
          model: Recipient,
          as: 'recipient',
          attributes: ['name'],
        },
        {
          model: GravimetricData,
          as: 'gravimetricData',
        },
        {
          model: Image,
          as: 'images',
          attributes: ['url', 'urlSmall', 'description', 'capturedAt', 'latitude', 'longitude'],
        },
      ],
    });

    return collections.map((collection) => {
      const totalWeight = collection.gravimetricData?.reduce(
        (sum, data) => sum + Number(data.weightKg),
        0
      ) || 0;

      const images = collection.images?.map((img) => ({
        url: img.url,
        urlSmall: img.urlSmall,
        description: img.description,
        capturedAt: img.capturedAt,
        latitude: img.latitude,
        longitude: img.longitude,
      })) || [];

      return {
        collectionDate: new Date(collection.collectionDate).toLocaleDateString('pt-BR'),
        clientName: collection.client?.name || '',
        unitName: collection.unit?.name || '',
        wasteTypeName: collection.wasteType?.name || '',
        totalWeightKg: Number(totalWeight),
        treatmentType: TREATMENT_TYPES[collection.treatmentType] || collection.treatmentType,
        recipientName: collection.recipient?.name || '',
        status: COLLECTION_STATUS[collection.status] || collection.status,
        approvalStatus: APPROVAL_STATUS[collection.approvalStatus] || collection.approvalStatus,
        userName: collection.user?.name || '',
        unitAddress: collection.unit?.address || '',
        unitCity: collection.unit?.city || '',
        images,
        imageCount: images.length,
      };
    });
  }

  async generatePDF(filters: DashboardFilters): Promise<Buffer> {
    const [collections, dashboardData] = await Promise.all([
      this.getCollectionsForExport(filters),
      this.dashboardService.getDashboardData(filters),
    ]);

    const allImageUrls = collections.flatMap((c) =>
      c.images.map((img) => img.urlSmall || img.url).filter(Boolean)
    );
    const imageBuffers = await downloadImagesAsBuffers(allImageUrls);

    return new Promise((resolve, reject) => {
      const doc = new PDFDocument({
        size: 'A4',
        margins: { top: 40, bottom: 40, left: 40, right: 40 },
        info: {
          Title: 'Relatório de Coletas - Ciclo Azul',
          Author: 'Sistema Ciclo Azul',
          Subject: 'Relatório de Coletas de Resíduos',
          Keywords: 'coletas, resíduos, relatório',
          Creator: 'Ciclo Azul',
          Producer: 'Ciclo Azul',
        },
        pdfVersion: '1.4',
      });

      const buffers: Buffer[] = [];
      doc.on('data', buffers.push.bind(buffers));
      doc.on('end', () => resolve(Buffer.concat(buffers)));
      doc.on('error', reject);

      doc.fontSize(18).font('Helvetica-Bold').text('Relatório de Coletas', { align: 'center' });
      doc.fontSize(10).font('Helvetica').text('Sistema Ciclo Azul', { align: 'center' });
      doc.moveDown(0.5);

      const now = new Date().toLocaleString('pt-BR');
      doc.fontSize(8).text(`Gerado em: ${now}`, { align: 'right' });

      if (filters.startDate || filters.endDate) {
        const period = this.formatPeriod(filters);
        doc.fontSize(8).text(`Período: ${period}`, { align: 'right' });
      }

      doc.moveDown(1.5);

      this.addDashboardSummary(doc, dashboardData);
      this.addWasteTypeDistribution(doc, dashboardData);
      this.addTreatmentTypeDistribution(doc, dashboardData);
      this.addTopUnits(doc, dashboardData);

      if (doc.y > 600) {
        doc.addPage();
      } else {
        doc.moveDown(1);
      }

      doc.fontSize(12).font('Helvetica-Bold').text('Detalhamento das Coletas', 40, doc.y);
      doc.moveDown(1);

      collections.forEach((collection, index) => {
        if (doc.y > 700) {
          doc.addPage();
        }

        doc.fontSize(9).font('Helvetica-Bold').text(`${index + 1}. ${collection.collectionDate} - ${collection.clientName}`);
        doc.fontSize(8).font('Helvetica');
        doc.text(`   Unidade: ${collection.unitName} - ${collection.unitCity}`, { width: 500 });
        doc.text(`   Tipo de Resíduo: ${collection.wasteTypeName} | Peso: ${collection.totalWeightKg.toFixed(2)} kg`);
        doc.text(`   Tratamento: ${collection.treatmentType} | Destinatário: ${collection.recipientName}`);
        doc.text(`   Responsável: ${collection.userName}`);

        if (collection.imageCount > 0) {
          doc.text(`   Imagens: ${collection.imageCount} foto(s)`);
          this.addCollectionImages(doc, collection, imageBuffers);
        }

        doc.moveDown(0.5);
      });

      doc.end();
    });
  }

  private addDashboardSummary(doc: PDFDocumentType, data: DashboardData): void {
    doc.fontSize(14).font('Helvetica-Bold').text('Resumo Geral', 40, doc.y);
    doc.moveDown(0.8);

    const boxWidth = 120;
    const boxHeight = 45;
    const spacing = 15;
    const startX = 40;
    const startY = doc.y;

    const summaryItems = [
      { label: 'Total de Coletas', value: data.summary.totalCollections.toString() },
      { label: 'Peso Total (kg)', value: data.summary.totalWeightKg.toFixed(2) },
      { label: 'Clientes Ativos', value: data.summary.activeClients.toString() },
      { label: 'Unidades Ativas', value: data.summary.activeUnits.toString() },
    ];

    summaryItems.forEach((item, index) => {
      const col = index % 4;
      const xPos = startX + (col * (boxWidth + spacing));

      doc.rect(xPos, startY, boxWidth, boxHeight)
        .fillAndStroke('#f0f8ff', '#4169e1');

      doc.fillColor('#000000');
      doc.fontSize(8).font('Helvetica')
        .text(item.label, xPos + 5, startY + 8, { width: boxWidth - 10, align: 'center' });

      doc.fontSize(16).font('Helvetica-Bold')
        .text(item.value, xPos + 5, startY + 22, { width: boxWidth - 10, align: 'center' });
    });

    doc.y = startY + boxHeight + 20;
  }

  private addWasteTypeDistribution(doc: PDFDocumentType, data: DashboardData): void {
    if (data.wasteTypeDistribution.length === 0) return;

    if (doc.y > 600) doc.addPage();

    doc.fontSize(12).font('Helvetica-Bold').text('Distribuição por Tipo de Resíduo', 40, doc.y);
    doc.moveDown(0.8);

    const tableTop = doc.y;
    const colPositions = { name: 40, count: 280, weight: 380, percent: 480 };
    const rowHeight = 20;

    doc.fontSize(9).font('Helvetica-Bold');
    doc.text('Tipo de Resíduo', colPositions.name, tableTop, { width: 230 });
    doc.text('Coletas', colPositions.count, tableTop, { align: 'center', width: 90 });
    doc.text('Peso (kg)', colPositions.weight, tableTop, { align: 'right', width: 90 });
    doc.text('% Total', colPositions.percent, tableTop, { align: 'right', width: 70 });

    let currentY = tableTop + rowHeight;
    doc.strokeColor('#cccccc').lineWidth(0.5);
    doc.moveTo(40, currentY - 4).lineTo(555, currentY - 4).stroke();

    doc.fontSize(9).font('Helvetica');
    data.wasteTypeDistribution.forEach((item, index) => {
      if (currentY > 740) {
        doc.addPage();
        currentY = 50;
      }

      if (index % 2 === 0) {
        doc.rect(40, currentY - 3, 515, rowHeight).fillAndStroke('#f9f9f9', '#f9f9f9');
      }

      const name = item.wasteTypeName.length > 35 ? item.wasteTypeName.substring(0, 32) + '...' : item.wasteTypeName;

      doc.fillColor('#000000');
      doc.text(name, colPositions.name, currentY + 2, { width: 230 });
      doc.text(item.count.toString(), colPositions.count, currentY + 2, { align: 'center', width: 90 });
      doc.text(item.totalWeightKg.toFixed(2), colPositions.weight, currentY + 2, { align: 'right', width: 90 });
      doc.text(`${item.percentage.toFixed(1)}%`, colPositions.percent, currentY + 2, { align: 'right', width: 70 });

      currentY += rowHeight;
    });

    doc.y = currentY + 10;
  }

  private addTreatmentTypeDistribution(doc: PDFDocumentType, data: DashboardData): void {
    if (data.treatmentTypeDistribution.length === 0) return;

    if (doc.y > 600) doc.addPage();

    doc.fontSize(12).font('Helvetica-Bold').text('Distribuição por Tipo de Tratamento', 40, doc.y);
    doc.moveDown(0.8);

    const tableTop = doc.y;
    const colPositions = { name: 40, count: 280, weight: 380, percent: 480 };
    const rowHeight = 20;

    doc.fontSize(9).font('Helvetica-Bold');
    doc.text('Tipo de Tratamento', colPositions.name, tableTop, { width: 230 });
    doc.text('Coletas', colPositions.count, tableTop, { align: 'center', width: 90 });
    doc.text('Peso (kg)', colPositions.weight, tableTop, { align: 'right', width: 90 });
    doc.text('% Total', colPositions.percent, tableTop, { align: 'right', width: 70 });

    let currentY = tableTop + rowHeight;
    doc.strokeColor('#cccccc').lineWidth(0.5);
    doc.moveTo(40, currentY - 4).lineTo(555, currentY - 4).stroke();

    doc.fontSize(9).font('Helvetica');
    data.treatmentTypeDistribution.forEach((item, index) => {
      if (currentY > 740) {
        doc.addPage();
        currentY = 50;
      }

      if (index % 2 === 0) {
        doc.rect(40, currentY - 3, 515, rowHeight).fillAndStroke('#f9f9f9', '#f9f9f9');
      }

      const treatmentName = TREATMENT_TYPES[item.treatmentType] || item.treatmentType;
      const name = treatmentName.length > 35 ? treatmentName.substring(0, 32) + '...' : treatmentName;

      doc.fillColor('#000000');
      doc.text(name, colPositions.name, currentY + 2, { width: 230 });
      doc.text(item.count.toString(), colPositions.count, currentY + 2, { align: 'center', width: 90 });
      doc.text(item.totalWeightKg.toFixed(2), colPositions.weight, currentY + 2, { align: 'right', width: 90 });
      doc.text(`${item.percentage.toFixed(1)}%`, colPositions.percent, currentY + 2, { align: 'right', width: 70 });

      currentY += rowHeight;
    });

    doc.y = currentY + 10;
  }

  private addTopUnits(doc: PDFDocumentType, data: DashboardData): void {
    if (data.topUnits.length === 0) return;

    if (doc.y > 600) doc.addPage();

    doc.fontSize(12).font('Helvetica-Bold').text('Top 5 Unidades', 40, doc.y);
    doc.moveDown(0.8);

    const boxPadding = 8;
    const boxMargin = 8;

    doc.fontSize(8).font('Helvetica');
    data.topUnits.forEach((unit, index) => {
      if (doc.y > 700) {
        doc.addPage();
      }

      const boxTop = doc.y;
      const boxHeight = 32;

      doc.rect(40, boxTop, 515, boxHeight)
        .fillAndStroke(index % 2 === 0 ? '#f5f5f5' : '#ffffff', '#cccccc');

      doc.fillColor('#000000');
      doc.font('Helvetica-Bold')
        .fontSize(9)
        .text(`${index + 1}. ${unit.unitName}`, 40 + boxPadding, boxTop + boxPadding, { width: 280 });

      doc.font('Helvetica')
        .fontSize(8)
        .text(`Cliente: ${unit.clientName}`, 40 + boxPadding, boxTop + boxPadding + 12, { width: 280 });

      doc.fontSize(9)
        .text(`${unit.totalCollections} coletas`, 340, boxTop + boxPadding + 6, { width: 90, align: 'center' });

      doc.font('Helvetica-Bold')
        .text(`${unit.totalWeightKg.toFixed(2)} kg`, 440, boxTop + boxPadding + 6, { width: 100, align: 'right' });

      doc.y = boxTop + boxHeight + boxMargin;
    });

    doc.moveDown(1);
  }

  async generateCSV(filters: DashboardFilters): Promise<Buffer> {
    const [collections, dashboardData] = await Promise.all([
      this.getCollectionsForExport(filters),
      this.dashboardService.getDashboardData(filters),
    ]);

    const lines: string[] = [];

    lines.push('RELATÓRIO DE COLETAS - CICLO AZUL');
    lines.push('');
    lines.push('RESUMO GERAL');
    lines.push(`Total de Coletas,${dashboardData.summary.totalCollections}`);
    lines.push(`Peso Total Coletado (kg),${dashboardData.summary.totalWeightKg.toFixed(2)}`);
    lines.push(`Clientes Ativos,${dashboardData.summary.activeClients}`);
    lines.push(`Unidades Ativas,${dashboardData.summary.activeUnits}`);
    lines.push('');

    if (dashboardData.wasteTypeDistribution.length > 0) {
      lines.push('DISTRIBUIÇÃO POR TIPO DE RESÍDUO');
      lines.push('Tipo de Resíduo,Coletas,Peso (kg),Percentual');
      dashboardData.wasteTypeDistribution.forEach((item) => {
        lines.push(`${item.wasteTypeName},${item.count},${item.totalWeightKg.toFixed(2)},${item.percentage.toFixed(1)}%`);
      });
      lines.push('');
    }

    if (dashboardData.treatmentTypeDistribution.length > 0) {
      lines.push('DISTRIBUIÇÃO POR TIPO DE TRATAMENTO');
      lines.push('Tipo de Tratamento,Coletas,Peso (kg),Percentual');
      dashboardData.treatmentTypeDistribution.forEach((item) => {
        const treatmentName = TREATMENT_TYPES[item.treatmentType] || item.treatmentType;
        lines.push(`${treatmentName},${item.count},${item.totalWeightKg.toFixed(2)},${item.percentage.toFixed(1)}%`);
      });
      lines.push('');
    }

    if (dashboardData.topUnits.length > 0) {
      lines.push('TOP 5 UNIDADES');
      lines.push('Posição,Unidade,Cliente,Total de Coletas,Peso Total (kg)');
      dashboardData.topUnits.forEach((unit, index) => {
        lines.push(`${index + 1},${unit.unitName},${unit.clientName},${unit.totalCollections},${unit.totalWeightKg.toFixed(2)}`);
      });
      lines.push('');
    }

    lines.push('DETALHAMENTO DAS COLETAS');
    lines.push('Data da Coleta,Cliente,Unidade,Cidade,Endereço,Tipo de Resíduo,Peso Total (kg),Tipo de Tratamento,Destinatário,Status,Status de Aprovação,Responsável,Quantidade de Imagens,URLs das Imagens,Localizações GPS');

    collections.forEach((c) => {
      const imageUrls = c.images.map((img) => img.url).join('; ');
      const imageLocations = c.images
        .map((img) => {
          if (img.latitude && img.longitude) {
            return `${Number(img.latitude).toFixed(6)},${Number(img.longitude).toFixed(6)}`;
          }
          return 'N/A';
        })
        .join('; ');

      const row = [
        c.collectionDate,
        c.clientName,
        c.unitName,
        c.unitCity,
        c.unitAddress,
        c.wasteTypeName,
        c.totalWeightKg.toFixed(2),
        c.treatmentType,
        c.recipientName,
        c.status,
        c.approvalStatus,
        c.userName,
        c.imageCount.toString(),
        imageUrls,
        imageLocations,
      ].map((field) => `"${field}"`).join(',');

      lines.push(row);
    });

    const csvContent = '\uFEFF' + lines.join('\n');

    return Buffer.from(csvContent, 'utf-8');
  }

  private buildDateFilter(filters: DashboardFilters): Record<string, unknown> {
    const dateFilter: Record<string, unknown> = {};

    if (filters.startDate || filters.endDate) {
      const dateConditions: Record<symbol, Date> = {};
      if (filters.startDate) {
        dateConditions[Op.gte] = new Date(filters.startDate);
      }
      if (filters.endDate) {
        dateConditions[Op.lte] = new Date(filters.endDate);
      }
      dateFilter.collectionDate = dateConditions;
    }

    return dateFilter;
  }

  private formatPeriod(filters: DashboardFilters): string {
    const startDate = filters.startDate
      ? new Date(filters.startDate).toLocaleDateString('pt-BR')
      : 'início';
    const endDate = filters.endDate
      ? new Date(filters.endDate).toLocaleDateString('pt-BR')
      : 'hoje';
    return `${startDate} até ${endDate}`;
  }

  private addCollectionImages(
    doc: PDFDocumentType,
    collection: CollectionExportData,
    imageBuffers: Map<string, Buffer>
  ): void {
    if (collection.images.length === 0) return;

    doc.moveDown(0.3);
    doc.fontSize(8).font('Helvetica-Bold').text('   Evidências Fotográficas:', { continued: false });
    doc.moveDown(0.2);

    const imageWidth = 120;
    const imageHeight = 90;
    const imagesPerRow = 4;
    const imageSpacing = 10;
    const startX = 60;
    let currentX = startX;
    let currentY = doc.y;
    let imageCount = 0;

    collection.images.forEach((image) => {
      const imageUrl = image.urlSmall || image.url;
      const buffer = imageBuffers.get(imageUrl);

      if (!buffer) return;

      if (currentY + imageHeight + 40 > 750) {
        doc.addPage();
        currentY = 50;
        currentX = startX;
        imageCount = 0;
      }

      if (imageCount > 0 && imageCount % imagesPerRow === 0) {
        currentY += imageHeight + imageSpacing + 25;
        currentX = startX;
      }

      try {
        doc.image(buffer, currentX, currentY, {
          fit: [imageWidth, imageHeight],
          align: 'center',
          valign: 'center',
        });

        doc.fontSize(6).font('Helvetica');
        let captionY = currentY + imageHeight + 2;

        if (image.capturedAt) {
          const capturedDate = new Date(image.capturedAt).toLocaleDateString('pt-BR', {
            day: '2-digit',
            month: '2-digit',
            hour: '2-digit',
            minute: '2-digit',
          });
          doc.text(capturedDate, currentX, captionY, { width: imageWidth, align: 'center' });
          captionY += 7;
        }

        if (image.description) {
          const descText = image.description.length > 30
            ? image.description.substring(0, 27) + '...'
            : image.description;
          doc.text(descText, currentX, captionY, { width: imageWidth, align: 'center' });
          captionY += 7;
        }

        if (image.latitude && image.longitude) {
          const lat = Number(image.latitude).toFixed(6);
          const lng = Number(image.longitude).toFixed(6);
          doc.fontSize(5).text(`📍 ${lat}, ${lng}`, currentX, captionY, { width: imageWidth, align: 'center' });
        }

        currentX += imageWidth + imageSpacing;
        imageCount++;
      } catch (error) {
        doc.fontSize(6).font('Helvetica').text('[Erro ao carregar imagem]', currentX, currentY, {
          width: imageWidth,
          align: 'center',
        });
        currentX += imageWidth + imageSpacing;
        imageCount++;
      }
    });

    if (imageCount > 0) {
      doc.y = currentY + imageHeight + 35;
    }
  }
}
