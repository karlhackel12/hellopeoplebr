
import React, { useRef, useEffect } from 'react';
import { Mic, MicOff } from 'lucide-react';
import { Button } from '@/components/ui/button';
import VoiceWaveform from './VoiceWaveform';
import { cn } from '@/lib/utils';

interface Message {
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

interface ConversationPanelProps {
  messages: Message[];
  transcript: string;
  isRecording: boolean;
  isSpeaking: boolean;
  audioLevel: number;
  isComplete: boolean;
  toggleRecording: () => void;
  onComplete: () => void;
}

const ConversationPanel: React.FC<ConversationPanelProps> = ({
  messages,
  transcript,
  isRecording,
  isSpeaking,
  audioLevel,
  isComplete,
  toggleRecording,
  onComplete,
}) => {
  const chatContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
    }
  }, [messages, transcript]);

  return (
    <div className="flex flex-col h-full">
      <div 
        ref={chatContainerRef}
        className="flex-1 p-4 overflow-y-auto bg-gray-50"
      >
        <div className="flex flex-col space-y-4">
          {messages.map((message, index) => (
            <div
              key={index}
              className={cn(
                "flex", 
                message.role === 'user' ? "justify-end" : "justify-start"
              )}
            >
              <div
                className={cn(
                  "max-w-[85%] rounded-xl px-4 py-2.5", 
                  message.role === 'user'
                    ? "bg-orange-500 text-white rounded-tr-none"
                    : "bg-white shadow-sm text-gray-800 rounded-tl-none border"
                )}
              >
                {message.role === 'assistant' && (
                  <div className="flex items-center gap-1.5 mb-1 text-xs opacity-70">
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-3 w-3 text-orange-500"><polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"></polygon><path d="M15.54 8.46a5 5 0 0 1 0 7.07"></path><path d="M19.07 4.93a10 10 0 0 1 0 14.14"></path></svg>
                    Assistente IA
                  </div>
                )}
                <p>{message.content}</p>
                <p className="text-xs opacity-70 mt-1 text-right">
                  {message.timestamp.toLocaleTimeString([], { 
                    hour: '2-digit', 
                    minute: '2-digit' 
                  })}
                </p>
              </div>
            </div>
          ))}
          
          {transcript && (
            <div className="flex justify-end">
              <div className="max-w-[85%] rounded-xl px-4 py-2.5 bg-orange-500 bg-opacity-50 text-white rounded-tr-none animate-pulse">
                <p>{transcript}</p>
              </div>
            </div>
          )}
        </div>
      </div>
      
      <div className="border-t p-3 bg-white shadow-sm">
        {isComplete ? (
          <div className="w-full flex flex-col items-center justify-center py-4">
            <p className="text-center mb-4">
              Esta sessão de prática foi concluída.
            </p>
            <Button 
              onClick={onComplete}
              className="bg-orange-500 hover:bg-orange-600"
            >
              Retornar à Central de Prática
            </Button>
          </div>
        ) : (
          <div className="flex flex-col w-full gap-2">
            <div className="flex items-center gap-2 p-2 bg-gray-50 rounded-lg">
              <div className="flex-1 relative">
                <VoiceWaveform 
                  audioLevel={audioLevel} 
                  isActive={isRecording || isSpeaking} 
                  className="h-10"
                  color="orange"
                />
                {isRecording && (
                  <div className="absolute top-1 left-3">
                    <span className="inline-block h-2 w-2 bg-red-500 rounded-full animate-pulse mr-1"></span>
                    <span className="text-xs text-gray-600">Gravando...</span>
                  </div>
                )}
                {isSpeaking && (
                  <div className="absolute top-1 left-3">
                    <span className="inline-block h-2 w-2 bg-orange-500 rounded-full animate-pulse mr-1"></span>
                    <span className="text-xs text-gray-600">IA Falando...</span>
                  </div>
                )}
              </div>
              <Button
                variant={isRecording ? "destructive" : "default"}
                size="icon"
                className={isRecording ? "" : "bg-orange-500 hover:bg-orange-600"}
                onClick={toggleRecording}
                disabled={isSpeaking}
              >
                {isRecording ? <MicOff className="h-5 w-5" /> : <Mic className="h-5 w-5" />}
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ConversationPanel;
