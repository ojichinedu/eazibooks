# 🚨 IMMEDIATE ACTION - Fix Profile Errors NOW

## You're Seeing These Errors:
```
Profile not found, using free plan
Error fetching user profile
Error creating product: No company_id found for user
User company not found
```

## ⚡ QUICK FIX (2 minutes)

### Step 1: Run the Emergency Fix

1. **Stay logged in** to your EaziBook app (important!)
2. **Open a new tab** → Go to Supabase Dashboard
3. **Go to SQL Editor** → New Query
4. **Open file:** `/EMERGENCY_FIX.sql`
5. **Copy EVERYTHING** (Ctrl+A, Ctrl+C)
6. **Paste into SQL Editor** (Ctrl+V)
7. **Click "Run"** (or F5)
8. **Wait for:** "✅ YOUR USER IS FIXED!"

### Step 2: Refresh Your Session

**Do ONE of these:**

**Option A: Hard Refresh**
- Press `Ctrl+Shift+R` (Windows/Linux)
- Or `Cmd+Shift+R` (Mac)

**Option B: Log Out and Back In**
- Click your profile → Log Out
- Log back in with same credentials

### Step 3: Test It

- Try to create a product
- Should work now! ✅

---

## 🔍 Why This Is Happening

Your user account exists in the authentication system, but:
- ❌ No profile record exists in the `profiles` table
- ❌ OR the profile exists but has no `company_id`

Without a `company_id`, you can't create products, suppliers, or any other data.

---

## 📋 Detailed Steps

### What the Emergency Fix Does:

1. **Checks your current user** (whoever is logged in)
2. **Checks if you have a profile**
   - If NO → Creates profile + company
   - If YES → Checks for company_id
3. **Checks if profile has company_id**
   - If NO → Creates company and links it
   - If YES → You're already good!
4. **Shows verification** of the fix

### After Running the Fix:

You should see output like this:
```
========================================
Fixing user: your.email@example.com
========================================
Profile exists, checking company...
Profile has no company, creating one...
Created company: 123e4567-e89b-12d3-a456-426614174000
Linked company to profile
✅ YOUR USER IS FIXED!
```

Or if you didn't have a profile:
```
Profile does not exist, creating...
Created company: 123e4567-e89b-12d3-a456-426614174000
Created profile with company
✅ YOUR USER IS FIXED!
```

---

## ✅ Verification

After running the fix, you should see a table showing:
```
email               | company_id                            | status
--------------------|---------------------------------------|---------------------------
your@email.com      | 123e4567-e89b-12d3-a456-426614174000 | ✅ Ready to create products
```

If you see `❌ Still broken`, run the fix again.

---

## 🆘 If Emergency Fix Doesn't Work

### Error: "You must be logged in to run this script"

**Solution:**
```sql
-- Instead, run this and replace the email:

DO $$
DECLARE
  v_user_id UUID;
  v_company_id UUID;
  v_email TEXT;
BEGIN
  v_email := 'YOUR_EMAIL@example.com'; -- CHANGE THIS
  
  SELECT id INTO v_user_id
  FROM auth.users
  WHERE email = v_email;
  
  -- Create company
  INSERT INTO public.companies (name, email, currency)
  VALUES ('My Company', v_email, 'NGN')
  RETURNING id INTO v_company_id;
  
  -- Create/update profile
  INSERT INTO public.profiles (id, email, full_name, company_id, role)
  VALUES (v_user_id, v_email, 'User', v_company_id, 'owner')
  ON CONFLICT (id) DO UPDATE
  SET company_id = v_company_id;
  
  RAISE NOTICE '✅ Fixed!';
END $$;
```

### Error: "Profile already exists"

**Solution:**
```sql
-- Just update the profile with a new company:

DO $$
DECLARE
  v_user_id UUID;
  v_company_id UUID;
BEGIN
  v_user_id := auth.uid();
  
  -- Create company
  INSERT INTO public.companies (name, email, currency)
  VALUES ('My Company', (SELECT email FROM auth.users WHERE id = v_user_id), 'NGN')
  RETURNING id INTO v_company_id;
  
  -- Update profile
  UPDATE public.profiles
  SET company_id = v_company_id
  WHERE id = v_user_id;
  
  RAISE NOTICE 'Company: %', v_company_id;
END $$;
```

---

## 🎯 For Other Users

The `/EMERGENCY_FIX.sql` only fixes the user who is currently logged in when you run it.

**To fix other users:**

1. Have them log in
2. They run `/EMERGENCY_FIX.sql` while logged in
3. They refresh

**OR**

Run `/AUTO_COMPANY_SETUP_V2.sql` which fixes ALL users at once + sets up automation for new signups.

---

## 🔄 The Difference Between Scripts

| Script | What It Does | When to Use |
|--------|--------------|-------------|
| `/EMERGENCY_FIX.sql` | Fixes YOUR current user only | Quick fix for you right now ⚡ |
| `/AUTO_COMPANY_SETUP_V2.sql` | Fixes ALL users + automation | Complete solution for everyone 🎯 |
| `/SUPER_SIMPLE_FIX.sql` | Step-by-step manual fix | If automation fails 🔧 |

---

## ✨ Recommended Approach

**For immediate relief:**
1. Run `/EMERGENCY_FIX.sql` NOW (fixes you)
2. Refresh and test (you can create products)

**For long-term solution:**
1. Run `/AUTO_COMPANY_SETUP_V2.sql` (fixes everyone + automation)
2. Tell all users to refresh
3. New signups automatically work

---

## 🎓 What Happens After the Fix

### Before Fix:
```javascript
// Browser console:
❌ Profile not found
❌ Error fetching user profile
❌ No company_id found
❌ Cannot create product
```

### After Fix + Refresh:
```javascript
// Browser console:
✅ User authenticated: your@email.com
✅ Company ID found: 123e4567-e89b-12d3-a456-426614174000
✅ Product created successfully
```

---

## 📞 Still Stuck?

If you've:
- ✅ Ran `/EMERGENCY_FIX.sql`
- ✅ Saw "✅ YOUR USER IS FIXED!"
- ✅ Hard refreshed (Ctrl+Shift+R)
- ✅ Or logged out and back in
- ❌ Still getting errors

Then:

1. **Open browser console** (F12)
2. **Copy the FULL error message**
3. **Check Supabase SQL Editor** - run:
```sql
SELECT 
  p.id,
  p.email,
  p.company_id,
  c.name as company_name
FROM profiles p
LEFT JOIN companies c ON c.id = p.company_id
WHERE p.id = auth.uid();
```
4. **Share the results** so I can see what's happening

---

## 🚀 Bottom Line

**RIGHT NOW:**
1. Run `/EMERGENCY_FIX.sql` (while logged in to EaziBook)
2. Refresh browser (Ctrl+Shift+R)
3. Try creating a product
4. Should work! ✅

**This fixes YOU immediately. Takes 2 minutes.**

Then later, run `/AUTO_COMPANY_SETUP_V2.sql` to fix everyone and set up automation.

---

**File to run NOW:** `/EMERGENCY_FIX.sql`

**Remember:** Stay logged in while running it!
