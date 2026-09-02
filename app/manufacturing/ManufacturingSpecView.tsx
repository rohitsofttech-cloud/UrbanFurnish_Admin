'use client';

import React, { useState, useEffect } from 'react';
import QRCode from 'qrcode';
import Link from 'next/link';
import {
  AdminProduct,
  getAllProducts,
  getProductById,
} from '@/lib/productData';
import {
  Search,
  Factory,
  Printer,
  Check,
  Ruler,
  Layers,
  Palette,
  Maximize2,
  Box,
  Compass,
  Hammer,
  ShieldCheck,
  Clock,
  AlertCircle,
  X,
  Share2,
  Barcode,
  Lock,
  LogIn,
  UserCheck,
} from 'lucide-react';
import toast from 'react-hot-toast';
import { useAuth } from '@/context/AuthContext';
import { hasPermission } from '@/lib/auth';

interface ManufacturingSpecViewProps {
  initialProductId?: string;
  isStandalone?: boolean;
}

export default function ManufacturingSpecView({
  initialProductId = 'PRD-101',
  isStandalone = false,
}: ManufacturingSpecViewProps) {
  const { user, isLoading: isAuthLoading } = useAuth();
  const [allProducts, setAllProducts] = useState<AdminProduct[]>([]);
  const [selectedProduct, setSelectedProduct] = useState<AdminProduct | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedImage, setSelectedImage] = useState<string>('');
  const [qrCodeUrl, setQrCodeUrl] = useState<string>('');
  const [copiedLink, setCopiedLink] = useState(false);
  const [zoomImage, setZoomImage] = useState<string | null>(null);

  // Check Manufacturing module view permission
  const canAccessManufacturing = hasPermission(user, 'Manufacturing', 'view');

  // Load products on mount
  useEffect(() => {
    if (!canAccessManufacturing) return;
    const prods = getAllProducts();
    setAllProducts(prods);

    const initial = getProductById(initialProductId) || prods[0] || null;
    setSelectedProduct(initial);
    if (initial) {
      setSelectedImage(initial.imageUrl || initial.images?.[0] || '');
    }
  }, [initialProductId, canAccessManufacturing]);

  // Generate QR Code whenever selected product changes
  useEffect(() => {
    if (!selectedProduct) return;

    if (typeof window !== 'undefined') {
      const origin = window.location.origin.includes('localhost')
        ? window.location.origin.replace('localhost', '192.168.1.143')
        : window.location.origin;
      const directUrl = `${origin}/manufacturing/${encodeURIComponent(selectedProduct.id)}`;

      QRCode.toDataURL(directUrl, {
        width: 250,
        margin: 1,
        color: {
          dark: '#0f172a',
          light: '#ffffff',
        },
        errorCorrectionLevel: 'M',
      })
        .then((url) => setQrCodeUrl(url))
        .catch((err) => console.error('QR generation error:', err));
    }
  }, [selectedProduct]);

  // Update selected image if product changes
  useEffect(() => {
    if (selectedProduct) {
      setSelectedImage(selectedProduct.imageUrl || selectedProduct.images?.[0] || '');
    }
  }, [selectedProduct]);

  const handleSelectProduct = (prod: AdminProduct) => {
    setSelectedProduct(prod);
    setSearchQuery('');
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;
    const match = getProductById(searchQuery.trim());
    if (match) {
      setSelectedProduct(match);
      toast.success(`Loaded manufacturing spec for ${match.id}`);
    } else {
      // Find partial match
      const partial = allProducts.find(
        (p) =>
          p.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
          p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          p.material.toLowerCase().includes(searchQuery.toLowerCase())
      );
      if (partial) {
        setSelectedProduct(partial);
        toast.success(`Matched: ${partial.id} (${partial.name})`);
      } else {
        toast.error(`No product found matching "${searchQuery}"`);
      }
    }
  };

  const handleCopySpecLink = () => {
    if (typeof window === 'undefined' || !selectedProduct) return;
    const origin = window.location.origin;
    const url = `${origin}/manufacturing/${encodeURIComponent(selectedProduct.id)}`;
    navigator.clipboard.writeText(url);
    setCopiedLink(true);
    toast.success('Direct Factory Spec URL copied to clipboard');
    setTimeout(() => setCopiedLink(false), 2500);
  };

  // Printable Workshop Job Sheet (Completely free of any price or billing numbers)
  const handlePrintJobSheet = () => {
    if (!selectedProduct) return;

    const p = selectedProduct;
    const allImagesList = [p.imageUrl, p.secondaryImageUrl, ...(p.images || [])]
      .filter(Boolean)
      .slice(0, 4);

    const imagesHtml = allImagesList
      .map(
        (img, idx) => `
        <div style="border:1px solid #0f172a; border-radius:4px; overflow:hidden; background:#fff; text-align:center; padding:4px;">
          <img src="${img}" style="width:100%; height:130px; object-fit:contain; display:block;" alt="Angle ${idx + 1}" />
          <span style="font-size:9px; font-weight:700; color:#475569; display:block; margin-top:2px;">VIEW ${idx + 1}</span>
        </div>`
      )
      .join('');

    const featuresHtml = (p.features && p.features.length > 0 ? p.features : [
      'High-grade structural alignment as per technical blueprint',
      'Anti-termite and moisture-resistant kiln seasoned treatment',
      'Reinforced internal joint brackets and load-bearing corners',
      'Smooth sanded surface with uniform poly-coating finish'
    ])
      .map(
        (f) => `
        <li style="margin-bottom:6px; font-size:11px; line-height:1.4; color:#1e293b;">
          <span style="display:inline-block; width:12px; height:12px; border:1.5px solid #0f172a; margin-right:6px; vertical-align:middle;"></span>
          ${f}
        </li>`
      )
      .join('');

    const printWindow = window.open('', '_blank', 'width=980,height=800');
    if (!printWindow) return;

    printWindow.document.write(`<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8"/>
  <title>WORKSHOP PRODUCTION ORDER - ${p.id}</title>
  <style>
    *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; -webkit-print-color-adjust: exact; print-color-adjust: exact; }
    body { font-family: 'Segoe UI', Arial, sans-serif; background: #fff; color: #0f172a; padding: 20px; }
    .sheet { max-width: 820px; margin: 0 auto; border: 2px solid #0f172a; padding: 16px; }
    .header { display: flex; justify-content: space-between; align-items: flex-start; border-bottom: 2px solid #0f172a; padding-bottom: 12px; margin-bottom: 12px; }
    .title { font-size: 20px; font-weight: 900; letter-spacing: -0.5px; text-transform: uppercase; }
    .badge { background: #0f172a; color: #fff; font-size: 11px; font-weight: 800; padding: 4px 10px; border-radius: 4px; display: inline-block; }
    .meta-table { width: 100%; border-collapse: collapse; margin-bottom: 14px; font-size: 11.5px; }
    .meta-table th { background: #f1f5f9; text-align: left; padding: 6px 10px; border: 1px solid #cbd5e1; font-weight: 800; width: 22%; text-transform: uppercase; font-size: 10px; }
    .meta-table td { padding: 6px 10px; border: 1px solid #cbd5e1; font-weight: 600; color: #0f172a; }
    .section-title { font-size: 12px; font-weight: 900; text-transform: uppercase; background: #0f172a; color: #fff; padding: 4px 8px; margin: 12px 0 8px 0; letter-spacing: 0.5px; }
    .gallery-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 8px; margin-bottom: 14px; }
    .qa-box { border: 1.5px dashed #64748b; padding: 10px; border-radius: 4px; background: #f8fafc; margin-top: 14px; display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 10px; font-size: 10.5px; }
    .sign-line { border-bottom: 1px solid #0f172a; height: 28px; margin-top: 6px; }
    @media print {
      body { padding: 0; }
      .sheet { border: 2px solid #000; }
      @page { margin: 8mm; size: A4 portrait; }
    }
  </style>
</head>
<body>
  <div class="sheet">
    <div class="header">
      <div>
        <span class="badge">FACTORY WORKSHOP JOB CARD</span>
        <h1 class="title" style="margin-top:4px;">${p.name}</h1>
        <p style="font-size:11.5px; color:#475569; font-weight:600; margin-top:2px;">
          Product SKU / Model Code: <strong style="color:#0f172a; font-family:monospace; font-size:13px;">${p.id}</strong> | Room: ${p.room} | Category: ${p.category}
        </p>
      </div>
      <div style="text-align:right;">
        ${qrCodeUrl ? `<img src="${qrCodeUrl}" style="width:75px; height:75px; border:1px solid #0f172a; padding:2px;" alt="QR"/>` : ''}
        <div style="font-size:9px; font-family:monospace; font-weight:700; margin-top:2px;">JOB ID: ${p.id}-MFG</div>
      </div>
    </div>

    <!-- Visual Angle References -->
    <div class="section-title">1. VISUAL REFERENCE & SHAPE PROFILE</div>
    <div class="gallery-grid">
      ${imagesHtml}
    </div>

    <!-- Technical Specifications Matrix -->
    <div class="section-title">2. MANUFACTURING & MATERIAL SPECIFICATIONS</div>
    <table class="meta-table">
      <tr>
        <th>Primary Material</th>
        <td><strong>${p.material || 'Solid Hardwood'}</strong></td>
        <th>Finish / Color</th>
        <td><strong style="color:#b45309;">${p.finish || 'Natural Finish'}</strong></td>
      </tr>
      <tr>
        <th>Physical Dimensions</th>
        <td><strong style="font-family:monospace; font-size:12px;">${p.dimensions || 'Standard'}</strong></td>
        <th>Seating / Config</th>
        <td>${p.seatingCapacity || 'N/A'}</td>
      </tr>
      <tr>
        <th>Storage Structure</th>
        <td>${p.storageType || 'Without Storage'}</td>
        <th>Warranty Standard</th>
        <td>${p.warrantyYears ? `${p.warrantyYears} Years Structural` : '5 Years Standard'}</td>
      </tr>
      <tr>
        <th>Batch Stock Target</th>
        <td>${p.stock || 0} units active queue</td>
        <th>Delivery Target</th>
        <td>${p.deliveryDays || '3-5 Days'}</td>
      </tr>
    </table>

    <!-- Build Steps Checklist -->
    <div class="section-title">3. PRODUCTION QUALITY & STRUCTURAL CHECKPOINTS</div>
    <ul style="list-style:none; padding:4px 8px;">
      ${featuresHtml}
      <li style="margin-bottom:6px; font-size:11px; line-height:1.4; color:#1e293b;">
        <span style="display:inline-block; width:12px; height:12px; border:1.5px solid #0f172a; margin-right:6px; vertical-align:middle;"></span>
        Final Quality Control stamp and dimensional tolerance inspection (±2mm max deviation)
      </li>
    </ul>

    <!-- Sign off boxes -->
    <div class="qa-box">
      <div>
        <strong>CARPENTRY / FRAME LEAD:</strong>
        <div class="sign-line"></div>
        <span style="font-size:9px; color:#64748b;">Signature & Date</span>
      </div>
      <div>
        <strong>FINISH / UPHOLSTERY LEAD:</strong>
        <div class="sign-line"></div>
        <span style="font-size:9px; color:#64748b;">Signature & Date</span>
      </div>
      <div>
        <strong>QC INSPECTION LEAD:</strong>
        <div class="sign-line"></div>
        <span style="font-size:9px; color:#64748b;">Passed [  ]  Rework [  ]</span>
      </div>
    </div>

    <div style="margin-top:12px; text-align:center; font-size:9.5px; color:#64748b; border-top:1px solid #cbd5e1; padding-top:6px;">
      URBN FURNISH MANUFACTURING DIVISION &bull; STRICTLY FOR PRODUCTION FLOOR USE &bull; CONFIDENTIAL
    </div>
  </div>
</body>
</html>`);
    printWindow.document.close();
  };

  // Filtered list for fast selector chips
  const filteredSearchList = searchQuery.trim()
    ? allProducts.filter(
        (p) =>
          p.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
          p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          p.material.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : [];

  // 1. Loading state during auth check
  if (isAuthLoading) {
    return (
      <div className="bg-surfaceColor rounded-2xl border border-borderColor p-12 text-center flex flex-col items-center justify-center space-y-3">
        <div className="w-9 h-9 border-3 border-primary border-t-transparent rounded-full animate-spin" />
        <p className="text-xs font-bold text-textMuted uppercase tracking-wider">
          Verifying Workshop Authorization...
        </p>
      </div>
    );
  }

  // 2. Unauthenticated Employee Gate
  if (!user) {
    return (
      <div className="bg-surfaceColor rounded-2xl border border-dashed border-red-500/30 p-8 sm:p-12 text-center max-w-xl mx-auto space-y-5 shadow-xl">
        <div className="w-16 h-16 rounded-2xl bg-red-500/10 text-red-500 flex items-center justify-center mx-auto ring-8 ring-red-500/5">
          <Lock size={30} />
        </div>
        <div>
          <span className="text-[10px] font-black uppercase tracking-widest px-2.5 py-1 rounded-full bg-red-500/10 text-red-600 border border-red-500/20 inline-block mb-2 font-mono">
            SECURE PRODUCTION SPEC
          </span>
          <h2 className="text-xl font-black text-textColor">
            Workshop Authentication Required
          </h2>
          <p className="text-xs text-textMuted mt-1.5 leading-relaxed max-w-md mx-auto">
            Manufacturing blueprints, joinery drawings, and technical job sheets are confidential to authorized production personnel. Please sign in with your employee account to view spec <strong className="font-mono text-textColor">{initialProductId}</strong>.
          </p>
        </div>

        <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-3">
          <Link
            href={`/auth/login?redirect=${encodeURIComponent(typeof window !== 'undefined' ? window.location.pathname : `/manufacturing/${initialProductId}`)}`}
            className="w-full sm:w-auto px-6 py-2.5 rounded-xl bg-primary text-white font-bold text-xs hover:bg-primary-hover transition-all flex items-center justify-center gap-2 shadow-sm"
          >
            <LogIn size={15} />
            <span>Sign In to Access Specs</span>
          </Link>
          <Link
            href="/dashboard"
            className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-bgColor border border-borderColor text-textColor font-bold text-xs hover:bg-sidebarHover transition-colors"
          >
            Return to Dashboard
          </Link>
        </div>
      </div>
    );
  }

  // 3. Authenticated but Unauthorized Role Gate (Missing Manufacturing Module Permission)
  if (!canAccessManufacturing) {
    return (
      <div className="bg-surfaceColor rounded-2xl border border-dashed border-amber-500/30 p-8 sm:p-12 text-center max-w-xl mx-auto space-y-5 shadow-xl">
        <div className="w-16 h-16 rounded-2xl bg-amber-500/10 text-amber-600 flex items-center justify-center mx-auto ring-8 ring-amber-500/5">
          <AlertCircle size={30} />
        </div>
        <div>
          <span className="text-[10px] font-black uppercase tracking-widest px-2.5 py-1 rounded-full bg-amber-500/10 text-amber-700 border border-amber-500/20 inline-block mb-2 font-mono">
            RESTRICTED MODULE ACCESS
          </span>
          <h2 className="text-xl font-black text-textColor">
            Manufacturing Access Restricted
          </h2>
          <p className="text-xs text-textMuted mt-1.5 leading-relaxed max-w-md mx-auto">
            Your current assigned role (<strong className="text-textColor font-bold">{user.roleName}</strong>) does not have permission to inspect technical workshop job sheets or CAD blueprints.
          </p>
        </div>

        <div className="p-3.5 bg-bgColor rounded-xl border border-borderColor text-left text-xs space-y-1.5 max-w-sm mx-auto">
          <div className="flex items-center justify-between text-[11px]">
            <span className="text-textMuted font-medium">Logged in as:</span>
            <span className="font-bold text-textColor flex items-center gap-1">
              <UserCheck size={12} className="text-primary" /> {user.name}
            </span>
          </div>
          <div className="flex items-center justify-between text-[11px]">
            <span className="text-textMuted font-medium">Department:</span>
            <span className="font-mono font-bold text-textColor">{user.department || 'General Staff'}</span>
          </div>
          <div className="flex items-center justify-between text-[11px]">
            <span className="text-textMuted font-medium">Required Module:</span>
            <span className="font-bold text-amber-700 dark:text-amber-400">Manufacturing Specs (View)</span>
          </div>
        </div>

        <p className="text-[11px] text-textMuted">
          If you require access to production job sheets, contact your Super Admin to update your role permissions in <strong className="text-textColor">Administrative Roles</strong>.
        </p>

        <div className="pt-2 flex justify-center gap-3">
          <Link
            href="/dashboard"
            className="px-5 py-2.5 rounded-xl bg-primary text-white font-bold text-xs hover:bg-primary-hover transition-all"
          >
            Go to Admin Dashboard
          </Link>
        </div>
      </div>
    );
  }

  const allImages = selectedProduct
    ? [selectedProduct.imageUrl, selectedProduct.secondaryImageUrl, ...(selectedProduct.images || [])].filter(
        (url, idx, self): url is string => Boolean(url) && self.indexOf(url) === idx
      )
    : [];

  return (
    <div className="space-y-6">
      {/* Top Bar / Search Section */}
      <div className="bg-surfaceColor rounded-2xl border border-borderColor p-4 sm:p-5 shadow-xs">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <div className="w-9 h-9 rounded-xl bg-primary/10 text-primary flex items-center justify-center font-bold">
                <Factory size={20} />
              </div>
              <div>
                <h1 className="text-xl sm:text-2xl font-black text-textColor tracking-tight">
                  Manufacturing Specifications &amp; Job Card
                </h1>
                <p className="text-xs text-textMuted">
                  Technical blueprint, material grades, dimensions, and visual guides for production teams.
                </p>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            <button
              onClick={handleCopySpecLink}
              className="px-3.5 py-2 rounded-xl bg-bgColor border border-borderColor text-textColor hover:bg-sidebarHover text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer"
              title="Copy direct share link for factory terminals"
            >
              {copiedLink ? <Check size={14} className="text-emerald-500" /> : <Share2 size={14} />}
              <span>{copiedLink ? 'Link Copied' : 'Share Spec Link'}</span>
            </button>

            <button
              onClick={handlePrintJobSheet}
              disabled={!selectedProduct}
              className="px-4 py-2 rounded-xl bg-primary text-white hover:bg-primary-hover font-bold text-xs flex items-center gap-2 shadow-xs transition-all disabled:opacity-50 cursor-pointer"
            >
              <Printer size={15} />
              <span>Print Workshop Job Card</span>
            </button>
          </div>
        </div>

        {/* Search & Quick ID Selector */}
        <div className="mt-4 pt-4 border-t border-borderColor">
          <form onSubmit={handleSearchSubmit} className="relative">
            <div className="flex flex-col sm:flex-row items-center gap-2">
              <div className="relative flex-1 w-full">
                <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-textMuted" />
                <input
                  type="text"
                  placeholder="Enter Product ID (e.g. PRD-101), Model Name, Wood Type, or Material..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-10 py-2.5 bg-bgColor rounded-xl border border-borderColor text-xs font-semibold text-textColor focus:border-primary focus:outline-none placeholder:text-textMuted/70"
                />
                {searchQuery && (
                  <button
                    type="button"
                    onClick={() => setSearchQuery('')}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-textMuted hover:text-textColor"
                  >
                    <X size={14} />
                  </button>
                )}
              </div>
              <button
                type="submit"
                className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-secondary text-white font-bold text-xs hover:bg-secondary-light transition-colors whitespace-nowrap cursor-pointer"
              >
                Fetch Spec
              </button>
            </div>

            {/* Dropdown Suggestions */}
            {searchQuery.trim() && filteredSearchList.length > 0 && (
              <div className="absolute left-0 right-0 top-full mt-1.5 bg-surfaceColor border border-borderColor rounded-xl shadow-xl z-30 max-h-60 overflow-y-auto divide-y divide-borderColor/50">
                {filteredSearchList.map((prod) => (
                  <button
                    key={prod.id}
                    type="button"
                    onClick={() => handleSelectProduct(prod)}
                    className="w-full text-left p-2.5 hover:bg-sidebarHover flex items-center justify-between gap-3 transition-colors cursor-pointer"
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <img
                        src={prod.imageUrl}
                        alt={prod.name}
                        className="w-8 h-8 rounded-lg object-cover bg-bgColor border border-borderColor shrink-0"
                      />
                      <div className="min-w-0">
                        <p className="text-xs font-bold text-textColor truncate">{prod.name}</p>
                        <p className="text-[10px] text-textMuted truncate">
                          {prod.material} &bull; {prod.finish} &bull; {prod.dimensions}
                        </p>
                      </div>
                    </div>
                    <span className="font-mono text-[10.5px] font-bold px-2 py-0.5 rounded-md bg-primary/10 text-primary shrink-0">
                      {prod.id}
                    </span>
                  </button>
                ))}
              </div>
            )}
          </form>

          {/* Quick Product Chips */}
          <div className="mt-3 flex items-center gap-1.5 overflow-x-auto pb-1 text-xs custom-scrollbar">
            <span className="text-[11px] font-bold text-textMuted uppercase tracking-wider shrink-0 mr-1 flex items-center gap-1">
              <Barcode size={13} /> Quick Select:
            </span>
            {allProducts.slice(0, 8).map((p) => (
              <button
                key={p.id}
                onClick={() => setSelectedProduct(p)}
                className={`px-2.5 py-1 rounded-lg text-xs font-mono font-bold transition-colors shrink-0 cursor-pointer ${
                  selectedProduct?.id === p.id
                    ? 'bg-primary text-white shadow-xs'
                    : 'bg-bgColor hover:bg-sidebarHover text-textColor border border-borderColor'
                }`}
              >
                {p.id}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Main Spec Card Container */}
      {!selectedProduct ? (
        <div className="bg-surfaceColor rounded-2xl border border-dashed border-borderColor p-12 text-center">
          <AlertCircle size={36} className="mx-auto text-textMuted mb-2" />
          <h3 className="text-base font-bold text-textColor">No Product Selected</h3>
          <p className="text-xs text-textMuted mt-1">
            Please enter a product ID or choose one from the list above to view manufacturing specs.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Left Column: Visual Geometry & Gallery (5 Cols) */}
          <div className="lg:col-span-5 space-y-4">
            <div className="bg-surfaceColor rounded-2xl border border-borderColor p-4 shadow-xs">
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-bold text-textMuted uppercase tracking-wider flex items-center gap-1.5">
                  <Compass size={14} className="text-primary" /> Visual Spec Angles
                </span>
                <span className="text-[10px] font-bold font-mono px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-600 border border-emerald-500/20">
                  {allImages.length} Angle{allImages.length > 1 ? 's' : ''} Available
                </span>
              </div>

              {/* Main Active Angle Display */}
              <div className="relative group rounded-xl overflow-hidden bg-bgColor border border-borderColor aspect-4/3 flex items-center justify-center">
                {selectedImage ? (
                  <img
                    src={selectedImage}
                    alt={selectedProduct.name}
                    className="w-full h-full object-contain p-2 cursor-pointer transition-transform duration-300 group-hover:scale-105"
                    onClick={() => setZoomImage(selectedImage)}
                  />
                ) : (
                  <div className="text-textMuted text-xs flex flex-col items-center">
                    <Box size={32} className="mb-1 text-textMuted/50" />
                    <span>No angle image available</span>
                  </div>
                )}
                {selectedImage && (
                  <button
                    onClick={() => setZoomImage(selectedImage)}
                    className="absolute bottom-2.5 right-2.5 p-2 rounded-lg bg-black/70 text-white hover:bg-black transition-colors cursor-pointer"
                    title="Zoom Blueprint"
                  >
                    <Maximize2 size={14} />
                  </button>
                )}
              </div>

              {/* Thumbnail Angles Selector */}
              {allImages.length > 1 && (
                <div className="grid grid-cols-4 gap-2 mt-3">
                  {allImages.map((img, idx) => (
                    <button
                      key={idx}
                      onClick={() => setSelectedImage(img)}
                      className={`relative rounded-lg overflow-hidden border-2 aspect-square p-1 bg-bgColor transition-all cursor-pointer ${
                        selectedImage === img
                          ? 'border-primary shadow-xs ring-2 ring-primary/20'
                          : 'border-borderColor hover:border-textMuted/40 opacity-70 hover:opacity-100'
                      }`}
                    >
                      <img src={img} alt={`Angle ${idx + 1}`} className="w-full h-full object-cover rounded-md" />
                      <span className="absolute bottom-1 right-1 bg-black/60 text-white font-mono text-[8.5px] px-1 rounded">
                        #{idx + 1}
                      </span>
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Quick QR Job Tag */}
            <div className="bg-surfaceColor rounded-2xl border border-borderColor p-4 shadow-xs flex items-center justify-between gap-4">
              <div className="space-y-1">
                <span className="text-[10px] font-bold text-textMuted uppercase tracking-wider flex items-center gap-1">
                  <Barcode size={14} className="text-primary" /> Shop-Floor QR Code
                </span>
                <p className="text-xs font-bold text-textColor">Direct Station Access</p>
                <p className="text-[11px] text-textMuted">
                  Scan with factory tablet to load this exact spec instantly.
                </p>
              </div>
              {qrCodeUrl && (
                <div className="p-1.5 bg-white border border-borderColor rounded-xl shadow-xs shrink-0">
                  <img src={qrCodeUrl} alt="Product Spec QR" className="w-20 h-20 object-contain" />
                </div>
              )}
            </div>
          </div>

          {/* Right Column: Technical & Structural Production Matrix (7 Cols) */}
          <div className="lg:col-span-7 space-y-4">
            {/* Header Badge & Title (Strictly NO Price) */}
            <div className="bg-surfaceColor rounded-2xl border border-borderColor p-5 shadow-xs">
              <div className="flex flex-wrap items-center gap-2 mb-2">
                <span className="px-2.5 py-0.5 rounded-full bg-primary/10 text-primary font-mono text-xs font-bold border border-primary/20">
                  ID: {selectedProduct.id}
                </span>
                <span className="px-2.5 py-0.5 rounded-full bg-secondary/10 text-secondary font-bold text-xs">
                  Category: {selectedProduct.category.toUpperCase()}
                </span>
                <span className="px-2.5 py-0.5 rounded-full bg-amber-500/10 text-amber-700 font-bold text-xs">
                  Room: {selectedProduct.room}
                </span>
                {selectedProduct.badge && (
                  <span className="px-2.5 py-0.5 rounded-full bg-indigo-500/10 text-indigo-700 font-bold text-xs">
                    Type: {selectedProduct.badge}
                  </span>
                )}
              </div>

              <h2 className="text-xl sm:text-2xl font-black text-textColor tracking-tight">
                {selectedProduct.name}
              </h2>
              {selectedProduct.subtitle && (
                <p className="text-xs text-textMuted mt-1 font-medium leading-relaxed">
                  {selectedProduct.subtitle}
                </p>
              )}
            </div>

            {/* Core Manufacturing Attributes Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {/* Material Spec */}
              <div className="bg-surfaceColor rounded-2xl border border-borderColor p-4 shadow-xs">
                <div className="flex items-center gap-2 mb-1.5">
                  <Layers size={16} className="text-primary" />
                  <span className="text-[11px] font-bold text-textMuted uppercase tracking-wider">
                    Primary Material &amp; Frame
                  </span>
                </div>
                <p className="text-sm font-black text-textColor">
                  {selectedProduct.material || 'Solid Sheesham / Sal Hardwood'}
                </p>
                <p className="text-[11px] text-textMuted mt-0.5">
                  Kiln-seasoned &bull; Moisture level &lt; 12% &bull; Anti-termite treated
                </p>
              </div>

              {/* Color & Finish Swatch */}
              <div className="bg-surfaceColor rounded-2xl border border-borderColor p-4 shadow-xs">
                <div className="flex items-center gap-2 mb-1.5">
                  <Palette size={16} className="text-primary" />
                  <span className="text-[11px] font-bold text-textMuted uppercase tracking-wider">
                    Finish / Color Tone
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="w-4 h-4 rounded-full border border-black/20 shadow-xs bg-amber-700" />
                  <p className="text-sm font-black text-textColor">
                    {selectedProduct.finish || 'Natural Wood / Honey Teak'}
                  </p>
                </div>
                <p className="text-[11px] text-textMuted mt-0.5">
                  Smooth buffed poly-coat &bull; Uniform stain coverage
                </p>
              </div>

              {/* Dimensions */}
              <div className="bg-surfaceColor rounded-2xl border border-borderColor p-4 shadow-xs">
                <div className="flex items-center gap-2 mb-1.5">
                  <Ruler size={16} className="text-primary" />
                  <span className="text-[11px] font-bold text-textMuted uppercase tracking-wider">
                    Physical Dimensions (L &times; W &times; H)
                  </span>
                </div>
                <p className="text-sm font-black font-mono text-textColor">
                  {selectedProduct.dimensions || '76L x 32W x 34H in'}
                </p>
                <p className="text-[11px] text-textMuted mt-0.5">
                  Dimensional tolerance allowed: &plusmn; 2mm
                </p>
              </div>

              {/* Seating / Configuration */}
              <div className="bg-surfaceColor rounded-2xl border border-borderColor p-4 shadow-xs">
                <div className="flex items-center gap-2 mb-1.5">
                  <Box size={16} className="text-primary" />
                  <span className="text-[11px] font-bold text-textMuted uppercase tracking-wider">
                    Seating &amp; Storage Config
                  </span>
                </div>
                <p className="text-sm font-black text-textColor">
                  {selectedProduct.seatingCapacity || 'Standard'} &bull; {selectedProduct.storageType || 'Without Storage'}
                </p>
                <p className="text-[11px] text-textMuted mt-0.5">
                  {selectedProduct.storageType?.includes('Hydraulic')
                    ? 'Requires German gas-lift piston installation'
                    : 'Standard heavy-duty internal bracing'}
                </p>
              </div>
            </div>

            {/* Structural Checkpoints & Production Checklist */}
            <div className="bg-surfaceColor rounded-2xl border border-borderColor p-5 shadow-xs space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Hammer size={17} className="text-primary" />
                  <h3 className="text-sm font-bold text-textColor uppercase tracking-wider">
                    Production &amp; Quality Checklist
                  </h3>
                </div>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-bgColor text-textMuted border border-borderColor font-mono">
                  ISO-9001 FACTORY STD
                </span>
              </div>

              <div className="space-y-2 pt-1">
                {(selectedProduct.features && selectedProduct.features.length > 0
                  ? selectedProduct.features
                  : [
                      'Solid Sal/Sheesham Wood internal anti-sag frame structure',
                      '32D High-Resilience polyurethane foam core cushioning',
                      'Termite and borer resistant chemical immersion treatment',
                      'Precision mortise and tenon joinery on load-bearing joints',
                    ]
                ).map((feat, index) => (
                  <div
                    key={index}
                    className="flex items-start gap-2.5 p-2.5 rounded-xl bg-bgColor border border-borderColor/70 text-xs font-semibold text-textColor"
                  >
                    <div className="w-5 h-5 rounded-md bg-primary/10 text-primary flex items-center justify-center font-mono font-black text-[11px] shrink-0 mt-0.5">
                      {index + 1}
                    </div>
                    <div className="leading-snug">
                      <p>{feat}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Production Quality Guarantee & Dispatch Criteria */}
            <div className="bg-surfaceColor rounded-2xl border border-borderColor p-4 shadow-xs">
              <div className="flex items-center justify-between flex-wrap gap-2 text-xs">
                <div className="flex items-center gap-2 text-textMuted">
                  <ShieldCheck size={16} className="text-emerald-600" />
                  <span>
                    Structural Warranty Spec:{' '}
                    <strong className="text-textColor">
                      {selectedProduct.warrantyYears ? `${selectedProduct.warrantyYears} Years` : '5 Years'}
                    </strong>
                  </span>
                </div>
                <div className="flex items-center gap-2 text-textMuted">
                  <Clock size={16} className="text-amber-600" />
                  <span>
                    Target Assembly Lead Time:{' '}
                    <strong className="text-textColor">{selectedProduct.deliveryDays || '3-5 Days'}</strong>
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Image Zoom Modal */}
      {zoomImage && (
        <div
          className="fixed inset-0 z-50 bg-black/85 backdrop-blur-xs flex items-center justify-center p-4"
          onClick={() => setZoomImage(null)}
        >
          <div
            className="relative max-w-4xl max-h-[90vh] bg-white rounded-2xl overflow-hidden p-3 shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={() => setZoomImage(null)}
              className="absolute top-4 right-4 z-10 p-2 rounded-full bg-black/60 text-white hover:bg-black transition-colors cursor-pointer"
            >
              <X size={18} />
            </button>
            <img
              src={zoomImage}
              alt="High Res Manufacturing Reference"
              className="w-full h-auto max-h-[82vh] object-contain rounded-xl"
            />
            <div className="p-3 text-center">
              <p className="text-xs font-bold text-gray-800 font-mono">
                {selectedProduct?.name} &bull; Spec ID: {selectedProduct?.id}
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
