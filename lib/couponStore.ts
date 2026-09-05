/**
 * Coupon & Discount Data Store
 * Manages coupon CRUD operations with localStorage persistence.
 * Supports: percentage, flat, min-order, first-order, product-specific, category-specific discounts.
 */

export type CouponDiscountType =
  | 'percentage'
  | 'flat'
  | 'min_order'
  | 'first_order'
  | 'product_specific'
  | 'category_specific';

export type CouponStatus = 'active' | 'expired' | 'disabled' | 'scheduled';

export interface Coupon {
  id: string;
  code: string;
  description: string;
  discountType: CouponDiscountType;
  discountValue: number;
  minOrderAmount: number | null;
  maxDiscountCap: number | null;
  applicableProducts: string[];
  applicableCategories: string[];
  isFirstOrderOnly: boolean;
  usageLimit: number | null;
  usagePerUser: number;
  usedCount: number;
  startDate: string;
  expiryDate: string;
  status: CouponStatus;
  createdAt: string;
  updatedAt: string;
}

const COUPONS_STORAGE_KEY = 'urbn_admin_coupons_v1';

// ── Discount Type Metadata ──────────────────────────────────────────────────
export const DISCOUNT_TYPE_OPTIONS: {
  value: CouponDiscountType;
  label: string;
  description: string;
  icon: string;
}[] = [
  { value: 'percentage', label: 'Percentage Discount', description: 'Discount by a % of the cart total', icon: '%' },
  { value: 'flat', label: 'Flat Discount', description: 'Fixed ₹ amount off the order', icon: '₹' },
  { value: 'min_order', label: 'Min Order Discount', description: 'Discount when order exceeds a minimum value', icon: '🛒' },
  { value: 'first_order', label: 'First-Order Coupon', description: 'Exclusive discount for first-time buyers', icon: '🎉' },
  { value: 'product_specific', label: 'Product-Specific', description: 'Discount applies to selected products only', icon: '📦' },
  { value: 'category_specific', label: 'Category-Specific', description: 'Discount applies to selected categories', icon: '🏷️' },
];

// ── Status Computation ──────────────────────────────────────────────────────
export function computeCouponStatus(coupon: Coupon): CouponStatus {
  if (coupon.status === 'disabled') return 'disabled';

  const now = new Date();
  const start = new Date(coupon.startDate);
  const expiry = new Date(coupon.expiryDate);

  if (now < start) return 'scheduled';
  if (now > expiry) return 'expired';
  if (coupon.usageLimit !== null && coupon.usedCount >= coupon.usageLimit) return 'expired';

  return 'active';
}

// ── Expiry Helpers ──────────────────────────────────────────────────────────
export function getExpiryInfo(expiryDate: string): {
  label: string;
  urgency: 'safe' | 'warning' | 'danger' | 'expired';
} {
  const now = new Date();
  const expiry = new Date(expiryDate);
  const diff = expiry.getTime() - now.getTime();

  if (diff <= 0) {
    const absDiff = Math.abs(diff);
    const hours = Math.floor(absDiff / (1000 * 60 * 60));
    const days = Math.floor(hours / 24);
    if (days > 0) return { label: `Expired ${days}d ago`, urgency: 'expired' };
    if (hours > 0) return { label: `Expired ${hours}h ago`, urgency: 'expired' };
    return { label: 'Just expired', urgency: 'expired' };
  }

  const minutes = Math.floor(diff / (1000 * 60));
  const hours = Math.floor(diff / (1000 * 60 * 60));
  const days = Math.floor(hours / 24);

  if (days > 7) return { label: `${days}d remaining`, urgency: 'safe' };
  if (days > 1) return { label: `${days}d ${hours % 24}h remaining`, urgency: 'warning' };
  if (hours > 0) return { label: `${hours}h ${minutes % 60}m remaining`, urgency: 'warning' };
  return { label: `${minutes}m remaining`, urgency: 'danger' };
}

export function formatDiscountValue(coupon: Coupon): string {
  if (coupon.discountType === 'percentage') return `${coupon.discountValue}% OFF`;
  return `₹${coupon.discountValue} OFF`;
}

