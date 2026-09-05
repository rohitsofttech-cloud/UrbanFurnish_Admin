'use client';

import React, { useState, useMemo } from 'react';
import { X, Search, Plus, Barcode } from 'lucide-react';
import { AdminProduct, PRODUCT_CATEGORIES } from '@/lib/productData';
import { QuotationItem, QTY_UNITS, computeItemTotals } from '@/lib/quotationStore';

interface Props {
  products: AdminProduct[];
  onAdd: (item: QuotationItem) => void;
  onClose: () => void;
}

export default function ProductSearchModal({ products, onAdd, onClose }: Props) {
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [selectedQtys, setSelectedQtys] = useState<Record<string, number>>({});

  const filtered = useMemo(() => {
    return products.filter((p) => {
      const q = search.toLowerCase();
      const matchSearch =
        p.name.toLowerCase().includes(q) ||
        p.id.toLowerCase().includes(q) ||
        p.category.toLowerCase().includes(q);
      const matchCat = categoryFilter === 'all' || p.category === categoryFilter;
      return matchSearch && matchCat;
    });
  }, [products, search, categoryFilter]);

  const handleAdd = (product: AdminProduct) => {
    const qty = selectedQtys[product.id] || 1;
    const base: Omit<QuotationItem, 'taxAmount' | 'amount'> = {
      id: `qi-${Date.now()}-${product.id}`,
      name: product.name.toUpperCase(),
      hsnCode: '94036000',
      imageUrl: product.imageUrl || '',
      qty,
      qtyUnit: 'PCS',
      rate: product.price,
      gstPercent: 18,
      isCustom: false,
      catalogProductId: product.id,
    };
    const { taxAmount, amount } = computeItemTotals(base);
    onAdd({ ...base, taxAmount, amount });
  };

  const setQty = (id: string, v: number) =>
    setSelectedQtys((prev) => ({ ...prev, [id]: Math.max(1, v) }));

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />
      <div className="relative w-full max-w-3xl max-h-[85vh] flex flex-col rounded-2xl bg-surfaceColor border border-borderColor shadow-2xl overflow-hidden animate-fadeIn">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-borderColor">
          <h2 className="text-base font-black text-textColor">Add Items to Quotation</h2>
          <button onClick={onClose} className="p-2 rounded-xl hover:bg-bgColor text-textMuted transition-colors">
            <X size={18} />
          </button>
        </div>

        {/* Search + filter */}
        <div className="px-6 py-4 border-b border-borderColor flex gap-3 items-center">
          <div className="flex-1 relative">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-textMuted" />
            <input
              autoFocus
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by Item / Item Code / Category…"
              className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-borderColor bg-bgColor text-textColor text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all"
            />
          </div>
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="px-3 py-2.5 rounded-xl border border-borderColor bg-bgColor text-textColor text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-primary/30 cursor-pointer"
          >
            <option value="all">Select Category</option>
            {PRODUCT_CATEGORIES.map((c) => (
              <option key={c.value} value={c.value}>{c.label}</option>
            ))}
          </select>
        </div>

        {/* Product list */}
        <div className="flex-1 overflow-y-auto">
          <table className="w-full">
            <thead className="sticky top-0 z-10 bg-surfaceColor border-b border-borderColor">
              <tr>
                <th className="px-5 py-3 text-left text-[11px] font-black text-textMuted uppercase tracking-wide">Item Name</th>
                <th className="px-4 py-3 text-center text-[11px] font-black text-textMuted uppercase tracking-wide">Stock</th>
                <th className="px-4 py-3 text-right text-[11px] font-black text-textMuted uppercase tracking-wide">Sales Price</th>
                <th className="px-4 py-3 text-center text-[11px] font-black text-textMuted uppercase tracking-wide w-32">Quantity</th>
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={4} className="px-5 py-12 text-center text-sm text-textMuted">
                    No products found
                  </td>
                </tr>
              ) : (
                filtered.map((product) => (
                  <tr key={product.id} className="border-b border-borderColor hover:bg-bgColor/50 transition-colors">
                    <td className="px-5 py-3">
                      <div className="flex items-center gap-3">
                        {product.imageUrl ? (
                          <img src={product.imageUrl} alt={product.name} className="w-10 h-10 rounded-lg object-contain border border-borderColor flex-shrink-0" />
                        ) : (
                          <div className="w-10 h-10 rounded-lg bg-bgColor border border-borderColor flex-shrink-0 flex items-center justify-center text-xl">🪑</div>
                        )}
                        <div>
                          <p className="text-sm font-bold text-textColor">{product.name}</p>
                          <p className="text-[10px] text-textMuted font-semibold capitalize">{product.category}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-center">
                      <span className="text-xs font-bold text-textMuted">{product.stock} PCS</span>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <span className="text-sm font-bold text-textColor">
                        ₹{product.price.toLocaleString('en-IN')}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <button
                        onClick={() => handleAdd(product)}
                        className="w-full px-3 py-2 rounded-xl bg-primary/10 text-primary border border-primary/20 text-xs font-bold hover:bg-primary hover:text-white transition-all flex items-center justify-center gap-1"
                      >
                        <Plus size={12} /> Add
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-borderColor flex items-center justify-between bg-surfaceColor">
          <p className="text-xs text-textMuted font-semibold">
            <span className="text-primary font-bold">{filtered.length}</span> products listed
          </p>
          <button
            onClick={onClose}
            className="px-5 py-2 rounded-xl border border-borderColor text-sm font-bold text-textColor hover:bg-bgColor transition-colors"
          >
            Close [ESC]
          </button>
        </div>
      </div>
    </div>
  );
}
