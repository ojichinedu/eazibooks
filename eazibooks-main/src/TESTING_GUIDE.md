# EaziBook Testing Guide
## Comprehensive Testing Checklist for MVP Launch

**Version:** 1.0  
**Last Updated:** January 28, 2025  
**Purpose:** Ensure all features work correctly before launch

---

## Testing Overview

### Testing Phases
1. **Unit Testing** - Individual component functionality
2. **Integration Testing** - Module interactions
3. **User Acceptance Testing** - Real-world scenarios
4. **Performance Testing** - Speed and responsiveness
5. **Security Testing** - Data protection and access control
6. **Cross-Browser Testing** - Compatibility across browsers
7. **Mobile Testing** - Responsive design validation

### Test Environment Setup

```bash
# Install dependencies
npm install

# Run development server
npm run dev

# Open browser
http://localhost:3000
```

---

## 1. Authentication Testing

### Sign Up Flow
- [ ] Navigate to landing page
- [ ] Click "Get Started" button
- [ ] Fill in registration form with valid data
- [ ] Verify email validation
- [ ] Verify password strength requirements
- [ ] Submit form
- [ ] Check success message/redirect to dashboard
- [ ] Verify user is logged in
- [ ] Check database for new user record

**Test Data:**
```
Name: Test User
Email: testuser@example.com
Password: TestPassword123!
```

### Login Flow
- [ ] Navigate to login page
- [ ] Enter valid credentials
- [ ] Click "Login"
- [ ] Verify redirect to dashboard
- [ ] Check session persistence (refresh page)
- [ ] Verify user profile data loads
- [ ] Test "Remember Me" checkbox

**Test Cases:**
1. Valid credentials → Success
2. Invalid email → Error message
3. Invalid password → Error message
4. Empty fields → Validation errors
5. SQL injection attempt → Blocked

### Logout Flow
- [ ] Click logout button in sidebar
- [ ] Verify redirect to landing page
- [ ] Confirm session cleared
- [ ] Try accessing dashboard URL directly → Redirect to login

---

## 2. Dashboard Testing

### Dashboard Load
- [ ] Navigate to dashboard after login
- [ ] Verify all stat cards display correctly
- [ ] Check currency formatting
- [ ] Verify stats show correct data
- [ ] Test "Refresh" button
- [ ] Check loading states
- [ ] Verify quick action buttons work

### Quick Actions
- [ ] Click "Quick Invoice" button
- [ ] Verify navigation to invoice page
- [ ] Click "Quick Bill" button
- [ ] Verify navigation to billing page
- [ ] Test all quick action cards
- [ ] Verify premium features show lock icon for free users

### Real-time Updates
- [ ] Create a new invoice
- [ ] Return to dashboard
- [ ] Verify stats update automatically
- [ ] Check recent activity feed shows new entry

---

## 3. Settings Page Testing

### Profile & Account Tab
- [ ] Navigate to Settings > Profile & Account
- [ ] Update full name
- [ ] Update email
- [ ] Update phone number
- [ ] Upload profile photo
- [ ] Change password
- [ ] Save changes
- [ ] Verify success toast
- [ ] Refresh page and verify changes persisted

### Company Settings Tab
- [ ] Navigate to Settings > Company Settings
- [ ] Update company name
- [ ] Update company email
- [ ] Update company address
- [ ] Upload company logo
- [ ] Change currency
- [ ] Save changes
- [ ] Verify logo displays in invoices

### User Management Tab
- [ ] Navigate to Settings > User Management
- [ ] Add new user
- [ ] Assign role (Admin/Manager/User)
- [ ] Set permissions
- [ ] Edit existing user
- [ ] Deactivate user
- [ ] Delete user
- [ ] Verify email invitation sent (if configured)

### Tax Configuration Tab
- [ ] Navigate to Settings > Tax Configuration
- [ ] Enable/disable GST
- [ ] Set default tax rate
- [ ] Add new tax rate
- [ ] Edit existing tax rate
- [ ] Delete tax rate
- [ ] Configure tax exemptions
- [ ] Save all changes

### Integrations Tab
- [ ] Navigate to Settings > Integrations
- [ ] Add OpenAI API key
- [ ] Test connection
- [ ] View enabled AI features
- [ ] Test webhook configuration
- [ ] Verify payment gateway placeholders

### Backup & Security Tab
- [ ] Navigate to Settings > Backup & Security
- [ ] Enable auto backup
- [ ] Set backup frequency
- [ ] Trigger manual backup
- [ ] Download backup file
- [ ] Enable 2FA
- [ ] View login history
- [ ] Add IP to whitelist
- [ ] Review security audit

