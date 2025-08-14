import { getImageUrl, getOptimizedImageUrl, getThumbnailUrl, getMediumImageUrl, isValidImageUrl, getPlaceholderImageUrl } from '../image';

// Mock environment variable
const originalEnv = import.meta.env;
beforeAll(() => {
  // @ts-ignore
  import.meta.env = { ...originalEnv, VITE_IMAGE_BASE_URL: 'http://localhost:5001/uploads' };
});

afterAll(() => {
  // @ts-ignore
  import.meta.env = originalEnv;
});

describe('Image Utils', () => {
  describe('getImageUrl', () => {
    it('should convert relative path to full URL', () => {
      const result = getImageUrl('projects/uuid/image.webp');
      expect(result).toBe('http://localhost:5001/uploads/projects/uuid/image.webp');
    });

    it('should handle paths with leading slash', () => {
      const result = getImageUrl('/projects/uuid/image.webp');
      expect(result).toBe('http://localhost:5001/uploads/projects/uuid/image.webp');
    });

    it('should return absolute URLs unchanged', () => {
      const absoluteUrl = 'https://example.com/image.jpg';
      const result = getImageUrl(absoluteUrl);
      expect(result).toBe(absoluteUrl);
    });

    it('should handle empty paths', () => {
      const result = getImageUrl('');
      expect(result).toBe('');
    });
  });

  describe('getOptimizedImageUrl', () => {
    const mockImage = {
      file_path: 'projects/uuid/image.webp',
      thumbnails: {
        thumbnail: { path: 'projects/uuid/image-THUMBNAIL.webp' },
        medium: { path: 'projects/uuid/image-MEDIUM.webp' },
        large: { path: 'projects/uuid/image-LARGE.webp' },
        optimized: { path: 'projects/uuid/image-optimized.webp' }
      }
    };

    it('should return optimized image URL by default', () => {
      const result = getOptimizedImageUrl(mockImage);
      expect(result).toBe('http://localhost:5001/uploads/projects/uuid/image-optimized.webp');
    });

    it('should return specific size when requested', () => {
      const result = getOptimizedImageUrl(mockImage, 'medium');
      expect(result).toBe('http://localhost:5001/uploads/projects/uuid/image-MEDIUM.webp');
    });

    it('should fallback to file_path when thumbnails not available', () => {
      const imageWithoutThumbnails = { file_path: 'projects/uuid/image.webp' };
      const result = getOptimizedImageUrl(imageWithoutThumbnails);
      expect(result).toBe('http://localhost:5001/uploads/projects/uuid/image.webp');
    });
  });

  describe('getThumbnailUrl', () => {
    it('should return thumbnail URL', () => {
      const mockImage = {
        file_path: 'projects/uuid/image.webp',
        thumbnails: {
          thumbnail: { path: 'projects/uuid/image-THUMBNAIL.webp' }
        }
      };
      const result = getThumbnailUrl(mockImage);
      expect(result).toBe('http://localhost:5001/uploads/projects/uuid/image-THUMBNAIL.webp');
    });
  });

  describe('getMediumImageUrl', () => {
    it('should return medium size URL', () => {
      const mockImage = {
        file_path: 'projects/uuid/image.webp',
        thumbnails: {
          medium: { path: 'projects/uuid/image-MEDIUM.webp' }
        }
      };
      const result = getMediumImageUrl(mockImage);
      expect(result).toBe('http://localhost:5001/uploads/projects/uuid/image-MEDIUM.webp');
    });
  });

  describe('isValidImageUrl', () => {
    it('should return true for valid URLs', () => {
      expect(isValidImageUrl('http://example.com/image.jpg')).toBe(true);
      expect(isValidImageUrl('/path/to/image.png')).toBe(true);
    });

    it('should return false for invalid URLs', () => {
      expect(isValidImageUrl('')).toBe(false);
      expect(isValidImageUrl('   ')).toBe(false);
    });
  });

  describe('getPlaceholderImageUrl', () => {
    it('should return placeholder URL', () => {
      const result = getPlaceholderImageUrl();
      expect(result).toBe('/images/placeholder.jpg');
    });
  });
});