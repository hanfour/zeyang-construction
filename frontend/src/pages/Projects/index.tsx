import React, { useState } from 'react';
import { Helmet } from 'react-helmet-async';
import { useQuery } from '@tanstack/react-query';
import ProjectList from './components/ProjectList';
import ProjectFilters from './components/ProjectFilters';
import projectService from '@/services/project.service';
import { ProjectFilters as IProjectFilters } from '@/types';

const ProjectsPage: React.FC = () => {
  const [filters, setFilters] = useState<IProjectFilters>({
    page: 1,
    limit: 12,
  });

  const { data, isLoading, error } = useQuery({
    queryKey: ['projects', filters],
    queryFn: () => projectService.getProjects(filters),
    keepPreviousData: true,
  });

  const handleFilterChange = (newFilters: Partial<IProjectFilters>) => {
    setFilters(prev => ({
      ...prev,
      ...newFilters,
      page: newFilters.page || 1, // Reset page when filters change
    }));
  };

  const handlePageChange = (page: number) => {
    setFilters(prev => ({ ...prev, page }));
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <>
      <Helmet>
        <title>專案列表 - EstateHub</title>
        <meta name="description" content="瀏覽 EstateHub 的所有房地產專案，包含住宅、商業、辦公室等多種類型。" />
      </Helmet>

      <div className="bg-gray-50 min-h-screen">
        {/* Header */}
        <div className="bg-white shadow-sm">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <h1 className="text-3xl font-bold text-gray-900">專案列表</h1>
            <p className="mt-2 text-lg text-gray-600">
              探索我們精心挑選的房地產專案
            </p>
          </div>
        </div>

        {/* Main content */}
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex flex-col lg:flex-row gap-8">
            {/* Filters sidebar */}
            <aside className="lg:w-64 flex-shrink-0">
              <ProjectFilters
                filters={filters}
                onFilterChange={handleFilterChange}
              />
            </aside>

            {/* Project list */}
            <div className="flex-1">
              <ProjectList
                data={data}
                isLoading={isLoading}
                error={error}
                currentPage={filters.page || 1}
                onPageChange={handlePageChange}
              />
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default ProjectsPage;