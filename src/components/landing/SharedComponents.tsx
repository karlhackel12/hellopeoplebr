
import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { ExternalLink, ArrowUpRight } from 'lucide-react';

export const SwitchUserTypeLink: React.FC<{
  targetUserType: 'teacher' | 'student';
  className?: string;
}> = ({ targetUserType, className }) => {
  const handleSwitch = () => {
    localStorage.setItem('user_type', targetUserType);
  };

  return (
    <Link 
      to={`/${targetUserType}s`} 
      onClick={handleSwitch}
      className={`text-sm flex items-center hover:underline text-muted-foreground ${className}`}
    >
      {targetUserType === 'teacher' ? 'I am a teacher' : 'I am a student'}
      <ArrowUpRight className="ml-1 h-3 w-3" />
    </Link>
  );
};

export const BreadcrumbNav: React.FC<{
  items: Array<{ label: string; href: string; }>;
  className?: string;
}> = ({ items, className }) => {
  return (
    <nav aria-label="Breadcrumb" className={`text-sm ${className}`}>
      <ol className="flex items-center space-x-2">
        {items.map((item, index) => (
          <React.Fragment key={item.href}>
            {index > 0 && <span className="text-muted-foreground">/</span>}
            <li>
              <Link 
                to={item.href}
                className={index === items.length - 1 
                  ? "font-medium text-foreground" 
                  : "text-muted-foreground hover:text-foreground"
                }
              >
                {item.label}
              </Link>
            </li>
          </React.Fragment>
        ))}
      </ol>
    </nav>
  );
};

export const FeatureCard: React.FC<{
  icon: React.ReactNode;
  title: string;
  description: string;
  className?: string;
}> = ({ icon, title, description, className }) => {
  return (
    <div className={`bg-card/40 backdrop-blur-sm border border-border/60 rounded-xl p-6 shadow-sm hover:shadow-md transition-shadow ${className}`}>
      <div className="flex items-center gap-3 mb-4">
        {icon}
        <h3 className="text-xl font-semibold">{title}</h3>
      </div>
      <p className="text-muted-foreground">{description}</p>
    </div>
  );
};

export const CTAButton: React.FC<{
  href: string;
  children: React.ReactNode;
  variant?: "default" | "outline";
  size?: "default" | "lg";
  className?: string;
}> = ({ href, children, variant = "default", size = "lg", className }) => {
  return (
    <Link to={href}>
      <Button variant={variant} size={size} className={className}>
        {children}
      </Button>
    </Link>
  );
};

export const ExternalLinkButton: React.FC<{
  href: string;
  children: React.ReactNode;
  variant?: "default" | "outline";
  size?: "default" | "lg";
  className?: string;
}> = ({ href, children, variant = "outline", size = "default", className }) => {
  return (
    <a href={href} target="_blank" rel="noopener noreferrer">
      <Button variant={variant} size={size} className={className}>
        {children}
        <ExternalLink size={16} className="ml-2" />
      </Button>
    </a>
  );
};
