'use client';

import React from 'react';
import { X, AlertTriangle } from 'lucide-react';
import { AdminProduct } from '@/lib/productData';

interface DeleteConfirmModalProps {
  product: AdminProduct;
  onConfirm: () => void;
  onCancel: () => void;
}

export default function DeleteConfirmModal({ product, onConfirm, onCancel }: DeleteConfirmModalProps) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onCancel} />

      {/* Modal */}
      <div className="relative bg-surfaceColor rounded-2xl border border-borderColor shadow-2xl w-full max-w-md animate-in fade-in zoom-in-95 duration-200">
        {/* Close */}
        <button
          onClick={onCancel}
          className="absolute top-4 right-4 p-1.5 rounded-lg text-textMuted hover:text-textColor hover:bg-bgColor transition-colors"
        >
          <X size={16} />
        </button>

        <div className="p-6 text-center">
          {/* Warning Icon */}
          <div className="mx-auto w-14 h-14 rounded-full bg-red-500/10 flex items-center justify-center mb-4">
            <AlertTriangle size={28} className="text-red-500" />
          </div>

          <h3 className="text-lg font-bold text-textColor mb-2">Delete Product</h3>
          <p className="text-sm text-textMuted mb-1">
            Are you sure you want to delete this product?
          </p>
          <p className="text-sm font-semibold text-textColor mb-1">
            &ldquo;{product.name}&rdquo;
          </p>
          <p className="text-xs text-textMuted font-mono mb-6">
            SKU: {product.id}
          </p>

          <div className="p-3 rounded-xl bg-red-500/5 border border-red-500/10 mb-6">
            <p className="text-xs text-red-600 font-medium">
              This action cannot be undone. The product will be permanently removed from the catalog.
            </p>
          </div>

          {/* Actions */}
          <div className="flex items-center gap-3">
            <button
              onClick={onCancel}
              className="flex-1 px-4 py-2.5 rounded-xl bg-bgColor border border-borderColor text-sm font-semibold text-textColor hover:bg-sidebarHover transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={onConfirm}
              className="flex-1 px-4 py-2.5 rounded-xl bg-red-500 text-white text-sm font-bold hover:bg-red-600 transition-colors shadow-sm shadow-red-500/20"
            >
              Delete Product
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
