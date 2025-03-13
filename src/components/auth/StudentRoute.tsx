
import React from 'react';
import { Navigate } from 'react-router-dom';

interface StudentRouteProps {
  children: React.ReactNode;
}

const StudentRoute: React.FC<StudentRouteProps> = ({ children }) => {
  // This is a simplified version - normally we would check if the user is a student
  const isStudent = true;

  if (!isStudent) {
    return <Navigate to="/login" replace />;
  }

  return <>{children}</>;
};

export default StudentRoute;
