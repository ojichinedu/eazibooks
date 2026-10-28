import { ReactNode } from 'react';
import { useSubscription, SubscriptionPlan } from '../utils/SubscriptionContext';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from './ui/card';
import { Button } from './ui/button';
import { Lock, Sparkles, Crown, Rocket, Check } from 'lucide-react';
import { Badge } from './ui/badge';

interface PremiumGateProps {
  children: ReactNode;
  feature: string;
  requiredPlan?: SubscriptionPlan;
  onUpgrade?: () => void;
}

export function PremiumGate({ 
  children, 
  feature, 
  requiredPlan = 'premium',
  onUpgrade 
}: PremiumGateProps) {
  const { plan, setPlan, features } = useSubscription();

  // Check if user has access based on required plan
  const hasAccess = () => {
    const planHierarchy: SubscriptionPlan[] = ['free', 'starter', 'professional', 'premium'];
    const userPlanIndex = planHierarchy.indexOf(plan);
    const requiredPlanIndex = planHierarchy.indexOf(requiredPlan);
    return userPlanIndex >= requiredPlanIndex;
  };

  if (hasAccess()) {
    return <>{children}</>;
  }

  const getPlanIcon = (planType: SubscriptionPlan) => {
    switch (planType) {
      case 'premium':
        return <Sparkles className="w-6 h-6" />;
      case 'professional':
        return <Crown className="w-6 h-6" />;
      case 'starter':
        return <Rocket className="w-6 h-6" />;
      default:
        return <Lock className="w-6 h-6" />;
    }
  };

  const getPlanName = (planType: SubscriptionPlan) => {
    const names = {
      free: 'Free',
      starter: 'Starter',
      professional: 'Professional',
      premium: 'Premium'
    };
    return names[planType];
  };

  const getPlanPrice = (planType: SubscriptionPlan) => {
    const prices = {
      free: '₦0',
      starter: '₦5,000',
      professional: '₦10,000',
      premium: '₦15,000'
    };
    return prices[planType];
  };

  const getFeatureList = (planType: SubscriptionPlan) => {
    switch (planType) {
      case 'starter':
        return [
          '50 invoices & bills per month',
          'Company branding on invoices',
          'Basic accounting features',
          'Multi-currency support',
          'Basic reports'
        ];
      case 'professional':
        return [
          'Unlimited invoices & bills',
          'Company branding',
          'Full accounting & ledger',
          'Inventory management',
          'Tax compliance tools',
          'Advanced reports & analytics'
        ];
      case 'premium':
        return [
          'AI-Powered OCR Scanner',
          'AI Financial Consultant Bot',
          'Unlimited invoices & bills',
          'Full accounting & ledger',
          'Inventory management',
          'Tax compliance tools',
          'Payroll processing',
          'Priority support'
        ];
      default:
        return [];
    }
  };

  const handleUpgradeClick = () => {
    if (onUpgrade) {
      onUpgrade();
    } else {
      setPlan(requiredPlan);
    }
  };

  return (
    <div className="p-6">
      <Card className="max-w-2xl mx-auto">
        <CardHeader>
          <div className="flex items-center justify-between mb-2">
            <Badge variant="secondary" className="gap-1">
              <Lock className="w-3 h-3" />
              {getPlanName(requiredPlan)} Feature
            </Badge>
          </div>
          <CardTitle className="flex items-center gap-2">
            {getPlanIcon(requiredPlan)}
            Unlock {feature}
          </CardTitle>
          <CardDescription>
            This feature is available on the {getPlanName(requiredPlan)} plan
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="p-4 bg-muted rounded-lg">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                {getPlanIcon(requiredPlan)}
                <span className="font-semibold">{getPlanName(requiredPlan)} Plan</span>
              </div>
              <div>
                <span className="text-2xl font-bold">{getPlanPrice(requiredPlan)}</span>
                <span className="text-sm text-muted-foreground">/month</span>
              </div>
            </div>
          </div>

          <div className="space-y-3">
            <p className="text-sm text-muted-foreground">
              Upgrade to {getPlanName(requiredPlan)} to access:
            </p>
            <ul className="space-y-2">
              {getFeatureList(requiredPlan).map((item, index) => (
                <li key={index} className="flex items-center gap-2 text-sm">
                  <Check className="w-4 h-4 text-green-600 flex-shrink-0" />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </div>
          
          <Button 
            onClick={handleUpgradeClick} 
            className="w-full gap-2"
            size="lg"
          >
            {getPlanIcon(requiredPlan)}
            Upgrade to {getPlanName(requiredPlan)}
          </Button>

          <p className="text-xs text-center text-muted-foreground">
            You can change or cancel your plan at any time
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
