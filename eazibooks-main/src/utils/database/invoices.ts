import { supabase } from '../supabase/client';

export interface Invoice {
  id?: string;
  company_id?: string;
  customer_id?: string;
  invoice_number: string;
  invoice_date: string;
  due_date?: string;
  status: 'draft' | 'sent' | 'paid' | 'overdue' | 'cancelled';
  currency: string;
  subtotal: number;
  tax_amount: number;
  discount_amount?: number;
  total: number;
  amount_paid?: number;
  balance_due?: number;
  payment_terms?: string;
  notes?: string;
  terms_conditions?: string;
  pdf_url?: string;
  created_at?: string;
  updated_at?: string;
}

export interface InvoiceItem {
  id?: string;
  invoice_id: string;
  product_id?: string;
  description: string;
  quantity: number;
  unit_price: number;
  tax_rate: number;
  tax_amount: number;
  total: number;
}

// Fetch all invoices
export async function fetchInvoices(): Promise<Invoice[]> {
  try {
    const { data, error } = await supabase
      .from('invoices')
      .select('*, customers(name, email)')
      .order('invoice_date', { ascending: false });

    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error('Error fetching invoices:', error);
    return [];
  }
}

// Fetch a single invoice by ID
export async function fetchInvoiceById(id: string): Promise<Invoice | null> {
  try {
    const { data, error } = await supabase
      .from('invoices')
      .select('*, customers(*)')
      .eq('id', id)
      .single();

    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Error fetching invoice:', error);
    return null;
  }
}

// Fetch invoice items
export async function fetchInvoiceItems(invoiceId: string): Promise<InvoiceItem[]> {
  try {
    const { data, error } = await supabase
      .from('invoice_items')
      .select('*')
      .eq('invoice_id', invoiceId);

    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error('Error fetching invoice items:', error);
    return [];
  }
}

// Generate unique invoice number
async function generateInvoiceNumber(companyId?: string): Promise<string> {
  let attempts = 0;
  const maxAttempts = 5;
  
  while (attempts < maxAttempts) {
    const year = new Date().getFullYear();
    const month = String(new Date().getMonth() + 1).padStart(2, '0');
    const timestamp = Date.now().toString().slice(-6);
    const random = Math.floor(Math.random() * 100);
    const invoiceNumber = `INV-${year}${month}-${timestamp}${random}`;
    
    // Check if number already exists
    const { data } = await supabase
      .from('invoices')
      .select('id')
      .eq('invoice_number', invoiceNumber)
      .maybeSingle();
    
    if (!data) {
      return invoiceNumber;
    }
    
    attempts++;
  }
  
  // Fallback to UUID-based number
  return `INV-${new Date().getFullYear()}-${crypto.randomUUID().substring(0, 8)}`;
}

// Create a new invoice with items
export async function createInvoice(
  invoice: Invoice, 
  items: Omit<InvoiceItem, 'invoice_id'>[]
): Promise<Invoice | null> {
  try {
    // Generate unique invoice number if not provided
    if (!invoice.invoice_number) {
      invoice.invoice_number = await generateInvoiceNumber(invoice.company_id);
    }

    // Calculate balance due
    invoice.balance_due = invoice.total - (invoice.amount_paid || 0);

    // Create invoice
    const { data: invoiceData, error: invoiceError } = await supabase
      .from('invoices')
      .insert([invoice])
      .select()
      .single();

    if (invoiceError) {
      // If duplicate key error, retry with new number
      if (invoiceError.code === '23505' && invoiceError.message.includes('invoice_number')) {
        invoice.invoice_number = await generateInvoiceNumber(invoice.company_id);
        const { data: retryData, error: retryError } = await supabase
          .from('invoices')
          .insert([invoice])
          .select()
          .single();
        
        if (retryError) throw retryError;
        
        // Create invoice items with retry data
        const itemsWithInvoiceId = items.map(item => ({
          ...item,
          invoice_id: retryData.id!,
        }));

        const { error: itemsError } = await supabase
          .from('invoice_items')
          .insert(itemsWithInvoiceId);

        if (itemsError) throw itemsError;
        
        return retryData;
      }
      throw invoiceError;
    }

    // Create invoice items
    const itemsWithInvoiceId = items.map(item => ({
      ...item,
      invoice_id: invoiceData.id!,
    }));

    const { error: itemsError } = await supabase
      .from('invoice_items')
      .insert(itemsWithInvoiceId);

    if (itemsError) throw itemsError;

    return invoiceData;
  } catch (error) {
    console.error('Error creating invoice:', error);
    return null;
  }
}

