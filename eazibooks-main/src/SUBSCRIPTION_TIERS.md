# EaziBook Subscription Tiers

## Overview
EaziBook offers 4 comprehensive subscription tiers designed to meet the needs of businesses at different stages of growth. All plans include multi-currency support (Nigerian Naira, US Dollar, South African Rand, and Ghanaian Cedi).

## Subscription Plans

### 1. Free Plan (₦0/month)
**Perfect for testing and trying out EaziBook**

#### Features
- ✅ 5 invoices per month
- ✅ 5 bills per month
- ✅ Basic invoice templates
- ✅ Multi-currency support
- ✅ View-only reports
- ❌ No company branding
- ❌ No AI features
- ❌ No accounting features
- ❌ No inventory management

#### Use Cases
- Testing the platform
- Very small businesses with minimal transaction volume
- Personal use

---

### 2. Starter Plan (₦5,000/month)
**For small businesses getting started**

#### Features
- ✅ **50 invoices per month**
- ✅ **50 bills per month**
- ✅ **Company branding on invoices** (logo, colors, custom templates)
- ✅ Basic accounting features
- ✅ Multi-currency support
- ✅ Basic reports
- ✅ Customer management
- ❌ No AI features
- ❌ No inventory management
- ❌ No tax compliance tools

#### Use Cases
- Small businesses and startups
- Freelancers and consultants with regular clients
- Service providers
- Businesses starting to build their brand

#### Key Benefits
- Professional branded invoices
- Basic bookkeeping capabilities
- Affordable entry point to ERP

---

### 3. Professional Plan (₦10,000/month)
**For growing businesses**

#### Features
- ✅ **Unlimited invoices**
- ✅ **Unlimited bills**
- ✅ Company branding
- ✅ **Full accounting & ledger management**
- ✅ **Inventory management**
- ✅ **Tax compliance tools** (GST, TDS, VAT)
- ✅ **Advanced reports & analytics**
- ✅ Multi-user support (future)
- ✅ Customer & supplier management
- ❌ No AI features
- ❌ No payroll processing

#### Use Cases
- Growing SMEs with product inventory
- Retail businesses
- Wholesale distributors
- Businesses requiring tax compliance
- Companies with multiple transactions daily

#### Key Benefits
- Complete business management without transaction limits
- Comprehensive financial insights
- Full tax compliance support
- Inventory tracking and management

---

### 4. Premium Plan (₦15,000/month)
**AI-powered complete business suite**

#### Features
- ✅ **All Professional features**
- ✅ **AI-Powered OCR Scanner** (exclusive)
  - Scan invoices and receipts
  - Automatic data extraction
  - Auto-categorization of expenses
- ✅ **AI Financial Consultant Chatbot** (exclusive)
  - 24/7 business and financial advice
  - Context-aware recommendations
  - Tax planning insights
- ✅ **Payroll processing**
- ✅ **Priority support**
- ✅ **API access** (future)
- ✅ **Advanced automation** (future)

#### Use Cases
- Established SMEs
- Businesses seeking automation
- Companies with multiple employees
- Organizations requiring AI-powered insights
- Businesses looking to reduce manual data entry

#### Key Benefits
- AI-powered automation reduces manual work
- Intelligent business insights
- Complete HR and payroll management
- Priority customer support
- Future-proof with API access

---

## Feature Comparison Matrix

| Feature | Free | Starter | Professional | Premium |
|---------|------|---------|--------------|---------|
| **Invoices/month** | 5 | 50 | Unlimited | Unlimited |
| **Bills/month** | 5 | 50 | Unlimited | Unlimited |
| **Company Branding** | ❌ | ✅ | ✅ | ✅ |
| **Multi-currency** | ✅ | ✅ | ✅ | ✅ |
| **Accounting** | ❌ | Basic | Full | Full |
| **Inventory Management** | ❌ | ❌ | ✅ | ✅ |
| **Tax Compliance** | ❌ | ❌ | ✅ | ✅ |
| **Advanced Reports** | ❌ | ❌ | ✅ | ✅ |
| **AI OCR Scanner** | ❌ | ❌ | ❌ | ✅ |
| **AI Chatbot** | ❌ | ❌ | ❌ | ✅ |
| **Payroll** | ❌ | ❌ | ❌ | ✅ |
| **Priority Support** | ❌ | ❌ | ❌ | ✅ |
| **API Access** | ❌ | ❌ | ❌ | ✅ (future) |

---

## Exclusive AI Features (Premium Only)

### AI-Powered OCR Scanner
The OCR scanner is **exclusively available** on the Premium plan. This powerful feature:
- Automatically extracts data from invoices and receipts
- Recognizes vendor information, amounts, dates, line items
- Auto-categorizes expenses for accounting
- Supports multiple document formats
- Powered by OpenAI Vision API

### AI Financial Consultant Chatbot
The AI chatbot is **exclusively available** on the Premium plan. This intelligent assistant:
- Provides 24/7 financial and business advice
- Understands your business context
- Offers tax planning insights
- Helps with cash flow management
- Suggests business strategies
- Powered by OpenAI GPT-4

---

## Company Branding (Starter and Above)

Company branding features are available starting from the **Starter plan**:
- Custom company logo on invoices and bills
- Branded invoice templates
- Custom color schemes (future)
- Professional appearance for client-facing documents

Free plan users will see basic, unbranded templates.

---

## Upgrade Path

Users can upgrade or downgrade between plans at any time:

1. **Free → Starter**: Unlock company branding and increased limits
2. **Starter → Professional**: Get unlimited transactions + full ERP features
3. **Professional → Premium**: Add AI-powered automation and insights
4. **Downgrade**: Any plan can be downgraded, but features will be restricted

---

## Implementation Details

### Subscription Context
The subscription system uses React Context (`SubscriptionContext`) to manage:
- Current plan tier
- Usage tracking (for limited plans)
- Feature availability flags
- Upgrade/downgrade functions

### Feature Gating
Components check feature availability using:
```typescript
const { features } = useSubscription();

// Check specific features
features.hasCompanyBranding  // Starter+
features.hasAccounting       // Starter+
features.hasInventory        // Professional+
features.hasTaxCompliance    // Professional+
features.hasAIScanner        // Premium only
features.hasAIChatbot        // Premium only
features.hasPayroll          // Premium only
```

### Premium Gates
When users try to access restricted features, they see a `PremiumGate` component that:
- Explains the feature
- Shows which plan is required
- Lists benefits of upgrading
- Provides a clear upgrade path

---

## Pricing Strategy

The tiered pricing is designed to:
1. **Attract** users with a free trial
2. **Convert** to paid with affordable Starter plan
3. **Grow** with businesses into Professional tier
4. **Maximize value** with Premium AI features

Each tier provides clear value and addresses specific business needs, ensuring users only pay for what they need while having a clear upgrade path as they grow.
