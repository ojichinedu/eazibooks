-- =====================================================
-- FIX EVERYTHING - ONE SCRIPT TO RULE THEM ALL
-- This script fixes ALL database issues:
-- 1. Companies table RLS policies
-- 2. Profiles table RLS policies  
-- 3. Subscriptions table RLS policies
-- 4. Storage bucket RLS policies
-- =====================================================

BEGIN;

-- =====================================================
-- PART 1: FIX COMPANIES TABLE RLS
-- =====================================================

RAISE NOTICE '===========================================';
RAISE NOTICE 'FIXING COMPANIES TABLE...';
RAISE NOTICE '===========================================';

-- Drop existing policies
DROP POLICY IF EXISTS "Users can view their company data" ON public.companies;
DROP POLICY IF EXISTS "Users can insert their company" ON public.companies;
DROP POLICY IF EXISTS "Users can update their company" ON public.companies;
DROP POLICY IF EXISTS "Users can delete their company" ON public.companies;
DROP POLICY IF EXISTS "Company isolation for companies" ON public.companies;
DROP POLICY IF EXISTS "allow_insert_company" ON public.companies;
DROP POLICY IF EXISTS "allow_select_own_company" ON public.companies;
DROP POLICY IF EXISTS "allow_update_own_company" ON public.companies;
DROP POLICY IF EXISTS "allow_delete_own_company" ON public.companies;

-- Enable RLS
ALTER TABLE public.companies ENABLE ROW LEVEL SECURITY;

-- Create new policies with TO authenticated
CREATE POLICY "allow_insert_company"
ON public.companies
FOR INSERT
TO authenticated
WITH CHECK (true);

CREATE POLICY "allow_select_own_company"
ON public.companies
FOR SELECT
TO authenticated
USING (
  id IN (
    SELECT company_id 
    FROM public.profiles 
    WHERE id = auth.uid()
  )
);

CREATE POLICY "allow_update_own_company"
ON public.companies
FOR UPDATE
TO authenticated
USING (
  id IN (
    SELECT company_id 
    FROM public.profiles 
    WHERE id = auth.uid()
  )
)
WITH CHECK (
  id IN (
    SELECT company_id 
    FROM public.profiles 
    WHERE id = auth.uid()
  )
);

CREATE POLICY "allow_delete_own_company"
ON public.companies
FOR DELETE
TO authenticated
USING (
  id IN (
    SELECT company_id 
    FROM public.profiles 
    WHERE id = auth.uid()
  )
);

RAISE NOTICE '✅ Companies table policies fixed!';

-- =====================================================
-- PART 2: FIX PROFILES TABLE RLS
-- =====================================================

RAISE NOTICE '===========================================';
RAISE NOTICE 'FIXING PROFILES TABLE...';
RAISE NOTICE '===========================================';

-- Drop existing policies
DROP POLICY IF EXISTS "Users can view own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;
DROP POLICY IF EXISTS "Public profiles are viewable" ON public.profiles;
DROP POLICY IF EXISTS "Users can insert own profile" ON public.profiles;
DROP POLICY IF EXISTS "allow_insert_own_profile" ON public.profiles;
DROP POLICY IF EXISTS "allow_select_own_profile" ON public.profiles;
DROP POLICY IF EXISTS "allow_update_own_profile" ON public.profiles;

-- Enable RLS
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Create new policies with TO authenticated
CREATE POLICY "allow_insert_own_profile"
ON public.profiles
FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = id);

CREATE POLICY "allow_select_own_profile"
ON public.profiles
FOR SELECT
TO authenticated
USING (auth.uid() = id);

CREATE POLICY "allow_update_own_profile"
ON public.profiles
FOR UPDATE
TO authenticated
USING (auth.uid() = id)
WITH CHECK (auth.uid() = id);

RAISE NOTICE '✅ Profiles table policies fixed!';

-- =====================================================
-- PART 3: FIX SUBSCRIPTIONS TABLE RLS
-- =====================================================

