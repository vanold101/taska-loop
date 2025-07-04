import { loadStripe } from '@stripe/stripe-js';

// Load Stripe publishable key from environment
const stripePublishableKey = import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY;

if (!stripePublishableKey) {
  console.warn('Stripe publishable key not found. Subscription features will be disabled.');
}

// Initialize Stripe instance
export const stripePromise = stripePublishableKey ? loadStripe(stripePublishableKey) : null;

// Product and Price IDs - these would be created in your Stripe Dashboard
export const STRIPE_PRODUCTS = {
  plus: {
    priceId: 'price_1Otest_plus_monthly', // Replace with actual Stripe Price ID
    productId: 'prod_test_plus', // Replace with actual Stripe Product ID
    name: 'TaskaLoop Plus',
    price: 4.99,
    interval: 'month'
  },
  family: {
    priceId: 'price_1Otest_family_monthly', // Replace with actual Stripe Price ID
    productId: 'prod_test_family', // Replace with actual Stripe Product ID
    name: 'TaskaLoop Family',
    price: 8.99,
    interval: 'month'
  }
} as const;

// Helper function to get price ID for a tier
export const getStripePriceId = (tier: 'plus' | 'family'): string | null => {
  return STRIPE_PRODUCTS[tier]?.priceId || null;
};

// Check if Stripe is available
export const isStripeAvailable = (): boolean => {
  return !!stripePublishableKey && !!stripePromise;
};

// Subscription status mapping
export const STRIPE_SUBSCRIPTION_STATUS = {
  ACTIVE: 'active',
  INCOMPLETE: 'incomplete',
  INCOMPLETE_EXPIRED: 'incomplete_expired',
  TRIALING: 'trialing',
  PAST_DUE: 'past_due',
  CANCELED: 'canceled',
  UNPAID: 'unpaid'
} as const; 