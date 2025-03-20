import * as grpc from '@grpc/grpc-js';
import * as protoLoader from '@grpc/proto-loader';
import { ProtoGrpcType } from './generated/voiceApi';
import path from 'path';
import * as dotenv from 'dotenv';

// Carrega variáveis de ambiente
dotenv.config();

// Configurações do servidor gRPC
const GRPC_SERVER_HOST = process.env.GRPC_SERVER_HOST || 'localhost';
const GRPC_SERVER_PORT = process.env.GRPC_SERVER_PORT || '50051';
const USE_SIMULATION = process.env.USE_SIMULATION === 'true' || false;

// Tipos para as interfaces do serviço
export interface TranscribeOptions {
  audioData: Uint8Array;
  model?: string;
  language?: string;
  promptBoost?: boolean;
  prompt?: string;
}

export interface ChatCompletionOptions {
  messages: Array<{
    role: 'user' | 'assistant' | 'system';
    content: string;
  }>;
  model?: string;
  temperature?: number;
  systemPrompt?: string;
}

export interface TextToSpeechOptions {
  text: string;
  voice?: string;
  model?: string;
  speed?: number;
}

export interface StreamingOptions {
  onTextReceived: (text: string, isFinal: boolean) => void;
  onAudioReceived?: (audio: Uint8Array, isFinal: boolean) => void;
  onError: (error: Error) => void;
}

// Classe para o serviço de voz da OpenAI
export class OpenAIVoiceService {
  private client: any;
  private isInitialized: boolean = false;
  private useSimulation: boolean;

  constructor(
    private serverUrl: string = `${GRPC_SERVER_HOST}:${GRPC_SERVER_PORT}`,
    simulationMode: boolean = USE_SIMULATION
  ) {
    this.useSimulation = simulationMode;
    console.log(`Serviço de voz OpenAI configurado para usar o servidor: ${this.serverUrl}`);
    console.log(`Modo de simulação: ${this.useSimulation ? 'Ativado' : 'Desativado'}`);
  }

  // Inicializa o cliente gRPC
  public async initialize(): Promise<void> {
    if (this.isInitialized) return;

    try {
      // Caminho para o arquivo proto
      const protoPath = path.resolve(__dirname, './voiceApi.proto');
      
      // Carrega a definição do proto
      const packageDefinition = protoLoader.loadSync(protoPath, {
        keepCase: true,
        longs: String,
        enums: String,
        defaults: true,
        oneofs: true
      });
      
      // Carrega o pacote gRPC
      const protoDescriptor = grpc.loadPackageDefinition(packageDefinition) as unknown as ProtoGrpcType;
      
      // Cria o cliente
      this.client = new protoDescriptor.openai.voice.VoiceService(
        this.serverUrl,
        grpc.credentials.createInsecure()
      );
      
      this.isInitialized = true;
      console.log(`Cliente gRPC inicializado com sucesso para ${this.serverUrl}`);
    } catch (error) {
      console.error('Erro ao inicializar o serviço gRPC:', error);
      throw error;
    }
  }

  // Transcreve áudio para texto
  public async transcribe(options: TranscribeOptions): Promise<{
    text: string;
    confidence: number;
    segments: string[];
  }> {
    await this.ensureInitialized();
    
    if (this.useSimulation) {
      console.log('Usando simulação para transcrição');
      // Simular uma transcrição
      await new Promise(resolve => setTimeout(resolve, 1000));
      return {
        text: 'Isso é uma transcrição simulada para teste da integração gRPC.',
        confidence: 0.95,
        segments: ['Isso é uma transcrição', 'simulada para teste', 'da integração gRPC.']
      };
    }
    
    return new Promise((resolve, reject) => {
      console.log('Enviando solicitação de transcrição para o servidor gRPC');
      this.client.Transcribe({
        audio_data: options.audioData,
        model: options.model || 'whisper-1',
        language: options.language || '',
        prompt_boost: options.promptBoost || false,
        prompt: options.prompt || ''
      }, (error: Error | null, response: any) => {
        if (error) {
          console.error('Erro na transcrição:', error);
          reject(error);
          return;
        }
        
        console.log('Transcrição recebida:', response.text);
        resolve({
          text: response.text,
          confidence: response.confidence,
          segments: response.segments
        });
      });
    });
  }

