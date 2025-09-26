// Unified entry to run the backend + serve the frontend build
// Usage: NODE_ENV=production node App.js
import fs from 'fs';
import path from 'path';
import express from 'express';

export async function main({ port = process.env.PORT || 3000 } = {}) {
  const app = express();
  let serverApp = null;

  // Try to use the compiled server if available
  const distServer = path.resolve('dist/server/production.mjs');
  if (fs.existsSync(distServer)) {
    const mod = await import('file://' + distServer);
    if (typeof mod.createServer === 'function') {
      serverApp = mod.createServer();
    }
  }

  if (!serverApp) {
    // Fallback minimal API
    serverApp = express();
    serverApp.get('/api/ping', (_req, res) => res.json({ message: 'ping' }));
  }

  // Mount API first
  app.use(serverApp);

  // Serve SPA build
  const distSpa = path.resolve('dist/spa');
  if (fs.existsSync(distSpa)) {
    app.use(express.static(distSpa));
    app.get('*', (req, res) => {
      if (req.path.startsWith('/api/')) return res.status(404).json({ error: 'API endpoint not found' });
      res.sendFile(path.join(distSpa, 'index.html'));
    });
  }

  return new Promise((resolve) => {
    const listener = app.listen(port, () => {
      console.log(`Lazy AI running on http://localhost:${listener.address().port}`);
      resolve(listener);
    });
  });
}

if (import.meta.url === `file://${process.argv[1]}`) {
  main();
}
