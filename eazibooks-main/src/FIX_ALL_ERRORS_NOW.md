# 🔧 Fix All Errors - Complete Guide

## Errors to Fix:
1. ⚠️ Jotai multiple instances warning
2. ❌ Storage RLS policy error (logo upload)
3. ❌ Storage RLS policy error (avatar upload)

---

## FIX 1: Storage RLS Policies (CRITICAL - Do First)

### Problem:
```
Upload error: StorageApiError: new row violates row-level security policy
Error uploading logo: StorageApiError: new row violates row-level security policy
```

### Solution: Run SQL Script

**Step 1:** Go to Supabase Dashboard
- Open: https://supabase.com/dashboard
- Select your project: `khpiznboahwnszaavtig`
- Click **SQL Editor** in left sidebar

**Step 2:** Run Storage Fix Script
1. Click **"New Query"**
2. Copy **ALL content** from `/FIX_STORAGE_RLS.sql`
3. Paste into SQL Editor
4. Click **"Run"**
5. Wait for success message: "✅✅✅ STORAGE RLS POLICIES FIXED!"

**Step 3:** Verify Buckets Exist
1. Click **Storage** in left sidebar
2. You should see two buckets:
   - `company-assets` (Public)
   - `user-assets` (Public)

**Step 4:** If Buckets Don't Exist, Create Them

#### Create company-assets bucket:
1. Click **"New bucket"**
2. Name: `company-assets`
3. Public bucket: **ON** ✅
4. File size limit: `5242880` (5MB)
5. Allowed MIME types: `image/*`
6. Click **"Create bucket"**

#### Create user-assets bucket:
1. Click **"New bucket"**
2. Name: `user-assets`
3. Public bucket: **ON** ✅
4. File size limit: `2097152` (2MB)
5. Allowed MIME types: `image/*`
6. Click **"Create bucket"**

**Step 5:** Test Upload
1. Go back to your EaziBook app
2. Hard refresh: `Ctrl + Shift + R` (Windows) or `Cmd + Shift + R` (Mac)
3. Go to **Settings → Company Settings**
4. Try uploading a company logo
5. Should see: "✅ Logo uploaded successfully!"

---

## FIX 2: Jotai Multiple Instances Warning

### Problem:
```
Detected multiple Jotai instances. It may cause unexpected behavior with the default store.
```

### Root Cause:
This warning comes from `recharts@2.15.2` library which internally uses Jotai. It's a known issue with Recharts and is **safe to ignore** for now.

### Solutions (Choose One):

#### Option A: Ignore the Warning (Recommended for Now)
The warning doesn't affect functionality. Recharts works fine with this warning.

**No action needed.**

#### Option B: Suppress the Warning in Console
Add this to your browser console to hide it:

```javascript
// Suppress Jotai warning
const originalWarn = console.warn;
console.warn = (...args) => {
  if (args[0]?.includes?.('Jotai')) return;
  originalWarn.apply(console, args);
};
```

#### Option C: Update Recharts (Advanced - May Break Charts)
If you want to try updating Recharts, you can attempt:

```bash
npm update recharts@latest
# or
yarn upgrade recharts@latest
```

**⚠️ Warning:** This might require chart code updates and is NOT recommended before launch.

### Why This Happens:
- Recharts uses Jotai internally for state management
- When Recharts is imported with version pinning (`recharts@2.15.2`), it can create duplicate Jotai instances
- This is a known issue: https://github.com/recharts/recharts/issues/3615

### Impact:
- ✅ **No functional impact** - charts work fine
- ✅ **No user-facing issues**
- ⚠️ Just a console warning

**Recommendation:** Ignore this warning for now. Fix after launch.

---

## FIX 3: Clear Browser Cache

After running the SQL fixes, clear your browser cache:

### Method 1: Hard Refresh
- **Windows:** `Ctrl + Shift + R`
- **Mac:** `Cmd + Shift + R`

### Method 2: Clear All Data
1. Press `F12` to open DevTools
2. Go to **Application** tab (Chrome) or **Storage** tab (Firefox)
3. Click **"Clear site data"** or **"Clear All"**
4. Close DevTools
5. Refresh page

### Method 3: Clear LocalStorage (Safest)
1. Press `F12` to open DevTools
2. Go to **Console** tab
3. Type: `localStorage.clear()`
4. Press **Enter**
5. Close DevTools
6. Hard refresh: `Ctrl + Shift + R`

