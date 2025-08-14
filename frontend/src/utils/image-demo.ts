// Demo file to test image utility functions
import { getImageUrl, getMediumImageUrl, getThumbnailUrl } from './image';

// Test data
const mockImage = {
  file_path: 'projects/uuid/image.webp',
  thumbnails: {
    thumbnail: { path: 'projects/uuid/image-THUMBNAIL.webp' },
    medium: { path: 'projects/uuid/image-MEDIUM.webp' },
    large: { path: 'projects/uuid/image-LARGE.webp' },
    optimized: { path: 'projects/uuid/image-optimized.webp' }
  }
};

console.log('Testing image utility functions:');
console.log('Base path:', getImageUrl('projects/uuid/image.webp'));
console.log('Medium image:', getMediumImageUrl(mockImage));
console.log('Thumbnail:', getThumbnailUrl(mockImage));

export default {};