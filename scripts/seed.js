/**
 * CLI Seeding utility demonstrating the Process Module (process.argv).
 * Command usage:
 *   node scripts/seed.js categories
 *   node scripts/seed.js users
 *   node scripts/seed.js sample
 *   node scripts/seed.js all
 */
const path = require('path');
const { writeJsonFile, appendLogRecord } = require('../backend/utils/fileUtils');
const { paths } = require('../backend/config/database');

const arg = process.argv[2] ? process.argv[2].toLowerCase() : 'all';

console.log(`[PROCESS MODULE DEMO] Command-line argument received: "${arg}"`);

const sampleUsers = [
  {
    id: "usr_001",
    name: "Aarav Sharma",
    email: "aarav.sharma@college.edu",
    role: "STUDENT",
    department: "Computer Science & Engineering",
    year: "3rd Year",
    hostel: "Hostel B",
    phone: "+91 98765 43210",
    created_at: new Date().toISOString()
  },
  {
    id: "usr_002",
    name: "Riya Patel",
    email: "riya.patel@college.edu",
    role: "STUDENT",
    department: "Electronics & Communication",
    year: "2nd Year",
    hostel: "Hostel A",
    phone: "+91 98123 45678",
    created_at: new Date().toISOString()
  },
  {
    id: "usr_003",
    name: "Ananya Sen",
    email: "ananya.sen@college.edu",
    role: "STUDENT",
    department: "Mechanical Engineering",
    year: "4th Year",
    hostel: "Day Scholar",
    phone: "+91 97654 32109",
    created_at: new Date().toISOString()
  },
  {
    id: "usr_004",
    name: "Prof. Vikram Malhotra",
    email: "admin.malhotra@college.edu",
    role: "ADMIN",
    department: "Campus Administration",
    year: "Faculty",
    hostel: "Faculty Quarter 4",
    phone: "+91 94111 22334",
    created_at: new Date().toISOString()
  }
];

const sampleCategories = [
  { id: "cat_001", name: "Academic", slug: "academic", description: "Calculators, lab coats, drawing tools", created_at: new Date().toISOString() },
  { id: "cat_002", name: "Books", slug: "books", description: "Textbooks and reference material", created_at: new Date().toISOString() },
  { id: "cat_003", name: "Electronics", slug: "electronics", description: "Monitors, keyboards, headphones", created_at: new Date().toISOString() },
  { id: "cat_004", name: "Hostel", slug: "hostel", description: "Mattresses, study lamps, kettles", created_at: new Date().toISOString() },
  { id: "cat_005", name: "Furniture", slug: "furniture", description: "Study tables and ergonomic chairs", created_at: new Date().toISOString() },
  { id: "cat_006", name: "Sports", slug: "sports", description: "Cycles, badminton rackets, gym gear", created_at: new Date().toISOString() },
  { id: "cat_007", name: "Clothing", slug: "clothing", description: "College hoodies and lab aprons", created_at: new Date().toISOString() },
  { id: "cat_008", name: "Accessories", slug: "accessories", description: "Backpacks and desk accessories", created_at: new Date().toISOString() }
];

const sampleListings = [
  {
    id: "lst_001",
    seller_id: "usr_001",
    seller_name: "Aarav Sharma",
    category_id: "cat_001",
    category_name: "Academic",
    title: "Casio fx-991CW Scientific Calculator",
    description: "Mint condition 991CW scientific calculator with ClassWiz display. Purchased last semester for Engineering Mathematics. Comes with original protective cover.",
    price: 850,
    condition: "LIKE_NEW",
    location: "Library Block",
    status: "ACTIVE",
    images: ["/uploads/casio_calculator.jpg"],
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  },
  {
    id: "lst_002",
    seller_id: "usr_002",
    seller_name: "Riya Patel",
    category_id: "cat_006",
    category_name: "Sports",
    title: "Decathlon Riverside 120 Hybrid Cycle",
    description: "Single-owner hybrid cycle in great riding condition. Front and rear brakes freshly tuned. Includes memory foam saddle seat cover and heavy-duty steel lock.",
    price: 4200,
    condition: "GOOD",
    location: "Hostel A",
    status: "ACTIVE",
    images: ["/uploads/decathlon_cycle.jpg"],
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  },
  {
    id: "lst_003",
    seller_id: "usr_001",
    seller_name: "Aarav Sharma",
    category_id: "cat_001",
    category_name: "Academic",
    title: "Complete Engineering Drawing Kit",
    description: "Mini drafter, A2 drawing board, set squares, compass set, and sheet container. Essential for 1st-year engineering graphics lab.",
    price: 650,
    condition: "GOOD",
    location: "Academic Block",
    status: "ACTIVE",
    images: ["/uploads/drawing_kit.jpg"],
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  },
  {
    id: "lst_004",
    seller_id: "usr_003",
    seller_name: "Ananya Sen",
    category_id: "cat_003",
    category_name: "Electronics",
    title: "Sony WH-CH520 Wireless Headphones",
    description: "Beige Bluetooth headphones with 50-hour battery life and multi-point connectivity. Used lightly for library study sessions. Cleaned and sanitized.",
    price: 2400,
    condition: "LIKE_NEW",
    location: "Cafeteria",
    status: "ACTIVE",
    images: ["/uploads/sony_headphones.jpg"],
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  },
  {
    id: "lst_005",
    seller_id: "usr_002",
    seller_name: "Riya Patel",
    category_id: "cat_004",
    category_name: "Hostel",
    title: "Orthopedic Single Foam Mattress (3x6 ft)",
    description: "High-density 4-inch foam hostel mattress with cotton cover. Clean and well-maintained. Perfect fit for standard college hostel cots.",
    price: 1200,
    condition: "GOOD",
    location: "Hostel A",
    status: "ACTIVE",
    images: ["/uploads/hostel_mattress.jpg"],
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  }
];

function runSeeder() {
  switch (arg) {
    case 'users':
      writeJsonFile(paths.users, sampleUsers);
      console.log(' Successfully seeded users.json');
      appendLogRecord(paths.activityLog, 'SEED_USERS', 'Seeded demo user profiles');
      break;
    case 'categories':
      writeJsonFile(paths.categories, sampleCategories);
      console.log(' Successfully seeded categories.json');
      appendLogRecord(paths.activityLog, 'SEED_CATEGORIES', 'Seeded product categories');
      break;
    case 'sample':
    case 'listings':
      writeJsonFile(paths.listings, sampleListings);
      console.log(' Successfully seeded listings.json');
      appendLogRecord(paths.activityLog, 'SEED_LISTINGS', 'Seeded sample listings');
      break;
    case 'all':
    default:
      writeJsonFile(paths.users, sampleUsers);
      writeJsonFile(paths.categories, sampleCategories);
      writeJsonFile(paths.listings, sampleListings);
      writeJsonFile(paths.favorites, [
        { id: "fav_001", student_id: "usr_001", listing_id: "lst_002", created_at: new Date().toISOString() }
      ]);
      writeJsonFile(paths.messages, [
        {
          id: "msg_001",
          listing_id: "lst_001",
          sender_id: "usr_002",
          sender_name: "Riya Patel",
          receiver_id: "usr_001",
          receiver_name: "Aarav Sharma",
          content: "Hi Aarav! Is the Casio calculator still available?",
          created_at: new Date().toISOString()
        }
      ]);
      console.log(' Successfully seeded all CampusXchange database JSON files!');
      appendLogRecord(paths.activityLog, 'SEED_ALL', 'Seeded complete marketplace dataset');
      break;
  }
}

runSeeder();
