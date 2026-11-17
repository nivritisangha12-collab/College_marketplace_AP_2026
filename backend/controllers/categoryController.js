const categoryService = require('../services/categoryService');

class CategoryController {
  getCategories(req, res, next) {
    try {
      const categories = categoryService.getAllCategories();
      return res.status(200).json({
        success: true,
        count: categories.length,
        data: categories
      });
    } catch (err) {
      next(err);
    }
  }

  createCategory(req, res, next) {
    try {
      const newCategory = categoryService.createCategory(req.body);
      return res.status(201).json({
        success: true,
        message: 'Category created successfully',
        data: newCategory
      });
    } catch (err) {
      next(err);
    }
  }

  updateCategory(req, res, next) {
    try {
      const { id } = req.params;
      const updated = categoryService.updateCategory(id, req.body);

      if (!updated) {
        return res.status(404).json({
          success: false,
          error: 'Category Not Found'
        });
      }

      return res.status(200).json({
        success: true,
        data: updated
      });
    } catch (err) {
      next(err);
    }
  }

  deleteCategory(req, res, next) {
    try {
      const { id } = req.params;
      const success = categoryService.deleteCategory(id);

      if (!success) {
        return res.status(404).json({
          success: false,
          error: 'Category Not Found'
        });
      }

      return res.status(200).json({
        success: true,
        message: 'Category deleted successfully'
      });
    } catch (err) {
      next(err);
    }
  }
}

module.exports = new CategoryController();
