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