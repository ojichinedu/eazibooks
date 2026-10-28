# 📊 SQL Script Execution Guide

## 🎯 CRITICAL: This Must Be Done to Fix RLS Errors

---

## 📍 Step-by-Step Visual Guide

### Step 1: Access Supabase Dashboard
```
1. Open your browser
2. Navigate to: https://supabase.com/dashboard
3. Click on your EaziBook project
```

### Step 2: Open SQL Editor
```
Left Sidebar Navigation:
├── Home
├── Table Editor
├── Authentication
├── Storage
├── Functions
├── Logs
└── 🎯 SQL Editor ← CLICK HERE
```

### Step 3: Create New Query
```
In SQL Editor:
┌─────────────────────────────┐
│ [+ New query]  ← CLICK THIS │
└─────────────────────────────┘
```

### Step 4: Copy the SQL Script
```
In your project files:
📁 Project Root
  ├── 📁 components
  ├── 📁 utils
  ├── App.tsx
  └── 📄 COMPLETE_RLS_AND_SETUP_FIX.sql ← THIS FILE

Actions:
1. Open COMPLETE_RLS_AND_SETUP_FIX.sql
2. Select ALL (Ctrl+A or Cmd+A)
3. Copy (Ctrl+C or Cmd+C)
```

### Step 5: Paste and Execute
```
In Supabase SQL Editor:
┌──────────────────────────────────────────┐
│                                          │
│  [Paste your SQL script here]           │
│                                          │
│  BEGIN;                                  │
│  -- Your 527 lines of SQL...            │
│  COMMIT;                                 │
│                                          │
└──────────────────────────────────────────┘
         ▼
    [▶ Run] ← CLICK THIS BUTTON
    or press Ctrl+Enter / Cmd+Enter
```

### Step 6: Wait for Completion
```
⏱️ Execution time: 30-60 seconds

Progress indicator:
┌────────────────────────────┐
│ ⟳ Running query...         │
└────────────────────────────┘

Then:
┌────────────────────────────┐
│ ✅ Query completed         │
└────────────────────────────┘
```

### Step 7: Verify Success
```
Check the Results panel for:

======================================
✅✅✅ ALL FIXES APPLIED! ✅✅✅
======================================

User Setup:
  User ID: [your-user-id]
  Profile exists: true
  Company ID: [your-company-id]
  Company exists: true

RLS Policies Fixed:
  ✅ Companies
  ✅ Profiles
  ✅ Subscriptions
  ✅ Products
  ✅ Customers
  ✅ Suppliers
  ✅ Invoices
  ✅ Invoice Items
  ✅ Transactions
  ✅ Payments

Next Steps:
1. Refresh your browser (Ctrl+Shift+R)
2. Try creating a product - should work!
3. Try creating an invoice - should work!
4. Try creating a customer - should work!
```

### Step 8: Verify Policy Creation
```
You should also see a table at the bottom:

┌──────────────┬──────────────┐
│ tablename    │ policy_count │
├──────────────┼──────────────┤
│ companies    │ 4            │
│ customers    │ 4            │
│ invoices     │ 4            │
│ invoice_items│ 4            │
│ payments     │ 4            │
│ products     │ 4            │
│ profiles     │ 3            │
│ subscriptions│ 3            │
│ suppliers    │ 4            │
│ transactions │ 4            │
└──────────────┴──────────────┘

✅ This confirms all policies were created!
```

### Step 9: Refresh Your Application
```
In your EaziBook application:

Windows/Linux:
  Press: Ctrl + Shift + R

Mac:
  Press: Cmd + Shift + R

This performs a "hard refresh" that clears cache.
```

### Step 10: Test the Fix
```
Test 1: Create a Product
┌────────────────────────────────┐
│ Products & Services            │
│   [+ Add Product]              │
│                                │
│   Name: Test Product           │
│   SKU: TEST-001                │
│   Price: 1000                  │
│   [Add to Catalog]             │
└────────────────────────────────┘

Expected: ✅ Success (no RLS error)
```

---

## ⚠️ Common Issues & Solutions

### Issue: "Permission Denied" Error
**Solution:** You must be the project owner or have admin access.

### Issue: Script Doesn't Run
**Solution:** 
1. Make sure you copied ALL 527 lines
2. Don't modify the script
3. Run it exactly as provided

### Issue: Still Getting RLS Errors
**Solution:**
1. Hard refresh browser (Ctrl+Shift+R)
2. Log out and log back in
3. Clear browser cache
4. Check if script actually ran (check Query History)

### Issue: Some Policies Missing
**Solution:**
1. Re-run the script (it's safe to run multiple times)
2. The script drops old policies first, then creates new ones

---

## 🔍 How to Check if Policies Exist

### Method 1: Via Supabase UI
```
1. Go to: Database → Tables
2. Click on: products
3. Click tab: "Policies"
4. Should see 4 policies:
   - allow_insert_product
   - allow_select_product
   - allow_update_product
   - allow_delete_product
```

### Method 2: Via SQL Query
```sql
-- Run this query to check policies
SELECT 
  tablename,
  policyname
FROM pg_policies
WHERE schemaname = 'public'
  AND tablename = 'products';
```

Expected output:
```
tablename | policyname
----------|------------------
products  | allow_insert_product
products  | allow_select_product
products  | allow_update_product
products  | allow_delete_product
```

---

## 📝 What This Script Does

### 1. User & Company Setup
- Checks if your user has a profile
- Creates a company if you don't have one
- Links your profile to the company

### 2. RLS Policy Creation
For each table, creates 4 policies:
- **INSERT:** Allow inserting records for your company
- **SELECT:** Allow viewing records from your company
- **UPDATE:** Allow updating records from your company
- **DELETE:** Allow deleting records from your company

### 3. Security Enforcement
- Ensures data isolation between companies
- Prevents unauthorized access to other companies' data
- Maintains data security and privacy

---

## ✅ Success Checklist

Before you finish, verify:

- [ ] SQL script executed without errors
- [ ] Saw "ALL FIXES APPLIED" message
- [ ] Policy count table shows policies for all tables
- [ ] Hard refreshed your application
- [ ] Can create a product without RLS error
- [ ] Can create a supplier without RLS error
- [ ] No NaN warnings in browser console
- [ ] Stats cards show numbers (not NaN)

If all checkboxes are ✅, you're done!

---

## 🎉 You're All Set!

After completing these steps:
1. RLS errors will be GONE ✅
2. NaN warnings will be GONE ✅
3. Your app will work normally ✅
4. You can create products, suppliers, customers, invoices ✅
5. Data security is properly enforced ✅

---

**Questions?** See `/FIX_INSTRUCTIONS.md` for detailed troubleshooting.

**Ready?** Go to Supabase now and run that SQL script! 🚀
