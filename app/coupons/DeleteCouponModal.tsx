'use client';

import React from 'react';
import { Trash2, X, AlertTriangle } from 'lucide-react';
import { Coupon } from '@/lib/couponStore';

interface DeleteCouponModalProps {
  coupon: Coupon;
  onConfirm: () => void;
  onCancel: () => void;
}

export default function DeleteCouponModal({ coupon, onConfirm, onCancel }: DeleteCouponModalProps) {
  return (
    <div className="fixed inset-0 z-[70] flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={onCancel}
      />

      {/* Modal */}
      <div className="relative w-full max-w-md bg-surfaceColor border border-borderColor rounded-2xl shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-borderColor">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-red-500/10 flex items-center justify-center">
              <AlertTriangle size={18} className="text-red-500" />
            </div>
            <h2 className="text-base font-bold text-textColor">Delete Coupon</h2>
          </div>
          <button
            onClick={onCancel}
            className="p-1.5 rounded-lg text-textMuted hover:text-textColor hover:bg-bgColor transition-colors"
          >
            <X size={17} />
          </button>
        </div>

        {/* Body */}
        <div className="px-6 py-5 space-y-4">
          <p className="text-sm text-textMuted leading-relaxed">
            Are you sure you want to permanently delete this coupon? This action cannot be undone and the coupon code will no longer be valid.
          </p>

          {/* Coupon Preview */}
          <div className="flex items-center gap-3 p-4 rounded-xl bg-bgColor border border-borderColor">
            <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
              <span className="text-lg">🏷️</span>
            </div>
            <div className="min-w-0">
              <p className="font-mono font-extrabold text-sm text-primary tracking-wider">
                {coupon.code}
              </p>
              <p className="text-xs text-textMuted truncate">{coupon.description}</p>
            </div>
          </div>

          <div className="p-3 rounded-xl bg-red-500/5 border border-red-500/20">
            <p className="text-xs text-red-600 font-medium flex items-start gap-2">
              <AlertTriangle size={13} className="mt-0.5 shrink-0" />
              <span>All redemption history and usage data will be permanently deleted.</span>
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-borderColor bg-bgColor/50">
          <button
            onClick={onCancel}
            className="px-4 py-2 rounded-xl text-sm font-semibold text-textMuted hover:text-textColor hover:bg-bgColor border border-borderColor transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold text-white bg-red-500 hover:bg-red-600 shadow-sm shadow-red-500/30 transition-colors"
          >
            <Trash2 size={15} />
            Delete Coupon
          </button>
        </div>
      </div>
    </div>
  );
}
