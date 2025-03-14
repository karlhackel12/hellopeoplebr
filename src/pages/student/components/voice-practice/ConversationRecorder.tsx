
import React, { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Mic, Square, Loader2, Volume2, MessageCircle } from 'lucide-react';
import { toast } from 'sonner';

interface ConversationRecorderProps {
  isRecording: boolean;
  onStartRecording: () => void;
  onStopRecording: (audioBlob: Blob, transcript: string) => void;
  onTranscriptChange?: (transcript: string) => void;
  maxDurationSeconds?: number;
  isDisabled?: boolean;
  isWaitingForResponse?: boolean;
}

const ConversationRecorder: React.FC<ConversationRecorderProps> = ({
  isRecording,
  onStartRecording,
  onStopRecording,
  onTranscriptChange,
  maxDurationSeconds = 60,
  isDisabled = false,
  isWaitingForResponse = false
}) => {
  const [recordingTime, setRecordingTime] = useState(0);
  const [audioLevel, setAudioLevel] = useState(0);
  const [transcript, setTranscript] = useState('');
  const [isProcessingTranscript, setIsProcessingTranscript] = useState(false);
  
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const timerRef = useRef<number | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);

  // Setup recorder
  const setupRecorder = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;
      
      // Set up audio analyzer for visualizing audio levels
      const audioContext = new AudioContext();
      audioContextRef.current = audioContext;
      const analyser = audioContext.createAnalyser();
      analyserRef.current = analyser;
      analyser.fftSize = 256;
      
      const source = audioContext.createMediaStreamSource(stream);
      source.connect(analyser);
      
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      
      mediaRecorder.ondataavailable = (e) => {
        if (e.data.size > 0) {
          audioChunksRef.current.push(e.data);
        }
      };
      
      mediaRecorder.onstop = async () => {
        setIsProcessingTranscript(true);
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
        
        try {
          // Here we would normally send the audio to a speech-to-text service
          // For demo purposes, we'll use a mock transcript
          const mockTranscript = generateMockTranscript();
          setTranscript(mockTranscript);
          
          // In a real implementation, you would do something like:
          // const transcriptResult = await convertSpeechToText(audioBlob);
          // setTranscript(transcriptResult);
          
          if (onTranscriptChange) {
            onTranscriptChange(mockTranscript);
          }
          
          onStopRecording(audioBlob, mockTranscript);
        } catch (error) {
          console.error('Error processing audio:', error);
          toast.error('Failed to process your speech');
        } finally {
          setIsProcessingTranscript(false);
        }
        
        audioChunksRef.current = [];
      };
      
      return true;
    } catch (error) {
      console.error('Error accessing microphone:', error);
      toast.error('Could not access microphone. Please check permissions.');
      return false;
    }
  };

  // Start recording
  const startRecording = async () => {
    if (isDisabled || isWaitingForResponse) return;
    
    setTranscript('');
    audioChunksRef.current = [];
    const setupSuccess = await setupRecorder();
    
    if (!setupSuccess) return;
    
    if (mediaRecorderRef.current) {
      mediaRecorderRef.current.start(100);
      setRecordingTime(0);
      
      // Start timer
      timerRef.current = window.setInterval(() => {
        setRecordingTime((prevTime) => {
          if (prevTime >= maxDurationSeconds) {
            stopRecording();
            return maxDurationSeconds;
          }
          return prevTime + 1;
        });
      }, 1000);
      
      // Start audio level visualization
      visualizeAudio();
      
      onStartRecording();
    }
  };

  // Stop recording
  const stopRecording = () => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
      mediaRecorderRef.current.stop();
    }
    
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
    
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
    
    if (audioContextRef.current) {
      audioContextRef.current.close();
      audioContextRef.current = null;
      analyserRef.current = null;
    }
  };

  // Visualize audio levels
  const visualizeAudio = () => {
    if (!analyserRef.current) return;
    
    const dataArray = new Uint8Array(analyserRef.current.frequencyBinCount);
    
    const updateAudioLevel = () => {
      if (!analyserRef.current) return;
      
      analyserRef.current.getByteFrequencyData(dataArray);
      const average = dataArray.reduce((acc, val) => acc + val, 0) / dataArray.length;
      setAudioLevel(Math.min(100, (average / 256) * 200)); // Scale to 0-100 with boost
      
      if (analyserRef.current) {
        requestAnimationFrame(updateAudioLevel);
      }
    };
    
    updateAudioLevel();
  };

  // Mock function to generate transcript for demo purposes
  const generateMockTranscript = () => {
    const phrases = [
      "Hello, I'm learning English and I'd like to practice my speaking skills.",
      "I think the weather is really nice today. It's sunny and warm.",
      "I recently read an interesting book about artificial intelligence.",
      "I'm planning to travel to New York next month for vacation.",
      "Could you tell me more about this topic? I find it fascinating.",
      "I'm having a bit of trouble understanding this grammar concept.",
      "I enjoy listening to music and watching movies in English.",
      "I've been studying English for about three years now.",
      "What do you think about the importance of practicing conversation skills?",
      "I'd like to improve my pronunciation and vocabulary."
    ];
    return phrases[Math.floor(Math.random() * phrases.length)];
  };

  // Clean up on unmount
  useEffect(() => {
    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
      
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
      }
      
      if (audioContextRef.current) {
        audioContextRef.current.close();
      }
    };
  }, []);

  return (
    <Card className="w-full">
      <CardContent className="pt-6">
        <div className="flex flex-col items-center gap-4">
          <div className="relative">
            <div 
              className={`flex items-center justify-center h-24 w-24 rounded-full transition-all duration-200 ${
                isRecording ? 'bg-red-500/10 shadow-lg' : 
                isWaitingForResponse ? 'bg-blue-500/10 shadow-lg' : 'bg-slate-100'
              }`}
            >
              {isRecording ? (
                <>
                  <div 
                    className="absolute inset-0 rounded-full opacity-40 transition-transform"
                    style={{ 
                      transform: `scale(${1 + audioLevel/100})`,
                      background: 'radial-gradient(circle, rgba(239,68,68,0.3) 0%, rgba(239,68,68,0) 70%)'
                    }}
                  />
                  <Square 
                    className="h-10 w-10 text-red-600 cursor-pointer" 
                    onClick={stopRecording}
                  />
                </>
              ) : isWaitingForResponse ? (
                <Loader2 className="h-10 w-10 text-blue-500 animate-spin" />
              ) : (
                <Mic 
                  className={`h-10 w-10 ${isDisabled ? 'text-slate-400' : 'text-slate-600 cursor-pointer'}`} 
                  onClick={isDisabled ? undefined : startRecording}
                />
              )}
            </div>
            
            {isRecording && (
              <Badge 
                variant="destructive" 
                className="absolute -bottom-1 left-1/2 transform -translate-x-1/2 animate-pulse"
              >
                Recording
              </Badge>
            )}
            
            {isWaitingForResponse && (
              <Badge 
                variant="secondary" 
                className="absolute -bottom-1 left-1/2 transform -translate-x-1/2 animate-pulse"
              >
                Processing
              </Badge>
            )}
          </div>
          
          <div className="text-center">
            {isRecording ? (
              <div className="flex items-center gap-3">
                <Volume2 className={`h-4 w-4 ${audioLevel > 50 ? 'text-red-500' : 'text-blue-500'}`} />
                <div className="w-40 h-2 bg-slate-200 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-gradient-to-r from-blue-500 to-purple-500 transition-all duration-100"
                    style={{ width: `${audioLevel}%` }}
                  />
                </div>
                <span className="font-mono text-sm">{Math.floor(recordingTime / 60)}:{(recordingTime % 60).toString().padStart(2, '0')}</span>
              </div>
            ) : isProcessingTranscript ? (
              <p className="text-muted-foreground text-sm">Processing your speech...</p>
            ) : isWaitingForResponse ? (
              <p className="text-muted-foreground text-sm">Waiting for response...</p>
            ) : (
              <p className="text-muted-foreground text-sm">{isDisabled ? 'Microphone disabled' : 'Tap the microphone to start speaking'}</p>
            )}
          </div>
          
          {transcript && !isRecording && !isWaitingForResponse && (
            <div className="w-full p-3 bg-slate-50 rounded-md border text-sm">
              <div className="flex items-start gap-2">
                <MessageCircle className="h-4 w-4 text-slate-400 mt-0.5" />
                <p className="text-slate-700">{transcript}</p>
              </div>
            </div>
          )}
          
          <Button
            variant={isRecording ? "destructive" : "default"}
            className="w-full"
            onClick={isRecording ? stopRecording : startRecording}
            disabled={isDisabled || isWaitingForResponse || isProcessingTranscript}
          >
            {isRecording ? 'Stop Recording' : 'Start Speaking'}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default ConversationRecorder;
