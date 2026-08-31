/**
 * Comprehensive Order Data Model & State Store for Urbn Furnish Admin
 * Reference style: Twillian Admin Orders & Order Details Architecture
 */

export type OrderStatus =
  | 'Pending'
  | 'Confirmed'
  | 'Processing'
  | 'Shipped'
  | 'Out for Delivery'
  | 'Delivered'
  | 'Cancelled'
  | 'Refunded';

export type PaymentStatus = 'Paid' | 'Pending' | 'Failed' | 'Refunded';
export type PaymentMethod = 'Credit Card' | 'Debit Card' | 'UPI / QR' | 'Net Banking' | 'Razorpay' | 'Cash on Delivery' | 'EMI';

export interface OrderItem {
  id: string;
  name: string;
  sku: string;
  category: string;
  variant: string;
  material?: string;
  finish?: string;
  dimensions?: string;
  imageUrl: string;
  unitPrice: number;
  quantity: number;
  total: number;
  warranty: string;
}

export interface CustomerInfo {
  id: string;
  name: string;
  email: string;
  phone: string;
  avatar?: string;
  ordersCount: number;
  lifetimeSpend: number;
  customerType: 'VIP Customer' | 'Repeat Buyer' | 'New Customer';
  joinedDate: string;
}

export interface AddressInfo {
  fullName: string;
  street: string;
  apartment?: string;
  landmark?: string;
  city: string;
  state: string;
  pinCode: string;
  country: string;
  phone: string;
  gstin?: string;
}

export interface FulfillmentInfo {
  carrier: string;
  trackingNumber: string;
  trackingUrl: string;
  shippingMethod: string;
  estimatedDelivery: string;
  shippedAt?: string;
  deliveredAt?: string;
}

export interface TimelineEvent {
  id: string;
  title: string;
  description: string;
  timestamp: string;
  actor: string;
  type: 'status_change' | 'payment' | 'note' | 'shipment' | 'system';
  badgeColor?: string;
}

export interface OrderNote {
  id: string;
  text: string;
  author: string;
  createdAt: string;
  isCustomerVisible: boolean;
}

export interface PricingSummary {
  subtotal: number;
  discount: number;
  couponCode?: string;
  cgst: number;
  sgst: number;
  totalTax: number;
  shipping: number;
  grandTotal: number;
}

export interface AdminOrder {
  id: string;
  orderNumber: string;
  date: string;
  createdAt: string;
  status: OrderStatus;
  paymentStatus: PaymentStatus;
  paymentMethod: PaymentMethod;
  transactionId: string;
  customer: CustomerInfo;
  shippingAddress: AddressInfo;
  billingAddress: AddressInfo;
  items: OrderItem[];
  pricing: PricingSummary;
  fulfillment: FulfillmentInfo;
  timeline: TimelineEvent[];
  notes: OrderNote[];
}

