import { CollectionStatus } from '@shared/types';

export interface CreateCollectionDto {
  clientId: string;
  unitId: string;
  wasteTypeId: string;
  userId: string;
  recipientId: string;
  collectionDate: Date;
  status?: CollectionStatus;
  notes?: string;
  latitude?: number;
  longitude?: number;
}

export interface UpdateCollectionDto {
  wasteTypeId?: string;
  recipientId?: string;
  collectionDate?: Date;
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
  startDate?: string;
  endDate?: string;
}
