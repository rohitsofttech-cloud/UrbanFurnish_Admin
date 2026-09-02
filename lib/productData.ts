/**
 * Admin Product Data Model & Seed Data
 * Mirrors the client-side ExtendedProduct structure for full parity.
 */

export interface AdminProduct {
  id: string;
  slug: string;
  name: string;
  subtitle: string;
  category: string;
  childCategory?: string;
  room: string;
  price: number;
  originalPrice: number;
  discountPercentage: number;
  rating: number;
  reviewCount: number;
  imageUrl: string;
  secondaryImageUrl?: string;
  images: string[];
  badge: string;
  inStock: boolean;
  material: string;
  finish: string;
  seatingCapacity?: string;
  storageType?: string;
  dimensions: string;
  deliveryDays: string;
  emiPerMonth?: number;
  warrantyYears?: number;
  features: string[];
  unitsSold: number;
  stock: number;
  // SEO & Meta Fields
  meta_title?: string;
  meta_description?: string;
  meta_keywords?: string[];
  createdAt: string;
}

export const PRODUCT_CATEGORIES = [
  { value: 'sofas', label: 'Sofas', room: 'Living' },
  { value: 'beds', label: 'Beds', room: 'Bedroom' },
  { value: 'wardrobes', label: 'Wardrobes', room: 'Bedroom' },
  { value: 'dining', label: 'Dining Sets', room: 'Dining' },
  { value: 'dining-tables', label: 'Dining Tables', room: 'Dining' },
  { value: 'dining-chairs', label: 'Dining Chairs', room: 'Dining' },
  { value: 'shoe-racks', label: 'Shoe Racks', room: 'Living' },
  { value: 'study-desks', label: 'Study Desks', room: 'Study & Office' },
  { value: 'kitchen-cabinets', label: 'Kitchen Cabinets', room: 'Dining' },
  { value: 'bookshelves', label: 'Bookshelves', room: 'Study & Office' },
  { value: 'tv-units', label: 'TV Units', room: 'Living' },
  { value: 'coffee-tables', label: 'Coffee Tables', room: 'Living' },
  { value: 'mattresses', label: 'Mattresses', room: 'Bedroom' },
  { value: 'recliners', label: 'Recliners', room: 'Living' },
  { value: 'lighting', label: 'Lighting & Decor', room: 'Living' },
  { value: 'outdoor', label: 'Outdoor Furniture', room: 'Outdoor' },
  { value: 'storage', label: 'Storage & Organization', room: 'Living' },
];

export const ROOM_OPTIONS = [
  'Living',
  'Bedroom',
  'Dining',
  'Study & Office',
  'Outdoor',
  'Kitchen',
];

export const BADGE_OPTIONS = [
  'Bestseller',
  'Trending',
  'Great Value',
  'Premium',
  'New Arrival',
  'Compact Special',
  'Hydraulic',
  'Ergonomic',
  'Modular',
  'Limited Edition',
];

// CSV template column headers
export const CSV_TEMPLATE_HEADERS = [
  'id',
  'slug',
  'name',
  'subtitle',
  'category',
  'childCategory',
  'room',
  'price',
  'originalPrice',
  'discountPercentage',
  'rating',
  'reviewCount',
  'imageUrl',
  'secondaryImageUrl',
  'images',
  'badge',
  'inStock',
  'material',
  'finish',
  'seatingCapacity',
  'storageType',
  'dimensions',
  'deliveryDays',
  'emiPerMonth',
  'warrantyYears',
  'features',
  'unitsSold',
  'stock',
  'meta_title',
  'meta_description',
  'meta_keywords',
];

/**
 * Parse a CSV string into an array of AdminProduct objects.
 * Handles quoted fields and comma-separated sub-values for images/features/keywords.
 */
