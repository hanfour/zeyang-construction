import React, { useMemo } from 'react';
import { motion, Variants } from 'framer-motion';

type ColorTheme = 'light' | 'dark';

interface MenuButtonProps {
  isOpen: boolean;
  onClick: () => void;
  color?: ColorTheme;
}

const MenuButton: React.FC<MenuButtonProps> = ({ 
  isOpen, 
  onClick, 
  color = 'dark' 
}) => {
  const squareSize = "w-1.5 h-1.5 lg:w-2 lg:h-2";
  
  const colorClasses = useMemo(() => {
    if (color === 'light') {
      return {
        base: 'bg-white',
        hover: 'group-hover:bg-white/15'
      };
    }
    return {
      base: 'bg-primary',
      hover: 'group-hover:bg-primary-dark'
    };
  }, [color]);

  const containerVariants: Variants = {
    hidden: { scale: 0.8, opacity: 0 },
    visible: { scale: 1, opacity: 1 }
  };

  const squareVariants: Variants = {
    hidden: { scale: 0 },
    visible: { scale: 1 }
  };

  const openSquarePositions = [
    { gridColumn: 1, gridRow: 1, delay: 0.05 },
    { gridColumn: 3, gridRow: 1, delay: 0.1 },
    { gridColumn: 2, gridRow: 2, delay: 0.15 },
    { gridColumn: 1, gridRow: 3, delay: 0.2 },
    { gridColumn: 3, gridRow: 3, delay: 0.25 }
  ];

  return (
    <button
      onClick={onClick}
      className="fixed top-4 lg:top-6 right-2 lg:right-12 z-[60] w-12 h-12 flex items-center justify-center group"
      aria-label={isOpen ? 'Close menu' : 'Open menu'}
      type="button"
    >
      {isOpen ? (
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="grid grid-cols-3 grid-rows-3 gap-0.5"
        >
          {openSquarePositions.map(({ gridColumn, gridRow, delay }, index) => (
            <motion.span
              key={index}
              variants={squareVariants}
              transition={{ delay }}
              className={`${squareSize} bg-white`}
              style={{ gridColumn, gridRow }}
            />
          ))}
        </motion.div>
      ) : (
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="grid grid-cols-3 gap-0.5"
        >
          {Array.from({ length: 9 }, (_, index) => (
            <motion.span
              key={index}
              variants={squareVariants}
              transition={{ delay: index * 0.03 }}
              className={`block ${squareSize} ${colorClasses.base} ${colorClasses.hover} transition-all duration-300 group-hover:scale-125`}
            />
          ))}
        </motion.div>
      )}
    </button>
  );
};

export default MenuButton;