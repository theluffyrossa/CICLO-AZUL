import axios from 'axios';
import { logger } from '@config/logger.config';

interface ImageDownloadResult {
  buffer: Buffer | null;
  error: string | null;
}

export const downloadImageAsBuffer = async (imageUrl: string): Promise<ImageDownloadResult> => {
  try {
    if (!imageUrl) {
      return { buffer: null, error: 'URL vazia' };
    }

    const response = await axios.get(imageUrl, {
      responseType: 'arraybuffer',
      timeout: 10000,
      maxContentLength: 10 * 1024 * 1024,
      validateStatus: (status) => status === 200,
    });

    const buffer = Buffer.from(response.data);

    if (buffer.length === 0) {
      return { buffer: null, error: 'Imagem vazia' };
    }

    return { buffer, error: null };
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Erro desconhecido';
    logger.error(`Erro ao baixar imagem ${imageUrl}: ${errorMessage}`);
    return { buffer: null, error: errorMessage };
  }
};

export const downloadImagesAsBuffers = async (
  imageUrls: string[]
): Promise<Map<string, Buffer>> => {
  const imageBuffers = new Map<string, Buffer>();

  const downloadPromises = imageUrls.map(async (url) => {
    const { buffer, error } = await downloadImageAsBuffer(url);
    if (buffer && !error) {
      imageBuffers.set(url, buffer);
    }
  });

  await Promise.allSettled(downloadPromises);

  return imageBuffers;
};
