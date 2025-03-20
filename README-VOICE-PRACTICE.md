# Voice Practice - Instruções de Uso

Este documento contém instruções detalhadas para configurar e utilizar a funcionalidade de prática de voz com integração da OpenAI.

## Visão Geral

A funcionalidade de prática de voz permite que os alunos pratiquem inglês através de:
- Conversas em tempo real usando reconhecimento e síntese de voz
- Feedback sobre pronúncia
- Diferentes categorias de prática (pronúncia, conversação, compreensão auditiva)

A funcionalidade utiliza a API da OpenAI através de um servidor gRPC para fornecer uma experiência interativa e em tempo real.

## Pré-requisitos

- Node.js v16+ instalado
- API key da OpenAI válida
- Microfone funcionando no dispositivo
- Navegador moderno (Chrome, Firefox, Edge, Safari)

## Configuração Rápida

1. Copie o arquivo `.env.example` para `.env`:
   ```bash
   cp .env.example .env
   ```

2. Edite o arquivo `.env` e adicione sua API key da OpenAI:
   ```
   OPENAI_API_KEY=sua-api-key-aqui
   ```

3. Instale as dependências (se ainda não tiver feito):
   ```bash
   npm install
   ```

4. Gere os arquivos TypeScript a partir do proto:
   ```bash
   npm run proto:gen
   ```

5. Inicie o servidor gRPC:
   ```bash
   npm run real:server
   ```

6. Em outro terminal, inicie a aplicação frontend:
   ```bash
   npm run dev
   ```

7. Acesse a aplicação no navegador e navegue até `/student/voice-practice`

## Modo de Simulação

Se você quiser testar a interface sem consumir créditos da API da OpenAI, pode ativar o modo de simulação:

1. Edite o arquivo `.env`:
   ```
   USE_SIMULATION=true
   ```

2. Reinicie o servidor e a aplicação.

## Arquitetura

A funcionalidade é composta por:

1. **Servidor gRPC** (`src/integrations/openai/realServer.ts`)
   - Processa solicitações do cliente
   - Comunica-se com a API da OpenAI
   - Fornece streaming bidirecional para comunicação em tempo real

2. **Definição do Protocolo** (`src/integrations/openai/voiceApi.proto`)
   - Define a interface de comunicação entre cliente e servidor
   - Especifica os tipos de mensagens e serviços

3. **Cliente de Serviço** (`src/integrations/openai/voiceService.ts`)
   - Interface TypeScript para comunicação com o servidor
   - Lida com requisições e respostas

4. **Hooks React** (`src/pages/student/hooks/useVoicePractice.ts` e `useVoiceRecorder.ts`)
   - Gerenciam a lógica de gravação e processamento de áudio
   - Integram com a interface do usuário

5. **Componentes de Interface** (`src/pages/student/VoicePractice.tsx` e `VoicePracticeSession.tsx`)
   - Fornecem a interface do usuário para a prática de voz

## Limitações Conhecidas

- O navegador deve ter permissão para acessar o microfone
- A API da OpenAI pode ter limites de uso dependendo do seu plano
- A qualidade da transcrição depende da clareza do áudio

## Solução de Problemas

### O servidor gRPC não inicia

Verifique:
- Se a API key da OpenAI é válida
- Se as portas 50051 não está em uso por outro programa
- Se você tem permissões suficientes para iniciar servidores

### Erro "Permissão negada para o microfone"

- Certifique-se de que seu navegador tem permissão para acessar o microfone
- Verifique se outro programa não está usando o microfone

### A qualidade da transcrição é baixa

- Fale claramente e próximo ao microfone
- Reduza o ruído de fundo
- Verifique a qualidade do seu microfone

## Recursos Avançados

### Configuração de Sistema Distribuído

Para implantação em produção, considere:

1. Hospedar o servidor gRPC separadamente do frontend
2. Configurar balanceamento de carga para maior disponibilidade
3. Adicionar autenticação JWT para proteger o serviço
4. Utilizar conexões seguras (TLS/SSL)

### Personalização do Servidor

Você pode personalizar o servidor modificando:

- Modelos usados pela OpenAI (`src/integrations/openai/realServer.ts`)
- Parâmetros de streaming e de requisição
- Sistema de prompt utilizado para os assistentes

## Créditos

Esta funcionalidade utiliza:
- [OpenAI API](https://openai.com/blog/openai-api)
- [gRPC](https://grpc.io/)
- [Protocol Buffers](https://developers.google.com/protocol-buffers)
- [React](https://reactjs.org/)
- [ShadcnUI](https://ui.shadcn.com/)

---

Para mais informações, entre em contato com a equipe de desenvolvimento. 