
import { openai } from './config';

// Interface for transcrription
export interface TranscribeOptions {
  audioData: Uint8Array;
  model?: string;
  language?: string;
  promptBoost?: boolean;
  prompt?: string;
}

// Interface for chat completion
export interface ChatCompletionOptions {
  messages: { role: string; content: string }[];
  model?: string;
  temperature?: number;
  systemPrompt?: string;
}

// Interface for text-to-speech
export interface TextToSpeechOptions {
  text: string;
  voice?: 'nova' | 'alloy' | 'echo' | 'fable' | 'onyx' | 'shimmer' | 'ash' | 'coral' | 'sage';
  model?: string;
  speed?: number;
}

// Interface for streaming
export interface StreamingOptions {
  onTextReceived: (text: string, isFinal: boolean) => void;
  onAudioReceived: (audio: Uint8Array, isFinal: boolean) => void;
  onError: (error: Error) => void;
}

// Interface of response for transcrription
export interface TranscribeResponse {
  text: string;
  confidence: number;
  segments: string[];
}

// Interface of response for chat completion 
export interface ChatCompletionResponse {
  text: string;
  model: string;
  tokensUsed: number;
}

// Interface of response for text-to-speech
export interface TextToSpeechResponse {
  audioData: Uint8Array;
  format: string;
}

// Interface for streaming
export interface StreamingConversation {
  sendAudio: (audioData: Uint8Array, isFinal: boolean) => void;
  stopStream: () => void;
}

// Simulated Voice Service for browser environment
export class SimulatedVoiceService {
  async transcribe(options: TranscribeOptions): Promise<TranscribeResponse> {
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // Simulate transcription based on language
    let text = '';
    if (options.language === 'pt') {
      text = 'Olá, gostaria de praticar meu inglês.';
    } else {
      text = 'Hello, I would like to practice my English.';
    }
    
    return {
      text,
      confidence: 0.95,
      segments: [text]
    };
  }
  
  async chatCompletion(options: ChatCompletionOptions): Promise<ChatCompletionResponse> {
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    // Simulate response based on last content
    const lastMessage = options.messages[options.messages.length - 1];
    let responseText = '';
    
    if (lastMessage.content.toLowerCase().includes('praticar')) {
      responseText = 'Great! Let\'s practice your English. Tell me about your day or something you enjoy doing.';
    } else {
      responseText = 'I\'m here to help you practice English. What would you like to talk about today?';
    }
    
    return {
      text: responseText,
      model: options.model || 'simulated-gpt-4',
      tokensUsed: 150
    };
  }
  
  async textToSpeech(options: TextToSpeechOptions): Promise<TextToSpeechResponse> {
    await new Promise(resolve => setTimeout(resolve, 800));
    
    // Simulate audio data (empty array for simulation)
    return {
      audioData: new Uint8Array(100), // Simulated data
      format: 'mp3'
    };
  }
  
  async startStreamingConversation(options: StreamingOptions): Promise<StreamingConversation> {
    // Streaming simulation
    const { onTextReceived, onAudioReceived, onError } = options;
    
    const streamingObj: StreamingConversation = {
      sendAudio: async (audioData: Uint8Array, isFinal: boolean) => {
        try {
          // Simulate transcription
          await new Promise(resolve => setTimeout(resolve, 700));
          onTextReceived('Você disse: Olá, gostaria de praticar a pronúncia em inglês.', true);
          
          // Simulate processing
          await new Promise(resolve => setTimeout(resolve, 500));
          onTextReceived('Processando sua mensagem...', false);
          
          // Simulate response
          await new Promise(resolve => setTimeout(resolve, 1000));
          const response = 'That\'s great! I\'m here to help you practice English pronunciation. Let\'s start with some basic sentences. Repeat after me: "The weather is beautiful today."';
          onTextReceived(response, true);
          
          // Simulate response audio
          await new Promise(resolve => setTimeout(resolve, 800));
          onAudioReceived(new Uint8Array(100), true);
        } catch (error) {
          onError(error instanceof Error ? error : new Error('Error in streaming simulation'));
        }
      },
      stopStream: () => {
        // Nothing to do in simulation
        console.log('Simulated streaming ended');
      }
    };
    
    return streamingObj;
  }
}

