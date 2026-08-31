'use client';

import React from 'react';
import AdminLayout from '../common/AdminLayout';
import { Plus } from 'lucide-react';

export default function VendorsPage() {
  const vendors = [
    { name: 'Nordic Craft Studio', contact: 'sales@nordiccraft.com', products: 18, commission: '12%', status: 'Approved' },
    { name: 'Artisan Woodworks Co.', contact: 'support@artisanwood.com', products: 24, commission: '15%', status: 'Approved' },
    { name: 'Luxe Lighting Lab', contact: 'orders@luxelighting.io', products: 9, commission: '10%', status: 'Pending Review' },
  ];

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-black text-textColor tracking-tight">Vendors & Sellers</h1>
            <p className="text-xs sm:text-sm text-textMuted">
              Manage marketplace sellers, commission agreements, and merchant payout schedules.
            </p>
          </div>
          <button className="px-4 py-2.5 rounded-xl bg-primary text-white hover:bg-primary-hover font-bold text-xs flex items-center gap-2 shadow-xs shadow-primary/30 w-fit">
            <Plus size={16} />
            <span>Onboard Merchant</span>
          </button>
        </div>

        <div className="rounded-2xl bg-surfaceColor border border-borderColor shadow-xs overflow-hidden">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b border-borderColor text-[11px] font-bold text-textMuted uppercase bg-bgColor/30">
                <th className="px-5 py-3">Vendor / Merchant</th>
                <th className="px-5 py-3">Contact</th>
                <th className="px-5 py-3">Catalog Size</th>
                <th className="px-5 py-3">Commission</th>
                <th className="px-5 py-3">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-borderColor/50">
              {vendors.map((v, idx) => (
                <tr key={idx} className="hover:bg-sidebarHover/50 transition-colors">
                  <td className="px-5 py-3.5 font-bold text-xs text-textColor">{v.name}</td>
                  <td className="px-5 py-3.5 text-xs text-textMuted">{v.contact}</td>
                  <td className="px-5 py-3.5 text-xs font-semibold text-textColor">{v.products} products</td>
                  <td className="px-5 py-3.5 text-xs font-bold text-textColor">{v.commission}</td>
                  <td className="px-5 py-3.5">
                    <span className="text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-primary/10 text-primary border border-primary/20">
                      {v.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </AdminLayout>
  );
}
