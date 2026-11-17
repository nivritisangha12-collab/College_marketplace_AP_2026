# CampusXchange — Testing & Verification Report

## Verification Matrix

| Test Case | Method / Endpoint | Expected Outcome | Result |
|---|---|---|---|
| Health Check | `GET /api/health` | Status 200 with JSON payload | PASS |
| Fetch Catalog | `GET /api/listings` | Returns array of 8 active listings | PASS |
| Category Filter | `GET /api/listings?category=academic` | Returns items matching Academic category | PASS |
| Condition Filter | `GET /api/listings?condition=LIKE_NEW` | Returns items matching condition | PASS |
| Sorting | `GET /api/listings?sort=price-low` | Orders items by ascending price | PASS |
| Search | `GET /api/listings?search=calculator` | Returns Casio calculator item | PASS |
| Create Listing | `POST /api/listings` | Returns 201 Created and emits event | PASS |
| Mark Sold | `PATCH /api/listings/:id/sold` | Updates status to SOLD and logs event | PASS |
| Soft Delete | `DELETE /api/listings/:id` | Sets status to DELETED | PASS |
| Add Favorite | `POST /api/favorites` | Adds listing to favorites list | PASS |
| Send Message | `POST /api/messages` | Saves message and logs `messageSent` event | PASS |
| Admin Stats | `GET /api/admin/statistics` | Returns live calculated system metrics | PASS |
| HTTP Demo Server | `GET http://localhost:5002/demo` | Status 200 OK via raw Node `http` module | PASS |
| Seeder CLI | `node scripts/seed.js all` | Reads `process.argv` and writes JSON files | PASS |
| Readline CLI | `node scripts/cli.js` | Interactive prompt displays categories/listings | PASS |
| Prisma Migrate | `npx prisma migrate dev` | Generates SQL migration file without errors | PASS |
| Frontend Build | `npm run build` in `frontend` | Transforms React bundle clean in 368ms | PASS |
