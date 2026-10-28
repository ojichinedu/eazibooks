-- =====================================================
-- EaziBook - Complete RLS Policies and Triggers
-- Run this AFTER running SUPABASE_SCHEMA.sql
-- =====================================================

-- =====================================================
-- 1. COMPLETE RLS POLICIES FOR ALL TABLES
-- =====================================================

-- Drop existing policies if they exist to avoid conflicts
DROP POLICY IF EXISTS "Company isolation" ON public.customers;
DROP POLICY IF EXISTS "Company isolation for suppliers" ON public.suppliers;
DROP POLICY IF EXISTS "Company isolation for products" ON public.products;
DROP POLICY IF EXISTS "Company isolation for employees" ON public.employees;
DROP POLICY IF EXISTS "Company isolation for invoices" ON public.invoices;
DROP POLICY IF EXISTS "Company isolation for invoice_items" ON public.invoice_items;
DROP POLICY IF EXISTS "Company isolation for bills" ON public.bills;
DROP POLICY IF EXISTS "Company isolation for bill_items" ON public.bill_items;
DROP POLICY IF EXISTS "Company isolation for payments" ON public.payments;
DROP POLICY IF EXISTS "Company isolation for transactions" ON public.transactions;
DROP POLICY IF EXISTS "Company isolation for chart_of_accounts" ON public.chart_of_accounts;
DROP POLICY IF EXISTS "Company isolation for journal_entries" ON public.journal_entries;
DROP POLICY IF EXISTS "Company isolation for journal_entry_lines" ON public.journal_entry_lines;
DROP POLICY IF EXISTS "Company isolation for inventory_movements" ON public.inventory_movements;
DROP POLICY IF EXISTS "Company isolation for payroll_runs" ON public.payroll_runs;
DROP POLICY IF EXISTS "Company isolation for payroll_items" ON public.payroll_items;
DROP POLICY IF EXISTS "Company isolation for tax_returns" ON public.tax_returns;
DROP POLICY IF EXISTS "User isolation for notifications" ON public.notifications;
DROP POLICY IF EXISTS "Company isolation for activity_log" ON public.activity_log;
DROP POLICY IF EXISTS "Company isolation for attachments" ON public.attachments;

-- Customers
CREATE POLICY "Company isolation for customers" ON public.customers FOR ALL
USING (company_id IN (SELECT company_id FROM public.profiles WHERE id = auth.uid()))
WITH CHECK (company_id IN (SELECT company_id FROM public.profiles WHERE id = auth.uid()));

-- Suppliers
CREATE POLICY "Company isolation for suppliers" ON public.suppliers FOR ALL
USING (company_id IN (SELECT company_id FROM public.profiles WHERE id = auth.uid()))
WITH CHECK (company_id IN (SELECT company_id FROM public.profiles WHERE id = auth.uid()));

-- Products
CREATE POLICY "Company isolation for products" ON public.products FOR ALL
USING (company_id IN (SELECT company_id FROM public.profiles WHERE id = auth.uid()))
WITH CHECK (company_id IN (SELECT company_id FROM public.profiles WHERE id = auth.uid()));

-- Employees
CREATE POLICY "Company isolation for employees" ON public.employees FOR ALL
USING (company_id IN (SELECT company_id FROM public.profiles WHERE id = auth.uid()))
WITH CHECK (company_id IN (SELECT company_id FROM public.profiles WHERE id = auth.uid()));

-- Invoices
CREATE POLICY "Company isolation for invoices" ON public.invoices FOR ALL
USING (company_id IN (SELECT company_id FROM public.profiles WHERE id = auth.uid()))
WITH CHECK (company_id IN (SELECT company_id FROM public.profiles WHERE id = auth.uid()));

-- Invoice Items
CREATE POLICY "Company isolation for invoice_items" ON public.invoice_items FOR ALL
USING (invoice_id IN (SELECT id FROM public.invoices WHERE company_id IN (SELECT company_id FROM public.profiles WHERE id = auth.uid())))
WITH CHECK (invoice_id IN (SELECT id FROM public.invoices WHERE company_id IN (SELECT company_id FROM public.profiles WHERE id = auth.uid())));

-- Bills
CREATE POLICY "Company isolation for bills" ON public.bills FOR ALL
USING (company_id IN (SELECT company_id FROM public.profiles WHERE id = auth.uid()))
WITH CHECK (company_id IN (SELECT company_id FROM public.profiles WHERE id = auth.uid()));

