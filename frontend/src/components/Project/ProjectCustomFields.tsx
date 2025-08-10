import React from 'react';
import { CustomField } from '@/types';

interface ProjectCustomFieldsProps {
  customFields?: CustomField[];
  className?: string;
}

const ProjectCustomFields: React.FC<ProjectCustomFieldsProps> = ({ customFields, className = '' }) => {
  if (!customFields || customFields.length === 0) {
    return null;
  }

  return (
    <div className={`space-y-3 ${className}`}>
      {customFields.map((field, index) => (
        <div key={field.id || index} className="flex">
          <dt className="text-sm font-medium text-gray-600 w-1/3 pr-4">
            {field.label}:
          </dt>
          <dd className="text-sm text-gray-900 w-2/3">
            {field.value}
          </dd>
        </div>
      ))}
    </div>
  );
};

export default ProjectCustomFields;