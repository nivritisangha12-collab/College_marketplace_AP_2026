
const http = require('http');
const { HTTP_DEMO_PORT } = require('./config/database');

const server = http.createServer((req, res) => {
  const { method, url } = req;
  const timestamp = new Date().toISOString();

  console.log(`[HTTP DEMO] ${method} ${url}`);

  if (url === '/demo' || url === '/') {
    res.writeHead(200, {
      'Content-Type': 'application/json',
      'X-Powered-By': 'NodeJS-HTTP-Module-AP-Demo'
    });
    const responsePayload = {
      message: 'CampusXchange HTTP Module Demonstration',
      syllabus_topic: 'HTTP Module (Request / Response)',
      request_info: {
        method,
        url,
        timestamp
      },
      status_code: 200
    };
    return res.end(JSON.stringify(responsePayload, null, 2));
  }


  res.writeHead(404, { 'Content-Type': 'application/json' });
  return res.end(JSON.stringify({
    error: 'HTTP Module 404 Not Found',
    requested_url: url,
    status_code: 404
  }));
});

server.listen(HTTP_DEMO_PORT, () => {
  console.log(`==================================================`);
  console.log(` Low-Level Node.js HTTP Module Demo Server Running `);
  console.log(` URL: http://localhost:${HTTP_DEMO_PORT}/demo`);
  console.log(`==================================================`);
});

module.exports = server;
