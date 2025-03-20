
import React from 'react';
import { Skeleton } from '@/components/ui/skeleton';
import { Card, CardContent, CardHeader } from '@/components/ui/card';

const SessionLoadingState: React.FC = () => {
  return (
    <div className="container px-4 py-8 max-w-4xl mx-auto">
      <div className="flex justify-between items-center mb-6">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-10 w-24" />
      </div>
      <Card className="mb-6">
        <CardHeader>
          <Skeleton className="h-6 w-3/4" />
        </CardHeader>
        <CardContent>
          <Skeleton className="h-4 w-full mb-4" />
          <Skeleton className="h-4 w-3/4 mb-4" />
          <Skeleton className="h-4 w-5/6" />
        </CardContent>
      </Card>
      <Card>
        <CardContent className="h-96">
          <div className="flex flex-col space-y-4 pt-4">
            <Skeleton className="h-16 w-3/4" />
            <Skeleton className="h-16 w-3/4 ml-auto" />
            <Skeleton className="h-16 w-3/4" />
          </div>
        </CardContent>
        <div className="p-6 border-t">
          <Skeleton className="h-12 w-full" />
        </div>
      </Card>
    </div>
  );
};

export default SessionLoadingState;
