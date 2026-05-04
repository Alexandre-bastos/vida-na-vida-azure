#!/bin/bash
echo "Iniciando processo de boot na Azure..."

# Gerar o cliente Prisma dentro do container da Azure
echo "Gerando cliente Prisma..."
npx prisma generate

# Iniciar o servidor Express
echo "Iniciando servidor Node..."
node server.mjs
