'use client';

import React, { useState, useEffect } from 'react';
import {
  X,
  Plus,
  Trash2,
  Image as ImageIcon,
  Tag,
  Info,
  IndianRupee,
  Ruler,
  Truck,
  Shield,
  Sparkles,
  Search,
  Globe,
  HelpCircle,
} from 'lucide-react';
import {
  AdminProduct,
  PRODUCT_CATEGORIES,
  ROOM_OPTIONS,
  BADGE_OPTIONS,
} from '@/lib/productData';

interface ProductFormModalProps {
  product?: AdminProduct | null;
  onSave: (product: AdminProduct) => void;
  onCancel: () => void;
}

const EMPTY_PRODUCT: AdminProduct = {
  id: '',
  slug: '',
  name: '',
  subtitle: '',
  category: 'sofas',
  childCategory: '',
  room: 'Living',
  price: 0,
  originalPrice: 0,
  discountPercentage: 0,
  rating: 4.5,
  reviewCount: 0,
  imageUrl: '',
  secondaryImageUrl: '',
  images: [],
  badge: '',
  inStock: true,
  material: '',
  finish: '',
  seatingCapacity: '',
  storageType: '',
  dimensions: '',
  deliveryDays: '3-5 Days',
  emiPerMonth: 0,
  warrantyYears: 5,
  features: [],
  unitsSold: 0,
  stock: 0,
  meta_title: '',
  meta_description: '',
  meta_keywords: [],
  createdAt: new Date().toISOString(),
};

