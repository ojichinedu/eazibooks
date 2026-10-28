-- =====================================================
-- FIX STORAGE RLS POLICIES
-- Fixes: "new row violates row-level security policy"
-- For: Logo and Avatar uploads
-- =====================================================

-- STEP 1: Drop all existing storage policies to start fresh
DROP POLICY IF EXISTS "Allow authenticated uploads" ON storage.objects;
DROP POLICY IF EXISTS "Allow public read" ON storage.objects;
DROP POLICY IF EXISTS "Allow authenticated updates" ON storage.objects;
DROP POLICY IF EXISTS "Allow authenticated deletes" ON storage.objects;
DROP POLICY IF EXISTS "Allow public uploads" ON storage.objects;
DROP POLICY IF EXISTS "Allow users to upload" ON storage.objects;
DROP POLICY IF EXISTS "Allow users to read" ON storage.objects;
DROP POLICY IF EXISTS "Allow users to update" ON storage.objects;
DROP POLICY IF EXISTS "Allow users to delete" ON storage.objects;

-- STEP 2: Create INSERT policy (for uploads)
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

-- STEP 3: Create SELECT policy (for viewing/downloading)
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

-- STEP 4: Create UPDATE policy (for replacing files)
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

-- STEP 5: Create DELETE policy (for removing files)
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

-- STEP 6: Verify the policies were created
SELECT 
  '========== STORAGE POLICIES CREATED ==========' as info,
  schemaname,
  tablename,
  policyname,
  cmd,
  roles
FROM pg_policies 
WHERE schemaname = 'storage' 
  AND tablename = 'objects'
ORDER BY policyname;

-- Success message
DO $$
BEGIN
  RAISE NOTICE '✅✅✅ STORAGE RLS POLICIES FIXED! ✅✅✅';
  RAISE NOTICE '';
  RAISE NOTICE 'You can now:';
  RAISE NOTICE '1. Upload company logos';
  RAISE NOTICE '2. Upload user avatars';
  RAISE NOTICE '3. View uploaded images';
  RAISE NOTICE '4. Update existing files';
  RAISE NOTICE '5. Delete files';
  RAISE NOTICE '';
  RAISE NOTICE 'Now refresh your browser and try uploading again!';
END $$;
