'use client';

import React, { useState, useEffect, useMemo, useCallback } from 'react';
import AdminLayout from '../common/AdminLayout';
import {
  Tag,
  Plus,
  Search,
  Filter,
  ChevronDown,
  Edit2,
  Trash2,
  ToggleLeft,
  ToggleRight,
  Copy,
  CheckCircle2,
  Clock,
  Ticket,
  TrendingUp,
  Users,
  AlertCircle,
  X,
  Percent,
  IndianRupee,
  ShoppingCart,
  Gift,
  Package,
  Layers,
  RefreshCw,
  Calendar,
  BarChart2,
} from 'lucide-react';
import {
  Coupon,
  CouponStatus,
  CouponDiscountType,
  getStoredCoupons,
  saveStoredCoupons,
  computeCouponStatus,
  getExpiryInfo,
  formatDiscountValue,
  getDiscountTypeLabel,
} from '@/lib/couponStore';
import CouponFormModal from './CouponFormModal';
import DeleteCouponModal from './DeleteCouponModal';
import toast from 'react-hot-toast';

// ── Status badge config ────────────────────────────────────────────────────
const STATUS_CONFIG: Record<CouponStatus, { label: string; cls: string; dot: string }> = {
  active: {
    label: 'Active',
    cls: 'bg-emerald-500/10 text-emerald-700 border-emerald-200',
    dot: 'bg-emerald-500',
  },
  expired: {
    label: 'Expired',
    cls: 'bg-red-500/10 text-red-600 border-red-200',
    dot: 'bg-red-500',
  },
  disabled: {
    label: 'Disabled',
    cls: 'bg-slate-500/10 text-slate-600 border-slate-200',
    dot: 'bg-slate-400',
  },
  scheduled: {
    label: 'Scheduled',
    cls: 'bg-blue-500/10 text-blue-600 border-blue-200',
    dot: 'bg-blue-500',
  },
};

// ── Discount type icon map ─────────────────────────────────────────────────
const TYPE_ICON: Record<CouponDiscountType, React.ReactNode> = {
  percentage: <Percent size={12} />,
  flat: <IndianRupee size={12} />,
  min_order: <ShoppingCart size={12} />,
  first_order: <Gift size={12} />,
  product_specific: <Package size={12} />,
  category_specific: <Layers size={12} />,
};

const TYPE_COLOR: Record<CouponDiscountType, string> = {
  percentage: 'text-violet-600 bg-violet-50 border-violet-200',
  flat: 'text-emerald-600 bg-emerald-50 border-emerald-200',
  min_order: 'text-blue-600 bg-blue-50 border-blue-200',
  first_order: 'text-amber-600 bg-amber-50 border-amber-200',
  product_specific: 'text-rose-600 bg-rose-50 border-rose-200',
  category_specific: 'text-primary bg-primary/5 border-primary/20',
};

// ── Expiry badge ───────────────────────────────────────────────────────────
function ExpiryBadge({ expiryDate, status }: { expiryDate: string; status: CouponStatus }) {
  const [info, setInfo] = useState(getExpiryInfo(expiryDate));

  // Refresh every minute
  useEffect(() => {
    const interval = setInterval(() => setInfo(getExpiryInfo(expiryDate)), 60_000);
    return () => clearInterval(interval);
  }, [expiryDate]);

  if (status === 'scheduled') {
    return (
      <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-blue-600 bg-blue-50 border border-blue-200 px-2 py-0.5 rounded-full">
        <Calendar size={10} />
        Starts later
      </span>
    );
  }

  const urgencyMap = {
    safe: 'text-emerald-700 bg-emerald-50 border-emerald-200',
    warning: 'text-amber-700 bg-amber-50 border-amber-200',
    danger: 'text-red-700 bg-red-50 border-red-200',
    expired: 'text-slate-600 bg-slate-50 border-slate-200',
  };

  return (
    <span className={`inline-flex items-center gap-1 text-[11px] font-semibold px-2 py-0.5 rounded-full border ${urgencyMap[info.urgency]}`}>
      <Clock size={10} />
      {info.label}
    </span>
  );
}

