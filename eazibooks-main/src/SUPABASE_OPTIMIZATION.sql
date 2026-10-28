-- =====================================================
-- EaziBook - Database Performance Optimization
-- Run these queries in your Supabase SQL Editor to improve performance
-- =====================================================

-- =====================================================
-- 1. CREATE INDEXES FOR FREQUENTLY QUERIED COLUMNS
-- =====================================================

-- Profiles table indexes
CREATE INDEX IF NOT EXISTS idx_profiles_company_id ON public.profiles(company_id);
CREATE INDEX IF NOT EXISTS idx_profiles_email ON public.profiles(email);

-- Companies table indexes
CREATE INDEX IF NOT EXISTS idx_companies_created_at ON public.companies(created_at);

-- Customers table indexes
CREATE INDEX IF NOT EXISTS idx_customers_company_id ON public.customers(company_id);
CREATE INDEX IF NOT EXISTS idx_customers_customer_code ON public.customers(customer_code);
CREATE INDEX IF NOT EXISTS idx_customers_email ON public.customers(email);
CREATE INDEX IF NOT EXISTS idx_customers_status ON public.customers(status);

-- Suppliers table indexes
CREATE INDEX IF NOT EXISTS idx_suppliers_company_id ON public.suppliers(company_id);
CREATE INDEX IF NOT EXISTS idx_suppliers_supplier_code ON public.suppliers(supplier_code);
CREATE INDEX IF NOT EXISTS idx_suppliers_email ON public.suppliers(email);
CREATE INDEX IF NOT EXISTS idx_suppliers_status ON public.suppliers(status);

-- Products table indexes
CREATE INDEX IF NOT EXISTS idx_products_company_id ON public.products(company_id);
CREATE INDEX IF NOT EXISTS idx_products_sku ON public.products(sku);
CREATE INDEX IF NOT EXISTS idx_products_status ON public.products(status);
CREATE INDEX IF NOT EXISTS idx_products_category ON public.products(category);

-- Invoices table indexes
CREATE INDEX IF NOT EXISTS idx_invoices_company_id ON public.invoices(company_id);
CREATE INDEX IF NOT EXISTS idx_invoices_customer_id ON public.invoices(customer_id);
CREATE INDEX IF NOT EXISTS idx_invoices_invoice_number ON public.invoices(invoice_number);
CREATE INDEX IF NOT EXISTS idx_invoices_status ON public.invoices(status);
CREATE INDEX IF NOT EXISTS idx_invoices_invoice_date ON public.invoices(invoice_date DESC);
CREATE INDEX IF NOT EXISTS idx_invoices_due_date ON public.invoices(due_date);

-- Invoice items table indexes
CREATE INDEX IF NOT EXISTS idx_invoice_items_invoice_id ON public.invoice_items(invoice_id);
CREATE INDEX IF NOT EXISTS idx_invoice_items_product_id ON public.invoice_items(product_id);

-- Bills table indexes
CREATE INDEX IF NOT EXISTS idx_bills_company_id ON public.bills(company_id);
CREATE INDEX IF NOT EXISTS idx_bills_supplier_id ON public.bills(supplier_id);
CREATE INDEX IF NOT EXISTS idx_bills_bill_number ON public.bills(bill_number);
CREATE INDEX IF NOT EXISTS idx_bills_status ON public.bills(status);
CREATE INDEX IF NOT EXISTS idx_bills_bill_date ON public.bills(bill_date DESC);

-- Bill items table indexes
CREATE INDEX IF NOT EXISTS idx_bill_items_bill_id ON public.bill_items(bill_id);
CREATE INDEX IF NOT EXISTS idx_bill_items_product_id ON public.bill_items(product_id);

-- Transactions table indexes
CREATE INDEX IF NOT EXISTS idx_transactions_company_id ON public.transactions(company_id);
CREATE INDEX IF NOT EXISTS idx_transactions_transaction_date ON public.transactions(transaction_date DESC);
CREATE INDEX IF NOT EXISTS idx_transactions_type ON public.transactions(type);
CREATE INDEX IF NOT EXISTS idx_transactions_category ON public.transactions(category);
CREATE INDEX IF NOT EXISTS idx_transactions_status ON public.transactions(status);

