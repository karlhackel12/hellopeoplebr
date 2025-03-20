
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
      ${colored ? 'text-[#1E88E5]' : 'text-foreground'} hover:opacity-90 font-display`}
    >
      <span className="flex items-center gap-1.5">
        <span className="relative">
          <span className="absolute -inset-1 rounded-full bg-[#1E88E5]/10 animate-pulse-light"></span>
          Hello
        </span>
        {!iconOnly && <span className="relative text-[#26A69A]">People</span>}
      </span>
    </Link>
  );
};

export default Logo;
