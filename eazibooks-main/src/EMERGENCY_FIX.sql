-- =====================================================
-- EMERGENCY FIX - Run this RIGHT NOW
-- This will fix YOUR current user immediately
-- =====================================================

-- STEP 1: First, let's see what we have
-- =====================================================

SELECT 'Current Auth User:' as info;
SELECT 
  id,
  email,
  raw_user_meta_data->>'full_name' as name
FROM auth.users 
WHERE id = auth.uid();

SELECT 'Current Profile:' as info;
SELECT 
  id,
  email,
  full_name,
  company_id,
  role
FROM public.profiles 
WHERE id = auth.uid();

SELECT 'User Companies:' as info;
SELECT 
  c.id,
  c.name,
  c.email,
  c.currency
FROM public.companies c
JOIN public.profiles p ON p.company_id = c.id
WHERE p.id = auth.uid();

-- =====================================================
-- STEP 2: Fix YOUR user right now
-- =====================================================

DO $$
DECLARE
  v_user_id UUID;
  v_user_email TEXT;
  v_user_name TEXT;
  v_company_id UUID;
  v_profile_exists BOOLEAN;
BEGIN
  -- Get current user
  v_user_id := auth.uid();
  
  IF v_user_id IS NULL THEN
    RAISE EXCEPTION 'You must be logged in to run this script';
  END IF;
  
  -- Get user details
  SELECT email, raw_user_meta_data->>'full_name'
  INTO v_user_email, v_user_name
  FROM auth.users
  WHERE id = v_user_id;
  
  RAISE NOTICE '';
  RAISE NOTICE '========================================';
  RAISE NOTICE 'Fixing user: %', v_user_email;
  RAISE NOTICE '========================================';
  
  -- Check if profile exists
  SELECT EXISTS(SELECT 1 FROM public.profiles WHERE id = v_user_id)
  INTO v_profile_exists;
  
  IF v_profile_exists THEN
    RAISE NOTICE 'Profile exists, checking company...';
    
    -- Get company_id if exists
    SELECT company_id INTO v_company_id
    FROM public.profiles
    WHERE id = v_user_id;
    
    IF v_company_id IS NULL THEN
      RAISE NOTICE 'Profile has no company, creating one...';
      
      -- Create company
      INSERT INTO public.companies (name, email, currency)
      VALUES (
        COALESCE(v_user_name, v_user_email, 'User') || '''s Company',
        v_user_email,
        'NGN'
      )
      RETURNING id INTO v_company_id;
      
      RAISE NOTICE 'Created company: %', v_company_id;
      
      -- Update profile
      UPDATE public.profiles
      SET company_id = v_company_id
      WHERE id = v_user_id;
      
      RAISE NOTICE 'Linked company to profile';
    ELSE
      RAISE NOTICE 'Profile already has company: %', v_company_id;
    END IF;
  ELSE
    RAISE NOTICE 'Profile does not exist, creating...';
    
    -- Create company first
    INSERT INTO public.companies (name, email, currency)
    VALUES (
      COALESCE(v_user_name, v_user_email, 'User') || '''s Company',
      v_user_email,
      'NGN'
    )
    RETURNING id INTO v_company_id;
    
    RAISE NOTICE 'Created company: %', v_company_id;
    
    -- Create profile
    INSERT INTO public.profiles (id, email, full_name, company_id, role)
    VALUES (
      v_user_id,
      v_user_email,
      COALESCE(v_user_name, v_user_email, 'User'),
      v_company_id,
      'owner'
    );
    
    RAISE NOTICE 'Created profile with company';
  END IF;
  
  RAISE NOTICE '';
  RAISE NOTICE '✅ YOUR USER IS FIXED!';
  RAISE NOTICE '========================================';
  RAISE NOTICE '';
  RAISE NOTICE 'IMPORTANT: Now do this:';
  RAISE NOTICE '1. Press Ctrl+Shift+R to hard refresh';
  RAISE NOTICE '2. Or log out and log back in';
  RAISE NOTICE '3. Then try creating a product';
  RAISE NOTICE '';
END $$;

-- =====================================================
-- STEP 3: Verify the fix
-- =====================================================

SELECT 'Verification - Your Profile:' as info;
SELECT 
  p.id,
  p.email,
  p.full_name,
  p.company_id,
  p.role,
  c.name as company_name,
  CASE 
    WHEN p.company_id IS NOT NULL THEN '✅ Ready to create products'
    ELSE '❌ Still broken'
  END as status
FROM public.profiles p
LEFT JOIN public.companies c ON c.id = p.company_id
WHERE p.id = auth.uid();

-- =====================================================
-- SUCCESS!
-- =====================================================

DO $$
BEGIN
  RAISE NOTICE '';
  RAISE NOTICE '========================================';
  RAISE NOTICE '✅ DONE!';
  RAISE NOTICE '========================================';
  RAISE NOTICE '';
  RAISE NOTICE 'Now:';
  RAISE NOTICE '1. Close this SQL Editor';
  RAISE NOTICE '2. Go back to your EaziBook app';
  RAISE NOTICE '3. Press Ctrl+Shift+R (hard refresh)';
  RAISE NOTICE '4. Try to create a product';
  RAISE NOTICE '5. It should work!';
  RAISE NOTICE '';
  RAISE NOTICE 'If it still fails, copy the error and let me know';
  RAISE NOTICE '';
END $$;
