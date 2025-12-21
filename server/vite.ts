
import express, { type Express } from "express";
import fs from "fs";
import path from "path";
import { type Server } from "http";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

export function log(message: string, source = "express") {
  const formattedTime = new Date().toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
    second: "2-digit",
    hour12: true,
  });

  console.log(`${formattedTime} [${source}] ${message}`);
}

export async function setupVite(app: Express, server: Server) {
  console.log("Setting up Vite...");
  const { createServer: createViteServer } = await import("vite");

  const vite = await createViteServer({
    server: { middlewareMode: true },
    appType: 'spa', // Let Vite handle SPA fallbacks
    root: path.resolve(__dirname, '..', 'client'),
    configFile: path.resolve(__dirname, '..', 'vite.config.ts'),
  });

  // Use vite's connect instance as middleware.
  app.use(vite.middlewares);

  // Handle WebSocket upgrades for HMR
  server.on('upgrade', (req, socket, head) => {
    // Ensure the request is meant for the Vite WS server
    if (req.headers['upgrade'] === 'websocket') {
      (vite.ws as any).handleUpgrade(req, socket, head);
    }
  });

  console.log("Vite middlewares and WebSocket proxy enabled.");
}

export function serveStatic(app: Express) {
  const distPath = path.resolve(__dirname, "public");

  if (!fs.existsSync(distPath)) {
    if (process.env.VERCEL) {
      log(`Static directory ${distPath} not found, but continuing for Vercel deployment`, 'express');
      return;
    }
    throw new Error(
      `Could not find the build directory: ${distPath}, make sure to build the client first`,
    );
  }

  // Static assets with aggressive caching
  app.use(express.static(distPath, {
    maxAge: '1y',
    immutable: true,
    setHeaders: (res, path) => {
      // Don't cache the service worker or manifest
      if (path.endsWith('sw.js') || path.endsWith('manifest.json') || path.endsWith('index.html')) {
        res.setHeader('Cache-Control', 'public, max-age=0, must-revalidate');
      }
    }
  }));

  // fall through to index.html if the file doesn't exist
  app.use("*", (_req, res) => {
    res.setHeader('Cache-Control', 'public, max-age=0, must-revalidate');
    res.sendFile(path.resolve(distPath, "index.html"));
  });
}
