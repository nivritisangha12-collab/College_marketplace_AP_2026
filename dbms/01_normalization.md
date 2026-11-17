# Relational Database Normalization: CollegeXchange

**Course:** Advanced Programming (AP) / Database Management Systems (DBMS)  
**Project:** CollegeXchange (Campus Student Marketplace)  
**Application Stack:** Node.js, Express, Prisma ORM, PostgreSQL / SQLite  
**Artifact:** `dbms/01_normalization.md` (Checkpoint 1 Submission)  

---

## 1. Domain Context & The Initial Unnormalized Data (UNF)

### 1.1 Application Overview
**CollegeXchange** is an on-campus peer-to-peer student marketplace enabling university students to buy, sell, and rent textbooks, scientific calculators, laboratory equipment, cycles, and hostel furniture within their campus community. 

Key business features include:
1. **User Profiles:** Student authentication, campus identity (email, roll number/ID), department, academic year, hostel block, and contact phone.
2. **Category Taxonomy:** Standardized marketplace categories (e.g., *Books & Notes*, *Lab Equipment*, *Electronics*, *Cycles*, *Hostel Essentials*).
3. **Item Listings:** Student-created listings specifying title, description, purchase price, optional rental price, condition (*NEW*, *LIKE_NEW*, *GOOD*, *FAIR*, *POOR*), campus pickup location, and lifecycle status (*ACTIVE*, *SOLD*, *DELETED*).
4. **Media Galleries:** Multiple image attachments per listing.
5. **Saved Favorites (Wishlist):** Students bookmarking listings for quick access.
6. **In-App Messaging:** Direct contextual chat between buyers and sellers anchored to specific item listings.

---

### 1.2 Unnormalized Form (UNF) Representation
In a pre-relational or denormalized document format (such as an unstructured spreadsheet, single JSON document, or legacy flat file), an exchange record contains multi-valued attributes, nested records, and repeating groups:

$$\begin{aligned}
\text{UNF\_MARKETPLACE\_RECORD} = \{ & \text{ListingID}, \text{Title}, \text{Description}, \text{Price}, \text{RentPrice}, \text{ListingType}, \\
& \text{Condition}, \text{Location}, \text{Status}, \text{ListingCreatedAt}, \\
& \text{CategoryID}, \text{CategoryName}, \text{CategorySlug}, \text{CategoryDesc}, \\
& \text{SellerID}, \text{SellerName}, \text{SellerEmail}, \text{SellerPhone}, \text{SellerDept}, \text{SellerYear}, \text{SellerHostel}, \\
& \{\text{ImagePath}\}^*, \\
& \{\text{StudentID\_Fav}, \text{StudentName\_Fav}, \text{FavoritedAt}\}^*, \\
& \{\text{MessageID}, \text{SenderID}, \text{SenderName}, \text{ReceiverID}, \text{ReceiverName}, \text{Content}, \text{SentAt}\}^* \}
\end{aligned}$$

#### Sample Unnormalized Record
```
ListingID:         L-101
Title:             "Engineering Mechanics (Hibbeler 14th Ed)"
Description:       "Clean copy with minimal pencil markings"
Price:             ₹450.00
RentPrice:         ₹100.00 / sem
ListingType:       "BOTH"
Condition:         "GOOD"
Location:          "Block-C Common Room"
Status:            "ACTIVE"
Category:          { ID: "C-01", Name: "Books & Notes", Slug: "books-notes", Desc: "Academic textbooks" }
Seller:            { ID: "U-11", Name: "Ankur Agarwal", Email: "ankur@univ.edu", Phone: "9876543210", 
                     Dept: "Mechanical", Year: "2nd Year", Hostel: "H-4" }
Images:            [ "/uploads/mech1.jpg", "/uploads/mech2.jpg" ]
Favorites:         [ 
                     { StudentID: "U-22", Name: "Nivriti", FavoritedAt: "2026-10-12 14:20" },
                     { StudentID: "U-33", Name: "Sairam", FavoritedAt: "2026-10-13 09:15" }
                   ]
Messages:          [
                     { MsgID: "M-01", Sender: "U-22 (Nivriti)", Receiver: "U-11 (Ankur)", 
                       Content: "Is this still available for rent?", SentAt: "2026-10-12 15:00" },
                     { MsgID: "M-02", Sender: "U-11 (Ankur)", Receiver: "U-22 (Nivriti)", 
                       Content: "Yes, available at H-4 block", SentAt: "2026-10-12 15:05" }
                   ]
```

