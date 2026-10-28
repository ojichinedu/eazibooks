# How to Fix: "new row violates row-level security policy"

## 🚨 The Error You're Seeing

```
Error saving company settings: {
  "code": "42501",
  "message": "new row violates row-level security policy for table \"companies\""
}
```

## ❓ Why This Happens

Your Supabase database has **Row Level Security (RLS)** enabled on the `companies` table. The current RLS policy is **too restrictive** and is blocking you from creating a new company.

**Specifically:** The policy is missing the `TO authenticated` clause, which tells PostgreSQL that logged-in users should be allowed to perform this operation.

## ✅ The Fix (3 Minutes)

### Step 1: Open Supabase Dashboard

1. Go to your Supabase project: https://supabase.com/dashboard
2. Select your project (the one with ID: `khpiznboahwnszaavtig`)
3. Click **SQL Editor** in the left sidebar

### Step 2: Run the Fix Script

1. Click **"New Query"** button (top right)
2. Open the file: **`FIX_ALL_RLS_NOW.sql`** from your project
3. Copy the **entire contents** of that file
4. Paste it into the SQL Editor
5. Click **"Run"** (or press Ctrl+Enter / Cmd+Enter)

### Step 3: Wait for Completion

You should see output like:
```
✅✅✅ ALL RLS POLICIES FIXED! ✅✅✅
```

### Step 4: Test in Your App

1. Go back to your EaziBook app
2. **Hard refresh** your browser:
   - Windows: `Ctrl + Shift + R`
   - Mac: `Cmd + Shift + R`
3. Go to **Settings → Company Settings**
4. Fill in your company details
5. Click **Save**
6. Should work now! 🎉

## 🔍 What the Fix Does

The SQL script:

1. **Drops all old restrictive policies** from these tables:
   - `companies`
   - `profiles`
   - `subscriptions`

2. **Creates new permissive policies** with `TO authenticated`:
   - Allows you to INSERT companies
   - Allows you to view/update your own company
   - Allows you to manage your profile
   - Allows you to manage your subscription

3. **Verifies** the policies were created correctly

## 📋 Technical Details

### Before (Broken):
```sql
CREATE POLICY "..." ON companies FOR INSERT
WITH CHECK (true);
-- ❌ Missing "TO authenticated"
```

### After (Fixed):
```sql
CREATE POLICY "..." ON companies FOR INSERT
TO authenticated  -- ✅ Added this
WITH CHECK (true);
```

The `TO authenticated` clause specifies that this policy applies to **authenticated (logged-in) users**.

## 🧪 How to Verify It Worked

After running the fix, you can verify with this SQL:

```sql
-- Should show 4 policies with 'authenticated' role
SELECT policyname, cmd, roles 
FROM pg_policies 
WHERE tablename = 'companies';
```

Expected output:
- `allow_insert_company` - INSERT - {authenticated}
- `allow_select_own_company` - SELECT - {authenticated}
- `allow_update_own_company` - UPDATE - {authenticated}
- `allow_delete_own_company` - DELETE - {authenticated}

## ❌ Troubleshooting

### Still getting the error after running the script?

#### 1. Check if you're logged in
```sql
SELECT auth.uid(), auth.email();
```
- Should return your user ID and email
- If NULL, you need to log in to the app

#### 2. Check if profile exists
```sql
SELECT * FROM profiles WHERE id = auth.uid();
```
- Should return your profile row
- If empty, the trigger didn't create your profile on signup

#### 3. Check policies were created
```sql
SELECT tablename, policyname, roles 
FROM pg_policies 
WHERE tablename IN ('companies', 'profiles', 'subscriptions')
ORDER BY tablename, policyname;
```
- Should see policies for all three tables
- All should have `{authenticated}` in roles column

#### 4. Clear browser cache
- Open browser DevTools (F12)
- Go to Console tab
- Run: `localStorage.clear()`
- Hard refresh (Ctrl+Shift+R)

### Script failed to run?

If you get SQL errors:

1. **Check you selected the right project** in Supabase
2. **Make sure RLS is enabled** on the tables:
   ```sql
   ALTER TABLE companies ENABLE ROW LEVEL SECURITY;
   ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
   ALTER TABLE subscriptions ENABLE ROW LEVEL SECURITY;
   ```
3. **Check tables exist**:
   ```sql
   SELECT tablename FROM pg_tables WHERE schemaname = 'public';
   ```
   Should include: companies, profiles, subscriptions

## 🆘 Nuclear Option: Complete Reset

If nothing else works, you can reset the entire database:

⚠️ **WARNING: This deletes all data!**

1. Run `SUPABASE_RESET_AND_SETUP.sql` (also in your project)
2. This recreates all tables with correct policies
3. You'll need to sign up again

## 📝 Files Reference

- **`FIX_ALL_RLS_NOW.sql`** ⭐ - Run this to fix the error
- **`IMMEDIATE_RLS_FIX.sql`** - Just companies table
- **`FIX_PROFILES_RLS.sql`** - Just profiles table
- **`FIX_SUBSCRIPTIONS_RLS.sql`** - Just subscriptions table
- **`SUPABASE_RESET_AND_SETUP.sql`** - Full database reset (nuclear option)

## ✅ Success Checklist

After running the fix, you should be able to:

- [ ] Log in to EaziBook
- [ ] Navigate to Settings → Company Settings
- [ ] See the settings form
- [ ] Fill in company name
- [ ] Fill in address, phone, email
- [ ] Click "Save" button
- [ ] See "Company settings saved successfully" message
- [ ] Refresh page and see saved data
- [ ] Update company info and save again

## 🎯 Summary

**Problem:** RLS policy blocking company creation  
**Cause:** Missing `TO authenticated` in policy  
**Solution:** Run `FIX_ALL_RLS_NOW.sql`  
**Time to fix:** 3 minutes  
**Risk:** None (safe to run)  

---

**Run the SQL script and you'll be good to go!** 🚀
