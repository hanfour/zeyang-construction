import React from 'react';
import { ProjectFilters as IProjectFilters } from '@/types';

interface ProjectFiltersProps {
  filters: IProjectFilters;
  onFilterChange: (filters: Partial<IProjectFilters>) => void;
}

const ProjectFilters: React.FC<ProjectFiltersProps> = ({ filters, onFilterChange }) => {
  const projectTypes = [
    { value: 'residential', label: '住宅' },
    { value: 'commercial', label: '商業' },
    { value: 'office', label: '辦公室' },
    { value: 'industrial', label: '工業' },
  ];

  const projectStatuses = [
    { value: 'planning', label: '規劃中' },
    { value: 'in_progress', label: '進行中' },
    { value: 'completed', label: '已完成' },
  ];

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <h2 className="text-lg font-semibold mb-4">篩選條件</h2>
      
      <div className="space-y-6">
        <div>
          <h3 className="text-sm font-medium text-gray-700 mb-2">專案類型</h3>
          <div className="space-y-2">
            {projectTypes.map((type) => (
              <label key={type.value} className="flex items-center">
                <input
                  type="checkbox"
                  checked={filters.type?.includes(type.value) || false}
                  onChange={(e) => {
                    const currentTypes = filters.type || [];
                    const newTypes = e.target.checked
                      ? [...currentTypes, type.value]
                      : currentTypes.filter((t) => t !== type.value);
                    onFilterChange({ type: newTypes.length > 0 ? newTypes : undefined });
                  }}
                  className="mr-2 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
                <span className="text-sm text-gray-600">{type.label}</span>
              </label>
            ))}
          </div>
        </div>

        <div>
          <h3 className="text-sm font-medium text-gray-700 mb-2">專案狀態</h3>
          <div className="space-y-2">
            {projectStatuses.map((status) => (
              <label key={status.value} className="flex items-center">
                <input
                  type="radio"
                  name="status"
                  checked={filters.status === status.value}
                  onChange={() => onFilterChange({ status: status.value })}
                  className="mr-2 border-gray-300 text-blue-600 focus:ring-blue-500"
                />
                <span className="text-sm text-gray-600">{status.label}</span>
              </label>
            ))}
            <label className="flex items-center">
              <input
                type="radio"
                name="status"
                checked={!filters.status}
                onChange={() => onFilterChange({ status: undefined })}
                className="mr-2 border-gray-300 text-blue-600 focus:ring-blue-500"
              />
              <span className="text-sm text-gray-600">全部</span>
            </label>
          </div>
        </div>

        <div>
          <h3 className="text-sm font-medium text-gray-700 mb-2">排序方式</h3>
          <select
            value={filters.sortBy || 'createdAt'}
            onChange={(e) => onFilterChange({ sortBy: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="createdAt">最新優先</option>
            <option value="name">名稱排序</option>
            <option value="type">類型排序</option>
          </select>
        </div>

        <button
          onClick={() => onFilterChange({ type: undefined, status: undefined, sortBy: undefined })}
          className="w-full px-4 py-2 text-sm text-gray-600 bg-gray-100 rounded-md hover:bg-gray-200 transition-colors"
        >
          清除篩選
        </button>
      </div>
    </div>
  );
};

export default ProjectFilters;