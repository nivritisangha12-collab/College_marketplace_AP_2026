const { readJsonFile } = require('../utils/fileUtils');
const { paths } = require('../config/database');

class UserService {
  getAllUsers() {
    return readJsonFile(paths.users);
  }

  getUserById(id) {
    const users = readJsonFile(paths.users);
    return users.find(u => u.id === id) || null;
  }
}

module.exports = new UserService();
