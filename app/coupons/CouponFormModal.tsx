'use client';

import React, { useState, useEffect } from 'react';
import {
  X,
  Tag,
  Percent,
  IndianRupee,
  ShoppingCart,
  Gift,
  Package,
  Layers,
  Clock,
  Users,
  AlertCircle,
  ChevronDown,
  ChevronUp,
  Sparkles,
  Info,
} from 'lucide-react';
import {
  Coupon,
  CouponDiscountType,
  DISCOUNT_TYPE_OPTIONS,
  generateCouponId,
  computeCouponStatus,
} from '@/lib/couponStore';
import { PRODUCT_CATEGORIES } from '@/lib/productData';

// ── Icon map for discount types ─────────────────────────────────────────────
const TYPE_ICONS: Record<CouponDiscountType, React.ReactNode> = {
  percentage: <Percent size={18} />,
  flat: <IndianRupee size={18} />,
  min_order: <ShoppingCart size={18} />,
  first_order: <Gift size={18} />,
  product_specific: <Package size={18} />,
  category_specific: <Layers size={18} />,
};

const TYPE_COLORS: Record<CouponDiscountType, string> = {
  percentage: 'text-violet-600 bg-violet-50 border-violet-200',
  flat: 'text-emerald-600 bg-emerald-50 border-emerald-200',
  min_order: 'text-blue-600 bg-blue-50 border-blue-200',
  first_order: 'text-amber-600 bg-amber-50 border-amber-200',
  product_specific: 'text-rose-600 bg-rose-50 border-rose-200',
  category_specific: 'text-primary bg-primary/5 border-primary/20',
};

// ── Local form state ─────────────────────────────────────────────────────────
interface FormState {
  code: string;
  description: string;
  discountType: CouponDiscountType;
  discountValue: string;
  minOrderAmount: string;
  maxDiscountCap: string;
  applicableCategories: string[];
  applicableProducts: string;
  isFirstOrderOnly: boolean;
  usageLimit: string;
  usagePerUser: string;
  startDate: string;
  startTime: string;
  expiryDate: string;
  expiryTime: string;
}

