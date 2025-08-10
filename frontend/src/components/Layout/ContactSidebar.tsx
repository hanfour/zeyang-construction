import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const ContactSidebar: React.FC = () => {
  const [isExpanded, setIsExpanded] = useState(false);

  return (
    <div className="fixed right-0 top-1/2 -translate-y-1/2 z-40">
      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ opacity: 0, x: 100 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 100 }}
            transition={{ type: 'spring', stiffness: 300, damping: 30 }}
            className="bg-white shadow-xl rounded-l-lg p-6 mr-20"
          >
            <h3 className="text-lg font-medium text-neutral-800 mb-4">快速聯繫</h3>
            <div className="space-y-3 text-sm">
              <a
                href="tel:02-2736-8955"
                className="flex items-center text-neutral-600 hover:text-primary transition-colors"
              >
                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                </svg>
                02-2736-8955
              </a>
              <a
                href="mailto:info@zeyang.com.tw"
                className="flex items-center text-neutral-600 hover:text-primary transition-colors"
              >
                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
                聯絡信箱
              </a>
              <button className="w-full bg-primary text-white py-2 px-4 rounded hover:bg-primary-dark transition-colors">
                預約諮詢
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Toggle Button */}
      <motion.button
        onClick={() => setIsExpanded(!isExpanded)}
        className="bg-primary text-white px-4 py-3 rounded-l-lg shadow-lg hover:bg-primary-dark transition-colors"
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
      >
        <div className="flex items-center space-x-2">
          <span 
            className="text-sm font-medium"
            style={{
              writingMode: 'vertical-rl',
              textOrientation: 'mixed'
            }}
          >
            聯絡我們
          </span>
          <motion.svg
            animate={{ rotate: isExpanded ? 180 : 0 }}
            transition={{ duration: 0.3 }}
            className="w-4 h-4"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </motion.svg>
        </div>
      </motion.button>
    </div>
  );
};

export default ContactSidebar;