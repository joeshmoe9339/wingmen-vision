
// Minimal Wingmen Agent (ONVIF endpoint) for Pi
const http = require('http');
const server = http.createServer((req, res) => {
  if (req.url === '/onvif') {
    res.writeHead(200, {'Content-Type': 'application/xml'});
    res.end('<ONVIF><Response>Ready</Response></ONVIF>');
    console.log('[Agent] ONVIF request handled');
  } else {
    res.writeHead(404); res.end('Not found');
  }
});
server.listen(8080, '192.168.0.100', () => console.log('[Agent] Listening on 192.168.0.100:8080/onvif'));
