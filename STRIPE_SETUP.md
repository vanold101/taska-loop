# TaskaLoop Stripe Integration Setup Guide

This guide will walk you through setting up the complete Stripe integration for TaskaLoop's subscription system.

## 🎯 Overview

TaskaLoop now includes a fully functional Stripe integration with:
- ✅ Real Stripe Checkout for subscriptions
- ✅ Customer Portal for billing management
- ✅ Webhook handling for subscription events
- ✅ Three subscription tiers (Free, Plus, Family)
- ✅ Usage limits enforcement
- ✅ Admin account exemptions

## 📋 Prerequisites

1. **Stripe Account**: [Sign up at stripe.com](https://stripe.com)
2. **Node.js**: Version 16+ required
3. **Firebase Project**: For authentication and database

## 🚀 Quick Start

### Step 1: Stripe Dashboard Setup

1. **Log into your Stripe Dashboard**
2. **Create Products and Prices**:
   ```
   Product: TaskaLoop Plus
   - Price: $4.99/month
   - Copy the Price ID (starts with price_)
   
   Product: TaskaLoop Family  
   - Price: $8.99/month
   - Copy the Price ID (starts with price_)
   ```

3. **Get API Keys**:
   - Go to Developers → API Keys
   - Copy your **Publishable Key** (pk_test_...)
   - Copy your **Secret Key** (sk_test_...)

4. **Set up Webhooks**:
   - Go to Developers → Webhooks
   - Add endpoint: `https://yourdomain.com/api/stripe/webhook`
   - Select events:
     - `checkout.session.completed`
     - `customer.subscription.created`
     - `customer.subscription.updated`
     - `customer.subscription.deleted`
     - `invoice.payment_succeeded`
     - `invoice.payment_failed`
   - Copy the **Signing Secret** (whsec_...)

### Step 2: Environment Configuration

Update your `.env` file:

```env
# Stripe Configuration
VITE_STRIPE_PUBLISHABLE_KEY=pk_test_your_publishable_key_here
STRIPE_SECRET_KEY=sk_test_your_secret_key_here
STRIPE_WEBHOOK_SECRET=whsec_your_webhook_secret_here

# Optional: Custom Price IDs
STRIPE_PLUS_PRICE_ID=price_your_plus_price_id
STRIPE_FAMILY_PRICE_ID=price_your_family_price_id
STRIPE_PLUS_PRODUCT_ID=prod_your_plus_product_id
STRIPE_FAMILY_PRODUCT_ID=prod_your_family_product_id

# App Configuration
VITE_APP_URL=https://yourdomain.com
```

### Step 3: Backend Deployment

Choose your deployment method:

#### Option A: Vercel (Recommended)
```bash
# Install Vercel CLI
npm i -g vercel

# Deploy functions
vercel --prod
```

#### Option B: Netlify Functions
```bash
# Install Netlify CLI
npm i -g netlify-cli

# Deploy
netlify deploy --prod
```

#### Option C: Express.js Server
```javascript
// server.js
import express from 'express';
import { 
  createCheckoutSession, 
  createPortalSession, 
  getCustomerSubscription,
  handleWebhook 
} from './functions/src/stripe.js';

const app = express();

// Stripe webhook (raw body needed)
app.post('/api/stripe/webhook', express.raw({type: 'application/json'}), async (req, res) => {
  const signature = req.headers['stripe-signature'];
  try {
    await handleWebhook(req.body, signature);
    res.json({ received: true });
  } catch (err) {
    res.status(400).send(`Webhook Error: ${err.message}`);
  }
});

app.use(express.json());

// Create checkout session
app.post('/api/stripe/create-checkout-session', async (req, res) => {
  try {
    const session = await createCheckoutSession(req.body);
    res.json(session);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Create portal session
app.post('/api/stripe/create-portal-session', async (req, res) => {
  try {
    const session = await createPortalSession(req.body);
    res.json(session);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get subscription
app.get('/api/stripe/subscription/:userId', async (req, res) => {
  try {
    const subscription = await getCustomerSubscription(req.params.userId);
    if (!subscription) {
      return res.status(404).json({ error: 'Subscription not found' });
    }
    res.json(subscription);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.listen(3001, () => {
  console.log('Server running on port 3001');
});
```

### Step 4: Update Price IDs

Update the price IDs in `src/services/stripeConfig.ts`:

```typescript
export const STRIPE_PRODUCTS = {
  plus: {
    priceId: 'price_your_actual_plus_price_id', // Replace with your real Price ID
    productId: 'prod_your_actual_plus_product_id',
    name: 'TaskaLoop Plus',
    price: 4.99,
    interval: 'month'
  },
  family: {
    priceId: 'price_your_actual_family_price_id', // Replace with your real Price ID
    productId: 'prod_your_actual_family_product_id',
    name: 'TaskaLoop Family',
    price: 8.99,
    interval: 'month'
  }
};
```

## 🔧 Features Included

### Frontend Components
- **SubscriptionManager**: Beautiful pricing modal with tier selection
- **ProfilePage**: Subscription overview and billing management
- **Home**: Tier indicators and upgrade prompts
- **NewTripDialog**: Usage limit enforcement with upgrade prompts

### Backend Services
- **stripeService.ts**: Client-side Stripe integration
- **stripe.ts**: Server-side Stripe API handling
- **Webhook handling**: Automatic subscription status updates

### Subscription Tiers

| Feature | Free | Plus ($4.99/mo) | Family ($8.99/mo) |
|---------|------|-----------------|-------------------|
| Active Trips | 3 | Unlimited | Unlimited |
| Active Tasks | 25 | Unlimited | Unlimited |
| Pantry Items | 50 | Unlimited | Unlimited |
| Household Members | 2 | 6 | Unlimited |
| Receipt Scanning | ❌ | 20/month | Unlimited |
| AI Features | ❌ | ✅ | ✅ Advanced |
| Advanced Analytics | ❌ | ✅ | ✅ Premium |
| Smart Home Integration | ❌ | ❌ | ✅ |

## 🧪 Testing

### Test Cards
```
Success: 4242 4242 4242 4242
Decline: 4000 0000 0000 0002
3D Secure: 4000 0000 0000 3220
```

### Test Webhooks
```bash
# Install Stripe CLI
brew install stripe/stripe-cli/stripe

# Login to your account
stripe login

# Forward webhooks to local server
stripe listen --forward-to localhost:3001/api/stripe/webhook
```

## 🚨 Security Checklist

- [ ] ✅ API keys are in environment variables (not committed to git)
- [ ] ✅ Webhook signature verification is enabled
- [ ] ✅ Customer data is properly validated
- [ ] ✅ Server-side subscription verification
- [ ] ✅ HTTPS enabled in production
- [ ] ✅ CORS properly configured

## 📱 User Experience Flow

1. **Free User** → Views upgrade prompts when hitting limits
2. **Upgrade Click** → Opens Stripe Checkout (secure, hosted payment)
3. **Payment Success** → Webhook updates subscription status
4. **Feature Unlock** → Immediate access to premium features
5. **Billing Management** → Stripe Customer Portal for self-service

## 🔍 Monitoring & Analytics

### Stripe Dashboard
- Monitor subscription metrics
- View failed payments
- Track customer lifecycle
- Generate revenue reports

### Application Logs
- Webhook event processing
- Subscription status changes
- Payment failures and retries
- User upgrade patterns

## 🆘 Troubleshooting

### Common Issues

**"Stripe not configured" error**
- Check environment variables are set
- Verify publishable key is accessible to frontend

**Checkout not redirecting**
- Verify price IDs match your Stripe dashboard
- Check success/cancel URLs are correct

**Webhooks not working**
- Verify webhook endpoint URL
- Check webhook signing secret
- Ensure webhook events are selected

**User not upgrading after payment**
- Check webhook is processing `checkout.session.completed`
- Verify user ID mapping in customer metadata
- Check database update logic

### Debug Mode
Add to your `.env` for detailed logging:
```env
STRIPE_DEBUG=true
NODE_ENV=development
```

## 🚀 Going Live

1. **Switch to Live Mode** in Stripe Dashboard
2. **Update environment variables** with live keys (pk_live_, sk_live_)
3. **Update webhook endpoint** to production URL
4. **Test with real payment methods**
5. **Monitor the first few transactions**

## 📞 Support

- **Stripe Documentation**: [stripe.com/docs](https://stripe.com/docs)
- **TaskaLoop Issues**: Create a GitHub issue
- **Stripe Support**: Available in your Stripe dashboard

---

## 🎉 You're Ready!

Your TaskaLoop subscription system is now powered by Stripe with:
- ✅ Secure payment processing
- ✅ Automated subscription management  
- ✅ Professional billing features
- ✅ Scalable architecture

Users can now upgrade seamlessly and you have full control over subscription management through the Stripe Dashboard. 