import React, { useState } from 'react';
import ProjectImageManager from '@/components/Admin/ProjectImageManager';
import { ProjectImage } from '@/types';

const TestImageUpload: React.FC = () => {
  const [images, setImages] = useState<ProjectImage[]>([]);
  
  return (
    <div className="max-w-4xl mx-auto p-8">
      <h1 className="text-2xl font-bold mb-6">測試圖片上傳功能</h1>
      
      <div className="bg-white shadow rounded-lg p-6">
        <ProjectImageManager
          projectUuid="test-uuid-123"
          images={images}
          onImagesChange={setImages}
          maxFiles={20}
        />
      </div>
      
      <div className="mt-4">
        <p className="text-sm text-gray-600">
          目前圖片數量: {images.length}
        </p>
      </div>
    </div>
  );
};

export default TestImageUpload;