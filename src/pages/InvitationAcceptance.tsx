
import React from 'react';
import InvitationAcceptance from '@/components/student/InvitationAcceptance';
import Logo from '@/components/ui/Logo';
import { Link } from 'react-router-dom';

const InvitationAcceptancePage: React.FC = () => {
  return (
    <div className="min-h-screen flex flex-col">
      <header className="border-b p-4">
        <div className="container mx-auto flex justify-between items-center">
          <Link to="/">
            <Logo />
          </Link>
        </div>
      </header>
      
      <main className="flex-1 flex items-center justify-center p-6">
        <div className="w-full max-w-md">
          <InvitationAcceptance />
        </div>
      </main>
      
      <footer className="border-t p-4 text-center text-sm text-muted-foreground">
        <p>© {new Date().getFullYear()} HelloPeople. All rights reserved.</p>
      </footer>
    </div>
  );
};

export default InvitationAcceptancePage;
