-- =====================================================
-- SIMPLE FIX - Run this if the other script has errors
-- =====================================================
-- This is a simplified version that fixes existing users
-- and sets up auto-creation for new signups
-- =====================================================

-- PART 1: Create the function (copy and run this first)
-- =====================================================

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_company_id UUID;
  v_company_name TEXT;
BEGIN
  v_company_name := COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.email, 'My Company');
  
  INSERT INTO public.companies (name, email, currency, status)
  VALUES (v_company_name || '''s Company', NEW.email, 'NGN', 'active')
  RETURNING id INTO v_company_id;
  
  INSERT INTO public.profiles (id, email, full_name, company_id, role)
  VALUES (NEW.id, NEW.email, COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.email, 'User'), v_company_id, 'owner');
  
  RETURN NEW;
EXCEPTION
  WHEN OTHERS THEN
    RETURN NEW;
END;
$$;

-- PART 2: Create the trigger (copy and run this second)
-- =====================================================

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();

-- PART 3: Fix each existing user one by one
-- =====================================================
-- IMPORTANT: You need to run this FOR EACH user who doesn't have a company
-- Replace 'user@example.com' with the actual user email

-- First, check which users need fixing:
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

-- For each user showing "❌ NEEDS FIX", run this:
-- (Replace 'user@example.com' with their email)

DO $$
DECLARE
  v_user_id UUID;
  v_company_id UUID;
  v_user_email TEXT;
  v_user_name TEXT;
BEGIN
  -- CHANGE THIS EMAIL to the user who needs fixing
  v_user_email := 'user@example.com';
  
  -- Get user info
  SELECT id, raw_user_meta_data->>'full_name'
  INTO v_user_id, v_user_name
  FROM auth.users
  WHERE email = v_user_email;
  
  IF v_user_id IS NULL THEN
    RAISE EXCEPTION 'User not found: %', v_user_email;
  END IF;
  
  -- Create company
  INSERT INTO public.companies (name, email, currency, status)
  VALUES (
    COALESCE(v_user_name, v_user_email, 'User') || '''s Company',
    v_user_email,
    'NGN',
    'active'
  )
  RETURNING id INTO v_company_id;
  
  -- Check if profile exists
  IF EXISTS (SELECT 1 FROM public.profiles WHERE id = v_user_id) THEN
    -- Update existing profile
    UPDATE public.profiles
    SET company_id = v_company_id
    WHERE id = v_user_id;
    RAISE NOTICE 'Updated profile for: %', v_user_email;
  ELSE
    -- Create new profile
    INSERT INTO public.profiles (id, email, full_name, company_id, role)
    VALUES (
      v_user_id,
      v_user_email,
      COALESCE(v_user_name, v_user_email, 'User'),
      v_company_id,
      'owner'
    );
    RAISE NOTICE 'Created profile for: %', v_user_email;
  END IF;
  
  RAISE NOTICE '✅ Fixed user: %', v_user_email;
  RAISE NOTICE 'Company ID: %', v_company_id;
END $$;

-- After running for all users, verify:
SELECT 
  u.email,
  c.name as company_name,
  CASE 
    WHEN p.company_id IS NOT NULL THEN '✅ Fixed'
    ELSE '❌ Still broken'
  END as status
FROM auth.users u
LEFT JOIN public.profiles p ON p.id = u.id
LEFT JOIN public.companies c ON c.id = p.company_id
ORDER BY u.created_at;
