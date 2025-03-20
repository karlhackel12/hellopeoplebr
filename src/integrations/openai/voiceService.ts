
import { config } from 'dotenv';
import * as grpc from '@grpc/grpc-js';
import * as protoLoader from '@grpc/proto-loader';
import path from 'path';
import { openai } from './config';

// Carrega as variáveis de ambiente
config();

// Configuração do servidor gRPC
const GRPC_SERVER_PORT = process.env.GRPC_SERVER_PORT || '50051';
const GRPC_SERVER_HOST = process.env.GRPC_SERVER_HOST || 'localhost';
const USE_SIMULATION = process.env.USE_SIMULATION === 'true' || false;

// Interface para transcrição
interface TranscribeOptions {
  audioData: Uint8Array;
  model?: string;
  language?: string;
  promptBoost?: boolean;
  prompt?: string;
}

// Interface para chat completion
interface ChatCompletionOptions {
  messages: { role: string; content: string }[];
  model?: string;
  temperature?: number;
  systemPrompt?: string;
}

// Interface para text-to-speech
interface TextToSpeechOptions {
  text: string;
  voice?: string;
  model?: string;
  speed?: number;
}

// Interface para streaming
interface StreamingOptions {
  onTextReceived: (text: string, isFinal: boolean) => void;
  onAudioReceived: (audio: Uint8Array, isFinal: boolean) => void;
  onError: (error: Error) => void;
}

// Interface de resposta para transcrição
interface TranscribeResponse {
  text: string;
  confidence: number;
  segments: string[];
}

// Interface de resposta para chat completion
interface ChatCompletionResponse {
  text: string;
  model: string;
  tokensUsed: number;
}

// Interface de resposta para text-to-speech
interface TextToSpeechResponse {
  audioData: Uint8Array;
  format: string;
}

// Interface para o streaming
interface StreamingConversation {
  sendAudio: (audioData: Uint8Array, isFinal: boolean) => void;
  stopStream: () => void;
}

// Implementação do serviço com simulação
class SimulatedVoiceService {
  async transcribe(options: TranscribeOptions): Promise<TranscribeResponse> {
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // Simula a transcrição com base no idioma
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
    
    // Simula a resposta com base no último conteúdo
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
    
    // Simula dados de áudio (array vazio para simulação)
    return {
      audioData: new Uint8Array(100), // Dados simulados
      format: 'mp3'
    };
  }
  
  async startStreamingConversation(options: StreamingOptions): Promise<StreamingConversation> {
    // Simulação de streaming
    const { onTextReceived, onAudioReceived, onError } = options;
    
    const streamingObj: StreamingConversation = {
      sendAudio: async (audioData: Uint8Array, isFinal: boolean) => {
        try {
          // Simular transcrição
          await new Promise(resolve => setTimeout(resolve, 700));
          onTextReceived('Você disse: Olá, gostaria de praticar a pronúncia em inglês.', true);
          
          // Simular processamento
          await new Promise(resolve => setTimeout(resolve, 500));
          onTextReceived('Processando sua mensagem...', false);
          
          // Simular resposta
          await new Promise(resolve => setTimeout(resolve, 1000));
          const response = 'That\'s great! I\'m here to help you practice English pronunciation. Let\'s start with some basic sentences. Repeat after me: "The weather is beautiful today."';
          onTextReceived(response, true);
          
          // Simular áudio de resposta
          await new Promise(resolve => setTimeout(resolve, 800));
          onAudioReceived(new Uint8Array(100), true);
        } catch (error) {
          onError(error instanceof Error ? error : new Error('Erro na simulação de streaming'));
        }
      },
      stopStream: () => {
        // Nada a fazer na simulação
        console.log('Streaming simulado encerrado');
      }
    };
    
    return streamingObj;
  }
}

// Implementação do serviço com gRPC
class GrpcVoiceService {
  private client: any;
  private protoDefinition: any;
  
