
import React from 'react';
import { differenceInDays } from 'date-fns';
import { Badge } from '@/components/ui/badge';
import { Clock } from 'lucide-react';

interface InvitationExpiryTimerProps {
  expiresAt: string;
}

const InvitationExpiryTimer: React.FC<InvitationExpiryTimerProps> = ({ expiresAt }) => {
  const daysLeft = differenceInDays(new Date(expiresAt), new Date());
  
  const getExpiryText = () => {
    if (daysLeft < 0) return 'Expired';
    if (daysLeft === 0) return 'Expires today';
    if (daysLeft === 1) return 'Expires tomorrow';
    return `Expires in ${daysLeft} days`;
  };

  const getColorClass = () => {
    if (daysLeft < 0) return 'text-red-600';
    if (daysLeft <= 1) return 'text-yellow-600';
    return 'text-green-600';
  };

  return (
    <Badge variant="outline" className={`flex items-center gap-1 ${getColorClass()}`}>
      <Clock className="h-3 w-3" />
      <span>{getExpiryText()}</span>
    </Badge>
  );
};

export default InvitationExpiryTimer;
