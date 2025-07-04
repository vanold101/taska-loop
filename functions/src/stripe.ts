import Stripe from 'stripe';

// Initialize Stripe with secret key
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || '', {
  apiVersion: '2025-05-28.basil',
});

// Stripe Product and Price configuration
const STRIPE_PRODUCTS = {
  plus: {
    priceId: process.env.STRIPE_PLUS_PRICE_ID || 'price_1Otest_plus_monthly',
    productId: process.env.STRIPE_PLUS_PRODUCT_ID || 'prod_test_plus',
  },
  family: {
    priceId: process.env.STRIPE_FAMILY_PRICE_ID || 'price_1Otest_family_monthly',
    productId: process.env.STRIPE_FAMILY_PRODUCT_ID || 'prod_test_family',
  }
};

interface CreateCheckoutSessionRequest {
  priceId: string;
  userEmail: string;
  userId: string;
  tier: 'plus' | 'family';
  successUrl: string;
  cancelUrl: string;
}

interface CreatePortalSessionRequest {
  customerId: string;
  returnUrl: string;
}

/**
 * Create a Stripe Checkout Session for subscription
 */
export async function createCheckoutSession(req: CreateCheckoutSessionRequest) {
  try {
    // First, find or create a customer
    let customer: Stripe.Customer;
    
    // Try to find existing customer by email
    const existingCustomers = await stripe.customers.list({
      email: req.userEmail,
      limit: 1,
    });
    
    if (existingCustomers.data.length > 0) {
      customer = existingCustomers.data[0];
    } else {
      // Create new customer
      customer = await stripe.customers.create({
        email: req.userEmail,
        metadata: {
          userId: req.userId,
        },
      });
    }

    // Create the checkout session
    const session = await stripe.checkout.sessions.create({
      customer: customer.id,
      payment_method_types: ['card'],
      mode: 'subscription',
      line_items: [
        {
          price: req.priceId,
          quantity: 1,
        },
      ],
      success_url: req.successUrl,
      cancel_url: req.cancelUrl,
      metadata: {
        userId: req.userId,
        tier: req.tier,
      },
      allow_promotion_codes: true,
      billing_address_collection: 'auto',
      customer_update: {
        address: 'auto',
      },
    });

    return {
      sessionId: session.id,
      url: session.url,
    };
  } catch (error) {
    console.error('Error creating checkout session:', error);
    throw error;
  }
}

/**
 * Create a Customer Portal session
 */
export async function createPortalSession(req: CreatePortalSessionRequest) {
  try {
    const session = await stripe.billingPortal.sessions.create({
      customer: req.customerId,
      return_url: req.returnUrl,
    });

    return {
      url: session.url,
    };
  } catch (error) {
    console.error('Error creating portal session:', error);
    throw error;
  }
}

/**
 * Get customer subscription by user ID
 */
export async function getCustomerSubscription(userId: string) {
  try {
    // Find customer by user ID in metadata
    const customers = await stripe.customers.list({
      limit: 100,
    });
    
    const customer = customers.data.find(c => c.metadata.userId === userId);
    
    if (!customer) {
      return null;
    }

    // Get active subscriptions for this customer
    const subscriptions = await stripe.subscriptions.list({
      customer: customer.id,
      status: 'active',
      limit: 1,
    });

    if (subscriptions.data.length === 0) {
      return null;
    }

    const subscription = subscriptions.data[0];
    const priceId = subscription.items.data[0].price.id;
    
    // Determine tier based on price ID
    let tier: 'plus' | 'family' = 'plus';
    if (priceId === STRIPE_PRODUCTS.family.priceId) {
      tier = 'family';
    }

    return {
      id: subscription.id,
      status: subscription.status,
      currentPeriodEnd: (subscription as any).current_period_end,
      priceId,
      customerId: customer.id,
      tier,
    };
  } catch (error) {
    console.error('Error getting customer subscription:', error);
    throw error;
  }
}

/**
 * Cancel a subscription
 */
export async function cancelSubscription(subscriptionId: string) {
  try {
    const subscription = await stripe.subscriptions.cancel(subscriptionId);
    return subscription;
  } catch (error) {
    console.error('Error cancelling subscription:', error);
    throw error;
  }
}

/**
 * Handle Stripe webhooks
 */
export async function handleWebhook(rawBody: string, signature: string) {
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;
  
  if (!webhookSecret) {
    throw new Error('Webhook secret not configured');
  }

  try {
    const event = stripe.webhooks.constructEvent(rawBody, signature, webhookSecret);
    
    switch (event.type) {
      case 'checkout.session.completed':
        await handleCheckoutCompleted(event.data.object as Stripe.Checkout.Session);
        break;
        
      case 'customer.subscription.created':
        await handleSubscriptionCreated(event.data.object as Stripe.Subscription);
        break;
        
      case 'customer.subscription.updated':
        await handleSubscriptionUpdated(event.data.object as Stripe.Subscription);
        break;
        
      case 'customer.subscription.deleted':
        await handleSubscriptionDeleted(event.data.object as Stripe.Subscription);
        break;
        
      case 'invoice.payment_succeeded':
        await handlePaymentSucceeded(event.data.object as Stripe.Invoice);
        break;
        
      case 'invoice.payment_failed':
        await handlePaymentFailed(event.data.object as Stripe.Invoice);
        break;
        
      default:
        console.log(`Unhandled event type: ${event.type}`);
    }
    
    return { received: true };
  } catch (error) {
    console.error('Webhook error:', error);
    throw error;
  }
}

// Webhook handlers
async function handleCheckoutCompleted(session: Stripe.Checkout.Session) {
  console.log('Checkout completed:', session.id);
  // Here you would update your database to reflect the new subscription
  // For example, update user's tier in your database
}

async function handleSubscriptionCreated(subscription: Stripe.Subscription) {
  console.log('Subscription created:', subscription.id);
  // Update user's subscription status in your database
}

async function handleSubscriptionUpdated(subscription: Stripe.Subscription) {
  console.log('Subscription updated:', subscription.id);
  // Update user's subscription status in your database
}

async function handleSubscriptionDeleted(subscription: Stripe.Subscription) {
  console.log('Subscription deleted:', subscription.id);
  // Update user's subscription status in your database (downgrade to free)
}

async function handlePaymentSucceeded(invoice: Stripe.Invoice) {
  console.log('Payment succeeded:', invoice.id);
  // Handle successful payment (e.g., send confirmation email)
}

async function handlePaymentFailed(invoice: Stripe.Invoice) {
  console.log('Payment failed:', invoice.id);
  // Handle failed payment (e.g., send notification to user)
}

export { stripe }; 