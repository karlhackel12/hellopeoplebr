import * as grpc from '@grpc/grpc-js';
import * as protoLoader from '@grpc/proto-loader';
import * as fs from 'fs';
import * as path from 'path';
import * as dotenv from 'dotenv';
import { Readable } from 'stream';
import { openai, GRPC_SERVER_PORT, GRPC_SERVER_HOST, testOpenAIConnection } from './config';
import { PassThrough } from 'stream';

// Carrega as variáveis de ambiente
dotenv.config();

// Caminho para o arquivo proto
const PROTO_PATH = path.resolve(__dirname, './voiceApi.proto');

// Carrega a definição do proto
const packageDefinition = protoLoader.loadSync(PROTO_PATH, {
  keepCase: true,
  longs: String,
  enums: String,
  defaults: true,
  oneofs: true,
});

const protoDescriptor = grpc.loadPackageDefinition(packageDefinition) as any;
const voiceService = protoDescriptor.openai.voice;

// Implementação do servidor real
const server = new grpc.Server();

// Função para criar arquivo temporário a partir de um buffer
const createTempAudioFile = async (audioData: Buffer): Promise<string> => {
  const tempDir = path.join(__dirname, 'temp');
  
  // Criar diretório temporário se não existir
  if (!fs.existsSync(tempDir)) {
    fs.mkdirSync(tempDir, { recursive: true });
  }
  
  const tempFilePath = path.join(tempDir, `audio_${Date.now()}.webm`);
  fs.writeFileSync(tempFilePath, audioData);
  
  return tempFilePath;
};

// Função de cleanup após uso
const cleanupTempFile = (filePath: string) => {
  try {
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }
  } catch (error) {
    console.error('Erro ao remover arquivo temporário:', error);
  }
};

