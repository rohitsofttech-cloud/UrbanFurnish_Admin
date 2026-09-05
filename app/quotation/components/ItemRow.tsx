'use client';

import React from 'react';
import { Trash2 } from 'lucide-react';
import { QuotationItem, QTY_UNITS, GST_RATES, computeItemTotals } from '@/lib/quotationStore';

interface Props {
  item: QuotationItem;
  index: number;
  onChange: (updated: QuotationItem) => void;
  onRemove: () => void;
  canRemove: boolean;
}

export default function ItemRow({ item, index, onChange, onRemove, canRemove }: Props) {
  const update = (partial: Partial<QuotationItem>) => {
    const merged = { ...item, ...partial };
    const { taxAmount, amount } = computeItemTotals(merged);
    onChange({ ...merged, taxAmount, amount });
  };

  return (
    <tr className="border-b border-borderColor hover:bg-bgColor/60 transition-colors group">
      {/* No */}
      <td className="px-3 py-2 text-center text-xs font-bold text-textMuted w-10">{index + 1}</td>

      {/* Item name */}
      <td className="px-2 py-2 min-w-[200px]">
        <div className="flex items-center gap-2">
          <label className="relative group/img cursor-pointer" title="Click to upload/change image">
            {item.imageUrl ? (
              <img
                src={item.imageUrl}
                alt={item.name}
                className="w-10 h-10 rounded-lg object-cover border border-borderColor flex-shrink-0 group-hover/img:opacity-80 transition-opacity"
              />
            ) : (
              <div className="w-10 h-10 rounded-lg bg-bgColor border border-borderColor flex-shrink-0 flex items-center justify-center text-lg group-hover/img:border-primary transition-colors">
                🪑
              </div>
            )}
            <input
              type="file"
              accept="image/*"
              className="hidden"
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (!file) return;
                const reader = new FileReader();
                reader.onload = () => update({ imageUrl: reader.result as string });
                reader.readAsDataURL(file);
              }}
            />
          </label>
          <div className="flex-1 min-w-0">
            <input
              type="text"
              value={item.name}
              onChange={(e) => update({ name: e.target.value })}
              placeholder="Item name"
              className="w-full text-xs font-bold text-textColor bg-transparent focus:outline-none focus:bg-bgColor focus:px-2 focus:py-1 focus:rounded-lg focus:border focus:border-primary/40 transition-all placeholder:text-textMuted/50"
            />
            <input
              type="text"
              value={item.hsnCode}
              onChange={(e) => update({ hsnCode: e.target.value })}
              placeholder="HSN code"
              className="w-full text-[10px] font-semibold text-textMuted bg-transparent focus:outline-none focus:bg-bgColor focus:px-2 focus:rounded-md focus:border focus:border-borderColor transition-all placeholder:text-textMuted/40 mt-0.5"
            />
          </div>
        </div>
      </td>

      {/* QTY */}
      <td className="px-2 py-2 w-36">
        <div className="flex items-center gap-1">
          <input
            type="number"
            min={0.01}
            step={0.01}
            value={item.qty}
            onChange={(e) => update({ qty: parseFloat(e.target.value) || 1 })}
            className="w-14 px-2 py-1.5 rounded-lg border border-borderColor bg-bgColor text-textColor text-xs font-bold text-center focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all"
          />
          <select
            value={item.qtyUnit}
            onChange={(e) => update({ qtyUnit: e.target.value as QuotationItem['qtyUnit'] })}
            className="flex-1 px-1.5 py-1.5 rounded-lg border border-borderColor bg-bgColor text-textColor text-[10px] font-bold focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all cursor-pointer"
          >
            {QTY_UNITS.map((u) => (
              <option key={u} value={u}>{u}</option>
            ))}
          </select>
        </div>
      </td>

      {/* Rate */}
      <td className="px-2 py-2 w-28">
        <div className="flex items-center gap-1">
          <span className="text-xs text-textMuted font-bold">₹</span>
          <input
            type="number"
            min={0}
            value={item.rate}
            onChange={(e) => update({ rate: parseFloat(e.target.value) || 0 })}
            className="w-full px-2 py-1.5 rounded-lg border border-borderColor bg-bgColor text-textColor text-xs font-bold text-right focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all"
            placeholder="0"
          />
        </div>
      </td>

      {/* GST % */}
      <td className="px-2 py-2 w-24">
        <select
          value={item.gstPercent}
          onChange={(e) => update({ gstPercent: parseInt(e.target.value) })}
          className="w-full px-2 py-1.5 rounded-lg border border-borderColor bg-bgColor text-textColor text-xs font-bold focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all cursor-pointer"
        >
          {GST_RATES.map((r) => (
            <option key={r} value={r}>{r}%</option>
          ))}
          {/* Allow custom rates not in preset list */}
          {!GST_RATES.includes(item.gstPercent as typeof GST_RATES[number]) && (
            <option value={item.gstPercent}>{item.gstPercent}%</option>
          )}
        </select>
      </td>

      {/* Tax amount */}
      <td className="px-2 py-2 w-24 text-right">
        <span className="text-xs font-bold text-textColor">
          ₹{item.taxAmount.toLocaleString('en-IN', { maximumFractionDigits: 2 })}
        </span>
      </td>

      {/* Amount */}
      <td className="px-2 py-2 w-28 text-right">
        <span className="text-sm font-black text-textColor">
          ₹{item.amount.toLocaleString('en-IN', { maximumFractionDigits: 2 })}
        </span>
      </td>

      {/* Remove */}
      <td className="px-2 py-2 w-10">
        {canRemove && (
          <button
            type="button"
            onClick={onRemove}
            className="opacity-0 group-hover:opacity-100 p-1.5 rounded-lg text-red-500 hover:bg-red-50 transition-all"
          >
            <Trash2 size={13} />
          </button>
        )}
      </td>
    </tr>
  );
}
