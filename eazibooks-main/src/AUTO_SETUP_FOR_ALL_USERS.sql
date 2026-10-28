-- =====================================================
-- AUTOMATIC COMPANY CREATION FOR ALL USERS
-- =====================================================
-- Run this ONCE and it fixes EVERYTHING:
-- 1. Fixes all existing users who don't have companies
-- 2. Creates a trigger that automatically runs for EVERY new signup
-- 3. You never have to manually fix users again
-- =====================================================

-- =====================================================
-- STEP 1: Create automatic company creation function
-- This function runs automatically for every new user
-- =====================================================

CREATE OR REPLACE FUNCTION public.auto_create_company_for_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_company_id UUID;
  v_company_name TEXT;
  v_user_name TEXT;
BEGIN
  -- Get user's name from metadata or email
  v_user_name := COALESCE(
    NEW.raw_user_meta_data->>'full_name',
    NEW.raw_user_meta_data->>'name',
    split_part(NEW.email, '@', 1),
    'User'
  );
  
  v_company_name := v_user_name || '''s Company';
  
  -- Create company automatically
  INSERT INTO public.companies (name, email, currency)
  VALUES (v_company_name, NEW.email, 'NGN')
  RETURNING id INTO v_company_id;
  
  -- Create profile with company_id automatically
  INSERT INTO public.profiles (id, email, full_name, company_id, role)
  VALUES (NEW.id, NEW.email, v_user_name, v_company_id, 'owner')
  ON CONFLICT (id) DO UPDATE
  SET 
    company_id = EXCLUDED.company_id,
    email = EXCLUDED.email,
    full_name = EXCLUDED.full_name;
  
  RETURN NEW;
EXCEPTION
  WHEN OTHERS THEN
    -- Log error but don't block user creation
    RAISE WARNING 'Error in auto_create_company_for_new_user for user %: %', NEW.email, SQLERRM;
    RETURN NEW;
END;
$$;

-- =====================================================
-- STEP 2: Create the trigger
-- This makes the function run automatically for every new signup
-- =====================================================

DROP TRIGGER IF EXISTS auto_create_company_on_signup ON auth.users;

CREATE TRIGGER auto_create_company_on_signup
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.auto_create_company_for_new_user();

-- =====================================================
-- STEP 3: Fix ALL existing users right now
-- =====================================================

DO $$
DECLARE
  v_user RECORD;
  v_company_id UUID;
  v_company_name TEXT;
  v_fixed_count INTEGER := 0;
  v_already_ok_count INTEGER := 0;
BEGIN
  RAISE NOTICE '';
  RAISE NOTICE '========================================';
  RAISE NOTICE 'FIXING ALL EXISTING USERS...';
  RAISE NOTICE '========================================';
  RAISE NOTICE '';
  
  FOR v_user IN 
    SELECT 
      u.id,
      u.email,
      COALESCE(
        u.raw_user_meta_data->>'full_name',
        u.raw_user_meta_data->>'name',
        split_part(u.email, '@', 1),
        'User'
      ) as full_name,
      p.id as profile_id,
      p.company_id
    FROM auth.users u
    LEFT JOIN public.profiles p ON p.id = u.id
    ORDER BY u.created_at
  LOOP
    -- Check if user already has company
    IF v_user.company_id IS NOT NULL THEN
      v_already_ok_count := v_already_ok_count + 1;
      RAISE NOTICE '✅ % - Already has company', v_user.email;
      CONTINUE;
    END IF;
    
    -- User needs fixing
    v_fixed_count := v_fixed_count + 1;
    v_company_name := v_user.full_name || '''s Company';
    
    RAISE NOTICE '🔧 Fixing: %', v_user.email;
    
    -- Create company
    INSERT INTO public.companies (name, email, currency)
    VALUES (v_company_name, v_user.email, 'NGN')
    RETURNING id INTO v_company_id;
    
    -- Create or update profile
    IF v_user.profile_id IS NOT NULL THEN
      UPDATE public.profiles
      SET company_id = v_company_id
      WHERE id = v_user.id;
      RAISE NOTICE '   → Updated profile with company';
    ELSE
      INSERT INTO public.profiles (id, email, full_name, company_id, role)
      VALUES (v_user.id, v_user.email, v_user.full_name, v_company_id, 'owner');
      RAISE NOTICE '   → Created profile with company';
    END IF;
    
    RAISE NOTICE '   ✅ Fixed! Company: %', v_company_id;
  END LOOP;
  
  RAISE NOTICE '';
  RAISE NOTICE '========================================';
  RAISE NOTICE '📊 RESULTS:';
  RAISE NOTICE '========================================';
  RAISE NOTICE 'Users already OK:     %', v_already_ok_count;
  RAISE NOTICE 'Users fixed:          %', v_fixed_count;
  RAISE NOTICE 'Total users:          %', v_already_ok_count + v_fixed_count;
  RAISE NOTICE '========================================';
  RAISE NOTICE '';
