'use client';

import React from 'react';
import { Calendar, User, MapPin, Truck } from 'lucide-react';
import { QuotationClient } from '@/lib/quotationStore';

interface Props {
  quotationNo: string;
  quotationDate: string;
  expiryDate: string;
  driverNumber: string;
  billTo: QuotationClient;
  shipTo: QuotationClient;
  onQuotationNoChange: (v: string) => void;
  onQuotationDateChange: (v: string) => void;
  onExpiryDateChange: (v: string) => void;
  onDriverNumberChange: (v: string) => void;
  onBillToChange: (v: QuotationClient) => void;
  onShipToChange: (v: QuotationClient) => void;
}

export default function ClientDetailsSection({
  quotationNo, quotationDate, expiryDate, driverNumber,
  billTo, shipTo,
  onQuotationNoChange, onQuotationDateChange, onExpiryDateChange,
  onDriverNumberChange, onBillToChange, onShipToChange,
}: Props) {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
      {/* ── Quotation Meta ── */}
      <div className="p-5 rounded-2xl bg-surfaceColor border border-borderColor space-y-4">
        <h3 className="text-xs font-black text-textMuted uppercase tracking-wider flex items-center gap-2">
          <Calendar size={14} className="text-primary" /> Quotation Details
        </h3>

        <div className="grid grid-cols-3 gap-3">
          <div>
            <label className="block text-[11px] font-bold text-textMuted mb-1">Quotation No.</label>
            <input
              type="text"
              value={quotationNo}
              onChange={(e) => onQuotationNoChange(e.target.value)}
              className="w-full px-3 py-2 rounded-xl border border-borderColor bg-bgColor text-textColor text-sm font-bold focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all"
              placeholder="73"
            />
          </div>
          <div>
            <label className="block text-[11px] font-bold text-textMuted mb-1">Quotation Date</label>
            <input
              type="date"
              value={quotationDate}
              onChange={(e) => onQuotationDateChange(e.target.value)}
              className="w-full px-3 py-2 rounded-xl border border-borderColor bg-bgColor text-textColor text-sm font-bold focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all"
            />
          </div>
          <div>
            <label className="block text-[11px] font-bold text-textMuted mb-1">Expiry Date</label>
            <input
              type="date"
              value={expiryDate}
              onChange={(e) => onExpiryDateChange(e.target.value)}
              className="w-full px-3 py-2 rounded-xl border border-borderColor bg-bgColor text-textColor text-sm font-bold focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all"
            />
          </div>
        </div>

        <div>
          <label className="block text-[11px] font-bold text-textMuted mb-1">
            <Truck size={11} className="inline mr-1" /> Driver Number
          </label>
          <input
            type="text"
            value={driverNumber}
            onChange={(e) => onDriverNumberChange(e.target.value)}
            className="w-full px-3 py-2 rounded-xl border border-borderColor bg-bgColor text-textColor text-sm font-bold focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all"
            placeholder="+91 96436 30336"
          />
        </div>
      </div>

      {/* ── Bill To / Ship To ── */}
      <div className="p-5 rounded-2xl bg-surfaceColor border border-borderColor space-y-4">
        <h3 className="text-xs font-black text-textMuted uppercase tracking-wider flex items-center gap-2">
          <User size={14} className="text-primary" /> Client Details
        </h3>

        <div className="grid grid-cols-1 gap-3">
          {/* Bill To */}
          <div>
            <label className="block text-[11px] font-bold text-textMuted mb-1">
              <MapPin size={11} className="inline mr-1" /> Bill To — Name
            </label>
            <input
              type="text"
              value={billTo.name}
              onChange={(e) => onBillToChange({ ...billTo, name: e.target.value })}
              className="w-full px-3 py-2 rounded-xl border border-borderColor bg-bgColor text-textColor text-sm font-bold focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all"
              placeholder="Customer name"
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-[11px] font-bold text-textMuted mb-1">Bill To — Address</label>
              <textarea
                rows={2}
                value={billTo.address}
                onChange={(e) => onBillToChange({ ...billTo, address: e.target.value })}
                className="w-full px-3 py-2 rounded-xl border border-borderColor bg-bgColor text-textColor text-sm font-bold focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all resize-none"
                placeholder="Full billing address"
              />
            </div>
            <div>
              <label className="block text-[11px] font-bold text-textMuted mb-1">Place of Supply</label>
              <input
                type="text"
                value={billTo.placeOfSupply}
                onChange={(e) => onBillToChange({ ...billTo, placeOfSupply: e.target.value })}
                className="w-full px-3 py-2 rounded-xl border border-borderColor bg-bgColor text-textColor text-sm font-bold focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all"
                placeholder="e.g. Maharashtra"
              />
            </div>
          </div>
          {/* Ship To (auto-fills from Bill To) */}
          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="text-[11px] font-bold text-textMuted">
                <MapPin size={11} className="inline mr-1" /> Ship To — Name
              </label>
              <button
                type="button"
                onClick={() => onShipToChange({ ...billTo })}
                className="text-[10px] font-bold text-primary hover:underline"
              >
                Same as Bill To
              </button>
            </div>
            <input
              type="text"
              value={shipTo.name}
              onChange={(e) => onShipToChange({ ...shipTo, name: e.target.value })}
              className="w-full px-3 py-2 rounded-xl border border-borderColor bg-bgColor text-textColor text-sm font-bold focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all"
              placeholder="Shipping recipient name"
            />
          </div>
        </div>
      </div>
    </div>
  );
}
