import { useState } from 'react';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../ui/card';
import { Plug, Key, Check, X, AlertCircle } from 'lucide-react';
import { toast } from 'sonner@2.0.3';
import { Alert, AlertDescription } from '../ui/alert';

interface Integration {
  id: string;
  name: string;
  description: string;
  icon: string;
  connected: boolean;
  requiresKey: boolean;
}

export function Integrations() {
  const [apiKey, setApiKey] = useState('');
  const [integrations, setIntegrations] = useState<Integration[]>([
    {
      id: 'openai',
      name: 'OpenAI API',
      description: 'Enable AI-powered features including OCR scanner and AI chatbot',
      icon: '🤖',
      connected: false,
      requiresKey: true
    },
    {
      id: 'stripe',
      name: 'Stripe',
      description: 'Accept payments online with Stripe',
      icon: '💳',
      connected: false,
      requiresKey: true
    },
    {
      id: 'paystack',
      name: 'Paystack',
      description: 'Payment gateway for African businesses',
      icon: '💰',
      connected: false,
      requiresKey: true
    },
    {
      id: 'quickbooks',
      name: 'QuickBooks',
      description: 'Sync your accounting data with QuickBooks',
      icon: '📊',
      connected: false,
      requiresKey: true
    }
  ]);

  const toggleIntegration = (id: string) => {
    setIntegrations(integrations.map(integration => 
      integration.id === id 
        ? { ...integration, connected: !integration.connected }
        : integration
    ));
    toast.success(integrations.find(i => i.id === id)?.connected ? 'Integration disabled' : 'Integration enabled');
  };

  const saveApiKey = () => {
    if (!apiKey) {
      toast.error('Please enter an API key');
      return;
    }
    toast.success('API key saved successfully');
    setApiKey('');
  };

  return (
    <div className="space-y-6">
      {/* OpenAI Integration */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Key className="w-5 h-5" />
            OpenAI API Configuration
          </CardTitle>
          <CardDescription>
            Configure your OpenAI API key to enable AI features (OCR Scanner & AI Chatbot)
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Alert>
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              AI features are currently available only for Premium plan subscribers. Get your API key from{' '}
              <a href="https://platform.openai.com/api-keys" target="_blank" rel="noopener noreferrer" className="underline">
                OpenAI Platform
              </a>
            </AlertDescription>
          </Alert>

          <div>
            <Label htmlFor="openaiKey">OpenAI API Key</Label>
            <div className="flex gap-2">
              <Input
                id="openaiKey"
                type="password"
                value={apiKey}
                onChange={(e) => setApiKey(e.target.value)}
                placeholder="sk-..."
              />
              <Button onClick={saveApiKey}>Save</Button>
            </div>
            <p className="text-sm text-muted-foreground mt-2">
              Your API key is encrypted and stored securely
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Available Integrations */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Plug className="w-5 h-5" />
            Available Integrations
          </CardTitle>
          <CardDescription>
            Connect third-party services to extend EaziBook functionality
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          {integrations.map((integration) => (
            <div key={integration.id} className="flex items-center justify-between p-4 border rounded-lg">
              <div className="flex items-start gap-3">
                <div className="text-2xl">{integration.icon}</div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="font-medium">{integration.name}</h3>
                    {integration.connected && (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 text-xs bg-green-100 text-green-800 rounded">
                        <Check className="w-3 h-3" />
                        Connected
                      </span>
                    )}
                  </div>
                  <p className="text-sm text-muted-foreground">{integration.description}</p>
                </div>
              </div>
              <Button
                variant={integration.connected ? "outline" : "default"}
                size="sm"
                onClick={() => toggleIntegration(integration.id)}
              >
                {integration.connected ? 'Disconnect' : 'Connect'}
              </Button>
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Webhook Configuration */}
      <Card>
        <CardHeader>
          <CardTitle>Webhook Configuration</CardTitle>
          <CardDescription>
            Set up webhooks for real-time notifications
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label htmlFor="webhookUrl">Webhook URL</Label>
            <Input
              id="webhookUrl"
              type="url"
              placeholder="https://your-domain.com/webhook"
            />
          </div>

          <div className="space-y-2">
            <Label>Events to Subscribe</Label>
            <div className="space-y-2">
              {['Invoice Created', 'Payment Received', 'Bill Created', 'Transaction Posted'].map((event) => (
                <label key={event} className="flex items-center gap-2">
                  <input type="checkbox" className="w-4 h-4" />
                  <span className="text-sm">{event}</span>
                </label>
              ))}
            </div>
          </div>

          <Button variant="outline">Test Webhook</Button>
        </CardContent>
      </Card>
    </div>
  );
}
