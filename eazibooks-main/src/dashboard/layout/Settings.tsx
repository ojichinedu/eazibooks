import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../components/ui/tabs';
import { CompanySettings } from '../../components/CompanySettings';
import { Subscription } from '../../components/Subscription';
import { ProfileAccount } from '../../components/settings/ProfileAccount';
import { UserManagement } from '../../components/settings/UserManagement';
import { TaxConfiguration } from '../../components/settings/TaxConfiguration';
import { Integrations } from '../../components/settings/Integrations';
import { BackupSecurity } from '../../components/settings/BackupSecurity';
import { NotificationSettings } from '../../components/settings/NotificationSettings';

export function Settings() {
  return (
    <div className="p-4 md:p-6">
      <div className="mb-4 md:mb-6">
        <h1 className="text-2xl md:text-3xl">Settings</h1>
        <p className="text-muted-foreground text-sm md:text-base">Configure your EaziBook system settings</p>
      </div>

      <Tabs defaultValue="profile" className="w-full">
        <TabsList className="mb-4 md:mb-6 flex-wrap h-auto gap-1">
          <TabsTrigger value="profile" className="text-xs md:text-sm">Profile & Account</TabsTrigger>
          <TabsTrigger value="company" className="text-xs md:text-sm">Company Settings</TabsTrigger>
          <TabsTrigger value="users" className="text-xs md:text-sm">User Management</TabsTrigger>
          <TabsTrigger value="tax" className="text-xs md:text-sm">Tax Configuration</TabsTrigger>
          <TabsTrigger value="integrations" className="text-xs md:text-sm">Integrations</TabsTrigger>
          <TabsTrigger value="backup" className="text-xs md:text-sm">Backup & Security</TabsTrigger>
          <TabsTrigger value="notifications" className="text-xs md:text-sm">Notifications</TabsTrigger>
          <TabsTrigger value="subscription" className="text-xs md:text-sm">Subscription</TabsTrigger>
          <TabsTrigger value="ai" className="text-xs md:text-sm">AI Features</TabsTrigger>
        </TabsList>

        <TabsContent value="profile">
          <ProfileAccount />
        </TabsContent>

        <TabsContent value="company">
          <CompanySettings />
        </TabsContent>

        <TabsContent value="users">
          <UserManagement />
        </TabsContent>

        <TabsContent value="tax">
          <TaxConfiguration />
        </TabsContent>

        <TabsContent value="integrations">
          <Integrations />
        </TabsContent>

        <TabsContent value="backup">
          <BackupSecurity />
        </TabsContent>

        <TabsContent value="notifications">
          <NotificationSettings />
        </TabsContent>

        <TabsContent value="subscription">
          <Subscription />
        </TabsContent>

        <TabsContent value="ai">
          <div className="p-6 border-2 rounded-lg bg-muted">
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 bg-primary text-primary-foreground rounded-lg flex items-center justify-center flex-shrink-0">
                <span className="font-bold">AI</span>
              </div>
              <div className="flex-1">
                <h3 className="font-medium mb-2">AI-Powered Features</h3>
                <p className="text-sm text-muted-foreground mb-3">
                  EaziBook is enhanced with artificial intelligence capabilities powered by OpenAI:
                </p>
                <ul className="text-sm space-y-2 text-muted-foreground">
                  <li>• <strong>AI Financial Consultant:</strong> Chat with an AI assistant for business advice (chat button in bottom-right)</li>
                  <li>• <strong>OCR Scanner:</strong> Automatically extract data from invoices and receipts using computer vision</li>
                  <li>• <strong>Smart Categorization:</strong> AI-powered expense and transaction categorization</li>
                  <li>• <strong>Business Insights:</strong> Automated analytics and recommendations</li>
                </ul>
                <div className="mt-3 p-3 bg-background rounded border">
                  <p className="text-xs text-muted-foreground">
                    <strong>Note:</strong> AI features require an OpenAI API key to be configured in the Integrations tab. 
                    The system will display error messages if the key is not configured or invalid.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}