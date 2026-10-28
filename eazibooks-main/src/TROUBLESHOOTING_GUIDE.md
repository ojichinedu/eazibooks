# EaziBook - Troubleshooting Guide

## Common Errors and Solutions

### 1. Database / Supabase Errors

#### Error: "column does not exist"
**Solution:**
1. Make sure you ran the database setup in the correct order
2. Use the all-in-one setup file: `SUPABASE_RESET_AND_SETUP.sql`
3. Clear your browser cache and refresh

#### Error: "relation does not exist" or "table does not exist"
**Solution:**
```sql
-- Run this in Supabase SQL Editor to check tables
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public';
```
If tables are missing, run `SUPABASE_RESET_AND_SETUP.sql`

#### Error: "policy does not exist" or RLS policy errors
**Solution:**
1. Check if RLS is enabled:
```sql
SELECT tablename, rowsecurity 
FROM pg_tables 
WHERE schemaname = 'public';
```
2. Re-run the RLS policies section from `SUPABASE_RESET_AND_SETUP.sql`

#### Error: "permission denied for table"
**Solution:**
This means RLS policies are blocking access. Check:
1. Are you logged in?
2. Does your profile have a company_id set?
```sql
-- Check your profile
SELECT * FROM profiles WHERE id = auth.uid();
```

---

### 2. Authentication Errors

#### Error: "Invalid login credentials"
**Solution:**
1. Make sure the email/password are correct
2. Check if the user exists in Supabase Dashboard → Authentication → Users
3. Try password reset if needed

#### Error: "Email not confirmed"
**Solution:**
1. In Supabase Dashboard → Authentication → Settings
2. Disable "Enable email confirmations" for development
3. Or check the user's email for confirmation link

#### Error: "User not found" or auth context undefined
**Solution:**
Check the AuthContext is properly wrapped around your app:
```tsx
// In App.tsx
<AuthProvider>
  <SubscriptionProvider>
    <CurrencyProvider>
      {/* Your app content */}
    </CurrencyProvider>
  </SubscriptionProvider>
</AuthProvider>
```

---

### 3. Company Settings / Profile Errors

#### Error: "Cannot read property 'company_id' of null"
**Solution:**
1. Make sure the user is logged in
2. Check if the profile exists in the database
3. Ensure company_id is set in the profile

#### Error: Slow loading on Company Settings
**Solution:**
This should already be fixed with the performance optimizations. If still slow:
1. Check Supabase Dashboard → Database → Query Performance
2. Make sure indexes are created (run `SUPABASE_OPTIMIZATION.sql`)
3. Check browser network tab for slow queries

---

### 4. Subscription Errors

#### Error: "Subscription limit reached"
**Solution:**
1. Check your current plan:
```tsx
const { plan, usage, limits } = useSubscription();
console.log({ plan, usage, limits });
```
2. Upgrade to a higher tier if needed
3. For testing, manually update the subscription in Supabase

#### Error: Premium features not accessible
**Solution:**
Check the subscription status:
```sql
SELECT * FROM subscriptions WHERE user_id = 'YOUR_USER_ID';
```
Make sure:
- `status = 'active'`
- `plan_type` is set correctly
- `end_date` hasn't passed

---

### 5. Invoice / Billing Errors

#### Error: "Failed to generate invoice"
**Solution:**
1. Check if customer data is valid
2. Ensure products are added to the invoice
3. Check browser console for specific error messages

#### Error: "Invoice number already exists"
**Solution:**
The invoice number must be unique. Either:
1. Use a different invoice number
2. Or delete the existing invoice with that number

---

### 6. Build / Runtime Errors

#### Error: "Module not found" or import errors
**Solution:**
1. Check if the file path is correct
2. Make sure all dependencies are installed
3. Restart the development server

#### Error: "Cannot use import statement outside a module"
**Solution:**
Check your import statements use the correct syntax:
```tsx
// Correct
import { Component } from './Component';
import { supabase } from '../utils/supabase/client';

// Incorrect
const Component = require('./Component');
```

#### Error: TypeScript errors
**Solution:**
Most TypeScript errors in this project are informational. The code will still run. If needed:
1. Check the type definitions
2. Add `// @ts-ignore` above the error line (temporary)
3. Fix the actual type mismatch

---

### 7. UI / Layout Errors

