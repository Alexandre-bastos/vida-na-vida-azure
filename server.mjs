import express from 'express';
import { handler as astroHandler } from './dist/server/entry.mjs';

const app = express();
app.set('trust proxy', true);
const port = process.env.PORT || 8080;

// Middleware para normalização e LOGS PROFUNDOS na Azure
app.use((req, res, next) => {
  if (req.headers['x-original-host']) {
    req.headers.host = req.headers['x-original-host'];
  }
  
  if (req.url.includes('/api/auth')) {
    console.log('--- DEBUG AUTH START ---');
    console.log(`Method: ${req.method} | URL: ${req.url}`);
    console.log(`Host: ${req.headers.host}`);
    console.log(`Origin: ${req.headers.origin}`);
    console.log(`Referer: ${req.headers.referer}`);
    console.log(`X-Forwarded-Proto: ${req.headers['x-forwarded-proto']}`);
    console.log(`X-Forwarded-Host: ${req.headers['x-forwarded-host']}`);
    console.log(`Cookies: ${req.headers.cookie ? 'Presente' : 'AUSENTE'}`);
    if (req.headers.cookie) {
       console.log(`Cookies List: ${req.headers.cookie.split(';').map(c => c.split('=')[0].trim()).join(', ')}`);
    }
    console.log('--- DEBUG AUTH END ---');
  }

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
