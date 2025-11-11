import sharp from 'sharp';
import path from 'path';
import fs from 'fs/promises';
import { appConfig } from '@config/app.config';
import { FILE_UPLOAD } from '../constants';

interface ImageMetadata {
  width: number;
  height: number;
  format: string;
  size: number;
}

interface ProcessedImage {
  path: string;
  metadata: ImageMetadata;
}

export const processImage = async (
  tempPath: string,
  filename: string
): Promise<ProcessedImage> => {
  const outputPath = path.join(appConfig.uploadDir, filename);

  const image = sharp(tempPath);
  const metadata = await image.metadata();

  await image
    .resize(FILE_UPLOAD.IMAGE_MAX_WIDTH, FILE_UPLOAD.IMAGE_MAX_HEIGHT, {
      fit: 'inside',
      withoutEnlargement: true,
    })
    .jpeg({ quality: FILE_UPLOAD.IMAGE_QUALITY })
    .toFile(outputPath);

  await fs.unlink(tempPath);

  const stats = await fs.stat(outputPath);

  return {
    path: outputPath,
    metadata: {
      width: metadata.width || 0,
      height: metadata.height || 0,
      format: metadata.format || 'jpeg',
      size: stats.size,
    },
  };
};

export const deleteImage = async (filePath: string): Promise<void> => {
  try {
    await fs.unlink(filePath);
  } catch (error) {
    // File might not exist, ignore error
  }
};
