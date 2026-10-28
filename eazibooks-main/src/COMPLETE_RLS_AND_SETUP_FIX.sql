-- =====================================================
-- COMPLETE RLS FIX + USER SETUP
-- This fixes ALL errors including RLS and missing company_id
-- 
-- INSTRUCTIONS:
-- 1. Open Supabase Dashboard → SQL Editor → New Query
-- 2. Copy and paste this ENTIRE file
-- 3. Click "Run" or press Ctrl+Enter
-- 4. Wait for completion (30-60 seconds)
-- 5. You should see success messages
-- 6. Refresh your browser
-- =====================================================

BEGIN;

-- =====================================================
-- STEP 1: ENSURE USER HAS COMPANY AND PROFILE
-- =====================================================

-- Create company if user doesn't have one
DO $$
DECLARE
  v_user_id UUID;
  v_company_id UUID;
  v_profile_exists BOOLEAN;
BEGIN
  -- Get current authenticated user
  v_user_id := auth.uid();
  
  IF v_user_id IS NOT NULL THEN
    -- Check if profile exists
    SELECT EXISTS(SELECT 1 FROM public.profiles WHERE id = v_user_id) INTO v_profile_exists;
    
    IF NOT v_profile_exists THEN
      -- Create a default company first
      INSERT INTO public.companies (name, email, currency, status)
      VALUES ('My Company', 'contact@mycompany.com', 'NGN', 'active')
      RETURNING id INTO v_company_id;
      
      -- Create profile with company_id
      INSERT INTO public.profiles (id, email, full_name, company_id, role)
      SELECT 
        v_user_id,
        auth.email(),
        COALESCE(auth.email(), 'User'),
        v_company_id,
        'owner'
      WHERE NOT EXISTS (SELECT 1 FROM public.profiles WHERE id = v_user_id);
      
      RAISE NOTICE 'Created company and profile for user %', v_user_id;
    ELSE
      -- Check if profile has company_id
      SELECT company_id INTO v_company_id FROM public.profiles WHERE id = v_user_id;
      
      IF v_company_id IS NULL THEN
        -- Create a company and link it
        INSERT INTO public.companies (name, email, currency, status)
        VALUES ('My Company', 'contact@mycompany.com', 'NGN', 'active')
        RETURNING id INTO v_company_id;
        
        UPDATE public.profiles
        SET company_id = v_company_id
        WHERE id = v_user_id;
        
        RAISE NOTICE 'Created company and linked to existing profile for user %', v_user_id;
      END IF;
    END IF;
  END IF;
END $$;

-- =====================================================
-- STEP 2: FIX ALL RLS POLICIES
-- =====================================================

-- Clean up old policies
DROP POLICY IF EXISTS "Users can view their company data" ON public.companies;
DROP POLICY IF EXISTS "Users can insert their company" ON public.companies;
DROP POLICY IF EXISTS "Users can update their company" ON public.companies;
DROP POLICY IF EXISTS "Users can delete their company" ON public.companies;
DROP POLICY IF EXISTS "Company isolation for companies" ON public.companies;
DROP POLICY IF EXISTS "allow_insert_company" ON public.companies;
DROP POLICY IF EXISTS "allow_select_own_company" ON public.companies;
DROP POLICY IF EXISTS "allow_update_own_company" ON public.companies;
DROP POLICY IF EXISTS "allow_delete_own_company" ON public.companies;

-- COMPANIES TABLE
CREATE POLICY "allow_insert_company"
ON public.companies
FOR INSERT
TO authenticated
WITH CHECK (true);

CREATE POLICY "allow_select_own_company"
ON public.companies
FOR SELECT
TO authenticated
USING (id IN (SELECT company_id FROM public.profiles WHERE id = auth.uid()));

CREATE POLICY "allow_update_own_company"
ON public.companies
FOR UPDATE
TO authenticated
USING (id IN (SELECT company_id FROM public.profiles WHERE id = auth.uid()))
WITH CHECK (id IN (SELECT company_id FROM public.profiles WHERE id = auth.uid()));