export function parseCsvToProducts(csvText: string): { products: AdminProduct[]; errors: string[] } {
  const errors: string[] = [];
  const lines = csvText.split(/\r?\n/).filter((line) => line.trim().length > 0);

  if (lines.length < 2) {
    return { products: [], errors: ['CSV must have a header row and at least one data row.'] };
  }

  const headers = parseCsvLine(lines[0]).map((h) => h.trim().toLowerCase());
  const products: AdminProduct[] = [];

  for (let i = 1; i < lines.length; i++) {
    try {
      const values = parseCsvLine(lines[i]);
      const row: Record<string, string> = {};
      headers.forEach((h, idx) => {
        row[h] = values[idx]?.trim() || '';
      });

      const rawKeywords = row.meta_keywords || row.metakeywords || '';
      const keywords = rawKeywords
        ? rawKeywords.split(/[|,]/).map((k) => k.trim()).filter(Boolean)
        : [];

      const product: AdminProduct = {
        id: row.id || `PRD-${Date.now()}-${i}`,
        slug: row.slug || row.name?.toLowerCase().replace(/[^a-z0-9]+/g, '-') || `product-${i}`,
        name: row.name || `Unnamed Product ${i}`,
        subtitle: row.subtitle || '',
        category: row.category || 'sofas',
        childCategory: row.childcategory || row.child_category || '',
        room: row.room || 'Living',
        price: parseFloat(row.price) || 0,
        originalPrice: parseFloat(row.originalprice) || parseFloat(row.price) || 0,
        discountPercentage: parseFloat(row.discountpercentage) || 0,
        rating: parseFloat(row.rating) || 4.5,
        reviewCount: parseInt(row.reviewcount) || 0,
        imageUrl: row.imageurl || '',
        secondaryImageUrl: row.secondaryimageurl || '',
        images: row.images ? row.images.split('|').map((s) => s.trim()).filter(Boolean) : [],
        badge: row.badge || '',
        inStock: row.instock?.toLowerCase() !== 'false',
        material: row.material || '',
        finish: row.finish || '',
        seatingCapacity: row.seatingcapacity || '',
        storageType: row.storagetype || '',
        dimensions: row.dimensions || '',
        deliveryDays: row.deliverydays || '3-5 Days',
        emiPerMonth: parseInt(row.emipermonth) || undefined,
        warrantyYears: parseInt(row.warrantyyears) || undefined,
        features: row.features ? row.features.split('|').map((s) => s.trim()).filter(Boolean) : [],
        unitsSold: parseInt(row.unitssold) || 0,
        stock: parseInt(row.stock) || 0,
        meta_title: row.meta_title || row.metatitle || `${row.name || ''} | Buy Online at Urbn Furnish`,
        meta_description: row.meta_description || row.metadescription || row.subtitle || '',
        meta_keywords: keywords,
        createdAt: new Date().toISOString(),
      };

      if (!product.name || product.name === `Unnamed Product ${i}`) {
        errors.push(`Row ${i + 1}: Missing product name.`);
      }
      if (product.price <= 0) {
        errors.push(`Row ${i + 1}: Invalid price for "${product.name}".`);
      }

      products.push(product);
    } catch {
      errors.push(`Row ${i + 1}: Failed to parse row.`);
    }
  }

  return { products, errors };
}

/**
 * Parse a single CSV line, respecting quoted fields.
 */
function parseCsvLine(line: string): string[] {
  const result: string[] = [];
  let current = '';
  let inQuotes = false;

  for (let i = 0; i < line.length; i++) {
    const char = line[i];
    if (char === '"') {
      if (inQuotes && line[i + 1] === '"') {
        current += '"';
        i++;
      } else {
        inQuotes = !inQuotes;
      }
    } else if (char === ',' && !inQuotes) {
      result.push(current);
      current = '';
    } else {
      current += char;
    }
  }
  result.push(current);
  return result;
}

/**
 * Generate a downloadable CSV template string.
 */
