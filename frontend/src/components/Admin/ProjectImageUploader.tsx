import React, { useState, useCallback, useEffect } from 'react';
import { 
  PhotoIcon, 
  CloudArrowUpIcon, 
  TrashIcon,
  XMarkIcon,
  CheckCircleIcon,
  StarIcon as StarIconOutline
} from '@heroicons/react/24/outline';
import { StarIcon as StarIconSolid } from '@heroicons/react/24/solid';
import clsx from 'clsx';

export interface LocalImage {
  id: string;
  file: File;
  preview: string;
  isMain?: boolean;
}

interface ProjectImageUploaderProps {
  value: LocalImage[];
  onChange: (images: LocalImage[]) => void;
  maxFiles?: number;
}

const ProjectImageUploader: React.FC<ProjectImageUploaderProps> = ({
  value = [],
  onChange,
  maxFiles = 20
}) => {
  const [dragActive, setDragActive] = useState(false);

  // Clean up preview URLs when component unmounts
  useEffect(() => {
    return () => {
      value.forEach(img => URL.revokeObjectURL(img.preview));
    };
  }, []);

  const handleFileSelect = useCallback((files: FileList | File[]) => {
    const fileArray = Array.from(files);
    
    if (value.length + fileArray.length > maxFiles) {
      alert(`最多只能上傳 ${maxFiles} 張圖片`);
      return;
    }

    // Create preview URLs and local image objects
    const newImages: LocalImage[] = fileArray.map((file, index) => ({
      id: `local-${Date.now()}-${index}`,
      file,
      preview: URL.createObjectURL(file),
      isMain: value.length === 0 && index === 0 // 第一張圖片自動設為主圖
    }));

    onChange([...value, ...newImages]);
  }, [value, onChange, maxFiles]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      handleFileSelect(e.target.files);
    }
  };

  const handleDrag = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileSelect(e.dataTransfer.files);
    }
  }, [handleFileSelect]);

  const removeImage = useCallback((id: string) => {
    const imageToRemove = value.find(img => img.id === id);
    if (imageToRemove) {
      URL.revokeObjectURL(imageToRemove.preview);
      const newImages = value.filter(img => img.id !== id);
      
      // 如果刪除的是主圖，將第一張設為主圖
      if (imageToRemove.isMain && newImages.length > 0) {
        newImages[0].isMain = true;
      }
      
      onChange(newImages);
    }
  }, [value, onChange]);

  const setMainImage = useCallback((id: string) => {
    const newImages = value.map(img => ({
      ...img,
      isMain: img.id === id
    }));
    onChange(newImages);
  }, [value, onChange]);

  const moveImage = useCallback((fromIndex: number, toIndex: number) => {
    const newImages = [...value];
    const [removed] = newImages.splice(fromIndex, 1);
    newImages.splice(toIndex, 0, removed);
    onChange(newImages);
  }, [value, onChange]);

  return (
    <div className="space-y-4">
      {/* Upload Area */}
      <div
        className={clsx(
          "border-2 border-dashed rounded-lg p-4 text-center transition-colors",
          dragActive ? "border-primary-500 bg-primary-50" : "border-gray-300"
        )}
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
      >
        <CloudArrowUpIcon className="mx-auto h-10 w-10 text-gray-400" />
        <div className="mt-3">
          <label htmlFor="image-upload" className="cursor-pointer">
            <span className="inline-flex items-center px-3 py-1.5 border border-transparent text-sm font-medium rounded-md text-white bg-primary-600 hover:bg-primary-700">
              選擇圖片
            </span>
            <input
              id="image-upload"
              type="file"
              className="sr-only"
              multiple
              accept="image/*"
              onChange={handleInputChange}
            />
          </label>
          <p className="mt-1 text-xs text-gray-500">
            或拖放圖片到此處
          </p>
          <p className="text-xs text-gray-400">
            支援 JPG、PNG、GIF、WebP，最多 {maxFiles} 張
          </p>
        </div>
      </div>

      {/* Image Preview Grid */}
      {value.length > 0 && (
        <div>
          <div className="flex items-center justify-between mb-2">
            <p className="text-sm font-medium text-gray-700">
              已選擇 {value.length} 張圖片
            </p>
            {value.length > 0 && (
              <p className="text-xs text-gray-500">
                拖曳圖片可調整順序
              </p>
            )}
          </div>
          
          <div className="grid grid-cols-3 gap-3 sm:grid-cols-4 md:grid-cols-5">
            {value.map((image, index) => (
              <div
                key={image.id}
                className="relative group"
                draggable
                onDragStart={(e) => {
                  e.dataTransfer.effectAllowed = 'move';
                  e.dataTransfer.setData('imageIndex', index.toString());
                }}
                onDragOver={(e) => {
                  e.preventDefault();
                  e.dataTransfer.dropEffect = 'move';
                }}
                onDrop={(e) => {
                  e.preventDefault();
                  const fromIndex = parseInt(e.dataTransfer.getData('imageIndex'));
                  if (fromIndex !== index) {
                    moveImage(fromIndex, index);
                  }
                }}
              >
                <div className="aspect-square">
                  <img
                    src={image.preview}
                    alt={`Preview ${index + 1}`}
                    className="w-full h-full object-cover rounded-lg cursor-move"
                  />
                </div>
                
                {/* Main Image Indicator */}
                {image.isMain && (
                  <div className="absolute top-1 left-1">
                    <span className="inline-flex items-center px-1.5 py-0.5 text-xs font-medium rounded bg-yellow-100 text-yellow-800">
                      <StarIconSolid className="h-3 w-3 mr-0.5" />
                      主圖
                    </span>
                  </div>
                )}

                {/* Actions Overlay */}
                <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-40 transition-opacity rounded-lg flex items-center justify-center opacity-0 group-hover:opacity-100">
                  {!image.isMain && (
                    <button
                      type="button"
                      onClick={() => setMainImage(image.id)}
                      className="p-1.5 bg-white rounded-full text-gray-700 hover:bg-gray-100 mr-1"
                      title="設為主圖"
                    >
                      <StarIconOutline className="h-4 w-4" />
                    </button>
                  )}
                  <button
                    type="button"
                    onClick={() => removeImage(image.id)}
                    className="p-1.5 bg-white rounded-full text-red-600 hover:bg-red-50"
                    title="刪除"
                  >
                    <TrashIcon className="h-4 w-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Empty State */}
      {value.length === 0 && (
        <div className="text-center py-4">
          <PhotoIcon className="mx-auto h-10 w-10 text-gray-400" />
          <p className="mt-2 text-sm text-gray-500">尚未選擇任何圖片</p>
        </div>
      )}
    </div>
  );
};

export default ProjectImageUploader;