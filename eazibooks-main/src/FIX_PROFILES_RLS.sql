-- =====================================================
-- FIX PROFILES RLS POLICIES
-- Run this after IMMEDIATE_RLS_FIX.sql
-- =====================================================

-- Drop existing policies
DROP POLICY IF EXISTS "Users can view their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can update their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can insert their profile" ON public.profiles;

-- Create new policies with TO authenticated

-- 1. Allow users to view their own profile
CREATE POLICY "allow_select_own_profile"
ON public.profiles
FOR SELECT
TO authenticated
USING (id = auth.uid());

-- 2. Allow users to update their own profile
CREATE POLICY "allow_update_own_profile"
ON public.profiles
FOR UPDATE
TO authenticated
USING (id = auth.uid())
WITH CHECK (id = auth.uid());

-- 3. Allow users to insert their own profile
CREATE POLICY "allow_insert_own_profile"
ON public.profiles
FOR INSERT
TO authenticated
WITH CHECK (id = auth.uid());

-- Verify
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
WHERE tablename = 'profiles'
ORDER BY policyname;

RAISE NOTICE '✅ Profiles RLS policies updated!';
