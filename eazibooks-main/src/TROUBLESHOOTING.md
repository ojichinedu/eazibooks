# 🔍 TROUBLESHOOTING: "Failed to Add Product" After SQL Script

## Issue Status
- ✅ SQL script ran successfully 
- ❌ Still getting "Failed to add product" error

---

## 🎯 Step 1: Check Browser Console (IMPORTANT!)

**This is the MOST important step to diagnose the issue.**

1. Open your browser's Developer Tools:
   - **Chrome/Edge:** Press `F12` or `Ctrl+Shift+I`
   - **Firefox:** Press `F12` or `Ctrl+Shift+K`
   - **Safari:** Press `Cmd+Option+I`

2. Click the **"Console"** tab

3. Try to add a product again

4. Look for error messages in RED

5. **Copy the error messages and check below for solutions**

---

## 🚨 Common Errors & Solutions

### Error A: "No company_id found for user"
```
Error creating product: No company_id found for user
User company not found. Please ensure your profile is set up correctly.
```

**Cause:** Your user profile doesn't have a company_id assigned.

**Solution:** Run this verification SQL in Supabase:

```sql
-- Check your user setup
SELECT 
  p.id as user_id,
  p.email,
  p.company_id,
  c.name as company_name
FROM profiles p
LEFT JOIN companies c ON c.id = p.company_id
WHERE p.id = auth.uid();
```