function toLocalDatetimeParts(iso: string): { date: string; time: string } {
  const d = new Date(iso);
  const pad = (n: number) => String(n).padStart(2, '0');
  const date = `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
  const time = `${pad(d.getHours())}:${pad(d.getMinutes())}`;
  return { date, time };
}

function toISO(date: string, time: string): string {
  return `${date}T${time}:00`;
}

function nowPlusDays(days: number): { date: string; time: string } {
  const d = new Date();
  d.setDate(d.getDate() + days);
  return toLocalDatetimeParts(d.toISOString());
}

// ── Props ────────────────────────────────────────────────────────────────────
interface CouponFormModalProps {
  existingCoupon?: Coupon | null;
  existingCodes: string[];
  onSave: (coupon: Coupon) => void;
  onClose: () => void;
}

export default function CouponFormModal({
  existingCoupon,
  existingCodes,
  onSave,
  onClose,
}: CouponFormModalProps) {
  const isEdit = Boolean(existingCoupon);
  const [openSection, setOpenSection] = useState<string[]>(['basic', 'discount', 'schedule']);
  const [errors, setErrors] = useState<Record<string, string>>({});

  // ── Initialize form ────────────────────────────────────────────────────────
  const buildInitialState = (): FormState => {
    if (existingCoupon) {
      const { date: sd, time: st } = toLocalDatetimeParts(existingCoupon.startDate);
      const { date: ed, time: et } = toLocalDatetimeParts(existingCoupon.expiryDate);
      return {
        code: existingCoupon.code,
        description: existingCoupon.description,
        discountType: existingCoupon.discountType,
        discountValue: String(existingCoupon.discountValue),
        minOrderAmount: existingCoupon.minOrderAmount != null ? String(existingCoupon.minOrderAmount) : '',
        maxDiscountCap: existingCoupon.maxDiscountCap != null ? String(existingCoupon.maxDiscountCap) : '',
        applicableCategories: existingCoupon.applicableCategories,
        applicableProducts: existingCoupon.applicableProducts.join(', '),
        isFirstOrderOnly: existingCoupon.isFirstOrderOnly,
        usageLimit: existingCoupon.usageLimit != null ? String(existingCoupon.usageLimit) : '',
        usagePerUser: String(existingCoupon.usagePerUser),
        startDate: sd,
        startTime: st,
        expiryDate: ed,
        expiryTime: et,
      };
    }
    const now = toLocalDatetimeParts(new Date().toISOString());
    const future = nowPlusDays(30);
    return {
      code: '',
      description: '',
      discountType: 'percentage',
      discountValue: '',
      minOrderAmount: '',
      maxDiscountCap: '',
      applicableCategories: [],
      applicableProducts: '',
      isFirstOrderOnly: false,
      usageLimit: '',
      usagePerUser: '1',
      startDate: now.date,
      startTime: now.time,
      expiryDate: future.date,
      expiryTime: '23:59',
    };
  };

  const [form, setForm] = useState<FormState>(buildInitialState);

  // Re-init if editing coupon changes
  useEffect(() => {
    setForm(buildInitialState());
    setErrors({});
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [existingCoupon?.id]);

  // ── Helpers ────────────────────────────────────────────────────────────────
  const set = (key: keyof FormState, value: string | boolean | string[]) =>
    setForm((prev) => ({ ...prev, [key]: value }));

  const toggleSection = (s: string) =>
    setOpenSection((prev) =>
      prev.includes(s) ? prev.filter((x) => x !== s) : [...prev, s]
    );

  const toggleCategory = (slug: string) => {
    set(
      'applicableCategories',
      form.applicableCategories.includes(slug)
        ? form.applicableCategories.filter((c) => c !== slug)
        : [...form.applicableCategories, slug]
    );
  };

  // ── Validation ────────────────────────────────────────────────────────────
  const validate = (): boolean => {
    const errs: Record<string, string> = {};

    const code = form.code.trim().toUpperCase();
    if (!code) errs.code = 'Coupon code is required.';
    else if (!/^[A-Z0-9_-]{3,20}$/.test(code))
      errs.code = 'Code must be 3–20 characters (letters, digits, _ or -).';
    else if (existingCodes.filter((c) => c !== existingCoupon?.code).includes(code))
      errs.code = 'This coupon code already exists.';

    if (!form.description.trim()) errs.description = 'Description is required.';

    const val = parseFloat(form.discountValue);
    if (!form.discountValue || isNaN(val) || val <= 0)
      errs.discountValue = 'Enter a valid discount value.';
    if (form.discountType === 'percentage' && val > 100)
      errs.discountValue = 'Percentage cannot exceed 100.';

    if (!form.startDate) errs.startDate = 'Start date is required.';
    if (!form.expiryDate) errs.expiryDate = 'Expiry date is required.';

    const startISO = toISO(form.startDate, form.startTime);
    const expiryISO = toISO(form.expiryDate, form.expiryTime);
    if (form.startDate && form.expiryDate && new Date(expiryISO) <= new Date(startISO))
      errs.expiryDate = 'Expiry must be after the start date/time.';

    if (form.discountType === 'category_specific' && form.applicableCategories.length === 0)
      errs.applicableCategories = 'Select at least one category.';
    if (form.discountType === 'product_specific' && !form.applicableProducts.trim())
      errs.applicableProducts = 'Enter at least one product ID.';

    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  // ── Submit ────────────────────────────────────────────────────────────────
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    const now = new Date().toISOString();
    const startISO = toISO(form.startDate, form.startTime);
    const expiryISO = toISO(form.expiryDate, form.expiryTime);

    const draft: Coupon = {
      id: existingCoupon?.id ?? generateCouponId(),
      code: form.code.trim().toUpperCase(),
      description: form.description.trim(),
      discountType: form.discountType,
      discountValue: parseFloat(form.discountValue),
      minOrderAmount: form.minOrderAmount ? parseFloat(form.minOrderAmount) : null,
      maxDiscountCap: form.maxDiscountCap ? parseFloat(form.maxDiscountCap) : null,
      applicableProducts: form.discountType === 'product_specific'
        ? form.applicableProducts.split(',').map((s) => s.trim()).filter(Boolean)
        : [],
      applicableCategories: form.discountType === 'category_specific'
        ? form.applicableCategories
        : [],
      isFirstOrderOnly: form.discountType === 'first_order' ? true : form.isFirstOrderOnly,
      usageLimit: form.usageLimit ? parseInt(form.usageLimit) : null,
      usagePerUser: parseInt(form.usagePerUser) || 1,
      usedCount: existingCoupon?.usedCount ?? 0,
      startDate: startISO,
      expiryDate: expiryISO,
      status: existingCoupon?.status ?? 'active',
      createdAt: existingCoupon?.createdAt ?? now,
      updatedAt: now,
    };
    draft.status = computeCouponStatus(draft);
    onSave(draft);
  };

  // ── Section header ────────────────────────────────────────────────────────
  const SectionHeader = ({
    id, title, icon, subtitle,
  }: { id: string; title: string; icon: React.ReactNode; subtitle?: string }) => {
    const open = openSection.includes(id);
    return (
      <button
        type="button"
        onClick={() => toggleSection(id)}
        className="w-full flex items-center justify-between px-5 py-3.5 hover:bg-bgColor/50 transition-colors"
      >
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center text-primary">
            {icon}
          </div>
          <div className="text-left">
            <p className="text-sm font-bold text-textColor">{title}</p>
            {subtitle && <p className="text-[11px] text-textMuted">{subtitle}</p>}
          </div>
        </div>
        {open ? <ChevronUp size={15} className="text-textMuted" /> : <ChevronDown size={15} className="text-textMuted" />}
      </button>
    );
  };

  // ── Input helpers ─────────────────────────────────────────────────────────
  const inputCls = (err?: string) =>
    `w-full px-3.5 py-2.5 rounded-xl border text-sm text-textColor bg-bgColor placeholder:text-textMuted/60 focus:outline-none focus:ring-2 focus:ring-primary/30 transition-all ${err ? 'border-red-400 focus:ring-red-300' : 'border-borderColor focus:border-primary/50'}`;

  const labelCls = 'block text-xs font-semibold text-textMuted mb-1.5';

  return (
    <div className="fixed inset-0 z-[70] flex items-center justify-center p-4">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />

      {/* Modal */}
      <div className="relative w-full max-w-2xl bg-surfaceColor border border-borderColor rounded-2xl shadow-2xl flex flex-col max-h-[92vh]">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-borderColor shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
              <Tag size={18} />
            </div>
            <div>
              <h2 className="text-base font-bold text-textColor">
                {isEdit ? 'Edit Coupon' : 'Create New Coupon'}
              </h2>
              <p className="text-[11px] text-textMuted">
                {isEdit ? `Editing ${existingCoupon?.code}` : 'Fill in the details below'}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg text-textMuted hover:text-textColor hover:bg-bgColor transition-colors"
          >
            <X size={17} />
          </button>
        </div>

        {/* Form Body — scrollable */}
        <form onSubmit={handleSubmit} className="flex flex-col flex-1 min-h-0">
          <div className="flex-1 overflow-y-auto divide-y divide-borderColor custom-scrollbar">

            {/* ── Section 1: Basic Info ──────────────────────────────── */}
            <div>
              <SectionHeader
                id="basic"
                title="Basic Information"
                icon={<Sparkles size={15} />}
                subtitle="Coupon code and description"
              />
              {openSection.includes('basic') && (
                <div className="px-5 pb-5 pt-2 space-y-4">
                  {/* Code */}
                  <div>
                    <label className={labelCls}>
                      Coupon Code <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                      <input
                        id="coupon-code"
                        type="text"
                        value={form.code}
                        onChange={(e) => set('code', e.target.value.toUpperCase())}
                        placeholder="e.g. URBN20"
                        maxLength={20}
                        className={`${inputCls(errors.code)} font-mono font-bold tracking-widest uppercase pr-20`}
                      />
                      <button
                        type="button"
                        onClick={() => {
                          const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
                          const rand = Array.from({ length: 8 }, () => chars[Math.floor(Math.random() * chars.length)]).join('');
                          set('code', rand);
                        }}
                        className="absolute right-2 top-1/2 -translate-y-1/2 text-[10px] font-bold px-2 py-1 rounded-lg bg-primary/10 text-primary hover:bg-primary/20 transition-colors"
                      >
                        Generate
                      </button>
                    </div>
                    {errors.code && <p className="mt-1 text-xs text-red-500 flex items-center gap-1"><AlertCircle size={11} />{errors.code}</p>}
                  </div>

                  {/* Description */}
                  <div>
                    <label className={labelCls}>
                      Description <span className="text-red-500">*</span>
                    </label>
                    <textarea
                      id="coupon-description"
                      value={form.description}
                      onChange={(e) => set('description', e.target.value)}
                      placeholder="Describe what this coupon does (shown to customers)"
                      rows={2}
                      className={`${inputCls(errors.description)} resize-none`}
                    />
                    {errors.description && <p className="mt-1 text-xs text-red-500 flex items-center gap-1"><AlertCircle size={11} />{errors.description}</p>}
                  </div>
                </div>
              )}
            </div>

            {/* ── Section 2: Discount Config ─────────────────────────── */}
            <div>
              <SectionHeader
                id="discount"
                title="Discount Configuration"
                icon={<Percent size={15} />}
                subtitle="Discount type, value and conditions"
              />
              {openSection.includes('discount') && (
                <div className="px-5 pb-5 pt-2 space-y-5">
                  {/* Discount Type grid */}
                  <div>
                    <label className={labelCls}>Discount Type <span className="text-red-500">*</span></label>
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                      {DISCOUNT_TYPE_OPTIONS.map((opt) => {
                        const active = form.discountType === opt.value;
                        return (
                          <button
                            key={opt.value}
                            type="button"
                            onClick={() => set('discountType', opt.value)}
                            className={`flex flex-col items-start gap-1 p-3 rounded-xl border text-left transition-all ${
                              active
                                ? `${TYPE_COLORS[opt.value]} shadow-sm`
                                : 'border-borderColor text-textMuted hover:border-primary/40 hover:bg-bgColor'
                            }`}
                          >
                            <div className={`${active ? '' : 'opacity-60'}`}>
                              {TYPE_ICONS[opt.value]}
                            </div>
                            <span className="text-[11px] font-bold leading-tight">{opt.label}</span>
                          </button>
                        );
                      })}
                    </div>
                    {/* Description */}
                    <p className="mt-2 text-[11px] text-textMuted flex items-center gap-1.5 bg-bgColor px-3 py-2 rounded-lg border border-borderColor">
                      <Info size={12} className="text-primary shrink-0" />
                      {DISCOUNT_TYPE_OPTIONS.find((o) => o.value === form.discountType)?.description}
                    </p>
                  </div>

                  {/* Value row */}
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className={labelCls}>
                        Discount Value <span className="text-red-500">*</span>
                      </label>
                      <div className="relative">
                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-textMuted text-sm font-bold">
                          {form.discountType === 'percentage' ? '%' : '₹'}
                        </span>
                        <input
                          id="coupon-discount-value"
                          type="number"
                          min={0}
                          step={form.discountType === 'percentage' ? 1 : 0.01}
                          value={form.discountValue}
                          onChange={(e) => set('discountValue', e.target.value)}
                          placeholder="0"
                          className={`${inputCls(errors.discountValue)} pl-8`}
                        />
                      </div>
                      {errors.discountValue && <p className="mt-1 text-xs text-red-500 flex items-center gap-1"><AlertCircle size={11} />{errors.discountValue}</p>}
                    </div>

                    {/* Max Cap */}
                    <div>
                      <label className={labelCls}>Max Discount Cap (₹)</label>
                      <div className="relative">
                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-textMuted text-sm font-bold">₹</span>
                        <input
                          id="coupon-max-cap"
                          type="number"
                          min={0}
                          value={form.maxDiscountCap}
                          onChange={(e) => set('maxDiscountCap', e.target.value)}
                          placeholder="Unlimited"
                          className={`${inputCls()} pl-8`}
                        />
                      </div>
                      <p className="mt-1 text-[10px] text-textMuted">Optional — leave blank for no cap</p>
                    </div>
                  </div>

                  {/* Min Order */}
                  <div>
                    <label className={labelCls}>Minimum Order Amount (₹)</label>
                    <div className="relative">
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-textMuted text-sm font-bold">₹</span>
                      <input
                        id="coupon-min-order"
                        type="number"
                        min={0}
                        value={form.minOrderAmount}
                        onChange={(e) => set('minOrderAmount', e.target.value)}
                        placeholder="No minimum"
                        className={`${inputCls()} pl-8`}
                      />
                    </div>
                  </div>

                  {/* Category Selector */}
                  {form.discountType === 'category_specific' && (
                    <div>
                      <label className={labelCls}>
                        Applicable Categories <span className="text-red-500">*</span>
                      </label>
                      <div className="flex flex-wrap gap-2 p-3 rounded-xl border border-borderColor bg-bgColor max-h-40 overflow-y-auto custom-scrollbar">
                        {PRODUCT_CATEGORIES.map((cat) => {
                          const active = form.applicableCategories.includes(cat.value);
                          return (
                            <button
                              key={cat.value}
                              type="button"
                              onClick={() => toggleCategory(cat.value)}
                              className={`text-[11px] font-semibold px-2.5 py-1 rounded-lg border transition-all ${
                                active
                                  ? 'bg-primary text-white border-primary'
                                  : 'bg-surfaceColor text-textMuted border-borderColor hover:border-primary/40'
                              }`}
                            >
                              {cat.label}
                            </button>
                          );
                        })}
                      </div>
                      {errors.applicableCategories && (
                        <p className="mt-1 text-xs text-red-500 flex items-center gap-1"><AlertCircle size={11} />{errors.applicableCategories}</p>
                      )}
                    </div>
                  )}

                  {/* Product IDs */}
                  {form.discountType === 'product_specific' && (
                    <div>
                      <label className={labelCls}>
                        Product IDs <span className="text-red-500">*</span>
                      </label>
                      <textarea
                        id="coupon-product-ids"
                        value={form.applicableProducts}
                        onChange={(e) => set('applicableProducts', e.target.value)}
                        placeholder="prod-001, prod-002, prod-003 (comma-separated)"
                        rows={2}
                        className={`${inputCls(errors.applicableProducts)} resize-none font-mono text-xs`}
                      />
                      {errors.applicableProducts && (
                        <p className="mt-1 text-xs text-red-500 flex items-center gap-1"><AlertCircle size={11} />{errors.applicableProducts}</p>
                      )}
                    </div>
                  )}

                  {/* First-order toggle (for non first_order types) */}
                  {form.discountType !== 'first_order' && (
                    <label className="flex items-center justify-between p-3 rounded-xl bg-bgColor border border-borderColor cursor-pointer hover:border-primary/40 transition-colors">
                      <div>
                        <p className="text-sm font-semibold text-textColor">First-Order Only</p>
                        <p className="text-[11px] text-textMuted">Restrict this coupon to first-time buyers</p>
                      </div>
                      <div
                        onClick={() => set('isFirstOrderOnly', !form.isFirstOrderOnly)}
                        className={`relative w-10 h-5 rounded-full transition-colors cursor-pointer ${form.isFirstOrderOnly ? 'bg-primary' : 'bg-borderColor'}`}
                      >
                        <div className={`absolute top-0.5 w-4 h-4 rounded-full bg-white shadow-sm transition-all ${form.isFirstOrderOnly ? 'left-5' : 'left-0.5'}`} />
                      </div>
                    </label>
                  )}
                </div>
              )}
            </div>

            {/* ── Section 3: Usage Limits ────────────────────────────── */}
            <div>
              <SectionHeader
                id="limits"
                title="Usage Limits"
                icon={<Users size={15} />}
                subtitle="Control how many times this coupon can be used"
              />
              {openSection.includes('limits') && (
                <div className="px-5 pb-5 pt-2">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className={labelCls}>Total Usage Limit</label>
                      <input
                        id="coupon-usage-limit"
                        type="number"
                        min={1}
                        value={form.usageLimit}
                        onChange={(e) => set('usageLimit', e.target.value)}
                        placeholder="Unlimited"
                        className={inputCls()}
                      />
                      <p className="mt-1 text-[10px] text-textMuted">Leave blank for unlimited total uses</p>
                    </div>
                    <div>
                      <label className={labelCls}>Uses Per Customer</label>
                      <input
                        id="coupon-per-user"
                        type="number"
                        min={1}
                        value={form.usagePerUser}
                        onChange={(e) => set('usagePerUser', e.target.value)}
                        className={inputCls()}
                      />
                      <p className="mt-1 text-[10px] text-textMuted">Max times one customer can use it</p>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* ── Section 4: Schedule ────────────────────────────────── */}
            <div>
              <SectionHeader
                id="schedule"
                title="Validity Schedule"
                icon={<Clock size={15} />}
                subtitle="Set exact start & expiry date and time"
              />
              {openSection.includes('schedule') && (
                <div className="px-5 pb-5 pt-2 space-y-4">
                  {/* Start */}
                  <div>
                    <label className={labelCls}>Start Date & Time <span className="text-red-500">*</span></label>
                    <div className="grid grid-cols-2 gap-3">
                      <input
                        id="coupon-start-date"
                        type="date"
                        value={form.startDate}
                        onChange={(e) => set('startDate', e.target.value)}
                        className={inputCls(errors.startDate)}
                      />
                      <input
                        id="coupon-start-time"
                        type="time"
                        value={form.startTime}
                        onChange={(e) => set('startTime', e.target.value)}
                        className={inputCls()}
                      />
                    </div>
                    {errors.startDate && <p className="mt-1 text-xs text-red-500 flex items-center gap-1"><AlertCircle size={11} />{errors.startDate}</p>}
                  </div>

                  {/* Expiry */}
                  <div>
                    <label className={labelCls}>
                      Expiry Date & Time <span className="text-red-500">*</span>
                    </label>
                    <div className="grid grid-cols-2 gap-3">
                      <input
                        id="coupon-expiry-date"
                        type="date"
                        value={form.expiryDate}
                        onChange={(e) => set('expiryDate', e.target.value)}
                        className={inputCls(errors.expiryDate)}
                      />
                      <input
                        id="coupon-expiry-time"
                        type="time"
                        value={form.expiryTime}
                        onChange={(e) => set('expiryTime', e.target.value)}
                        className={inputCls(errors.expiryDate)}
                      />
                    </div>
                    {errors.expiryDate && <p className="mt-1 text-xs text-red-500 flex items-center gap-1"><AlertCircle size={11} />{errors.expiryDate}</p>}
                    <div className="mt-2 p-3 rounded-xl bg-amber-50 border border-amber-200 flex items-start gap-2">
                      <Clock size={13} className="text-amber-600 mt-0.5 shrink-0" />
                      <p className="text-[11px] text-amber-700 leading-relaxed">
                        <span className="font-bold">Exact time matters.</span> The coupon will automatically expire at the specified date and time. No customer can use it after this point.
                      </p>
                    </div>

                    {/* Quick presets */}
                    <div className="flex flex-wrap gap-2 mt-3">
                      {[
                        { label: '+7 Days', days: 7 },
                        { label: '+30 Days', days: 30 },
                        { label: '+90 Days', days: 90 },
                        { label: 'End of Year', days: 0, custom: true },
                      ].map((preset) => (
                        <button
                          key={preset.label}
                          type="button"
                          onClick={() => {
                            if (preset.custom) {
                              set('expiryDate', `${new Date().getFullYear()}-12-31`);
                              set('expiryTime', '23:59');
                            } else {
                              const { date } = nowPlusDays(preset.days);
                              set('expiryDate', date);
                              set('expiryTime', '23:59');
                            }
                          }}
                          className="text-[11px] font-semibold px-2.5 py-1 rounded-lg border border-borderColor text-textMuted hover:border-primary/40 hover:text-primary hover:bg-primary/5 transition-colors"
                        >
                          {preset.label}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Footer */}
          <div className="flex items-center justify-between px-6 py-4 border-t border-borderColor bg-bgColor/50 shrink-0">
            <p className="text-[11px] text-textMuted">
              <span className="text-red-500">*</span> Required fields
            </p>
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 rounded-xl text-sm font-semibold text-textMuted hover:text-textColor hover:bg-bgColor border border-borderColor transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                id="coupon-submit-btn"
                className="flex items-center gap-2 px-5 py-2 rounded-xl text-sm font-bold text-white bg-primary hover:bg-primary-hover shadow-sm shadow-primary/30 transition-colors"
              >
                <Tag size={14} />
                {isEdit ? 'Save Changes' : 'Create Coupon'}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
