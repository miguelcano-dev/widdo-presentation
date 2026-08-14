const http = require('http');
const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const PORT = 3456;
const ROOT = __dirname;

const MIME = {
  '.html': 'text/html', '.css': 'text/css', '.js': 'application/javascript',
  '.json': 'application/json', '.png': 'image/png', '.jpg': 'image/jpeg',
  '.svg': 'image/svg+xml', '.pdf': 'application/pdf', '.md': 'text/plain; charset=utf-8',
  '.txt': 'text/plain', '.ico': 'image/x-icon',
};

const server = http.createServer((req, res) => {
  // CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') { res.writeHead(200); res.end(); return; }

  // API: Update metrics
  if (req.method === 'POST' && req.url === '/api/update-metrics') {
    let body = '';
    req.on('data', chunk => body += chunk);
    req.on('end', () => {
      try {
        const newMetrics = JSON.parse(body);
        const metricsPath = path.join(ROOT, 'metrics.json');
        const current = JSON.parse(fs.readFileSync(metricsPath, 'utf8'));

        // Merge new values into current
        Object.keys(newMetrics).forEach(k => {
          if (k !== '_comment' && k !== '_updated') {
            current[k] = newMetrics[k];
          }
        });

        fs.writeFileSync(metricsPath, JSON.stringify(current, null, 2) + '\n');

        // Run update-metrics.js
        const output = execSync('node update-metrics.js', { cwd: ROOT, timeout: 30000 }).toString();

        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ success: true, output, metrics: current }));
      } catch (err) {
        res.writeHead(500, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ success: false, error: err.message }));
      }
    });
    return;
  }

  // API: Update metrics + generate PDFs
  if (req.method === 'POST' && req.url === '/api/generate-pdfs') {
    try {
      const output = execSync('node update-metrics.js --pdf', { cwd: ROOT, timeout: 300000 }).toString();
      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ success: true, output }));
    } catch (err) {
      res.writeHead(500, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ success: false, error: err.message }));
    }
    return;
  }

  // Static files
  let filePath = req.url === '/' ? '/index.html' : decodeURIComponent(req.url);
  filePath = path.join(ROOT, filePath);

  // Security: prevent directory traversal
  if (!filePath.startsWith(ROOT)) {
    res.writeHead(403); res.end('Forbidden'); return;
  }

  fs.readFile(filePath, (err, data) => {
    if (err) {
      res.writeHead(404, { 'Content-Type': 'text/plain' });
      res.end('Not found: ' + req.url);
      return;
    }
    const ext = path.extname(filePath).toLowerCase();
    res.writeHead(200, { 'Content-Type': MIME[ext] || 'application/octet-stream' });
    res.end(data);
  });
});

server.listen(PORT, () => {
  console.log('');
  console.log('╔══════════════════════════════════════════════╗');
  console.log('║     WIDDO DOCUMENT CENTER                     ║');
  console.log('╚══════════════════════════════════════════════╝');
  console.log('');
  console.log(`  → http://localhost:${PORT}`);
  console.log('');
  console.log('  Arrastra un pantallazo de metricas para actualizar todo.');
  console.log('  Ctrl+C para cerrar.');
  console.log('');
});
