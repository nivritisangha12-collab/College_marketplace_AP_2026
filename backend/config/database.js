const path = require('path');

// Central configuration file resolving data storage file paths using path.join
const DATA_DIR = path.join(__dirname, '../../data');
const LOGS_DIR = path.join(__dirname, '../../logs');
const PUBLIC_DIR = path.join(__dirname, '../../public');
const UPLOADS_DIR = path.join(PUBLIC_DIR, 'uploads');

module.exports = {
  PORT: process.env.PORT || 5001,
  HTTP_DEMO_PORT: process.env.HTTP_DEMO_PORT || 5002,
  paths: {
    users: path.join(DATA_DIR, 'users.json'),
    categories: path.join(DATA_DIR, 'categories.json'),
    listings: path.join(DATA_DIR, 'listings.json'),
    favorites: path.join(DATA_DIR, 'favorites.json'),
    messages: path.join(DATA_DIR, 'messages.json'),
    activityLog: path.join(LOGS_DIR, 'activity.log'),
    uploads: UPLOADS_DIR,
    public: PUBLIC_DIR
  }
};