export function generateCsvTemplate(): string {
  const header = CSV_TEMPLATE_HEADERS.join(',');
  const sampleRow = [
    'PRD-001',
    'nordic-oak-dining-table',
    'Nordic Oak Dining Table',
    'Solid oak wood with natural finish',
    'dining',
    'dining-sets',
    'Dining',
    '21988',
    '43976',
    '50',
    '4.8',
    '245',
    'https://images.unsplash.com/photo-1615066390971-03e4e1c36ddf?w=400',
    '',
    'https://images.unsplash.com/photo-1615066390971-03e4e1c36ddf?w=1200',
    'Bestseller',
    'true',
    'Solid Mango Wood',
    'Natural Finish',
    '4 Seater',
    'Without Storage',
    '32L x 32W x 30H in',
    '3-5 Days',
    '1065',
    '5',
    'Solid Mango Hardwood|Termite Resistant|Handcrafted Finish',
    '342',
    '24',
    'Nordic Oak 4 Seater Dining Table | Urbn Furnish',
    'Buy luxury Solid Mango Wood Dining Table online with 5 years warranty and free shipping across India.',
    'dining table, oak dining table, 4 seater dining set, mango wood furniture',
  ].join(',');

  return `${header}\n${sampleRow}`;
}

// Seed data — realistic furniture products matching client-side catalog
export const SEED_PRODUCTS: AdminProduct[] = [
  {
    id: 'PRD-101',
    slug: 'lorenz-3-1-1-seater-sofa-set-salmon-pink',
    name: 'Lorenz 3+1+1 Seater Sofa Set (Velvet, Salmon Pink)',
    subtitle: 'Premium velvet finish with solid wood frame & deep foam cushioning',
    category: 'sofas',
    childCategory: 'sofa-sets',
    room: 'Living',
    price: 99999,
    originalPrice: 173999,
    discountPercentage: 43,
    rating: 4.9,
    reviewCount: 428,
    imageUrl: 'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=400&auto=format&fit=crop&q=80',
    secondaryImageUrl: 'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=400&auto=format&fit=crop&q=80',
    images: [
      'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=1200&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=1200&auto=format&fit=crop&q=80',
    ],
    badge: 'Bestseller',
    inStock: true,
    material: 'Premium Velvet & Solid Hardwood',
    finish: 'Salmon Pink',
    seatingCapacity: '3+1+1 Seater',
    storageType: 'Without Storage',
    dimensions: '3-Seater: 78L x 34W x 34H in, 1-Seater: 36L x 34W x 34H in',
    deliveryDays: '2-4 Days',
    emiPerMonth: 4849,
    warrantyYears: 5,
    features: [
      'Plush 380 GSM High-Density Velvet',
      'Solid Sal Wood Anti-Sagging Internal Structure',
      'High Resilience 32D Polyurethane Foam',
      '5-Year Manufacturer Warranty',
    ],
    unitsSold: 428,
    stock: 18,
    meta_title: 'Lorenz 3+1+1 Seater Velvet Sofa Set Salmon Pink | Urbn Furnish',
    meta_description: 'Shop Lorenz 3+1+1 Velvet Sofa Set in Salmon Pink with high-density foam, 5-year warranty and free home delivery.',
    meta_keywords: ['sofa set', 'velvet sofa', '3 1 1 seater sofa', 'salmon pink sofa', 'luxury living room'],
    createdAt: '2026-01-15T10:00:00Z',
  },
  {
    id: 'PRD-102',
    slug: 'marriott-3-seater-wooden-sofa',
    name: 'Marriott 3 Seater Wooden Sofa (Teak Finish)',
    subtitle: 'High density foam with premium textured fabric',
    category: 'sofas',
    room: 'Living',
    price: 24999,
    originalPrice: 49999,
    discountPercentage: 50,
    rating: 4.9,
    reviewCount: 428,
    imageUrl: 'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=400&auto=format&fit=crop&q=80',
    images: [],
    badge: 'Bestseller',
    inStock: true,
    material: 'Sheesham Wood',
    finish: 'Honey Teak',
    seatingCapacity: '3 Seater',
    storageType: 'Without Storage',
    dimensions: '76 W x 32 D x 34 H inches',
    deliveryDays: '3-5 Days',
    emiPerMonth: 1199,
    warrantyYears: 5,
    features: ['Solid Sheesham Hardwood', 'Termite Resistant', 'Washable Cushion Covers'],
    unitsSold: 342,
    stock: 24,
    createdAt: '2026-01-20T10:00:00Z',
  },
  {
    id: 'PRD-103',
    slug: 'solano-l-shape-luxury-velvet-sectional-sofa',
    name: 'Solano L-Shape Luxury Velvet Sectional Sofa',
    subtitle: 'Royal emerald green plush velvet upholstery',
    category: 'sofas',
    room: 'Living',
    price: 42999,
    originalPrice: 79999,
    discountPercentage: 46,
    rating: 4.8,
    reviewCount: 284,
    imageUrl: 'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=400&auto=format&fit=crop&q=80',
    images: [],
    badge: 'Trending',
    inStock: true,
    material: 'Velvet Fabric',
    finish: 'Forest Green',
    seatingCapacity: 'L-Shape',
    storageType: 'With Box Storage',
    dimensions: '102 W x 60 D x 33 H inches',
    deliveryDays: '2-4 Days',
    emiPerMonth: 2099,
    warrantyYears: 5,
    features: ['High Resilience Foam', 'Ottoman Storage Compartment', 'Solid Sal Wood Frame'],
    unitsSold: 284,
    stock: 12,
    createdAt: '2026-02-05T10:00:00Z',
  },
  {
    id: 'PRD-104',
    slug: 'calmore-king-bed-drawer-storage',
    name: 'Calmore Solid Sheesham King Bed with Pull-Out Drawers',
    subtitle: 'Heavy duty solid Sheesham with 4 spacious sliding drawers',
    category: 'beds',
    room: 'Bedroom',
    price: 28999,
    originalPrice: 57999,
    discountPercentage: 50,
    rating: 4.9,
    reviewCount: 512,
    imageUrl: 'https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?w=400&auto=format&fit=crop&q=80',
    images: [],
    badge: 'Bestseller',
    inStock: true,
    material: 'Sheesham Wood',
    finish: 'Honey Teak',
    seatingCapacity: 'King Size',
    storageType: 'Drawer Storage',
    dimensions: '78 W x 72 D x 42 H inches',
    deliveryDays: '2-4 Days',
    emiPerMonth: 1399,
    warrantyYears: 5,
    features: ['4-Side Drawer Storage', 'Seasoned Hardwood Slats', 'Headboard Cushion Rest'],
    unitsSold: 512,
    stock: 8,
    createdAt: '2026-02-10T10:00:00Z',
  },
  {
    id: 'PRD-105',
    slug: 'aurora-hydraulic-storage-queen-bed',
    name: 'Aurora Hydraulic Lift-Up Queen Bed (Teak Finish)',
    subtitle: 'German gas-lift hydraulic mechanism for effortless storage access',
    category: 'beds',
    room: 'Bedroom',
    price: 33499,
    originalPrice: 62999,
    discountPercentage: 47,
    rating: 4.8,
    reviewCount: 320,
    imageUrl: 'https://images.unsplash.com/photo-1540518614846-7ede433c4550?w=400&auto=format&fit=crop&q=80',
    images: [],
    badge: 'Hydraulic',
    inStock: true,
    material: 'Teak Wood',
    finish: 'Warm Walnut',
    seatingCapacity: 'Queen Size',
    storageType: 'Hydraulic Storage',
    dimensions: '72 W x 66 D x 40 H inches',
    deliveryDays: '3-5 Days',
    emiPerMonth: 1620,
    warrantyYears: 5,
    features: ['German Gas-Lift Mechanism', 'Full Bed-Length Storage', 'Solid Teak Frame'],
    unitsSold: 198,
    stock: 5,
    createdAt: '2026-02-15T10:00:00Z',
  },
  {
    id: 'PRD-106',
    slug: 'sensa-4-seater-dining-set',
    name: 'Sensa 4 Seater Dining Set',
    subtitle: 'Solid Mango Wood in Natural Finish with Red Mango upholstery',
    category: 'dining',
    room: 'Dining',
    price: 21988,
    originalPrice: 43976,
    discountPercentage: 50,
    rating: 4.8,
    reviewCount: 245,
    imageUrl: 'https://images.unsplash.com/photo-1617806118233-18e1de247200?w=400&auto=format&fit=crop&q=80',
    images: [],
    badge: 'Bestseller',
    inStock: true,
    material: 'Solid Mango Wood',
    finish: 'Natural Finish',
    seatingCapacity: '4 Seater',
    storageType: 'Without Storage',
    dimensions: 'Table: 32L x 32W x 30H in, Chair: 16L x 16W x 36H in',
    deliveryDays: '3-5 Days',
    emiPerMonth: 1065,
    warrantyYears: 5,
    features: [
      'Compact Space-Efficient Footprint',
      'Seasoned Solid Mango Wood Frame',
      'Stain-Resistant Matte PU Sealant',
      'Ergonomically Contoured Chair Backrests',
    ],
    unitsSold: 245,
    stock: 20,
    createdAt: '2026-03-01T10:00:00Z',
  },
  {
    id: 'PRD-107',
    slug: 'providence-tall-pantry-kitchen-cabinet',
    name: 'Providence Tall Pantry & Crockery Kitchen Cabinet',
    subtitle: 'Upper fluted glass display unit with microwave ledge',
    category: 'kitchen-cabinets',
    room: 'Dining',
    price: 32999,
    originalPrice: 64999,
    discountPercentage: 49,
    rating: 4.8,
    reviewCount: 130,
    imageUrl: 'https://images.unsplash.com/photo-1556911220-e15b29be8c8f?w=400&auto=format&fit=crop&q=80',
    images: [],
    badge: 'Modular',
    inStock: true,
    material: 'Teak Wood',
    finish: 'Honey Teak',
    seatingCapacity: 'Tall Unit',
    storageType: 'Box Storage',
    dimensions: '36 W x 18 D x 74 H inches',
    deliveryDays: '4-6 Days',
    emiPerMonth: 1590,
    warrantyYears: 5,
    features: ['Fluted Glass Display', 'Microwave Ledge', 'Lower Closed Storage'],
    unitsSold: 130,
    stock: 14,
    createdAt: '2026-03-05T10:00:00Z',
  },
  {
    id: 'PRD-108',
    slug: 'brass-architectural-floor-lamp',
    name: 'Brass Architectural Floor Lamp',
    subtitle: 'Modern brass finish with adjustable arm and linen shade',
    category: 'lighting',
    room: 'Living',
    price: 8499,
    originalPrice: 16999,
    discountPercentage: 50,
    rating: 4.7,
    reviewCount: 415,
    imageUrl: 'https://images.unsplash.com/photo-1507473885765-e6ed057f782c?w=400&auto=format&fit=crop&q=80',
    images: [],
    badge: 'Trending',
    inStock: true,
    material: 'Brass & Linen',
    finish: 'Antique Brass',
    dimensions: '12 W x 12 D x 60 H inches',
    deliveryDays: '2-3 Days',
    warrantyYears: 2,
    features: ['Adjustable Arm', 'Linen Shade', 'Weighted Base'],
    unitsSold: 415,
    stock: 45,
    createdAt: '2026-03-10T10:00:00Z',
  },
  {
    id: 'PRD-109',
    slug: 'hampton-3-tier-shoe-rack',
    name: 'Hampton 3 Tier Solid Wood Shoe Rack',
    subtitle: 'Compact vertical design with open shelving for easy access',
    category: 'shoe-racks',
    room: 'Living',
    price: 5999,
    originalPrice: 11999,
    discountPercentage: 50,
    rating: 4.6,
    reviewCount: 178,
    imageUrl: 'https://images.unsplash.com/photo-1595428774223-ef52624120d2?w=400&auto=format&fit=crop&q=80',
    images: [],
    badge: 'Great Value',
    inStock: true,
    material: 'Sheesham Wood',
    finish: 'Honey Teak',
    storageType: 'Open Shelves',
    dimensions: '30 W x 12 D x 36 H inches',
    deliveryDays: '2-4 Days',
    emiPerMonth: 290,
    warrantyYears: 3,
    features: ['3-Tier Open Shelving', 'Holds 12 Pairs', 'Anti-Skid Feet'],
    unitsSold: 178,
    stock: 52,
    createdAt: '2026-03-15T10:00:00Z',
  },
  {
    id: 'PRD-110',
    slug: 'cambridge-study-desk-with-drawers',
    name: 'Cambridge Executive Study Desk with Drawers',
    subtitle: 'Spacious workspace with 3-drawer pedestal and cable management',
    category: 'study-desks',
    room: 'Study & Office',
    price: 18499,
    originalPrice: 36999,
    discountPercentage: 50,
    rating: 4.9,
    reviewCount: 290,
    imageUrl: 'https://images.unsplash.com/photo-1518455027359-f3f8164ba6bd?w=400&auto=format&fit=crop&q=80',
    images: [],
    badge: 'Ergonomic',
    inStock: true,
    material: 'Sheesham Wood',
    finish: 'Warm Walnut',
    seatingCapacity: 'Study Desk',
    storageType: 'Drawer Storage',
    dimensions: '48 W x 24 D x 30 H inches',
    deliveryDays: '2-4 Days',
    emiPerMonth: 890,
    warrantyYears: 5,
    features: ['3-Drawer Pedestal', 'Cable Management Holes', 'Ergonomic Height'],
    unitsSold: 290,
    stock: 30,
    createdAt: '2026-03-20T10:00:00Z',
  },
];

