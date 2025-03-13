
import React from 'react';
import { Link } from 'react-router-dom';

const Login: React.FC = () => {
  return (
    <div className="min-h-screen flex flex-col justify-center items-center p-6">
      <div className="w-full max-w-md">
        <h1 className="text-2xl font-bold mb-6 text-center">Login</h1>
        <p className="text-center mb-6 text-muted-foreground">
          Please login to access your account
        </p>
        
        <div className="flex flex-col space-y-4">
          <Link to="/teacher/dashboard" className="w-full">
            <button className="w-full bg-primary text-white py-2 px-4 rounded-md">
              Go to Teacher Dashboard
            </button>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Login;
