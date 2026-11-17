const express = require('express');
const router = express.Router();
const listingController = require('../controllers/listingController');
const { validateListing } = require('../middleware/validationMiddleware');

// GET /api/listings - Search, filter, sort catalog
router.get('/', listingController.getListings);

// GET /api/listings/:id - Product detail
router.get('/:id', listingController.getListingById);

// POST /api/listings - Create listing
router.post('/', validateListing, listingController.createListing);

// PUT /api/listings/:id - Update listing
router.put('/:id', listingController.updateListing);

// PATCH /api/listings/:id/sold - Mark as SOLD
router.patch('/:id/sold', listingController.markSold);

// PATCH /api/listings/:id/active - Mark as ACTIVE (Unsold)
router.patch('/:id/active', listingController.markActive);
router.patch('/:id/unsold', listingController.markActive);

// DELETE /api/listings/:id - Delete listing
router.delete('/:id', listingController.deleteListing);

module.exports = router;
