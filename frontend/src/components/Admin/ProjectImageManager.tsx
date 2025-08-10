import React, { useState, useCallback, useEffect } from 'react';
import { 
  PhotoIcon, 
  CloudArrowUpIcon, 
  TrashIcon,
  ArrowsUpDownIcon,
  XMarkIcon,
  CheckCircleIcon,
  ExclamationCircleIcon
} from '@heroicons/react/24/outline';
import { StarIcon } from '@heroicons/react/24/solid';
import projectService from '@/services/project.service';
import { ProjectImage } from '@/types';
import toast from 'react-hot-toast';
import clsx from 'clsx';

interface ProjectImageManagerProps {
  projectUuid?: string;
  images: ProjectImage[];
  onImagesChange: (images: ProjectImage[]) => void;
  imageType?: 'main' | 'gallery' | 'floor_plan' | 'location' | 'vr';
  maxFiles?: number;
}

const ProjectImageManager: React.FC<ProjectImageManagerProps> = ({
  projectUuid,
  images = [],
  onImagesChange,
  imageType = 'gallery',
  maxFiles = 10
}) => {
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [selectedImages, setSelectedImages] = useState<number[]>([]);
  const [draggedImage, setDraggedImage] = useState<number | null>(null);
  const [previewImages, setPreviewImages] = useState<Array<{ file: File; preview: string }>>([]);

  // Clean up preview URLs on unmount
  useEffect(() => {
    return () => {
      previewImages.forEach(img => URL.revokeObjectURL(img.preview));
    };
  }, [previewImages]);

  const handleFileSelect = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    
    if (files.length + images.length > maxFiles) {
      toast.error(`最多只能上傳 ${maxFiles} 張圖片`);
      return;
    }

    // Create preview URLs
    const newPreviews = files.map(file => ({
      file,
      preview: URL.createObjectURL(file)
    }));

    setPreviewImages(prev => [...prev, ...newPreviews]);
  }, [images.length, maxFiles]);

  const removePreview = useCallback((index: number) => {
    setPreviewImages(prev => {
      const newPreviews = [...prev];
      URL.revokeObjectURL(newPreviews[index].preview);
      newPreviews.splice(index, 1);
      return newPreviews;
    });
  }, []);

  const handleUpload = useCallback(async () => {
    if (!projectUuid || previewImages.length === 0) return;

    setUploading(true);
    setUploadProgress(0);

    try {
      const files = previewImages.map(p => p.file);
      const response = await projectService.uploadImages(
        projectUuid,
        files,
        imageType,
        undefined,
        (progress) => setUploadProgress(progress)
      );

      if (response.success && response.data) {
        const uploadedCount = response.data.uploaded?.length || 0;
        const failedCount = response.data.failed?.length || 0;
        
        if (uploadedCount > 0) {
          toast.success(`成功上傳 ${uploadedCount} 張圖片`);
        }
        
        // Clean up previews
        previewImages.forEach(img => URL.revokeObjectURL(img.preview));
        setPreviewImages([]);
        
        // Fetch updated images list
        const imagesResponse = await projectService.getProject(projectUuid);
        if (imagesResponse.success && imagesResponse.data?.images) {
          onImagesChange(imagesResponse.data.images);
        }
        
        if (failedCount > 0) {
          toast.error(`${failedCount} 張圖片上傳失敗`);
        }
      }
    } catch (error) {
      toast.error('圖片上傳失敗');
      console.error('Upload error:', error);
    } finally {
      setUploading(false);
      setUploadProgress(0);
    }
  }, [projectUuid, previewImages, imageType, images, onImagesChange]);

  const handleDelete = useCallback(async (imageId: number) => {
    if (!projectUuid) return;

    try {
      await projectService.deleteImage(projectUuid, imageId);
      toast.success('圖片已刪除');
      onImagesChange(images.filter(img => img.id !== imageId));
      setSelectedImages(prev => prev.filter(id => id !== imageId));
    } catch (error) {
      toast.error('刪除圖片失敗');
    }
  }, [projectUuid, images, onImagesChange]);

  const handleSetMain = useCallback(async (imageId: number) => {
    if (!projectUuid) return;

    try {
      await projectService.setMainImage(projectUuid, imageId);
      toast.success('已設為主圖');
      
      // Update local state to reflect the change
      const updatedImages = images.map(img => ({
        ...img,
        image_type: img.id === imageId ? 'main' : (img.image_type === 'main' ? 'gallery' : img.image_type)
      })) as ProjectImage[];
      
      onImagesChange(updatedImages);
    } catch (error) {
      toast.error('設定主圖失敗');
    }
  }, [projectUuid, images, onImagesChange]);

  const handleDragStart = (e: React.DragEvent, imageId: number) => {
    setDraggedImage(imageId);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  };

  const handleDrop = async (e: React.DragEvent, targetId: number) => {
    e.preventDefault();
    
    if (!draggedImage || draggedImage === targetId || !projectUuid) return;

    const draggedIndex = images.findIndex(img => img.id === draggedImage);
    const targetIndex = images.findIndex(img => img.id === targetId);

    if (draggedIndex === -1 || targetIndex === -1) return;

    // Create new order
    const newImages = [...images];
    const [removed] = newImages.splice(draggedIndex, 1);
    newImages.splice(targetIndex, 0, removed);

    // Update display orders
    const orders = newImages.map((img, index) => ({
      id: img.id,
      display_order: index
    }));

    try {
      await projectService.reorderImages(projectUuid, orders);
      onImagesChange(newImages.map((img, index) => ({ ...img, display_order: index })));
      toast.success('圖片順序已更新');
    } catch (error) {
      toast.error('更新順序失敗');
    }

    setDraggedImage(null);
  };

  const toggleImageSelection = (imageId: number) => {
    setSelectedImages(prev => 
      prev.includes(imageId) 
        ? prev.filter(id => id !== imageId)
        : [...prev, imageId]
    );
  };

  const handleBulkDelete = async () => {
    if (selectedImages.length === 0 || !projectUuid) return;

    if (!confirm(`確定要刪除 ${selectedImages.length} 張圖片嗎？`)) return;

    try {
      // Delete images one by one (could be optimized with bulk endpoint)
      await Promise.all(selectedImages.map(id => projectService.deleteImage(projectUuid, id)));
      
      toast.success(`已刪除 ${selectedImages.length} 張圖片`);
      onImagesChange(images.filter(img => !selectedImages.includes(img.id)));
      setSelectedImages([]);
    } catch (error) {
      toast.error('刪除圖片失敗');
    }
  };

  const mainImage = images.find(img => img.image_type === 'main');
  const galleryImages = images.filter(img => img.image_type !== 'main');

  return (
    <div className="space-y-4">
      {/* Upload Section */}
      <div className="border-2 border-dashed border-gray-300 rounded-lg p-4">
        <div className="text-center">
          <CloudArrowUpIcon className="mx-auto h-10 w-10 text-gray-400" />
          <div className="mt-3">
            <label htmlFor="file-upload" className="cursor-pointer">
              <span className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-primary-600 hover:bg-primary-700">
                選擇圖片
              </span>
              <input
                id="file-upload"
                type="file"
                className="sr-only"
                multiple
                accept="image/*"
                onChange={handleFileSelect}
                disabled={uploading}
              />
            </label>
            <p className="mt-1 text-xs text-gray-500">
              支援 JPG、PNG、GIF、WebP 格式，最多 {maxFiles} 張
            </p>
          </div>
        </div>

        {/* Preview Section */}
        {previewImages.length > 0 && (
          <div className="mt-4">
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
              {previewImages.map((preview, index) => (
                <div key={index} className="relative group">
                  <img
                    src={preview.preview}
                    alt={`Preview ${index + 1}`}
                    className="h-20 w-full object-cover rounded-lg"
                  />
                  <button
                    type="button"
                    onClick={() => removePreview(index)}
                    className="absolute top-1 right-1 p-1 bg-red-600 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <XMarkIcon className="h-4 w-4" />
                  </button>
                </div>
              ))}
            </div>
            
            <div className="mt-4 flex items-center justify-between">
              <span className="text-sm text-gray-500">
                已選擇 {previewImages.length} 張圖片
              </span>
              <button
                type="button"
                onClick={handleUpload}
                disabled={uploading || !projectUuid}
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-primary-600 hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {uploading ? '上傳中...' : '開始上傳'}
              </button>
            </div>

            {uploading && (
              <div className="mt-2">
                <div className="bg-gray-200 rounded-full overflow-hidden">
                  <div 
                    className="bg-primary-600 h-2 transition-all duration-300"
                    style={{ width: `${uploadProgress}%` }}
                  />
                </div>
                <p className="mt-1 text-sm text-gray-500 text-center">{uploadProgress}%</p>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Actions Bar */}
      {images.length > 0 && (
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            {selectedImages.length > 0 && (
              <>
                <span className="text-sm text-gray-500">
                  已選擇 {selectedImages.length} 張
                </span>
                <button
                  type="button"
                  onClick={handleBulkDelete}
                  className="inline-flex items-center px-3 py-1 border border-transparent text-sm font-medium rounded-md text-white bg-red-600 hover:bg-red-700"
                >
                  <TrashIcon className="h-4 w-4 mr-1" />
                  刪除選中
                </button>
              </>
            )}
          </div>
          <p className="text-sm text-gray-500">
            共 {images.length} 張圖片
          </p>
        </div>
      )}

      {/* Main Image */}
      {mainImage && (
        <div className="mb-6">
          <h4 className="text-sm font-medium text-gray-700 mb-2">主圖</h4>
          <div className="relative group">
            <img
              src={mainImage.file_path}
              alt={mainImage.alt_text || '主圖'}
              className="h-48 w-full object-cover rounded-lg"
            />
            <div className="absolute top-2 left-2">
              <span className="inline-flex items-center px-2 py-1 text-xs font-medium rounded-md bg-yellow-100 text-yellow-800">
                <StarIcon className="h-3 w-3 mr-1" />
                主圖
              </span>
            </div>
          </div>
        </div>
      )}

      {/* Gallery Images */}
      {galleryImages.length > 0 && (
        <div>
          <h4 className="text-sm font-medium text-gray-700 mb-2">相簿圖片</h4>
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
            {galleryImages.map((image) => (
              <div
                key={image.id}
                className={clsx(
                  'relative group',
                  selectedImages.includes(image.id) && 'ring-2 ring-primary-500 rounded-lg'
                )}
                draggable
                onDragStart={(e) => handleDragStart(e, image.id)}
                onDragOver={handleDragOver}
                onDrop={(e) => handleDrop(e, image.id)}
              >
                <img
                  src={image.file_path}
                  alt={image.alt_text || `圖片 ${image.id}`}
                  className="h-32 w-full object-cover rounded-lg cursor-move"
                  onClick={() => toggleImageSelection(image.id)}
                />
                
                {/* Selection Indicator */}
                {selectedImages.includes(image.id) && (
                  <div className="absolute top-2 left-2">
                    <CheckCircleIcon className="h-6 w-6 text-primary-500 bg-white rounded-full" />
                  </div>
                )}

                {/* Actions */}
                <div className="absolute inset-0 bg-black bg-opacity-50 opacity-0 group-hover:opacity-100 transition-opacity rounded-lg flex items-center justify-center space-x-2">
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleSetMain(image.id);
                    }}
                    className="p-2 bg-white rounded-full text-gray-700 hover:bg-gray-100"
                    title="設為主圖"
                  >
                    <StarIcon className="h-4 w-4" />
                  </button>
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDelete(image.id);
                    }}
                    className="p-2 bg-white rounded-full text-red-600 hover:bg-red-50"
                    title="刪除"
                  >
                    <TrashIcon className="h-4 w-4" />
                  </button>
                </div>

                {/* Drag Indicator */}
                <div className="absolute bottom-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                  <ArrowsUpDownIcon className="h-4 w-4 text-white" />
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Empty State */}
      {images.length === 0 && previewImages.length === 0 && (
        <div className="text-center py-4">
          <PhotoIcon className="mx-auto h-10 w-10 text-gray-400" />
          <p className="mt-2 text-sm text-gray-500">尚未上傳任何圖片</p>
        </div>
      )}
    </div>
  );
};

export default ProjectImageManager;