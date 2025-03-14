
import { useState, useCallback, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { useUser } from './spaced-repetition/useUser';

export interface ConversationMessage {
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp?: string;
}

export const useVoiceConversation = (lessonId?: string) => {
  const { userId } = useUser();
  const [messages, setMessages] = useState<ConversationMessage[]>([]);
  const [conversationId, setConversationId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analyticsData, setAnalyticsData] = useState<any>(null);

  // Subscribe to real-time updates for conversation messages
  useEffect(() => {
    if (!conversationId) return;
    
    const channel = supabase
      .channel(`conversation-${conversationId}`)
      .on('postgres_changes', {
        event: 'INSERT',
        schema: 'public',
        table: 'conversation_messages',
        filter: `conversation_id=eq.${conversationId}`
      }, (payload) => {
        const newMessage = {
          role: payload.new.role as 'user' | 'assistant' | 'system',
          content: payload.new.content,
          timestamp: payload.new.created_at
        };
        
        // Only add the message if it's not already in the array
        setMessages(prev => {
          if (prev.findIndex(msg => 
              msg.role === newMessage.role && 
              msg.content === newMessage.content &&
              msg.timestamp === newMessage.timestamp) === -1) {
            return [...prev, newMessage];
          }
          return prev;
        });
      })
      .subscribe();
      
    return () => {
      supabase.removeChannel(channel);
    };
  }, [conversationId]);

  // Initialize or load an existing conversation
  const initConversation = useCallback(async (existingConversationId?: string) => {
    if (!userId) {
      toast.error('Please sign in to use the conversation feature');
      return false;
    }

    setIsLoading(true);
    try {
      if (existingConversationId) {
        // Load existing conversation
        const { data, error } = await supabase
          .from('conversation_messages')
          .select('role, content, created_at')
          .eq('conversation_id', existingConversationId)
          .order('created_at', { ascending: true });
        
        if (error) throw error;
        
        if (data) {
          setMessages(data.map(msg => ({
            role: msg.role as 'user' | 'assistant' | 'system',
            content: msg.content,
            timestamp: msg.created_at
          })));
          setConversationId(existingConversationId);
        }
      } else {
        // New conversation
        setMessages([]);
        setConversationId(null);
      }
      return true;
    } catch (error) {
      console.error('Error initializing conversation:', error);
      toast.error('Failed to load the conversation');
      return false;
    } finally {
      setIsLoading(false);
    }
  }, [userId]);

  // Send message to AI
  const sendMessage = useCallback(async (
    userTranscript: string, 
    lessonTopics: string[] = [], 
    vocabularyItems: string[] = [],
    difficulty: number = 1
  ) => {
    if (!userId) {
      toast.error('Please sign in to use the conversation feature');
      return null;
    }

    setIsLoading(true);
    try {
      // Add user message to local state immediately for UI responsiveness
      const userMessageTimestamp = new Date().toISOString();
      setMessages(prev => [
        ...prev, 
        { 
          role: 'user', 
          content: userTranscript,
          timestamp: userMessageTimestamp
        }
      ]);

      // Call the edge function
      const { data, error } = await supabase.functions.invoke('voice-conversation', {
        body: {
          userTranscript,
          conversationId,
          lessonTopics,
          vocabularyItems,
          difficulty,
          userId
        }
      });

      if (error) throw error;
      
      // Set the conversation ID if it's a new conversation
      if (data?.conversationId && !conversationId) {
        setConversationId(data.conversationId);
      }

      // Add AI response to local state
      if (data?.response) {
        const aiResponseTimestamp = new Date().toISOString();
        setMessages(prev => [
          ...prev, 
          { 
            role: 'assistant', 
            content: data.response,
            timestamp: aiResponseTimestamp
          }
        ]);
      }

      return data;
    } catch (error) {
      console.error('Error sending message:', error);
      toast.error('Failed to send message');
      return null;
    } finally {
      setIsLoading(false);
    }
  }, [userId, conversationId]);

  // Analyze conversation for performance metrics
  const analyzeConversation = useCallback(async () => {
    if (!conversationId || !userId) return null;
    
    setIsAnalyzing(true);
    try {
      // Call the analytics function
      const { data, error } = await supabase.functions.invoke('analyze-conversation', {
        body: {
          conversationId,
          userId
        }
      });
      
      if (error) throw error;
      
      setAnalyticsData(data);
      return data;
    } catch (error) {
      console.error('Error analyzing conversation:', error);
      return null;
    } finally {
      setIsAnalyzing(false);
    }
  }, [conversationId, userId]);

  // End the conversation and update stats
  const endConversation = useCallback(async (confidenceScore?: number) => {
    if (!conversationId || !userId) return false;
    
    try {
      // Analyze conversation first
      await analyzeConversation();
      
      // Update conversation session
      const { error } = await supabase
        .from('conversation_sessions')
        .update({
          completed_at: new Date().toISOString(),
          speaking_confidence: confidenceScore || null
        })
        .eq('id', conversationId)
        .eq('user_id', userId);
      
      if (error) throw error;
      
      return true;
    } catch (error) {
      console.error('Error ending conversation:', error);
      toast.error('Failed to save conversation data');
      return false;
    }
  }, [conversationId, userId, analyzeConversation]);

  return {
    messages,
    conversationId,
    isLoading,
    isAnalyzing,
    analyticsData,
    initConversation,
    sendMessage,
    analyzeConversation,
    endConversation
  };
};
