export interface CreateClientDto {
  name: string;
  document: string;
  phone?: string;
  email?: string;
  address?: string;
  city?: string;
  state?: string;
  zipCode?: string;
  notes?: string;
}

export interface UpdateClientDto {
  name?: string;
  document?: string;
  phone?: string;
  email?: string;
  address?: string;
  city?: string;
  state?: string;
  zipCode?: string;
  notes?: string;
  active?: boolean;
}

export interface ClientFilters {
  search?: string;
  active?: boolean;
  city?: string;
  state?: string;
}
