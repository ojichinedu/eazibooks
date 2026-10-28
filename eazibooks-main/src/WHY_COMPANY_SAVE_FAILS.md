# Why "Failed to Save Company Settings" Happens

## 🔴 The Error

You're seeing:
```
Failed to save company settings
Error code: 42501
Message: new row violates row-level security policy for table "companies"
```

---

## 🤔 Why This Happens

### Root Cause
Your **Supabase database has Row Level Security (RLS)** enabled on the `companies` table. The RLS policy is **blocking INSERT operations** because it doesn't specify which users can insert data.

### Technical Explanation

When you click "Save" in Company Settings, the app does this:

1. ✅ Gets your user ID (this works)
2. ✅ Checks if you have a company (this works)
3. ❌ **Tries to INSERT a new company** → **THIS FAILS!**
4. ❌ Error is caught and shown to you

**The INSERT fails because:**

```sql
-- Current broken policy (missing TO authenticated)
CREATE POLICY "..." ON companies FOR INSERT
WITH CHECK (true);

-- When you try to insert, PostgreSQL says:
-- "I don't know who is allowed to use this policy!"
-- Result: ❌ INSERT blocked
```

**What it should be:**

```sql
-- Fixed policy (with TO authenticated)
CREATE POLICY "..." ON companies FOR INSERT
TO authenticated  -- ← This tells PostgreSQL: logged-in users can insert
WITH CHECK (true);

-- When you try to insert, PostgreSQL says:
-- "You're authenticated, so you can insert!"
-- Result: ✅ INSERT allowed
```

---

## 🎯 The Fix

### Quick Version (3 steps)

1. **Run** `FIX_ALL_RLS_NOW.sql` in Supabase SQL Editor
2. **Hard refresh** browser (Ctrl+Shift+R)
3. **Try saving** company settings again

### Detailed Version (with verification)

1. **Diagnose** → Run `DIAGNOSE_COMPANY_SAVE_ERROR.sql`
2. **Fix** → Run `FIX_ALL_RLS_NOW.sql`
3. **Verify** → Run `TEST_CAN_INSERT_COMPANY.sql`
4. **Test** → Try saving in the app

---

## 🔍 How to Tell If It's Fixed

### Before Fix ❌
```
Console logs:
❌ Error saving company settings: {
  "code": "42501",
  "message": "new row violates row-level security policy..."
}

App shows:
"Failed to save company settings"
```

### After Fix ✅
```
Console logs:
✅ Company created successfully

App shows:
"✅ Company profile created successfully"
or
"✅ Company settings saved successfully"
```

---

## 📊 Common Scenarios

### Scenario 1: First time user, no company
**What happens:**
- User signs up
- Goes to Company Settings
- Fills in details
- Clicks Save
- App tries to **INSERT** new company
- **RLS blocks it** → Error!

**Fix:** Run `FIX_ALL_RLS_NOW.sql`

### Scenario 2: Existing user, updating company
**What happens:**
- User already has company
- Goes to Company Settings
- Changes details
- Clicks Save
- App tries to **UPDATE** existing company
- **RLS blocks it** → Error!

**Fix:** Run `FIX_ALL_RLS_NOW.sql` (fixes UPDATE too)

### Scenario 3: User not logged in
**What happens:**
- User visits app
- Token expired
- Goes to Company Settings
- Clicks Save
- No user ID → Error!

**Fix:** Log out and log back in

---

## 🧪 How to Test the Fix Worked

### Test 1: Run SQL Test
```sql
-- Run: TEST_CAN_INSERT_COMPANY.sql
-- Should show: ✅ SUCCESS: Company INSERT works!
```

### Test 2: Check Policies
```sql
-- Run: VERIFY_ALL_POLICIES.sql
-- Should show: 4 policies with {authenticated} role
```

### Test 3: Test in App
1. Go to Company Settings
2. Fill in required fields
3. Click Save
4. Should see success message
5. Refresh page
6. Data should still be there

---

## 🔧 What the Fix Does

The SQL script (`FIX_ALL_RLS_NOW.sql`):

1. **Drops** all old broken policies
2. **Creates** new policies with `TO authenticated`
3. **Applies** to 3 tables:
   - `companies` (for company data)
   - `profiles` (for user profiles)
   - `subscriptions` (for subscription data)
4. **Verifies** policies were created correctly

---

## 💡 Why We Need RLS

**Row Level Security (RLS)** is Supabase's way of protecting your data:

- ✅ **Good:** Prevents unauthorized access
- ✅ **Good:** Users can only see their own data
- ❌ **Bad:** If misconfigured, blocks legitimate operations

**The problem:** Your RLS policies were configured without specifying the user role (`TO authenticated`), so even legitimate users were blocked.

**The solution:** Add `TO authenticated` to tell PostgreSQL that logged-in users should be allowed.

---

## 📁 Files Reference

| File | Purpose | When to Use |
|------|---------|-------------|
| **FIX_ALL_RLS_NOW.sql** | Fix the policies | Run this first |
| **DIAGNOSE_COMPANY_SAVE_ERROR.sql** | Find the problem | If still broken |
| **TEST_CAN_INSERT_COMPANY.sql** | Verify fix worked | After running fix |
| **VERIFY_ALL_POLICIES.sql** | Check policies | Confirmation |
| **ACTION_PLAN_FIX_COMPANY_SAVE.md** | Step-by-step guide | Follow this |

---

## 🆘 Still Not Working?

### Check These:

1. **Are you logged in to the app?**
   - Open browser console
   - Run: `localStorage.getItem('sb-access-token')`
   - Should return a long string
   - If null → Log in again

2. **Did you run the SQL in the right project?**
   - Check Supabase URL matches your project
   - Should contain: `khpiznboahwnszaavtig`

3. **Did the SQL script complete successfully?**
   - Should see: "✅✅✅ ALL RLS POLICIES FIXED!"
   - If errors → Share them

4. **Did you hard refresh the browser?**
   - Ctrl+Shift+R (Windows)
   - Cmd+Shift+R (Mac)
   - Or clear cache: `localStorage.clear()`

### Get Help

Share these with me:

1. Output from `DIAGNOSE_COMPANY_SAVE_ERROR.sql`
2. Output from `TEST_CAN_INSERT_COMPANY.sql`
3. Console errors (F12 → Console → Screenshot)
4. Error message you see in the app

---

## ✅ Success Checklist

After running the fix, you should be able to:

- [ ] Log in to EaziBook
- [ ] Navigate to Settings → Company Settings
- [ ] Fill in company name and details
- [ ] Click "Save Settings"
- [ ] See: "✅ Company settings saved successfully"
- [ ] Refresh page
- [ ] See: Data is still there
- [ ] Update data and save again
- [ ] See: "✅ Company settings saved successfully"

---

## 🎯 Bottom Line

**Problem:** Database blocking company creation  
**Root Cause:** RLS policy missing `TO authenticated`  
**Impact:** Cannot save company settings  
**Solution:** Run `FIX_ALL_RLS_NOW.sql`  
**Time to Fix:** 3 minutes  
**Risk:** None (safe to run multiple times)  

**Just run the SQL file and you're done!** 🚀
