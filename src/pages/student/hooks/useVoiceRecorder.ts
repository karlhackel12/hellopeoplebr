import { useState, useCallback, useRef } from 'react';

type UseVoiceRecorderProps = {
  onAudioReady?: (blob: Blob) => void;
  onError?: (error: Error) => void;
};

type UseVoiceRecorderReturn = {
  isRecording: boolean;
  startRecording: () => Promise<void>;
  stopRecording: () => void;
  error: Error | null;
  audioBlob: Blob | null;
};

/**
 * Hook para gerenciar a gravação de voz
 */
export const useVoiceRecorder = ({
  onAudioReady,
  onError
}: UseVoiceRecorderProps = {}): UseVoiceRecorderReturn => {
  const [isRecording, setIsRecording] = useState(false);
  const [audioBlob, setAudioBlob] = useState<Blob | null>(null);
  const [error, setError] = useState<Error | null>(null);
  
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  
  const startRecording = useCallback(async () => {
    audioChunksRef.current = [];
    setError(null);
    
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      
      mediaRecorderRef.current = new MediaRecorder(stream);
      
      mediaRecorderRef.current.addEventListener('dataavailable', (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      });
      
      mediaRecorderRef.current.addEventListener('stop', () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
        setAudioBlob(audioBlob);
        
        if (onAudioReady) {
          onAudioReady(audioBlob);
        }
        
        // Encerra as faixas de áudio para liberar o microfone
        stream.getTracks().forEach(track => track.stop());
      });
      
      mediaRecorderRef.current.start();
      setIsRecording(true);
    } catch (err) {
      const recordingError = err instanceof Error ? err : new Error('Erro ao iniciar gravação');
      setError(recordingError);
      
      if (onError) {
        onError(recordingError);
      }
    }
  }, [onAudioReady, onError]);
  
  const stopRecording = useCallback(() => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
    }
  }, [isRecording]);
  
  return {
    isRecording,
    startRecording,
    stopRecording,
    error,
    audioBlob
  };
};

export default useVoiceRecorder; 