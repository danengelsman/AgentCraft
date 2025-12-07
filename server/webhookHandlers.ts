import type Stripe from "stripe";
import { getStripe } from "./stripeClient";

const stripe = getStripe();

export class WebhookHandlers {
  static async processWebhook(
    rawBody: Buffer,
    signature: string,
    expectedUuid: string
  ): Promise<void> {
    if (!expectedUuid) {
      console.warn("Received webhook without UUID");
    }

    const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET;
    if (!endpointSecret) {
      console.warn(
        "STRIPE_WEBHOOK_SECRET not set; skipping signature verification"
      );
      return;
    }

    let event: Stripe.Event;

    try {
      event = stripe.webhooks.constructEvent(rawBody, signature, endpointSecret);
    } catch (err: any) {
      console.error("Stripe webhook signature verification failed:", err.message);
      throw err;
    }

    switch (event.type) {
      case "customer.subscription.created":
      case "customer.subscription.updated":
      case "customer.subscription.deleted": {
        const subscription = event.data.object as Stripe.Subscription;
        await this.handleSubscriptionEvent(subscription);
        break;
      }

      case "checkout.session.completed": {
        const session = event.data.object as Stripe.Checkout.Session;
        await this.handleCheckoutCompleted(session);
        break;
      }

      default:
        console.log(`Unhandled Stripe event type: ${event.type}`);
    }
  }

  private static async handleSubscriptionEvent(
    subscription: Stripe.Subscription
  ) {
    // TODO: persist subscription status to your DB
    // e.g. upsert workspace billing state
    console.log("Subscription event:", {
      id: subscription.id,
      status: subscription.status,
      customer: subscription.customer,
    });
  }

  private static async handleCheckoutCompleted(
    session: Stripe.Checkout.Session
  ) {
    // TODO: link checkout session to user/workspace in your DB
    console.log("Checkout completed:", {
      id: session.id,
      customer: session.customer,
      subscription: session.subscription,
    });
  }
}