**If company_id is NULL:**
1. The SQL script didn't run correctly while you were logged in
2. Try logging out and logging back in
3. Run the SQL script again (it's safe to re-run)

**Quick Fix SQL:**
```sql
-- This will create a company and link it to your profile
DO $$
DECLARE
  v_user_id UUID;
  v_company_id UUID;
BEGIN
  v_user_id := auth.uid();
  
  -- Create company
  INSERT INTO public.companies (name, email, currency, status)
  VALUES ('My Company', 'contact@mycompany.com', 'NGN', 'active')
  RETURNING id INTO v_company_id;
  
  -- Update profile with company_id
  UPDATE public.profiles
  SET company_id = v_company_id
  WHERE id = v_user_id;
  
  RAISE NOTICE 'Company created and linked! Company ID: %', v_company_id;
END $$;
```

---

### Error B: "RLS policy violation" (Still!)
```
Error: new row violates row-level security policy for table "products"
Code: 42501
```

**Cause:** RLS policies didn't get created properly.

**Solution:**

1. **Verify policies exist:**
```sql
-- Check if policies were created
SELECT policyname 
FROM pg_policies 
WHERE tablename = 'products' 
  AND schemaname = 'public';
```

Expected output (4 policies):
- `allow_insert_product`
- `allow_select_product`
- `allow_update_product`
- `allow_delete_product`

2. **If policies are missing**, manually create them:
```sql
-- Create INSERT policy
CREATE POLICY "allow_insert_product"
ON public.products
FOR INSERT
TO authenticated
WITH CHECK (
  company_id IS NOT NULL AND 
  company_id IN (SELECT company_id FROM public.profiles WHERE id = auth.uid())
);

-- Create SELECT policy
CREATE POLICY "allow_select_product"
ON public.products
FOR SELECT
TO authenticated
USING (company_id IN (SELECT company_id FROM public.profiles WHERE id = auth.uid()));

-- Create UPDATE policy
CREATE POLICY "allow_update_product"
ON public.products
FOR UPDATE
TO authenticated
USING (company_id IN (SELECT company_id FROM public.profiles WHERE id = auth.uid()))
WITH CHECK (company_id IN (SELECT company_id FROM public.profiles WHERE id = auth.uid()));

-- Create DELETE policy
CREATE POLICY "allow_delete_product"
ON public.products
FOR DELETE
TO authenticated
USING (company_id IN (SELECT company_id FROM public.profiles WHERE id = auth.uid()));
```

---

### Error C: "Profile not found"
```
Error fetching user profile
No authenticated user found
```

**Cause:** Your session might be stale or profile doesn't exist.

**Solution:**

1. **Hard refresh:** Press `Ctrl+Shift+R` (or `Cmd+Shift+R` on Mac)
2. **Clear cache:**
   - Chrome: Settings → Privacy → Clear browsing data
   - Select "Cached images and files"
   - Click "Clear data"
3. **Log out and log back in**
4. **Check if profile exists:**
```sql
SELECT * FROM profiles WHERE id = auth.uid();
```

If no profile, create one:
```sql
INSERT INTO profiles (id, email, full_name)
SELECT 
  auth.uid(),
  auth.email(),
  COALESCE(auth.email(), 'User');
```

---

### Error D: "Duplicate key violation" for SKU
```
Error: duplicate key value violates unique constraint "products_sku_key"
```

**Cause:** A product with that SKU already exists.

**Solution:** The code should auto-generate unique SKUs, but if this happens:

1. Leave the SKU field **empty** when adding products (it will auto-generate)
2. Or use a different unique SKU code

---

### Error E: Network/Connection Error
```
Failed to fetch
Network request failed
```

**Cause:** Connection to Supabase failed.

**Solution:**

1. **Check internet connection**
2. **Verify Supabase project is running:**
   - Go to Supabase Dashboard
   - Check if project shows as "Active"
3. **Check Supabase credentials:**
   - Make sure `.env` or environment variables are correct
   - Verify `SUPABASE_URL` and `SUPABASE_ANON_KEY`

---

## 🔧 Step 2: Verify Database Setup

Run these diagnostic queries in Supabase SQL Editor:

### Query 1: Check Your User Status
```sql
SELECT 
  auth.uid() as my_user_id,
  auth.email() as my_email,
  (SELECT company_id FROM profiles WHERE id = auth.uid()) as my_company_id,
  (SELECT COUNT(*) FROM profiles WHERE id = auth.uid()) as profile_exists;
```

**Expected:**
- `my_user_id`: Should show your user ID (UUID)
- `my_email`: Should show your email
- `my_company_id`: Should show a UUID (NOT NULL!)
- `profile_exists`: Should be `1`

**If `my_company_id` is NULL:** That's your problem! See Error A solution above.

---

### Query 2: Check RLS Policies
```sql
SELECT 
  tablename,
  policyname,
  cmd as operation
FROM pg_policies 
WHERE schemaname = 'public' 
  AND tablename IN ('products', 'profiles', 'companies')
ORDER BY tablename, cmd;
```

**Expected:** Each table should have policies for INSERT, SELECT, UPDATE, DELETE.

---

### Query 3: Test Insert Permission
```sql
-- This tests if you can insert a product
-- It should succeed or show a specific error
INSERT INTO products (
  company_id,
  name,
  sku,
  type,
  price,
  status
) VALUES (
  (SELECT company_id FROM profiles WHERE id = auth.uid()),
  'Test Product',
  'TEST-' || floor(random() * 10000)::text,
  'product',
  100.00,
  'active'
) RETURNING *;
```

**If this succeeds:** The issue is in your frontend code, not the database.
**If this fails:** Check the error message and match it to the errors above.

---

## 🚀 Step 3: Nuclear Option - Complete Reset

If nothing else works, try this complete reset:

### A. Re-run the SQL Script
```bash
1. Go to Supabase → SQL Editor
2. Paste the COMPLETE_RLS_AND_SETUP_FIX.sql script again
3. Run it
4. Log out from your app
5. Log back in
6. Try again
```

### B. Clear All Browser Data
```bash
1. Press Ctrl+Shift+Delete (Windows) or Cmd+Shift+Delete (Mac)
2. Select "All time"
3. Check all boxes (cookies, cache, etc.)
4. Clear data
5. Restart browser
6. Log in again
```

### C. Create Fresh Session
```bash
1. Open browser in Incognito/Private mode
2. Go to your application
3. Log in
4. Try creating a product
```

---

## 📊 Step 4: Enable Detailed Logging

Open browser console and paste this before trying to add a product:

```javascript
// Enable detailed logging
localStorage.setItem('debug', 'true');

// Then try to add a product and check console for detailed logs
```

---

## 🆘 Step 5: Get Specific Error Details

After trying to add a product and it fails:

1. Open browser console
2. Look for the error message
3. Copy the EXACT error text
4. Share it so we can provide specific help

Common things to look for:
- Error code (like `42501`, `23505`, etc.)
- Error message text
- Stack trace (shows which function failed)

---

## ✅ Success Indicators

You'll know it's working when:

1. Browser console shows: "Product added successfully" (or similar)
2. No red error messages in console
3. Product appears in the products list
4. Toast notification shows "Product added successfully"

---

## 📝 Quick Checklist

Go through this checklist:

- [ ] SQL script ran successfully (saw success message)
- [ ] Logged out and logged back in after running SQL
- [ ] Hard refreshed browser (Ctrl+Shift+R)
- [ ] Checked browser console for errors
- [ ] Verified company_id exists in profile (see Query 1)
- [ ] Verified RLS policies exist (see Query 2)
- [ ] Tried test insert query (see Query 3)
- [ ] Internet connection is stable
- [ ] Supabase project is active

---

## 💡 Most Likely Issue

**99% of the time, the issue is one of these:**

1. **No company_id in profile** → Use Error A solution
2. **Stale browser session** → Hard refresh + logout/login
3. **RLS policies not created** → Re-run SQL script while logged in

---

## 🎯 Next Steps

1. **Check browser console** and identify the specific error
2. **Match the error** to one of the solutions above
3. **Run the diagnostic queries** to verify setup
4. **Try the specific solution** for your error

If you share the exact error message from the browser console, I can provide a more specific solution!

---

**Remember:** The browser console is your friend! Always check it first when debugging.
