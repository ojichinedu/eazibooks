import { useState } from 'react';
import { AlertCircle, Database, CheckCircle, Loader2, RefreshCw } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from './ui/alert';
import { Button } from './ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { performHealthCheck, HealthCheckResult } from '../utils/systemHealthCheck';
import { toast } from 'sonner@2.0.3';

export function DatabaseSetupGuide() {
  const [isChecking, setIsChecking] = useState(false);
  const [healthStatus, setHealthStatus] = useState<HealthCheckResult | null>(null);

  const handleHealthCheck = async () => {
    setIsChecking(true);
    try {
      const result = await performHealthCheck();
      setHealthStatus(result);
      if (result.isDatabaseReady && result.isStorageReady && result.errors.length === 0) {
        toast.success('All systems ready! You can now use EaziBook.');
        setTimeout(() => window.location.reload(), 1500);
      } else {
        toast.error('Setup is incomplete. Follow the Laravel steps below.');
      }
    } catch (error) {
      toast.error('Health check failed. Check the Laravel server and try again.');
      console.error('Health check error:', error);
    } finally {
      setIsChecking(false);
    }
  };

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <Alert className="mb-6 border-orange-500 bg-orange-50">
        <AlertCircle className="h-4 w-4 text-orange-600" />
        <AlertTitle className="text-orange-900">Laravel setup required</AlertTitle>
        <AlertDescription className="text-orange-800">
          EaziBook needs its Laravel database and file storage ready before you can use the workspace.
        </AlertDescription>
      </Alert>

      {healthStatus && (
        <Card className="mb-6">
          <CardHeader><CardTitle className="flex items-center gap-2">
            {healthStatus.isDatabaseReady && healthStatus.errors.length === 0
              ? <CheckCircle className="w-5 h-5 text-green-600" />
              : <AlertCircle className="w-5 h-5 text-orange-600" />}
            System status
          </CardTitle></CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-center gap-2"><div className={'w-3 h-3 rounded-full ' + (healthStatus.isDatabaseReady ? 'bg-green-500' : 'bg-red-500')} /><span>Laravel database: {healthStatus.isDatabaseReady ? 'Ready' : 'Unavailable'}</span></div>
            <div className="flex items-center gap-2"><div className={'w-3 h-3 rounded-full ' + (healthStatus.isStorageReady ? 'bg-green-500' : 'bg-orange-500')} /><span>File storage: {healthStatus.isStorageReady ? 'Ready' : 'Unavailable'}</span></div>
            {healthStatus.errors.map((error, index) => <p className="text-sm text-red-800" key={'error-' + index}>{error}</p>)}
            {healthStatus.warnings.map((warning, index) => <p className="text-sm text-orange-800" key={'warning-' + index}>{warning}</p>)}
          </CardContent>
        </Card>
      )}

      <div className="mb-6">
        <Button onClick={handleHealthCheck} disabled={isChecking} variant="outline" className="gap-2">
          {isChecking ? <><Loader2 className="w-4 h-4 animate-spin" />Checking...</> : <><RefreshCw className="w-4 h-4" />Check system status</>}
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2"><Database className="w-5 h-5" />Quick setup</CardTitle>
          <CardDescription>Run these commands from the project folder in order.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-5 text-sm">
          <p><strong>1. Configure Laravel:</strong> copy .env.example to .env, then run php artisan key:generate.</p>
          <p><strong>2. Create the database tables:</strong> run php artisan migrate.</p>
          <p><strong>3. Enable uploaded logos:</strong> run php artisan storage:link.</p>
          <p><strong>4. Start both servers:</strong> run php artisan serve and npm run dev in separate terminals.</p>
          <p className="text-muted-foreground">Laravel uses SQLite by default. Set DB_CONNECTION and the DB_* values in .env to use MySQL.</p>
        </CardContent>
      </Card>
    </div>
  );
}