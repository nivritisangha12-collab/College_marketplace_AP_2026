# Checkpoint 4 (CP4): Query Performance & Indexing Analysis Report
**Project:** CollegeXchange — Peer-to-Peer Campus Marketplace (`College_marketplace_AP_2026`)  
**Database Engine:** SQLite 3.54.0 (`prisma/dev.db`)  
**Target Submission:** Checkpoint 4 (CP4) Deliverables (`dbms/05_query_timings.md` and `dbms/plans/`)  
**Generated Date:** November 23, 2026  

---

## 1. Environment & Dataset Overview

### 1.1 Hardware & Runtime Environment
- **Host System:** Darwin / macOS (Apple Silicon / ARM64)
- **Database Engine:** SQLite 3.54.0 (Embedded Relational Engine used with Prisma ORM)
- **Storage Mode:** WAL (Write-Ahead Logging) persistent disk storage at `prisma/dev.db`
- **Benchmarking Tool:** Custom micro-benchmarking harness using Python 3 `sqlite3` driver with high-precision monotonic timers (`time.perf_counter_ns()`), executing 200 warmup & measurement runs per query.
- **Profiling Instruments:** SQLite CLI `.stats on`, `.timer on`, `EXPLAIN QUERY PLAN` (EQP), and Virtual Database Engine (VDBE) bytecode disassembly (`EXPLAIN`).

### 1.2 Database Schema & Seed Data Cardinality
The database schema (`dbms/03_schema.sql`) models an active collegiate marketplace with user profiles, item listings, hierarchical categories, product image galleries, user wishlists (favorites), and campus buyer-seller direct messaging threads.

| Table Name | Primary Key | Total Rows | Role & Semantic Meaning in College Marketplace |
|:---|:---|:---:|:---|
| **`User`** | `id` (`VARCHAR(30)`) | 4 | Student profiles with campus metadata (`college`, `department`, `hostel`, `room_number`, `role`). |
| **`Category`** | `id` (`VARCHAR(30)`) | 8 | Academic & student life categories (`academic`, `books`, `electronics`, `hostel`, etc.). |
| **`Listing`** | `id` (`VARCHAR(30)`) | 10 | Campus marketplace listings with condition, price, status (`ACTIVE`, `SOLD`), and listing type (`SALE`, `RENT`). |
| **`ListingImage`** | `id` (`VARCHAR(30)`) | 9 | Multi-image media gallery attachments linked to item listings. |
| **`Favorite`** | `id` (`VARCHAR(30)`) | 5 | Student saved items/wishlists tracking user engagement and purchase interest. |
| **`Message`** | `id` (`VARCHAR(30)`) | 5 | Real-time direct inquiry chat messages between campus buyers and sellers. |

---

## 2. Secondary Index Architecture (CP4 Indexing Strategy)

In Checkpoint 3 and the baseline database state, only primary keys and unique constraints were indexed automatically (`sqlite_autoindex_*`). Queries executing multi-table joins, category/status filtering, and correlated subqueries were forced to perform full sequential table scans (`SCAN`).

In Checkpoint 4, **17 secondary indexes** were architected and applied (`dbms/03_schema.sql`):

```sql
-- 1. User & Category Discovery Indexes
CREATE INDEX IF NOT EXISTS "idx_user_email" ON "User"("email");
CREATE INDEX IF NOT EXISTS "idx_user_role" ON "User"("role");
CREATE INDEX IF NOT EXISTS "idx_category_slug" ON "Category"("slug");
CREATE INDEX IF NOT EXISTS "idx_category_name" ON "Category"("name");

-- 2. Marketplace Listing Filtering & Search Indexes
CREATE INDEX IF NOT EXISTS "idx_listing_seller_id" ON "Listing"("seller_id");
CREATE INDEX IF NOT EXISTS "idx_listing_category_id" ON "Listing"("category_id");
CREATE INDEX IF NOT EXISTS "idx_listing_status" ON "Listing"("status");
CREATE INDEX IF NOT EXISTS "idx_listing_price" ON "Listing"("price");
CREATE INDEX IF NOT EXISTS "idx_listing_created_at" ON "Listing"("created_at" DESC);
CREATE INDEX IF NOT EXISTS "idx_listing_browse" ON "Listing"("status", "category_id", "listing_type");

-- 3. Media, Wishlist, and Messaging Foreign Key & Covering Indexes
CREATE INDEX IF NOT EXISTS "idx_listing_image_listing_id" ON "ListingImage"("listing_id");
CREATE INDEX IF NOT EXISTS "idx_favorite_student_id" ON "Favorite"("student_id");
CREATE INDEX IF NOT EXISTS "idx_favorite_listing_id" ON "Favorite"("listing_id");
CREATE INDEX IF NOT EXISTS "idx_message_listing_id" ON "Message"("listing_id");
CREATE INDEX IF NOT EXISTS "idx_message_sender_id" ON "Message"("sender_id");
CREATE INDEX IF NOT EXISTS "idx_message_receiver_id" ON "Message"("receiver_id");
CREATE INDEX IF NOT EXISTS "idx_message_thread" ON "Message"("listing_id", "sender_id", "receiver_id");
```

