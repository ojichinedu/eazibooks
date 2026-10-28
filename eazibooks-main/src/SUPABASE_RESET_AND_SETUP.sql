-- =====================================================
-- EaziBook - Complete Database Reset and Setup
-- Use this if you're experiencing "column does not exist" errors
-- =====================================================

-- =====================================================
-- STEP 1: DROP ALL EXISTING POLICIES (Safe cleanup)
-- =====================================================

DO $$ 
DECLARE
    r RECORD;
BEGIN
    -- Drop all policies on all tables
    FOR r IN (
        SELECT schemaname, tablename, policyname 
        FROM pg_policies 
        WHERE schemaname = 'public'
    ) LOOP
        EXECUTE format('DROP POLICY IF EXISTS %I ON %I.%I', r.policyname, r.schemaname, r.tablename);
    END LOOP;
END $$;

-- =====================================================
-- STEP 2: DROP ALL EXISTING TABLES (Fresh start)
-- =====================================================

-- Drop tables in reverse order of dependencies
DROP TABLE IF EXISTS public.attachments CASCADE;
DROP TABLE IF EXISTS public.activity_log CASCADE;
DROP TABLE IF EXISTS public.notifications CASCADE;
DROP TABLE IF EXISTS public.tax_returns CASCADE;
DROP TABLE IF EXISTS public.payroll_items CASCADE;
DROP TABLE IF EXISTS public.payroll_runs CASCADE;
DROP TABLE IF EXISTS public.inventory_movements CASCADE;
DROP TABLE IF EXISTS public.journal_entry_lines CASCADE;
DROP TABLE IF EXISTS public.journal_entries CASCADE;
DROP TABLE IF EXISTS public.chart_of_accounts CASCADE;
DROP TABLE IF EXISTS public.transactions CASCADE;
DROP TABLE IF EXISTS public.payments CASCADE;
DROP TABLE IF EXISTS public.bill_items CASCADE;
DROP TABLE IF EXISTS public.bills CASCADE;
DROP TABLE IF EXISTS public.invoice_items CASCADE;
DROP TABLE IF EXISTS public.invoices CASCADE;
DROP TABLE IF EXISTS public.employees CASCADE;
DROP TABLE IF EXISTS public.products CASCADE;
DROP TABLE IF EXISTS public.suppliers CASCADE;
DROP TABLE IF EXISTS public.customers CASCADE;
DROP TABLE IF EXISTS public.subscriptions CASCADE;
DROP TABLE IF EXISTS public.companies CASCADE;
DROP TABLE IF EXISTS public.profiles CASCADE;

-- =====================================================
-- STEP 3: ENABLE EXTENSIONS
-- =====================================================

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- =====================================================
-- STEP 4: CREATE ALL TABLES
-- =====================================================

