const listingService = require('../services/listingService');

class ListingController {
  getListings(req, res, next) {
    try {
      const listings = listingService.getAllListings(req.query);
      return res.status(200).json({
        success: true,
        count: listings.length,
        data: listings
      });
    } catch (err) {
      next(err);
    }
  }

  getListingById(req, res, next) {
    try {
      const { id } = req.params;
      const listing = listingService.getListingById(id);

      if (!listing) {
        return res.status(404).json({
          success: false,
          error: 'Listing Not Found',
          message: `No active listing found with ID: ${id}`
        });
      }

      return res.status(200).json({
        success: true,
        data: listing
      });
    } catch (err) {
      next(err);
    }
  }

  createListing(req, res, next) {
    try {
      const newListing = listingService.createListing(req.body);
      return res.status(201).json({
        success: true,
        message: 'Listing created successfully',
        data: newListing
      });
    } catch (err) {
      next(err);
    }
  }

  updateListing(req, res, next) {
    try {
      const { id } = req.params;
      const updated = listingService.updateListing(id, req.body);

      if (!updated) {
        return res.status(404).json({
          success: false,
          error: 'Listing Not Found'
        });
      }

      return res.status(200).json({
        success: true,
        message: 'Listing updated successfully',
        data: updated
      });
    } catch (err) {
      next(err);
    }
  }

  markSold(req, res, next) {
    try {
      const { id } = req.params;
      const listing = listingService.markAsSold(id);

      if (!listing) {
        return res.status(404).json({
          success: false,
          error: 'Listing Not Found'
        });
      }

      return res.status(200).json({
        success: true,
        message: 'Listing status changed to SOLD',
        data: listing
      });
    } catch (err) {
      next(err);
    }
  }

  markActive(req, res, next) {
    try {
      const { id } = req.params;
      const listing = listingService.markAsActive(id);

      if (!listing) {
        return res.status(404).json({
          success: false,
          error: 'Listing Not Found'
        });
      }

      return res.status(200).json({
        success: true,
        message: 'Listing status changed to ACTIVE',
        data: listing
      });
    } catch (err) {
      next(err);
    }
  }

  deleteListing(req, res, next) {
    try {
      const { id } = req.params;
      const deleted = listingService.deleteListing(id);

      if (!deleted) {
        return res.status(404).json({
          success: false,
          error: 'Listing Not Found'
        });
      }

      return res.status(200).json({
        success: true,
        message: 'Listing deleted successfully'
      });
    } catch (err) {
      next(err);
    }
  }
}

module.exports = new ListingController();