-- Bill Items
CREATE POLICY "Company isolation for bill_items" ON public.bill_items FOR ALL
USING (bill_id IN (SELECT id FROM public.bills WHERE company_id IN (SELECT company_id FROM public.profiles WHERE id = auth.uid())))
WITH CHECK (bill_id IN (SELECT id FROM public.bills WHERE company_id IN (SELECT company_id FROM public.profiles WHERE id = auth.uid())));

-- Payments
CREATE POLICY "Company isolation for payments" ON public.payments FOR ALL
USING (company_id IN (SELECT company_id FROM public.profiles WHERE id = auth.uid()))
WITH CHECK (company_id IN (SELECT company_id FROM public.profiles WHERE id = auth.uid()));

-- Transactions
CREATE POLICY "Company isolation for transactions" ON public.transactions FOR ALL
USING (company_id IN (SELECT company_id FROM public.profiles WHERE id = auth.uid()))
WITH CHECK (company_id IN (SELECT company_id FROM public.profiles WHERE id = auth.uid()));

-- Chart of Accounts
CREATE POLICY "Company isolation for chart_of_accounts" ON public.chart_of_accounts FOR ALL
USING (company_id IN (SELECT company_id FROM public.profiles WHERE id = auth.uid()))
WITH CHECK (company_id IN (SELECT company_id FROM public.profiles WHERE id = auth.uid()));

-- Journal Entries
CREATE POLICY "Company isolation for journal_entries" ON public.journal_entries FOR ALL
USING (company_id IN (SELECT company_id FROM public.profiles WHERE id = auth.uid()))
WITH CHECK (company_id IN (SELECT company_id FROM public.profiles WHERE id = auth.uid()));

-- Journal Entry Lines
CREATE POLICY "Company isolation for journal_entry_lines" ON public.journal_entry_lines FOR ALL
USING (journal_entry_id IN (SELECT id FROM public.journal_entries WHERE company_id IN (SELECT company_id FROM public.profiles WHERE id = auth.uid())))
WITH CHECK (journal_entry_id IN (SELECT id FROM public.journal_entries WHERE company_id IN (SELECT company_id FROM public.profiles WHERE id = auth.uid())));

-- Inventory Movements
CREATE POLICY "Company isolation for inventory_movements" ON public.inventory_movements FOR ALL
USING (company_id IN (SELECT company_id FROM public.profiles WHERE id = auth.uid()))
WITH CHECK (company_id IN (SELECT company_id FROM public.profiles WHERE id = auth.uid()));

-- Payroll Runs
CREATE POLICY "Company isolation for payroll_runs" ON public.payroll_runs FOR ALL
USING (company_id IN (SELECT company_id FROM public.profiles WHERE id = auth.uid()))
WITH CHECK (company_id IN (SELECT company_id FROM public.profiles WHERE id = auth.uid()));

-- Payroll Items
CREATE POLICY "Company isolation for payroll_items" ON public.payroll_items FOR ALL
USING (payroll_run_id IN (SELECT id FROM public.payroll_runs WHERE company_id IN (SELECT company_id FROM public.profiles WHERE id = auth.uid())))
WITH CHECK (payroll_run_id IN (SELECT id FROM public.payroll_runs WHERE company_id IN (SELECT company_id FROM public.profiles WHERE id = auth.uid())));

-- Tax Returns
CREATE POLICY "Company isolation for tax_returns" ON public.tax_returns FOR ALL
USING (company_id IN (SELECT company_id FROM public.profiles WHERE id = auth.uid()))
WITH CHECK (company_id IN (SELECT company_id FROM public.profiles WHERE id = auth.uid()));

-- Notifications
CREATE POLICY "User isolation for notifications" ON public.notifications FOR ALL
USING (user_id = auth.uid())
WITH CHECK (user_id = auth.uid());

-- Activity Log
CREATE POLICY "Company isolation for activity_log" ON public.activity_log FOR ALL
USING (company_id IN (SELECT company_id FROM public.profiles WHERE id = auth.uid()))
WITH CHECK (company_id IN (SELECT company_id FROM public.profiles WHERE id = auth.uid()));

-- Attachments
CREATE POLICY "Company isolation for attachments" ON public.attachments FOR ALL
USING (company_id IN (SELECT company_id FROM public.profiles WHERE id = auth.uid()))
WITH CHECK (company_id IN (SELECT company_id FROM public.profiles WHERE id = auth.uid()));

-- Subscriptions (more permissive for initial creation)
DROP POLICY IF EXISTS "User can view their subscription" ON public.subscriptions;
DROP POLICY IF EXISTS "User can update their subscription" ON public.subscriptions;
DROP POLICY IF EXISTS "User can insert their subscription" ON public.subscriptions;

