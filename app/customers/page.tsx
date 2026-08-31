'use client';

import React, { useState, useMemo } from 'react';
import Link from 'next/link';
import AdminLayout from '../common/AdminLayout';
import {
  Users,
  Search,
  Filter,
  Plus,
  ArrowRight,
  Mail,
  Phone,
  MapPin,
  Calendar,
  ShoppingBag,
  IndianRupee,
  Star,
  CheckCircle2,
  X,
  ExternalLink,
  Crown,
  Heart,
} from 'lucide-react';
import toast from 'react-hot-toast';

export interface Customer {
  id: string;
  name: string;
  email: string;
  phone: string;
  avatar?: string;
  city: string;
  address: string;
  ordersCount: number;
  totalSpent: number;
  joined: string;
  segment: 'VIP Platinum' | 'Frequent Buyer' | 'Regular' | 'New';
  status: 'Active' | 'Inactive';
  orders: {
    id: string;
    date: string;
    items: string;
    amount: number;
    status: string;
  }[];
}

const SEED_CUSTOMERS: Customer[] = [
  {
    id: 'CUST-001',
    name: 'Eleanor Vance',
    email: 'eleanor.v@example.com',
    phone: '+91 98451 23456',
    city: 'Bangalore, Karnataka',
    address: '402, Highline Residency, Indiranagar 100ft Road, Bangalore - 560038',
    ordersCount: 12,
    totalSpent: 184500,
    joined: 'Jan 2024',
    segment: 'VIP Platinum',
    status: 'Active',
    orders: [
      { id: 'ORD-9821', date: '28 Feb 2026', items: 'Lorenz 3+1+1 Seater Sofa Set + Floor Lamp', amount: 115297, status: 'Processing' },
      { id: 'ORD-9742', date: '14 Jan 2026', items: 'Minimalist Walnut Bed Frame', amount: 38500, status: 'Delivered' },
      { id: 'ORD-9610', date: '02 Dec 2025', items: 'Nordic Oak Coffee Table Set', amount: 30703, status: 'Delivered' },
    ],
  },
  {
    id: 'CUST-002',
    name: 'Marcus Thorne',
    email: 'm.thorne@example.com',
    phone: '+91 97312 98765',
    city: 'Mumbai, Maharashtra',
    address: 'Flat 12B, Ocean Crest Apartments, Bandra West, Mumbai - 400050',
    ordersCount: 8,
    totalSpent: 94250,
    joined: 'Feb 2024',
    segment: 'Frequent Buyer',
    status: 'Active',
    orders: [
      { id: 'ORD-9820', date: '27 Feb 2026', items: 'Marriott 3 Seater Wooden Sofa', amount: 24999, status: 'Delivered' },
      { id: 'ORD-9781', date: '19 Jan 2026', items: 'Cambridge Study Desk with Drawers', amount: 18499, status: 'Delivered' },
      { id: 'ORD-9530', date: '10 Nov 2025', items: 'Solano Velvet Sectional Sofa', amount: 50752, status: 'Delivered' },
    ],
  },
  {
    id: 'CUST-003',
    name: 'Sophia Lin',
    email: 'sophia.lin@example.com',
    phone: '+91 99801 45678',
    city: 'Bangalore, Karnataka',
    address: 'Villa 78, Prestige Golfshire, Nandi Hills, Bangalore - 562164',
    ordersCount: 5,
    totalSpent: 62480,
    joined: 'Mar 2024',
    segment: 'Frequent Buyer',
    status: 'Active',
    orders: [
      { id: 'ORD-9819', date: '26 Feb 2026', items: 'Sensa 4 Seater Dining Set + Shoe Rack', amount: 27987, status: 'Shipped' },
      { id: 'ORD-9690', date: '05 Jan 2026', items: 'Aurora Hydraulic Queen Bed', amount: 34493, status: 'Delivered' },
    ],
  },
  {
    id: 'CUST-004',
    name: 'David Krishnamurthy',
    email: 'david.k@example.com',
    phone: '+91 98860 11223',
    city: 'Hyderabad, Telangana',
    address: 'Tower 4, Apt 1102, Cyber Heights, Gachibowli, Hyderabad - 500032',
    ordersCount: 4,
    totalSpent: 48900,
    joined: 'May 2024',
    segment: 'Regular',
    status: 'Active',
    orders: [
      { id: 'ORD-9818', date: '24 Feb 2026', items: 'Aurora Hydraulic Lift-Up Queen Bed', amount: 33499, status: 'Pending' },
      { id: 'ORD-9640', date: '18 Dec 2025', items: 'Hampton 3 Tier Wooden Shoe Rack', amount: 15401, status: 'Delivered' },
    ],
  },
  {
    id: 'CUST-005',
    name: 'Amara Chen',
    email: 'amara.c@example.com',
    phone: '+91 94480 88776',
    city: 'Chennai, Tamil Nadu',
    address: '22, Boat Club Road, RA Puram, Chennai - 600028',
    ordersCount: 19,
    totalSpent: 248900,
    joined: 'Aug 2023',
    segment: 'VIP Platinum',
    status: 'Active',
    orders: [
      { id: 'ORD-9817', date: '22 Feb 2026', items: 'Providence Tall Pantry & Crockery Cabinet', amount: 32999, status: 'Cancelled' },
      { id: 'ORD-9750', date: '08 Feb 2026', items: 'Lorenz 3+1+1 Seater Sofa Set', amount: 99999, status: 'Delivered' },
      { id: 'ORD-9600', date: '25 Nov 2025', items: 'Calmore Solid Sheesham King Bed', amount: 115902, status: 'Delivered' },
    ],
  },
];

