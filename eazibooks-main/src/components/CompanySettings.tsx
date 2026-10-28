import { useState, useEffect } from 'react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from './ui/card';
import { Textarea } from './ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Upload, Save, Building2, Loader2, DollarSign, RefreshCw } from 'lucide-react';
import { toast } from 'sonner@2.0.3';
import { supabase } from '../utils/supabase/client';
import { CURRENCIES, DEFAULT_CURRENCY } from '../utils/currency';
import { useCurrency } from '../utils/CurrencyContext';
import { DatabaseSetupGuide } from './DatabaseSetupGuide';
import { withTimeout, queryCache } from '../utils/queryHelpers';

interface CompanySettingsData {
  companyName: string;
  address: string;
  city: string;
  state: string;
  zipCode: string;
  country: string;
  phone: string;
  email: string;
  website: string;
  gstin: string;
  pan: string;
  logoUrl: string;
  currency: string;
}

export function CompanySettings() {
  const { setCurrency } = useCurrency();
  const [settings, setSettings] = useState<CompanySettingsData>({
    companyName: '',
    address: '',
    city: '',
    state: '',
    zipCode: '',
    country: 'Nigeria',
    phone: '',
    email: '',
    website: '',
    gstin: '',
    pan: '',
    logoUrl: '',
    currency: DEFAULT_CURRENCY
  });
  
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isUploadingLogo, setIsUploadingLogo] = useState(false);
  const [isDatabaseReady, setIsDatabaseReady] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    setIsLoading(true);
    setLoadError(null);

    try {
      // Check cache first
      const cacheKey = 'company-settings';
      const cached = queryCache.get(cacheKey);
      
      if (cached) {
        setSettings(cached);
        setIsLoading(false);
        // Load in background to refresh
        loadSettingsFromDatabase(cacheKey);
        return;
      }

      await loadSettingsFromDatabase(cacheKey);
    } catch (error: any) {
      console.error('Error loading company settings:', error);
      setLoadError(error.message);
      
      if (error.message === 'Request timeout') {
        toast.error('Loading timed out. Please check your internet connection.');
      } else {
        toast.error('Failed to load settings. Check your Supabase connection.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const loadSettingsFromDatabase = async (cacheKey: string) => {
    await withTimeout(
      (async () => {
        const { data: { user }, error: userError } = await supabase.auth.getUser();
        
        if (userError) throw userError;
        if (!user) throw new Error('No authenticated user');

        try {
          // First get the profile to get company_id
          const { data: profile, error: profileError } = await supabase
            .from('profiles')
            .select('company_id')
            .eq('id', user.id)
            .maybeSingle();

          if (profileError && profileError.code !== 'PGRST116') {
            throw profileError;
          }

          // If profile has company_id, get company data
          if (profile?.company_id) {
            const { data: company, error: companyError } = await supabase
              .from('companies')
              .select('id, name, address, city, state, country, postal_code, phone, email, website, tax_id, registration_number, logo_url, currency')
              .eq('id', profile.company_id)
              .maybeSingle();

            if (companyError && companyError.code !== 'PGRST116') {
              throw companyError;
            }

            if (company) {
              const newSettings = {
                companyName: company.name || '',
                address: company.address || '',
                city: company.city || '',
                state: company.state || '',
                zipCode: company.postal_code || '',
                country: company.country || 'Nigeria',
                phone: company.phone || '',
                email: company.email || '',
                website: company.website || '',
                gstin: company.tax_id || '',
                pan: company.registration_number || '',
                logoUrl: company.logo_url || '',
                currency: company.currency || DEFAULT_CURRENCY
              };
              
              setSettings(newSettings);
              // Cache the result
              queryCache.set(cacheKey, newSettings, 5 * 60 * 1000); // 5 minutes
            }
          }
        } catch (dbError: any) {
          console.warn('Database error loading settings:', dbError);
          
          if (dbError.message?.includes('relation') || dbError.message?.includes('does not exist')) {
            setIsDatabaseReady(false);
            throw new Error('Database not set up');
          } else if (dbError.code !== 'PGRST116') {
            throw dbError;
          }
        }
      })(),
      5000, // 5 second timeout
      'Request timeout'
    );
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        throw new Error('User not authenticated');
      }

      // Get user profile
      const { data: profile } = await supabase
        .from('profiles')
        .select('company_id')
        .eq('id', user.id)
        .single();

      let companyId = profile?.company_id;

      // If no company exists, create one
      if (!companyId) {
        const { data: newCompany, error: createError } = await supabase
          .from('companies')
          .insert({
            name: settings.companyName || 'My Company',
            address: settings.address,
            city: settings.city,
            state: settings.state,
            postal_code: settings.zipCode,
            country: settings.country,
            phone: settings.phone,
            email: settings.email,
            website: settings.website,
            tax_id: settings.gstin,
            registration_number: settings.pan,
            logo_url: settings.logoUrl,
            currency: settings.currency
          })
          .select()
          .single();

        if (createError) {
          console.error('❌ Error creating company:', createError);
          console.error('Error details:', JSON.stringify(createError, null, 2));
          throw createError;
        }
        
        companyId = newCompany.id;

        // Update profile with company_id
        const { error: profileError } = await supabase
          .from('profiles')
          .update({ company_id: companyId })
          .eq('id', user.id);

        if (profileError) throw profileError;

        // Create default free subscription
        await supabase
          .from('subscriptions')
          .insert({
            company_id: companyId,
            user_id: user.id,
            plan_type: 'free',
            status: 'active',
            invoices_limit: 5,
            bills_limit: 5,
            invoices_used: 0,
            bills_used: 0
          });

        toast.success('Company profile created successfully');
      } else {
        // Update existing company
        const { error: updateError } = await supabase
          .from('companies')
          .update({
            name: settings.companyName,
            address: settings.address,
            city: settings.city,
            state: settings.state,
            postal_code: settings.zipCode,
            country: settings.country,
            phone: settings.phone,
            email: settings.email,
            website: settings.website,
            tax_id: settings.gstin,
            registration_number: settings.pan,
            logo_url: settings.logoUrl,
            currency: settings.currency
          })
          .eq('id', companyId);

        if (updateError) throw updateError;
        
        toast.success('Company settings saved successfully');
      }

      // Update currency context
      setCurrency(settings.currency);
      
      // Clear cache and reload settings to ensure sync
      queryCache.clear('company-settings');
      await loadSettings();
    } catch (error: any) {
      console.error('❌ Error saving company settings:', error);
      console.error('Error code:', error?.code);
      console.error('Error message:', error?.message);
      console.error('Full error:', JSON.stringify(error, null, 2));
      
      // Show specific error message
      if (error?.code === '42501') {
        toast.error('Database permission error. Please run the RLS fix SQL script.');
      } else if (error?.message) {
        toast.error(`Failed to save: ${error.message}`);
      } else {
        toast.error('Failed to save company settings');
      }
    } finally {
      setIsSaving(false);
    }
  };

  const handleLogoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      toast.error('Please upload an image file');
      return;
    }

    // Validate file size (max 2MB)
    if (file.size > 2 * 1024 * 1024) {
      toast.error('Image size should be less than 2MB');
      return;
    }

    setIsUploadingLogo(true);

    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        toast.error('Please log in to upload logo');
        return;
      }

      const { data: profile } = await supabase
        .from('profiles')
        .select('company_id')
        .eq('id', user.id)
        .single();

      if (!profile?.company_id) {
        toast.error('Please save company settings first before uploading logo');
        return;
      }

      // Upload to Supabase Storage
      const fileExt = file.name.split('.').pop();
      const fileName = `${profile.company_id}-${Date.now()}.${fileExt}`;
      const filePath = `company-logos/${fileName}`;

      const { error: uploadError, data: uploadData } = await supabase.storage
        .from('company-assets')
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: false
        });

      if (uploadError) {
        console.error('Upload error:', uploadError);
        if (uploadError.message.includes('not found') || uploadError.message.includes('bucket')) {
          toast.error('Storage bucket not set up. Please create "company-assets" bucket in Supabase Storage.');
        } else {
          toast.error(`Upload failed: ${uploadError.message}`);
        }
        throw uploadError;
      }

      // Get public URL
      const { data: { publicUrl } } = supabase.storage
        .from('company-assets')
        .getPublicUrl(filePath);

      setSettings({ ...settings, logoUrl: publicUrl });
      toast.success('Logo uploaded successfully! Remember to save settings.');
    } catch (error: any) {
      console.error('Error uploading logo:', error);
      if (!error.message?.includes('Storage')) {
        toast.error('Failed to upload logo. Check console for details.');
      }
    } finally {
      setIsUploadingLogo(false);
    }
  };

  if (isLoading) {
    return (
      <div className="p-6">
        <div className="flex flex-col items-center justify-center py-12 gap-4">
          <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
          <p className="text-sm text-muted-foreground">Loading company settings...</p>
          {loadError && (
            <div className="mt-4 p-4 border rounded-lg bg-muted max-w-md">
              <p className="text-sm text-destructive mb-2">{loadError}</p>
              <Button 
                variant="outline" 
                size="sm" 
                onClick={loadSettings}
                className="gap-2"
              >
                <RefreshCw className="w-4 h-4" />
                Retry
              </Button>
            </div>
          )}
        </div>
      </div>
    );
  }

  // Show setup guide if database is not ready
  if (!isDatabaseReady) {
    return <DatabaseSetupGuide />;
  }

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <div className="mb-6">
        <h1>Company Settings</h1>
        <p className="text-muted-foreground">
          Configure your business information for branded invoices and receipts
        </p>
      </div>

      <div className="space-y-6">
        {/* Logo Upload */}
        <Card>
          <CardHeader>
            <CardTitle>Company Logo</CardTitle>
            <CardDescription>
              Upload your company logo. This will appear on all invoices and receipts.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-start gap-6">
              {settings.logoUrl ? (
                <div className="w-32 h-32 border-2 border-dashed rounded-lg flex items-center justify-center overflow-hidden bg-muted">
                  <img 
                    src={settings.logoUrl} 
                    alt="Company Logo" 
                    className="max-w-full max-h-full object-contain"
                  />
                </div>
              ) : (
                <div className="w-32 h-32 border-2 border-dashed rounded-lg flex items-center justify-center bg-muted">
                  <Building2 className="w-12 h-12 text-muted-foreground" />
                </div>
              )}
              
              <div className="flex-1">
                <Label htmlFor="logo-upload" className="cursor-pointer">
                  <div className="inline-flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-md hover:opacity-90">
                    {isUploadingLogo ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        Uploading...
                      </>
                    ) : (
                      <>
                        <Upload className="w-4 h-4" />
                        Upload Logo
                      </>
                    )}
                  </div>
                  <Input
                    id="logo-upload"
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={handleLogoUpload}
                    disabled={isUploadingLogo}
                  />
                </Label>
                <p className="text-sm text-muted-foreground mt-2">
                  PNG, JPG or GIF. Maximum size 2MB.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Company Information */}
        <Card>
          <CardHeader>
            <CardTitle>Company Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="companyName">Company Name *</Label>
              <Input
                id="companyName"
                value={settings.companyName}
                onChange={(e) => setSettings({ ...settings, companyName: e.target.value })}
                placeholder="Your Company Name"
              />
            </div>

            <div>
              <Label htmlFor="address">Street Address *</Label>
              <Textarea
                id="address"
                value={settings.address}
                onChange={(e) => setSettings({ ...settings, address: e.target.value })}
                placeholder="123 Business Street"
                rows={2}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <Label htmlFor="city">City *</Label>
                <Input
                  id="city"
                  value={settings.city}
                  onChange={(e) => setSettings({ ...settings, city: e.target.value })}
                  placeholder="Mumbai"
                />
              </div>
              <div>
                <Label htmlFor="state">State *</Label>
                <Input
                  id="state"
                  value={settings.state}
                  onChange={(e) => setSettings({ ...settings, state: e.target.value })}
                  placeholder="Maharashtra"
                />
              </div>
              <div>
                <Label htmlFor="zipCode">ZIP Code *</Label>
                <Input
                  id="zipCode"
                  value={settings.zipCode}
                  onChange={(e) => setSettings({ ...settings, zipCode: e.target.value })}
                  placeholder="400001"
                />
              </div>
            </div>

            <div>
              <Label htmlFor="country">Country *</Label>
              <Input
                id="country"
                value={settings.country}
                onChange={(e) => setSettings({ ...settings, country: e.target.value })}
                placeholder="India"
              />
            </div>
          </CardContent>
        </Card>

        {/* Contact Information */}
        <Card>
          <CardHeader>
            <CardTitle>Contact Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="phone">Phone Number *</Label>
                <Input
                  id="phone"
                  type="tel"
                  value={settings.phone}
                  onChange={(e) => setSettings({ ...settings, phone: e.target.value })}
                  placeholder="+91 98765 43210"
                />
              </div>
              <div>
                <Label htmlFor="email">Email Address *</Label>
                <Input
                  id="email"
                  type="email"
                  value={settings.email}
                  onChange={(e) => setSettings({ ...settings, email: e.target.value })}
                  placeholder="contact@company.com"
                />
              </div>
            </div>

            <div>
              <Label htmlFor="website">Website (Optional)</Label>
              <Input
                id="website"
                type="url"
                value={settings.website}
                onChange={(e) => setSettings({ ...settings, website: e.target.value })}
                placeholder="https://www.yourcompany.com"
              />
            </div>
          </CardContent>
        </Card>

        {/* Currency & Regional Settings */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <DollarSign className="w-5 h-5" />
              Currency & Regional Settings
            </CardTitle>
            <CardDescription>
              Select your preferred currency for all transactions
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="currency">Default Currency *</Label>
              <Select
                value={settings.currency}
                onValueChange={(value) => setSettings({ ...settings, currency: value })}
              >
                <SelectTrigger id="currency">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {Object.values(CURRENCIES).map((currency) => (
                    <SelectItem key={currency.code} value={currency.code}>
                      <div className="flex items-center gap-2">
                        <span className="font-medium">{currency.symbol}</span>
                        <span>{currency.name}</span>
                        <span className="text-muted-foreground">({currency.code})</span>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Tax Information */}
        <Card>
          <CardHeader>
            <CardTitle>Tax Information</CardTitle>
            <CardDescription>
              Optional - Configure based on your region
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="gstin">Tax ID / VAT / GST Number</Label>
                <Input
                  id="gstin"
                  value={settings.gstin}
                  onChange={(e) => setSettings({ ...settings, gstin: e.target.value })}
                  placeholder="Enter your tax identification number"
                />
              </div>
              <div>
                <Label htmlFor="pan">Additional Tax Number</Label>
                <Input
                  id="pan"
                  value={settings.pan}
                  onChange={(e) => setSettings({ ...settings, pan: e.target.value })}
                  placeholder="e.g., PAN, TIN, etc."
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Save Button */}
        <div className="flex justify-end">
          <Button onClick={handleSave} disabled={isSaving} className="gap-2">
            {isSaving ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Saving...
              </>
            ) : (
              <>
                <Save className="w-4 h-4" />
                Save Settings
              </>
            )}
          </Button>
        </div>
      </div>
    </div>
  );
}
