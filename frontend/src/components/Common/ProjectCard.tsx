import React from 'react';
import { Link } from 'react-router-dom';
import { MapPinIcon, HomeIcon } from '@heroicons/react/24/outline';
import { Project } from '@/types';
import { getImageUrl, getMediumImageUrl, getPlaceholderImageUrl } from '@/utils/image';
import clsx from 'clsx';

interface ProjectCardProps {
  project: Project;
  className?: string;
}

const ProjectCard: React.FC<ProjectCardProps> = ({ project, className }) => {
  const statusColors = {
    planning: 'bg-gray-100 text-gray-800',
    pre_sale: 'bg-blue-100 text-blue-800',
    on_sale: 'bg-green-100 text-green-800',
    sold_out: 'bg-red-100 text-red-800',
    completed: 'bg-purple-100 text-purple-800',
  };

  const statusLabels = {
    planning: '規劃中',
    pre_sale: '預售',
    on_sale: '銷售中',
    sold_out: '已售罄',
    completed: '已完工',
  };

  // Use main_image from API or fallback to placeholder
  const imageUrl = project.main_image 
    ? getMediumImageUrl(project.main_image) || getImageUrl(project.main_image.file_path)
    : getPlaceholderImageUrl();
  const altText = project.title;

  return (
    <Link
      to={`/projects/${project.slug}`}
      className={clsx('card group hover:shadow-lg transition-shadow duration-300', className)}
    >
      <div className="aspect-[4/3] overflow-hidden bg-gray-200">
        <img
          src={imageUrl}
          alt={altText}
          className="h-full w-full object-cover group-hover:scale-105 transition-transform duration-300"
          loading="lazy"
        />
      </div>
      
      <div className="p-6">
        <div className="flex items-center justify-between mb-3">
          <span className={clsx(
            'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium',
            statusColors[project.status]
          )}>
            {statusLabels[project.status]}
          </span>
          {project.is_featured && (
            <span className="text-xs font-medium text-primary-600">精選</span>
          )}
        </div>
        
        <h3 className="text-lg font-semibold text-gray-900 group-hover:text-primary-600 transition-colors">
          {project.title}
        </h3>
        
        {project.subtitle && (
          <p className="mt-1 text-sm text-gray-600">{project.subtitle}</p>
        )}
        
        <div className="mt-4 space-y-2">
          <div className="flex items-center text-sm text-gray-500">
            <MapPinIcon className="h-4 w-4 mr-1.5" />
            {project.location}
          </div>
          
          {project.area && (
            <div className="flex items-center text-sm text-gray-500">
              <HomeIcon className="h-4 w-4 mr-1.5" />
              {project.area}
            </div>
          )}
        </div>
        
        {project.year && (
          <p className="mt-4 text-sm text-gray-600">
            建造年份：{project.year}
          </p>
        )}
        
        {/* Tags temporarily hidden */}
        {/* {project.tags && project.tags.length > 0 && (
          <div className="mt-4 flex flex-wrap gap-2">
            {(typeof project.tags[0] === 'string' ? project.tags : project.tags.map(t => t.name))
              .slice(0, 3)
              .map((tag, index) => (
                <span
                  key={index}
                  className="inline-flex items-center px-2 py-1 rounded-md text-xs font-medium bg-gray-100 text-gray-700"
                >
                  {tag}
                </span>
              ))}
          </div>
        )} */}
      </div>
    </Link>
  );
};

export default ProjectCard;