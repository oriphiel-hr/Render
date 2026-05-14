/**
 * Minimalni HTTP servis za Render (PORT).
 * Sudreg token: require('./sudregToken') iz vlastitih ruta / cron jobova.
 */
try {
  require('dotenv').config();
} catch (_) {
  /* dotenv nije obavezan na Renderu */
}

const http = require('http');

const port = Number(process.env.PORT) || 3000;

const server = http.createServer((req, res) => {
  const path = (req.url || '').split('?')[0] || '/';
  if (path === '/' || path === '/health') {
    res.writeHead(200, { 'Content-Type': 'text/plain; charset=utf-8' });
    res.end('ok');
    return;
  }
  res.writeHead(404, { 'Content-Type': 'text/plain; charset=utf-8' });
  res.end('Not found');
});

server.listen(port, '0.0.0.0', () => {
  console.log(`[registar-rps] listening on 0.0.0.0:${port}`);
});
