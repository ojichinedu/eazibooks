# 🔧 RLS Error Fix Guide

## Error Message
```
Error creating product: {
  "code": "42501",
  "details": null,
  "hint": null,
  "message": "new row violates row-level security policy for table \"products\""
}
```

## What This Means
This error occurs when Supabase's Row-Level Security (RLS) policies are not configured to allow authenticated users to insert data into the table.

## ✅ Quick Fix (5 Minutes)

### Step 1: Open Supabase SQL Editor
1. Go to your Supabase Dashboard
2. Click on **SQL Editor** in the left sidebar
3. Click **New Query**

### Step 2: Run the Fix Script
1. Open the file: `FIX_ALL_TABLES_RLS.sql` (in the root of your project)
2. Copy ALL the content from that file
3. Paste it into the SQL Editor
4. Click **Run** or press `Ctrl+Enter` (Windows/Linux) or `Cmd+Enter` (Mac)
5. Wait for it to complete (10-30 seconds)

### Step 3: Verify the Fix
You should see output like:
```
✅ RLS POLICIES FIXED FOR ALL TABLES ✅
```

### Step 4: Refresh Your App
1. Go back to your application
2. Hard refresh: `Ctrl+Shift+R` (Windows/Linux) or `Cmd+Shift+R` (Mac)
3. Try creating a product, customer, invoice, etc.
4. It should work now! ✨

## 📋 What Gets Fixed

The script fixes RLS policies for these tables:
- ✅ Companies
- ✅ Profiles
- ✅ Subscriptions
- ✅ Products
- ✅ Customers
- ✅ Suppliers
- ✅ Invoices
- ✅ Invoice Items
- ✅ Transactions
- ✅ Payments
- ✅ Inventory Movements (if exists)
- ✅ Journal Entries (if exists)

## 🔍 Understanding RLS Policies

### What the Fix Does

For each table, we create 4 policies:

1. **INSERT Policy** - Allows creating new records
   - Checks that the data belongs to the user's company
   
2. **SELECT Policy** - Allows reading records
   - Only shows data from the user's company
   
3. **UPDATE Policy** - Allows editing records
   - Only allows editing data from the user's company
   
4. **DELETE Policy** - Allows deleting records
   - Only allows deleting data from the user's company

### Company Isolation

All policies use this check:
```sql
company_id IN (SELECT company_id FROM public.profiles WHERE id = auth.uid())
```

This ensures:
- Users can only see/edit their own company's data
- Multi-tenant data isolation
- Secure data access

## 🚨 Troubleshooting

### If the error persists:

1. **Check if RLS is enabled:**
   ```sql
   SELECT tablename, rowsecurity 
   FROM pg_tables 
   WHERE schemaname = 'public' 
   AND tablename IN ('products', 'customers', 'invoices', 'transactions');
   ```
   All should show `rowsecurity = true`

2. **Verify policies exist:**
   ```sql
   SELECT tablename, policyname, cmd
   FROM pg_policies
   WHERE tablename IN ('products', 'customers', 'invoices', 'transactions')
   ORDER BY tablename, cmd;
   ```

3. **Check if user has company_id:**
   ```sql
   SELECT id, email, company_id 
   FROM public.profiles 
   WHERE id = auth.uid();
   ```
   If `company_id` is NULL, user needs to create a company first.

4. **Make sure user is authenticated:**
   - Check if user is logged in
   - Try logging out and back in

## 💡 Prevention

To avoid this in the future:

1. Always run the RLS fix script after creating new tables
2. Test with an authenticated user, not anonymous
3. Ensure users create a company before using the app
4. Check Supabase logs for detailed error messages

## 📞 Still Having Issues?

If you're still seeing RLS errors:

1. Check Supabase Dashboard → Authentication → Users
   - Make sure your user exists
   
2. Check Supabase Dashboard → Table Editor → profiles
   - Verify your user has a `company_id`
   
3. Check Supabase Dashboard → Table Editor → companies
   - Verify the company exists
   
4. Try creating a company first:
   - Go to Settings → Company Settings
   - Fill in company details
   - Save
   - Then try creating products/invoices again

## 🎯 Success Indicators

You'll know it's fixed when:
- ✅ No more "violates row-level security policy" errors
- ✅ Can create products, customers, invoices, etc.
- ✅ Can save company settings
- ✅ Can view and edit all your data
- ✅ Other users can't see your data (multi-tenant isolation works)

---

**Last Updated:** November 5, 2025  
**Script File:** `FIX_ALL_TABLES_RLS.sql`
