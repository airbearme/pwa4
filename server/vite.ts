
import express, { type Express } from "express";
import fs from "fs";
import path from "path";
import { createServer as createViteServer } from "vite";
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
      vite.ws.handleUpgrade(req, socket, head);
    }
  });

  console.log("Vite middlewares and WebSocket proxy enabled.");
}

export function serveStatic(app: Express) {
  const distPath = path.resolve(process.cwd(), "dist", "public");
  console.log(`Serving static files from: ${distPath}`);

  if (!fs.existsSync(distPath)) {
    throw new Error(
      `Could not find the build directory: ${distPath}, make sure to build the client first`,
    );
  }

  // This is the fix: Express is having trouble with the wildcard matching
  // for nested directories. By explicitly serving the assets directory,
  // we can ensure that the JS and CSS files are found.
  app.use("/assets", express.static(path.join(distPath, "assets")));

  // We still need to serve the root `distPath` for files like `index.html`
  app.use(express.static(distPath));

  // fall through to index.html if the file doesn't exist
  app.use("*", (_req, res) => {
    res.sendFile(path.resolve(distPath, "index.html"));
  });
}
