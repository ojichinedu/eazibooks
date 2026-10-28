-- =====================================================
-- SUPER SIMPLE FIX - Run this in 3 separate steps
-- =====================================================
-- Copy and run each section ONE AT A TIME
-- Wait for "Success" before running the next one
-- =====================================================

-- =====================================================
-- STEP 1: Create the function
-- Copy this entire block and run it
-- =====================================================

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_company_id UUID;
BEGIN
  -- Create company (using only columns that exist)
  INSERT INTO public.companies (name, email, currency)
  VALUES (
    COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.email, 'User') || '''s Company',
    NEW.email,
    'NGN'
  )
  RETURNING id INTO v_company_id;
  
  -- Create profile
  INSERT INTO public.profiles (id, email, full_name, company_id, role)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.email, 'User'),
    v_company_id,
    'owner'
  )
  ON CONFLICT (id) DO NOTHING;
  
  RETURN NEW;
EXCEPTION
  WHEN OTHERS THEN
    RETURN NEW;
END;
$$;

-- You should see: "Success. No rows returned"
-- Now go to STEP 2

-- =====================================================
-- STEP 2: Create the trigger
-- Copy this entire block and run it
-- =====================================================

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();

-- You should see: "Success. No rows returned"
-- Now go to STEP 3

-- =====================================================
-- STEP 3: Fix existing users
-- First, check who needs fixing
-- =====================================================

SELECT 
  u.email,
  p.company_id,
  CASE 
    WHEN p.company_id IS NULL THEN '❌ NEEDS FIX'
    ELSE '✅ OK'
  END as status
FROM auth.users u
LEFT JOIN public.profiles p ON p.id = u.id
ORDER BY u.created_at;

-- Note which users show "❌ NEEDS FIX"
-- Then run STEP 4 for EACH of them

-- =====================================================
-- STEP 4: Fix ONE user at a time
-- Copy this block for EACH user that needs fixing
-- CHANGE THE EMAIL on line 82 to the actual user email
-- =====================================================

DO $$
DECLARE
  v_user_id UUID;
  v_company_id UUID;
  v_user_email TEXT;
  v_user_name TEXT;
BEGIN
  -- ⚠️ CHANGE THIS EMAIL to the user who needs fixing
  v_user_email := 'user@example.com';
  
  -- Get user info
  SELECT id, raw_user_meta_data->>'full_name'
  INTO v_user_id, v_user_name
  FROM auth.users
  WHERE email = v_user_email;
  
  IF v_user_id IS NULL THEN
    RAISE EXCEPTION 'User not found: %', v_user_email;
  END IF;
  
  -- Create company (without status column)
  INSERT INTO public.companies (name, email, currency)
  VALUES (
    COALESCE(v_user_name, v_user_email, 'User') || '''s Company',
    v_user_email,
    'NGN'
  )
  RETURNING id INTO v_company_id;
  
  -- Update or create profile
  INSERT INTO public.profiles (id, email, full_name, company_id, role)
  VALUES (
    v_user_id,
    v_user_email,
    COALESCE(v_user_name, v_user_email, 'User'),
    v_company_id,
    'owner'
  )
  ON CONFLICT (id) DO UPDATE
  SET company_id = v_company_id;
  
  RAISE NOTICE '✅ Fixed user: %', v_user_email;
  RAISE NOTICE 'Company ID: %', v_company_id;
END $$;

-- Repeat this block for each user that needs fixing
-- Just change the email each time

-- =====================================================
-- STEP 5: Verify all users are fixed
-- =====================================================

SELECT 
  u.email,
  c.name as company_name,
  CASE 
    WHEN p.company_id IS NOT NULL THEN '✅ Fixed'
    ELSE '❌ Still needs fix'
  END as status
FROM auth.users u
LEFT JOIN public.profiles p ON p.id = u.id
LEFT JOIN public.companies c ON c.id = p.company_id
ORDER BY u.created_at;

-- All users should show "✅ Fixed"

-- =====================================================
-- DONE!
-- =====================================================
-- Now tell your users to:
-- 1. Refresh their browser (Ctrl+Shift+R)
-- 2. Or log out and log back in
-- 3. They can now create products!
-- =====================================================
