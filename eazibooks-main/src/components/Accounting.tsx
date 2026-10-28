import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Badge } from './ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from './ui/table';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { 
  Plus, 
  Download, 
  Filter, 
  Search,
  FileText,
  Loader2,
} from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from './ui/dialog';
import { Label } from './ui/label';
import { Textarea } from './ui/textarea';
import { toast } from 'sonner';
import { useCurrency } from '../utils/CurrencyContext';
import { formatCurrency } from '../utils/currency';
import {
  getLedgerEntries,
  createLedgerEntry,
  fetchChartOfAccounts,
  LedgerEntry,
  ChartOfAccount,
} from '../utils/database/accounting';
import { fetchInvoices } from '../utils/database/invoices';

export function Accounting() {
  const { currency } = useCurrency();
  const [selectedTab, setSelectedTab] = useState('ledger');
  const [loading, setLoading] = useState(true);
  const [ledgerEntries, setLedgerEntries] = useState<LedgerEntry[]>([]);
  const [chartOfAccounts, setChartOfAccounts] = useState<ChartOfAccount[]>([]);
  const [invoices, setInvoices] = useState<any[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedAccount, setSelectedAccount] = useState('all');
  const [isAddingEntry, setIsAddingEntry] = useState(false);

  // Form state for new ledger entry
  const [newEntry, setNewEntry] = useState({
    entry_date: new Date().toISOString().split('T')[0],
    account: '',
    account_type: 'expense' as LedgerEntry['account_type'],
    debit: 0,
    credit: 0,
    description: '',
  });

  // Load data
  const loadData = async () => {
    setLoading(true);
    try {
      const [entries, accounts, invoiceData] = await Promise.all([
        getLedgerEntries(),
        fetchChartOfAccounts(),
        fetchInvoices(),
      ]);

      setLedgerEntries(entries);
      setChartOfAccounts(accounts);
      setInvoices(invoiceData.filter(inv => inv.status === 'paid' || inv.status === 'sent' || inv.status === 'overdue'));
    } catch (error) {
      console.error('Error loading accounting data:', error);
      toast.error('Failed to load accounting data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  // Filter ledger entries
  const filteredLedgerEntries = ledgerEntries.filter(entry => {
    const matchesSearch = !searchQuery || 
      entry.entry_number.toLowerCase().includes(searchQuery.toLowerCase()) ||
      entry.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      entry.account.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesAccount = selectedAccount === 'all' || entry.account === selectedAccount;
    
    return matchesSearch && matchesAccount;
  });

  // Handle new ledger entry
  const handleAddEntry = async () => {
    if (!newEntry.account || (!newEntry.debit && !newEntry.credit)) {
      toast.error('Please fill in all required fields');
      return;
    }

    setIsAddingEntry(true);
    try {
      const entry: LedgerEntry = {
        entry_number: '', // Will be auto-generated
        entry_date: newEntry.entry_date,
        account: newEntry.account,
        account_type: newEntry.account_type,
        debit: newEntry.debit,
        credit: newEntry.credit,
        description: newEntry.description,
        reference_type: 'manual',
      };

      const result = await createLedgerEntry(entry);
      if (result) {
        toast.success('Ledger entry created successfully');
        setNewEntry({
          entry_date: new Date().toISOString().split('T')[0],
          account: '',
          account_type: 'expense',
          debit: 0,
          credit: 0,
          description: '',
        });
        loadData();
      } else {
        toast.error('Failed to create ledger entry');
      }
    } catch (error) {
      console.error('Error creating ledger entry:', error);
      toast.error('An error occurred');
    } finally {
      setIsAddingEntry(false);
    }
  };

  // Calculate totals
  const totalDebit = filteredLedgerEntries.reduce((sum, entry) => sum + entry.debit, 0);
  const totalCredit = filteredLedgerEntries.reduce((sum, entry) => sum + entry.credit, 0);

  // Get GST invoices (invoices with tax)
  const gstInvoices = invoices.filter(inv => inv.tax > 0);

  // Financial reports data
  const reports = [
    { name: 'Profit & Loss Statement', description: 'Monthly P&L report', period: 'Current Month', path: '/reports' },
    { name: 'Balance Sheet', description: 'Financial position statement', period: 'As of Today', path: '/reports' },
    { name: 'Cash Flow Statement', description: 'Cash inflows and outflows', period: 'Current Month', path: '/reports' },
    { name: 'GST Report', description: 'GST summary and details', period: 'Current Month', path: '/reports' },
  ];

  // Group chart of accounts by type
  const groupedAccounts = {
    asset: chartOfAccounts.filter(a => a.account_type === 'asset'),
    liability: chartOfAccounts.filter(a => a.account_type === 'liability'),
    equity: chartOfAccounts.filter(a => a.account_type === 'equity'),
    revenue: chartOfAccounts.filter(a => a.account_type === 'revenue'),
    expense: chartOfAccounts.filter(a => a.account_type === 'expense'),
  };

  if (loading) {
    return (
      <div className="p-6 flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4" />
          <p className="text-muted-foreground">Loading accounting data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1>Accounting</h1>
          <p className="text-muted-foreground">Manage your financial records and reports</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={loadData}>
            <Filter className="w-4 h-4 mr-2" />
            Refresh
          </Button>
          <Dialog>
            <DialogTrigger asChild>
              <Button>
                <Plus className="w-4 h-4 mr-2" />
                New Entry
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-md" aria-describedby="dialog-description">
              <DialogHeader>
                <DialogTitle>New Ledger Entry</DialogTitle>
                <p id="dialog-description" className="sr-only">
                  Create a new ledger entry for your accounting records
                </p>
              </DialogHeader>
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="date">Date</Label>
                    <Input 
                      id="date" 
                      type="date" 
                      value={newEntry.entry_date}
                      onChange={(e) => setNewEntry({...newEntry, entry_date: e.target.value})}
                    />
                  </div>
                  <div>
                    <Label htmlFor="account">Account</Label>
                    <Input
                      id="account"
                      placeholder="Account name"
                      value={newEntry.account}
                      onChange={(e) => setNewEntry({...newEntry, account: e.target.value})}
                    />
                  </div>
                </div>
                <div>
                  <Label htmlFor="account-type">Account Type</Label>
                  <Select 
                    value={newEntry.account_type}
                    onValueChange={(value: any) => setNewEntry({...newEntry, account_type: value})}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="asset">Asset</SelectItem>
                      <SelectItem value="liability">Liability</SelectItem>
                      <SelectItem value="equity">Equity</SelectItem>
                      <SelectItem value="revenue">Revenue</SelectItem>
                      <SelectItem value="expense">Expense</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="debit">Debit Amount</Label>
                    <Input 
                      id="debit" 
                      type="number" 
                      placeholder="0"
                      value={newEntry.debit || ''}
                      onChange={(e) => setNewEntry({...newEntry, debit: parseFloat(e.target.value) || 0})}
                    />
                  </div>
                  <div>
                    <Label htmlFor="credit">Credit Amount</Label>
                    <Input 
                      id="credit" 
                      type="number" 
                      placeholder="0"
                      value={newEntry.credit || ''}
                      onChange={(e) => setNewEntry({...newEntry, credit: parseFloat(e.target.value) || 0})}
                    />
                  </div>
                </div>
                <div>
                  <Label htmlFor="description">Description</Label>
                  <Textarea 
                    id="description" 
                    placeholder="Enter description..." 
                    value={newEntry.description}
                    onChange={(e) => setNewEntry({...newEntry, description: e.target.value})}
                  />
                </div>
                <Button 
                  className="w-full" 
                  onClick={handleAddEntry}
                  disabled={isAddingEntry}
                >
                  {isAddingEntry ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Adding...
                    </>
                  ) : (
                    'Add Entry'
                  )}
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <Tabs value={selectedTab} onValueChange={setSelectedTab}>
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="ledger">Ledger</TabsTrigger>
          <TabsTrigger value="invoices">GST Invoices</TabsTrigger>
          <TabsTrigger value="reports">Financial Reports</TabsTrigger>
          <TabsTrigger value="accounts">Chart of Accounts</TabsTrigger>
        </TabsList>

        <TabsContent value="ledger" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>General Ledger</CardTitle>
              <div className="flex gap-4">
                <div className="relative flex-1 max-w-sm">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input 
                    placeholder="Search entries..." 
                    className="pl-9"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </div>
                <Select value={selectedAccount} onValueChange={setSelectedAccount}>
                  <SelectTrigger className="w-48">
                    <SelectValue placeholder="Select account" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Accounts</SelectItem>
                    {Array.from(new Set(ledgerEntries.map(e => e.account))).map(account => (
                      <SelectItem key={account} value={account}>{account}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Date</TableHead>
                    <TableHead>Entry ID</TableHead>
                    <TableHead>Account</TableHead>
                    <TableHead>Description</TableHead>
                    <TableHead className="text-right">Debit</TableHead>
                    <TableHead className="text-right">Credit</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredLedgerEntries.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={6} className="text-center text-muted-foreground py-8">
                        No ledger entries found. Create your first entry to get started.
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredLedgerEntries.map((entry) => (
                      <TableRow key={entry.id}>
                        <TableCell>{new Date(entry.entry_date).toLocaleDateString()}</TableCell>
                        <TableCell>{entry.entry_number}</TableCell>
                        <TableCell>{entry.account}</TableCell>
                        <TableCell>{entry.description}</TableCell>
                        <TableCell className="text-right">
                          {entry.debit > 0 ? formatCurrency(entry.debit, currency) : '-'}
                        </TableCell>
                        <TableCell className="text-right">
                          {entry.credit > 0 ? formatCurrency(entry.credit, currency) : '-'}
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
              {filteredLedgerEntries.length > 0 && (
                <div className="mt-4 pt-4 border-t flex justify-between">
                  <span className="font-medium">Totals:</span>
                  <div className="flex gap-8">
                    <span>Debit: {formatCurrency(totalDebit, currency)}</span>
                    <span>Credit: {formatCurrency(totalCredit, currency)}</span>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="invoices" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>GST Invoices</CardTitle>
              <p className="text-sm text-muted-foreground">
                All invoices with tax information for GST reporting
              </p>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Invoice ID</TableHead>
                    <TableHead>Customer</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead className="text-right">Subtotal</TableHead>
                    <TableHead className="text-right">Tax</TableHead>
                    <TableHead className="text-right">Total</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {gstInvoices.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={8} className="text-center text-muted-foreground py-8">
                        No GST invoices found
                      </TableCell>
                    </TableRow>
                  ) : (
                    gstInvoices.map((invoice) => (
                      <TableRow key={invoice.id}>
                        <TableCell>{invoice.invoice_number}</TableCell>
                        <TableCell>{invoice.customer_id || 'Unknown'}</TableCell>
                        <TableCell>{new Date(invoice.invoice_date).toLocaleDateString()}</TableCell>
                        <TableCell className="text-right">
                          {formatCurrency(invoice.subtotal, currency)}
                        </TableCell>
                        <TableCell className="text-right">
                          {formatCurrency(invoice.tax, currency)}
                        </TableCell>
                        <TableCell className="text-right">
                          {formatCurrency(invoice.total, currency)}
                        </TableCell>
                        <TableCell>
                          <Badge variant={
                            invoice.status === 'paid' ? 'default' : 
                            invoice.status === 'sent' ? 'secondary' : 'destructive'
                          }>
                            {invoice.status}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <Button variant="ghost" size="sm">
                            <Download className="w-4 h-4" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="reports" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {reports.map((report, index) => (
              <Card key={index}>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <FileText className="w-5 h-5" />
                    {report.name}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground mb-2">{report.description}</p>
                  <p className="text-xs text-muted-foreground mb-4">Period: {report.period}</p>
                  <div className="flex gap-2">
                    <Button size="sm" variant="outline">
                      <Download className="w-4 h-4 mr-2" />
                      Download
                    </Button>
                    <Button size="sm" onClick={() => window.location.hash = '#reports'}>
                      View
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="accounts" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Chart of Accounts</CardTitle>
              <p className="text-sm text-muted-foreground">
                Manage your account structure and balances
              </p>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {Object.entries(groupedAccounts).map(([category, accounts]) => (
                  <div key={category} className="border rounded-lg p-4">
                    <h3 className="font-medium mb-2 capitalize">{category}</h3>
                    <div className="space-y-2 ml-4">
                      {accounts.length === 0 ? (
                        <p className="text-sm text-muted-foreground">No accounts in this category</p>
                      ) : (
                        accounts.map((account) => (
                          <div key={account.id} className="flex justify-between text-sm">
                            <span>{account.account_name}</span>
                            <span>{formatCurrency(account.balance, currency)}</span>
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}