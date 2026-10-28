# 🚀 EaziBook Supabase Setup Instructions

## Critical: Your Database Schema Is Not Set Up Yet!

The "connection unsuccessful" and "failed to fetch" errors occur because your Supabase project needs the database tables configured.

## ✅ Step-by-Step Setup Process

### Step 1: Access Supabase SQL Editor

1. Go to your Supabase Dashboard: https://supabase.com/dashboard
2. Select your project: **wdhlaysialpsxnmbrzjx**
3. Click on the **"SQL Editor"** icon in the left sidebar (looks like a database icon)

### Step 2: Run the Complete Database Schema

1. In the SQL Editor, click **"New Query"**
2. **Copy the ENTIRE contents** of the file `/SUPABASE_SCHEMA.sql` in this project
3. **Paste it** into the SQL Editor
4. Click **"Run"** or press `Ctrl/Cmd + Enter`
5. Wait for the execution to complete (should take 10-30 seconds)

You should see success messages indicating:
- ✅ Extensions enabled
- ✅ Tables created
- ✅ Indexes created
- ✅ RLS policies enabled
- ✅ Functions and triggers created

### Step 3: Configure Authentication Settings

1. In your Supabase Dashboard, go to **Authentication** → **Providers**
2. Enable **Email** provider (should be enabled by default)
3. Configure these settings:
   - ✅ **Enable Email Signup**: ON
   - ✅ **Enable Email Confirmations**: OFF (for development, enable for production)
   - ✅ **Enable Email OTP**: Optional
   
