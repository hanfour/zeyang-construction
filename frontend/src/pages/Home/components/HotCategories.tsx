import React from 'react';
import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { ArrowRightIcon } from '@heroicons/react/24/outline';
import projectService from '@/services/project.service';
import ProjectCard from '@/components/Common/ProjectCard';
import LoadingSpinner from '@/components/Common/LoadingSpinner';

const categories = [
  { id: 'residential', name: '住宅', value: '住宅', color: 'bg-blue-500' },
  { id: 'commercial', name: '商辦', value: '商辦', color: 'bg-green-500' },
  { id: 'public', name: '公共工程', value: '公共工程', color: 'bg-purple-500' },
  { id: 'other', name: '其他', value: '其他', color: 'bg-gray-500' },
];

const HotCategories: React.FC = () => {
  const [activeCategory, setActiveCategory] = React.useState('住宅');

  const { data, isLoading } = useQuery({
    queryKey: ['hot-category-projects', activeCategory],
    queryFn: () => projectService.getProjects({ 
      category: activeCategory as any,
      status: 'on_sale',
      limit: 3,
      orderBy: 'view_count',
      orderDir: 'DESC'
    }),
  });

  const projects = data?.data?.items || [];

  return (
    <section className="py-16 md:py-24 bg-white">
      <div className="container mx-auto px-6 lg:px-8">
        <div className="text-center">
          <h2 className="text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">
            熱銷類別
          </h2>
          <p className="mt-4 text-lg text-gray-600">
            探索目前最受歡迎的房地產類別
          </p>
        </div>

        {/* Category tabs */}
        <div className="mt-8 flex justify-center">
          <div className="inline-flex rounded-lg shadow-sm" role="group">
            {categories.map((category, index) => (
              <button
                key={category.id}
                onClick={() => setActiveCategory(category.value)}
                className={`
                  ${index === 0 ? 'rounded-l-lg' : ''}
                  ${index === categories.length - 1 ? 'rounded-r-lg' : ''}
                  ${activeCategory === category.value
                    ? 'bg-primary-600 text-white'
                    : 'bg-white text-gray-700 hover:bg-gray-50'
                  }
                  px-6 py-3 text-sm font-medium border border-gray-200 
                  focus:z-10 focus:ring-2 focus:ring-primary-500 focus:outline-none
                  transition-colors duration-200
                `}
              >
                {category.name}
              </button>
            ))}
          </div>
        </div>

        {/* Projects */}
        <div className="mt-12">
          {isLoading ? (
            <div className="flex justify-center py-12">
              <LoadingSpinner size="large" />
            </div>
          ) : projects.length > 0 ? (
            <>
              <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
                {projects.map((project) => (
                  <ProjectCard key={project.id} project={project} />
                ))}
              </div>
              <div className="mt-12 text-center">
                <Link
                  to={`/projects?category=${activeCategory}`}
                  className="inline-flex items-center gap-x-2 text-base font-semibold text-primary-600 hover:text-primary-700 transition-colors"
                >
                  查看更多{activeCategory}專案
                  <ArrowRightIcon className="h-4 w-4" />
                </Link>
              </div>
            </>
          ) : (
            <div className="text-center py-12">
              <p className="text-gray-500">目前沒有銷售中的{activeCategory}專案</p>
            </div>
          )}
        </div>
      </div>
    </section>
  );
};

export default HotCategories;