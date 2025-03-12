
import React from 'react';
import { Button } from '@/components/ui/button';
import { Check } from 'lucide-react';

interface InvitationSuccessProps {
  teacherName: string;
  studentEmail: string;
  onProceed: () => void;
}

const InvitationSuccess: React.FC<InvitationSuccessProps> = ({
  teacherName,
  studentEmail,
  onProceed
}) => {
  return (
    <div className="space-y-4">
      <div className="rounded-lg bg-green-50 p-4 text-green-800 flex items-start">
        <Check className="h-5 w-5 text-green-600 mr-2 mt-0.5" />
        <div>
          <p className="font-medium">Invitation Verified!</p>
          <p className="text-sm mt-1">You're invited by {teacherName} to join HelloPeople as a student.</p>
          {studentEmail && (
            <p className="text-sm mt-1">This invitation is for: <strong>{studentEmail}</strong></p>
          )}
        </div>
      </div>
      
      <Button 
        onClick={onProceed}
        className="w-full"
      >
        Continue to Registration
      </Button>
    </div>
  );
};

export default InvitationSuccess;
