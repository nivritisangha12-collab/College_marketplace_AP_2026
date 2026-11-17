const userService = require('../services/userService');

class UserController {
  getUsers(req, res, next) {
    try {
      const users = userService.getAllUsers();
      return res.status(200).json({
        success: true,
        count: users.length,
        data: users
      });
    } catch (err) {
      next(err);
    }
  }

  getUserById(req, res, next) {
    try {
      const { id } = req.params;
      const user = userService.getUserById(id);

      if (!user) {
        return res.status(404).json({
          success: false,
          error: 'User Not Found'
        });
      }

      return res.status(200).json({
        success: true,
        data: user
      });
    } catch (err) {
      next(err);
    }
  }
}

module.exports = new UserController();