### 1.3 Anomalies Inherent in the Unnormalized Structure

1. **Insertion Anomalies:**
   - A newly admitted student cannot register or create an account until they publish a listing or post a message.
   - An administrator cannot create a new category (e.g., "Sports Equipment") without simultaneously creating a dummy listing attached to a dummy student.
2. **Update / Modification Anomalies:**
   - If seller `U-11` changes their phone number or shifts from hostel `H-4` to `H-7`, every listing, message, and favorite record containing their profile information must be identified and updated. If any record is missed, the database enters an inconsistent state.
   - If a category description changes, it must be updated across hundreds of individual listing rows.
3. **Deletion Anomalies:**
   - If listing `L-101` is deleted (e.g., after the item is sold), all associated conversation history between buyer `U-22` and seller `U-11` is lost.
   - If that listing was the only item under category "Books & Notes", the entire category definition is unintentionally erased from the system.

---

## 2. First Normal Form (1NF)

### 2.1 Formal Definition of 1NF
A relation $R$ is in **First Normal Form (1NF)** if and only if:
1. Every attribute domain contains only **atomic (indivisible)** values.
2. There are **no repeating groups** or multi-valued arrays.
3. Each record possesses a well-defined unique identifier (**Primary Key**).

### 2.2 Transition from UNF to 1NF
To achieve 1NF:
1. Eliminate repeating groups by separating multi-valued collections (`Images`, `Favorites`, `Messages`) into distinct preliminary relations.
2. Ensure all fields (names, timestamps, numeric prices) contain atomic values.

#### Decomposed 1NF Relational Schemas:

1. **`1NF_LISTING`**
   ```
   (listing_id [PK], seller_id, seller_name, seller_email, seller_phone, seller_dept, seller_year, seller_hostel,
    category_id, category_name, category_slug, category_description,
    title, description, price, rent_price, listing_type, condition, location, status, created_at, updated_at)
   ```
   - Primary Key: `listing_id`
   - All repeating attributes (`Images`, `Favorites`, `Messages`) extracted.

2. **`1NF_LISTING_IMAGE`**
   ```
   (listing_id, image_path, created_at)
   ```
   - Primary Key: `(listing_id, image_path)`

3. **`1NF_FAVORITE`**
   ```
   (listing_id, student_id, student_name, student_email, created_at)
   ```
   - Primary Key: `(listing_id, student_id)`

4. **`1NF_MESSAGE`**
   ```
   (message_id [PK], listing_id, sender_id, sender_name, receiver_id, receiver_name, content, created_at)
   ```
   - Primary Key: `message_id`

### 2.3 Functional Dependencies in 1NF Relations

- **In `1NF_LISTING`:**
  - $FD_1$: `listing_id` $\to$ `seller_id`, `category_id`, `title`, `description`, `price`, `rent_price`, `listing_type`, `condition`, `location`, `status`, `created_at`, `updated_at`, `seller_name`, `seller_email`, `seller_phone`, `seller_dept`, `seller_year`, `seller_hostel`, `category_name`, `category_slug`, `category_description`
  - $FD_2$: `seller_id` $\to$ `seller_name`, `seller_email`, `seller_phone`, `seller_dept`, `seller_year`, `seller_hostel`
  - $FD_3$: `seller_email` $\to$ `seller_id`, `seller_name`, `seller_phone`, `seller_dept`, `seller_year`, `seller_hostel`
  - $FD_4$: `category_id` $\to$ `category_name`, `category_slug`, `category_description`
  - $FD_5$: `category_slug` $\to$ `category_id`, `category_name`, `category_description`

- **In `1NF_FAVORITE`:**
  - $FD_6$: `{listing_id, student_id}` $\to$ `created_at`
  - $FD_7$: `student_id` $\to$ `student_name`, `student_email` *(Partial Dependency on composite key!)*

