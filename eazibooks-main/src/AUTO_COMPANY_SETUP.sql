-- =====================================================
-- AUTO COMPANY SETUP FOR ALL USERS
-- This ensures EVERY user automatically gets a company
-- =====================================================
-- Run this ONCE in Supabase SQL Editor
-- After this, all new signups will auto-create companies
-- =====================================================

BEGIN;

-- =====================================================
-- STEP 1: Create function to auto-create company for new users
-- =====================================================

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
  v_company_id UUID;
  v_company_name TEXT;
BEGIN
  -- Create a company for this new user
  v_company_name := COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.email, 'My Company');
  
  INSERT INTO public.companies (name, email, currency, status)
  VALUES (
    v_company_name || '''s Company',
    NEW.email,
    'NGN',
    'active'
  )
  RETURNING id INTO v_company_id;
  
  -- Create profile with company_id
  INSERT INTO public.profiles (id, email, full_name, company_id, role)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.email, 'User'),
    v_company_id,
    'owner'
  );
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =====================================================
-- STEP 2: Drop old trigger if exists and create new one
-- =====================================================

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();

-- =====================================================
-- STEP 3: Fix ALL existing users who don't have company_id
-- =====================================================

DO $$
DECLARE
  v_user RECORD;
  v_company_id UUID;
  v_company_name TEXT;
BEGIN
  -- Loop through all users who don't have a company_id
  FOR v_user IN 
    SELECT 
      u.id,
      u.email,
      u.raw_user_meta_data->>'full_name' as full_name,
      p.id as profile_id,
      p.company_id
    FROM auth.users u
    LEFT JOIN public.profiles p ON p.id = u.id
    WHERE p.company_id IS NULL OR p.id IS NULL
  LOOP
    RAISE NOTICE 'Processing user: % (%)', v_user.email, v_user.id;
    
    -- Create company name
    v_company_name := COALESCE(v_user.full_name, v_user.email, 'User');
    
    -- Create a company for this user
    INSERT INTO public.companies (name, email, currency, status)
    VALUES (
      v_company_name || '''s Company',
      v_user.email,
      'NGN',
      'active'
    )
    RETURNING id INTO v_company_id;
    
    RAISE NOTICE '  Created company: %', v_company_id;
    
    -- Check if profile exists
    IF v_user.profile_id IS NOT NULL THEN
      -- Update existing profile
      UPDATE public.profiles
      SET company_id = v_company_id
      WHERE id = v_user.id;
      
      RAISE NOTICE '  Updated existing profile';
    ELSE
      -- Create new profile
      INSERT INTO public.profiles (id, email, full_name, company_id, role)
      VALUES (
        v_user.id,
        v_user.email,
        COALESCE(v_user.full_name, v_user.email, 'User'),
        v_company_id,
        'owner'
      );
      
      RAISE NOTICE '  Created new profile';
    END IF;
    
    RAISE NOTICE '  ✅ User setup complete!';
    RAISE NOTICE '';
  END LOOP;
  
  RAISE NOTICE '========================================';
  RAISE NOTICE '✅ ALL USERS NOW HAVE COMPANIES!';
  RAISE NOTICE '========================================';
END $$;

COMMIT;

-- =====================================================
-- STEP 4: Verify all users have companies
-- =====================================================

SELECT 
  '📊 VERIFICATION RESULTS' as title,
  '========================' as separator;

SELECT 
  COUNT(*) as total_users,
  COUNT(p.company_id) as users_with_company,
  COUNT(*) - COUNT(p.company_id) as users_without_company
FROM auth.users u
LEFT JOIN public.profiles p ON p.id = u.id;

-- =====================================================
-- STEP 5: Show all users and their company status
-- =====================================================

SELECT 
  u.email,
  p.company_id,
  c.name as company_name,
  CASE 
    WHEN p.company_id IS NOT NULL THEN '✅ Ready'
    ELSE '❌ Missing Company'
  END as status
FROM auth.users u
LEFT JOIN public.profiles p ON p.id = u.id
LEFT JOIN public.companies c ON c.id = p.company_id
ORDER BY u.created_at;

-- =====================================================
-- SUCCESS MESSAGE
-- =====================================================

DO $$
BEGIN
  RAISE NOTICE '';
  RAISE NOTICE '========================================';
  RAISE NOTICE '✅✅✅ AUTO SETUP COMPLETE! ✅✅✅';
  RAISE NOTICE '========================================';
  RAISE NOTICE '';
  RAISE NOTICE 'What was done:';
  RAISE NOTICE '1. ✅ Created trigger for auto company creation';
  RAISE NOTICE '2. ✅ Fixed all existing users';
  RAISE NOTICE '3. ✅ All new signups will auto-create companies';
  RAISE NOTICE '';
  RAISE NOTICE 'What to do now:';
  RAISE NOTICE '1. Check the verification results above';
  RAISE NOTICE '2. Tell all users to refresh their browser (Ctrl+Shift+R)';
  RAISE NOTICE '3. Tell users to log out and log back in';
  RAISE NOTICE '4. They can now create products!';
  RAISE NOTICE '';
  RAISE NOTICE '========================================';
END $$;
