'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import AdminLayout from '../common/AdminLayout';
import {
  BarChart3,
  TrendingUp,
  IndianRupee,
  Users,
  ShoppingBag,
  Package,
  Star,
  Award,
  Crown,
  Medal,
  ArrowUpRight,
  ArrowRight,
  Sparkles,
  PieChart as PieIcon,
  Layers,
  CreditCard,
  Percent,
} from 'lucide-react';
import { DASHBOARD_METRICS } from '@/lib/mockData';

// Top 5 Ordered Products
const TOP_5_ORDERED_PRODUCTS = [
  {
    rank: 1,
    id: 'PRD-101',
    name: 'Lorenz 3+1+1 Seater Sofa Set (Velvet, Salmon Pink)',
    category: 'Sofas & Couches (Living Room)',
    unitsSold: 428,
    unitPrice: 99999,
    totalRevenue: 42799572,
    rating: 4.9,
    reviewCount: 428,
    stock: 18,
    image: 'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=200&auto=format&fit=crop&q=80',
    sharePercent: 34,
  },
  {
    rank: 2,
    id: 'PRD-104',
    name: 'Calmore Solid Sheesham King Bed with Drawers',
    category: 'Beds & Frames (Bedroom)',
    unitsSold: 512,
    unitPrice: 28999,
    totalRevenue: 14847488,
    rating: 4.9,
    reviewCount: 512,
    stock: 8,
    image: 'https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?w=200&auto=format&fit=crop&q=80',
    sharePercent: 26,
  },
  {
    rank: 3,
    id: 'PRD-102',
    name: 'Marriott 3 Seater Wooden Sofa (Teak Finish)',
    category: 'Sofas & Couches (Living Room)',
    unitsSold: 342,
    unitPrice: 24999,
    totalRevenue: 8549658,
    rating: 4.9,
    reviewCount: 428,
    stock: 24,
    image: 'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=200&auto=format&fit=crop&q=80',
    sharePercent: 18,
  },
  {
    rank: 4,
    id: 'PRD-103',
    name: 'Solano L-Shape Luxury Velvet Sectional Sofa',
    category: 'Sofas & Couches (Living Room)',
    unitsSold: 284,
    unitPrice: 42999,
    totalRevenue: 12211716,
    rating: 4.8,
    reviewCount: 284,
    stock: 12,
    image: 'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=200&auto=format&fit=crop&q=80',
    sharePercent: 14,
  },
  {
    rank: 5,
    id: 'PRD-106',
    name: 'Sensa 4 Seater Solid Mango Wood Dining Set',
    category: 'Dining & Kitchen',
    unitsSold: 245,
    unitPrice: 21988,
    totalRevenue: 5387060,
    rating: 4.8,
    reviewCount: 245,
    stock: 20,
    image: 'https://images.unsplash.com/photo-1617806118233-18e1de247200?w=200&auto=format&fit=crop&q=80',
    sharePercent: 8,
  },
];

// Monthly Sales Trend Data
const MONTHLY_ANALYTICS = [
  { month: 'Jan', revenue: 380000, orders: 480 },
  { month: 'Feb', revenue: 420000, orders: 540 },
  { month: 'Mar', revenue: 510000, orders: 620 },
  { month: 'Apr', revenue: 480000, orders: 590 },
  { month: 'May', revenue: 590000, orders: 710 },
  { month: 'Jun', revenue: 640000, orders: 780 },
  { month: 'Jul', revenue: 720000, orders: 860 },
  { month: 'Aug', revenue: 810000, orders: 940 },
  { month: 'Sep', revenue: 780000, orders: 910 },
  { month: 'Oct', revenue: 890000, orders: 1040 },
  { month: 'Nov', revenue: 1050000, orders: 1280 },
  { month: 'Dec', revenue: 1245800, orders: 1490 },
];