export default function ProductFormModal({ product, onSave, onCancel }: ProductFormModalProps) {
  const isEditing = !!product;
  const [form, setForm] = useState<AdminProduct>(
    product || { ...EMPTY_PRODUCT, id: `PRD-${Date.now()}` }
  );
  const [newFeature, setNewFeature] = useState('');
  const [newImageUrl, setNewImageUrl] = useState('');
  const [newKeyword, setNewKeyword] = useState('');
  const [activeTab, setActiveTab] = useState<
    'basic' | 'pricing' | 'media' | 'specs' | 'features' | 'seo'
  >('basic');

  useEffect(() => {
    if (product) {
      setForm(product);
    }
  }, [product]);

  const updateField = (
    field: keyof AdminProduct,
    value: string | number | boolean | string[] | undefined
  ) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleCategoryChange = (category: string) => {
    const catData = PRODUCT_CATEGORIES.find((c) => c.value === category);
    setForm((prev) => ({ ...prev, category, room: catData?.room || prev.room }));
  };

  const addFeature = () => {
    if (newFeature.trim()) {
      updateField('features', [...form.features, newFeature.trim()]);
      setNewFeature('');
    }
  };

  const removeFeature = (index: number) => {
    updateField('features', form.features.filter((_, i) => i !== index));
  };

  const addImage = () => {
    if (newImageUrl.trim()) {
      updateField('images', [...form.images, newImageUrl.trim()]);
      setNewImageUrl('');
    }
  };

  const removeImage = (index: number) => {
    updateField('images', form.images.filter((_, i) => i !== index));
  };

  const addKeyword = () => {
    if (newKeyword.trim()) {
      const current = form.meta_keywords || [];
      if (!current.includes(newKeyword.trim())) {
        updateField('meta_keywords', [...current, newKeyword.trim()]);
      }
      setNewKeyword('');
    }
  };

  const removeKeyword = (kwToRemove: string) => {
    const current = form.meta_keywords || [];
    updateField(
      'meta_keywords',
      current.filter((k) => k !== kwToRemove)
    );
  };

  const handleSubmit = () => {
    const slug = form.slug || form.name.toLowerCase().replace(/[^a-z0-9]+/g, '-');
    const discountPercentage =
      form.originalPrice > 0
        ? Math.round(((form.originalPrice - form.price) / form.originalPrice) * 100)
        : 0;

    const meta_title =
      form.meta_title || `${form.name} | Buy Online at Urbn Furnish`;
    const meta_description = form.meta_description || form.subtitle || '';

    onSave({
      ...form,
      slug,
      discountPercentage,
      meta_title,
      meta_description,
    });
  };

  const tabs = [
    { id: 'basic' as const, label: 'Basic Info', icon: <Info size={14} /> },
    { id: 'pricing' as const, label: 'Pricing & Stock', icon: <IndianRupee size={14} /> },
    { id: 'media' as const, label: 'Media & Images', icon: <ImageIcon size={14} /> },
    { id: 'specs' as const, label: 'Specifications', icon: <Ruler size={14} /> },
    { id: 'features' as const, label: 'Features', icon: <Sparkles size={14} /> },
    { id: 'seo' as const, label: 'SEO & Meta', icon: <Search size={14} /> },
  ];

  const inputClass =
    'w-full px-3.5 py-2.5 bg-bgColor rounded-xl border border-borderColor text-sm text-textColor outline-hidden focus:border-primary/50 focus:ring-2 focus:ring-primary/10 transition-all';
  const labelClass =
    'block text-xs font-bold text-textMuted mb-1.5 uppercase tracking-wider';
  const selectClass =
    'w-full px-3.5 py-2.5 bg-bgColor rounded-xl border border-borderColor text-sm text-textColor outline-hidden focus:border-primary/50 focus:ring-2 focus:ring-primary/10 transition-all appearance-none cursor-pointer';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/50 backdrop-blur-xs" onClick={onCancel} />

      {/* Modal */}
      <div className="relative bg-surfaceColor rounded-2xl border border-borderColor shadow-2xl w-full max-w-3xl max-h-[90vh] flex flex-col animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-borderColor shrink-0">
          <div>
            <h2 className="text-lg font-black text-textColor">
              {isEditing ? 'Edit Product' : 'Add New Product'}
            </h2>
            <p className="text-xs text-textMuted mt-0.5">
              {isEditing ? `Editing SKU ${product?.id}` : 'Fill in the furniture product details below'}
            </p>
          </div>
          <button
            onClick={onCancel}
            className="p-2 rounded-xl text-textMuted hover:text-textColor hover:bg-bgColor transition-colors"
          >
            <X size={18} />
          </button>
        </div>

        {/* Tabs */}
        <div className="flex items-center gap-1 px-6 py-3 border-b border-borderColor shrink-0 overflow-x-auto">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-semibold transition-all whitespace-nowrap ${
                activeTab === tab.id
                  ? 'bg-primary/10 text-primary border border-primary/20 font-bold'
                  : 'text-textMuted hover:bg-bgColor hover:text-textColor'
              }`}
            >
              {tab.icon}
              {tab.label}
            </button>
          ))}
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6 custom-scrollbar">
          {/* TAB 1: BASIC INFO */}
          {activeTab === 'basic' && (
            <div className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="sm:col-span-2">
                  <label className={labelClass}>Product Name *</label>
                  <input
                    type="text"
                    value={form.name}
                    onChange={(e) => updateField('name', e.target.value)}
                    placeholder="e.g. Lorenz 3+1+1 Seater Sofa Set"
                    className={inputClass}
                  />
                </div>
                <div className="sm:col-span-2">
                  <label className={labelClass}>Subtitle / Short Description</label>
                  <input
                    type="text"
                    value={form.subtitle}
                    onChange={(e) => updateField('subtitle', e.target.value)}
                    placeholder="Short product highlight description"
                    className={inputClass}
                  />
                </div>
                <div>
                  <label className={labelClass}>Product SKU / ID *</label>
                  <input
                    type="text"
                    value={form.id}
                    onChange={(e) => updateField('id', e.target.value)}
                    placeholder="PRD-101"
                    className={inputClass}
                  />
                </div>
                <div>
                  <label className={labelClass}>Slug (auto-generated)</label>
                  <input
                    type="text"
                    value={form.slug || form.name.toLowerCase().replace(/[^a-z0-9]+/g, '-')}
                    onChange={(e) => updateField('slug', e.target.value)}
                    placeholder="product-slug"
                    className={`${inputClass} text-textMuted`}
                  />
                </div>
                <div>
                  <label className={labelClass}>Room Category *</label>
                  <select
                    value={form.room}
                    onChange={(e) => updateField('room', e.target.value)}
                    className={selectClass}
                  >
                    {ROOM_OPTIONS.map((r) => (
                      <option key={r} value={r}>
                        {r} Room
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className={labelClass}>Subcategory in Room *</label>
                  <select
                    value={form.category}
                    onChange={(e) => handleCategoryChange(e.target.value)}
                    className={selectClass}
                  >
                    {PRODUCT_CATEGORIES.map((c) => (
                      <option key={c.value} value={c.value}>
                        {c.label} ({c.room})
                      </option>
                    ))}
                  </select>
                </div>
                <div className="sm:col-span-2">
                  <label className={labelClass}>Child Category / Subtype</label>
                  <input
                    type="text"
                    value={form.childCategory || ''}
                    onChange={(e) => updateField('childCategory', e.target.value)}
                    placeholder="e.g. 3 Seater Sofas / Hydraulic Beds / Nesting Tables"
                    className={inputClass}
                  />
                </div>
                <div>
                  <label className={labelClass}>Promo Badge</label>
                  <select
                    value={form.badge}
                    onChange={(e) => updateField('badge', e.target.value)}
                    className={selectClass}
                  >
                    <option value="">No Badge</option>
                    {BADGE_OPTIONS.map((b) => (
                      <option key={b} value={b}>
                        {b}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="flex items-center pt-6">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={form.inStock}
                      onChange={(e) => updateField('inStock', e.target.checked)}
                      className="w-4 h-4 rounded text-primary focus:ring-primary/20 accent-primary"
                    />
                    <span className="text-xs font-bold text-textColor">In Stock &amp; Available for Order</span>
                  </label>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: PRICING & STOCK */}
          {activeTab === 'pricing' && (
            <div className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className={labelClass}>Selling Price (₹) *</label>
                  <input
                    type="number"
                    value={form.price || ''}
                    onChange={(e) => updateField('price', parseFloat(e.target.value) || 0)}
                    placeholder="24999"
                    className={inputClass}
                  />
                </div>
                <div>
                  <label className={labelClass}>Original MRP (₹)</label>
                  <input
                    type="number"
                    value={form.originalPrice || ''}
                    onChange={(e) => updateField('originalPrice', parseFloat(e.target.value) || 0)}
                    placeholder="49999"
                    className={inputClass}
                  />
                </div>
                <div>
                  <label className={labelClass}>Stock Units *</label>
                  <input
                    type="number"
                    value={form.stock || ''}
                    onChange={(e) => updateField('stock', parseInt(e.target.value) || 0)}
                    placeholder="20"
                    className={inputClass}
                  />
                </div>
                <div>
                  <label className={labelClass}>EMI / Month (₹)</label>
                  <input
                    type="number"
                    value={form.emiPerMonth || ''}
                    onChange={(e) => updateField('emiPerMonth', parseInt(e.target.value) || 0)}
                    placeholder="1199"
                    className={inputClass}
                  />
                </div>
                <div>
                  <label className={labelClass}>Initial Units Sold</label>
                  <input
                    type="number"
                    value={form.unitsSold || ''}
                    onChange={(e) => updateField('unitsSold', parseInt(e.target.value) || 0)}
                    placeholder="120"
                    className={inputClass}
                  />
                </div>
                <div>
                  <label className={labelClass}>Star Rating (1-5)</label>
                  <input
                    type="number"
                    step="0.1"
                    min="1"
                    max="5"
                    value={form.rating || 4.8}
                    onChange={(e) => updateField('rating', parseFloat(e.target.value) || 4.8)}
                    placeholder="4.8"
                    className={inputClass}
                  />
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: MEDIA */}
          {activeTab === 'media' && (
            <div className="space-y-4">
              <div>
                <label className={labelClass}>Primary Product Image URL</label>
                <input
                  type="text"
                  value={form.imageUrl}
                  onChange={(e) => updateField('imageUrl', e.target.value)}
                  placeholder="https://images.unsplash.com/..."
                  className={inputClass}
                />
              </div>
              <div>
                <label className={labelClass}>Secondary Image URL (Hover state)</label>
                <input
                  type="text"
                  value={form.secondaryImageUrl || ''}
                  onChange={(e) => updateField('secondaryImageUrl', e.target.value)}
                  placeholder="https://images.unsplash.com/..."
                  className={inputClass}
                />
              </div>

              <div>
                <label className={labelClass}>Additional Gallery Images</label>
                <div className="flex gap-2 mb-3">
                  <input
                    type="text"
                    value={newImageUrl}
                    onChange={(e) => setNewImageUrl(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addImage())}
                    placeholder="Paste image URL and click Add"
                    className={`${inputClass} flex-1`}
                  />
                  <button
                    onClick={addImage}
                    className="px-3 py-2 rounded-xl bg-primary text-white text-xs font-bold hover:bg-primary-hover shrink-0 flex items-center gap-1"
                  >
                    <Plus size={14} /> Add
                  </button>
                </div>

                <div className="grid grid-cols-3 sm:grid-cols-4 gap-3">
                  {form.imageUrl && (
                    <div className="relative rounded-xl border border-primary/40 bg-bgColor overflow-hidden aspect-square flex items-center justify-center group">
                      <img src={form.imageUrl} alt="Primary" className="w-full h-full object-cover" />
                      <span className="absolute bottom-1 left-1 text-[9px] font-bold px-1.5 py-0.5 rounded bg-primary text-white">
                        Primary
                      </span>
                    </div>
                  )}
                  {form.images.map((img, idx) => (
                    <div
                      key={idx}
                      className="relative rounded-xl border border-borderColor bg-bgColor overflow-hidden aspect-square flex items-center justify-center group"
                    >
                      <img src={img} alt={`Gallery ${idx}`} className="w-full h-full object-cover" />
                      <button
                        onClick={() => removeImage(idx)}
                        className="absolute top-1 right-1 p-1 rounded-md bg-red-500 text-white opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <Trash2 size={12} />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* TAB 4: SPECS */}
          {activeTab === 'specs' && (
            <div className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className={labelClass}>Material</label>
                  <input
                    type="text"
                    value={form.material}
                    onChange={(e) => updateField('material', e.target.value)}
                    placeholder="Solid Sheesham Wood / Velvet"
                    className={inputClass}
                  />
                </div>
                <div>
                  <label className={labelClass}>Finish / Color</label>
                  <input
                    type="text"
                    value={form.finish}
                    onChange={(e) => updateField('finish', e.target.value)}
                    placeholder="Honey Teak / Forest Green"
                    className={inputClass}
                  />
                </div>
                <div>
                  <label className={labelClass}>Dimensions (L x W x H)</label>
                  <input
                    type="text"
                    value={form.dimensions}
                    onChange={(e) => updateField('dimensions', e.target.value)}
                    placeholder="78L x 34W x 34H inches"
                    className={inputClass}
                  />
                </div>
                <div>
                  <label className={labelClass}>Size / Seating Capacity</label>
                  <input
                    type="text"
                    value={form.seatingCapacity || ''}
                    onChange={(e) => updateField('seatingCapacity', e.target.value)}
                    placeholder="3 Seater / King Size / 4 Seater"
                    className={inputClass}
                  />
                </div>
                <div>
                  <label className={labelClass}>Storage Type</label>
                  <input
                    type="text"
                    value={form.storageType || ''}
                    onChange={(e) => updateField('storageType', e.target.value)}
                    placeholder="Without Storage / Hydraulic / Drawer"
                    className={inputClass}
                  />
                </div>
                <div>
                  <label className={labelClass}>Delivery Timeframe</label>
                  <input
                    type="text"
                    value={form.deliveryDays}
                    onChange={(e) => updateField('deliveryDays', e.target.value)}
                    placeholder="3-5 Days"
                    className={inputClass}
                  />
                </div>
                <div>
                  <label className={labelClass}>Warranty (Years)</label>
                  <input
                    type="number"
                    value={form.warrantyYears || ''}
                    onChange={(e) => updateField('warrantyYears', parseInt(e.target.value) || 0)}
                    placeholder="5"
                    className={inputClass}
                  />
                </div>
              </div>
            </div>
          )}

          {/* TAB 5: FEATURES */}
          {activeTab === 'features' && (
            <div className="space-y-4">
              <div>
                <label className={labelClass}>Product Key Features & Highlights</label>
                <div className="flex gap-2 mb-3">
                  <input
                    type="text"
                    value={newFeature}
                    onChange={(e) => setNewFeature(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addFeature())}
                    placeholder="e.g. Solid Sheesham Hardwood with Termite Resistance"
                    className={`${inputClass} flex-1`}
                  />
                  <button
                    onClick={addFeature}
                    className="px-3 py-2 rounded-xl bg-primary text-white text-xs font-bold hover:bg-primary-hover shrink-0 flex items-center gap-1"
                  >
                    <Plus size={14} /> Add
                  </button>
                </div>

                {form.features.length > 0 ? (
                  <div className="space-y-2">
                    {form.features.map((feature, idx) => (
                      <div
                        key={idx}
                        className="flex items-center justify-between px-3.5 py-2.5 rounded-xl bg-bgColor border border-borderColor group"
                      >
                        <div className="flex items-center gap-2">
                          <Tag size={12} className="text-primary shrink-0" />
                          <span className="text-xs text-textColor font-medium">{feature}</span>
                        </div>
                        <button
                          onClick={() => removeFeature(idx)}
                          className="p-1 rounded-lg text-textMuted opacity-0 group-hover:opacity-100 hover:text-red-500 transition-all"
                        >
                          <Trash2 size={13} />
                        </button>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8 text-textMuted bg-bgColor/40 rounded-xl border border-dashed border-borderColor">
                    <Sparkles size={24} className="mx-auto mb-2 opacity-40" />
                    <p className="text-xs">No highlights added yet.</p>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* TAB 6: SEO & META INFORMATION */}
          {activeTab === 'seo' && (
            <div className="space-y-5">
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className={labelClass}>SEO Meta Title</label>
                  <span className="text-[10px] text-textMuted font-mono">
                    {(form.meta_title || form.name).length} / 60 chars
                  </span>
                </div>
                <input
                  type="text"
                  value={form.meta_title || ''}
                  onChange={(e) => updateField('meta_title', e.target.value)}
                  placeholder={`${form.name || 'Product Name'} | Buy Online at Urbn Furnish`}
                  className={inputClass}
                />
                <p className="text-[10px] text-textMuted mt-1">
                  Appears in browser tabs and as the main clickable headline in Google search results.
                </p>
              </div>

              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className={labelClass}>SEO Meta Description *</label>
                  <span
                    className={`text-[10px] font-mono ${
                      (form.meta_description || '').length > 160
                        ? 'text-amber-500 font-bold'
                        : 'text-textMuted'
                    }`}
                  >
                    {(form.meta_description || '').length} / 160 chars (Recommended 140-160)
                  </span>
                </div>
                <textarea
                  rows={3}
                  value={form.meta_description || ''}
                  onChange={(e) => updateField('meta_description', e.target.value)}
                  placeholder="Compelling summary for search engines: Buy luxury Solid Wood Furniture online at Urbn Furnish with 5-year warranty, free shipping & easy EMI."
                  className={`${inputClass} resize-none`}
                />
              </div>

              {/* Meta Keywords Pill Editor */}
              <div>
                <label className={labelClass}>SEO Meta Keys &amp; Tags</label>
                <div className="flex gap-2 mb-2.5">
                  <input
                    type="text"
                    value={newKeyword}
                    onChange={(e) => setNewKeyword(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addKeyword())}
                    placeholder="Add search keyword and press Enter (e.g. solid wood sofa)..."
                    className={`${inputClass} flex-1`}
                  />
                  <button
                    type="button"
                    onClick={addKeyword}
                    className="px-3.5 py-2 rounded-xl bg-primary text-white text-xs font-bold hover:bg-primary-hover shrink-0 flex items-center gap-1"
                  >
                    <Plus size={14} />
                    <span>Add Key</span>
                  </button>
                </div>

                <div className="flex flex-wrap gap-1.5 min-h-[38px] p-2.5 bg-bgColor rounded-xl border border-borderColor">
                  {(form.meta_keywords || []).length === 0 ? (
                    <span className="text-xs text-textMuted/60 italic">
                      No meta keywords added. Add target keywords for SEO rank.
                    </span>
                  ) : (
                    (form.meta_keywords || []).map((kw, idx) => (
                      <span
                        key={idx}
                        className="px-2.5 py-1 rounded-lg bg-surfaceColor border border-borderColor text-xs font-semibold text-textColor flex items-center gap-1.5 shadow-xs"
                      >
                        <Tag size={11} className="text-primary" />
                        <span>{kw}</span>
                        <button
                          type="button"
                          onClick={() => removeKeyword(kw)}
                          className="text-textMuted hover:text-red-500 transition-colors ml-0.5"
                        >
                          <X size={12} />
                        </button>
                      </span>
                    ))
                  )}
                </div>
              </div>

              {/* Google Search Result Preview Card */}
              <div className="p-4 rounded-xl bg-bgColor/80 border border-borderColor space-y-2">
                <div className="flex items-center gap-2">
                  <Globe size={14} className="text-primary" />
                  <span className="text-xs font-bold text-textColor">Google Search Preview</span>
                </div>

                <div className="p-3.5 rounded-xl bg-surfaceColor border border-borderColor/60 space-y-1">
                  <div className="flex items-center gap-1.5 text-[11px] text-textMuted">
                    <span className="text-emerald-600 font-medium">https://urbnfurnish.com</span>
                    <span>&rsaquo;</span>
                    <span>products</span>
                    <span>&rsaquo;</span>
                    <span className="text-textMuted font-mono">
                      {form.slug || 'product-slug'}
                    </span>
                  </div>
                  <h4 className="text-sm font-semibold text-blue-600 hover:underline cursor-pointer leading-tight">
                    {form.meta_title || `${form.name || 'Product Title'} | Urbn Furnish`}
                  </h4>
                  <p className="text-xs text-textMuted line-clamp-2 leading-relaxed">
                    {form.meta_description ||
                      form.subtitle ||
                      'Discover premium handcrafted furniture made with seasoned solid wood at Urbn Furnish. Fast delivery and easy returns.'}
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between px-6 py-4 border-t border-borderColor shrink-0">
          <p className="text-[10px] text-textMuted">* Required fields</p>
          <div className="flex items-center gap-3">
            <button
              onClick={onCancel}
              className="px-4 py-2.5 rounded-xl bg-bgColor border border-borderColor text-xs font-semibold text-textColor hover:bg-sidebarHover transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleSubmit}
              disabled={!form.name || form.price <= 0}
              className="px-5 py-2.5 rounded-xl bg-primary text-white text-xs font-bold hover:bg-primary-hover transition-colors shadow-sm shadow-primary/20 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isEditing ? 'Update Product' : 'Save & Publish Product'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
