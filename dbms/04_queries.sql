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


-- ============================================================================
-- QUERY 5: Student Bargain Deals Below Category Average Price
-- ============================================================================
-- Business Question:
--   Which active items are priced strictly below the average price of their
--   respective category, and how much do students save compared to the average?
--
-- SQL Concepts Demonstrated:
--   Correlated subquery in the WHERE clause, scalar subquery in the SELECT list,
--   computed difference (savings), multi-table INNER JOIN, mathematical sorting.
-- ============================================================================

SELECT 
    l.id AS listing_id,
    l.title,
    c.name AS category_name,
    l.price AS item_price,
    ROUND((
        SELECT AVG(l_sub.price) 
        FROM "Listing" l_sub 
        WHERE l_sub.category_id = l.category_id 
          AND l_sub.status = 'ACTIVE'
    ), 2) AS category_avg_price,
    ROUND((
        (SELECT AVG(l_sub.price) FROM "Listing" l_sub WHERE l_sub.category_id = l.category_id AND l_sub.status = 'ACTIVE') - l.price
    ), 2) AS student_savings,
    u.name AS seller_name
FROM "Listing" l
INNER JOIN "Category" c ON l.category_id = c.id
INNER JOIN "User" u ON l.seller_id = u.id
WHERE l.status = 'ACTIVE'
  AND l.price < (
      SELECT AVG(l2.price)
      FROM "Listing" l2
      WHERE l2.category_id = l.category_id
        AND l2.status = 'ACTIVE'
  )
ORDER BY student_savings DESC;


-- ============================================================================
-- QUERY 6: High-Demand Items with Confirmed Student Engagement
-- ============================================================================
-- Business Question:
--   Which active listings have confirmed student demand—either having
--   active buyer chat inquiries or having been saved into wishlists?
--
-- SQL Concepts Demonstrated:
--   EXISTS operator with correlated subqueries, compound boolean logic,
--   CASE statement categorizing multi-channel engagement levels.
-- ============================================================================

SELECT 
    l.id AS listing_id,
    l.title,
    c.name AS category,
    l.price,
    u.name AS seller_name,
    CASE 
        WHEN EXISTS (SELECT 1 FROM "Favorite" f WHERE f.listing_id = l.id) 
         AND EXISTS (SELECT 1 FROM "Message" m WHERE m.listing_id = l.id) 
        THEN 'High Demand (Wishlisted & Inquired)'
        WHEN EXISTS (SELECT 1 FROM "Message" m WHERE m.listing_id = l.id) 
        THEN 'Inquired by Buyer'
        ELSE 'Bookmarked in Wishlist'
    END AS engagement_level
FROM "Listing" l
INNER JOIN "Category" c ON l.category_id = c.id
INNER JOIN "User" u ON l.seller_id = u.id
WHERE l.status = 'ACTIVE'
  AND (
      EXISTS (SELECT 1 FROM "Favorite" f WHERE f.listing_id = l.id)
      OR
      EXISTS (SELECT 1 FROM "Message" m WHERE m.listing_id = l.id)
  )
ORDER BY l.price DESC;


-- ============================================================================
-- QUERY 7: Category Market Share & Valuation Breakdown (Common Table Expression - CTE)
-- ============================================================================
-- Business Question:
--   Using CTEs, what is the inventory market share (listing percentage) and
--   economic valuation share of each category across all active campus listings?
--
-- SQL Concepts Demonstrated:
--   Common Table Expressions (WITH clause) with multiple chained CTEs,
--   CROSS JOIN with scalar aggregate CTE, percentage share calculations.
-- ============================================================================

WITH CategoryAggregates AS (
    SELECT 
        c.id AS category_id,
        c.name AS category_name,
        COUNT(l.id) AS active_count,
        SUM(l.price) AS category_value
    FROM "Category" c
    INNER JOIN "Listing" l ON c.id = l.category_id
    WHERE l.status = 'ACTIVE'
    GROUP BY c.id, c.name
),
MarketTotals AS (
    SELECT 
        SUM(active_count) AS total_listings,
        SUM(category_value) AS total_market_value
    FROM CategoryAggregates
)
SELECT 
    ca.category_name,
    ca.active_count,
    ROUND((ca.active_count * 100.0) / mt.total_listings, 2) AS inventory_share_pct,
    ROUND(ca.category_value, 2) AS category_valuation,
    ROUND((ca.category_value * 100.0) / mt.total_market_value, 2) AS value_share_pct
FROM CategoryAggregates ca
CROSS JOIN MarketTotals mt
ORDER BY ca.category_value DESC;


-- ============================================================================
-- QUERY 8: Campus Wishlist Leaderboard (Most Favorited Items)
-- ============================================================================
-- Business Question:
--   Which active marketplace items have been bookmarked/favorited most frequently
--   by fellow students, and who are the sellers?
--
-- SQL Concepts Demonstrated:
--   Multi-table LEFT JOIN (Listing -> Favorite, Listing -> User, Listing -> Category),
--   GROUP BY on primary key and entity attributes, COUNT(f.id) aggregation,
--   HAVING count > 0 filter, tie-breaker sorting.
-- ============================================================================

SELECT 
    l.id AS listing_id,
    l.title AS item_title,
    c.name AS category_name,
    l.price,
    u.name AS seller_name,
    u.hostel AS pickup_location,
    COUNT(f.id) AS total_saves