### Notifications Tab
- [ ] Navigate to Settings > Notifications
- [ ] Enable/disable email notifications
- [ ] Configure notification types
- [ ] Set digest frequency
- [ ] Enable in-app notifications
- [ ] Test notification sound
- [ ] Send test notification
- [ ] Verify notifications appear

### Subscription Tab
- [ ] Navigate to Settings > Subscription
- [ ] View current plan details
- [ ] View usage statistics
- [ ] Click upgrade button
- [ ] Select new plan
- [ ] View plan comparison
- [ ] Cancel subscription (if applicable)

---

## 4. Customers Page Testing

### Add Customer
- [ ] Navigate to Customers page
- [ ] Click "Add Customer" button
- [ ] Fill in customer details
- [ ] Save customer
- [ ] Verify success toast
- [ ] See customer in list

**Test Data:**
```
Name: ABC Corporation
Email: contact@abc.com
Phone: +234 803 456 7890
Address: 123 Business St, Lagos
Tax ID: TIN-12345678
Credit Limit: 5,000,000
```

### Search & Filter
- [ ] Use search box to find customer by name
- [ ] Search by email
- [ ] Search by company
- [ ] Filter by status (Active/Inactive)
- [ ] Clear filters
- [ ] Verify results update correctly

### Edit Customer
- [ ] Click edit button on a customer
- [ ] Update customer details
- [ ] Save changes
- [ ] Verify updates appear in list

### Delete Customer
- [ ] Click delete button
- [ ] Confirm deletion dialog
- [ ] Verify customer removed from list
- [ ] Check database record deleted

### Export Customers
- [ ] Click "Export" button
- [ ] Verify CSV file downloads
- [ ] Open file and check data accuracy

---

## 5. Products Catalog Testing

### Add Product
- [ ] Navigate to Products page
- [ ] Click "Add Product" button
- [ ] Enter product details
- [ ] Set price and cost
- [ ] Set stock quantity
- [ ] Upload product image (optional)
- [ ] Save product
- [ ] Verify product appears in catalog

**Test Data:**
```
Name: Premium Widget A
SKU: PWA-001
Type: Product
Category: Electronics
Price: 15,000
Cost: 10,000
Stock: 100
Tax Rate: 18%
```

### Add Service
- [ ] Click "Add Product" button
- [ ] Select "Service" type
- [ ] Enter service details
- [ ] Set hourly/project rate
- [ ] Save service
- [ ] Verify no stock fields shown for services

### View Modes
- [ ] Toggle between List and Grid view
- [ ] Verify both views display correctly
- [ ] Check product images in grid view

### Low Stock Alert
- [ ] Create product with stock = 5
- [ ] Set low stock threshold = 10
- [ ] Verify product highlighted in list
- [ ] Check stats show low stock count

---

## 6. Suppliers Page Testing

### Add Supplier
- [ ] Navigate to Suppliers page
- [ ] Click "Add Supplier" button
- [ ] Fill in supplier details
- [ ] Set payment terms
- [ ] Save supplier
- [ ] Verify supplier in list

**Test Data:**
```
Name: Global Supplies Inc
Email: contact@globalsupplies.com
Phone: +234 801 234 5678
Payment Terms: Net 30
```

### Supplier Management
- [ ] Edit supplier
- [ ] Update payment terms
- [ ] View purchase history
- [ ] Check outstanding balance
- [ ] Delete supplier

---

## 7. Transactions Page Testing

### View Transactions
- [ ] Navigate to Transactions page
- [ ] Verify all transactions display
- [ ] Check transaction types (Income/Expense)
- [ ] Verify amounts formatted correctly
- [ ] Check status badges

### Filter Transactions
- [ ] Filter by type (Income/Expense)
- [ ] Filter by status (Completed/Pending)
- [ ] Filter by category
- [ ] Search by description
- [ ] Search by reference number
- [ ] Combine multiple filters

### Transaction Stats
- [ ] Verify Total Income calculation
- [ ] Verify Total Expenses calculation
- [ ] Verify Net Cash Flow calculation
- [ ] Check Pending count

### Export Transactions
- [ ] Click Export button
- [ ] Verify CSV file downloads
- [ ] Check data accuracy

---

## 8. Reports Page Testing

### Financial Reports
- [ ] Navigate to Reports > Financial Reports
- [ ] View Profit & Loss Statement
- [ ] Check calculations are correct
- [ ] View Balance Sheet
- [ ] Verify Assets = Liabilities + Equity
- [ ] View Cash Flow Statement
- [ ] Verify opening and closing balances

### Sales Reports
- [ ] Generate Sales by Customer report
- [ ] Generate Sales by Product report
- [ ] Generate Sales by Period report
- [ ] View Invoice Aging Report

