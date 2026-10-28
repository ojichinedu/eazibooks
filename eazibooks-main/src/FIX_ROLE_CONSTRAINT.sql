-- =====================================================
-- STEP 1: First, let's see what roles are allowed
-- =====================================================

SELECT 
  con.conname as constraint_name,
  pg_get_constraintdef(con.oid) as constraint_definition
FROM pg_constraint con
JOIN pg_class rel ON rel.oid = con.conrelid
JOIN pg_namespace nsp ON nsp.oid = rel.relnamespace
WHERE rel.relname = 'profiles'
  AND con.contype = 'c'
  AND con.conname LIKE '%role%';

-- This will show us what values are allowed for the role column
