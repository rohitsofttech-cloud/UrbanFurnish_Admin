'use client';

import React, { useState, useEffect, useMemo } from 'react';
import AdminLayout from '../common/AdminLayout';
import {
  FileText,
  Plus,
  Search,
  Printer,
  Trash2,
  Calendar,
  User,
  ArrowLeft,
  CheckCircle2,
  Eye,
  IndianRupee,
  Receipt,
  Download,
} from 'lucide-react';
import {
  Quotation,
  QuotationItem,
  ExtraCharge,
  QuotationClient,
  SEED_QUOTATIONS,
  getStoredQuotations,
  saveStoredQuotations,
  generateQuotationNo,
  computeQuotationTotals,
  DEFAULT_TERMS,
} from '@/lib/quotationStore';
import { getAllProducts, AdminProduct } from '@/lib/productData';
import { printQuotation } from './components/QuotationPrint';
import ClientDetailsSection from './components/ClientDetailsSection';
import ItemsTable from './components/ItemsTable';
import ChargesSection from './components/ChargesSection';
import TotalsPanel from './components/TotalsPanel';
import TermsSection from './components/TermsSection';
import ProductSearchModal from './components/ProductSearchModal';
import CustomItemModal from './components/CustomItemModal';
import toast from 'react-hot-toast';

