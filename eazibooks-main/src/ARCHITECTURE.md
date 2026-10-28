# EaziBook - System Architecture

## 🏗️ High-Level Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                        FRONTEND                              │
│                     (React + TypeScript)                     │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐      │
│  │   Landing    │  │   Auth       │  │  Dashboard   │      │
│  │   Page       │  │  (Login/     │  │     App      │      │
│  │              │──│   Signup)    │──│              │      │
│  └──────────────┘  └──────────────┘  └──────────────┘      │
│                                                              │
└──────────────────────────┬───────────────────────────────────┘
                          │
                          │ HTTP/REST
                          │
┌──────────────────────────┴───────────────────────────────────┐
│                      BACKEND                                 │
│               (Supabase Edge Functions)                      │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐      │
│  │   Hono.js    │  │   Supabase   │  │   OpenAI     │      │
│  │   Server     │──│     Auth     │  │     API      │      │
│  │              │  │              │  │              │      │
│  └──────────────┘  └──────────────┘  └──────────────┘      │
│                                                              │
│  ┌──────────────┐  ┌──────────────┐                        │
│  │   KV Store   │  │   Storage    │                        │
│  │  (Database)  │  │   (Logos)    │                        │
│  └──────────────┘  └──────────────┘                        │
│                                                              │
└─────────────────────────────────────────────────────────────┘
```

---

## 📊 Component Architecture

```
App.tsx (Root)
    │
    ├─── AuthProvider ────────────────────────────┐
    │                                              │
    │   IF user === null:                         │
    │   ┌─────────────────────────────────┐       │
    │   │  LandingPage                    │       │
    │   │    ├─ Hero                      │       │
    │   │    ├─ Features                 │       │
    │   │    ├─ Pricing                  │       │
    │   │    └─ CTA                      │       │
    │   └─────────────────────────────────┘       │
    │                   │                          │
    │                   ├─ "Get Started"          │
    │                   ↓                          │
    │   ┌─────────────────────────────────┐       │
    │   │  Signup (dashboard/auth/)       │       │
    │   │    ├─ Form (name, email, pw)    │       │
    │   │    └─ Free Plan Preview         │       │
    │   └─────────────────────────────────┘       │
    │                   │                          │
    │   ┌─────────────────────────────────┐       │
    │   │  Login (dashboard/auth/)        │       │
    │   │    └─ Form (email, password)    │       │
    │   └─────────────────────────────────┘       │
    │                                              │
    │   IF user !== null:                         │
    │   ┌─────────────────────────────────┐       │
    │   │  DashboardApp                   │       │
    │   │    │                             │       │
    │   │    ├─ SubscriptionProvider      │       │
    │   │    ├─ CurrencyProvider           │       │
    │   │    │                             │       │
    │   │    └─ Layout ───────────────────┤       │
    │   │         ├─ Sidebar              │       │
    │   │         │   ├─ Logo             │       │
    │   │         │   ├─ Navigation       │       │
    │   │         │   └─ User Info        │       │
    │   │         │                        │       │
    │   │         ├─ Header               │       │
    │   │         │   └─ Sidebar Trigger  │       │
    │   │         │                        │       │
    │   │         └─ Main Content         │       │
    │   │             ├─ ModuleRenderer   │       │
    │   │             ├─ FAB              │       │
    │   │             └─ AIChat (Premium) │       │
    │   └─────────────────────────────────┘       │
    │                                              │
    └──────────────────────────────────────────────┘
```

---

## 🔄 Data Flow

### **Authentication Flow**

```
User Action: Click "Get Started"
    │
    ├─ Navigate to Signup
    │
    ├─ User fills form
    │
    ├─ Submit → AuthContext.signup()
    │      │
    │      ├─ POST /auth/signup
    │      │    │
    │      │    ├─ Supabase.auth.admin.createUser()
    │      │    ├─ Auto-confirm email
    │      │    ├─ Create session
    │      │    └─ Return { user, access_token }
    │      │
    │      ├─ Store token in localStorage
    │      ├─ Set user in context
    │      └─ Trigger re-render
    │
    └─ App.tsx detects user → Render DashboardApp
