import { WasteCategory } from '@shared/types';

export interface CreateWasteTypeDto {
  name: string;
  category: WasteCategory;
  description?: string;
  unit?: string;
}

export interface UpdateWasteTypeDto {
  name?: string;
  category?: WasteCategory;
  description?: string;
  unit?: string;
  active?: boolean;
}

export interface WasteTypeFilters {
  category?: WasteCategory;
  active?: boolean;
  search?: string;
}
