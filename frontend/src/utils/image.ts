/**
 * Image utility functions for handling image URLs and paths
 */

const IMAGE_BASE_URL = import.meta.env.VITE_IMAGE_BASE_URL || 'http://localhost:5001/uploads';

/**
 * Convert relative image path to full URL
 * @param relativePath - Relative path from database (e.g., "projects/uuid/filename.webp")
 * @returns Full image URL
 */
export const getImageUrl = (relativePath: string): string => {
  if (!relativePath) {
    return '';
  }
  
  // If path is already absolute, return as-is
  if (relativePath.startsWith('http')) {
    return relativePath;
  }
  
  // If path starts with /images/, it's a local static file in public folder
  if (relativePath.startsWith('/images/')) {
    return relativePath;
  }
  
  // Remove leading slash if present
  const cleanPath = relativePath.startsWith('/') ? relativePath.slice(1) : relativePath;
  
  return `${IMAGE_BASE_URL}/${cleanPath}`;
};

/**
 * Get optimized image URL from ProjectImage thumbnails
 * @param image - ProjectImage object
 * @param size - Preferred size (thumbnail, small, medium, large, optimized)
 * @returns Full image URL for the requested size, fallback to original if size not available
 */
export const getOptimizedImageUrl = (
  image: { file_path: string; thumbnails?: any }, 
  size: 'thumbnail' | 'small' | 'medium' | 'large' | 'optimized' = 'optimized'
): string => {
  // Try to get the requested size from thumbnails
  if (image.thumbnails && image.thumbnails[size]?.path) {
    return getImageUrl(image.thumbnails[size].path);
  }
  
  // Fallback to original file_path
  return getImageUrl(image.file_path);
};

/**
 * Get thumbnail URL for image preview
 * @param image - ProjectImage object
 * @returns Thumbnail URL
 */
export const getThumbnailUrl = (image: { file_path: string; thumbnails?: any }): string => {
  return getOptimizedImageUrl(image, 'thumbnail');
};

/**
 * Get medium size image URL for gallery display
 * @param image - ProjectImage object  
 * @returns Medium size image URL
 */
export const getMediumImageUrl = (image: { file_path: string; thumbnails?: any }): string => {
  return getOptimizedImageUrl(image, 'medium');
};

/**
 * Check if image URL is valid (not empty)
 * @param url - Image URL to check
 * @returns Whether URL is valid
 */
export const isValidImageUrl = (url: string): boolean => {
  return Boolean(url && url.trim().length > 0);
};

/**
 * Get placeholder image URL for when no image is available
 * @returns Placeholder image URL
 */
export const getPlaceholderImageUrl = (): string => {
  return '/images/placeholder.jpg'; // Assumes placeholder image in public folder
};