  constructor() {
    try {
      // Carregar o arquivo proto
      const PROTO_PATH = path.resolve(process.cwd(), 'src/integrations/openai/voiceApi.proto');
      
      const packageDefinition = protoLoader.loadSync(PROTO_PATH, {
        keepCase: true,
        longs: String,
        enums: String,
        defaults: true,
        oneofs: true
      });
      
      this.protoDefinition = grpc.loadPackageDefinition(packageDefinition).openai.voice;
      
      // Criar cliente gRPC
      this.client = new this.protoDefinition.VoiceService(
        `${GRPC_SERVER_HOST}:${GRPC_SERVER_PORT}`,
        grpc.credentials.createInsecure()
      );
      
      console.log(`Cliente gRPC conectado a ${GRPC_SERVER_HOST}:${GRPC_SERVER_PORT}`);
    } catch (error) {
      console.error('Erro ao inicializar cliente gRPC:', error);
      throw new Error('Não foi possível inicializar o serviço de voz');
    }
  }
  
  async transcribe(options: TranscribeOptions): Promise<TranscribeResponse> {
    return new Promise((resolve, reject) => {
      this.client.Transcribe({
        audio_data: options.audioData,
        model: options.model || 'whisper-1',
        language: options.language || '',
        prompt_boost: options.promptBoost || false,
        prompt: options.prompt || ''
      }, (error: Error, response: any) => {
        if (error) {
          reject(error);
          return;
        }
        
        resolve({
          text: response.text,
          confidence: response.confidence,
          segments: response.segments || []
        });
      });
    });
  }
  
  async chatCompletion(options: ChatCompletionOptions): Promise<ChatCompletionResponse> {
    return new Promise((resolve, reject) => {
      this.client.ChatCompletion({
        messages: options.messages.map(msg => ({
          role: msg.role,
          content: msg.content
        })),
        model: options.model || 'gpt-4',
        temperature: options.temperature || 0.7,
        system_prompt: options.systemPrompt || ''
      }, (error: Error, response: any) => {
        if (error) {
          reject(error);
          return;
        }
        
        resolve({
          text: response.text,
          model: response.model,
          tokensUsed: response.tokens_used
        });
      });
    });
  }
  
  async textToSpeech(options: TextToSpeechOptions): Promise<TextToSpeechResponse> {
    return new Promise((resolve, reject) => {
      this.client.TextToSpeech({
        text: options.text,
        voice: options.voice || 'nova',
        model: options.model || 'tts-1',
        speed: options.speed || 1.0
      }, (error: Error, response: any) => {
        if (error) {
          reject(error);
          return;
        }
        
        resolve({
          audioData: response.audio_data,
          format: response.format
        });
      });
    });
  }
  
  async startStreamingConversation(options: StreamingOptions): Promise<StreamingConversation> {
    try {
      const call = this.client.StreamingConversation();
      
      // Lidar com dados recebidos
      call.on('data', (response: any) => {
        if (response.text) {
          options.onTextReceived(response.text, response.is_final);
        } else if (response.audio) {
          options.onAudioReceived(response.audio, response.is_final);
        }
      });
      
      // Lidar com erros
      call.on('error', (error: Error) => {
        options.onError(error);
      });
      
      // Lidar com o fim do streaming
      call.on('end', () => {
        console.log('Streaming encerrado pelo servidor');
      });
      
      return {
        sendAudio: (audioData: Uint8Array, isFinal: boolean) => {
          call.write({
            audio_data: audioData,
            is_final: isFinal
          });
        },
        stopStream: () => {
          call.end();
        }
      };
    } catch (error) {
      console.error('Erro ao iniciar streaming:', error);
      throw error;
    }
  }
}

// Implementação do serviço com OpenAI direta
class DirectOpenAIVoiceService {
  async transcribe(options: TranscribeOptions): Promise<TranscribeResponse> {
    try {
      // Criar um Blob a partir do Uint8Array
      const audioBlob = new Blob([options.audioData], { type: 'audio/webm' });
      
      // Criar um File a partir do Blob
      const audioFile = new File([audioBlob], 'audio.webm', { type: 'audio/webm' });
      
      // Chamar a API da OpenAI para transcrição
      const response = await openai.audio.transcriptions.create({
        file: audioFile,
        model: options.model || 'whisper-1',
        language: options.language
      });
      
      return {
        text: response.text,
        confidence: 0.9, // A API não retorna confiança explicitamente
        segments: [response.text] // A API não retorna segmentos
      };
    } catch (error) {
      console.error('Erro na transcrição com OpenAI:', error);
      throw error;
    }
  }
  