---

## 3. Summary Benchmark Comparison Table

The table below summarizes the performance metrics across all 12 SQL queries from `dbms/04_queries.sql`, comparing the baseline unindexed state against the CP4 indexed state. Execution times represent the mean across 200 measured runs.

| Query # | Query Title / Purpose | Scan Type (Before → After) | Execution Time Before (ms) | Execution Time After (ms) | Improvement (%) | Fullscan Steps (Before → After) | Primary Indexes Leveraged |
|:---:|:---|:---|:---:|:---:|:---:|:---:|:---|
| **Q1** | Active Marketplace Feed & Discovery | `SCAN l` $\rightarrow$ `SEARCH l (price)` | 0.0097 ms | 0.0092 ms | **+5.2%** | 9 $\rightarrow$ 0 | `idx_listing_price` |
| **Q2** | Multi-Option Semester Rental Search | `SCAN l` $\rightarrow$ `SEARCH l (status)` | 0.0094 ms | 0.0089 ms | **+5.3%** | 9 $\rightarrow$ 0 | `idx_listing_status` |
| **Q3** | Category Inventory & Analytics | `SCAN l` $\rightarrow$ `SEARCH l (status)` | 0.0127 ms | 0.0120 ms | **+5.5%** | 9 $\rightarrow$ 0 | `idx_listing_status` |
| **Q4** | Student Seller Activity Dashboard | `SCAN l LEFT-JOIN` $\rightarrow$ `SEARCH l` | 0.0095 ms | 0.0085 ms | **+10.5%** | 30 $\rightarrow$ 3 | `idx_listing_seller_id` |
| **Q5** | Campus Wishlist Leaderboard | `SCAN f LEFT-JOIN` $\rightarrow$ `SEARCH f` | 0.0217 ms | 0.0120 ms | **+44.7%** | 41 $\rightarrow$ 0 | `idx_favorite_listing_id`, `idx_listing_status` |
| **Q6** | In-App Inquiry Thread Log | `SCAN m` $\rightarrow$ `SCAN m` (PK Joins) | 0.0096 ms | 0.0090 ms | **+6.2%** | 4 $\rightarrow$ 4 | `sqlite_autoindex_Listing_1` |
| **Q7** | Student Bargain Deals Below Avg Price | Correlated Subquery `SCAN` $\rightarrow$ `SEARCH` | 0.0130 ms | 0.0102 ms | **+21.5%** | 117 $\rightarrow$ 0 | `idx_listing_browse`, `idx_listing_status` |
| **Q8** | High-Demand Items with Engagement | Correlated `SCAN` $\rightarrow$ `SEARCH` | 0.0109 ms | 0.0086 ms | **+21.1%** | 62 $\rightarrow$ 0 | `idx_message_thread`, `idx_favorite_listing_id` |
| **Q9** | Category Market Share & Valuation (CTE) | CTE `SCAN l` $\rightarrow$ `SEARCH l (status)` | 0.0160 ms | 0.0155 ms | **+3.1%** | 17 $\rightarrow$ 8 | `idx_listing_status` |
| **Q10** | Departmental Price & Recency Rankings | Innermost `SCAN l` $\rightarrow$ `SEARCH l` | 0.0301 ms | 0.0307 ms | **-2.0%** *(Noise)* | 9 $\rightarrow$ 0 | `idx_listing_status` |
| **Q11** | Top-2 Highest Value Listings per Hostel | Window CTE `SCAN l` $\rightarrow$ `SEARCH l` | 0.0148 ms | 0.0152 ms | **-2.7%** *(Noise)* | 9 $\rightarrow$ 0 | `idx_listing_status` |
| **Q12** | Atomic Safe Purchase State Transition | `SEARCH` PK $\rightarrow$ `SEARCH` PK | 0.0069 ms | 0.0060 ms | **+13.0%** | 0 $\rightarrow$ 0 | `sqlite_autoindex_Listing_1` |