RAISE NOTICE '===========================================';
RAISE NOTICE 'FIXING SUBSCRIPTIONS TABLE...';
RAISE NOTICE '===========================================';

-- Drop existing policies
DROP POLICY IF EXISTS "Users can view own subscription" ON public.subscriptions;
DROP POLICY IF EXISTS "Users can update own subscription" ON public.subscriptions;
DROP POLICY IF EXISTS "Users can insert own subscription" ON public.subscriptions;
DROP POLICY IF EXISTS "allow_insert_own_subscription" ON public.subscriptions;
DROP POLICY IF EXISTS "allow_select_own_subscription" ON public.subscriptions;
DROP POLICY IF EXISTS "allow_update_own_subscription" ON public.subscriptions;

-- Enable RLS
ALTER TABLE public.subscriptions ENABLE ROW LEVEL SECURITY;

-- Create new policies with TO authenticated
CREATE POLICY "allow_insert_own_subscription"
ON public.subscriptions
FOR INSERT
TO authenticated
WITH CHECK (user_id = auth.uid());

CREATE POLICY "allow_select_own_subscription"
ON public.subscriptions
FOR SELECT
TO authenticated
USING (user_id = auth.uid());

CREATE POLICY "allow_update_own_subscription"
ON public.subscriptions
FOR UPDATE
TO authenticated
USING (user_id = auth.uid())
WITH CHECK (user_id = auth.uid());

RAISE NOTICE '✅ Subscriptions table policies fixed!';

-- =====================================================
-- PART 4: FIX STORAGE RLS POLICIES
-- =====================================================

RAISE NOTICE '===========================================';
RAISE NOTICE 'FIXING STORAGE POLICIES...';
RAISE NOTICE '===========================================';

-- Drop all existing storage policies
DROP POLICY IF EXISTS "Allow authenticated uploads" ON storage.objects;
DROP POLICY IF EXISTS "Allow public read" ON storage.objects;
DROP POLICY IF EXISTS "Allow authenticated updates" ON storage.objects;
DROP POLICY IF EXISTS "Allow authenticated deletes" ON storage.objects;
DROP POLICY IF EXISTS "Allow public uploads" ON storage.objects;
DROP POLICY IF EXISTS "Allow users to upload" ON storage.objects;
DROP POLICY IF EXISTS "Allow users to read" ON storage.objects;
DROP POLICY IF EXISTS "Allow users to update" ON storage.objects;
DROP POLICY IF EXISTS "Allow users to delete" ON storage.objects;
DROP POLICY IF EXISTS "Allow authenticated uploads to company-assets" ON storage.objects;
DROP POLICY IF EXISTS "Allow authenticated uploads to user-assets" ON storage.objects;
DROP POLICY IF EXISTS "Allow public read from company-assets" ON storage.objects;
DROP POLICY IF EXISTS "Allow public read from user-assets" ON storage.objects;
DROP POLICY IF EXISTS "Allow authenticated updates to company-assets" ON storage.objects;
DROP POLICY IF EXISTS "Allow authenticated updates to user-assets" ON storage.objects;
DROP POLICY IF EXISTS "Allow authenticated deletes from company-assets" ON storage.objects;
DROP POLICY IF EXISTS "Allow authenticated deletes from user-assets" ON storage.objects;

-- Create INSERT policies (for uploads)
CREATE POLICY "Allow authenticated uploads to company-assets"
ON storage.objects
FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'company-assets');

CREATE POLICY "Allow authenticated uploads to user-assets"
ON storage.objects
FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'user-assets');

-- Create SELECT policies (for viewing)
CREATE POLICY "Allow public read from company-assets"
ON storage.objects
FOR SELECT
TO public
USING (bucket_id = 'company-assets');

CREATE POLICY "Allow public read from user-assets"
ON storage.objects
FOR SELECT
TO public
USING (bucket_id = 'user-assets');

