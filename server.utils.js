import expressStaticGzip from 'express-static-gzip';
import fs from 'node:fs';
import pc from 'picocolors';
import path from 'node:path';

/*  Helpers
======================================================== */
function info(msg) {
  const timestamp = new Date().toLocaleString('nl-BE').split(' ')[1].trim();
  console.log(
    `${pc.dim(timestamp)} ${pc.bold(pc.cyan('[vite-express]'))} ${pc.green(
      msg,
    )}`,
  );
}

async function getDistPath() {
  const config = await resolveConfig();
  return path.resolve(config.root, config.build.outDir);
}

async function resolveConfig() {
  const { resolveConfig: resolveViteConfig } = await import('vite');
  return resolveViteConfig({}, 'build');
}

/*  Exports
======================================================== */
function isStaticFilePath(filePath) {
  return filePath.match(/(\.\w+$)|@vite|@id|@react-refresh/);
}

async function parseManifest() {
  const config = await resolveConfig();
  const manifestPath = path.resolve(config.root, config.build.outDir, '.vite/manifest.json');
  const manifest = fs.readFileSync(manifestPath);
  return JSON.parse(manifest);
}

async function serveStatic() {
  const distPath = await getDistPath();

  if (!fs.existsSync(distPath)) {
    info(`${pc.red(`Static files at ${pc.gray(distPath)} not found!`)}`);
    info(
      `${pc.yellow(
        `Did you forget to run ${pc.bold(pc.green('vite build'))} command?`,
      )}`,
    );
  } else {
    info(`${pc.green(`Serving static files from ${pc.gray(distPath)}`)}`);
  }

  return expressStaticGzip(distPath, { index: false });
}

async function injectStaticMiddleware(
  app,
  middleware,
) {
  const config = await resolveConfig();
  const base = config.base || '/';
  app.use(base, middleware);
}

async function startViteServer(server) {
  const { createServer } = await import('vite');

  const vite = await createServer({
    clearScreen: false,
    appType: 'custom',
    server: { middlewareMode: true },
  });

  server.on('close', () => vite.close());

  return vite;
}

export {
  injectStaticMiddleware,
  isStaticFilePath,
  parseManifest,
  serveStatic,
  startViteServer,
};