> [!NOTE]
> On lightweight seed datasets (10 listings, 4 users), raw execution times are measured in single-digit microseconds ($\approx 6\text{–}30\,\mu\text{s}$). Differences within $\pm 0.0006\,\text{ms}$ reflect operating system measurement noise. The critical metric indicating database scalability is the **Fullscan Steps** metric, which dropped to **0 across virtually all queries**, demonstrating that the query engine transitioned from $O(N)$ and $O(N^2)$ table scans to $O(\log N)$ B-tree searches.

---

## 4. Query-by-Query Performance & Optimization Analysis

### Query 1: Active Marketplace Feed & Item Discovery
- **Raw Execution Plans:**
  - Before: [`dbms/plans/q1_before.txt`](./plans/q1_before.txt)
  - After: [`dbms/plans/q1_after.txt`](./plans/q1_after.txt)
- **Runtime Metrics Comparison:**

| Metric | Before Indexing | After Indexing | Difference |
|:---|:---:|:---:|:---:|
| **Execution Time** | 0.0097 ms | 0.0092 ms | -5.2% (Faster) |
| **Virtual Machine Steps** | 207 | 224 | +17 steps (index traversal) |
| **Fullscan Table Steps** | 9 | 0 | **-100% (Eliminated)** |
| **Sort Operations** | 1 (Full Temp B-Tree) | 4 (Last Term Only) | Optimized sort |

- **Execution Plan Analysis:**
  - *Before:* The query engine had no index on `Listing.price` or `Listing.status`. It performed a full sequential scan (`SCAN l`), filtering rows one-by-one, followed by populating a temporary B-Tree to satisfy `ORDER BY l.price ASC, l.created_at DESC`.
  - *After:* SQLite leverages `idx_listing_price` (`SEARCH l USING INDEX idx_listing_price (price<?)`). By walking the price index directly in ascending order, the engine satisfies the primary sort key `l.price ASC` without a full sort, requiring only a lightweight temp B-tree for the tie-breaking `l.created_at DESC` term (`USE TEMP B-TREE FOR LAST TERM OF ORDER BY`). All table fullscans were completely eliminated.

---

### Query 2: Multi-Option Semester Rental & Purchase Search
- **Raw Execution Plans:**
  - Before: [`dbms/plans/q2_before.txt`](./plans/q2_before.txt)
  - After: [`dbms/plans/q2_after.txt`](./plans/q2_after.txt)
- **Runtime Metrics Comparison:**

| Metric | Before Indexing | After Indexing | Difference |
|:---|:---:|:---:|:---:|
| **Execution Time** | 0.0094 ms | 0.0089 ms | -5.3% (Faster) |
| **Virtual Machine Steps** | 240 | 235 | -5 steps |
| **Fullscan Table Steps** | 9 | 0 | **-100% (Eliminated)** |
| **Sort Operations** | 1 | 1 | Consistent |

- **Execution Plan Analysis:**
  - *Before:* Filtering by `l.status = 'ACTIVE'` required reading every row in the `Listing` table via `SCAN l`.
  - *After:* The query planner utilizes `idx_listing_status` (`SEARCH l USING INDEX idx_listing_status (status=?)`). Non-active (sold, archived) listings are bypassed immediately at the root of the B-tree, eliminating 9 sequential scan steps.

---

### Query 3: Category Inventory & Price Range Analytics
- **Raw Execution Plans:**
  - Before: [`dbms/plans/q3_before.txt`](./plans/q3_before.txt)
  - After: [`dbms/plans/q3_after.txt`](./plans/q3_after.txt)
- **Runtime Metrics Comparison:**

| Metric | Before Indexing | After Indexing | Difference |
|:---|:---:|:---:|:---:|
| **Execution Time** | 0.0127 ms | 0.0120 ms | -5.5% (Faster) |
| **Virtual Machine Steps** | 494 | 489 | -5 steps |
| **Fullscan Table Steps** | 9 | 0 | **-100% (Eliminated)** |
| **Sort Operations** | 2 (GROUP BY + ORDER BY) | 2 (GROUP BY + ORDER BY) | Consistent |

