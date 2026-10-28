# EaziBook - Project Structure Quick Reference

## 📁 Folder Organization

```
/
├── 📄 App.tsx                        # ✨ Main router (Landing/Auth/Dashboard)
│
├── 📂 components/                    # 🎨 Public & shared components
│   ├── LandingPage.tsx              # Public landing page
│   ├── figma/
│   │   └── ImageWithFallback.tsx    # Image component with fallback
│   └── ui/                          # Shadcn UI library (40+ components)
│       ├── button.tsx
│       ├── card.tsx
│       ├── dialog.tsx
│       └── ... (shared across entire app)
│
├── 📂 dashboard/                     # 🔐 Authenticated dashboard app
│   ├── 📄 DashboardApp.tsx          # Main dashboard logic & routing
│   │
│   ├── 📂 auth/                     # Authentication pages
│   │   ├── Login.tsx                # Login form
│   │   └── Signup.tsx               # Registration form
│   │
│   ├── 📂 layout/                   # Dashboard layout components
│   │   ├── Layout.tsx               # Sidebar, header, navigation
│   │   ├── FloatingActionButton.tsx # Quick actions FAB
│   │   └── Settings.tsx             # Settings page
│   │
│   └── 📂 modules/                  # Feature modules
│       └── index.ts                 # Re-exports all modules
│
├── 📂 utils/                        # 🛠️ Utilities & contexts
│   ├── AuthContext.tsx              # User authentication state
│   ├── CurrencyContext.tsx          # Multi-currency management
│   ├── SubscriptionContext.tsx      # Free/Premium plan logic
│   ├── currency.ts                  # Currency formatting utilities
│   └── supabase/
│       └── info.tsx                 # Supabase configuration
│
├── 📂 supabase/                     # ⚡ Backend (Supabase Edge Functions)
│   └── functions/server/
│       ├── index.tsx                # Hono web server
│       └── kv_store.tsx             # Key-value database utilities
│
├── 📂 styles/
│   └── globals.css                  # 🎨 Tailwind V4 config & theme
│
└── 📂 guidelines/
    └── ... (documentation files)
```

---

## 🎯 Quick Navigation

### **Where to find...**

| What you need | Location |
|---------------|----------|
| **Landing page** | `/components/LandingPage.tsx` |
| **Login/Signup** | `/dashboard/auth/Login.tsx`, `/dashboard/auth/Signup.tsx` |
| **Main app router** | `/App.tsx` |
| **Dashboard logic** | `/dashboard/DashboardApp.tsx` |
| **Sidebar & layout** | `/dashboard/layout/Layout.tsx` |
| **Settings page** | `/dashboard/layout/Settings.tsx` |
| **Feature modules** | `/components/*` (re-exported via `/dashboard/modules/index.ts`) |
| **UI components** | `/components/ui/*` |
| **Auth logic** | `/utils/AuthContext.tsx` |
| **Subscription logic** | `/utils/SubscriptionContext.tsx` |
| **API endpoints** | `/supabase/functions/server/index.tsx` |
| **Styling/theme** | `/styles/globals.css` |

---

## 🚦 Component Hierarchy

```
App.tsx (Root)
    │
    ├─ AuthProvider (wraps entire app)
    │
    ├─ IF NOT AUTHENTICATED:
    │   ├─ LandingPage
    │   ├─ Login (dashboard/auth/Login.tsx)
    │   └─ Signup (dashboard/auth/Signup.tsx)
    │
    └─ IF AUTHENTICATED:
        └─ DashboardApp
            ├─ SubscriptionProvider
            ├─ CurrencyProvider
            └─ Layout (dashboard/layout/Layout.tsx)
                ├─ Sidebar (navigation)
                ├─ Header
                ├─ ModuleRenderer
                │   ├─ Dashboard
                │   ├─ QuickInvoice
                │   ├─ QuickBilling
                │   ├─ Accounting (Premium)
                │   ├─ Inventory (Premium)
                │   ├─ TaxCompliance (Premium)
                │   ├─ Payroll (Premium)
                │   ├─ OCRScanner (Premium)
                │   └─ Settings
                ├─ FloatingActionButton
                └─ AIChat (Premium only)
```

---

## 📝 File Responsibilities

### **App.tsx**
```typescript
// Main entry point
✓ Authentication routing
✓ Show Landing/Login/Signup/Dashboard
✓ Global Toaster for notifications
✓ Loading states
```

### **LandingPage.tsx**
```typescript
// Public marketing page
✓ Hero section
✓ Features showcase
✓ Pricing comparison
✓ CTA buttons
✓ Footer
```

### **DashboardApp.tsx**
```typescript
// Authenticated app logic
✓ Module routing (dashboard, accounting, etc.)
✓ Premium feature gating
✓ Quick action handlers
✓ Provider setup
```

### **Layout.tsx**
```typescript
// Dashboard shell
✓ Sidebar navigation
✓ User info display
✓ Theme toggle
✓ Logout button
✓ Header with trigger
```

### **Settings.tsx**
```typescript
// Settings page
✓ Company Settings tab
✓ Subscription Management tab
✓ AI Features info tab
✓ General Settings tab
```

---

## 🔑 Key Contexts

### **AuthContext** (`/utils/AuthContext.tsx`)
```typescript
interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  login: (email, password) => Promise<void>;
  signup: (email, password, name) => Promise<void>;
  logout: () => Promise<void>;
}
```

