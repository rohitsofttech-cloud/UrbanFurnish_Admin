'use client';

import React from 'react';
import { numberToWords } from '@/lib/quotationStore';

interface Props {
  taxableAmount: number;
  cgst: number;
  sgst: number;
  totalTaxAmount: number;
  packagingCharges: number;
  extraChargesTotal: number;
  grandTotal: number;
}

export default function TotalsPanel({
  taxableAmount,
  cgst,
  sgst,
  totalTaxAmount,
  packagingCharges,
  extraChargesTotal,
  grandTotal,
}: Props) {
  // Approximate average GST rate for display
  const effectiveGstRate =
    taxableAmount > 0 ? Math.round((totalTaxAmount / taxableAmount) * 100) : 18;
  const halfRate = effectiveGstRate / 2;

  return (
    <div className="p-5 rounded-2xl bg-surfaceColor border border-borderColor space-y-4">
      <h3 className="text-xs font-black text-textMuted uppercase tracking-wider">
        Summary &amp; Calculation
      </h3>

      <div className="space-y-2.5 text-xs text-textColor font-medium">
        {packagingCharges > 0 && (
          <div className="flex justify-between items-center text-textMuted">
            <span>Packaging Charges</span>
            <span className="font-bold text-textColor">
              ₹{packagingCharges.toLocaleString('en-IN', { maximumFractionDigits: 2 })}
            </span>
          </div>
        )}

        {extraChargesTotal > 0 && (
          <div className="flex justify-between items-center text-textMuted">
            <span>Additional Charges</span>
            <span className="font-bold text-textColor">
              ₹{extraChargesTotal.toLocaleString('en-IN', { maximumFractionDigits: 2 })}
            </span>
          </div>
        )}

        <div className="flex justify-between items-center text-textMuted">
          <span>Taxable Amount</span>
          <span className="font-bold text-textColor">
            ₹{taxableAmount.toLocaleString('en-IN', { maximumFractionDigits: 2 })}
          </span>
        </div>

        <div className="flex justify-between items-center text-textMuted">
          <span>CGST @{halfRate}%</span>
          <span className="font-bold text-textColor">
            ₹{cgst.toLocaleString('en-IN', { maximumFractionDigits: 2 })}
          </span>
        </div>

        <div className="flex justify-between items-center text-textMuted">
          <span>SGST @{halfRate}%</span>
          <span className="font-bold text-textColor">
            ₹{sgst.toLocaleString('en-IN', { maximumFractionDigits: 2 })}
          </span>
        </div>

        <div className="pt-3 border-t-2 border-borderColor flex justify-between items-center">
          <span className="text-sm font-black text-textColor">Total Amount</span>
          <span className="text-lg font-black text-primary">
            ₹{grandTotal.toLocaleString('en-IN', { maximumFractionDigits: 2 })}
          </span>
        </div>

        <div className="pt-2 border-t border-dashed border-borderColor text-[11px] text-textMuted leading-relaxed">
          <span className="font-bold block text-textColor">Total Amount (in words):</span>
          <span className="italic">{numberToWords(grandTotal)}</span>
        </div>
      </div>
    </div>
  );
}
