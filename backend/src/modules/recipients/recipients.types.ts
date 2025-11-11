import { RecipientType } from '@shared/types';

export interface CreateRecipientDto {
  name: string;
  type: RecipientType;
  document?: string;
  secondaryDocument?: string;
  address?: string;
  city?: string;
  state?: string;
  zipCode?: string;
  phone?: string;
  email?: string;
  responsibleName?: string;
  responsiblePhone?: string;
  notes?: string;
  acceptedWasteTypes?: string[];
}

export interface UpdateRecipientDto {
  name?: string;
  type?: RecipientType;
  document?: string;
  secondaryDocument?: string;
  address?: string;
  city?: string;
  state?: string;
  zipCode?: string;
  phone?: string;
  email?: string;
  responsibleName?: string;
  responsiblePhone?: string;
  notes?: string;
  acceptedWasteTypes?: string[];
  active?: boolean;
}

export interface RecipientFilters {
  search?: string;
  type?: RecipientType;
  active?: boolean;
  city?: string;
  state?: string;
}