-- Payments table indexes
CREATE INDEX IF NOT EXISTS idx_payments_company_id ON public.payments(company_id);
CREATE INDEX IF NOT EXISTS idx_payments_invoice_id ON public.payments(invoice_id);
CREATE INDEX IF NOT EXISTS idx_payments_payment_date ON public.payments(payment_date DESC);

-- Subscriptions table indexes
CREATE INDEX IF NOT EXISTS idx_subscriptions_company_id ON public.subscriptions(company_id);
CREATE INDEX IF NOT EXISTS idx_subscriptions_user_id ON public.subscriptions(user_id);
CREATE INDEX IF NOT EXISTS idx_subscriptions_status ON public.subscriptions(status);
CREATE INDEX IF NOT EXISTS idx_subscriptions_plan_type ON public.subscriptions(plan_type);

-- Employees table indexes
CREATE INDEX IF NOT EXISTS idx_employees_company_id ON public.employees(company_id);
CREATE INDEX IF NOT EXISTS idx_employees_employee_code ON public.employees(employee_code);
CREATE INDEX IF NOT EXISTS idx_employees_status ON public.employees(status);

-- Chart of accounts indexes
CREATE INDEX IF NOT EXISTS idx_coa_company_id ON public.chart_of_accounts(company_id);
CREATE INDEX IF NOT EXISTS idx_coa_account_code ON public.chart_of_accounts(account_code);
CREATE INDEX IF NOT EXISTS idx_coa_account_type ON public.chart_of_accounts(account_type);

-- Journal entries indexes
CREATE INDEX IF NOT EXISTS idx_journal_entries_company_id ON public.journal_entries(company_id);
CREATE INDEX IF NOT EXISTS idx_journal_entries_entry_date ON public.journal_entries(entry_date DESC);
CREATE INDEX IF NOT EXISTS idx_journal_entries_status ON public.journal_entries(status);

-- Journal entry lines indexes
CREATE INDEX IF NOT EXISTS idx_journal_entry_lines_journal_entry_id ON public.journal_entry_lines(journal_entry_id);
CREATE INDEX IF NOT EXISTS idx_journal_entry_lines_account_id ON public.journal_entry_lines(account_id);

-- Inventory movements indexes
CREATE INDEX IF NOT EXISTS idx_inventory_movements_company_id ON public.inventory_movements(company_id);
CREATE INDEX IF NOT EXISTS idx_inventory_movements_product_id ON public.inventory_movements(product_id);
CREATE INDEX IF NOT EXISTS idx_inventory_movements_created_at ON public.inventory_movements(created_at DESC);

-- Payroll indexes
CREATE INDEX IF NOT EXISTS idx_payroll_runs_company_id ON public.payroll_runs(company_id);
CREATE INDEX IF NOT EXISTS idx_payroll_runs_payment_date ON public.payroll_runs(payment_date DESC);
CREATE INDEX IF NOT EXISTS idx_payroll_items_payroll_run_id ON public.payroll_items(payroll_run_id);
CREATE INDEX IF NOT EXISTS idx_payroll_items_employee_id ON public.payroll_items(employee_id);

-- Tax returns indexes
CREATE INDEX IF NOT EXISTS idx_tax_returns_company_id ON public.tax_returns(company_id);
CREATE INDEX IF NOT EXISTS idx_tax_returns_filing_date ON public.tax_returns(filing_date DESC);
CREATE INDEX IF NOT EXISTS idx_tax_returns_status ON public.tax_returns(status);

-- Activity log indexes
CREATE INDEX IF NOT EXISTS idx_activity_log_company_id ON public.activity_log(company_id);
CREATE INDEX IF NOT EXISTS idx_activity_log_user_id ON public.activity_log(user_id);
CREATE INDEX IF NOT EXISTS idx_activity_log_created_at ON public.activity_log(created_at DESC);

-- Notifications indexes
CREATE INDEX IF NOT EXISTS idx_notifications_user_id ON public.notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_notifications_is_read ON public.notifications(is_read);
CREATE INDEX IF NOT EXISTS idx_notifications_created_at ON public.notifications(created_at DESC);

