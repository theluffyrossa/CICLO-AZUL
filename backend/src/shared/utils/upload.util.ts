import multer, { FileFilterCallback } from 'multer';
import path from 'path';
import fs from 'fs';
import { Request } from 'express';
import { appConfig } from '@config/app.config';
import { FILE_UPLOAD } from '../constants';

const ensureUploadDirExists = (): void => {
  if (!fs.existsSync(appConfig.uploadDir)) {
    fs.mkdirSync(appConfig.uploadDir, { recursive: true });
  }
  if (!fs.existsSync(appConfig.uploadTempDir)) {
    fs.mkdirSync(appConfig.uploadTempDir, { recursive: true });
  }
};

const generateFilename = (originalname: string): string => {
  const timestamp = Date.now();
  const randomString = Math.random().toString(36).substring(7);
  const extension = path.extname(originalname);
  return `${timestamp}-${randomString}${extension}`;
};

const storage = multer.diskStorage({
  destination: (_req: Request, _file: Express.Multer.File, cb) => {
    ensureUploadDirExists();
    cb(null, appConfig.uploadTempDir);
  },
  filename: (_req: Request, file: Express.Multer.File, cb) => {
    const filename = generateFilename(file.originalname);
    cb(null, filename);
  },
});

const fileFilter = (
  _req: Request,
  file: Express.Multer.File,
  cb: FileFilterCallback
): void => {
  if ((FILE_UPLOAD.ALLOWED_IMAGE_TYPES as readonly string[]).includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Invalid file type. Only JPEG and PNG images are allowed.'));
  }
};

export const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: FILE_UPLOAD.MAX_SIZE,
  },
});
