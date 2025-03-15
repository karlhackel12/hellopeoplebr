
import React from 'react';
import { Helmet } from 'react-helmet';
import { Construction, Wrench, Clock } from 'lucide-react';
import StudentLayout from '@/components/layout/StudentLayout';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';

const VoicePracticeConstruction: React.FC = () => {
  return (
    <StudentLayout>
      <Helmet>
        <title>Voice Practice | Under Construction</title>
      </Helmet>
      
      <div className="flex flex-col items-center justify-center py-12">
        <Card className="w-full max-w-2xl">
          <CardHeader className="text-center">
            <div className="flex justify-center mb-4">
              <div className="relative">
                <Construction className="h-16 w-16 text-amber-500" />
                <Wrench className="h-8 w-8 text-blue-500 absolute -bottom-1 -right-1 animate-pulse" />
              </div>
            </div>
            <CardTitle className="text-2xl">Voice Practice Coming Soon</CardTitle>
            <CardDescription>
              We're working hard to bring you an amazing voice practice experience
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4 text-center">
              <p className="text-muted-foreground">
                Our team is currently developing an advanced voice practice system with AI-powered feedback, 
                pronunciation assessment, and interactive conversation practice.
              </p>
              
              <div className="flex justify-center items-center gap-2 text-muted-foreground">
                <Clock className="h-4 w-4" />
                <span>Expected release: Coming soon</span>
              </div>
              
              <div className="pt-4">
                <Button asChild>
                  <Link to="/student/dashboard">Return to Dashboard</Link>
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </StudentLayout>
  );
};

export default VoicePracticeConstruction;