export default function CustomersPage() {
  const [customers, setCustomers] = useState<Customer[]>(SEED_CUSTOMERS);
  const [search, setSearch] = useState('');
  const [segmentFilter, setSegmentFilter] = useState<string>('all');
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);

  const filteredCustomers = useMemo(() => {
    return customers.filter((c) => {
      const matchSearch =
        c.name.toLowerCase().includes(search.toLowerCase()) ||
        c.email.toLowerCase().includes(search.toLowerCase()) ||
        c.phone.includes(search) ||
        c.city.toLowerCase().includes(search.toLowerCase()) ||
        c.id.toLowerCase().includes(search.toLowerCase());

      const matchSegment = segmentFilter === 'all' || c.segment === segmentFilter;

      return matchSearch && matchSegment;
    });
  }, [customers, search, segmentFilter]);

  // Metric stats
  const totalCustomers = customers.length;
  const totalSpendAll = customers.reduce((sum, c) => sum + c.totalSpent, 0);
  const totalOrdersAll = customers.reduce((sum, c) => sum + c.ordersCount, 0);
  const avgOrderValue = totalOrdersAll > 0 ? totalSpendAll / totalOrdersAll : 0;

  const getSegmentBadge = (segment: Customer['segment']) => {
    switch (segment) {
      case 'VIP Platinum':
        return 'bg-purple-500/10 text-purple-600 dark:text-purple-400 border-purple-500/20';
      case 'Frequent Buyer':
        return 'bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20';
      case 'Regular':
        return 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20';
      default:
        return 'bg-gray-500/10 text-gray-600 border-gray-500/20';
    }
  };

  const getOrderStatusBadge = (status: string) => {
    switch (status) {
      case 'Delivered':
        return 'bg-emerald-500/10 text-emerald-600 border-emerald-500/20';
      case 'Processing':
        return 'bg-blue-500/10 text-blue-600 border-blue-500/20';
      case 'Shipped':
        return 'bg-indigo-500/10 text-indigo-600 border-indigo-500/20';
      case 'Pending':
        return 'bg-amber-500/10 text-amber-600 border-amber-500/20';
      case 'Cancelled':
        return 'bg-red-500/10 text-red-600 border-red-500/20';
      default:
        return 'bg-gray-500/10 text-gray-600 border-gray-500/20';
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
                Customer Directory
              </h1>
              <span className="text-[11px] font-bold px-2 py-0.5 rounded-md bg-primary/10 text-primary border border-primary/20">
                Single Directory View
              </span>
            </div>
            <p className="text-xs sm:text-sm text-textMuted mt-0.5">
              Comprehensive customer profiles, lifetime purchase value, contact details, and order history.
            </p>
          </div>
        </div>

        {/* 4 Summary Metric Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5">
          <div className="p-5 rounded-2xl bg-surfaceColor border border-borderColor shadow-xs">
            <span className="text-xs font-bold text-textMuted uppercase tracking-wider block">
              Total Customers
            </span>
            <p className="text-2xl sm:text-3xl font-black text-textColor tracking-tight mt-2">
              18,920
            </p>
            <span className="text-xs text-emerald-500 font-bold mt-1 block">
              +12.5% new buyers this month
            </span>
          </div>

          <div className="p-5 rounded-2xl bg-surfaceColor border border-borderColor shadow-xs">
            <span className="text-xs font-bold text-textMuted uppercase tracking-wider block">
              VIP &amp; Repeat Buyers
            </span>
            <p className="text-2xl sm:text-3xl font-black text-purple-600 tracking-tight mt-2">
              34.8%
            </p>
            <span className="text-xs text-textMuted mt-1 block">
              Contribute 68% of total revenue
            </span>
          </div>


          <div className="p-5 rounded-2xl bg-surfaceColor border border-borderColor shadow-xs">
            <span className="text-xs font-bold text-textMuted uppercase tracking-wider block">
              Avg Order Value
            </span>
            <p className="text-2xl sm:text-3xl font-black text-textColor tracking-tight mt-2">
              ₹{Math.round(avgOrderValue).toLocaleString('en-IN')}
            </p>
            <span className="text-xs text-textMuted mt-1 block">
              Per checkout transaction
            </span>
          </div>
        </div>

        {/* Filter & Search Bar */}
        <div className="p-4 rounded-2xl bg-surfaceColor border border-borderColor flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center px-3.5 py-2 bg-bgColor rounded-xl border border-borderColor w-full sm:w-80">
            <Search size={16} className="text-textMuted mr-2" />
            <input
              type="text"
              placeholder="Search customer name, email, phone, city..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full bg-transparent text-xs text-textColor outline-hidden"
            />
            {search && (
              <button onClick={() => setSearch('')} className="ml-1 text-textMuted hover:text-textColor">
                <X size={14} />
              </button>
            )}
          </div>

          <div className="flex items-center p-1 bg-bgColor rounded-xl border border-borderColor">
            {(['all', 'VIP Platinum', 'Frequent Buyer', 'Regular'] as const).map((seg) => (
              <button
                key={seg}
                onClick={() => setSegmentFilter(seg)}
                className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-all ${segmentFilter === seg
                    ? 'bg-primary text-white shadow-xs'
                    : 'text-textMuted hover:text-textColor'
                  }`}
              >
                {seg === 'all' ? 'All Segments' : seg}
              </button>
            ))}
          </div>
        </div>

        {/* Customer Directory Table */}
        <div className="rounded-2xl bg-surfaceColor border border-borderColor shadow-xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b border-borderColor text-[11px] font-bold text-textMuted uppercase bg-bgColor/30">
                  <th className="px-5 py-3.5">Customer Name</th>
                  <th className="px-5 py-3.5">Contact Details</th>
                  <th className="px-5 py-3.5">Location</th>
                  <th className="px-5 py-3.5">Segment</th>
                  <th className="px-5 py-3.5">Orders</th>
                  <th className="px-5 py-3.5">Total Spent</th>
                  <th className="px-5 py-3.5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-borderColor/50">
                {filteredCustomers.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="px-5 py-16 text-center">
                      <Users size={36} className="mx-auto text-textMuted/30 mb-3" />
                      <p className="text-sm font-bold text-textMuted">No customers found</p>
                      <p className="text-xs text-textMuted/70 mt-0.5">
                        Try adjusting your search criteria.
                      </p>
                    </td>
                  </tr>
                ) : (
                  filteredCustomers.map((c) => (
                    <tr
                      key={c.id}
                      onClick={() => setSelectedCustomer(c)}
                      className="hover:bg-sidebarHover/60 transition-colors cursor-pointer group"
                    >
                      <td className="px-5 py-3.5">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-full bg-primary/15 text-primary font-black flex items-center justify-center text-xs">
                            {c.name.charAt(0)}
                          </div>
                          <div>
                            <p className="font-bold text-xs text-textColor leading-tight group-hover:text-primary transition-colors">
                              {c.name}
                            </p>
                            <span className="text-[10px] font-mono text-textMuted">{c.id}</span>
                          </div>
                        </div>
                      </td>
                      <td className="px-5 py-3.5 text-xs text-textMuted">
                        <p className="text-textColor font-medium">{c.email}</p>
                        <p className="text-[11px] text-textMuted">{c.phone}</p>
                      </td>
                      <td className="px-5 py-3.5 text-xs text-textMuted">
                        {c.city}
                      </td>
                      <td className="px-5 py-3.5">
                        <span
                          className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full border ${getSegmentBadge(
                            c.segment
                          )}`}
                        >
                          {c.segment}
                        </span>
                      </td>
                      <td className="px-5 py-3.5 text-xs font-semibold text-textColor">
                        {c.ordersCount} orders
                      </td>
                      <td className="px-5 py-3.5 font-bold text-xs text-textColor font-mono">
                        ₹{c.totalSpent.toLocaleString('en-IN')}
                      </td>
                      <td className="px-5 py-3.5 text-right">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelectedCustomer(c);
                          }}
                          className="px-3 py-1.5 rounded-lg bg-bgColor border border-borderColor hover:bg-primary hover:text-white text-textColor text-xs font-bold transition-all inline-flex items-center gap-1.5"
                        >
                          <span>View Detail</span>
                          <ArrowRight size={13} />
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* CUSTOMER DETAIL PROFILE MODAL */}
        {selectedCustomer && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div
              className="absolute inset-0 bg-black/60 backdrop-blur-xs"
              onClick={() => setSelectedCustomer(null)}
            />

            <div className="relative bg-surfaceColor rounded-2xl border border-borderColor shadow-2xl w-full max-w-2xl max-h-[90vh] flex flex-col animate-in fade-in zoom-in-95 duration-200">
              {/* Header */}
              <div className="flex items-center justify-between px-6 py-4 border-b border-borderColor bg-bgColor/50 shrink-0">
                <div className="flex items-center gap-3">
                  <div className="w-11 h-11 rounded-full bg-primary/20 text-primary font-black flex items-center justify-center text-sm shadow-xs">
                    {selectedCustomer.name.charAt(0)}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="text-base font-black text-textColor">
                        {selectedCustomer.name}
                      </h3>
                      <span
                        className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${getSegmentBadge(
                          selectedCustomer.segment
                        )}`}
                      >
                        {selectedCustomer.segment}
                      </span>
                    </div>
                    <span className="text-xs text-textMuted font-mono">
                      Customer ID: {selectedCustomer.id} &bull; Member Since {selectedCustomer.joined}
                    </span>
                  </div>
                </div>

                <button
                  onClick={() => setSelectedCustomer(null)}
                  className="p-1.5 rounded-lg text-textMuted hover:text-textColor hover:bg-bgColor"
                >
                  <X size={18} />
                </button>
              </div>

              {/* Content */}
              <div className="flex-1 overflow-y-auto p-6 custom-scrollbar space-y-6">
                {/* 3 Metric cards for this customer */}
                <div className="grid grid-cols-3 gap-3 text-center">
                  <div className="p-3 rounded-xl bg-bgColor border border-borderColor">
                    <span className="text-[10px] font-bold text-textMuted uppercase block">
                      Lifetime Spend
                    </span>
                    <span className="text-sm sm:text-base font-black text-emerald-600 font-mono">
                      ₹{selectedCustomer.totalSpent.toLocaleString('en-IN')}
                    </span>
                  </div>
                  <div className="p-3 rounded-xl bg-bgColor border border-borderColor">
                    <span className="text-[10px] font-bold text-textMuted uppercase block">
                      Total Orders
                    </span>
                    <span className="text-sm sm:text-base font-black text-textColor">
                      {selectedCustomer.ordersCount} orders
                    </span>
                  </div>
                  <div className="p-3 rounded-xl bg-bgColor border border-borderColor">
                    <span className="text-[10px] font-bold text-textMuted uppercase block">
                      Avg Order Value
                    </span>
                    <span className="text-sm sm:text-base font-black text-textColor font-mono">
                      ₹
                      {Math.round(
                        selectedCustomer.totalSpent / selectedCustomer.ordersCount
                      ).toLocaleString('en-IN')}
                    </span>
                  </div>
                </div>

                {/* Contact & Shipping Details */}
                <div className="p-4 rounded-xl bg-bgColor/50 border border-borderColor space-y-2.5 text-xs">
                  <span className="font-bold uppercase tracking-wider text-textMuted block">
                    Contact &amp; Shipping Profile
                  </span>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div className="flex items-center gap-2">
                      <Mail size={14} className="text-primary shrink-0" />
                      <span className="text-textColor">{selectedCustomer.email}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Phone size={14} className="text-primary shrink-0" />
                      <span className="text-textColor">{selectedCustomer.phone}</span>
                    </div>
                    <div className="sm:col-span-2 flex items-start gap-2 pt-1">
                      <MapPin size={14} className="text-primary shrink-0 mt-0.5" />
                      <span className="text-textColor leading-relaxed">
                        {selectedCustomer.address}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Order History Timeline */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold uppercase tracking-wider text-textMuted">
                      Order History &amp; Items Purchased
                    </span>
                    <Link
                      href="/orders"
                      className="text-xs font-bold text-primary hover:underline flex items-center gap-1"
                    >
                      <span>Manage all orders</span>
                      <ExternalLink size={12} />
                    </Link>
                  </div>

                  <div className="space-y-2.5">
                    {selectedCustomer.orders.map((ord) => (
                      <div
                        key={ord.id}
                        className="p-3.5 rounded-xl bg-bgColor border border-borderColor flex items-center justify-between group hover:border-primary/30 transition-all"
                      >
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <span className="font-mono font-bold text-xs text-primary">
                              {ord.id}
                            </span>
                            <span className="text-textMuted text-[11px]">&bull; {ord.date}</span>
                          </div>
                          <p className="text-xs text-textColor font-medium">{ord.items}</p>
                        </div>

                        <div className="text-right shrink-0">
                          <span className="text-xs font-bold text-textColor font-mono block">
                            ₹{ord.amount.toLocaleString('en-IN')}
                          </span>
                          <span
                            className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${getOrderStatusBadge(
                              ord.status
                            )}`}
                          >
                            {ord.status}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </AdminLayout>
  );
}
