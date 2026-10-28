-- =====================================================
-- EaziBook - Diagnostic Queries
-- Run these to check your database setup and find issues
-- =====================================================

-- =====================================================
-- 1. CHECK ALL TABLES EXIST
-- =====================================================

SELECT 
    table_name,
    (SELECT COUNT(*) FROM information_schema.columns WHERE table_name = t.table_name) as column_count
FROM information_schema.tables t
WHERE table_schema = 'public' 
AND table_type = 'BASE TABLE'
ORDER BY table_name;

-- Expected: Should show at least 20+ tables including:
-- profiles, companies, customers, suppliers, products, 
-- invoices, bills, transactions, etc.

-- =====================================================
-- 2. CHECK RLS IS ENABLED
-- =====================================================

SELECT 
    tablename,
    rowsecurity as rls_enabled
FROM pg_tables 
WHERE schemaname = 'public'
ORDER BY tablename;

-- Expected: All tables should have rls_enabled = true

-- =====================================================
-- 3. CHECK RLS POLICIES
-- =====================================================

SELECT 
    schemaname,
    tablename,
    policyname,
    permissive,
    roles,
    cmd as command,
    qual as using_expression
FROM pg_policies
WHERE schemaname = 'public'
ORDER BY tablename, policyname;

-- Expected: Multiple policies per table for SELECT, INSERT, UPDATE, DELETE

-- =====================================================
-- 4. CHECK INDEXES
-- =====================================================

SELECT 
    schemaname,
    tablename,
    indexname,
    indexdef
FROM pg_indexes
WHERE schemaname = 'public'
ORDER BY tablename, indexname;

-- Expected: Multiple indexes especially on company_id columns

-- =====================================================
-- 5. CHECK TRIGGERS
-- =====================================================

SELECT 
    trigger_schema,
    trigger_name,
    event_manipulation,
    event_object_table,
    action_statement
FROM information_schema.triggers
WHERE trigger_schema = 'public'
ORDER BY event_object_table, trigger_name;

-- Expected: update_updated_at triggers on most tables
-- Expected: on_auth_user_created trigger on auth.users

-- =====================================================
-- 6. CHECK FUNCTIONS
-- =====================================================

SELECT 
    routine_schema,
    routine_name,
    routine_type,
    data_type
FROM information_schema.routines
WHERE routine_schema = 'public'
ORDER BY routine_name;

-- Expected: 
-- - update_updated_at_column
-- - handle_new_user
-- - get_user_company_id
-- - user_has_company_access

-- =====================================================
-- 7. CHECK FOREIGN KEYS
-- =====================================================

SELECT
    tc.table_name, 
    kcu.column_name,
    ccu.table_name AS foreign_table_name,
    ccu.column_name AS foreign_column_name
FROM information_schema.table_constraints AS tc 
JOIN information_schema.key_column_usage AS kcu
  ON tc.constraint_name = kcu.constraint_name
  AND tc.table_schema = kcu.table_schema
JOIN information_schema.constraint_column_usage AS ccu
  ON ccu.constraint_name = tc.constraint_name
  AND ccu.table_schema = tc.table_schema
WHERE tc.constraint_type = 'FOREIGN KEY' 
  AND tc.table_schema = 'public'
ORDER BY tc.table_name, kcu.column_name;

-- Expected: Many foreign key relationships showing proper table links

-- =====================================================
-- 8. CHECK SAMPLE DATA (if exists)
-- =====================================================

-- Count records in main tables
SELECT 'profiles' as table_name, COUNT(*) as record_count FROM profiles
UNION ALL
SELECT 'companies', COUNT(*) FROM companies
UNION ALL
SELECT 'subscriptions', COUNT(*) FROM subscriptions
UNION ALL
SELECT 'customers', COUNT(*) FROM customers
UNION ALL
SELECT 'suppliers', COUNT(*) FROM suppliers
UNION ALL
SELECT 'products', COUNT(*) FROM products
UNION ALL
SELECT 'invoices', COUNT(*) FROM invoices
UNION ALL
SELECT 'bills', COUNT(*) FROM bills
UNION ALL
SELECT 'transactions', COUNT(*) FROM transactions
ORDER BY table_name;

-- =====================================================
-- 9. CHECK COLUMN DETAILS FOR KEY TABLES
-- =====================================================

-- Profiles table structure
SELECT 
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns
WHERE table_schema = 'public' 
  AND table_name = 'profiles'
ORDER BY ordinal_position;

-- Companies table structure
SELECT 
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns
WHERE table_schema = 'public' 
  AND table_name = 'companies'
ORDER BY ordinal_position;

-- Invoices table structure
SELECT 
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns
WHERE table_schema = 'public' 
  AND table_name = 'invoices'
ORDER BY ordinal_position;

-- =====================================================
-- 10. CHECK FOR COMMON ISSUES
-- =====================================================

