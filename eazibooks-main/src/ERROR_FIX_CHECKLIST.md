# ✅ Error Fix Checklist

Print this and check off as you go!

---

## 🎯 GOAL
Fix storage upload errors and ignore Jotai warning

---

## 📋 CHECKLIST

### Part 1: SQL Fix
- [ ] Opened Supabase Dashboard
- [ ] Went to SQL Editor
- [ ] Clicked "New Query"
- [ ] Copied `/FIX_EVERYTHING.sql` content
- [ ] Pasted into editor
- [ ] Clicked "Run"
- [ ] Saw success message
- [ ] No SQL errors

### Part 2: Storage Buckets
- [ ] Went to Storage section
- [ ] Checked for `company-assets` bucket
- [ ] Checked for `user-assets` bucket
- [ ] Created company-assets (if missing)
- [ ] Created user-assets (if missing)
- [ ] Both buckets are PUBLIC
- [ ] File size limits set

### Part 3: Browser Cleanup
- [ ] Hard refreshed browser (Ctrl+Shift+R)
- [ ] Opened DevTools (F12)
- [ ] Went to Console tab
- [ ] Ran: `localStorage.clear()`
- [ ] Closed DevTools
- [ ] Hard refreshed again

### Part 4: Test Uploads
- [ ] Went to Settings → Company Settings
- [ ] Clicked "Upload Logo"
- [ ] Selected test image
- [ ] Saw "✅ Logo uploaded successfully!"
- [ ] Logo displayed in preview
- [ ] Clicked "Save Settings"
- [ ] Saw "✅ Company settings saved successfully!"
- [ ] Refreshed page
- [ ] Logo still there

### Part 5: Test Avatar
- [ ] Went to Settings → Profile & Account
- [ ] Clicked "Upload Avatar"
- [ ] Selected test image
- [ ] Saw "✅ Avatar uploaded successfully!"
- [ ] Avatar displayed
- [ ] Refreshed page
- [ ] Avatar still there

### Part 6: Verify No Errors
- [ ] Opened DevTools (F12)
- [ ] Went to Console tab
- [ ] Refreshed page
- [ ] NO red errors
- [ ] NO storage errors
- [ ] Jotai warning OK (yellow)

---

## ✅ DONE!

Date completed: ______________

Time taken: ______________

Notes:
_________________________________
_________________________________
_________________________________

---

## 🆘 IF SOMETHING FAILED

Check the box that failed and note the error:

**Failed at:** _____________________

**Error message:**
_________________________________
_________________________________
_________________________________

**Screenshot saved:** [ ] Yes [ ] No

---

## 📞 GET HELP

Share:
1. Which checkbox failed
2. Error message
3. Screenshot

---

**Completed by:** ______________  
**Verified by:** ______________  
**Status:** [ ] ✅ All Fixed [ ] ⚠️ Partial [ ] ❌ Failed
