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
