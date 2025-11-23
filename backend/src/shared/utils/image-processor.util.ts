import sharp from 'sharp';
import fs from 'fs/promises';
import path from 'path';

interface ImageDimensions {
  width: number;
  height: number;
}

interface ProcessedImage {
  buffer: any; // Buffer type from Sharp conflicts with Node's Buffer type
  width: number;
  height: number;
  size: number;
  format: string;
}

interface ThumbnailSizes {
  thumbnail: number;
  small: number;
  medium: number;
}

interface ProcessedImages {
  original: ProcessedImage;
  medium?: ProcessedImage;
  small?: ProcessedImage;
  thumbnail?: ProcessedImage;
}

interface WatermarkOptions {
  text: string;
  timestamp?: Date;
  latitude?: number;
  longitude?: number;
}

const DEFAULT_THUMBNAIL_SIZES: ThumbnailSizes = {
  thumbnail: parseInt(process.env.THUMBNAIL_SIZE_SMALL || '200', 10),
  small: parseInt(process.env.THUMBNAIL_SIZE_MEDIUM || '400', 10),
  medium: parseInt(process.env.THUMBNAIL_SIZE_LARGE || '800', 10),
};

const IMAGE_QUALITY = parseInt(process.env.IMAGE_QUALITY || '80', 10);
const MAX_WIDTH = parseInt(process.env.IMAGE_MAX_WIDTH || '1920', 10);
const MAX_HEIGHT = parseInt(process.env.IMAGE_MAX_HEIGHT || '1080', 10);
const MIN_WIDTH = parseInt(process.env.MIN_IMAGE_WIDTH || '640', 10);
const MIN_HEIGHT = parseInt(process.env.MIN_IMAGE_HEIGHT || '480', 10);

/**
 * Valida as dimensões mínimas da imagem
 */
export const validateImageDimensions = async (filePath: string): Promise<ImageDimensions> => {
  const metadata = await sharp(filePath).metadata();

  if (!metadata.width || !metadata.height) {
    throw new Error('Não foi possível determinar as dimensões da imagem');
  }

  if (metadata.width < MIN_WIDTH || metadata.height < MIN_HEIGHT) {
    throw new Error(
      `Imagem muito pequena. Mínimo: ${MIN_WIDTH}x${MIN_HEIGHT}px, Atual: ${metadata.width}x${metadata.height}px`
    );
  }

  return {
    width: metadata.width,
    height: metadata.height,
  };
};

/**
 * Cria watermark com informações da evidência
 */
const createWatermark = async (options: WatermarkOptions): Promise<Buffer> => {
  const { text, timestamp, latitude, longitude } = options;

  const lines: string[] = [text];

  if (timestamp) {
    const dateStr = timestamp.toLocaleString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
    });
    lines.push(dateStr);
  }

  if (latitude !== undefined && longitude !== undefined) {
    const latStr = latitude.toFixed(6);
    const lonStr = longitude.toFixed(6);
    lines.push(`GPS: ${latStr}, ${lonStr}`);
  }

  // const watermarkText = lines.join('\n'); // Texto completo se necessário no futuro
  const fontSize = 16;
  const padding = 10;
  const lineHeight = fontSize + 4;
  const textHeight = lines.length * lineHeight + padding * 2;
  const textWidth = 400;

  // Cria SVG com fundo semi-transparente
  const svg = `
    <svg width="${textWidth}" height="${textHeight}">
      <rect width="100%" height="100%" fill="black" opacity="0.6" rx="5"/>
      ${lines
        .map(
          (line, index) => `
        <text
          x="${padding}"
          y="${padding + fontSize + index * lineHeight}"
          font-family="Arial, sans-serif"
          font-size="${fontSize}"
          font-weight="bold"
          fill="white"
        >${line}</text>
      `
        )
        .join('')}
    </svg>
  `;

  return Buffer.from(svg);
};

/**
 * Adiciona watermark à imagem
 */
export const addWatermark = async (
  imageBuffer: any,
  options: WatermarkOptions
): Promise<any> => {
  const watermarkBuffer = await createWatermark(options);

  const image = sharp(imageBuffer);
  const metadata = await image.metadata();

  if (!metadata.width || !metadata.height) {
    throw new Error('Metadados da imagem inválidos');
  }

  // Posiciona watermark no canto inferior direito
  const watermarkWidth = 400;
  const watermarkHeight = options.latitude !== undefined ? 80 : 60;
  const marginRight = 20;
  const marginBottom = 20;

  return image
    .composite([
      {
        input: watermarkBuffer,
        top: metadata.height - watermarkHeight - marginBottom,
        left: metadata.width - watermarkWidth - marginRight,
      },
    ])
    .toBuffer();
};

