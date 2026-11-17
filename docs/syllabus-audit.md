# CollegeXchange — Academic Scope & Syllabus Audit Report

## 1. Executive Summary
This document records the comprehensive academic audit conducted on the **CollegeXchange** repository. The audit evaluates every dependency, folder, module, pattern, and framework against the **authoritative AP syllabus**.

All technologies that fell outside the specified AP syllabus (such as React, Vite, and Prisma Client runtime) have been identified, removed, and replaced with strictly syllabus-compatible implementations (Vanilla HTML/CSS/JavaScript, Express Static file serving, and Node FS Module persistence).

---

## 2. AP Syllabus Compliance Matrix

| Topic Name | Syllabus Status | Audit Finding in Initial Repo | Action Taken / Refactored Implementation |
|---|---|---|---|
| **JavaScript** | ALLOWED | Used across codebase | Preserved & expanded (ES6+, DOM API, Fetch API, Promises) |
| **Intro to Backend & Node.js** | ALLOWED | `backend/server.js` | Preserved as core backend runtime |
| **Module System** | ALLOWED | `require()` & `module.exports` | Preserved across all backend services, controllers, routes, events, utilities |
| **Process Module (`process.argv`)** | ALLOWED | `scripts/seed.js` | Preserved for CLI seeder (`node scripts/seed.js categories\|users\|sample\|all`) |
| **Path Module (`path.join`)** | ALLOWED | `backend/config/database.js` | Preserved for cross-platform path resolution |
| **Event Module (`event.emit`/`event.on`)** | ALLOWED | `backend/events/listingEvents.js` | Preserved for appending activity records to `logs/activity.log` |
| **Readline Module (`readline.question`)** | ALLOWED | `scripts/cli.js` | Preserved for terminal interactive CLI menu |
| **FS Module (Read/Write/Append)** | ALLOWED | `backend/utils/fileUtils.js` | Preserved as the sole runtime data persistence layer (`data/*.json`) |
| **HTTP Module (Request/Response)** | ALLOWED | `backend/httpDemo.js` | Preserved for low-level Node HTTP demonstration |
| **Express Routing & REST** | ALLOWED | `backend/routes/*.js` | Preserved for REST API endpoints (`GET`, `POST`, `PUT`, `DELETE`, `PATCH`) |
| **Express Middleware** | ALLOWED | `backend/middleware/*.js` | Preserved (`loggerMiddleware`, `validationMiddleware`, `errorMiddleware`) |
| **Express Router** | ALLOWED | `backend/routes/` | Preserved (`express.Router()`) |
| **Express Static File Serving** | ALLOWED | `backend/server.js` | Expanded to serve the full Vanilla HTML/CSS/JS frontend directly from `public/` |
| **MVC Architecture** | ALLOWED | `backend/` | Preserved (Model: JSON/Prisma Schema, View: Vanilla Web UI, Controller, Service) |
| **Prisma Introduction** | ALLOWED | `prisma/schema.prisma` | Preserved |
| **Prisma Model** | ALLOWED | `prisma/schema.prisma` | Preserved (Relational schema definition) |
| **Prisma Migrate** | ALLOWED | `prisma/migrations/` | Preserved (`npx prisma migrate dev --name init`) |
| **Prisma Client & Prisma CRUD** | FORBIDDEN | Installed via CLI | Removed runtime `@prisma/client` imports & queries. Storage relies on FS JSON files |
| **Event Loop & Readable Streams** | FORBIDDEN | N/A | Excluded entirely |
| **React & Vite Frontend** | OUT OF SCOPE | `frontend/` directory | **REMOVED ENTIRELY**. Converted frontend to pure Vanilla HTML5, CSS3, and ES6 JS in `public/` |
| **JWT, bcrypt, WebSockets, DB ORMs** | OUT OF SCOPE | N/A | Excluded entirely |

---

## 3. Detailed Refactoring Actions

1. **Frontend Conversion:**
   - **Old:** React component framework built with Vite inside `frontend/` directory.
   - **Violation:** Frontend frameworks (React, Vite, Next.js) are outside the AP syllabus.
   - **Replacement:** Converted the entire user interface into standard, high-performance Vanilla HTML5 (`public/index.html`), Vanilla CSS3 (`public/style.css`), and Vanilla JavaScript (`public/app.js`).
   - **Result:** The `frontend/` directory was deleted. Express serves the Vanilla application directly via `express.static(path.join(__dirname, '../public'))` on `http://localhost:5001/`.

2. **Database & Data Persistence:**
   - **Violation Check:** Prisma Client and Prisma CRUD are crossed out in the syllabus.
   - **Replacement:** Kept `prisma/schema.prisma` for Prisma Model & `npx prisma migrate dev` for Prisma Migrate. All runtime data persistence uses Node's `fs` module (`fs.readFileSync`, `fs.writeFileSync`, `fs.appendFileSync`) via `backend/utils/fileUtils.js` to read/write `data/*.json` and append to `logs/activity.log`.

3. **Package Dependencies Cleanup:**
   - **Old:** `package.json` had out-of-syllabus dependencies.
   - **Replacement:** Cleaned `package.json` to retain only core syllabus dependencies (`express`, `cors`, and `prisma` CLI in devDependencies).
