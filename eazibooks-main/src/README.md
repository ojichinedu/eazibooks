# EaziBook - Smart ERP for SMEs

![EaziBook](https://img.shields.io/badge/EaziBook-v1.0-black)
![React](https://img.shields.io/badge/React-18+-blue)
![TypeScript](https://img.shields.io/badge/TypeScript-5+-blue)
![Tailwind](https://img.shields.io/badge/Tailwind-v4-cyan)
![Supabase](https://img.shields.io/badge/Supabase-Powered-green)

> A comprehensive ERP system for small and medium enterprises with AI-powered features, accounting, inventory control, tax compliance, payroll management, and multi-currency support.

**by LifeisEazi Group Enterprises**

---

## 🌟 Features

### **Free Plan** (₦0/month)
- ✅ 10 invoices per month
- ✅ 10 bills per month
- ✅ Multi-currency support (NGN, USD, ZAR, GHS)
- ✅ Company branding & logo upload
- ✅ Professional invoice generation
- ✅ Basic dashboard

### **Premium Plan** (₦15,000/month)
- ✨ **Unlimited** invoices & bills
- 🤖 **AI OCR Scanner** - Extract data from receipts/invoices
- 💬 **AI Financial Consultant** - Chat-based business advice
- 📊 **Full Accounting Suite** - Ledger, reports, categorization
- 📦 **Inventory Management** - Stock tracking, warehouses
- 🧾 **Tax Compliance** - Automated calculations, VAT tracking
- 👥 **Payroll Processing** - Salary calculations, deductions
- 📈 **AI Business Insights** - Analytics and recommendations

---

## 🚀 Quick Start

### **Prerequisites**
- Node.js 18+ or Deno (for Supabase Edge Functions)
- Supabase account
- OpenAI API key (for AI features)

### **Environment Variables**
Create a `.env` file with:
```bash
SUPABASE_URL=https://xxxxx.supabase.co
SUPABASE_ANON_KEY=eyJxxx...
SUPABASE_SERVICE_ROLE_KEY=eyJxxx...
SUPABASE_DB_URL=postgresql://...
OPENAI_API_KEY=sk-xxx...
```

### **Installation**
```bash
# Install dependencies
npm install

# Run development server
npm run dev

# Build for production
npm run build
```

---

## 📐 Architecture

### **Technology Stack**

| Layer | Technology |
|-------|-----------|
| **Frontend** | React 18 + TypeScript |
| **Styling** | Tailwind CSS v4.0 |
| **UI Components** | shadcn/ui + Radix UI |
| **State Management** | React Context API |
| **Backend** | Supabase (Edge Functions + KV Store) |
| **Server Framework** | Hono.js (Deno) |
| **AI/ML** | OpenAI API (GPT-4o-mini) |
| **Authentication** | Supabase Auth |
| **Database** | Supabase PostgreSQL |

### **Project Structure**
```
/
├── App.tsx                          # Main router
├── components/
│   ├── LandingPage.tsx             # Public landing page
│   └── ui/                         # Shadcn UI components
├── dashboard/
│   ├── DashboardApp.tsx            # Main dashboard
│   ├── auth/                       # Login & Signup
│   ├── layout/                     # Layout components
│   └── modules/                    # Feature modules
├── utils/                          # Contexts & utilities
└── supabase/                       # Backend functions
```

For detailed structure, see [`PROJECT_STRUCTURE.md`](PROJECT_STRUCTURE.md).

---

## 🎯 User Flow

1. **Landing Page** → See features & pricing
2. **Sign Up** → Create free account (auto-confirmed)
3. **Dashboard** → Access Free plan features
4. **Upgrade** → Subscribe to Premium (₦15k/mo)
5. **Use Features** → AI, accounting, inventory, etc.

For complete flow, see [`USER_FLOW.md`](USER_FLOW.md).

---

## 🔐 Authentication

### **User Registration**
```typescript
POST /make-server-db10586b/auth/signup
{
  "email": "user@example.com",
  "password": "password123",
  "name": "John Doe"
}
```

### **User Login**
```typescript
POST /make-server-db10586b/auth/login
{
  "email": "user@example.com",
  "password": "password123"
}
```

### **Session Validation**
```typescript
GET /make-server-db10586b/auth/session
Headers: { Authorization: "Bearer <access_token>" }
```

For full auth documentation, see [`AUTHENTICATION.md`](AUTHENTICATION.md).

---

## 💎 Subscription System

### **Plans**

| Feature | Free | Premium |
|---------|------|---------|
| **Invoices** | 10/month | Unlimited |
| **Bills** | 10/month | Unlimited |
| **Multi-currency** | ✅ | ✅ |
| **Company branding** | ✅ | ✅ |
| **AI OCR Scanner** | ❌ | ✅ |
| **AI Chat Bot** | ❌ | ✅ |
| **Accounting** | ❌ | ✅ |
| **Inventory** | ❌ | ✅ |
| **Tax Compliance** | ❌ | ✅ |
| **Payroll** | ❌ | ✅ |

For subscription details, see [`SUBSCRIPTION.md`](SUBSCRIPTION.md).

---

## 🤖 AI Features

### **1. AI OCR Scanner** (Premium)
- Upload invoice/receipt images
- Extract data using OpenAI Vision API
- Auto-categorize expenses
- Save to accounting system

### **2. AI Financial Consultant** (Premium)
- Chat-based interface
- Business advice and insights
- Cash flow analysis
- Expense optimization tips

### **3. AI Categorization** (Premium)
- Auto-categorize transactions
- Intelligent expense classification
- Revenue trend analysis

---

## 🛠️ Development

### **File Structure**
- `/App.tsx` - Main application router
- `/components/` - Shared & public components
- `/dashboard/` - Authenticated dashboard app
- `/utils/` - Contexts, hooks, utilities
- `/styles/globals.css` - Tailwind theme

### **Adding a New Module**
1. Create component in `/components/`
2. Export from `/dashboard/modules/index.ts`
3. Add route to `DashboardApp.tsx`
4. Add to sidebar in `Layout.tsx`

### **Adding a New Page**
1. Create component in appropriate folder
2. Add routing logic to `App.tsx` or `DashboardApp.tsx`
3. Update navigation if needed

### **Adding API Endpoint**
1. Open `/supabase/functions/server/index.tsx`
2. Add route using Hono syntax:
   ```typescript
   app.post("/make-server-db10586b/your-endpoint", async (c) => {
     // Your logic here
   });
   ```

---

## 🎨 Theming

### **Design System**
- **Color Scheme**: Minimalistic black & white
- **Typography**: Clean, professional
- **Components**: Shadcn UI (Radix-based)
- **Dark Mode**: Toggle available in sidebar

### **Customization**
Edit `/styles/globals.css`:
```css
:root {
  --primary: #030213;
  --background: #ffffff;
  --foreground: oklch(0.145 0 0);
  /* ... more variables */
}
```

For branding guidelines, see [`BRANDING.md`](BRANDING.md).

---

## 📱 Responsive Design

### **Breakpoints**
- **Mobile**: < 768px (single column, bottom sheets)
- **Tablet**: 768px - 1920px (collapsible sidebar)
- **Desktop**: > 1920px (full sidebar, multi-column)

### **Mobile Optimizations**
- Touch-friendly buttons
- Bottom action sheets
- Simplified navigation
- Responsive grids

---

## 🧪 Testing

### **Manual Testing Checklist**

**Authentication:**
- [ ] Sign up creates account
- [ ] Login with credentials
- [ ] Session persists on refresh
- [ ] Logout clears session

**Free Plan:**
- [ ] Can create invoices (up to 10)
- [ ] Can create bills (up to 10)
- [ ] Premium features locked
- [ ] Upgrade prompt shows

**Premium Plan:**
- [ ] Upgrade unlocks features
- [ ] AI chat bot appears
- [ ] OCR scanner works
- [ ] Unlimited invoices/bills

**UI/UX:**
- [ ] Landing page loads
- [ ] Dark mode toggle works
- [ ] Sidebar navigation functional
- [ ] Forms validate properly

---

## 📚 Documentation Index

- [`README.md`](README.md) - This file (overview)
- [`PROJECT_STRUCTURE.md`](PROJECT_STRUCTURE.md) - Quick reference guide
- [`RESTRUCTURE.md`](RESTRUCTURE.md) - Architecture & migration guide
- [`AUTHENTICATION.md`](AUTHENTICATION.md) - Auth system details
- [`SUBSCRIPTION.md`](SUBSCRIPTION.md) - Plan & usage tracking
- [`USER_FLOW.md`](USER_FLOW.md) - Complete user journey
- [`BRANDING.md`](BRANDING.md) - Brand guidelines
- [`Attributions.md`](Attributions.md) - Third-party credits

---

## 🔧 Troubleshooting

### **Common Issues**

**Issue: "OpenAI API key not configured"**
- **Solution**: Add `OPENAI_API_KEY` to environment variables

**Issue: "Session expired" after refresh**
- **Solution**: Check `access_token` in localStorage, verify `/auth/session` endpoint

**Issue: Premium features not unlocking**
- **Solution**: Verify subscription plan in Settings → Subscription tab

**Issue: Invoices not generating**
- **Solution**: Check company settings are configured (logo, details)

**Issue: Import errors after restructure**
- **Solution**: Check relative import paths match new folder structure

---

## 🚧 Roadmap

### **Phase 1** (Current)
- ✅ Landing page
- ✅ Authentication system
- ✅ Free & Premium plans
- ✅ Quick Invoice & Billing
- ✅ AI features (OCR, Chat)
- ✅ Dashboard & settings

### **Phase 2** (Future)
- [ ] Multi-user support
- [ ] Role-based permissions
- [ ] Advanced reporting
- [ ] Bank integration
- [ ] Mobile app
- [ ] Email notifications

### **Phase 3** (Future)
- [ ] Multi-company support
- [ ] API for third-party integrations
- [ ] Advanced AI insights
- [ ] Custom workflows
- [ ] White-label solution

---

## 🤝 Contributing

We welcome contributions! Here's how:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

### **Code Style**
- Use TypeScript for type safety
- Follow React best practices
- Use Tailwind for styling (no inline styles)
- Comment complex logic
- Write descriptive commit messages

---

## 📄 License

Copyright © 2025 LifeisEazi Group Enterprises. All rights reserved.

---

## 🙏 Acknowledgments

- **Shadcn UI** - Beautiful component library
- **Radix UI** - Accessible primitives
- **OpenAI** - AI-powered features
- **Supabase** - Backend infrastructure
- **Tailwind CSS** - Styling framework
- **React Team** - Amazing framework

---

## 📞 Support

For issues, questions, or feedback:
- Email: support@lifeis​eazi.com
- Documentation: See `/guidelines` folder
- Issues: GitHub Issues (if applicable)

---

## ⭐ Show Your Support

If you find EaziBook useful, give us a star! ⭐

Built with ❤️ by **LifeisEazi Group Enterprises**

---

*Last Updated: January 2025 - Version 1.0*