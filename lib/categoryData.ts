/**
 * Category Hierarchy & Taxonomy Data Model (3-Tier)
 * Tier 1: Room
 * Tier 2: Subcategory (Product Category in Room)
 * Tier 3: Child Category (Specific variants/types in Subcategory)
 */

export interface ChildCategory {
  id: string;
  name: string;
  slug: string;
  description?: string;
  itemCount: number;
  status: 'Active' | 'Inactive';
}

export interface SubCategory {
  id: string;
  name: string;
  slug: string;
  iconName?: string;
  description?: string;
  itemCount: number;
  status: 'Active' | 'Inactive';
  childCategories: ChildCategory[];
}

export interface RoomCategory {
  id: string;
  name: string;
  slug: string;
  iconName: string;
  description: string;
  colorScheme: string;
  status: 'Active' | 'Inactive';
  subCategories: SubCategory[];
}

export const INITIAL_ROOM_CATEGORIES: RoomCategory[] = [
  {
    id: 'room-living',
    name: 'Living Room',
    slug: 'living-room',
    iconName: 'Sofa',
    description: 'Central comfort furniture, modular sofas, entertainment consoles, and ambient decor.',
    colorScheme: 'from-amber-500/20 to-orange-500/10 text-amber-600',
    status: 'Active',
    subCategories: [
      {
        id: 'sub-sofas',
        name: 'Sofas & Couches',
        slug: 'sofas',
        iconName: 'Armchair',
        description: 'Plush velvet, fabric, and solid wood sofa sets.',
        itemCount: 42,
        status: 'Active',
        childCategories: [
          { id: 'child-3-seater', name: '3 Seater Sofas', slug: '3-seater-sofas', itemCount: 18, status: 'Active' },
          { id: 'child-l-shape', name: 'L-Shape Sectionals', slug: 'l-shape-sectionals', itemCount: 12, status: 'Active' },
          { id: 'child-recliners', name: 'Recliners & Lounge Chairs', slug: 'recliners', itemCount: 7, status: 'Active' },
          { id: 'child-sofa-beds', name: 'Sofa Cum Beds', slug: 'sofa-cum-beds', itemCount: 5, status: 'Active' },
        ],
      },
      {
        id: 'sub-tv-units',
        name: 'TV Entertainment Units',
        slug: 'tv-units',
        iconName: 'Tv',
        description: 'Wall-mounted and floor-standing entertainment consoles.',
        itemCount: 16,
        status: 'Active',
        childCategories: [
          { id: 'child-wall-tv', name: 'Wall Mounted TV Units', slug: 'wall-mounted-tv-units', itemCount: 9, status: 'Active' },
          { id: 'child-floor-tv', name: 'Floor Rested Consoles', slug: 'floor-rested-consoles', itemCount: 7, status: 'Active' },
        ],
      },
      {
        id: 'sub-coffee-tables',
        name: 'Coffee & Center Tables',
        slug: 'coffee-tables',
        iconName: 'Coffee',
        description: 'Solid Sheesham, glass top, and nesting coffee tables.',
        itemCount: 22,
        status: 'Active',
        childCategories: [
          { id: 'child-nesting-tables', name: 'Nesting Coffee Tables', slug: 'nesting-coffee-tables', itemCount: 8, status: 'Active' },
          { id: 'child-storage-tables', name: 'Center Tables with Storage', slug: 'center-tables-with-storage', itemCount: 14, status: 'Active' },
        ],
      },
      {
        id: 'sub-shoe-racks',
        name: 'Shoe Racks & Cabinets',
        slug: 'shoe-racks',
        iconName: 'Archive',
        description: 'Ventilated wooden and cushioned shoe cabinets.',
        itemCount: 14,
        status: 'Active',
        childCategories: [
          { id: 'child-open-shoe-racks', name: 'Open Tier Racks', slug: 'open-tier-shoe-racks', itemCount: 6, status: 'Active' },
          { id: 'child-closed-shoe-cabinets', name: 'Closed Shutter Cabinets', slug: 'closed-shoe-cabinets', itemCount: 8, status: 'Active' },
        ],
      },
    ],
  },
  {
    id: 'room-bedroom',
    name: 'Bedroom & Mattresses',
    slug: 'bedroom',
    iconName: 'Bed',
    description: 'Ergonomic king and queen beds, hydraulic storage, wardrobes, and posture mattresses.',
    colorScheme: 'from-blue-500/20 to-indigo-500/10 text-blue-600',
    status: 'Active',
    subCategories: [
      {
        id: 'sub-beds',
        name: 'Beds & Frames',
        slug: 'beds',
        iconName: 'BedDouble',
        description: 'Solid wood king, queen, and hydraulic storage beds.',
        itemCount: 38,
        status: 'Active',
        childCategories: [
          { id: 'child-king-beds', name: 'King Size Beds', slug: 'king-beds', itemCount: 16, status: 'Active' },
          { id: 'child-queen-beds', name: 'Queen Size Beds', slug: 'queen-beds', itemCount: 14, status: 'Active' },
          { id: 'child-hydraulic-beds', name: 'Hydraulic Storage Beds', slug: 'hydraulic-beds', itemCount: 8, status: 'Active' },
        ],
      },
      {
        id: 'sub-wardrobes',
        name: 'Wardrobes & Closets',
        slug: 'wardrobes',
        iconName: 'Layers',
        description: '2-door, 3-door, and sliding mirror wardrobes.',
        itemCount: 20,
        status: 'Active',
        childCategories: [
          { id: 'child-2-door', name: '2 Door Wardrobes', slug: '2-door-wardrobes', itemCount: 7, status: 'Active' },
          { id: 'child-3-door', name: '3 Door Wardrobes', slug: '3-door-wardrobes', itemCount: 8, status: 'Active' },
          { id: 'child-sliding', name: 'Sliding Door Wardrobes', slug: 'sliding-wardrobes', itemCount: 5, status: 'Active' },
        ],
      },
      {
        id: 'sub-mattresses',
        name: 'Mattresses & Pillows',
        slug: 'mattresses',
        iconName: 'Cloud',
        description: 'Orthopedic memory foam and pocket spring mattresses.',
        itemCount: 15,
        status: 'Active',
        childCategories: [
          { id: 'child-ortho-mattress', name: 'Orthopedic Foam', slug: 'orthopedic-foam-mattress', itemCount: 8, status: 'Active' },
          { id: 'child-spring-mattress', name: 'Pocket Spring', slug: 'pocket-spring-mattress', itemCount: 7, status: 'Active' },
        ],
      },
    ],
  },
  {
    id: 'room-dining',
    name: 'Dining & Kitchen',
    slug: 'dining-kitchen',
    iconName: 'Utensils',
    description: 'Solid wood dining sets, designer chairs, bar stools, and pantry cabinets.',
    colorScheme: 'from-emerald-500/20 to-teal-500/10 text-emerald-600',
    status: 'Active',
    subCategories: [
      {
        id: 'sub-dining-sets',
        name: 'Dining Table Sets',
        slug: 'dining-sets',
        iconName: 'UtensilsCrossed',
        description: '4-seater, 6-seater, and extendable solid wood dining sets.',
        itemCount: 26,
        status: 'Active',
        childCategories: [
          { id: 'child-4-seater-dining', name: '4 Seater Dining Sets', slug: '4-seater-dining', itemCount: 12, status: 'Active' },
          { id: 'child-6-seater-dining', name: '6 Seater Dining Sets', slug: '6-seater-dining', itemCount: 10, status: 'Active' },
          { id: 'child-8-seater-dining', name: '8 Seater Dining Sets', slug: '8-seater-dining', itemCount: 4, status: 'Active' },
        ],
      },
      {
        id: 'sub-kitchen-cabinets',
        name: 'Kitchen Cabinets & Crockery',
        slug: 'kitchen-cabinets',
        iconName: 'Box',
        description: 'Fluted glass crockery units and microwave pantries.',
        itemCount: 18,
        status: 'Active',
        childCategories: [
          { id: 'child-crockery-units', name: 'Glass Crockery Units', slug: 'glass-crockery-units', itemCount: 10, status: 'Active' },
          { id: 'child-kitchen-pantries', name: 'Tall Kitchen Pantries', slug: 'tall-kitchen-pantries', itemCount: 8, status: 'Active' },
        ],
      },
    ],
  },
  {
    id: 'room-study',
    name: 'Study & Workspaces',
    slug: 'study-office',
    iconName: 'Briefcase',
    description: 'Executive study desks, ergonomic chairs, bookshelves, and office workstations.',
    colorScheme: 'from-purple-500/20 to-violet-500/10 text-purple-600',
    status: 'Active',
    subCategories: [
      {
        id: 'sub-study-desks',
        name: 'Study Desks & Workstations',
        slug: 'study-desks',
        iconName: 'Laptop',
        description: 'Ergonomic study desks with integrated drawers and cable management.',
        itemCount: 24,
        status: 'Active',
        childCategories: [
          { id: 'child-writing-desks', name: 'Writing & Computer Desks', slug: 'writing-computer-desks', itemCount: 14, status: 'Active' },
          { id: 'child-standing-desks', name: 'Height Adjustable Desks', slug: 'height-adjustable-desks', itemCount: 10, status: 'Active' },
        ],
      },
      {
        id: 'sub-bookshelves',
        name: 'Bookshelves & Wall Shelves',
        slug: 'bookshelves',
        iconName: 'BookOpen',
        description: 'Geometric bookcases and modular wall display shelving.',
        itemCount: 19,
        status: 'Active',
        childCategories: [
          { id: 'child-floor-bookshelves', name: 'Floor Standing Bookcases', slug: 'floor-standing-bookcases', itemCount: 11, status: 'Active' },
          { id: 'child-wall-shelves', name: 'Floating Wall Shelves', slug: 'floating-wall-shelves', itemCount: 8, status: 'Active' },
        ],
      },
    ],
  },
  {
    id: 'room-decor',
    name: 'Lighting & Decor',
    slug: 'lighting-decor',
    iconName: 'Lamp',
    description: 'Architectural lamps, accent pendant lights, mirrors, and home decor items.',
    colorScheme: 'from-amber-500/20 to-yellow-500/10 text-amber-600',
    status: 'Active',
    subCategories: [
      {
        id: 'sub-lighting',
        name: 'Floor & Table Lamps',
        slug: 'lighting',
        iconName: 'Sparkles',
        description: 'Floor standing brass lamps and bedside ambient lamps.',
        itemCount: 30,
        status: 'Active',
        childCategories: [
          { id: 'child-floor-lamps', name: 'Architectural Floor Lamps', slug: 'architectural-floor-lamps', itemCount: 18, status: 'Active' },
          { id: 'child-table-lamps', name: 'Bedside Table Lamps', slug: 'bedside-table-lamps', itemCount: 12, status: 'Active' },
        ],
      },
    ],
  },
];

const CATEGORY_STORAGE_KEY = 'urbn_furnish_categories_v1';

export function getStoredCategories(): RoomCategory[] {
  if (typeof window === 'undefined') return INITIAL_ROOM_CATEGORIES;
  try {
    const saved = localStorage.getItem(CATEGORY_STORAGE_KEY);
    if (saved) return JSON.parse(saved);
  } catch (e) {
    console.error('Failed to load categories from localStorage', e);
  }
  return INITIAL_ROOM_CATEGORIES;
}

export function saveStoredCategories(categories: RoomCategory[]): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(CATEGORY_STORAGE_KEY, JSON.stringify(categories));
  } catch (e) {
    console.error('Failed to save categories to localStorage', e);
  }
}