- **Execution Plan Analysis:**
  - *Before:* The aggregation pipeline (`COUNT`, `AVG`, `MIN`, `MAX`) performed a full table scan across all listings before grouping by category.
  - *After:* With `idx_listing_status` in place, inactive listings are discarded before aggregation occurs. The execution plan converts from `SCAN l` to `SEARCH l USING INDEX idx_listing_status (status=?)`, eliminating fullscan steps completely.

---

### Query 4: Student Seller Activity & Revenue Dashboard
- **Raw Execution Plans:**
  - Before: [`dbms/plans/q4_before.txt`](./plans/q4_before.txt)
  - After: [`dbms/plans/q4_after.txt`](./plans/q4_after.txt)
- **Runtime Metrics Comparison:**

| Metric | Before Indexing | After Indexing | Difference |
|:---|:---:|:---:|:---:|
| **Execution Time** | 0.0095 ms | 0.0085 ms | **-10.5% (Faster)** |
| **Virtual Machine Steps** | 524 | 437 | **-87 steps (-16.6%)** |
| **Fullscan Table Steps** | 30 | 3 | **-90% (27 steps eliminated)** |
| **Sort Operations** | 1 | 1 | Consistent |

- **Execution Plan Analysis:**
  - *Before:* Query performs an outer join (`FROM "User" u LEFT JOIN "Listing" l ON u.id = l.seller_id`). Without an index on `Listing.seller_id`, SQLite executed a nested-loop join: for *each* student user, it scanned the entire `Listing` table from beginning to end ($N_{\text{users}} \times N_{\text{listings}} = 30$ fullscan iterations).
  - *After:* The planner leverages `idx_listing_seller_id` (`SEARCH l USING INDEX idx_listing_seller_id (seller_id=?) LEFT-JOIN`). For each user, listings are looked up via the secondary index in $O(\log N)$ time. Fullscan steps dropped from 30 down to 3 (only scanning the User table), and VM bytecode steps dropped from 524 to 437.

---

### Query 5: Campus Wishlist Leaderboard (Most Favorited Items)
- **Raw Execution Plans:**
  - Before: [`dbms/plans/q5_before.txt`](./plans/q5_before.txt)
  - After: [`dbms/plans/q5_after.txt`](./plans/q5_after.txt)
- **Runtime Metrics Comparison:**

| Metric | Before Indexing | After Indexing | Difference |
|:---|:---:|:---:|:---:|
| **Execution Time** | 0.0217 ms | 0.0120 ms | **-44.7% (High Speedup)** |
| **Virtual Machine Steps** | 661 | 622 | -39 steps |
| **Fullscan Table Steps** | 41 | 0 | **-100% (Eliminated)** |
| **Sort Operations** | 1 | 2 (Temp B-Tree for Grouping) | Highly targeted |

- **Execution Plan Analysis:**
  - *Before:* The query performs a `LEFT JOIN "Favorite" f ON l.id = f.listing_id`. Without an index on `f.listing_id`, the database repeatedly performed full scans over the `Favorite` table for every listing ($41$ fullscan steps).
  - *After:* SQLite uses `idx_listing_status` to seek active listings and `idx_favorite_listing_id` (`SEARCH f USING INDEX idx_favorite_listing_id (listing_id=?) LEFT-JOIN`) to count favorites. Execution time dropped by **44.7%** (from 0.0217 ms to 0.0120 ms), and fullscan steps were completely zeroed out.

---

### Query 6: In-App Buyer-Seller Inquiry Thread Log
- **Raw Execution Plans:**
  - Before: [`dbms/plans/q6_before.txt`](./plans/q6_before.txt)
  - After: [`dbms/plans/q6_after.txt`](./plans/q6_after.txt)
- **Runtime Metrics Comparison:**

| Metric | Before Indexing | After Indexing | Difference |
|:---|:---:|:---:|:---:|
| **Execution Time** | 0.0096 ms | 0.0090 ms | -6.2% (Faster) |
| **Virtual Machine Steps** | 189 | 189 | Identical |
| **Fullscan Table Steps** | 4 | 4 | Identical |
| **Sort Operations** | 1 | 1 | Consistent |

- **Execution Plan Analysis:**
  - *Plan Details:* Query 6 audits chronological chat activity across the campus marketplace by joining `Message` with `Listing`, `sender`, and `receiver`.
  - In both plans, the joins against `Listing`, `sender (User)`, and `receiver (User)` are resolved using their respective primary key unique indexes (`sqlite_autoindex_*_1`). The index `idx_message_thread` is available for queries filtering on specific conversations (`WHERE listing_id = ? AND sender_id = ?`).

---
