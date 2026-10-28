-- =====================================================
-- FIX COMPANIES TABLE ONLY
-- If companies policies are missing, run this
-- =====================================================

-- First, completely clean up companies policies
DROP POLICY IF EXISTS "Users can view their company data" ON public.companies;
DROP POLICY IF EXISTS "Users can insert their company" ON public.companies;
DROP POLICY IF EXISTS "Users can update their company" ON public.companies;
DROP POLICY IF EXISTS "Users can delete their company" ON public.companies;
DROP POLICY IF EXISTS "Company isolation for companies" ON public.companies;
DROP POLICY IF EXISTS "allow_insert_company" ON public.companies;
DROP POLICY IF EXISTS "allow_select_own_company" ON public.companies;
DROP POLICY IF EXISTS "allow_update_own_company" ON public.companies;
DROP POLICY IF EXISTS "allow_delete_own_company" ON public.companies;

-- Ensure RLS is enabled
ALTER TABLE public.companies ENABLE ROW LEVEL SECURITY;

-- Create the INSERT policy (THIS IS THE KEY ONE FOR YOUR ERROR)
CREATE POLICY "allow_insert_company"
ON public.companies
FOR INSERT
TO authenticated
WITH CHECK (true);

-- Create the SELECT policy
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

-- Create the UPDATE policy
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

-- Create the DELETE policy
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

-- Verify it worked
SELECT 'Companies policies created:' as result;
SELECT policyname, cmd, roles FROM pg_policies WHERE tablename = 'companies';

-- Test message
DO $$
BEGIN
  RAISE NOTICE '✅ Companies table policies created successfully!';
  RAISE NOTICE 'Now refresh your browser and try saving company settings.';
END $$;
