/**
 * Minimalni HTTP server za Render Web Service.
 * Render zahtijeva proces koji sluša na PORT; inače "Application exited early".
 * Kasnije zamijeni s punim API-jem (Express, itd.).
 */
const http = require('http');

const PORT = process.env.PORT || 3000;

const server = http.createServer((req, res) => {
  res.writeHead(200, { 'Content-Type': 'application/json' });
  res.end(JSON.stringify({
    service: 'registar-poslovnih-subjekata',
    status: 'ok',
    message: 'API za pretragu poslovnih subjekata (dodaj endpointe kasnije)',
  }));
});

server.listen(PORT, () => {
  console.log(`Listening on port ${PORT}`);
});
