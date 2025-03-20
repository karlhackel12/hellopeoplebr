
import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const VoicePracticeSession: React.FC = () => {
  const navigate = useNavigate();

  useEffect(() => {
    // Redirecionar para a página em construção
    navigate('/student/voice-practice-construction');
  }, [navigate]);

  return null;
};

export default VoicePracticeSession;
