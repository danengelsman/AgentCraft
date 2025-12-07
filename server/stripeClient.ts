import Stripe from "stripe";
import { env } from "./config/env";

const stripeVersion: Stripe.LatestApiVersion = "2023-10-16";

let stripe: Stripe | null = null;

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
 * to many Stripe calls (like idempotency keys).
 */
export function stripeRequestOptions(
  opts?: Stripe.RequestOptions
): Stripe.RequestOptions {
  return {
    ...opts,
  };
}
export async function getStripePublishableKey(): Promise<string> {
  // Try a couple of common env names so it's flexible
  const key =
    process.env.STRIPE_PUBLISHABLE_KEY ??
    process.env.VITE_STRIPE_PUBLISHABLE_KEY ??
    "";

  if (!key) {
    throw new Error("Stripe publishable key is not configured");
  }

  return key;
}
