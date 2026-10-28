# Current Error Fix - RLS Policy Issue

## ❌ Error You're Seeing
```
Error saving company settings: {
  "code": "42501",
  "details": null,
  "hint": null,
  "message": "new row violates row-level security policy for table \"companies\""
}
```

## ✅ Solution

### Step 1: Run This SQL File
Open Supabase Dashboard → SQL Editor and run:

**File:** `FIX_COMPANIES_RLS.sql`

This will:
- Drop old restrictive policies
- Create new permissive policies
- Allow you to create and update companies

### Step 2: Test
1. Refresh your browser
2. Go to Settings → Company Settings
3. Fill in company details
4. Click Save
5. Should work now! ✅

---

## What Was Wrong

The RLS (Row Level Security) policy on the `companies` table was missing the `TO authenticated` clause, which caused it to block INSERT operations from logged-in users.

### Before (Broken):
```sql
CREATE POLICY "Users can insert their company" 
ON public.companies 
FOR INSERT
WITH CHECK (true);
```

### After (Fixed):
```sql
CREATE POLICY "Users can insert their company" 
ON public.companies 
FOR INSERT
TO authenticated  -- ✅ This was missing!
WITH CHECK (true);
```

---

## Files Updated

1. ✅ **FIX_COMPANIES_RLS.sql** - Quick fix script (run this now)
2. ✅ **SUPABASE_RESET_AND_SETUP.sql** - Updated for future setups
3. ✅ **SUPABASE_RLS_POLICIES.sql** - Updated policies file
4. ✅ **RLS_POLICY_FIX_GUIDE.md** - Detailed guide

---

## Quick Test

After running the fix, test with this SQL:

```sql
-- Should show your new policies
SELECT policyname, cmd, roles 
FROM pg_policies 
WHERE tablename = 'companies';

-- Should allow you to query
SELECT * FROM companies;
```

---

## If Still Not Working

1. **Clear browser cache** - Hard refresh (Ctrl+Shift+R)
2. **Check you're logged in** - `SELECT auth.uid();` should return your ID
3. **Check profile exists** - `SELECT * FROM profiles WHERE id = auth.uid();`
4. **Re-run fix script** - Run `FIX_COMPANIES_RLS.sql` again

---

## Summary

**Problem:** RLS policy blocking company creation  
**Cause:** Missing `TO authenticated` clause  
**Fix:** Run `FIX_COMPANIES_RLS.sql`  
**Time:** 30 seconds to fix  

🎉 **You should now be able to create and save companies!**
