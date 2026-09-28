import { defineConfig, type Plugin } from 'vite';
import react from '@vitejs/plugin-react';
import fs from 'node:fs';
import path from 'node:path';

function csvEmailSaverPlugin(): Plugin {
  const getCsvPath = () => path.resolve(process.cwd(), 'subscribers.csv');

  function saveEmail(email: string, source: string = 'master_download'): boolean {
    const cleanEmail = email.trim();
    if (!cleanEmail || !cleanEmail.includes('@')) return false;

    const csvPath = getCsvPath();
    const timestamp = new Date().toISOString();

    if (!fs.existsSync(csvPath)) {
      fs.writeFileSync(csvPath, 'Date,Email,Source\n', 'utf8');
    }

    const escapedEmail = cleanEmail.replace(/"/g, '""');
    const line = `"${timestamp}","${escapedEmail}","${source}"\n`;
    fs.appendFileSync(csvPath, line, 'utf8');
    return true;
  }

  const handleMiddleware = (req: any, res: any, next: any) => {
    const url = req.url ? req.url.split('?')[0] : '';

    if (url === '/api/save-email' && req.method === 'POST') {
      let body = '';
      req.on('data', (chunk: Buffer) => {
        body += chunk.toString();
      });
      req.on('end', () => {
        try {
          const data = JSON.parse(body || '{}');
          const { email, source } = data;
          if (!email || typeof email !== 'string') {
            res.statusCode = 400;
            res.setHeader('Content-Type', 'application/json');
            res.end(JSON.stringify({ error: 'Valid email is required' }));
            return;
          }
          const saved = saveEmail(email, source || 'master_download');
          res.statusCode = saved ? 200 : 400;
          res.setHeader('Content-Type', 'application/json');
          res.end(
            JSON.stringify({
              success: saved,
              message: saved ? 'Email saved to subscribers.csv' : 'Invalid email format'
            })
          );
        } catch (err: any) {
          res.statusCode = 500;
          res.setHeader('Content-Type', 'application/json');
          res.end(JSON.stringify({ error: err.message || 'Internal server error' }));
        }
      });
      return;
    }

    if ((url === '/api/subscribers.csv' || url === '/subscribers.csv') && req.method === 'GET') {
      const csvPath = getCsvPath();
      if (fs.existsSync(csvPath)) {
        const data = fs.readFileSync(csvPath, 'utf8');
        res.statusCode = 200;
        res.setHeader('Content-Type', 'text/csv; charset=utf-8');
        res.setHeader('Content-Disposition', 'attachment; filename="subscribers.csv"');
        res.end(data);
        return;
      } else {
        res.statusCode = 404;
        res.end('subscribers.csv not found');
        return;
      }
    }

    next();
  };

  return {
    name: 'vite-plugin-csv-email-saver',
    configureServer(server) {
      server.middlewares.use(handleMiddleware);
    },
    configurePreviewServer(server) {
      server.middlewares.use(handleMiddleware);
    }
  };
}

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react(), csvEmailSaverPlugin()],
  server: {
    port: 3000,
    open: false
  },
  build: {
    target: 'esnext',
    outDir: 'dist'
  }
});
