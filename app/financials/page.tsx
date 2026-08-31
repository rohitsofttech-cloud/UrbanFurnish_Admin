'use client';

import React from 'react';
import AdminLayout from '../common/AdminLayout';
import { Download } from 'lucide-react';

export default function FinancialsPage() {
  const transactions = [
    { id: 'TXN-77301', date: 'Today, 2:30 PM', method: 'Stripe', amount: 1240.0, fee: 36.2, net: 1203.8, status: 'Settled' },
    { id: 'TXN-77300', date: 'Today, 1:15 PM', method: 'PayPal', amount: 489.5, fee: 14.6, net: 474.9, status: 'Settled' },
    { id: 'TXN-77299', date: 'Today, 11:45 AM', method: 'Apple Pay', amount: 890.0, fee: 26.7, net: 863.3, status: 'Settled' },
  ];

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-black text-textColor tracking-tight">Financials & Payments</h1>
            <p className="text-xs sm:text-sm text-textMuted">
              Gateway settlements, transaction fees, GST tax filings, and ledger accounts.
            </p>
          </div>
          <button className="px-4 py-2.5 rounded-xl bg-primary text-white hover:bg-primary-hover font-bold text-xs flex items-center gap-2 shadow-xs shadow-primary/30 w-fit">
            <Download size={15} />
            <span>Download Tax Invoices</span>
          </button>
        </div>

        <div className="rounded-2xl bg-surfaceColor border border-borderColor shadow-xs overflow-hidden">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b border-borderColor text-[11px] font-bold text-textMuted uppercase bg-bgColor/30">
                <th className="px-5 py-3">Transaction ID</th>
                <th className="px-5 py-3">Timestamp</th>
                <th className="px-5 py-3">Gateway</th>
                <th className="px-5 py-3">Gross</th>
                <th className="px-5 py-3">Fee</th>
                <th className="px-5 py-3">Net Amount</th>
                <th className="px-5 py-3">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-borderColor/50">
              {transactions.map((tx) => (
                <tr key={tx.id} className="hover:bg-sidebarHover/50 transition-colors">
                  <td className="px-5 py-3.5 font-mono font-bold text-xs text-textColor">{tx.id}</td>
                  <td className="px-5 py-3.5 text-xs text-textMuted">{tx.date}</td>
                  <td className="px-5 py-3.5 text-xs text-textColor font-medium">{tx.method}</td>
                  <td className="px-5 py-3.5 text-xs font-bold text-textColor">₹{tx.amount.toFixed(2)}</td>
                  <td className="px-5 py-3.5 text-xs text-red-500 font-medium">-₹{tx.fee.toFixed(2)}</td>
                  <td className="px-5 py-3.5 text-xs font-bold text-emerald-600 dark:text-emerald-400">
                    ₹{tx.net.toFixed(2)}
                  </td>
                  <td className="px-5 py-3.5">
                    <span className="text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-600">
                      {tx.status}
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
