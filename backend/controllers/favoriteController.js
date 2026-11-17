const favoriteService = require('../services/favoriteService');

class FavoriteController {
  getFavorites(req, res, next) {
    try {
      const studentId = req.query.student_id || req.headers['x-demo-user-id'] || 'usr_001';
      const favorites = favoriteService.getFavoritesByStudent(studentId);

      return res.status(200).json({
        success: true,
        count: favorites.length,
        data: favorites
      });
    } catch (err) {
      next(err);
    }
  }

  addFavorite(req, res, next) {
    try {
      const { listing_id, student_id } = req.body;
      const effectiveStudentId = student_id || req.headers['x-demo-user-id'] || 'usr_001';

      if (!listing_id) {
        return res.status(400).json({
          success: false,
          error: 'listing_id is required'
        });
      }

      const favorite = favoriteService.addFavorite(effectiveStudentId, listing_id);
      return res.status(201).json({
        success: true,
        message: 'Added to favorites',
        data: favorite
      });
    } catch (err) {
      next(err);
    }
  }

  removeFavorite(req, res, next) {
    try {
      const { id } = req.params;
      const success = favoriteService.removeFavorite(id);

      if (!success) {
        return res.status(404).json({
          success: false,
          error: 'Favorite Not Found'
        });
      }

      return res.status(200).json({
        success: true,
        message: 'Removed from favorites'
      });
    } catch (err) {
      next(err);
    }
  }
}

module.exports = new FavoriteController();
