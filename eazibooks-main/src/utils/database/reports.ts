import { supabase } from '../supabase/client';
import { fetchInvoices } from './invoices';
import { fetchTransactions } from './transactions';
import { fetchProducts } from './products';
import { fetchCustomers } from './customers';
import { calculateProfitLoss, calculateBalanceSheet, calculateCashFlow } from './accounting';

// Sales Reports
export async function getSalesByCustomer(startDate?: string, endDate?: string) {
  try {
    const invoices = await fetchInvoices();
    const customers = await fetchCustomers();

    // Filter by date range
    const filteredInvoices = startDate && endDate
      ? invoices.filter(inv => {
          const date = new Date(inv.invoice_date);
          return date >= new Date(startDate) && date <= new Date(endDate) && inv.status === 'paid';
        })
      : invoices.filter(inv => inv.status === 'paid');

    // Group by customer
    const salesByCustomer: { [key: string]: { name: string; total: number; count: number } } = {};

    filteredInvoices.forEach(invoice => {
      const customer = customers.find(c => c.id === invoice.customer_id);
      const customerId = invoice.customer_id || 'unknown';
      const customerName = customer?.name || 'Unknown Customer';

      if (!salesByCustomer[customerId]) {
        salesByCustomer[customerId] = {
          name: customerName,
          total: 0,
          count: 0,
        };
      }

      salesByCustomer[customerId].total += invoice.total;
      salesByCustomer[customerId].count += 1;
    });

    return Object.entries(salesByCustomer).map(([id, data]) => ({
      customerId: id,
      customerName: data.name,
      totalSales: data.total,
      invoiceCount: data.count,
      averageInvoice: data.total / data.count,
    })).sort((a, b) => b.totalSales - a.totalSales);
  } catch (error) {
    console.error('Error getting sales by customer:', error);
    return [];
  }
}

export async function getSalesByProduct(startDate?: string, endDate?: string) {
  try {
    const { data: invoiceItems, error } = await supabase
      .from('invoice_items')
      .select('*, invoices!inner(invoice_date, status), products(name)')
      .eq('invoices.status', 'paid');

    if (error) throw error;

    // Filter by date range
    const filteredItems = startDate && endDate
      ? (invoiceItems || []).filter((item: any) => {
          const date = new Date(item.invoices.invoice_date);
          return date >= new Date(startDate) && date <= new Date(endDate);
        })
      : invoiceItems || [];

    // Group by product
    const salesByProduct: { [key: string]: { name: string; quantity: number; total: number } } = {};

    filteredItems.forEach((item: any) => {
      const productId = item.product_id || 'unknown';
      const productName = item.products?.name || item.description || 'Unknown Product';

      if (!salesByProduct[productId]) {
        salesByProduct[productId] = {
          name: productName,
          quantity: 0,
          total: 0,
        };
      }

      salesByProduct[productId].quantity += item.quantity;
      salesByProduct[productId].total += item.total;
    });

    return Object.entries(salesByProduct).map(([id, data]) => ({
      productId: id,
      productName: data.name,
      quantitySold: data.quantity,
      totalRevenue: data.total,
      averagePrice: data.total / data.quantity,
    })).sort((a, b) => b.totalRevenue - a.totalRevenue);
  } catch (error) {
    console.error('Error getting sales by product:', error);
    return [];
  }
}

export async function getSalesByPeriod(startDate?: string, endDate?: string) {
  try {
    const invoices = await fetchInvoices();

    // Filter by date range
    const filteredInvoices = startDate && endDate
      ? invoices.filter(inv => {
          const date = new Date(inv.invoice_date);
          return date >= new Date(startDate) && date <= new Date(endDate) && inv.status === 'paid';
        })
      : invoices.filter(inv => inv.status === 'paid');

    // Group by month
    const salesByMonth: { [key: string]: number } = {};

    filteredInvoices.forEach(invoice => {
      const month = invoice.invoice_date.substring(0, 7); // YYYY-MM
      salesByMonth[month] = (salesByMonth[month] || 0) + invoice.total;
    });

    return Object.entries(salesByMonth).map(([month, total]) => ({
      period: month,
      totalSales: total,
      invoiceCount: filteredInvoices.filter(inv => inv.invoice_date.startsWith(month)).length,
    })).sort((a, b) => a.period.localeCompare(b.period));
  } catch (error) {
    console.error('Error getting sales by period:', error);
    return [];
  }
}

