# CollegeXchange — Architecture & Refactored System Specification

## 1. Academic Architecture Overview
CollegeXchange is a college-exclusive student marketplace built strictly using concepts taught in the **Advanced Programming (AP)** syllabus.

```
                      +---------------------------------------+
                      |   Vanilla Web UI (HTML/CSS/JS)       |
                      |   Served via express.static(public)   |
                      +-------------------+-------------------+
                                          |
                                     HTTP | REST API
                                          v
                      +---------------------------------------+
                      |       Express Web Server              |
                      +-------------------+-------------------+
                                          |
                                          v
                      +---------------------------------------+
                      |       Express Middleware              |
                      |   (Logger, Validator, Error)          |
                      +-------------------+-------------------+
                                          |
                                          v
                      +---------------------------------------+
                      |        Express Routers                |
                      |   (listings, categories, etc)         |
                      +-------------------+-------------------+
                                          |
                                          v
                      +---------------------------------------+
                      |         Controllers                   |
                      |    (HTTP Req/Res Handlers)            |
                      +-------------------+-------------------+
                                          |
                                          v
                      +---------------------------------------+
                      |           Services                    |
                      |    (Business & Domain Logic)          |
                      +-------------------+-------------------+
                                          |
                     +--------------------+--------------------+
                     |                                         |
                     v                                         v
       +---------------------------+             +---------------------------+
       |   FS Persistence Layer    |             |    Node Event Module      |
       |  (JSON Data / Logs via FS)|             |  (Activity Logging System)|
       +---------------------------+             +---------------------------+
```

---

## 2. Directory Structure

```
College-marketplace/
├── backend/
│   ├── config/
│   │   └── database.js           # Path.join configuration module
│   ├── controllers/              # Express Controller Layer
│   │   ├── categoryController.js
│   │   ├── favoriteController.js
│   │   ├── listingController.js
│   │   ├── messageController.js
│   │   └── userController.js
│   ├── events/
│   │   └── listingEvents.js      # EventEmitter emitting activity log records
│   ├── middleware/            # Express Middleware Layer
│   │   ├── errorMiddleware.js
│   │   ├── loggerMiddleware.js
│   │   └── validationMiddleware.js
│   ├── routes/                # Express Router Definitions
│   │   ├── categoryRoutes.js
│   │   ├── favoriteRoutes.js
│   │   ├── listingRoutes.js
│   │   ├── messageRoutes.js
│   │   └── userRoutes.js
│   ├── services/              # Business Logic & FS Storage Layer
│   │   ├── categoryService.js
│   │   ├── favoriteService.js
│   │   ├── listingService.js
│   │   ├── messageService.js
│   │   └── userService.js
│   ├── utils/
│   │   ├── fileUtils.js          # FS Read/Write/Append helpers
│   │   └── validators.js         # Input validation helpers
│   ├── httpDemo.js               # Standalone Node HTTP Module Server
│   └── server.js                 # Main Express Backend Entrypoint
├── data/                         # Persistence Data Stores (FS Read/Write)
│   ├── categories.json
│   ├── favorites.json
│   ├── listings.json
│   ├── messages.json
│   └── users.json
├── docs/                         # Project Documentation
│   ├── ap-topics.md
│   ├── api.md
│   ├── architecture.md
│   ├── setup.md
│   ├── syllabus-audit.md
│   ├── testing.md
│   └── viva-notes.md
├── logs/
│   └── activity.log              # Appended log records (FS Append)
├── prisma/                       # Database Modeling & Migrations
│   ├── migrations/
│   └── schema.prisma             # Prisma Model definitions
├── public/                       # Vanilla Web Frontend & Static Files
│   ├── uploads/                  # Product image SVGs
│   ├── app.js                    # Vanilla JS DOM & Fetch controller
│   ├── index.html                # Semantic HTML5 Structure
│   └── style.css                 # Custom CSS Design System
├── scripts/
│   ├── cli.js                    # Readline Module CLI utility
│   └── seed.js                   # Process Module (process.argv) seeder
├── package.json
└── README.md
```
