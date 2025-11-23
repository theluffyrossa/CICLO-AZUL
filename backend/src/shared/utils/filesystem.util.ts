import { stat, readdir, unlink } from 'fs/promises';
import { createHash } from 'crypto';
import { createReadStream } from 'fs';
import { resolve, basename } from 'path';
import { logger } from '../../config/logger.config';

export const getFileSize = async (filePath: string): Promise<number> => {
  try {
    const stats = await stat(filePath);
    return stats.size;
  } catch (error) {
    logger.error('[FileSystem] Failed to get file size:', error);
    throw new Error(`Failed to get file size: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
};

export const getFileChecksum = async (filePath: string): Promise<string> => {
  return new Promise((resolvePromise, reject) => {
    const hash = createHash('md5');
    const stream = createReadStream(filePath);

    stream.on('data', (chunk) => hash.update(chunk));
    stream.on('end', () => resolvePromise(hash.digest('hex')));
    stream.on('error', (error) => {
      logger.error('[FileSystem] Failed to calculate checksum:', error);
      reject(new Error(`Failed to calculate checksum: ${error.message}`));
    });
  });
};

export const formatBytes = (bytes: number): string => {
  if (bytes === 0) return '0 Bytes';

  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));

  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(2))} ${sizes[i]}`;
};

export const listFilesInDirectory = async (dirPath: string): Promise<string[]> => {
  try {
    const files = await readdir(dirPath);
    return files.map(file => resolve(dirPath, file));
  } catch (error) {
    logger.error('[FileSystem] Failed to list files:', error);
    throw new Error(`Failed to list files: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
};

export const deleteFile = async (filePath: string): Promise<void> => {
  try {
    await unlink(filePath);
    logger.info(`[FileSystem] File deleted: ${basename(filePath)}`);
  } catch (error) {
    logger.error('[FileSystem] Failed to delete file:', error);
    throw new Error(`Failed to delete file: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
};

export const sanitizeFilename = (filename: string): string => {
  return basename(filename).replace(/[^a-zA-Z0-9.-]/g, '_');
};

export const isPathSafe = (basePath: string, requestedPath: string): boolean => {
  const resolvedBase = resolve(basePath);
  const resolvedPath = resolve(basePath, requestedPath);
  return resolvedPath.startsWith(resolvedBase);
};
