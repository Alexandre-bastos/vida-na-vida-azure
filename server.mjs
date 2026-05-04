import express from 'express';
import { handler as astroHandler } from './dist/server/entry.mjs';

const app = express();
app.set('trust proxy', true);
const port = process.env.PORT || 8080;

// Middleware para normalização de cabeçalhos na Azure
app.use((req, res, next) => {
  // Azure costuma enviar o host original aqui
  if (req.headers['x-original-host']) {
    req.headers.host = req.headers['x-original-host'];
  }
  
  // Forçar o protocolo para HTTPS se vier do proxy da Azure
  if (req.headers['x-forwarded-proto'] === 'https') {
    req.url = req.url; // garante que a URL está limpa
  }

  console.log(`[ROUTE DEBUG] ${req.method} ${req.url} (Host: ${req.headers.host})`);
  next();
});

// Servir arquivos estáticos do diretório dist/client
app.use(express.static('dist/client'));

// Usar o handler do Astro para todo o resto
app.use((req, res, next) => {
  // Passar para o Astro
  astroHandler(req, res, next);
});

app.listen(port, '0.0.0.0', () => {
  console.log(`[SERVER] Rodando em http://0.0.0.0:${port}`);
});
