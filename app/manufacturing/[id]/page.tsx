'use client';

import React from 'react';
import { useParams } from 'next/navigation';
import ManufacturingSpecView from '../ManufacturingSpecView';
import AdminLayout from '../../common/AdminLayout';
import Link from 'next/link';
import { ArrowLeft, Factory } from 'lucide-react';

export default function DirectManufacturingSpecPage() {
  const params = useParams();
  const rawId = typeof params?.id === 'string' ? params.id : Array.isArray(params?.id) ? params.id[0] : 'PRD-101';
  const productId = decodeURIComponent(rawId);

  return (
    <div className="min-h-screen bg-bgColor text-textColor">
      {/* Top Header for Standalone/Direct Terminal View */}
      <header className="border-b border-borderColor bg-surfaceColor py-3 px-4 sm:px-6 sticky top-0 z-20 print:hidden">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link
              href="/manufacturing"
              className="p-1.5 rounded-xl border border-borderColor hover:bg-sidebarHover text-textColor transition-colors flex items-center gap-1.5 text-xs font-bold"
            >
              <ArrowLeft size={15} />
              <span className="hidden sm:inline">All Specs</span>
            </Link>
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-surfaceColor border border-borderColor flex items-center justify-center p-1 overflow-hidden shrink-0">
                <img
                  src="/logo.png"
                  alt="URBN FURNISH"
                  className="w-full h-full object-contain"
                />
              </div>
              <div>
                <span className="text-xs font-black tracking-tight text-textColor block">
                  URBN FURNISH &bull; PRODUCTION TERMINAL
                </span>
                <span className="text-[10px] text-textMuted font-mono">SPEC: {productId}</span>
              </div>
            </div>
          </div>

          <Link
            href="/dashboard"
            className="text-xs font-bold text-textMuted hover:text-primary transition-colors"
          >
            Admin Dashboard &rarr;
          </Link>
        </div>
      </header>

      {/* Main Spec Container */}
      <main className="max-w-7xl mx-auto p-4 sm:p-6 md:p-8">
        <ManufacturingSpecView initialProductId={productId} isStandalone={true} />
      </main>
    </div>
  );
}
