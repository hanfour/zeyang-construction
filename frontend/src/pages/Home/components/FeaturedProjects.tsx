import React from 'react';
import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { ArrowRightIcon } from '@heroicons/react/24/outline';
import projectService from '@/services/project.service';
import ProjectCard from '@/components/Common/ProjectCard';
import LoadingSpinner from '@/components/Common/LoadingSpinner';

const FeaturedProjects: React.FC = () => {
  const { data, isLoading, error } = useQuery({
    queryKey: ['featured-projects'],
    queryFn: () => projectService.getFeaturedProjects(6),
  });

  if (isLoading) {
    return (
      <section className="py-16 md:py-24">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-center">
            <LoadingSpinner size="large" />
          </div>
        </div>
      </section>
    );
  }

  if (error || !data?.data?.items) {
    return null;
  }

  const projects = data.data.items;

  return (
    <section className="py-16 md:py-24 bg-gray-50">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center">
          <h2 className="text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">
            精選專案
          </h2>
          <p className="mt-4 text-lg text-gray-600">
            探索我們精心挑選的優質房地產專案
          </p>
        </div>

        <div className="mt-12 grid gap-8 md:grid-cols-2 lg:grid-cols-3">
          {projects.map((project) => (
            <ProjectCard key={project.id} project={project} />
          ))}
        </div>

        <div className="mt-12 text-center">
          <Link
            to="/projects"
            className="inline-flex items-center gap-x-2 text-base font-semibold text-primary-600 hover:text-primary-700 transition-colors"
          >
            查看所有專案
            <ArrowRightIcon className="h-4 w-4" />
          </Link>
        </div>
      </div>
    </section>
  );
};

export default FeaturedProjects;