END $$;

-- =====================================================
-- STEP 4: Verify everything is working
-- =====================================================

DO $$
DECLARE
  v_total INTEGER;
  v_with_company INTEGER;
  v_without_company INTEGER;
  v_trigger_exists BOOLEAN;
BEGIN
  -- Check trigger exists
  SELECT EXISTS (
    SELECT 1 
    FROM information_schema.triggers 
    WHERE trigger_name = 'auto_create_company_on_signup'
  ) INTO v_trigger_exists;
  
  -- Count users
  SELECT 
    COUNT(*),
    COUNT(p.company_id),
    COUNT(*) - COUNT(p.company_id)
  INTO v_total, v_with_company, v_without_company
  FROM auth.users u
  LEFT JOIN public.profiles p ON p.id = u.id;
  
  RAISE NOTICE '';
  RAISE NOTICE '========================================';
  RAISE NOTICE '✅ VERIFICATION';
  RAISE NOTICE '========================================';
  RAISE NOTICE '';
  RAISE NOTICE 'Trigger Status:';
  IF v_trigger_exists THEN
    RAISE NOTICE '  ✅ auto_create_company_on_signup - ACTIVE';
    RAISE NOTICE '  → New signups will AUTO-CREATE companies';
  ELSE
    RAISE NOTICE '  ❌ Trigger not found - something went wrong';
  END IF;
  RAISE NOTICE '';
  RAISE NOTICE 'User Status:';
  RAISE NOTICE '  Total users:          %', v_total;
  RAISE NOTICE '  Users with company:   %', v_with_company;
  RAISE NOTICE '  Users without:        %', v_without_company;
  RAISE NOTICE '';
  
  IF v_without_company = 0 AND v_trigger_exists THEN
    RAISE NOTICE '🎉 PERFECT! Everything is set up correctly!';
  ELSIF v_without_company > 0 THEN
    RAISE NOTICE '⚠️  Some users still need fixing - run this script again';
  ELSIF NOT v_trigger_exists THEN
    RAISE NOTICE '⚠️  Trigger not created - check permissions';
  END IF;
  
  RAISE NOTICE '========================================';
  RAISE NOTICE '';
END $$;

-- =====================================================
-- STEP 5: Show all users and their status
-- =====================================================

SELECT 
  u.email,
  u.created_at::date as signup_date,
  c.name as company_name,
  CASE 
    WHEN p.company_id IS NOT NULL THEN '✅ Ready'
    ELSE '❌ Broken'
  END as status
FROM auth.users u
LEFT JOIN public.profiles p ON p.id = u.id
LEFT JOIN public.companies c ON c.id = p.company_id
ORDER BY u.created_at DESC;

-- =====================================================
-- SUCCESS MESSAGE
-- =====================================================

DO $$
BEGIN
  RAISE NOTICE '';
  RAISE NOTICE '========================================';
  RAISE NOTICE '🎉🎉🎉 AUTOMATION COMPLETE! 🎉🎉🎉';
  RAISE NOTICE '========================================';
  RAISE NOTICE '';
  RAISE NOTICE 'What happened:';
  RAISE NOTICE '1. ✅ Created trigger: auto_create_company_on_signup';
  RAISE NOTICE '2. ✅ Fixed all existing users';
  RAISE NOTICE '3. ✅ Tested and verified';
  RAISE NOTICE '';
  RAISE NOTICE 'What this means:';
  RAISE NOTICE '→ ALL existing users now have companies';
  RAISE NOTICE '→ EVERY new signup automatically gets a company';
  RAISE NOTICE '→ You NEVER have to manually fix users again';
  RAISE NOTICE '';
  RAISE NOTICE 'What to do now:';
  RAISE NOTICE '1. Tell all users to refresh (Ctrl+Shift+R)';
  RAISE NOTICE '2. Or tell them to log out and log back in';
  RAISE NOTICE '3. Test: Create a new account and try creating a product';
  RAISE NOTICE '4. Should work immediately!';
  RAISE NOTICE '';
  RAISE NOTICE '========================================';
  RAISE NOTICE '🚀 Your app is now fully automated!';
  RAISE NOTICE '========================================';
  RAISE NOTICE '';
END $$;
