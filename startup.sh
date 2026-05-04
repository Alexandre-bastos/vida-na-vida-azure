#!/bin/bash
echo "Iniciando processo de boot na Azure..."

# Gerar o cliente Prisma usando o Node diretamente para evitar erro de permissão
echo "Gerando cliente Prisma via Node..."
node node_modules/prisma/build/index.js generate

# Iniciar o servidor Express
echo "Iniciando servidor Node..."
node server.mjs
