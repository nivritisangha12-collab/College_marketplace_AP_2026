# CollegeXchange — Setup & Quickstart Guide

## Prerequisites
- Node.js (v18+ recommended)
- npm (v9+ recommended)

---

## Installation

1. **Install Dependencies:**
   ```bash
   npm install
   ```

---

## Running the Application

### 1. Main Web Server (Express Backend + Vanilla Web UI)
```bash
npm start
# OR
npm run dev
```
Open **`http://localhost:5001`** in your browser.
Express serves the REST API and the Vanilla Web Application directly from `public/` using `express.static`.

Health check endpoint: `http://localhost:5001/api/health`

### 2. Low-Level Node HTTP Module Demonstration
```bash
npm run http-demo
```
Runs standalone HTTP module demo server at `http://localhost:5002/demo`.

### 3. Process Module Seeder (`process.argv`)
```bash
node scripts/seed.js categories
node scripts/seed.js users
node scripts/seed.js sample
node scripts/seed.js all
```

### 4. Readline CLI Utility (`readline.question`)
```bash
node scripts/cli.js
```

### 5. Prisma Migrate
```bash
npx prisma migrate dev --name init
```
Generates SQL migrations in `prisma/migrations/`.
