import { useState } from 'react';
import { Button } from '../ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Label } from '../ui/label';
import { Shield, Download, Clock, AlertCircle, CheckCircle, Loader2 } from 'lucide-react';
import { toast } from 'sonner@2.0.3';

export function BackupSecurity() {
  const [isDownloading, setIsDownloading] = useState(false);
  const [backupFrequency, setBackupFrequency] = useState('weekly');

  const handleDownloadBackup = async () => {
    setIsDownloading(true);
    try {
      // Simulate backup download
      await new Promise(resolve => setTimeout(resolve, 2000));
      toast.success('Backup downloaded successfully');
    } catch (error) {
      toast.error('Failed to download backup');
    } finally {
      setIsDownloading(false);
    }
  };

  const loginHistory = [
    { date: '2025-01-30 10:30 AM', location: 'Lagos, Nigeria', device: 'Chrome on Windows', status: 'success' },
    { date: '2025-01-29 02:15 PM', location: 'Lagos, Nigeria', device: 'Chrome on Windows', status: 'success' },
    { date: '2025-01-28 09:45 AM', location: 'Lagos, Nigeria', device: 'Safari on iPhone', status: 'success' },
    { date: '2025-01-27 04:20 PM', location: 'Unknown', device: 'Chrome on Android', status: 'failed' }
  ];

  return (
    <div className="space-y-6">
      {/* Backup Settings */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Download className="w-5 h-5" />
            Data Backup
          </CardTitle>
          <CardDescription>
            Backup your business data regularly to prevent data loss
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label htmlFor="backupFrequency">Automatic Backup Frequency</Label>
            <Select value={backupFrequency} onValueChange={setBackupFrequency}>
              <SelectTrigger id="backupFrequency">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="daily">Daily</SelectItem>
                <SelectItem value="weekly">Weekly</SelectItem>
                <SelectItem value="monthly">Monthly</SelectItem>
                <SelectItem value="never">Never (Manual Only)</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="flex items-center justify-between p-4 border rounded-lg bg-muted/50">
            <div className="flex items-start gap-3">
              <Clock className="w-5 h-5 mt-0.5 text-muted-foreground" />
              <div>
                <h3 className="font-medium">Last Backup</h3>
                <p className="text-sm text-muted-foreground">January 28, 2025 at 11:30 PM</p>
              </div>
            </div>
            <Button onClick={handleDownloadBackup} disabled={isDownloading}>
              {isDownloading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Downloading...
                </>
              ) : (
                <>
                  <Download className="w-4 h-4 mr-2" />
                  Download
                </>
              )}
            </Button>
          </div>

          <div className="flex items-center justify-between p-4 border rounded-lg">
            <div>
              <h3 className="font-medium">Create Manual Backup</h3>
              <p className="text-sm text-muted-foreground">
                Download a backup of all your business data
              </p>
            </div>
            <Button variant="outline" onClick={handleDownloadBackup} disabled={isDownloading}>
              <Download className="w-4 h-4 mr-2" />
              Backup Now
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Security Settings */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="w-5 h-5" />
            Security Settings
          </CardTitle>
          <CardDescription>
            Manage your account security and access controls
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between p-4 border rounded-lg">
            <div>
              <h3 className="font-medium">Two-Factor Authentication</h3>
              <p className="text-sm text-muted-foreground">
                Add an extra layer of security to your account
              </p>
            </div>
            <Button variant="outline" disabled>
              Coming Soon
            </Button>
          </div>

          <div className="flex items-center justify-between p-4 border rounded-lg">
            <div>
              <h3 className="font-medium">Session Timeout</h3>
              <p className="text-sm text-muted-foreground">
                Automatically log out after inactivity
              </p>
            </div>
            <Select defaultValue="30">
              <SelectTrigger className="w-32">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="15">15 minutes</SelectItem>
                <SelectItem value="30">30 minutes</SelectItem>
                <SelectItem value="60">1 hour</SelectItem>
                <SelectItem value="never">Never</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="flex items-center justify-between p-4 border rounded-lg">
            <div>
              <h3 className="font-medium">Require Password for Sensitive Actions</h3>
              <p className="text-sm text-muted-foreground">
                Extra confirmation for deletions and data exports
              </p>
            </div>
            <input type="checkbox" defaultChecked className="w-4 h-4" />
          </div>
        </CardContent>
      </Card>

      {/* Login History */}
      <Card>
        <CardHeader>
          <CardTitle>Login History</CardTitle>
          <CardDescription>
            Recent login activity on your account
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {loginHistory.map((login, index) => (
              <div key={index} className="flex items-start justify-between p-3 border rounded-lg">
                <div className="flex items-start gap-3">
                  {login.status === 'success' ? (
                    <CheckCircle className="w-5 h-5 text-green-600 mt-0.5" />
                  ) : (
                    <AlertCircle className="w-5 h-5 text-red-600 mt-0.5" />
                  )}
                  <div>
                    <h4 className="font-medium">{login.date}</h4>
                    <p className="text-sm text-muted-foreground">{login.location}</p>
                    <p className="text-sm text-muted-foreground">{login.device}</p>
                  </div>
                </div>
                {login.status === 'failed' && (
                  <span className="text-xs px-2 py-1 bg-red-100 text-red-800 rounded">
                    Failed
                  </span>
                )}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Security Audit Log */}
      <Card>
        <CardHeader>
          <CardTitle>Security Audit Log</CardTitle>
          <CardDescription>
            Track important security events and changes
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {[
              { action: 'Password changed', time: '2 days ago', user: 'You' },
              { action: 'Company settings updated', time: '5 days ago', user: 'You' },
              { action: 'New user invited', time: '1 week ago', user: 'You' },
              { action: 'Subscription upgraded', time: '2 weeks ago', user: 'You' }
            ].map((log, index) => (
              <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                <div>
                  <h4 className="font-medium">{log.action}</h4>
                  <p className="text-sm text-muted-foreground">by {log.user}</p>
                </div>
                <span className="text-sm text-muted-foreground">{log.time}</span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
