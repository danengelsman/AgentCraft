import type Stripe from "stripe";
import { getStripe, stripeRequestOptions } from "./stripeClient";

const stripe = getStripe();

/**
 * Lower-level helpers (can be used directly if needed)
 */
export interface CreateCustomerParams {
  email: string;
  name?: string;
  metadata?: Stripe.MetadataParam;
}

export async function createCustomer(params: CreateCustomerParams) {
  const customer = await stripe.customers.create(
    {
      email: params.email,
      name: params.name,
      metadata: params.metadata,
    },
    stripeRequestOptions()
  );

  return customer;
}

export interface CreateSubscriptionParams {
  customerId: string;
  priceId: string;
  trialDays?: number;
}

export async function createSubscription(params: CreateSubscriptionParams) {
  const subscription = await stripe.subscriptions.create(
    {
      customer: params.customerId,
      items: [{ price: params.priceId }],
      trial_period_days: params.trialDays,
      expand: ["latest_invoice.payment_intent"],
    },
    stripeRequestOptions()
  );

  return subscription;
}

export async function getCustomerById(customerId: string) {
  return stripe.customers.retrieve(customerId);
}

/**
 * Backwards-compatible service object used in server/routes.ts
 * (import { stripeService } from "./stripeService")
 */
export const stripeService = {
  async createCustomer(email: string, userId: string) {
    // Reuse the helper above so logic is in one place
    return createCustomer({
      email,
      metadata: { userId },
    });
  },

  async createCheckoutSession(
    customerId: string,
    priceId: string,
    successUrl: string,
    cancelUrl: string
  ) {
    const session = await stripe.checkout.sessions.create(
      {
        customer: customerId,
        mode: "subscription",
        line_items: [
          {
            price: priceId,
            quantity: 1,
          },
        ],
        success_url: successUrl,
        cancel_url: cancelUrl,
      },
      stripeRequestOptions()
    );

    return session;
  },
};
