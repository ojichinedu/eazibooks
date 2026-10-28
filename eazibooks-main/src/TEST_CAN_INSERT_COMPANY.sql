-- =====================================================
-- QUICK TEST: Can I Insert a Company?
-- Run this while logged in to the app
-- =====================================================

-- Check if you're logged in
DO $$
DECLARE
  v_user_id uuid;
  v_user_email text;
  v_company_id uuid;
  v_policy_count int;
BEGIN
  -- Get current user
  v_user_id := auth.uid();
  v_user_email := auth.email();
  
  RAISE NOTICE '';
  RAISE NOTICE '========================================';
  RAISE NOTICE 'COMPANY INSERT TEST';
  RAISE NOTICE '========================================';
  RAISE NOTICE '';
  
  -- Check 1: User logged in?
  IF v_user_id IS NULL THEN
    RAISE NOTICE '❌ FAILED: You are not logged in!';
    RAISE NOTICE '   Solution: Log in to your EaziBook app first';
    RAISE NOTICE '';
    RETURN;
  ELSE
    RAISE NOTICE '✅ PASS: You are logged in';
    RAISE NOTICE '   User ID: %', v_user_id;
    RAISE NOTICE '   Email: %', v_user_email;
    RAISE NOTICE '';
  END IF;
  
  -- Check 2: RLS policies exist?
  SELECT COUNT(*) INTO v_policy_count
  FROM pg_policies 
  WHERE tablename = 'companies' 
    AND cmd = 'INSERT'
    AND roles::text LIKE '%authenticated%';
    
  IF v_policy_count = 0 THEN
    RAISE NOTICE '❌ FAILED: No INSERT policy for authenticated users!';
    RAISE NOTICE '   Solution: Run FIX_ALL_RLS_NOW.sql';
    RAISE NOTICE '';
    RETURN;
  ELSE
    RAISE NOTICE '✅ PASS: INSERT policy exists for authenticated users';
    RAISE NOTICE '';
  END IF;
  
  -- Check 3: Can we actually insert?
  BEGIN
    INSERT INTO companies (name, country, phone, email, address)
    VALUES (
      'Test Company - DELETE ME',
      'Nigeria',
      '+234 123 456 7890',
      'test@example.com',
      'Test Address'
    )
    RETURNING id INTO v_company_id;
    
    RAISE NOTICE '✅ SUCCESS: Company INSERT works!';
    RAISE NOTICE '   Test Company ID: %', v_company_id;
    RAISE NOTICE '';
    RAISE NOTICE '🎉 Your database is configured correctly!';
    RAISE NOTICE '   The app should be able to save company settings.';
    RAISE NOTICE '';
    RAISE NOTICE '   Cleaning up test data...';
    
    -- Clean up
    DELETE FROM companies WHERE id = v_company_id;
    RAISE NOTICE '   ✅ Test company deleted';
    RAISE NOTICE '';
    
  EXCEPTION WHEN OTHERS THEN
    RAISE NOTICE '❌ FAILED: Cannot insert company!';
    RAISE NOTICE '   Error: %', SQLERRM;
    RAISE NOTICE '';
    
    IF SQLERRM LIKE '%row-level security policy%' THEN
      RAISE NOTICE '   Cause: RLS policy is blocking the insert';
      RAISE NOTICE '   Solution: Run FIX_ALL_RLS_NOW.sql';
    ELSIF SQLERRM LIKE '%permission denied%' THEN
      RAISE NOTICE '   Cause: Permission denied';
      RAISE NOTICE '   Solution: Check your Supabase user has correct permissions';
    ELSIF SQLERRM LIKE '%not-null%' OR SQLERRM LIKE '%violates%' THEN
      RAISE NOTICE '   Cause: Missing required fields or constraint violation';
      RAISE NOTICE '   Solution: Check the error message above';
    ELSE
      RAISE NOTICE '   Cause: Unknown error';
      RAISE NOTICE '   Solution: Copy this error and share it';
    END IF;
    RAISE NOTICE '';
    RETURN;
  END;
  
  RAISE NOTICE '========================================';
  RAISE NOTICE 'TEST COMPLETE';
  RAISE NOTICE '========================================';
  
END $$;
