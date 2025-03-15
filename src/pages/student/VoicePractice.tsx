
import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const VoicePractice: React.FC = () => {
  const navigate = useNavigate();

  useEffect(() => {
    // Redirect to the construction page
    navigate('/student/voice-practice-construction');
  }, [navigate]);

  return null;
};

export default VoicePractice;
