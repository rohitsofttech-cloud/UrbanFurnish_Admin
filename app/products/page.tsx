'use client';

import React, { useState, useMemo } from 'react';
import Link from 'next/link';
import AdminLayout from '../common/AdminLayout';
import {
  Package,
  Plus,
  Search,
  Filter,
  ArrowUpDown,
  Edit,
  Trash2,
  Upload,
  FileSpreadsheet,
  ChevronDown,
  Eye,
  Star,
  TrendingUp,
  X,
  Factory,
} from 'lucide-react';
import { SEED_PRODUCTS, AdminProduct, PRODUCT_CATEGORIES } from '@/lib/productData';
import ProductFormModal from './ProductFormModal';
import CsvUploadModal from './CsvUploadModal';
import DeleteConfirmModal from './DeleteConfirmModal';
import toast from 'react-hot-toast';

type SortOption = 'sales' | 'price-asc' | 'price-desc' | 'name' | 'stock' | 'newest';

export default function ProductsPage() {
  const [products, setProducts] = useState<AdminProduct[]>(SEED_PRODUCTS);
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [sortBy, setSortBy] = useState<SortOption>('sales');
  const [showCategoryDropdown, setShowCategoryDropdown] = useState(false);
  const [showSortDropdown, setShowSortDropdown] = useState(false);

  // Modal states
  const [showProductForm, setShowProductForm] = useState(false);
  const [editingProduct, setEditingProduct] = useState<AdminProduct | null>(null);
  const [showCsvUpload, setShowCsvUpload] = useState(false);
  const [deletingProduct, setDeletingProduct] = useState<AdminProduct | null>(null);
  const [expandedRow, setExpandedRow] = useState<string | null>(null);

  // Derived: filter & sort
  const filteredProducts = useMemo(() => {
    let list = products.filter((p) => {
      const matchSearch =
        p.name.toLowerCase().includes(search.toLowerCase()) ||
        p.id.toLowerCase().includes(search.toLowerCase()) ||
        p.material.toLowerCase().includes(search.toLowerCase());
      const matchCategory = categoryFilter === 'all' || p.category === categoryFilter;
      return matchSearch && matchCategory;
    });

    switch (sortBy) {
      case 'sales':
        list = [...list].sort((a, b) => b.unitsSold - a.unitsSold);
        break;
      case 'price-asc':
        list = [...list].sort((a, b) => a.price - b.price);
        break;
      case 'price-desc':
        list = [...list].sort((a, b) => b.price - a.price);
        break;
      case 'name':
        list = [...list].sort((a, b) => a.name.localeCompare(b.name));
        break;
      case 'stock':
        list = [...list].sort((a, b) => a.stock - b.stock);
        break;
      case 'newest':
        list = [...list].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
        break;
    }

    return list;
  }, [products, search, categoryFilter, sortBy]);

  // Stats
  const totalProducts = products.length;
  const totalStock = products.reduce((sum, p) => sum + p.stock, 0);
  const lowStockCount = products.filter((p) => p.stock > 0 && p.stock <= 5).length;
  const outOfStockCount = products.filter((p) => p.stock === 0 || !p.inStock).length;

  // CRUD Handlers
  const handleAddProduct = (product: AdminProduct) => {
    setProducts((prev) => [product, ...prev]);
    setShowProductForm(false);
    toast.success(`"${product.name}" added successfully!`);
  };

  const handleEditProduct = (product: AdminProduct) => {
    setProducts((prev) => prev.map((p) => (p.id === editingProduct?.id ? product : p)));
    setEditingProduct(null);
    toast.success(`"${product.name}" updated successfully!`);
  };

  const handleDeleteProduct = () => {
    if (!deletingProduct) return;
    setProducts((prev) => prev.filter((p) => p.id !== deletingProduct.id));
    toast.success(`"${deletingProduct.name}" deleted.`);
    setDeletingProduct(null);
  };

  const handleCsvImport = (importedProducts: AdminProduct[]) => {
    setProducts((prev) => [...importedProducts, ...prev]);
    toast.success(`${importedProducts.length} products imported successfully!`);
  };

  const sortLabels: Record<SortOption, string> = {
    sales: 'Sales',
    'price-asc': 'Price: Low → High',
    'price-desc': 'Price: High → Low',
    name: 'Name A-Z',
    stock: 'Stock Level',
    newest: 'Newest First',
  };

  const getStockBadge = (product: AdminProduct) => {
    if (!product.inStock || product.stock === 0) {
      return (
        <span className="text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-red-500/10 text-red-600 border border-red-500/20">
          Out of stock
        </span>
      );
    }
    if (product.stock <= 5) {
      return (
        <span className="text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-amber-500/10 text-amber-600 border border-amber-500/20">
          {product.stock} in stock
        </span>
      );
    }
    return (
      <span className="text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-600 border border-emerald-500/20">
        {product.stock} in stock
      </span>
    );
  };

  const getCategoryLabel = (value: string) => {
    return PRODUCT_CATEGORIES.find((c) => c.value === value)?.label || value;
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-black text-textColor tracking-tight">Products &amp; Catalog</h1>
            <p className="text-xs sm:text-sm text-textMuted">
              Manage furniture items, variants, stock inventory, and pricing.
            </p>
          </div>
          <div className="flex items-center gap-2 flex-wrap">

            <button
              onClick={() => setShowCsvUpload(true)}
              className="px-4 py-2.5 rounded-xl bg-bgColor border border-borderColor text-textColor hover:bg-sidebarHover hover:border-primary/30 font-bold text-xs flex items-center gap-2 transition-all"
            >
              <FileSpreadsheet size={15} className="text-primary" />
              <span>Upload CSV</span>
            </button>
            <button
              onClick={() => {
                setEditingProduct(null);
                setShowProductForm(true);
              }}
              className="px-4 py-2.5 rounded-xl bg-primary text-white hover:bg-primary-hover font-bold text-xs flex items-center gap-2 shadow-sm shadow-primary/30"
            >
              <Plus size={16} />
              <span>Add New Product</span>
            </button>
          </div>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <div className="p-4 rounded-2xl bg-surfaceColor border border-borderColor">
            <p className="text-[10px] font-bold text-textMuted uppercase tracking-wider mb-1">Total Products</p>
            <p className="text-xl font-black text-textColor">{totalProducts}</p>
          </div>
          <div className="p-4 rounded-2xl bg-surfaceColor border border-borderColor">
            <p className="text-[10px] font-bold text-textMuted uppercase tracking-wider mb-1">Total Stock Units</p>
            <p className="text-xl font-black text-textColor">{totalStock.toLocaleString('en-IN')}</p>
          </div>
          <div className="p-4 rounded-2xl bg-surfaceColor border border-borderColor">
            <p className="text-[10px] font-bold text-textMuted uppercase tracking-wider mb-1">Low Stock</p>
            <p className="text-xl font-black text-amber-600">{lowStockCount}</p>
          </div>
          <div className="p-4 rounded-2xl bg-surfaceColor border border-borderColor">
            <p className="text-[10px] font-bold text-textMuted uppercase tracking-wider mb-1">Out of Stock</p>
            <p className="text-xl font-black text-red-500">{outOfStockCount}</p>
          </div>
        </div>

        {/* Filters and Search */}
        <div className="p-4 rounded-2xl bg-surfaceColor border border-borderColor flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center px-3.5 py-2 bg-bgColor rounded-xl border border-borderColor w-full sm:w-80">
            <Search size={16} className="text-textMuted mr-2" />
            <input
              type="text"
              placeholder="Search by product name, SKU, or tag..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full bg-transparent text-xs text-textColor outline-hidden"
            />
            {search && (
              <button onClick={() => setSearch('')} className="ml-1 text-textMuted hover:text-textColor">
                <X size={14} />
              </button>
            )}
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto">
            {/* Category Filter */}
            <div className="relative">
              <button
                onClick={() => {
                  setShowCategoryDropdown(!showCategoryDropdown);
                  setShowSortDropdown(false);
                }}
                className="px-3 py-2 rounded-xl bg-bgColor border border-borderColor text-xs font-semibold text-textColor flex items-center gap-1.5 hover:bg-sidebarHover transition-colors"
              >
                <Filter size={14} className="text-textMuted" />
                <span>{categoryFilter === 'all' ? 'Category Filter' : getCategoryLabel(categoryFilter)}</span>
                <ChevronDown size={12} className="text-textMuted" />
              </button>
              {showCategoryDropdown && (
                <div className="absolute right-0 top-full mt-1 w-56 bg-surfaceColor rounded-xl border border-borderColor shadow-lg z-20 py-1 max-h-64 overflow-y-auto custom-scrollbar">
                  <button
                    onClick={() => {
                      setCategoryFilter('all');
                      setShowCategoryDropdown(false);
                    }}
                    className={`w-full text-left px-3 py-2 text-xs hover:bg-sidebarHover transition-colors ${categoryFilter === 'all' ? 'font-bold text-primary bg-primary/5' : 'text-textColor'
                      }`}
                  >
                    All Categories
                  </button>
                  {PRODUCT_CATEGORIES.map((cat) => (
                    <button
                      key={cat.value}
                      onClick={() => {
                        setCategoryFilter(cat.value);
                        setShowCategoryDropdown(false);
                      }}
                      className={`w-full text-left px-3 py-2 text-xs hover:bg-sidebarHover transition-colors ${categoryFilter === cat.value ? 'font-bold text-primary bg-primary/5' : 'text-textColor'
                        }`}
                    >
                      {cat.label}
                      <span className="text-textMuted ml-1">({cat.room})</span>
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Sort */}
            <div className="relative">
              <button
                onClick={() => {
                  setShowSortDropdown(!showSortDropdown);
                  setShowCategoryDropdown(false);
                }}
                className="px-3 py-2 rounded-xl bg-bgColor border border-borderColor text-xs font-semibold text-textColor flex items-center gap-1.5 hover:bg-sidebarHover transition-colors"
              >
                <ArrowUpDown size={14} className="text-textMuted" />
                <span>Sort: {sortLabels[sortBy]}</span>
                <ChevronDown size={12} className="text-textMuted" />
              </button>
              {showSortDropdown && (
                <div className="absolute right-0 top-full mt-1 w-48 bg-surfaceColor rounded-xl border border-borderColor shadow-lg z-20 py-1">
                  {(Object.keys(sortLabels) as SortOption[]).map((key) => (
                    <button
                      key={key}
                      onClick={() => {
                        setSortBy(key);
                        setShowSortDropdown(false);
                      }}
                      className={`w-full text-left px-3 py-2 text-xs hover:bg-sidebarHover transition-colors ${sortBy === key ? 'font-bold text-primary bg-primary/5' : 'text-textColor'
                        }`}
                    >
                      {sortLabels[key]}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Products Table */}
        <div className="rounded-2xl bg-surfaceColor border border-borderColor shadow-xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b border-borderColor text-[11px] font-bold text-textMuted uppercase bg-bgColor/30">
                  <th className="px-5 py-3">Product Name</th>
                  <th className="px-5 py-3">Category</th>
                  <th className="px-5 py-3">Price</th>
                  <th className="px-5 py-3">Units Sold</th>
                  <th className="px-5 py-3">Stock Level</th>
                  <th className="px-5 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-borderColor/50">
                {filteredProducts.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-5 py-16 text-center">
                      <Package size={36} className="mx-auto text-textMuted/30 mb-3" />
                      <p className="text-sm font-bold text-textMuted mb-1">No products found</p>
                      <p className="text-xs text-textMuted/70">
                        {search || categoryFilter !== 'all'
                          ? 'Try adjusting your search or filter criteria.'
                          : 'Start by adding products or uploading a CSV file.'}
                      </p>
                    </td>
                  </tr>
                ) : (
                  filteredProducts.map((product) => (
                    <React.Fragment key={product.id}>
                      <tr
                        className="hover:bg-sidebarHover/50 transition-colors cursor-pointer"
                        onClick={() => setExpandedRow(expandedRow === product.id ? null : product.id)}
                      >
                        <td className="px-5 py-3.5">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-lg bg-bgColor border border-borderColor flex items-center justify-center overflow-hidden shrink-0">
                              {product.imageUrl ? (
                                <img
                                  src={product.imageUrl}
                                  alt={product.name}
                                  className="w-full h-full object-cover"
                                />
                              ) : (
                                <Package size={18} className="text-primary" />
                              )}
                            </div>
                            <div className="min-w-0">
                              <span className="font-bold text-xs text-textColor block truncate max-w-[240px]">
                                {product.name}
                              </span>
                              <span className="text-[10px] text-textMuted font-mono">SKU: {product.id}</span>
                              {product.badge && (
                                <span className="ml-2 text-[9px] font-bold px-1.5 py-0.5 rounded bg-primary/10 text-primary">
                                  {product.badge}
                                </span>
                              )}
                            </div>
                          </div>
                        </td>
                        <td className="px-5 py-3.5 text-xs text-textMuted font-medium">
                          {getCategoryLabel(product.category)}
                        </td>
                        <td className="px-5 py-3.5">
                          <div>
                            <span className="text-xs font-bold text-textColor">
                              ₹{product.price.toLocaleString('en-IN')}
                            </span>
                            {product.originalPrice > product.price && (
                              <span className="text-[10px] text-textMuted line-through ml-1.5">
                                ₹{product.originalPrice.toLocaleString('en-IN')}
                              </span>
                            )}
                            {product.discountPercentage > 0 && (
                              <span className="ml-1.5 text-[10px] font-bold text-emerald-600">
                                {product.discountPercentage}% off
                              </span>
                            )}
                          </div>
                        </td>
                        <td className="px-5 py-3.5 text-xs font-semibold text-textColor">
                          {product.unitsSold.toLocaleString('en-IN')} units
                        </td>
                        <td className="px-5 py-3.5">{getStockBadge(product)}</td>
                        <td className="px-5 py-3.5 text-right">
                          <div className="flex items-center justify-end gap-1" onClick={(e) => e.stopPropagation()}>
                            <Link
                              href={`/manufacturing/${encodeURIComponent(product.id)}`}
                              className="p-1.5 rounded-lg text-textMuted hover:text-amber-600 hover:bg-bgColor transition-colors"
                              title="View Manufacturing Spec Sheet"
                            >
                              <Factory size={14} />
                            </Link>
                            <button
                              onClick={() => {
                                setEditingProduct(product);
                                setShowProductForm(false);
                              }}
                              className="p-1.5 rounded-lg text-textMuted hover:text-primary hover:bg-bgColor transition-colors"
                              title="Edit product"
                            >
                              <Edit size={14} />
                            </button>
                            <button
                              onClick={() => setDeletingProduct(product)}
                              className="p-1.5 rounded-lg text-textMuted hover:text-red-500 hover:bg-bgColor transition-colors"
                              title="Delete product"
                            >
                              <Trash2 size={14} />
                            </button>
                          </div>
                        </td>
                      </tr>

                      {/* Expanded Row Detail */}
                      {expandedRow === product.id && (
                        <tr className="bg-bgColor/50">
                          <td colSpan={6} className="px-5 py-4">
                            <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-6 gap-3 text-[11px]">
                              {product.material && (
                                <div>
                                  <span className="text-textMuted font-bold uppercase tracking-wider block mb-0.5">Material</span>
                                  <span className="text-textColor font-medium">{product.material}</span>
                                </div>
                              )}
                              {product.finish && (
                                <div>
                                  <span className="text-textMuted font-bold uppercase tracking-wider block mb-0.5">Finish</span>
                                  <span className="text-textColor font-medium">{product.finish}</span>
                                </div>
                              )}
                              {product.dimensions && (
                                <div>
                                  <span className="text-textMuted font-bold uppercase tracking-wider block mb-0.5">Dimensions</span>
                                  <span className="text-textColor font-medium">{product.dimensions}</span>
                                </div>
                              )}
                              {product.seatingCapacity && (
                                <div>
                                  <span className="text-textMuted font-bold uppercase tracking-wider block mb-0.5">Size/Capacity</span>
                                  <span className="text-textColor font-medium">{product.seatingCapacity}</span>
                                </div>
                              )}
                              {product.deliveryDays && (
                                <div>
                                  <span className="text-textMuted font-bold uppercase tracking-wider block mb-0.5">Delivery</span>
                                  <span className="text-textColor font-medium">{product.deliveryDays}</span>
                                </div>
                              )}
                              {product.warrantyYears && (
                                <div>
                                  <span className="text-textMuted font-bold uppercase tracking-wider block mb-0.5">Warranty</span>
                                  <span className="text-textColor font-medium">{product.warrantyYears} Years</span>
                                </div>
                              )}
                              <div>
                                <span className="text-textMuted font-bold uppercase tracking-wider block mb-0.5">Rating</span>
                                <span className="text-textColor font-medium flex items-center gap-1">
                                  <Star size={10} className="text-amber-500 fill-amber-500" />
                                  {product.rating} ({product.reviewCount})
                                </span>
                              </div>
                              {product.emiPerMonth && (
                                <div>
                                  <span className="text-textMuted font-bold uppercase tracking-wider block mb-0.5">EMI/Month</span>
                                  <span className="text-textColor font-medium">₹{product.emiPerMonth.toLocaleString('en-IN')}</span>
                                </div>
                              )}
                            </div>
                            {/* Features */}
                            {product.features && product.features.length > 0 && (
                              <div className="mt-3 pt-3 border-t border-borderColor/50">
                                <span className="text-[10px] text-textMuted font-bold uppercase tracking-wider block mb-1.5">Features</span>
                                <div className="flex flex-wrap gap-1.5">
                                  {product.features.map((f, idx) => (
                                    <span
                                      key={idx}
                                      className="px-2 py-0.5 rounded-md bg-primary/5 text-primary text-[10px] font-medium border border-primary/10"
                                    >
                                      {f}
                                    </span>
                                  ))}
                                </div>
                              </div>
                            )}

                            {/* SEO Meta Information */}
                            {(product.meta_description || (product.meta_keywords && product.meta_keywords.length > 0)) && (
                              <div className="mt-3 pt-3 border-t border-borderColor/50 space-y-1.5 bg-surfaceColor/50 p-3 rounded-xl border border-borderColor">
                                <div className="flex items-center gap-2">
                                  <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-600 bg-emerald-500/10 px-1.5 py-0.5 rounded">
                                    SEO Meta Info
                                  </span>
                                  {product.childCategory && (
                                    <span className="text-[10px] font-semibold text-textMuted">
                                      Child Category: <strong className="text-textColor">{product.childCategory}</strong>
                                    </span>
                                  )}
                                </div>
                                {product.meta_description && (
                                  <p className="text-[11px] text-textMuted">
                                    <strong className="text-textColor">Meta Description:</strong> {product.meta_description}
                                  </p>
                                )}
                                {product.meta_keywords && product.meta_keywords.length > 0 && (
                                  <div className="flex items-center gap-1.5 flex-wrap pt-0.5">
                                    <span className="text-[10px] font-bold text-textMuted uppercase">Keys:</span>
                                    {product.meta_keywords.map((kw, idx) => (
                                      <span key={idx} className="text-[10px] px-1.5 py-0.5 rounded bg-bgColor text-textColor border border-borderColor font-mono">
                                        #{kw}
                                      </span>
                                    ))}
                                  </div>
                                )}
                              </div>
                            )}

                            {product.subtitle && (
                              <p className="mt-2 text-[11px] text-textMuted italic">{product.subtitle}</p>
                            )}
                          </td>
                        </tr>
                      )}
                    </React.Fragment>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* Table Footer */}
          {filteredProducts.length > 0 && (
            <div className="px-5 py-3 border-t border-borderColor bg-bgColor/30 flex items-center justify-between">
              <p className="text-[11px] text-textMuted">
                Showing <span className="font-bold text-textColor">{filteredProducts.length}</span> of{' '}
                <span className="font-bold text-textColor">{totalProducts}</span> products
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Close dropdowns on outside click */}
      {(showCategoryDropdown || showSortDropdown) && (
        <div
          className="fixed inset-0 z-10"
          onClick={() => {
            setShowCategoryDropdown(false);
            setShowSortDropdown(false);
          }}
        />
      )}

      {/* Modals */}
      {showProductForm && (
        <ProductFormModal
          product={null}
          onSave={handleAddProduct}
          onCancel={() => setShowProductForm(false)}
        />
      )}

      {editingProduct && (
        <ProductFormModal
          product={editingProduct}
          onSave={handleEditProduct}
          onCancel={() => setEditingProduct(null)}
        />
      )}

      {showCsvUpload && (
        <CsvUploadModal
          onImport={handleCsvImport}
          onCancel={() => setShowCsvUpload(false)}
        />
      )}

      {deletingProduct && (
        <DeleteConfirmModal
          product={deletingProduct}
          onConfirm={handleDeleteProduct}
          onCancel={() => setDeletingProduct(null)}
        />
      )}
    </AdminLayout>
  );
}