- **In `1NF_MESSAGE`:**
  - $FD_8$: `message_id` $\to$ `listing_id`, `sender_id`, `receiver_id`, `content`, `created_at`
  - $FD_9$: `sender_id` $\to$ `sender_name`
  - $FD_{10}$: `receiver_id` $\to$ `receiver_name`

### 2.4 Status of 1NF & Remaining Anomalies
While 1NF eliminates repeating groups, severe issues remain:
- **Partial Dependencies in Composite-Key Tables:** In `1NF_FAVORITE`, non-prime attributes `student_name` and `student_email` depend solely on `student_id`, which is only part of the composite primary key `(listing_id, student_id)`.
- **Transitive Dependencies:** In `1NF_LISTING`, non-prime attributes like `seller_name` and `category_name` depend on `seller_id` and `category_id`, which in turn depend on `listing_id`.

---

## 3. Second Normal Form (2NF)

### 3.1 Formal Definition of 2NF
A relation $R$ is in **Second Normal Form (2NF)** if and only if:
1. $R$ is in **1NF**.
2. No non-prime attribute is **partially functionally dependent** on any candidate key of $R$.
*(Every non-prime attribute must depend on the whole candidate key, not a proper subset).*

> **Note:** If a relation in 1NF has a single-attribute primary key, it is automatically in 2NF regarding partial dependencies. Thus, `1NF_LISTING` and `1NF_MESSAGE` are technically in 2NF, but composite-key relations like `1NF_FAVORITE` violate 2NF.

### 3.2 Identifying and Resolving Partial Dependencies

In `1NF_FAVORITE(listing_id, student_id, student_name, student_email, created_at)`:
- Primary Key: `(listing_id, student_id)`
- Dependency $FD_7$: `student_id` $\to$ `student_name`, `student_email`.
- `student_name` and `student_email` are determined by a proper subset (`student_id`) of the candidate key `{listing_id, student_id}`.
- **Violation:** Partial dependency!
- **Resolution:** Extract student attributes into a dedicated student/user relation, leaving only the foreign keys in the favorite table:
  - `FAVORITE(student_id, listing_id, created_at)`
  - `STUDENT_USER(student_id, name, email, ...)`

In `1NF_LISTING_IMAGE(listing_id, image_path, created_at)`:
- Primary Key: `(listing_id, image_path)`
- Dependency: `{listing_id, image_path}` $\to$ `created_at`.
- There are no non-prime attributes depending on only `listing_id` or only `image_path`.
- **Status:** Already satisfies 2NF. To facilitate standard ORM entity referencing, introduce a surrogate UUID `id`.

### 3.3 Decomposed 2NF Relations

1. **`2NF_LISTING`**
   ```
   (listing_id [PK], seller_id, seller_name, seller_email, seller_phone, seller_dept, seller_year, seller_hostel,
    category_id, category_name, category_slug, category_description,
    title, description, price, rent_price, listing_type, condition, location, status, created_at, updated_at)
   ```
2. **`2NF_LISTING_IMAGE`**
   ```
   (image_id [PK], listing_id [FK], image_path, created_at)
   ```
3. **`2NF_FAVORITE`**
   ```
   (favorite_id [PK], student_id [FK], listing_id [FK], created_at)
   [Candidate Key: (student_id, listing_id)]
   ```
4. **`2NF_MESSAGE`**
   ```
   (message_id [PK], listing_id [FK], sender_id [FK], sender_name, receiver_id [FK], receiver_name, content, created_at)
   ```
5. **`2NF_STUDENT_PARTIAL`**
   ```
   (student_id [PK], student_name, student_email)
   ```

### 3.4 Remaining Anomalies in 2NF
`2NF_LISTING` still suffers from **transitive dependencies**:
- `listing_id` $\to$ `seller_id` $\to$ `{seller_name, seller_email, seller_phone, seller_dept, seller_year, seller_hostel}`
- `listing_id` $\to$ `category_id` $\to$ `{category_name, category_slug, category_description}`

Updating seller details or category descriptions still triggers update anomalies in `2NF_LISTING`.

---

## 4. Third Normal Form (3NF)

