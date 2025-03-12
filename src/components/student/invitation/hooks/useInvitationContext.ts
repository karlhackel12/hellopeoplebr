
import { create } from 'zustand';

interface InvitationState {
  invitationCode: string;
  studentEmail: string | null;
  teacherName: string | null;
  setInvitationData: (code: string, email: string, teacher: string) => void;
  clearInvitationData: () => void;
}

export const useInvitationContext = create<InvitationState>((set) => ({
  invitationCode: '',
  studentEmail: null,
  teacherName: null,
  setInvitationData: (code, email, teacher) => 
    set({ invitationCode: code, studentEmail: email, teacherName: teacher }),
  clearInvitationData: () => 
    set({ invitationCode: '', studentEmail: null, teacherName: null }),
}));

export const getStoredInvitationData = () => {
  const code = sessionStorage.getItem('invitationCode');
  const email = sessionStorage.getItem('invitedEmail');
  const teacher = sessionStorage.getItem('teacherName');
  return { code, email, teacher };
};

export const storeInvitationData = (code: string, email: string, teacher: string) => {
  sessionStorage.setItem('invitationCode', code);
  sessionStorage.setItem('invitedEmail', email);
  sessionStorage.setItem('teacherName', teacher);
};

export const clearStoredInvitationData = () => {
  sessionStorage.removeItem('invitationCode');
  sessionStorage.removeItem('invitedEmail');
  sessionStorage.removeItem('teacherName');
};
