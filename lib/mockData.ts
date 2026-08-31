/**
 * Mock data for Urbn Furnish E-Commerce Admin
 */

export interface EcomMetric {
  title: string;
  value: string;
  change: string;
  isPositive: boolean;
  timeframe: string;
  iconName: string;
}

export interface RecentOrder {
  id: string;
  customerName: string;
  customerEmail: string;
  customerAvatar?: string;
  date: string;
  itemsCount: number;
  totalAmount: number;
  paymentMethod: string;
  status: 'Delivered' | 'Processing' | 'Pending' | 'Shipped' | 'Cancelled';
}

export interface TopProduct {
  id: string;
  name: string;
  category: string;
  price: number;
  sales: number;
  stock: number;
  image: string;
  rating: number;
}

export const DASHBOARD_METRICS: EcomMetric[] = [
  {
    title: 'Total Revenue',
    value: '₹124,580.00',
    change: '+14.8%',
    isPositive: true,
    timeframe: 'vs last month',
    iconName: 'IndianRupee ',
  },
  {
    title: 'Total Orders',
    value: '3,842',
    change: '+8.2%',
    isPositive: true,
    timeframe: 'vs last month',
    iconName: 'ShoppingBag',
  },
  {
    title: 'Active Customers',
    value: '18,920',
    change: '+12.5%',
    isPositive: true,
    timeframe: 'vs last month',
    iconName: 'Users',
  },
  {
    title: 'Avg Order Value',
    value: '₹324.25',
    change: '+3.1%',
    isPositive: true,
    timeframe: 'vs last month',
    iconName: 'TrendingUp',
  },
];

export const RECENT_ORDERS: RecentOrder[] = [
  {
    id: 'ORD-9821',
    customerName: 'Eleanor Vance',
    customerEmail: 'eleanor.v@example.com',
    customerAvatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&auto=format&fit=crop&q=80',
    date: '10 mins ago',
    itemsCount: 3,
    totalAmount: 1240.0,
    paymentMethod: 'Credit Card',
    status: 'Processing',
  },
  {
    id: 'ORD-9820',
    customerName: 'Marcus Thorne',
    customerEmail: 'm.thorne@example.com',
    customerAvatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&auto=format&fit=crop&q=80',
    date: '35 mins ago',
    itemsCount: 1,
    totalAmount: 489.5,
    paymentMethod: 'Stripe',
    status: 'Delivered',
  },
  {
    id: 'ORD-9819',
    customerName: 'Sophia Lin',
    customerEmail: 'sophia.lin@example.com',
    customerAvatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100&auto=format&fit=crop&q=80',
    date: '2 hours ago',
    itemsCount: 2,
    totalAmount: 890.0,
    paymentMethod: 'PayPal',
    status: 'Shipped',
  },
  {
    id: 'ORD-9818',
    customerName: 'David K.',
    customerEmail: 'david.k@example.com',
    customerAvatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100&auto=format&fit=crop&q=80',
    date: '4 hours ago',
    itemsCount: 4,
    totalAmount: 2150.0,
    paymentMethod: 'Apple Pay',
    status: 'Pending',
  },
  {
    id: 'ORD-9817',
    customerName: 'Amara Chen',
    customerEmail: 'amara.c@example.com',
    customerAvatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=100&auto=format&fit=crop&q=80',
    date: '6 hours ago',
    itemsCount: 1,
    totalAmount: 320.0,
    paymentMethod: 'Credit Card',
    status: 'Cancelled',
  },
];

export const TOP_PRODUCTS: TopProduct[] = [
  {
    id: 'PRD-101',
    name: 'Nordic Oak Dining Table',
    category: 'Dining & Kitchen',
    price: 899.0,
    sales: 342,
    stock: 24,
    image: 'https://images.unsplash.com/photo-1615066390971-03e4e1c36ddf?w=120&auto=format&fit=crop&q=80',
    rating: 4.9,
  },
  {
    id: 'PRD-102',
    name: 'Velvet Ergonomic Lounge Chair',
    category: 'Living Room',
    price: 450.0,
    sales: 289,
    stock: 12,
    image: 'https://images.unsplash.com/photo-1580481077190-7361346d1808?w=120&auto=format&fit=crop&q=80',
    rating: 4.8,
  },
  {
    id: 'PRD-103',
    name: 'Minimalist Walnut Bed Frame',
    category: 'Bedroom',
    price: 1250.0,
    sales: 198,
    stock: 5,
    image: 'https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?w=120&auto=format&fit=crop&q=80',
    rating: 4.95,
  },
  {
    id: 'PRD-104',
    name: 'Brass Architectural Floor Lamp',
    category: 'Lighting',
    price: 210.0,
    sales: 415,
    stock: 45,
    image: 'https://images.unsplash.com/photo-1507473885765-e6ed057f782c?w=120&auto=format&fit=crop&q=80',
    rating: 4.7,
  },
];

export const GLOBAL_SEARCH_ITEMS = [
  { title: 'Add New Product', type: 'action' as const, path: '/products?action=new', category: 'Products' },
  { title: 'All Products Catalog', type: 'page' as const, path: '/products', category: 'Catalog' },
  { title: 'Pending Orders Queue', type: 'page' as const, path: '/orders?status=pending', category: 'Orders' },
  { title: 'Customer Directory', type: 'page' as const, path: '/customers', category: 'Customers' },
  { title: 'Inventory & Stock Alerts', type: 'page' as const, path: '/inventory', category: 'Inventory' },
  { title: 'Coupon & Promo Codes', type: 'page' as const, path: '/promotions', category: 'Marketing' },
  { title: 'Vendor Management', type: 'page' as const, path: '/vendors', category: 'Vendors' },
  { title: 'Financial Overview & Tax', type: 'page' as const, path: '/financials', category: 'Financials' },
  { title: 'Sales Analytics & Reports', type: 'page' as const, path: '/analytics', category: 'Analytics' },
  { title: 'Admin Roles & Permissions', type: 'page' as const, path: '/settings', category: 'Settings' },
];
