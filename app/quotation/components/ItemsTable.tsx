'use client';

import React from 'react';
import { Plus, Sparkles, ShoppingBag } from 'lucide-react';
import { QuotationItem } from '@/lib/quotationStore';
import ItemRow from './ItemRow';

interface Props {
  items: QuotationItem[];
  onItemChange: (index: number, updated: QuotationItem) => void;
  onItemRemove: (index: number) => void;
  onOpenProductModal: () => void;
  onOpenCustomModal: () => void;
}

export default function ItemsTable({
  items,
  onItemChange,
  onItemRemove,
  onOpenProductModal,
  onOpenCustomModal,
}: Props) {
  const totalQuantity = items.reduce((sum, i) => sum + (Number(i.qty) || 0), 0);
  const totalTax = items.reduce((sum, i) => sum + (Number(i.taxAmount) || 0), 0);
  const totalSubtotal = items.reduce((sum, i) => sum + (Number(i.rate) * Number(i.qty) || 0), 0);

  return (
    <div className="rounded-2xl bg-surfaceColor border border-borderColor overflow-hidden shadow-xs">
      {/* Top Action Bar */}
      <div className="p-4 border-b border-borderColor flex flex-wrap items-center justify-between gap-3 bg-surfaceColor">
        <div>
          <h3 className="text-sm font-black text-textColor">Quotation Items</h3>
          <p className="text-xs text-textMuted font-medium">Add products from inventory or create custom quotes</p>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={onOpenProductModal}
            className="px-3.5 py-2 rounded-xl bg-primary/10 text-primary border border-primary/20 text-xs font-bold hover:bg-primary hover:text-white transition-all flex items-center gap-1.5 shadow-xs"
          >
            <ShoppingBag size={14} />
            <span>+ Add from Products</span>
          </button>
          <button
            type="button"
            onClick={onOpenCustomModal}
            className="px-3.5 py-2 rounded-xl bg-secondary text-white text-xs font-bold hover:bg-secondary-light transition-all flex items-center gap-1.5 shadow-xs"
          >
            <Sparkles size={14} />
            <span>+ Add Custom Item</span>
          </button>
        </div>
      </div>

      {/* Table Content */}
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-bgColor/75 border-b border-borderColor text-[11px] font-black text-textMuted uppercase tracking-wider">
              <th className="px-3 py-3 text-center w-10">No</th>
              <th className="px-2 py-3 min-w-[200px]">Items / Description</th>
              <th className="px-2 py-3 w-36">Qty & Unit</th>
              <th className="px-2 py-3 w-28 text-right">Price / Rate (₹)</th>
              <th className="px-2 py-3 w-24">GST (%)</th>
              <th className="px-2 py-3 w-24 text-right">Tax (₹)</th>
              <th className="px-2 py-3 w-28 text-right">Amount (₹)</th>
              <th className="px-2 py-3 w-10"></th>
            </tr>
          </thead>
          <tbody>
            {items.length === 0 ? (
              <tr>
                <td colSpan={8} className="py-12 text-center text-textMuted">
                  <div className="flex flex-col items-center justify-center gap-2">
                    <p className="text-sm font-bold">No items added to quotation yet</p>
                    <p className="text-xs">Click above to add items from catalog or create a custom item</p>
                  </div>
                </td>
              </tr>
            ) : (
              items.map((item, idx) => (
                <ItemRow
                  key={item.id || idx}
                  index={idx}
                  item={item}
                  onChange={(updated) => onItemChange(idx, updated)}
                  onRemove={() => onItemRemove(idx)}
                  canRemove={items.length > 1}
                />
              ))
            )}
          </tbody>
          {items.length > 0 && (
            <tfoot>
              <tr className="bg-bgColor/50 border-t-2 border-borderColor font-bold text-xs text-textColor">
                <td colSpan={2} className="px-4 py-3 font-black uppercase text-textMuted">
                  Subtotal ({items.length} {items.length === 1 ? 'item' : 'items'})
                </td>
                <td className="px-2 py-3 font-black text-textColor">
                  {totalQuantity} Units
                </td>
                <td></td>
                <td></td>
                <td className="px-2 py-3 text-right font-black text-textColor">
                  ₹{totalTax.toLocaleString('en-IN', { maximumFractionDigits: 2 })}
                </td>
                <td className="px-2 py-3 text-right font-black text-textColor">
                  ₹{totalSubtotal.toLocaleString('en-IN', { maximumFractionDigits: 2 })}
                </td>
                <td></td>
              </tr>
            </tfoot>
          )}
        </table>
      </div>
    </div>
  );
}
