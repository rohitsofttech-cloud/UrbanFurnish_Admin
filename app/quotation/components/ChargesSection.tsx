'use client';

import React from 'react';
import { Plus, Trash2, Box } from 'lucide-react';
import { ExtraCharge } from '@/lib/quotationStore';

interface Props {
  packagingCharges: number;
  onPackagingChargesChange: (val: number) => void;
  extraCharges: ExtraCharge[];
  onExtraChargesChange: (charges: ExtraCharge[]) => void;
}

export default function ChargesSection({
  packagingCharges,
  onPackagingChargesChange,
  extraCharges,
  onExtraChargesChange,
}: Props) {
  const addExtraCharge = () => {
    onExtraChargesChange([
      ...extraCharges,
      {
        id: `charge-${Date.now()}`,
        label: 'Transport / Freight Charge',
        amount: 0,
      },
    ]);
  };

  const updateExtraCharge = (index: number, partial: Partial<ExtraCharge>) => {
    const updated = [...extraCharges];
    updated[index] = { ...updated[index], ...partial };
    onExtraChargesChange(updated);
  };

  const removeExtraCharge = (index: number) => {
    onExtraChargesChange(extraCharges.filter((_, i) => i !== index));
  };

  return (
    <div className="p-5 rounded-2xl bg-surfaceColor border border-borderColor space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-xs font-black text-textMuted uppercase tracking-wider flex items-center gap-2">
          <Box size={14} className="text-primary" /> Packaging &amp; Additional Charges
        </h3>
        <button
          type="button"
          onClick={addExtraCharge}
          className="text-xs font-bold text-primary hover:text-primary-hover flex items-center gap-1 transition-colors"
        >
          <Plus size={14} /> Add Charge
        </button>
      </div>

      <div className="space-y-3">
        {/* Packaging Charges */}
        <div className="flex items-center gap-3">
          <div className="flex-1">
            <span className="text-xs font-bold text-textColor block">Packaging &amp; Handling Charges</span>
            <span className="text-[11px] text-textMuted">Standard wooden crate or protective bubble wrap</span>
          </div>
          <div className="w-36 flex items-center gap-1">
            <span className="text-xs font-bold text-textMuted">₹</span>
            <input
              type="number"
              min={0}
              value={packagingCharges || ''}
              onChange={(e) => onPackagingChargesChange(parseFloat(e.target.value) || 0)}
              placeholder="0"
              className="w-full px-3 py-1.5 rounded-xl border border-borderColor bg-bgColor text-textColor text-xs font-bold text-right focus:outline-none focus:ring-2 focus:ring-primary/30"
            />
          </div>
        </div>

        {/* Dynamic Extra Charges */}
        {extraCharges.map((charge, idx) => (
          <div key={charge.id} className="flex items-center gap-3 pt-2 border-t border-borderColor">
            <div className="flex-1">
              <input
                type="text"
                value={charge.label}
                onChange={(e) => updateExtraCharge(idx, { label: e.target.value })}
                placeholder="Charge description (e.g. Installation, Insurance)"
                className="w-full px-2.5 py-1.5 rounded-lg border border-borderColor bg-bgColor text-textColor text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-primary/30"
              />
            </div>
            <div className="w-36 flex items-center gap-1">
              <span className="text-xs font-bold text-textMuted">₹</span>
              <input
                type="number"
                min={0}
                value={charge.amount || ''}
                onChange={(e) => updateExtraCharge(idx, { amount: parseFloat(e.target.value) || 0 })}
                placeholder="0"
                className="w-full px-3 py-1.5 rounded-xl border border-borderColor bg-bgColor text-textColor text-xs font-bold text-right focus:outline-none focus:ring-2 focus:ring-primary/30"
              />
            </div>
            <button
              type="button"
              onClick={() => removeExtraCharge(idx)}
              className="p-1.5 text-red-500 hover:bg-red-50 rounded-lg transition-colors"
            >
              <Trash2 size={13} />
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
