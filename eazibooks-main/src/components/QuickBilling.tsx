import { useState, useEffect } from 'react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Textarea } from './ui/textarea';
import { Separator } from './ui/separator';
import { Plus, Trash2, FileText, Download, Receipt, Printer, AlertCircle, Save } from 'lucide-react';
import { Badge } from './ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { toast } from 'sonner@2.0.3';
import { supabase } from '../utils/supabase/client';
import { useCurrency } from '../utils/CurrencyContext';
import { getCurrencySymbol, formatCurrency } from '../utils/currency';
import { useSubscription } from '../utils/SubscriptionContext';
import { Alert, AlertDescription } from './ui/alert';
import { createTransaction, fetchTransactions, fetchSuppliers, createSupplier, type Transaction } from '../utils/database';

interface BillItem {
  id: string;
  description: string;
  quantity: number;
  rate: number;
  taxRate: number;
  amount: number;
}

interface VendorDetails {
  name: string;
  email: string;
  phone: string;
  address: string;
  gstin: string;
}

interface CompanySettings {
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
}

export function QuickBilling() {
  const { currency } = useCurrency();
  const currencySymbol = getCurrencySymbol(currency);
  const { canCreateBill, incrementBillUsage, usage, limits, isPremium } = useSubscription();
  
  const [activeTab, setActiveTab] = useState('create-bill');
  const [vendorDetails, setVendorDetails] = useState<VendorDetails>({
    name: '',
    email: '',
    phone: '',
    address: '',
    gstin: ''
  });

  const [items, setItems] = useState<BillItem[]>([
    {
      id: '1',
      description: '',
      quantity: 1,
      rate: 0,
      taxRate: 18,
      amount: 0
    }
  ]);

  const [billNumber, setBillNumber] = useState(`BILL-${Date.now()}`);
  const [billDate, setBillDate] = useState(new Date().toISOString().split('T')[0]);
  const [dueDate, setDueDate] = useState('');
  const [notes, setNotes] = useState('');
  const [showPreview, setShowPreview] = useState(false);
  const [companySettings, setCompanySettings] = useState<CompanySettings | null>(null);

  useEffect(() => {
    loadCompanySettings();
  }, []);

  const loadCompanySettings = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (user) {
        const { data: profile } = await supabase
          .from('profiles')
          .select('company_id')
          .eq('id', user.id)
          .single();

        if (profile?.company_id) {
          const { data: company } = await supabase
            .from('companies')
            .select('*')
            .eq('id', profile.company_id)
            .single();

          if (company) {
            setCompanySettings({
              companyName: company.name || '',
              address: company.address || '',
              city: company.city || '',
              country: company.country || '',
              phone: company.phone || '',
              email: company.email || '',
              logoUrl: company.logo_url || '',
              currency: company.currency || 'NGN'
            });
          }
        }
      }
    } catch (error) {
      console.error('Error loading company settings:', error);
    }
  };

  const addItem = () => {
    const newItem: BillItem = {
      id: Date.now().toString(),
      description: '',
      quantity: 1,
      rate: 0,
      taxRate: 18,
      amount: 0
    };
    setItems([...items, newItem]);
  };

  const removeItem = (id: string) => {
    setItems(items.filter(item => item.id !== id));
  };

  const updateItem = (id: string, field: keyof BillItem, value: string | number) => {
    setItems(items.map(item => {
      if (item.id === id) {
        const updatedItem = { ...item, [field]: value };
        if (field === 'quantity' || field === 'rate') {
          updatedItem.amount = updatedItem.quantity * updatedItem.rate;
        }
        return updatedItem;
      }
      return item;
    }));
  };

  const subtotal = items.reduce((sum, item) => sum + item.amount, 0);
  const totalTax = items.reduce((sum, item) => sum + (item.amount * item.taxRate / 100), 0);
  const total = subtotal + totalTax;

  const [bills, setBills] = useState<Transaction[]>([]);

  const loadBills = async () => {
    try {
      const records = await fetchTransactions();
      setBills(records.filter((transaction) => transaction.type === 'bill'));
    } catch (error) {
      console.error('Error loading bills:', error);
      toast.error('Failed to load saved bills.');
    }
  };

  useEffect(() => {
    void loadBills();
  }, []);

  const pendingBills = bills.filter((bill) => bill.status === 'pending');
  const overdueBills = bills.filter((bill) => String(bill.status).toLowerCase() === 'overdue');
  const paidBillsThisMonth = bills.filter((bill) => {
    const date = bill.transaction_date || '';
    const currentMonth = new Date().toISOString().slice(0, 7);
    return bill.status === 'completed' && date.slice(0, 7) === currentMonth;
  });
  const billTotal = (records: Transaction[]) => records.reduce((total, bill) => total + Number(bill.amount || 0), 0);
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'paid':
        return 'bg-green-100 text-green-800';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'overdue':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const handleSaveBill = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        toast.error('You must be logged in to save bills');
        return null;
      }

      // Get company_id
      const { data: profile } = await supabase
        .from('profiles')
        .select('company_id')
        .eq('id', user.id)
        .single();

      if (!profile?.company_id) {
        toast.error('Company not found. Please set up your company first.');
        return null;
      }

      // Find or create supplier/vendor
      const suppliers = await fetchSuppliers();
      let supplier = suppliers.find(s => 
        s.name.toLowerCase() === vendorDetails.name.toLowerCase()
      );

      if (!supplier && vendorDetails.name) {
        supplier = await createSupplier({
          name: vendorDetails.name,
          email: vendorDetails.email || undefined,
          phone: vendorDetails.phone || undefined,
          address: vendorDetails.address || undefined,
          company_id: profile.company_id,
        });
      }

      // Create bill as a transaction
      const billData = {
        company_id: profile.company_id,
        transaction_number: billNumber,
        transaction_date: billDate,
        type: 'bill' as const,
        category: 'Purchase',
        description: `Bill from ${vendorDetails.name} - ${items.filter(i => i.description).map(i => i.description).join(', ')}`,
        amount: total,
        currency: currency,
        status: 'pending' as const,
        supplier_id: supplier?.id,
        notes: notes || undefined,
      };

      const savedBill = await createTransaction(billData);
      
      if (savedBill) {
        toast.success('Bill saved successfully!');
        return savedBill;
      } else {
        toast.error('Failed to save bill');
        return null;
      }
    } catch (error) {
      console.error('Error saving bill:', error);
      toast.error('Failed to save bill. Please try again.');
      return null;
    }
  };

  const handleCreateBill = async () => {
    // Check subscription limits
    if (!canCreateBill) {
      toast.error('Bill limit reached', {
        description: 'Upgrade to Premium for unlimited bills'
      });
      return;
    }

    if (!vendorDetails.name) {
      toast.error('Vendor name is required');
      return;
    }
    
    if (items.length === 0 || items.every(item => !item.description)) {
      toast.error('At least one bill item is required');
      return;
    }

    if (!companySettings || !companySettings.companyName) {
      toast.error('Please configure company settings first', {
        description: 'Go to Settings > Company Settings to add your business information'
      });
      return;
    }

    // Save bill to database
    const savedBill = await handleSaveBill();
    if (!savedBill) return;

    // Increment usage counter
    incrementBillUsage();
    setShowPreview(true);
  };

  const handleDownloadPDF = () => {
    window.print();
  };

  if (showPreview) {
    return (
      <div className="p-6">
        <div className="flex justify-between items-center mb-6 print:hidden">
          <h1>Bill Receipt Preview</h1>
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => setShowPreview(false)}>
              Edit Bill
            </Button>
            <Button onClick={handleDownloadPDF} className="gap-2">
              <Download className="w-4 h-4" />
              Download PDF
            </Button>
            <Button onClick={handleDownloadPDF} variant="outline" className="gap-2">
              <Printer className="w-4 h-4" />
              Print
            </Button>
          </div>
        </div>

        <Card className="max-w-4xl mx-auto" id="invoice-content">
          <CardContent className="p-8">
            {/* Bill Header */}
            <div className="flex justify-between items-start mb-8">
              <div className="flex items-start gap-4">
                {companySettings?.logoUrl && (
                  <div className="w-20 h-20 flex-shrink-0">
                    <img 
                      src={companySettings.logoUrl} 
                      alt="Company Logo" 
                      className="max-w-full max-h-full object-contain"
                    />
                  </div>
                )}
                <div>
                  <h2>{companySettings?.companyName || 'Your Company Name'}</h2>
                  <p className="text-muted-foreground text-sm">
                    {companySettings?.address && <>{companySettings.address}<br /></>}
                    {companySettings?.city && companySettings?.state && (
                      <>{companySettings.city}, {companySettings.state} {companySettings.zipCode}<br /></>
                    )}
                    {companySettings?.country && <>{companySettings.country}<br /></>}
                    {companySettings?.phone && <>Phone: {companySettings.phone}<br /></>}
                    {companySettings?.email && <>Email: {companySettings.email}<br /></>}
                    {companySettings?.gstin && <>GSTIN: {companySettings.gstin}</>}
                  </p>
                </div>
              </div>
              <div className="text-right">
                <Badge variant="secondary" className="mb-2">BILL RECEIPT</Badge>
                <p className="text-sm"><strong>Bill #:</strong> {billNumber}</p>
                <p className="text-sm"><strong>Date:</strong> {billDate}</p>
                {dueDate && <p className="text-sm"><strong>Due Date:</strong> {dueDate}</p>}
              </div>
            </div>

            {/* Vendor Details */}
            <div className="mb-8">
              <h3 className="mb-2">Vendor:</h3>
              <div className="text-muted-foreground text-sm">
                <p>{vendorDetails.name}</p>
                <p>{vendorDetails.address}</p>
                {vendorDetails.email && <p>Email: {vendorDetails.email}</p>}
                {vendorDetails.phone && <p>Phone: {vendorDetails.phone}</p>}
                {vendorDetails.gstin && <p>GSTIN: {vendorDetails.gstin}</p>}
              </div>
            </div>

            {/* Items Table */}
            <div className="mb-8">
              <table className="w-full">
                <thead>
                  <tr className="border-b">
                    <th className="text-left py-2">Description</th>
                    <th className="text-right py-2">Qty</th>
                    <th className="text-right py-2">Rate</th>
                    <th className="text-right py-2">Tax</th>
                    <th className="text-right py-2">Amount</th>
                  </tr>
                </thead>
                <tbody>
                  {items.map(item => (
                    <tr key={item.id} className="border-b">
                      <td className="py-2 text-sm">{item.description}</td>
                      <td className="text-right py-2 text-sm">{item.quantity}</td>
                      <td className="text-right py-2 text-sm">{currencySymbol}{item.rate.toFixed(2)}</td>
                      <td className="text-right py-2 text-sm">{item.taxRate}%</td>
                      <td className="text-right py-2 text-sm">{currencySymbol}{item.amount.toFixed(2)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Totals */}
            <div className="flex justify-end">
              <div className="w-64">
                <div className="flex justify-between py-1 text-sm">
                  <span>Subtotal:</span>
                  <span>{currencySymbol}{subtotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between py-1 text-sm">
                  <span>Tax:</span>
                  <span>{currencySymbol}{totalTax.toFixed(2)}</span>
                </div>
                <Separator className="my-2" />
                <div className="flex justify-between py-1">
                  <span>Total:</span>
                  <span>{currencySymbol}{total.toFixed(2)}</span>
                </div>
              </div>
            </div>

            {notes && (
              <div className="mt-8">
                <h4>Notes:</h4>
                <p className="text-muted-foreground text-sm mt-1">{notes}</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1>Quick Billing</h1>
          <p className="text-muted-foreground">Create and manage bills efficiently</p>
        </div>
        <Button className="gap-2" disabled={!canCreateBill}>
          <Receipt className="w-4 h-4" />
          New Bill
        </Button>
      </div>

      {!isPremium && (
        <Alert className="mb-6">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            Free Plan: {usage.bills}/{limits.bills} bills used this month.
            {!canCreateBill && ' Upgrade to Premium for unlimited bills.'}
          </AlertDescription>
        </Alert>
      )}

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="create-bill">Create Bill</TabsTrigger>
          <TabsTrigger value="recent-bills">Recent Bills</TabsTrigger>
          <TabsTrigger value="bill-management">Management</TabsTrigger>
        </TabsList>

        <TabsContent value="create-bill" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Left Column - Bill Details */}
            <div className="space-y-6">
              {/* Bill Info */}
              <Card>
                <CardHeader>
                  <CardTitle>Bill Information</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="billNumber">Bill Number</Label>
                      <Input
                        id="billNumber"
                        value={billNumber}
                        onChange={(e) => setBillNumber(e.target.value)}
                      />
                    </div>
                    <div>
                      <Label htmlFor="billDate">Bill Date</Label>
                      <Input
                        id="billDate"
                        type="date"
                        value={billDate}
                        onChange={(e) => setBillDate(e.target.value)}
                      />
                    </div>
                  </div>
                  <div>
                    <Label htmlFor="dueDate">Due Date</Label>
                    <Input
                      id="dueDate"
                      type="date"
                      value={dueDate}
                      onChange={(e) => setDueDate(e.target.value)}
                    />
                  </div>
                </CardContent>
              </Card>

              {/* Vendor Details */}
              <Card>
                <CardHeader>
                  <CardTitle>Vendor Details</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label htmlFor="vendorName">Vendor Name</Label>
                    <Input
                      id="vendorName"
                      value={vendorDetails.name}
                      onChange={(e) => setVendorDetails({...vendorDetails, name: e.target.value})}
                      placeholder="Enter vendor name"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="vendorEmail">Email</Label>
                      <Input
                        id="vendorEmail"
                        type="email"
                        value={vendorDetails.email}
                        onChange={(e) => setVendorDetails({...vendorDetails, email: e.target.value})}
                        placeholder="vendor@email.com"
                      />
                    </div>
                    <div>
                      <Label htmlFor="vendorPhone">Phone</Label>
                      <Input
                        id="vendorPhone"
                        value={vendorDetails.phone}
                        onChange={(e) => setVendorDetails({...vendorDetails, phone: e.target.value})}
                        placeholder="+91 98765 43210"
                      />
                    </div>
                  </div>
                  <div>
                    <Label htmlFor="vendorAddress">Address</Label>
                    <Textarea
                      id="vendorAddress"
                      value={vendorDetails.address}
                      onChange={(e) => setVendorDetails({...vendorDetails, address: e.target.value})}
                      placeholder="Enter vendor address"
                    />
                  </div>
                  <div>
                    <Label htmlFor="vendorGstin">GSTIN</Label>
                    <Input
                      id="vendorGstin"
                      value={vendorDetails.gstin}
                      onChange={(e) => setVendorDetails({...vendorDetails, gstin: e.target.value})}
                      placeholder="22AAAAA0000A1Z5"
                    />
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Right Column - Items */}
            <div className="space-y-6">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between">
                  <CardTitle>Bill Items</CardTitle>
                  <Button onClick={addItem} size="sm" className="gap-2">
                    <Plus className="w-4 h-4" />
                    Add Item
                  </Button>
                </CardHeader>
                <CardContent className="space-y-4">
                  {items.map((item, index) => (
                    <div key={item.id} className="p-4 border rounded-lg space-y-3">
                      <div className="flex justify-between items-center">
                        <span className="text-sm">Item {index + 1}</span>
                        {items.length > 1 && (
                          <Button
                            onClick={() => removeItem(item.id)}
                            size="sm"
                            variant="outline"
                            className="gap-1"
                          >
                            <Trash2 className="w-3 h-3" />
                          </Button>
                        )}
                      </div>
                      
                      <div>
                        <Label>Description</Label>
                        <Input
                          value={item.description}
                          onChange={(e) => updateItem(item.id, 'description', e.target.value)}
                          placeholder="Item description"
                        />
                      </div>
                      
                      <div className="grid grid-cols-2 gap-2">
                        <div>
                          <Label>Quantity</Label>
                          <Input
                            type="number"
                            value={item.quantity}
                            onChange={(e) => updateItem(item.id, 'quantity', parseFloat(e.target.value) || 0)}
                            min="0"
                            step="0.01"
                          />
                        </div>
                        <div>
                          <Label>Rate ({currencySymbol})</Label>
                          <Input
                            type="number"
                            value={item.rate}
                            onChange={(e) => updateItem(item.id, 'rate', parseFloat(e.target.value) || 0)}
                            min="0"
                            step="0.01"
                          />
                        </div>
                      </div>
                      
                      <div className="grid grid-cols-2 gap-2">
                        <div>
                          <Label>Tax Rate (%)</Label>
                          <Select
                            value={item.taxRate.toString()}
                            onValueChange={(value) => updateItem(item.id, 'taxRate', parseFloat(value))}
                          >
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="0">0%</SelectItem>
                              <SelectItem value="5">5%</SelectItem>
                              <SelectItem value="12">12%</SelectItem>
                              <SelectItem value="18">18%</SelectItem>
                              <SelectItem value="28">28%</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        <div>
                          <Label>Amount ({currencySymbol})</Label>
                          <Input
                            value={item.amount.toFixed(2)}
                            disabled
                            className="bg-muted"
                          />
                        </div>
                      </div>
                    </div>
                  ))}
                </CardContent>
              </Card>

              {/* Totals Summary */}
              <Card>
                <CardHeader>
                  <CardTitle>Bill Summary</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span>Subtotal:</span>
                      <span>{currencySymbol}{subtotal.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Total Tax:</span>
                      <span>{currencySymbol}{totalTax.toFixed(2)}</span>
                    </div>
                    <Separator />
                    <div className="flex justify-between">
                      <span>Total Amount:</span>
                      <span>{currencySymbol}{total.toFixed(2)}</span>
                    </div>
                  </div>
                  <div className="mt-4 flex gap-2">
                    <Button onClick={handleSaveBill} variant="outline" className="flex-1 gap-2">
                      <Save className="w-4 h-4" />
                      Save Draft
                    </Button>
                    <Button onClick={handleCreateBill} className="flex-1 gap-2" disabled={!canCreateBill}>
                      <FileText className="w-4 h-4" />
                      Create Bill
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="recent-bills" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Recent Bills</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {bills.length === 0 ? (
                  <p className="py-8 text-center text-sm text-muted-foreground">No saved bills yet.</p>
                ) : bills.slice(0, 5).map((bill) => (
                  <div key={bill.id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div>
                      <h4 className="font-medium">{bill.transaction_number || bill.id}</h4>
                      <p className="text-sm text-muted-foreground">{bill.description || 'Bill'}</p>
                      <p className="text-xs text-muted-foreground">{bill.transaction_date}</p>
                    </div>
                    <div className="text-right">
                      <p className="font-medium">{formatCurrency(Number(bill.amount || 0), currency)}</p>
                      <Badge className={getStatusColor(bill.status)}>
                        {bill.status}
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="bill-management" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Pending Bills</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">{pendingBills.length}</div>
                <p className="text-sm text-muted-foreground">Total: {formatCurrency(billTotal(pendingBills), currency)}</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle>Overdue Bills</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-red-600">{overdueBills.length}</div>
                <p className="text-sm text-muted-foreground">Total: {formatCurrency(billTotal(overdueBills), currency)}</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle>Paid This Month</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-green-600">{formatCurrency(billTotal(paidBillsThisMonth), currency)}</div>
                <p className="text-sm text-muted-foreground">{paidBillsThisMonth.length} bills processed</p>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}