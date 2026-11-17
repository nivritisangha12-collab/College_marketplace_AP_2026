-- ============================================================================
-- CollegeXchange: Campus Student Marketplace (AP 2026 / DBMS Capstone)
-- Relational Database DDL Schema
-- File: dbms/03_schema.sql
-- Compatible With: PostgreSQL / SQLite / MySQL (ANSI SQL Standard)
-- Corresponds 1-to-1 with: dbms/02_er_diagram.mmd & prisma/schema.prisma
-- ============================================================================

-- Enable Foreign Key Enforcement (SQLite specific directive; ignored by PostgreSQL/MySQL)
PRAGMA foreign_keys = ON;

-- ============================================================================
-- 1. Table: "User"
-- Role: Represents campus student accounts and platform administrators.
-- Contains identity, academic affiliation, hostel residence, and contact info.
-- Normalization: 3NF / BCNF (Determinants: id, email)
-- ============================================================================
CREATE TABLE IF NOT EXISTS "User" (
    "id"          VARCHAR(36)  NOT NULL,
    "name"        VARCHAR(150) NOT NULL,
    "email"       VARCHAR(255) NOT NULL,
    "role"        VARCHAR(20)  NOT NULL DEFAULT 'STUDENT',
    "department"  VARCHAR(100),
    "year"        VARCHAR(20),
    "hostel"      VARCHAR(50),
    "phone"       VARCHAR(20),
    "created_at"  TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "pk_user" PRIMARY KEY ("id"),
    CONSTRAINT "uq_user_email" UNIQUE ("email"),
    CONSTRAINT "chk_user_role" CHECK ("role" IN ('STUDENT', 'ADMIN'))
);

-- ============================================================================
-- 2. Table: "Category"
-- Role: Standardized marketplace item taxonomy (Books, Electronics, Hostel, etc.)
-- Enables structured browsing, filtering, and catalog discovery.
-- Normalization: 3NF / BCNF (Determinants: id, name, slug)
-- ============================================================================
CREATE TABLE IF NOT EXISTS "Category" (
    "id"          VARCHAR(36)  NOT NULL,
    "name"        VARCHAR(100) NOT NULL,
    "slug"        VARCHAR(100) NOT NULL,
    "description" TEXT,
    "created_at"  TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "pk_category" PRIMARY KEY ("id"),
    CONSTRAINT "uq_category_name" UNIQUE ("name"),
    CONSTRAINT "uq_category_slug" UNIQUE ("slug")
);

-- ============================================================================
-- 3. Table: "Listing"
-- Role: Central entity representing student listings for purchase or rent.
-- Connects a student seller with a category taxonomy and includes pricing,
-- item condition, campus pickup location, and lifecycle status.
-- Normalization: 3NF / BCNF (Determinant: id)
-- ============================================================================
CREATE TABLE IF NOT EXISTS "Listing" (
    "id"           VARCHAR(36)    NOT NULL,
    "seller_id"    VARCHAR(36)    NOT NULL,
    "category_id"  VARCHAR(36)    NOT NULL,
    "title"        VARCHAR(255)   NOT NULL,
    "description"  TEXT           NOT NULL,
    "price"        DECIMAL(10, 2) NOT NULL DEFAULT 0.00,
    "rent_price"   DECIMAL(10, 2) NOT NULL DEFAULT 0.00,
    "listing_type" VARCHAR(20)    NOT NULL DEFAULT 'BUY',
    "condition"    VARCHAR(20)    NOT NULL DEFAULT 'GOOD',
    "location"     VARCHAR(100)   NOT NULL,
    "status"       VARCHAR(20)    NOT NULL DEFAULT 'ACTIVE',
    "created_at"   TIMESTAMP      NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at"   TIMESTAMP      NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "pk_listing" PRIMARY KEY ("id"),
    CONSTRAINT "fk_listing_seller" FOREIGN KEY ("seller_id")
        REFERENCES "User" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "fk_listing_category" FOREIGN KEY ("category_id")
        REFERENCES "Category" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "chk_listing_price" CHECK ("price" >= 0.00),
    CONSTRAINT "chk_listing_rent_price" CHECK ("rent_price" >= 0.00),
    CONSTRAINT "chk_listing_type" CHECK ("listing_type" IN ('BUY', 'RENT', 'BOTH')),
    CONSTRAINT "chk_listing_condition" CHECK ("condition" IN ('NEW', 'LIKE_NEW', 'GOOD', 'FAIR', 'POOR')),
    CONSTRAINT "chk_listing_status" CHECK ("status" IN ('ACTIVE', 'SOLD', 'DELETED'))
);