### 4.1 Formal Definition of 3NF
A relation $R$ is in **Third Normal Form (3NF)** if and only if:
1. $R$ is in **2NF**.
2. For every non-trivial functional dependency $X \to A$ in $R$:
   - Either $X$ is a **superkey** of $R$, OR
   - $A$ is a **prime attribute** (a member of some candidate key of $R$).

*(Informally: "Every non-key attribute must provide a fact about the key, the whole key, and nothing but the key").*

### 4.2 Identifying and Resolving Transitive Dependencies

#### A. Transitive Dependencies in `2NF_LISTING`
1. **Seller Transitive Chain:**
   $$\text{listing\_id} \longrightarrow \text{seller\_id} \quad \text{and} \quad \text{seller\_id} \longrightarrow \{\text{name}, \text{email}, \text{phone}, \text{department}, \text{year}, \text{hostel}\}$$
   - Here, `seller_id` is NOT a superkey of `2NF_LISTING`.
   - The attributes `{name, email, ...}` are non-prime.
   - **Resolution:** Decompose and extract into `User` relation.
2. **Category Transitive Chain:**
   $$\text{listing\_id} \longrightarrow \text{category\_id} \quad \text{and} \quad \text{category\_id} \longrightarrow \{\text{name}, \text{slug}, \text{description}\}$$
   - Here, `category_id` is NOT a superkey of `2NF_LISTING`.
   - The attributes `{name, slug, description}` are non-prime.
   - **Resolution:** Decompose and extract into `Category` relation.

#### B. Transitive Dependencies in `2NF_MESSAGE`
$$\text{message\_id} \longrightarrow \text{sender\_id} \longrightarrow \text{sender\_name}$$
$$\text{message\_id} \longrightarrow \text{receiver\_id} \longrightarrow \text{receiver\_name}$$
- **Resolution:** Sender and receiver names are removed from `Message`; `sender_id` and `receiver_id` become foreign keys pointing to `User(id)`.

---

### 4.3 Final 3NF Relational Schemas

#### 1. `User` (Student Accounts & Profiles)
```sql
User (
    id          VARCHAR(36) PRIMARY KEY,       -- UUID
    name        VARCHAR(150) NOT NULL,
    email       VARCHAR(255) NOT NULL UNIQUE,
    role        VARCHAR(20) NOT NULL DEFAULT 'STUDENT', -- STUDENT | ADMIN
    department  VARCHAR(100),
    year        VARCHAR(20),
    hostel      VARCHAR(50),
    phone       VARCHAR(20),
    created_at  TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);
```
- **Candidate Keys:** `{id}`, `{email}`
- **Functional Dependencies:**
  - `id` $\to$ `name`, `email`, `role`, `department`, `year`, `hostel`, `phone`, `created_at`
  - `email` $\to$ `id`, `name`, `role`, `department`, `year`, `hostel`, `phone`, `created_at`
- **Validation:** Every determinant is a candidate key. No transitive dependencies.

#### 2. `Category` (Marketplace Item Taxonomy)
```sql
Category (
    id          VARCHAR(36) PRIMARY KEY,       -- UUID
    name        VARCHAR(100) NOT NULL UNIQUE,
    slug        VARCHAR(100) NOT NULL UNIQUE,
    description TEXT,
    created_at  TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);
```
- **Candidate Keys:** `{id}`, `{name}`, `{slug}`
- **Functional Dependencies:**
  - `id` $\to$ `name`, `slug`, `description`, `created_at`
  - `slug` $\to$ `id`, `name`, `description`, `created_at`
  - `name` $\to$ `id`, `slug`, `description`, `created_at`
- **Validation:** Every determinant is a candidate key. No transitive dependencies.