export const INITIAL_ORDERS: AdminOrder[] = [
  {
    id: 'ORD-9822',
    orderNumber: 'UF-2026-001006',
    date: 'Feb 26, 2026, 04:32 PM',
    createdAt: '2026-02-26T16:32:00Z',
    status: 'Processing',
    paymentStatus: 'Paid',
    paymentMethod: 'Razorpay',
    transactionId: 'pay_N0x9812Ka93Lm',
    customer: {
      id: 'CUST-8910',
      name: 'Aditya Vardhan Rao',
      email: 'aditya.vardhan@outlook.com',
      phone: '+91 98450 12890',
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=120&auto=format&fit=crop&q=80',
      ordersCount: 4,
      lifetimeSpend: 148900,
      customerType: 'VIP Customer',
      joinedDate: 'Nov 2024',
    },
    shippingAddress: {
      fullName: 'Aditya Vardhan Rao',
      street: 'Villa 14, Whispering Palms Estate, Outer Ring Road',
      apartment: 'Phase 2, Marathahalli-Sarjapur Junction',
      landmark: 'Near Embassy Tech Village',
      city: 'Bengaluru',
      state: 'Karnataka',
      pinCode: '560103',
      country: 'India',
      phone: '+91 98450 12890',
    },
    billingAddress: {
      fullName: 'Aditya Vardhan Rao',
      street: 'Villa 14, Whispering Palms Estate, Outer Ring Road',
      apartment: 'Phase 2, Marathahalli-Sarjapur Junction',
      city: 'Bengaluru',
      state: 'Karnataka',
      pinCode: '560103',
      country: 'India',
      phone: '+91 98450 12890',
      gstin: '29AAACA1234F1ZP',
    },
    items: [
      {
        id: 'PRD-101',
        name: 'Nordic Solid Sheesham 6-Seater Dining Table',
        sku: 'UF-NDT-6S-HONEY',
        category: 'Dining & Kitchen',
        variant: 'Honey Finish • Solid Sheesham Wood',
        material: 'Grade-A Sheesham Wood',
        finish: 'Matte Honey Lacquer',
        dimensions: '180cm L x 90cm W x 76cm H',
        imageUrl: 'https://images.unsplash.com/photo-1615066390971-03e4e1c36ddf?w=400&auto=format&fit=crop&q=80',
        unitPrice: 38999,
        quantity: 1,
        total: 38999,
        warranty: '5 Years Comprehensive Wood Warranty',
      },
      {
        id: 'PRD-102',
        name: 'Velvet Ergonomic Accent Lounge Chair',
        sku: 'UF-ALC-VELVET-EMERALD',
        category: 'Living Room',
        variant: 'Emerald Green • Brass Plated Legs',
        material: 'Premium Velvet & High-Density Foam',
        finish: 'Gold Brass Accents',
        dimensions: '82cm W x 78cm D x 85cm H',
        imageUrl: 'https://images.unsplash.com/photo-1580481077190-7361346d1808?w=400&auto=format&fit=crop&q=80',
        unitPrice: 16499,
        quantity: 2,
        total: 32998,
        warranty: '3 Years Fabric & Frame Warranty',
      }
    ],
    pricing: {
      subtotal: 71997,
      discount: 5000,
      couponCode: 'URBNLUXE10',
      cgst: 6029.73,
      sgst: 6029.73,
      totalTax: 12059.46,
      shipping: 0,
      grandTotal: 79056.46,
    },
    fulfillment: {
      carrier: 'Blue Dart Heavy Logistics',
      trackingNumber: 'BD-789210943IN',
      trackingUrl: 'https://www.bluedart.com/tracking?awb=BD-789210943IN',
      shippingMethod: 'White-Glove Assembly & Free In-Room Delivery',
      estimatedDelivery: 'March 03, 2026',
      shippedAt: '2026-02-27T10:00:00Z',
    },
    timeline: [
      {
        id: 'evt-1',
        title: 'Order Placed',
        description: 'Customer successfully placed order via Web checkout.',
        timestamp: 'Feb 26, 2026 • 04:32 PM',
        actor: 'Customer (Web)',
        type: 'system',
      },
      {
        id: 'evt-2',
        title: 'Payment Captured & Verified',
        description: 'Razorpay payment verified with ID pay_N0x9812Ka93Lm.',
        timestamp: 'Feb 26, 2026 • 04:33 PM',
        actor: 'Razorpay Gateway',
        type: 'payment',
      },
      {
        id: 'evt-3',
        title: 'Order Confirmed',
        description: 'Order confirmed and routed to Pune Central Warehouse.',
        timestamp: 'Feb 26, 2026 • 05:15 PM',
        actor: 'Admin (System Auto-Routing)',
        type: 'status_change',
      },
      {
        id: 'evt-4',
        title: 'Processing & Quality Inspection',
        description: 'Wood Polish & Pre-dispatch packaging quality inspection underway.',
        timestamp: 'Feb 27, 2026 • 09:40 AM',
        actor: 'Warehouse QA Manager',
        type: 'status_change',
      },
    ],
    notes: [
      {
        id: 'note-1',
        text: 'Customer requested delivery slot on weekend between 11 AM - 3 PM. Priority White Glove team assigned.',
        author: 'Rohit (Admin Support)',
        createdAt: 'Feb 26, 2026, 05:30 PM',
        isCustomerVisible: false,
      },
    ],
  },
  {
    id: 'ORD-9821',
    orderNumber: 'UF-2026-009821',
    date: 'Feb 27, 2026, 11:15 AM',
    createdAt: '2026-02-27T11:15:00Z',
    status: 'Processing',
    paymentStatus: 'Paid',
    paymentMethod: 'Credit Card',
    transactionId: 'ch_3N82J1Ka91902',
    customer: {
      id: 'CUST-1002',
      name: 'Eleanor Vance',
      email: 'eleanor.v@example.com',
      phone: '+91 97110 54321',
      avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=120&auto=format&fit=crop&q=80',
      ordersCount: 3,
      lifetimeSpend: 84500,
      customerType: 'Repeat Buyer',
      joinedDate: 'Jan 2025',
    },
    shippingAddress: {
      fullName: 'Eleanor Vance',
      street: 'Flat 702, Prestige Ocean Crest, Marine Drive',
      landmark: 'Opposite Sea View Promenade',
      city: 'Mumbai',
      state: 'Maharashtra',
      pinCode: '400020',
      country: 'India',
      phone: '+91 97110 54321',
    },
    billingAddress: {
      fullName: 'Eleanor Vance',
      street: 'Flat 702, Prestige Ocean Crest, Marine Drive',
      city: 'Mumbai',
      state: 'Maharashtra',
      pinCode: '400020',
      country: 'India',
      phone: '+91 97110 54321',
    },
    items: [
      {
        id: 'PRD-103',
        name: 'Minimalist Walnut King Bed Frame with Storage',
        sku: 'UF-BED-WLN-KG',
        category: 'Bedroom',
        variant: 'Walnut Finish • King Size (78x72 in)',
        material: 'Engineered Teak & Walnut Veneer',
        finish: 'Natural Satin Walnut',
        dimensions: '205cm L x 190cm W x 105cm H',
        imageUrl: 'https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?w=400&auto=format&fit=crop&q=80',
        unitPrice: 42999,
        quantity: 1,
        total: 42999,
        warranty: '5 Years Structural Warranty',
      },
      {
        id: 'PRD-104',
        name: 'Brass Architectural Arc Floor Lamp',
        sku: 'UF-LMP-BRASS-ARC',
        category: 'Lighting',
        variant: 'Brushed Brass • Warm LED Included',
        material: 'Forged Steel & Brass Coating',
        dimensions: '190cm H x 40cm Base',
        imageUrl: 'https://images.unsplash.com/photo-1507473885765-e6ed057f782c?w=400&auto=format&fit=crop&q=80',
        unitPrice: 7999,
        quantity: 1,
        total: 7999,
        warranty: '2 Years Electrical Warranty',
      }
    ],
    pricing: {
      subtotal: 50998,
      discount: 2500,
      couponCode: 'SAVE5',
      cgst: 4364.82,
      sgst: 4364.82,
      totalTax: 8729.64,
      shipping: 0,
      grandTotal: 57227.64,
    },
    fulfillment: {
      carrier: 'Delhivery Express Cargo',
      trackingNumber: 'DEL-992817441',
      trackingUrl: 'https://www.delhivery.com/track/package/DEL-992817441',
      shippingMethod: 'Express Ground White-Glove',
      estimatedDelivery: 'March 02, 2026',
    },
    timeline: [
      {
        id: 'evt-1',
        title: 'Order Placed',
        description: 'Payment successful via Visa ending in 4242.',
        timestamp: 'Feb 27, 2026 • 11:15 AM',
        actor: 'Customer',
        type: 'system',
      },
      {
        id: 'evt-2',
        title: 'Processing Started',
        description: 'Item reserved at Mumbai Hub and packing in progress.',
        timestamp: 'Feb 27, 2026 • 11:30 AM',
        actor: 'Warehouse System',
        type: 'status_change',
      },
    ],
    notes: [],
  },
  {
    id: 'ORD-9820',
    orderNumber: 'UF-2026-009820',
    date: 'Feb 27, 2026, 09:20 AM',
    createdAt: '2026-02-27T09:20:00Z',
    status: 'Delivered',
    paymentStatus: 'Paid',
    paymentMethod: 'UPI / QR',
    transactionId: 'upi_ref_8918237910',
    customer: {
      id: 'CUST-1003',
      name: 'Marcus Thorne',
      email: 'm.thorne@example.com',
      phone: '+91 99201 88371',
      avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=120&auto=format&fit=crop&q=80',
      ordersCount: 2,
      lifetimeSpend: 54900,
      customerType: 'Repeat Buyer',
      joinedDate: 'Dec 2024',
    },
    shippingAddress: {
      fullName: 'Marcus Thorne',
      street: '404 Green Acres, Indiranagar 100ft Road',
      landmark: 'Near Metro Station',
      city: 'Bengaluru',
      state: 'Karnataka',
      pinCode: '560038',
      country: 'India',
      phone: '+91 99201 88371',
    },
    billingAddress: {
      fullName: 'Marcus Thorne',
      street: '404 Green Acres, Indiranagar 100ft Road',
      city: 'Bengaluru',
      state: 'Karnataka',
      pinCode: '560038',
      country: 'India',
      phone: '+91 99201 88371',
    },
    items: [
      {
        id: 'PRD-102',
        name: 'Velvet Ergonomic Lounge Chair',
        sku: 'UF-ALC-MUSTARD',
        category: 'Living Room',
        variant: 'Mustard Yellow • Solid Oak Legs',
        imageUrl: 'https://images.unsplash.com/photo-1580481077190-7361346d1808?w=400&auto=format&fit=crop&q=80',
        unitPrice: 18499,
        quantity: 1,
        total: 18499,
        warranty: '3 Years Warranty',
      }
    ],
    pricing: {
      subtotal: 18499,
      discount: 0,
      cgst: 1664.91,
      sgst: 1664.91,
      totalTax: 3329.82,
      shipping: 0,
      grandTotal: 21828.82,
    },
    fulfillment: {
      carrier: 'Shadowfax Quick Delivery',
      trackingNumber: 'SFX-8812903',
      trackingUrl: 'https://www.shadowfax.in/track?order=SFX-8812903',
      shippingMethod: 'Express 48-Hour Delivery',
      estimatedDelivery: 'Feb 28, 2026',
      deliveredAt: 'Feb 28, 2026 • 02:15 PM',
    },
    timeline: [
      {
        id: 'evt-1',
        title: 'Order Placed',
        description: 'Placed by Marcus Thorne',
        timestamp: 'Feb 27, 2026 • 09:20 AM',
        actor: 'Customer',
        type: 'system',
      },
      {
        id: 'evt-2',
        title: 'Shipped',
        description: 'Dispatched from Bangalore Hub',
        timestamp: 'Feb 27, 2026 • 02:00 PM',
        actor: 'Logistics Team',
        type: 'shipment',
      },
      {
        id: 'evt-3',
        title: 'Delivered',
        description: 'Successfully delivered and signed by Marcus.',
        timestamp: 'Feb 28, 2026 • 02:15 PM',
        actor: 'Shadowfax Courier',
        type: 'status_change',
      },
    ],
    notes: [],
  },
  {
    id: 'ORD-9819',
    orderNumber: 'UF-2026-009819',
    date: 'Feb 27, 2026, 08:45 AM',
    createdAt: '2026-02-27T08:45:00Z',
    status: 'Shipped',
    paymentStatus: 'Paid',
    paymentMethod: 'Credit Card',
    transactionId: 'pay_paypal_9901823',
    customer: {
      id: 'CUST-1004',
      name: 'Sophia Lin',
      email: 'sophia.lin@example.com',
      phone: '+91 98860 99221',
      avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=120&auto=format&fit=crop&q=80',
      ordersCount: 1,
      lifetimeSpend: 28900,
      customerType: 'New Customer',
      joinedDate: 'Feb 2026',
    },
    shippingAddress: {
      fullName: 'Sophia Lin',
      street: 'B-302, Cyber Heights, HITEC City',
      city: 'Hyderabad',
      state: 'Telangana',
      pinCode: '500081',
      country: 'India',
      phone: '+91 98860 99221',
    },
    billingAddress: {
      fullName: 'Sophia Lin',
      street: 'B-302, Cyber Heights, HITEC City',
      city: 'Hyderabad',
      state: 'Telangana',
      pinCode: '500081',
      country: 'India',
      phone: '+91 98860 99221',
    },
    items: [
      {
        id: 'PRD-105',
        name: 'Artisan Solid Oak Bookshelf & Display Rack',
        sku: 'UF-BKS-OAK-5T',
        category: 'Study & Office',
        variant: 'Natural Oak • 5 Tiers',
        imageUrl: 'https://images.unsplash.com/photo-1594938298603-c8148c4dae35?w=400&auto=format&fit=crop&q=80',
        unitPrice: 24500,
        quantity: 1,
        total: 24500,
        warranty: '3 Years Warranty',
      }
    ],
    pricing: {
      subtotal: 24500,
      discount: 0,
      cgst: 2205,
      sgst: 2205,
      totalTax: 4410,
      shipping: 0,
      grandTotal: 28910,
    },
    fulfillment: {
      carrier: 'Blue Dart Logistics',
      trackingNumber: 'BD-88291024IN',
      trackingUrl: 'https://www.bluedart.com/tracking?awb=BD-88291024IN',
      shippingMethod: 'Express Ground Delivery',
      estimatedDelivery: 'March 01, 2026',
      shippedAt: '2026-02-27T14:00:00Z',
    },
    timeline: [
      {
        id: 'evt-1',
        title: 'Order Placed',
        description: 'Web order verified',
        timestamp: 'Feb 27, 2026 • 08:45 AM',
        actor: 'Customer',
        type: 'system',
      },
      {
        id: 'evt-2',
        title: 'Dispatched via Blue Dart',
        description: 'AWB BD-88291024IN created',
        timestamp: 'Feb 27, 2026 • 02:00 PM',
        actor: 'Warehouse Admin',
        type: 'shipment',
      }
    ],
    notes: [],
  },
  {
    id: 'ORD-9818',
    orderNumber: 'UF-2026-009818',
    date: 'Feb 26, 2026, 07:10 PM',
    createdAt: '2026-02-26T19:10:00Z',
    status: 'Pending',
    paymentStatus: 'Pending',
    paymentMethod: 'Cash on Delivery',
    transactionId: 'COD_PENDING_0018',
    customer: {
      id: 'CUST-1005',
      name: 'David Krishnamurthy',
      email: 'david.k@example.com',
      phone: '+91 94480 33910',
      avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=120&auto=format&fit=crop&q=80',
      ordersCount: 1,
      lifetimeSpend: 21500,
      customerType: 'New Customer',
      joinedDate: 'Feb 2026',
    },
    shippingAddress: {
      fullName: 'David Krishnamurthy',
      street: '12/A, Banjara Hills Road No. 3',
      city: 'Hyderabad',
      state: 'Telangana',
      pinCode: '500034',
      country: 'India',
      phone: '+91 94480 33910',
    },
    billingAddress: {
      fullName: 'David Krishnamurthy',
      street: '12/A, Banjara Hills Road No. 3',
      city: 'Hyderabad',
      state: 'Telangana',
      pinCode: '500034',
      country: 'India',
      phone: '+91 94480 33910',
    },
    items: [
      {
        id: 'PRD-106',
        name: 'Modern Upholstered 3-Seater Chesterfield Sofa',
        sku: 'UF-SOFA-CHF-3S',
        category: 'Living Room',
        variant: 'Charcoal Grey • High-Resilience Foam',
        imageUrl: 'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=400&auto=format&fit=crop&q=80',
        unitPrice: 38990,
        quantity: 1,
        total: 38990,
        warranty: '5 Years Foam & Frame Warranty',
      }
    ],
    pricing: {
      subtotal: 38990,
      discount: 0,
      cgst: 3509.1,
      sgst: 3509.1,
      totalTax: 7018.2,
      shipping: 0,
      grandTotal: 46008.2,
    },
    fulfillment: {
      carrier: 'Pending Courier Allocation',
      trackingNumber: 'Unassigned',
      trackingUrl: '#',
      shippingMethod: 'COD Standard Ground Delivery',
      estimatedDelivery: 'March 05, 2026',
    },
    timeline: [
      {
        id: 'evt-1',
        title: 'Order Placed (COD)',
        description: 'Customer selected Cash on Delivery. Phone verification pending.',
        timestamp: 'Feb 26, 2026 • 07:10 PM',
        actor: 'Customer',
        type: 'system',
      }
    ],
    notes: [
      {
        id: 'note-1',
        text: 'Please call customer before dispatch to confirm COD readiness.',
        author: 'System Bot',
        createdAt: 'Feb 26, 2026, 07:11 PM',
        isCustomerVisible: false,
      }
    ],
  },
  {
    id: 'ORD-9817',
    orderNumber: 'UF-2026-009817',
    date: 'Feb 26, 2026, 03:00 PM',
    createdAt: '2026-02-26T15:00:00Z',
    status: 'Cancelled',
    paymentStatus: 'Refunded',
    paymentMethod: 'Credit Card',
    transactionId: 'rfnd_882901230192',
    customer: {
      id: 'CUST-1006',
      name: 'Amara Chen',
      email: 'amara.c@example.com',
      phone: '+91 98190 77412',
      avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=120&auto=format&fit=crop&q=80',
      ordersCount: 2,
      lifetimeSpend: 42000,
      customerType: 'Repeat Buyer',
      joinedDate: 'Jan 2025',
    },
    shippingAddress: {
      fullName: 'Amara Chen',
      street: 'Flat 12, Lotus Towers, Viman Nagar',
      city: 'Pune',
      state: 'Maharashtra',
      pinCode: '411014',
      country: 'India',
      phone: '+91 98190 77412',
    },
    billingAddress: {
      fullName: 'Amara Chen',
      street: 'Flat 12, Lotus Towers, Viman Nagar',
      city: 'Pune',
      state: 'Maharashtra',
      pinCode: '411014',
      country: 'India',
      phone: '+91 98190 77412',
    },
    items: [
      {
        id: 'PRD-104',
        name: 'Brass Architectural Floor Lamp',
        sku: 'UF-LMP-BRASS-ARC',
        category: 'Lighting',
        variant: 'Brass Polish',
        imageUrl: 'https://images.unsplash.com/photo-1507473885765-e6ed057f782c?w=400&auto=format&fit=crop&q=80',
        unitPrice: 7999,
        quantity: 1,
        total: 7999,
        warranty: '2 Years Warranty',
      }
    ],
    pricing: {
      subtotal: 7999,
      discount: 0,
      cgst: 719.91,
      sgst: 719.91,
      totalTax: 1439.82,
      shipping: 0,
      grandTotal: 9438.82,
    },
    fulfillment: {
      carrier: 'Cancelled',
      trackingNumber: 'N/A',
      trackingUrl: '#',
      shippingMethod: 'Standard',
      estimatedDelivery: 'Cancelled',
    },
    timeline: [
      {
        id: 'evt-1',
        title: 'Order Placed',
        description: 'Order placed by customer.',
        timestamp: 'Feb 26, 2026 • 03:00 PM',
        actor: 'Customer',
        type: 'system',
      },
      {
        id: 'evt-2',
        title: 'Order Cancelled & Refund Initiated',
        description: 'Customer requested cancellation due to wrong delivery address selection. Full refund initiated.',
        timestamp: 'Feb 26, 2026 • 03:25 PM',
        actor: 'Admin (Manual Action)',
        type: 'status_change',
      },
      {
        id: 'evt-3',
        title: 'Refund Processed',
        description: 'Amount ₹9,438.82 credited back to source card.',
        timestamp: 'Feb 26, 2026 • 03:30 PM',
        actor: 'Payment Gateway',
        type: 'payment',
      }
    ],
    notes: [
      {
        id: 'note-1',
        text: 'Customer called helpline to cancel order immediately after placing. Refund processed without fees.',
        author: 'Admin Support',
        createdAt: 'Feb 26, 2026, 03:26 PM',
        isCustomerVisible: false,
      }
    ],
  }
];

