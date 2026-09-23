const http = require('http');
const httpProxy = require('http-proxy');
const fs = require('fs');
const path = require('path');

const PORT = Number(process.env.PORT || 3000);
const AUTH_SERVICE_URL = process.env.AUTH_SERVICE_URL || 'http://localhost:8080';
const PRODUCTOS_SERVICE_URL = process.env.PRODUCTOS_SERVICE_URL || 'http://localhost:3001';
const PURCHASES_SERVICE_URL = process.env.PURCHASES_SERVICE_URL || 'http://localhost:8082';
const PRODUCTOS_DESEADOS_SERVICE_URL = process.env.PRODUCTOS_DESEADOS_SERVICE_URL || 'http://localhost:3003';
const FRONTEND_ROOT = path.resolve(__dirname, '../../frontend/dist/frontend/browser');

const proxy = httpProxy.createProxyServer({
  changeOrigin: true,
  proxyTimeout: 15000,
  timeout: 15000
});

const contentTypes = {
  '.css': 'text/css',
  '.html': 'text/html; charset=utf-8',
  '.js': 'application/javascript',
  '.json': 'application/json',
  '.svg': 'image/svg+xml',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.ico': 'image/x-icon',
  '.woff': 'font/woff',
  '.woff2': 'font/woff2'
};

function serveFrontend(request, response) {
  const requestedPath = decodeURIComponent(request.url.split('?')[0]);
  const relativePath = requestedPath === '/' ? 'index.html' : requestedPath.slice(1);
  const candidate = path.resolve(FRONTEND_ROOT, relativePath);
  const isInsideFrontend = candidate === FRONTEND_ROOT || candidate.startsWith(FRONTEND_ROOT + path.sep);
  const filePath = isInsideFrontend && fs.existsSync(candidate) && fs.statSync(candidate).isFile()
    ? candidate
    : path.join(FRONTEND_ROOT, 'index.html');

  if (!fs.existsSync(filePath)) {
    response.writeHead(404, { 'Content-Type': 'application/json' });
    response.end(JSON.stringify({ message: 'Frontend no compilado. Ejecuta npm --prefix frontend run build.' }));
    return;
  }

  response.writeHead(200, {
    'Content-Type': contentTypes[path.extname(filePath)] || 'application/octet-stream'
  });
  fs.createReadStream(filePath).pipe(response);
}

proxy.on('error', function (error, request, response) {
  if (response.headersSent) {
    response.end();
    return;
  }

  response.writeHead(502, { 'Content-Type': 'application/json' });
  response.end(JSON.stringify({
    message: 'Servicio no disponible o agotó el tiempo de espera',
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

  if (request.url.indexOf('/api/products-wanted') === 0) {
  proxy.web(request, response, { target: PRODUCTOS_DESEADOS_SERVICE_URL });
  return;
}

  if (request.url.indexOf('/api/products') === 0) {
    proxy.web(request, response, { target: PRODUCTOS_SERVICE_URL });
    return;
  }

  serveFrontend(request, response);
});

server.listen(PORT, function () {
  console.log('Gateway running on port ' + PORT);
  console.log('Auth service: ' + AUTH_SERVICE_URL);
  console.log('Products service: ' + PRODUCTOS_SERVICE_URL);
  console.log('Purchases service: ' + PURCHASES_SERVICE_URL);
});