// Direct OpenAI Voice Service for direct API calls (browser-compatible)
export class DirectOpenAIVoiceService {
  async transcribe(options: TranscribeOptions): Promise<TranscribeResponse> {
    try {
      // Create Blob from Uint8Array
      const audioBlob = new Blob([options.audioData], { type: 'audio/webm' });
      
      // Create File from Blob
      const audioFile = new File([audioBlob], 'audio.webm', { type: 'audio/webm' });
      
      // Call OpenAI API for transcription
      const response = await openai.audio.transcriptions.create({
        file: audioFile,
        model: options.model || 'whisper-1',
        language: options.language
      });
      
      return {
        text: response.text,
        confidence: 0.9, // API doesn't explicitly return confidence
        segments: [response.text] // API doesn't return segments
      };
    } catch (error) {
      console.error('Error in transcription with OpenAI:', error);
      throw error;
    }
  }
  
  async chatCompletion(options: ChatCompletionOptions): Promise<ChatCompletionResponse> {
    try {
      // Prepare messages
      const messages = [];
      
      // Add system prompt if available
      if (options.systemPrompt) {
        messages.push({
          role: 'system',
          content: options.systemPrompt
        });
      }
      
      // Add message history
      messages.push(...options.messages);
      
      // Call OpenAI API for chat
      const response = await openai.chat.completions.create({
        model: options.model || 'gpt-4',
        messages: messages,
        temperature: options.temperature || 0.7
      });
      
      return {
        text: response.choices[0]?.message?.content || '',
        model: response.model,
        tokensUsed: response.usage?.total_tokens || 0
      };
    } catch (error) {
      console.error('Error in chat completion with OpenAI:', error);
      throw error;
    }
  }
  
  async textToSpeech(options: TextToSpeechOptions): Promise<TextToSpeechResponse> {
    try {
      // Call OpenAI API for speech synthesis
      const response = await openai.audio.speech.create({
        model: options.model || 'tts-1',
        voice: options.voice || 'nova',
        input: options.text,
        speed: options.speed || 1.0
      });
      
      // Convert response to Uint8Array
      const buffer = await response.arrayBuffer();
      const audioData = new Uint8Array(buffer);
      
      return {
        audioData,
        format: 'mp3' // OpenAI API returns MP3 by default
      };
    } catch (error) {
      console.error('Error in text-to-speech with OpenAI:', error);
      throw error;
    }
  }
  
  // Streaming is not directly supported with OpenAI API without WebSockets
  async startStreamingConversation(options: StreamingOptions): Promise<StreamingConversation> {
    // This is a partial implementation that simulates streaming using regular calls
    let isActive = true;
    
    return {
      sendAudio: async (audioData: Uint8Array, isFinal: boolean) => {
        if (!isActive) return;
        
        try {
          // Transcribe audio
          const transcription = await this.transcribe({ audioData });
          options.onTextReceived(`Você disse: ${transcription.text}`, true);
          
          // Notify processing
          options.onTextReceived('Processando sua mensagem...', false);
          
          // Generate response
          const chatResponse = await this.chatCompletion({
            messages: [{ role: 'user', content: transcription.text }],
            systemPrompt: 'You are an English pronunciation assistant, responding in English in a simple and clear manner.'
          });
          
          // Send text response
          options.onTextReceived(chatResponse.text, true);
          
          // Generate response audio
          const speechResponse = await this.textToSpeech({
            text: chatResponse.text,
            voice: 'nova'
          });
          
          // Send audio
          options.onAudioReceived(speechResponse.audioData, true);
        } catch (error) {
          options.onError(error instanceof Error ? error : new Error('Error in processing'));
        }
      },
      stopStream: () => {
        isActive = false;
      }
    };
  }
}

// Create an edge function client to handle voice services
export class EdgeFunctionVoiceService {
  private baseUrl: string;
  
  constructor(baseUrl: string = window.location.origin) {
    this.baseUrl = baseUrl;
  }
  
