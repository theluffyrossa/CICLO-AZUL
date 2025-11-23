export interface CreateImageDto {
  collectionId: string;
  url: string;
  urlMedium?: string;
  urlSmall?: string;
  urlThumbnail?: string;
  storageKey?: string;
  filename: string;
  mimeType?: string;
  fileSize?: number;
  width?: number;
  height?: number;
  latitude?: number;
  longitude?: number;
  capturedAt?: Date;
  deviceInfo?: string;
  consentGiven: boolean;
  description?: string;
}

export interface UpdateImageDto {
  consentGiven?: boolean;
  description?: string;
  latitude?: number;
  longitude?: number;
}

export interface ImageFilters {
  collectionId?: string;
  consentGiven?: boolean;
}
