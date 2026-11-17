const fs = require('fs');
const path = require('path');

/**
 * Reads a JSON file synchronously using Node.js FS module.
 * @param {string} filePath - Absolute path to the JSON file
 * @returns {Array|Object} Parsed JSON data
 */
function readJsonFile(filePath) {
  try {
    if (!fs.existsSync(filePath)) {
      // Ensure directory exists if missing
      const dir = path.dirname(filePath);
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
      }
      fs.writeFileSync(filePath, JSON.stringify([]), 'utf8');
      return [];
    }
    const rawData = fs.readFileSync(filePath, 'utf8');
    return JSON.parse(rawData || '[]');
  } catch (error) {
    console.error(`Error reading file at ${filePath}:`, error.message);
    return [];
  }
}

/**
 * Writes data to a JSON file synchronously using Node.js FS module.
 * @param {string} filePath - Absolute path to the destination file
 * @param {Array|Object} data - Data to stringify and write
 */
function writeJsonFile(filePath, data) {
  try {
    const dir = path.dirname(filePath);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    fs.writeFileSync(filePath, JSON.stringify(data, null, 2), 'utf8');
    return true;
  } catch (error) {
    console.error(`Error writing file at ${filePath}:`, error.message);
    return false;
  }
}

/**
 * Appends a log line to a target log file using Node.js FS module (fs.appendFileSync).
 * @param {string} logFilePath - Absolute path to log file
 * @param {string} eventName - Name of the emitted event
 * @param {string} message - Activity message
 */
function appendLogRecord(logFilePath, eventName, message) {
  try {
    const dir = path.dirname(logFilePath);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    const timestamp = new Date().toISOString().replace('T', ' ').substring(0, 19);
    const logLine = `[${timestamp}] ${eventName.toUpperCase()} ${message}\n`;
    fs.appendFileSync(logFilePath, logLine, 'utf8');
    return true;
  } catch (error) {
    console.error(`Error appending log to ${logFilePath}:`, error.message);
    return false;
  }
}

module.exports = {
  readJsonFile,
  writeJsonFile,
  appendLogRecord
};