  async transcribe(options: TranscribeOptions): Promise<TranscribeResponse> {
    try {
      const response = await fetch(`${this.baseUrl}/api/voice-transcribe`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          audioData: Array.from(options.audioData),
          model: options.model || 'whisper-1',
          language: options.language || 'en',
          promptBoost: options.promptBoost || false,
          prompt: options.prompt || '',
        }),
      });
      
      if (!response.ok) {
        throw new Error(`Server returned ${response.status}: ${await response.text()}`);
      }
      
      const result = await response.json();
      return result as TranscribeResponse;
    } catch (error) {
      console.error('Error in edge function transcription:', error);
      throw error;
    }
  }
  
  async chatCompletion(options: ChatCompletionOptions): Promise<ChatCompletionResponse> {
    try {
      const response = await fetch(`${this.baseUrl}/api/voice-chat`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          messages: options.messages,
          model: options.model || 'gpt-4',
          temperature: options.temperature || 0.7,
          systemPrompt: options.systemPrompt || '',
        }),
      });
      
      if (!response.ok) {
        throw new Error(`Server returned ${response.status}: ${await response.text()}`);
      }
      
      const result = await response.json();
      return result as ChatCompletionResponse;
    } catch (error) {
      console.error('Error in edge function chat completion:', error);
      throw error;
    }
  }
  
  async textToSpeech(options: TextToSpeechOptions): Promise<TextToSpeechResponse> {
    try {
      const response = await fetch(`${this.baseUrl}/api/voice-speech`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          text: options.text,
          voice: options.voice || 'nova',
          model: options.model || 'tts-1',
          speed: options.speed || 1.0,
        }),
      });
      
      if (!response.ok) {
        throw new Error(`Server returned ${response.status}: ${await response.text()}`);
      }
      
      const data = await response.json();
      
      // Convert base64 to Uint8Array
      const binaryString = atob(data.audioData);
      const bytes = new Uint8Array(binaryString.length);
      for (let i = 0; i < binaryString.length; i++) {
        bytes[i] = binaryString.charCodeAt(i);
      }
      
      return {
        audioData: bytes,
        format: data.format || 'mp3',
      };
    } catch (error) {
      console.error('Error in edge function text-to-speech:', error);
      throw error;
    }
  }
  
  async startStreamingConversation(options: StreamingOptions): Promise<StreamingConversation> {
    // Websocket for streaming
    let socket: WebSocket | null = null;
    let isActive = true;
    
    try {
      socket = new WebSocket(`${this.baseUrl.replace('http', 'ws')}/api/voice-streaming`);
      
      socket.onmessage = (event) => {
        if (!isActive) return;
        
        try {
          const data = JSON.parse(event.data);
          
          if (data.type === 'text') {
            options.onTextReceived(data.content, data.isFinal || false);
          } else if (data.type === 'audio') {
            // Convert base64 to Uint8Array
            const binaryString = atob(data.content);
            const bytes = new Uint8Array(binaryString.length);
            for (let i = 0; i < binaryString.length; i++) {
              bytes[i] = binaryString.charCodeAt(i);
            }
            
            options.onAudioReceived(bytes, data.isFinal || false);
          } else if (data.type === 'error') {
            options.onError(new Error(data.content));
          }
        } catch (error) {
          options.onError(error instanceof Error ? error : new Error('Error processing server message'));
        }
      };
      
      socket.onerror = (error) => {
        options.onError(new Error(`WebSocket error: ${error}`));
      };
      
      socket.onclose = () => {
        if (isActive) {
          options.onError(new Error('WebSocket connection closed unexpectedly'));
        }
      };
      
      // Wait for connection to establish
      await new Promise<void>((resolve, reject) => {
        if (!socket) return reject(new Error('Socket not initialized'));
        
        socket.onopen = () => resolve();
        socket.onerror = () => reject(new Error('Failed to establish WebSocket connection'));
      });
      
      return {
        sendAudio: (audioData: Uint8Array, isFinal: boolean) => {
          if (!isActive || !socket || socket.readyState !== WebSocket.OPEN) return;
          
          // Convert Uint8Array to base64
          let binary = '';
          const bytes = new Uint8Array(audioData);
          const len = bytes.byteLength;
          
          for (let i = 0; i < len; i++) {
            binary += String.fromCharCode(bytes[i]);
          }
          
          const base64 = btoa(binary);
          
          socket.send(JSON.stringify({
            type: 'audio',
            content: base64,
            isFinal,
          }));
        },
        stopStream: () => {
          isActive = false;
          if (socket && socket.readyState === WebSocket.OPEN) {
            socket.close();
          }
        },
      };
    } catch (error) {
      options.onError(error instanceof Error ? error : new Error('Failed to start streaming conversation'));
      
      // Return a no-op implementation
      return {
        sendAudio: () => {},
        stopStream: () => {},
      };
    }
  }
}
