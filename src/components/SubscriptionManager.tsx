import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { useSubscription, SubscriptionTier } from '@/context/SubscriptionContext';
import { useAuth } from '@/context/AuthContext';
import stripeService from '@/services/stripeService';
import { 
  Check, 
  Crown, 
  Star, 
  Zap, 
  Users, 
  CreditCard,
  AlertCircle
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface SubscriptionManagerProps {
  isOpen: boolean;
  onClose: () => void;
  showUpgradeOnly?: boolean;
}

interface TierDetails {
  name: string;
  price: string;
  billing?: string;
  description: string;
  icon: React.ReactElement;
  color: string;
  features: string[];
  limitations?: string[];
  popular?: boolean;
}

const TIER_DETAILS: Record<SubscriptionTier, TierDetails> = {
  free: {
    name: 'TaskaLoop Free',
    price: 'Free',
    description: 'Perfect for individuals getting started with basic task management',
    icon: <Users className="h-6 w-6" />,
    color: 'bg-gray-500',
    features: [
      'Up to 50 active tasks',
      'Up to 10 trips per month', 
      'Basic pantry (100 items max)',
      'Single user account only',
      'Basic map view with standard markers',
      '5 saved locations maximum',
      'Manual item entry only',
      'Community support',
      'Mobile web app access'
    ],
    limitations: [
      'NO barcode scanning',
      'NO receipt scanning', 
      'NO AI-powered features',
      'NO household sharing',
      'NO recurring item automation',
      'NO advanced analytics',
      'NO export capabilities',
      'NO route optimization',
      'NO expense tracking'
    ]
  },
  plus: {
    name: 'TaskaLoop Plus',
    price: '$3.99',
    billing: '/month',
    description: 'For active households who want convenience and smart features',
    icon: <Star className="h-6 w-6" />,
    color: 'bg-blue-500',
    features: [
      'Unlimited tasks and trips',
      'Unlimited pantry items',
      'BARCODE SCANNING enabled',
      'Advanced grocery lists with categories',
      'Household sharing (up to 5 members)',
      'Route optimization with Google Maps',
      'Unlimited saved locations',
      'Basic expense tracking and splitting',
      'Trip history for 6 months',
      'Priority email support',
      'Export data to CSV',
      'Smart notifications'
    ],
    limitations: [
      'No receipt scanning',
      'No advanced analytics dashboard',
      'Limited household members (5 max)',
      'No API access'
    ],
    popular: true
  },
  premium: {
    name: 'TaskaLoop Premium',
    price: '$8.99',
    billing: '/month',
    description: 'For large households and power users who want everything',
    icon: <Crown className="h-6 w-6" />,
    color: 'bg-purple-500',
    features: [
      'Everything in Plus plan',
      'UNLIMITED household members',
      'RECEIPT SCANNING with OCR',
      'Advanced analytics dashboard',
      'Spending insights and reports',
      'Smart meal planning suggestions',
      'Predictive shopping lists',
      'Advanced AI features',
      'Unlimited trip history',
      'Priority phone and chat support',
      'Early access to new features',
      'Advanced data export (PDF, Excel)',
      'API access for integrations',
      'Custom branding for households'
    ]
  }
};

export default function SubscriptionManager({ isOpen, onClose, showUpgradeOnly = false }: SubscriptionManagerProps) {
  const { currentTier, upgradeTier, isAdmin } = useSubscription();
  const { user } = useAuth();
  const { toast } = useToast();
  const [selectedTier, setSelectedTier] = useState<SubscriptionTier>(currentTier);
  const [isUpgrading, setIsUpgrading] = useState(false);

  // Don't show for admin accounts
  if (isAdmin) {
    return null;
  }

  const handleTierSelect = (tier: SubscriptionTier) => {
    setSelectedTier(tier);
  };

  const handleUpgrade = async () => {
    if (selectedTier === currentTier) {
      toast({
        title: "Already subscribed",
        description: `You're already on the ${TIER_DETAILS[currentTier].name} plan.`,
      });
      return;
    }

    if (!user?.email) {
      toast({
        title: "Authentication required",
        description: "Please make sure you're logged in to upgrade your subscription.",
        variant: "destructive"
      });
      return;
    }

    if (selectedTier === 'free') {
      // Allow downgrade to free immediately (would cancel subscription via Stripe)
      setIsUpgrading(true);
      setTimeout(() => {
        upgradeTier(selectedTier);
        setIsUpgrading(false);
        toast({
          title: "Plan downgraded",
          description: `You've switched to the ${TIER_DETAILS[selectedTier].name} plan.`,
        });
        onClose();
      }, 1000);
    } else {
      // For paid tiers, use Stripe checkout
      if (!stripeService.isConfigured()) {
        toast({
          title: "Stripe not configured",
          description: "Stripe keys are missing. Please check your environment configuration.",
          variant: "destructive"
        });
        return;
      }

      setIsUpgrading(true);
      
      try {
        await stripeService.subscribeTo(
          selectedTier as 'plus' | 'premium',
          user.email,
          user.id || 'anonymous'
        );
        
        // If we reach here, it means we're in demo mode (no redirect happened)
        // In production, the user would be redirected to Stripe and return via webhook
        upgradeTier(selectedTier);
        setIsUpgrading(false);
        toast({
          title: "Demo: Upgrade successful!",
          description: `Demo mode: You now have ${TIER_DETAILS[selectedTier].name} features enabled.`,
        });
        onClose();
      } catch (error) {
        setIsUpgrading(false);
        console.error('Subscription error:', error);
        toast({
          title: "Subscription failed",
          description: error instanceof Error ? error.message : "Failed to start subscription process.",
          variant: "destructive"
        });
      }
    }
  };

  const tiersToShow = showUpgradeOnly 
    ? (['plus', 'premium'] as SubscriptionTier[])
    : (['free', 'plus', 'premium'] as SubscriptionTier[]);

  const isStripeConfigured = stripeService.isConfigured();

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold">
            {showUpgradeOnly ? 'Upgrade Your Plan' : 'Choose Your Plan'}
          </DialogTitle>
          <DialogDescription>
            {showUpgradeOnly 
              ? 'Unlock more features with a premium plan'
              : 'Select the plan that best fits your household needs'
            }
          </DialogDescription>
        </DialogHeader>

        {!isStripeConfigured && (
          <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 mb-4">
            <div className="flex items-center gap-2 mb-2">
              <AlertCircle className="h-4 w-4 text-amber-600" />
              <span className="font-medium text-amber-800">Stripe Configuration Required</span>
            </div>
            <p className="text-sm text-amber-700">
              Stripe is not properly configured. Add your Stripe keys to enable subscription functionality.
            </p>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-6">
          {tiersToShow.map((tier) => {
            const details = TIER_DETAILS[tier];
            const isCurrentTier = tier === currentTier;
            const isSelected = tier === selectedTier;
            
            return (
              <Card 
                key={tier}
                className={`relative cursor-pointer transition-all duration-200 ${
                  isSelected 
                    ? 'ring-2 ring-blue-500 shadow-lg scale-105' 
                    : 'hover:shadow-md hover:scale-102'
                } ${details.popular ? 'border-blue-500' : ''}`}
                onClick={() => handleTierSelect(tier)}
              >
                {details.popular && (
                  <Badge className="absolute -top-2 left-1/2 transform -translate-x-1/2 bg-blue-500">
                    Most Popular
                  </Badge>
                )}
                
                {isCurrentTier && (
                  <Badge className="absolute -top-2 right-4 bg-green-500">
                    Current Plan
                  </Badge>
                )}

                <CardHeader className="text-center">
                  <div className={`w-12 h-12 ${details.color} rounded-full flex items-center justify-center text-white mx-auto mb-2`}>
                    {details.icon}
                  </div>
                  <CardTitle className="text-xl">{details.name}</CardTitle>
                  <div className="text-3xl font-bold">
                    {details.price}
                    {details.billing && (
                      <span className="text-sm text-gray-500 font-normal">
                        {details.billing}
                      </span>
                    )}
                  </div>
                  <CardDescription className="text-sm">
                    {details.description}
                  </CardDescription>
                </CardHeader>

                <CardContent>
                  <ul className="space-y-2">
                    {details.features.map((feature, index) => (
                      <li key={index} className="flex items-start gap-2 text-sm">
                        <Check className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                        <span>{feature}</span>
                      </li>
                    ))}
                    
                    {details.limitations && (
                      <>
                        <div className="border-t pt-2 mt-3">
                          <p className="text-xs text-gray-500 mb-2">Limitations:</p>
                          {details.limitations.map((limitation, index) => (
                            <li key={index} className="flex items-start gap-2 text-xs text-gray-500">
                              <span className="text-red-400">×</span>
                              <span>{limitation}</span>
                            </li>
                          ))}
                        </div>
                      </>
                    )}
                  </ul>
                </CardContent>

                <CardFooter>
                  <Button 
                    variant={isSelected ? "default" : "outline"}
                    className={`w-full ${isSelected ? 'bg-blue-500 hover:bg-blue-600' : ''}`}
                    disabled={isCurrentTier}
                  >
                    {isCurrentTier ? 'Current Plan' : isSelected ? 'Selected' : 'Select Plan'}
                  </Button>
                </CardFooter>
              </Card>
            );
          })}
        </div>

        <div className="flex justify-end gap-3 mt-6 pt-6 border-t">
          <Button variant="outline" onClick={onClose} disabled={isUpgrading}>
            Cancel
          </Button>
          <Button 
            onClick={handleUpgrade}
            disabled={selectedTier === currentTier || isUpgrading || (!isStripeConfigured && selectedTier !== 'free')}
            className="bg-blue-500 hover:bg-blue-600"
          >
            {isUpgrading ? (
              <>
                <Zap className="h-4 w-4 mr-2 animate-spin" />
                Processing...
              </>
            ) : selectedTier === 'free' ? (
              'Switch to Free'
            ) : (
              <>
                <CreditCard className="h-4 w-4 mr-2" />
                {currentTier === 'free' ? 'Upgrade' : 'Switch'} to {TIER_DETAILS[selectedTier].name}
              </>
            )}
          </Button>
        </div>

        <div className="text-xs text-gray-500 text-center mt-4">
          {isStripeConfigured ? (
            <>
              <p>• Secure payment processing via Stripe • Cancel anytime</p>
              <p>• All prices in USD • 30-day money-back guarantee</p>
            </>
          ) : (
            <>
              <p>• Demo Mode: Stripe integration ready for configuration</p>
              <p>• Add VITE_STRIPE_PUBLISHABLE_KEY to enable payments</p>
            </>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
} 