```

### **Invoice Generation Flow**

```
User Action: Click "Quick Invoice"
    │
    ├─ Navigate to QuickInvoice module
    │
    ├─ User fills invoice form
    │   ├─ Customer details
    │   ├─ Line items
    │   ├─ Select currency (CurrencyContext)
    │   └─ Payment terms
    │
    ├─ Check usage limit (SubscriptionContext)
    │   ├─ IF Free Plan → Check if < 10 invoices
    │   └─ IF Premium → Allow unlimited
    │
    ├─ Submit → Track usage
    │   └─ SubscriptionContext.trackUsage('invoice')
    │
    ├─ Generate PDF
    │   ├─ Include company logo
    │   ├─ Format with branding
    │   └─ Calculate totals
    │
    └─ Download/Print invoice
```

### **AI OCR Flow** (Premium)

```
User Action: Upload receipt image
    │
    ├─ Navigate to OCR Scanner
    │
    ├─ Premium Gate Check
    │   └─ IF !isPremium → Show upgrade prompt
    │
    ├─ File upload → Base64 encoding
    │
    ├─ POST /ai/ocr-scan
    │   │
    │   ├─ Validate OPENAI_API_KEY
    │   │
    │   ├─ Call OpenAI Vision API
    │   │   ├─ Model: gpt-4o-mini
    │   │   ├─ Prompt: Extract invoice data
    │   │   └─ Return structured JSON
    │   │
    │   └─ Parse response
    │       ├─ Vendor name
    │       ├─ Date
    │       ├─ Amount
    │       ├─ Line items
    │       └─ Category
    │
    ├─ Display extracted data
    │
    └─ User reviews & saves to accounting
```

---

## 🗄️ Data Architecture

### **Local Storage**

```
localStorage
    ├─ access_token: string           # JWT for authentication
    ├─ subscription_plan: 'free' | 'premium'
    ├─ subscription_usage: {
    │      invoices: number,
    │      bills: number
    │   }
    └─ company_settings: {
           logo?: string,
           name: string,
           address: string,
           phone: string,
           email: string,
           currency: 'NGN' | 'USD' | 'ZAR' | 'GHS'
       }
```

### **Supabase KV Store**

```
kv_store_db10586b (table)
    │
    ├─ user:{userId}:subscription
    │      { plan: 'free' | 'premium', startDate: Date }
    │
    ├─ user:{userId}:usage:{month}
    │      { invoices: number, bills: number }
    │
    ├─ user:{userId}:company
    │      { name, address, phone, email, logo, currency }
    │
    ├─ user:{userId}:invoices:{invoiceId}
    │      { customer, items[], total, date, ... }
    │
    └─ user:{userId}:bills:{billId}
           { vendor, items[], total, date, ... }
```

### **Supabase Auth**

```
auth.users
    │
    ├─ id: uuid
    ├─ email: string
    ├─ encrypted_password: string
    ├─ user_metadata: {
    │      name: string
    │   }
    ├─ email_confirmed_at: timestamp
    └─ created_at: timestamp
```

---

## 🛣️ API Routes

### **Authentication Endpoints**

```
POST   /make-server-db10586b/auth/signup
       Body: { email, password, name }
       Returns: { user, access_token }

POST   /make-server-db10586b/auth/login
       Body: { email, password }
       Returns: { user, access_token }

GET    /make-server-db10586b/auth/session
       Headers: { Authorization: Bearer <token> }
       Returns: { user }

POST   /make-server-db10586b/auth/logout
       Headers: { Authorization: Bearer <token> }
       Returns: { success: true }
```

### **AI Endpoints** (Premium)

```
POST   /make-server-db10586b/ai/chat
       Body: { message, conversationId?, context? }
       Returns: { response, conversationId }

POST   /make-server-db10586b/ai/ocr-scan
       Body: { image: base64, type: 'invoice' | 'receipt' }
       Returns: { extractedData }
```

### **Subscription Endpoints**

```
GET    /make-server-db10586b/subscription/status
       Headers: { Authorization: Bearer <token> }
       Returns: { plan, usage, limits }

POST   /make-server-db10586b/subscription/upgrade
       Headers: { Authorization: Bearer <token> }
       Body: { plan: 'premium' }
       Returns: { success, newPlan }
```

---

## 🔐 Security Architecture

### **Authentication Security**

```
Client Side:
    ├─ Access token stored in localStorage
    ├─ Token included in Authorization header
    └─ Automatic logout on 401 responses

Server Side:
    ├─ SUPABASE_SERVICE_ROLE_KEY (never exposed to client)
    ├─ JWT validation on protected routes
    ├─ Email auto-confirmation (demo mode)
    └─ Password hashing by Supabase
