import { CollectionStatus, TreatmentType, ApprovalStatus } from '@shared/types';

export interface CreateCollectionDto {
  clientId: string;
  unitId: string;
  wasteTypeId: string;
  userId: string;
  recipientId: string;
  collectionDate: Date;
  treatmentType: TreatmentType;
  status?: CollectionStatus;
  notes?: string;
  latitude?: number;
  longitude?: number;
  metadata?: Record<string, unknown>;
}

export interface UpdateCollectionDto {
  wasteTypeId?: string;
  recipientId?: string;
  collectionDate?: Date;
  treatmentType?: TreatmentType;
  status?: CollectionStatus;
  notes?: string;
  latitude?: number;
  longitude?: number;
}

export interface CollectionFilters {
  clientId?: string;
  unitId?: string;
  wasteTypeId?: string;
  userId?: string;
  recipientId?: string;
  status?: CollectionStatus;
  approvalStatus?: ApprovalStatus;
  startDate?: string;
  endDate?: string;
}