export default function QuotationPage() {
  const [quotations, setQuotations] = useState<Quotation[]>(SEED_QUOTATIONS);
  const [products, setProducts] = useState<AdminProduct[]>([]);
  const [search, setSearch] = useState('');
  const [isCreating, setIsCreating] = useState(false);
  const [viewingQuotation, setViewingQuotation] = useState<Quotation | null>(null);

  // Modals inside creation mode
  const [showProductModal, setShowProductModal] = useState(false);
  const [showCustomModal, setShowCustomModal] = useState(false);

  // Form State
  const [quotationNo, setQuotationNo] = useState('');
  const [quotationDate, setQuotationDate] = useState('');
  const [expiryDate, setExpiryDate] = useState('');
  const [driverNumber, setDriverNumber] = useState('');
  const [billTo, setBillTo] = useState<QuotationClient>({
    name: '',
    address: '',
    placeOfSupply: '',
  });
  const [shipTo, setShipTo] = useState<QuotationClient>({
    name: '',
    address: '',
    placeOfSupply: '',
  });
  const [items, setItems] = useState<QuotationItem[]>([]);
  const [packagingCharges, setPackagingCharges] = useState<number>(0);
  const [extraCharges, setExtraCharges] = useState<ExtraCharge[]>([]);
  const [terms, setTerms] = useState(DEFAULT_TERMS);
  const [notes, setNotes] = useState('');

  // Load initial data
  useEffect(() => {
    setQuotations(getStoredQuotations());
    setProducts(getAllProducts());
  }, []);

  // Filtered quotations list
  const filteredQuotations = useMemo(() => {
    return quotations.filter((q) => {
      const query = search.toLowerCase();
      return (
        q.quotationNo.toLowerCase().includes(query) ||
        q.billTo.name.toLowerCase().includes(query) ||
        q.billTo.address.toLowerCase().includes(query) ||
        (q.driverNumber && q.driverNumber.toLowerCase().includes(query))
      );
    });
  }, [quotations, search]);

  // Totals calculated dynamically for the active form
  const totals = useMemo(() => {
    return computeQuotationTotals(items, packagingCharges, extraCharges);
  }, [items, packagingCharges, extraCharges]);

  // Reset and initialize form
  const handleStartCreate = () => {
    const today = new Date().toISOString().split('T')[0];
    const exp = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];

    setQuotationNo(generateQuotationNo(quotations));
    setQuotationDate(today);
    setExpiryDate(exp);
    setDriverNumber('');
    setBillTo({ name: '', address: '', placeOfSupply: 'Maharashtra' });
    setShipTo({ name: '', address: '', placeOfSupply: 'Maharashtra' });
    setItems([]);
    setPackagingCharges(0);
    setExtraCharges([]);
    setTerms(DEFAULT_TERMS);
    setNotes('');

    setIsCreating(true);
    setViewingQuotation(null);
  };

  // Item modifications
  const handleItemChange = (index: number, updated: QuotationItem) => {
    setItems((prev) => {
      const next = [...prev];
      next[index] = updated;
      return next;
    });
  };

  const handleItemRemove = (index: number) => {
    setItems((prev) => prev.filter((_, i) => i !== index));
  };

  const handleAddItem = (item: QuotationItem) => {
    setItems((prev) => [...prev, item]);
    toast.success(`Added ${item.name}`);
  };

  // Save quotation
  const handleSaveQuotation = (e: React.FormEvent) => {
    e.preventDefault();

    if (!billTo.name.trim()) {
      toast.error('Please enter Bill To Client Name');
      return;
    }
    if (items.length === 0) {
      toast.error('Please add at least one item to the quotation');
      return;
    }

    const newQuotation: Quotation = {
      id: `QUO-${Date.now()}`,
      quotationNo: quotationNo.trim() || generateQuotationNo(quotations),
      quotationDate,
      expiryDate,
      billTo,
      shipTo: shipTo.name.trim() ? shipTo : billTo,
      driverNumber: driverNumber.trim(),
      items,
      packagingCharges,
      extraCharges,
      subtotal: totals.subtotal,
      totalTaxAmount: totals.totalTaxAmount,
      taxableAmount: totals.taxableAmount,
      cgst: totals.cgst,
      sgst: totals.sgst,
      grandTotal: totals.grandTotal,
      termsAndConditions: terms,
      notes,
      createdAt: new Date().toISOString(),
    };

    const updated = [newQuotation, ...quotations];
    setQuotations(updated);
    saveStoredQuotations(updated);
    toast.success(`Quotation #${newQuotation.quotationNo} generated successfully!`);
    setIsCreating(false);
    setViewingQuotation(newQuotation);
  };

  const handleDeleteQuotation = (id: string, no: string) => {
    if (confirm(`Are you sure you want to delete Quotation #${no}?`)) {
      const updated = quotations.filter((q) => q.id !== id);
      setQuotations(updated);
      saveStoredQuotations(updated);
      if (viewingQuotation?.id === id) setViewingQuotation(null);
      toast.success(`Quotation #${no} deleted`);
    }
  };

  return (
    <AdminLayout>
      <div className="space-y-6 sm:space-y-8 animate-fadeIn">
        {/* Modals */}
        {showProductModal && (
          <ProductSearchModal
            products={products}
            onAdd={handleAddItem}
            onClose={() => setShowProductModal(false)}
          />
        )}

        {showCustomModal && (
          <CustomItemModal
            onAdd={handleAddItem}
            onClose={() => setShowCustomModal(false)}
          />
        )}

        {/* ── View / Print Details Modal ── */}
        {viewingQuotation && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={() => setViewingQuotation(null)} />
            <div className="relative w-full max-w-4xl max-h-[90vh] flex flex-col rounded-2xl bg-surfaceColor border border-borderColor shadow-2xl overflow-hidden animate-fadeIn">
              <div className="flex items-center justify-between px-6 py-4 border-b border-borderColor bg-surfaceColor">
                <div>
                  <h2 className="text-base font-black text-textColor">
                    Quotation #{viewingQuotation.quotationNo} Preview
                  </h2>
                  <p className="text-xs text-textMuted font-semibold">
                    Client: {viewingQuotation.billTo.name} • {viewingQuotation.quotationDate}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => printQuotation(viewingQuotation)}
                    className="px-4 py-2 rounded-xl bg-primary text-white text-xs font-bold hover:bg-primary-hover flex items-center gap-1.5 transition-colors shadow-xs shadow-primary/30"
                  >
                    <Printer size={15} />
                    <span>Print Quotation</span>
                  </button>
                  <button
                    onClick={() => setViewingQuotation(null)}
                    className="p-2 rounded-xl hover:bg-bgColor text-textMuted transition-colors font-bold text-sm"
                  >
                    ✕
                  </button>
                </div>
              </div>

              <div className="flex-1 overflow-y-auto p-6 space-y-6">
                <div className="grid grid-cols-3 gap-4 p-4 rounded-xl bg-bgColor/50 border border-borderColor text-xs">
                  <div>
                    <span className="font-bold text-textMuted uppercase text-[10px] block">Bill To</span>
                    <span className="font-black text-textColor text-sm">{viewingQuotation.billTo.name}</span>
                    <p className="text-textMuted mt-1">{viewingQuotation.billTo.address}</p>
                    <p className="text-textMuted font-semibold mt-0.5">Supply: {viewingQuotation.billTo.placeOfSupply}</p>
                  </div>
                  <div>
                    <span className="font-bold text-textMuted uppercase text-[10px] block">Ship To</span>
                    <span className="font-black text-textColor text-sm">{viewingQuotation.shipTo.name}</span>
                    <p className="text-textMuted mt-1">{viewingQuotation.shipTo.address}</p>
                  </div>
                  <div>
                    <span className="font-bold text-textMuted uppercase text-[10px] block">Details</span>
                    <p className="text-textColor font-bold mt-1">Date: {viewingQuotation.quotationDate}</p>
                    <p className="text-textMuted font-semibold">Expiry: {viewingQuotation.expiryDate}</p>
                    <p className="text-textMuted font-semibold">Driver: {viewingQuotation.driverNumber || 'N/A'}</p>
                  </div>
                </div>

                {/* Items */}
                <div className="rounded-xl border border-borderColor overflow-hidden">
                  <table className="w-full text-xs text-left">
                    <thead className="bg-bgColor border-b border-borderColor font-black text-textMuted uppercase text-[10px]">
                      <tr>
                        <th className="p-3 text-center">#</th>
                        <th className="p-3">Item</th>
                        <th className="p-3 text-center">Qty</th>
                        <th className="p-3 text-right">Rate</th>
                        <th className="p-3 text-right">Tax</th>
                        <th className="p-3 text-right">Amount</th>
                      </tr>
                    </thead>
                    <tbody>
                      {viewingQuotation.items.map((it, idx) => (
                        <tr key={it.id || idx} className="border-b border-borderColor/60">
                          <td className="p-3 text-center text-textMuted">{idx + 1}</td>
                          <td className="p-3 font-bold text-textColor">
                            <div className="flex items-center gap-2.5">
                              {it.imageUrl ? (
                                <img src={it.imageUrl} alt={it.name} className="w-8 h-8 rounded-lg object-cover border border-borderColor flex-shrink-0" />
                              ) : (
                                <div className="w-8 h-8 rounded-lg bg-bgColor border border-borderColor flex items-center justify-center text-sm flex-shrink-0">🪑</div>
                              )}
                              <span>{it.name}</span>
                            </div>
                          </td>
                          <td className="p-3 text-center font-bold">{it.qty} {it.qtyUnit}</td>
                          <td className="p-3 text-right">₹{it.rate.toLocaleString('en-IN')}</td>
                          <td className="p-3 text-right">₹{it.taxAmount.toLocaleString('en-IN')} ({it.gstPercent}%)</td>
                          <td className="p-3 text-right font-black">₹{it.amount.toLocaleString('en-IN')}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* Totals Summary */}
                <div className="flex justify-end">
                  <div className="w-72 p-4 rounded-xl bg-bgColor/50 border border-borderColor space-y-1.5 text-xs">
                    {viewingQuotation.packagingCharges > 0 && (
                      <div className="flex justify-between">
                        <span className="text-textMuted">Packing Charges</span>
                        <span className="font-bold">₹{viewingQuotation.packagingCharges.toLocaleString('en-IN')}</span>
                      </div>
                    )}
                    <div className="flex justify-between">
                      <span className="text-textMuted">Taxable Amount</span>
                      <span className="font-bold">₹{viewingQuotation.taxableAmount.toLocaleString('en-IN')}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-textMuted">CGST</span>
                      <span className="font-bold">₹{viewingQuotation.cgst.toLocaleString('en-IN')}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-textMuted">SGST</span>
                      <span className="font-bold">₹{viewingQuotation.sgst.toLocaleString('en-IN')}</span>
                    </div>
                    <div className="pt-2 border-t border-borderColor flex justify-between font-black text-sm text-primary">
                      <span>Total Amount</span>
                      <span>₹{viewingQuotation.grandTotal.toLocaleString('en-IN')}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ── CREATE NEW QUOTATION FORM ── */}
        {isCreating ? (
          <form onSubmit={handleSaveQuotation} className="space-y-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => setIsCreating(false)}
                  className="p-2.5 rounded-xl border border-borderColor hover:bg-surfaceColor transition-colors text-textMuted hover:text-textColor"
                >
                  <ArrowLeft size={16} />
                </button>
                <div>
                  <h1 className="text-2xl font-black text-textColor tracking-tight">
                    Create Custom Quotation
                  </h1>
                  <p className="text-xs text-textMuted">
                    Generate itemized estimates with packaging charges and GST calculations
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => setIsCreating(false)}
                  className="px-4 py-2.5 rounded-xl border border-borderColor text-xs font-bold text-textColor hover:bg-surfaceColor transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-xl bg-primary text-white text-xs font-bold hover:bg-primary-hover transition-colors shadow-xs shadow-primary/30 flex items-center gap-2"
                >
                  <CheckCircle2 size={16} />
                  <span>Save Quotation</span>
                </button>
              </div>
            </div>

            {/* Client & Quotation Meta Details */}
            <ClientDetailsSection
              quotationNo={quotationNo}
              quotationDate={quotationDate}
              expiryDate={expiryDate}
              driverNumber={driverNumber}
              billTo={billTo}
              shipTo={shipTo}
              onQuotationNoChange={setQuotationNo}
              onQuotationDateChange={setQuotationDate}
              onExpiryDateChange={setExpiryDate}
              onDriverNumberChange={setDriverNumber}
              onBillToChange={setBillTo}
              onShipToChange={setShipTo}
            />

            {/* Line Items Table */}
            <ItemsTable
              items={items}
              onItemChange={handleItemChange}
              onItemRemove={handleItemRemove}
              onOpenProductModal={() => setShowProductModal(true)}
              onOpenCustomModal={() => setShowCustomModal(true)}
            />

            {/* Charges and Totals Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
              <ChargesSection
                packagingCharges={packagingCharges}
                onPackagingChargesChange={setPackagingCharges}
                extraCharges={extraCharges}
                onExtraChargesChange={setExtraCharges}
              />

              <TotalsPanel
                taxableAmount={totals.taxableAmount}
                cgst={totals.cgst}
                sgst={totals.sgst}
                totalTaxAmount={totals.totalTaxAmount}
                packagingCharges={packagingCharges}
                extraChargesTotal={extraCharges.reduce((s, c) => s + c.amount, 0)}
                grandTotal={totals.grandTotal}
              />
            </div>

            {/* Terms and Notes */}
            <TermsSection
              terms={terms}
              onTermsChange={setTerms}
              notes={notes}
              onNotesChange={setNotes}
            />
          </form>
        ) : (
          /* ── QUOTATION LIST VIEW ── */
          <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <div className="flex items-center gap-2">
                  <h1 className="text-2xl font-black text-textColor tracking-tight">
                    Custom Quotations
                  </h1>
                  <span className="text-[11px] font-bold px-2 py-0.5 rounded-md bg-primary/10 text-primary border border-primary/20">
                    Estimates &amp; Proforma
                  </span>
                </div>
                <p className="text-xs sm:text-sm text-textMuted mt-0.5">
                  Generate, manage, and print customized client quotations with dynamic GST &amp; units.
                </p>
              </div>

              <div className="flex items-center gap-2.5">
                <button
                  onClick={handleStartCreate}
                  className="px-4 py-2.5 rounded-xl bg-primary text-white hover:bg-primary-hover font-bold text-xs flex items-center gap-2 shadow-xs shadow-primary/30"
                >
                  <Plus size={16} />
                  <span>Create New Quotation</span>
                </button>
              </div>
            </div>

            {/* KPI Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="p-5 rounded-2xl bg-surfaceColor border border-borderColor shadow-xs">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-textMuted uppercase tracking-wider">
                    Total Quotations
                  </span>
                  <div className="p-2 rounded-xl bg-primary/10 text-primary">
                    <Receipt size={16} />
                  </div>
                </div>
                <p className="text-2xl font-black text-textColor mt-2">{quotations.length}</p>
              </div>

              <div className="p-5 rounded-2xl bg-surfaceColor border border-borderColor shadow-xs">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-textMuted uppercase tracking-wider">
                    Total Value Quoted
                  </span>
                  <div className="p-2 rounded-xl bg-emerald-500/10 text-emerald-600">
                    <IndianRupee size={16} />
                  </div>
                </div>
                <p className="text-2xl font-black text-textColor mt-2">
                  ₹
                  {quotations
                    .reduce((sum, q) => sum + (q.grandTotal || 0), 0)
                    .toLocaleString('en-IN', { maximumFractionDigits: 0 })}
                </p>
              </div>

              <div className="p-5 rounded-2xl bg-surfaceColor border border-borderColor shadow-xs">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-textMuted uppercase tracking-wider">
                    Active Clients
                  </span>
                  <div className="p-2 rounded-xl bg-blue-500/10 text-blue-600">
                    <User size={16} />
                  </div>
                </div>
                <p className="text-2xl font-black text-textColor mt-2">
                  {new Set(quotations.map((q) => q.billTo.name)).size}
                </p>
              </div>
            </div>

            {/* Search & Filter Bar */}
            <div className="p-4 rounded-2xl bg-surfaceColor border border-borderColor flex items-center justify-between gap-4">
              <div className="relative flex-1 max-w-md">
                <Search size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-textMuted" />
                <input
                  type="text"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Search by Quotation #, Client, Place of Supply..."
                  className="w-full pl-9 pr-4 py-2 rounded-xl border border-borderColor bg-bgColor text-textColor text-xs focus:outline-none focus:ring-2 focus:ring-primary/30"
                />
              </div>
            </div>

            {/* Quotations Table */}
            <div className="rounded-2xl bg-surfaceColor border border-borderColor overflow-hidden shadow-xs">
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-bgColor/75 border-b border-borderColor text-[11px] font-black text-textMuted uppercase tracking-wider">
                      <th className="px-5 py-3.5">Quotation No.</th>
                      <th className="px-5 py-3.5">Date / Expiry</th>
                      <th className="px-5 py-3.5">Client (Bill To)</th>
                      <th className="px-5 py-3.5 text-center">Items</th>
                      <th className="px-5 py-3.5 text-right">Taxable</th>
                      <th className="px-5 py-3.5 text-right">Grand Total</th>
                      <th className="px-5 py-3.5 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredQuotations.length === 0 ? (
                      <tr>
                        <td colSpan={7} className="py-16 text-center text-textMuted">
                          <p className="text-sm font-bold">No quotations found</p>
                          <p className="text-xs mt-1">Create your first quotation by clicking above</p>
                        </td>
                      </tr>
                    ) : (
                      filteredQuotations.map((q) => (
                        <tr key={q.id} className="border-b border-borderColor/60 hover:bg-bgColor/50 transition-colors">
                          <td className="px-5 py-4">
                            <span className="font-mono font-black text-sm text-textColor">
                              #{q.quotationNo}
                            </span>
                          </td>
                          <td className="px-5 py-4">
                            <div className="text-xs font-bold text-textColor">{q.quotationDate}</div>
                            <div className="text-[10px] text-textMuted font-semibold">Exp: {q.expiryDate}</div>
                          </td>
                          <td className="px-5 py-4">
                            <div className="text-xs font-black text-textColor">{q.billTo.name}</div>
                            <div className="text-[10px] text-textMuted font-medium">{q.billTo.placeOfSupply}</div>
                          </td>
                          <td className="px-5 py-4 text-center">
                            <span className="text-xs font-bold px-2.5 py-1 rounded-md bg-bgColor border border-borderColor text-textMuted">
                              {q.items.length} items
                            </span>
                          </td>
                          <td className="px-5 py-4 text-right text-xs font-bold text-textColor">
                            ₹{q.taxableAmount.toLocaleString('en-IN')}
                          </td>
                          <td className="px-5 py-4 text-right text-sm font-black text-textColor">
                            ₹{q.grandTotal.toLocaleString('en-IN')}
                          </td>
                          <td className="px-5 py-4 text-right">
                            <div className="flex items-center justify-end gap-1.5">
                              <button
                                onClick={() => setViewingQuotation(q)}
                                title="View Details"
                                className="p-2 rounded-lg border border-borderColor hover:bg-bgColor text-textMuted hover:text-textColor transition-colors"
                              >
                                <Eye size={14} />
                              </button>
                              <button
                                onClick={() => printQuotation(q)}
                                title="Print Quotation"
                                className="p-2 rounded-lg bg-primary/10 text-primary hover:bg-primary hover:text-white transition-colors"
                              >
                                <Printer size={14} />
                              </button>
                              <button
                                onClick={() => handleDeleteQuotation(q.id, q.quotationNo)}
                                title="Delete Quotation"
                                className="p-2 rounded-lg border border-borderColor hover:bg-red-50 text-textMuted hover:text-red-500 transition-colors"
                              >
                                <Trash2 size={14} />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}
      </div>
    </AdminLayout>
  );
}
