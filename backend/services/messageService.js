const { readJsonFile, writeJsonFile } = require('../utils/fileUtils');
const { paths } = require('../config/database');
const marketplaceEvents = require('../events/listingEvents');

class MessageService {
  getUserMessages(userId) {
    const messages = readJsonFile(paths.messages);
    if (!userId) return messages;

    return messages.filter(m => m.sender_id === userId || m.receiver_id === userId)
      .sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
  }

  sendMessage(data) {
    const messages = readJsonFile(paths.messages);
    const newMsg = {
      id: `msg_${Date.now()}`,
      listing_id: data.listing_id,
      sender_id: data.sender_id || 'usr_001',
      sender_name: data.sender_name || 'Aarav Sharma',
      receiver_id: data.receiver_id,
      receiver_name: data.receiver_name || 'Seller',
      content: data.content.trim(),
      created_at: new Date().toISOString()
    };

    messages.push(newMsg);
    writeJsonFile(paths.messages, messages);

    // Emit event
    marketplaceEvents.emit('messageSent', newMsg);

    return newMsg;
  }
}

module.exports = new MessageService();
