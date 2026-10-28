# Quick Installation & Testing Guide
## Get EaziBook Running with Full Features in 10 Minutes

**Date:** January 28, 2025  
**For:** Immediate testing of new features

---

## ⚡ Step 1: Install Dependencies (2 minutes)

```bash
# Install PDF generation libraries
npm install jspdf jspdf-autotable

# Install Supabase client (if not already installed)
npm install @supabase/supabase-js

# Install all other dependencies
npm install

# Start development server
npm run dev
```

**Expected Output:**
```
> next dev
ready - started server on 0.0.0.0:3000, url: http://localhost:3000
```

---

## 🧪 Step 2: Test PDF Generation (3 minutes)

### A. Open Quick Invoice
1. Navigate to http://localhost:3000
2. Log in (or skip if in dev mode)
3. Click "Quick Invoice" in sidebar

### B. Fill Invoice Data
```
Invoice Information:
- Invoice Number: INV-001 (auto-filled)
- Invoice Date: Today's date (auto-filled)
- Due Date: 30 days from now

Customer Details:
- Name: Test Customer Ltd
- Email: test@customer.com
- Phone: +234 803 123 4567
- Address: 123 Test Street, Lagos

Line Items:
- Description: Professional Consulting
- Quantity: 10
- Rate: 15000
- Tax: 18%
```

### C. Generate & Test PDF
1. Click "Generate Invoice"
2. On preview page, click "Preview PDF" → New tab opens with PDF
3. Click "Download PDF" → File downloads
4. Open PDF and verify:
   - ✅ Company name displays
   - ✅ Customer details correct
   - ✅ Line items formatted
   - ✅ Totals calculate correctly
   - ✅ Professional layout

**🎉 Success:** PDF generation is working!

---

## 💳 Step 3: Test Payment Gateway (2 minutes)

### A. Navigate to Subscription
1. Click "Settings" in sidebar
2. Click "Subscription" tab
3. You should see 4 plan cards

### B. Test Upgrade Flow
1. Click "Upgrade to Professional"
2. Payment modal opens
3. Test all 3 tabs:
   - **Card:** Enter test data (form validation works)
   - **Bank Transfer:** See account details
   - **Mobile Money:** Select provider

### C. Test Card Payment UI
```
Test Card Data:
- Cardholder Name: John Doe
- Card Number: 4242 4242 4242 4242
- Expiry: 12/25
- CVV: 123
```

4. Click "Pay ₦10,000"
5. Processing animation shows
6. Success screen appears
7. Plan upgrades automatically
8. Toast notification shows "Successfully upgraded!"

**🎉 Success:** Payment UI is working! (Actual payment needs API keys)

---

## 📱 Step 4: Test Responsive Settings (1 minute)

### A. Desktop View
1. Open Settings page
2. Verify all 9 tabs visible

### B. Mobile View
1. Open Chrome DevTools (F12)
2. Click "Toggle Device Toolbar" (Ctrl+Shift+M)
3. Select "iPhone 12"
4. Refresh page
5. Navigate to Settings
6. Verify tabs wrap nicely
7. All tabs accessible

### C. Test Different Sizes
```bash
# Test at:
- 320px (Galaxy Fold)
- 375px (iPhone SE)
- 768px (iPad)
- 1024px (Desktop)
```

**🎉 Success:** Settings is fully responsive!

---

## 🗄️ Step 5: Set Up Supabase (Optional - 15 minutes)

### Quick Setup
```bash
# 1. Create Supabase project
Visit: https://supabase.com/dashboard
Click: "New Project"
Name: EaziBook-Dev
Wait: 2-3 minutes

# 2. Get credentials
Go to: Settings > API
Copy: Project URL
Copy: anon/public key
```

### Add to Environment
Create `.env.local`:
```env
NEXT_PUBLIC_SUPABASE_URL=https://xxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGci...
```

### Run Schema
1. Go to SQL Editor in Supabase
2. Open `/SUPABASE_SCHEMA.sql`
3. Copy all contents
4. Paste in SQL Editor
5. Click "Run"
6. Wait 30 seconds

### Test Connection
```bash
# Restart server
npm run dev

# Check console for:
"Supabase connected successfully" ✅
```

**🎉 Success:** Database is connected!

---

## ✅ Verification Checklist

After completing steps above, verify:

### PDF Generation
- [x] Invoice PDF downloads
- [x] PDF previews in new tab
- [x] Data is accurate
- [x] Layout is professional
- [x] Currency formats correctly

### Payment Gateway
- [x] Modal opens on upgrade click
- [x] Card form validates input
- [x] Bank transfer shows details
- [x] Mobile money has providers
- [x] Processing animation works
- [x] Success screen displays
- [x] Plan updates after payment

### Responsive Design
- [x] Settings tabs wrap on mobile
- [x] All tabs accessible
- [x] Text is readable
- [x] Buttons are tappable
- [x] No horizontal scroll

### Database (If connected)
- [x] Supabase client initializes
- [x] Tables exist
- [x] Can query data
- [x] RLS policies work

---

## 🐛 Troubleshooting

