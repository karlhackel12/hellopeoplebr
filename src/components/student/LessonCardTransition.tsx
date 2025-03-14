
import React, { useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

interface LessonCardTransitionProps {
  lessonId: string;
  title: string;
  isCard?: boolean;
  children: React.ReactNode;
  className?: string;
}

const LessonCardTransition: React.FC<LessonCardTransitionProps> = ({
  lessonId,
  title,
  isCard = true,
  children,
  className = '',
}) => {
  const elementRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();
  
  useEffect(() => {
    if (isCard) return;
    
    // Get stored position data
    const transitionDataStr = localStorage.getItem('lessonTransition');
    if (!transitionDataStr) return;
    
    try {
      const transitionData = JSON.parse(transitionDataStr);
      
      // Ensure we're dealing with the correct lesson and the data isn't too old (5 seconds max)
      if (transitionData.lessonId !== lessonId || 
          Date.now() - transitionData.timestamp > 5000) {
        return;
      }
      
      const element = elementRef.current;
      if (!element) return;
      
      // Create starting point animation
      element.style.position = 'fixed';
      element.style.top = `${transitionData.top}px`;
      element.style.left = `${transitionData.left}px`;
      element.style.width = `${transitionData.width}px`;
      element.style.height = `${transitionData.height}px`;
      element.style.margin = '0';
      element.style.zIndex = '50';
      element.style.transition = 'none';
      
      // Force reflow
      element.offsetHeight;
      
      // Animate to full page
      requestAnimationFrame(() => {
        element.style.transition = 'all 400ms cubic-bezier(0.22, 1, 0.36, 1)';
        element.style.top = '0';
        element.style.left = '0';
        element.style.width = '100%';
        element.style.height = '100%';
        
        // Clean up after animation
        setTimeout(() => {
          element.style.position = 'relative';
          element.style.zIndex = 'auto';
          localStorage.removeItem('lessonTransition');
        }, 500);
      });
    } catch (error) {
      console.error('Error with transition:', error);
      localStorage.removeItem('lessonTransition');
    }
  }, [isCard, lessonId]);
  
  const handleClick = () => {
    if (!isCard) return;
    
    try {
      // Get the element's position and size
      const element = elementRef.current;
      if (!element) return;
      
      const rect = element.getBoundingClientRect();
      
      // Store the position for the transition
      localStorage.setItem('lessonTransition', JSON.stringify({
        top: rect.top,
        left: rect.left,
        width: rect.width,
        height: rect.height,
        lessonId,
        title,
        timestamp: Date.now()
      }));
      
      // Navigate to the lesson view
      navigate(`/student/lessons/view/${lessonId}`);
    } catch (error) {
      console.error('Error storing transition data:', error);
      navigate(`/student/lessons/view/${lessonId}`);
    }
  };
  
  return (
    <div 
      ref={elementRef}
      className={`${className}`}
      onClick={isCard ? handleClick : undefined}
    >
      {children}
    </div>
  );
};

export default LessonCardTransition;
