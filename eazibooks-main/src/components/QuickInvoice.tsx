import { useState, useEffect } from 'react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Textarea } from './ui/textarea';
import { Separator } from './ui/separator';
import { Plus, Trash2, FileText, Download, Printer, AlertCircle, Eye, Save } from 'lucide-react';
import { Badge } from './ui/badge';
import { toast } from 'sonner@2.0.3';
import { supabase } from '../utils/supabase/client';
import { useCurrency } from '../utils/CurrencyContext';
import { getCurrencySymbol } from '../utils/currency';
import { useSubscription } from '../utils/SubscriptionContext';
import { Alert, AlertDescription } from './ui/alert';
import { downloadInvoicePDF, previewInvoicePDF } from '../utils/pdfGenerator';
import { createInvoice, fetchCustomers, createCustomer } from '../utils/database';

interface InvoiceItem {
  id: string;
  description: string;
  quantity: number;
  rate: number;
  taxRate: number;
  amount: number;
}

interface CustomerDetails {
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

export function QuickInvoice() {
  const { currency } = useCurrency();
  const currencySymbol = getCurrencySymbol(currency);
  const { canCreateInvoice, incrementInvoiceUsage, usage, limits, isPremium } = useSubscription();
  
  const [customerDetails, setCustomerDetails] = useState<CustomerDetails>({
    name: '',
    email: '',
    phone: '',
    address: '',
    gstin: ''
  });

  const [items, setItems] = useState<InvoiceItem[]>([
    {
      id: '1',
      description: '',
      quantity: 1,
      rate: 0,
      taxRate: 18,
      amount: 0
    }
  ]);

  const [invoiceNumber, setInvoiceNumber] = useState(`INV-${Date.now()}`);
  const [invoiceDate, setInvoiceDate] = useState(new Date().toISOString().split('T')[0]);
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
    const newItem: InvoiceItem = {
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

  const updateItem = (id: string, field: keyof InvoiceItem, value: string | number) => {
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

  const handleSaveInvoice = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        toast.error('You must be logged in to save invoices');
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

      // Find or create customer
      const customers = await fetchCustomers();
      let customer = customers.find(c => 
        c.name.toLowerCase() === customerDetails.name.toLowerCase()
      );

      if (!customer && customerDetails.name) {
        customer = await createCustomer({
          name: customerDetails.name,
          email: customerDetails.email || undefined,
          phone: customerDetails.phone || undefined,
          address: customerDetails.address || undefined,
          company_id: profile.company_id,
        });
      }

      // Prepare invoice data
      const invoiceData = {
        company_id: profile.company_id,
        customer_id: customer?.id,
        invoice_number: invoiceNumber,
        invoice_date: invoiceDate,
        due_date: dueDate || undefined,
        status: 'draft' as const,
        currency: currency,
        subtotal: subtotal,
        tax_amount: totalTax,
        total: total,
        amount_paid: 0,
        balance_due: total,
        notes: notes || undefined,
        terms_conditions: 'Payment is due within the specified due date. Late payments may incur additional charges.',
      };

      // Prepare invoice items
      const invoiceItems = items
        .filter(item => item.description)
        .map(item => ({
          description: item.description,
          quantity: item.quantity,
          unit_price: item.rate,
          tax_rate: item.taxRate,
          tax_amount: (item.amount * item.taxRate) / 100,
          total: item.amount + (item.amount * item.taxRate) / 100,
        }));

      // Save to database
      const savedInvoice = await createInvoice(invoiceData, invoiceItems);
      
      if (savedInvoice) {
        toast.success('Invoice saved successfully!');
        return savedInvoice;
      } else {
        toast.error('Failed to save invoice');
        return null;
      }
    } catch (error) {
      console.error('Error saving invoice:', error);
      toast.error('Failed to save invoice. Please try again.');
      return null;
    }
  };

  const handleGenerateInvoice = async () => {
    // Check subscription limits
    if (!canCreateInvoice) {
      toast.error('Invoice limit reached', {
        description: 'Upgrade to Premium for unlimited invoices'
      });
      return;
    }

    // Validate required fields
    if (!customerDetails.name) {
      toast.error('Customer name is required');
      return;
    }
    
    if (items.length === 0 || items.every(item => !item.description)) {
      toast.error('At least one invoice item is required');
      return;
    }

    if (!companySettings || !companySettings.companyName) {
      toast.error('Please configure company settings first', {
        description: 'Go to Settings > Company Settings to add your business information'
      });
      return;
    }

    // Save invoice to database
    const savedInvoice = await handleSaveInvoice();
    if (!savedInvoice) return;

    // Increment usage counter
    incrementInvoiceUsage();
    setShowPreview(true);
  };

  const handleDownloadPDF = async () => {
    try {
      const invoiceData = {
        invoiceNumber,
        invoiceDate,
        dueDate: dueDate || undefined,
        customer: {
          name: customerDetails.name,
          email: customerDetails.email || undefined,
          phone: customerDetails.phone || undefined,
          address: customerDetails.address || undefined,
          city: undefined,
          country: undefined,
        },
        company: {
          name: companySettings?.companyName || 'Your Company',
          email: companySettings?.email || undefined,
          phone: companySettings?.phone || undefined,
          address: companySettings?.address || undefined,
          city: companySettings?.city || undefined,
          country: companySettings?.country || undefined,
          logoUrl: companySettings?.logoUrl || undefined,
        },
        items: items.map(item => ({
          description: item.description,
          quantity: item.quantity,
          unitPrice: item.rate,
          tax: item.taxRate,
          total: item.amount + (item.amount * item.taxRate / 100),
        })),
        subtotal,
        taxAmount: totalTax,
        total,
        currency: currencySymbol,
        notes: notes || undefined,
        terms: 'Payment is due within the specified due date. Late payments may incur additional charges.',
      };

      await downloadInvoicePDF(invoiceData);
      toast.success('Invoice PDF downloaded successfully!');
    } catch (error) {
      console.error('Error generating PDF:', error);
      toast.error('Failed to generate PDF. Please try again.');
    }
  };

  const handlePreviewPDF = async () => {
    try {
      const invoiceData = {
        invoiceNumber,
        invoiceDate,
        dueDate: dueDate || undefined,
        customer: {
          name: customerDetails.name,
          email: customerDetails.email || undefined,
          phone: customerDetails.phone || undefined,
          address: customerDetails.address || undefined,
          city: undefined,
          country: undefined,
        },
        company: {
          name: companySettings?.companyName || 'Your Company',
          email: companySettings?.email || undefined,
          phone: companySettings?.phone || undefined,
          address: companySettings?.address || undefined,
          city: companySettings?.city || undefined,
          country: companySettings?.country || undefined,
          logoUrl: companySettings?.logoUrl || undefined,
        },
        items: items.map(item => ({
          description: item.description,
          quantity: item.quantity,
          unitPrice: item.rate,
          tax: item.taxRate,
          total: item.amount + (item.amount * item.taxRate / 100),
        })),
        subtotal,
        taxAmount: totalTax,
        total,
        currency: currencySymbol,
        notes: notes || undefined,
        terms: 'Payment is due within the specified due date. Late payments may incur additional charges.',
      };

      await previewInvoicePDF(invoiceData);
    } catch (error) {
      console.error('Error previewing PDF:', error);
      toast.error('Failed to preview PDF. Please try again.');
    }
  };

  if (showPreview) {
    return (
      <div className="p-6">
        <div className="flex justify-between items-center mb-6 print:hidden">
          <h1>Invoice Preview</h1>
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => setShowPreview(false)}>
              Edit Invoice
            </Button>
            <Button onClick={handlePreviewPDF} variant="outline" className="gap-2">
              <Eye className="w-4 h-4" />
              Preview PDF
            </Button>
            <Button onClick={handleDownloadPDF} className="gap-2">
              <Download className="w-4 h-4" />
              Download PDF
            </Button>
            <Button onClick={() => window.print()} variant="outline" className="gap-2">
              <Printer className="w-4 h-4" />
              Print
            </Button>
          </div>
        </div>

        <Card className="max-w-4xl mx-auto" id="invoice-content">
          <CardContent className="p-8">
            {/* Invoice Header */}
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
                <Badge variant="secondary" className="mb-2">INVOICE</Badge>
                <p className="text-sm"><strong>Invoice #:</strong> {invoiceNumber}</p>
                <p className="text-sm"><strong>Date:</strong> {invoiceDate}</p>
                {dueDate && <p className="text-sm"><strong>Due Date:</strong> {dueDate}</p>}
              </div>
            </div>

            {/* Bill To */}
            <div className="mb-8">
              <h3 className="mb-2">Bill To:</h3>
              <div className="text-muted-foreground">
                <p>{customerDetails.name}</p>
                <p>{customerDetails.address}</p>
                {customerDetails.email && <p>Email: {customerDetails.email}</p>}
                {customerDetails.phone && <p>Phone: {customerDetails.phone}</p>}
                {customerDetails.gstin && <p>GSTIN: {customerDetails.gstin}</p>}
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
                      <td className="py-2">{item.description}</td>
                      <td className="text-right py-2">{item.quantity}</td>
                      <td className="text-right py-2">{currencySymbol}{item.rate.toFixed(2)}</td>
                      <td className="text-right py-2">{item.taxRate}%</td>
                      <td className="text-right py-2">{currencySymbol}{item.amount.toFixed(2)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Totals */}
            <div className="flex justify-end">
              <div className="w-64">
                <div className="flex justify-between py-1">
                  <span>Subtotal:</span>
                  <span>{currencySymbol}{subtotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between py-1">
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
                <p className="text-muted-foreground mt-1">{notes}</p>
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
        <h1>Quick Invoice</h1>
        <div className="flex gap-2">
          <Button onClick={handleSaveInvoice} variant="outline" className="gap-2">
            <Save className="w-4 h-4" />
            Save Draft
          </Button>
          <Button onClick={handleGenerateInvoice} className="gap-2" disabled={!canCreateInvoice}>
            <FileText className="w-4 h-4" />
            Generate Invoice
          </Button>
        </div>
      </div>

      {!isPremium && (
        <Alert className="mb-6">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            Free Plan: {usage.invoices}/{limits.invoices} invoices used this month.
            {!canCreateInvoice && ' Upgrade to Premium for unlimited invoices.'}
          </AlertDescription>
        </Alert>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left Column - Invoice Details */}
        <div className="space-y-6">
          {/* Invoice Info */}
          <Card>
            <CardHeader>
              <CardTitle>Invoice Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="invoiceNumber">Invoice Number</Label>
                  <Input
                    id="invoiceNumber"
                    value={invoiceNumber}
                    onChange={(e) => setInvoiceNumber(e.target.value)}
                  />
                </div>
                <div>
                  <Label htmlFor="invoiceDate">Invoice Date</Label>
                  <Input
                    id="invoiceDate"
                    type="date"
                    value={invoiceDate}
                    onChange={(e) => setInvoiceDate(e.target.value)}
                  />
                </div>
              </div>
              <div>
                <Label htmlFor="dueDate">Due Date (Optional)</Label>
                <Input
                  id="dueDate"
                  type="date"
                  value={dueDate}
                  onChange={(e) => setDueDate(e.target.value)}
                />
              </div>
            </CardContent>
          </Card>

          {/* Customer Details */}
          <Card>
            <CardHeader>
              <CardTitle>Customer Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="customerName">Customer Name</Label>
                <Input
                  id="customerName"
                  value={customerDetails.name}
                  onChange={(e) => setCustomerDetails({...customerDetails, name: e.target.value})}
                  placeholder="Enter customer name"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    value={customerDetails.email}
                    onChange={(e) => setCustomerDetails({...customerDetails, email: e.target.value})}
                    placeholder="customer@email.com"
                  />
                </div>
                <div>
                  <Label htmlFor="phone">Phone</Label>
                  <Input
                    id="phone"
                    value={customerDetails.phone}
                    onChange={(e) => setCustomerDetails({...customerDetails, phone: e.target.value})}
                    placeholder="+91 98765 43210"
                  />
                </div>
              </div>
              <div>
                <Label htmlFor="address">Address</Label>
                <Textarea
                  id="address"
                  value={customerDetails.address}
                  onChange={(e) => setCustomerDetails({...customerDetails, address: e.target.value})}
                  placeholder="Enter customer address"
                />
              </div>
              <div>
                <Label htmlFor="gstin">GSTIN (Optional)</Label>
                <Input
                  id="gstin"
                  value={customerDetails.gstin}
                  onChange={(e) => setCustomerDetails({...customerDetails, gstin: e.target.value})}
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
              <CardTitle>Invoice Items</CardTitle>
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
              <CardTitle>Invoice Summary</CardTitle>
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
            </CardContent>
          </Card>

          {/* Notes */}
          <Card>
            <CardHeader>
              <CardTitle>Notes (Optional)</CardTitle>
            </CardHeader>
            <CardContent>
              <Textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Add any additional notes or terms..."
                rows={3}
              />
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}