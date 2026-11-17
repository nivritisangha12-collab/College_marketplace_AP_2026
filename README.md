# CollegeXchange — AP Capstone Project

**CollegeXchange** is a college-exclusive student marketplace web application designed for students to buy, sell, and exchange textbooks, calculators, lab gear, cycles, and hostel items within their campus community.

This application is built strictly within the bounds of the **Advanced Programming (AP)** syllabus.

---

## Development Team & GitHub Contributors

| Member | GitHub Username | Role & Key Contributions |
|---|---|---|
| **Mukund Mittal** | [`mukksshm`](https://github.com/mukksshm) | Backend Core, Server & Auth, Frontend Marketplace Client & Dynamic Flows |
| **Nivriti Sangha** | [`nivritisangha12-collab`](https://github.com/nivritisangha12-collab) | Repository Lead, Project Scaffolding, Base Config & Master Documentation |
| **Sairam** | [`Sairam789123`](https://github.com/Sairam789123) | Frontend UI Layout, Navigation, Shared Components, CLI Utility & Architecture Docs |
| **Ankur Agarwal** | [`agarwalankur1605`](https://github.com/agarwalankur1605) | Database Schema (Prisma/SQL), Relational Normalization, Core REST APIs & Data Layer |

---

## Key Features

### Student Capabilities
- **Marketplace Browsing & Discovery:** Search, filter by category/condition, and sort by price or date.
- **Progressive 4-Step Listing Creation:** Form for listing items (`01` Category, `02` Info, `03` Price & Location, `04` Review).
- **Product Details:** Two-column product detail modal with image, seller info, campus pickup location, and instant save action.
- **Student Dashboard:** Manage active/sold listings, view saved favorites, and check marketplace inbox messages.
- **Marketplace Messaging:** Standard HTTP REST messaging between buyers and sellers.

---

## AP Syllabus Coverage & Mapping

| AP Syllabus Topic | Code Location | Demonstration Method |
|---|---|---|
| **JavaScript** | `public/app.js`, `backend/*` | ES6+, Promises, DOM API, `async/await` |
| **Intro to Backend & Node.js** | `backend/server.js` | Express server initialization & listening |
| **Module System** | `backend/` | `require()` & `module.exports` modularity |
| **Process Module (`process.argv`)** | `scripts/seed.js` | CLI argument parsing (`node scripts/seed.js categories`) |
| **Path Module (`path.join`)** | `backend/config/database.js` | Cross-platform absolute path resolution |
| **Event Module (`event.emit`/`event.on`)** | `backend/events/listingEvents.js` | Activity logging triggered by domain events |
| **Readline Module (`readline.question`)** | `scripts/cli.js` | Interactive terminal CLI interface |
| **FS Module (Read/Write/Append)** | `backend/utils/fileUtils.js` | JSON data store management & `logs/activity.log` |
| **HTTP Module (Request/Response)** | `backend/httpDemo.js` | Low-level Node HTTP server demonstration |
| **Express Routing & REST** | `backend/routes/*.js` | Standard HTTP verbs (`GET`, `POST`, `PUT`, `DELETE`, `PATCH`) |
| **Express Middleware** | `backend/middleware/*.js` | Request logging, body validation, error handling |
| **Express Router** | `backend/routes/` | Entity route grouping mounted via `app.use()` |
| **Express Static File Serving** | `backend/server.js` | Serving HTML/CSS/JS frontend from `public/` |
| **MVC Architecture** | `backend/` | Model (JSON/Prisma), View (Vanilla Web UI), Controller, Service |
| **Prisma Model & Prisma Migrate** | `prisma/schema.prisma` | Relational schema definitions & SQL migration generation |

---

## Quickstart Instructions

### 1. Install Dependencies
```bash
npm install
```

### 2. Run Application (Express Server + Web UI)
```bash
npm start
# OR
npm run dev
```
Open **`http://localhost:5001`** in your browser.

### 3. Standalone HTTP Demo Server
```bash
npm run http-demo
```
Server runs on `http://localhost:5002/demo`.

### 4. Seeder & CLI Utilities
```bash
# Process Module Seeder
node scripts/seed.js all

# Readline CLI Utility
node scripts/cli.js

# Prisma Migrate
npx prisma migrate dev --name init
```

---

## Documentation Links
- [docs/syllabus-audit.md](file:///Users/Mukksss/College-marketplace/docs/syllabus-audit.md)
- [docs/architecture.md](file:///Users/Mukksss/College-marketplace/docs/architecture.md)
- [docs/ap-topics.md](file:///Users/Mukksss/College-marketplace/docs/ap-topics.md)
- [docs/api.md](file:///Users/Mukksss/College-marketplace/docs/api.md)
- [docs/setup.md](file:///Users/Mukksss/College-marketplace/docs/setup.md)
- [docs/testing.md](file:///Users/Mukksss/College-marketplace/docs/testing.md)
- [docs/viva-notes.md](file:///Users/Mukksss/College-marketplace/docs/viva-notes.md)
- [dbms/01_normalization.md](file:///Users/Mukksss/College-marketplace/dbms/01_normalization.md)