-- ============================================================================
-- 4. Table: "ListingImage"
-- Role: Normalized 1:N media gallery storing image paths associated with listings.
-- Eliminates repeating group / multivalued array from the unnormalized schema.
-- Normalization: 3NF / BCNF (Determinant: id)
-- ============================================================================
CREATE TABLE IF NOT EXISTS "ListingImage" (
    "id"          VARCHAR(36)  NOT NULL,
    "listing_id"  VARCHAR(36)  NOT NULL,
    "image_path"  VARCHAR(255) NOT NULL,
    "created_at"  TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "pk_listing_image" PRIMARY KEY ("id"),
    CONSTRAINT "fk_listing_image_listing" FOREIGN KEY ("listing_id")
        REFERENCES "Listing" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- ============================================================================
-- 5. Table: "Favorite"
-- Role: Many-to-many junction entity tracking student saved wishlist items.
-- Enforces composite uniqueness to prevent duplicate saves by the same student.
-- Normalization: 3NF / BCNF (Determinants: id, (student_id, listing_id))
-- ============================================================================
CREATE TABLE IF NOT EXISTS "Favorite" (
    "id"          VARCHAR(36) NOT NULL,
    "student_id"  VARCHAR(36) NOT NULL,
    "listing_id"  VARCHAR(36) NOT NULL,
    "created_at"  TIMESTAMP   NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "pk_favorite" PRIMARY KEY ("id"),
    CONSTRAINT "uq_favorite_student_listing" UNIQUE ("student_id", "listing_id"),
    CONSTRAINT "fk_favorite_student" FOREIGN KEY ("student_id")
        REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "fk_favorite_listing" FOREIGN KEY ("listing_id")
        REFERENCES "Listing" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- ============================================================================
-- 6. Table: "Message"
-- Role: Direct buyer-seller chat messages anchored to a specific item listing.
-- Maintains relational links to sender, receiver, and item context.
-- Normalization: 3NF / BCNF (Determinant: id)
-- ============================================================================
CREATE TABLE IF NOT EXISTS "Message" (
    "id"          VARCHAR(36) NOT NULL,
    "listing_id"  VARCHAR(36) NOT NULL,
    "sender_id"   VARCHAR(36) NOT NULL,
    "receiver_id" VARCHAR(36) NOT NULL,
    "content"     TEXT        NOT NULL,
    "created_at"  TIMESTAMP   NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "pk_message" PRIMARY KEY ("id"),
    CONSTRAINT "fk_message_listing" FOREIGN KEY ("listing_id")
        REFERENCES "Listing" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "fk_message_sender" FOREIGN KEY ("sender_id")
        REFERENCES "User" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "fk_message_receiver" FOREIGN KEY ("receiver_id")
        REFERENCES "User" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- ============================================================================
-- Performance Indexes
-- Boost query execution speed for foreign key joins, filters, and sorting.
-- ============================================================================

-- User indexes
CREATE INDEX IF NOT EXISTS "idx_user_email" ON "User" ("email");
CREATE INDEX IF NOT EXISTS "idx_user_role" ON "User" ("role");

-- Category indexes
CREATE INDEX IF NOT EXISTS "idx_category_slug" ON "Category" ("slug");
CREATE INDEX IF NOT EXISTS "idx_category_name" ON "Category" ("name");

-- Listing indexes (filtering, searching, seller dashboard, pagination)
CREATE INDEX IF NOT EXISTS "idx_listing_seller_id" ON "Listing" ("seller_id");
CREATE INDEX IF NOT EXISTS "idx_listing_category_id" ON "Listing" ("category_id");
CREATE INDEX IF NOT EXISTS "idx_listing_status" ON "Listing" ("status");
CREATE INDEX IF NOT EXISTS "idx_listing_price" ON "Listing" ("price");
CREATE INDEX IF NOT EXISTS "idx_listing_created_at" ON "Listing" ("created_at" DESC);
CREATE INDEX IF NOT EXISTS "idx_listing_browse" ON "Listing" ("status", "category_id", "listing_type");

-- ListingImage indexes
CREATE INDEX IF NOT EXISTS "idx_listing_image_listing_id" ON "ListingImage" ("listing_id");

-- Favorite indexes
CREATE INDEX IF NOT EXISTS "idx_favorite_student_id" ON "Favorite" ("student_id");
CREATE INDEX IF NOT EXISTS "idx_favorite_listing_id" ON "Favorite" ("listing_id");

-- Message indexes (conversation threads & student inbox/outbox)
CREATE INDEX IF NOT EXISTS "idx_message_listing_id" ON "Message" ("listing_id");
CREATE INDEX IF NOT EXISTS "idx_message_sender_id" ON "Message" ("sender_id");
CREATE INDEX IF NOT EXISTS "idx_message_receiver_id" ON "Message" ("receiver_id");
CREATE INDEX IF NOT EXISTS "idx_message_thread" ON "Message" ("listing_id", "created_at" ASC);

-- ============================================================================
-- Convenience Views
-- Plural snake_case aliases for standard cross-platform SQL query convenience.
-- ============================================================================
CREATE VIEW IF NOT EXISTS "users" AS SELECT * FROM "User";
CREATE VIEW IF NOT EXISTS "categories" AS SELECT * FROM "Category";
CREATE VIEW IF NOT EXISTS "listings" AS SELECT * FROM "Listing";
CREATE VIEW IF NOT EXISTS "listing_images" AS SELECT * FROM "ListingImage";
CREATE VIEW IF NOT EXISTS "favorites" AS SELECT * FROM "Favorite";
CREATE VIEW IF NOT EXISTS "messages" AS SELECT * FROM "Message";