### Issue: PDF doesn't generate

**Solution:**
```bash
# Check if jsPDF is installed
npm list jspdf

# If not found:
npm install jspdf jspdf-autotable

# Restart server
npm run dev
```

### Issue: Payment modal doesn't open

**Solution:**
```typescript
// Check browser console for errors
// Common issues:
1. Missing import → Check Subscription.tsx
2. State not updating → Clear browser cache
3. Button not connected → Check onClick handler
```

### Issue: Settings tabs overflow

**Solution:**
```bash
# Check Tailwind config
# Ensure Settings.tsx has:
className="flex-wrap h-auto gap-1"

# Force refresh:
Ctrl + Shift + R
```

### Issue: Supabase connection fails

**Solution:**
```bash
# 1. Check .env.local exists
ls .env.local

# 2. Check variables are set
cat .env.local

# 3. Restart server
npm run dev

# 4. Check browser console
# Should see: "Supabase URL: https://..."
```

---

## 🎮 Demo Scenarios

### Scenario 1: Create & Download Invoice
```
Time: 2 minutes

1. Navigate to Quick Invoice
2. Fill in customer: "Demo Corp"
3. Add item: "Web Development - 20 hours - $100/hr"
4. Click "Generate Invoice"
5. Click "Download PDF"
6. Open PDF and verify data

Success: Professional PDF downloaded ✅
```

### Scenario 2: Upgrade Subscription
```
Time: 1 minute

1. Navigate to Settings > Subscription
2. Note current plan (Free)
3. Click "Upgrade to Premium"
4. Select "Card" payment
5. Fill test card data
6. Click "Pay ₦15,000"
7. Wait for success
8. Verify plan shows "Premium"

Success: Plan upgraded successfully ✅
```

### Scenario 3: Mobile Experience
```
Time: 1 minute

1. Open DevTools (F12)
2. Toggle device mode (Ctrl+Shift+M)
3. Select "iPhone 12"
4. Navigate through app
5. Test Settings tabs
6. Create invoice
7. Test subscription page

Success: Everything works on mobile ✅
```

---

## 📊 Performance Check

### Load Times (Expected)
```
Dashboard:        < 2 seconds
Quick Invoice:    < 1 second
Settings:         < 1 second
PDF Generation:   < 3 seconds
Payment Modal:    < 0.5 seconds
```

### Network Requests
```
Initial Load:     10-15 requests
Page Navigation:  1-3 requests
PDF Generation:   0 requests (client-side)
Payment Flow:     2-5 requests
```

### Lighthouse Scores (Target)
```
Performance:      > 90
Accessibility:    > 95
Best Practices:   > 90
SEO:             > 85
```

---

## 🚀 What's Next?

After successful testing:

### Option A: Go Live with Mock Data
```
Current State:
✅ All UI features work
✅ PDF generation works
✅ Payment UI works
❌ No real database
❌ No real payments

Good for: Demos, UI testing, mockups
```

### Option B: Connect Real Backend
```
Next Steps:
1. Complete Supabase setup (15 min)
2. Add payment API keys (5 min)
3. Test with real data (30 min)
4. Deploy to production (20 min)

Good for: Real users, production use
```

### Option C: Hybrid Approach
```
Setup:
✅ Connect Supabase for data
❌ Keep payment in test mode

Good for: Beta testing, early adopters
```

---

## 💡 Quick Tips

### Tip 1: Use Test Data
```typescript
// Create fake customer quickly
const testCustomer = {
  name: 'Test Customer ' + Date.now(),
  email: 'test@example.com',
  phone: '+234 803 000 0000',
  status: 'active'
};
```

### Tip 2: Clear Cache Often
```bash
# Hard refresh
Ctrl + Shift + R (Windows/Linux)
Cmd + Shift + R (Mac)

# Clear storage
DevTools > Application > Clear Storage
```

### Tip 3: Check Console Always
```bash
# Open console
F12 > Console tab

# Look for:
✅ No red errors
✅ Supabase connection logs
⚠️ Yellow warnings are OK
```

---

## 📞 Need Help?

### Quick Solutions
1. **PDF not working?** → Check jsPDF installed
2. **Payment not opening?** → Check console for errors
3. **Settings broken?** → Clear cache and refresh
4. **Database error?** → Check .env.local exists

### Resources
- Full docs: `/PHASE_2_IMPLEMENTATION_COMPLETE.md`
- Setup guide: `/SUPABASE_SETUP_GUIDE.md`
- Testing guide: `/TESTING_GUIDE.md`

---

## ✅ Success Criteria

You know everything is working when:

- [x] PDF downloads successfully
- [x] PDF preview opens in new tab
- [x] Payment modal opens and works
- [x] Settings responsive on mobile
- [x] No console errors
- [x] All pages load quickly
- [x] Toast notifications appear
- [x] Plans upgrade correctly

**If all checked:** 🎉 You're ready to proceed!

---

**Estimated Time:** 10-15 minutes  
**Difficulty:** Easy  
**Prerequisites:** Node.js 18+, npm/yarn

**Happy Testing! 🚀**
