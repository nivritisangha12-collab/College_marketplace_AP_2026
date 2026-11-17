const { readJsonFile, writeJsonFile } = require('../utils/fileUtils');
const { paths } = require('../config/database');
const marketplaceEvents = require('../events/listingEvents');

class ListingService {
  getAllListings(query = {}) {
    let listings = readJsonFile(paths.listings);

    // 1. Search filter (title, description, category)
    if (query.search) {
      const term = query.search.toLowerCase().trim();
      listings = listings.filter(l =>
        (l.title && l.title.toLowerCase().includes(term)) ||
        (l.description && l.description.toLowerCase().includes(term)) ||
        (l.category_name && l.category_name.toLowerCase().includes(term)) ||
        (l.location && l.location.toLowerCase().includes(term))
      );
    }

    // 2. Category filter
    if (query.category) {
      const cat = query.category.toLowerCase().trim();
      listings = listings.filter(l =>
        (l.category_slug && l.category_slug.toLowerCase() === cat) ||
        (l.category_name && l.category_name.toLowerCase() === cat) ||
        l.category_id === query.category
      );
    }

    // 3. Condition filter
    if (query.condition) {
      listings = listings.filter(l => l.condition === query.condition.toUpperCase());
    }

    // 4. Location filter
    if (query.location) {
      const loc = query.location.toLowerCase().trim();
      listings = listings.filter(l => l.location && l.location.toLowerCase().includes(loc));
    }

    // 5. Status filter (Default: show ACTIVE & SOLD, omit DELETED unless specified)
    if (query.status) {
      listings = listings.filter(l => l.status === query.status.toUpperCase());
    } else {
      listings = listings.filter(l => l.status !== 'DELETED');
    }

    // 6. Listing Type filter (BUY, RENT, BOTH)
    if (query.listing_type) {
      const type = query.listing_type.toUpperCase();
      if (type === 'BUY') {
        listings = listings.filter(l => (Number(l.price) > 0) || l.listing_type === 'BUY' || l.listing_type === 'BOTH');
      } else if (type === 'RENT') {
        listings = listings.filter(l => (Number(l.rent_price) > 0) || l.listing_type === 'RENT' || l.listing_type === 'BOTH');
      } else if (type === 'BOTH') {
        listings = listings.filter(l => (Number(l.price) > 0 && Number(l.rent_price) > 0) || l.listing_type === 'BOTH');
      }
    }

    // 7. Price range filter (applies to buy price or rent price)
    if (query.minPrice !== undefined && !isNaN(Number(query.minPrice))) {
      listings = listings.filter(l => Number(l.price) >= Number(query.minPrice) || Number(l.rent_price) >= Number(query.minPrice));
    }
    if (query.maxPrice !== undefined && !isNaN(Number(query.maxPrice))) {
      listings = listings.filter(l => (l.price && Number(l.price) <= Number(query.maxPrice)) || (l.rent_price && Number(l.rent_price) <= Number(query.maxPrice)));
    }

    // 8. Seller filter
    if (query.seller_id) {
      listings = listings.filter(l => l.seller_id === query.seller_id);
    }

    // 9. Sorting logic
    if (query.sort === 'price-low') {
      listings.sort((a, b) => (Number(a.price) || Number(a.rent_price) || 0) - (Number(b.price) || Number(b.rent_price) || 0));
    } else if (query.sort === 'price-high') {
      listings.sort((a, b) => (Number(b.price) || Number(b.rent_price) || 0) - (Number(a.price) || Number(a.rent_price) || 0));
    } else if (query.sort === 'oldest') {
      listings.sort((a, b) => new Date(a.created_at) - new Date(b.created_at));
    } else {
      // Default: newest first
      listings.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
    }

    return listings;
  }

  getListingById(id) {
    const listings = readJsonFile(paths.listings);
    return listings.find(l => l.id === id && l.status !== 'DELETED') || null;
  }

  createListing(data) {
    const listings = readJsonFile(paths.listings);
    const newId = `lst_${Date.now()}`;
    const now = new Date().toISOString();

    const buyPrice = data.price !== undefined && data.price !== null && data.price !== '' && !isNaN(Number(data.price)) ? Number(data.price) : 0;
    const rentPrice = data.rent_price !== undefined && data.rent_price !== null && data.rent_price !== '' && !isNaN(Number(data.rent_price)) ? Number(data.rent_price) : 0;

    let listingType = 'BUY';
    if (buyPrice > 0 && rentPrice > 0) {
      listingType = 'BOTH';
    } else if (rentPrice > 0) {
      listingType = 'RENT';
    }

    const newListing = {
      id: newId,
      seller_id: data.seller_id || 'usr_001',
      seller_name: data.seller_name || 'Aarav Sharma',
      category_id: data.category_id || 'cat_001',
      category_name: data.category_name || 'Academic',
      title: data.title.trim(),
      description: data.description ? data.description.trim() : '',
      price: buyPrice,
      rent_price: rentPrice,
      listing_type: listingType,
      condition: data.condition || 'GOOD',
      location: data.location ? data.location.trim() : 'Library Block',
      status: 'ACTIVE',
      images: Array.isArray(data.images) && data.images.length > 0 ? data.images : ['/uploads/sample_product.jpg'],
      created_at: now,
      updated_at: now
    };

    listings.unshift(newListing);
    writeJsonFile(paths.listings, listings);

    // Emit event for activity log
    marketplaceEvents.emit('listingCreated', newListing);

    return newListing;
  }

  updateListing(id, updates) {
    const listings = readJsonFile(paths.listings);
    const index = listings.findIndex(l => l.id === id);

    if (index === -1) return null;

    const existing = listings[index];
    const buyPrice = updates.price !== undefined ? Number(updates.price) : existing.price;
    const rentPrice = updates.rent_price !== undefined ? Number(updates.rent_price) : (existing.rent_price || 0);

    let listingType = 'BUY';
    if (buyPrice > 0 && rentPrice > 0) {
      listingType = 'BOTH';
    } else if (rentPrice > 0) {
      listingType = 'RENT';
    }

    const updated = {
      ...existing,
      ...updates,
      price: buyPrice,
      rent_price: rentPrice,
      listing_type: listingType,
      updated_at: new Date().toISOString()
    };

    listings[index] = updated;
    writeJsonFile(paths.listings, listings);
    return updated;
  }

  markAsSold(id) {
    const listing = this.updateListing(id, { status: 'SOLD' });
    if (listing) {
      marketplaceEvents.emit('listingSold', listing);
    }
    return listing;
  }

  markAsActive(id) {
    const listing = this.updateListing(id, { status: 'ACTIVE' });
    return listing;
  }

  deleteListing(id) {
    // Soft delete by updating status to DELETED
    const listing = this.updateListing(id, { status: 'DELETED' });
    return listing;
  }
}

module.exports = new ListingService();
