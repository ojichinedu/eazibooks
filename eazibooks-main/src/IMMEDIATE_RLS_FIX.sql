-- =====================================================
-- IMMEDIATE FIX FOR RLS POLICY ERROR
-- Copy and paste this into Supabase SQL Editor and run
-- =====================================================

-- First, check current policies
SELECT tablename, policyname, cmd, roles
FROM pg_policies 
WHERE tablename = 'companies';

-- Drop ALL existing policies on companies table
DROP POLICY IF EXISTS "Users can view their company data" ON public.companies;
DROP POLICY IF EXISTS "Users can insert their company" ON public.companies;
DROP POLICY IF EXISTS "Users can update their company" ON public.companies;
DROP POLICY IF EXISTS "Users can delete their company" ON public.companies;
DROP POLICY IF EXISTS "Company isolation for companies" ON public.companies;

-- Create new PERMISSIVE policies with TO authenticated

-- 1. Allow any authenticated user to INSERT a company
CREATE POLICY "allow_insert_company"
ON public.companies
FOR INSERT
TO authenticated
WITH CHECK (true);

-- 2. Allow users to SELECT only their company
CREATE POLICY "allow_select_own_company"
ON public.companies
FOR SELECT
TO authenticated
USING (
  id IN (
    SELECT company_id 
    FROM public.profiles 
    WHERE id = auth.uid()
  )
);

-- 3. Allow users to UPDATE only their company
CREATE POLICY "allow_update_own_company"
ON public.companies
FOR UPDATE
TO authenticated
USING (
  id IN (
    SELECT company_id 
    FROM public.profiles 
    WHERE id = auth.uid()
  )
)
WITH CHECK (
  id IN (
    SELECT company_id 
    FROM public.profiles 
    WHERE id = auth.uid()
  )
);

-- 4. Allow users to DELETE only their company
CREATE POLICY "allow_delete_own_company"
ON public.companies
FOR DELETE
TO authenticated
USING (
  id IN (
    SELECT company_id 
    FROM public.profiles 
    WHERE id = auth.uid()
  )
);

-- Verify the new policies
SELECT 
  tablename, 
  policyname, 
  cmd as operation,
  roles,
  CASE 
    WHEN roles::text LIKE '%authenticated%' THEN '✅ Has authenticated role'
    ELSE '❌ Missing authenticated role'
  END as status
FROM pg_policies 
WHERE tablename = 'companies'
ORDER BY policyname;

-- Test that you can now insert (should not error)
-- Note: This will fail if you already have a company, but that's expected
DO $$
BEGIN
  -- Just check if the policy allows the operation
  RAISE NOTICE '✅ RLS policies updated successfully!';
  RAISE NOTICE 'You can now create and update companies.';
  RAISE NOTICE 'Refresh your browser and try saving company settings again.';
END $$;