#### 3. `Listing` (Item Marketplace Posts)
```sql
Listing (
    id           VARCHAR(36) PRIMARY KEY,      -- UUID
    seller_id    VARCHAR(36) NOT NULL REFERENCES User(id) ON DELETE RESTRICT,
    category_id  VARCHAR(36) NOT NULL REFERENCES Category(id) ON DELETE RESTRICT,
    title        VARCHAR(255) NOT NULL,
    description  TEXT NOT NULL,
    price        DECIMAL(10, 2) NOT NULL DEFAULT 0.00,
    rent_price   DECIMAL(10, 2) NOT NULL DEFAULT 0.00,
    listing_type VARCHAR(20) NOT NULL DEFAULT 'BUY', -- BUY | RENT | BOTH
    condition    VARCHAR(20) NOT NULL DEFAULT 'GOOD', -- NEW | LIKE_NEW | GOOD | FAIR | POOR
    location     VARCHAR(100) NOT NULL,
    status       VARCHAR(20) NOT NULL DEFAULT 'ACTIVE', -- ACTIVE | SOLD | DELETED
    created_at   TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at   TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);
```
- **Candidate Key:** `{id}`
- **Functional Dependencies:**
  - `id` $\to$ `seller_id`, `category_id`, `title`, `description`, `price`, `rent_price`, `listing_type`, `condition`, `location`, `status`, `created_at`, `updated_at`
- **Validation:** All non-prime attributes depend strictly and directly on the primary key `id`.

#### 4. `ListingImage` (Item Media Gallery)
```sql
ListingImage (
    id          VARCHAR(36) PRIMARY KEY,      -- UUID
    listing_id  VARCHAR(36) NOT NULL REFERENCES Listing(id) ON DELETE CASCADE,
    image_path  VARCHAR(255) NOT NULL,
    created_at  TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);
```
- **Candidate Key:** `{id}`
- **Functional Dependencies:**
  - `id` $\to$ `listing_id`, `image_path`, `created_at`
- **Validation:** Strictly in 3NF.

#### 5. `Favorite` (Saved Wishlist Items)
```sql
Favorite (
    id          VARCHAR(36) PRIMARY KEY,      -- UUID
    student_id  VARCHAR(36) NOT NULL REFERENCES User(id) ON DELETE CASCADE,
    listing_id  VARCHAR(36) NOT NULL REFERENCES Listing(id) ON DELETE CASCADE,
    created_at  TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT uq_student_listing UNIQUE (student_id, listing_id)
);
```
- **Candidate Keys:** `{id}`, `{(student_id, listing_id)}`
- **Functional Dependencies:**
  - `id` $\to$ `student_id`, `listing_id`, `created_at`
  - `{student_id, listing_id}` $\to$ `id`, `created_at`
- **Validation:** All determinants are candidate keys.

#### 6. `Message` (Direct Buyer-Seller Chat Log)
```sql
Message (
    id          VARCHAR(36) PRIMARY KEY,      -- UUID
    listing_id  VARCHAR(36) NOT NULL REFERENCES Listing(id) ON DELETE CASCADE,
    sender_id   VARCHAR(36) NOT NULL REFERENCES User(id) ON DELETE RESTRICT,
    receiver_id VARCHAR(36) NOT NULL REFERENCES User(id) ON DELETE RESTRICT,
    content     TEXT NOT NULL,
    created_at  TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);
```
- **Candidate Key:** `{id}`
- **Functional Dependencies:**
  - `id` $\to$ `listing_id`, `sender_id`, `receiver_id`, `content`, `created_at`
- **Validation:** Strictly in 3NF.

---

## 5. Boyce-Codd Normal Form (BCNF) Analysis

### 5.1 Formal Definition of BCNF
A relation $R$ is in **Boyce-Codd Normal Form (BCNF)** if and only if for every non-trivial functional dependency $X \to Y$:
- $X$ is a **superkey** of $R$.

BCNF is a stricter version of 3NF. 3NF permits $X \to A$ where $X$ is not a superkey *provided $A$ is a prime attribute*. BCNF eliminates even this exception.

### 5.2 Evaluating Each Relation for BCNF

| Relation | Candidate Keys | Functional Dependencies ($X \to Y$) | Determinant $X$ | Is $X$ a Superkey? | In BCNF? |
|:---|:---|:---|:---|:---:|:---:|
| **`User`** | `{id}`, `{email}` | `id` $\to$ all<br>`email` $\to$ all | `id`, `email` | **YES** | **YES** |
| **`Category`** | `{id}`, `{slug}`, `{name}` | `id` $\to$ all<br>`slug` $\to$ all<br>`name` $\to$ all | `id`, `slug`, `name` | **YES** | **YES** |
| **`Listing`** | `{id}` | `id` $\to$ all | `id` | **YES** | **YES** |
| **`ListingImage`** | `{id}` | `id` $\to$ all | `id` | **YES** | **YES** |
| **`Favorite`** | `{id}`, `{(student_id, listing_id)}` | `id` $\to$ all<br>`{student_id, listing_id}` $\to$ all | `id`, `{student_id, listing_id}` | **YES** | **YES** |
| **`Message`** | `{id}` | `id` $\to$ all | `id` | **YES** | **YES** |

