import React, { useState } from 'react';
import { PlusIcon, TrashIcon } from '@heroicons/react/24/outline';
import { CustomField } from '@/types';

interface DynamicFieldManagerProps {
  fields: CustomField[];
  onChange: (fields: CustomField[]) => void;
  label?: string;
  placeholder?: {
    label: string;
    value: string;
  };
}

const DynamicFieldManager: React.FC<DynamicFieldManagerProps> = ({
  fields,
  onChange,
  label = '自訂欄位',
  placeholder = { label: '欄位名稱', value: '欄位內容' }
}) => {
  const handleAddField = () => {
    const newField: CustomField = {
      id: Date.now().toString(),
      label: '',
      value: ''
    };
    onChange([...fields, newField]);
  };

  const handleRemoveField = (id: string) => {
    onChange(fields.filter(field => field.id !== id));
  };

  const handleFieldChange = (id: string, key: 'label' | 'value', value: string) => {
    onChange(
      fields.map(field =>
        field.id === id ? { ...field, [key]: value } : field
      )
    );
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-3">
        <label className="block text-sm font-medium text-gray-700">
          {label}
        </label>
        <button
          type="button"
          onClick={handleAddField}
          className="inline-flex items-center px-3 py-1 border border-transparent text-sm leading-4 font-medium rounded-md text-primary-700 bg-primary-100 hover:bg-primary-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
        >
          <PlusIcon className="h-4 w-4 mr-1" />
          新增欄位
        </button>
      </div>

      <div className="space-y-3">
        {fields.map((field) => (
          <div key={field.id} className="flex space-x-2">
            <input
              type="text"
              value={field.label}
              onChange={(e) => handleFieldChange(field.id!, 'label', e.target.value)}
              placeholder={placeholder.label}
              className="flex-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
            />
            <input
              type="text"
              value={field.value}
              onChange={(e) => handleFieldChange(field.id!, 'value', e.target.value)}
              placeholder={placeholder.value}
              className="flex-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
            />
            <button
              type="button"
              onClick={() => handleRemoveField(field.id!)}
              className="inline-flex items-center p-2 border border-transparent rounded-md text-red-600 hover:bg-red-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
            >
              <TrashIcon className="h-5 w-5" />
            </button>
          </div>
        ))}

        {fields.length === 0 && (
          <div className="text-center py-6 bg-gray-50 rounded-md">
            <p className="text-sm text-gray-500">尚未新增任何自訂欄位</p>
            <p className="text-xs text-gray-400 mt-1">點擊上方按鈕開始新增</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default DynamicFieldManager;