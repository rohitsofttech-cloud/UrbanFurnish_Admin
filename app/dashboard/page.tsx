'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import {
  IndianRupee,
  ShoppingBag,
  Users,
  TrendingUp,
  ArrowUpRight,
  ArrowDownRight,
  Plus,
  ArrowRight,
  Package,
  Clock,
  CheckCircle2,
  AlertCircle,
  Truck,
  RotateCcw,
  Sparkles,
  Calendar,
  Layers,
  ChevronRight,
  CreditCard,
  PieChart as PieIcon,
  BarChart3,
} from 'lucide-react';
import AdminLayout from '../common/AdminLayout';
import { useAuth } from '@/context/AuthContext';
import { DASHBOARD_METRICS, RECENT_ORDERS, TOP_PRODUCTS } from '@/lib/mockData';

// Chart Data Points for Revenue Line Graph
const REVENUE_DATA_7D = [
  { label: 'Mon', revenue: 14200, orders: 18, target: 12000 },
  { label: 'Tue', revenue: 18500, orders: 24, target: 15000 },
  { label: 'Wed', revenue: 16800, orders: 21, target: 15000 },
  { label: 'Thu', revenue: 22400, orders: 32, target: 18000 },
  { label: 'Fri', revenue: 28900, orders: 41, target: 20000 },
  { label: 'Sat', revenue: 36500, orders: 58, target: 25000 },
  { label: 'Sun', revenue: 31200, orders: 46, target: 24000 },
];

const REVENUE_DATA_30D = [
  { label: 'Week 1', revenue: 112000, orders: 142, target: 95000 },
  { label: 'Week 2', revenue: 138000, orders: 178, target: 110000 },
  { label: 'Week 3', revenue: 164000, orders: 210, target: 130000 },
  { label: 'Week 4', revenue: 198000, orders: 254, target: 150000 },
];

const REVENUE_DATA_12M = [
  { label: 'Jan', revenue: 380000, orders: 480, target: 350000 },
  { label: 'Feb', revenue: 420000, orders: 540, target: 380000 },
  { label: 'Mar', revenue: 510000, orders: 620, target: 450000 },
  { label: 'Apr', revenue: 480000, orders: 590, target: 460000 },
  { label: 'May', revenue: 590000, orders: 710, target: 500000 },
  { label: 'Jun', revenue: 640000, orders: 780, target: 550000 },
  { label: 'Jul', revenue: 720000, orders: 860, target: 600000 },
  { label: 'Aug', revenue: 810000, orders: 940, target: 680000 },
  { label: 'Sep', revenue: 780000, orders: 910, target: 700000 },
  { label: 'Oct', revenue: 890000, orders: 1040, target: 750000 },
  { label: 'Nov', revenue: 1050000, orders: 1280, target: 850000 },
  { label: 'Dec', revenue: 1245800, orders: 1490, target: 950000 },
];

// Order breakdown datasets for chart
const ORDER_STATUS_DATA = [
  { status: 'Delivered', count: 184, percentage: 58, color: '#10b981' },
  { status: 'Processing', count: 68, percentage: 22, color: '#3b82f6' },
  { status: 'In Transit / Shipped', count: 42, percentage: 13, color: '#6366f1' },
  { status: 'Pending / Action Req.', count: 22, percentage: 7, color: '#f59e0b' },
];

const ORDER_PAYMENT_DATA = [
  { method: 'UPI / QR Code', percentage: 48, amount: '₹59,798', color: 'bg-emerald-500' },
  { method: 'Credit / Debit Card', percentage: 32, amount: '₹39,865', color: 'bg-indigo-500' },
  { method: 'Net Banking', percentage: 12, amount: '₹14,949', color: 'bg-blue-500' },
  { method: 'Cash on Delivery (COD)', percentage: 8, amount: '₹9,968', color: 'bg-amber-500' },
];