/**
 * Processa imagem individual com redimensionamento
 */
const processImage = async (
  buffer: Buffer,
  maxWidth: number,
  maxHeight?: number
): Promise<ProcessedImage> => {
  const image = sharp(buffer);
  // const _metadata = await image.metadata(); // Metadados para verificação futura se necessário

  let processedImage = image;

  // Redimensiona mantendo aspect ratio
  if (maxHeight) {
    processedImage = processedImage.resize(maxWidth, maxHeight, {
      fit: 'inside',
      withoutEnlargement: true,
    });
  } else {
    // Redimensiona apenas pela largura
    processedImage = processedImage.resize(maxWidth, null, {
      fit: 'inside',
      withoutEnlargement: true,
    });
  }

  // Converte para JPEG com qualidade configurada
  processedImage = processedImage.jpeg({ quality: IMAGE_QUALITY, progressive: true });

  const outputBuffer = await processedImage.toBuffer();
  const outputMetadata = await sharp(outputBuffer).metadata();

  return {
    buffer: outputBuffer,
    width: outputMetadata.width || 0,
    height: outputMetadata.height || 0,
    size: outputBuffer.length,
    format: 'jpeg',
  };
};

/**
 * Processa imagem principal e gera thumbnails
 */
export const processImageWithThumbnails = async (
  filePath: string,
  watermarkOptions?: WatermarkOptions
): Promise<ProcessedImages> => {
  // Valida dimensões
  await validateImageDimensions(filePath);

  // Lê arquivo original
  const rawBuffer = await fs.readFile(filePath);

  // Adiciona watermark se configurado
  let processedBuffer: any = rawBuffer as any;
  if (watermarkOptions && process.env.ENABLE_WATERMARK === 'true') {
    processedBuffer = (await addWatermark(rawBuffer as any, watermarkOptions)) as any;
  }

  // Processa imagem original (max resolution)
  const original = await processImage(processedBuffer, MAX_WIDTH, MAX_HEIGHT);

  const result: ProcessedImages = { original };

  // Gera thumbnails se habilitado
  if (process.env.ENABLE_THUMBNAILS === 'true') {
    result.medium = await processImage(original.buffer, DEFAULT_THUMBNAIL_SIZES.medium);
    result.small = await processImage(original.buffer, DEFAULT_THUMBNAIL_SIZES.small);
    result.thumbnail = await processImage(original.buffer, DEFAULT_THUMBNAIL_SIZES.thumbnail);
  }

  return result;
};

/**
 * Extrai metadados EXIF da imagem
 */
export const extractImageMetadata = async (
  filePath: string
): Promise<{
  width: number;
  height: number;
  format: string;
  hasAlpha: boolean;
  orientation?: number;
  exif?: Record<string, unknown>;
}> => {
  const image = sharp(filePath);
  const metadata = await image.metadata();

  return {
    width: metadata.width || 0,
    height: metadata.height || 0,
    format: metadata.format || 'unknown',
    hasAlpha: metadata.hasAlpha || false,
    orientation: metadata.orientation,
    exif: metadata.exif as Record<string, unknown> | undefined,
  };
};

/**
 * Converte buffer para base64 (útil para preview)
 */
export const bufferToBase64 = (buffer: Buffer, mimeType: string = 'image/jpeg'): string => {
  return `data:${mimeType};base64,${buffer.toString('base64')}`;
};

/**
 * Salva buffer em arquivo temporário
 */
export const saveTempFile = async (buffer: Buffer, filename: string): Promise<string> => {
  const tempDir = process.env.UPLOAD_TEMP_DIR || './uploads/temp';
  await fs.mkdir(tempDir, { recursive: true });

  const tempPath = path.join(tempDir, filename);
  await fs.writeFile(tempPath, buffer);

  return tempPath;
};

/**
 * Remove arquivo temporário
 */
export const removeTempFile = async (filePath: string): Promise<void> => {
  try {
    await fs.unlink(filePath);
  } catch (error) {
    // Ignora erro se arquivo não existe
  }
};
