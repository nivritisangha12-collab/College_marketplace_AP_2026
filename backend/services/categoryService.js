const { readJsonFile, writeJsonFile } = require('../utils/fileUtils');
const { paths } = require('../config/database');

class CategoryService {
  getAllCategories() {
    return readJsonFile(paths.categories);
  }

  getCategoryById(id) {
    const categories = readJsonFile(paths.categories);
    return categories.find(c => c.id === id) || null;
  }

  createCategory(data) {
    const categories = readJsonFile(paths.categories);
    const newId = `cat_${Date.now()}`;
    const slug = data.name.toLowerCase().replace(/[^a-z0-9]+/g, '-');
    const newCat = {
      id: newId,
      name: data.name.trim(),
      slug,
      description: data.description ? data.description.trim() : '',
      created_at: new Date().toISOString()
    };
    categories.push(newCat);
    writeJsonFile(paths.categories, categories);
    return newCat;
  }

  updateCategory(id, data) {
    const categories = readJsonFile(paths.categories);
    const index = categories.findIndex(c => c.id === id);
    if (index === -1) return null;

    const existing = categories[index];
    const updated = {
      ...existing,
      name: data.name ? data.name.trim() : existing.name,
      slug: data.name ? data.name.toLowerCase().replace(/[^a-z0-9]+/g, '-') : existing.slug,
      description: data.description !== undefined ? data.description.trim() : existing.description
    };
    categories[index] = updated;
    writeJsonFile(paths.categories, categories);
    return updated;
  }

  deleteCategory(id) {
    const categories = readJsonFile(paths.categories);
    const filtered = categories.filter(c => c.id !== id);
    if (filtered.length === categories.length) return false;

    writeJsonFile(paths.categories, filtered);
    return true;
  }
}

module.exports = new CategoryService();
