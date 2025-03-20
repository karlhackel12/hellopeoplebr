const grpc = require('@grpc/grpc-js');
const protoLoader = require('@grpc/proto-loader');
const path = require('path');
const fs = require('fs');

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

const protoDescriptor = grpc.loadPackageDefinition(packageDefinition);
const voiceService = protoDescriptor.openai.voice;

// Implementação do servidor mock
const server = new grpc.Server();

// Implementação do serviço de transcrição
server.addService(voiceService.VoiceService.service, {
  // Transcrição de áudio (Speech-to-Text)
  Transcribe: (call, callback) => {
    console.log('Recebida solicitação de transcrição');
    
    // Simula uma transcrição
    setTimeout(() => {
      callback(null, {
        text: 'Isso é uma transcrição simulada para teste da integração gRPC.',
        confidence: 0.95,
        segments: ['Isso é uma transcrição', 'simulada para teste', 'da integração gRPC.']
      });
    }, 500);
  },
  
  // Completamento de chat
  ChatCompletion: (call, callback) => {
    console.log('Recebida solicitação de chat completion');
    
    // Extrai a última mensagem do usuário
    const lastUserMessage = call.request.messages
      .filter(msg => msg.role === 'user')
      .pop();
    
    // Simula uma resposta
    setTimeout(() => {
      callback(null, {
        text: `Esta é uma resposta simulada para: "${lastUserMessage?.content || 'sua mensagem'}"`,
        model: 'gpt-4-mock',
        tokens_used: 42
      });
    }, 800);
  },
  
  // Conversão de texto em áudio (Text-to-Speech)
  TextToSpeech: (call, callback) => {
    console.log('Recebida solicitação de text-to-speech');
    
    // Para testes, retornar um arquivo de áudio de amostra ou um buffer vazio
    let audioData;
    try {
      // Tente carregar um arquivo de áudio de exemplo (se disponível)
      audioData = Buffer.from('MOCK_AUDIO_DATA');
    } catch (error) {
      // Ou criar um buffer vazio
      audioData = Buffer.from([]);
    }
    
    setTimeout(() => {
      callback(null, {
        audio_data: audioData,
        format: 'mp3'
      });
    }, 600);
  },
  
  // Streaming de conversa
  StreamingConversation: (call) => {
    console.log('Iniciando conversa em streaming');
    
    // Processa os dados de áudio recebidos
    call.on('data', (audioChunk) => {
      console.log(`Recebido chunk de áudio, final: ${audioChunk.is_final}`);
      
      // Se for o chunk final, envie uma resposta
      if (audioChunk.is_final) {
        // Envia resposta de texto
        call.write({
          text: 'Esta é uma resposta parcial em streaming.',
          is_final: false
        });
        
        // Após um curto atraso, envia a resposta final
        setTimeout(() => {
          call.write({
            text: 'Esta é a resposta final do servidor mock em streaming.',
            is_final: true
          });
        }, 1000);
      }
    });
    
    // Lida com o encerramento da conexão
    call.on('end', () => {
      console.log('Cliente encerrou a conexão de streaming');
      call.end();
    });
    
    // Lida com erros
    call.on('error', (error) => {
      console.error('Erro na conexão de streaming:', error);
    });
  }
});

// Inicia o servidor
const port = 50051;
server.bindAsync(
  `0.0.0.0:${port}`,
  grpc.ServerCredentials.createInsecure(),
  (error, port) => {
    if (error) {
      console.error('Falha ao iniciar o servidor gRPC:', error);
      return;
    }
    
    server.start();
    console.log(`Servidor gRPC mock iniciado na porta ${port}`);
  }
);

console.log('Inicializando servidor gRPC mock...'); 