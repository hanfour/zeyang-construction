import React, { useEffect } from 'react';
import { createPortal } from 'react-dom';

interface SuccessModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  message: string;
  autoCloseDelay?: number; // in milliseconds
  showCloseButton?: boolean;
}

const SuccessModal: React.FC<SuccessModalProps> = ({
  isOpen,
  onClose,
  title = '成功',
  message,
  autoCloseDelay = 1500,
  showCloseButton = true
}) => {
  // Auto close after delay
  useEffect(() => {
    if (isOpen && autoCloseDelay > 0) {
      const timer = setTimeout(() => {
        onClose();
      }, autoCloseDelay);

      return () => clearTimeout(timer);
    }
  }, [isOpen, autoCloseDelay, onClose]);

  // Close on ESC key
  useEffect(() => {
    const handleEscKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleEscKey);
      // Prevent body scroll when modal is open
      document.body.style.overflow = 'hidden';
    }

    return () => {
      document.removeEventListener('keydown', handleEscKey);
      document.body.style.overflow = 'unset';
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const modalContent = (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black bg-opacity-50 transition-opacity"
        onClick={onClose}
      />
      
      {/* Modal */}
      <div className="relative bg-white rounded-lg shadow-xl max-w-md w-full mx-auto transform transition-all">
        {/* Success Icon */}
        <div className="flex items-center justify-center pt-8 pb-4">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center">
            <svg 
              className="w-8 h-8 text-green-600" 
              fill="none" 
              stroke="currentColor" 
              viewBox="0 0 24 24"
            >
              <path 
                strokeLinecap="round" 
                strokeLinejoin="round" 
                strokeWidth={2} 
                d="M5 13l4 4L19 7" 
              />
            </svg>
          </div>
        </div>
        
        {/* Content */}
        <div className="px-6 pb-6 text-center">
          <h3 className="text-lg font-medium text-gray-900 mb-3">
            {title}
          </h3>
          <p className="text-gray-600 text-sm leading-relaxed">
            {message}
          </p>
          
          {/* Close Button */}
          {showCloseButton && (
            <div className="mt-6">
              <button
                type="button"
                onClick={onClose}
                className="w-full bg-primary-more text-white px-6 py-3 rounded-md text-sm font-medium hover:bg-opacity-90 transition-colors focus:outline-none focus:ring-2 focus:ring-primary-more focus:ring-offset-2"
              >
                確認
              </button>
            </div>
          )}
        </div>
        
        {/* Auto close indicator */}
        {autoCloseDelay > 0 && (
          <div className="absolute bottom-0 left-0 right-0 h-1 bg-gray-200 rounded-b-lg overflow-hidden">
            <div 
              className="h-full bg-primary-more rounded-b-lg transition-all ease-linear animate-shrink"
              style={{
                animationDuration: `${autoCloseDelay}ms`,
                animationFillMode: 'forwards'
              }}
            />
          </div>
        )}
      </div>
    </div>
  );

  // Render modal in portal
  return createPortal(modalContent, document.body);
};

export default SuccessModal;