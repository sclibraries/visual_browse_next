const express = require('express');
const { createServer } = require('https');
const { parse } = require('url');
const next = require('next');
const fs = require('fs');

const dev = process.env.NODE_ENV !== 'production';
const app = next({ dev });
const handle = app.getRequestHandler();

const httpsOptions = {
  key: fs.readFileSync('./key.pem'),
  cert: fs.readFileSync('./cert.pem')
};

app.prepare().then(() => {
  const server = express();

  server.all('*', (req, res) => {
    return handle(req, res);
  });

  createServer(httpsOptions, server).listen(3000, (err) => {
    if (err) throw err;
    console.log('> Ready on https://localhost:3000');
  });
});