// ── Usage Progress Bar ────────────────────────────────────────────────────
function UsageBar({ used, limit }: { used: number; limit: number | null }) {
  if (limit === null) {
    return (
      <div className="space-y-1">
        <div className="flex justify-between text-[10px] text-textMuted">
          <span>{used.toLocaleString()} uses</span>
          <span>Unlimited</span>
        </div>
        <div className="h-1.5 rounded-full bg-borderColor overflow-hidden">
          <div className="h-full w-full bg-gradient-to-r from-primary/40 to-primary/60 rounded-full" />
        </div>
      </div>
    );
  }

  const pct = Math.min((used / limit) * 100, 100);
  const barColor =
    pct >= 90 ? 'from-red-500 to-red-600' :
    pct >= 70 ? 'from-amber-500 to-amber-600' :
    'from-primary to-primary-hover';

  return (
    <div className="space-y-1">
      <div className="flex justify-between text-[10px] text-textMuted">
        <span>{used.toLocaleString()} / {limit.toLocaleString()}</span>
        <span>{pct.toFixed(0)}%</span>
      </div>
      <div className="h-1.5 rounded-full bg-borderColor overflow-hidden">
        <div
          className={`h-full bg-gradient-to-r ${barColor} rounded-full transition-all duration-500`}
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  );
}

// ── Stat Card ─────────────────────────────────────────────────────────────
function StatCard({
  label, value, sub, icon, color,
}: {
  label: string; value: string | number; sub?: string;
  icon: React.ReactNode; color: string;
}) {
  return (
    <div className="bg-surfaceColor border border-borderColor rounded-2xl p-5 flex items-start gap-4 hover:shadow-md transition-shadow">
      <div className={`w-11 h-11 rounded-xl flex items-center justify-center shrink-0 ${color}`}>
        {icon}
      </div>
      <div className="min-w-0">
        <p className="text-2xl font-black text-textColor tracking-tight">{value}</p>
        <p className="text-xs font-semibold text-textMuted">{label}</p>
        {sub && <p className="text-[10px] text-textMuted mt-0.5">{sub}</p>}
      </div>
    </div>
  );
}

