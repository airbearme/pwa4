import 'dotenv/config';
import express, { type Request, Response, NextFunction } from "express";
import helmet from "helmet";
import { registerRoutes } from "./routes.js";
import { setupVite, serveStatic, log } from "./vite.js";

const app = express();
app.use(express.json({
  verify: (req: any, _res, buf) => {
    if (req.originalUrl.startsWith('/api/webhooks/stripe')) {
      req.rawBody = buf;
    }
  }
}));
app.use(express.urlencoded({ extended: false }));

// Security middleware with CSP
app.use(
  helmet({
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        scriptSrc: [
          "'self'",
          "'unsafe-inline'",
          "'unsafe-eval'",
          "https://js.stripe.com",
          "https://unpkg.com",
          "https://cdnjs.cloudflare.com",
          "https://vercel.live",
          "https://*.facebook.com"
        ],
        scriptSrcElem: [
          "'self'",
          "'unsafe-inline'",
          "'unsafe-eval'",
          "https://js.stripe.com",
          "https://unpkg.com",
          "https://cdnjs.cloudflare.com",
          "https://vercel.live",
          "https://*.facebook.com"
        ],
        styleSrc: [
          "'self'",
          "'unsafe-inline'",
          "https://unpkg.com",
          "https://cdnjs.cloudflare.com",
          "https://fonts.googleapis.com"
        ],
        imgSrc: [
          "'self'",
          "data:",
          "blob:",
          "https://*.stripe.com",
          "https://unpkg.com",
          "https://cdnjs.cloudflare.com",
          "https://*.facebook.com",
          "https://*.fbcdn.net"
        ],
        fontSrc: [
          "'self'",
          "https://unpkg.com",
          "https://cdnjs.cloudflare.com",
          "https://fonts.gstatic.com",
          "data:"
        ],
        connectSrc: [
          "'self'",
          "https://*.supabase.co",
          "https://*.stripe.com",
          "https://vercel.live",
          "https://*.facebook.com",
          "wss://*.supabase.co"
        ],
        frameSrc: [
          "'self'",
          "https://js.stripe.com",
          "https://*.facebook.com"
        ],
        mediaSrc: [
          "'self'",
          "https://*.facebook.com",
          "https://*.fbcdn.net"
        ],
        objectSrc: ["'none'"],
        baseUri: ["'self'"],
        formAction: [
          "'self'",
          "https://*.stripe.com",
          "https://*.facebook.com"
        ],
        frameAncestors: ["'none'"],
        upgradeInsecureRequests: []
      }
    },
    crossOriginEmbedderPolicy: false,
  })
);

// Logging middleware
app.use((req, res, next) => {
  const start = Date.now();
  const path = req.path;

  if (path.startsWith("/api")) {
    let capturedJsonResponse: Record<string, any> | undefined = undefined;
    const originalResJson = res.json;
    res.json = function (bodyJson, ...args) {
      capturedJsonResponse = bodyJson;
      return originalResJson.apply(res, [bodyJson, ...args]);
    };

    res.on("finish", () => {
      const duration = Date.now() - start;
      const isProduction = process.env.NODE_ENV === "production";
      const isError = res.statusCode >= 400;

      // Only log if not in production, or if it's an error in production
      if (!isProduction || isError) {
        let logLine = `${req.method} ${path} ${res.statusCode} in ${duration}ms`;
        if (capturedJsonResponse && !isProduction) {
          logLine += ` :: ${JSON.stringify(capturedJsonResponse)}`;
        }

        if (logLine.length > 200) {
          logLine = logLine.slice(0, 199) + "…";
        }

        log(logLine);
      }
    });
  }

  next();
});

export async function createApp() {
  const server = await registerRoutes(app);

  app.use((err: any, req: Request, res: Response, _next: NextFunction) => {
    const status = err.status || err.statusCode || 500;
    const message = err.message || "Internal Server Error";

    // Log the error for server-side debugging
    console.error(`[Fatal Error] ${req.method} ${req.path}:`, err);

    res.status(status).json({ message });
  });

  if (app.get("env") === "development") {
    await setupVite(app, server);
  } else {
    serveStatic(app);
  }

  return { app, server };
}

// Only start the server if this file is run directly (not as a module)
if (import.meta.url === `file://${process.argv[1]}` || process.env.NODE_ENV !== 'production' || !process.env.VERCEL) {
  (async () => {
    const { server } = await createApp();
    const port = parseInt(process.env.PORT || '5000', 10);
    server.listen({
      port,
      host: "0.0.0.0",
      reusePort: true,
    }, () => {
      log(`serving on port ${port}`);
    });
  })();
}

export default app;
