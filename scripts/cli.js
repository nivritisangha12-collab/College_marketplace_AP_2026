/**
 * CLI utility demonstrating the Node.js Readline Module (readline.question).
 * Allows interactive management and browsing of categories and listings.
 */
const readline = require('readline');
const { readJsonFile, writeJsonFile } = require('../backend/utils/fileUtils');
const { paths } = require('../backend/config/database');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

function displayMenu() {
  console.log('\n========================================');
  console.log('       CAMPUSXCHANGE CLI UTILITY');
  console.log('========================================');
  console.log('1. View categories');
  console.log('2. View active listings');
  console.log('3. Add a category');
  console.log('4. Exit');
  console.log('----------------------------------------');

  rl.question('Select an option (1-4): ', (answer) => {
    const choice = answer.trim();

    switch (choice) {
      case '1':
        viewCategories();
        break;
      case '2':
        viewListings();
        break;
      case '3':
        addCategoryPrompt();
        break;
      case '4':
        console.log('\nExiting CampusXchange CLI. Goodbye!');
        rl.close();
        break;
      default:
        console.log('\nInvalid option. Please try again.');
        displayMenu();
        break;
    }
  });
}

function viewCategories() {
  const categories = readJsonFile(paths.categories);
  console.log('\n--- PRODUCT CATEGORIES ---');
  categories.forEach((cat, index) => {
    console.log(`${index + 1}. ${cat.name} (${cat.slug}) — ${cat.description}`);
  });
  displayMenu();
}

function viewListings() {
  const listings = readJsonFile(paths.listings);
  const active = listings.filter(l => l.status === 'ACTIVE');
  console.log('\n--- ACTIVE MARKETPLACE LISTINGS ---');
  if (active.length === 0) {
    console.log('No active listings found.');
  } else {
    active.forEach((item, index) => {
      console.log(`${index + 1}. [₹${item.price}] ${item.title} (${item.condition}) - Seller: ${item.seller_name} @ ${item.location}`);
    });
  }
  displayMenu();
}

function addCategoryPrompt() {
  rl.question('\nEnter new category name: ', (name) => {
    if (!name.trim()) {
      console.log('Category name cannot be empty.');
      return displayMenu();
    }
    rl.question('Enter description: ', (description) => {
      const categories = readJsonFile(paths.categories);
      const newCat = {
        id: `cat_${Date.now()}`,
        name: name.trim(),
        slug: name.trim().toLowerCase().replace(/[^a-z0-9]+/g, '-'),
        description: description.trim(),
        created_at: new Date().toISOString()
      };
      categories.push(newCat);
      writeJsonFile(paths.categories, categories);
      console.log(`\n Category "${newCat.name}" added successfully via Readline CLI!`);
      displayMenu();
    });
  });
}

// Start the CLI interface
displayMenu();
