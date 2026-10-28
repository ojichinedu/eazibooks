# EaziBook Quick Start Guide
## Get Your ERP System Running in 30 Minutes

**Version:** 1.0  
**Last Updated:** January 28, 2025  
**For:** Developers setting up EaziBook for the first time

---

## ⚡ Quick Setup (5 Minutes)

### 1. Clone & Install
```bash
# Clone the repository
git clone https://github.com/your-org/eazibook.git
cd eazibook

# Install dependencies
npm install

# Start development server
npm run dev

# Open browser
http://localhost:3000
```

**That's it!** The app runs with mock data. No database needed for UI testing.

---

## 🗄️ Add Database (15 Minutes)

### Step 1: Create Supabase Project (5 min)
1. Go to https://supabase.com/dashboard
2. Click "New Project"
3. Name it "EaziBook"
4. Choose region close to you
5. Generate password (save it!)
6. Wait for provisioning

### Step 2: Run Database Schema (2 min)
1. Go to SQL Editor in Supabase
2. Open `/SUPABASE_SCHEMA.sql` from project
3. Copy all contents
4. Paste in SQL Editor
5. Click "Run"
6. Wait 30 seconds

### Step 3: Configure Environment (3 min)
Create `.env.local` in project root:

```env
NEXT_PUBLIC_SUPABASE_URL=https://xxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1N...
OPENAI_API_KEY=sk-proj-xxxxx
```

Get values from: Supabase → Settings → API

### Step 4: Restart Server (1 min)
```bash
# Stop server (Ctrl+C)
# Start again
npm run dev
```

✅ Database connected!

---

## 🎨 Understanding the Structure

### Main Files
```
/App.tsx                 → Entry point
/components/
  ├── Dashboard.tsx      → Main dashboard
  ├── Customers.tsx      → Customer management
  ├── ProductsCatalog.tsx→ Product catalog
  ├── Suppliers.tsx      → Supplier management
  ├── Transactions.tsx   → Transaction history
  ├── Reports.tsx        → Business reports
  ├── QuickInvoice.tsx   → Invoice creation
  ├── QuickBilling.tsx   → Bill creation
  └── settings/          → All setting components
      ├── ProfileAccount.tsx
      ├── TaxConfiguration.tsx
      └── ... (9 total tabs)

/dashboard/
  ├── DashboardApp.tsx   → Route handler
  └── layout/
      ├── Layout.tsx     → Sidebar & navigation
      └── Settings.tsx   → Settings page

/utils/
  ├── AuthContext.tsx    → Authentication
  ├── CurrencyContext.tsx→ Currency handling
  └── SubscriptionContext.tsx → Plan management
```

---

## 🧭 Navigation Map

### User Journey
```
Landing Page
    ↓
Sign Up/Login
    ↓
Dashboard ← You are here
    ├── Quick Invoice
    ├── Quick Billing
    ├── Customers
    ├── Products
    ├── Suppliers
    ├── Transactions
    ├── Reports
    ├── AI OCR Scanner (Premium)
    ├── Accounting (Pro)
    ├── Inventory (Pro)
    ├── Tax (Pro)
    ├── Payroll (Premium)
    └── Settings
        ├── Profile & Account
        ├── Company Settings
        ├── User Management
        ├── Tax Configuration
        ├── Integrations
        ├── Backup & Security
        ├── Notifications
        ├── Subscription
        └── AI Features
```

---

## 🎯 Key Features

### 1. Quick Invoice
**Path:** Dashboard → Quick Invoice  
**Purpose:** Create professional invoices  
**Key Features:**
- Customer selection
- Multiple line items
- Auto tax calculation
- PDF generation
- Email sending

### 2. Customers
**Path:** Dashboard → Customers  
**Purpose:** Manage customer database  
**Key Features:**
- Add/Edit/Delete
- Search & filter
- Credit limits
- Outstanding balances
- Export to CSV

### 3. Products
**Path:** Dashboard → Products  
**Purpose:** Manage product catalog  
**Key Features:**
- Products & Services
- Stock tracking
- Pricing management
- Low stock alerts
- Categories

### 4. Reports
**Path:** Dashboard → Reports  
**Purpose:** Business intelligence  
**Key Features:**
- Profit & Loss
- Balance Sheet
- Cash Flow
- Sales reports
- Export options

### 5. Settings
**Path:** Dashboard → Settings  
**Purpose:** System configuration  
**9 Tabs:** Profile, Company, Users, Tax, Integrations, Backup, Notifications, Subscription, AI

---

## 🔐 User Roles & Permissions

### Free Plan
- ✅ 5 invoices/month
- ✅ 5 bills/month
- ✅ Quick Invoice & Billing
- ✅ Basic reports
- ❌ No branding customization
- ❌ No AI features

### Starter (₦5,000/month)
- ✅ 50 transactions/month
- ✅ Company branding
- ✅ All basic features
- ❌ No AI features

### Professional (₦10,000/month)
- ✅ Unlimited transactions
- ✅ Full ERP features
- ✅ Advanced reports
- ❌ No AI features

### Premium (₦15,000/month)
- ✅ Everything in Professional
- ✅ AI OCR Scanner
- ✅ AI Chatbot
- ✅ AI Insights

---

## 🧪 Testing

