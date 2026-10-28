import { FormEvent, useEffect, useState } from 'react';
import { ArrowDownCircle, ArrowUpCircle, Check, RefreshCw, X } from 'lucide-react';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Label } from '../../components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { toast } from 'sonner@2.0.3';

type Category = { id: number; name: string; direction: string };
type Transaction = { id: number; amount: string; direction: string; note?: string; occurred_at: string; category_name?: string };
type Summary = { income: number; expenses: number; balance: number };
type Contact = { id: number; name: string; type: string };
type Capture = { id: number; channel: string; status: string; parsed_data?: string | Record<string, any>; confidence?: number; created_at: string };

const money = (value: number) => new Intl.NumberFormat('en-NG', { style: 'currency', currency: 'NGN' }).format(value);
const parsedCapture = (capture: Capture) => typeof capture.parsed_data === 'string' ? JSON.parse(capture.parsed_data || '{}') : (capture.parsed_data || {});

export function LiegeLedger() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [captures, setCaptures] = useState<Capture[]>([]);
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [contactId, setContactId] = useState('');
  const [contactName, setContactName] = useState('');
  const [contactType, setContactType] = useState('customer');
  const [summary, setSummary] = useState<Summary>({ income: 0, expenses: 0, balance: 0 });
  const [direction, setDirection] = useState<'in' | 'out'>('out');
  const [amount, setAmount] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [note, setNote] = useState('');
  const [date, setDate] = useState(new Date().toISOString().slice(0, 10));
  const [captureText, setCaptureText] = useState('');
  const [captureFile, setCaptureFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);

  const load = async () => {
    const [categoriesResponse, transactionsResponse, summaryResponse, capturesResponse, contactsResponse] = await Promise.all([
      fetch('/api/ledger/categories', { credentials: 'include' }),
      fetch('/api/ledger/transactions', { credentials: 'include' }),
      fetch('/api/ledger/summary', { credentials: 'include' }),
      fetch('/api/captures', { credentials: 'include' }),
      fetch('/api/ledger/contacts', { credentials: 'include' }),
    ]);
    if (!categoriesResponse.ok || !capturesResponse.ok) throw new Error('Unable to load your ledger');
    const [categoryData, transactionData, summaryData, captureData, contactData] = await Promise.all([categoriesResponse.json(), transactionsResponse.json(), summaryResponse.json(), capturesResponse.json(), contactsResponse.json()]);
    setCategories(categoryData.data ?? []);
    setTransactions(transactionData.data ?? []);
    setSummary(summaryData.data ?? { income: 0, expenses: 0, balance: 0 });
    setCaptures((captureData.data ?? []).filter((capture: Capture) => capture.status === 'needs_review'));
    setContacts(contactData.data ?? []);
    if (!categoryId && categoryData.data?.length) setCategoryId(String(categoryData.data[0].id));
  };

  useEffect(() => { load().catch((error) => toast.error(error.message)); }, []);

  const submit = async (event: FormEvent) => {
    event.preventDefault(); setLoading(true);
    try {
      const response = await fetch('/api/ledger/transactions', { method: 'POST', credentials: 'include', headers: { 'Content-Type': 'application/json', Accept: 'application/json' }, body: JSON.stringify({ amount, direction, category_id: categoryId, contact_id: contactId || null, note, occurred_at: date }) });
      const result = await response.json(); if (!response.ok) throw new Error(result.message || 'Unable to save transaction');
      setAmount(''); setNote(''); await load(); toast.success('Balanced transaction posted');
    } catch (error) { toast.error(error instanceof Error ? error.message : 'Unable to save transaction'); } finally { setLoading(false); }
  };

  const createContact = async (event: FormEvent) => {
    event.preventDefault();
    try {
      const response = await fetch('/api/ledger/contacts', { method: 'POST', credentials: 'include', headers: { 'Content-Type': 'application/json', Accept: 'application/json' }, body: JSON.stringify({ name: contactName, type: contactType }) });
      const result = await response.json(); if (!response.ok) throw new Error(result.message || 'Unable to create contact');
      setContactName(''); setContactId(String(result.data.id)); await load(); toast.success('Contact saved');
    } catch (error) { toast.error(error instanceof Error ? error.message : 'Unable to create contact'); }
  };
  const submitCapture = async (event: FormEvent) => {
    event.preventDefault();
    try {
      const response = await fetch('/api/captures', { method: 'POST', credentials: 'include', headers: { 'Content-Type': 'application/json', Accept: 'application/json' }, body: (() => { const form = new FormData(); form.append('channel', captureFile?.type.startsWith('audio/') ? 'voice' : (captureFile ? 'receipt' : 'text')); if (captureText) form.append('text', captureText); if (captureFile) form.append('media', captureFile); return form; })() });
      const result = await response.json(); if (!response.ok) throw new Error(result.message || 'Unable to save capture');
      setCaptureText(''); setCaptureFile(null); await load(); toast.success('Capture added to review queue');
    } catch (error) { toast.error(error instanceof Error ? error.message : 'Unable to save capture'); }
  };

  const review = async (capture: Capture, status: 'approved' | 'rejected', corrected: Record<string, string> = {}) => {
    const parsed = parsedCapture(capture);
    const inferredDirection = corrected.direction || (parsed.direction === 'in' ? 'in' : 'out');
    const inferredCategory = corrected.category_id || String(categories.find((category) => category.direction === (inferredDirection === 'in' ? 'income' : 'expense'))?.id || '');
    try {
      const response = await fetch(`/api/captures/${capture.id}/review`, { method: 'PATCH', credentials: 'include', headers: { 'Content-Type': 'application/json', Accept: 'application/json' }, body: JSON.stringify({ status, amount: corrected.amount || parsed.amount, direction: inferredDirection, category_id: inferredCategory, note: corrected.note ?? parsed.note, occurred_at: corrected.occurred_at || parsed.occurred_at }) });
      const result = await response.json(); if (!response.ok) throw new Error(result.message || 'Unable to review capture');
      await load(); toast.success(status === 'approved' ? 'Capture posted to the ledger' : 'Capture rejected');
    } catch (error) { toast.error(error instanceof Error ? error.message : 'Unable to review capture'); }
  };
  return <div className="p-4 md:p-8 space-y-6 max-w-6xl mx-auto">
    <div><p className="text-sm font-medium text-primary">LIEGE · Capture first</p><h1 className="text-3xl font-semibold tracking-tight">Ledger workspace</h1><p className="text-muted-foreground mt-1">Record money in seconds. Every approved entry posts as a balanced double-entry transaction.</p></div>
    <div className="grid gap-4 sm:grid-cols-3"><Card><CardHeader className="pb-2"><CardTitle className="text-sm font-medium">Income</CardTitle></CardHeader><CardContent className="text-2xl font-semibold text-emerald-600">{money(summary.income)}</CardContent></Card><Card><CardHeader className="pb-2"><CardTitle className="text-sm font-medium">Expenses</CardTitle></CardHeader><CardContent className="text-2xl font-semibold text-rose-600">{money(summary.expenses)}</CardContent></Card><Card><CardHeader className="pb-2"><CardTitle className="text-sm font-medium">Net balance</CardTitle></CardHeader><CardContent className="text-2xl font-semibold">{money(summary.balance)}</CardContent></Card></div>
    <div className="grid gap-6 lg:grid-cols-[minmax(0,380px)_1fr]">
      <Card><CardHeader><CardTitle>Quick entry</CardTitle></CardHeader><CardContent><form onSubmit={submit} className="space-y-4"><div className="grid grid-cols-2 gap-2"><Button type="button" variant={direction === 'out' ? 'default' : 'outline'} onClick={() => setDirection('out')}><ArrowDownCircle className="mr-2 h-4 w-4" />Money out</Button><Button type="button" variant={direction === 'in' ? 'default' : 'outline'} onClick={() => setDirection('in')}><ArrowUpCircle className="mr-2 h-4 w-4" />Money in</Button></div><div className="space-y-2"><Label htmlFor="amount">Amount (NGN)</Label><Input id="amount" type="number" min="0.01" step="0.01" value={amount} onChange={e => setAmount(e.target.value)} placeholder="0.00" required /></div><div className="space-y-2"><Label htmlFor="category">Category</Label><select id="category" className="w-full h-10 rounded-md border bg-background px-3 text-sm" value={categoryId} onChange={e => setCategoryId(e.target.value)} required>{categories.filter(c => direction === 'in' ? c.direction === 'income' : c.direction === 'expense').map(category => <option key={category.id} value={category.id}>{category.name}</option>)}</select></div><div className="space-y-2"><Label htmlFor="contact">Customer or vendor</Label><select id="contact" className="w-full h-10 rounded-md border bg-background px-3 text-sm" value={contactId} onChange={e => setContactId(e.target.value)}><option value="">None</option>{contacts.map(contact => <option key={contact.id} value={contact.id}>{contact.name} ({contact.type})</option>)}</select></div><div className="space-y-2"><Label htmlFor="date">Date</Label><Input id="date" type="date" value={date} onChange={e => setDate(e.target.value)} required /></div><div className="space-y-2"><Label htmlFor="note">Note</Label><Input id="note" value={note} onChange={e => setNote(e.target.value)} placeholder="What was this for?" /></div><Button className="w-full" disabled={loading}>{loading ? 'Posting…' : 'Post transaction'}</Button></form></CardContent></Card>
      <Card><CardHeader className="flex flex-row items-center justify-between"><CardTitle>Recent activity</CardTitle><Button variant="ghost" size="icon" onClick={() => load()} aria-label="Refresh"><RefreshCw className="h-4 w-4" /></Button></CardHeader><CardContent><div className="space-y-3">{transactions.length === 0 ? <p className="text-sm text-muted-foreground py-8 text-center">Your first entry will appear here.</p> : transactions.map(transaction => <div key={transaction.id} className="flex items-center justify-between border-b pb-3"><div><p className="font-medium">{transaction.category_name || 'Transaction'}</p><p className="text-xs text-muted-foreground">{transaction.note || 'No note'} · {transaction.occurred_at}</p></div><span className={transaction.direction === 'in' ? 'font-semibold text-emerald-600' : 'font-semibold text-rose-600'}>{transaction.direction === 'in' ? '+' : '-'}{money(Number(transaction.amount))}</span></div>)}</div></CardContent></Card>
    </div>
    <Card><CardHeader><CardTitle>Contacts</CardTitle></CardHeader><CardContent><form onSubmit={createContact} className="flex flex-wrap gap-2"><Input value={contactName} onChange={event => setContactName(event.target.value)} placeholder="Customer or vendor name" className="flex-1 min-w-48" required /><select value={contactType} onChange={event => setContactType(event.target.value)} className="h-10 rounded-md border bg-background px-3 text-sm"><option value="customer">Customer</option><option value="vendor">Vendor</option></select><Button>Add contact</Button></form></CardContent></Card>
    <Card><CardHeader><CardTitle>Capture inbox</CardTitle></CardHeader><CardContent className="space-y-4"><form onSubmit={submitCapture} className="flex flex-wrap gap-2"><Input value={captureText} onChange={event => setCaptureText(event.target.value)} placeholder="e.g. Sold shoes NGN 12,500" className="flex-1 min-w-52" /><Input type="file" accept="image/*,audio/*" onChange={event => setCaptureFile(event.target.files?.[0] || null)} className="max-w-56" /><Button disabled={!captureText && !captureFile}>Capture</Button></form>{captures.length === 0 ? <p className="text-sm text-muted-foreground">No captures need review.</p> : captures.map(capture => { const parsed = parsedCapture(capture); const defaultDirection = parsed.direction === 'in' ? 'in' : 'out'; return <form key={capture.id} onSubmit={event => { event.preventDefault(); const values = Object.fromEntries(new FormData(event.currentTarget).entries()) as Record<string, string>; review(capture, 'approved', values); }} className="space-y-3 border rounded-md p-4"><div><p className="font-medium">{capture.channel} capture · {Math.round(Number(capture.confidence || 0) * 100)}% confidence</p><p className="text-sm text-muted-foreground">Review the extracted values before posting.</p></div><div className="grid gap-3 sm:grid-cols-2"><div><Label>Amount (NGN)</Label><Input name="amount" type="number" step="0.01" min="0.01" defaultValue={parsed.amount || ''} required /></div><div><Label>Direction</Label><select name="direction" defaultValue={defaultDirection} className="w-full h-10 rounded-md border bg-background px-3 text-sm"><option value="in">Money in</option><option value="out">Money out</option></select></div><div><Label>Category</Label><select name="category_id" defaultValue={categories.find(category => category.direction === (defaultDirection === 'in' ? 'income' : 'expense'))?.id} className="w-full h-10 rounded-md border bg-background px-3 text-sm">{categories.map(category => <option key={category.id} value={category.id}>{category.name}</option>)}</select></div><div><Label>Date</Label><Input name="occurred_at" type="date" defaultValue={parsed.occurred_at || new Date().toISOString().slice(0, 10)} required /></div></div><div><Label>Description</Label><Input name="note" defaultValue={parsed.note || ''} /></div><div className="flex gap-2"><Button type="button" size="sm" variant="outline" onClick={() => review(capture, 'rejected')}><X className="mr-1 h-4 w-4" />Reject</Button><Button size="sm"><Check className="mr-1 h-4 w-4" />Approve & post</Button></div></form>; })}</CardContent></Card>  </div>;
}