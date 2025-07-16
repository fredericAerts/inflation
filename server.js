import express from 'express';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import http from 'node:http';
import os from 'os';

import createApiRouter from './server/routers/api.router.js';

import {
  injectStaticMiddleware,
  parseManifest,
  serveStatic,
  startViteServer,
  isStaticFilePath,
} from './server.utils.js';

/*  Globals
======================================================== */
dotenv.config();

const app = express();
const server = http.createServer(app);
const port = global.port = (process.env.NODE_ENV === 'production') ? process.env.PORT : 8080;
const manifest = process.env.NODE_ENV === 'production' ? await parseManifest() : {};

/*  Database
    ======================================================== */
mongoose.connect(`mongodb://${process.env.DB_USER}:${encodeURIComponent(process.env.DB_PASS)}@${process.env.DB_IP}:27017/${process.env.DB_NAME}?authSource=admin`)
  .then(() => console.log('db opened'))
  .catch(err => console.error('db connection error...', err));

/*  Development config
======================================================== */
if (process.env.NODE_ENV !== 'production') {
  const ipAddress = Object.values(os.networkInterfaces()).flat()
    .find(addr => addr.family === 'IPv4' && !addr.internal).address;
  const vite = await startViteServer(server);
  await injectStaticMiddleware(app, vite.middlewares);

  console.log(
    '\nApp running at:\n',
    `- Local:   \x1b[36mhttp://localhost:\x1b[1m${port}\x1b[0m\n`,
    `- Network: \x1b[36mhttp://${ipAddress}:\x1b[1m${port}\x1b[0m\n`,
    '\n\x1b[90mPress ctrl + click to follow link\x1b[0m\n',
  );
} else {
  await injectStaticMiddleware(app, await serveStatic());
}

/*  Views config
    ======================================================== */
app.set('views', './server/views');
app.set('view engine', 'ejs');

/*  Form Data Uploads
    ======================================================== */
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

/*  Routing
    ======================================================== */
app.get('/robots.txt', (_req, res) => {
  res.type('text/plain');
  res.send('User-agent: *\nDisallow:');
});

app.use('/api', createApiRouter());

app.get('*', (req, res, next) => {
  if (process.env.NODE_ENV !== 'production' && isStaticFilePath(req.path)) {
    next();
  }

  res.render('index', { manifest });
});

server.listen(port, () => {
  if (process.env.NODE_ENV === 'production') {
    console.log('Listening on', port);
  }
});

export default app;