CREATE POLICY "allow_delete_own_company"
ON public.companies
FOR DELETE
TO authenticated
USING (id IN (SELECT company_id FROM public.profiles WHERE id = auth.uid()));

-- Clean up old profiles policies
DROP POLICY IF EXISTS "Users can view their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can update their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can insert their profile" ON public.profiles;
DROP POLICY IF EXISTS "allow_select_own_profile" ON public.profiles;
DROP POLICY IF EXISTS "allow_update_own_profile" ON public.profiles;
DROP POLICY IF EXISTS "allow_insert_own_profile" ON public.profiles;

-- PROFILES TABLE
CREATE POLICY "allow_select_own_profile"
ON public.profiles
FOR SELECT
TO authenticated
USING (id = auth.uid());

CREATE POLICY "allow_update_own_profile"
ON public.profiles
FOR UPDATE
TO authenticated
USING (id = auth.uid())
WITH CHECK (id = auth.uid());

CREATE POLICY "allow_insert_own_profile"
ON public.profiles
FOR INSERT
TO authenticated
WITH CHECK (id = auth.uid());

-- Clean up subscriptions policies
DROP POLICY IF EXISTS "User can view their subscription" ON public.subscriptions;
DROP POLICY IF EXISTS "User can insert their subscription" ON public.subscriptions;
DROP POLICY IF EXISTS "User can update their subscription" ON public.subscriptions;
DROP POLICY IF EXISTS "allow_select_own_subscription" ON public.subscriptions;
DROP POLICY IF EXISTS "allow_insert_own_subscription" ON public.subscriptions;
DROP POLICY IF EXISTS "allow_update_own_subscription" ON public.subscriptions;

-- SUBSCRIPTIONS TABLE
CREATE POLICY "allow_select_own_subscription"
ON public.subscriptions
FOR SELECT
TO authenticated
USING (user_id = auth.uid() OR company_id IN (SELECT company_id FROM public.profiles WHERE id = auth.uid()));

CREATE POLICY "allow_insert_own_subscription"
ON public.subscriptions
FOR INSERT
TO authenticated
WITH CHECK (user_id = auth.uid());

CREATE POLICY "allow_update_own_subscription"
ON public.subscriptions
FOR UPDATE
TO authenticated
USING (user_id = auth.uid())
WITH CHECK (user_id = auth.uid());

-- Clean up products policies
DROP POLICY IF EXISTS "Company isolation for products" ON public.products;
DROP POLICY IF EXISTS "allow_insert_product" ON public.products;
DROP POLICY IF EXISTS "allow_select_product" ON public.products;
DROP POLICY IF EXISTS "allow_update_product" ON public.products;
DROP POLICY IF EXISTS "allow_delete_product" ON public.products;

-- PRODUCTS TABLE
CREATE POLICY "allow_insert_product"
ON public.products
FOR INSERT
TO authenticated
WITH CHECK (
  company_id IS NOT NULL AND 
  company_id IN (SELECT company_id FROM public.profiles WHERE id = auth.uid())
);

CREATE POLICY "allow_select_product"
ON public.products
FOR SELECT
TO authenticated
USING (company_id IN (SELECT company_id FROM public.profiles WHERE id = auth.uid()));

CREATE POLICY "allow_update_product"
ON public.products
FOR UPDATE
TO authenticated
USING (company_id IN (SELECT company_id FROM public.profiles WHERE id = auth.uid()))
WITH CHECK (company_id IN (SELECT company_id FROM public.profiles WHERE id = auth.uid()));

CREATE POLICY "allow_delete_product"
ON public.products
FOR DELETE
TO authenticated
USING (company_id IN (SELECT company_id FROM public.profiles WHERE id = auth.uid()));

-- Clean up customers policies
DROP POLICY IF EXISTS "Company isolation for customers" ON public.customers;
DROP POLICY IF EXISTS "allow_insert_customer" ON public.customers;
DROP POLICY IF EXISTS "allow_select_customer" ON public.customers;
DROP POLICY IF EXISTS "allow_update_customer" ON public.customers;
DROP POLICY IF EXISTS "allow_delete_customer" ON public.customers;

