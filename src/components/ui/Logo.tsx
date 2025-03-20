
import React from 'react';
import { Link } from 'react-router-dom';

interface LogoProps {
  size?: 'sm' | 'md' | 'lg';
  colored?: boolean;
  iconOnly?: boolean;
}

const Logo: React.FC<LogoProps> = ({ size = 'md', colored = true, iconOnly = false }) => {
  const sizeClasses = {
    sm: 'h-8 md:h-9',
    md: 'h-10 md:h-11',
    lg: 'h-12 md:h-14',
  };
  
  return (
    <Link 
      to="/" 
      className="font-bold transition-all duration-300 hover:opacity-90 flex items-center"
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
