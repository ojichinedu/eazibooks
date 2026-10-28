# EaziBook User Flow Guide

## Complete User Journey

### 🚀 **Getting Started**

#### **Step 1: First Visit**
```
Landing Page → Login Screen
- EaziBook branding displayed
- Email and password fields
- "Sign up" link for new users
- Demo mode information
```

#### **Step 2: Create Account**
```
Click "Sign up" → Signup Form
- Enter full name
- Enter email address
- Create password (6+ chars)
- Confirm password
- View Free Plan benefits
- Click "Create Account"
```

#### **Step 3: Automatic Login**
```
Account Created → Dashboard
- Free Plan activated (0 of 10 invoices/bills used)
- Welcome message
- All features visible (Premium features locked)
```

---

### 📊 **Free Plan User Experience**

#### **Available Features**
✅ Dashboard (view only)
✅ Quick Invoice (10/month)
✅ Quick Billing (10/month)
✅ Company Settings
✅ Multi-currency support
✅ Company branding & logo

#### **Usage Tracking**
```
Quick Invoice Page:
┌──────────────────────────────────────┐
│ ⓘ Free Plan: 3/10 invoices used     │
│    this month.                       │
└──────────────────────────────────────┘
```

#### **Locked Features** 🔒
❌ AI OCR Scanner (Premium badge)
❌ AI Chat Bot (not visible)
❌ Accounting (Premium badge)
❌ Inventory (Premium badge)
❌ Tax Compliance (Premium badge)
❌ Payroll (Premium badge)

#### **Clicking Locked Feature:**
```
Premium Gate Screen:
┌────────────────────────────────────────┐
│ 🔒 Premium Feature                     │
│                                        │
│ ✨ Unlock [Feature Name]               │
│                                        │
│ This feature is available on the      │
│ Premium plan                           │
│                                        │
│ ✓ [Feature Name] - Full access        │
│ ✓ AI-Powered OCR Scanner              │
│ ✓ AI Financial Consultant Bot         │
│ ✓ Accounting & Ledger Management      │
│ ✓ Inventory Management                │
│ ✓ Tax Compliance Tools                │
│ ✓ Payroll Processing                  │
│ ✓ Unlimited Invoices & Bills          │
│                                        │
│ [ ✨ Upgrade to Premium ]              │
└────────────────────────────────────────┘
```

---

### 💎 **Upgrading to Premium**

#### **Option 1: From Dashboard**
```
Dashboard → See upgrade card:
┌────────────────────────────────────────┐
│ 🔒 Free Plan                           │
│ You're using 5 of 20 monthly          │
│ transactions                           │
│ [ ✨ Upgrade to Premium ]              │
└────────────────────────────────────────┘
```

#### **Option 2: From Premium Gate**
```
Click locked feature → Premium Gate → 
[ ✨ Upgrade to Premium ]
```

#### **Option 3: From Settings**
```
Settings → Subscription Tab →
Compare Plans → 
[Upgrade to Premium]
```

#### **After Upgrade:**
```
✅ Instant access to all features
✅ AI Chat bot appears (bottom-right)
✅ No usage limits
✅ Premium badge shows "Current"
✅ Success toast notification
```

---

### 🎯 **Daily Workflow (Premium User)**

#### **Morning Routine**
```
1. Login → Dashboard
   - View revenue & expense metrics
   - Check AI business insights
   - Review pending invoices

2. Process Invoices
   - Quick Invoice → Create new
   - Auto-categorize with AI
   - Generate & send PDF

3. Record Expenses
   - AI OCR Scanner → Scan receipt
   - Auto-extract data
   - Save to accounting

4. Check Inventory
   - Inventory → View stock levels
   - Process orders
   - Update warehouse data
```

#### **AI Assistant Usage**
```
Click AI Chat (bottom-right):
┌────────────────────────────────────────┐
│ 💬 AI Financial Consultant             │
│────────────────────────────────────────│
│ You: What's my cash flow trend?       │
│                                        │
│ AI: Based on your data, your cash     │
│     flow has improved by 15%...       │
└────────────────────────────────────────┘
```

---

### 💼 **Business Operations**

#### **Creating an Invoice**
```
1. Click "Quick Invoice" (sidebar or FAB)
2. Fill invoice details:
   - Invoice number (auto-generated)
   - Customer details
   - Select currency (₦, $, R, ₵)
   - Add line items
   - Set payment terms
3. Click "Generate Invoice"
4. Preview → Print/Download PDF
```

#### **Managing Bills**
```
1. Click "Quick Billing" (sidebar or FAB)
2. Create Bill tab:
   - Vendor details
   - Bill items
   - Due date
   - Notes
3. Click "Create Bill"
4. View in Recent Bills tab
5. Track payment status
```

