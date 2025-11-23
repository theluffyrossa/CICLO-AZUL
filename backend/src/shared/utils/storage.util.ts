import { S3Client, PutObjectCommand, DeleteObjectCommand, HeadObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { Upload } from '@aws-sdk/lib-storage';
import fs from 'fs/promises';
import path from 'path';
import crypto from 'crypto';

interface UploadOptions {
  filename: string;
  mimeType: string;
  metadata?: Record<string, string>;
  makePublic?: boolean;
}

interface UploadResult {
  url: string;
  key: string;
  size: number;
}

export interface StorageProvider {
  upload(filePath: string, options: UploadOptions): Promise<UploadResult>;
  uploadBuffer(buffer: Buffer, options: UploadOptions): Promise<UploadResult>;
  delete(key: string): Promise<void>;
  getSignedUrl(key: string, expiresIn?: number): Promise<string>;
  exists(key: string): Promise<boolean>;
}

/**
 * S3-Compatible Storage Provider
 * Suporta: AWS S3, Cloudflare R2, MinIO, DigitalOcean Spaces, Backblaze B2
 */
class S3StorageProvider implements StorageProvider {
  private client: S3Client;
  private bucket: string;
  private publicUrl: string;

  constructor() {
    const endpoint = process.env.S3_ENDPOINT;
    const region = process.env.S3_REGION || 'us-east-1';

    if (!process.env.S3_ACCESS_KEY_ID || !process.env.S3_SECRET_ACCESS_KEY) {
      throw new Error('S3 credentials not configured. Check environment variables.');
    }

    const s3Config: any = {
      region,
      credentials: {
        accessKeyId: process.env.S3_ACCESS_KEY_ID,
        secretAccessKey: process.env.S3_SECRET_ACCESS_KEY,
      },
    };

    // Adiciona endpoint apenas se estiver configurado (para MinIO, R2, etc)
    // AWS S3 não precisa de endpoint
    if (endpoint && endpoint.trim() !== '') {
      s3Config.endpoint = endpoint;
      s3Config.forcePathStyle = true; // Necessário para MinIO e alguns provedores
    }

    this.client = new S3Client(s3Config);

    this.bucket = process.env.S3_BUCKET || 'ciclo-azul-images';
    this.publicUrl = process.env.S3_PUBLIC_URL ||
      (endpoint || `https://${this.bucket}.s3.${region}.amazonaws.com`);
  }

  private generateKey(filename: string): string {
    const timestamp = Date.now();
    const random = crypto.randomBytes(8).toString('hex');
    const extension = path.extname(filename);
    const sanitizedName = path.basename(filename, extension)
      .replace(/[^a-zA-Z0-9-_]/g, '_')
      .substring(0, 50);

    return `images/${timestamp}-${random}-${sanitizedName}${extension}`;
  }

  async upload(filePath: string, options: UploadOptions): Promise<UploadResult> {
    const fileBuffer = await fs.readFile(filePath);
    return this.uploadBuffer(fileBuffer, options);
  }

  async uploadBuffer(buffer: Buffer, options: UploadOptions): Promise<UploadResult> {
    const key = this.generateKey(options.filename);

    const upload = new Upload({
      client: this.client,
      params: {
        Bucket: this.bucket,
        Key: key,
        Body: buffer,
        ContentType: options.mimeType,
        Metadata: options.metadata || {},
      },
    });

    await upload.done();

    const url = options.makePublic
      ? `${this.publicUrl}/${key}`
      : await this.getSignedUrl(key, 31536000); // 1 ano para URLs privadas

    return {
      url,
      key,
      size: buffer.length,
    };
  }

  async delete(key: string): Promise<void> {
    const command = new DeleteObjectCommand({
      Bucket: this.bucket,
      Key: key,
    });

    await this.client.send(command);
  }

  async getSignedUrl(key: string, expiresIn: number = 3600): Promise<string> {
    const command = new PutObjectCommand({
      Bucket: this.bucket,
      Key: key,
    });

    return getSignedUrl(this.client, command, { expiresIn });
  }

  async exists(key: string): Promise<boolean> {
    try {
      const command = new HeadObjectCommand({
        Bucket: this.bucket,
        Key: key,
      });

      await this.client.send(command);
      return true;
    } catch {
      return false;
    }
  }
}

/**
 * Local File System Storage Provider
 * Usado para desenvolvimento e fallback
 */
class LocalStorageProvider implements StorageProvider {
  private uploadDir: string;
  private baseUrl: string;

  constructor() {
    this.uploadDir = process.env.UPLOAD_DIR || './uploads';
    this.baseUrl = process.env.API_URL || `http://localhost:${process.env.PORT || 3000}`;
  }

  private generateKey(filename: string): string {
    const timestamp = Date.now();
    const random = crypto.randomBytes(8).toString('hex');
    const extension = path.extname(filename);
    const sanitizedName = path.basename(filename, extension)
      .replace(/[^a-zA-Z0-9-_]/g, '_')
      .substring(0, 50);

    return `images/${timestamp}-${random}-${sanitizedName}${extension}`;
  }

  async upload(filePath: string, options: UploadOptions): Promise<UploadResult> {
    const key = this.generateKey(options.filename);
    const destPath = path.join(this.uploadDir, key);

    await fs.mkdir(path.dirname(destPath), { recursive: true });
    await fs.copyFile(filePath, destPath);

    const stats = await fs.stat(destPath);

    return {
      url: `${this.baseUrl}/uploads/${key}`,
      key,
      size: stats.size,
    };
  }

  async uploadBuffer(buffer: Buffer, options: UploadOptions): Promise<UploadResult> {
    const key = this.generateKey(options.filename);
    const destPath = path.join(this.uploadDir, key);

    await fs.mkdir(path.dirname(destPath), { recursive: true });
    await fs.writeFile(destPath, buffer);

    return {
      url: `${this.baseUrl}/uploads/${key}`,
      key,
      size: buffer.length,
    };
  }

  async delete(key: string): Promise<void> {
    const filePath = path.join(this.uploadDir, key);

    try {
      await fs.unlink(filePath);
    } catch (error) {
      // Arquivo não existe, ignorar
    }
  }

  async getSignedUrl(key: string, _expiresIn?: number): Promise<string> {
    // Local storage não precisa de URLs assinadas
    return `${this.baseUrl}/uploads/${key}`;
  }

  async exists(key: string): Promise<boolean> {
    try {
      const filePath = path.join(this.uploadDir, key);
      await fs.access(filePath);
      return true;
    } catch {
      return false;
    }
  }
}

/**
 * Factory para criar o provider de storage configurado
 */
export const createStorageProvider = (): StorageProvider => {
  const provider = process.env.STORAGE_PROVIDER || 'local';

  switch (provider) {
    case 's3':
    case 'r2':
    case 'minio':
    case 'spaces':
    case 'b2':
      return new S3StorageProvider();

    case 'local':
    default:
      return new LocalStorageProvider();
  }
};

// Singleton instance
let storageInstance: StorageProvider | null = null;

export const getStorageProvider = (): StorageProvider => {
  if (!storageInstance) {
    storageInstance = createStorageProvider();
  }
  return storageInstance;
};

// Helpers para uso direto
export const uploadFile = (filePath: string, options: UploadOptions): Promise<UploadResult> => {
  return getStorageProvider().upload(filePath, options);
};

export const uploadBuffer = (buffer: Buffer, options: UploadOptions): Promise<UploadResult> => {
  return getStorageProvider().uploadBuffer(buffer, options);
};

export const deleteFile = (key: string): Promise<void> => {
  return getStorageProvider().delete(key);
};

export const getFileSignedUrl = (key: string, expiresIn?: number): Promise<string> => {
  return getStorageProvider().getSignedUrl(key, expiresIn);
};

export const fileExists = (key: string): Promise<boolean> => {
  return getStorageProvider().exists(key);
};