  // Obtém uma resposta do chat
  public async chatCompletion(options: ChatCompletionOptions): Promise<{
    text: string;
    model: string;
    tokensUsed: number;
  }> {
    await this.ensureInitialized();
    
    if (this.useSimulation) {
      console.log('Usando simulação para chatCompletion');
      // Simular resposta do chat
      await new Promise(resolve => setTimeout(resolve, 1500));
      const lastUserMessage = options.messages
        .filter(msg => msg.role === 'user')
        .pop();
      
      return {
        text: `Esta é uma resposta simulada para: "${lastUserMessage?.content || 'sua mensagem'}"`,
        model: 'gpt-4-mock',
        tokensUsed: 42
      };
    }
    
    return new Promise((resolve, reject) => {
      console.log('Enviando solicitação de chat completion para o servidor gRPC');
      this.client.ChatCompletion({
        messages: options.messages.map(msg => ({
          role: msg.role,
          content: msg.content
        })),
        model: options.model || 'gpt-4',
        temperature: options.temperature !== undefined ? options.temperature : 0.7,
        system_prompt: options.systemPrompt || ''
      }, (error: Error | null, response: any) => {
        if (error) {
          console.error('Erro no chat completion:', error);
          reject(error);
          return;
        }
        
        console.log('Resposta do chat recebida');
        resolve({
          text: response.text,
          model: response.model,
          tokensUsed: response.tokens_used
        });
      });
    });
  }

  // Converte texto em áudio
  public async textToSpeech(options: TextToSpeechOptions): Promise<{
    audioData: Uint8Array;
    format: string;
  }> {
    await this.ensureInitialized();
    
    if (this.useSimulation) {
      console.log('Usando simulação para text-to-speech');
      // Simular áudio
      await new Promise(resolve => setTimeout(resolve, 800));
      return {
        audioData: new Uint8Array(Buffer.from('MOCK_AUDIO_DATA')),
        format: 'mp3'
      };
    }
    
    return new Promise((resolve, reject) => {
      console.log('Enviando solicitação de text-to-speech para o servidor gRPC');
      this.client.TextToSpeech({
        text: options.text,
        voice: options.voice || 'nova',
        model: options.model || 'tts-1',
        speed: options.speed !== undefined ? options.speed : 1.0
      }, (error: Error | null, response: any) => {
        if (error) {
          console.error('Erro no text-to-speech:', error);
          reject(error);
          return;
        }
        
        console.log('Áudio gerado recebido');
        resolve({
          audioData: response.audio_data,
          format: response.format
        });
      });
    });
  }

  // Inicia uma conversa em streaming
  public async startStreamingConversation(options: StreamingOptions): Promise<{
    sendAudio: (audioData: Uint8Array, isFinal?: boolean) => void;
    stopStream: () => void;
  }> {
    await this.ensureInitialized();
    
    console.log('Iniciando conversa em streaming com o servidor gRPC');
    // Cria o stream bidirecional
    const stream = this.client.StreamingConversation();
    
    // Configura o manipulador de dados recebidos
    stream.on('data', (response: any) => {
      console.log('Recebido dado de streaming:', response);
      if (response.text) {
        options.onTextReceived(response.text, response.is_final);
      } else if (response.audio && options.onAudioReceived) {
        options.onAudioReceived(response.audio, response.is_final);
      }
    });
    
    // Configura o manipulador de erros
    stream.on('error', (error: Error) => {
      console.error('Erro no streaming:', error);
      options.onError(error);
    });
    
    // Retorna funções para enviar áudio e parar o stream
    return {
      sendAudio: (audioData: Uint8Array, isFinal: boolean = false) => {
        console.log(`Enviando chunk de áudio para o servidor, isFinal: ${isFinal}`);
        stream.write({
          audio_data: audioData,
          is_final: isFinal
        });
      },
      stopStream: () => {
        console.log('Encerrando stream');
        stream.end();
      }
    };
  }

  // Garante que o cliente está inicializado
  private async ensureInitialized(): Promise<void> {
    if (!this.isInitialized) {
      await this.initialize();
    }
  }
}

// Instância única do serviço com configurações do ambiente
export const openAIVoiceService = new OpenAIVoiceService();

export default openAIVoiceService; 