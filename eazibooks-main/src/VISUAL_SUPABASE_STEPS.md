# 📸 Visual Step-by-Step: Connect Pages to Supabase

## 🎬 Example: Connecting Customers Page

Follow this exact pattern for ALL pages (Customers, Products, Transactions, Suppliers).

---

## STEP 1: Open the File

```
📂 /components/Customers.tsx
```

---

## STEP 2: Add Imports (TOP of file)

### Find this section (around line 1-20):
```typescript
import { useState } from 'react';
import { Card } from './ui/card';
import { Button } from './ui/button';
// ... other imports
```

### Add BELOW the existing imports:
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
import { Loader2 } from 'lucide-react';
```

---

## STEP 3: Replace Mock Data State

### Find this (usually around line 50-60):
```typescript
const [customers, setCustomers] = useState([
  {
    id: '1',
    name: 'John Doe',
    email: 'john@example.com',
    phone: '+1234567890',
    company_name: 'Acme Corp',
    status: 'active'
  },
  // ... more mock customers
]);
```

### Replace with:
```typescript
const [customers, setCustomers] = useState<Customer[]>([]);
const [loading, setLoading] = useState(true);
```

---

## STEP 4: Add Data Loading Function

### Add this BEFORE the return statement:
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

---

## STEP 5: Update handleAddCustomer Function

### Find this function:
```typescript
const handleAddCustomer = () => {
  // Mock implementation
  setCustomers([...customers, newCustomer]);
  setIsDialogOpen(false);
};
```

### Replace with:
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
      setIsDialogOpen(false);
      setNewCustomer({ 
        name: '', 
        email: '', 
        phone: '', 
        company_name: '',
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

---

## STEP 6: Update handleEditCustomer Function

### Find this function:
```typescript
const handleEditCustomer = () => {
  // Mock implementation
  setCustomers(customers.map(c => 
    c.id === editingCustomer.id ? editingCustomer : c
  ));
  setIsDialogOpen(false);
};
```

### Replace with:
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

---

## STEP 7: Update handleDeleteCustomer Function

### Find this function:
```typescript
const handleDeleteCustomer = (id: string) => {
  setCustomers(customers.filter(c => c.id !== id));
};
```

### Replace with:
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

---

## STEP 8: Update handleSearch Function

### Find this function:
```typescript
const handleSearch = (query: string) => {
  setSearchQuery(query);
  // Filter mock data
  const filtered = customers.filter(c => 
    c.name.includes(query) || c.email.includes(query)
  );
  setFilteredCustomers(filtered);
};
```

### Replace with:
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

---

## STEP 9: Add Loading State to UI

### Find the return statement (usually the last part of the component):
```typescript
return (
  <div className="p-6 space-y-6">
    <h1>Customers</h1>
    {/* ... rest of UI */}
  </div>
);
```

### Add BEFORE the main return:
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

---

## STEP 10: Save and Test

1. **Save the file** (Ctrl+S or Cmd+S)
2. **Go to your app** in browser
3. **Navigate to Customers page**
4. **Check:**
   - ✅ Data loads
   - ✅ Can add customer
   - ✅ Can edit customer
   - ✅ Can delete customer
   - ✅ Can search

---

## 🔄 Repeat for Other Pages

### For Products (`/components/ProductsCatalog.tsx`):

**Just replace these words:**
- `customers` → `products`
- `Customer` → `Product`
- `fetchCustomers` → `fetchProducts`
- `createCustomer` → `createProduct`
- `updateCustomer` → `updateProduct`
- `deleteCustomer` → `deleteProduct`
- `searchCustomers` → `searchProducts`
- `'../utils/database/customers'` → `'../utils/database/products'`

**Same 10 steps, different entity names!**

### For Transactions (`/components/Transactions.tsx`):

**Replace:**
- `customers` → `transactions`
- `Customer` → `Transaction`
- `fetchCustomers` → `fetchTransactions`
- etc.

### For Suppliers (`/components/Suppliers.tsx`):

**Replace:**
- `customers` → `suppliers`
- `Customer` → `Supplier`
- `fetchCustomers` → `fetchSuppliers`
- etc.

---

## 📋 Checklist (Per Page)

Use this for EACH page you update:

### Customers Page
- [ ] Step 1: Opened Customers.tsx
- [ ] Step 2: Added imports
- [ ] Step 3: Replaced mock state
- [ ] Step 4: Added data loading
- [ ] Step 5: Updated handleAdd
- [ ] Step 6: Updated handleEdit
- [ ] Step 7: Updated handleDelete
- [ ] Step 8: Updated handleSearch
- [ ] Step 9: Added loading UI
- [ ] Step 10: Tested in browser
- [ ] ✅ COMPLETE

### Products Page
- [ ] Step 1: Opened ProductsCatalog.tsx
- [ ] Step 2: Added imports
- [ ] Step 3: Replaced mock state
- [ ] Step 4: Added data loading
- [ ] Step 5: Updated handleAdd
- [ ] Step 6: Updated handleEdit
- [ ] Step 7: Updated handleDelete
- [ ] Step 8: Updated handleSearch
- [ ] Step 9: Added loading UI
- [ ] Step 10: Tested in browser
- [ ] ✅ COMPLETE

### Transactions Page
- [ ] Step 1: Opened Transactions.tsx
- [ ] Step 2: Added imports
- [ ] Step 3: Replaced mock state
- [ ] Step 4: Added data loading
- [ ] Step 5: Updated handleAdd (if applicable)
- [ ] Step 6: Updated handleEdit (if applicable)
- [ ] Step 7: Updated handleDelete
- [ ] Step 8: Updated handleSearch
- [ ] Step 9: Added loading UI
- [ ] Step 10: Tested in browser
- [ ] ✅ COMPLETE

### Suppliers Page
- [ ] Step 1: Opened Suppliers.tsx
- [ ] Step 2: Added imports
- [ ] Step 3: Replaced mock state
- [ ] Step 4: Added data loading
- [ ] Step 5: Updated handleAdd
- [ ] Step 6: Updated handleEdit
- [ ] Step 7: Updated handleDelete
- [ ] Step 8: Updated handleSearch
- [ ] Step 9: Added loading UI
- [ ] Step 10: Tested in browser
- [ ] ✅ COMPLETE

---

## 🎯 Common Mistakes to Avoid

### ❌ WRONG:
```typescript
import { fetchCustomers } from '../utils/database/customer'; // Missing 's'
```

### ✅ CORRECT:
```typescript
import { fetchCustomers } from '../utils/database/customers'; // With 's'
```

---

### ❌ WRONG:
```typescript
const loadCustomers = () => {  // Not async
  const data = await fetchCustomers();  // Can't use await!
};
```

### ✅ CORRECT:
```typescript
const loadCustomers = async () => {  // async
  const data = await fetchCustomers();  // Can use await
};
```

---

### ❌ WRONG:
```typescript
const handleAdd = async () => {
  createCustomer(newCustomer);  // Missing await!
  toast.success('Added');  // Shows before actually added!
};
```

### ✅ CORRECT:
```typescript
const handleAdd = async () => {
  const created = await createCustomer(newCustomer);  // Wait for it
  if (created) {
    toast.success('Added');  // Now shows after it's actually added
  }
};
```

---

## 🧪 Test Each Function

After updating a page, test each button:

1. **Add Button:**
   - Click "Add New"
   - Fill in form
   - Click "Save"
   - Should see success toast
   - Should see new item in list

2. **Edit Button:**
   - Click edit icon on an item
   - Change some fields
   - Click "Save"
   - Should see success toast
   - Should see updated data

3. **Delete Button:**
   - Click delete icon
   - Confirm deletion
   - Should see success toast
   - Item should disappear

4. **Search:**
   - Type in search box
   - Results should filter
   - Clear search
   - All items should show again

5. **Refresh:**
   - Refresh browser (F5)
   - Data should still be there
   - Changes should persist

---

## 📊 Progress Tracker

```
Dashboard:      ░░░░░░░░░░ 0%  →  ████████████ 100% ✅
Customers:      ░░░░░░░░░░ 0%  →  ████████████ 100% ✅
Products:       ░░░░░░░░░░ 0%  →  ████████████ 100% ✅
Transactions:   ░░░░░░░░░░ 0%  →  ████████████ 100% ✅
Suppliers:      ░░░░░░░░░░ 0%  →  ████████████ 100% ✅

TOTAL:          0% → 100% in 3-4 hours! 🚀
```

---

**🎉 YOU'VE GOT THIS!**

Follow these exact steps for each page and you'll have everything connected in no time!
