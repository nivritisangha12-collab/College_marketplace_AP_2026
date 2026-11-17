const express = require('express');
const router = express.Router();
const messageController = require('../controllers/messageController');
const { validateMessage } = require('../middleware/validationMiddleware');

router.get('/', messageController.getMessages);
router.post('/', validateMessage, messageController.sendMessage);

module.exports = router;