-- Check for tables without company_id that should have it
SELECT 
    t.table_name,
    CASE 
        WHEN EXISTS (
            SELECT 1 FROM information_schema.columns c 
            WHERE c.table_name = t.table_name 
            AND c.column_name = 'company_id'
        ) THEN 'HAS company_id' 
        ELSE 'MISSING company_id'
    END as company_id_status
FROM information_schema.tables t
WHERE t.table_schema = 'public' 
  AND t.table_type = 'BASE TABLE'
  AND t.table_name NOT IN ('profiles', 'invoice_items', 'bill_items', 'journal_entry_lines', 'payroll_items')
ORDER BY t.table_name;

-- Check for tables with RLS but no policies (problematic!)
SELECT 
    t.tablename,
    t.rowsecurity as has_rls,
    COALESCE(p.policy_count, 0) as policy_count,
    CASE 
        WHEN t.rowsecurity = true AND COALESCE(p.policy_count, 0) = 0 THEN '⚠️ HAS RLS BUT NO POLICIES - WILL BLOCK ALL ACCESS!'
        WHEN t.rowsecurity = true AND COALESCE(p.policy_count, 0) > 0 THEN '✅ OK'
        WHEN t.rowsecurity = false THEN '⚠️ RLS NOT ENABLED'
    END as status
FROM pg_tables t
LEFT JOIN (
    SELECT tablename, COUNT(*) as policy_count
    FROM pg_policies
    WHERE schemaname = 'public'
    GROUP BY tablename
) p ON t.tablename = p.tablename
WHERE t.schemaname = 'public'
ORDER BY status DESC, t.tablename;

-- =====================================================
-- 11. CHECK AUTHENTICATION (Run while logged in)
-- =====================================================

-- Check current user
SELECT 
    auth.uid() as my_user_id,
    auth.email() as my_email;

-- Check my profile
SELECT * FROM profiles WHERE id = auth.uid();

-- Check my company
SELECT c.* 
FROM companies c
JOIN profiles p ON c.id = p.company_id
WHERE p.id = auth.uid();

-- Check my subscription
SELECT s.*
FROM subscriptions s
WHERE s.user_id = auth.uid();

-- =====================================================
-- 12. PERFORMANCE CHECK
-- =====================================================

-- Check table sizes
SELECT
    schemaname,
    tablename,
    pg_size_pretty(pg_total_relation_size(schemaname||'.'||tablename)) AS size,
    pg_total_relation_size(schemaname||'.'||tablename) AS size_bytes
FROM pg_tables
WHERE schemaname = 'public'
ORDER BY size_bytes DESC
LIMIT 20;

-- Check index usage (requires pg_stat_statements extension)
-- Note: This might not work if extension is not enabled
SELECT 
    schemaname,
    tablename,
    indexname,
    idx_scan as times_used,
    idx_tup_read as tuples_read,
    idx_tup_fetch as tuples_fetched
FROM pg_stat_user_indexes
WHERE schemaname = 'public'
ORDER BY idx_scan DESC
LIMIT 20;

-- =====================================================
-- 13. COMMON FIXES
-- =====================================================

-- If you need to fix missing company_id in profiles:
-- UPDATE profiles SET company_id = 'YOUR_COMPANY_ID' WHERE id = 'YOUR_USER_ID';

-- If you need to create a test company:
-- INSERT INTO companies (name, email, currency) 
-- VALUES ('Test Company', 'test@example.com', 'NGN')
-- RETURNING id;

-- If you need to link profile to company:
-- UPDATE profiles SET company_id = 'COMPANY_ID_FROM_ABOVE' WHERE id = auth.uid();

-- If you need to create a subscription:
-- INSERT INTO subscriptions (company_id, user_id, plan_type, status, invoices_limit, bills_limit)
-- VALUES ('YOUR_COMPANY_ID', auth.uid(), 'free', 'active', 5, 5);

-- =====================================================
-- END OF DIAGNOSTIC QUERIES
-- =====================================================

-- Summary Query - Run this first to get overview
SELECT 
    (SELECT COUNT(*) FROM information_schema.tables WHERE table_schema = 'public' AND table_type = 'BASE TABLE') as total_tables,
    (SELECT COUNT(*) FROM pg_tables WHERE schemaname = 'public' AND rowsecurity = true) as tables_with_rls,
    (SELECT COUNT(DISTINCT tablename) FROM pg_policies WHERE schemaname = 'public') as tables_with_policies,
    (SELECT COUNT(*) FROM information_schema.routines WHERE routine_schema = 'public') as total_functions,
    (SELECT COUNT(*) FROM pg_indexes WHERE schemaname = 'public') as total_indexes,
    (SELECT COUNT(*) FROM profiles) as total_users,
    (SELECT COUNT(*) FROM companies) as total_companies,
    (SELECT COUNT(*) FROM subscriptions) as total_subscriptions;