const LOCAL_STORAGE_KEY = 'urbn_furnish_admin_orders_v1';

export function getStoredOrders(): AdminOrder[] {
  if (typeof window === 'undefined') {
    return INITIAL_ORDERS;
  }
  try {
    const raw = localStorage.getItem(LOCAL_STORAGE_KEY);
    if (!raw) {
      localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(INITIAL_ORDERS));
      return INITIAL_ORDERS;
    }
    return JSON.parse(raw);
  } catch {
    return INITIAL_ORDERS;
  }
}

export function saveOrders(orders: AdminOrder[]): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(orders));
  } catch (err) {
    console.error('Failed to save orders to localStorage', err);
  }
}

export function getOrderById(id: string): AdminOrder | null {
  const orders = getStoredOrders();
  const normalizedSearch = id.toLowerCase().trim();
  return (
    orders.find(
      (o) =>
        o.id.toLowerCase() === normalizedSearch ||
        o.orderNumber.toLowerCase() === normalizedSearch ||
        o.id.toLowerCase().replace(/[^a-z0-9]/g, '') === normalizedSearch.replace(/[^a-z0-9]/g, '')
    ) || null
  );
}

export function updateOrderStatusInStore(
  orderId: string,
  newStatus: OrderStatus,
  noteText?: string,
  trackingUpdate?: Partial<FulfillmentInfo>,
  actor: string = 'Admin (Manual Update)'
): AdminOrder | null {
  const orders = getStoredOrders();
  const normalizedSearch = orderId.toLowerCase().trim();
  const index = orders.findIndex(
    (o) =>
      o.id.toLowerCase() === normalizedSearch ||
      o.orderNumber.toLowerCase() === normalizedSearch ||
      o.id.toLowerCase().replace(/[^a-z0-9]/g, '') === normalizedSearch.replace(/[^a-z0-9]/g, '')
  );

  if (index === -1) return null;

  const currentOrder = orders[index];
  const oldStatus = currentOrder.status;

  const now = new Date();
  const formattedTime = now.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  }) + ' • ' + now.toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit',
  });

  const newTimelineEvent: TimelineEvent = {
    id: `evt-${Date.now()}`,
    title: `Status Changed to ${newStatus}`,
    description: noteText
      ? `Status changed from ${oldStatus} to ${newStatus}. Note: ${noteText}`
      : `Manual status update from ${oldStatus} to ${newStatus} by admin.`,
    timestamp: formattedTime,
    actor: actor,
    type: 'status_change',
  };

  const updatedTimeline = [newTimelineEvent, ...currentOrder.timeline];

  let updatedNotes = currentOrder.notes;
  if (noteText) {
    const newNote: OrderNote = {
      id: `note-${Date.now()}`,
      text: noteText,
      author: actor,
      createdAt: formattedTime,
      isCustomerVisible: false,
    };
    updatedNotes = [newNote, ...updatedNotes];
  }

  const updatedFulfillment = {
    ...currentOrder.fulfillment,
    ...(trackingUpdate || {}),
    ...(newStatus === 'Shipped' && !currentOrder.fulfillment.shippedAt
      ? { shippedAt: now.toISOString() }
      : {}),
    ...(newStatus === 'Delivered'
      ? { deliveredAt: formattedTime }
      : {}),
  };

  let updatedPaymentStatus = currentOrder.paymentStatus;
  if (newStatus === 'Refunded') {
    updatedPaymentStatus = 'Refunded';
  } else if (newStatus === 'Delivered' && currentOrder.paymentMethod === 'Cash on Delivery') {
    updatedPaymentStatus = 'Paid';
  }

  const updatedOrder: AdminOrder = {
    ...currentOrder,
    status: newStatus,
    paymentStatus: updatedPaymentStatus,
    fulfillment: updatedFulfillment,
    timeline: updatedTimeline,
    notes: updatedNotes,
  };

  orders[index] = updatedOrder;
  saveOrders(orders);
  return updatedOrder;
}

export function addOrderNoteInStore(
  orderId: string,
  noteText: string,
  isCustomerVisible: boolean = false,
  author: string = 'Admin'
): AdminOrder | null {
  const orders = getStoredOrders();
  const index = orders.findIndex(
    (o) => o.id.toLowerCase() === orderId.toLowerCase() || o.orderNumber.toLowerCase() === orderId.toLowerCase()
  );
  if (index === -1) return null;

  const now = new Date();
  const formattedTime = now.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  }) + ', ' + now.toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit',
  });

  const newNote: OrderNote = {
    id: `note-${Date.now()}`,
    text: noteText,
    author: author,
    createdAt: formattedTime,
    isCustomerVisible,
  };

  const newTimelineEvent: TimelineEvent = {
    id: `evt-${Date.now()}`,
    title: isCustomerVisible ? 'Customer Note Added' : 'Internal Admin Note Added',
    description: noteText,
    timestamp: formattedTime,
    actor: author,
    type: 'note',
  };

  const updatedOrder: AdminOrder = {
    ...orders[index],
    notes: [newNote, ...orders[index].notes],
    timeline: [newTimelineEvent, ...orders[index].timeline],
  };

  orders[index] = updatedOrder;
  saveOrders(orders);
  return updatedOrder;
}
