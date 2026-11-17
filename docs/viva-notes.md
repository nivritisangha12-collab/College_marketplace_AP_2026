# CollegeXchange — Viva Preparation Notes

This guide provides simple, clear, and direct answers for your college viva examination, explaining every concept implemented in CollegeXchange based strictly on your AP syllabus.

---

### Q1: What is Node.js?
**Answer:** Node.js is an open-source, cross-platform JavaScript runtime environment that executes JavaScript code on the server side, outside of a web browser.

---

### Q2: What is the Node.js Module System?
**Answer:** The Module System allows code to be split across separate files for maintainability. Code is exported using `module.exports` and imported using `require('./path')`.

---

### Q3: How is `process.argv` used in your project?
**Answer:** `process.argv` is an array holding command-line arguments passed when launching a Node process. In `scripts/seed.js`, `process.argv[2]` determines what to seed (`node scripts/seed.js categories`).

---

### Q4: Why do we use `path.join()` instead of string concatenation?
**Answer:** `path.join()` joins path segments using the operating system's specific path separator (`/` on macOS/Linux, `\` on Windows). It guarantees cross-platform compatibility.

---

### Q5: How does the Node.js Event Module work in CollegeXchange?
**Answer:** The Event Module (`events.EventEmitter`) implements the observer pattern. Events like `listingCreated` are emitted (`event.emit('listingCreated', data)`), and a listener (`event.on('listingCreated', callback)`) appends an activity record to `logs/activity.log`.

---

### Q6: How is `readline.question()` used?
**Answer:** `readline` is a built-in Node module for reading terminal input. In `scripts/cli.js`, `rl.question()` presents an interactive menu to view and manage marketplace categories directly in the terminal.

---

### Q7: How does your project use the FS module?
**Answer:** The FS (File System) module handles data operations:
- `fs.readFileSync`: Reads JSON files (`data/listings.json`).
- `fs.writeFileSync`: Writes updated data arrays.
- `fs.appendFileSync`: Appends activity logs to `logs/activity.log`.

---

### Q8: What is the difference between Node's `http` module and Express?
**Answer:** Node's `http` module is low-level (`backend/httpDemo.js`) requiring manual header setup and URL parsing. Express is a framework built on top of `http` providing clean routing, middleware, and request dispatching (`backend/server.js`).

---

### Q9: What is Express Middleware?
**Answer:** Middleware functions execute during the request-response cycle. They inspect requests, validate inputs (`validationMiddleware`), log requests (`loggerMiddleware`), or handle errors (`errorMiddleware`).

---

### Q10: How is Express Static File Serving used?
**Answer:** `app.use(express.static(paths.public))` serves the frontend HTML, CSS, and JS files directly from the `public/` directory, eliminating the need for complex external frontend build tools.

---

### Q11: What is the MVC Architecture?
**Answer:** Model-View-Controller separates concerns:
- **Model:** Schema definitions in `prisma/schema.prisma` and JSON files in `data/`.
- **View:** Vanilla HTML/CSS/JS interface in `public/`.
- **Controller:** Request processing in `backend/controllers/`.
- **Service:** Business logic in `backend/services/`.

---

### Q12: Why did we use Prisma Model & Prisma Migrate, but NOT Prisma Client?
**Answer:** Our AP syllabus includes **Prisma Introduction**, **Prisma Model**, and **Prisma Migrate** to demonstrate database modeling (`prisma/schema.prisma`) and schema migrations (`npx prisma migrate dev`). However, **Prisma Client** and **Prisma CRUD** were explicitly crossed out in our syllabus. To respect our academic lock, runtime persistence uses standard FS module operations (`fs.readFileSync`/`fs.writeFileSync`) backed by JSON files.
