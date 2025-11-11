export interface CreateUnitDto {
  clientId: string;
  name: string;
  type?: string;
  address?: string;
  city?: string;
  state?: string;
  zipCode?: string;
  latitude?: number;
  longitude?: number;
  responsibleName?: string;
  responsiblePhone?: string;
  notes?: string;
}

export interface UpdateUnitDto {
  name?: string;
  type?: string;
  address?: string;
  city?: string;
  state?: string;
  zipCode?: string;
  latitude?: number;
  longitude?: number;
  responsibleName?: string;
  responsiblePhone?: string;
  notes?: string;
  active?: boolean;
}

export interface UnitFilters {
  clientId?: string;
  search?: string;
  active?: boolean;
  city?: string;
  state?: string;
}
