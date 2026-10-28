-- =====================================================
-- Fix Companies RLS Policy Error
-- Run this in Supabase SQL Editor
-- =====================================================

-- Drop existing policies for companies table
DROP POLICY IF EXISTS "Users can view their company data" ON public.companies;
DROP POLICY IF EXISTS "Users can insert their company" ON public.companies;
DROP POLICY IF EXISTS "Users can update their company" ON public.companies;
DROP POLICY IF EXISTS "Users can delete their company" ON public.companies;

-- Create permissive INSERT policy (allows any authenticated user to create a company)
CREATE POLICY "Allow authenticated users to insert companies"
ON public.companies
FOR INSERT
TO authenticated
WITH CHECK (true);

-- Create SELECT policy (users can only view companies they belong to)
CREATE POLICY "Users can view their own company"
ON public.companies
FOR SELECT
TO authenticated
USING (
  id IN (
    SELECT company_id 
    FROM public.profiles 
    WHERE id = auth.uid() AND company_id IS NOT NULL
  )
);

-- Create UPDATE policy (users can only update their own company)
CREATE POLICY "Users can update their own company"
ON public.companies
FOR UPDATE
TO authenticated
USING (
  id IN (
    SELECT company_id 
    FROM public.profiles 
    WHERE id = auth.uid() AND company_id IS NOT NULL
  )
)
WITH CHECK (
  id IN (
    SELECT company_id 
    FROM public.profiles 
    WHERE id = auth.uid() AND company_id IS NOT NULL
  )
);

-- Create DELETE policy (users can delete their own company)
CREATE POLICY "Users can delete their own company"
ON public.companies
FOR DELETE
TO authenticated
USING (
  id IN (
    SELECT company_id 
    FROM public.profiles 
    WHERE id = auth.uid() AND company_id IS NOT NULL
  )
);

-- Verify policies are created
SELECT 
  schemaname,
  tablename,
  policyname,
  permissive,
  roles,
  cmd
FROM pg_policies
WHERE schemaname = 'public' AND tablename = 'companies'
ORDER BY policyname;

-- Test query (should return empty or your company if you have one)
SELECT * FROM companies;

RAISE NOTICE '✅ Companies RLS policies updated successfully!';
RAISE NOTICE 'You should now be able to create and update companies.';