export default function DashboardPage() {
  const { user } = useAuth();
  const [timeframe, setTimeframe] = useState<'7D' | '30D' | '12M'>('7D');
  const [hoveredPoint, setHoveredPoint] = useState<number | null>(null);

  const activeData =
    timeframe === '7D'
      ? REVENUE_DATA_7D
      : timeframe === '30D'
        ? REVENUE_DATA_30D
        : REVENUE_DATA_12M;

  const maxRevenue = Math.max(...activeData.map((d) => d.revenue)) * 1.15;
  const chartHeight = 220;
  const chartWidth = 600;

  // Build SVG path for smooth line
  const points = activeData.map((d, idx) => {
    const x = (idx / (activeData.length - 1)) * (chartWidth - 40) + 20;
    const y = chartHeight - 30 - (d.revenue / maxRevenue) * (chartHeight - 60);
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

  const areaD = `${pathD} L ${points[points.length - 1].x} ${chartHeight - 20} L ${points[0].x} ${chartHeight - 20} Z`;

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'Delivered':
        return 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20';
      case 'Processing':
        return 'bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20';
      case 'Shipped':
        return 'bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border-indigo-500/20';
      case 'Pending':
        return 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20';
      case 'Cancelled':
        return 'bg-red-500/10 text-red-600 dark:text-red-400 border-red-500/20';
      default:
        return 'bg-gray-500/10 text-gray-600 border-gray-500/20';
    }
  };

  const getMetricIcon = (iconName: string) => {
    switch (iconName) {
      case 'IndianRupee ':
        return <IndianRupee size={22} className="text-emerald-500" />;
      case 'ShoppingBag':
        return <ShoppingBag size={22} className="text-blue-500" />;
      case 'Users':
        return <Users size={22} className="text-indigo-500" />;
      case 'TrendingUp':
        return <TrendingUp size={22} className="text-amber-500" />;
      default:
        return <IndianRupee size={22} className="text-primary" />;
    }
  };

  return (
    <AdminLayout>
      <div className="space-y-6 sm:space-y-8 animate-fadeIn">
        {/* Welcome Banner */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-6 rounded-2xl bg-surfaceColor border border-borderColor shadow-xs">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <h1 className="text-xl sm:text-2xl font-black text-textColor tracking-tight">
                Welcome back, {user?.name || 'Super Admin'} 👋
              </h1>
              <span className="text-[11px] font-extrabold px-2.5 py-0.5 rounded-full bg-primary/10 text-primary border border-primary/20">
                Storefront Live
              </span>
            </div>
            <p className="text-xs sm:text-sm text-textMuted">
              Real-time revenue performance, order fulfillment analytics, and catalog health.
            </p>
          </div>

          <div className="flex items-center gap-2.5">
            <Link
              href="/orders"
              className="px-4 py-2 text-xs font-bold rounded-xl bg-bgColor border border-borderColor hover:bg-sidebarHover text-textColor transition-all flex items-center gap-1.5"
            >
              <Clock size={14} />
              <span>Pending Orders (5)</span>
            </Link>
            <Link
              href="/billing"
              className="px-4 py-2 text-xs font-bold rounded-xl bg-bgColor border border-borderColor hover:bg-sidebarHover text-textColor transition-all flex items-center gap-1.5"
            >
              <CreditCard size={14} />
              <span>Billing &amp; Invoices</span>
            </Link>
            <Link
              href="/products?action=new"
              className="px-4 py-2 text-xs font-bold rounded-xl bg-primary text-white hover:bg-primary-hover shadow-sm shadow-primary/30 transition-all flex items-center gap-1.5"
            >
              <Plus size={15} />
              <span>Add Product</span>
            </Link>
          </div>
        </div>

        {/* 4 Core KPI Stat Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5">
          {DASHBOARD_METRICS.map((metric, idx) => (
            <div
              key={idx}
              className="p-5 rounded-2xl bg-surfaceColor border border-borderColor shadow-xs hover:border-primary/40 transition-all group"
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-textMuted uppercase tracking-wider">
                  {metric.title}
                </span>
                <div className="p-2.5 rounded-xl bg-bgColor border border-borderColor/60 group-hover:scale-110 transition-transform">
                  {getMetricIcon(metric.iconName)}
                </div>
              </div>

              <div className="mt-3 space-y-1">
                <span className="text-2xl sm:text-3xl font-black text-textColor tracking-tight block">
                  {metric.value}
                </span>
                <div className="flex items-center gap-1.5 text-xs">
                  <span
                    className={`flex items-center font-bold ${metric.isPositive ? 'text-emerald-500' : 'text-red-500'
                      }`}
                  >
                    {metric.isPositive ? (
                      <ArrowUpRight size={15} />
                    ) : (
                      <ArrowDownRight size={15} />
                    )}
                    {metric.change}
                  </span>
                  <span className="text-textMuted">{metric.timeframe}</span>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* REVENUE LINE GRAPH & ORDER DETAILS CHARTS */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Revenue Line Graph (2 Columns on large screens) */}
          <div className="lg:col-span-2 p-6 rounded-2xl bg-surfaceColor border border-borderColor shadow-xs flex flex-col justify-between">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-borderColor">
              <div>
                <div className="flex items-center gap-2">
                  <h2 className="font-black text-base sm:text-lg text-textColor">
                    Revenue Trend &amp; Growth
                  </h2>
                  <span className="text-[11px] font-bold px-2 py-0.5 rounded-md bg-emerald-500/10 text-emerald-600">
                    +14.8% MoM
                  </span>
                </div>
                <p className="text-xs text-textMuted mt-0.5">
                  Interactive revenue line chart showing online sales volume and daily trends.
                </p>
              </div>

              {/* Timeframe selector */}
              <div className="flex items-center p-1 bg-bgColor rounded-xl border border-borderColor w-fit">
                {(['7D', '30D', '12M'] as const).map((t) => (
                  <button
                    key={t}
                    onClick={() => {
                      setTimeframe(t);
                      setHoveredPoint(null);
                    }}
                    className={`px-3 py-1 text-xs font-bold rounded-lg transition-all ${timeframe === t
                        ? 'bg-primary text-white shadow-xs'
                        : 'text-textMuted hover:text-textColor'
                      }`}
                  >
                    {t === '7D' ? 'Last 7 Days' : t === '30D' ? 'Last 30 Days' : 'Past Year'}
                  </button>
                ))}
              </div>
            </div>

            {/* SVG Line Graph */}
            <div className="relative pt-6 pb-2">
              <svg
                viewBox={`0 0 ${chartWidth} ${chartHeight}`}
                className="w-full h-56 sm:h-64 overflow-visible"
              >
                <defs>
                  <linearGradient id="revenueGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#10b981" stopOpacity="0.35" />
                    <stop offset="100%" stopColor="#10b981" stopOpacity="0.0" />
                  </linearGradient>
                  <linearGradient id="lineGrad" x1="0" y1="0" x2="1" y2="0">
                    <stop offset="0%" stopColor="#059669" />
                    <stop offset="50%" stopColor="#10b981" />
                    <stop offset="100%" stopColor="#34d399" />
                  </linearGradient>
                </defs>

                {/* Horizontal Grid lines */}
                {[0.2, 0.4, 0.6, 0.8].map((ratio, idx) => {
                  const yPos = chartHeight - 30 - ratio * (chartHeight - 60);
                  return (
                    <g key={idx}>
                      <line
                        x1="10"
                        y1={yPos}
                        x2={chartWidth - 10}
                        y2={yPos}
                        stroke="currentColor"
                        strokeDasharray="4 4"
                        className="text-borderColor/60"
                        strokeWidth="1"
                      />
                      <text
                        x="15"
                        y={yPos - 4}
                        className="text-[9px] fill-textMuted/60 font-mono"
                      >
                        ₹{Math.round((maxRevenue * ratio) / 1000)}k
                      </text>
                    </g>
                  );
                })}

                {/* Area Gradient */}
                <path d={areaD} fill="url(#revenueGrad)" />

                {/* Line Path */}
                <path
                  d={pathD}
                  fill="none"
                  stroke="url(#lineGrad)"
                  strokeWidth="3.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />

                {/* Interactive Points */}
                {points.map((p, idx) => (
                  <g key={idx} className="cursor-pointer">
                    <circle
                      cx={p.x}
                      cy={p.y}
                      r={hoveredPoint === idx ? 7 : 4.5}
                      className={`transition-all duration-150 ${hoveredPoint === idx
                          ? 'fill-emerald-500 stroke-white dark:stroke-surfaceColor stroke-[3px]'
                          : 'fill-white dark:fill-surfaceColor stroke-emerald-500 stroke-[2.5px]'
                        }`}
                      onMouseEnter={() => setHoveredPoint(idx)}
                    />
                    {/* X Axis Labels */}
                    <text
                      x={p.x}
                      y={chartHeight - 4}
                      textAnchor="middle"
                      className={`text-[10px] font-semibold transition-colors ${hoveredPoint === idx
                          ? 'fill-emerald-500 font-bold'
                          : 'fill-textMuted'
                        }`}
                    >
                      {p.label}
                    </text>
                  </g>
                ))}
              </svg>

              {/* Hover Tooltip Box */}
              {hoveredPoint !== null && (
                <div
                  className="absolute z-20 px-3.5 py-2 rounded-xl bg-surfaceColor border border-borderColor shadow-xl pointer-events-none transform -translate-x-1/2 -translate-y-full"
                  style={{
                    left: `${(points[hoveredPoint].x / chartWidth) * 100}%`,
                    top: `${(points[hoveredPoint].y / chartHeight) * 100 - 12}%`,
                  }}
                >
                  <p className="text-[10px] font-bold text-textMuted uppercase tracking-wider">
                    {points[hoveredPoint].label}
                  </p>
                  <p className="text-xs font-black text-emerald-500">
                    ₹{points[hoveredPoint].revenue.toLocaleString('en-IN')}
                  </p>
                  <p className="text-[10px] text-textMuted">
                    {points[hoveredPoint].orders} orders &bull; Target: ₹
                    {(points[hoveredPoint].target / 1000).toFixed(0)}k
                  </p>
                </div>
              )}
            </div>

            {/* Bottom summary bar */}
            <div className="grid grid-cols-3 gap-2 pt-3 border-t border-borderColor mt-2 text-center">
              <div className="p-2 rounded-xl bg-bgColor/50">
                <span className="text-[10px] text-textMuted uppercase font-bold block">Period Total</span>
                <span className="text-sm font-black text-textColor">
                  ₹{activeData.reduce((s, d) => s + d.revenue, 0).toLocaleString('en-IN')}
                </span>
              </div>
              <div className="p-2 rounded-xl bg-bgColor/50">
                <span className="text-[10px] text-textMuted uppercase font-bold block">Daily Average</span>
                <span className="text-sm font-black text-textColor">
                  ₹
                  {Math.round(
                    activeData.reduce((s, d) => s + d.revenue, 0) / activeData.length
                  ).toLocaleString('en-IN')}
                </span>
              </div>
              <div className="p-2 rounded-xl bg-bgColor/50">
                <span className="text-[10px] text-textMuted uppercase font-bold block">Total Orders</span>
                <span className="text-sm font-black text-emerald-600">
                  {activeData.reduce((s, d) => s + d.orders, 0)} units
                </span>
              </div>
            </div>
          </div>

          {/* Order Details & Status Breakdown Chart */}
          <div className="p-6 rounded-2xl bg-surfaceColor border border-borderColor shadow-xs flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between pb-4 border-b border-borderColor">
                <div>
                  <h2 className="font-black text-base text-textColor">Order Status Breakdown</h2>
                  <p className="text-xs text-textMuted">Live fulfillment distribution</p>
                </div>
                <Link
                  href="/orders"
                  className="text-xs font-bold text-primary hover:underline flex items-center gap-1"
                >
                  <span>Orders</span>
                  <ArrowRight size={13} />
                </Link>
              </div>

              {/* Progress bars visualizer */}
              <div className="space-y-4 my-5">
                {ORDER_STATUS_DATA.map((item, idx) => (
                  <div key={idx} className="space-y-1.5">
                    <div className="flex items-center justify-between text-xs">
                      <div className="flex items-center gap-2">
                        <span
                          className="w-2.5 h-2.5 rounded-full"
                          style={{ backgroundColor: item.color }}
                        />
                        <span className="font-semibold text-textColor">{item.status}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-textColor">{item.count}</span>
                        <span className="text-textMuted">({item.percentage}%)</span>
                      </div>
                    </div>
                    <div className="w-full h-2 rounded-full bg-bgColor overflow-hidden">
                      <div
                        className="h-full rounded-full transition-all duration-500"
                        style={{
                          width: `${item.percentage}%`,
                          backgroundColor: item.color,
                        }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Payment Methods Breakdown */}
            <div className="pt-4 border-t border-borderColor">
              <h3 className="text-xs font-bold text-textMuted uppercase tracking-wider mb-2.5">
                Payment Method Split
              </h3>
              <div className="grid grid-cols-2 gap-2">
                {ORDER_PAYMENT_DATA.map((pm, idx) => (
                  <div key={idx} className="p-2 rounded-xl bg-bgColor border border-borderColor/60">
                    <div className="flex items-center gap-1.5">
                      <span className={`w-2 h-2 rounded-full ${pm.color}`} />
                      <span className="text-[11px] font-semibold text-textColor truncate">
                        {pm.method.split('/')[0]}
                      </span>
                    </div>
                    <p className="text-xs font-black text-textColor mt-1">{pm.percentage}%</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>


        {/* Main Grid: Recent Orders & Top Selling Products */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 rounded-2xl bg-surfaceColor border border-borderColor shadow-xs overflow-hidden">
            <div className="p-5 border-b border-borderColor flex items-center justify-between bg-bgColor/40">
              <div className="flex items-center gap-2">
                <h2 className="font-bold text-base text-textColor">Recent Customer Orders</h2>
                <span className="text-xs font-semibold px-2 py-0.5 rounded-md bg-bgColor border border-borderColor text-textMuted">
                  Live
                </span>
              </div>
              <Link
                href="/orders"
                className="text-xs font-bold text-primary hover:text-primary-hover flex items-center gap-1"
              >
                <span>View all orders</span>
                <ArrowRight size={13} />
              </Link>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead>
                  <tr className="border-b border-borderColor text-[11px] font-bold text-textMuted uppercase bg-bgColor/20">
                    <th className="px-5 py-3">Order ID</th>
                    <th className="px-5 py-3">Customer</th>
                    <th className="px-5 py-3">Date</th>
                    <th className="px-5 py-3">Amount</th>
                    <th className="px-5 py-3">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-borderColor/50">
                  {RECENT_ORDERS.map((order) => (
                    <tr
                      key={order.id}
                      className="hover:bg-sidebarHover/60 transition-colors group"
                    >
                      <td className="px-5 py-3.5 font-bold text-xs">
                        <Link
                          href={`/orders/${order.id}`}
                          className="font-mono text-primary hover:underline hover:text-primary-hover inline-flex items-center gap-1"
                        >
                          {order.id}
                        </Link>
                      </td>
                      <td className="px-5 py-3.5">
                        <Link href={`/orders/${order.id}`} className="flex items-center gap-2.5">
                          <div className="w-7 h-7 rounded-full bg-primary/20 text-primary font-bold flex items-center justify-center text-xs">
                            {order.customerName.charAt(0)}
                          </div>
                          <div>
                            <p className="font-semibold text-xs text-textColor leading-tight">
                              {order.customerName}
                            </p>
                            <p className="text-[11px] text-textMuted">{order.customerEmail}</p>
                          </div>
                        </Link>
                      </td>
                      <td className="px-5 py-3.5 text-xs text-textMuted whitespace-nowrap">
                        {order.date}
                      </td>
                      <td className="px-5 py-3.5 font-bold text-xs text-textColor font-mono">
                        ₹{order.totalAmount.toFixed(2)}
                      </td>
                      <td className="px-5 py-3.5">
                        <span
                          className={`text-[11px] font-bold px-2.5 py-0.5 rounded-full border ${getStatusBadge(
                            order.status
                          )}`}
                        >
                          {order.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          <div className="rounded-2xl bg-surfaceColor border border-borderColor shadow-xs overflow-hidden flex flex-col">
            <div className="p-5 border-b border-borderColor flex items-center justify-between bg-bgColor/40">
              <h2 className="font-bold text-base text-textColor">Top Furnishings</h2>
              <Link
                href="/products"
                className="text-xs font-bold text-primary hover:text-primary-hover flex items-center gap-1"
              >
                <span>Catalog</span>
                <ArrowRight size={13} />
              </Link>
            </div>

            <div className="p-4 space-y-3 flex-1">
              {TOP_PRODUCTS.map((product) => (
                <div
                  key={product.id}
                  className="flex items-center justify-between p-3 rounded-xl bg-bgColor/60 border border-borderColor/50 hover:border-primary/30 transition-all group"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-11 h-11 rounded-lg bg-surfaceColor border border-borderColor flex items-center justify-center text-primary font-bold overflow-hidden shrink-0">
                      <Package size={20} className="text-primary/70" />
                    </div>
                    <div>
                      <p className="font-bold text-xs text-textColor group-hover:text-primary transition-colors">
                        {product.name}
                      </p>
                      <p className="text-[11px] text-textMuted">
                        {product.category} &bull; ₹{product.price}
                      </p>
                    </div>
                  </div>

                  <div className="text-right shrink-0">
                    <span className="text-xs font-black text-textColor block">
                      {product.sales} sold
                    </span>
                    <span
                      className={`text-[10px] font-bold ${product.stock <= 5 ? 'text-amber-500' : 'text-emerald-500'
                        }`}
                    >
                      {product.stock} in stock
                    </span>
                  </div>
                </div>
              ))}
            </div>

            <div className="p-4 border-t border-borderColor bg-amber-500/5 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <AlertCircle size={15} className="text-amber-500 shrink-0" />
                <span className="text-xs font-medium text-textColor">
                  3 low-stock SKUs require reordering
                </span>
              </div>
              <Link
                href="/inventory"
                className="text-xs font-bold text-amber-600 dark:text-amber-400 hover:underline"
              >
                View
              </Link>
            </div>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}
