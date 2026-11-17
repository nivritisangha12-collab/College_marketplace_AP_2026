const EventEmitter = require('events');
const { appendLogRecord } = require('../utils/fileUtils');
const { paths } = require('../config/database');

// Class extending Node.js EventEmitter to manage application events
class MarketplaceEventEmitter extends EventEmitter {}

const marketplaceEvents = new MarketplaceEventEmitter();

// Event Listener 1: Listing Created
marketplaceEvents.on('listingCreated', (listing) => {
  const logMessage = `Listing "${listing.title}" (ID: ${listing.id}) posted by ${listing.seller_name || listing.seller_id} for ₹${listing.price}`;
  appendLogRecord(paths.activityLog, 'LISTING_CREATED', logMessage);
  console.log(`[EVENT EMITTED] listingCreated: ${listing.title}`);
});

// Event Listener 2: Listing Marked as Sold
marketplaceEvents.on('listingSold', (listing) => {
  const logMessage = `Listing "${listing.title}" (ID: ${listing.id}) marked as SOLD`;
  appendLogRecord(paths.activityLog, 'LISTING_SOLD', logMessage);
  console.log(`[EVENT EMITTED] listingSold: ${listing.title}`);
});

// Event Listener 3: Favorite Added
marketplaceEvents.on('favoriteAdded', (fav) => {
  const logMessage = `Student (${fav.student_id}) saved listing (${fav.listing_id})`;
  appendLogRecord(paths.activityLog, 'FAVORITE_ADDED', logMessage);
  console.log(`[EVENT EMITTED] favoriteAdded: ${fav.listing_id}`);
});

// Event Listener 4: Message Sent
marketplaceEvents.on('messageSent', (msg) => {
  const logMessage = `Message sent from ${msg.sender_name || msg.sender_id} to ${msg.receiver_name || msg.receiver_id} regarding listing ${msg.listing_id}`;
  appendLogRecord(paths.activityLog, 'MESSAGE_SENT', logMessage);
  console.log(`[EVENT EMITTED] messageSent: ${msg.id}`);
});

module.exports = marketplaceEvents;