-- CUSTOMERS TABLE
CREATE POLICY "allow_insert_customer"
ON public.customers
FOR INSERT
TO authenticated
WITH CHECK (
  company_id IS NOT NULL AND 
  company_id IN (SELECT company_id FROM public.profiles WHERE id = auth.uid())
);

CREATE POLICY "allow_select_customer"
ON public.customers
FOR SELECT
TO authenticated
USING (company_id IN (SELECT company_id FROM public.profiles WHERE id = auth.uid()));

CREATE POLICY "allow_update_customer"
ON public.customers
FOR UPDATE
TO authenticated
USING (company_id IN (SELECT company_id FROM public.profiles WHERE id = auth.uid()))
WITH CHECK (company_id IN (SELECT company_id FROM public.profiles WHERE id = auth.uid()));

CREATE POLICY "allow_delete_customer"
ON public.customers
FOR DELETE
TO authenticated
USING (company_id IN (SELECT company_id FROM public.profiles WHERE id = auth.uid()));

-- Clean up suppliers policies
DROP POLICY IF EXISTS "Company isolation for suppliers" ON public.suppliers;
DROP POLICY IF EXISTS "allow_insert_supplier" ON public.suppliers;
DROP POLICY IF EXISTS "allow_select_supplier" ON public.suppliers;
DROP POLICY IF EXISTS "allow_update_supplier" ON public.suppliers;
DROP POLICY IF EXISTS "allow_delete_supplier" ON public.suppliers;

-- SUPPLIERS TABLE
CREATE POLICY "allow_insert_supplier"
ON public.suppliers
FOR INSERT
TO authenticated
WITH CHECK (
  company_id IS NOT NULL AND 
  company_id IN (SELECT company_id FROM public.profiles WHERE id = auth.uid())
);

CREATE POLICY "allow_select_supplier"
ON public.suppliers
FOR SELECT
TO authenticated
USING (company_id IN (SELECT company_id FROM public.profiles WHERE id = auth.uid()));

CREATE POLICY "allow_update_supplier"
ON public.suppliers
FOR UPDATE
TO authenticated
USING (company_id IN (SELECT company_id FROM public.profiles WHERE id = auth.uid()))
WITH CHECK (company_id IN (SELECT company_id FROM public.profiles WHERE id = auth.uid()));

CREATE POLICY "allow_delete_supplier"
ON public.suppliers
FOR DELETE
TO authenticated
USING (company_id IN (SELECT company_id FROM public.profiles WHERE id = auth.uid()));

-- Clean up invoices policies
DROP POLICY IF EXISTS "Company isolation for invoices" ON public.invoices;
DROP POLICY IF EXISTS "allow_insert_invoice" ON public.invoices;
DROP POLICY IF EXISTS "allow_select_invoice" ON public.invoices;
DROP POLICY IF EXISTS "allow_update_invoice" ON public.invoices;
DROP POLICY IF EXISTS "allow_delete_invoice" ON public.invoices;

-- INVOICES TABLE
CREATE POLICY "allow_insert_invoice"
ON public.invoices
FOR INSERT
TO authenticated
WITH CHECK (
  company_id IS NOT NULL AND 
  company_id IN (SELECT company_id FROM public.profiles WHERE id = auth.uid())
);

CREATE POLICY "allow_select_invoice"
ON public.invoices
FOR SELECT
TO authenticated
USING (company_id IN (SELECT company_id FROM public.profiles WHERE id = auth.uid()));

CREATE POLICY "allow_update_invoice"
ON public.invoices
FOR UPDATE
TO authenticated
USING (company_id IN (SELECT company_id FROM public.profiles WHERE id = auth.uid()))
WITH CHECK (company_id IN (SELECT company_id FROM public.profiles WHERE id = auth.uid()));

CREATE POLICY "allow_delete_invoice"
ON public.invoices
FOR DELETE
TO authenticated
USING (company_id IN (SELECT company_id FROM public.profiles WHERE id = auth.uid()));