### Export Reports
- [ ] Export P&L as PDF
- [ ] Export as Excel
- [ ] Export as CSV
- [ ] Verify file downloads

### Date Range Selection
- [ ] Select "This Month"
- [ ] Select "This Quarter"
- [ ] Select "This Year"
- [ ] Select "Custom Range"
- [ ] Verify reports update

---

## 9. Quick Invoice Testing

### Create Invoice
- [ ] Navigate to Quick Invoice
- [ ] Select customer
- [ ] Add invoice items
- [ ] Apply tax
- [ ] Add discount
- [ ] Add notes
- [ ] Preview invoice
- [ ] Save as draft
- [ ] Mark as sent
- [ ] Generate PDF

**Test Scenario:**
```
Customer: ABC Corporation
Items:
  - Premium Widget A x 10 @ ₦15,000 = ₦150,000
  - Consulting Service x 2 hrs @ ₦50,000 = ₦100,000
Subtotal: ₦250,000
Tax (18%): ₦45,000
Total: ₦295,000
```

### Invoice Branding
- [ ] Verify company logo appears
- [ ] Check company details display
- [ ] Verify invoice number format
- [ ] Check date formatting
- [ ] Verify terms and conditions appear

### Invoice Actions
- [ ] Save as draft
- [ ] Send to customer (email)
- [ ] Download PDF
- [ ] Print invoice
- [ ] Duplicate invoice
- [ ] Delete invoice

### Multi-Currency
- [ ] Create invoice in NGN
- [ ] Create invoice in USD
- [ ] Create invoice in ZAR
- [ ] Verify currency symbols correct
- [ ] Check exchange rate handling (if applicable)

---

## 10. Quick Billing Testing

### Create Bill
- [ ] Navigate to Quick Billing
- [ ] Select supplier
- [ ] Add bill items
- [ ] Apply tax
- [ ] Save bill
- [ ] Verify bill number generated

### Bill Payment
- [ ] Mark bill as paid
- [ ] Record partial payment
- [ ] Verify balance due updates
- [ ] Check payment history

---

## 11. AI Features Testing

### AI OCR Scanner (Premium Only)
- [ ] Navigate to AI OCR Scanner
- [ ] Upload invoice image
- [ ] Wait for processing
- [ ] Verify extracted data:
  - Invoice number
  - Date
  - Vendor name
  - Line items
  - Amounts
- [ ] Edit extracted data if needed
- [ ] Auto-fill Quick Bill form
- [ ] Save bill

### AI Chat (Premium Only)
- [ ] Click AI Chat button (bottom-right)
- [ ] Ask business question
- [ ] Verify response appears
- [ ] Test different queries:
  - "What's my total revenue?"
  - "Show me top customers"
  - "What are my biggest expenses?"
- [ ] Check conversation history
- [ ] Export chat transcript

### AI Insights
- [ ] View dashboard AI insights card
- [ ] Check business recommendations
- [ ] Verify insights are relevant
- [ ] Test insight actions (if any)

---

## 12. Subscription & Access Control Testing

### Free Plan Limits
- [ ] Create account on Free plan
- [ ] Create 5 invoices (at limit)
- [ ] Try to create 6th invoice
- [ ] Verify limit warning appears
- [ ] Check "Upgrade" prompt

### Premium Features Gating
- [ ] As Free user, try to access:
  - AI OCR Scanner → Premium gate
  - AI Chat → Premium gate
  - Accounting → Premium gate
  - Payroll → Premium gate
- [ ] Verify "Upgrade to Premium" message shows

### Plan Upgrade
- [ ] Navigate to Settings > Subscription
- [ ] Click "Upgrade Plan"
- [ ] Select Professional plan
- [ ] Confirm upgrade
- [ ] Verify features unlocked
- [ ] Check usage limits increased

---

## 13. Performance Testing

### Page Load Speed
- [ ] Measure Dashboard load time (target: < 2s)
- [ ] Measure Customers page with 100+ records (< 3s)
- [ ] Measure Reports generation time (< 5s)
- [ ] Check for any slow queries

### Large Data Sets
- [ ] Import 1000 customers
- [ ] Navigate to Customers page
- [ ] Test search performance
- [ ] Test filtering performance
- [ ] Verify pagination works

### Concurrent Users (If possible)
- [ ] Have 5 users log in simultaneously
- [ ] All create invoices at same time
- [ ] Verify no conflicts
- [ ] Check database locking

---

## 14. Responsive Design Testing

### Mobile Devices
Test on actual devices or using browser DevTools:

**iPhone 12 (390x844):**
- [ ] Landing page responsive
- [ ] Dashboard readable
- [ ] Forms usable
- [ ] Tables scroll horizontally
- [ ] Buttons touch-friendly

