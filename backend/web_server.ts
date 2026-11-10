/**
 * Wingmen Vision Web Server
 * Serves the React frontend AND proxies API calls to the backend.
 * Makes the dashboard accessible via a web link.
 */
import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';
import url from 'node:url';

const PORT = Number(process.env.PORT) || 8080;
const BACKEND_URL = process.env.BACKEND_URL || 'http://localhost:8081';
const __filename = url.fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const PUBLIC_DIR = path.join(__dirname, '..', 'dist');

const server = http.createServer(async (req, res) => {
  const parsedUrl = url.parse(req.url || '/', true);
  const pathName = parsedUrl.pathname;
  const method = req.method || 'GET';

  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,POST,PUT,DELETE,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type,Authorization');
  if (method === 'OPTIONS') { res.writeHead(204).end(); return; }

  try {
    // API proxy
    if (pathName.startsWith('/api/')) {
      const apiUrl = `${BACKEND_URL}${pathName}`;
      const apiRes = await fetch(apiUrl, {
        method,
        headers: { 'Content-Type': 'application/json', ...req.headers },
        body: method === 'POST' || method === 'PUT' || method === 'PATCH' ? await req.arrayBuffer() : undefined,
      });
      const body = await apiRes.text();
      const contentType = apiRes.headers.get('content-type') || 'application/json';
      res.writeHead(apiRes.status, { 'Content-Type': contentType });
      res.end(body);
      return;
    }

    // Frontend (SPA)
    const filePath = PUBLIC_DIR + (path === '/' ? '/index.html' : path);
    try {
      const stat = fs.statSync(filePath);
      if (stat.isFile()) {
        const ext = path.extname(path).toLowerCase();
        const mimeTypes: Record<string, string> = {
          '.html': 'text/html', '.js': 'application/javascript', '.css': 'text/css',
          '.json': 'application/json', '.png': 'image/png', '.jpg': 'image/jpeg',
          '.jpeg': 'image/jpeg', '.svg': 'image/svg+xml', '.ico': 'image/x-icon',
          '.woff': 'font/woff', '.woff2': 'font/woff2',
        };
        res.writeHead(200, { 'Content-Type': mimeTypes[ext] || 'application/octet-stream' });
        fs.createReadStream(filePath).pipe(res);
        return;
      }
    } catch {
      const indexPath = path.join(PUBLIC_DIR, 'index.html');
      const content = fs.readFileSync(indexPath, 'utf-8');
      res.writeHead(200, { 'Content-Type': 'text/html' });
      res.end(content);
      return;
    }

    res.writeHead(404, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ error: 'Not found' }));

  } catch (err: any) {
    console.error('[WebServer] Error:', err);
    res.writeHead(500, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ error: err.message || 'Internal error' }));
  }
});

server.on('listening', () => {
  console.log(`[WebServer] Listening on http://0.0.0.0:${PORT}`);
  console.log(`[WebServer] API proxy: ${BACKEND_URL}`);
});

server.listen(PORT);