// Update an existing invoice
export async function updateInvoice(id: string, updates: Partial<Invoice>): Promise<Invoice | null> {
  try {
    // Recalculate balance due if total or amount_paid changed
    if (updates.total !== undefined || updates.amount_paid !== undefined) {
      const current = await fetchInvoiceById(id);
      if (current) {
        const total = updates.total ?? current.total;
        const amountPaid = updates.amount_paid ?? current.amount_paid ?? 0;
        updates.balance_due = total - amountPaid;
        
        // Update status based on balance
        if (updates.balance_due <= 0) {
          updates.status = 'paid';
        }
      }
    }

    const { data, error } = await supabase
      .from('invoices')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Error updating invoice:', error);
    return null;
  }
}

// Delete an invoice
export async function deleteInvoice(id: string): Promise<boolean> {
  try {
    // Delete invoice items first (cascade should handle this, but being explicit)
    await supabase
      .from('invoice_items')
      .delete()
      .eq('invoice_id', id);

    const { error } = await supabase
      .from('invoices')
      .delete()
      .eq('id', id);

    if (error) throw error;
    return true;
  } catch (error) {
    console.error('Error deleting invoice:', error);
    return false;
  }
}

// Record a payment against an invoice
export async function recordInvoicePayment(
  invoiceId: string,
  amount: number,
  paymentMethod: string,
  reference?: string
): Promise<boolean> {
  try {
    const invoice = await fetchInvoiceById(invoiceId);
    if (!invoice) return false;

    const newAmountPaid = (invoice.amount_paid || 0) + amount;
    const newBalanceDue = invoice.total - newAmountPaid;
    const newStatus = newBalanceDue <= 0 ? 'paid' : invoice.status;

    await updateInvoice(invoiceId, {
      amount_paid: newAmountPaid,
      balance_due: newBalanceDue,
      status: newStatus,
    });

    // Create payment record
    const { error } = await supabase
      .from('payments')
      .insert([{
        invoice_id: invoiceId,
        customer_id: invoice.customer_id,
        payment_number: `PAY-${Date.now()}`,
        payment_date: new Date().toISOString().split('T')[0],
        amount,
        payment_method: paymentMethod,
        reference_number: reference,
        status: 'completed',
      }]);

    if (error) throw error;
    return true;
  } catch (error) {
    console.error('Error recording payment:', error);
    return false;
  }
}

// Get invoice stats
export async function getInvoiceStats() {
  try {
    const invoices = await fetchInvoices();
    
    const stats = {
      total: invoices.length,
      draft: invoices.filter(i => i.status === 'draft').length,
      sent: invoices.filter(i => i.status === 'sent').length,
      paid: invoices.filter(i => i.status === 'paid').length,
      overdue: invoices.filter(i => i.status === 'overdue').length,
      totalAmount: invoices.reduce((sum, i) => sum + i.total, 0),
      totalPaid: invoices.reduce((sum, i) => sum + (i.amount_paid || 0), 0),
      totalOutstanding: invoices.reduce((sum, i) => sum + (i.balance_due || 0), 0),
    };

    return stats;
  } catch (error) {
    console.error('Error getting invoice stats:', error);
    return {
      total: 0,
      draft: 0,
      sent: 0,
      paid: 0,
      overdue: 0,
      totalAmount: 0,
      totalPaid: 0,
      totalOutstanding: 0,
    };
  }
}

// Search invoices
export async function searchInvoices(query: string): Promise<Invoice[]> {
  try {
    const { data, error } = await supabase
      .from('invoices')
      .select('*, customers(name, email)')
      .or(`invoice_number.ilike.%${query}%`)
      .order('invoice_date', { ascending: false });

    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error('Error searching invoices:', error);
    return [];
  }
}
