import { supabase } from '../supabase/client';
import { fetchTransactions } from './transactions';
import { fetchInvoices } from './invoices';
import { fetchProducts } from './products';

export interface LedgerEntry {
  id?: string;
  company_id?: string;
  entry_number: string;
  entry_date: string;
  account: string;
  account_type: 'asset' | 'liability' | 'equity' | 'revenue' | 'expense';
  debit: number;
  credit: number;
  description: string;
  reference_type?: 'invoice' | 'payment' | 'expense' | 'manual';
  reference_id?: string;
  created_at?: string;
  updated_at?: string;
}

export interface JournalEntry {
  id?: string;
  company_id?: string;
  entry_number: string;
  entry_date: string;
  description: string;
  reference?: string;
  status?: 'draft' | 'posted' | 'reversed';
  created_by?: string;
  created_at?: string;
  updated_at?: string;
}

export interface JournalEntryLine {
  id?: string;
  journal_entry_id?: string;
  account_id?: string;
  account_code?: string;
  account_name?: string;
  account_type?: 'asset' | 'liability' | 'equity' | 'revenue' | 'expense';
  debit: number;
  credit: number;
  description?: string;
}

export interface ChartOfAccount {
  id?: string;
  company_id?: string;
  account_code: string;
  account_name: string;
  account_type: 'asset' | 'liability' | 'equity' | 'revenue' | 'expense';
  parent_account?: string;
  balance: number;
  is_active: boolean;
  created_at?: string;
  updated_at?: string;
}

// Fetch all ledger entries (flattened view from journal entries)
export async function getLedgerEntries(): Promise<LedgerEntry[]> {
  try {
    const { data, error } = await supabase
      .from('journal_entries')
      .select(`
        *,
        journal_entry_lines (
          *,
          chart_of_accounts (
            account_code,
            account_name,
            account_type
          )
        )
      `)
      .order('entry_date', { ascending: false });

    if (error) {
      console.error('Error fetching ledger entries:', error);
      throw error;
    }

    // Flatten journal entries and lines into ledger entry format
    const ledgerEntries: LedgerEntry[] = [];
    
    if (data) {
      for (const entry of data) {
        if (entry.journal_entry_lines && Array.isArray(entry.journal_entry_lines)) {
          for (const line of entry.journal_entry_lines) {
            const account = line.chart_of_accounts || {};
            ledgerEntries.push({
              id: line.id,
              company_id: entry.company_id,
              entry_number: entry.entry_number,
              entry_date: entry.entry_date,
              account: account.account_name || 'Unknown Account',
              account_type: account.account_type || 'expense',
              debit: line.debit || 0,
              credit: line.credit || 0,
              description: line.description || entry.description || '',
              reference_type: 'manual',
              reference_id: entry.id,
              created_at: entry.created_at,
              updated_at: entry.updated_at,
            });
          }
        }
      }
    }

    return ledgerEntries;
  } catch (error) {
    console.error('Error in getLedgerEntries:', error);
    return [];
  }
}

// Fetch ledger entries by account
export async function getLedgerEntriesByAccount(account: string): Promise<LedgerEntry[]> {
  try {
    const allEntries = await getLedgerEntries();
    return allEntries.filter(entry => entry.account === account);
  } catch (error) {
    console.error('Error in getLedgerEntriesByAccount:', error);
    return [];
  }
}

