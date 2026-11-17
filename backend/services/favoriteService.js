const { readJsonFile, writeJsonFile } = require('../utils/fileUtils');
const { paths } = require('../config/database');
const marketplaceEvents = require('../events/listingEvents');
const listingService = require('./listingService');

class FavoriteService {
  getFavoritesByStudent(studentId) {
    const favorites = readJsonFile(paths.favorites);
    const studentFavs = favorites.filter(f => f.student_id === studentId);
    
    // Enrich with full listing details
    const allListings = listingService.getAllListings();
    return studentFavs.map(fav => {
      const listing = allListings.find(l => l.id === fav.listing_id);
      return {
        ...fav,
        listing: listing || null
      };
    }).filter(fav => fav.listing !== null);
  }

  addFavorite(studentId, listingId) {
    const favorites = readJsonFile(paths.favorites);
    
    // Check if already favorited
    const existing = favorites.find(f => f.student_id === studentId && f.listing_id === listingId);
    if (existing) return existing;

    const newFav = {
      id: `fav_${Date.now()}`,
      student_id: studentId,
      listing_id: listingId,
      created_at: new Date().toISOString()
    };

    favorites.push(newFav);
    writeJsonFile(paths.favorites, favorites);

    // Emit event
    marketplaceEvents.emit('favoriteAdded', newFav);

    return newFav;
  }

  removeFavorite(id) {
    const favorites = readJsonFile(paths.favorites);
    const filtered = favorites.filter(f => f.id !== id && f.listing_id !== id);
    if (filtered.length === favorites.length) return false;

    writeJsonFile(paths.favorites, filtered);
    return true;
  }
}

module.exports = new FavoriteService();