-- Clean up invoice_items policies
DROP POLICY IF EXISTS "Company isolation for invoice_items" ON public.invoice_items;
DROP POLICY IF EXISTS "allow_insert_invoice_item" ON public.invoice_items;
DROP POLICY IF EXISTS "allow_select_invoice_item" ON public.invoice_items;
DROP POLICY IF EXISTS "allow_update_invoice_item" ON public.invoice_items;
DROP POLICY IF EXISTS "allow_delete_invoice_item" ON public.invoice_items;

-- INVOICE_ITEMS TABLE
CREATE POLICY "allow_insert_invoice_item"
ON public.invoice_items
FOR INSERT
TO authenticated
WITH CHECK (
  invoice_id IN (
    SELECT id FROM public.invoices 
    WHERE company_id IN (SELECT company_id FROM public.profiles WHERE id = auth.uid())
  )
);

CREATE POLICY "allow_select_invoice_item"
ON public.invoice_items
FOR SELECT
TO authenticated
USING (
  invoice_id IN (
    SELECT id FROM public.invoices 
    WHERE company_id IN (SELECT company_id FROM public.profiles WHERE id = auth.uid())
  )
);

CREATE POLICY "allow_update_invoice_item"
ON public.invoice_items
FOR UPDATE
TO authenticated
USING (
  invoice_id IN (
    SELECT id FROM public.invoices 
    WHERE company_id IN (SELECT company_id FROM public.profiles WHERE id = auth.uid())
  )
)
WITH CHECK (
  invoice_id IN (
    SELECT id FROM public.invoices 
    WHERE company_id IN (SELECT company_id FROM public.profiles WHERE id = auth.uid())
  )
);

CREATE POLICY "allow_delete_invoice_item"
ON public.invoice_items
FOR DELETE
TO authenticated
USING (
  invoice_id IN (
    SELECT id FROM public.invoices 
    WHERE company_id IN (SELECT company_id FROM public.profiles WHERE id = auth.uid())
  )
);

-- Clean up transactions policies
DROP POLICY IF EXISTS "Company isolation for transactions" ON public.transactions;
DROP POLICY IF EXISTS "allow_insert_transaction" ON public.transactions;
DROP POLICY IF EXISTS "allow_select_transaction" ON public.transactions;
DROP POLICY IF EXISTS "allow_update_transaction" ON public.transactions;
DROP POLICY IF EXISTS "allow_delete_transaction" ON public.transactions;

-- TRANSACTIONS TABLE
CREATE POLICY "allow_insert_transaction"
ON public.transactions
FOR INSERT
TO authenticated
WITH CHECK (
  company_id IS NOT NULL AND 
  company_id IN (SELECT company_id FROM public.profiles WHERE id = auth.uid())
);

CREATE POLICY "allow_select_transaction"
ON public.transactions
FOR SELECT
TO authenticated
USING (company_id IN (SELECT company_id FROM public.profiles WHERE id = auth.uid()));

CREATE POLICY "allow_update_transaction"
ON public.transactions
FOR UPDATE
TO authenticated
USING (company_id IN (SELECT company_id FROM public.profiles WHERE id = auth.uid()))
WITH CHECK (company_id IN (SELECT company_id FROM public.profiles WHERE id = auth.uid()));

CREATE POLICY "allow_delete_transaction"
ON public.transactions
FOR DELETE
TO authenticated
USING (company_id IN (SELECT company_id FROM public.profiles WHERE id = auth.uid()));

-- Clean up payments policies
DROP POLICY IF EXISTS "Company isolation for payments" ON public.payments;
DROP POLICY IF EXISTS "allow_insert_payment" ON public.payments;
DROP POLICY IF EXISTS "allow_select_payment" ON public.payments;
DROP POLICY IF EXISTS "allow_update_payment" ON public.payments;
DROP POLICY IF EXISTS "allow_delete_payment" ON public.payments;