### Quick Test Checklist
```bash
# 1. Authentication
☐ Sign up new user
☐ Login with credentials
☐ Logout

# 2. Dashboard
☐ View stats
☐ Click Quick Invoice
☐ Click Quick Billing

# 3. Customers
☐ Add new customer
☐ Edit customer
☐ Delete customer
☐ Search customer

# 4. Products
☐ Add new product
☐ Toggle grid/list view
☐ Filter by category

# 5. Settings
☐ Update profile
☐ Change company logo
☐ Configure tax rate
☐ Enable notifications

# 6. Invoice
☐ Create invoice
☐ Preview PDF
☐ Save draft
```

**Expected Time:** 10-15 minutes

---

## 🐛 Common Issues

### Issue: "Cannot connect to Supabase"
**Solution:**
```bash
# Check .env.local file exists
ls .env.local

# Verify environment variables loaded
npm run dev
# Check console for "Supabase URL: https://..."
```

### Issue: "Tables not found"
**Solution:**
1. Go to Supabase → Table Editor
2. Verify tables exist
3. If not, re-run SUPABASE_SCHEMA.sql

### Issue: "Authentication fails"
**Solution:**
1. Check Supabase → Authentication is enabled
2. Verify email confirmation disabled (for testing)
3. Check RLS policies

### Issue: "Page loads slow"
**Solution:**
```bash
# Clear Next.js cache
rm -rf .next
npm run dev
```

---

## 📚 Detailed Documentation

For in-depth information, see:

| Document | Purpose | Time to Read |
|----------|---------|--------------|
| `README.md` | Project overview | 5 min |
| `ARCHITECTURE.md` | System design | 10 min |
| `LAUNCH_READINESS_PLAN.md` | Implementation roadmap | 20 min |
| `SUPABASE_SETUP_GUIDE.md` | Database setup | 15 min |
| `TESTING_GUIDE.md` | Testing procedures | 30 min |
| `IMPLEMENTATION_SUMMARY.md` | What was built | 10 min |

---

## 🚀 Deployment

### Deploy to Vercel (10 Minutes)

1. **Push to GitHub**
   ```bash
   git add .
   git commit -m "Initial commit"
   git push origin main
   ```

2. **Import to Vercel**
   - Go to https://vercel.com
   - Click "Import Project"
   - Select your GitHub repo
   - Click "Import"

3. **Add Environment Variables**
   - In Vercel project settings
   - Add all variables from `.env.local`
   - Redeploy

4. **Done!**
   - Your URL: https://eazibook.vercel.app

---

## 💡 Pro Tips

### 1. Use Mock Data First
Don't rush to connect database. Test all UI features with mock data first.

### 2. Customize Branding
Go to Settings → Company Settings and upload your logo.

### 3. Configure Currency
Settings → Company Settings → Currency (NGN, USD, ZAR, GHS)

### 4. Set Up Tax Rates
Settings → Tax Configuration → Add your local tax rates

### 5. Enable Notifications
Settings → Notifications → Configure what you want to receive

### 6. Test Mobile
Open on your phone: http://YOUR_IP:3000

### 7. Use Keyboard Shortcuts
- `Tab` - Navigate between fields
- `Enter` - Submit forms
- `Esc` - Close dialogs

---

## 🎓 Learning Path

### Day 1: Explore UI
- [ ] Navigate all pages
- [ ] Create test invoice
- [ ] Add sample customers
- [ ] View reports

### Day 2: Configure Settings
- [ ] Set up company profile
- [ ] Configure tax rates
- [ ] Set notification preferences
- [ ] Review subscription options

### Day 3: Connect Database
- [ ] Set up Supabase
- [ ] Run schema
- [ ] Test data persistence
- [ ] Verify authentication

### Day 4: Test Workflows
- [ ] Create real invoice
- [ ] Record payment
- [ ] Generate report
- [ ] Export data

### Day 5: Go Live
- [ ] Import real data
- [ ] Train users
- [ ] Monitor usage
- [ ] Gather feedback

---

## 📞 Getting Help

### In Order of Speed:

1. **Check Documentation** (Fastest)
   - Read relevant `.md` files
   - Check troubleshooting sections

2. **Console Errors** (Fast)
   - Open browser DevTools (F12)
   - Check Console tab for errors
   - Check Network tab for failed requests

3. **GitHub Issues** (Medium)
   - Search existing issues
   - Create new issue with:
     - Steps to reproduce
     - Expected vs actual behavior
     - Screenshots
     - Console errors

4. **Contact Team** (Slower)
   - Email: support@eazibook.com
   - Include error details
   - Include screenshots

---

## ✅ Pre-Launch Checklist

Before going live with real data:

- [ ] All pages load without errors
- [ ] Can create customer
- [ ] Can create product
- [ ] Can generate invoice
- [ ] PDF generates correctly
- [ ] Company logo displays
- [ ] Currency formatting correct
- [ ] Tax calculations accurate
- [ ] Search works
- [ ] Filters work
- [ ] Mobile responsive
- [ ] Tested on Chrome, Firefox, Safari
- [ ] Backup configured
- [ ] Environment variables secure
- [ ] SSL certificate installed
- [ ] Domain configured

---

## 🎉 You're Ready!

Your EaziBook instance is now running. Start by:

1. Creating your company profile
2. Adding a few customers
3. Creating some products
4. Generating your first invoice
5. Exploring reports

**Need help?** Check the documentation files or contact support.

**Happy booking!** 📊

---

**Document Version:** 1.0  
**Last Updated:** January 28, 2025  
**Estimated Reading Time:** 10 minutes  
**Estimated Setup Time:** 30 minutes
