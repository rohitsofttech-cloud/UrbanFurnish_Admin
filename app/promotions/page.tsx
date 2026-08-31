'use client';

import React from 'react';
import AdminLayout from '../common/AdminLayout';
import { Plus } from 'lucide-react';

export default function PromotionsPage() {
  const coupons = [
    { code: 'URBN20', discount: '20% OFF', type: 'Cart Discount', usage: '342 uses', status: 'Active', exp: 'Sep 30, 2026' },
    { code: 'FREESHIP', discount: 'Free Delivery', type: 'Shipping', usage: '1,290 uses', status: 'Active', exp: 'Dec 31, 2026' },
    { code: 'FURNISH100', discount: '₹100 OFF on orders > ₹800', type: 'Fixed Amount', usage: '84 uses', status: 'Active', exp: 'Oct 15, 2026' },
  ];

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-black text-textColor tracking-tight">Marketing & Coupons</h1>
            <p className="text-xs sm:text-sm text-textMuted">
              Create promo codes, run flash sales, and manage storefront campaign banners.
            </p>
          </div>
          <button className="px-4 py-2.5 rounded-xl bg-primary text-white hover:bg-primary-hover font-bold text-xs flex items-center gap-2 shadow-xs shadow-primary/30 w-fit">
            <Plus size={16} />
            <span>Create Promo Code</span>
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {coupons.map((c, idx) => (
            <div key={idx} className="p-5 rounded-2xl bg-surfaceColor border border-borderColor space-y-3">
              <div className="flex items-center justify-between">
                <span className="font-mono font-extrabold text-sm px-2.5 py-1 rounded-lg bg-primary/10 text-primary border border-primary/20">
                  {c.code}
                </span>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-emerald-500/10 text-emerald-600">
                  {c.status}
                </span>
              </div>
              <div>
                <h3 className="font-bold text-base text-textColor">{c.discount}</h3>
                <p className="text-xs text-textMuted">{c.type} &bull; {c.usage}</p>
              </div>
              <div className="pt-2 border-t border-borderColor/60 text-[11px] text-textMuted flex justify-between">
                <span>Expires: {c.exp}</span>
                <span className="text-primary font-semibold hover:underline cursor-pointer">Edit</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </AdminLayout>
  );
}
