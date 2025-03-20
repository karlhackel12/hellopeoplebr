#!/bin/bash

# Script para instalação das dependências para a funcionalidade de prática de voz

echo "Instalando dependências para Voice Practice..."

# Instalar dependências gRPC
npm install @grpc/grpc-js @grpc/proto-loader

# Instalar ts-proto para geração de código TS
npm install --save-dev ts-proto

# Instalar protoc (protocolo buffer compiler)
if [[ "$OSTYPE" == "linux-gnu"* ]]; then
    echo "Detectado sistema Linux"
    apt-get update && apt-get install -y protobuf-compiler
elif [[ "$OSTYPE" == "darwin"* ]]; then
    echo "Detectado sistema macOS"
    brew install protobuf
elif [[ "$OSTYPE" == "msys" || "$OSTYPE" == "win32" ]]; then
    echo "Detectado sistema Windows"
    echo "Por favor, faça o download e instale o Protobuf manualmente de https://github.com/protocolbuffers/protobuf/releases"
    echo "Certifique-se de adicionar o binário protoc ao PATH"
else
    echo "Sistema operacional não reconhecido. Por favor, instale o Protobuf manualmente."
fi

# Criar diretório para arquivos gerados
mkdir -p src/integrations/openai/generated

echo "Dependências instaladas. Para gerar os arquivos TypeScript a partir do proto, execute:"
echo "npm run proto:gen"

echo "Para iniciar o servidor mock para testes, execute:"
echo "npm run mock:server"

echo "Configuração concluída!" 