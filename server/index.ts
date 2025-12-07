import express from "express";
import compression from "compression";
import { registerRoutes } from "./routes";
import { setupVite, serveStatic } from "./vite";
import { config, isProduction } from "./config/production";
import logger, { requestLogger } from "./services/logger";
import {
  securityHeaders,
  generalRateLimiter,
  sanitizeInput,
} from "./middleware/security";
import {
  globalErrorHandler,
  notFoundHandler,
} from "./middleware/errorHandler";
import { runMigrations } from "stripe-replit-sync";
import { getStripeSync } from "./stripeClient";
import { WebhookHandlers } from "./webhookHandlers";
import { env } from "./config/env";

const app = express();

// Initialize logger
const log = logger.info.bind(logger);

// -----------------------------------------------------------------------------
// Core middleware
// -----------------------------------------------------------------------------

// Compression (early)
app.use(compression());

// Security headers
app.use(securityHeaders());

// Rate limiting for API routes
app.use("/api", generalRateLimiter);

// If you want to use input sanitization globally later:
// app.use(sanitizeInput);

declare module "http" {
  interface IncomingMessage {
    rawBody: unknown;
  }
}

// -----------------------------------------------------------------------------
// Stripe initialization
// -----------------------------------------------------------------------------

async function initStripe() {
  try {
    console.log("Initializing Stripe schema...");

    await runMigrations({
      databaseUrl: env.DATABASE_URL,
    });

    console.log("Stripe schema ready");

    const stripeSync = await getStripeSync();

    console.log("Setting up managed webhook...");

    const webhookBaseUrl = `https://${process.env.REPLIT_DOMAINS?.split(",")[0]}`;

    const { webhook, uuid } = await stripeSync.findOrCreateManagedWebhook(
      `${webhookBaseUrl}/api/stripe/webhook`,
      {
        enabled_events: ["*"],
        description: "Managed webhook for Stripe sync",
      }
    );

    console.log(`Webhook configured: ${webhook.url}`);

    console.log("Syncing Stripe data...");
    stripeSync
      .syncBackfill()
      .then(() => {
        console.log("Stripe data synced");
      })
      .catch((err: Error) => {
        console.error("Error syncing Stripe data:", err);
      });
  } catch (error) {
    console.error("Failed to initialize Stripe:", error);
  }
}

await initStripe();

// -----------------------------------------------------------------------------
// Stripe webhook route (must use raw body, before express.json)
// -----------------------------------------------------------------------------

app.post(
  "/api/stripe/webhook/:uuid",
  express.raw({ type: "application/json" }),
  async (req, res) => {
    const signature = req.headers["stripe-signature"];

    if (!signature) {
      return res.status(400).json({ error: "Missing stripe-signature" });
    }

    try {
      const sig = Array.isArray(signature) ? signature[0] : signature;

      if (!Buffer.isBuffer(req.body)) {
        console.error("Webhook body is not a Buffer");
        return res.status(500).json({ error: "Webhook processing error" });
      }

      const { uuid } = req.params;
      await WebhookHandlers.processWebhook(
        req.body as Buffer,
        sig,
        uuid
      );

      res.status(200).json({ received: true });
    } catch (error: any) {
      console.error("Webhook error:", error.message);
      res.status(400).json({ error: "Webhook processing error" });
    }
  }
);

// -----------------------------------------------------------------------------
// JSON / URL-encoded middleware (after webhook)
// -----------------------------------------------------------------------------

app.use(
  express.json({
    verify: (req, _res, buf) => {
      // keep original raw body available for any other handlers that need it
      req.rawBody = buf;
    },
  })
);

app.use(express.urlencoded({ extended: false }));

// -----------------------------------------------------------------------------
// Logging
// -----------------------------------------------------------------------------

if (isProduction) {
  // Structured logging in production
  app.use(requestLogger);
} else {
  // Simple console logging in development
  app.use((req, res, next) => {
    const start = Date.now();
    const path = req.path;
let capturedJsonResponse: Record<string, any> | undefined;
    

    const originalResJson = res.json;
    res.json = function (bodyJson, ...args) {
      capturedJsonResponse = bodyJson;
      return originalResJson.apply(res, [bodyJson, ...args]);
    };

    res.on("finish", () => {
      const duration = Date.now() - start;
      if (path.startsWith("/api")) {
        let logLine = `${req.method} ${path} ${res.statusCode} in ${duration}ms`;
        if (capturedJsonResponse) {
          logLine += ` :: ${JSON.stringify(capturedJsonResponse)}`;
        }

        if (logLine.length > 80) {
          logLine = logLine.slice(0, 79) + "…";
        }

        console.log(logLine);
      }
    });

    next();
  });
}

// -----------------------------------------------------------------------------
// Main bootstrap
// -----------------------------------------------------------------------------

(async () => {
  const server = await registerRoutes(app);

  // 404 handler - must be before error handler
  app.use("/api/*", notFoundHandler);

  // Global error handler - must be last
  app.use(globalErrorHandler);

  // Setup Vite or static serving
  if (app.get("env") === "development") {
    await setupVite(app, server);
  } else {
    serveStatic(app);
  }

  // Always use PORT env var when available, fallback to env.PORT default
  const port = Number(process.env.PORT ?? env.PORT);

  server.listen(
    {
      port,
      host: "0.0.0.0",
      reusePort: true,
    },
    () => {
      log(`serving on port ${port}`);
    }
  );
})();