### 5.3 Conclusion on BCNF
Because **every determinant across all six decomposed relations is a candidate superkey**, the CollegeXchange database schema satisfies **BCNF** in its entirety.

---

## 6. Summary of Anomalies Resolved

| Anomaly Type | Unnormalized / 1NF Flaw | How 3NF / BCNF Resolves It in CollegeXchange |
|:---|:---|:---|
| **Insertion Anomaly** | Could not insert a student account without an existing listing or message. Could not add a category without a dummy product. | `User` and `Category` exist as autonomous relations. Students can register immediately upon campus enrollment; admins can pre-populate categories. |
| **Update Anomaly** | Changing a seller's phone or hostel required updating multiple listing rows, leading to divergent contact details. | Seller attributes are stored in exactly **one tuple** in `User`. Updating the user profile automatically propagates across all active and historical listings via foreign keys. |
| **Deletion Anomaly** | Deleting a sold listing erased the user profile and conversation records. Deleting the last listing in a category wiped out the category taxonomy. | `Listing` deletion can cascade to `ListingImage` and `Favorite`, while `User` and `Category` tuples remain intact (`ON DELETE RESTRICT`). Chat logs in `Message` retain sender and receiver identity. |

---

## 7. Prisma Schema Alignment Verification

The normalized schema matches the production Prisma schema located in `prisma/schema.prisma`:

```prisma
model User {
  id               String      @id @default(uuid())
  name             String
  email            String      @unique
  role             String      @default("STUDENT")
  department       String?
  year             String?
  hostel           String?
  phone            String?
  created_at       DateTime    @default(now())
  listings         Listing[]   @relation("UserListings")
  favorites        Favorite[]
  sentMessages     Message[]   @relation("SentMessages")
  receivedMessages Message[]   @relation("ReceivedMessages")
}

model Category {
  id          String    @id @default(uuid())
  name        String    @unique
  slug        String    @unique
  description String?
  created_at  DateTime  @default(now())
  listings    Listing[]
}

model Listing {
  id           String         @id @default(uuid())
  seller_id    String
  seller       User           @relation("UserListings", fields: [seller_id], references: [id])
  category_id  String
  category     Category       @relation(fields: [category_id], references: [id])
  title        String
  description  String
  price        Float          @default(0)
  rent_price   Float          @default(0)
  listing_type String         @default("BUY")
  condition    String         @default("GOOD")
  location     String
  status       String         @default("ACTIVE")
  created_at   DateTime       @default(now())
  updated_at   DateTime       @updatedAt
  images       ListingImage[]
  favorites    Favorite[]
  messages     Message[]
}

model ListingImage {
  id          String   @id @default(uuid())
  listing_id  String
  listing     Listing  @relation(fields: [listing_id], references: [id], onDelete: Cascade)
  image_path  String
  created_at  DateTime @default(now())
}

model Favorite {
  id          String   @id @default(uuid())
  student_id  String
  student     User     @relation(fields: [student_id], references: [id], onDelete: Cascade)
  listing_id  String
  listing     Listing  @relation(fields: [listing_id], references: [id], onDelete: Cascade)
  created_at  DateTime @default(now())
  @@unique([student_id, listing_id])
}

model Message {
  id          String   @id @default(uuid())
  listing_id  String
  listing     Listing  @relation(fields: [listing_id], references: [id], onDelete: Cascade)
  sender_id   String
  sender      User     @relation("SentMessages", fields: [sender_id], references: [id])
  receiver_id String
  receiver    User     @relation("ReceivedMessages", fields: [receiver_id], references: [id])
  content     String
  created_at  DateTime @default(now())
}
```

This completes the normalization pipeline from UNF through 1NF, 2NF, 3NF, and BCNF for CollegeXchange.
