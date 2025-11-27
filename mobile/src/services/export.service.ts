import { Paths, File } from 'expo-file-system';
import * as Sharing from 'expo-sharing';
import { api } from './api.service';
import { Alert } from 'react-native';

export interface ExportFilters {
  startDate?: string;
  endDate?: string;
  clientId?: string;
}

const downloadFile = async (
  endpoint: string,
  filename: string,
  filters?: ExportFilters
): Promise<void> => {
  try {
    const response = await api.get(endpoint, {
      params: filters,
      responseType: 'arraybuffer',
    });

    if (!response.data || response.data.byteLength === 0) {
      throw new Error('Arquivo vazio. Não há dados para exportar no período selecionado.');
    }

    const uint8Array = new Uint8Array(response.data);
    const file = new File(Paths.cache, filename);

    if (file.exists) {
      file.delete();
    }

    file.create();
    file.write(uint8Array);

    const canShare = await Sharing.isAvailableAsync();
    if (!canShare) {
      Alert.alert(
        'Download Completo',
        `Arquivo salvo: ${filename}`,
        [{ text: 'OK' }]
      );
      return;
    }

    await Sharing.shareAsync(file.uri, {
      mimeType: filename.endsWith('.pdf') ? 'application/pdf' : 'text/csv',
      dialogTitle: 'Salvar Relatório',
      UTI: filename.endsWith('.pdf') ? 'com.adobe.pdf' : 'public.comma-separated-values-text',
    });
  } catch (error) {
    if (error instanceof Error) {
      throw error;
    }
    throw new Error('Erro desconhecido ao baixar arquivo');
  }
};

export const exportService = {
  async exportPDF(filters?: ExportFilters): Promise<void> {
    const filename = `relatorio-coletas-${new Date().toISOString().split('T')[0]}.pdf`;
    await downloadFile('/dashboard/export/pdf', filename, filters);
  },

  async exportCSV(filters?: ExportFilters): Promise<void> {
    const filename = `relatorio-coletas-${new Date().toISOString().split('T')[0]}.csv`;
    await downloadFile('/dashboard/export/csv', filename, filters);
  },
};
