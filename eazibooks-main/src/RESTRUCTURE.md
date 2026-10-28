# EaziBook Project Restructure

## Overview
The project has been restructured to provide a cleaner separation between the public-facing landing page and the authenticated dashboard application. This new architecture makes the codebase more maintainable and scalable.

---

## New File Structure

```
/
├── App.tsx                           # Main router: Landing → Auth → Dashboard
├── components/
│   ├── LandingPage.tsx              # New public landing page
│   ├── figma/
│   │   └── ImageWithFallback.tsx
│   └── ui/                          # Shadcn UI components (shared)
│       ├── accordion.tsx
│       ├── alert.tsx
│       ├── button.tsx
│       └── ... (40+ components)
│
├── dashboard/                        # Dashboard application folder
│   ├── DashboardApp.tsx             # Main dashboard application logic
│   │
│   ├── auth/                        # Authentication pages
│   │   ├── Login.tsx
│   │   └── Signup.tsx
│   │
│   ├── layout/                      # Dashboard layout components
│   │   ├── Layout.tsx               # Sidebar, header, navigation
│   │   ├── FloatingActionButton.tsx # Quick actions FAB
│   │   └── Settings.tsx             # Settings page component
│   │
│   └── modules/                     # Feature modules
│       └── index.ts                 # Re-exports from /components (for now)
│
├── utils/                           # Shared utilities
│   ├── AuthContext.tsx             # Authentication state
│   ├── CurrencyContext.tsx         # Currency management
│   ├── SubscriptionContext.tsx     # Subscription & plan logic
│   ├── currency.ts                 # Currency utilities
│   └── supabase/
│       └── info.tsx                # Supabase config
│
├── supabase/
│   └── functions/server/
│       ├── index.tsx               # Hono server with auth endpoints
│       └── kv_store.tsx            # KV database utilities
│
└── styles/
    └── globals.css                 # Tailwind V4 configuration
```

---

## User Flow

### **1. First Visit (Not Authenticated)**

```
App.tsx
  └─ LandingPage
      ├─ Hero section
      ├─ Features grid
      ├─ Pricing comparison
      └─ CTA buttons → "Get Started"
```

When user clicks "Get Started":
```
App.tsx → authView = 'signup'
  └─ Signup Component (dashboard/auth/Signup.tsx)
```

---

### **2. Authentication Flow**

```
Landing Page
    ↓
Signup Page (dashboard/auth/Signup.tsx)
    ↓
[Create Account] → API: /auth/signup
    ↓
Automatic Login → Store access_token
    ↓
DashboardApp renders
```

Or if returning user:
```
Landing Page
    ↓
Login Page (dashboard/auth/Login.tsx)
    ↓
[Sign In] → API: /auth/login
    ↓
Store access_token
    ↓
DashboardApp renders
```

---

### **3. Authenticated Experience**

```
App.tsx
  └─ AuthProvider checks session
      ↓
  If user exists → DashboardApp
      ↓
  SubscriptionProvider
      ↓
  CurrencyProvider
      ↓
  Layout (sidebar + header)
      ├─ ModuleRenderer (switches between modules)
      ├─ FloatingActionButton
      └─ AIChat (if Premium)
```

---

## Component Breakdown

### **/App.tsx** (Root Component)

**Responsibilities:**
- Wraps app in `AuthProvider`
- Shows loading screen during auth check
- Routes between:
  - Landing Page (no auth)
  - Login/Signup (auth flow)
  - Dashboard App (authenticated)
- Renders global `Toaster` for notifications

**State:**
- `authView`: `'login' | 'signup' | null`

**Logic:**
```typescript
if (isLoading) return <LoadingScreen />;
if (user) return <DashboardApp />;
if (authView === 'signup') return <Signup />;
if (authView === 'login') return <Login />;
return <LandingPage />;
```

---

### **/components/LandingPage.tsx**

**Sections:**
1. **Header** - Logo, navigation, "Get Started" CTA
2. **Hero** - Main value proposition, dual CTAs
3. **Features** - 6-card grid showcasing key features
4. **Pricing** - Free vs Premium plan comparison
5. **CTA** - Final conversion section
6. **Footer** - Copyright and branding

