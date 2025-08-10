import React from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

interface ProjectListProps {
  data?: {
    projects: any[];
    total: number;
    page: number;
    totalPages: number;
  };
  isLoading: boolean;
  error: any;
  currentPage: number;
  onPageChange: (page: number) => void;
}

const ProjectList: React.FC<ProjectListProps> = ({
  data,
  isLoading,
  error,
  currentPage,
  onPageChange,
}) => {
  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {[...Array(6)].map((_, index) => (
          <div key={index} className="bg-white rounded-lg shadow-md p-6 animate-pulse">
            <div className="h-48 bg-gray-200 rounded mb-4"></div>
            <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
            <div className="h-4 bg-gray-200 rounded w-1/2"></div>
          </div>
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-12">
        <p className="text-red-500">載入專案時發生錯誤</p>
      </div>
    );
  }

  if (!data?.projects || data.projects.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500">目前沒有符合條件的專案</p>
      </div>
    );
  }

  return (
    <div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {data.projects.map((project) => (
          <div key={project.id} className="bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow">
            <div className="p-6">
              <h3 className="text-xl font-semibold mb-2">{project.name}</h3>
              <p className="text-gray-600 mb-4">{project.description}</p>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-500">{project.type}</span>
                <span className="text-sm text-gray-500">{project.status}</span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {data.totalPages > 1 && (
        <div className="mt-8 flex justify-center">
          <nav className="flex items-center space-x-2">
            <button
              onClick={() => onPageChange(currentPage - 1)}
              disabled={currentPage === 1}
              className="p-2 rounded-md bg-white shadow-sm disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
            >
              <ChevronLeft className="h-5 w-5" />
            </button>
            <span className="px-3 py-2 text-sm">
              第 {currentPage} 頁，共 {data.totalPages} 頁
            </span>
            <button
              onClick={() => onPageChange(currentPage + 1)}
              disabled={currentPage === data.totalPages}
              className="p-2 rounded-md bg-white shadow-sm disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
            >
              <ChevronRight className="h-5 w-5" />
            </button>
          </nav>
        </div>
      )}
    </div>
  );
};

export default ProjectList;