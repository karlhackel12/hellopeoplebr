
import React from 'react';
import { Navigate } from 'react-router-dom';

interface TeacherRouteProps {
  children: React.ReactNode;
}

const TeacherRoute: React.FC<TeacherRouteProps> = ({ children }) => {
  // This is a simplified version - normally we would check if the user is a teacher
  const isTeacher = true;

  if (!isTeacher) {
    return <Navigate to="/login" replace />;
  }

  return <>{children}</>;
};

export default TeacherRoute;
