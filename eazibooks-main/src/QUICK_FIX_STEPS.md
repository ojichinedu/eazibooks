# Quick Fix: RLS Error - 3 Steps

## The Error
```
new row violates row-level security policy for table "companies"
```

## The Fix (3 Minutes)

### 📍 Step 1: Open Supabase SQL Editor

```
1. Go to: https://supabase.com/dashboard
2. Select your project
3. Click "SQL Editor" (left sidebar)
4. Click "New Query"
```

### 📝 Step 2: Run This SQL

**Open file:** `FIX_ALL_RLS_NOW.sql`

**Copy everything** and paste into SQL Editor

**Click:** "Run" button (or Ctrl+Enter)

**Wait for:** Success message

### 🔄 Step 3: Test in Your App

```
1. Refresh browser (Ctrl+Shift+R)
2. Go to Settings → Company Settings
3. Fill in details
4. Click Save
5. ✅ Should work!
```

---

## Why This Works

The SQL script adds `TO authenticated` to your RLS policies.

**Before:**
```sql
CREATE POLICY ... WITH CHECK (true);
-- ❌ Missing role specification
```

**After:**
```sql
CREATE POLICY ... TO authenticated WITH CHECK (true);
-- ✅ Allows logged-in users
```

---

## Verification

After running, check policies:

```sql
SELECT policyname, roles 
FROM pg_policies 
WHERE tablename = 'companies';
```

Should see `{authenticated}` in the roles column.

---

## Still Not Working?

1. **Clear browser cache:** `localStorage.clear()` in console
2. **Check you're logged in:** Should see your email in top right
3. **Hard refresh:** Ctrl+Shift+R (Windows) or Cmd+Shift+R (Mac)
4. **Try again:** Go to Settings → Company Settings → Save

---

## Files to Use

| File | Purpose |
|------|---------|
| **FIX_ALL_RLS_NOW.sql** | ⭐ Run this (fixes everything) |
| IMMEDIATE_RLS_FIX.sql | Alternative (companies only) |
| HOW_TO_FIX_RLS_ERROR.md | Detailed guide |

---

## Success = No More Errors! 🎉

After the fix:
- ✅ Can create companies
- ✅ Can save settings
- ✅ No RLS errors
- ✅ App works normally