const CATEGORY_SHARE = [
  { name: 'Living Room Furniture', share: 45, revenue: '₹5,60,610', color: 'bg-emerald-500' },
  { name: 'Bedroom & Mattresses', share: 30, revenue: '₹3,73,740', color: 'bg-indigo-500' },
  { name: 'Dining & Kitchen', share: 15, revenue: '₹1,86,870', color: 'bg-blue-500' },
  { name: 'Study & Office Workspaces', share: 6, revenue: '₹74,748', color: 'bg-purple-500' },
  { name: 'Lighting & Decor', share: 4, revenue: '₹49,832', color: 'bg-amber-500' },
];

export default function AnalyticsPage() {
  const [hoveredMonth, setHoveredMonth] = useState<number | null>(null);

  const maxMonthlyRevenue = Math.max(...MONTHLY_ANALYTICS.map((m) => m.revenue)) * 1.1;
  const chartHeight = 180;
  const chartWidth = 500;

  const points = MONTHLY_ANALYTICS.map((d, idx) => {
    const x = (idx / (MONTHLY_ANALYTICS.length - 1)) * (chartWidth - 40) + 20;
    const y = chartHeight - 25 - (d.revenue / maxMonthlyRevenue) * (chartHeight - 45);
    return { x, y, ...d };
  });

  const pathD = points.reduce((acc, p, i) => {
    if (i === 0) return `M ${p.x} ${p.y}`;
    const prev = points[i - 1];
    const cx1 = prev.x + (p.x - prev.x) / 2;
    const cy1 = prev.y;
    const cx2 = prev.x + (p.x - prev.x) / 2;
    const cy2 = p.y;
    return `${acc} C ${cx1} ${cy1}, ${cx2} ${cy2}, ${p.x} ${p.y}`;
  }, '');

  const areaD = `${pathD} L ${points[points.length - 1].x} ${chartHeight - 15} L ${points[0].x} ${chartHeight - 15} Z`;

  const getRankBadge = (rank: number) => {
    switch (rank) {
      case 1:
        return (
          <div className="w-8 h-8 rounded-full bg-amber-500/20 text-amber-500 border border-amber-500/30 flex items-center justify-center font-black text-xs shadow-xs">
            <Crown size={15} />
          </div>
        );
      case 2:
        return (
          <div className="w-8 h-8 rounded-full bg-slate-400/20 text-slate-400 border border-slate-400/30 flex items-center justify-center font-black text-xs">
            <Medal size={15} />
          </div>
        );
      case 3:
        return (
          <div className="w-8 h-8 rounded-full bg-amber-700/20 text-amber-700 border border-amber-700/30 flex items-center justify-center font-black text-xs">
            <Award size={15} />
          </div>
        );
      default:
        return (
          <div className="w-8 h-8 rounded-full bg-bgColor border border-borderColor flex items-center justify-center font-black text-xs text-textMuted">
            #{rank}
          </div>
        );
    }
  };

  return (
    <AdminLayout>
      <div className="space-y-6 sm:space-y-8 animate-fadeIn">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-2xl font-black text-textColor tracking-tight">
                Sales Analytics &amp; Product Intelligence
              </h1>
              <span className="text-[11px] font-bold px-2 py-0.5 rounded-md bg-primary/10 text-primary border border-primary/20">
                Top Products
              </span>
            </div>
            <p className="text-xs sm:text-sm text-textMuted mt-0.5">
              Comprehensive product performance, top ordered merchandise, revenue graphs, and category attribution.
            </p>
          </div>
        </div>

        {/* 4 KPI Metrics */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5">
          {DASHBOARD_METRICS.map((m, idx) => (
            <div
              key={idx}
              className="p-5 rounded-2xl bg-surfaceColor border border-borderColor space-y-1.5 shadow-xs"
            >
              <span className="text-xs font-bold text-textMuted uppercase tracking-wider block">
                {m.title}
              </span>
              <p className="text-2xl sm:text-3xl font-black text-textColor tracking-tight">
                {m.value}
              </p>
              <span className="text-xs text-emerald-500 font-bold flex items-center gap-1">
                <ArrowUpRight size={14} />
                {m.change} growth ({m.timeframe})
              </span>
            </div>
          ))}
        </div>



        {/* CHARTS & ATTRIBUTION GRID */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Monthly Revenue Trend Graph */}
          <div className="p-6 rounded-2xl bg-surfaceColor border border-borderColor shadow-xs flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between pb-4 border-b border-borderColor">
                <div>
                  <h3 className="font-black text-base text-textColor">
                    Annual Sales &amp; Revenue Trajectory
                  </h3>
                  <p className="text-xs text-textMuted">12-Month revenue graph</p>
                </div>
                <span className="text-xs font-bold px-2 py-0.5 rounded-md bg-emerald-500/10 text-emerald-600">
                  ₹84.2 Lakhs YTD
                </span>
              </div>

              <div className="relative pt-6 pb-2">
                <svg
                  viewBox={`0 0 ${chartWidth} ${chartHeight}`}
                  className="w-full h-48 overflow-visible"
                >
                  <defs>
                    <linearGradient id="analyticsGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#3b82f6" stopOpacity="0.3" />
                      <stop offset="100%" stopColor="#3b82f6" stopOpacity="0.0" />
                    </linearGradient>
                  </defs>

                  <path d={areaD} fill="url(#analyticsGrad)" />
                  <path
                    d={pathD}
                    fill="none"
                    stroke="#3b82f6"
                    strokeWidth="3"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />

                  {points.map((p, idx) => (
                    <g key={idx}>
                      <circle
                        cx={p.x}
                        cy={p.y}
                        r={hoveredMonth === idx ? 6 : 3.5}
                        className={`cursor-pointer transition-all ${hoveredMonth === idx
                            ? 'fill-blue-500 stroke-white dark:stroke-surfaceColor stroke-2'
                            : 'fill-white dark:fill-surfaceColor stroke-blue-500 stroke-2'
                          }`}
                        onMouseEnter={() => setHoveredMonth(idx)}
                      />
                      <text
                        x={p.x}
                        y={chartHeight - 2}
                        textAnchor="middle"
                        className="text-[9px] fill-textMuted font-semibold"
                      >
                        {p.month}
                      </text>
                    </g>
                  ))}
                </svg>

                {hoveredMonth !== null && (
                  <div
                    className="absolute z-20 px-3 py-1.5 rounded-xl bg-surfaceColor border border-borderColor shadow-xl pointer-events-none transform -translate-x-1/2 -translate-y-full"
                    style={{
                      left: `${(points[hoveredMonth].x / chartWidth) * 100}%`,
                      top: `${(points[hoveredMonth].y / chartHeight) * 100 - 10}%`,
                    }}
                  >
                    <p className="text-[10px] font-bold text-textMuted uppercase">
                      {points[hoveredMonth].month} 2026
                    </p>
                    <p className="text-xs font-black text-blue-600">
                      ₹{points[hoveredMonth].revenue.toLocaleString('en-IN')}
                    </p>
                    <p className="text-[10px] text-textMuted">
                      {points[hoveredMonth].orders} orders
                    </p>
                  </div>
                )}
              </div>
            </div>

            <div className="pt-3 border-t border-borderColor flex justify-between text-xs text-textMuted">
              <span>Peak Month: <strong>Dec (₹12.45L)</strong></span>
              <span>Avg Monthly Run Rate: <strong>₹7.02L</strong></span>
            </div>
          </div>

          {/* Category Revenue Distribution */}
          <div className="p-6 rounded-2xl bg-surfaceColor border border-borderColor shadow-xs flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between pb-4 border-b border-borderColor">
                <div>
                  <h3 className="font-black text-base text-textColor">
                    Category Revenue Distribution
                  </h3>
                  <p className="text-xs text-textMuted">Attribution by Room Taxonomy</p>
                </div>
                <Layers size={18} className="text-primary" />
              </div>

              <div className="space-y-4 my-5">
                {CATEGORY_SHARE.map((cat, idx) => (
                  <div key={idx} className="space-y-1.5">
                    <div className="flex justify-between text-xs font-semibold">
                      <span className="text-textColor">{cat.name}</span>
                      <span className="text-textMuted font-mono">
                        {cat.revenue} ({cat.share}%)
                      </span>
                    </div>
                    <div className="w-full h-2 rounded-full bg-bgColor overflow-hidden">
                      <div
                        className={`h-full ${cat.color} rounded-full`}
                        style={{ width: `${cat.share}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="pt-3 border-t border-borderColor flex items-center justify-between text-xs text-textMuted">
              <span>Dominant Room: <strong>Living Room (45%)</strong></span>
              <span className="text-emerald-500 font-bold">+18.2% YoY growth</span>
            </div>
          </div>
        </div>

        {/* TOP 5 ORDERED PRODUCTS SHOWCASE */}
        <div className="p-6 rounded-2xl bg-surfaceColor border border-borderColor shadow-xs space-y-5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-borderColor">
            <div>
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-amber-500/10 text-amber-500 flex items-center justify-center font-bold">
                  <Crown size={18} />
                </div>
                <h2 className="text-lg font-black text-textColor">
                  Top 5 Most Ordered Products
                </h2>
              </div>
              <p className="text-xs text-textMuted mt-0.5">
                Highest selling furniture items ranked by customer order volume and gross revenue.
              </p>
            </div>

            <Link
              href="/products"
              className="text-xs font-bold text-primary hover:underline flex items-center gap-1 w-fit"
            >
              <span>View full catalog</span>
              <ArrowRight size={13} />
            </Link>
          </div>

          <div className="space-y-3.5">
            {TOP_5_ORDERED_PRODUCTS.map((prod) => (
              <div
                key={prod.id}
                className="p-4 rounded-2xl bg-bgColor/60 border border-borderColor flex flex-col md:flex-row md:items-center justify-between gap-4 hover:border-primary/40 transition-all group"
              >
                <div className="flex items-center gap-3.5 flex-1 min-w-0">
                  {getRankBadge(prod.rank)}

                  <div className="w-14 h-14 rounded-xl bg-surfaceColor border border-borderColor overflow-hidden shrink-0">
                    <img
                      src={prod.image}
                      alt={prod.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                    />
                  </div>

                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <h4 className="font-bold text-xs sm:text-sm text-textColor truncate group-hover:text-primary transition-colors">
                        {prod.name}
                      </h4>
                      <span className="text-[10px] font-mono text-textMuted shrink-0">
                        {prod.id}
                      </span>
                    </div>
                    <p className="text-[11px] text-textMuted mt-0.5">{prod.category}</p>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="flex items-center gap-1 text-[11px] font-semibold text-textColor">
                        <Star size={11} className="text-amber-500 fill-amber-500" />
                        {prod.rating} ({prod.reviewCount})
                      </span>
                      <span className="text-textMuted text-[10px]">&bull;</span>
                      <span className="text-[10px] font-bold text-emerald-600">
                        {prod.stock} in stock
                      </span>
                    </div>
                  </div>
                </div>

                {/* Performance Metrics & Visual Share Bar */}
                <div className="flex items-center justify-between md:justify-end gap-6 shrink-0 pt-2 md:pt-0 border-t md:border-t-0 border-borderColor/60">
                  <div className="text-left md:text-right">
                    <span className="text-[10px] text-textMuted uppercase font-bold block">
                      Order Volume
                    </span>
                    <span className="text-sm font-black text-textColor block">
                      {prod.unitsSold.toLocaleString('en-IN')} units
                    </span>
                    <span className="text-[11px] text-textMuted">
                      ₹{prod.unitPrice.toLocaleString('en-IN')} / unit
                    </span>
                  </div>

                  <div className="text-right min-w-[120px]">
                    <span className="text-[10px] text-textMuted uppercase font-bold block">
                      Gross Revenue
                    </span>
                    <span className="text-sm font-black text-emerald-600 font-mono block">
                      ₹{prod.totalRevenue.toLocaleString('en-IN')}
                    </span>
                    <div className="w-full h-1.5 rounded-full bg-surfaceColor mt-1 overflow-hidden">
                      <div
                        className="h-full bg-emerald-500 rounded-full"
                        style={{ width: `${prod.sharePercent * 2.5}%` }}
                      />
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

      </div>
    </AdminLayout>
  );
}
