import { supabase } from '../supabase/client';

export interface Transaction {
  id?: string;
  company_id?: string;
  transaction_number: string;
  transaction_date: string;
  type: 'invoice' | 'bill' | 'payment' | 'expense' | 'income';
  category?: string;
  description?: string;
  amount: number;
  currency: string;
  status: 'pending' | 'completed' | 'cancelled';
  reference_id?: string; // Link to invoice, bill, or payment
  customer_id?: string;
  supplier_id?: string;
  payment_method?: string;
  notes?: string;
  created_at?: string;
  updated_at?: string;
}

// Fetch all transactions
export async function fetchTransactions(): Promise<Transaction[]> {
  try {
    const { data, error } = await supabase
      .from('transactions')
      .select('*')
      .order('transaction_date', { ascending: false });

    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error('Error fetching transactions:', error);
    return [];
  }
}

// Fetch transactions by date range
export async function fetchTransactionsByDateRange(
  startDate: string,
  endDate: string
): Promise<Transaction[]> {
  try {
    const { data, error } = await supabase
      .from('transactions')
      .select('*')
      .gte('transaction_date', startDate)
      .lte('transaction_date', endDate)
      .order('transaction_date', { ascending: false });

    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error('Error fetching transactions by date:', error);
    return [];
  }
}

// Fetch transactions by type
export async function fetchTransactionsByType(
  type: Transaction['type']
): Promise<Transaction[]> {
  try {
    const { data, error } = await supabase
      .from('transactions')
      .select('*')
      .eq('type', type)
      .order('transaction_date', { ascending: false });

    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error('Error fetching transactions by type:', error);
    return [];
  }
}

// Create a new transaction
export async function createTransaction(transaction: Transaction): Promise<Transaction | null> {
  try {
    // Generate transaction number if not provided
    if (!transaction.transaction_number) {
      const count = await fetchTransactions();
      const year = new Date().getFullYear();
      transaction.transaction_number = `TXN-${year}-${String(count.length + 1).padStart(5, '0')}`;
    }

    const { data, error } = await supabase
      .from('transactions')
      .insert([transaction])
      .select()
      .single();

    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Error creating transaction:', error);
    return null;
  }
}

// Update a transaction
export async function updateTransaction(
  id: string,
  updates: Partial<Transaction>
): Promise<Transaction | null> {
  try {
    const { data, error } = await supabase
      .from('transactions')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Error updating transaction:', error);
    return null;
  }
}

// Delete a transaction
export async function deleteTransaction(id: string): Promise<boolean> {
  try {
    const { error } = await supabase
      .from('transactions')
      .delete()
      .eq('id', id);

    if (error) throw error;
    return true;
  } catch (error) {
    console.error('Error deleting transaction:', error);
    return false;
  }
}

// Get transaction stats
export async function getTransactionStats() {
  try {
    const transactions = await fetchTransactions();
    
    const stats = {
      total: transactions.length,
      income: transactions
        .filter(t => t.type === 'income' || (t.type === 'invoice' && t.status === 'completed'))
        .reduce((sum, t) => sum + t.amount, 0),
      expenses: transactions
        .filter(t => t.type === 'expense' || t.type === 'bill')
        .reduce((sum, t) => sum + t.amount, 0),
      pending: transactions.filter(t => t.status === 'pending').length,
      completed: transactions.filter(t => t.status === 'completed').length,
      byType: {
        invoice: transactions.filter(t => t.type === 'invoice').length,
        bill: transactions.filter(t => t.type === 'bill').length,
        payment: transactions.filter(t => t.type === 'payment').length,
        expense: transactions.filter(t => t.type === 'expense').length,
        income: transactions.filter(t => t.type === 'income').length,
      },
    };

    return stats;
  } catch (error) {
    console.error('Error getting transaction stats:', error);
    return {
      total: 0,
      income: 0,
      expenses: 0,
      pending: 0,
      completed: 0,
      byType: {
        invoice: 0,
        bill: 0,
        payment: 0,
        expense: 0,
        income: 0,
      },
    };
  }
}

// Search transactions
export async function searchTransactions(query: string): Promise<Transaction[]> {
  try {
    const { data, error } = await supabase
      .from('transactions')
      .select('*')
      .or(`transaction_number.ilike.%${query}%,description.ilike.%${query}%`)
      .order('transaction_date', { ascending: false });

    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error('Error searching transactions:', error);
    return [];
  }
}