// Implementação do serviço
server.addService(voiceService.VoiceService.service, {
  // Transcrição de áudio (Speech-to-Text)
  Transcribe: async (call: any, callback: any) => {
    console.log('Recebida solicitação de transcrição');
    
    try {
      // Obter dados do áudio da solicitação gRPC
      const audioData = Buffer.from(call.request.audio_data);
      const audioFilePath = await createTempAudioFile(audioData);
      
      // Preparar parâmetros adicionais
      const language = call.request.language || 'pt';
      const model = call.request.model || 'whisper-1';
      
      // Chamar API da OpenAI para transcrição
      const transcriptionResponse = await openai.audio.transcriptions.create({
        file: fs.createReadStream(audioFilePath),
        model: model,
        language: language,
        response_format: 'verbose_json'
      });
      
      // Limpar arquivo temporário
      cleanupTempFile(audioFilePath);
      
      // Formatar resposta para o formato gRPC
      const response = {
        text: transcriptionResponse.text,
        confidence: 0.95, // A API não retorna confiança, então usamos um valor padrão
        segments: Array.isArray(transcriptionResponse.segments) 
          ? transcriptionResponse.segments.map((s: any) => s.text) 
          : [transcriptionResponse.text]
      };
      
      callback(null, response);
    } catch (error) {
      console.error('Erro ao transcrever áudio:', error);
      callback({
        code: grpc.status.INTERNAL,
        message: `Erro ao transcrever áudio: ${error}`
      });
    }
  },
  
  // Completamento de chat
  ChatCompletion: async (call: any, callback: any) => {
    console.log('Recebida solicitação de chat completion');
    
    try {
      // Extrair mensagens da solicitação
      const messages = call.request.messages.map((msg: any) => ({
        role: msg.role,
        content: msg.content
      }));
      
      // Adicionar prompt de sistema se fornecido
      if (call.request.system_prompt) {
        messages.unshift({
          role: 'system',
          content: call.request.system_prompt
        });
      }
      
      // Modelo e temperatura
      const model = call.request.model || 'gpt-4';
      const temperature = call.request.temperature !== undefined ? call.request.temperature : 0.7;
      
      // Chamar API da OpenAI
      const completion = await openai.chat.completions.create({
        model: model,
        messages: messages,
        temperature: temperature,
      });
      
      const responseText = completion.choices[0]?.message?.content || '';
      
      // Formatar resposta para o formato gRPC
      const response = {
        text: responseText,
        model: completion.model,
        tokens_used: completion.usage?.total_tokens || 0
      };
      
      callback(null, response);
    } catch (error) {
      console.error('Erro ao obter resposta do chat:', error);
      callback({
        code: grpc.status.INTERNAL,
        message: `Erro ao obter resposta do chat: ${error}`
      });
    }
  },
  
  // Conversão de texto em áudio (Text-to-Speech)
  TextToSpeech: async (call: any, callback: any) => {
    console.log('Recebida solicitação de text-to-speech');
    
    try {
      // Extrair parâmetros da solicitação
      const text = call.request.text;
      const voice = call.request.voice || 'nova';
      const model = call.request.model || 'tts-1';
      const speed = call.request.speed !== undefined ? call.request.speed : 1.0;
      
      // Chamar API da OpenAI
      const mp3 = await openai.audio.speech.create({
        input: text,
        voice: voice,
        model: model,
        speed: speed,
        response_format: 'mp3',
      });
      
      // Converter o stream em buffer
      const chunks: Uint8Array[] = [];
      const buffer = await new Promise<Buffer>((resolve, reject) => {
        mp3.body.on('data', (chunk) => chunks.push(chunk));
        mp3.body.on('end', () => resolve(Buffer.concat(chunks)));
        mp3.body.on('error', reject);
      });
      
      // Formatar resposta para o formato gRPC
      const response = {
        audio_data: buffer,
        format: 'mp3'
      };
      
      callback(null, response);
    } catch (error) {
      console.error('Erro ao converter texto em áudio:', error);
      callback({
        code: grpc.status.INTERNAL,
        message: `Erro ao converter texto em áudio: ${error}`
      });
    }
  },
  
  // Streaming bidirecional para conversa em tempo real
  StreamingConversation: (call: any) => {
    console.log('Iniciando conversa em streaming');
    
    // Armazenar chunks de áudio
    const audioChunks: Buffer[] = [];
    let transcription = '';
    let conversationMessages: any[] = [
      { role: 'system', content: 'Você é um assistente de idiomas que ajuda pessoas a praticarem inglês. Seja conciso e claro em suas respostas.' }
    ];
    
    // Processar os dados de áudio recebidos
    call.on('data', async (audioChunk: any) => {
      try {
        console.log(`Recebido chunk de áudio, final: ${audioChunk.is_final}`);
        audioChunks.push(Buffer.from(audioChunk.audio_data));
        
        // Se for o chunk final, processar o áudio completo
        if (audioChunk.is_final) {
          const completeAudio = Buffer.concat(audioChunks);
          const audioFilePath = await createTempAudioFile(completeAudio);
          
          // Informar ao cliente que começamos o processamento
          call.write({
            text: 'Processando sua mensagem...',
            is_final: false
          });
          
          try {
            // Transcrever o áudio
            const transcriptionResponse = await openai.audio.transcriptions.create({
              file: fs.createReadStream(audioFilePath),
              model: 'whisper-1',
              language: 'pt',
            });
            
            transcription = transcriptionResponse.text;
            
            // Enviar transcrição para o cliente
            call.write({
              text: `Você disse: ${transcription}`,
              is_final: false
            });
            
            // Adicionar mensagem do usuário
            conversationMessages.push({ role: 'user', content: transcription });
            
            // Obter resposta usando streaming para respostas em tempo real
            const stream = await openai.chat.completions.create({
              model: 'gpt-4',
              messages: conversationMessages,
              stream: true,
            });
            
            let assistantResponse = '';
            
            // Processar stream de resposta em tempo real
            for await (const chunk of stream) {
              const content = chunk.choices[0]?.delta?.content || '';
              if (content) {
                assistantResponse += content;
                
                // Enviar atualizações parciais para o cliente
                call.write({
                  text: content,
                  is_final: false
                });
              }
            }
            
            // Adicionar resposta completa do assistente
            conversationMessages.push({ role: 'assistant', content: assistantResponse });
            
            // Enviar mensagem final
            call.write({
              text: assistantResponse,
              is_final: true
            });
            
            // Opcional: Converter resposta em áudio
            const mp3 = await openai.audio.speech.create({
              input: assistantResponse,
              voice: 'nova',
              model: 'tts-1',
              response_format: 'mp3',
            });
            
            // Converter o stream em buffer
            const chunks: Uint8Array[] = [];
            const buffer = await new Promise<Buffer>((resolve, reject) => {
              mp3.body.on('data', (chunk) => chunks.push(chunk));
              mp3.body.on('end', () => resolve(Buffer.concat(chunks)));
              mp3.body.on('error', reject);
            });
            
            // Enviar áudio para o cliente
            call.write({
              audio: buffer,
              is_final: true
            });
            
          } catch (error) {
            console.error('Erro ao processar áudio:', error);
            call.write({
              text: `Erro ao processar seu áudio: ${error}`,
              is_final: true
            });
          } finally {
            // Limpar arquivo temporário
            cleanupTempFile(audioFilePath);
            // Limpar chunks de áudio para o próximo ciclo
            audioChunks.length = 0;
          }
        }
      } catch (error) {
        console.error('Erro ao processar chunk de áudio:', error);
        call.write({
          text: `Erro ao processar áudio: ${error}`,
          is_final: true
        });
      }
    });
    
    // Lida com o encerramento da conexão
    call.on('end', () => {
      console.log('Cliente encerrou a conexão de streaming');
      call.end();
    });
    
    // Lida com erros
    call.on('error', (error: Error) => {
      console.error('Erro na conexão de streaming:', error);
    });
  }
});

// Função para iniciar o servidor
export const startServer = async (): Promise<void> => {
  // Testar conexão com a OpenAI antes de iniciar o servidor
  const connected = await testOpenAIConnection();
  
  if (!connected) {
    console.error('Não foi possível conectar à API da OpenAI. Verifique sua API key e conexão com a internet.');
    process.exit(1);
  }
  
  // Iniciar o servidor
  server.bindAsync(
    `${GRPC_SERVER_HOST}:${GRPC_SERVER_PORT}`,
    grpc.ServerCredentials.createInsecure(),
    (error, port) => {
      if (error) {
        console.error('Falha ao iniciar o servidor gRPC:', error);
        process.exit(1);
      }
      
      server.start();
      console.log(`Servidor gRPC iniciado em ${GRPC_SERVER_HOST}:${port}`);
      console.log('Servidor conectado à API da OpenAI');
    }
  );
};

// Se este arquivo for executado diretamente
if (require.main === module) {
  startServer().catch(error => {
    console.error('Erro ao iniciar o servidor:', error);
    process.exit(1);
  });
}

export default server; 