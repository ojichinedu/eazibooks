# ⚡ RUN THIS NOW - Step by Step

## The Problem You Had
```
ERROR: 42601: syntax error at or near "v_company_id"
```

## The Solution
I've created a **FIXED version** of the script.

---

## 🎯 OPTION 1: Run the Fixed Complete Script (RECOMMENDED)

### Step 1: Open Supabase
1. Go to https://supabase.com/dashboard
2. Select your EaziBook project
3. Click "SQL Editor" in the left sidebar
4. Click "New query"

### Step 2: Copy the Fixed Script
1. Open file: `/AUTO_COMPANY_SETUP_FIXED.sql`
2. Press `Ctrl+A` (select all)
3. Press `Ctrl+C` (copy)

### Step 3: Run It
1. Go back to Supabase SQL Editor
2. Press `Ctrl+V` (paste the script)
3. Click the "Run" button (or press F5)
4. Wait 30-60 seconds

### Step 4: Check Results
You should see output like:
```
✅ Fixed 2 user(s)!
📊 VERIFICATION RESULTS
Total users:              3
Users with company:       3
Users without company:    0
✅✅✅ AUTO SETUP COMPLETE! ✅✅✅
```

### Step 5: Done!
- Tell users to refresh (Ctrl+Shift+R) or log out/in
- Test with a new signup
- ✅ Problem solved!

---

## 🎯 OPTION 2: Run the Simple Version (If Option 1 fails)

If the complete script still gives errors, use the simple approach:

### Step 1: Create the Function
1. Open `/SIMPLE_FIX.sql`
2. Copy **PART 1** only (lines 6-26)
3. Paste in Supabase SQL Editor
4. Run it
5. Should see: "Success. No rows returned"

### Step 2: Create the Trigger
1. Copy **PART 2** from `/SIMPLE_FIX.sql` (lines 28-35)
2. Paste in Supabase SQL Editor
3. Run it
4. Should see: "Success. No rows returned"

### Step 3: Check Which Users Need Fixing
1. Copy this query:
```sql
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
```
2. Run it
3. Note which users show "❌ NEEDS FIX"

### Step 4: Fix Each User
For EACH user that needs fixing:

1. Copy **PART 3** from `/SIMPLE_FIX.sql` (the DO $$ block)
2. **CHANGE THIS LINE:**
   ```sql
   v_user_email := 'user@example.com';
   ```
   To:
   ```sql
   v_user_email := 'actual.user@email.com';
   ```
3. Run it
4. Should see: "✅ Fixed user: actual.user@email.com"
5. Repeat for each user who needs fixing

### Step 5: Verify All Fixed
Run the verification query:
```sql
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
```

All users should show "✅ Fixed"

---

## 🎯 OPTION 3: Quick Fix for Just One User

If you only need to fix one specific user right now:

```sql
DO $$
DECLARE
  v_user_id UUID;
  v_company_id UUID;
BEGIN
  -- Get the user ID by email
  SELECT id INTO v_user_id
  FROM auth.users
  WHERE email = 'CHANGE_THIS@example.com';  -- ← CHANGE THIS EMAIL
  
  -- Create company
  INSERT INTO public.companies (name, email, currency, status)
  VALUES ('User Company', 'CHANGE_THIS@example.com', 'NGN', 'active')
  RETURNING id INTO v_company_id;
  
  -- Update or insert profile
  INSERT INTO public.profiles (id, email, full_name, company_id, role)
  VALUES (v_user_id, 'CHANGE_THIS@example.com', 'User', v_company_id, 'owner')
  ON CONFLICT (id) DO UPDATE
  SET company_id = v_company_id;
  
  RAISE NOTICE '✅ Fixed user!';
  RAISE NOTICE 'Company ID: %', v_company_id;
END $$;
```

**Steps:**
1. Copy the above
2. Replace **both** instances of `'CHANGE_THIS@example.com'` with the actual user email
3. Run it
4. Tell that user to refresh or log out/in

---

## 🚨 Common Errors and Fixes

### Error: "relation auth.users does not exist"
**Fix:** Make sure you're running this in the SQL Editor, not the API

### Error: "permission denied for table auth.users"
**Fix:** This is normal in some Supabase setups. Use OPTION 2 instead.

### Error: "duplicate key value violates unique constraint"
**Fix:** Company or profile already exists. Just update:
```sql
UPDATE public.profiles
SET company_id = (SELECT id FROM companies WHERE email = 'user@example.com')
WHERE id = (SELECT id FROM auth.users WHERE email = 'user@example.com');
```

---

## ✅ How to Know It Worked

### Test 1: Check the trigger exists
```sql
SELECT trigger_name 
FROM information_schema.triggers
WHERE trigger_name = 'on_auth_user_created';
```
Should return: `on_auth_user_created`

### Test 2: Check all users have companies
```sql
SELECT 
  COUNT(*) as total,
  COUNT(p.company_id) as with_company
FROM auth.users u
LEFT JOIN profiles p ON p.id = u.id;
```
Both numbers should be equal.

### Test 3: Try creating a product
1. Have an affected user refresh their browser
2. Or log out and log back in
3. Try to create a product
4. Should work! ✅

### Test 4: Test new signup
1. Sign out
2. Create a new account with a different email
3. Log in
4. Try to create a product immediately
5. Should work! ✅

---

## 📞 Still Having Issues?

If you're still getting syntax errors:

1. **Check Supabase version:** Some older versions have different syntax
2. **Try OPTION 2:** The simple version with manual fixes
3. **Try OPTION 3:** Fix users one at a time
4. **Share the exact error:** Copy the full error message

---

## 🎉 After It Works

Once you've successfully run the script:

1. ✅ All existing users are fixed
2. ✅ Trigger is in place for new signups
3. ✅ Tell users to refresh or re-login
4. ✅ Test with a new signup to verify
5. ✅ You're done forever!

---

## Quick Decision Tree

**Start here:**
- Try OPTION 1 (AUTO_COMPANY_SETUP_FIXED.sql)
  - ✅ Worked? → You're done!
  - ❌ Error? → Try OPTION 2

**If OPTION 1 failed:**
- Try OPTION 2 (SIMPLE_FIX.sql step by step)
  - ✅ Worked? → You're done!
  - ❌ Error? → Try OPTION 3

**If OPTION 2 failed:**
- Try OPTION 3 (One user at a time)
  - ✅ Worked? → Repeat for each user
  - ❌ Error? → Share the error message

---

## 📂 File Reference

- `/AUTO_COMPANY_SETUP_FIXED.sql` ← Use this (OPTION 1)
- `/SIMPLE_FIX.sql` ← Backup (OPTION 2)
- This file ← Instructions

---

**READY? Let's do this! Start with OPTION 1.** 🚀
