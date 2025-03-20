
import React from 'react';
import { Link } from 'react-router-dom';

interface LogoProps {
  size?: 'sm' | 'md' | 'lg';
  colored?: boolean;
  iconOnly?: boolean;
}

const Logo: React.FC<LogoProps> = ({ size = 'md', colored = true, iconOnly = false }) => {
  const sizeClasses = {
    sm: 'h-6 md:h-7',
    md: 'h-8 md:h-9',
    lg: 'h-10 md:h-12',
  };
  
  return (
    <Link 
      to="/" 
      className={`font-bold transition-all duration-300 hover:opacity-90`}
    >
      <img 
        src="/lovable-uploads/21c3c456-0bb5-4305-9eec-88c3bd45f361.png" 
        alt="HelloPeople Logo" 
        className={`${sizeClasses[size]}`} 
      />
    </Link>
  );
};

export default Logo;