export function getDiscountTypeLabel(type: CouponDiscountType): string {
  return DISCOUNT_TYPE_OPTIONS.find((o) => o.value === type)?.label ?? type;
}

// ── Seed Data ───────────────────────────────────────────────────────────────
export const SEED_COUPONS: Coupon[] = [
  {
    id: 'cpn-001',
    code: 'URBN20',
    description: '20% off on all orders above ₹2,000. Maximum discount ₹500.',
    discountType: 'percentage',
    discountValue: 20,
    minOrderAmount: 2000,
    maxDiscountCap: 500,
    applicableProducts: [],
    applicableCategories: [],
    isFirstOrderOnly: false,
    usageLimit: 500,
    usagePerUser: 3,
    usedCount: 342,
    startDate: '2026-08-01T00:00:00',
    expiryDate: '2026-09-30T23:59:00',
    status: 'active',
    createdAt: '2026-07-28T10:00:00',
    updatedAt: '2026-08-15T14:20:00',
  },
  {
    id: 'cpn-002',
    code: 'FLAT500',
    description: 'Flat ₹500 off on orders above ₹5,000.',
    discountType: 'flat',
    discountValue: 500,
    minOrderAmount: 5000,
    maxDiscountCap: null,
    applicableProducts: [],
    applicableCategories: [],
    isFirstOrderOnly: false,
    usageLimit: 200,
    usagePerUser: 2,
    usedCount: 87,
    startDate: '2026-08-10T00:00:00',
    expiryDate: '2026-10-15T23:59:00',
    status: 'active',
    createdAt: '2026-08-05T09:00:00',
    updatedAt: '2026-08-20T11:30:00',
  },
  {
    id: 'cpn-003',
    code: 'WELCOME100',
    description: 'Welcome offer! ₹100 off on your first order. No minimum.',
    discountType: 'first_order',
    discountValue: 100,
    minOrderAmount: null,
    maxDiscountCap: null,
    applicableProducts: [],
    applicableCategories: [],
    isFirstOrderOnly: true,
    usageLimit: null,
    usagePerUser: 1,
    usedCount: 1290,
    startDate: '2026-01-01T00:00:00',
    expiryDate: '2026-12-31T23:59:00',
    status: 'active',
    createdAt: '2025-12-28T10:00:00',
    updatedAt: '2026-06-01T12:00:00',
  },
  {
    id: 'cpn-004',
    code: 'SOFA15',
    description: '15% off on all sofas & recliners.',
    discountType: 'category_specific',
    discountValue: 15,
    minOrderAmount: null,
    maxDiscountCap: 1500,
    applicableProducts: [],
    applicableCategories: ['sofas', 'recliners'],
    isFirstOrderOnly: false,
    usageLimit: 300,
    usagePerUser: 2,
    usedCount: 156,
    startDate: '2026-08-15T00:00:00',
    expiryDate: '2026-11-30T23:59:00',
    status: 'active',
    createdAt: '2026-08-10T10:00:00',
    updatedAt: '2026-08-22T09:00:00',
  },
  {
    id: 'cpn-005',
    code: 'BIG1000',
    description: '₹1,000 off on orders above ₹15,000.',
    discountType: 'min_order',
    discountValue: 1000,
    minOrderAmount: 15000,
    maxDiscountCap: null,
    applicableProducts: [],
    applicableCategories: [],
    isFirstOrderOnly: false,
    usageLimit: 100,
    usagePerUser: 1,
    usedCount: 45,
    startDate: '2026-09-01T00:00:00',
    expiryDate: '2026-09-15T18:00:00',
    status: 'active',
    createdAt: '2026-08-28T10:00:00',
    updatedAt: '2026-08-30T16:00:00',
  },
  {
    id: 'cpn-006',
    code: 'BEDTIME25',
    description: '25% off on premium beds. Max discount ₹2,000.',
    discountType: 'product_specific',
    discountValue: 25,
    minOrderAmount: null,
    maxDiscountCap: 2000,
    applicableProducts: ['prod-beds-001', 'prod-beds-002', 'prod-beds-003'],
    applicableCategories: [],
    isFirstOrderOnly: false,
    usageLimit: 50,
    usagePerUser: 1,
    usedCount: 12,
    startDate: '2026-09-01T10:00:00',
    expiryDate: '2026-09-20T23:59:00',
    status: 'active',
    createdAt: '2026-08-29T11:00:00',
    updatedAt: '2026-09-01T10:00:00',
  },
  {
    id: 'cpn-007',
    code: 'SUMMER50',
    description: 'Summer flash sale — Flat ₹50 off everything!',
    discountType: 'flat',
    discountValue: 50,
    minOrderAmount: null,
    maxDiscountCap: null,
    applicableProducts: [],
    applicableCategories: [],
    isFirstOrderOnly: false,
    usageLimit: 1000,
    usagePerUser: 5,
    usedCount: 1000,
    startDate: '2026-06-01T00:00:00',
    expiryDate: '2026-07-31T23:59:00',
    status: 'expired',
    createdAt: '2026-05-28T10:00:00',
    updatedAt: '2026-07-31T23:59:00',
  },
  {
    id: 'cpn-008',
    code: 'DIWALI2026',
    description: 'Diwali mega sale! 30% off sitewide. Max ₹3,000.',
    discountType: 'percentage',
    discountValue: 30,
    minOrderAmount: 3000,
    maxDiscountCap: 3000,
    applicableProducts: [],
    applicableCategories: [],
    isFirstOrderOnly: false,
    usageLimit: 2000,
    usagePerUser: 2,
    usedCount: 0,
    startDate: '2026-10-15T00:00:00',
    expiryDate: '2026-11-05T23:59:00',
    status: 'scheduled',
    createdAt: '2026-09-01T10:00:00',
    updatedAt: '2026-09-01T10:00:00',
  },
  {
    id: 'cpn-009',
    code: 'DINING10',
    description: '10% off on dining tables & chairs.',
    discountType: 'category_specific',
    discountValue: 10,
    minOrderAmount: null,
    maxDiscountCap: 800,
    applicableProducts: [],
    applicableCategories: ['dining-tables', 'dining-chairs', 'dining'],
    isFirstOrderOnly: false,
    usageLimit: null,
    usagePerUser: 3,
    usedCount: 234,
    startDate: '2026-07-01T00:00:00',
    expiryDate: '2026-12-31T23:59:00',
    status: 'active',
    createdAt: '2026-06-28T10:00:00',
    updatedAt: '2026-08-15T09:00:00',
  },
  {
    id: 'cpn-010',
    code: 'LIMITED50',
    description: 'Limited edition — only 10 uses! ₹50 flat off.',
    discountType: 'flat',
    discountValue: 50,
    minOrderAmount: null,
    maxDiscountCap: null,
    applicableProducts: [],
    applicableCategories: [],
    isFirstOrderOnly: false,
    usageLimit: 10,
    usagePerUser: 1,
    usedCount: 8,
    startDate: '2026-09-01T00:00:00',
    expiryDate: '2026-09-10T12:00:00',
    status: 'active',
    createdAt: '2026-08-30T10:00:00',
    updatedAt: '2026-09-02T14:00:00',
  },
];

// ── localStorage Persistence ────────────────────────────────────────────────
export function getStoredCoupons(): Coupon[] {
  if (typeof window === 'undefined') return SEED_COUPONS;
  try {
    const raw = localStorage.getItem(COUPONS_STORAGE_KEY);
    if (raw) {
      const parsed: Coupon[] = JSON.parse(raw);
      // Auto-update statuses based on current time
      return parsed.map((c) => ({ ...c, status: computeCouponStatus(c) }));
    }
  } catch {
    // Ignore parse errors
  }
  return SEED_COUPONS.map((c) => ({ ...c, status: computeCouponStatus(c) }));
}

export function saveStoredCoupons(coupons: Coupon[]): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(COUPONS_STORAGE_KEY, JSON.stringify(coupons));
  } catch {
    // Ignore quota errors
  }
}

export function generateCouponId(): string {
  return `cpn-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;
}
