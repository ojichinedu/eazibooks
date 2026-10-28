import { useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from './ui/dialog';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Card, CardContent } from './ui/card';
import { Badge } from './ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { CreditCard, Smartphone, Building2, Check, AlertCircle, Loader2 } from 'lucide-react';
import { toast } from 'sonner@2.0.3';

interface PaymentCheckoutProps {
  isOpen: boolean;
  onClose: () => void;
  planName: string;
  amount: number;
  currency: string;
  onSuccess: () => void;
}

export function PaymentCheckout({ isOpen, onClose, planName, amount, currency, onSuccess }: PaymentCheckoutProps) {
  const [processing, setProcessing] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState<'card' | 'bank' | 'mobile'>('card');
  const [paymentStep, setPaymentStep] = useState<'select' | 'details' | 'processing' | 'success'>('select');

  // Card payment state
  const [cardNumber, setCardNumber] = useState('');
  const [cardExpiry, setCardExpiry] = useState('');
  const [cardCvv, setCardCvv] = useState('');
  const [cardName, setCardName] = useState('');

  // Bank transfer state
  const [accountNumber, setAccountNumber] = useState('');
  const [bankName, setBankName] = useState('');

  // Mobile money state
  const [mobileNumber, setMobileNumber] = useState('');
  const [mobileProvider, setMobileProvider] = useState('');

  const formatCardNumber = (value: string) => {
    const cleaned = value.replace(/\s/g, '');
    const chunks = cleaned.match(/.{1,4}/g) || [];
    return chunks.join(' ').substring(0, 19);
  };

  const formatExpiry = (value: string) => {
    const cleaned = value.replace(/\D/g, '');
    if (cleaned.length >= 2) {
      return cleaned.substring(0, 2) + '/' + cleaned.substring(2, 4);
    }
    return cleaned;
  };

  const handlePayment = async () => {
    setProcessing(true);
    setPaymentStep('processing');

    try {
      // Simulate payment processing
      await new Promise(resolve => setTimeout(resolve, 3000));

      // TODO: Integrate with actual payment gateway
      // For Stripe:
      // const response = await fetch('/api/create-payment-intent', {
      //   method: 'POST',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify({ amount, currency, planName })
      // });
      // const { clientSecret } = await response.json();
      // const result = await stripe.confirmCardPayment(clientSecret, {
      //   payment_method: { card: cardElement }
      // });

      // For Paystack (Nigeria):
      // const handler = PaystackPop.setup({
      //   key: 'pk_test_xxx',
      //   email: userEmail,
      //   amount: amount * 100,
      //   currency: 'NGN',
      //   onSuccess: (transaction) => { /* handle success */ },
      //   onCancel: () => { /* handle cancel */ }
      // });
      // handler.openIframe();

      // For Flutterwave:
      // const response = await FlutterwaveCheckout({
      //   public_key: "FLWPUBK_TEST-xxx",
      //   tx_ref: Date.now().toString(),
      //   amount: amount,
      //   currency: currency,
      //   payment_options: "card,mobilemoney,ussd",
      //   customer: { email: userEmail, name: userName },
      //   customizations: { title: `EaziBook ${planName} Plan` }
      // });

      setPaymentStep('success');
      
      setTimeout(() => {
        toast.success('Payment successful!', {
          description: `You've successfully upgraded to ${planName} plan.`
        });
        onSuccess();
        handleClose();
      }, 2000);
    } catch (error) {
      setPaymentStep('select');
      toast.error('Payment failed', {
        description: 'Please check your details and try again.'
      });
    } finally {
      setProcessing(false);
    }
  };

  const handleClose = () => {
    setPaymentStep('select');
    setCardNumber('');
    setCardExpiry('');
    setCardCvv('');
    setCardName('');
    setAccountNumber('');
    setBankName('');
    setMobileNumber('');
    setMobileProvider('');
    onClose();
  };

  const isCardValid = cardNumber.replace(/\s/g, '').length === 16 && 
                      cardExpiry.length === 5 && 
                      cardCvv.length === 3 &&
                      cardName.length > 0;

  const isBankValid = accountNumber.length >= 10 && bankName.length > 0;
  const isMobileValid = mobileNumber.length >= 10 && mobileProvider.length > 0;

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Complete Your Upgrade</DialogTitle>
          <DialogDescription>
            Upgrade to {planName} plan for {currency}{amount.toLocaleString()}/month
          </DialogDescription>
        </DialogHeader>

        {paymentStep === 'select' && (
          <div className="py-4">
            <Tabs value={paymentMethod} onValueChange={(v) => setPaymentMethod(v as any)}>
              <TabsList className="grid w-full grid-cols-3 mb-6">
                <TabsTrigger value="card" className="gap-2">
                  <CreditCard className="w-4 h-4" />
                  Card
                </TabsTrigger>
                <TabsTrigger value="bank" className="gap-2">
                  <Building2 className="w-4 h-4" />
                  Bank Transfer
                </TabsTrigger>
                <TabsTrigger value="mobile" className="gap-2">
                  <Smartphone className="w-4 h-4" />
                  Mobile Money
                </TabsTrigger>
              </TabsList>

              {/* Card Payment */}
              <TabsContent value="card" className="space-y-4">
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="cardName">Cardholder Name</Label>
                    <Input
                      id="cardName"
                      placeholder="John Doe"
                      value={cardName}
                      onChange={(e) => setCardName(e.target.value)}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="cardNumber">Card Number</Label>
                    <Input
                      id="cardNumber"
                      placeholder="1234 5678 9012 3456"
                      value={cardNumber}
                      onChange={(e) => setCardNumber(formatCardNumber(e.target.value))}
                      maxLength={19}
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="cardExpiry">Expiry Date</Label>
                      <Input
                        id="cardExpiry"
                        placeholder="MM/YY"
                        value={cardExpiry}
                        onChange={(e) => setCardExpiry(formatExpiry(e.target.value))}
                        maxLength={5}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="cardCvv">CVV</Label>
                      <Input
                        id="cardCvv"
                        type="password"
                        placeholder="123"
                        value={cardCvv}
                        onChange={(e) => setCardCvv(e.target.value.replace(/\D/g, '').substring(0, 3))}
                        maxLength={3}
                      />
                    </div>
                  </div>

                  <Card className="bg-muted">
                    <CardContent className="p-4">
                      <div className="flex items-start gap-2 text-sm">
                        <AlertCircle className="w-4 h-4 mt-0.5 flex-shrink-0" />
                        <div>
                          <p className="font-medium">Secure Payment</p>
                          <p className="text-xs text-muted-foreground mt-1">
                            Your payment information is encrypted and secure. We never store your card details.
                          </p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>

                <DialogFooter>
                  <Button variant="outline" onClick={handleClose}>
                    Cancel
                  </Button>
                  <Button 
                    onClick={handlePayment} 
                    disabled={!isCardValid || processing}
                    className="gap-2"
                  >
                    {processing ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        Processing...
                      </>
                    ) : (
                      <>
                        <CreditCard className="w-4 h-4" />
                        Pay {currency}{amount.toLocaleString()}
                      </>
                    )}
                  </Button>
                </DialogFooter>
              </TabsContent>

              {/* Bank Transfer */}
              <TabsContent value="bank" className="space-y-4">
                <Card className="bg-muted">
                  <CardContent className="p-4">
                    <h4 className="font-medium mb-2">Bank Transfer Instructions</h4>
                    <div className="space-y-2 text-sm">
                      <p><strong>Bank Name:</strong> First Bank of Nigeria</p>
                      <p><strong>Account Number:</strong> 1234567890</p>
                      <p><strong>Account Name:</strong> LifeisEazi Group Enterprises</p>
                      <p><strong>Amount:</strong> {currency}{amount.toLocaleString()}</p>
                      <p className="text-xs text-muted-foreground mt-2">
                        Please use your email as the payment reference. Your account will be upgraded within 24 hours of payment confirmation.
                      </p>
                    </div>
                  </CardContent>
                </Card>

                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="bankName">Your Bank Name</Label>
                    <Input
                      id="bankName"
                      placeholder="e.g., GTBank"
                      value={bankName}
                      onChange={(e) => setBankName(e.target.value)}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="accountNumber">Account Number Used</Label>
                    <Input
                      id="accountNumber"
                      placeholder="Enter the account you paid from"
                      value={accountNumber}
                      onChange={(e) => setAccountNumber(e.target.value.replace(/\D/g, ''))}
                    />
                  </div>
                </div>

                <DialogFooter>
                  <Button variant="outline" onClick={handleClose}>
                    Cancel
                  </Button>
                  <Button 
                    onClick={handlePayment}
                    disabled={!isBankValid || processing}
                  >
                    I've Made the Transfer
                  </Button>
                </DialogFooter>
              </TabsContent>

              {/* Mobile Money */}
              <TabsContent value="mobile" className="space-y-4">
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="mobileProvider">Mobile Money Provider</Label>
                    <select
                      id="mobileProvider"
                      className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                      value={mobileProvider}
                      onChange={(e) => setMobileProvider(e.target.value)}
                    >
                      <option value="">Select provider</option>
                      <option value="mtn">MTN Mobile Money</option>
                      <option value="airtel">Airtel Money</option>
                      <option value="glo">Glo Mobile Money</option>
                      <option value="9mobile">9mobile Money</option>
                    </select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="mobileNumber">Mobile Number</Label>
                    <Input
                      id="mobileNumber"
                      type="tel"
                      placeholder="+234 801 234 5678"
                      value={mobileNumber}
                      onChange={(e) => setMobileNumber(e.target.value)}
                    />
                  </div>

                  <Card className="bg-muted">
                    <CardContent className="p-4">
                      <div className="text-sm">
                        <p className="font-medium mb-2">How it works:</p>
                        <ol className="list-decimal list-inside space-y-1 text-muted-foreground">
                          <li>Click "Pay Now" to initiate payment</li>
                          <li>You'll receive a prompt on your phone</li>
                          <li>Enter your mobile money PIN</li>
                          <li>Your account will be upgraded instantly</li>
                        </ol>
                      </div>
                    </CardContent>
                  </Card>
                </div>

                <DialogFooter>
                  <Button variant="outline" onClick={handleClose}>
                    Cancel
                  </Button>
                  <Button 
                    onClick={handlePayment}
                    disabled={!isMobileValid || processing}
                    className="gap-2"
                  >
                    <Smartphone className="w-4 h-4" />
                    Pay Now
                  </Button>
                </DialogFooter>
              </TabsContent>
            </Tabs>
          </div>
        )}

        {paymentStep === 'processing' && (
          <div className="py-12 text-center">
            <Loader2 className="w-16 h-16 animate-spin mx-auto mb-4" />
            <h3 className="font-medium mb-2">Processing Payment...</h3>
            <p className="text-sm text-muted-foreground">
              Please don't close this window
            </p>
          </div>
        )}

        {paymentStep === 'success' && (
          <div className="py-12 text-center">
            <div className="w-16 h-16 rounded-full bg-green-100 dark:bg-green-900/20 flex items-center justify-center mx-auto mb-4">
              <Check className="w-8 h-8 text-green-600" />
            </div>
            <h3 className="font-medium mb-2">Payment Successful!</h3>
            <p className="text-sm text-muted-foreground mb-4">
              Your account has been upgraded to {planName} plan
            </p>
            <Badge variant="default" className="text-sm">
              {planName} Plan Active
            </Badge>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