export async function getInvoiceAgingReport() {
  try {
    const invoices = await fetchInvoices();
    const customers = await fetchCustomers();
    const today = new Date();

    const unpaidInvoices = invoices.filter(inv => inv.status !== 'paid');

    const agingReport = unpaidInvoices.map(invoice => {
      const customer = customers.find(c => c.id === invoice.customer_id);
      const invoiceDate = new Date(invoice.invoice_date);
      const daysOverdue = Math.floor((today.getTime() - invoiceDate.getTime()) / (1000 * 60 * 60 * 24));

      let agingBucket = 'Current';
      if (daysOverdue > 90) agingBucket = '90+ Days';
      else if (daysOverdue > 60) agingBucket = '61-90 Days';
      else if (daysOverdue > 30) agingBucket = '31-60 Days';
      else if (daysOverdue > 0) agingBucket = '1-30 Days';

      return {
        invoiceNumber: invoice.invoice_number,
        customerName: customer?.name || 'Unknown',
        invoiceDate: invoice.invoice_date,
        dueDate: invoice.due_date,
        daysOverdue,
        amount: invoice.total,
        agingBucket,
      };
    });

    return agingReport.sort((a, b) => b.daysOverdue - a.daysOverdue);
  } catch (error) {
    console.error('Error getting invoice aging report:', error);
    return [];
  }
}

// Expense Reports
export async function getExpensesByCategory(startDate?: string, endDate?: string) {
  try {
    const transactions = await fetchTransactions();

    // Filter expenses by date range
    const expenses = startDate && endDate
      ? transactions.filter(t => {
          const date = new Date(t.transaction_date);
          return date >= new Date(startDate) && date <= new Date(endDate) && 
                 (t.type === 'expense' || t.type === 'bill');
        })
      : transactions.filter(t => t.type === 'expense' || t.type === 'bill');

    // Group by category
    const expensesByCategory: { [key: string]: number } = {};

    expenses.forEach(expense => {
      const category = expense.category || 'Uncategorized';
      expensesByCategory[category] = (expensesByCategory[category] || 0) + expense.amount;
    });

    return Object.entries(expensesByCategory).map(([category, total]) => ({
      category,
      total,
      count: expenses.filter(e => (e.category || 'Uncategorized') === category).length,
      average: total / expenses.filter(e => (e.category || 'Uncategorized') === category).length,
    })).sort((a, b) => b.total - a.total);
  } catch (error) {
    console.error('Error getting expenses by category:', error);
    return [];
  }
}

export async function getExpensesBySupplier(startDate?: string, endDate?: string) {
  try {
    const transactions = await fetchTransactions();

    // Filter expenses by date range
    const expenses = startDate && endDate
      ? transactions.filter(t => {
          const date = new Date(t.transaction_date);
          return date >= new Date(startDate) && date <= new Date(endDate) && 
                 (t.type === 'expense' || t.type === 'bill') && t.supplier_id;
        })
      : transactions.filter(t => (t.type === 'expense' || t.type === 'bill') && t.supplier_id);

    // Group by supplier
    const expensesBySupplier: { [key: string]: number } = {};

    expenses.forEach(expense => {
      const supplierId = expense.supplier_id || 'unknown';
      expensesBySupplier[supplierId] = (expensesBySupplier[supplierId] || 0) + expense.amount;
    });

    return Object.entries(expensesBySupplier).map(([supplierId, total]) => ({
      supplierId,
      total,
      count: expenses.filter(e => e.supplier_id === supplierId).length,
    })).sort((a, b) => b.total - a.total);
  } catch (error) {
    console.error('Error getting expenses by supplier:', error);
    return [];
  }
}

export async function getMonthlyExpenseTrend(months: number = 6) {
  try {
    const transactions = await fetchTransactions();
    const endDate = new Date();
    const startDate = new Date();
    startDate.setMonth(startDate.getMonth() - months);

    const expenses = transactions.filter(t => {
      const date = new Date(t.transaction_date);
      return date >= startDate && date <= endDate && (t.type === 'expense' || t.type === 'bill');
    });

    // Group by month
    const monthlyExpenses: { [key: string]: number } = {};

    expenses.forEach(expense => {
      const month = expense.transaction_date.substring(0, 7); // YYYY-MM
      monthlyExpenses[month] = (monthlyExpenses[month] || 0) + expense.amount;
    });

    return Object.entries(monthlyExpenses).map(([month, total]) => ({
      month,
      total,
      count: expenses.filter(e => e.transaction_date.startsWith(month)).length,
    })).sort((a, b) => a.month.localeCompare(b.month));
  } catch (error) {
    console.error('Error getting monthly expense trend:', error);
    return [];
  }
}