  async chatCompletion(options: ChatCompletionOptions): Promise<ChatCompletionResponse> {
    try {
      // Preparar mensagens
      const messages = [];
      
      // Adicionar prompt do sistema, se houver
      if (options.systemPrompt) {
        messages.push({
          role: 'system',
          content: options.systemPrompt
        });
      }
      
      // Adicionar o histórico de mensagens
      messages.push(...options.messages);
      
      // Chamar a API da OpenAI para chat
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
      console.error('Erro no chat completion com OpenAI:', error);
      throw error;
    }
  }
  
  async textToSpeech(options: TextToSpeechOptions): Promise<TextToSpeechResponse> {
    try {
      // Chamar a API da OpenAI para síntese de voz
      const response = await openai.audio.speech.create({
        model: options.model || 'tts-1',
        voice: options.voice || 'nova',
        input: options.text,
        speed: options.speed || 1.0
      });
      
      // Converter a resposta para Uint8Array
      const buffer = await response.arrayBuffer();
      const audioData = new Uint8Array(buffer);
      
      return {
        audioData,
        format: 'mp3' // A API da OpenAI retorna MP3 por padrão
      };
    } catch (error) {
      console.error('Erro no text-to-speech com OpenAI:', error);
      throw error;
    }
  }
  
  // Streaming não é suportado diretamente com a API da OpenAI sem WebSockets
  async startStreamingConversation(options: StreamingOptions): Promise<StreamingConversation> {
    // Esta é uma implementação parcial que simula streaming usando chamadas regulares
    let isActive = true;
    
    return {
      sendAudio: async (audioData: Uint8Array, isFinal: boolean) => {
        if (!isActive) return;
        
        try {
          // Transcrever o áudio
          const transcription = await this.transcribe({ audioData });
          options.onTextReceived(`Você disse: ${transcription.text}`, true);
          
          // Notificar que está processando
          options.onTextReceived('Processando sua mensagem...', false);
          
          // Gerar resposta
          const chatResponse = await this.chatCompletion({
            messages: [{ role: 'user', content: transcription.text }],
            systemPrompt: 'Você é um assistente de pronúncia em inglês, respondendo em inglês de maneira simples e clara.'
          });
          
          // Enviar resposta de texto
          options.onTextReceived(chatResponse.text, true);
          
          // Gerar áudio da resposta
          const speechResponse = await this.textToSpeech({
            text: chatResponse.text,
            voice: 'nova'
          });
          
          // Enviar áudio
          options.onAudioReceived(speechResponse.audioData, true);
        } catch (error) {
          options.onError(error instanceof Error ? error : new Error('Erro no processamento'));
        }
      },
      stopStream: () => {
        isActive = false;
      }
    };
  }
}

// Selecionar a implementação com base na configuração
let voiceService: SimulatedVoiceService | GrpcVoiceService | DirectOpenAIVoiceService;

if (USE_SIMULATION) {
  console.log('Usando serviço de voz simulado');
  voiceService = new SimulatedVoiceService();
} else {
  try {
    // Verificar se o gRPC está disponível
    const testClient = new (grpc.loadPackageDefinition(
      protoLoader.loadSync(path.resolve(process.cwd(), 'src/integrations/openai/voiceApi.proto'))
    ).openai.voice.VoiceService)(
      `${GRPC_SERVER_HOST}:${GRPC_SERVER_PORT}`,
      grpc.credentials.createInsecure()
    );
    
    // Se conseguiu criar o cliente, usar gRPC
    console.log('Usando serviço de voz gRPC');
    voiceService = new GrpcVoiceService();
  } catch (error) {
    // Se não conseguiu, usar API direta da OpenAI
    console.log('Usando serviço de voz com API direta da OpenAI');
    voiceService = new DirectOpenAIVoiceService();
  }
}

export default voiceService;
