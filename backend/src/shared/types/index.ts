import { Request } from 'express';

export enum UserRole {
  ADMIN = 'ADMIN',
  OPERATOR = 'OPERATOR',
}

export enum CollectionStatus {
  SCHEDULED = 'SCHEDULED',
  IN_PROGRESS = 'IN_PROGRESS',
  COMPLETED = 'COMPLETED',
  CANCELLED = 'CANCELLED',
}

export enum WasteCategory {
  ORGANIC = 'ORGANIC',
  RECYCLABLE = 'RECYCLABLE',
  HAZARDOUS = 'HAZARDOUS',
  ELECTRONIC = 'ELECTRONIC',
  CONSTRUCTION = 'CONSTRUCTION',
  OTHER = 'OTHER',
}

export enum AuditAction {
  CREATE = 'CREATE',
  UPDATE = 'UPDATE',
  DELETE = 'DELETE',
  LOGIN = 'LOGIN',
  LOGOUT = 'LOGOUT',
  EXPORT = 'EXPORT',
}

export enum LegalBasis {
  CONSENT = 'CONSENT',
  LEGITIMATE_INTEREST = 'LEGITIMATE_INTEREST',
  LEGAL_OBLIGATION = 'LEGAL_OBLIGATION',
  CONTRACT = 'CONTRACT',
}

export enum GravimetricDataSource {
  MANUAL = 'MANUAL',
  CSV_IMPORT = 'CSV_IMPORT',
  API = 'API',
  SCALE = 'SCALE',
}

export enum RecipientType {
  COMPOSTING_CENTER = 'COMPOSTING_CENTER',
  RECYCLING_ASSOCIATION = 'RECYCLING_ASSOCIATION',
  LANDFILL = 'LANDFILL',
  INDIVIDUAL = 'INDIVIDUAL',
  COOPERATIVE = 'COOPERATIVE',
  OTHER = 'OTHER',
}

export interface AuthUser {
  id: string;
  email: string;
  role: UserRole;
  name: string;
}

export interface AuthRequest extends Request {
  user?: AuthUser;
}

export interface PaginationParams {
  page: number;
  limit: number;
  offset: number;
}

export interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  message?: string;
  errors?: ValidationError[];
}

export interface ValidationError {
  field: string;
  message: string;
}

export interface DateRangeFilter {
  startDate?: Date;
  endDate?: Date;
}

export interface CollectionFilters extends DateRangeFilter {
  clientId?: string;
  unitId?: string;
  wasteTypeId?: string;
  userId?: string;
  recipientId?: string;
  status?: CollectionStatus;
}

export interface RecipientData {
  id: string;
  name: string;
  type: RecipientType;
  document: string | null;
  secondaryDocument: string | null;
  address: string | null;
  city: string | null;
  state: string | null;
  zipCode: string | null;
  phone: string | null;
  email: string | null;
  responsibleName: string | null;
  responsiblePhone: string | null;
  active: boolean;
  notes: string | null;
  acceptedWasteTypes: string[] | null;
  createdAt: Date;
  updatedAt: Date;
}
