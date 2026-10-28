-- =====================================================
-- COMPLETE RLS FIX FOR ALL TABLES
-- This fixes all "new row violates row-level security policy" errors
-- 
-- INSTRUCTIONS:
-- 1. Copy this entire file
-- 2. Go to Supabase Dashboard → SQL Editor
-- 3. Click "New Query"
-- 4. Paste this code
-- 5. Click "Run" or press Ctrl+Enter
-- 6. Wait for it to complete (should take 10-30 seconds)
-- 7. Refresh your browser
-- 8. All RLS errors should be fixed!
-- =====================================================

BEGIN;

-- =====================================================
-- 1. FIX COMPANIES TABLE
-- =====================================================

DROP POLICY IF EXISTS "Users can view their company data" ON public.companies;
DROP POLICY IF EXISTS "Users can insert their company" ON public.companies;
DROP POLICY IF EXISTS "Users can update their company" ON public.companies;
DROP POLICY IF EXISTS "Users can delete their company" ON public.companies;
DROP POLICY IF EXISTS "Company isolation for companies" ON public.companies;
DROP POLICY IF EXISTS "allow_insert_company" ON public.companies;
DROP POLICY IF EXISTS "allow_select_own_company" ON public.companies;
DROP POLICY IF EXISTS "allow_update_own_company" ON public.companies;
DROP POLICY IF EXISTS "allow_delete_own_company" ON public.companies;

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

-- =====================================================
-- 2. FIX PROFILES TABLE
-- =====================================================

DROP POLICY IF EXISTS "Users can view their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can update their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can insert their profile" ON public.profiles;
DROP POLICY IF EXISTS "allow_select_own_profile" ON public.profiles;
DROP POLICY IF EXISTS "allow_update_own_profile" ON public.profiles;
DROP POLICY IF EXISTS "allow_insert_own_profile" ON public.profiles;

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

-- =====================================================
-- 3. FIX SUBSCRIPTIONS TABLE
-- =====================================================

DROP POLICY IF EXISTS "User can view their subscription" ON public.subscriptions;
DROP POLICY IF EXISTS "User can insert their subscription" ON public.subscriptions;
DROP POLICY IF EXISTS "User can update their subscription" ON public.subscriptions;
DROP POLICY IF EXISTS "allow_select_own_subscription" ON public.subscriptions;
DROP POLICY IF EXISTS "allow_insert_own_subscription" ON public.subscriptions;
DROP POLICY IF EXISTS "allow_update_own_subscription" ON public.subscriptions;

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

-- =====================================================
-- 4. FIX PRODUCTS TABLE
-- =====================================================

DROP POLICY IF EXISTS "Company isolation for products" ON public.products;
DROP POLICY IF EXISTS "allow_insert_product" ON public.products;
DROP POLICY IF EXISTS "allow_select_product" ON public.products;
DROP POLICY IF EXISTS "allow_update_product" ON public.products;
DROP POLICY IF EXISTS "allow_delete_product" ON public.products;

CREATE POLICY "allow_insert_product"
ON public.products
FOR INSERT
TO authenticated
WITH CHECK (company_id IN (SELECT company_id FROM public.profiles WHERE id = auth.uid()));

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

-- =====================================================
-- 5. FIX CUSTOMERS TABLE
-- =====================================================

DROP POLICY IF EXISTS "Company isolation for customers" ON public.customers;
DROP POLICY IF EXISTS "allow_insert_customer" ON public.customers;
DROP POLICY IF EXISTS "allow_select_customer" ON public.customers;
DROP POLICY IF EXISTS "allow_update_customer" ON public.customers;
DROP POLICY IF EXISTS "allow_delete_customer" ON public.customers;

CREATE POLICY "allow_insert_customer"
ON public.customers
FOR INSERT
TO authenticated
WITH CHECK (company_id IN (SELECT company_id FROM public.profiles WHERE id = auth.uid()));

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

-- =====================================================
-- 6. FIX SUPPLIERS TABLE
-- =====================================================

DROP POLICY IF EXISTS "Company isolation for suppliers" ON public.suppliers;
DROP POLICY IF EXISTS "allow_insert_supplier" ON public.suppliers;
DROP POLICY IF EXISTS "allow_select_supplier" ON public.suppliers;
DROP POLICY IF EXISTS "allow_update_supplier" ON public.suppliers;
DROP POLICY IF EXISTS "allow_delete_supplier" ON public.suppliers;

CREATE POLICY "allow_insert_supplier"
ON public.suppliers
FOR INSERT
TO authenticated
WITH CHECK (company_id IN (SELECT company_id FROM public.profiles WHERE id = auth.uid()));

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

-- =====================================================
-- 7. FIX INVOICES TABLE
-- =====================================================

