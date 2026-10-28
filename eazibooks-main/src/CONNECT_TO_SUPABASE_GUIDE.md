# 🔌 Complete Guide: Connect All Pages to Supabase

## Overview
This guide will walk you through connecting Dashboard, Customers, Products, Transactions, Suppliers, and all other pages to Supabase, replacing mock data with real database queries.

---

## 📋 Table of Contents
1. [Prerequisites](#prerequisites)
2. [Database Utilities Created](#database-utilities-created)
3. [Step-by-Step Connection Guide](#step-by-step-connection-guide)
   - [Dashboard](#1-dashboard)
   - [Customers](#2-customers)
   - [Products](#3-products)
   - [Transactions](#4-transactions)
   - [Suppliers](#5-suppliers)
   - [Reports](#6-reports)
4. [Testing](#testing)
5. [Troubleshooting](#troubleshooting)

---

## Prerequisites

### ✅ Before You Start:
- [ ] Supabase database is set up
- [ ] RLS policies are fixed (run `/FIX_EVERYTHING.sql`)
- [ ] All database tables exist (run `/SUPABASE_SCHEMA.sql`)
- [ ] Storage buckets created
- [ ] User is authenticated

---

## Database Utilities Created

I've created comprehensive database utility files for you:

### ✅ Files Created:
1. **`/utils/database/customers.ts`** - Customer CRUD operations
2. **`/utils/database/products.ts`** - Product CRUD operations
3. **`/utils/database/invoices.ts`** - Invoice CRUD operations
4. **`/utils/database/transactions.ts`** - ✨ NEW - Transaction operations
5. **`/utils/database/suppliers.ts`** - ✨ NEW - Supplier operations
6. **`/utils/database/dashboard.ts`** - ✨ NEW - Dashboard stats aggregation

Each file includes:
- ✅ TypeScript interfaces
- ✅ CRUD functions (Create, Read, Update, Delete)
- ✅ Search functions
- ✅ Stats/aggregation functions
- ✅ Error handling
- ✅ Proper typing

---

## Step-by-Step Connection Guide

---

## 1. Dashboard

### Current State:
- ✅ UI complete
- ❌ Shows mock data
- ❌ Not connected to Supabase

### Files to Edit:
- `/components/Dashboard.tsx`

### Step 1.1: Update Imports

**Find this** (around line 28):
```typescript
// import { supabase } from '../utils/supabase'; // Uncomment when Supabase is configured
```

**Replace with**:
```typescript
import { supabase } from '../utils/supabase/client';
import { 
  fetchDashboardStats, 
  fetchRecentActivities,
  fetchQuickStats 
} from '../utils/database/dashboard';
```

### Step 1.2: Replace fetchDashboardData Function

**Find this** (lines 75-122):
```typescript
const fetchDashboardData = async () => {
  setRefreshing(true);
  try {
     // TODO: Replace with actual Supabase queries
     //  const { data: invoices } = await supabase.from('invoices').select('*');
     // ... mock data
  } catch (error) {
    console.error('Error fetching dashboard data:', error);
  } finally {
    setRefreshing(false);
  }
};
```

**Replace with**:
```typescript
const fetchDashboardData = async () => {
  setRefreshing(true);
  try {
    // Fetch real dashboard stats from Supabase
    const dashboardStats = await fetchDashboardStats();
    
    // Update stats with real data
    setStats([
      {
        title: 'Total Revenue',
        value: formatCurrency(dashboardStats.revenue.total, currency),
        change: dashboardStats.revenue.change,
        trend: dashboardStats.revenue.trend,
        icon: DollarSign,
      },
      {
        title: 'Active Customers',
        value: dashboardStats.customers.total.toLocaleString(),
        change: dashboardStats.customers.change,
        trend: dashboardStats.customers.trend,
        icon: Users,
      },
      {
        title: 'Inventory Items',
        value: dashboardStats.products.total.toLocaleString(),
        change: dashboardStats.products.change,
        trend: dashboardStats.products.trend,
        icon: Package,
      },
      {
        title: 'Pending Invoices',
        value: dashboardStats.invoices.pending.toString(),
        change: dashboardStats.invoices.change,
        trend: dashboardStats.invoices.trend,
        icon: FileText,
      },
    ]);
  } catch (error) {
    console.error('Error fetching dashboard data:', error);
    toast.error('Failed to load dashboard data');
  } finally {
    setRefreshing(false);
  }
};
```

### Step 1.3: Add Real Recent Activities

**Find this** (lines 129-135):
```typescript
const recentActivities = [
  { id: 1, type: 'invoice', message: 'Invoice #INV-001 created...', ... },
  // ... more mock activities
];
```

**Replace with**:
```typescript
const [recentActivities, setRecentActivities] = useState<any[]>([]);

useEffect(() => {
  const loadRecentActivities = async () => {
    const activities = await fetchRecentActivities();
    setRecentActivities(activities);
  };
  loadRecentActivities();
}, []);
```

### Step 1.4: Add Real Quick Stats

**Find the Quick Stats section** (around line 323-347) and add state:
```typescript
const [quickStats, setQuickStats] = useState({
  overdueInvoices: 0,
  draftInvoices: 0,
  paidThisMonth: 0,
  pendingPayments: 0,
});

useEffect(() => {
  const loadQuickStats = async () => {
    const stats = await fetchQuickStats();
    setQuickStats(stats);
  };
  loadQuickStats();
}, []);
```

**Update the JSX** (around line 329-344):
```typescript
<div className="flex justify-between items-center p-3 bg-muted/50 rounded-lg">
  <span className="text-sm">Overdue Invoices</span>
  <Badge variant="destructive">{quickStats.overdueInvoices}</Badge>
</div>
<div className="flex justify-between items-center p-3 bg-muted/50 rounded-lg">
  <span className="text-sm">Draft Invoices</span>
  <Badge variant="secondary">{quickStats.draftInvoices}</Badge>
</div>
<div className="flex justify-between items-center p-3 bg-muted/50 rounded-lg">
  <span className="text-sm">Paid This Month</span>
  <Badge variant="outline">{formatCurrency(quickStats.paidThisMonth, currency)}</Badge>
</div>
<div className="flex justify-between items-center p-3 bg-muted/50 rounded-lg">
  <span className="text-sm">Pending Payments</span>
  <Badge variant="secondary">{formatCurrency(quickStats.pendingPayments, currency)}</Badge>
</div>
```

### ✅ Dashboard Complete!

---

## 2. Customers

### Current State:
- ✅ UI complete
- ❌ Uses mock data
- ❌ CRUD doesn't persist

### Files to Edit:
- `/components/Customers.tsx`

### Step 2.1: Update Imports

**Add to imports** (at the top):
```typescript
import { 
  fetchCustomers, 
  createCustomer, 
  updateCustomer, 
  deleteCustomer,
  searchCustomers,
  type Customer 
} from '../utils/database/customers';
import { toast } from 'sonner@2.0.3';
```

### Step 2.2: Replace Mock Data with State

**Find** (around the mock customers array):
```typescript
const [customers, setCustomers] = useState([
  { id: '1', name: 'John Doe', ... }, // mock data
]);
```

**Replace with**:
```typescript
const [customers, setCustomers] = useState<Customer[]>([]);
const [loading, setLoading] = useState(true);
```

### Step 2.3: Add Data Fetching

**Add this useEffect**:
```typescript
useEffect(() => {
  loadCustomers();
}, []);

const loadCustomers = async () => {
  setLoading(true);
  try {
    const data = await fetchCustomers();
    setCustomers(data);
  } catch (error) {
    console.error('Error loading customers:', error);
    toast.error('Failed to load customers');
  } finally {
    setLoading(false);
  }
};
```

### Step 2.4: Update handleAddCustomer

**Find the handleAddCustomer function and replace with**:
```typescript
const handleAddCustomer = async () => {
  if (!newCustomer.name || !newCustomer.email) {
    toast.error('Please fill in required fields');
    return;
  }

  setIsAdding(true);
  try {
    const created = await createCustomer(newCustomer);
    
    if (created) {
      toast.success('Customer added successfully');
      setCustomers([created, ...customers]);
      setIsAddDialogOpen(false);
      setNewCustomer({ 
        name: '', 
        email: '', 
        phone: '', 
        company_name: '',
        address: '',
        status: 'active' 
      });
    } else {
      toast.error('Failed to add customer');
    }
  } catch (error) {
    console.error('Error adding customer:', error);
    toast.error('Failed to add customer');
  } finally {
    setIsAdding(false);
  }
};
```

### Step 2.5: Update handleEditCustomer

**Replace the handleEditCustomer function**:
```typescript
const handleEditCustomer = async () => {
  if (!editingCustomer?.id) return;

  try {
    const updated = await updateCustomer(editingCustomer.id, editingCustomer);
    
    if (updated) {
      toast.success('Customer updated successfully');
      setCustomers(customers.map(c => 
        c.id === updated.id ? updated : c
      ));
      setIsEditDialogOpen(false);
      setEditingCustomer(null);
    } else {
      toast.error('Failed to update customer');
    }
  } catch (error) {
    console.error('Error updating customer:', error);
    toast.error('Failed to update customer');
  }
};
```

### Step 2.6: Update handleDeleteCustomer

**Replace the handleDeleteCustomer function**:
```typescript
const handleDeleteCustomer = async (id: string) => {
  if (!confirm('Are you sure you want to delete this customer?')) return;

  try {
    const success = await deleteCustomer(id);
    
    if (success) {
      toast.success('Customer deleted successfully');
      setCustomers(customers.filter(c => c.id !== id));
    } else {
      toast.error('Failed to delete customer');
    }
  } catch (error) {
    console.error('Error deleting customer:', error);
    toast.error('Failed to delete customer');
  }
};
```

### Step 2.7: Update handleSearch

**Replace the handleSearch function**:
```typescript
const handleSearch = async (query: string) => {
  setSearchQuery(query);
  
  if (!query.trim()) {
    loadCustomers();
    return;
  }

  try {
    const results = await searchCustomers(query);
    setCustomers(results);
  } catch (error) {
    console.error('Error searching customers:', error);
    toast.error('Search failed');
  }
};
```

### Step 2.8: Add Loading State to JSX

**In the return statement, add loading state**:
```typescript
if (loading) {
  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin mx-auto mb-2" />
          <p className="text-sm text-muted-foreground">Loading customers...</p>
        </div>
      </div>
    </div>
  );
}
```

### ✅ Customers Complete!

---

## 3. Products

### Follow the same pattern as Customers:

### Step 3.1: Update Imports
```typescript
import { 
  fetchProducts, 
  createProduct, 
  updateProduct, 
  deleteProduct,
  searchProducts,
  getLowStockProducts,
  type Product 
} from '../utils/database/products';
```

### Step 3.2: Replace Mock Data
```typescript
const [products, setProducts] = useState<Product[]>([]);
const [loading, setLoading] = useState(true);
```

### Step 3.3: Add Data Fetching
```typescript
useEffect(() => {
  loadProducts();
}, []);

const loadProducts = async () => {
  setLoading(true);
  try {
    const data = await fetchProducts();
    setProducts(data);
  } catch (error) {
    console.error('Error loading products:', error);
    toast.error('Failed to load products');
  } finally {
    setLoading(false);
  }
};
```

### Step 3.4: Update CRUD Operations

**handleAddProduct**:
```typescript
const handleAddProduct = async () => {
  if (!newProduct.name || !newProduct.price) {
    toast.error('Please fill in required fields');
    return;
  }

  try {
    const created = await createProduct(newProduct);
    
    if (created) {
      toast.success('Product added successfully');
      setProducts([created, ...products]);
      setIsAddDialogOpen(false);
      resetNewProduct();
    } else {
      toast.error('Failed to add product');
    }
  } catch (error) {
    console.error('Error adding product:', error);
    toast.error('Failed to add product');
  }
};
```

**handleEditProduct**:
```typescript
const handleEditProduct = async () => {
  if (!editingProduct?.id) return;

  try {
    const updated = await updateProduct(editingProduct.id, editingProduct);
    
    if (updated) {
      toast.success('Product updated successfully');
      setProducts(products.map(p => 
        p.id === updated.id ? updated : p
      ));
      setIsEditDialogOpen(false);
      setEditingProduct(null);
    } else {
      toast.error('Failed to update product');
    }
  } catch (error) {
    console.error('Error updating product:', error);
    toast.error('Failed to update product');
  }
};
```

**handleDeleteProduct**:
```typescript
const handleDeleteProduct = async (id: string) => {
  if (!confirm('Are you sure you want to delete this product?')) return;

  try {
    const success = await deleteProduct(id);
    
    if (success) {
      toast.success('Product deleted successfully');
      setProducts(products.filter(p => p.id !== id));
    } else {
      toast.error('Failed to delete product');
    }
  } catch (error) {
    console.error('Error deleting product:', error);
    toast.error('Failed to delete product');
  }
};
```

### ✅ Products Complete!

---

## 4. Transactions

### Step 4.1: Update Imports in `/components/Transactions.tsx`

```typescript
import { 
  fetchTransactions,
  fetchTransactionsByDateRange,
  fetchTransactionsByType,
  deleteTransaction,
  searchTransactions,
  type Transaction 
} from '../utils/database/transactions';
import { toast } from 'sonner@2.0.3';
```

### Step 4.2: Replace Mock Data
```typescript
const [transactions, setTransactions] = useState<Transaction[]>([]);
const [loading, setLoading] = useState(true);
const [filters, setFilters] = useState({
  startDate: '',
  endDate: '',
  type: 'all',
  status: 'all',
});
```

### Step 4.3: Add Data Fetching
```typescript
useEffect(() => {
  loadTransactions();
}, [filters]);

const loadTransactions = async () => {
  setLoading(true);
  try {
    let data: Transaction[];
    
    if (filters.startDate && filters.endDate) {
      data = await fetchTransactionsByDateRange(filters.startDate, filters.endDate);
    } else if (filters.type && filters.type !== 'all') {
      data = await fetchTransactionsByType(filters.type as any);
    } else {
      data = await fetchTransactions();
    }
    
    // Apply status filter if needed
    if (filters.status && filters.status !== 'all') {
      data = data.filter(t => t.status === filters.status);
    }
    
    setTransactions(data);
  } catch (error) {
    console.error('Error loading transactions:', error);
    toast.error('Failed to load transactions');
  } finally {
    setLoading(false);
  }
};
```

### Step 4.4: Update handleSearch
```typescript
const handleSearch = async (query: string) => {
  setSearchQuery(query);
  
  if (!query.trim()) {
    loadTransactions();
    return;
  }

  try {
    const results = await searchTransactions(query);
    setTransactions(results);
  } catch (error) {
    console.error('Error searching transactions:', error);
    toast.error('Search failed');
  }
};
```

### Step 4.5: Update handleDelete
```typescript
const handleDeleteTransaction = async (id: string) => {
  if (!confirm('Are you sure you want to delete this transaction?')) return;

  try {
    const success = await deleteTransaction(id);
    
    if (success) {
      toast.success('Transaction deleted successfully');
      setTransactions(transactions.filter(t => t.id !== id));
    } else {
      toast.error('Failed to delete transaction');
    }
  } catch (error) {
    console.error('Error deleting transaction:', error);
    toast.error('Failed to delete transaction');
  }
};
```

### ✅ Transactions Complete!

---

## 5. Suppliers

### Step 5.1: Update Imports in `/components/Suppliers.tsx`

```typescript
import { 
  fetchSuppliers,
  createSupplier,
  updateSupplier,
  deleteSupplier,
  searchSuppliers,
  type Supplier 
} from '../utils/database/suppliers';
import { toast } from 'sonner@2.0.3';
```

### Step 5.2: Follow Same Pattern as Customers

Replace mock data, add loading states, and implement CRUD operations using the imported functions. The pattern is identical to Customers.

### ✅ Suppliers Complete!

---

## 6. Reports

### Step 6.1: Update `/components/Reports.tsx`

```typescript
import { fetchInvoices, getInvoiceStats } from '../utils/database/invoices';
import { getCustomerStats } from '../utils/database/customers';
import { getProductStats } from '../utils/database/products';
import { getTransactionStats } from '../utils/database/transactions';
import { fetchRevenueTrend } from '../utils/database/dashboard';
```

### Step 6.2: Add Data Fetching for Reports
```typescript
const [reportData, setReportData] = useState<any>(null);
const [loading, setLoading] = useState(false);

const generateReport = async (reportType: string) => {
  setLoading(true);
  try {
    switch (reportType) {
      case 'profit-loss':
        const transactionStats = await getTransactionStats();
        setReportData({
          income: transactionStats.income,
          expenses: transactionStats.expenses,
          profit: transactionStats.income - transactionStats.expenses,
        });
        break;
        
      case 'sales':
        const invoiceStats = await getInvoiceStats();
        setReportData(invoiceStats);
        break;
        
      case 'inventory':
        const productStats = await getProductStats();
        setReportData(productStats);
        break;
        
      case 'revenue-trend':
        const trend = await fetchRevenueTrend(12); // 12 months
        setReportData(trend);
        break;
        
      default:
        toast.error('Unknown report type');
    }
  } catch (error) {
    console.error('Error generating report:', error);
    toast.error('Failed to generate report');
  } finally {
    setLoading(false);
  }
};
```

### ✅ Reports Complete!

---

## Testing

### Test Each Page:

#### 1. Dashboard
- [ ] Open Dashboard
- [ ] Check stats show real numbers
- [ ] Click Refresh button
- [ ] Verify numbers update
- [ ] Check recent activities show real data
- [ ] Verify quick stats are accurate

#### 2. Customers
- [ ] Open Customers page
- [ ] Verify customers list loads
- [ ] Add a new customer
- [ ] Edit existing customer
- [ ] Delete a customer
- [ ] Search for customers
- [ ] Export customers

#### 3. Products
- [ ] Open Products page
- [ ] Verify products list loads
- [ ] Add a new product
- [ ] Edit existing product
- [ ] Delete a product
- [ ] Search for products
- [ ] Check low stock alerts

#### 4. Transactions
- [ ] Open Transactions page
- [ ] Verify transactions list loads
- [ ] Filter by date range
- [ ] Filter by type
- [ ] Filter by status
- [ ] Search transactions
- [ ] Delete a transaction

#### 5. Suppliers
- [ ] Open Suppliers page
- [ ] Verify suppliers list loads
- [ ] Add a new supplier
- [ ] Edit existing supplier
- [ ] Delete a supplier
- [ ] Search suppliers

#### 6. Reports
- [ ] Generate P&L report
- [ ] Generate Sales report
- [ ] Generate Inventory report
- [ ] Export to PDF
- [ ] Verify data is accurate

---

## Troubleshooting

### Issue: "Table does not exist"
**Solution:** Run `/SUPABASE_SCHEMA.sql` to create tables

### Issue: "Row-level security policy"
**Solution:** Run `/FIX_EVERYTHING.sql` to fix RLS policies

### Issue: "No data showing"
**Solution:** 
1. Check browser console for errors
2. Verify RLS policies allow SELECT
3. Check if user is authenticated
4. Verify company_id is set

### Issue: "Cannot create/update data"
**Solution:**
1. Run `/FIX_EVERYTHING.sql`
2. Check INSERT/UPDATE policies
3. Verify user has company_id in profile

### Issue: "Search not working"
**Solution:**
1. Check search query syntax
2. Verify table has indexes
3. Check column names match

---

## Summary Checklist

- [ ] All database utility files created
- [ ] Dashboard connected to Supabase
- [ ] Customers page connected
- [ ] Products page connected
- [ ] Transactions page connected
- [ ] Suppliers page connected
- [ ] Reports page connected
- [ ] All CRUD operations working
- [ ] Search functionality working
- [ ] Loading states implemented
- [ ] Error handling implemented
- [ ] Toast notifications working
- [ ] All tests passed

---

## Next Steps

After connecting all pages:
1. ✅ Test thoroughly
2. ✅ Fix any bugs
3. ✅ Add loading skeletons
4. ✅ Improve error messages
5. ✅ Add empty states
6. ✅ Optimize queries
7. ✅ Add pagination
8. ✅ Deploy to production

---

**🎉 Congratulations! Your app is now fully connected to Supabase!**

**Estimated Time:** 3-4 hours for all pages
**Difficulty:** Medium
**Priority:** HIGH (needed for launch)
