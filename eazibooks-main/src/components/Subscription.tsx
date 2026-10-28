import { useState } from 'react';
import { useSubscription } from '../utils/SubscriptionContext';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Check, Sparkles, Zap, Rocket, Crown, X } from 'lucide-react';
import { toast } from 'sonner@2.0.3';
import { PaymentCheckout } from './PaymentCheckout';

export function Subscription() {
  const { plan, setPlan, isPremium, isStarter, isProfessional, usage, limits, features } = useSubscription();
  const [isPaymentOpen, setIsPaymentOpen] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState<{ name: string; type: 'starter' | 'professional' | 'premium'; amount: number }>({
    name: '',
    type: 'starter',
    amount: 0
  });

  const handleUpgradeClick = (targetPlan: 'starter' | 'professional' | 'premium') => {
    const planDetails = {
      starter: { name: 'Starter', amount: 5000 },
      professional: { name: 'Professional', amount: 10000 },
      premium: { name: 'Premium', amount: 15000 }
    };
    
    setSelectedPlan({
      name: planDetails[targetPlan].name,
      type: targetPlan,
      amount: planDetails[targetPlan].amount
    });
    setIsPaymentOpen(true);
  };

  const handlePaymentSuccess = () => {
    setPlan(selectedPlan.type);
    toast.success(`Successfully upgraded to ${selectedPlan.name}!`, {
      description: `You now have access to all ${selectedPlan.name} features.`
    });
  };

  const handleDowngrade = (targetPlan: 'free' | 'starter' | 'professional') => {
    setPlan(targetPlan);
    const planNames = {
      free: 'Free',
      starter: 'Starter',
      professional: 'Professional'
    };
    toast.success(`Plan changed to ${planNames[targetPlan]}`, {
      description: 'You can upgrade again at any time.'
    });
  };

  const planPrices = {
    free: { amount: 0, symbol: '₦' },
    starter: { amount: 5000, symbol: '₦' },
    professional: { amount: 10000, symbol: '₦' },
    premium: { amount: 15000, symbol: '₦' }
  };

  const getPlanName = (planType: typeof plan) => {
    const names = {
      free: 'Free',
      starter: 'Starter',
      professional: 'Professional',
      premium: 'Premium'
    };
    return names[planType];
  };

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1>Subscription & Billing</h1>
        <p className="text-muted-foreground">
          Choose the plan that's right for your business
        </p>
      </div>

      {/* Current Plan */}
      <Card>
        <CardHeader>
          <CardTitle>Current Plan</CardTitle>
          <CardDescription>Your active subscription plan</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-3">
            <Badge 
              variant={plan === 'free' ? 'secondary' : 'default'} 
              className="text-lg px-4 py-2"
            >
              {plan === 'premium' && <Sparkles className="w-4 h-4 mr-2" />}
              {plan === 'professional' && <Crown className="w-4 h-4 mr-2" />}
              {plan === 'starter' && <Rocket className="w-4 h-4 mr-2" />}
              {plan === 'free' && <Zap className="w-4 h-4 mr-2" />}
              {getPlanName(plan)}
            </Badge>
            {limits.invoices !== Infinity && (
              <div className="text-sm text-muted-foreground">
                {usage.invoices}/{limits.invoices} invoices • {usage.bills}/{limits.bills} bills
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Pricing Plans */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Free Plan */}
        <Card className={plan === 'free' ? 'border-2 border-primary' : ''}>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <Zap className="w-5 h-5" />
                Free
              </CardTitle>
              {plan === 'free' && <Badge>Current</Badge>}
            </div>
            <CardDescription>Perfect for testing</CardDescription>
            <div className="mt-4">
              <span className="text-3xl font-bold">₦0</span>
              <span className="text-muted-foreground">/month</span>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <ul className="space-y-2">
              <li className="flex items-start gap-2">
                <Check className="w-4 h-4 mt-0.5 flex-shrink-0 text-green-600" />
                <span className="text-sm">5 invoices per month</span>
              </li>
              <li className="flex items-start gap-2">
                <Check className="w-4 h-4 mt-0.5 flex-shrink-0 text-green-600" />
                <span className="text-sm">5 bills per month</span>
              </li>
              <li className="flex items-start gap-2">
                <Check className="w-4 h-4 mt-0.5 flex-shrink-0 text-green-600" />
                <span className="text-sm">Basic invoice templates</span>
              </li>
              <li className="flex items-start gap-2">
                <Check className="w-4 h-4 mt-0.5 flex-shrink-0 text-green-600" />
                <span className="text-sm">Multi-currency support</span>
              </li>
              <li className="flex items-start gap-2">
                <X className="w-4 h-4 mt-0.5 flex-shrink-0 text-muted-foreground" />
                <span className="text-sm text-muted-foreground">No company branding</span>
              </li>
              <li className="flex items-start gap-2">
                <X className="w-4 h-4 mt-0.5 flex-shrink-0 text-muted-foreground" />
                <span className="text-sm text-muted-foreground">No AI features</span>
              </li>
            </ul>
          </CardContent>
          <CardFooter>
            {plan !== 'free' && (
              <Button variant="outline" onClick={() => handleDowngrade('free')} className="w-full">
                Downgrade to Free
              </Button>
            )}
            {plan === 'free' && (
              <Button variant="outline" disabled className="w-full">
                Current Plan
              </Button>
            )}
          </CardFooter>
        </Card>

        {/* Starter Plan */}
        <Card className={plan === 'starter' ? 'border-2 border-primary' : ''}>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <Rocket className="w-5 h-5" />
                Starter
              </CardTitle>
              {plan === 'starter' && <Badge>Current</Badge>}
            </div>
            <CardDescription>For small businesses</CardDescription>
            <div className="mt-4">
              <span className="text-3xl font-bold">₦5,000</span>
              <span className="text-muted-foreground">/month</span>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="text-sm font-medium mb-2">Everything in Free, plus:</div>
            <ul className="space-y-2">
              <li className="flex items-start gap-2">
                <Check className="w-4 h-4 mt-0.5 flex-shrink-0 text-green-600" />
                <span className="text-sm"><strong>50</strong> invoices per month</span>
              </li>
              <li className="flex items-start gap-2">
                <Check className="w-4 h-4 mt-0.5 flex-shrink-0 text-green-600" />
                <span className="text-sm"><strong>50</strong> bills per month</span>
              </li>
              <li className="flex items-start gap-2">
                <Check className="w-4 h-4 mt-0.5 flex-shrink-0 text-green-600" />
                <span className="text-sm"><strong>Company branding</strong> on invoices</span>
              </li>
              <li className="flex items-start gap-2">
                <Check className="w-4 h-4 mt-0.5 flex-shrink-0 text-green-600" />
                <span className="text-sm">Basic accounting features</span>
              </li>
              <li className="flex items-start gap-2">
                <Check className="w-4 h-4 mt-0.5 flex-shrink-0 text-green-600" />
                <span className="text-sm">Basic reports</span>
              </li>
              <li className="flex items-start gap-2">
                <X className="w-4 h-4 mt-0.5 flex-shrink-0 text-muted-foreground" />
                <span className="text-sm text-muted-foreground">No AI features</span>
              </li>
            </ul>
          </CardContent>
          <CardFooter>
            {plan === 'free' && (
              <Button onClick={() => handleUpgradeClick('starter')} className="w-full gap-2">
                <Rocket className="w-4 h-4" />
                Upgrade to Starter
              </Button>
            )}
            {plan === 'starter' && (
              <Button variant="outline" disabled className="w-full">
                Current Plan
              </Button>
            )}
            {(plan === 'professional' || plan === 'premium') && (
              <Button variant="outline" onClick={() => handleDowngrade('starter')} className="w-full">
                Downgrade to Starter
              </Button>
            )}
          </CardFooter>
        </Card>

        {/* Professional Plan */}
        <Card className={plan === 'professional' ? 'border-2 border-primary' : 'border-2 border-muted'}>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <Crown className="w-5 h-5" />
                Professional
              </CardTitle>
              {plan === 'professional' && <Badge>Current</Badge>}
            </div>
            <CardDescription>For growing businesses</CardDescription>
            <div className="mt-4">
              <span className="text-3xl font-bold">₦10,000</span>
              <span className="text-muted-foreground">/month</span>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="text-sm font-medium mb-2">Everything in Starter, plus:</div>
            <ul className="space-y-2">
              <li className="flex items-start gap-2">
                <Check className="w-4 h-4 mt-0.5 flex-shrink-0 text-green-600" />
                <span className="text-sm"><strong>Unlimited</strong> invoices & bills</span>
              </li>
              <li className="flex items-start gap-2">
                <Check className="w-4 h-4 mt-0.5 flex-shrink-0 text-green-600" />
                <span className="text-sm">Full accounting & ledger</span>
              </li>
              <li className="flex items-start gap-2">
                <Check className="w-4 h-4 mt-0.5 flex-shrink-0 text-green-600" />
                <span className="text-sm">Inventory management</span>
              </li>
              <li className="flex items-start gap-2">
                <Check className="w-4 h-4 mt-0.5 flex-shrink-0 text-green-600" />
                <span className="text-sm">Tax compliance tools</span>
              </li>
              <li className="flex items-start gap-2">
                <Check className="w-4 h-4 mt-0.5 flex-shrink-0 text-green-600" />
                <span className="text-sm">Advanced reports & analytics</span>
              </li>
              <li className="flex items-start gap-2">
                <X className="w-4 h-4 mt-0.5 flex-shrink-0 text-muted-foreground" />
                <span className="text-sm text-muted-foreground">No AI features</span>
              </li>
            </ul>
          </CardContent>
          <CardFooter>
            {(plan === 'free' || plan === 'starter') && (
              <Button onClick={() => handleUpgradeClick('professional')} className="w-full gap-2">
                <Crown className="w-4 h-4" />
                Upgrade to Professional
              </Button>
            )}
            {plan === 'professional' && (
              <Button variant="outline" disabled className="w-full">
                Current Plan
              </Button>
            )}
            {plan === 'premium' && (
              <Button variant="outline" onClick={() => handleDowngrade('professional')} className="w-full">
                Downgrade to Professional
              </Button>
            )}
          </CardFooter>
        </Card>

        {/* Premium Plan */}
        <Card className={plan === 'premium' ? 'border-2 border-primary' : 'border-2 border-muted'}>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <Sparkles className="w-5 h-5" />
                Premium
              </CardTitle>
              {plan === 'premium' && <Badge>Current</Badge>}
            </div>
            <CardDescription>AI-powered suite</CardDescription>
            <div className="mt-4">
              <span className="text-3xl font-bold">₦15,000</span>
              <span className="text-muted-foreground">/month</span>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="text-sm font-medium mb-2">Everything in Professional, plus:</div>
            <ul className="space-y-2">
              <li className="flex items-start gap-2">
                <Sparkles className="w-4 h-4 mt-0.5 flex-shrink-0 text-purple-600" />
                <span className="text-sm"><strong>AI OCR Scanner</strong></span>
              </li>
              <li className="flex items-start gap-2">
                <Sparkles className="w-4 h-4 mt-0.5 flex-shrink-0 text-purple-600" />
                <span className="text-sm"><strong>AI Financial Consultant</strong></span>
              </li>
              <li className="flex items-start gap-2">
                <Check className="w-4 h-4 mt-0.5 flex-shrink-0 text-green-600" />
                <span className="text-sm">Payroll processing</span>
              </li>
              <li className="flex items-start gap-2">
                <Check className="w-4 h-4 mt-0.5 flex-shrink-0 text-green-600" />
                <span className="text-sm">Priority support</span>
              </li>
              <li className="flex items-start gap-2">
                <Check className="w-4 h-4 mt-0.5 flex-shrink-0 text-green-600" />
                <span className="text-sm">API access</span>
              </li>
            </ul>
          </CardContent>
          <CardFooter>
            {plan !== 'premium' && (
              <Button onClick={() => handleUpgradeClick('premium')} className="w-full gap-2">
                <Sparkles className="w-4 h-4" />
                Upgrade to Premium
              </Button>
            )}
            {plan === 'premium' && (
              <Button variant="outline" disabled className="w-full">
                Current Plan
              </Button>
            )}
          </CardFooter>
        </Card>
      </div>

      {/* Payment Checkout Modal */}
      <PaymentCheckout
        isOpen={isPaymentOpen}
        onClose={() => setIsPaymentOpen(false)}
        planName={selectedPlan.name}
        amount={selectedPlan.amount}
        currency="₦"
        onSuccess={handlePaymentSuccess}
      />

      {/* Feature Comparison Table */}
      <Card>
        <CardHeader>
          <CardTitle>Feature Comparison</CardTitle>
          <CardDescription>Compare all plan features</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b">
                  <th className="text-left py-3 px-2">Feature</th>
                  <th className="text-center py-3 px-2">Free</th>
                  <th className="text-center py-3 px-2">Starter</th>
                  <th className="text-center py-3 px-2">Professional</th>
                  <th className="text-center py-3 px-2">Premium</th>
                </tr>
              </thead>
              <tbody>
                <tr className="border-b">
                  <td className="py-3 px-2">Invoices per month</td>
                  <td className="text-center py-3 px-2">5</td>
                  <td className="text-center py-3 px-2">50</td>
                  <td className="text-center py-3 px-2">Unlimited</td>
                  <td className="text-center py-3 px-2">Unlimited</td>
                </tr>
                <tr className="border-b">
                  <td className="py-3 px-2">Bills per month</td>
                  <td className="text-center py-3 px-2">5</td>
                  <td className="text-center py-3 px-2">50</td>
                  <td className="text-center py-3 px-2">Unlimited</td>
                  <td className="text-center py-3 px-2">Unlimited</td>
                </tr>
                <tr className="border-b">
                  <td className="py-3 px-2">Company branding</td>
                  <td className="text-center py-3 px-2"><X className="w-4 h-4 mx-auto text-muted-foreground" /></td>
                  <td className="text-center py-3 px-2"><Check className="w-4 h-4 mx-auto text-green-600" /></td>
                  <td className="text-center py-3 px-2"><Check className="w-4 h-4 mx-auto text-green-600" /></td>
                  <td className="text-center py-3 px-2"><Check className="w-4 h-4 mx-auto text-green-600" /></td>
                </tr>
                <tr className="border-b">
                  <td className="py-3 px-2">Accounting features</td>
                  <td className="text-center py-3 px-2"><X className="w-4 h-4 mx-auto text-muted-foreground" /></td>
                  <td className="text-center py-3 px-2">Basic</td>
                  <td className="text-center py-3 px-2">Full</td>
                  <td className="text-center py-3 px-2">Full</td>
                </tr>
                <tr className="border-b">
                  <td className="py-3 px-2">Inventory management</td>
                  <td className="text-center py-3 px-2"><X className="w-4 h-4 mx-auto text-muted-foreground" /></td>
                  <td className="text-center py-3 px-2"><X className="w-4 h-4 mx-auto text-muted-foreground" /></td>
                  <td className="text-center py-3 px-2"><Check className="w-4 h-4 mx-auto text-green-600" /></td>
                  <td className="text-center py-3 px-2"><Check className="w-4 h-4 mx-auto text-green-600" /></td>
                </tr>
                <tr className="border-b">
                  <td className="py-3 px-2">Tax compliance</td>
                  <td className="text-center py-3 px-2"><X className="w-4 h-4 mx-auto text-muted-foreground" /></td>
                  <td className="text-center py-3 px-2"><X className="w-4 h-4 mx-auto text-muted-foreground" /></td>
                  <td className="text-center py-3 px-2"><Check className="w-4 h-4 mx-auto text-green-600" /></td>
                  <td className="text-center py-3 px-2"><Check className="w-4 h-4 mx-auto text-green-600" /></td>
                </tr>
                <tr className="border-b">
                  <td className="py-3 px-2">AI OCR Scanner</td>
                  <td className="text-center py-3 px-2"><X className="w-4 h-4 mx-auto text-muted-foreground" /></td>
                  <td className="text-center py-3 px-2"><X className="w-4 h-4 mx-auto text-muted-foreground" /></td>
                  <td className="text-center py-3 px-2"><X className="w-4 h-4 mx-auto text-muted-foreground" /></td>
                  <td className="text-center py-3 px-2"><Sparkles className="w-4 h-4 mx-auto text-purple-600" /></td>
                </tr>
                <tr className="border-b">
                  <td className="py-3 px-2">AI Financial Consultant</td>
                  <td className="text-center py-3 px-2"><X className="w-4 h-4 mx-auto text-muted-foreground" /></td>
                  <td className="text-center py-3 px-2"><X className="w-4 h-4 mx-auto text-muted-foreground" /></td>
                  <td className="text-center py-3 px-2"><X className="w-4 h-4 mx-auto text-muted-foreground" /></td>
                  <td className="text-center py-3 px-2"><Sparkles className="w-4 h-4 mx-auto text-purple-600" /></td>
                </tr>
                <tr className="border-b">
                  <td className="py-3 px-2">Payroll processing</td>
                  <td className="text-center py-3 px-2"><X className="w-4 h-4 mx-auto text-muted-foreground" /></td>
                  <td className="text-center py-3 px-2"><X className="w-4 h-4 mx-auto text-muted-foreground" /></td>
                  <td className="text-center py-3 px-2"><X className="w-4 h-4 mx-auto text-muted-foreground" /></td>
                  <td className="text-center py-3 px-2"><Check className="w-4 h-4 mx-auto text-green-600" /></td>
                </tr>
                <tr className="border-b">
                  <td className="py-3 px-2">Advanced reports</td>
                  <td className="text-center py-3 px-2"><X className="w-4 h-4 mx-auto text-muted-foreground" /></td>
                  <td className="text-center py-3 px-2"><X className="w-4 h-4 mx-auto text-muted-foreground" /></td>
                  <td className="text-center py-3 px-2"><Check className="w-4 h-4 mx-auto text-green-600" /></td>
                  <td className="text-center py-3 px-2"><Check className="w-4 h-4 mx-auto text-green-600" /></td>
                </tr>
                <tr>
                  <td className="py-3 px-2">Priority support</td>
                  <td className="text-center py-3 px-2"><X className="w-4 h-4 mx-auto text-muted-foreground" /></td>
                  <td className="text-center py-3 px-2"><X className="w-4 h-4 mx-auto text-muted-foreground" /></td>
                  <td className="text-center py-3 px-2"><X className="w-4 h-4 mx-auto text-muted-foreground" /></td>
                  <td className="text-center py-3 px-2"><Check className="w-4 h-4 mx-auto text-green-600" /></td>
                </tr>
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Usage Stats for Limited Plans */}
      {limits.invoices !== Infinity && (
        <Card>
          <CardHeader>
            <CardTitle>Usage This Month</CardTitle>
            <CardDescription>Track your plan usage</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <div className="flex justify-between text-sm mb-2">
                <span>Invoices</span>
                <span className="font-medium">{usage.invoices}/{limits.invoices}</span>
              </div>
              <div className="w-full bg-muted h-2 rounded-full overflow-hidden">
                <div 
                  className="bg-foreground h-full transition-all"
                  style={{ width: `${(usage.invoices / limits.invoices) * 100}%` }}
                />
              </div>
            </div>
            <div>
              <div className="flex justify-between text-sm mb-2">
                <span>Bills</span>
                <span className="font-medium">{usage.bills}/{limits.bills}</span>
              </div>
              <div className="w-full bg-muted h-2 rounded-full overflow-hidden">
                <div 
                  className="bg-foreground h-full transition-all"
                  style={{ width: `${(usage.bills / limits.bills) * 100}%` }}
                />
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