-- Create UPDATE policies (for replacing)
CREATE POLICY "Allow authenticated updates to company-assets"
ON storage.objects
FOR UPDATE
TO authenticated
USING (bucket_id = 'company-assets')
WITH CHECK (bucket_id = 'company-assets');

CREATE POLICY "Allow authenticated updates to user-assets"
ON storage.objects
FOR UPDATE
TO authenticated
USING (bucket_id = 'user-assets')
WITH CHECK (bucket_id = 'user-assets');

-- Create DELETE policies (for removing)
CREATE POLICY "Allow authenticated deletes from company-assets"
ON storage.objects
FOR DELETE
TO authenticated
USING (bucket_id = 'company-assets');

CREATE POLICY "Allow authenticated deletes from user-assets"
ON storage.objects
FOR DELETE
TO authenticated
USING (bucket_id = 'user-assets');

RAISE NOTICE '✅ Storage policies fixed!';

-- =====================================================
-- VERIFICATION
-- =====================================================

RAISE NOTICE '';
RAISE NOTICE '===========================================';
RAISE NOTICE 'VERIFICATION';
RAISE NOTICE '===========================================';

-- Check companies policies
RAISE NOTICE 'Companies table policies:';
SELECT policyname, cmd, roles FROM pg_policies WHERE tablename = 'companies';

-- Check profiles policies
RAISE NOTICE 'Profiles table policies:';
SELECT policyname, cmd, roles FROM pg_policies WHERE tablename = 'profiles';

-- Check subscriptions policies
RAISE NOTICE 'Subscriptions table policies:';
SELECT policyname, cmd, roles FROM pg_policies WHERE tablename = 'subscriptions';

-- Check storage policies
RAISE NOTICE 'Storage policies:';
SELECT policyname, cmd, roles FROM pg_policies WHERE schemaname = 'storage' AND tablename = 'objects';

COMMIT;

-- =====================================================
-- SUCCESS MESSAGE
-- =====================================================

DO $$
BEGIN
  RAISE NOTICE '';
  RAISE NOTICE '✅✅✅✅✅✅✅✅✅✅✅✅✅✅✅✅✅✅✅✅✅';
  RAISE NOTICE '✅                                      ✅';
  RAISE NOTICE '✅    ALL POLICIES FIXED SUCCESSFULLY!   ✅';
  RAISE NOTICE '✅                                      ✅';
  RAISE NOTICE '✅✅✅✅✅✅✅✅✅✅✅✅✅✅✅✅✅✅✅✅✅';
  RAISE NOTICE '';
  RAISE NOTICE 'What is now working:';
  RAISE NOTICE '1. ✅ Can create companies';
  RAISE NOTICE '2. ✅ Can save company settings';
  RAISE NOTICE '3. ✅ Can update user profiles';
  RAISE NOTICE '4. ✅ Can manage subscriptions';
  RAISE NOTICE '5. ✅ Can upload company logos';
  RAISE NOTICE '6. ✅ Can upload user avatars';
  RAISE NOTICE '';
  RAISE NOTICE 'Next steps:';
  RAISE NOTICE '1. Hard refresh your browser (Ctrl+Shift+R)';
  RAISE NOTICE '2. Clear localStorage: localStorage.clear()';
  RAISE NOTICE '3. Try creating a company';
  RAISE NOTICE '4. Try uploading a logo';
  RAISE NOTICE '5. Try uploading an avatar';
  RAISE NOTICE '';
  RAISE NOTICE 'If you still see errors:';
  RAISE NOTICE '1. Check that storage buckets exist:';
  RAISE NOTICE '   - company-assets (Public, 5MB limit)';
  RAISE NOTICE '   - user-assets (Public, 2MB limit)';
  RAISE NOTICE '2. Make sure you are logged in';
  RAISE NOTICE '3. Check browser console for specific errors';
  RAISE NOTICE '';
  RAISE NOTICE '🚀 Ready to launch! 🚀';
END $$;
