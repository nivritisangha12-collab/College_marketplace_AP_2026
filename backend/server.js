const express = require('express');
const cors = require('cors');
const path = require('path');
const { PORT, paths } = require('./config/database');

// Import Custom Middleware
const loggerMiddleware = require('./middleware/loggerMiddleware');
const errorMiddleware = require('./middleware/errorMiddleware');

// Import Entity Routers
const listingRoutes = require('./routes/listingRoutes');
const categoryRoutes = require('./routes/categoryRoutes');
const userRoutes = require('./routes/userRoutes');
const favoriteRoutes = require('./routes/favoriteRoutes');
const messageRoutes = require('./routes/messageRoutes');

// Initialize Express application
const app = express();

// 1. Third-party & Global Middleware
const corsOptions = {
  origin: process.env.CORS_ORIGIN || '*',
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'x-demo-user-id']
};
app.use(cors(corsOptions));
app.use(express.json());

// 2. Custom AP Logger Middleware
app.use(loggerMiddleware);

// 3. Static File Serving (Express Static File Serving topic using path.join)
app.use('/uploads', express.static(paths.uploads));
app.use(express.static(paths.public));

// 4. API Root Status Check
app.get('/api/health', (req, res) => {
  res.status(200).json({
    status: 'ONLINE',
    app: 'CollegeXchange API',
    version: '1.0.0',
    timestamp: new Date().toISOString()
  });
});

// 5. Mount Modular Express Routers
app.use('/api/listings', listingRoutes);
app.use('/api/categories', categoryRoutes);
app.use('/api/users', userRoutes);
app.use('/api/favorites', favoriteRoutes);
app.use('/api/messages', messageRoutes);

// 6. 404 Route Catch-all
app.use((req, res, next) => {
  res.status(404).json({
    error: 'Not Found',
    message: `Cannot ${req.method} ${req.originalUrl}`
  });
});

// 7. Global Error Middleware
app.use(errorMiddleware);

// Start Express HTTP Server when executed directly
if (require.main === module) {
  app.listen(PORT, () => {
    console.log(`==================================================`);
    console.log(` CollegeXchange Express Backend Server is running `);
    console.log(` Server URL : http://localhost:${PORT}`);
    console.log(` Health Check : http://localhost:${PORT}/api/health`);
    console.log(` Uploads Path : ${paths.uploads}`);
    console.log(`==================================================`);
  });
}

module.exports = app;