**Props:**
- `onGetStarted: () => void` - Triggers signup flow

**Design:**
- Minimalistic black & white theme
- Responsive grid layouts
- Card-based feature presentation
- Clear pricing transparency

---

### **/dashboard/DashboardApp.tsx**

**Responsibilities:**
- Main dashboard application logic
- Module routing and rendering
- Premium feature gating
- Quick action handlers

**Providers:**
- `SubscriptionProvider` - Plan management
- `CurrencyProvider` - Multi-currency support

**State:**
- `activeModule`: Current active module (dashboard, accounting, etc.)

**Modules:**
- dashboard
- quick-invoice
- quick-billing
- ocr-scanner (Premium)
- accounting (Premium)
- inventory (Premium)
- tax (Premium)
- payroll (Premium)
- settings

---

### **/dashboard/auth/** (Authentication Pages)

#### **Login.tsx**
- Email & password form
- Error handling
- Link to signup
- Demo mode info card

#### **Signup.tsx**
- Full name, email, password, confirm password
- Two-column layout (form + plan preview)
- Free plan benefits display
- Form validation
- Link to login

---

### **/dashboard/layout/** (Layout Components)

#### **Layout.tsx**
- Sidebar with navigation menu
- User info display
- Theme toggle (dark/light)
- Logout button
- Header with sidebar trigger
- Main content area

#### **FloatingActionButton.tsx**
- Desktop: Expandable FAB with quick actions
- Mobile: Bottom sheet with actions
- Quick Invoice & Quick Bill shortcuts

#### **Settings.tsx**
- Tabbed interface:
  - Company Settings
  - Subscription Management
  - AI Features info
  - General Settings

---

### **/dashboard/modules/index.ts**

**Purpose:**
- Re-exports all feature modules from `/components`
- Allows gradual migration without breaking existing code
- Single import point for all dashboard modules

**Exports:**
```typescript
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

---

## Import Path Changes

### **Before Restructure:**

```typescript
// Old App.tsx
import { Layout } from './components/Layout';
import { Login } from './components/Login';
import { Dashboard } from './components/Dashboard';
```

### **After Restructure:**

```typescript
// New App.tsx
import { LandingPage } from './components/LandingPage';
import { Login } from './dashboard/auth/Login';
import { DashboardApp } from './dashboard/DashboardApp';

// DashboardApp.tsx
import { Layout } from './layout/Layout';
import { Dashboard, QuickInvoice } from './modules';
```

---

## Benefits of This Structure

### **1. Clear Separation of Concerns**
- Public pages (`/components`)
- Authenticated pages (`/dashboard`)
- Shared UI (`/components/ui`)
- Business logic (`/utils`)

### **2. Scalability**
- Easy to add new modules to `/dashboard/modules`
- Landing page can evolve independently
- Auth flow is isolated and testable

### **3. Better Code Organization**
- Related files are grouped together
- Intuitive folder names
- Reduces cognitive load for developers

### **4. Improved Maintainability**
- Easy to locate components
- Clear file responsibilities
- Reduced import path complexity

### **5. Future-Proof**
- Easy to migrate modules from `/components` to `/dashboard/modules`
- Can add more pages to landing (About, Pricing, Blog, etc.)
- Can implement proper routing (React Router) later

---

## Migration Guide

### **If You Want to Move a Module**

For example, to move `Dashboard.tsx` from `/components` to `/dashboard/modules`:

1. **Copy the file:**
   ```bash
   cp components/Dashboard.tsx dashboard/modules/Dashboard.tsx
   ```

2. **Update imports in the new file:**
   ```typescript
   // Old
   import { Card } from './ui/card';
   
   // New
   import { Card } from '../../components/ui/card';
   ```

3. **Update the index.ts:**
   ```typescript
   // Old
   export { Dashboard } from '../../components/Dashboard';
   
   // New
   export { Dashboard } from './Dashboard';
   ```

4. **Delete the old file** (optional, for cleanup)

---

## Authentication Flow Detail

### **Session Management:**

```typescript
// On app load
AuthContext checks localStorage for 'access_token'
    ↓
