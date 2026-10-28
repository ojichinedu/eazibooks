-- =====================================================
-- VERIFY ALL RLS POLICIES
-- Run this to check if all policies were created
-- =====================================================

-- Check COMPANIES table policies (THIS IS THE IMPORTANT ONE)
SELECT '========== COMPANIES TABLE ==========' as info;
SELECT 
  policyname, 
  cmd as operation,
  roles,
  CASE 
    WHEN roles::text LIKE '%authenticated%' THEN '✅ OK'
    ELSE '❌ MISSING authenticated'
  END as status
FROM pg_policies 
WHERE tablename = 'companies'
ORDER BY policyname;

-- Check PROFILES table policies
SELECT '========== PROFILES TABLE ==========' as info;
SELECT 
  policyname, 
  cmd as operation,
  roles,
  CASE 
    WHEN roles::text LIKE '%authenticated%' THEN '✅ OK'
    ELSE '❌ MISSING authenticated'
  END as status
FROM pg_policies 
WHERE tablename = 'profiles'
ORDER BY policyname;

-- Check SUBSCRIPTIONS table policies
SELECT '========== SUBSCRIPTIONS TABLE ==========' as info;
SELECT 
  policyname, 
  cmd as operation,
  roles,
  CASE 
    WHEN roles::text LIKE '%authenticated%' THEN '✅ OK'
    ELSE '❌ MISSING authenticated'
  END as status
FROM pg_policies 
WHERE tablename = 'subscriptions'
ORDER BY policyname;

-- Summary
SELECT '========== SUMMARY ==========' as info;
SELECT 
  tablename,
  COUNT(*) as policy_count,
  CASE 
    WHEN COUNT(*) >= 3 THEN '✅ Has policies'
    ELSE '❌ Missing policies'
  END as status
FROM pg_policies 
WHERE tablename IN ('companies', 'profiles', 'subscriptions')
GROUP BY tablename
ORDER BY tablename;
