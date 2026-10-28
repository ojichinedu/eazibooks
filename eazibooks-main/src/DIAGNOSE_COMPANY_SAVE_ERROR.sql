-- =====================================================
-- DIAGNOSE COMPANY SAVE ERROR
-- This will check exactly what's preventing company saves
-- =====================================================

-- Step 1: Check if you're logged in
SELECT 'Step 1: Current User' as step;
SELECT 
  auth.uid() as user_id,
  auth.email() as user_email,
  CASE 
    WHEN auth.uid() IS NULL THEN '❌ NOT LOGGED IN - This is the problem!'
    ELSE '✅ User is authenticated'
  END as status;

-- Step 2: Check if profile exists for current user
SELECT 'Step 2: User Profile' as step;
SELECT 
  id,
  company_id,
  created_at,
  CASE 
    WHEN company_id IS NULL THEN '⚠️ No company linked to profile'
    ELSE '✅ Company linked: ' || company_id::text
  END as status
FROM profiles 
WHERE id = auth.uid();

-- Step 3: Check companies RLS policies
SELECT 'Step 3: Companies Table RLS Policies' as step;
SELECT 
  policyname,
  cmd as operation,
  roles,
  CASE 
    WHEN roles::text LIKE '%authenticated%' THEN '✅ Has authenticated role'
    ELSE '❌ MISSING authenticated role - This is the problem!'
  END as status
FROM pg_policies 
WHERE tablename = 'companies'
ORDER BY cmd;

-- Step 4: Check if RLS is enabled
SELECT 'Step 4: RLS Status on Companies Table' as step;
SELECT 
  schemaname,
  tablename,
  rowsecurity as rls_enabled,
  CASE 
    WHEN rowsecurity = true THEN '✅ RLS is enabled'
    ELSE '❌ RLS is not enabled'
  END as status
FROM pg_tables 
WHERE tablename = 'companies';

-- Step 5: Check profiles RLS policies
SELECT 'Step 5: Profiles Table RLS Policies' as step;
SELECT 
  policyname,
  cmd as operation,
  roles,
  CASE 
    WHEN roles::text LIKE '%authenticated%' THEN '✅ Has authenticated role'
    ELSE '❌ MISSING authenticated role'
  END as status
FROM pg_policies 
WHERE tablename = 'profiles'
ORDER BY cmd;

-- Step 6: Try to manually test INSERT (this will show the actual error)
SELECT 'Step 6: Test Company INSERT' as step;

DO $$
DECLARE
  v_user_id uuid;
  v_company_id uuid;
  v_error_message text;
BEGIN
  -- Get current user
  v_user_id := auth.uid();
  
  IF v_user_id IS NULL THEN
    RAISE NOTICE '❌ ERROR: No authenticated user. You must be logged in to the app!';
    RETURN;
  END IF;
  
  RAISE NOTICE '✅ User ID: %', v_user_id;
  
  -- Try to insert a test company
  BEGIN
    INSERT INTO companies (name, country)
    VALUES ('Test Company', 'Nigeria')
    RETURNING id INTO v_company_id;
    
    RAISE NOTICE '✅ SUCCESS: Can insert companies! ID: %', v_company_id;
    
    -- Clean up test data
    DELETE FROM companies WHERE id = v_company_id;
    RAISE NOTICE '✅ Test data cleaned up';
    
  EXCEPTION WHEN OTHERS THEN
    GET STACKED DIAGNOSTICS v_error_message = MESSAGE_TEXT;
    RAISE NOTICE '❌ INSERT FAILED: %', v_error_message;
    RAISE NOTICE 'This is why company save is failing!';
  END;
END $$;

-- Step 7: Summary
SELECT 'Step 7: Summary & Next Steps' as step;
SELECT 
  'If Step 1 shows NOT LOGGED IN: Log in to the app first' as issue_1,
  'If Step 3 shows MISSING authenticated role: Run FIX_ALL_RLS_NOW.sql' as issue_2,
  'If Step 6 shows INSERT FAILED: Check the error message above' as issue_3;
