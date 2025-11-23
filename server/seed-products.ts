import { getUncachableStripeClient } from './stripeClient';

async function createProducts() {
  const stripe = await getUncachableStripeClient();

  try {
    console.log('Creating AgentCraft Pro Plan...');

    // Check if Pro product already exists
    const existingProducts = await stripe.products.search({
      query: "name:'AgentCraft Pro'",
    });

    if (existingProducts.data.length > 0) {
      console.log('AgentCraft Pro already exists');
      return;
    }

    // Create Pro product
    const product = await stripe.products.create({
      name: 'AgentCraft Pro',
      description: 'Professional subscription for growing businesses',
      metadata: {
        tier: 'pro',
        agents: '10',
        messages: 'unlimited',
      },
    });

    console.log(`Created product: ${product.id}`);

    // Create monthly price
    const monthlyPrice = await stripe.prices.create({
      product: product.id,
      unit_amount: 4900, // $49.00
      currency: 'usd',
      recurring: {
        interval: 'month',
      },
      metadata: {
        tier: 'pro',
      },
    });

    console.log(`Created monthly price: ${monthlyPrice.id}`);

    // Create annual price (10% discount)
    const annualPrice = await stripe.prices.create({
      product: product.id,
      unit_amount: 52920, // $529.20 (12 * $49 - 10% discount)
      currency: 'usd',
      recurring: {
        interval: 'year',
      },
      metadata: {
        tier: 'pro',
      },
    });

    console.log(`Created annual price: ${annualPrice.id}`);
    console.log('\nProduct created successfully!');
    console.log('Monthly Price ID:', monthlyPrice.id);
    console.log('Annual Price ID:', annualPrice.id);
  } catch (error) {
    console.error('Error creating product:', error);
    throw error;
  }
}

createProducts();
