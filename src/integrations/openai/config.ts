import { config } from 'dotenv';
import { OpenAI } from 'openai';

// Carrega as variáveis de ambiente
config();

// Configurações da API OpenAI
export const OPENAI_API_KEY = process.env.OPENAI_API_KEY || '';

// Verificação de segurança
if (!OPENAI_API_KEY) {
  console.error('API Key da OpenAI não encontrada. Configure a variável de ambiente OPENAI_API_KEY.');
  throw new Error('API Key da OpenAI não configurada');
}

// Configurações do servidor gRPC
export const GRPC_SERVER_PORT = parseInt(process.env.GRPC_SERVER_PORT || '50051', 10);
export const GRPC_SERVER_HOST = process.env.GRPC_SERVER_HOST || '0.0.0.0';

// Cliente OpenAI
export const openai = new OpenAI({
  apiKey: OPENAI_API_KEY,
});

// Testa a conexão com a OpenAI
export const testOpenAIConnection = async (): Promise<boolean> => {
  try {
    const response = await openai.chat.completions.create({
      model: "gpt-4",
      messages: [{ role: "system", content: "Hello, this is a test." }],
      max_tokens: 5,
    });
    
    console.log('OpenAI API conectada com sucesso:', response.id);
    return true;
  } catch (error) {
    console.error('Erro ao conectar com a API da OpenAI:', error);
    return false;
  }
};

// Exporta o cliente OpenAI como padrão
export default openai; 