export const PRODUCTS_STORAGE_KEY = 'urbn_admin_products_v1';

/**
 * Retrieve all products combining localStorage additions and seed data
 */
export function getAllProducts(): AdminProduct[] {
  if (typeof window === 'undefined') return SEED_PRODUCTS;
  try {
    const raw = localStorage.getItem(PRODUCTS_STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) {
        return parsed;
      }
    }
  } catch (err) {
    console.error('Error reading products from storage:', err);
  }
  return SEED_PRODUCTS;
}

/**
 * Get a specific product by exact ID or slug
 */
export function getProductById(idOrSlug: string): AdminProduct | undefined {
  if (!idOrSlug) return undefined;
  const list = getAllProducts();
  const normalized = idOrSlug.trim().toLowerCase();
  return list.find(
    (p) => p.id.toLowerCase() === normalized || p.slug.toLowerCase() === normalized
  );
}

/**
 * Search products for manufacturing lookup
 */
export function searchProductsForManufacturing(query: string): AdminProduct[] {
  const list = getAllProducts();
  if (!query || !query.trim()) return list;
  const q = query.trim().toLowerCase();
  return list.filter(
    (p) =>
      p.id.toLowerCase().includes(q) ||
      p.name.toLowerCase().includes(q) ||
      p.material.toLowerCase().includes(q) ||
      p.finish.toLowerCase().includes(q) ||
      p.category.toLowerCase().includes(q) ||
      (p.seatingCapacity && p.seatingCapacity.toLowerCase().includes(q)) ||
      (p.storageType && p.storageType.toLowerCase().includes(q))
  );
}

