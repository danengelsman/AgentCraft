import type Stripe from "stripe";
import { getStripe, stripeRequestOptions } from "./stripeClient";

const stripe = getStripe();

// Example domain types – adjust to your needs
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

// Add more helpers here as you define your billing model:
// - listProducts / listPrices
// - createPortalSession
// - cancelSubscription
// - etc.