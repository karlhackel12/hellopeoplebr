
import React from 'react';
import { Link } from 'react-router-dom';

interface LogoProps {
  size?: 'sm' | 'md' | 'lg';
  colored?: boolean;
}

const Logo: React.FC<LogoProps> = ({ size = 'md', colored = true }) => {
  const sizeClasses = {
    sm: 'text-xl',
    md: 'text-2xl',
    lg: 'text-3xl',
  };
  
  return (
    <Link 
      to="/" 
      className={`font-bold tracking-tight ${sizeClasses[size]} transition-all duration-300 
      ${colored ? 'text-gradient' : 'text-foreground'} hover:opacity-90`}
    >
      <span className="flex items-center gap-1.5">
        <span className="relative">
          <span className="absolute -inset-1 rounded-full bg-primary/10 animate-pulse-light"></span>
          hello
        </span>
        <span className="relative">people</span>
      </span>
    </Link>
  );
};

export default Logo;
