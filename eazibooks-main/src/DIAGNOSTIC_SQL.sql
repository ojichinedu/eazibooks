-- =====================================================
-- DIAGNOSTIC SCRIPT FOR "FAILED TO ADD PRODUCT" ERROR
-- =====================================================
-- Run this in Supabase SQL Editor to diagnose the issue
-- Copy the results and check against the guide below
-- =====================================================

-- TEST 1: Check if you're authenticated
-- =====================================================
SELECT 
  CASE 
    WHEN auth.uid() IS NOT NULL THEN '✅ PASS: User is authenticated'
    ELSE '❌ FAIL: No user authenticated - please log in'
  END as test_1_authentication,
  auth.uid() as user_id,
  auth.email() as email;

-- TEST 2: Check if profile exists
-- =====================================================
SELECT 
  CASE 
    WHEN EXISTS(SELECT 1 FROM profiles WHERE id = auth.uid()) THEN '✅ PASS: Profile exists'
    ELSE '❌ FAIL: Profile not found - need to create profile'
  END as test_2_profile,
  (SELECT id FROM profiles WHERE id = auth.uid()) as profile_id;

-- TEST 3: Check if profile has company_id
-- =====================================================
SELECT 
  CASE 
    WHEN (SELECT company_id FROM profiles WHERE id = auth.uid()) IS NOT NULL 
    THEN '✅ PASS: Profile has company_id'
    ELSE '❌ FAIL: Profile missing company_id - THIS IS THE PROBLEM!'
  END as test_3_company_link,
  (SELECT company_id FROM profiles WHERE id = auth.uid()) as company_id;

-- TEST 4: Check if company exists
-- =====================================================
SELECT 
  CASE 
    WHEN EXISTS(
      SELECT 1 FROM companies 
      WHERE id = (SELECT company_id FROM profiles WHERE id = auth.uid())
    ) THEN '✅ PASS: Company exists'
    ELSE '❌ FAIL: Company not found'
  END as test_4_company,
  (SELECT name FROM companies WHERE id = (SELECT company_id FROM profiles WHERE id = auth.uid())) as company_name;

-- TEST 5: Check RLS policies on products table
-- =====================================================
SELECT 
  CASE 
    WHEN COUNT(*) >= 4 THEN '✅ PASS: Products table has RLS policies (' || COUNT(*) || ' policies)'
    ELSE '❌ FAIL: Products table missing RLS policies (' || COUNT(*) || ' found, need 4)'
  END as test_5_rls_policies
FROM pg_policies 
WHERE tablename = 'products' AND schemaname = 'public';

-- TEST 6: List all product policies
-- =====================================================
SELECT 
  '📋 Product Table Policies:' as info,
  policyname,
  cmd as operation
FROM pg_policies 
WHERE tablename = 'products' AND schemaname = 'public'
ORDER BY cmd;

-- TEST 7: Test insert permission (DRY RUN)
-- =====================================================
SELECT 
  CASE 
    WHEN (SELECT company_id FROM profiles WHERE id = auth.uid()) IS NOT NULL 
    THEN '✅ PASS: Ready to insert - company_id found'
    ELSE '❌ FAIL: Cannot insert - no company_id'
  END as test_7_insert_ready,
  (SELECT company_id FROM profiles WHERE id = auth.uid()) as will_use_company_id;

-- =====================================================
-- SUMMARY
-- =====================================================
SELECT 
  '=' as separator,
  'DIAGNOSTIC SUMMARY' as title,
  '=' as separator;

SELECT 
  CASE 
    WHEN auth.uid() IS NULL THEN '❌ Not logged in'
    WHEN NOT EXISTS(SELECT 1 FROM profiles WHERE id = auth.uid()) THEN '❌ Profile missing'
    WHEN (SELECT company_id FROM profiles WHERE id = auth.uid()) IS NULL THEN '❌ Company ID missing'
    WHEN (SELECT COUNT(*) FROM pg_policies WHERE tablename = 'products' AND schemaname = 'public') < 4 THEN '❌ RLS policies missing'
    ELSE '✅ ALL CHECKS PASSED - Should work!'
  END as overall_status;

-- =====================================================
-- WHAT TO DO BASED ON RESULTS
-- =====================================================
/*

IF YOU SEE:
-----------

❌ FAIL: No user authenticated
→ You need to be logged in to your application when running this
→ Log in to your app, then run this script again

❌ FAIL: Profile not found
→ Run this to create profile:
   INSERT INTO profiles (id, email, full_name)
   SELECT auth.uid(), auth.email(), COALESCE(auth.email(), 'User');

❌ FAIL: Profile missing company_id
→ THIS IS USUALLY THE PROBLEM!
→ Run the QUICK FIX below

❌ FAIL: Company not found
→ Run the QUICK FIX below

❌ FAIL: Products table missing RLS policies
→ Re-run the COMPLETE_RLS_AND_SETUP_FIX.sql script

✅ ALL CHECKS PASSED
→ Issue might be in frontend code
→ Check browser console for errors
→ Try hard refresh (Ctrl+Shift+R)

*/

-- =====================================================
-- QUICK FIX: Create Company and Link to Profile
-- =====================================================
/*
If company_id is missing, run this:

DO $$
DECLARE
  v_user_id UUID;
  v_company_id UUID;
  v_existing_company_id UUID;
BEGIN
  v_user_id := auth.uid();
  
  IF v_user_id IS NULL THEN
    RAISE EXCEPTION 'Not authenticated - please log in first';
  END IF;
  
  -- Check if profile already has a company
  SELECT company_id INTO v_existing_company_id 
  FROM profiles 
  WHERE id = v_user_id;
  
  IF v_existing_company_id IS NOT NULL THEN
    RAISE NOTICE 'Profile already has company_id: %', v_existing_company_id;
  ELSE
    -- Create new company
    INSERT INTO public.companies (name, email, currency, status)
    VALUES ('My Company', 'contact@mycompany.com', 'NGN', 'active')
    RETURNING id INTO v_company_id;
    
    -- Link to profile
    UPDATE public.profiles
    SET company_id = v_company_id
    WHERE id = v_user_id;
    
    RAISE NOTICE '✅ SUCCESS! Created company and linked to profile';
    RAISE NOTICE 'Company ID: %', v_company_id;
    RAISE NOTICE 'User ID: %', v_user_id;
    RAISE NOTICE '';
    RAISE NOTICE 'Next steps:';
    RAISE NOTICE '1. Hard refresh your browser (Ctrl+Shift+R)';
    RAISE NOTICE '2. Try creating a product again';
  END IF;
END $$;

*/
