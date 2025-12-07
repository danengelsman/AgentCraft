import express, { type Request, Response, NextFunction } from "express";
import compression from "compression";
import { registerRoutes } from "./routes";
import { setupVite, serveStatic } from "./vite";
import { env } from "./config/env";
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

const app = express();

// Logger
const log = logger.info.bind(logger);

// Early middleware
app.use(compression());
app.use(securityHeaders());
app.use("/api", generalRateLimiter);

// Extend IncomingMessage for rawBody
declare module "http" {
  interface IncomingMessage {
    rawBody: unknown;
  }
}

// ------------------------------
// Stripe Initialization
// ------------------------------
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
    const { webhook, uuid } =
      await stripeSync.findOrCreateManagedWebhook(
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
      .then(() => console.log("Stripe data synced"))
      .catch((err: Error) =>
        console.error("Error syncing Stripe data:", err)
      );
  } catch (error) {
    console.error("Failed to initialize Stripe:", error);
  }
}

await initStripe();

// ------------------------------
// Stripe Webhook Route (raw body)
// ------------------------------
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

// ------------------------------
// Apply JSON middleware AFTER webhook
// ------------------------------
app.use(
  express.json({
    verify: (req, _res, buf) => {
      req.rawBody = buf;
    },
  })
);
app.use(express.urlencoded({ extended: false }));

// ------------------------------
// Request Logging
// ------------------------------
if (env.NODE_ENV === "production") {
  app.use(requestLogger);
} else {
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

// ------------------------------
// Main App Initialization
// ------------------------------
(async () => {
  const server = await registerRoutes(app);

  // 404 BEFORE global error handler
  app.use("/api/*", notFoundHandler);

  // Global error handler (must be last)
  app.use(globalErrorHandler);

  // Vite in dev, static in prod
  if (env.NODE_ENV === "development") {
    await setupVite(app, server);
  } else {
    serveStatic(app);
  }

  // Run server
  const port = Number(process.env.PORT || 5000);

  server.listen(
    {
      port,
      host: "0.0.0.0",
      reusePort: true,
    },
    () => {
      log(`AgentCraft running on port ${port}`);
    }
  );
})();