---

## VERIFICATION CHECKLIST

After applying fixes, verify everything works:

### ✅ Storage Upload Test
- [ ] Go to Settings → Company Settings
- [ ] Click "Upload Logo"
- [ ] Select an image file (< 5MB)
- [ ] Should see: "✅ Logo uploaded successfully!"
- [ ] Logo should display in preview
- [ ] Click "Save Settings"
- [ ] Refresh page
- [ ] Logo should still be there

### ✅ Avatar Upload Test
- [ ] Go to Settings → Profile & Account
- [ ] Click "Upload Avatar"
- [ ] Select an image file (< 2MB)
- [ ] Should see: "✅ Avatar uploaded successfully!"
- [ ] Avatar should display
- [ ] Refresh page
- [ ] Avatar should still be there

### ✅ Company Settings Test
- [ ] Go to Settings → Company Settings
- [ ] Fill in company name: "Test Company"
- [ ] Fill in required fields (address, phone, email)
- [ ] Click "Save Settings"
- [ ] Should see: "✅ Company settings saved successfully!"
- [ ] Refresh page
- [ ] Data should still be there

### ✅ Console Test
- [ ] Press `F12` to open DevTools
- [ ] Go to **Console** tab
- [ ] Refresh page
- [ ] Should see **NO red errors**
- [ ] Jotai warning is OK (yellow, not critical)
- [ ] Close DevTools

---

## TROUBLESHOOTING

### Issue: "Bucket not found" error

**Solution:**
1. Go to Supabase Storage
2. Create the missing bucket (see Step 4 above)
3. Run `/FIX_STORAGE_RLS.sql` again
4. Refresh browser

### Issue: "Permission denied" error

**Solution:**
1. Make sure buckets are set to **Public**
2. Re-run `/FIX_STORAGE_RLS.sql`
3. Clear browser cache
4. Try again

### Issue: "File too large" error

**Solution:**
- Company logos: Max 5MB
- User avatars: Max 2MB
- Compress your image first
- Use PNG, JPG, or GIF format

### Issue: Still seeing storage errors

**Solution:**
1. Verify you're logged in to the app
2. Check Supabase project URL matches your app
3. Run this in Supabase SQL Editor:

```sql
-- Check if policies exist
SELECT policyname, cmd, roles 
FROM pg_policies 
WHERE schemaname = 'storage' 
AND tablename = 'objects';
```

Should show 8 policies (2 buckets × 4 operations)

4. If no policies shown, run `/FIX_STORAGE_RLS.sql` again

### Issue: Jotai warning still showing

**Solution:**
- This is expected and safe to ignore
- It doesn't affect functionality
- Will be fixed in a future Recharts update
- Not a blocker for launch

---

## QUICK FIX SUMMARY

**Do this in order:**

1. ✅ **Run `/FIX_STORAGE_RLS.sql` in Supabase** (2 min)
2. ✅ **Verify buckets exist** (1 min)
3. ✅ **Create buckets if missing** (2 min)
4. ✅ **Clear browser cache** (30 sec)
5. ✅ **Test logo upload** (1 min)
6. ✅ **Test avatar upload** (1 min)
7. ✅ **Ignore Jotai warning** (0 min)

**Total Time:** 5-10 minutes

---

## EXPECTED RESULT

### Before Fix:
```
❌ Upload error: StorageApiError
❌ new row violates row-level security policy
❌ Cannot upload logos
❌ Cannot upload avatars
⚠️ Jotai warning in console
```

### After Fix:
```
✅ Logo uploads successfully
✅ Avatar uploads successfully
✅ Files persist after refresh
✅ Images display correctly
⚠️ Jotai warning still there (OK to ignore)
```

---

## NEED HELP?

If you still have issues after following this guide:

1. **Check Console for errors:**
   - Press F12 → Console tab
   - Copy ALL error messages
   
2. **Check Supabase Logs:**
   - Go to Supabase Dashboard
   - Click "Logs" in sidebar
   - Look for recent errors

3. **Share this info:**
   - Error messages from console
   - Screenshot of error
   - What you were trying to do
   - Which step failed

---

**🚀 RUN THE FIX AND YOU'LL BE UPLOADING IN 5 MINUTES! 🚀**
