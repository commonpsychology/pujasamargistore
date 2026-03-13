export const PRODUCTS = [
  {
    id: 1,
    slug: 'pooja-kit-basic',
    name: 'Basic Pooja Kit',
    category: 'Pooja Essentials',
    price: 25.99,
    description: 'Everything you need for daily puja rituals. Includes diya, agarbatti, kumkum, and rice.',
    images: ['/images/ps1.jpg'],
    emoji: '🪔',
    badge: 'Bestseller',
    tags: ['bestseller'],
  },
  {
    id: 2,
    slug: 'pooja-kit-deluxe',
    name: 'Deluxe Pooja Kit',
    category: 'Pooja Essentials',
    price: 49.99,
    description: 'Premium ritual kit with brass puja thali, chandan, flowers, ghee diya, and full accessories.',
    images: ['/images/ps3.jpg'],
    emoji: '🏺',
    badge: 'Popular',
    tags: ['popular'],
  },
  {
    id: 3,
    slug: 'diwali-special-kit',
    name: 'Diwali Special Kit',
    category: 'Festival Collection',
    price: 79.99,
    description: 'A curated Diwali set featuring laxmi puja items, diyas, rangoli colors, and sweets tray.',
    images: ['/images/ps4.jpg'],
    emoji: '✨',
    badge: 'Festival',
    tags: ['new', 'festival'],
  },
  {
    id: 4,
    slug: 'special-pooja-items',
    name: 'Special Pooja Items',
    category: 'Spiritual Items',
    price: 19.99,
    description: 'Hand-selected spiritual items: tulsi mala, rudraksha beads, sandalwood paste, and camphor.',
    images: ['/images/ps3.jpg'],
    emoji: '📿',
    tags: [],
  },
  {
    id: 5,
    slug: 'brass-diya-set',
    name: 'Brass Diya Set (6 pcs)',
    category: 'Pooja Essentials',
    price: 34.99,
    description: 'Pure brass diyas with intricate engravings. Perfect for festivals and daily worship.',
    images: ['/images/ps2.jpg'],
    emoji: '🕯️',
    badge: 'Popular',
    tags: ['popular'],
  },
  {
    id: 6,
    slug: 'agarbatti-premium',
    name: 'Premium Agarbatti Pack',
    category: 'Spiritual Items',
    price: 12.99,
    description: 'Natural handrolled incense sticks in chandan, rose, jasmine, and guggal fragrances.',
    images: ['/images/ps1.jpg'],
    emoji: '🌿',
    badge: 'Bestseller',
    tags: ['bestseller'],
  },
  {
    id: 7,
    slug: 'rudraksha-mala',
    name: 'Rudraksha Mala',
    category: 'Spiritual Items',
    price: 29.99,
    description: 'Authentic 108-bead rudraksha mala for meditation, japa, and spiritual practice.',
    images: ['/images/ps2.jpg'],
    emoji: '📿',
    badge: 'New',
    tags: ['new'],
  },
];

export const CATEGORIES = [
  { id: 'all',                 label: 'All Products' },
  { id: 'Pooja Essentials',   label: 'Pooja Essentials' },
  { id: 'Festival Collection', label: 'Festival Collection' },
  { id: 'Spiritual Items',    label: 'Spiritual Items' },
];

export function filterProducts(products, { category, search, sort } = {}) {
  let list = [...products];

  if (category && category !== 'all') {
    list = list.filter(p => p.category === category);
  }
  if (search) {
    const q = search.toLowerCase();
    list = list.filter(p =>
      p.name.toLowerCase().includes(q) ||
      p.category.toLowerCase().includes(q) ||
      p.description.toLowerCase().includes(q)
    );
  }
  if (sort === 'price-asc')  list.sort((a, b) => a.price - b.price);
  if (sort === 'price-desc') list.sort((a, b) => b.price - a.price);

  return list;
}