#### **Accounting Tasks**
```
1. Accounting Module (Premium)
2. View General Ledger
3. AI-categorized transactions
4. Generate financial reports:
   - Profit & Loss
   - Balance Sheet
   - Cash Flow Statement
```

#### **Inventory Management**
```
1. Inventory Module (Premium)
2. Track stock levels
3. Process purchase orders
4. Manage warehouses
5. Low stock alerts
```

---

### ⚙️ **Settings & Configuration**

#### **Company Settings**
```
Settings → Company Settings Tab:
- Upload company logo
- Business details (name, address, phone)
- Tax registration numbers
- Select default currency
- Save settings
```

#### **Subscription Management**
```
Settings → Subscription Tab:
┌─────────────────────────────────────┐
│ Current Plan: [Free/Premium]       │
│                                     │
│ Plan Comparison:                    │
│ [Free - ₦0/mo] [Premium - ₦15k/mo] │
│                                     │
│ Usage This Month (Free only):      │
│ Invoices: ████░░░░░░ 4/10          │
│ Bills:    ██████░░░░ 6/10          │
└─────────────────────────────────────┘
```

---

### 🔐 **Session Management**

#### **Active Session**
```
Sidebar Footer:
┌─────────────────────────┐
│ John Doe               │
│ john@example.com       │
├─────────────────────────┤
│ [🌙 Dark Mode]          │
│ [🚪 Logout]             │
└─────────────────────────┘
```

#### **Session Persistence**
- Refresh page → Stay logged in
- Close browser → Session saved
- Reopen → Auto-login
- Invalid token → Auto-logout to login page

#### **Logout Process**
```
Click "Logout" →
Clear session →
Redirect to Login →
Show success toast
```

---

### 📱 **Responsive Experience**

#### **Desktop (1920px+)**
- Full sidebar navigation
- Three-column layouts
- Side-by-side panels
- Dashboard widgets grid

#### **Tablet (768px - 1920px)**
- Collapsible sidebar
- Two-column layouts
- Responsive cards
- Touch-friendly buttons

#### **Mobile (< 768px)**
- Hamburger menu
- Single-column layouts
- Stacked cards
- Bottom action buttons
- Full-width forms

---

### 🎨 **Theme Toggle**

```
Light Mode (Default):
- White background
- Black text
- Clean, professional

Dark Mode:
- Dark background
- White text
- Reduced eye strain

Toggle: Sidebar → Dark Mode button
```

---

### 🔔 **Notifications & Feedback**

#### **Success Messages**
✅ Account created successfully
✅ Logged in successfully
✅ Invoice generated
✅ Bill created
✅ Settings saved
✅ Upgraded to Premium

#### **Error Messages**
❌ Invalid credentials
❌ Invoice limit reached
❌ Missing required fields
❌ Network error

#### **Info Messages**
ℹ️ Free Plan: X/10 invoices used
ℹ️ Premium feature locked
ℹ️ Session expired

---

### 📊 **Dashboard Overview**

```
┌─────────────────────────────────────────────────────┐
│ Dashboard                     [Quick Invoice]       │
│                               [Quick Bill]          │
├─────────────────────────────────────────────────────┤
│ [Free Plan Notice] (if free user)                   │
├─────────────────────────────────────────────────────┤
│ Quick Actions:                                      │
│ [Create Invoice] [Scan Receipt] [Add Expense]      │
├─────────────────────────────────────────────────────┤
│ Key Metrics:                                        │
│ Revenue | Expenses | Profit | Invoices             │
├─────────────────────────────────────────────────────┤
│ AI Business Insights (Premium)                      │
│ - Cash flow analysis                                │
│ - Revenue trends                                    │
│ - Expense patterns                                  │
├─────────────────────────────────────────────────────┤
│ Recent Activity                                     │
│ - Latest transactions                               │
│ - Pending invoices                                  │
│ - Due bills                                         │
└─────────────────────────────────────────────────────┘
```

---

## Quick Reference

### **Keyboard Shortcuts** (Future Feature)
- `Ctrl + N` - New Invoice
- `Ctrl + B` - New Bill
- `Ctrl + ,` - Settings
- `Esc` - Close dialogs

### **FAB (Floating Action Button)**
- Quick Invoice (⚡)
- Quick Bill (📄)
- Always accessible (bottom-right)

### **Currency Symbols**
- ₦ - Nigerian Naira (NGN)
- $ - US Dollar (USD)
- R - South African Rand (ZAR)
- ₵ - Ghanaian Cedi (GHS)

---

*Last Updated: January 2025*