DROP POLICY IF EXISTS "Company isolation for invoices" ON public.invoices;
DROP POLICY IF EXISTS "allow_insert_invoice" ON public.invoices;
DROP POLICY IF EXISTS "allow_select_invoice" ON public.invoices;
DROP POLICY IF EXISTS "allow_update_invoice" ON public.invoices;
DROP POLICY IF EXISTS "allow_delete_invoice" ON public.invoices;

CREATE POLICY "allow_insert_invoice"
ON public.invoices
FOR INSERT
TO authenticated
WITH CHECK (company_id IN (SELECT company_id FROM public.profiles WHERE id = auth.uid()));

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

-- =====================================================
-- 8. FIX INVOICE_ITEMS TABLE
-- =====================================================

DROP POLICY IF EXISTS "Company isolation for invoice_items" ON public.invoice_items;
DROP POLICY IF EXISTS "allow_insert_invoice_item" ON public.invoice_items;
DROP POLICY IF EXISTS "allow_select_invoice_item" ON public.invoice_items;
DROP POLICY IF EXISTS "allow_update_invoice_item" ON public.invoice_items;
DROP POLICY IF EXISTS "allow_delete_invoice_item" ON public.invoice_items;

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

-- =====================================================
-- 9. FIX TRANSACTIONS TABLE
-- =====================================================

DROP POLICY IF EXISTS "Company isolation for transactions" ON public.transactions;
DROP POLICY IF EXISTS "allow_insert_transaction" ON public.transactions;
DROP POLICY IF EXISTS "allow_select_transaction" ON public.transactions;
DROP POLICY IF EXISTS "allow_update_transaction" ON public.transactions;
DROP POLICY IF EXISTS "allow_delete_transaction" ON public.transactions;

CREATE POLICY "allow_insert_transaction"
ON public.transactions
FOR INSERT
TO authenticated
WITH CHECK (company_id IN (SELECT company_id FROM public.profiles WHERE id = auth.uid()));

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

-- =====================================================
-- 10. FIX PAYMENTS TABLE
-- =====================================================

DROP POLICY IF EXISTS "Company isolation for payments" ON public.payments;
DROP POLICY IF EXISTS "allow_insert_payment" ON public.payments;
DROP POLICY IF EXISTS "allow_select_payment" ON public.payments;
DROP POLICY IF EXISTS "allow_update_payment" ON public.payments;
DROP POLICY IF EXISTS "allow_delete_payment" ON public.payments;

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

-- =====================================================
-- 11. FIX INVENTORY_MOVEMENTS TABLE (if exists)
-- =====================================================

DO $$
BEGIN
  IF EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'inventory_movements') THEN
    EXECUTE 'DROP POLICY IF EXISTS "Company isolation for inventory_movements" ON public.inventory_movements';
    EXECUTE 'DROP POLICY IF EXISTS "allow_insert_inventory_movement" ON public.inventory_movements';
    EXECUTE 'DROP POLICY IF EXISTS "allow_select_inventory_movement" ON public.inventory_movements';
    EXECUTE 'DROP POLICY IF EXISTS "allow_update_inventory_movement" ON public.inventory_movements';
    EXECUTE 'DROP POLICY IF EXISTS "allow_delete_inventory_movement" ON public.inventory_movements';
    
    EXECUTE 'CREATE POLICY "allow_insert_inventory_movement"
    ON public.inventory_movements
    FOR INSERT
    TO authenticated
    WITH CHECK (company_id IN (SELECT company_id FROM public.profiles WHERE id = auth.uid()))';
    
    EXECUTE 'CREATE POLICY "allow_select_inventory_movement"
    ON public.inventory_movements
    FOR SELECT
    TO authenticated
    USING (company_id IN (SELECT company_id FROM public.profiles WHERE id = auth.uid()))';
    
    EXECUTE 'CREATE POLICY "allow_update_inventory_movement"
    ON public.inventory_movements
    FOR UPDATE
    TO authenticated
    USING (company_id IN (SELECT company_id FROM public.profiles WHERE id = auth.uid()))
    WITH CHECK (company_id IN (SELECT company_id FROM public.profiles WHERE id = auth.uid()))';
    
    EXECUTE 'CREATE POLICY "allow_delete_inventory_movement"
    ON public.inventory_movements
    FOR DELETE
    TO authenticated
    USING (company_id IN (SELECT company_id FROM public.profiles WHERE id = auth.uid()))';
  END IF;
END $$;

-- =====================================================
-- 12. FIX JOURNAL_ENTRIES TABLE (if exists)
-- =====================================================