### **SubscriptionContext** (`/utils/SubscriptionContext.tsx`)
```typescript
interface SubscriptionContextType {
  plan: 'free' | 'premium';
  isPremium: boolean;
  usage: { invoices: number; bills: number };
  limits: { invoices: number; bills: number };
  setPlan: (plan) => void;
  trackUsage: (type) => void;
  canUseFeature: (type) => boolean;
}
```

### **CurrencyContext** (`/utils/CurrencyContext.tsx`)
```typescript
interface CurrencyContextType {
  currency: 'NGN' | 'USD' | 'ZAR' | 'GHS';
  setCurrency: (currency) => void;
}
```

---

## 🛣️ Routing Logic

```typescript
// In App.tsx

if (isLoading) {
  return <LoadingScreen />;
}

if (user) {
  // User is authenticated
  return <DashboardApp />;
}

if (authView === 'signup') {
  // User wants to create account
  return <Signup onSwitchToLogin={() => setAuthView('login')} />;
}

if (authView === 'login') {
  // User wants to log in
  return <Login onSwitchToSignup={() => setAuthView('signup')} />;
}

// Default: show landing page
return <LandingPage onGetStarted={() => setAuthView('signup')} />;
```

---

## 🎨 Shared UI Components

All UI components in `/components/ui/` are available throughout the app:

```typescript
// From anywhere in the app
import { Button } from './components/ui/button';
import { Card } from './components/ui/card';
import { Dialog } from './components/ui/dialog';
// etc.

// Note: Adjust relative path based on current file location
// - From /dashboard/: '../../components/ui/button'
// - From /components/: './ui/button'
// - From /: './components/ui/button'
```

---

## 🔄 Common Import Patterns

### **From `/App.tsx`:**
```typescript
import { LandingPage } from './components/LandingPage';
import { Login } from './dashboard/auth/Login';
import { DashboardApp } from './dashboard/DashboardApp';
import { useAuth } from './utils/AuthContext';
```

### **From `/dashboard/DashboardApp.tsx`:**
```typescript
import { Layout } from './layout/Layout';
import { Settings } from './layout/Settings';
import { Dashboard, QuickInvoice } from './modules';
import { useSubscription } from '../utils/SubscriptionContext';
```

### **From `/dashboard/layout/Layout.tsx`:**
```typescript
import { Button } from '../../components/ui/button';
import { Sidebar } from '../../components/ui/sidebar';
import { useAuth } from '../../utils/AuthContext';
```

### **From `/dashboard/auth/Login.tsx`:**
```typescript
import { Card } from '../../components/ui/card';
import { Input } from '../../components/ui/input';
import { useAuth } from '../../utils/AuthContext';
```

---

## 🧪 Testing Quick Reference

### **Test Landing Page:**
```
1. Open app
2. Should see LandingPage
3. Click "Get Started"
4. Should navigate to Signup
```

### **Test Signup:**
```
1. Fill form (name, email, password)
2. Submit
3. Should create account + auto-login
4. Should see Dashboard
```

### **Test Login:**
```
1. From landing → Click login link
2. Enter credentials
3. Should see Dashboard
```

### **Test Session:**
```
1. Login
2. Refresh page → Should stay logged in
3. Close browser
4. Reopen → Should stay logged in
```

### **Test Logout:**
```
1. Click Logout in sidebar
2. Should see Landing Page
3. Token should be cleared
```

---

## 📦 Module System

All feature modules are currently in `/components/` but are re-exported through `/dashboard/modules/index.ts`:

```typescript
// dashboard/modules/index.ts
export { Dashboard } from '../../components/Dashboard';
export { Accounting } from '../../components/Accounting';
export { Inventory } from '../../components/Inventory';
export { TaxCompliance } from '../../components/TaxCompliance';
export { Payroll } from '../../components/Payroll';
export { QuickInvoice } from '../../components/QuickInvoice';
export { QuickBilling } from '../../components/QuickBilling';
export { AIChat } from '../../components/AIChat';
export { OCRScanner } from '../../components/OCRScanner';
export { CompanySettings } from '../../components/CompanySettings';
export { Subscription } from '../../components/Subscription';
export { PremiumGate } from '../../components/PremiumGate';
```

This allows for gradual migration if needed in the future.

---

## 🎯 Where to Add New Code

| What you're adding | Where to put it |
|-------------------|-----------------|
| **New landing page section** | `/components/LandingPage.tsx` |
| **New auth method** | `/dashboard/auth/` (new file) |
| **New dashboard module** | `/components/` (then add to `/dashboard/modules/index.ts`) |
| **New UI component** | `/components/ui/` (if Shadcn) or `/components/` (if custom) |
| **New layout component** | `/dashboard/layout/` |
| **New API endpoint** | `/supabase/functions/server/index.tsx` |
| **New utility/hook** | `/utils/` |
| **New context** | `/utils/` |
| **New styling** | `/styles/globals.css` |

---

## 🚀 Performance Tips

1. **Lazy Loading** (Future):
   ```typescript
   const Dashboard = lazy(() => import('./dashboard/modules/Dashboard'));
   ```

2. **Code Splitting**:
   - Landing page bundle separate from dashboard
   - Auth pages separate from main app

3. **Image Optimization**:
   - Use `ImageWithFallback` component
   - Leverage Unsplash for optimized images

---

## 📚 Related Documentation

- `AUTHENTICATION.md` - Auth system details
- `SUBSCRIPTION.md` - Subscription & plan logic
- `RESTRUCTURE.md` - Complete restructure guide
- `USER_FLOW.md` - User journey documentation
- `BRANDING.md` - Brand guidelines

---

*Quick Reference - Last Updated: January 2025*