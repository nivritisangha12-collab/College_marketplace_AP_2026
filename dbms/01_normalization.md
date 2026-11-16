# Database Normalization – College Marketplace

## 1. Introduction

College Marketplace is a web-based platform designed exclusively for college students to buy, sell, and rent products within their campus community.

The application uses MySQL as its database management system. Database normalization is performed to organize data efficiently, reduce redundancy, prevent insertion, deletion, and update anomalies, and maintain data consistency.

The database is designed up to Third Normal Form (3NF). Boyce-Codd Normal Form (BCNF) is also discussed.

## 2. Proposed Database Entities

The database consists of the following entities:

1. **Users:** Stores student account information.
2. **Categories:** Stores product categories.
3. **Listings:** Stores products listed for sale or rent.
4. **Favorites:** Stores products saved by users.
5. **Messages:** Stores communication between interested students and listing owners.
6. **ListingImages:** Stores images associated with product listings.

Rental booking records are not maintained because rental arrangements are handled manually through communication between students.

## 3. First Normal Form (1NF)

A relation is in First Normal Form when:

- Every column contains atomic (single) values.
- Each record is uniquely identifiable.
- There are no repeating groups or multivalued attributes.

### Before 1NF

Consider the following unnormalized marketplace relation:

| User ID | User Name | Products |
|---|---|---|
| 1 | Ankur | Laptop, Cycle |
| 2 | Nivriti | Books, Calculator |

The Products column contains multiple values, violating 1NF.

### Conversion to 1NF

Each product is represented as a separate listing.

| User ID | User Name | Listing ID | Product |
|---|---|---|---|
| 1 | Ankur | 101 | Laptop |
| 1 | Ankur | 102 | Cycle |
| 2 | Nivriti | 103 | Books |
| 2 | Nivriti | 104 | Calculator |

Now each attribute contains a single atomic value.

The proposed database also maintains atomic attributes. Multiple product images are stored separately in ListingImages rather than as comma-separated values in Listings.

**Result:** The database satisfies 1NF.

## 4. Second Normal Form (2NF)

A relation is in Second Normal Form when:

- It is already in 1NF.
- Every non-key attribute is fully functionally dependent on the entire candidate key.
- There are no partial dependencies on a part of a composite key.

### Example: Favorites Table

Consider the following relation:

Favorites(User_ID, Listing_ID, User_Name, Product_Name, Saved_At)

The composite primary key is:

(User_ID, Listing_ID)

Functional dependencies:

- User_ID → User_Name
- Listing_ID → Product_Name
- (User_ID, Listing_ID) → Saved_At

Here, User_Name depends only on User_ID, and Product_Name depends only on Listing_ID.

These are partial dependencies, so the relation violates 2NF.

### Conversion to 2NF

Decompose the relation into:

**Users**

(User_ID, User_Name)

**Listings**

(Listing_ID, Product_Name)

**Favorites**

(User_ID, Listing_ID, Saved_At)

Now, Saved_At depends on the complete composite key (User_ID, Listing_ID).

The partial dependencies have been removed.

**Result:** The database satisfies 2NF.

## 5. Third Normal Form (3NF)

A relation is in Third Normal Form when:

- It is already in 2NF.
- It has no transitive dependencies of non-key attributes on candidate keys.
- Every non-key attribute depends directly on a candidate key.

### Example: Listings and Categories

Consider the following relation:

Listings(Listing_ID, Product_Name, Category_ID, Category_Name)

Functional dependencies:

- Listing_ID → Product_Name, Category_ID
- Category_ID → Category_Name

Therefore:

Listing_ID → Category_ID → Category_Name

Category_Name is transitively dependent on Listing_ID.

This creates unnecessary duplication when multiple products belong to the same category.

### Conversion to 3NF

Decompose the relation into:

**Categories**

- Category_ID (Primary Key)
- Category_Name

**Listings**

- Listing_ID (Primary Key)
- Product_Name
- Category_ID (Foreign Key)

Now Category_Name is stored only once in Categories.

Listings references the category through Category_ID.

Similarly, user account information is maintained separately in Users, and communication records reference users through their IDs.

**Result:** The database satisfies 3NF.

## 6. Proposed Normalized Database Schema

### 1. Users

| Attribute | Description |
|---|---|
| user_id (PK) | Unique student ID |
| name | Student name |
| email | Student email (Unique) |
| password_hash | Securely hashed password |

### 2. Categories

| Attribute | Description |
|---|---|
| category_id (PK) | Unique category ID |
| category_name | Category name (Unique) |

### 3. Listings

| Attribute | Description |
|---|---|
| listing_id (PK) | Unique listing ID |
| owner_id (FK) | References Users |
| category_id (FK) | References Categories |
| title | Product title |
| description | Product description |
| listing_type | SALE or RENT |
| sale_price | Selling price |
| rent_price | Rental price |
| rent_period | Rental pricing period |
| availability_status | Available, Sold or Unavailable |
| created_at | Listing creation timestamp |

Sale listings use sale_price, while rental listings use rent_price and rent_period.

**Additional Constraints:**

- owner_id must reference an existing user.
- category_id must reference an existing category.
- listing_type must be either SALE or RENT.
- sale_price must be provided for SALE listings.
- rent_price and rent_period must be provided for RENT listings.
- Prices must be non-negative.
- availability_status must contain a valid status such as Available, Sold or Unavailable.

### 4. Favorites

| Attribute | Description |
|---|---|
| user_id (PK, FK) | References Users |
| listing_id (PK, FK) | References Listings |
| saved_at | Date and time saved |

**Composite Primary Key:** (user_id, listing_id)

### 5. Messages

| Attribute | Description |
|---|---|
| message_id (PK) | Unique message ID |
| listing_id (FK) | References Listings |
| sender_id (FK) | References Users |
| message_text | Message content |
| sent_at | Message timestamp |

The receiver of a message is always the owner of the associated listing. Therefore, receiver_id is not stored separately.

The receiver can be identified by joining Messages with Listings using listing_id and retrieving the corresponding owner_id.

This avoids storing redundant information and maintains data consistency.

### 6. ListingImages

| Attribute | Description |
|---|---|
| image_id (PK) | Unique image ID |
| listing_id (FK) | References Listings |
| image_url | Product image location |

## 7. Boyce-Codd Normal Form (BCNF)

A relation is in BCNF when, for every non-trivial functional dependency:

X → Y

X must be a superkey.

In the proposed database design:

- Users are identified by user_id.
- Categories are identified by category_id.
- Listings are identified by listing_id.
- Favorites are identified by the composite key (user_id, listing_id).
- Messages are identified by message_id.
- ListingImages are identified by image_id.

Assuming the stated primary and unique key constraints, and no additional functional dependencies with non-superkey determinants, every determinant in the proposed relations is a candidate key or superkey.

Therefore, the proposed relations satisfy BCNF under these assumptions.

## 8. Advantages of Normalization

Normalization provides the following advantages:

1. Reduces unnecessary data duplication.
2. Prevents insertion, deletion, and update anomalies.
3. Maintains consistency of student and product information.
4. Improves database organization.
5. Establishes clear relationships between database entities.
6. Makes database maintenance and future modifications easier.

## 9. Conclusion

The College Marketplace database is designed using normalization principles up to 3NF, with BCNF also considered.

Separate tables for Users, Categories, Listings, Favorites, Messages, and ListingImages help organize the application's data efficiently.

Primary keys and foreign keys maintain relationships between entities, while normalization minimizes redundancy and improves data integrity.

This database structure provides a foundation for the College Marketplace application and supports its buying, selling, and rental listing functionality.