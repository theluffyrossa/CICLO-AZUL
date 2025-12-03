import {
  WasteCategory,
  RecipientType,
  TreatmentType,
  CollectionStatus,
  ApprovalStatus,
  GravimetricDataSource,
  ImageStage,
} from '@/types';

export const translateWasteCategory = (category: WasteCategory): string => {
  const translations: Record<WasteCategory, string> = {
    [WasteCategory.ORGANIC]: 'Orgânico',
    [WasteCategory.RECYCLABLE]: 'Reciclável',
    [WasteCategory.HAZARDOUS]: 'Perigoso',
    [WasteCategory.ELECTRONIC]: 'Eletrônico',
    [WasteCategory.CONSTRUCTION]: 'Construção',
    [WasteCategory.OTHER]: 'Outro',
  };
  return translations[category] || category;
};

export const translateRecipientType = (type: RecipientType): string => {
  const translations: Record<RecipientType, string> = {
    [RecipientType.COMPOSTING_CENTER]: 'Centro de Compostagem',
    [RecipientType.RECYCLING_ASSOCIATION]: 'Associação de Reciclagem',
    [RecipientType.LANDFILL]: 'Aterro Sanitário',
    [RecipientType.INDIVIDUAL]: 'Individual',
    [RecipientType.COOPERATIVE]: 'Cooperativa',
    [RecipientType.OTHER]: 'Outro',
  };
  return translations[type] || type;
};

export const translateTreatmentType = (type: TreatmentType): string => {
  const translations: Record<TreatmentType, string> = {
    [TreatmentType.RECYCLING]: 'Reciclagem',
    [TreatmentType.COMPOSTING]: 'Compostagem',
    [TreatmentType.REUSE]: 'Reutilização',
    [TreatmentType.LANDFILL]: 'Aterro',
    [TreatmentType.ANIMAL_FEEDING]: 'Alimentação Animal',
  };
  return translations[type] || type;
};

export const translateCollectionStatus = (status: CollectionStatus): string => {
  const translations: Record<CollectionStatus, string> = {
    [CollectionStatus.SCHEDULED]: 'Agendada',
    [CollectionStatus.IN_PROGRESS]: 'Em Andamento',
    [CollectionStatus.COMPLETED]: 'Concluída',
    [CollectionStatus.CANCELLED]: 'Cancelada',
  };
  return translations[status] || status;
};

export const translateApprovalStatus = (status: ApprovalStatus): string => {
  const translations: Record<ApprovalStatus, string> = {
    [ApprovalStatus.PENDING_APPROVAL]: 'Pendente de Aprovação',
    [ApprovalStatus.APPROVED]: 'Aprovada',
    [ApprovalStatus.REJECTED]: 'Rejeitada',
  };
  return translations[status] || status;
};

export const translateGravimetricDataSource = (source: GravimetricDataSource): string => {
  const translations: Record<GravimetricDataSource, string> = {
    [GravimetricDataSource.MANUAL]: 'Manual',
    [GravimetricDataSource.CSV_IMPORT]: 'Importação CSV',
    [GravimetricDataSource.API]: 'API',
    [GravimetricDataSource.SCALE]: 'Balança',
  };
  return translations[source] || source;
};

export const translateImageStage = (stage: ImageStage): string => {
  const translations: Record<ImageStage, string> = {
    [ImageStage.COLLECTION]: 'Pesagem',
    [ImageStage.RECEPTION]: 'Recepção',
    [ImageStage.SORTING]: 'Triagem',
  };
  return translations[stage] || stage;
};

export const cleanWasteTypeName = (name: string | undefined): string => {
  if (!name) return '';
  return name.replace(/^\d+\s*/, '').trim();
};
