# RLS Policy Error Fix Guide

## Error: "new row violates row-level security policy for table 'companies'"

### What This Error Means
This error occurs when trying to create a new company because the Row Level Security (RLS) policy on the `companies` table is blocking the INSERT operation.

---

## Quick Fix (Run This First)

### Option 1: Run the Fix Script (Recommended)

1. Open Supabase Dashboard → SQL Editor
2. Run the file: `FIX_COMPANIES_RLS.sql`
3. This will:
   - Drop old policies
   - Create new permissive policies
   - Allow authenticated users to create companies
   - Verify the fix

### Option 2: Manual Fix

If you prefer to fix it manually, run this SQL:

```sql
-- Drop existing policies
DROP POLICY IF EXISTS "Users can view their company data" ON public.companies;
DROP POLICY IF EXISTS "Users can insert their company" ON public.companies;
DROP POLICY IF EXISTS "Users can update their company" ON public.companies;

-- Create new permissive INSERT policy
CREATE POLICY "Users can insert their company" 
ON public.companies 
FOR INSERT 
TO authenticated
WITH CHECK (true);

-- Create SELECT policy
CREATE POLICY "Users can view their company data" 
ON public.companies 
FOR SELECT 
TO authenticated
USING (id IN (SELECT company_id FROM public.profiles WHERE id = auth.uid()));

-- Create UPDATE policy
CREATE POLICY "Users can update their company" 
ON public.companies 
FOR UPDATE 
TO authenticated
USING (id IN (SELECT company_id FROM public.profiles WHERE id = auth.uid()))
WITH CHECK (id IN (SELECT company_id FROM public.profiles WHERE id = auth.uid()));
```

---

## Why This Happens

### The Problem
RLS policies control who can access data in your tables. If the policy is too restrictive or missing the `TO authenticated` clause, it can block legitimate operations.

### Common Causes
1. **Missing `TO authenticated` clause** - Policy doesn't specify which role can use it
2. **Too restrictive INSERT check** - Policy checks for company_id before it exists
3. **Policy doesn't exist** - Database setup was incomplete

---

## How the Fix Works

### Before (Broken):
```sql
CREATE POLICY "Users can insert their company" 
ON public.companies 
FOR INSERT
WITH CHECK (true);  -- Missing "TO authenticated"
```

### After (Fixed):
```sql
CREATE POLICY "Users can insert their company" 
ON public.companies 
FOR INSERT
TO authenticated  -- ✅ Added this
WITH CHECK (true);
```

The `TO authenticated` clause tells PostgreSQL that this policy applies to authenticated users (logged-in users). Without it, the policy may not work correctly.

---

## Verify the Fix

### 1. Check Policies Exist
```sql
SELECT 
  schemaname,
  tablename,
  policyname,
  permissive,
  roles,
  cmd as command
FROM pg_policies
WHERE schemaname = 'public' 
  AND tablename = 'companies'
ORDER BY policyname;
```

**Expected Output:**
- Should see 3-4 policies for companies table
- One for INSERT
- One for SELECT
- One for UPDATE

### 2. Test Company Creation
1. Log in to your app
2. Go to Settings → Company Settings
3. Fill in company name and details
4. Click Save
5. Should save successfully without errors

### 3. Check Database
```sql
SELECT id, name, email, created_at 
FROM companies 
WHERE id IN (
  SELECT company_id FROM profiles WHERE id = auth.uid()
);
```

Should show your company if creation was successful.

---

## Troubleshooting

### Still Getting the Error?

#### Check 1: Are you logged in?
```sql
SELECT auth.uid(), auth.email();
```
- Should return your user ID and email
- If NULL, you're not authenticated

#### Check 2: Does your profile exist?
```sql
SELECT * FROM profiles WHERE id = auth.uid();
```
- Should return your profile
- If empty, profile wasn't created on signup

#### Check 3: Are RLS policies enabled?
```sql
SELECT tablename, rowsecurity 
FROM pg_tables 
WHERE schemaname = 'public' 
  AND tablename = 'companies';
```
- `rowsecurity` should be `true`
- If `false`, RLS is disabled

#### Check 4: Can you query companies table?
```sql
SELECT * FROM companies LIMIT 1;
```
- If this fails with permission error, RLS is blocking all access
- Re-run the fix script

---

## Complete Database Reset (If Nothing Else Works)

If you're still having issues, you may need to reset the entire database:

### ⚠️ Warning: This deletes all data!

1. Run `SUPABASE_RESET_AND_SETUP.sql` (updated with fixes)
2. This will:
   - Drop all tables
   - Recreate them
   - Set up correct RLS policies
   - Create triggers

---

## Prevention

To prevent this error in the future:

### 1. Always Include Role in Policies
```sql
-- ❌ Bad
CREATE POLICY "my_policy" ON table_name FOR INSERT WITH CHECK (true);

-- ✅ Good
CREATE POLICY "my_policy" ON table_name FOR INSERT TO authenticated WITH CHECK (true);
```

### 2. Test Policies After Creation
```sql
-- Try to insert a test record
INSERT INTO companies (name) VALUES ('Test Company');
```

### 3. Use Separate Policies for Each Operation
- One policy for SELECT
- One policy for INSERT
- One policy for UPDATE
- One policy for DELETE

This makes debugging easier.

---

## Understanding RLS Policies

### Policy Components

```sql
CREATE POLICY "policy_name"
ON table_name
FOR operation        -- SELECT, INSERT, UPDATE, DELETE, or ALL
TO role             -- authenticated, anon, service_role
USING (condition)   -- For SELECT, UPDATE, DELETE
WITH CHECK (condition)  -- For INSERT, UPDATE
```

### For Companies Table

**INSERT Policy:**
- No USING clause (doesn't check existing rows)
- WITH CHECK (true) - Always allows insert for authenticated users

**SELECT Policy:**
- USING clause checks if company_id matches user's profile
- Only shows companies user belongs to

**UPDATE Policy:**
- USING clause checks ownership (can only update own company)
- WITH CHECK clause ensures you can't change company to one you don't own

---

## Testing Checklist

After applying the fix:

- [ ] Can log in successfully
- [ ] Can access Company Settings page
- [ ] Can see loading state
- [ ] Can fill in company form
- [ ] Can click Save button
- [ ] Save completes without errors
- [ ] Success message appears
- [ ] Page refreshes with saved data
- [ ] All fields persist (name, address, phone, etc.)
- [ ] Can update existing company
- [ ] Update saves successfully

---

## Related Files

Files updated with this fix:
- ✅ `/FIX_COMPANIES_RLS.sql` - Quick fix script
- ✅ `/SUPABASE_RESET_AND_SETUP.sql` - Updated with `TO authenticated`
- ✅ `/SUPABASE_RLS_POLICIES.sql` - Updated with `TO authenticated`

---

## Additional Resources

- [Supabase RLS Documentation](https://supabase.com/docs/guides/auth/row-level-security)
- [PostgreSQL RLS Policies](https://www.postgresql.org/docs/current/ddl-rowsecurity.html)
- See `TROUBLESHOOTING_GUIDE.md` for more issues

---

## Summary

The RLS policy error is now fixed by:
1. Adding `TO authenticated` to all policies
2. Making INSERT policy permissive (WITH CHECK true)
3. Properly scoping SELECT and UPDATE policies

**Run `FIX_COMPANIES_RLS.sql` and you should be good to go!** ✅
