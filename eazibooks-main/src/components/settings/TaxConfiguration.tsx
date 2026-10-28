import { useState, useEffect } from 'react';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Calculator, Plus, Trash2, Loader2 } from 'lucide-react';
import { toast } from 'sonner@2.0.3';

interface TaxRate {
  id: string;
  name: string;
  rate: number;
  type: string;
}

export function TaxConfiguration() {
  const [isLoading, setIsLoading] = useState(false);
  const [defaultTaxRate, setDefaultTaxRate] = useState('18');
  const [taxRates, setTaxRates] = useState<TaxRate[]>([
    { id: '1', name: 'Standard VAT', rate: 18, type: 'VAT' },
    { id: '2', name: 'Reduced VAT', rate: 7.5, type: 'VAT' },
    { id: '3', name: 'Zero Rated', rate: 0, type: 'VAT' }
  ]);

  const [newRate, setNewRate] = useState({
    name: '',
    rate: '',
    type: 'VAT'
  });

  const addTaxRate = () => {
    if (!newRate.name || !newRate.rate) {
      toast.error('Please fill in all fields');
      return;
    }

    const rate: TaxRate = {
      id: Date.now().toString(),
      name: newRate.name,
      rate: parseFloat(newRate.rate),
      type: newRate.type
    };

    setTaxRates([...taxRates, rate]);
    setNewRate({ name: '', rate: '', type: 'VAT' });
    toast.success('Tax rate added');
  };

  const deleteTaxRate = (id: string) => {
    setTaxRates(taxRates.filter(rate => rate.id !== id));
    toast.success('Tax rate deleted');
  };

  const handleSave = () => {
    toast.success('Tax configuration saved successfully');
  };

  return (
    <div className="space-y-6">
      {/* Default Tax Settings */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calculator className="w-5 h-5" />
            Default Tax Settings
          </CardTitle>
          <CardDescription>
            Configure your default tax rates and compliance settings
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="defaultTaxRate">Default Tax Rate (%)</Label>
              <Input
                id="defaultTaxRate"
                type="number"
                value={defaultTaxRate}
                onChange={(e) => setDefaultTaxRate(e.target.value)}
                placeholder="18"
              />
            </div>
            <div>
              <Label htmlFor="taxSystem">Tax System</Label>
              <Select defaultValue="vat">
                <SelectTrigger id="taxSystem">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="vat">VAT (Value Added Tax)</SelectItem>
                  <SelectItem value="gst">GST (Goods & Services Tax)</SelectItem>
                  <SelectItem value="sales">Sales Tax</SelectItem>
                  <SelectItem value="none">No Tax</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="taxId">Tax ID / VAT Number</Label>
              <Input
                id="taxId"
                placeholder="Enter your tax identification number"
              />
            </div>
            <div>
              <Label htmlFor="taxPeriod">Tax Filing Period</Label>
              <Select defaultValue="monthly">
                <SelectTrigger id="taxPeriod">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="monthly">Monthly</SelectItem>
                  <SelectItem value="quarterly">Quarterly</SelectItem>
                  <SelectItem value="annually">Annually</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Tax Rates Management */}
      <Card>
        <CardHeader>
          <CardTitle>Tax Rates</CardTitle>
          <CardDescription>
            Manage different tax rates for your products and services
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Existing Tax Rates */}
          <div className="space-y-2">
            {taxRates.map((rate) => (
              <div key={rate.id} className="flex items-center justify-between p-3 border rounded-lg">
                <div className="flex-1">
                  <h4 className="font-medium">{rate.name}</h4>
                  <p className="text-sm text-muted-foreground">{rate.type} - {rate.rate}%</p>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => deleteTaxRate(rate.id)}
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
            ))}
          </div>

          {/* Add New Tax Rate */}
          <div className="border-t pt-4">
            <h4 className="font-medium mb-3">Add New Tax Rate</h4>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
              <Input
                placeholder="Rate Name"
                value={newRate.name}
                onChange={(e) => setNewRate({ ...newRate, name: e.target.value })}
              />
              <Input
                type="number"
                placeholder="Rate %"
                value={newRate.rate}
                onChange={(e) => setNewRate({ ...newRate, rate: e.target.value })}
              />
              <Select
                value={newRate.type}
                onValueChange={(value) => setNewRate({ ...newRate, type: value })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="VAT">VAT</SelectItem>
                  <SelectItem value="GST">GST</SelectItem>
                  <SelectItem value="Sales Tax">Sales Tax</SelectItem>
                  <SelectItem value="Other">Other</SelectItem>
                </SelectContent>
              </Select>
              <Button onClick={addTaxRate}>
                <Plus className="w-4 h-4 mr-2" />
                Add
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Tax Compliance */}
      <Card>
        <CardHeader>
          <CardTitle>Tax Compliance</CardTitle>
          <CardDescription>
            Manage tax compliance and reporting settings
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between p-4 border rounded-lg">
            <div>
              <h3 className="font-medium">Automated Tax Calculations</h3>
              <p className="text-sm text-muted-foreground">
                Automatically calculate taxes on all transactions
              </p>
            </div>
            <input type="checkbox" defaultChecked className="w-4 h-4" />
          </div>

          <div className="flex items-center justify-between p-4 border rounded-lg">
            <div>
              <h3 className="font-medium">Tax Inclusive Pricing</h3>
              <p className="text-sm text-muted-foreground">
                Show prices with tax included
              </p>
            </div>
            <input type="checkbox" className="w-4 h-4" />
          </div>

          <div className="flex items-center justify-between p-4 border rounded-lg">
            <div>
              <h3 className="font-medium">Tax Report Reminders</h3>
              <p className="text-sm text-muted-foreground">
                Get notified before tax filing deadlines
              </p>
            </div>
            <input type="checkbox" defaultChecked className="w-4 h-4" />
          </div>
        </CardContent>
      </Card>

      <div className="flex justify-end">
        <Button onClick={handleSave}>
          Save Tax Configuration
        </Button>
      </div>
    </div>
  );
}
