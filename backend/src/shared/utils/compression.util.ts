import { createGzip, createGunzip } from 'zlib';
import { createReadStream, createWriteStream } from 'fs';
import { pipeline } from 'stream/promises';
import { logger } from '../../config/logger.config';

export const compressFile = async (
  inputPath: string,
  outputPath: string
): Promise<void> => {
  try {
    const gzip = createGzip();
    const source = createReadStream(inputPath);
    const destination = createWriteStream(outputPath);

    await pipeline(source, gzip, destination);

    logger.info(`[Compression] File compressed: ${inputPath} -> ${outputPath}`);
  } catch (error) {
    logger.error('[Compression] Compression failed:', error);
    throw new Error(`Failed to compress file: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
};

export const decompressFile = async (
  inputPath: string,
  outputPath: string
): Promise<void> => {
  try {
    const gunzip = createGunzip();
    const source = createReadStream(inputPath);
    const destination = createWriteStream(outputPath);

    await pipeline(source, gunzip, destination);

    logger.info(`[Compression] File decompressed: ${inputPath} -> ${outputPath}`);
  } catch (error) {
    logger.error('[Compression] Decompression failed:', error);
    throw new Error(`Failed to decompress file: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
};
