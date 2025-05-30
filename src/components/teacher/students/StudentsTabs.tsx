import React from 'react';
import StudentsList from '@/components/teacher/students/StudentsList';
import StudentInviteForm from '@/components/teacher/StudentInviteForm';
import InvitationsList from '@/components/teacher/InvitationsList';
import { useIsMobile } from '@/hooks/use-mobile';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Info } from 'lucide-react';
interface StudentsTabsProps {
  studentsWithOnboarding: any[];
  loadingStudents: boolean;
  loadingOnboarding: boolean;
  refetchStudents: () => void;
  invitations: any[];
  loadingInvitations: boolean;
  isRefetchingInvitations: boolean;
  handleInvitationUpdate: () => void;
}
const StudentsTabs: React.FC<StudentsTabsProps> = ({
  studentsWithOnboarding,
  loadingStudents,
  loadingOnboarding,
  refetchStudents,
  invitations,
  loadingInvitations,
  isRefetchingInvitations,
  handleInvitationUpdate
}) => {
  const isMobile = useIsMobile();
  const pendingInvitations = invitations.filter(inv => inv.status !== 'accepted');
  return <div className="space-y-8">
      {/* Informação geral sobre gerenciamento de alunos */}
      
      
      {/* Formulário de convite por código */}
      <div className="bg-card rounded-lg p-4 sm:p-6 shadow-sm">
        <h2 className="text-xl font-semibold mb-4">Convidar Novos Alunos</h2>
        <StudentInviteForm onSuccess={handleInvitationUpdate} />
      </div>
      
      {/* Lista de alunos ativos */}
      <div className="bg-card rounded-lg p-4 sm:p-6 shadow-sm">
        <h2 className="text-xl font-semibold mb-4">Alunos Ativos</h2>
        <StudentsList students={studentsWithOnboarding} loading={loadingStudents || loadingOnboarding} onUpdate={refetchStudents} />
      </div>
      
      {/* Lista de convites pendentes */}
      <div className="bg-card rounded-lg p-4 sm:p-6 shadow-sm">
        <h2 className="text-xl font-semibold mb-4">
          Convites Pendentes
          {pendingInvitations.length > 0 && <span className="ml-2 inline-flex items-center justify-center px-2 py-1 text-xs font-bold leading-none text-white bg-primary rounded">
              {pendingInvitations.length}
            </span>}
        </h2>
        <InvitationsList invitations={pendingInvitations} loading={loadingInvitations || isRefetchingInvitations} onUpdate={handleInvitationUpdate} />
      </div>
    </div>;
};
export default StudentsTabs;