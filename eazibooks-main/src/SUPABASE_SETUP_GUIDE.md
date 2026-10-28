# Supabase Setup Guide for EaziBook
## Complete Database Configuration Instructions

**Version:** 1.0  
**Last Updated:** January 28, 2025  
**Estimated Setup Time:** 30-45 minutes

---

## Table of Contents
1. [Prerequisites](#prerequisites)
2. [Supabase Project Setup](#supabase-project-setup)
3. [Database Schema Implementation](#database-schema-implementation)
4. [Row Level Security Configuration](#row-level-security-configuration)
5. [Environment Variables](#environment-variables)
6. [Testing the Connection](#testing-the-connection)
7. [Seeding Initial Data](#seeding-initial-data)
8. [Backup Strategy](#backup-strategy)
9. [Troubleshooting](#troubleshooting)

---

## Prerequisites

Before you begin, ensure you have:

- [ ] A Supabase account (sign up at https://supabase.com)
- [ ] Node.js 18+ installed
- [ ] Access to your EaziBook project codebase
- [ ] Basic understanding of SQL
- [ ] Git installed (for version control)

---

## Supabase Project Setup

### Step 1: Create a New Supabase Project

1. Go to https://app.supabase.com
2. Click "New Project"
3. Fill in the details:
   - **Name:** `EaziBook-Production` (or your preferred name)
   - **Database Password:** Generate a strong password and **save it securely**
   - **Region:** Select the region closest to your users (e.g., `West Africa` if available)
   - **Pricing Plan:** Start with Free tier, upgrade as needed

4. Click "Create new project"
5. Wait 2-3 minutes for the project to be provisioned

### Step 2: Access Project Settings

1. Once created, go to **Settings** > **API**
2. Note down these important values:
   ```
   Project URL: https://xxxxxxxxxxxxx.supabase.co
   Project API Key (anon/public): eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
   Project API Key (service_role): eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9... (KEEP SECRET)
   ```

3. **IMPORTANT:** Store these in a secure password manager

---

## Database Schema Implementation

### Option 1: Using Supabase SQL Editor (Recommended)

1. In your Supabase project dashboard, go to **SQL Editor**
2. Click "New Query"
3. Copy the entire contents of `/SUPABASE_SCHEMA.sql` from your project
4. Paste it into the SQL Editor
5. Click "Run" (or press Ctrl/Cmd + Enter)
6. Wait for execution to complete (should take 30-60 seconds)
7. Verify success: Check "Table Editor" - you should see all 20+ tables

### Option 2: Using Command Line (Alternative)

```bash
# Install Supabase CLI
npm install -g supabase

# Login to Supabase
supabase login

# Link your project
supabase link --project-ref <your-project-ref>

# Run the schema
psql -h db.<your-project-ref>.supabase.co -U postgres -d postgres -f SUPABASE_SCHEMA.sql
```

### Verification Steps

After running the schema, verify the following tables exist:

**Core Tables:**
- [ ] profiles
- [ ] companies
- [ ] subscriptions

**Business Entities:**
- [ ] customers
- [ ] suppliers
- [ ] products
- [ ] employees

**Transactions:**
- [ ] invoices
- [ ] invoice_items
- [ ] bills
- [ ] bill_items
- [ ] payments
- [ ] transactions

**Accounting:**
- [ ] chart_of_accounts
- [ ] journal_entries
- [ ] journal_entry_lines

**Other:**
- [ ] inventory_movements
- [ ] payroll_runs
- [ ] payroll_items
- [ ] tax_returns
- [ ] notifications
- [ ] activity_log
- [ ] attachments

---

## Row Level Security Configuration

### Understanding RLS

Row Level Security (RLS) ensures users can only access data belonging to their company. This is critical for multi-tenant security.

### Verify RLS is Enabled

1. Go to **Authentication** > **Policies**
2. For each table, you should see "RLS enabled" ✓
3. If not, run:

```sql
-- Enable RLS on a table
ALTER TABLE public.customers ENABLE ROW LEVEL SECURITY;
```

### Create Additional Policies (If Needed)

The schema includes basic policies. Add more specific ones:

```sql
-- Example: Allow admins to do everything
CREATE POLICY "Admins have full access"
    ON public.customers FOR ALL
    USING (
        EXISTS (
            SELECT 1 FROM public.profiles
            WHERE id = auth.uid()
            AND role = 'admin'
        )
    );

-- Example: Read-only for regular users
CREATE POLICY "Users can view customers"
    ON public.customers FOR SELECT
    USING (
        company_id IN (
            SELECT company_id FROM public.profiles
            WHERE id = auth.uid()
        )
    );
```

### Test RLS

```sql
-- As an authenticated user, try to access data
SELECT * FROM public.customers;

-- Should only return customers for your company
```

---

## Environment Variables

### Create `.env.local` File

In your project root, create `.env.local`:

```env
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=https://xxxxxxxxxxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9... # Keep this secret!

# OpenAI Configuration (for AI features)
OPENAI_API_KEY=sk-proj-xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx

# App Configuration
NEXT_PUBLIC_APP_URL=http://localhost:3000
NODE_ENV=development
```

### Create `.env.example` Template

For version control (DO NOT include actual keys):

```env
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key

# OpenAI Configuration
OPENAI_API_KEY=your_openai_api_key

# App Configuration
NEXT_PUBLIC_APP_URL=http://localhost:3000
NODE_ENV=development
```

### Add to `.gitignore`

Ensure these files are ignored:

```
.env.local
.env.production
.env
```

---

## Testing the Connection

### Create Supabase Client File

Create `/utils/supabase/client.ts`:

```typescript
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
```

### Test Connection

Create a test file `/tests/supabase-connection.test.ts`:

```typescript
import { supabase } from '../utils/supabase/client';

async function testConnection() {
  try {
    // Test 1: Fetch companies
    const { data: companies, error: companiesError } = await supabase
      .from('companies')
      .select('*')
      .limit(5);

    if (companiesError) throw companiesError;
    console.log('✓ Companies table accessible:', companies);

    // Test 2: Fetch customers
    const { data: customers, error: customersError } = await supabase
      .from('customers')
      .select('*')
      .limit(5);

    if (customersError) throw customersError;
    console.log('✓ Customers table accessible:', customers);

    // Test 3: Authentication
    const { data: { user } } = await supabase.auth.getUser();
    console.log('✓ Current user:', user);

    console.log('\n✅ All tests passed!');
  } catch (error) {
    console.error('❌ Test failed:', error);
  }
}

testConnection();
```

Run the test:
```bash
npx ts-node tests/supabase-connection.test.ts
```

---

## Seeding Initial Data

### Create Seed Data Script

Create `/scripts/seed-database.sql`:

```sql
-- Seed script for EaziBook initial data

-- 1. Create a sample company
INSERT INTO public.companies (id, name, email, phone, country, currency)
VALUES (
    '00000000-0000-0000-0000-000000000001',
    'Demo Company Ltd',
    'contact@democompany.com',
    '+234 800 000 0000',
    'Nigeria',
    'NGN'
) ON CONFLICT (id) DO NOTHING;

-- 2. Create chart of accounts (basic structure)
INSERT INTO public.chart_of_accounts (company_id, account_code, account_name, account_type) VALUES
('00000000-0000-0000-0000-000000000001', '1000', 'Assets', 'asset'),
('00000000-0000-0000-0000-000000000001', '1100', 'Cash and Bank', 'asset'),
('00000000-0000-0000-0000-000000000001', '1200', 'Accounts Receivable', 'asset'),
('00000000-0000-0000-0000-000000000001', '2000', 'Liabilities', 'liability'),
('00000000-0000-0000-0000-000000000001', '2100', 'Accounts Payable', 'liability'),
('00000000-0000-0000-0000-000000000001', '3000', 'Equity', 'equity'),
('00000000-0000-0000-0000-000000000001', '4000', 'Revenue', 'revenue'),
('00000000-0000-0000-0000-000000000001', '4100', 'Sales Revenue', 'revenue'),
('00000000-0000-0000-0000-000000000001', '5000', 'Expenses', 'expense'),
('00000000-0000-0000-0000-000000000001', '5100', 'Cost of Goods Sold', 'expense'),
('00000000-0000-0000-0000-000000000001', '5200', 'Operating Expenses', 'expense')
ON CONFLICT (account_code) DO NOTHING;

-- 3. Create sample products
INSERT INTO public.products (company_id, sku, name, description, type, price, cost, stock_quantity) VALUES
('00000000-0000-0000-0000-000000000001', 'PROD-001', 'Sample Product 1', 'Description for product 1', 'product', 15000.00, 10000.00, 100),
('00000000-0000-0000-0000-000000000001', 'SERV-001', 'Consulting Service', 'Professional consulting service', 'service', 50000.00, 0, 0)
ON CONFLICT (sku) DO NOTHING;

-- 4. Create sample customer
INSERT INTO public.customers (company_id, customer_code, name, email, phone, company_name, status) VALUES
('00000000-0000-0000-0000-000000000001', 'CUST-001', 'John Doe', 'john@example.com', '+234 803 000 0000', 'Example Corp', 'active')
ON CONFLICT (customer_code) DO NOTHING;
```

Run the seed script:
1. Go to SQL Editor in Supabase
2. Paste the seed script
3. Click "Run"

---

## Backup Strategy

### Automated Backups (Supabase Pro)

Supabase Pro plan includes:
- Daily automatic backups
- Point-in-time recovery
- 7-day retention

### Manual Backups (Free Plan)

Create a backup script `/scripts/backup-database.sh`:

```bash
#!/bin/bash

# Configuration
PROJECT_REF="your-project-ref"
DATE=$(date +"%Y%m%d_%H%M%S")
BACKUP_DIR="./backups"
BACKUP_FILE="$BACKUP_DIR/eazibook_backup_$DATE.sql"

# Create backup directory
mkdir -p $BACKUP_DIR

# Export database
pg_dump -h db.$PROJECT_REF.supabase.co \
    -U postgres \
    -d postgres \
    --clean --if-exists \
    --no-owner --no-acl \
    > $BACKUP_FILE

# Compress backup
gzip $BACKUP_FILE

echo "Backup completed: $BACKUP_FILE.gz"
```

Schedule weekly backups using cron or Windows Task Scheduler.

---

## Troubleshooting

### Common Issues and Solutions

#### Issue 1: "relation does not exist" Error

**Cause:** Table not created or wrong schema  
**Solution:**
```sql
-- Check if table exists
SELECT table_name FROM information_schema.tables 
WHERE table_schema = 'public';

-- If missing, re-run schema
```

#### Issue 2: RLS Blocking Queries

**Cause:** RLS policies too restrictive  
**Solution:**
```sql
-- Temporarily disable RLS for testing (NOT in production!)
ALTER TABLE public.customers DISABLE ROW LEVEL SECURITY;

-- Test your query
SELECT * FROM public.customers;

-- Re-enable RLS
ALTER TABLE public.customers ENABLE ROW LEVEL SECURITY;
```

#### Issue 3: Authentication Errors

**Cause:** User not logged in or token expired  
**Solution:**
```typescript
// Check authentication status
const { data: { session } } = await supabase.auth.getSession();
console.log('Session:', session);

// If null, user needs to log in again
if (!session) {
  await supabase.auth.signInWithPassword({
    email: 'user@example.com',
    password: 'password'
  });
}
```

#### Issue 4: Slow Queries

**Cause:** Missing indexes  
**Solution:**
```sql
-- Add indexes for frequently queried columns
CREATE INDEX idx_invoices_date ON public.invoices(invoice_date);
CREATE INDEX idx_transactions_date ON public.transactions(transaction_date);

-- Analyze query performance
EXPLAIN ANALYZE SELECT * FROM invoices WHERE invoice_date >= '2025-01-01';
```

---

## Next Steps

After completing the setup:

1. [ ] Test all CRUD operations for each table
2. [ ] Configure real-time subscriptions if needed
3. [ ] Set up database triggers for automatic calculations
4. [ ] Implement data validation at database level
5. [ ] Create database functions for complex queries
6. [ ] Set up monitoring and alerting
7. [ ] Document any custom modifications

---

## Additional Resources

- **Supabase Documentation:** https://supabase.com/docs
- **PostgreSQL Documentation:** https://www.postgresql.org/docs/
- **Row Level Security Guide:** https://supabase.com/docs/guides/auth/row-level-security
- **Supabase CLI:** https://supabase.com/docs/guides/cli

---

## Support

If you encounter issues:

1. Check Supabase status: https://status.supabase.com
2. Review Supabase logs in Dashboard > Logs
3. Post in Supabase Discord: https://discord.supabase.com
4. Contact your development team

---

**Document Version:** 1.0  
**Last Updated:** January 28, 2025  
**Maintained By:** LifeisEazi Group Enterprises Development Team