If found → validate with /auth/session endpoint
    ↓
If valid → set user state → render DashboardApp
    ↓
If invalid → clear token → show LandingPage
```

### **Login:**
```typescript
User submits credentials
    ↓
POST /auth/login { email, password }
    ↓
Supabase Auth validates
    ↓
Returns { user, access_token }
    ↓
Store token in localStorage
    ↓
Set user in AuthContext
    ↓
App re-renders → DashboardApp
```

### **Signup:**
```typescript
User submits form
    ↓
POST /auth/signup { email, password, name }
    ↓
Supabase creates user (auto-confirmed)
    ↓
Supabase creates session
    ↓
Returns { user, access_token }
    ↓
Store token in localStorage
    ↓
Set user in AuthContext
    ↓
App re-renders → DashboardApp
    ↓
Free plan automatically activated
```

### **Logout:**
```typescript
User clicks Logout
    ↓
POST /auth/logout (with access_token)
    ↓
Supabase signs out
    ↓
Clear localStorage
    ↓
Clear user from AuthContext
    ↓
App re-renders → LandingPage
```

---

## Routing Strategy

### **Current: State-Based Routing**

```typescript
// App.tsx
const [authView, setAuthView] = useState<'login' | 'signup' | null>(null);

// Conditional rendering
if (authView === 'signup') return <Signup />;
```

### **Future: React Router (Optional)**

```typescript
<Routes>
  <Route path="/" element={<LandingPage />} />
  <Route path="/login" element={<Login />} />
  <Route path="/signup" element={<Signup />} />
  <Route path="/dashboard/*" element={<ProtectedRoute><DashboardApp /></ProtectedRoute>} />
</Routes>
```

---

## Environment Variables

```bash
# Required for authentication
SUPABASE_URL=https://xxxxx.supabase.co
SUPABASE_ANON_KEY=eyJxxx...
SUPABASE_SERVICE_ROLE_KEY=eyJxxx...

# Required for AI features
OPENAI_API_KEY=sk-xxx...

# Required for database
SUPABASE_DB_URL=postgresql://...
```

---

## Testing the Restructure

### **1. Landing Page**
- Visit app → See landing page
- Click "Get Started" → Navigate to signup
- Click "View Demo" → (Future feature)

### **2. Authentication**
- Signup with test account
- Auto-login after signup
- See dashboard with Free plan
- Logout
- Login again with same credentials

### **3. Dashboard**
- Navigate between modules
- Try to access Premium features (should see gate)
- Upgrade to Premium (Settings → Subscription)
- Access Premium features

### **4. Session Persistence**
- Login
- Refresh page → Should stay logged in
- Close browser
- Reopen → Should stay logged in
- Logout → Should see landing page

---

## Best Practices

### **1. Component Creation**
- Place shared UI in `/components/ui`
- Place dashboard-specific in `/dashboard/modules`
- Place layout components in `/dashboard/layout`

### **2. Import Organization**
```typescript
// 1. External imports
import { useState } from 'react';
import { Button } from '../../components/ui/button';

// 2. Internal imports
import { useAuth } from '../../utils/AuthContext';

// 3. Types
interface Props { ... }
```

### **3. File Naming**
- Components: `PascalCase.tsx`
- Utilities: `camelCase.ts`
- Constants: `UPPER_CASE.ts`

---

## Troubleshooting

### **Issue: Blank screen after login**
**Solution:** Check browser console for import errors. Verify all import paths use correct relative paths.

### **Issue: Module not rendering**
**Solution:** Ensure module is exported in `/dashboard/modules/index.ts`

### **Issue: Auth not persisting**
**Solution:** Check localStorage for `access_token`. Verify `/auth/session` endpoint returns user data.

### **Issue: Premium features not working**
**Solution:** Check SubscriptionProvider is wrapping DashboardApp. Verify plan is set correctly.

---

*Last Updated: January 2025*