// Create a ledger entry (creates a journal entry with two lines)
export async function createLedgerEntry(entry: LedgerEntry): Promise<LedgerEntry | null> {
  try {
    // Get current user's company_id
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      console.error('No authenticated user');
      return null;
    }

    const { data: profile } = await supabase
      .from('profiles')
      .select('company_id')
      .eq('id', user.id)
      .single();

    if (!profile?.company_id) {
      console.error('No company_id found for user');
      return null;
    }

    const companyId = profile.company_id;

    // Generate entry number if not provided
    let entryNumber = entry.entry_number;
    if (!entryNumber) {
      const entries = await getLedgerEntries();
      const year = new Date().getFullYear();
      entryNumber = `JE-${year}-${String(entries.length + 1).padStart(5, '0')}`;
    }

    // Find or create the account in chart of accounts
    const { data: accounts } = await supabase
      .from('chart_of_accounts')
      .select('*')
      .eq('company_id', companyId)
      .eq('account_name', entry.account)
      .eq('account_type', entry.account_type)
      .limit(1);

    let accountId = accounts?.[0]?.id;

    // If account doesn't exist, create it
    if (!accountId) {
      const accountCode = `${entry.account_type.substring(0, 3).toUpperCase()}-${Date.now()}`;
      const { data: newAccount, error: accountError } = await supabase
        .from('chart_of_accounts')
        .insert([{
          company_id: companyId,
          account_code: accountCode,
          account_name: entry.account,
          account_type: entry.account_type,
          balance: 0,
          is_active: true,
        }])
        .select()
        .single();

      if (accountError) {
        console.error('Error creating account:', accountError);
        return null;
      }

      accountId = newAccount?.id;
    }

    if (!accountId) {
      console.error('Failed to get or create account');
      return null;
    }

    // Create the journal entry header
    const { data: journalEntry, error: journalError } = await supabase
      .from('journal_entries')
      .insert([{
        company_id: companyId,
        entry_number: entryNumber,
        entry_date: entry.entry_date,
        description: entry.description,
        reference: entry.reference_id || '',
        status: 'posted',
      }])
      .select()
      .single();

    if (journalError) {
      console.error('Error creating journal entry:', journalError);
      throw journalError;
    }

    // Create journal entry lines (debit and credit)
    const lines = [];
    
    if (entry.debit > 0) {
      lines.push({
        journal_entry_id: journalEntry.id,
        account_id: accountId,
        debit: entry.debit,
        credit: 0,
        description: entry.description,
      });
    }

    if (entry.credit > 0) {
      lines.push({
        journal_entry_id: journalEntry.id,
        account_id: accountId,
        debit: 0,
        credit: entry.credit,
        description: entry.description,
      });
    }

    if (lines.length > 0) {
      const { error: linesError } = await supabase
        .from('journal_entry_lines')
        .insert(lines);

      if (linesError) {
        console.error('Error creating journal entry lines:', linesError);
        throw linesError;
      }
    }

    // Return the created entry
    return {
      ...entry,
      id: journalEntry.id,
      entry_number: entryNumber,
    };
  } catch (error) {
    console.error('Error creating ledger entry:', error);
    return null;
  }
}

// Fetch chart of accounts
export async function fetchChartOfAccounts(): Promise<ChartOfAccount[]> {
  try {
    const { data, error } = await supabase
      .from('chart_of_accounts')
      .select('*')
      .eq('is_active', true)
      .order('account_code');

    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error('Error fetching chart of accounts:', error);
    return [];
  }
}

// Create chart of account
export async function createChartOfAccount(account: ChartOfAccount): Promise<ChartOfAccount | null> {
  try {
    const { data, error } = await supabase
      .from('chart_of_accounts')
      .insert([account])
      .select()
      .single();

    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Error creating chart of account:', error);
    return null;
  }
}

// Calculate Profit & Loss Statement
export async function calculateProfitLoss(startDate?: string, endDate?: string) {
  try {
    const transactions = await fetchTransactions();
    const invoices = await fetchInvoices();

    // Filter by date range if provided
    const filterByDate = (items: any[], dateField: string) => {
      if (!startDate || !endDate) return items;
      return items.filter(item => {
        const itemDate = new Date(item[dateField]);
        return itemDate >= new Date(startDate) && itemDate <= new Date(endDate);
      });
    };

    const filteredTransactions = filterByDate(transactions, 'transaction_date');
    const filteredInvoices = filterByDate(invoices, 'invoice_date');

    // Calculate revenue (from paid invoices)
    const revenue = filteredInvoices
      .filter(inv => inv.status === 'paid')
      .reduce((sum, inv) => sum + inv.total, 0);

    // Calculate cost of sales (from inventory/product costs)
    const costOfSales = filteredTransactions
      .filter(t => t.type === 'bill' && t.category === 'inventory')
      .reduce((sum, t) => sum + t.amount, 0);

    // Calculate operating expenses (other expenses)
    const operatingExpenses = filteredTransactions
      .filter(t => t.type === 'expense' && t.category !== 'inventory')
      .reduce((sum, t) => sum + t.amount, 0);

    const grossProfit = revenue - costOfSales;
    const netProfit = grossProfit - operatingExpenses;

    return {
      revenue,
      costOfSales,
      grossProfit,
      grossProfitMargin: revenue > 0 ? ((grossProfit / revenue) * 100).toFixed(2) : '0',
      operatingExpenses,
      netProfit,
      netProfitMargin: revenue > 0 ? ((netProfit / revenue) * 100).toFixed(2) : '0',
    };
  } catch (error) {
    console.error('Error calculating P&L:', error);
    return {
      revenue: 0,
      costOfSales: 0,
      grossProfit: 0,
      grossProfitMargin: '0',
      operatingExpenses: 0,
      netProfit: 0,
      netProfitMargin: '0',
    };
  }
}

