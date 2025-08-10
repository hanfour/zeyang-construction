import React, { useState, useRef, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { XMarkIcon } from '@heroicons/react/24/solid';
import { PlusIcon } from '@heroicons/react/24/outline';
import tagService from '@/services/tag.service';
import { Tag } from '@/types';
import LoadingSpinner from './LoadingSpinner';

interface TagSelectorProps {
  value: string[];
  onChange: (tags: string[]) => void;
  placeholder?: string;
  className?: string;
  disabled?: boolean;
}

const TagSelector: React.FC<TagSelectorProps> = ({
  value = [],
  onChange,
  placeholder = '輸入標籤名稱或選擇現有標籤',
  className = '',
  disabled = false,
}) => {
  const [inputValue, setInputValue] = useState('');
  const [showDropdown, setShowDropdown] = useState(false);
  const [selectedTags, setSelectedTags] = useState<string[]>(value);
  const inputRef = useRef<HTMLInputElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // 查詢所有標籤
  const { data: tagsData, isLoading } = useQuery({
    queryKey: ['tags', inputValue],
    queryFn: () => tagService.getTags({ search: inputValue }),
    enabled: showDropdown,
  });

  const availableTags = tagsData?.data?.items || [];

  // 同步外部 value 變化
  useEffect(() => {
    setSelectedTags(value);
  }, [value]);

  // 點擊外部關閉下拉選單
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node) &&
        inputRef.current &&
        !inputRef.current.contains(event.target as Node)
      ) {
        setShowDropdown(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleAddTag = (tagName: string) => {
    const trimmedTag = tagName.trim();
    if (trimmedTag && !selectedTags.includes(trimmedTag)) {
      const newTags = [...selectedTags, trimmedTag];
      setSelectedTags(newTags);
      onChange(newTags);
      setInputValue('');
      setShowDropdown(false);
    }
  };

  const handleRemoveTag = (tagToRemove: string) => {
    const newTags = selectedTags.filter(tag => tag !== tagToRemove);
    setSelectedTags(newTags);
    onChange(newTags);
  };

  const handleInputKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      if (inputValue.trim()) {
        handleAddTag(inputValue);
      }
    } else if (e.key === 'Backspace' && !inputValue && selectedTags.length > 0) {
      // 刪除最後一個標籤
      handleRemoveTag(selectedTags[selectedTags.length - 1]);
    }
  };

  const handleTagClick = (tag: Tag) => {
    handleAddTag(tag.name);
  };

  // 過濾已選擇的標籤
  const filteredTags = availableTags.filter(
    tag => !selectedTags.includes(tag.name)
  );

  // 檢查輸入值是否為新標籤
  const isNewTag = inputValue.trim() && 
    !availableTags.some(tag => tag.name.toLowerCase() === inputValue.trim().toLowerCase());

  return (
    <div className={`relative ${className}`}>
      <div className="flex flex-wrap gap-2 p-3 border border-gray-300 rounded-lg focus-within:border-primary-500 focus-within:ring-1 focus-within:ring-primary-500">
        {selectedTags.map((tag) => (
          <span
            key={tag}
            className="inline-flex items-center gap-1 px-3 py-1 text-sm bg-gray-100 text-gray-700 rounded-full"
          >
            {tag}
            {!disabled && (
              <button
                type="button"
                onClick={() => handleRemoveTag(tag)}
                className="hover:text-gray-900 focus:outline-none"
              >
                <XMarkIcon className="h-3 w-3" />
              </button>
            )}
          </span>
        ))}
        <input
          ref={inputRef}
          type="text"
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          onFocus={() => setShowDropdown(true)}
          onKeyDown={handleInputKeyDown}
          placeholder={selectedTags.length === 0 ? placeholder : ''}
          disabled={disabled}
          className="flex-1 min-w-[200px] outline-none bg-transparent text-sm"
        />
      </div>

      {showDropdown && !disabled && (
        <div
          ref={dropdownRef}
          className="absolute z-10 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg max-h-60 overflow-auto"
        >
          {isLoading ? (
            <div className="p-4 text-center">
              <LoadingSpinner size="small" />
            </div>
          ) : (
            <>
              {isNewTag && (
                <button
                  type="button"
                  onClick={() => handleAddTag(inputValue)}
                  className="w-full px-4 py-2 text-left text-sm hover:bg-gray-50 flex items-center gap-2 border-b"
                >
                  <PlusIcon className="h-4 w-4 text-primary-600" />
                  <span>新增標籤 「{inputValue}」</span>
                </button>
              )}
              
              {filteredTags.length > 0 ? (
                <div className="py-1">
                  {filteredTags.map((tag) => (
                    <button
                      key={tag.id}
                      type="button"
                      onClick={() => handleTagClick(tag)}
                      className="w-full px-4 py-2 text-left text-sm hover:bg-gray-50 flex items-center justify-between"
                    >
                      <span>{tag.name}</span>
                      {tag.usage_count > 0 && (
                        <span className="text-xs text-gray-500">
                          使用 {tag.usage_count} 次
                        </span>
                      )}
                    </button>
                  ))}
                </div>
              ) : (
                !isNewTag && inputValue && (
                  <div className="p-4 text-sm text-gray-500 text-center">
                    沒有找到相符的標籤
                  </div>
                )
              )}
            </>
          )}
        </div>
      )}
    </div>
  );
};

export default TagSelector;