
import React, { useRef, useEffect } from 'react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Card } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Loader2, Mic, Check, Clock, BookOpen } from 'lucide-react';
import { format } from 'date-fns';
import { ConversationMessage } from '../../hooks/useVoiceConversation';
import { Badge } from '@/components/ui/badge';

interface ConversationDisplayProps {
  messages: ConversationMessage[];
  isLoading?: boolean;
  isTranscribing?: boolean;
  liveTranscript?: string;
  maxHeight?: string;
  activeVocabulary?: string[];
  highlightTopics?: boolean;
}

const ConversationDisplay: React.FC<ConversationDisplayProps> = ({
  messages,
  isLoading = false,
  isTranscribing = false,
  liveTranscript = '',
  maxHeight = '400px',
  activeVocabulary = [],
  highlightTopics = false
}) => {
  const scrollAreaRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom when messages change or during live transcription
  useEffect(() => {
    if (scrollAreaRef.current) {
      const scrollContainer = scrollAreaRef.current;
      scrollContainer.scrollTop = scrollContainer.scrollHeight;
    }
  }, [messages, liveTranscript]);

  // Highlight vocabulary words in message content
  const highlightVocabulary = (content: string) => {
    if (!highlightTopics || activeVocabulary.length === 0) {
      return <p className="text-sm whitespace-pre-wrap">{content}</p>;
    }

    // Simple word highlighting (could be enhanced with proper tokenization)
    const parts = [];
    let lastIndex = 0;
    
    // Create a regex pattern with word boundaries
    const pattern = new RegExp(`\\b(${activeVocabulary.join('|')})\\b`, 'gi');
    
    let match;
    while ((match = pattern.exec(content)) !== null) {
      if (match.index > lastIndex) {
        parts.push(<span key={`text-${lastIndex}`}>{content.substring(lastIndex, match.index)}</span>);
      }
      parts.push(
        <span 
          key={`highlight-${match.index}`} 
          className="bg-yellow-100 px-0.5 rounded"
        >
          {match[0]}
        </span>
      );
      lastIndex = match.index + match[0].length;
    }
    
    if (lastIndex < content.length) {
      parts.push(<span key={`text-${lastIndex}`}>{content.substring(lastIndex)}</span>);
    }
    
    return <p className="text-sm whitespace-pre-wrap">{parts}</p>;
  };

  if (messages.length === 0 && !isLoading && !isTranscribing) {
    return (
      <Card className="p-6 flex flex-col items-center justify-center text-center gap-4">
        <BookOpen className="h-8 w-8 text-muted-foreground opacity-50" />
        <div>
          <p className="text-muted-foreground">
            Your conversation will appear here. Start speaking to begin.
          </p>
          <p className="text-xs text-muted-foreground mt-1">
            The AI will respond to your speech and help you practice.
          </p>
        </div>
      </Card>
    );
  }

  return (
    <Card className="p-0 overflow-hidden">
      <ScrollArea ref={scrollAreaRef} style={{ maxHeight }} className="p-4">
        <div className="space-y-4">
          {messages.map((message, index) => (
            <div 
              key={index} 
              className={`flex gap-3 ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              {message.role === 'assistant' && (
                <Avatar className="h-8 w-8">
                  <AvatarImage src="/assistant-avatar.png" alt="AI" />
                  <AvatarFallback className="bg-blue-100 text-blue-500">AI</AvatarFallback>
                </Avatar>
              )}
              
              <div 
                className={`relative max-w-[80%] px-4 py-2 rounded-lg ${
                  message.role === 'user' 
                    ? 'bg-primary text-primary-foreground ml-4'
                    : 'bg-muted'
                }`}
              >
                {highlightVocabulary(message.content)}
                
                {message.timestamp && (
                  <div className="flex items-center gap-1 text-[10px] opacity-70 mt-1">
                    <Clock className="h-3 w-3" />
                    {format(new Date(message.timestamp), 'h:mm a')}
                  </div>
                )}
              </div>
              
              {message.role === 'user' && (
                <Avatar className="h-8 w-8">
                  <AvatarFallback className="bg-primary/20 text-primary">ME</AvatarFallback>
                </Avatar>
              )}
            </div>
          ))}
          
          {/* Live transcription */}
          {isTranscribing && liveTranscript && (
            <div className="flex justify-end gap-3">
              <div className="relative max-w-[80%] px-4 py-2 rounded-lg bg-primary/50 text-primary-foreground ml-4">
                <div className="flex items-center gap-2 mb-1">
                  <Mic className="h-3 w-3 animate-pulse" />
                  <span className="text-xs">Transcribing...</span>
                </div>
                <p className="text-sm whitespace-pre-wrap">{liveTranscript}</p>
              </div>
              
              <Avatar className="h-8 w-8">
                <AvatarFallback className="bg-primary/20 text-primary">ME</AvatarFallback>
              </Avatar>
            </div>
          )}
          
          {/* Used vocabulary badges */}
          {activeVocabulary.length > 0 && (
            <div className="border-t pt-2 mt-4">
              <p className="text-xs text-muted-foreground mb-1">Target vocabulary:</p>
              <div className="flex flex-wrap gap-1 mt-1">
                {activeVocabulary.map((word, i) => {
                  const isUsed = messages.some(m => 
                    m.role === 'user' && 
                    new RegExp(`\\b${word}\\b`, 'i').test(m.content)
                  );
                  
                  return (
                    <Badge 
                      key={i} 
                      variant={isUsed ? "default" : "outline"}
                      className={isUsed ? "bg-green-100 text-green-800 hover:bg-green-100" : ""}
                    >
                      {isUsed && <Check className="h-3 w-3 mr-1" />}
                      {word}
                    </Badge>
                  );
                })}
              </div>
            </div>
          )}
          
          {isLoading && (
            <div className="flex justify-center p-2">
              <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
            </div>
          )}
        </div>
      </ScrollArea>
    </Card>
  );
};

export default ConversationDisplay;
