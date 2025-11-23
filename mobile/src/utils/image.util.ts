import { apiConfig } from '../config/api.config';

export const getImageUrl = (imagePath: string | undefined | null): string => {
  if (!imagePath) {
    return '';
  }

  if (imagePath.startsWith('http://') || imagePath.startsWith('https://')) {
    return imagePath;
  }

  const baseUrl = apiConfig.baseURL.replace('/api', '');

  if (imagePath.startsWith('/uploads/')) {
    return `${baseUrl}${imagePath}`;
  }

  if (imagePath.startsWith('uploads/')) {
    return `${baseUrl}/${imagePath}`;
  }

  return `${baseUrl}/uploads/${imagePath}`;
};

export const getImageThumbnailUrl = (imagePath: string | undefined | null, size: 'small' | 'medium' | 'thumbnail' = 'medium'): string => {
  if (!imagePath) {
    return '';
  }

  const baseImagePath = imagePath.replace(/\.(jpg|jpeg|png)$/i, '');
  const extension = imagePath.match(/\.(jpg|jpeg|png)$/i)?.[0] || '.jpg';

  const thumbnailPath = `${baseImagePath}-${size}${extension}`;

  return getImageUrl(thumbnailPath);
};
