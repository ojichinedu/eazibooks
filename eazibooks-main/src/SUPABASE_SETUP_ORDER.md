# EaziBook - Supabase Database Setup Order

## ⚠️ IMPORTANT: Run These SQL Files in the Correct Order

Follow these steps **in order** to set up your EaziBook database without errors.

---

## Step 1: Create the Database Schema

**File:** `SUPABASE_SCHEMA.sql`

This creates all the tables, basic indexes, and enables RLS on all tables.

### How to Run:
1. Go to your Supabase Dashboard
2. Click on **SQL Editor** in the left sidebar
3. Click **New Query**
4. Copy and paste the entire contents of `SUPABASE_SCHEMA.sql`
5. Click **Run** or press `Ctrl+Enter`

### Expected Result:
```
✅ All tables created
✅ Basic indexes created
✅ RLS enabled on all tables
✅ Basic triggers created
```

---

## Step 2: Apply RLS Policies

**File:** `SUPABASE_RLS_POLICIES.sql`

This creates comprehensive Row Level Security policies for all tables to ensure data isolation between companies and users.

### How to Run:
1. In the **SQL Editor**, click **New Query**
2. Copy and paste the entire contents of `SUPABASE_RLS_POLICIES.sql`
3. Click **Run**

### Expected Result:
```
✅ All RLS policies created
✅ Profile creation trigger configured
✅ Helper functions created
```

---

## Step 3: Apply Performance Optimizations

**File:** `SUPABASE_OPTIMIZATION.sql`

This creates additional indexes to improve query performance.

### How to Run:
1. In the **SQL Editor**, click **New Query**
2. Copy and paste the entire contents of `SUPABASE_OPTIMIZATION.sql`
3. Click **Run**

### Expected Result:
```
✅ All performance indexes created
✅ Table statistics updated
✅ Database optimized
```

---

## Verification Steps

After running all three files, verify your setup:

### 1. Check Tables
```sql
SELECT 
    table_name,
    (SELECT COUNT(*) FROM information_schema.columns WHERE table_name = t.table_name) as column_count
FROM information_schema.tables t
WHERE table_schema = 'public' 
AND table_type = 'BASE TABLE'
ORDER BY table_name;
```

**Expected:** You should see approximately 20+ tables including:
- profiles
- companies
- subscriptions
- customers
- suppliers
- products
- invoices
- bills
- transactions
- payments
- etc.

### 2. Check RLS Policies
```sql
SELECT 
    schemaname,
    tablename,
    policyname
FROM pg_policies
WHERE schemaname = 'public'
ORDER BY tablename, policyname;
```

**Expected:** Multiple policies for each table

### 3. Check Indexes
```sql
SELECT 
    schemaname,
    tablename,
    indexname
FROM pg_indexes
WHERE schemaname = 'public'
ORDER BY tablename, indexname;
```

**Expected:** Multiple indexes for performance optimization

---

## Common Issues and Solutions

### Issue: "relation already exists"
**Solution:** This is normal if you're re-running the scripts. The `CREATE TABLE IF NOT EXISTS` and `CREATE INDEX IF NOT EXISTS` commands will skip existing objects.

### Issue: "column does not exist"
**Solution:** Make sure you ran `SUPABASE_SCHEMA.sql` first. This creates all the columns.

### Issue: "policy already exists"
**Solution:** The RLS script includes `DROP POLICY IF EXISTS` commands, so re-running should work. If not, manually drop the policies first.

### Issue: "function does not exist"
**Solution:** Make sure the `update_updated_at_column()` function was created in Step 1.

---

## Next Steps

After successfully setting up the database:

1. **Configure Supabase in Your App**
   - Copy your Supabase URL and Anon Key
   - Update the Supabase client configuration in `/utils/supabase/client.ts`

2. **Test Authentication**
   - Try signing up a new user
   - Verify that a profile is automatically created
   - Check that the user can create a company

3. **Test Data Operations**
   - Create a customer
   - Create a product
   - Generate an invoice
   - Verify data isolation (users can only see their own company's data)

---

## Database Architecture Overview

```
auth.users (Supabase Auth)
    ↓
profiles (User profiles, links to companies)
    ↓
companies (Company/tenant data)
    ↓
├── customers
├── suppliers
├── products
├── employees
├── invoices
│   └── invoice_items
├── bills
│   └── bill_items
├── payments
├── transactions
├── subscriptions
└── other business tables
```

---

## Support

If you encounter any issues:

1. Check the Supabase logs in the Dashboard
2. Review the error message carefully
3. Ensure all three SQL files were run in order
4. Verify that your Supabase project has sufficient resources
5. Check that RLS is properly enabled

---

## Maintenance

### Backup Your Database
```sql
-- Use Supabase Dashboard > Database > Backups
-- Or use pg_dump for manual backups
```

### Monitor Performance
```sql
-- Check slow queries
SELECT * FROM pg_stat_statements 
ORDER BY mean_exec_time DESC 
LIMIT 10;
```

### Update Statistics
```sql
-- Run periodically to keep query planner optimized
ANALYZE;
```

---

✅ **Your EaziBook database is now ready to use!**