CREATE POLICY "User can view their subscription" ON public.subscriptions FOR SELECT
USING (user_id = auth.uid() OR company_id IN (SELECT company_id FROM public.profiles WHERE id = auth.uid()));

CREATE POLICY "User can insert their subscription" ON public.subscriptions FOR INSERT
WITH CHECK (user_id = auth.uid());

CREATE POLICY "User can update their subscription" ON public.subscriptions FOR UPDATE
USING (user_id = auth.uid())
WITH CHECK (user_id = auth.uid());

-- Companies policies
DROP POLICY IF EXISTS "Users can view their company data" ON public.companies;
DROP POLICY IF EXISTS "Users can insert their company" ON public.companies;
DROP POLICY IF EXISTS "Users can update their company" ON public.companies;

CREATE POLICY "Users can view their company data" ON public.companies FOR SELECT
TO authenticated
USING (id IN (SELECT company_id FROM public.profiles WHERE id = auth.uid()));

CREATE POLICY "Users can insert their company" ON public.companies FOR INSERT
TO authenticated
WITH CHECK (true);

CREATE POLICY "Users can update their company" ON public.companies FOR UPDATE
TO authenticated
USING (id IN (SELECT company_id FROM public.profiles WHERE id = auth.uid()))
WITH CHECK (id IN (SELECT company_id FROM public.profiles WHERE id = auth.uid()));

-- Profiles insert policy
DROP POLICY IF EXISTS "Users can insert their profile" ON public.profiles;

CREATE POLICY "Users can insert their profile" ON public.profiles FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = id);

-- =====================================================
-- 2. PROFILE CREATION TRIGGER
-- =====================================================

-- Function to create profile on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name)
  VALUES (NEW.id, NEW.email, NEW.raw_user_meta_data->>'full_name')
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Drop existing trigger if it exists
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

-- Create trigger to call function on user creation
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- =====================================================
-- 3. ADDITIONAL UPDATE TRIGGERS
-- =====================================================

-- Add update triggers for all tables with updated_at field

CREATE TRIGGER update_subscriptions_updated_at
    BEFORE UPDATE ON public.subscriptions
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_customers_updated_at
    BEFORE UPDATE ON public.customers
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_suppliers_updated_at
    BEFORE UPDATE ON public.suppliers
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_products_updated_at
    BEFORE UPDATE ON public.products
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_employees_updated_at
    BEFORE UPDATE ON public.employees
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_invoices_updated_at
    BEFORE UPDATE ON public.invoices
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_bills_updated_at
    BEFORE UPDATE ON public.bills
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_payments_updated_at
    BEFORE UPDATE ON public.payments
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_transactions_updated_at
    BEFORE UPDATE ON public.transactions
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_chart_of_accounts_updated_at
    BEFORE UPDATE ON public.chart_of_accounts
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_journal_entries_updated_at
    BEFORE UPDATE ON public.journal_entries
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_payroll_runs_updated_at
    BEFORE UPDATE ON public.payroll_runs
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_tax_returns_updated_at
    BEFORE UPDATE ON public.tax_returns
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- =====================================================
-- 4. HELPER FUNCTIONS
-- =====================================================

-- Function to get user's company_id
CREATE OR REPLACE FUNCTION get_user_company_id()
RETURNS UUID AS $$
BEGIN
  RETURN (SELECT company_id FROM public.profiles WHERE id = auth.uid());
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to check if user has permission to access company data
CREATE OR REPLACE FUNCTION user_has_company_access(check_company_id UUID)
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE id = auth.uid() AND company_id = check_company_id
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =====================================================
-- 5. VERIFICATION
-- =====================================================

-- Verify all tables exist
DO $$
DECLARE
  table_count INTEGER;
BEGIN
  SELECT COUNT(*) INTO table_count
  FROM information_schema.tables 
  WHERE table_schema = 'public' 
  AND table_type = 'BASE TABLE';
  
  RAISE NOTICE 'Total tables created: %', table_count;
END $$;

-- Verify RLS is enabled
DO $$
DECLARE
  rls_count INTEGER;
BEGIN
  SELECT COUNT(*) INTO rls_count
  FROM pg_tables 
  WHERE schemaname = 'public' 
  AND rowsecurity = true;
  
  RAISE NOTICE 'Tables with RLS enabled: %', rls_count;
END $$;

-- =====================================================
-- END OF RLS POLICIES AND TRIGGERS
-- =====================================================

RAISE NOTICE '✅ All RLS policies and triggers have been successfully created!';
RAISE NOTICE '✅ Your EaziBook database is now ready to use!';
