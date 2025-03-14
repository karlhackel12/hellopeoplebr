
import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export interface ConversationMessage {
  role: 'user' | 'assistant';
  content: string;
  timestamp?: Date;
}

export const useVoiceConversation = (lessonId?: string, assignmentId?: string) => {
  const [messages, setMessages] = useState<ConversationMessage[]>([]);
  const [conversationId, setConversationId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [userId, setUserId] = useState<string | null>(null);
  const [analyticsData, setAnalyticsData] = useState<any>(null);

  // Get the current user
  useEffect(() => {
    const getUser = async () => {
      const { data } = await supabase.auth.getUser();
      if (data.user) {
        setUserId(data.user.id);
      }
    };
    
    getUser();
  }, []);

  // Initialize conversation
  const initConversation = useCallback(async (existingSessionId?: string) => {
    if (existingSessionId) {
      setConversationId(existingSessionId);
      
      // Fetch existing messages for this conversation
      try {
        const { data, error } = await supabase
          .from('conversation_messages')
          .select('*')
          .eq('conversation_id', existingSessionId)
          .order('created_at', { ascending: true });
          
        if (error) throw error;
        
        if (data) {
          const formattedMessages = data.map(msg => ({
            role: msg.role as 'user' | 'assistant',
            content: msg.content,
            timestamp: new Date(msg.created_at)
          }));
          
          setMessages(formattedMessages);
        }
      } catch (error) {
        console.error('Error fetching conversation messages:', error);
        toast.error('Failed to load conversation history');
      }
    } else {
      // Reset messages for a new conversation
      setMessages([]);
      setConversationId(null);
    }
  }, []);

  // Send message
  const sendMessage = async (userTranscript: string, topics: string[] = [], vocabulary: string[] = [], difficulty: number = 1) => {
    try {
      setIsLoading(true);
      
      // Add user message to local state immediately
      const userMessage: ConversationMessage = {
        role: 'user',
        content: userTranscript,
        timestamp: new Date()
      };
      
      setMessages(prev => [...prev, userMessage]);
      
      // Send to API
      const { data, error } = await supabase.functions.invoke('voice-conversation', {
        body: {
          userTranscript,
          conversationId,
          lessonTopics: topics,
          vocabularyItems: vocabulary,
          difficulty,
          userId,
          lessonId,
          assignmentId
        }
      });
      
      if (error) throw error;
      
      // Update conversation ID if this is a new conversation
      if (data.conversationId && !conversationId) {
        setConversationId(data.conversationId);
      }
      
      // Add AI response to local state
      const aiMessage: ConversationMessage = {
        role: 'assistant',
        content: data.response,
        timestamp: new Date()
      };
      
      setMessages(prev => [...prev, aiMessage]);
      
      return data;
    } catch (error) {
      console.error('Error sending message:', error);
      toast.error('Failed to process your message');
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  // End conversation
  const endConversation = async (confidenceScore?: number, lessonId?: string, assignmentId?: string) => {
    if (!conversationId || !userId) {
      toast.error('No active conversation to end');
      return false;
    }
    
    try {
      setIsLoading(true);
      
      const { data, error } = await supabase.functions.invoke('voice-conversation', {
        body: {
          conversationId,
          userId,
          markAsCompleted: true,
          confidenceScore,
          lessonId,
          assignmentId
        }
      });
      
      if (error) throw error;
      
      return true;
    } catch (error) {
      console.error('Error ending conversation:', error);
      toast.error('Failed to end conversation');
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  // Analyze conversation
  const analyzeConversation = async () => {
    if (!conversationId || messages.length < 2) {
      return null;
    }
    
    try {
      setIsLoading(true);
      
      // Construct transcript from messages
      const transcript = messages
        .map(msg => `${msg.role === 'user' ? 'Student' : 'AI'}: ${msg.content}`)
        .join('\n');
      
      // For now, return mock analytics
      const mockAnalytics = {
        vocabulary_count: messages.filter(m => m.role === 'user')
          .reduce((count, m) => count + new Set(m.content.split(/\s+/).filter(w => w.length > 3)).size, 0),
        user_speaking_time_seconds: messages.filter(m => m.role === 'user').length * 15,
        grammar_quality: 7.5,
        vocabulary_diversity: 6.8,
        fluency_score: 7.2
      };
      
      // In a real implementation, this would call a backend service
      setAnalyticsData(mockAnalytics);
      return mockAnalytics;
    } catch (error) {
      console.error('Error analyzing conversation:', error);
      return null;
    } finally {
      setIsLoading(false);
    }
  };

  return {
    messages,
    conversationId,
    isLoading,
    analyticsData,
    initConversation,
    sendMessage,
    endConversation,
    analyzeConversation
  };
};
