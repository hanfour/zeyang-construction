import React from 'react';
import { Project } from '@/types';
import { 
  MapPinIcon, 
  HomeIcon, 
  BuildingOfficeIcon,
  UsersIcon,
  PhoneIcon,
  GlobeAltIcon
} from '@heroicons/react/24/outline';

interface ProjectInfoFieldsProps {
  project: Project;
  className?: string;
}

const ProjectInfoFields: React.FC<ProjectInfoFieldsProps> = ({ project, className = '' }) => {
  const fields = [
    {
      label: '地區位置',
      value: project.location,
      icon: MapPinIcon,
      show: true
    },
    {
      label: '基地地址',
      value: project.base_address,
      icon: HomeIcon,
      show: !!project.base_address
    },
    {
      label: '面積',
      value: project.area,
      icon: null,
      show: !!project.area
    },
    {
      label: '樓層規劃',
      value: project.floor_plan_info,
      icon: BuildingOfficeIcon,
      show: !!project.floor_plan_info
    },
    {
      label: '戶數',
      value: project.unit_count ? `${project.unit_count} 戶` : undefined,
      icon: UsersIcon,
      show: !!project.unit_count
    },
    {
      label: '預約專線',
      value: project.booking_phone,
      icon: PhoneIcon,
      show: !!project.booking_phone,
      isLink: true,
      href: `tel:${project.booking_phone}`
    },
    {
      label: 'Facebook粉絲團',
      value: project.facebook_page ? '前往粉絲團' : undefined,
      icon: null,
      show: !!project.facebook_page,
      isLink: true,
      href: project.facebook_page,
      external: true
    },
    {
      label: '介紹網站',
      value: project.info_website ? '前往網站' : undefined,
      icon: GlobeAltIcon,
      show: !!project.info_website,
      isLink: true,
      href: project.info_website,
      external: true
    }
  ];

  const visibleFields = fields.filter(field => field.show);

  if (visibleFields.length === 0) {
    return null;
  }

  return (
    <div className={`space-y-4 ${className}`}>
      <dl className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        {visibleFields.map((field, index) => (
          <div key={index} className="flex items-start">
            {field.icon && (
              <field.icon className="h-5 w-5 text-gray-400 mr-3 mt-0.5 flex-shrink-0" />
            )}
            <div className="flex-1">
              <dt className="text-sm font-medium text-gray-500">{field.label}</dt>
              <dd className="mt-1 text-sm text-gray-900">
                {field.isLink ? (
                  <a
                    href={field.href}
                    target={field.external ? '_blank' : undefined}
                    rel={field.external ? 'noopener noreferrer' : undefined}
                    className="text-primary-600 hover:text-primary-700 underline"
                  >
                    {field.value}
                  </a>
                ) : (
                  field.value
                )}
              </dd>
            </div>
          </div>
        ))}
      </dl>
    </div>
  );
};

export default ProjectInfoFields;