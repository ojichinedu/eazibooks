import { useState } from 'react';
import { Button } from '../ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Bell, Mail, MessageSquare } from 'lucide-react';
import { toast } from 'sonner@2.0.3';

interface NotificationPreference {
  id: string;
  title: string;
  description: string;
  email: boolean;
  push: boolean;
  sms: boolean;
}

export function NotificationSettings() {
  const [preferences, setPreferences] = useState<NotificationPreference[]>([
    {
      id: 'invoices',
      title: 'Invoice Updates',
      description: 'New invoices, payments received, and overdue notices',
      email: true,
      push: true,
      sms: false
    },
    {
      id: 'payments',
      title: 'Payment Notifications',
      description: 'Payment confirmations and failed transactions',
      email: true,
      push: true,
      sms: true
    },
    {
      id: 'bills',
      title: 'Bill Reminders',
      description: 'Upcoming bills and payment due dates',
      email: true,
      push: false,
      sms: false
    },
    {
      id: 'inventory',
      title: 'Inventory Alerts',
      description: 'Low stock warnings and reorder notifications',
      email: true,
      push: true,
      sms: false
    },
    {
      id: 'tax',
      title: 'Tax & Compliance',
      description: 'Tax filing deadlines and compliance reminders',
      email: true,
      push: true,
      sms: false
    },
    {
      id: 'reports',
      title: 'Report Generation',
      description: 'When reports are ready to view or download',
      email: true,
      push: false,
      sms: false
    },
    {
      id: 'system',
      title: 'System Updates',
      description: 'New features, maintenance, and important announcements',
      email: true,
      push: true,
      sms: false
    }
  ]);

  const [digestFrequency, setDigestFrequency] = useState('daily');

  const toggleNotification = (id: string, type: 'email' | 'push' | 'sms') => {
    setPreferences(preferences.map(pref =>
      pref.id === id ? { ...pref, [type]: !pref[type] } : pref
    ));
  };

  const handleSave = () => {
    toast.success('Notification preferences saved successfully');
  };

  return (
    <div className="space-y-6">
      {/* Email Notifications */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Mail className="w-5 h-5" />
            Email Notifications
          </CardTitle>
          <CardDescription>
            Choose which emails you want to receive
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <label className="flex items-center gap-2 mb-4">
              <input type="checkbox" defaultChecked className="w-4 h-4" />
              <span className="font-medium">Enable email notifications</span>
            </label>
          </div>

          <div className="space-y-3">
            {preferences.map((pref) => (
              <div key={pref.id} className="flex items-start justify-between p-3 border rounded-lg">
                <div className="flex-1">
                  <h4 className="font-medium">{pref.title}</h4>
                  <p className="text-sm text-muted-foreground">{pref.description}</p>
                </div>
                <div className="flex gap-4">
                  <label className="flex items-center gap-1">
                    <input
                      type="checkbox"
                      checked={pref.email}
                      onChange={() => toggleNotification(pref.id, 'email')}
                      className="w-4 h-4"
                    />
                    <span className="text-sm">Email</span>
                  </label>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Push Notifications */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Bell className="w-5 h-5" />
            Push Notifications
          </CardTitle>
          <CardDescription>
            Get instant notifications in your browser
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <label className="flex items-center gap-2 mb-4">
              <input type="checkbox" defaultChecked className="w-4 h-4" />
              <span className="font-medium">Enable push notifications</span>
            </label>
          </div>

          <div className="space-y-3">
            {preferences.map((pref) => (
              <div key={pref.id} className="flex items-start justify-between p-3 border rounded-lg">
                <div className="flex-1">
                  <h4 className="font-medium">{pref.title}</h4>
                  <p className="text-sm text-muted-foreground">{pref.description}</p>
                </div>
                <div className="flex gap-4">
                  <label className="flex items-center gap-1">
                    <input
                      type="checkbox"
                      checked={pref.push}
                      onChange={() => toggleNotification(pref.id, 'push')}
                      className="w-4 h-4"
                    />
                    <span className="text-sm">Push</span>
                  </label>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* SMS Notifications */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MessageSquare className="w-5 h-5" />
            SMS Notifications
          </CardTitle>
          <CardDescription>
            Receive important alerts via text message (Premium only)
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between p-4 border rounded-lg bg-muted/50">
            <div>
              <h3 className="font-medium">SMS notifications are coming soon</h3>
              <p className="text-sm text-muted-foreground">
                This feature will be available for Premium subscribers
              </p>
            </div>
            <Button variant="outline" disabled>
              Coming Soon
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Email Digest */}
      <Card>
        <CardHeader>
          <CardTitle>Email Digest</CardTitle>
          <CardDescription>
            Receive a summary of your activities
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <label className="flex items-center gap-2 mb-4">
              <input type="checkbox" defaultChecked className="w-4 h-4" />
              <span className="font-medium">Send me email digests</span>
            </label>
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Digest Frequency</label>
            <Select value={digestFrequency} onValueChange={setDigestFrequency}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="daily">Daily Summary</SelectItem>
                <SelectItem value="weekly">Weekly Summary</SelectItem>
                <SelectItem value="monthly">Monthly Summary</SelectItem>
                <SelectItem value="never">Never</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2 pt-2">
            <label className="flex items-center gap-2">
              <input type="checkbox" defaultChecked className="w-4 h-4" />
              <span className="text-sm">Include financial summary</span>
            </label>
            <label className="flex items-center gap-2">
              <input type="checkbox" defaultChecked className="w-4 h-4" />
              <span className="text-sm">Include top customers & products</span>
            </label>
            <label className="flex items-center gap-2">
              <input type="checkbox" defaultChecked className="w-4 h-4" />
              <span className="text-sm">Include upcoming deadlines</span>
            </label>
          </div>
        </CardContent>
      </Card>

      <div className="flex justify-end">
        <Button onClick={handleSave}>
          Save Notification Preferences
        </Button>
      </div>
    </div>
  );
}
