const path = require('path');
const fs = require('fs');

const isVercel = Boolean(process.env.VERCEL);
// Central configuration file resolving data storage file paths using path.join
const ROOT_DIR = path.resolve(__dirname, '../../');
const DATA_DIR = isVercel ? '/tmp/data' : path.join(ROOT_DIR, 'data');
const LOGS_DIR = isVercel ? '/tmp/logs' : path.join(ROOT_DIR, 'logs');
const PUBLIC_DIR = path.join(ROOT_DIR, 'public');
const UPLOADS_DIR = path.join(PUBLIC_DIR, 'uploads');

// In Vercel serverless environment, copy seed data to writable /tmp on container init
if (isVercel) {
  try {
    if (!fs.existsSync('/tmp/data')) fs.mkdirSync('/tmp/data', { recursive: true });
    if (!fs.existsSync('/tmp/logs')) fs.mkdirSync('/tmp/logs', { recursive: true });

    const sourceDataDir = path.join(ROOT_DIR, 'data');
    if (fs.existsSync(sourceDataDir)) {
      const files = fs.readdirSync(sourceDataDir);
      for (const file of files) {
        const dest = path.join('/tmp/data', file);
        if (!fs.existsSync(dest)) {
          fs.copyFileSync(path.join(sourceDataDir, file), dest);
        }
      }
    }
  } catch (err) {
    console.warn('[Vercel FS Init Warning]', err.message);
  }
}

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