-- Attachments indexes
CREATE INDEX IF NOT EXISTS idx_attachments_company_id ON public.attachments(company_id);
CREATE INDEX IF NOT EXISTS idx_attachments_entity_type ON public.attachments(entity_type);
CREATE INDEX IF NOT EXISTS idx_attachments_entity_id ON public.attachments(entity_id);

-- =====================================================
-- 2. COMPOSITE INDEXES FOR COMMON QUERIES
-- =====================================================

-- Composite index for company + status queries (very common pattern)
CREATE INDEX IF NOT EXISTS idx_customers_company_status ON public.customers(company_id, status);
CREATE INDEX IF NOT EXISTS idx_suppliers_company_status ON public.suppliers(company_id, status);
CREATE INDEX IF NOT EXISTS idx_products_company_status ON public.products(company_id, status);
CREATE INDEX IF NOT EXISTS idx_invoices_company_status ON public.invoices(company_id, status);
CREATE INDEX IF NOT EXISTS idx_bills_company_status ON public.bills(company_id, status);

-- Composite index for company + date queries
CREATE INDEX IF NOT EXISTS idx_transactions_company_date ON public.transactions(company_id, transaction_date DESC);
CREATE INDEX IF NOT EXISTS idx_invoices_company_date ON public.invoices(company_id, invoice_date DESC);
CREATE INDEX IF NOT EXISTS idx_bills_company_date ON public.bills(company_id, bill_date DESC);

-- =====================================================
-- 3. ANALYZE TABLES FOR QUERY PLANNER
-- =====================================================

-- Update table statistics for the query planner
ANALYZE public.profiles;
ANALYZE public.companies;
ANALYZE public.customers;
ANALYZE public.suppliers;
ANALYZE public.products;
ANALYZE public.invoices;
ANALYZE public.invoice_items;
ANALYZE public.bills;
ANALYZE public.bill_items;
ANALYZE public.transactions;
ANALYZE public.payments;
ANALYZE public.subscriptions;
ANALYZE public.employees;
ANALYZE public.chart_of_accounts;
ANALYZE public.journal_entries;
ANALYZE public.journal_entry_lines;
ANALYZE public.inventory_movements;
ANALYZE public.payroll_runs;
ANALYZE public.payroll_items;
ANALYZE public.tax_returns;
ANALYZE public.activity_log;
ANALYZE public.notifications;
ANALYZE public.attachments;

-- =====================================================
-- 4. VACUUM TABLES (OPTIONAL - FOR MAINTENANCE)
-- =====================================================

-- Run vacuum to reclaim storage and update statistics
-- Note: This can take time on large tables
-- VACUUM ANALYZE public.profiles;
-- VACUUM ANALYZE public.companies;
-- VACUUM ANALYZE public.customers;
-- VACUUM ANALYZE public.invoices;
-- VACUUM ANALYZE public.transactions;

-- =====================================================
-- 5. CHECK INDEX USAGE (DIAGNOSTIC QUERY)
-- =====================================================

-- Run this query to see which indexes are being used
-- SELECT 
--     schemaname,
--     tablename,
--     indexname,
--     idx_scan as index_scans,
--     idx_tup_read as tuples_read,
--     idx_tup_fetch as tuples_fetched
-- FROM pg_stat_user_indexes
-- WHERE schemaname = 'public'
-- ORDER BY idx_scan DESC;

-- =====================================================
-- 6. CHECK TABLE SIZES (DIAGNOSTIC QUERY)
-- =====================================================

-- Run this to see table sizes
-- SELECT
--     schemaname,
--     tablename,
--     pg_size_pretty(pg_total_relation_size(schemaname||'.'||tablename)) AS size,
--     pg_total_relation_size(schemaname||'.'||tablename) AS size_bytes
-- FROM pg_tables
-- WHERE schemaname = 'public'
-- ORDER BY size_bytes DESC;

-- =====================================================
-- END OF OPTIMIZATION QUERIES
-- =====================================================

RAISE NOTICE '✅ All indexes have been created successfully!';
RAISE NOTICE '✅ Run ANALYZE to update table statistics';
RAISE NOTICE '📊 Your database is now optimized for better performance!';
