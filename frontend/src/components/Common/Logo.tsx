import React from 'react';
import { Link } from 'react-router-dom';

interface LogoProps {
  className?: string;
  textColor?: 'white' | 'dark';
}

const Logo: React.FC<LogoProps> = ({ className = '', textColor = 'white' }) => {
  const colorClass = textColor === 'white' ? 'text-white' : 'text-neutral-800';
  
  return (
    <Link to="/" className={`flex items-center ${className}`}>
      <span className={`text-3xl font-bold ${textColor === 'white' ? 'text-white' : 'text-primary'}`}>
        ZY
      </span>
      <div className={`ml-3 ${colorClass}`}>
        <p className="text-sm font-medium leading-tight">澤暘建設股份有限公司</p>
        <p className="text-xs opacity-80">Ze Yang Construction Co., Ltd.</p>
      </div>
    </Link>
  );
};

export default Logo;