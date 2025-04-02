
import React from 'react';
import { useLocation } from 'react-router-dom';
import { CSSTransition, TransitionGroup } from 'react-transition-group';

interface PageTransitionProps {
  children: React.ReactNode;
  locationKey: string;
  timeout?: {
    enter: number;
    exit: number;
  };
}

const PageTransition: React.FC<PageTransitionProps> = ({ 
  children, 
  locationKey,
  timeout = { enter: 400, exit: 300 }
}) => {
  return (
    <TransitionGroup>
      <CSSTransition
        key={locationKey}
        timeout={timeout}
        classNames="page-transition"
        mountOnEnter
        unmountOnExit
      >
        <div className="page-transition-wrapper">
          {children}
        </div>
      </CSSTransition>
    </TransitionGroup>
  );
};

export default PageTransition;

export const PageTransitionWrapper: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const location = useLocation();
  
  return (
    <PageTransition locationKey={location.pathname}>
      {children}
    </PageTransition>
  );
};
