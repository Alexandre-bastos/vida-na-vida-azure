import express from 'express';
import { handler as astroHandler } from './dist/server/entry.mjs';

const app = express();
app.set('trust proxy', true);
const port = process.env.PORT || 8080;

// Middleware para normalização TOTAL na Azure
app.use((req, res, next) => {
  // Forçar o Express a acreditar que é HTTPS e o domínio real
  req.headers['x-forwarded-proto'] = 'https';
  req.headers['x-forwarded-host'] = 'comunidadevidanavida.com.br';
  req.headers.host = 'comunidadevidanavida.com.br';
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
