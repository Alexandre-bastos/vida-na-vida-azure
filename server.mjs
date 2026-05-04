import express from 'express';
import { handler as astroHandler } from './dist/server/entry.mjs';

const app = express();
app.set('trust proxy', true);
const port = process.env.PORT || 8080;

// Middleware para logs de rota e correção de proxy
app.use((req, res, next) => {
  const protocol = req.headers['x-forwarded-proto'] || req.protocol;
  const host = req.headers['x-forwarded-host'] || req.get('host');
  
  // Forçar Origin e Referer a usarem HTTPS se estivermos atrás do proxy da Azure
  if (req.headers['x-forwarded-proto'] === 'https') {
    const secureOrigin = `https://${host}`;
    
    if (!req.headers.origin || req.headers.origin.startsWith('http:')) {
      req.headers.origin = secureOrigin;
    }
    if (req.headers.referer && req.headers.referer.startsWith('http:')) {
      req.headers.referer = req.headers.referer.replace('http:', 'https:');
    }
  }

  console.log(`[ROUTE DEBUG] ${req.method} ${req.url} (Proto: ${protocol})`);
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
