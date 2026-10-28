import { supabase } from '../supabase/client';
import { getInvoiceStats } from './invoices';
import { getCustomerStats } from './customers';
import { getProductStats } from './products';
import { getTransactionStats } from './transactions';

export interface DashboardStats {
  revenue: {
    total: number;
    change: string;
    trend: 'up' | 'down';
  };
  customers: {
    total: number;
    active: number;
    change: string;
    trend: 'up' | 'down';
  };
  products: {
    total: number;
    lowStock: number;
    change: string;
    trend: 'up' | 'down';
  };
  invoices: {
    pending: number;
    overdue: number;
    change: string;
    trend: 'up' | 'down';
  };
}

export interface RecentActivity {
  id: string;
  type: 'invoice' | 'payment' | 'inventory' | 'tax' | 'payroll' | 'customer' | 'product';
  message: string;
  time: string;
  status: 'success' | 'warning' | 'pending' | 'error';
  created_at: string;
}

// Fetch comprehensive dashboard stats
export async function fetchDashboardStats(): Promise<DashboardStats> {
  try {
    // Fetch all stats in parallel
    const [invoiceStats, customerStats, productStats, transactionStats] = await Promise.all([
      getInvoiceStats(),
      getCustomerStats(),
      getProductStats(),
      getTransactionStats(),
    ]);

    // Calculate revenue (from paid invoices)
    const revenue = {
      total: invoiceStats.totalPaid,
      change: '+12.5%', // TODO: Calculate from previous month
      trend: 'up' as const,
    };

    // Customer stats
    const customers = {
      total: customerStats.total,
      active: customerStats.active,
      change: '+8.2%', // TODO: Calculate from previous month
      trend: 'up' as const,
    };

    // Product/Inventory stats
    const products = {
      total: productStats.total,
      lowStock: productStats.lowStock,
      change: productStats.lowStock > 0 ? '-2.1%' : '+0.0%',
      trend: productStats.lowStock > 0 ? ('down' as const) : ('up' as const),
    };

    // Invoice stats
    const invoices = {
      pending: invoiceStats.sent + invoiceStats.draft,
      overdue: invoiceStats.overdue,
      change: '+15.3%', // TODO: Calculate from previous month
      trend: 'up' as const,
    };

    return {
      revenue,
      customers,
      products,
      invoices,
    };
  } catch (error) {
    console.error('Error fetching dashboard stats:', error);
    
    // Return default stats on error
    return {
      revenue: { total: 0, change: '+0.0%', trend: 'up' },
      customers: { total: 0, active: 0, change: '+0.0%', trend: 'up' },
      products: { total: 0, lowStock: 0, change: '+0.0%', trend: 'up' },
      invoices: { pending: 0, overdue: 0, change: '+0.0%', trend: 'up' },
    };
  }
}

// Fetch recent activities
export async function fetchRecentActivities(): Promise<RecentActivity[]> {
  try {
    // This would ideally come from an activity_log table
    // For now, we'll generate from recent invoices, payments, etc.
    
    const activities: RecentActivity[] = [];

    // Get recent invoices
    const { data: recentInvoices } = await supabase
      .from('invoices')
      .select('*, customers(name)')
      .order('created_at', { ascending: false })
      .limit(3);

    if (recentInvoices) {
      recentInvoices.forEach(invoice => {
        activities.push({
          id: invoice.id!,
          type: 'invoice',
          message: `Invoice ${invoice.invoice_number} created for ${(invoice.customers as any)?.name || 'Unknown'}`,
          time: getRelativeTime(invoice.created_at!),
          status: invoice.status === 'paid' ? 'success' : 'pending',
          created_at: invoice.created_at!,
        });
      });
    }

    // Get recent payments
    const { data: recentPayments } = await supabase
      .from('payments')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(2);

    if (recentPayments) {
      recentPayments.forEach(payment => {
        activities.push({
          id: payment.id!,
          type: 'payment',
          message: `Payment received - ${payment.currency} ${payment.amount.toLocaleString()}`,
          time: getRelativeTime(payment.created_at!),
          status: 'success',
          created_at: payment.created_at!,
        });
      });
    }

    // Sort by created_at
    activities.sort((a, b) => 
      new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
    );

    return activities.slice(0, 5); // Return top 5
  } catch (error) {
    console.error('Error fetching recent activities:', error);
    return [];
  }
}

// Fetch quick stats for the sidebar cards
export async function fetchQuickStats() {
  try {
    const [invoiceStats, transactionStats] = await Promise.all([
      getInvoiceStats(),
      getTransactionStats(),
    ]);

    return {
      overdueInvoices: invoiceStats.overdue,
      draftInvoices: invoiceStats.draft,
      paidThisMonth: invoiceStats.totalPaid,
      pendingPayments: invoiceStats.totalOutstanding,
    };
  } catch (error) {
    console.error('Error fetching quick stats:', error);
    return {
      overdueInvoices: 0,
      draftInvoices: 0,
      paidThisMonth: 0,
      pendingPayments: 0,
    };
  }
}

// Helper function to get relative time
function getRelativeTime(dateString: string): string {
  const date = new Date(dateString);
  const now = new Date();
  const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

  if (diffInSeconds < 60) {
    return 'just now';
  } else if (diffInSeconds < 3600) {
    const minutes = Math.floor(diffInSeconds / 60);
    return `${minutes} ${minutes === 1 ? 'min' : 'mins'} ago`;
  } else if (diffInSeconds < 86400) {
    const hours = Math.floor(diffInSeconds / 3600);
    return `${hours} ${hours === 1 ? 'hour' : 'hours'} ago`;
  } else if (diffInSeconds < 604800) {
    const days = Math.floor(diffInSeconds / 86400);
    return `${days} ${days === 1 ? 'day' : 'days'} ago`;
  } else {
    return date.toLocaleDateString();
  }
}

// Fetch revenue trend data for charts
export async function fetchRevenueTrend(months: number = 6) {
  try {
    const endDate = new Date();
    const startDate = new Date();
    startDate.setMonth(startDate.getMonth() - months);

    const { data, error } = await supabase
      .from('invoices')
      .select('invoice_date, total, status')
      .eq('status', 'paid')
      .gte('invoice_date', startDate.toISOString().split('T')[0])
      .lte('invoice_date', endDate.toISOString().split('T')[0])
      .order('invoice_date');

    if (error) throw error;

    // Group by month
    const monthlyData: { [key: string]: number } = {};
    
    data?.forEach(invoice => {
      const month = invoice.invoice_date.substring(0, 7); // YYYY-MM
      monthlyData[month] = (monthlyData[month] || 0) + invoice.total;
    });

    return Object.entries(monthlyData).map(([month, total]) => ({
      month,
      revenue: total,
    }));
  } catch (error) {
    console.error('Error fetching revenue trend:', error);
    return [];
  }
}
