
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Clipboard } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { 
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { Badge } from '@/components/ui/badge';

interface StudentAssignmentsButtonProps {
  studentId: string;
  name: string;
}

const StudentAssignmentsButton: React.FC<StudentAssignmentsButtonProps> = ({ 
  studentId,
  name
}) => {
  const navigate = useNavigate();
  
  // Get assignments count for the student
  const { data: assignmentsCount } = useQuery({
    queryKey: ['student-assignments-count', studentId],
    queryFn: async () => {
      const { count, error } = await supabase
        .from('student_assignments')
        .select('*', { count: 'exact', head: true })
        .eq('student_id', studentId);
      
      if (error) throw error;
      return count || 0;
    }
  });

  const handleClick = () => {
    navigate('/teacher/assignments', { 
      state: { 
        studentId, 
        studentName: name,
        initialTab: 'view'  
      } 
    });
  };

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            variant="outline"
            size="sm"
            onClick={handleClick}
            className="relative"
          >
            <Clipboard className="h-4 w-4 mr-2" />
            <span>Assignments</span>
            {(assignmentsCount && assignmentsCount > 0) ? (
              <Badge 
                variant="secondary" 
                className="absolute -right-2 -top-2 px-1.5 min-w-5 h-5 flex items-center justify-center"
              >
                {assignmentsCount}
              </Badge>
            ) : null}
          </Button>
        </TooltipTrigger>
        <TooltipContent>
          <p>View and manage assignments</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
};

export default StudentAssignmentsButton;
