# CollegeXchange — AP Topic Mapping & Implementation Reference

| # | AP Syllabus Topic | Implementation File(s) | Specific Function / Syntax Used | Purpose & Explanation |
|---|---|---|---|---|
| 1 | **JavaScript** | `public/app.js`, `backend/*` | ES6 syntax (`const`, `let`, arrow functions, DOM manip, `fetch()`, `.filter()`, `.map()`, `async/await`) | Foundational programming language on server and client. |
| 2 | **Introduction to Backend** | `backend/server.js` | Express initialization & port listening (`app.listen(PORT)`) | Server-side execution of HTTP requests. |
| 3 | **Introduction to Node.js** | `backend/server.js`, `backend/httpDemo.js` | Node runtime execution (`node backend/server.js`) | Executing backend JS outside the browser. |
| 4 | **Module System** | Entire `backend/` codebase | `require('./module')` & `module.exports = ...` | Modular codebase split into clean, reusable files. |
| 5 | **Process Module** | `scripts/seed.js` | `process.argv[2]` | CLI argument parsing for seeding (`categories`, `sample`, `users`, `all`). |
| 6 | **Path Module** | `backend/config/database.js`, `backend/utils/fileUtils.js` | `path.join(__dirname, '../data', filename)` | Constructing cross-platform file paths reliably. |
| 7 | **Event Module** | `backend/events/listingEvents.js` | `eventEmitter.emit('listingCreated', data)`, `eventEmitter.on('listingCreated', callback)` | Decoupling activity logging from business logic using custom Node events. |
| 8 | **Readline Module** | `scripts/cli.js` | `readline.createInterface()`, `rl.question()` | Interactive terminal interface for viewing & managing categories/listings. |
| 9 | **FS Module** | `backend/utils/fileUtils.js` | `fs.readFileSync()`, `fs.writeFileSync()`, `fs.appendFileSync()` | Reading JSON data files (`data/*.json`), saving updates, appending to `logs/activity.log`. |
| 10 | **HTTP Module** | `backend/httpDemo.js` | `http.createServer((req, res) => { res.writeHead(...); res.end(...); })` | Low-level Node HTTP server demonstration with status codes and JSON headers. |
| 11 | **Express Routing** | `backend/server.js`, `backend/routes/*.js` | `app.get()`, `app.post()`, `app.put()`, `app.delete()`, `app.patch()` | Routing incoming HTTP verbs and URL paths to handlers. |
| 12 | **REST** | `backend/routes/*.js` | RESTful API endpoints (`GET /api/listings`, `POST /api/listings`, etc.) | Returning standard JSON HTTP responses. |
| 13 | **Express Middleware** | `backend/middleware/*.js` | `app.use((req, res, next) => { ... next(); })` | Intercepting requests for logging, request payload validation, and global error handling. |
| 14 | **Express Router** | `backend/routes/listingRoutes.js` | `const router = express.Router(); router.get('/', ...)` | Modular route grouping mounted on Express app. |
| 15 | **Express Static File Serving** | `backend/server.js` | `app.use(express.static(paths.public))`, `app.use('/uploads', express.static(paths.uploads))` | Serving frontend HTML/CSS/JS files and uploaded product images directly over HTTP. |
| 16 | **MVC** | `backend/` directory structure | Model (JSON/Prisma Schema), View (Vanilla Web UI in `public/`), Controller (`controllers/`), Service (`services/`) | Design pattern separating routing, request handling, business logic, and UI. |
| 17 | **Services** | `backend/services/*.js` | Business logic functions (e.g. `listingService.createListing()`) | Contains business logic, query filtering, data persistence, and event emission. |
| 18 | **Controllers** | `backend/controllers/*.js` | Express handler functions `(req, res, next) => { ... }` | Processes HTTP inputs, calls services, sends HTTP status codes & JSON payloads. |
| 19 | **Middleware** | `backend/middleware/loggerMiddleware.js`, `validationMiddleware.js`, `errorMiddleware.js` | Express middleware functions | Standardized request logging, input validation, and global error handling. |
| 20 | **Routes** | `backend/routes/*.js` | Express route definitions | Endpoint definitions for Express. |
| 21 | **Prisma Introduction** | `prisma/schema.prisma` | Schema header (`datasource db`, `generator client`) | Configures relational database provider settings. |
| 22 | **Prisma Model** | `prisma/schema.prisma` | `model User`, `model Listing`, `model Category`, `model Favorite`, `model Message` | Defines relational data structures, data types, defaults, and relations. |
| 23 | **Prisma Migrate** | `prisma/migrations/` | `npx prisma migrate dev --name init` | Generates SQL migration files from Prisma models to demonstrate database migrations. |
