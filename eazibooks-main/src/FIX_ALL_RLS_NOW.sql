-- =====================================================
-- ALL-IN-ONE RLS FIX
-- This fixes the "new row violates row-level security policy" error
-- 
-- INSTRUCTIONS:
-- 1. Copy this entire file
-- 2. Go to Supabase Dashboard → SQL Editor
-- 3. Click "New Query"
-- 4. Paste this code
-- 5. Click "Run" or press Ctrl+Enter
-- 6. Wait for it to complete
-- 7. Refresh your browser
-- 8. Try saving company settings again
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

COMMIT;

-- =====================================================
-- VERIFICATION
-- =====================================================

-- Check companies policies
SELECT '=== COMPANIES POLICIES ===' as info;
SELECT policyname, cmd, roles FROM pg_policies WHERE tablename = 'companies' ORDER BY policyname;

-- Check profiles policies
SELECT '=== PROFILES POLICIES ===' as info;
SELECT policyname, cmd, roles FROM pg_policies WHERE tablename = 'profiles' ORDER BY policyname;

-- Check subscriptions policies
SELECT '=== SUBSCRIPTIONS POLICIES ===' as info;
SELECT policyname, cmd, roles FROM pg_policies WHERE tablename = 'subscriptions' ORDER BY policyname;

-- Success message
DO $$
BEGIN
  RAISE NOTICE '';
  RAISE NOTICE '✅✅✅ ALL RLS POLICIES FIXED! ✅✅✅';
  RAISE NOTICE '';
  RAISE NOTICE 'Next steps:';
  RAISE NOTICE '1. Refresh your browser (Ctrl+Shift+R or Cmd+Shift+R)';
  RAISE NOTICE '2. Go to Settings → Company Settings';
  RAISE NOTICE '3. Fill in your company details';
  RAISE NOTICE '4. Click Save';
  RAISE NOTICE '5. It should work now!';
  RAISE NOTICE '';
END $$;
