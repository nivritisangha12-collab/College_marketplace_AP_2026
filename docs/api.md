# CampusXchange — REST API Reference Documentation

## Base URL
`http://localhost:5001/api`

---

## 1. Listings API (`/api/listings`)

### `GET /api/listings`
Retrieves all marketplace listings. Supports search, filtering, and sorting via query parameters.

**Query Parameters:**
- `search` (string): Text search across title, description, category, and location.
- `category` (string): Filter by category slug or ID (e.g., `academic`, `electronics`).
- `condition` (string): Filter by item condition (`NEW`, `LIKE_NEW`, `GOOD`, `FAIR`, `POOR`).
- `minPrice` (number): Minimum price filter in INR.
- `maxPrice` (number): Maximum price filter in INR.
- `location` (string): Filter by campus location.
- `sort` (string): Sort order (`newest`, `oldest`, `price-low`, `price-high`).

**Response (200 OK):**
```json
{
  "success": true,
  "count": 8,
  "data": [
    {
      "id": "lst_001",
      "seller_id": "usr_001",
      "seller_name": "Aarav Sharma",
      "category_id": "cat_001",
      "category_name": "Academic",
      "title": "Casio fx-991CW Scientific Calculator",
      "description": "Mint condition 991CW scientific calculator...",
      "price": 850,
      "condition": "LIKE_NEW",
      "location": "Library Block",
      "status": "ACTIVE",
      "images": ["/uploads/casio_calculator.jpg"],
      "created_at": "2026-10-05T14:30:00.000Z"
    }
  ]
}
```

---

### `GET /api/listings/:id`
Retrieves a single active listing by ID.

---

### `POST /api/listings`
Creates a new marketplace listing. Emits the `listingCreated` event to write a record to `logs/activity.log`.

**Headers:**
- `x-demo-user-id` (string): ID of seller (defaults to `usr_001`).

**Body Payload:**
```json
{
  "title": "Decathlon Badminton Racket",
  "category_id": "cat_006",
  "category_name": "Sports",
  "description": "Used for 2 matches, excellent tension.",
  "price": 600,
  "condition": "LIKE_NEW",
  "location": "Sports Complex"
}
```

---

### `PUT /api/listings/:id`
Updates an existing listing by ID.

---

### `PATCH /api/listings/:id/sold`
Marks a listing status as `SOLD`. Emits `listingSold` event to `logs/activity.log`.

---

### `DELETE /api/listings/:id`
Soft-deletes a listing by setting status to `DELETED`.

---

## 2. Categories API (`/api/categories`)

- `GET /api/categories` — Get list of categories.
- `POST /api/categories` — Add new category (`{ "name": "Lab Gear", "description": "..." }`).
- `PUT /api/categories/:id` — Update category.
- `DELETE /api/categories/:id` — Delete category.

---

## 3. Favorites API (`/api/favorites`)

- `GET /api/favorites?student_id=usr_001` — Get student's saved items.
- `POST /api/favorites` — Save an item (`{ "listing_id": "lst_001", "student_id": "usr_001" }`). Emits `favoriteAdded` event.
- `DELETE /api/favorites/:id` — Remove saved item.

---

## 4. Messages API (`/api/messages`)

- `GET /api/messages?user_id=usr_001` — Get user inbox/sent messages.
- `POST /api/messages` — Send message (`{ "listing_id": "lst_001", "receiver_id": "usr_001", "content": "..." }`). Emits `messageSent` event.

---

## 5. Users API (`/api/users`)

- `GET /api/users` — List demo users.
- `GET /api/users/:id` — Get single user profile.

---

## 6. Admin Audit API (`/api/admin`)

- `GET /api/admin/statistics` — Get live system metrics.
- `GET /api/admin/listings` — Audit all listings including sold & deleted.
- `GET /api/admin/users` — Audit registered users.