DO $$
BEGIN
  IF EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'journal_entries') THEN
    EXECUTE 'DROP POLICY IF EXISTS "Company isolation for journal_entries" ON public.journal_entries';
    EXECUTE 'DROP POLICY IF EXISTS "allow_insert_journal_entry" ON public.journal_entries';
    EXECUTE 'DROP POLICY IF EXISTS "allow_select_journal_entry" ON public.journal_entries';
    EXECUTE 'DROP POLICY IF EXISTS "allow_update_journal_entry" ON public.journal_entries';
    EXECUTE 'DROP POLICY IF EXISTS "allow_delete_journal_entry" ON public.journal_entries';
    
    EXECUTE 'CREATE POLICY "allow_insert_journal_entry"
    ON public.journal_entries
    FOR INSERT
    TO authenticated
    WITH CHECK (company_id IN (SELECT company_id FROM public.profiles WHERE id = auth.uid()))';
    
    EXECUTE 'CREATE POLICY "allow_select_journal_entry"
    ON public.journal_entries
    FOR SELECT
    TO authenticated
    USING (company_id IN (SELECT company_id FROM public.profiles WHERE id = auth.uid()))';
    
    EXECUTE 'CREATE POLICY "allow_update_journal_entry"
    ON public.journal_entries
    FOR UPDATE
    TO authenticated
    USING (company_id IN (SELECT company_id FROM public.profiles WHERE id = auth.uid()))
    WITH CHECK (company_id IN (SELECT company_id FROM public.profiles WHERE id = auth.uid()))';
    
    EXECUTE 'CREATE POLICY "allow_delete_journal_entry"
    ON public.journal_entries
    FOR DELETE
    TO authenticated
    USING (company_id IN (SELECT company_id FROM public.profiles WHERE id = auth.uid()))';
  END IF;
END $$;

COMMIT;

-- =====================================================
-- VERIFICATION
-- =====================================================

SELECT '========================================' as info;
SELECT '✅ RLS POLICIES FIXED FOR ALL TABLES ✅' as info;
SELECT '========================================' as info;

-- List all policies by table
SELECT '=== COMPANIES ===' as info;
SELECT policyname, cmd FROM pg_policies WHERE tablename = 'companies' ORDER BY policyname;

SELECT '=== PROFILES ===' as info;
SELECT policyname, cmd FROM pg_policies WHERE tablename = 'profiles' ORDER BY policyname;

SELECT '=== SUBSCRIPTIONS ===' as info;
SELECT policyname, cmd FROM pg_policies WHERE tablename = 'subscriptions' ORDER BY policyname;

SELECT '=== PRODUCTS ===' as info;
SELECT policyname, cmd FROM pg_policies WHERE tablename = 'products' ORDER BY policyname;

SELECT '=== CUSTOMERS ===' as info;
SELECT policyname, cmd FROM pg_policies WHERE tablename = 'customers' ORDER BY policyname;

SELECT '=== SUPPLIERS ===' as info;
SELECT policyname, cmd FROM pg_policies WHERE tablename = 'suppliers' ORDER BY policyname;

SELECT '=== INVOICES ===' as info;
SELECT policyname, cmd FROM pg_policies WHERE tablename = 'invoices' ORDER BY policyname;

SELECT '=== INVOICE_ITEMS ===' as info;
SELECT policyname, cmd FROM pg_policies WHERE tablename = 'invoice_items' ORDER BY policyname;

SELECT '=== TRANSACTIONS ===' as info;
SELECT policyname, cmd FROM pg_policies WHERE tablename = 'transactions' ORDER BY policyname;

SELECT '=== PAYMENTS ===' as info;
SELECT policyname, cmd FROM pg_policies WHERE tablename = 'payments' ORDER BY policyname;

-- Success message
DO $$
BEGIN
  RAISE NOTICE '';
  RAISE NOTICE '========================================';
  RAISE NOTICE '✅✅✅ ALL RLS POLICIES FIXED! ✅✅✅';
  RAISE NOTICE '========================================';
  RAISE NOTICE '';
  RAISE NOTICE 'Next steps:';
  RAISE NOTICE '1. Refresh your browser (Ctrl+Shift+R or Cmd+Shift+R)';
  RAISE NOTICE '2. Try creating/saving data in any module';
  RAISE NOTICE '3. All RLS errors should be gone!';
  RAISE NOTICE '';
  RAISE NOTICE 'Fixed tables:';
  RAISE NOTICE '- Companies';
  RAISE NOTICE '- Profiles';
  RAISE NOTICE '- Subscriptions';
  RAISE NOTICE '- Products';
  RAISE NOTICE '- Customers';
  RAISE NOTICE '- Suppliers';
  RAISE NOTICE '- Invoices';
  RAISE NOTICE '- Invoice Items';
  RAISE NOTICE '- Transactions';
  RAISE NOTICE '- Payments';
  RAISE NOTICE '- Inventory Movements (if exists)';
  RAISE NOTICE '- Journal Entries (if exists)';
  RAISE NOTICE '';
END $$;