**Samsung Galaxy S21 (360x800):**
- [ ] All pages responsive
- [ ] Navigation menu accessible
- [ ] Forms fill full width
- [ ] Images scale correctly

**iPad (810x1080):**
- [ ] Dashboard in 2-column layout
- [ ] Forms in optimal size
- [ ] Tables fit screen

### Breakpoints
- [ ] Test at 320px (smallest mobile)
- [ ] Test at 768px (tablet)
- [ ] Test at 1024px (small desktop)
- [ ] Test at 1920px (large desktop)

---

## 15. Cross-Browser Testing

### Browsers to Test
- [ ] **Chrome** (latest) - Primary browser
- [ ] **Firefox** (latest)
- [ ] **Safari** (latest) - macOS/iOS
- [ ] **Edge** (latest)
- [ ] **Mobile Safari** - iOS
- [ ] **Chrome Mobile** - Android

### Features to Check Per Browser
- [ ] Login/Logout
- [ ] Dashboard loads correctly
- [ ] Forms submit properly
- [ ] File uploads work
- [ ] PDFs generate
- [ ] Currency formatting
- [ ] Date pickers work
- [ ] Charts display (if any)

---

## 16. Security Testing

### Input Validation
- [ ] Try SQL injection in all forms
- [ ] Try XSS attacks in text fields
- [ ] Test CSRF protection
- [ ] Verify file upload restrictions
- [ ] Check password complexity enforcement

### Authentication & Authorization
- [ ] Try accessing admin pages as regular user
- [ ] Try viewing other company's data
- [ ] Test session timeout
- [ ] Verify RLS policies work
- [ ] Test logout clears all session data

### Data Protection
- [ ] Verify passwords are hashed
- [ ] Check HTTPS enforcement
- [ ] Test API key security
- [ ] Verify sensitive data not logged
- [ ] Check database encryption (if enabled)

---

## 17. Error Handling Testing

### Network Errors
- [ ] Disable network mid-operation
- [ ] Verify error message appears
- [ ] Check data not corrupted
- [ ] Verify recovery on reconnect

### Database Errors
- [ ] Simulate database timeout
- [ ] Test with invalid data
- [ ] Check constraint violations
- [ ] Verify rollback works

### User Errors
- [ ] Submit forms with missing fields
- [ ] Enter invalid data types
- [ ] Upload wrong file types
- [ ] Exceed input limits
- [ ] Verify helpful error messages

---

## 18. Accessibility Testing

### Keyboard Navigation
- [ ] Tab through all forms
- [ ] Use Enter to submit
- [ ] Use Escape to close dialogs
- [ ] Navigate menus with arrow keys

### Screen Reader
- [ ] Test with NVDA (Windows)
- [ ] Test with VoiceOver (Mac)
- [ ] Verify all images have alt text
- [ ] Check form labels are read correctly

### Color Contrast
- [ ] Verify text readable (WCAG AA)
- [ ] Check buttons have sufficient contrast
- [ ] Verify error messages stand out

---

## Bug Reporting Template

When you find a bug, report it using this format:

```markdown
**Bug ID:** BUG-001
**Severity:** High/Medium/Low
**Component:** Dashboard/Customers/etc.
**Browser:** Chrome 120
**Device:** Desktop Windows 11

**Steps to Reproduce:**
1. Navigate to Customers page
2. Click "Add Customer"
3. Leave Name field empty
4. Click Save

**Expected Result:**
Validation error should appear

**Actual Result:**
Form submits with blank name

**Screenshot:** [Attach screenshot]
**Console Errors:** [Paste console errors]
```

---

## Test Sign-Off Checklist

Before declaring testing complete:

- [ ] All critical bugs fixed
- [ ] All medium bugs fixed or documented
- [ ] Low priority bugs documented for future
- [ ] Performance benchmarks met
- [ ] Security audit passed
- [ ] Accessibility standards met (WCAG AA)
- [ ] All browsers tested successfully
- [ ] Mobile devices tested
- [ ] Documentation updated
- [ ] Backup tested
- [ ] Recovery procedure tested

---

## Test Summary Report Template

```markdown
# EaziBook Testing Summary Report

**Date:** [Date]
**Tester:** [Your Name]
**Version:** 1.0

## Test Coverage
- Total Test Cases: 200
- Passed: 185
- Failed: 10
- Blocked: 5

## Critical Issues
1. [Issue description]
2. [Issue description]

## Recommendations
1. [Recommendation]
2. [Recommendation]

## Sign-Off
Testing Status: ✅ Ready for Launch / ❌ Not Ready
```

---

**Document Version:** 1.0  
**Last Updated:** January 28, 2025  
**Next Review:** Before each major release