// Inventory Reports
export async function getStockValuation() {
  try {
    const products = await fetchProducts();

    return products.map(product => ({
      productId: product.id,
      productName: product.name,
      sku: product.sku,
      quantity: product.stock_quantity,
      costPrice: product.cost_price,
      sellingPrice: product.selling_price,
      stockValue: product.stock_quantity * product.cost_price,
      potentialRevenue: product.stock_quantity * product.selling_price,
      potentialProfit: product.stock_quantity * (product.selling_price - product.cost_price),
    })).sort((a, b) => b.stockValue - a.stockValue);
  } catch (error) {
    console.error('Error getting stock valuation:', error);
    return [];
  }
}

export async function getLowStockReport(threshold: number = 10) {
  try {
    const products = await fetchProducts();

    return products
      .filter(product => product.stock_quantity <= threshold)
      .map(product => ({
        productId: product.id,
        productName: product.name,
        sku: product.sku,
        currentStock: product.stock_quantity,
        reorderLevel: threshold,
        stockValue: product.stock_quantity * product.cost_price,
      }))
      .sort((a, b) => a.currentStock - b.currentStock);
  } catch (error) {
    console.error('Error getting low stock report:', error);
    return [];
  }
}

export async function getInventoryMovement(startDate?: string, endDate?: string) {
  try {
    // This would ideally track stock movements from a dedicated table
    // For now, we'll infer from invoice items
    const { data: invoiceItems, error } = await supabase
      .from('invoice_items')
      .select('*, invoices!inner(invoice_date, status)');

    if (error) throw error;

    // Filter by date range
    const filteredItems = startDate && endDate
      ? (invoiceItems || []).filter((item: any) => {
          const date = new Date(item.invoices.invoice_date);
          return date >= new Date(startDate) && date <= new Date(endDate);
        })
      : invoiceItems || [];

    // Group by product
    const movements: { [key: string]: { out: number; value: number } } = {};

    filteredItems.forEach((item: any) => {
      const productId = item.product_id || 'unknown';
      if (!movements[productId]) {
        movements[productId] = { out: 0, value: 0 };
      }
      movements[productId].out += item.quantity;
      movements[productId].value += item.total;
    });

    return Object.entries(movements).map(([productId, data]) => ({
      productId,
      stockOut: data.out,
      stockIn: 0, // TODO: Implement stock in tracking
      netMovement: -data.out,
      value: data.value,
    })).sort((a, b) => b.stockOut - a.stockOut);
  } catch (error) {
    console.error('Error getting inventory movement:', error);
    return [];
  }
}

// Financial Reports
export async function generateFinancialReports(startDate?: string, endDate?: string) {
  try {
    const [profitLoss, balanceSheet, cashFlow] = await Promise.all([
      calculateProfitLoss(startDate, endDate),
      calculateBalanceSheet(),
      calculateCashFlow(startDate, endDate),
    ]);

    return {
      profitAndLoss: profitLoss,
      balanceSheet,
      cashFlow,
      generatedAt: new Date().toISOString(),
      period: {
        startDate: startDate || 'Beginning',
        endDate: endDate || 'Current',
      },
    };
  } catch (error) {
    console.error('Error generating financial reports:', error);
    return null;
  }
}

// Report Export Helper
export interface ReportData {
  name: string;
  description: string;
  period?: string;
  data: any;
  generatedAt: string;
}

export async function generateReportData(
  reportType: string,
  startDate?: string,
  endDate?: string
): Promise<ReportData | null> {
  try {
    let data: any;
    let description: string;

    switch (reportType) {
      case 'profit-loss':
        data = await calculateProfitLoss(startDate, endDate);
        description = 'Income statement showing revenue, costs, and profitability';
        break;
      case 'balance-sheet':
        data = await calculateBalanceSheet();
        description = 'Statement of financial position';
        break;
      case 'cash-flow':
        data = await calculateCashFlow(startDate, endDate);
        description = 'Statement of cash inflows and outflows';
        break;
      case 'sales-by-customer':
        data = await getSalesByCustomer(startDate, endDate);
        description = 'Breakdown of sales revenue by customer';
        break;
      case 'sales-by-product':
        data = await getSalesByProduct(startDate, endDate);
        description = 'Breakdown of sales revenue by product';
        break;
      case 'expenses-by-category':
        data = await getExpensesByCategory(startDate, endDate);
        description = 'Breakdown of expenses by category';
        break;
      case 'stock-valuation':
        data = await getStockValuation();
        description = 'Current inventory value and quantities';
        break;
      case 'invoice-aging':
        data = await getInvoiceAgingReport();
        description = 'Outstanding invoices grouped by age';
        break;
      default:
        return null;
    }

    return {
      name: reportType,
      description,
      period: startDate && endDate ? `${startDate} to ${endDate}` : 'All time',
      data,
      generatedAt: new Date().toISOString(),
    };
  } catch (error) {
    console.error('Error generating report data:', error);
    return null;
  }
}
