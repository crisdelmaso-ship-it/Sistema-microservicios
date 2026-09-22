const http = require('http');
const httpProxy = require('http-proxy');

const PORT = Number(process.env.PORT || 3000);
const AUTH_SERVICE_URL = process.env.AUTH_SERVICE_URL || 'http://localhost:8080';
const PRODUCTOS_SERVICE_URL = process.env.PRODUCTOS_SERVICE_URL || 'http://localhost:3001';
const PURCHASES_SERVICE_URL = process.env.PURCHASES_SERVICE_URL || 'http://localhost:8082';

const proxy = httpProxy.createProxyServer({
  changeOrigin: true
});

proxy.on('error', function (error, request, response) {
  if (response.headersSent) {
    response.end();
    return;
  }

  response.writeHead(502, { 'Content-Type': 'application/json' });
  response.end(JSON.stringify({
    message: 'Servicio no disponible',
    detail: error.message
  }));
});

const server = http.createServer(function (request, response) {
  response.setHeader('Access-Control-Allow-Origin', '*');
  response.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  response.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, PATCH, DELETE, OPTIONS');

  if (request.method === 'OPTIONS') {
    response.writeHead(204);
    response.end();
    return;
  }

  if (request.url === '/health') {
    response.writeHead(200, { 'Content-Type': 'application/json' });
    response.end(JSON.stringify({ status: 'UP' }));
    return;
  }

  if (request.url.indexOf('/api/v1/auth/') === 0) {
    proxy.web(request, response, { target: AUTH_SERVICE_URL });
    return;
  }

  if (request.url.indexOf('/api/v1/purchases') === 0) {
    proxy.web(request, response, { target: PURCHASES_SERVICE_URL });
    return;
  }

  if (request.url.indexOf('/api/products') === 0) {
    proxy.web(request, response, { target: PRODUCTOS_SERVICE_URL });
    return;
  }

  response.writeHead(404, { 'Content-Type': 'application/json' });
  response.end(JSON.stringify({ message: 'Ruta no encontrada' }));
});

server.listen(PORT, function () {
  console.log('Gateway running on port ' + PORT);
  console.log('Auth service: ' + AUTH_SERVICE_URL);
  console.log('Products service: ' + PRODUCTOS_SERVICE_URL);
  console.log('Purchases service: ' + PURCHASES_SERVICE_URL);
});