// Calculate Balance Sheet
export async function calculateBalanceSheet() {
  try {
    const transactions = await fetchTransactions();
    const products = await fetchProducts();
    const invoices = await fetchInvoices();

    // Assets
    const cashAndBank = transactions
      .filter(t => t.status === 'completed')
      .reduce((sum, t) => {
        if (t.type === 'income' || (t.type === 'invoice' && t.status === 'completed')) {
          return sum + t.amount;
        } else if (t.type === 'expense' || t.type === 'bill') {
          return sum - t.amount;
        }
        return sum;
      }, 0);

    const accountsReceivable = invoices
      .filter(inv => inv.status === 'sent' || inv.status === 'overdue')
      .reduce((sum, inv) => sum + inv.total, 0);

    const inventory = products
      .reduce((sum, p) => sum + (p.stock_quantity * p.selling_price), 0);

    const currentAssets = cashAndBank + accountsReceivable + inventory;
    const fixedAssets = 0; // TODO: Implement fixed assets tracking
    const totalAssets = currentAssets + fixedAssets;

    // Liabilities
    const accountsPayable = transactions
      .filter(t => t.type === 'bill' && t.status === 'pending')
      .reduce((sum, t) => sum + t.amount, 0);

    const currentLiabilities = accountsPayable;
    const longTermLiabilities = 0; // TODO: Implement long-term liabilities tracking
    const totalLiabilities = currentLiabilities + longTermLiabilities;

    // Equity
    const totalEquity = totalAssets - totalLiabilities;
    const capital = totalEquity * 0.7; // Simplified - 70% capital
    const retainedEarnings = totalEquity * 0.3; // 30% retained earnings

    return {
      assets: {
        currentAssets,
        fixedAssets,
        total: totalAssets,
        breakdown: {
          cashAndBank,
          accountsReceivable,
          inventory,
        },
      },
      liabilities: {
        currentLiabilities,
        longTermLiabilities,
        total: totalLiabilities,
        breakdown: {
          accountsPayable,
        },
      },
      equity: {
        capital,
        retainedEarnings,
        total: totalEquity,
      },
    };
  } catch (error) {
    console.error('Error calculating balance sheet:', error);
    return {
      assets: {
        currentAssets: 0,
        fixedAssets: 0,
        total: 0,
        breakdown: { cashAndBank: 0, accountsReceivable: 0, inventory: 0 },
      },
      liabilities: {
        currentLiabilities: 0,
        longTermLiabilities: 0,
        total: 0,
        breakdown: { accountsPayable: 0 },
      },
      equity: {
        capital: 0,
        retainedEarnings: 0,
        total: 0,
      },
    };
  }
}

// Calculate Cash Flow Statement
export async function calculateCashFlow(startDate?: string, endDate?: string) {
  try {
    const transactions = await fetchTransactions();

    // Filter by date range if provided
    const filteredTransactions = startDate && endDate
      ? transactions.filter(t => {
          const date = new Date(t.transaction_date);
          return date >= new Date(startDate) && date <= new Date(endDate);
        })
      : transactions;

    // Operating activities (regular business operations)
    const operating = filteredTransactions
      .filter(t => t.type === 'income' || t.type === 'expense')
      .reduce((sum, t) => {
        return t.type === 'income' ? sum + t.amount : sum - t.amount;
      }, 0);

    // Investing activities (asset purchases, sales)
    const investing = filteredTransactions
      .filter(t => t.category === 'investment' || t.category === 'asset')
      .reduce((sum, t) => sum - t.amount, 0);

    // Financing activities (loans, capital)
    const financing = filteredTransactions
      .filter(t => t.category === 'loan' || t.category === 'capital')
      .reduce((sum, t) => sum + t.amount, 0);

    const netCashFlow = operating + investing + financing;

    // Calculate opening and closing balances
    const allTransactions = await fetchTransactions();
    const totalCash = allTransactions
      .filter(t => t.status === 'completed')
      .reduce((sum, t) => {
        if (t.type === 'income') return sum + t.amount;
        if (t.type === 'expense') return sum - t.amount;
        return sum;
      }, 0);

    const closingBalance = totalCash;
    const openingBalance = closingBalance - netCashFlow;

    return {
      operating,
      investing,
      financing,
      netCashFlow,
      openingBalance,
      closingBalance,
    };
  } catch (error) {
    console.error('Error calculating cash flow:', error);
    return {
      operating: 0,
      investing: 0,
      financing: 0,
      netCashFlow: 0,
      openingBalance: 0,
      closingBalance: 0,
    };
  }
}

// Get accounting summary
export async function getAccountingSummary() {
  try {
    const [profitLoss, balanceSheet, cashFlow] = await Promise.all([
      calculateProfitLoss(),
      calculateBalanceSheet(),
      calculateCashFlow(),
    ]);

    return {
      profitLoss,
      balanceSheet,
      cashFlow,
    };
  } catch (error) {
    console.error('Error getting accounting summary:', error);
    return null;
  }
}