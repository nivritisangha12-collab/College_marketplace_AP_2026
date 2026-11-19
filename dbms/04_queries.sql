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


-- ============================================================================
-- QUERY 2: Multi-Option Semester Rental & Purchase Search
-- ============================================================================
-- Business Question:
--   Which items located at 'Hostel A' or 'Library Block' are available in
--   'GOOD' or 'LIKE_NEW' condition, and what are their rental vs purchase terms?
--
-- SQL Concepts Demonstrated:
--   INNER JOIN, compound boolean predicates (AND, OR, IN), CASE WHEN expression
--   for dynamic business classification, formatted attribute comparisons.
-- ============================================================================

SELECT 
    l.id AS listing_id,
    l.title AS item_title,
    c.name AS category,
    l.location AS campus_location,
    l.condition,
    l.price AS purchase_price,
    l.rent_price AS semester_rent_price,
    CASE 
        WHEN l.listing_type = 'BOTH' THEN 'Available to Buy or Rent'
        WHEN l.listing_type = 'RENT' THEN 'Semester Rental Only'
        ELSE 'Purchase Only'
    END AS transaction_option,
    u.name AS seller_name,
    u.phone AS seller_contact
FROM "Listing" l
INNER JOIN "User" u ON l.seller_id = u.id
INNER JOIN "Category" c ON l.category_id = c.id
WHERE l.status = 'ACTIVE'
  AND l.location IN ('Hostel A', 'Library Block')
  AND l.condition IN ('GOOD', 'LIKE_NEW')
ORDER BY l.rent_price DESC, l.price DESC;


-- ============================================================================
-- QUERY 3: Student Seller Activity & Revenue Dashboard
-- ============================================================================
-- Business Question:
--   For every campus student, what is their complete sales track record:
--   total listings posted, active items, sold items, and gross sales revenue
--   (ensuring students with zero listings or zero sales are accounted for)?
--
-- SQL Concepts Demonstrated:
--   LEFT OUTER JOIN, conditional aggregation (SUM/COUNT with CASE WHEN),
--   COALESCE() for graceful NULL replacement, GROUP BY multi-column grouping.
-- ============================================================================

SELECT 
    u.id AS student_id,
    u.name AS student_name,
    u.department,
    u.hostel,
    COUNT(l.id) AS total_listings_created,
    SUM(CASE WHEN l.status = 'ACTIVE' THEN 1 ELSE 0 END) AS active_listings_count,
    SUM(CASE WHEN l.status = 'SOLD' THEN 1 ELSE 0 END) AS sold_items_count,
    COALESCE(SUM(CASE WHEN l.status = 'SOLD' THEN l.price ELSE 0.00 END), 0.00) AS gross_sales_revenue
FROM "User" u
LEFT JOIN "Listing" l ON u.id = l.seller_id
WHERE u.role = 'STUDENT'
GROUP BY u.id, u.name, u.department, u.hostel
ORDER BY sold_items_count DESC, gross_sales_revenue DESC, total_listings_created DESC;


-- ============================================================================
-- QUERY 4: Category Inventory & Price Range Analytics
-- ============================================================================
-- Business Question:
--   What are the listing counts, minimum price, average price, maximum price,
--   and total valuation for each category with active items on campus?
--
-- SQL Concepts Demonstrated:
--   INNER JOIN, GROUP BY on primary & descriptive columns, aggregate functions
--   (COUNT, MIN, AVG, MAX, SUM), ROUND() formatting, HAVING clause filter.
-- ============================================================================

SELECT 
    c.id AS category_id,
    c.name AS category_name,
    COUNT(l.id) AS total_active_listings,
    MIN(l.price) AS min_price,
    ROUND(AVG(l.price), 2) AS avg_price,
    MAX(l.price) AS max_price,
    ROUND(SUM(l.price), 2) AS total_category_valuation
FROM "Category" c
INNER JOIN "Listing" l ON c.id = l.category_id
WHERE l.status = 'ACTIVE'
GROUP BY c.id, c.name
HAVING COUNT(l.id) >= 1
ORDER BY total_active_listings DESC, avg_price DESC;
