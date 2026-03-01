// app/api/products/route.js
// Returns products from PostgreSQL via environment variable DATABASE_URL
// Falls back to 200 dummy products if DB is unavailable (for development)

import { NextResponse } from 'next/server';

// ── PostgreSQL query (uses 'pg' package) ──────────────────────────────────────
// Install: npm install pg
// Set env: DATABASE_URL=postgresql://user:password@localhost:5432/poojastore

async function getFromDatabase() {
  const { Pool } = await import('pg');
  const pool = new Pool({ connectionString: process.env.DATABASE_URL });
  const { rows } = await pool.query(`
    SELECT id, name, description, price, category, emoji, badge
    FROM products
    ORDER BY id ASC
    LIMIT 200
  `);
  await pool.end();
  return rows;
}

// ── 200 dummy products (used when DB is not connected) ────────────────────────
const CATEGORIES = [
  'Diyas & Lamps',
  'Incense',
  'Brass Items',
  'Flowers & Garlands',
  'Puja Kits',
  'Idols',
  'Cloths & Decor',
  'Sweets & Prasad',
];

const PRODUCT_TEMPLATES = [
  // Diyas & Lamps
  { name: 'Clay Diya (Pack of 12)',         emoji: '🪔', category: 'Diyas & Lamps',      price: 120,  badge: 'Bestseller',  description: 'Traditional hand-made clay diyas, perfect for Tihar and daily puja.' },
  { name: 'Brass Oil Lamp',                  emoji: '🪔', category: 'Diyas & Lamps',      price: 450,  badge: null,          description: 'Solid brass oil lamp with intricate carvings, ideal for home shrines.' },
  { name: 'Electric Diya LED',               emoji: '💡', category: 'Diyas & Lamps',      price: 350,  badge: 'New',         description: 'Battery-powered LED diya with realistic flame effect.' },
  { name: 'Ghee Diya Brass Set (5 pcs)',    emoji: '🪔', category: 'Diyas & Lamps',      price: 890,  badge: null,          description: 'Set of 5 brass ghee diyas in graduated sizes for altar display.' },
  { name: 'Copper Deepak',                   emoji: '🪔', category: 'Diyas & Lamps',      price: 380,  badge: null,          description: 'Pure copper deepak for auspicious morning and evening aarti.' },
  { name: 'Diya Stand (Brass, 7-tier)',      emoji: '🕯️', category: 'Diyas & Lamps',      price: 1200, badge: 'Premium',     description: 'Seven-tier brass diya stand for festive occasions and temple puja.' },
  { name: 'Floating Diya Set (10 pcs)',      emoji: '🪔', category: 'Diyas & Lamps',      price: 200,  badge: null,          description: 'Colorful floating diyas for water bowls during Chhath and Tihar.' },
  { name: 'Panch Aarti Diya',               emoji: '🪔', category: 'Diyas & Lamps',      price: 650,  badge: null,          description: 'Five-flame brass aarti lamp for performing traditional aarti.' },

  // Incense
  { name: 'Chandan Agarbatti (100 sticks)', emoji: '🌿', category: 'Incense',             price: 150,  badge: 'Popular',     description: 'Pure sandalwood incense sticks with calming, divine fragrance.' },
  { name: 'Loban Dhoop Cones',              emoji: '🌫️', category: 'Incense',             price: 180,  badge: null,          description: 'Benzoin resin dhoop cones for deep, meditative puja smoke.' },
  { name: 'Rose Agarbatti (50 sticks)',     emoji: '🌹', category: 'Incense',             price: 90,   badge: null,          description: 'Soft rose-scented incense sticks for offering to the goddess.' },
  { name: 'Premium Dhoop Sticks',           emoji: '🌿', category: 'Incense',             price: 220,  badge: 'Premium',     description: 'Thick charcoal-free dhoop sticks with long-lasting fragrance.' },
  { name: 'Camphor Tablets (50 pcs)',       emoji: '⚪', category: 'Incense',             price: 110,  badge: null,          description: 'Pure camphor tablets for aarti and purification of puja space.' },
  { name: 'Guggul Dhoop',                   emoji: '🌿', category: 'Incense',             price: 160,  badge: null,          description: 'Traditional guggul resin for smoke purification rituals.' },
  { name: 'Sambrani Cup Dhoop',             emoji: '🌫️', category: 'Incense',             price: 130,  badge: null,          description: 'Benzoin sambrani cups for home purification and mosquito repellent.' },
  { name: 'Jasmine Incense Box (200 sticks)',emoji: '🌸', category: 'Incense',            price: 250,  badge: null,          description: 'Jasmine-scented long incense sticks, beloved for morning puja.' },

  // Brass Items
  { name: 'Brass Puja Thali Set',           emoji: '🥮', category: 'Brass Items',         price: 1500, badge: 'Bestseller',  description: 'Complete 7-piece brass puja thali with diya, bell, and holders.' },
  { name: 'Brass Bell (Medium)',             emoji: '🔔', category: 'Brass Items',         price: 350,  badge: null,          description: 'Clear-toned brass puja bell to invoke divine presence.' },
  { name: 'Brass Kalash',                   emoji: '🏺', category: 'Brass Items',         price: 580,  badge: null,          description: 'Auspicious brass kalash for Satyanarayan and Griha Pravesh pujas.' },
  { name: 'Brass Incense Holder',           emoji: '🌿', category: 'Brass Items',         price: 280,  badge: null,          description: 'Decorative brass agarbatti stand with ash catcher tray.' },
  { name: 'Brass Conch Shell (Shankh)',     emoji: '🐚', category: 'Brass Items',         price: 750,  badge: 'Sacred',      description: 'Hand-polished brass shankh for sounding during aarti.' },
  { name: 'Brass Ghee Container',           emoji: '🫙', category: 'Brass Items',         price: 420,  badge: null,          description: 'Lidded brass ghee pot for keeping ghee pure during rituals.' },
  { name: 'Brass Panch Patra Set',          emoji: '🥮', category: 'Brass Items',         price: 680,  badge: null,          description: 'Five-piece brass water vessel set for ritual offerings.' },
  { name: 'Brass Lakshmi Footprint',        emoji: '👣', category: 'Brass Items',         price: 320,  badge: 'Auspicious',  description: 'Brass Lakshmi paduka for placing at home entrance for prosperity.' },

  // Flowers & Garlands
  { name: 'Marigold Garland (Fresh, 1m)',   emoji: '🌼', category: 'Flowers & Garlands',  price: 80,   badge: 'Fresh',       description: 'Fresh marigold mala for deity decoration and puja offering.' },
  { name: 'Rose Petal Pack (200g)',          emoji: '🌹', category: 'Flowers & Garlands',  price: 60,   badge: null,          description: 'Fresh rose petals for scattering during puja and decoration.' },
  { name: 'Lotus Flowers (5 pcs)',           emoji: '🪷', category: 'Flowers & Garlands',  price: 120,  badge: 'Sacred',      description: 'Sacred lotus flowers for Lord Vishnu and Goddess Lakshmi puja.' },
  { name: 'Tulsi Mala (Beads)',              emoji: '📿', category: 'Flowers & Garlands',  price: 200,  badge: null,          description: 'Authentic tulsi wood bead mala for Vishnu worship and japa.' },
  { name: 'Ashoka Leaf Garland (2m)',        emoji: '🍃', category: 'Flowers & Garlands',  price: 90,   badge: null,          description: 'Fresh ashoka leaf garland for doorway and altar decoration.' },
  { name: 'Dried Flower Puja Pack',          emoji: '🌸', category: 'Flowers & Garlands',  price: 150,  badge: null,          description: 'Mixed dried flowers for year-round puja offering.' },
  { name: 'Banana Flower (Single)',          emoji: '🌺', category: 'Flowers & Garlands',  price: 45,   badge: null,          description: 'Fresh banana flower (mocha) for Goddess Durga offering.' },
  { name: 'Champak Flower Pack',             emoji: '🌼', category: 'Flowers & Garlands',  price: 70,   badge: 'Fragrant',    description: 'Yellow champak flowers, beloved by Lord Vishnu and Shiva.' },

  // Puja Kits
  { name: 'Satyanarayan Puja Kit',          emoji: '🧧', category: 'Puja Kits',           price: 850,  badge: 'Complete',    description: 'All-in-one kit for Satyanarayan Katha with all required items.' },
  { name: 'Daily Puja Starter Kit',         emoji: '🧧', category: 'Puja Kits',           price: 550,  badge: 'Popular',     description: 'Essential items for daily home puja — diya, incense, kumkum, more.' },
  { name: 'Navratri Special Kit',           emoji: '🧧', category: 'Puja Kits',           price: 1200, badge: 'Festival',    description: 'Complete Navratri puja kit with colored dupattas and 9 diyas.' },
  { name: 'Griha Pravesh Puja Kit',         emoji: '🏠', category: 'Puja Kits',           price: 1800, badge: 'Special',     description: 'Full housewarming puja kit with kalash, mango leaves and more.' },
  { name: 'Diwali Deluxe Kit',              emoji: '🎆', category: 'Puja Kits',           price: 2200, badge: 'Bestseller',  description: 'Premium Diwali kit — rangoli, 24 diyas, lotus, sweets and more.' },
  { name: 'Baby Naming (Nwaran) Kit',       emoji: '👶', category: 'Puja Kits',           price: 950,  badge: null,          description: 'Traditional Nwaran ceremony kit with all ritual essentials.' },
  { name: 'Bratabandha Puja Kit',           emoji: '🧧', category: 'Puja Kits',           price: 1600, badge: null,          description: 'Complete Bratabandha sacred thread ceremony kit.' },
  { name: 'Teej Vrat Kit',                  emoji: '🧧', category: 'Puja Kits',           price: 780,  badge: 'Festival',    description: 'All items for Teej fasting puja — sindoor, bangles, and more.' },

  // Idols
  { name: 'Ganesh Brass Idol (6 inch)',     emoji: '🐘', category: 'Idols',               price: 1200, badge: 'Sacred',      description: 'Hand-crafted brass Ganesh idol for home shrine and office.' },
  { name: 'Lakshmi Idol (Brass, 5 inch)',   emoji: '🪙', category: 'Idols',               price: 1100, badge: null,          description: 'Sitting Lakshmi brass idol for wealth and prosperity blessings.' },
  { name: 'Shiva Lingam (Black Stone)',     emoji: '⚫', category: 'Idols',               price: 680,  badge: 'Sacred',      description: 'Authentic black stone Shiva lingam with copper abhishek tray.' },
  { name: 'Krishna Radha Idol (Marble)',    emoji: '🔵', category: 'Idols',               price: 1800, badge: 'Premium',     description: 'White marble Krishna-Radha pair idol with gold-painted details.' },
  { name: 'Durga Mata Idol (8 inch)',       emoji: '🦁', category: 'Idols',               price: 1500, badge: null,          description: 'Colorful resin Durga Mata idol with intricate handpainting.' },
  { name: 'Saraswati Idol (White, 7 inch)',emoji: '🎵', category: 'Idols',               price: 1300, badge: null,          description: 'Pure white resin Saraswati idol with veena, for study rooms.' },
  { name: 'Hanuman Idol (Red, 6 inch)',     emoji: '🔴', category: 'Idols',               price: 950,  badge: null,          description: 'Vibrant red Hanuman brass idol for courage and protection.' },
  { name: 'Panch Devata Frame',             emoji: '🖼️', category: 'Idols',               price: 750,  badge: null,          description: 'Framed five-deity panel — Ganesh, Lakshmi, Saraswati, Vishnu, Shiva.' },

  // Cloths & Decor
  { name: 'Red Deity Cloth (1m)',           emoji: '🟥', category: 'Cloths & Decor',      price: 120,  badge: null,          description: 'Bright red velvet cloth for deity seat and altar covering.' },
  { name: 'Gold Zari Chunri',               emoji: '🌟', category: 'Cloths & Decor',      price: 280,  badge: 'Premium',     description: 'Golden zari embroidered chunri for Goddess Durga and Lakshmi.' },
  { name: 'Rangoli Colors (12 colors)',     emoji: '🎨', category: 'Cloths & Decor',      price: 220,  badge: null,          description: '12-color vibrant rangoli powder pack for festive floor art.' },
  { name: 'Torana (Doorway Hanging)',       emoji: '🏮', category: 'Cloths & Decor',      price: 350,  badge: 'Festive',     description: 'Traditional marigold and mango leaf torana for door decoration.' },
  { name: 'Puja Room Backdrop (3x2ft)',     emoji: '🖼️', category: 'Cloths & Decor',      price: 650,  badge: null,          description: 'Printed fabric backdrop with Om pattern for puja room wall.' },
  { name: 'Mango Leaf String (2m)',         emoji: '🍃', category: 'Cloths & Decor',      price: 60,   badge: null,          description: 'Fresh mango leaf string for doorway toran during festivals.' },
  { name: 'Deity Crown (Mukut)',            emoji: '👑', category: 'Cloths & Decor',      price: 480,  badge: null,          description: 'Gold-plated brass mukut crown for decorating home deity idols.' },
  { name: 'Puja Aasan (Mat)',               emoji: '🧘', category: 'Cloths & Decor',      price: 190,  badge: null,          description: 'Woolen meditation and puja aasan mat with deity print border.' },

  // Sweets & Prasad
  { name: 'Panchamrit Pack',               emoji: '🍯', category: 'Sweets & Prasad',     price: 250,  badge: null,          description: 'Ready-made panchamrit (milk, curd, honey, ghee, sugar) for abhishek.' },
  { name: 'Mishri (Rock Sugar, 250g)',      emoji: '🍬', category: 'Sweets & Prasad',     price: 90,   badge: null,          description: 'Pure rock sugar mishri for prasad and panchamrit offering.' },
  { name: 'Kheer Prasad Mix',              emoji: '🍚', category: 'Sweets & Prasad',     price: 180,  badge: 'Popular',     description: 'Instant kheer mix for making prasad quickly for puja.' },
  { name: 'Coconut (Single, Whole)',        emoji: '🥥', category: 'Sweets & Prasad',     price: 55,   badge: null,          description: 'Whole coconut for offering and breaking during puja ceremonies.' },
  { name: 'Modak Mix (250g)',               emoji: '🍡', category: 'Sweets & Prasad',     price: 160,  badge: 'Ganesh Fav',  description: 'Modak preparation mix — Ganesha\'s favourite sweet offering.' },
  { name: 'Betel Nut & Leaf Pack',          emoji: '🌿', category: 'Sweets & Prasad',     price: 75,   badge: null,          description: 'Betel nut (supari) and pan leaves for deity offering.' },
  { name: 'Panchafal Fruit Pack',           emoji: '🍎', category: 'Sweets & Prasad',     price: 320,  badge: 'Fresh',       description: 'Five-fruit prasad pack — banana, apple, orange, grapes, guava.' },
  { name: 'Til Laddoo (200g)',              emoji: '🟤', category: 'Sweets & Prasad',     price: 140,  badge: null,          description: 'Sesame seed laddoo — traditional prasad for Makar Sankranti.' },
];

// Generate 200 products by cycling through templates with variations
function generateProducts() {
  const products = [];
  let id = 1;
  const multipliers = [1, 1.5, 2, 2.5, 3];
  const suffixes = ['', ' (Premium)', ' (Deluxe)', ' (Economy)', ' (Special Edition)'];

  for (let round = 0; round < multipliers.length && products.length < 200; round++) {
    for (const template of PRODUCT_TEMPLATES) {
      if (products.length >= 200) break;
      products.push({
        ...template,
        id,
        price: Math.round(template.price * multipliers[round]),
        name: template.name + (round > 0 ? suffixes[round] : ''),
        badge: round === 1 ? 'Premium' : round === 2 ? 'Deluxe' : template.badge,
      });
      id++;
    }
  }
  return products;
}

export async function GET() {
  // ── Try PostgreSQL first ──────────────────────────────────────────────────
  if (process.env.DATABASE_URL) {
    try {
      const rows = await getFromDatabase();
      return NextResponse.json(rows);
    } catch (err) {
      console.error('DB error, falling back to dummy data:', err.message);
    }
  }

  // ── Fallback: return 200 generated dummy products ─────────────────────────
  return NextResponse.json(generateProducts());
}