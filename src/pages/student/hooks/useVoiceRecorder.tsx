
import { useState, useEffect, useRef, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';

const useVoiceRecorder = () => {
  const [isRecording, setIsRecording] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [audioLevel, setAudioLevel] = useState(0);
  const [hasRecordingPermission, setHasRecordingPermission] = useState(false);
  
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const volumeDataArrayRef = useRef<Uint8Array | null>(null);
  const animationFrameRef = useRef<number | null>(null);
  
  // Check for recording permission
  useEffect(() => {
    const checkPermission = async () => {
      try {
        const permissionStatus = await navigator.permissions.query({ name: 'microphone' as PermissionName });
        setHasRecordingPermission(permissionStatus.state === 'granted');
        
        permissionStatus.onchange = () => {
          setHasRecordingPermission(permissionStatus.state === 'granted');
        };
      } catch (error) {
        console.log('Permission API not supported, will check on recording');
      }
    };
    
    checkPermission();
    
    return () => {
      if (audioContextRef.current) {
        audioContextRef.current.close();
      }
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, []);
  
  const requestPermission = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      stream.getTracks().forEach(track => track.stop());
      setHasRecordingPermission(true);
      return true;
    } catch (error) {
      console.error('Error requesting microphone permission:', error);
      setHasRecordingPermission(false);
      return false;
    }
  };
  
  const updateAudioLevel = useCallback(() => {
    if (!analyserRef.current || !volumeDataArrayRef.current) return;
    
    analyserRef.current.getByteFrequencyData(volumeDataArrayRef.current);
    
    // Calculate average volume
    let sum = 0;
    for (let i = 0; i < volumeDataArrayRef.current.length; i++) {
      sum += volumeDataArrayRef.current[i];
    }
    const average = sum / volumeDataArrayRef.current.length;
    
    // Normalize to 0-1 range
    const normalizedValue = Math.min(average / 128, 1);
    setAudioLevel(normalizedValue);
    
    animationFrameRef.current = requestAnimationFrame(updateAudioLevel);
  }, []);
  
  const startRecording = async () => {
    try {
      audioChunksRef.current = [];
      
      const stream = await navigator.mediaDevices.getUserMedia({ 
        audio: { 
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true
        } 
      });
      
      // Set up audio context for level monitoring
      audioContextRef.current = new AudioContext();
      const source = audioContextRef.current.createMediaStreamSource(stream);
      analyserRef.current = audioContextRef.current.createAnalyser();
      analyserRef.current.fftSize = 256;
      source.connect(analyserRef.current);
      
      volumeDataArrayRef.current = new Uint8Array(analyserRef.current.frequencyBinCount);
      
      // Start monitoring audio levels
      updateAudioLevel();
      
      // Set up media recorder
      mediaRecorderRef.current = new MediaRecorder(stream);
      
      mediaRecorderRef.current.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };
      
      mediaRecorderRef.current.onstop = async () => {
        if (audioChunksRef.current.length === 0) return;
        
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
        
        try {
          // Convert to base64
          const reader = new FileReader();
          reader.readAsDataURL(audioBlob);
          reader.onloadend = async () => {
            const base64Audio = reader.result?.toString().split(',')[1];
            
            if (!base64Audio) return;
            
            // Call Supabase Edge Function for transcription
            const { data, error } = await supabase.functions.invoke('voice-transcription', {
              body: { audio: base64Audio }
            });
            
            if (error) {
              console.error('Transcription error:', error);
              return;
            }
            
            if (data?.text) {
              setTranscript(data.text);
            }
          };
        } catch (error) {
          console.error('Error converting or sending audio:', error);
        } finally {
          // Stop tracks
          stream.getTracks().forEach(track => track.stop());
          
          // Clean up audio context
          if (audioContextRef.current) {
            audioContextRef.current.close();
            audioContextRef.current = null;
          }
          
          // Stop animation frame
          if (animationFrameRef.current) {
            cancelAnimationFrame(animationFrameRef.current);
            animationFrameRef.current = null;
          }
        }
      };
      
      mediaRecorderRef.current.start();
      setIsRecording(true);
      setHasRecordingPermission(true);
    } catch (error) {
      console.error('Error starting recording:', error);
      setHasRecordingPermission(false);
    }
  };
  
  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      setAudioLevel(0);
    }
  };
  
  const clearTranscript = () => {
    setTranscript('');
  };
  
  return {
    isRecording,
    startRecording,
    stopRecording,
    transcript,
    clearTranscript,
    audioLevel,
    hasRecordingPermission,
    requestPermission
  };
};

export default useVoiceRecorder;
