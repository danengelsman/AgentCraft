import Stripe from "stripe";
import { env } from "./config/env";

const stripeVersion: Stripe.LatestApiVersion = "2023-10-16";

let stripe: Stripe | null = null;

/**
 * Main Stripe server-side client (secret key).
 */
export function getStripe(): Stripe {
  if (!stripe) {
    stripe = new Stripe(env.STRIPE_SECRET_KEY, {
      apiVersion: stripeVersion,
    });
  }
  return stripe;
}

/**
 * Convenience helper if you want to pass common options
 * (idempotency keys, etc.) into Stripe calls.
 */
export function stripeRequestOptions(
  opts?: Stripe.RequestOptions
): Stripe.RequestOptions {
  return {
    ...opts,
  };
}

/**
 * Publishable key for the frontend (client-side Stripe).
 * Reads from common env var names. Configure one of these
 * in Render:
 *   - STRIPE_PUBLISHABLE_KEY
 *   - VITE_STRIPE_PUBLISHABLE_KEY
 */
export async function getStripePublishableKey(): Promise<string> {
  const key =
    process.env.STRIPE_PUBLISHABLE_KEY ??
    process.env.VITE_STRIPE_PUBLISHABLE_KEY ??
    "";

  if (!key) {
    console.warn(
      "Stripe publishable key is not configured (STRIPE_PUBLISHABLE_KEY / VITE_STRIPE_PUBLISHABLE_KEY)."
    );
  }

  return key;
}

/**
 * TEMP: minimal stub for stripe sync so the app builds.
 * Your code calls:
 *   const stripeSync = await getStripeSync();
 *   stripeSync.findOrCreateManagedWebhook(...)
 *   stripeSync.syncBackfill()
 *
 * This implementation simply logs and returns no-op handlers
 * so the app can start without crashing. You can replace this
 * later with a real stripe-replit-sync integration.
 */
export async function getStripeSync(): Promise<{
  findOrCreateManagedWebhook: (
    url: string,
    opts?: { enabled_events?: string[]; description?: string }
  ) => Promise<{ webhook: { url: string }; uuid: string }>;
  syncBackfill: () => Promise<void>;
}> {
  console.warn(
    "getStripeSync stub: stripe-replit-sync is not wired; using no-op sync implementation."
  );

  return {
    async findOrCreateManagedWebhook(url, opts) {
      console.warn(
        "Stripe sync stub: findOrCreateManagedWebhook called for",
        url,
        "with options",
        opts
      );
      // Return a fake webhook + uuid so calling code can continue
      return {
        webhook: { url },
        uuid: "",
      };
    },

    async syncBackfill() {
      console.warn("Stripe sync stub: syncBackfill called (no-op).");
    },
  };
}
