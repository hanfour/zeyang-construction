import React from 'react';
import { motion } from 'framer-motion';

interface MenuButtonProps {
  isOpen: boolean;
  onClick: () => void;
}

const MenuButton: React.FC<MenuButtonProps> = ({ isOpen, onClick }) => {
  return (
    <button
      onClick={onClick}
      className="fixed top-4 lg:top-6 right-2 lg:right-12 z-50 w-12 h-12 flex items-center justify-center group"
      aria-label={isOpen ? 'Close menu' : 'Open menu'}
    >
      {isOpen ? (
        // 5 squares pattern when menu is open
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="grid grid-cols-3 grid-rows-3 gap-0.5"
        >
          {/* Top row - 2 squares at corners */}
          <motion.span
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.05 }}
            className="col-start-1 row-start-1 w-1.5 h-1.5 lg:w-2 lg:h-2 bg-white"
          />
          <motion.span
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.1 }}
            className="col-start-3 row-start-1 w-1.5 h-1.5 lg:w-2 lg:h-2 bg-white"
          />
          
          {/* Middle - 1 square at center */}
          <motion.span
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.15 }}
            className="col-start-2 row-start-2 w-1.5 h-1.5 lg:w-2 lg:h-2 bg-white"
          />
          
          {/* Bottom row - 2 squares at corners */}
          <motion.span
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.2 }}
            className="col-start-1 row-start-3 w-1.5 h-1.5 lg:w-2 lg:h-2 bg-white"
          />
          <motion.span
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.25 }}
            className="col-start-3 row-start-3 w-1.5 h-1.5 lg:w-2 lg:h-2 bg-white"
          />
        </motion.div>
      ) : (
        // 9 squares grid when menu is closed
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="grid grid-cols-3 gap-0.5"
        >
          {[...Array(9)].map((_, index) => (
            <motion.span
              key={index}
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: index * 0.03 }}
              className="block w-1.5 h-1.5 lg:w-2 lg:h-2 bg-primary transition-all duration-300 group-hover:scale-125 group-hover:bg-primary-dark"
            />
          ))}
        </motion.div>
      )}
    </button>
  );
};

export default MenuButton;