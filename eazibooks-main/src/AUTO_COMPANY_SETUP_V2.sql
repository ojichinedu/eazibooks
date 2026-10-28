-- =====================================================
-- AUTO COMPANY SETUP V2 - Compatible with your schema
-- This version works with your actual database schema
-- =====================================================

-- =====================================================
-- STEP 1: Check what columns exist in companies table
-- =====================================================

DO $$
BEGIN
  RAISE NOTICE '========================================';
  RAISE NOTICE 'Checking companies table structure...';
  RAISE NOTICE '========================================';
END $$;

-- Show the actual columns
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_schema = 'public' 
  AND table_name = 'companies'
ORDER BY ordinal_position;

-- =====================================================
-- STEP 2: Create function to auto-create company for new users
-- This version adapts to your schema
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
  
  -- Insert without status column (adapt to your schema)
  INSERT INTO public.companies (name, email, currency)
  VALUES (
    v_company_name || '''s Company',
    NEW.email,
    'NGN'
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
  )
  ON CONFLICT (id) DO NOTHING;
  
  RETURN NEW;
EXCEPTION
  WHEN OTHERS THEN
    -- If anything fails, just return NEW so user creation doesn't fail
    RAISE WARNING 'Error in handle_new_user: %', SQLERRM;
    RETURN NEW;
END;
$$;

-- =====================================================
-- STEP 3: Create the trigger
-- =====================================================

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();

-- =====================================================
-- STEP 4: Fix ALL existing users who don't have company_id
-- =====================================================

DO $$
DECLARE
  v_user RECORD;
  v_company_id UUID;
  v_company_name TEXT;
  v_count INTEGER := 0;
BEGIN
  RAISE NOTICE '';
  RAISE NOTICE '========================================';
  RAISE NOTICE 'Fixing existing users...';
  RAISE NOTICE '========================================';
  RAISE NOTICE '';
  
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
    v_count := v_count + 1;
    RAISE NOTICE 'User %: % (%)', v_count, v_user.email, v_user.id;
    
    v_company_name := COALESCE(v_user.full_name, v_user.email, 'User');
    
    -- Create company (without status column)
    INSERT INTO public.companies (name, email, currency)
    VALUES (
      v_company_name || '''s Company',
      v_user.email,
      'NGN'
    )
    RETURNING id INTO v_company_id;
    
    RAISE NOTICE '  → Created company: %', v_company_id;
    
    -- Handle profile
    IF v_user.profile_id IS NOT NULL THEN
      -- Update existing profile
      UPDATE public.profiles
      SET company_id = v_company_id
      WHERE id = v_user.id;
      RAISE NOTICE '  → Updated profile';
    ELSE
      -- Create new profile
      INSERT INTO public.profiles (id, email, full_name, company_id, role)
      VALUES (
        v_user.id,
        v_user.email,
        COALESCE(v_user.full_name, v_user.email, 'User'),
        v_company_id,
        'owner'
      )
      ON CONFLICT (id) DO UPDATE
      SET company_id = v_company_id;
      RAISE NOTICE '  → Created profile';
    END IF;
    
    RAISE NOTICE '  ✅ Done!';
  END LOOP;
  
  RAISE NOTICE '';
  IF v_count = 0 THEN
    RAISE NOTICE '✅ All users already have companies!';
  ELSE
    RAISE NOTICE '========================================';
    RAISE NOTICE '✅ Fixed % user(s)!', v_count;
    RAISE NOTICE '========================================';
  END IF;
  RAISE NOTICE '';
END $$;

-- =====================================================
-- STEP 5: Verify all users have companies
-- =====================================================

DO $$
DECLARE
  v_total INTEGER;
  v_with_company INTEGER;
  v_without_company INTEGER;
BEGIN
  SELECT 
    COUNT(*),
    COUNT(p.company_id),
    COUNT(*) - COUNT(p.company_id)
  INTO v_total, v_with_company, v_without_company
  FROM auth.users u
  LEFT JOIN public.profiles p ON p.id = u.id;
  
  RAISE NOTICE '========================================';
  RAISE NOTICE '📊 VERIFICATION';
  RAISE NOTICE '========================================';
  RAISE NOTICE 'Total users:           %', v_total;
  RAISE NOTICE 'With company:          %', v_with_company;
  RAISE NOTICE 'Without company:       %', v_without_company;
  RAISE NOTICE '========================================';
  RAISE NOTICE '';
END $$;

-- =====================================================
-- STEP 6: Show all users and their status
-- =====================================================

SELECT 
  u.email,
  p.company_id,
  c.name as company_name,
  CASE 
    WHEN p.company_id IS NOT NULL THEN '✅ Ready'
    ELSE '❌ Missing'
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
  RAISE NOTICE '✅✅✅ SETUP COMPLETE! ✅✅✅';
  RAISE NOTICE '========================================';
  RAISE NOTICE '';
  RAISE NOTICE 'What was done:';
  RAISE NOTICE '1. ✅ Created trigger: on_auth_user_created';
  RAISE NOTICE '2. ✅ Fixed existing users';
  RAISE NOTICE '3. ✅ Future signups auto-create companies';
  RAISE NOTICE '';
  RAISE NOTICE 'Next steps:';
  RAISE NOTICE '1. Tell users to refresh (Ctrl+Shift+R)';
  RAISE NOTICE '2. Or log out and log back in';
  RAISE NOTICE '3. Try creating a product';
  RAISE NOTICE '';
  RAISE NOTICE '========================================';
END $$;