-- Profiles Table
CREATE TABLE public.profiles (
    id UUID REFERENCES auth.users(id) PRIMARY KEY,
    company_id UUID,
    email TEXT UNIQUE NOT NULL,
    full_name TEXT,
    avatar_url TEXT,
    role TEXT DEFAULT 'user' CHECK (role IN ('admin', 'manager', 'user', 'accountant')),
    phone TEXT,
    is_active BOOLEAN DEFAULT true,
    last_login_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Companies Table
CREATE TABLE public.companies (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    name TEXT NOT NULL,
    email TEXT,
    phone TEXT,
    address TEXT,
    city TEXT,
    state TEXT,
    country TEXT DEFAULT 'Nigeria',
    postal_code TEXT,
    tax_id TEXT,
    registration_number TEXT,
    website TEXT,
    logo_url TEXT,
    currency TEXT DEFAULT 'NGN' CHECK (currency IN ('NGN', 'USD', 'ZAR', 'GHS')),
    fiscal_year_start INTEGER DEFAULT 1 CHECK (fiscal_year_start BETWEEN 1 AND 12),
    default_tax_rate DECIMAL(5, 2) DEFAULT 18.00,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Subscriptions Table
CREATE TABLE public.subscriptions (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    company_id UUID REFERENCES companies(id) ON DELETE CASCADE,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    plan_type TEXT DEFAULT 'free' CHECK (plan_type IN ('free', 'starter', 'professional', 'premium')),
    status TEXT DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'cancelled', 'expired')),
    start_date DATE NOT NULL DEFAULT CURRENT_DATE,
    end_date DATE,
    invoices_limit INTEGER DEFAULT 5,
    bills_limit INTEGER DEFAULT 5,
    invoices_used INTEGER DEFAULT 0,
    bills_used INTEGER DEFAULT 0,
    auto_renew BOOLEAN DEFAULT false,
    payment_method TEXT,
    last_payment_date DATE,
    next_billing_date DATE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Customers Table
CREATE TABLE public.customers (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    company_id UUID REFERENCES companies(id) ON DELETE CASCADE,
    customer_code TEXT UNIQUE,
    name TEXT NOT NULL,
    email TEXT,
    phone TEXT,
    company_name TEXT,
    address TEXT,
    city TEXT,
    state TEXT,
    country TEXT DEFAULT 'Nigeria',
    postal_code TEXT,
    tax_id TEXT,
    credit_limit DECIMAL(15, 2) DEFAULT 0,
    balance DECIMAL(15, 2) DEFAULT 0,
    payment_terms TEXT DEFAULT 'Net 30',
    status TEXT DEFAULT 'active' CHECK (status IN ('active', 'inactive')),
    notes TEXT,
    created_by UUID REFERENCES auth.users(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Suppliers Table
CREATE TABLE public.suppliers (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    company_id UUID REFERENCES companies(id) ON DELETE CASCADE,
    supplier_code TEXT UNIQUE,
    name TEXT NOT NULL,
    email TEXT,
    phone TEXT,
    company_name TEXT,
    address TEXT,
    city TEXT,
    state TEXT,
    country TEXT DEFAULT 'Nigeria',
    postal_code TEXT,
    tax_id TEXT,
    balance DECIMAL(15, 2) DEFAULT 0,
    payment_terms TEXT DEFAULT 'Net 30',
    status TEXT DEFAULT 'active' CHECK (status IN ('active', 'inactive')),
    notes TEXT,
    created_by UUID REFERENCES auth.users(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Products Table
CREATE TABLE public.products (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    company_id UUID REFERENCES companies(id) ON DELETE CASCADE,
    sku TEXT UNIQUE,
    name TEXT NOT NULL,
    description TEXT,
    type TEXT DEFAULT 'product' CHECK (type IN ('product', 'service')),
    category TEXT,
    unit TEXT DEFAULT 'piece',
    price DECIMAL(15, 2) NOT NULL DEFAULT 0,
    cost DECIMAL(15, 2) DEFAULT 0,
    tax_rate DECIMAL(5, 2) DEFAULT 18.00,
    stock_quantity INTEGER DEFAULT 0,
    low_stock_threshold INTEGER DEFAULT 10,
    image_url TEXT,
    barcode TEXT,
    status TEXT DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'discontinued')),
    created_by UUID REFERENCES auth.users(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Employees Table
CREATE TABLE public.employees (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    company_id UUID REFERENCES companies(id) ON DELETE CASCADE,
    user_id UUID REFERENCES auth.users(id),
    employee_code TEXT UNIQUE,
    first_name TEXT NOT NULL,
    last_name TEXT NOT NULL,
    email TEXT UNIQUE,
    phone TEXT,
    date_of_birth DATE,
    date_of_joining DATE,
    designation TEXT,
    department TEXT,
    employment_type TEXT CHECK (employment_type IN ('full-time', 'part-time', 'contract', 'intern')),
    salary DECIMAL(15, 2),
    bank_name TEXT,
    bank_account_number TEXT,
    tax_id TEXT,
    status TEXT DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'terminated')),
    created_by UUID REFERENCES auth.users(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Invoices Table
CREATE TABLE public.invoices (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    company_id UUID REFERENCES companies(id) ON DELETE CASCADE,
    customer_id UUID REFERENCES customers(id),
    invoice_number TEXT UNIQUE NOT NULL,
    invoice_date DATE NOT NULL DEFAULT CURRENT_DATE,
    due_date DATE,
    status TEXT DEFAULT 'draft' CHECK (status IN ('draft', 'sent', 'paid', 'overdue', 'cancelled')),
    currency TEXT DEFAULT 'NGN',
    subtotal DECIMAL(15, 2) DEFAULT 0,
    tax_amount DECIMAL(15, 2) DEFAULT 0,
    discount_amount DECIMAL(15, 2) DEFAULT 0,
    total DECIMAL(15, 2) NOT NULL DEFAULT 0,
    amount_paid DECIMAL(15, 2) DEFAULT 0,
    balance_due DECIMAL(15, 2) DEFAULT 0,
    payment_terms TEXT,
    notes TEXT,
    terms_conditions TEXT,
    pdf_url TEXT,
    created_by UUID REFERENCES auth.users(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Invoice Items Table
CREATE TABLE public.invoice_items (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    invoice_id UUID REFERENCES invoices(id) ON DELETE CASCADE,
    product_id UUID REFERENCES products(id),
    description TEXT NOT NULL,
    quantity DECIMAL(10, 2) NOT NULL DEFAULT 1,
    unit_price DECIMAL(15, 2) NOT NULL DEFAULT 0,
    tax_rate DECIMAL(5, 2) DEFAULT 0,
    tax_amount DECIMAL(15, 2) DEFAULT 0,
    total DECIMAL(15, 2) NOT NULL DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Bills Table
CREATE TABLE public.bills (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    company_id UUID REFERENCES companies(id) ON DELETE CASCADE,
    supplier_id UUID REFERENCES suppliers(id),
    bill_number TEXT UNIQUE NOT NULL,
    bill_date DATE NOT NULL DEFAULT CURRENT_DATE,
    due_date DATE,
    status TEXT DEFAULT 'draft' CHECK (status IN ('draft', 'pending', 'paid', 'overdue', 'cancelled')),
    currency TEXT DEFAULT 'NGN',
    subtotal DECIMAL(15, 2) DEFAULT 0,
    tax_amount DECIMAL(15, 2) DEFAULT 0,
    total DECIMAL(15, 2) NOT NULL DEFAULT 0,
    amount_paid DECIMAL(15, 2) DEFAULT 0,
    balance_due DECIMAL(15, 2) DEFAULT 0,
    notes TEXT,
    pdf_url TEXT,
    created_by UUID REFERENCES auth.users(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Bill Items Table
CREATE TABLE public.bill_items (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    bill_id UUID REFERENCES bills(id) ON DELETE CASCADE,
    product_id UUID REFERENCES products(id),
    description TEXT NOT NULL,
    quantity DECIMAL(10, 2) NOT NULL DEFAULT 1,
    unit_price DECIMAL(15, 2) NOT NULL DEFAULT 0,
    tax_rate DECIMAL(5, 2) DEFAULT 0,
    tax_amount DECIMAL(15, 2) DEFAULT 0,
    total DECIMAL(15, 2) NOT NULL DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Payments Table
CREATE TABLE public.payments (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    company_id UUID REFERENCES companies(id) ON DELETE CASCADE,
    invoice_id UUID REFERENCES invoices(id),
    bill_id UUID REFERENCES bills(id),
    customer_id UUID REFERENCES customers(id),
    supplier_id UUID REFERENCES suppliers(id),
    payment_number TEXT UNIQUE NOT NULL,
    payment_date DATE NOT NULL DEFAULT CURRENT_DATE,
    amount DECIMAL(15, 2) NOT NULL,
    payment_method TEXT CHECK (payment_method IN ('cash', 'bank_transfer', 'credit_card', 'debit_card', 'cheque', 'online')),
    reference_number TEXT,
    notes TEXT,
    status TEXT DEFAULT 'completed' CHECK (status IN ('completed', 'pending', 'failed')),
    created_by UUID REFERENCES auth.users(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Transactions Table
CREATE TABLE public.transactions (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    company_id UUID REFERENCES companies(id) ON DELETE CASCADE,
    transaction_date DATE NOT NULL DEFAULT CURRENT_DATE,
    type TEXT NOT NULL CHECK (type IN ('income', 'expense', 'transfer')),
    category TEXT,
    description TEXT NOT NULL,
    amount DECIMAL(15, 2) NOT NULL,
    payment_method TEXT,
    reference_number TEXT,
    invoice_id UUID REFERENCES invoices(id),
    bill_id UUID REFERENCES bills(id),
    customer_id UUID REFERENCES customers(id),
    supplier_id UUID REFERENCES suppliers(id),
    status TEXT DEFAULT 'completed' CHECK (status IN ('completed', 'pending', 'failed')),
    reconciled BOOLEAN DEFAULT false,
    created_by UUID REFERENCES auth.users(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Chart of Accounts
CREATE TABLE public.chart_of_accounts (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    company_id UUID REFERENCES companies(id) ON DELETE CASCADE,
    account_code TEXT UNIQUE NOT NULL,
    account_name TEXT NOT NULL,
    account_type TEXT NOT NULL CHECK (account_type IN ('asset', 'liability', 'equity', 'revenue', 'expense')),
    parent_account_id UUID REFERENCES chart_of_accounts(id),
    description TEXT,
    balance DECIMAL(15, 2) DEFAULT 0,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Journal Entries
CREATE TABLE public.journal_entries (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    company_id UUID REFERENCES companies(id) ON DELETE CASCADE,
    entry_number TEXT UNIQUE NOT NULL,
    entry_date DATE NOT NULL DEFAULT CURRENT_DATE,
    description TEXT,
    reference TEXT,
    status TEXT DEFAULT 'draft' CHECK (status IN ('draft', 'posted', 'reversed')),
    created_by UUID REFERENCES auth.users(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Journal Entry Lines
CREATE TABLE public.journal_entry_lines (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    journal_entry_id UUID REFERENCES journal_entries(id) ON DELETE CASCADE,
    account_id UUID REFERENCES chart_of_accounts(id),
    debit DECIMAL(15, 2) DEFAULT 0,
    credit DECIMAL(15, 2) DEFAULT 0,
    description TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Inventory Movements
CREATE TABLE public.inventory_movements (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    company_id UUID REFERENCES companies(id) ON DELETE CASCADE,
    product_id UUID REFERENCES products(id) ON DELETE CASCADE,
    movement_type TEXT NOT NULL CHECK (movement_type IN ('purchase', 'sale', 'adjustment', 'return', 'transfer')),
    quantity INTEGER NOT NULL,
    reference_type TEXT,
    reference_id UUID,
    notes TEXT,
    created_by UUID REFERENCES auth.users(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Payroll Runs
CREATE TABLE public.payroll_runs (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    company_id UUID REFERENCES companies(id) ON DELETE CASCADE,
    payroll_period TEXT NOT NULL,
    payment_date DATE NOT NULL,
    status TEXT DEFAULT 'draft' CHECK (status IN ('draft', 'processed', 'paid')),
    total_gross DECIMAL(15, 2) DEFAULT 0,
    total_deductions DECIMAL(15, 2) DEFAULT 0,
    total_net DECIMAL(15, 2) DEFAULT 0,
    created_by UUID REFERENCES auth.users(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Payroll Items
CREATE TABLE public.payroll_items (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    payroll_run_id UUID REFERENCES payroll_runs(id) ON DELETE CASCADE,
    employee_id UUID REFERENCES employees(id) ON DELETE CASCADE,
    basic_salary DECIMAL(15, 2) DEFAULT 0,
    allowances DECIMAL(15, 2) DEFAULT 0,
    bonuses DECIMAL(15, 2) DEFAULT 0,
    gross_salary DECIMAL(15, 2) DEFAULT 0,
    tax_deduction DECIMAL(15, 2) DEFAULT 0,
    other_deductions DECIMAL(15, 2) DEFAULT 0,
    total_deductions DECIMAL(15, 2) DEFAULT 0,
    net_salary DECIMAL(15, 2) DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tax Returns
CREATE TABLE public.tax_returns (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    company_id UUID REFERENCES companies(id) ON DELETE CASCADE,
    return_period TEXT NOT NULL,
    return_type TEXT CHECK (return_type IN ('GST', 'VAT', 'Income Tax', 'Other')),
    filing_date DATE,
    due_date DATE,
    status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'filed', 'paid')),
    tax_amount DECIMAL(15, 2) DEFAULT 0,
    created_by UUID REFERENCES auth.users(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Notifications
CREATE TABLE public.notifications (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    company_id UUID REFERENCES companies(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    message TEXT,
    type TEXT CHECK (type IN ('info', 'warning', 'error', 'success')),
    is_read BOOLEAN DEFAULT false,
    action_url TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Activity Log
CREATE TABLE public.activity_log (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    company_id UUID REFERENCES companies(id) ON DELETE CASCADE,
    user_id UUID REFERENCES auth.users(id),
    action TEXT NOT NULL,
    entity_type TEXT,
    entity_id UUID,
    old_values JSONB,
    new_values JSONB,
    ip_address INET,
    user_agent TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Attachments
CREATE TABLE public.attachments (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    company_id UUID REFERENCES companies(id) ON DELETE CASCADE,
    entity_type TEXT NOT NULL,
    entity_id UUID NOT NULL,
    file_name TEXT NOT NULL,
    file_type TEXT,
    file_size INTEGER,
    file_url TEXT NOT NULL,
    uploaded_by UUID REFERENCES auth.users(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =====================================================
-- STEP 5: CREATE INDEXES
-- =====================================================

CREATE INDEX idx_profiles_company_id ON public.profiles(company_id);
CREATE INDEX idx_profiles_email ON public.profiles(email);
CREATE INDEX idx_customers_company_id ON public.customers(company_id);
CREATE INDEX idx_suppliers_company_id ON public.suppliers(company_id);
CREATE INDEX idx_products_company_id ON public.products(company_id);
CREATE INDEX idx_invoices_company_id ON public.invoices(company_id);
CREATE INDEX idx_invoices_customer_id ON public.invoices(customer_id);
CREATE INDEX idx_transactions_company_id ON public.transactions(company_id);

-- =====================================================
-- STEP 6: ENABLE RLS
-- =====================================================

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.companies ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.customers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.suppliers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.employees ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.invoices ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.invoice_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.bills ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.bill_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.chart_of_accounts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.journal_entries ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.journal_entry_lines ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.inventory_movements ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payroll_runs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payroll_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tax_returns ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.activity_log ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.attachments ENABLE ROW LEVEL SECURITY;

-- =====================================================
-- STEP 7: CREATE UPDATE TRIGGER FUNCTION
-- =====================================================

CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- =====================================================
-- STEP 8: CREATE RLS POLICIES
-- =====================================================

-- Profiles
CREATE POLICY "Users can view their own profile" ON public.profiles FOR SELECT
TO authenticated
USING (auth.uid() = id);

CREATE POLICY "Users can update their own profile" ON public.profiles FOR UPDATE
TO authenticated
USING (auth.uid() = id);

CREATE POLICY "Users can insert their profile" ON public.profiles FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = id);

-- Companies
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

-- Subscriptions
CREATE POLICY "User can view their subscription" ON public.subscriptions FOR SELECT
TO authenticated
USING (user_id = auth.uid() OR company_id IN (SELECT company_id FROM public.profiles WHERE id = auth.uid()));

CREATE POLICY "User can insert their subscription" ON public.subscriptions FOR INSERT
TO authenticated
WITH CHECK (user_id = auth.uid());

CREATE POLICY "User can update their subscription" ON public.subscriptions FOR UPDATE
TO authenticated
USING (user_id = auth.uid())
WITH CHECK (user_id = auth.uid());

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

-- Invoice Items (nested query since no company_id)
CREATE POLICY "Company isolation for invoice_items" ON public.invoice_items FOR ALL
USING (invoice_id IN (SELECT id FROM public.invoices WHERE company_id IN (SELECT company_id FROM public.profiles WHERE id = auth.uid())))
WITH CHECK (invoice_id IN (SELECT id FROM public.invoices WHERE company_id IN (SELECT company_id FROM public.profiles WHERE id = auth.uid())));

-- Bills
CREATE POLICY "Company isolation for bills" ON public.bills FOR ALL
USING (company_id IN (SELECT company_id FROM public.profiles WHERE id = auth.uid()))
WITH CHECK (company_id IN (SELECT company_id FROM public.profiles WHERE id = auth.uid()));

-- Bill Items (nested query since no company_id)
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

-- Journal Entry Lines (nested query)
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

-- Payroll Items (nested query)
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

-- =====================================================
-- STEP 9: CREATE PROFILE TRIGGER
-- =====================================================

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name)
  VALUES (NEW.id, NEW.email, NEW.raw_user_meta_data->>'full_name')
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- =====================================================
-- STEP 10: GRANT PERMISSIONS
-- =====================================================

GRANT USAGE ON SCHEMA public TO postgres, anon, authenticated, service_role;
GRANT ALL ON ALL TABLES IN SCHEMA public TO postgres, anon, authenticated, service_role;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO postgres, anon, authenticated, service_role;
GRANT ALL ON ALL FUNCTIONS IN SCHEMA public TO postgres, anon, authenticated, service_role;

-- =====================================================
-- VERIFICATION
-- =====================================================

DO $$
DECLARE
  table_count INTEGER;
  rls_count INTEGER;
BEGIN
  SELECT COUNT(*) INTO table_count
  FROM information_schema.tables 
  WHERE table_schema = 'public' 
  AND table_type = 'BASE TABLE';
  
  SELECT COUNT(*) INTO rls_count
  FROM pg_tables 
  WHERE schemaname = 'public' 
  AND rowsecurity = true;
  
  RAISE NOTICE '✅ Tables created: %', table_count;
  RAISE NOTICE '✅ Tables with RLS: %', rls_count;
  RAISE NOTICE '✅ Database setup complete!';
END $$;