#### Error: Cannot scroll on dashboard
**Solution:**
✅ This is already fixed! The layout now properly supports scrolling.

#### Error: Sidebar not showing
**Solution:**
Make sure the SidebarProvider is wrapping your layout:
```tsx
<SidebarProvider>
  <Layout>{children}</Layout>
</SidebarProvider>
```

#### Error: Styles not loading
**Solution:**
1. Check `styles/globals.css` is imported in your app
2. Clear browser cache
3. Check Tailwind classes are being applied

---

### 8. Currency / Multi-currency Errors

#### Error: Wrong currency showing
**Solution:**
Check the CurrencyContext:
```tsx
const { currency, setCurrency } = useCurrency();
console.log('Current currency:', currency);
```
Or change it:
```tsx
setCurrency('USD'); // or 'NGN', 'ZAR', 'GHS'
```

---

### 9. AI Features Errors (OCR Scanner, Chatbot)

#### Error: "This feature is only available for Premium users"
**Solution:**
This is expected behavior. Upgrade to Premium plan to access:
- AI OCR Scanner
- AI Business Consultant Chatbot

#### Error: OpenAI API key missing
**Solution:**
The OpenAI integration requires an API key configured in Supabase Edge Functions. 
For development, the features show UI mockups without actual API calls.

---

## Debugging Tips

### 1. Check Browser Console
Open DevTools (F12) and check the Console tab for error messages.

### 2. Check Network Tab
Look for failed API requests in the Network tab to see what's failing.

### 3. Check Supabase Logs
Go to Supabase Dashboard → Logs to see server-side errors.

### 4. Enable Verbose Logging
Add this to see detailed logs:
```tsx
// In AuthContext.tsx or other files
console.log('Debug info:', { user, company, subscription });
```

### 5. Check Database State
Use the SQL Editor to query the database directly:
```sql
-- Check if user exists
SELECT * FROM auth.users WHERE email = 'your@email.com';

-- Check profile
SELECT * FROM profiles WHERE email = 'your@email.com';

-- Check company
SELECT * FROM companies WHERE id = 'company-id';

-- Check subscription
SELECT * FROM subscriptions WHERE user_id = 'user-id';
```

---

## Still Having Issues?

If none of these solutions work:

1. **Check the specific error message** and search for it in this guide
2. **Clear all browser data** (cache, localStorage, cookies)
3. **Try in incognito/private mode** to rule out browser extensions
4. **Check Supabase project status** at status.supabase.com
5. **Restart your development server**
6. **Re-run the database setup** using `SUPABASE_RESET_AND_SETUP.sql`

---

## Quick Reset (Nuclear Option)

If everything is broken and you want to start fresh:

### 1. Reset Database
Run `SUPABASE_RESET_AND_SETUP.sql` in Supabase SQL Editor

### 2. Clear Browser
- Clear all cookies and cache
- Clear localStorage: Open Console and run `localStorage.clear()`
- Refresh the page

### 3. Create New Test User
- Sign up with a new email
- Create a new company
- Test the features

---

## Performance Optimization

If the app is running slow:

### 1. Database Optimization
Run `SUPABASE_OPTIMIZATION.sql` to create performance indexes

### 2. Browser Performance
- Close unused tabs
- Disable browser extensions
- Use Chrome/Edge for best performance

### 3. Network Performance
- Check internet connection
- Use Supabase region closest to you
- Check Supabase Dashboard → Settings → General for region

---

## Production Checklist

Before deploying to production:

- [ ] All SQL files executed successfully
- [ ] RLS policies are enabled and working
- [ ] Authentication is working correctly
- [ ] Email confirmations configured (if needed)
- [ ] Company settings save properly
- [ ] Invoicing and billing work correctly
- [ ] Subscription limits are enforced
- [ ] Premium features are gated properly
- [ ] Performance is acceptable (< 3s page loads)
- [ ] All forms validate correctly
- [ ] Error messages are user-friendly
- [ ] Mobile responsiveness works
- [ ] Browser console has no errors

---

## Support Resources

- **Supabase Docs**: https://supabase.com/docs
- **React Docs**: https://react.dev
- **Tailwind Docs**: https://tailwindcss.com/docs
- **shadcn/ui**: https://ui.shadcn.com

---

✅ **Most issues can be resolved by:**
1. Re-running the database setup
2. Clearing browser cache
3. Checking Supabase logs
4. Verifying RLS policies are active