4. Go to **Authentication** → **URL Configuration**
5. Add your site URL (for development, it's automatically handled)

### Step 4: Set Up Row Level Security (RLS) Policies

The schema includes RLS policies, but you may need to add policies for all tables. Run this additional SQL:

```sql
-- Complete RLS Policies for All Tables

-- Suppliers
CREATE POLICY "Company isolation for suppliers" ON public.suppliers FOR ALL
USING (company_id IN (SELECT company_id FROM public.profiles WHERE id = auth.uid()));

-- Products
CREATE POLICY "Company isolation for products" ON public.products FOR ALL
USING (company_id IN (SELECT company_id FROM public.profiles WHERE id = auth.uid()));

-- Employees
CREATE POLICY "Company isolation for employees" ON public.employees FOR ALL
USING (company_id IN (SELECT company_id FROM public.profiles WHERE id = auth.uid()));

-- Invoices
CREATE POLICY "Company isolation for invoices" ON public.invoices FOR ALL
USING (company_id IN (SELECT company_id FROM public.profiles WHERE id = auth.uid()));

-- Invoice Items
CREATE POLICY "Company isolation for invoice_items" ON public.invoice_items FOR ALL
USING (invoice_id IN (SELECT id FROM public.invoices WHERE company_id IN (SELECT company_id FROM public.profiles WHERE id = auth.uid())));

-- Bills
CREATE POLICY "Company isolation for bills" ON public.bills FOR ALL
USING (company_id IN (SELECT company_id FROM public.profiles WHERE id = auth.uid()));

-- Bill Items
CREATE POLICY "Company isolation for bill_items" ON public.bill_items FOR ALL
USING (bill_id IN (SELECT id FROM public.bills WHERE company_id IN (SELECT company_id FROM public.profiles WHERE id = auth.uid())));

-- Payments
CREATE POLICY "Company isolation for payments" ON public.payments FOR ALL
USING (company_id IN (SELECT company_id FROM public.profiles WHERE id = auth.uid()));

-- Transactions
CREATE POLICY "Company isolation for transactions" ON public.transactions FOR ALL
USING (company_id IN (SELECT company_id FROM public.profiles WHERE id = auth.uid()));

-- Chart of Accounts
CREATE POLICY "Company isolation for chart_of_accounts" ON public.chart_of_accounts FOR ALL
USING (company_id IN (SELECT company_id FROM public.profiles WHERE id = auth.uid()));

-- Journal Entries
CREATE POLICY "Company isolation for journal_entries" ON public.journal_entries FOR ALL
USING (company_id IN (SELECT company_id FROM public.profiles WHERE id = auth.uid()));

-- Journal Entry Lines
CREATE POLICY "Company isolation for journal_entry_lines" ON public.journal_entry_lines FOR ALL
USING (journal_entry_id IN (SELECT id FROM public.journal_entries WHERE company_id IN (SELECT company_id FROM public.profiles WHERE id = auth.uid())));

-- Inventory Movements
CREATE POLICY "Company isolation for inventory_movements" ON public.inventory_movements FOR ALL
USING (company_id IN (SELECT company_id FROM public.profiles WHERE id = auth.uid()));

-- Payroll Runs
CREATE POLICY "Company isolation for payroll_runs" ON public.payroll_runs FOR ALL
USING (company_id IN (SELECT company_id FROM public.profiles WHERE id = auth.uid()));

-- Payroll Items
CREATE POLICY "Company isolation for payroll_items" ON public.payroll_items FOR ALL
USING (payroll_run_id IN (SELECT id FROM public.payroll_runs WHERE company_id IN (SELECT company_id FROM public.profiles WHERE id = auth.uid())));

-- Tax Returns
CREATE POLICY "Company isolation for tax_returns" ON public.tax_returns FOR ALL
USING (company_id IN (SELECT company_id FROM public.profiles WHERE id = auth.uid()));

-- Notifications
CREATE POLICY "User isolation for notifications" ON public.notifications FOR ALL
USING (user_id = auth.uid());

-- Activity Log
CREATE POLICY "Company isolation for activity_log" ON public.activity_log FOR ALL
USING (company_id IN (SELECT company_id FROM public.profiles WHERE id = auth.uid()));

-- Attachments
CREATE POLICY "Company isolation for attachments" ON public.attachments FOR ALL
USING (company_id IN (SELECT company_id FROM public.profiles WHERE id = auth.uid()));

-- Subscriptions
CREATE POLICY "User can view their subscription" ON public.subscriptions FOR SELECT
USING (user_id = auth.uid() OR company_id IN (SELECT company_id FROM public.profiles WHERE id = auth.uid()));

CREATE POLICY "User can update their subscription" ON public.subscriptions FOR UPDATE
USING (user_id = auth.uid());

-- Companies policies for insert and update
CREATE POLICY "Users can insert their company" ON public.companies FOR INSERT
WITH CHECK (true);

CREATE POLICY "Users can update their company" ON public.companies FOR UPDATE
USING (id IN (SELECT company_id FROM public.profiles WHERE id = auth.uid()));

-- Profiles insert policy
CREATE POLICY "Users can insert their profile" ON public.profiles FOR INSERT
WITH CHECK (auth.uid() = id);
```

### Step 5: Create Profile Trigger (Important!)

This automatically creates a profile when a user signs up:

```sql
-- Function to create profile on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name)
  VALUES (NEW.id, NEW.email, NEW.raw_user_meta_data->>'full_name');
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to call function on user creation
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
```

### Step 6: Verify Setup

Run this query to verify tables were created:

```sql
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
ORDER BY table_name;
```

You should see all these tables:
- activity_log
- attachments
- bill_items
- bills
- chart_of_accounts
- companies
- customers
- employees
- inventory_movements
- invoice_items
- invoices
- journal_entries
- journal_entry_lines
- notifications
- payroll_items
- payroll_runs
- payments
- products
- profiles
- subscriptions
- suppliers
- tax_returns
- transactions

### Step 7: Test Your Application

1. Refresh your EaziBook application
2. Try to **Sign Up** with a new account
3. The errors should now be resolved!

## 🔧 Troubleshooting

### If you still get "failed to fetch" errors:

1. **Check Supabase Project Status**: Ensure your project is active and not paused
2. **Verify API Keys**: Make sure the keys in `/utils/supabase/info.tsx` match your project
3. **Check Browser Console**: Look for specific error messages
4. **Clear Browser Cache**: Sometimes cached data causes issues
5. **Check RLS Policies**: Ensure all policies are created correctly

### If authentication fails:

1. Go to **Authentication** → **Settings** in Supabase Dashboard
2. Ensure **Enable Email Signup** is ON
3. For development, turn OFF **Confirm Email**

### If data operations fail:

1. Check that RLS policies are correctly set up
2. Verify the user has a profile in the `profiles` table
3. Check that the profile has a `company_id` set

## 🎉 Next Steps

Once setup is complete:

1. ✅ Sign up for a new account
2. ✅ Complete company settings
3. ✅ Create your first invoice
4. ✅ Test billing functionality
5. ✅ Explore all ERP features

## 📞 Need Help?

If you encounter issues:
1. Check the browser console for detailed error messages
2. Check the Supabase Dashboard → Logs for server-side errors
3. Verify all SQL scripts ran successfully without errors

---

**Note**: The AI features (OCR Scanner and Chatbot) require Edge Functions to be deployed separately with OpenAI API keys. They will show helpful error messages until configured.
