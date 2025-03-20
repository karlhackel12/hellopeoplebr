
import React from 'react';
import { Link } from 'react-router-dom';

interface LogoProps {
  size?: 'sm' | 'md' | 'lg';
  colored?: boolean;
  iconOnly?: boolean;
}

const Logo: React.FC<LogoProps> = ({ size = 'md', colored = true, iconOnly = false }) => {
  const sizeClasses = {
    sm: 'text-xl',
    md: 'text-2xl',
    lg: 'text-3xl',
  };
  
  return (
    <Link 
      to="/" 
      className={`font-bold tracking-tight ${sizeClasses[size]} transition-all duration-300 
      ${colored ? 'text-[#FF9800]' : 'text-foreground'} hover:opacity-90 font-display flex items-center gap-2`}
    >
      <img 
        src="/lovable-uploads/e99ff4dd-ccfd-4b13-8e1a-de24aa2a5260.png" 
        alt="HelloPeople Logo" 
        className={`${size === 'sm' ? 'w-6 h-6' : size === 'md' ? 'w-8 h-8' : 'w-10 h-10'}`} 
      />
      {!iconOnly && (
        <span className="flex items-center">
          <span className="text-[#FF9800]">Hello</span>
          <span className="text-[#2196F3]">People</span>
        </span>
      )}
    </Link>
  );
};

export default Logo;
