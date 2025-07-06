import { stripePromise, getStripePriceId, isStripeAvailable, STRIPE_SUBSCRIPTION_STATUS } from './stripeConfig';
import { SubscriptionTier } from '../context/SubscriptionContext';

export interface StripeCustomer {
  id: string;
  email: string;
  name?: string;
}

export interface StripeSubscription {
  id: string;
  status: string;
  currentPeriodEnd: number;
  priceId: string;
  customerId: string;
  tier: SubscriptionTier;
}

export interface CheckoutSessionResponse {
  sessionId: string;
  url: string;
}

class StripeService {
  private apiUrl: string;

  constructor() {
    this.apiUrl = import.meta.env.VITE_APP_URL || 'http://localhost:5173';
  }

  /**
   * Check if Stripe is properly configured
   */
  isConfigured(): boolean {
    return isStripeAvailable();
  }

  /**
   * Create a Stripe Checkout Session for subscription
   */
  async createCheckoutSession(
    tier: 'plus' | 'premium',
    userEmail: string,
    userId: string
  ): Promise<CheckoutSessionResponse> {
    if (!this.isConfigured()) {
      throw new Error('Stripe is not properly configured');
    }

    const priceId = getStripePriceId(tier);
    if (!priceId) {
      throw new Error(`No price ID found for tier: ${tier}`);
    }

    try {
      // In a real app, this would call your backend API
      const response = await fetch('/api/stripe/create-checkout-session', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          priceId,
          userEmail,
          userId,
          tier,
          successUrl: `${this.apiUrl}/subscription-success?session_id={CHECKOUT_SESSION_ID}`,
          cancelUrl: `${this.apiUrl}/subscription-cancelled`,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to create checkout session');
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error creating checkout session:', error);
      
      // For demo purposes, return a mock response
      console.warn('Stripe backend not implemented. Returning mock checkout session.');
      return {
        sessionId: 'cs_test_demo_session_id',
        url: '#'
      };
    }
  }

  /**
   * Redirect to Stripe Checkout
   */
  async redirectToCheckout(sessionId: string): Promise<void> {
    if (!this.isConfigured()) {
      throw new Error('Stripe is not properly configured');
    }

    const stripe = await stripePromise;
    if (!stripe) {
      throw new Error('Failed to load Stripe');
    }

    const { error } = await stripe.redirectToCheckout({
      sessionId,
    });

    if (error) {
      throw new Error(error.message);
    }
  }

  /**
   * Create subscription checkout flow
   */
  async subscribeTo(
    tier: 'plus' | 'premium',
    userEmail: string,
    userId: string
  ): Promise<void> {
    try {
      const session = await this.createCheckoutSession(tier, userEmail, userId);
      
      // For demo purposes, just show a message
      if (session.sessionId === 'cs_test_demo_session_id') {
        alert(`Demo: Would redirect to Stripe Checkout for ${tier} subscription.\n\nIn production, this would:\n1. Create a Stripe Customer\n2. Generate a Checkout Session\n3. Redirect to secure Stripe payment page\n4. Handle webhooks for subscription updates`);
        return;
      }
      
      await this.redirectToCheckout(session.sessionId);
    } catch (error) {
      console.error('Error in subscription flow:', error);
      throw error;
    }
  }

  /**
   * Get customer subscription status
   */
  async getCustomerSubscription(userId: string): Promise<StripeSubscription | null> {
    try {
      const response = await fetch(`/api/stripe/subscription/${userId}`, {
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (response.status === 404) {
        return null; // No subscription found
      }

      if (!response.ok) {
        throw new Error('Failed to fetch subscription');
      }

      const subscription = await response.json();
      return subscription;
    } catch (error) {
      console.error('Error fetching subscription:', error);
      
      // For demo purposes, return null (no subscription)
      return null;
    }
  }

  /**
   * Cancel subscription
   */
  async cancelSubscription(subscriptionId: string): Promise<void> {
    try {
      const response = await fetch(`/api/stripe/subscription/${subscriptionId}/cancel`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error('Failed to cancel subscription');
      }
    } catch (error) {
      console.error('Error cancelling subscription:', error);
      throw error;
    }
  }

  /**
   * Create customer portal session for managing billing
   */
  async createPortalSession(customerId: string): Promise<{ url: string }> {
    try {
      const response = await fetch('/api/stripe/create-portal-session', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          customerId,
          returnUrl: `${this.apiUrl}/profile`,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to create portal session');
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error creating portal session:', error);
      
      // For demo purposes, return a mock URL
      return {
        url: 'https://billing.stripe.com/session/demo'
      };
    }
  }

  /**
   * Open customer portal for billing management
   */
  async openCustomerPortal(customerId: string): Promise<void> {
    try {
      const session = await this.createPortalSession(customerId);
      
      // For demo purposes, just show a message
      if (session.url === 'https://billing.stripe.com/session/demo') {
        alert('Demo: Would redirect to Stripe Customer Portal.\n\nIn production, this would open a secure portal where customers can:\n• Update payment methods\n• Download invoices\n• Manage subscription\n• View billing history');
        return;
      }
      
      window.open(session.url, '_blank');
    } catch (error) {
      console.error('Error opening customer portal:', error);
      throw error;
    }
  }

  /**
   * Convert Stripe subscription status to app tier
   */
  getSubscriptionTier(subscription: StripeSubscription | null): SubscriptionTier {
    if (!subscription || subscription.status !== STRIPE_SUBSCRIPTION_STATUS.ACTIVE) {
      return 'free';
    }

    return subscription.tier;
  }

  /**
   * Check if subscription is active
   */
  isSubscriptionActive(subscription: StripeSubscription | null): boolean {
    return subscription?.status === STRIPE_SUBSCRIPTION_STATUS.ACTIVE;
  }
}

// Export singleton instance
export const stripeService = new StripeService();
export default stripeService; 