FROM "Listing" l
INNER JOIN "Category" c ON l.category_id = c.id
INNER JOIN "User" u ON l.seller_id = u.id
LEFT JOIN "Favorite" f ON l.id = f.listing_id
WHERE l.status = 'ACTIVE'
GROUP BY l.id, l.title, c.name, l.price, u.name, u.hostel
HAVING COUNT(f.id) > 0
ORDER BY total_saves DESC, l.price ASC;


-- ============================================================================
-- QUERY 9: In-App Buyer-Seller Inquiry Thread Log
-- ============================================================================
-- Business Question:
--   What are all contextual chat inquiries initiated between buyers and
--   sellers regarding specific marketplace items, sorted from newest to oldest?
--
-- SQL Concepts Demonstrated:
--   Multiple joins referencing the same parent entity ("User" aliased as sender
--   and receiver), multi-table join with "Listing", timestamp ordering.
-- ============================================================================

SELECT 
    m.id AS message_id,
    l.title AS item_title,
    sender.name AS buyer_name,
    sender.department AS buyer_department,
    receiver.name AS seller_name,
    receiver.hostel AS seller_hostel,
    m.content AS inquiry_message,
    m.created_at AS sent_at
FROM "Message" m
INNER JOIN "Listing" l ON m.listing_id = l.id
INNER JOIN "User" sender ON m.sender_id = sender.id
INNER JOIN "User" receiver ON m.receiver_id = receiver.id
ORDER BY m.created_at DESC;


-- ============================================================================
-- QUERY 10: Departmental Listing Price & Recency Rankings (Window Functions)
-- ============================================================================
-- Business Question:
--   Within each student seller's academic department, what is the relative
--   price ranking and recency ranking of every active listing?
--
-- SQL Concepts Demonstrated:
--   Window functions: DENSE_RANK() OVER (PARTITION BY ... ORDER BY ...),
--   ROW_NUMBER() OVER (PARTITION BY ... ORDER BY ...), multi-column partitioning.
-- ============================================================================

SELECT 
    u.department,
    l.title AS item_title,
    c.name AS category_name,
    l.price AS item_price,
    u.name AS seller_name,
    DENSE_RANK() OVER (
        PARTITION BY u.department 
        ORDER BY l.price DESC
    ) AS dept_price_rank,
    ROW_NUMBER() OVER (
        PARTITION BY u.department 
        ORDER BY l.created_at DESC
    ) AS dept_recency_rank
FROM "Listing" l
INNER JOIN "User" u ON l.seller_id = u.id
INNER JOIN "Category" c ON l.category_id = c.id
WHERE l.status = 'ACTIVE'
ORDER BY u.department ASC, dept_price_rank ASC;


-- ============================================================================
-- QUERY 11: Top-2 Highest Value Listings per Campus Hostel (Window Function in CTE)
-- ============================================================================
-- Business Question:
--   What are the top 2 highest-value listings originating from each student
--   residential hostel on campus?
--
-- SQL Concepts Demonstrated:
--   CTE encapsulating window ranking function ROW_NUMBER() OVER (PARTITION BY ...),
--   outer query filtering on the calculated rank (WHERE item_rank <= 2).
-- ============================================================================

WITH RankedHostelListings AS (
    SELECT 
        u.hostel AS campus_residence,
        l.title AS item_title,
        c.name AS category_name,
        l.price,
        u.name AS seller_name,
        ROW_NUMBER() OVER (
            PARTITION BY u.hostel 
            ORDER BY l.price DESC
        ) AS item_rank
    FROM "Listing" l
    INNER JOIN "User" u ON l.seller_id = u.id
    INNER JOIN "Category" c ON l.category_id = c.id
    WHERE l.status = 'ACTIVE'
      AND u.hostel IS NOT NULL
)
SELECT 
    campus_residence,
    item_rank,
    item_title,
    category_name,
    price,
    seller_name
FROM RankedHostelListings
WHERE item_rank <= 2
ORDER BY campus_residence ASC, item_rank ASC;


-- ============================================================================
-- QUERY 12: Safe Atomic Purchase Transaction (State Transition & Rollback)
-- ============================================================================
-- Business Question:
--   How does the platform execute a safe, atomic state transition when an
--   item is sold (marking status='SOLD' and updating the timestamp), verifying
--   the change within a transaction block before rolling back to preserve test data?
--
-- SQL Concepts Demonstrated:
--   ACID transactions: BEGIN TRANSACTION, targeted UPDATE statement with state
--   guard (status = 'ACTIVE'), post-update verification SELECT, and safe
--   ROLLBACK TRANSACTION to prevent seed data corruption during script execution.
-- ============================================================================

-- Step 1: Begin atomic transaction block
BEGIN TRANSACTION;

-- Step 2: Transition listing 'lst_001' from ACTIVE to SOLD upon buyer completion
UPDATE "Listing"
SET status = 'SOLD',
    updated_at = CURRENT_TIMESTAMP
WHERE id = 'lst_001'
  AND status = 'ACTIVE';

-- Step 3: Verify the mutated record state within the uncommitted transaction
SELECT 
    id AS listing_id,
    title,
    seller_id,
    price,
    status AS updated_status,
    updated_at
FROM "Listing"
WHERE id = 'lst_001';

-- Step 4: Safely roll back transaction to keep persistent database in pristine state
ROLLBACK TRANSACTION;
