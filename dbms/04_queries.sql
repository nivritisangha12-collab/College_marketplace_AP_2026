-- ============================================================================
-- CollegeXchange: Campus Student Marketplace (AP 2026 / DBMS Capstone)
-- Checkpoint 3 (CP3): Relational Query Suite & Business Analytics
-- File: dbms/04_queries.sql
-- Compatible With: SQLite / PostgreSQL / MySQL (ANSI SQL Standard)
-- Target Schema: dbms/03_schema.sql | Target Database: prisma/dev.db
-- ============================================================================


-- ============================================================================
-- QUERY 1: Active Marketplace Feed & Item Discovery
-- ============================================================================
-- Business Question:
--   What active listings in 'Academic' and 'Books' categories under ₹1,000
--   are available on campus, and who are the sellers?
--
-- SQL Concepts Demonstrated:
--   INNER JOIN, multi-table relationship navigation (Listing -> User, Listing -> Category),
--   compound WHERE filter, range filtering (price <= 1000), IN operator,
--   ORDER BY with multiple sort keys, LIMIT clause for pagination.
-- ============================================================================

SELECT 
    l.id AS listing_id,
    l.title AS item_title,
    c.name AS category_name,
    u.name AS seller_name,
    u.department AS seller_department,
    u.hostel AS pickup_hostel,
    l.price AS selling_price,
    l.condition AS item_condition,
    l.created_at AS posted_at
FROM "Listing" l
INNER JOIN "User" u ON l.seller_id = u.id
INNER JOIN "Category" c ON l.category_id = c.id
WHERE l.status = 'ACTIVE'
  AND l.price <= 1000.00
  AND c.slug IN ('academic', 'books')
ORDER BY l.price ASC, l.created_at DESC
LIMIT 10;
