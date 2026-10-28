import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from './ui/table';
import { Progress } from './ui/progress';
import { FileText, Calendar, AlertCircle, CheckCircle, Download, Upload, Calculator, Loader2 } from 'lucide-react';
import { supabase } from '../utils/supabase/client';
import { useCurrency } from '../utils/CurrencyContext';
import { formatCurrency } from '../utils/currency';

type TaxReturnRecord = {
  id?: string;
  tax_type?: string;
  return_type?: string;
  period?: string;
  due_date?: string;
  status?: string;
  amount?: number;
  tax_amount?: number;
  paid_amount?: number;
  remitted_amount?: number;
  [key: string]: unknown;
};

const amountOf = (record: TaxReturnRecord, fields: string[]) =>
  fields.reduce((value, field) => value || Number(record[field] || 0), 0);

export function TaxCompliance() {
  const [selectedTab, setSelectedTab] = useState('vat');
  const [returns, setReturns] = useState<TaxReturnRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const { currency } = useCurrency();

  const loadReturns = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase.from('tax_returns').select('*').order('due_date', { ascending: true });
      if (error) throw error;
      setReturns((data || []) as TaxReturnRecord[]);
    } catch (error) {
      console.error('Error loading tax returns:', error);
      setReturns([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void loadReturns();
  }, []);

  const typeOf = (record: TaxReturnRecord) => String(record.tax_type || record.return_type || '').toLowerCase();
  const vatReturns = returns.filter((record) => typeOf(record).includes('vat'));
  const whtReturns = returns.filter((record) => typeOf(record).includes('wht') || typeOf(record).includes('withholding'));
  const returnAmount = (record: TaxReturnRecord) => amountOf(record, ['tax_amount', 'amount']);
  const paidAmount = (record: TaxReturnRecord) => amountOf(record, ['remitted_amount', 'paid_amount']);
  const sum = (records: TaxReturnRecord[], getter: (record: TaxReturnRecord) => number) => records.reduce((total, record) => total + getter(record), 0);
  const isFiled = (record: TaxReturnRecord) => ['filed', 'paid', 'remitted', 'completed'].includes(String(record.status || '').toLowerCase());
  const vatLiability = sum(vatReturns.filter((record) => !isFiled(record)), returnAmount);
  const whtLiability = sum(whtReturns.filter((record) => !isFiled(record)), returnAmount);
  const totalReturns = returns.length;
  const complianceRate = totalReturns ? Math.round((returns.filter(isFiled).length / totalReturns) * 100) : 0;
  const vatProgress = sum(vatReturns, returnAmount) ? Math.round((sum(vatReturns, paidAmount) / sum(vatReturns, returnAmount)) * 100) : 0;
  const whtProgress = sum(whtReturns, returnAmount) ? Math.round((sum(whtReturns, paidAmount) / sum(whtReturns, returnAmount)) * 100) : 0;
  const upcomingDeadlines = returns
    .filter((record) => record.due_date && !isFiled(record) && new Date(String(record.due_date)).getTime() >= new Date().setHours(0, 0, 0, 0))
    .slice(0, 5)
    .map((record) => ({
      id: String(record.id || `${record.return_type}-${record.due_date}`),
      type: String(record.tax_type || record.return_type || 'Tax return'),
      period: String(record.period || 'Unspecified period'),
      dueDate: String(record.due_date),
      daysLeft: Math.ceil((new Date(String(record.due_date)).getTime() - new Date().setHours(0, 0, 0, 0)) / 86400000),
    }));

  const getDaysLeftBadge = (daysLeft: number) => daysLeft <= 3 ? 'destructive' : daysLeft <= 7 ? 'secondary' : 'default';
  const renderRows = (records: TaxReturnRecord[], emptyText: string) => records.length ? records.map((record) => (
    <TableRow key={String(record.id)}>
      <TableCell>{String(record.period || '—')}</TableCell>
      <TableCell>{String(record.tax_type || record.return_type || 'Tax return')}</TableCell>
      <TableCell>{String(record.due_date || '—')}</TableCell>
      <TableCell className="text-right">{formatCurrency(returnAmount(record), currency)}</TableCell>
      <TableCell><Badge variant={isFiled(record) ? 'default' : 'secondary'}>{String(record.status || 'pending')}</Badge></TableCell>
      <TableCell><Button variant="ghost" size="sm" aria-label="Download return"><Download className="w-4 h-4" /></Button></TableCell>
    </TableRow>
  )) : <TableRow><TableCell colSpan={6} className="py-8 text-center text-muted-foreground">{emptyText}</TableCell></TableRow>;

  if (loading) return <div className="p-6 flex items-center justify-center py-20"><Loader2 className="w-7 h-7 animate-spin" /></div>;

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div><h1>Tax Compliance</h1><p className="text-muted-foreground">Tax figures and deadlines shown below come from your saved returns.</p></div>
        <div className="flex gap-2"><Button variant="outline"><Calculator className="w-4 h-4 mr-2" />Tax Calculator</Button><Button><Upload className="w-4 h-4 mr-2" />File Return</Button></div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card><CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2"><CardTitle className="text-sm font-medium">VAT reported</CardTitle><FileText className="h-4 w-4 text-muted-foreground" /></CardHeader><CardContent><div className="text-2xl font-bold">{formatCurrency(sum(vatReturns, returnAmount), currency)}</div><p className="text-xs text-muted-foreground">Saved VAT returns</p></CardContent></Card>
        <Card><CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2"><CardTitle className="text-sm font-medium">WHT reported</CardTitle><FileText className="h-4 w-4 text-muted-foreground" /></CardHeader><CardContent><div className="text-2xl font-bold">{formatCurrency(sum(whtReturns, returnAmount), currency)}</div><p className="text-xs text-muted-foreground">Saved WHT returns</p></CardContent></Card>
        <Card><CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2"><CardTitle className="text-sm font-medium">Tax liability</CardTitle><AlertCircle className="h-4 w-4 text-orange-500" /></CardHeader><CardContent><div className="text-2xl font-bold text-orange-500">{formatCurrency(vatLiability + whtLiability, currency)}</div><p className="text-xs text-muted-foreground">Open saved returns</p></CardContent></Card>
        <Card><CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2"><CardTitle className="text-sm font-medium">Compliance rate</CardTitle><CheckCircle className="h-4 w-4 text-green-500" /></CardHeader><CardContent><div className="text-2xl font-bold text-green-500">{complianceRate}%</div><p className="text-xs text-muted-foreground">Filed saved returns</p></CardContent></Card>
      </div>

      <Card><CardHeader><CardTitle className="flex items-center gap-2"><Calendar className="w-5 h-5" />Upcoming deadlines</CardTitle></CardHeader><CardContent>{upcomingDeadlines.length ? <div className="space-y-3">{upcomingDeadlines.map((deadline) => <div key={deadline.id} className="flex items-center justify-between p-3 bg-muted/50 rounded-lg"><div><p className="font-medium">{deadline.type}</p><p className="text-sm text-muted-foreground">{deadline.period}</p></div><div className="text-right"><p className="text-sm">{deadline.dueDate}</p><Badge variant={getDaysLeftBadge(deadline.daysLeft)} className="text-xs">{deadline.daysLeft} days left</Badge></div></div>)}</div> : <p className="py-6 text-center text-sm text-muted-foreground">No upcoming deadlines have been saved.</p>}</CardContent></Card>

      <Tabs value={selectedTab} onValueChange={setSelectedTab}>
        <TabsList className="grid w-full grid-cols-3"><TabsTrigger value="vat">VAT Returns</TabsTrigger><TabsTrigger value="wht">WHT Returns</TabsTrigger><TabsTrigger value="summary">Tax Summary</TabsTrigger></TabsList>
        <TabsContent value="vat" className="space-y-4"><Card><CardHeader><CardTitle>VAT Return Filing</CardTitle></CardHeader><CardContent><Table><TableHeader><TableRow><TableHead>Period</TableHead><TableHead>Return type</TableHead><TableHead>Due date</TableHead><TableHead className="text-right">Amount</TableHead><TableHead>Status</TableHead><TableHead>Actions</TableHead></TableRow></TableHeader><TableBody>{renderRows(vatReturns, 'No VAT returns have been saved.')}</TableBody></Table></CardContent></Card></TabsContent>
        <TabsContent value="wht" className="space-y-4"><Card><CardHeader><CardTitle>Withholding Tax (WHT) Returns</CardTitle></CardHeader><CardContent><Table><TableHeader><TableRow><TableHead>Period</TableHead><TableHead>Return type</TableHead><TableHead>Due date</TableHead><TableHead className="text-right">Amount</TableHead><TableHead>Status</TableHead><TableHead>Actions</TableHead></TableRow></TableHeader><TableBody>{renderRows(whtReturns, 'No WHT returns have been saved.')}</TableBody></Table></CardContent></Card></TabsContent>
        <TabsContent value="summary" className="space-y-4"><div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card><CardHeader><CardTitle>VAT Summary</CardTitle></CardHeader><CardContent className="space-y-4"><div className="flex justify-between"><span>VAT reported</span><span className="font-medium">{formatCurrency(sum(vatReturns, returnAmount), currency)}</span></div><div className="flex justify-between"><span>VAT remitted</span><span className="font-medium">{formatCurrency(sum(vatReturns, paidAmount), currency)}</span></div><div className="border-t pt-2"><div className="flex justify-between font-medium"><span>Open VAT liability</span><span>{formatCurrency(vatLiability, currency)}</span></div></div><div className="space-y-2"><div className="flex justify-between text-sm"><span>Remittance progress</span><span>{vatProgress}%</span></div><Progress value={vatProgress} className="h-2" /></div></CardContent></Card>
          <Card><CardHeader><CardTitle>WHT Summary</CardTitle></CardHeader><CardContent className="space-y-4"><div className="flex justify-between"><span>WHT reported</span><span className="font-medium">{formatCurrency(sum(whtReturns, returnAmount), currency)}</span></div><div className="flex justify-between"><span>WHT remitted</span><span className="font-medium">{formatCurrency(sum(whtReturns, paidAmount), currency)}</span></div><div className="border-t pt-2"><div className="flex justify-between font-medium"><span>Open WHT liability</span><span>{formatCurrency(whtLiability, currency)}</span></div></div><div className="space-y-2"><div className="flex justify-between text-sm"><span>Remittance progress</span><span>{whtProgress}%</span></div><Progress value={whtProgress} className="h-2" /></div></CardContent></Card>
        </div></TabsContent>
      </Tabs>
    </div>
  );
}