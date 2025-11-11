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

export enum RecipientType {
  COMPOSTING_CENTER = 'COMPOSTING_CENTER',
  RECYCLING_ASSOCIATION = 'RECYCLING_ASSOCIATION',
  LANDFILL = 'LANDFILL',
  INDIVIDUAL = 'INDIVIDUAL',
  COOPERATIVE = 'COOPERATIVE',
  OTHER = 'OTHER',
}

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
}

export interface AuthResponse {
  user: User;
  accessToken: string;
  refreshToken: string;
}

export interface Client {
  id: string;
  name: string;
  document: string;
  phone?: string;
  email?: string;
  address?: string;
  city?: string;
  state?: string;
  active: boolean;
}

export interface Unit {
  id: string;
  clientId: string;
  name: string;
  type?: string;
  address?: string;
  city?: string;
  state?: string;
  latitude?: number;
  longitude?: number;
  responsibleName?: string;
  responsiblePhone?: string;
  active: boolean;
  client?: Client;
}

export interface WasteType {
  id: string;
  name: string;
  category: WasteCategory;
  description?: string;
  unit?: string;
  active: boolean;
}

export interface Recipient {
  id: string;
  name: string;
  type: RecipientType;
  document?: string;
  secondaryDocument?: string;
  address?: string;
  city?: string;
  state?: string;
  phone?: string;
  email?: string;
  active: boolean;
  notes?: string;
}

export interface Collection {
  id: string;
  clientId: string;
  unitId: string;
  wasteTypeId: string;
  userId: string;
  recipientId: string;
  collectionDate: string;
  status: CollectionStatus;
  notes?: string;
  latitude?: number;
  longitude?: number;
  client?: Client;
  unit?: Unit;
  wasteType?: WasteType;
  user?: User;
  recipient?: Recipient;
  gravimetricData?: GravimetricData[];
  images?: Image[];
}

export enum GravimetricDataSource {
  MANUAL = 'MANUAL',
  CSV_IMPORT = 'CSV_IMPORT',
  API = 'API',
  SCALE = 'SCALE',
}

export interface GravimetricData {
  id: string;
  collectionId: string;
  weightKg: number;
  source: GravimetricDataSource;
  deviceId?: string;
  metadata?: Record<string, unknown>;
  createdAt: string;
}

export interface CreateGravimetricDataInput {
  collectionId: string;
  weightKg: number;
  source: GravimetricDataSource;
  deviceId?: string;
  metadata?: Record<string, unknown>;
}

export enum ImageStage {
  COLLECTION = 'COLLECTION',
  RECEPTION = 'RECEPTION',
  SORTING = 'SORTING',
}

export interface ImageMetadata {
  deviceModel?: string;
  deviceManufacturer?: string;
  osVersion?: string;
  latitude?: number;
  longitude?: number;
}

export interface Image {
  id: string;
  collectionId: string;
  url: string;
  filename: string;
  stage?: ImageStage;
  capturedAt?: string;
  consentGiven: boolean;
  metadata?: ImageMetadata;
}

export interface UploadImageInput {
  uri: string;
  collectionId: string;
  stage?: ImageStage;
  consentGiven: boolean;
  latitude?: number;
  longitude?: number;
  capturedAt?: string;
  deviceInfo?: string;
  description?: string;
}

export interface DashboardData {
  summary: {
    totalCollections: number;
    totalWeightKg: number;
    activeClients: number;
    activeUnits: number;
  };
  wasteTypeDistribution: {
    wasteTypeId: string;
    wasteTypeName: string;
    category: string;
    count: number;
    totalWeightKg: number;
    percentage: number;
  }[];
  topUnits: {
    unitId: string;
    unitName: string;
    clientName: string;
    totalCollections: number;
    totalWeightKg: number;
  }[];
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

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  message?: string;
  errors?: Array<{ field: string; message: string }>;
}
