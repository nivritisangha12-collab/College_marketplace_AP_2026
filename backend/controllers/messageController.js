const messageService = require('../services/messageService');

class MessageController {
  getMessages(req, res, next) {
    try {
      const userId = req.query.user_id || req.headers['x-demo-user-id'] || 'usr_001';
      const messages = messageService.getUserMessages(userId);

      return res.status(200).json({
        success: true,
        count: messages.length,
        data: messages
      });
    } catch (err) {
      next(err);
    }
  }

  sendMessage(req, res, next) {
    try {
      const message = messageService.sendMessage(req.body);
      return res.status(201).json({
        success: true,
        message: 'Message sent successfully',
        data: message
      });
    } catch (err) {
      next(err);
    }
  }
}

module.exports = new MessageController();