-- PAYMENTS TABLE
CREATE POLICY "allow_insert_payment"
ON public.payments
FOR INSERT
TO authenticated
WITH CHECK (
  invoice_id IN (
    SELECT id FROM public.invoices 
    WHERE company_id IN (SELECT company_id FROM public.profiles WHERE id = auth.uid())
  )
);

CREATE POLICY "allow_select_payment"
ON public.payments
FOR SELECT
TO authenticated
USING (
  invoice_id IN (
    SELECT id FROM public.invoices 
    WHERE company_id IN (SELECT company_id FROM public.profiles WHERE id = auth.uid())
  )
);

CREATE POLICY "allow_update_payment"
ON public.payments
FOR UPDATE
TO authenticated
USING (
  invoice_id IN (
    SELECT id FROM public.invoices 
    WHERE company_id IN (SELECT company_id FROM public.profiles WHERE id = auth.uid())
  )
)
WITH CHECK (
  invoice_id IN (
    SELECT id FROM public.invoices 
    WHERE company_id IN (SELECT company_id FROM public.profiles WHERE id = auth.uid())
  )
);

CREATE POLICY "allow_delete_payment"
ON public.payments
FOR DELETE
TO authenticated
USING (
  invoice_id IN (
    SELECT id FROM public.invoices 
    WHERE company_id IN (SELECT company_id FROM public.profiles WHERE id = auth.uid())
  )
);

COMMIT;

-- =====================================================
-- VERIFICATION & SUCCESS MESSAGES
-- =====================================================

DO $$
DECLARE
  v_user_id UUID;
  v_company_id UUID;
  v_profile_count INTEGER;
  v_company_count INTEGER;
BEGIN
  v_user_id := auth.uid();
  
  IF v_user_id IS NOT NULL THEN
    SELECT COUNT(*) INTO v_profile_count FROM public.profiles WHERE id = v_user_id;
    SELECT company_id INTO v_company_id FROM public.profiles WHERE id = v_user_id;
    SELECT COUNT(*) INTO v_company_count FROM public.companies WHERE id = v_company_id;
    
    RAISE NOTICE '';
    RAISE NOTICE '========================================';
    RAISE NOTICE '✅✅✅ ALL FIXES APPLIED! ✅✅✅';
    RAISE NOTICE '========================================';
    RAISE NOTICE '';
    RAISE NOTICE 'User Setup:';
    RAISE NOTICE '  User ID: %', v_user_id;
    RAISE NOTICE '  Profile exists: %', v_profile_count > 0;
    RAISE NOTICE '  Company ID: %', v_company_id;
    RAISE NOTICE '  Company exists: %', v_company_count > 0;
    RAISE NOTICE '';
    RAISE NOTICE 'RLS Policies Fixed:';
    RAISE NOTICE '  ✅ Companies';
    RAISE NOTICE '  ✅ Profiles';
    RAISE NOTICE '  ✅ Subscriptions';
    RAISE NOTICE '  ✅ Products';
    RAISE NOTICE '  ✅ Customers';
    RAISE NOTICE '  ✅ Suppliers';
    RAISE NOTICE '  ✅ Invoices';
    RAISE NOTICE '  ✅ Invoice Items';
    RAISE NOTICE '  ✅ Transactions';
    RAISE NOTICE '  ✅ Payments';
    RAISE NOTICE '';
    RAISE NOTICE 'Next Steps:';
    RAISE NOTICE '1. Refresh your browser (Ctrl+Shift+R)';
    RAISE NOTICE '2. Try creating a product - should work!';
    RAISE NOTICE '3. Try creating an invoice - should work!';
    RAISE NOTICE '4. Try creating a customer - should work!';
    RAISE NOTICE '';
  ELSE
    RAISE NOTICE 'No authenticated user - please log in first!';
  END IF;
END $$;

-- Show policy counts
SELECT 
  tablename,
  COUNT(*) as policy_count
FROM pg_policies
WHERE schemaname = 'public'
  AND tablename IN ('companies', 'profiles', 'subscriptions', 'products', 'customers', 'suppliers', 'invoices', 'invoice_items', 'transactions', 'payments')
GROUP BY tablename
ORDER BY tablename;