// ── Main Page ─────────────────────────────────────────────────────────────
export default function CouponsPage() {
  const [coupons, setCoupons] = useState<Coupon[]>([]);
  const [search, setSearch] = useState('');
  const [filterStatus, setFilterStatus] = useState<CouponStatus | 'all'>('all');
  const [filterType, setFilterType] = useState<CouponDiscountType | 'all'>('all');
  const [showStatusMenu, setShowStatusMenu] = useState(false);
  const [showTypeMenu, setShowTypeMenu] = useState(false);
  const [copiedCode, setCopiedCode] = useState<string | null>(null);

  // Modal state
  const [showForm, setShowForm] = useState(false);
  const [editingCoupon, setEditingCoupon] = useState<Coupon | null>(null);
  const [deletingCoupon, setDeletingCoupon] = useState<Coupon | null>(null);

  // Load from storage on mount
  useEffect(() => {
    setCoupons(getStoredCoupons());
  }, []);

  // Persist whenever coupons change
  useEffect(() => {
    if (coupons.length > 0) saveStoredCoupons(coupons);
  }, [coupons]);

  // Auto-refresh statuses every minute
  useEffect(() => {
    const interval = setInterval(() => {
      setCoupons((prev) =>
        prev.map((c) => ({ ...c, status: computeCouponStatus(c) }))
      );
    }, 60_000);
    return () => clearInterval(interval);
  }, []);

  // ── Filtering ───────────────────────────────────────────────────────────
  const filtered = useMemo(() => {
    return coupons.filter((c) => {
      const q = search.toLowerCase();
      const matchSearch =
        !q ||
        c.code.toLowerCase().includes(q) ||
        c.description.toLowerCase().includes(q);
      const matchStatus = filterStatus === 'all' || c.status === filterStatus;
      const matchType = filterType === 'all' || c.discountType === filterType;
      return matchSearch && matchStatus && matchType;
    });
  }, [coupons, search, filterStatus, filterType]);

  // ── Stats ───────────────────────────────────────────────────────────────
  const stats = useMemo(() => {
    const total = coupons.length;
    const active = coupons.filter((c) => c.status === 'active').length;
    const expired = coupons.filter((c) => c.status === 'expired').length;
    const scheduled = coupons.filter((c) => c.status === 'scheduled').length;
    const totalRedemptions = coupons.reduce((s, c) => s + c.usedCount, 0);
    return { total, active, expired, scheduled, totalRedemptions };
  }, [coupons]);

  // ── CRUD Handlers ───────────────────────────────────────────────────────
  const handleSave = useCallback((coupon: Coupon) => {
    setCoupons((prev) => {
      const exists = prev.find((c) => c.id === coupon.id);
      if (exists) return prev.map((c) => (c.id === coupon.id ? coupon : c));
      return [coupon, ...prev];
    });
    setShowForm(false);
    setEditingCoupon(null);
    toast.success(editingCoupon ? `Coupon "${coupon.code}" updated!` : `Coupon "${coupon.code}" created!`);
  }, [editingCoupon]);

  const handleDelete = useCallback(() => {
    if (!deletingCoupon) return;
    setCoupons((prev) => prev.filter((c) => c.id !== deletingCoupon.id));
    setDeletingCoupon(null);
    toast.success(`Coupon "${deletingCoupon.code}" deleted.`);
  }, [deletingCoupon]);

  const handleToggle = useCallback((coupon: Coupon) => {
    const nextStatus: CouponStatus = coupon.status === 'disabled' ? 'active' : 'disabled';
    setCoupons((prev) =>
      prev.map((c) =>
        c.id === coupon.id
          ? { ...c, status: computeCouponStatus({ ...c, status: nextStatus }), updatedAt: new Date().toISOString() }
          : c
      )
    );
    toast.success(`Coupon "${coupon.code}" ${nextStatus === 'disabled' ? 'disabled' : 'enabled'}.`);
  }, []);

  const handleCopy = useCallback((code: string) => {
    navigator.clipboard.writeText(code).catch(() => {});
    setCopiedCode(code);
    setTimeout(() => setCopiedCode(null), 2000);
    toast.success(`"${code}" copied to clipboard!`);
  }, []);

  const handleEdit = (coupon: Coupon) => {
    setEditingCoupon(coupon);
    setShowForm(true);
  };

  const handleCreate = () => {
    setEditingCoupon(null);
    setShowForm(true);
  };

  const existingCodes = coupons.map((c) => c.code);

  // ── Close dropdowns on outside click ───────────────────────────────────
  useEffect(() => {
    const handler = () => {
      setShowStatusMenu(false);
      setShowTypeMenu(false);
    };
    document.addEventListener('click', handler);
    return () => document.removeEventListener('click', handler);
  }, []);

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* ── Page Header ──────────────────────────────────────────────── */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-black text-textColor tracking-tight flex items-center gap-2.5">
              <Ticket size={22} className="text-primary" />
              Coupons &amp; Discounts
            </h1>
            <p className="text-xs sm:text-sm text-textMuted mt-0.5">
              Create, manage and schedule discount coupons. Coupons auto-expire at the exact date &amp; time you set.
            </p>
          </div>
          <button
            id="create-coupon-btn"
            onClick={handleCreate}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-primary text-white hover:bg-primary-hover font-bold text-sm shadow-sm shadow-primary/30 w-fit transition-colors"
          >
            <Plus size={16} />
            Create Coupon
          </button>
        </div>

        {/* ── Stats Row ──────────────────────────────────────────────────── */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <StatCard
            label="Total Coupons"
            value={stats.total}
            icon={<Ticket size={20} />}
            color="bg-primary/10 text-primary"
          />
          <StatCard
            label="Active"
            value={stats.active}
            sub={`${stats.scheduled} scheduled`}
            icon={<CheckCircle2 size={20} />}
            color="bg-emerald-500/10 text-emerald-600"
          />
          <StatCard
            label="Expired / Disabled"
            value={stats.expired}
            icon={<AlertCircle size={20} />}
            color="bg-red-500/10 text-red-500"
          />
          <StatCard
            label="Total Redemptions"
            value={stats.totalRedemptions.toLocaleString()}
            icon={<TrendingUp size={20} />}
            color="bg-violet-500/10 text-violet-600"
          />
        </div>

        {/* ── Toolbar ───────────────────────────────────────────────────── */}
        <div className="flex flex-col sm:flex-row gap-3">
          {/* Search */}
          <div className="relative flex-1">
            <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-textMuted" />
            <input
              id="coupon-search"
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by code or description…"
              className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-borderColor bg-surfaceColor text-sm text-textColor placeholder:text-textMuted focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary/50 transition-all"
            />
            {search && (
              <button onClick={() => setSearch('')} className="absolute right-3 top-1/2 -translate-y-1/2 text-textMuted hover:text-textColor">
                <X size={14} />
              </button>
            )}
          </div>

          {/* Status Filter */}
          <div className="relative" onClick={(e) => e.stopPropagation()}>
            <button
              id="coupon-status-filter"
              onClick={() => { setShowStatusMenu((v) => !v); setShowTypeMenu(false); }}
              className="flex items-center gap-2 px-3.5 py-2.5 rounded-xl border border-borderColor bg-surfaceColor text-sm text-textColor hover:border-primary/40 transition-colors min-w-[140px] justify-between"
            >
              <div className="flex items-center gap-2">
                <Filter size={14} className="text-textMuted" />
                <span className="font-medium capitalize">{filterStatus === 'all' ? 'All Status' : STATUS_CONFIG[filterStatus].label}</span>
              </div>
              <ChevronDown size={13} className="text-textMuted" />
            </button>
            {showStatusMenu && (
              <div className="absolute top-full mt-1.5 left-0 z-30 min-w-[160px] bg-surfaceColor border border-borderColor rounded-xl shadow-xl overflow-hidden">
                {(['all', 'active', 'scheduled', 'expired', 'disabled'] as const).map((s) => (
                  <button
                    key={s}
                    onClick={() => { setFilterStatus(s); setShowStatusMenu(false); }}
                    className={`w-full flex items-center gap-2.5 px-4 py-2.5 text-sm text-left transition-colors hover:bg-bgColor ${filterStatus === s ? 'font-bold text-primary' : 'text-textColor'}`}
                  >
                    {s !== 'all' && (
                      <span className={`w-2 h-2 rounded-full ${STATUS_CONFIG[s].dot}`} />
                    )}
                    {s === 'all' ? 'All Status' : STATUS_CONFIG[s].label}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Type Filter */}
          <div className="relative" onClick={(e) => e.stopPropagation()}>
            <button
              id="coupon-type-filter"
              onClick={() => { setShowTypeMenu((v) => !v); setShowStatusMenu(false); }}
              className="flex items-center gap-2 px-3.5 py-2.5 rounded-xl border border-borderColor bg-surfaceColor text-sm text-textColor hover:border-primary/40 transition-colors min-w-[170px] justify-between"
            >
              <div className="flex items-center gap-2">
                <BarChart2 size={14} className="text-textMuted" />
                <span className="font-medium">
                  {filterType === 'all' ? 'All Types' : getDiscountTypeLabel(filterType)}
                </span>
              </div>
              <ChevronDown size={13} className="text-textMuted" />
            </button>
            {showTypeMenu && (
              <div className="absolute top-full mt-1.5 right-0 z-30 min-w-[210px] bg-surfaceColor border border-borderColor rounded-xl shadow-xl overflow-hidden">
                <button
                  onClick={() => { setFilterType('all'); setShowTypeMenu(false); }}
                  className={`w-full px-4 py-2.5 text-sm text-left transition-colors hover:bg-bgColor ${filterType === 'all' ? 'font-bold text-primary' : 'text-textColor'}`}
                >
                  All Types
                </button>
                {(['percentage', 'flat', 'min_order', 'first_order', 'product_specific', 'category_specific'] as CouponDiscountType[]).map((t) => (
                  <button
                    key={t}
                    onClick={() => { setFilterType(t); setShowTypeMenu(false); }}
                    className={`w-full flex items-center gap-2.5 px-4 py-2.5 text-sm text-left transition-colors hover:bg-bgColor ${filterType === t ? 'font-bold text-primary' : 'text-textColor'}`}
                  >
                    <span className={`p-1 rounded ${TYPE_COLOR[t]}`}>{TYPE_ICON[t]}</span>
                    {getDiscountTypeLabel(t)}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Refresh */}
          <button
            onClick={() => {
              setCoupons(getStoredCoupons());
              toast.success('Coupon statuses refreshed.');
            }}
            title="Refresh statuses"
            className="p-2.5 rounded-xl border border-borderColor bg-surfaceColor text-textMuted hover:text-primary hover:border-primary/40 transition-colors"
          >
            <RefreshCw size={15} />
          </button>
        </div>

        {/* ── Coupons Table / Cards ─────────────────────────────────────── */}
        {filtered.length === 0 ? (
          /* Empty State */
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center mb-4">
              <Ticket size={28} className="text-primary" />
            </div>
            <h3 className="text-lg font-bold text-textColor mb-1">No coupons found</h3>
            <p className="text-sm text-textMuted mb-5 max-w-xs">
              {search || filterStatus !== 'all' || filterType !== 'all'
                ? 'No coupons match your filters. Try clearing them.'
                : 'Create your first coupon to start offering discounts.'}
            </p>
            {(search || filterStatus !== 'all' || filterType !== 'all') ? (
              <button
                onClick={() => { setSearch(''); setFilterStatus('all'); setFilterType('all'); }}
                className="text-sm font-semibold text-primary hover:underline flex items-center gap-1.5"
              >
                <X size={14} /> Clear Filters
              </button>
            ) : (
              <button
                onClick={handleCreate}
                className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-primary text-white hover:bg-primary-hover font-bold text-sm shadow-sm shadow-primary/25 transition-colors"
              >
                <Plus size={15} /> Create First Coupon
              </button>
            )}
          </div>
        ) : (
          <>
            {/* Result count */}
            <p className="text-xs text-textMuted font-medium">
              Showing <span className="font-bold text-textColor">{filtered.length}</span> of {coupons.length} coupons
            </p>

            {/* Desktop Table */}
            <div className="hidden lg:block bg-surfaceColor border border-borderColor rounded-2xl overflow-hidden shadow-sm">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-borderColor bg-bgColor">
                    {['Code', 'Discount', 'Conditions', 'Usage', 'Expiry', 'Status', 'Actions'].map((h) => (
                      <th key={h} className="text-left px-4 py-3 text-[11px] font-bold text-textMuted uppercase tracking-wider">
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-borderColor">
                  {filtered.map((coupon) => {
                    const sc = STATUS_CONFIG[coupon.status];
                    const tc = TYPE_COLOR[coupon.discountType];
                    const isDisabled = coupon.status === 'disabled';
                    return (
                      <tr
                        key={coupon.id}
                        className={`group hover:bg-bgColor/60 transition-colors ${isDisabled ? 'opacity-60' : ''}`}
                      >
                        {/* Code */}
                        <td className="px-4 py-3.5">
                          <div className="flex items-center gap-2">
                            <span className="font-mono font-extrabold text-sm text-primary tracking-wider px-2 py-1 rounded-lg bg-primary/8 border border-primary/15">
                              {coupon.code}
                            </span>
                            <button
                              onClick={() => handleCopy(coupon.code)}
                              title="Copy code"
                              className="opacity-0 group-hover:opacity-100 text-textMuted hover:text-primary transition-all"
                            >
                              {copiedCode === coupon.code ? <CheckCircle2 size={13} className="text-emerald-500" /> : <Copy size={13} />}
                            </button>
                          </div>
                          <p className="text-[11px] text-textMuted mt-0.5 max-w-[200px] truncate">{coupon.description}</p>
                        </td>

                        {/* Discount */}
                        <td className="px-4 py-3.5">
                          <div className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-lg border text-[11px] font-bold ${tc}`}>
                            {TYPE_ICON[coupon.discountType]}
                            {formatDiscountValue(coupon)}
                          </div>
                          <p className="text-[10px] text-textMuted mt-1">{getDiscountTypeLabel(coupon.discountType)}</p>
                        </td>

                        {/* Conditions */}
                        <td className="px-4 py-3.5 space-y-1">
                          {coupon.minOrderAmount && (
                            <p className="text-[11px] text-textMuted flex items-center gap-1">
                              <ShoppingCart size={10} className="text-primary" />
                              Min ₹{coupon.minOrderAmount.toLocaleString()}
                            </p>
                          )}
                          {coupon.maxDiscountCap && (
                            <p className="text-[11px] text-textMuted flex items-center gap-1">
                              <IndianRupee size={10} className="text-primary" />
                              Cap ₹{coupon.maxDiscountCap.toLocaleString()}
                            </p>
                          )}
                          {coupon.isFirstOrderOnly && (
                            <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-amber-100 text-amber-700 border border-amber-200">
                              First Order Only
                            </span>
                          )}
                          {!coupon.minOrderAmount && !coupon.maxDiscountCap && !coupon.isFirstOrderOnly && (
                            <span className="text-[11px] text-textMuted/60">No restrictions</span>
                          )}
                        </td>

                        {/* Usage */}
                        <td className="px-4 py-3.5 min-w-[130px]">
                          <UsageBar used={coupon.usedCount} limit={coupon.usageLimit} />
                          <p className="text-[10px] text-textMuted mt-1">
                            Max {coupon.usagePerUser}/customer
                          </p>
                        </td>

                        {/* Expiry */}
                        <td className="px-4 py-3.5">
                          <ExpiryBadge expiryDate={coupon.expiryDate} status={coupon.status} />
                          <p className="text-[10px] text-textMuted mt-1">
                            {new Date(coupon.expiryDate).toLocaleDateString('en-IN', {
                              day: '2-digit', month: 'short', year: 'numeric',
                            })}{' '}
                            {new Date(coupon.expiryDate).toLocaleTimeString('en-IN', {
                              hour: '2-digit', minute: '2-digit', hour12: true,
                            })}
                          </p>
                        </td>

                        {/* Status */}
                        <td className="px-4 py-3.5">
                          <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full border text-[11px] font-bold ${sc.cls}`}>
                            <span className={`w-1.5 h-1.5 rounded-full ${sc.dot} ${coupon.status === 'active' ? 'animate-pulse' : ''}`} />
                            {sc.label}
                          </span>
                        </td>

                        {/* Actions */}
                        <td className="px-4 py-3.5">
                          <div className="flex items-center gap-1">
                            <button
                              onClick={() => handleEdit(coupon)}
                              title="Edit"
                              className="p-1.5 rounded-lg text-textMuted hover:text-primary hover:bg-primary/8 transition-colors"
                            >
                              <Edit2 size={14} />
                            </button>
                            <button
                              onClick={() => handleToggle(coupon)}
                              title={coupon.status === 'disabled' ? 'Enable' : 'Disable'}
                              className={`p-1.5 rounded-lg transition-colors ${
                                coupon.status === 'disabled'
                                  ? 'text-emerald-600 hover:bg-emerald-50'
                                  : 'text-textMuted hover:text-amber-600 hover:bg-amber-50'
                              }`}
                            >
                              {coupon.status === 'disabled'
                                ? <ToggleLeft size={16} />
                                : <ToggleRight size={16} />}
                            </button>
                            <button
                              onClick={() => setDeletingCoupon(coupon)}
                              title="Delete"
                              className="p-1.5 rounded-lg text-textMuted hover:text-red-500 hover:bg-red-50 transition-colors"
                            >
                              <Trash2 size={14} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* Mobile Cards */}
            <div className="lg:hidden grid grid-cols-1 sm:grid-cols-2 gap-4">
              {filtered.map((coupon) => {
                const sc = STATUS_CONFIG[coupon.status];
                const tc = TYPE_COLOR[coupon.discountType];
                const isDisabled = coupon.status === 'disabled';
                return (
                  <div
                    key={coupon.id}
                    className={`bg-surfaceColor border border-borderColor rounded-2xl p-4 space-y-3 hover:shadow-md transition-shadow ${isDisabled ? 'opacity-60' : ''}`}
                  >
                    {/* Top row */}
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex items-center gap-2 min-w-0">
                        <span className="font-mono font-extrabold text-sm text-primary px-2.5 py-1 rounded-lg bg-primary/8 border border-primary/15 shrink-0">
                          {coupon.code}
                        </span>
                        <button onClick={() => handleCopy(coupon.code)} className="text-textMuted hover:text-primary transition-colors shrink-0">
                          {copiedCode === coupon.code ? <CheckCircle2 size={13} className="text-emerald-500" /> : <Copy size={13} />}
                        </button>
                      </div>
                      <span className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full border text-[10px] font-bold shrink-0 ${sc.cls}`}>
                        <span className={`w-1.5 h-1.5 rounded-full ${sc.dot} ${coupon.status === 'active' ? 'animate-pulse' : ''}`} />
                        {sc.label}
                      </span>
                    </div>

                    {/* Description */}
                    <p className="text-xs text-textMuted leading-relaxed line-clamp-2">{coupon.description}</p>

                    {/* Discount + expiry */}
                    <div className="flex items-center justify-between gap-2">
                      <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-lg border text-[11px] font-bold ${tc}`}>
                        {TYPE_ICON[coupon.discountType]}
                        {formatDiscountValue(coupon)}
                      </span>
                      <ExpiryBadge expiryDate={coupon.expiryDate} status={coupon.status} />
                    </div>

                    {/* Usage */}
                    <UsageBar used={coupon.usedCount} limit={coupon.usageLimit} />

                    {/* Actions */}
                    <div className="flex items-center justify-end gap-1 pt-1 border-t border-borderColor/60">
                      <button onClick={() => handleEdit(coupon)} className="p-1.5 rounded-lg text-textMuted hover:text-primary hover:bg-primary/8 transition-colors">
                        <Edit2 size={14} />
                      </button>
                      <button onClick={() => handleToggle(coupon)} className={`p-1.5 rounded-lg transition-colors ${coupon.status === 'disabled' ? 'text-emerald-600 hover:bg-emerald-50' : 'text-textMuted hover:text-amber-600 hover:bg-amber-50'}`}>
                        {coupon.status === 'disabled' ? <ToggleLeft size={16} /> : <ToggleRight size={16} />}
                      </button>
                      <button onClick={() => setDeletingCoupon(coupon)} className="p-1.5 rounded-lg text-textMuted hover:text-red-500 hover:bg-red-50 transition-colors">
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </>
        )}
      </div>

      {/* ── Modals ────────────────────────────────────────────────────────── */}
      {showForm && (
        <CouponFormModal
          existingCoupon={editingCoupon}
          existingCodes={existingCodes}
          onSave={handleSave}
          onClose={() => { setShowForm(false); setEditingCoupon(null); }}
        />
      )}

      {deletingCoupon && (
        <DeleteCouponModal
          coupon={deletingCoupon}
          onConfirm={handleDelete}
          onCancel={() => setDeletingCoupon(null)}
        />
      )}
    </AdminLayout>
  );
}
