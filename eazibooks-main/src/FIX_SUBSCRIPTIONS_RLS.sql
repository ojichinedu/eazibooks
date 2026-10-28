-- =====================================================
-- FIX SUBSCRIPTIONS RLS POLICIES
-- Run this after the other fixes
-- =====================================================

-- Drop existing policies
DROP POLICY IF EXISTS "User can view their subscription" ON public.subscriptions;
DROP POLICY IF EXISTS "User can insert their subscription" ON public.subscriptions;
DROP POLICY IF EXISTS "User can update their subscription" ON public.subscriptions;

-- Create new policies

-- 1. Allow users to view their own subscriptions
CREATE POLICY "allow_select_own_subscription"
ON public.subscriptions
FOR SELECT
TO authenticated
USING (
  user_id = auth.uid() 
  OR company_id IN (
    SELECT company_id 
    FROM public.profiles 
    WHERE id = auth.uid()
  )
);

-- 2. Allow users to insert their own subscription
CREATE POLICY "allow_insert_own_subscription"
ON public.subscriptions
FOR INSERT
TO authenticated
WITH CHECK (user_id = auth.uid());

-- 3. Allow users to update their own subscription
CREATE POLICY "allow_update_own_subscription"
ON public.subscriptions
FOR UPDATE
TO authenticated
USING (user_id = auth.uid())
WITH CHECK (user_id = auth.uid());

-- Verify
SELECT 
  tablename, 
  policyname, 
  cmd as operation,
  roles
FROM pg_policies 
WHERE tablename = 'subscriptions'
ORDER BY policyname;

RAISE NOTICE '✅ Subscriptions RLS policies updated!';
