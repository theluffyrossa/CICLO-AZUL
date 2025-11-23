export interface BackupFileInfo {
  filename: string;
  size: number;
  sizeFormatted: string;
  createdAt: Date;
  age: string;
  checksum?: string;
}

export interface BackupCreateResponse {
  filename: string;
  size: number;
  sizeFormatted: string;
  checksum: string;
  createdAt: Date;
  duration: number;
}

export interface BackupListResponse {
  backups: BackupFileInfo[];
  total: number;
  totalSize: number;
  totalSizeFormatted: string;
}

export interface BackupRestoreRequest {
  filename: string;
  createSafetyBackup?: boolean;
}

export interface BackupRestoreResponse {
  success: boolean;
  message: string;
  safetyBackupCreated: boolean;
  duration: number;
}

export interface BackupCleanResponse {
  deletedCount: number;
  freedSpace: number;
  freedSpaceFormatted: string;
  keptCount: number;
}

export interface BackupDeleteRequest {
  filename: string;
}