```

### **API Security**

```
All Endpoints:
    ├─ CORS enabled (origin: *)
    ├─ Request logging
    ├─ Error handling
    └─ Input validation

Protected Endpoints:
    ├─ Authorization header required
    ├─ Token validation via Supabase.auth.getUser()
    └─ User ID extraction from token
```

---

## 🎨 State Management

### **React Contexts**

```
AuthContext
    ├─ Manages: user, isLoading
    ├─ Provides: login(), signup(), logout()
    └─ Persists: access_token in localStorage

SubscriptionContext
    ├─ Manages: plan, usage, limits
    ├─ Provides: setPlan(), trackUsage(), canUseFeature()
    └─ Persists: Subscription data in KV store

CurrencyContext
    ├─ Manages: currency
    ├─ Provides: setCurrency()
    └─ Persists: Currency in company settings
```

### **Component State**

```
DashboardApp
    ├─ activeModule: string
    └─ Handlers: onModuleChange, onQuickAction

Layout
    ├─ isDark: boolean
    └─ Handlers: toggleTheme, handleLogout

Forms (Invoice, Bill, etc.)
    ├─ formData: object
    ├─ errors: object
    └─ Handlers: onChange, onSubmit, validate
```

---

## 🚀 Performance Optimizations

### **Code Splitting**

```
Landing Page Bundle
    ├─ LandingPage.tsx
    ├─ Hero, Features, Pricing components
    └─ Basic UI components

Auth Bundle
    ├─ Login.tsx
    ├─ Signup.tsx
    └─ Form components

Dashboard Bundle
    ├─ DashboardApp.tsx
    ├─ All modules
    ├─ Layout components
    └─ AI features
```

### **Lazy Loading** (Future)

```typescript
// Potential implementation
const Dashboard = lazy(() => import('./dashboard/modules/Dashboard'));
const Accounting = lazy(() => import('./dashboard/modules/Accounting'));
const Inventory = lazy(() => import('./dashboard/modules/Inventory'));
```

### **Image Optimization**

```
Unsplash Tool
    ├─ Optimized image URLs
    ├─ Responsive image sizes
    └─ Lazy loading

ImageWithFallback Component
    ├─ Error handling
    ├─ Fallback placeholder
    └─ Loading states
```

---

## 📱 Responsive Strategy

### **Breakpoint System**

```
Mobile (< 768px)
    ├─ Single column layouts
    ├─ Bottom sheets for actions
    ├─ Collapsed sidebar (hamburger)
    └─ Touch-optimized buttons

Tablet (768px - 1920px)
    ├─ Two-column layouts
    ├─ Collapsible sidebar
    ├─ Responsive cards
    └─ Medium button sizes

Desktop (> 1920px)
    ├─ Three-column layouts
    ├─ Persistent sidebar
    ├─ Grid-based dashboards
    └─ Hover interactions
```

---

## 🧩 Integration Points

### **Supabase Integration**

```
Authentication
    └─ Supabase.auth (Email/Password)

Database
    └─ KV Store via kv_store.tsx utilities

Storage
    └─ Supabase Storage (Company logos)

Edge Functions
    └─ Hono.js server in /supabase/functions/server/
```

### **OpenAI Integration**

```
AI Chat
    ├─ Model: gpt-4o-mini
    ├─ Endpoint: /v1/chat/completions
    └─ Context: Business consultation

AI OCR
    ├─ Model: gpt-4o-mini (vision)
    ├─ Endpoint: /v1/chat/completions
    └─ Input: Base64 image

AI Categorization
    ├─ Model: gpt-4o-mini
    └─ Purpose: Expense classification
```

---

## 🔄 Deployment Architecture

```
Frontend (Static)
    ├─ Build: npm run build
    ├─ Output: /dist or /build
    └─ Deploy: Vercel, Netlify, or Static hosting

Backend (Serverless)
    ├─ Platform: Supabase Edge Functions
    ├─ Runtime: Deno
    ├─ Auto-scaling
    └─ Global edge network

Database
    ├─ PostgreSQL (Supabase)
    ├─ Auto-backups
    └─ Connection pooling
```

---

## 📈 Scalability Considerations

### **Current Scale**
- Single-tenant (one company per account)
- File-based storage (logos in Supabase Storage)
- KV store for data persistence

### **Future Scale**
- Multi-tenant (multiple companies per user)
- Full relational database schema
- Separate tables for invoices, bills, etc.
- Advanced query optimization
- Caching layer (Redis)

---

*Architecture Documentation - Last Updated: January 2025*