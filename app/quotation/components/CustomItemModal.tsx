'use client';

import React, { useState } from 'react';
import { X, Upload, Package } from 'lucide-react';
import { QuotationItem, QTY_UNITS, GST_RATES, computeItemTotals, QtyUnit } from '@/lib/quotationStore';

interface Props {
  onAdd: (item: QuotationItem) => void;
  onClose: () => void;
}

export default function CustomItemModal({ onAdd, onClose }: Props) {
  const [name, setName] = useState('');
  const [hsnCode, setHsnCode] = useState('94036000');
  const [salesPrice, setSalesPrice] = useState<number>(0);
  const [gstRate, setGstRate] = useState<number>(18);
  const [unit, setUnit] = useState<QtyUnit>('PCS');
  const [quantity, setQuantity] = useState<number>(1);
  const [imageUrl, setImageUrl] = useState('');
  const [error, setError] = useState('');

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = () => {
      setImageUrl(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setError('Please enter the item name');
      return;
    }
    if (salesPrice <= 0) {
      setError('Please enter a valid sales price');
      return;
    }

    const base: Omit<QuotationItem, 'taxAmount' | 'amount'> = {
      id: `custom-item-${Date.now()}`,
      name: name.trim().toUpperCase(),
      hsnCode: hsnCode.trim() || '94036000',
      imageUrl: imageUrl || '',
      qty: quantity > 0 ? quantity : 1,
      qtyUnit: unit,
      rate: salesPrice,
      gstPercent: gstRate,
      isCustom: true,
    };

    const { taxAmount, amount } = computeItemTotals(base);
    onAdd({ ...base, taxAmount, amount });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />
      <div className="relative w-full max-w-xl rounded-2xl bg-surfaceColor border border-borderColor shadow-2xl overflow-hidden animate-fadeIn">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-borderColor">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-xl bg-primary/10 text-primary">
              <Package size={18} />
            </div>
            <div>
              <h2 className="text-base font-black text-textColor">Create Custom Item</h2>
              <p className="text-xs text-textMuted font-medium">Add ad-hoc products or special order items</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 rounded-xl hover:bg-bgColor text-textMuted transition-colors">
            <X size={18} />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSave} className="p-6 space-y-4">
          {error && (
            <div className="p-3 text-xs font-bold text-red-600 bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-800 rounded-xl">
              {error}
            </div>
          )}

          {/* Item Name */}
          <div>
            <label className="block text-xs font-bold text-textColor mb-1">
              Item Name <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => {
                setName(e.target.value);
                if (error) setError('');
              }}
              placeholder="e.g. Custom Teak Dining Table (6 Seater)"
              className="w-full px-3.5 py-2.5 rounded-xl border border-borderColor bg-bgColor text-textColor text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all font-semibold"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            {/* Sales Price */}
            <div>
              <label className="block text-xs font-bold text-textColor mb-1">
                Sales Price (₹ Rate ex-tax) <span className="text-red-500">*</span>
              </label>
              <input
                type="number"
                min={0}
                step={0.01}
                required
                value={salesPrice || ''}
                onChange={(e) => setSalesPrice(parseFloat(e.target.value) || 0)}
                placeholder="₹ 5000"
                className="w-full px-3.5 py-2.5 rounded-xl border border-borderColor bg-bgColor text-textColor text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all font-semibold"
              />
            </div>

            {/* HSN Code */}
            <div>
              <label className="block text-xs font-bold text-textColor mb-1">HSN / SAC Code</label>
              <input
                type="text"
                value={hsnCode}
                onChange={(e) => setHsnCode(e.target.value)}
                placeholder="94036000"
                className="w-full px-3.5 py-2.5 rounded-xl border border-borderColor bg-bgColor text-textColor text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all font-semibold"
              />
            </div>
          </div>

          <div className="grid grid-cols-3 gap-3">
            {/* Quantity */}
            <div>
              <label className="block text-xs font-bold text-textColor mb-1">Default Qty</label>
              <input
                type="number"
                min={0.01}
                step={0.01}
                value={quantity}
                onChange={(e) => setQuantity(parseFloat(e.target.value) || 1)}
                className="w-full px-3 py-2 rounded-xl border border-borderColor bg-bgColor text-textColor text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all font-semibold text-center"
              />
            </div>

            {/* Measuring Unit */}
            <div>
              <label className="block text-xs font-bold text-textColor mb-1">Measuring Unit</label>
              <select
                value={unit}
                onChange={(e) => setUnit(e.target.value as QtyUnit)}
                className="w-full px-3 py-2 rounded-xl border border-borderColor bg-bgColor text-textColor text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all font-semibold cursor-pointer"
              >
                {QTY_UNITS.map((u) => (
                  <option key={u} value={u}>
                    {u}
                  </option>
                ))}
              </select>
            </div>

            {/* GST Tax Rate */}
            <div>
              <label className="block text-xs font-bold text-textColor mb-1">GST Rate (%)</label>
              <select
                value={gstRate}
                onChange={(e) => setGstRate(parseInt(e.target.value))}
                className="w-full px-3 py-2 rounded-xl border border-borderColor bg-bgColor text-textColor text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all font-semibold cursor-pointer"
              >
                {GST_RATES.map((rate) => (
                  <option key={rate} value={rate}>
                    {rate}%
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Image Upload or URL */}
          <div>
            <label className="block text-xs font-bold text-textColor mb-1">Item Image (Optional)</label>
            <div className="flex items-center gap-3">
              {imageUrl ? (
                <div className="relative group w-14 h-14 rounded-xl overflow-hidden border border-borderColor flex-shrink-0">
                  <img src={imageUrl} alt="preview" className="w-full h-full object-cover" />
                  <button
                    type="button"
                    onClick={() => setImageUrl('')}
                    className="absolute inset-0 bg-black/60 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <X size={14} />
                  </button>
                </div>
              ) : (
                <label className="flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-xl border-2 border-dashed border-borderColor hover:border-primary cursor-pointer transition-colors bg-bgColor/50">
                  <Upload size={16} className="text-textMuted" />
                  <span className="text-xs font-bold text-textMuted">Upload Photo / Drawing</span>
                  <input type="file" accept="image/*" onChange={handleImageUpload} className="hidden" />
                </label>
              )}
            </div>
          </div>

          {/* Actions */}
          <div className="pt-3 border-t border-borderColor flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl border border-borderColor text-xs font-bold text-textColor hover:bg-bgColor transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 rounded-xl bg-primary text-white text-xs font-bold hover:bg-primary-hover transition-colors shadow-xs shadow-primary/30"
            >
              Add to Quotation
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
