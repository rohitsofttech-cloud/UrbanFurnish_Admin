'use client';

import React, { useState, useEffect, useMemo, useRef } from 'react';
import AdminLayout from '../common/AdminLayout';
import {
  Receipt,
  Plus,
  Search,
  Filter,
  Download,
  Printer,
  CheckCircle2,
  Clock,
  AlertTriangle,
  RotateCcw,
  Eye,
  FileText,
  IndianRupee,
  Calendar,
  Building,
  User,
  MapPin,
  Trash2,
  Send,
  X,
  CreditCard,
  PlusCircle,
  ExternalLink,
} from 'lucide-react';
import {
  Invoice,
  InvoiceItem,
  PaymentStatus,
  PaymentMethod,
  COMPANY_DETAILS,
  getStoredInvoices,
  saveStoredInvoices,
  SEED_INVOICES,
} from '@/lib/billingStore';
import PrintableDocumentButton from '../common/PrintableDocument';
import toast from 'react-hot-toast';

export default function BillingPage() {
  const [invoices, setInvoices] = useState<Invoice[]>(SEED_INVOICES);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [methodFilter, setMethodFilter] = useState<string>('all');

  // Modals
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [selectedInvoice, setSelectedInvoice] = useState<Invoice | null>(null);

  // New Invoice Form state
  const [formCustomerName, setFormCustomerName] = useState('');
  const [formCustomerEmail, setFormCustomerEmail] = useState('');
  const [formCustomerPhone, setFormCustomerPhone] = useState('');
  const [formCustomerGst, setFormCustomerGst] = useState('');
  const [formBillingAddress, setFormBillingAddress] = useState('');
  const [formShippingAddress, setFormShippingAddress] = useState('');
  const [formOrderId, setFormOrderId] = useState('');
  const [formPaymentStatus, setFormPaymentStatus] = useState<PaymentStatus>('Paid');
  const [formPaymentMethod, setFormPaymentMethod] = useState<PaymentMethod>('UPI / QR');
  const [formNotes, setFormNotes] = useState('');
  const [formItems, setFormItems] = useState<InvoiceItem[]>([
    {
      id: 'item-1',
      description: 'Solid Sheesham 3-Seater Sofa (Honey Teak)',
      hsnCode: '94016100',
      quantity: 1,
      unitPrice: 24999,
      discountPercentage: 0,
      taxRate: 18,
      taxAmount: 3813.4,
      total: 24999,
    },
  ]);

  // Load from local storage
  useEffect(() => {
    setInvoices(getStoredInvoices());
  }, []);

  // Filtered list
  const filteredInvoices = useMemo(() => {
    return invoices.filter((inv) => {
      const matchSearch =
        inv.invoiceNumber.toLowerCase().includes(search.toLowerCase()) ||
        inv.customerName.toLowerCase().includes(search.toLowerCase()) ||
        inv.customerEmail.toLowerCase().includes(search.toLowerCase()) ||
        (inv.orderId && inv.orderId.toLowerCase().includes(search.toLowerCase()));

      const matchStatus = statusFilter === 'all' || inv.paymentStatus === statusFilter;
      const matchMethod = methodFilter === 'all' || inv.paymentMethod === methodFilter;

      return matchSearch && matchStatus && matchMethod;
    });
  }, [invoices, search, statusFilter, methodFilter]);

  // Financial KPI calculations
  const totalInvoiced = invoices.reduce((sum, inv) => sum + inv.grandTotal, 0);
  const totalCollected = invoices
    .filter((inv) => inv.paymentStatus === 'Paid')
    .reduce((sum, inv) => sum + inv.grandTotal, 0);
  const totalPending = invoices
    .filter((inv) => inv.paymentStatus === 'Pending' || inv.paymentStatus === 'Overdue')
    .reduce((sum, inv) => sum + inv.grandTotal, 0);
  const totalTaxCollected = invoices.reduce((sum, inv) => sum + inv.taxTotal, 0);

  // Status Badge Colors
  const getStatusBadge = (status: PaymentStatus) => {
    switch (status) {
      case 'Paid':
        return 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20';
      case 'Pending':
        return 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20';
      case 'Overdue':
        return 'bg-red-500/10 text-red-600 dark:text-red-400 border-red-500/20';
      case 'Refunded':
        return 'bg-gray-500/10 text-gray-600 border-gray-500/20';
      case 'Draft':
        return 'bg-blue-500/10 text-blue-600 border-blue-500/20';
      default:
        return 'bg-gray-500/10 text-gray-600 border-gray-500/20';
    }
  };

  // Line item handlers in Create Modal
  const addItemLine = () => {
    setFormItems((prev) => [
      ...prev,
      {
        id: `item-${Date.now()}`,
        description: '',
        hsnCode: '94036000',
        quantity: 1,
        unitPrice: 0,
        discountPercentage: 0,
        taxRate: 18,
        taxAmount: 0,
        total: 0,
      },
    ]);
  };

  const updateItemLine = (index: number, field: keyof InvoiceItem, val: string | number) => {
    setFormItems((prev) => {
      const updated = [...prev];
      const target = { ...updated[index], [field]: val };

      const qty = target.quantity || 1;
      const price = target.unitPrice || 0;
      const discPct = target.discountPercentage || 0;
      const taxRate = target.taxRate || 18;

      const discountedPrice = price * (1 - discPct / 100);
      const subtotalItem = discountedPrice * qty;
      const taxItem = (subtotalItem * taxRate) / 100;
      const totalItem = subtotalItem + taxItem;

      target.taxAmount = parseFloat(taxItem.toFixed(2));
      target.total = parseFloat(totalItem.toFixed(2));

      updated[index] = target;
      return updated;
    });
  };

  const removeItemLine = (index: number) => {
    if (formItems.length === 1) {
      toast.error('Invoice must have at least one line item');
      return;
    }
    setFormItems((prev) => prev.filter((_, i) => i !== index));
  };

  // Compute form totals
  const formSubtotal = formItems.reduce(
    (sum, it) => sum + it.unitPrice * it.quantity * (1 - (it.discountPercentage || 0) / 100),
    0
  );
  const formTaxTotal = formItems.reduce((sum, it) => sum + it.taxAmount, 0);
  const formGrandTotal = formSubtotal + formTaxTotal;

  // Handle Save New Invoice
  const handleSaveInvoice = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formCustomerName.trim()) {
      toast.error('Please enter customer name');
      return;
    }
    if (formItems.some((it) => !it.description.trim() || it.unitPrice <= 0)) {
      toast.error('Please provide valid description and price for all items');
      return;
    }

    const newInvoice: Invoice = {
      id: `INV-${Date.now()}`,
      invoiceNumber: `UF-INV-2026-${String(invoices.length + 90).padStart(4, '0')}`,
      orderId: formOrderId.trim() || `ORD-${Math.floor(1000 + Math.random() * 9000)}`,
      date: new Date().toISOString().split('T')[0],
      dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      customerName: formCustomerName.trim(),
      customerEmail: formCustomerEmail.trim() || `${formCustomerName.toLowerCase().replace(/\s+/g, '.')}@example.com`,
      customerPhone: formCustomerPhone.trim() || '+91 98000 00000',
      customerGst: formCustomerGst.trim(),
      billingAddress: formBillingAddress.trim() || 'Indiranagar, Bangalore, Karnataka - 560038',
      shippingAddress: formShippingAddress.trim() || formBillingAddress.trim() || 'Indiranagar, Bangalore, Karnataka - 560038',
      items: formItems,
      subtotal: parseFloat(formSubtotal.toFixed(2)),
      discountAmount: 0,
      cgst: parseFloat((formTaxTotal / 2).toFixed(2)),
      sgst: parseFloat((formTaxTotal / 2).toFixed(2)),
      igst: 0,
      taxTotal: parseFloat(formTaxTotal.toFixed(2)),
      grandTotal: parseFloat(formGrandTotal.toFixed(2)),
      paymentStatus: formPaymentStatus,
      paymentMethod: formPaymentMethod,
      notes: formNotes.trim() || 'Official Tax Invoice. Thank you for shopping with Urbn Furnish.',
      companyGst: COMPANY_DETAILS.companyGst,
      companyPan: COMPANY_DETAILS.companyPan,
      createdAt: new Date().toISOString(),
    };

    const updated = [newInvoice, ...invoices];
    setInvoices(updated);
    saveStoredInvoices(updated);
    toast.success(`Invoice ${newInvoice.invoiceNumber} created successfully!`);
    setShowCreateModal(false);
    setSelectedInvoice(newInvoice);
  };

  // Update Status directly
  const handleUpdateStatus = (invId: string, newStatus: PaymentStatus) => {
    const updated = invoices.map((inv) =>
      inv.id === invId ? { ...inv, paymentStatus: newStatus } : inv
    );
    setInvoices(updated);
    saveStoredInvoices(updated);
    if (selectedInvoice && selectedInvoice.id === invId) {
      setSelectedInvoice({ ...selectedInvoice, paymentStatus: newStatus });
    }
    toast.success(`Status updated to ${newStatus}`);
  };



  return (
    <AdminLayout>
      <div className="space-y-6 sm:space-y-8 animate-fadeIn">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-2xl font-black text-textColor tracking-tight">
                Billing &amp; Tax Invoices
              </h1>
              <span className="text-[11px] font-bold px-2 py-0.5 rounded-md bg-emerald-500/10 text-emerald-600 border border-emerald-500/20">
                GST Ready
              </span>
            </div>
            <p className="text-xs sm:text-sm text-textMuted mt-0.5">
              Generate eCommerce tax invoices, track GST remissions, and manage payment settlements.
            </p>
          </div>

          <div className="flex items-center gap-2.5">
            <button
              onClick={() => {
                setFormCustomerName('');
                setFormCustomerEmail('');
                setFormCustomerPhone('');
                setFormBillingAddress('');
                setFormShippingAddress('');
                setFormOrderId('');
                setFormPaymentStatus('Paid');
                setFormPaymentMethod('UPI / QR');
                setFormNotes('');
                setShowCreateModal(true);
              }}
              className="px-4 py-2.5 rounded-xl bg-primary text-white hover:bg-primary-hover font-bold text-xs flex items-center gap-2 shadow-xs shadow-primary/30"
            >
              <Plus size={16} />
              <span>Create New Invoice</span>
            </button>
          </div>
        </div>

        {/* Financial KPI Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5">
          <div className="p-5 rounded-2xl bg-surfaceColor border border-borderColor shadow-xs">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-textMuted uppercase tracking-wider">
                Total Invoiced
              </span>
              <div className="p-2.5 rounded-xl bg-bgColor border border-borderColor text-primary">
                <Receipt size={18} />
              </div>
            </div>
            <p className="text-2xl sm:text-3xl font-black text-textColor tracking-tight mt-2">
              ₹{totalInvoiced.toLocaleString('en-IN', { maximumFractionDigits: 0 })}
            </p>
            <span className="text-xs text-textMuted mt-1 block">
              Across {invoices.length} issued invoices
            </span>
          </div>

          <div className="p-5 rounded-2xl bg-surfaceColor border border-borderColor shadow-xs">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-textMuted uppercase tracking-wider">
                Total Collected
              </span>
              <div className="p-2.5 rounded-xl bg-emerald-500/10 text-emerald-600">
                <CheckCircle2 size={18} />
              </div>
            </div>
            <p className="text-2xl sm:text-3xl font-black text-emerald-600 tracking-tight mt-2">
              ₹{totalCollected.toLocaleString('en-IN', { maximumFractionDigits: 0 })}
            </p>
            <span className="text-xs text-emerald-500 font-bold mt-1 block">
              {(totalInvoiced > 0 ? (totalCollected / totalInvoiced) * 100 : 0).toFixed(1)}% realization rate
            </span>
          </div>

          <div className="p-5 rounded-2xl bg-surfaceColor border border-borderColor shadow-xs">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-textMuted uppercase tracking-wider">
                Pending / Overdue
              </span>
              <div className="p-2.5 rounded-xl bg-amber-500/10 text-amber-600">
                <Clock size={18} />
              </div>
            </div>
            <p className="text-2xl sm:text-3xl font-black text-amber-600 tracking-tight mt-2">
              ₹{totalPending.toLocaleString('en-IN', { maximumFractionDigits: 0 })}
            </p>
            <span className="text-xs text-textMuted mt-1 block">
              {invoices.filter((i) => i.paymentStatus !== 'Paid').length} pending bills
            </span>
          </div>

          <div className="p-5 rounded-2xl bg-surfaceColor border border-borderColor shadow-xs">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-textMuted uppercase tracking-wider">
                GST / Tax Total
              </span>
              <div className="p-2.5 rounded-xl bg-blue-500/10 text-blue-600">
                <IndianRupee size={18} />
              </div>
            </div>
            <p className="text-2xl sm:text-3xl font-black text-textColor tracking-tight mt-2">
              ₹{totalTaxCollected.toLocaleString('en-IN', { maximumFractionDigits: 0 })}
            </p>
            <span className="text-xs text-textMuted mt-1 block">
              CGST + SGST + IGST Breakdown
            </span>
          </div>
        </div>

        {/* Filter & Search Bar */}
        <div className="p-4 rounded-2xl bg-surfaceColor border border-borderColor flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center px-3.5 py-2 bg-bgColor rounded-xl border border-borderColor w-full sm:w-80">
            <Search size={16} className="text-textMuted mr-2" />
            <input
              type="text"
              placeholder="Search invoice #, customer, order ID..."
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
            {/* Status Filter */}
            <div className="flex items-center p-1 bg-bgColor rounded-xl border border-borderColor">
              {(['all', 'Paid', 'Pending', 'Overdue'] as const).map((st) => (
                <button
                  key={st}
                  onClick={() => setStatusFilter(st)}
                  className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-all capitalize ${
                    statusFilter === st
                      ? 'bg-primary text-white shadow-xs'
                      : 'text-textMuted hover:text-textColor'
                  }`}
                >
                  {st}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Invoices Table */}
        <div className="rounded-2xl bg-surfaceColor border border-borderColor shadow-xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b border-borderColor text-[11px] font-bold text-textMuted uppercase bg-bgColor/30">
                  <th className="px-5 py-3.5">Invoice #</th>
                  <th className="px-5 py-3.5">Order Ref</th>
                  <th className="px-5 py-3.5">Customer</th>
                  <th className="px-5 py-3.5">Date</th>
                  <th className="px-5 py-3.5">Tax (GST)</th>
                  <th className="px-5 py-3.5">Grand Total</th>
                  <th className="px-5 py-3.5">Status</th>
                  <th className="px-5 py-3.5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-borderColor/50">
                {filteredInvoices.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="px-5 py-16 text-center">
                      <Receipt size={36} className="mx-auto text-textMuted/30 mb-3" />
                      <p className="text-sm font-bold text-textMuted">No invoices found</p>
                      <p className="text-xs text-textMuted/70 mt-0.5">
                        Try adjusting your search query or status filter.
                      </p>
                    </td>
                  </tr>
                ) : (
                  filteredInvoices.map((inv) => (
                    <tr
                      key={inv.id}
                      onClick={() => setSelectedInvoice(inv)}
                      className="hover:bg-sidebarHover/60 transition-colors cursor-pointer group"
                    >
                      <td className="px-5 py-3.5">
                        <div className="flex items-center gap-2">
                          <FileText size={15} className="text-primary shrink-0" />
                          <span className="font-mono text-xs font-bold text-primary hover:underline">
                            {inv.invoiceNumber}
                          </span>
                        </div>
                      </td>
                      <td className="px-5 py-3.5 text-xs font-mono font-semibold text-textColor">
                        {inv.orderId || '-'}
                      </td>
                      <td className="px-5 py-3.5">
                        <div>
                          <p className="font-semibold text-xs text-textColor leading-tight">
                            {inv.customerName}
                          </p>
                          <p className="text-[11px] text-textMuted">{inv.customerPhone}</p>
                        </div>
                      </td>
                      <td className="px-5 py-3.5 text-xs text-textMuted whitespace-nowrap">
                        {inv.date}
                      </td>
                      <td className="px-5 py-3.5 text-xs font-mono text-textMuted">
                        ₹{inv.taxTotal.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                      </td>
                      <td className="px-5 py-3.5 font-bold text-xs text-textColor font-mono">
                        ₹{inv.grandTotal.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                      </td>
                      <td className="px-5 py-3.5">
                        <span
                          className={`text-[11px] font-bold px-2.5 py-0.5 rounded-full border ${getStatusBadge(
                            inv.paymentStatus
                          )}`}
                        >
                          {inv.paymentStatus}
                        </span>
                      </td>
                      <td className="px-5 py-3.5 text-right">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelectedInvoice(inv);
                          }}
                          className="px-3 py-1.5 rounded-lg bg-bgColor border border-borderColor hover:bg-primary hover:text-white text-textColor text-xs font-bold transition-all inline-flex items-center gap-1.5"
                        >
                          <Eye size={13} />
                          <span>View Invoice</span>
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* MODAL 1: CREATE NEW INVOICE FORM */}
        {showCreateModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div
              className="absolute inset-0 bg-black/50 backdrop-blur-xs"
              onClick={() => setShowCreateModal(false)}
            />

            <div className="relative bg-surfaceColor rounded-2xl border border-borderColor shadow-2xl w-full max-w-3xl max-h-[90vh] flex flex-col animate-in fade-in zoom-in-95 duration-200">
              <div className="flex items-center justify-between px-6 py-4 border-b border-borderColor shrink-0">
                <div className="flex items-center gap-2.5">
                  <div className="w-9 h-9 rounded-xl bg-primary/10 text-primary flex items-center justify-center font-bold">
                    <Receipt size={18} />
                  </div>
                  <div>
                    <h3 className="text-base font-black text-textColor">Create New Bill &amp; Tax Invoice</h3>
                    <p className="text-xs text-textMuted">Generate GST invoice for customer orders</p>
                  </div>
                </div>
                <button
                  onClick={() => setShowCreateModal(false)}
                  className="p-1.5 rounded-lg text-textMuted hover:text-textColor hover:bg-bgColor"
                >
                  <X size={18} />
                </button>
              </div>

              <form onSubmit={handleSaveInvoice} className="flex-1 overflow-y-auto p-6 custom-scrollbar space-y-5">
                {/* Customer Details */}
                <div className="space-y-3">
                  <span className="text-xs font-bold text-textMuted uppercase tracking-wider block">
                    1. Customer &amp; Billing Info
                  </span>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-bold text-textMuted mb-1">Customer Full Name *</label>
                      <input
                        type="text"
                        required
                        value={formCustomerName}
                        onChange={(e) => setFormCustomerName(e.target.value)}
                        placeholder="e.g. Eleanor Vance"
                        className="w-full px-3.5 py-2 bg-bgColor rounded-xl border border-borderColor text-xs text-textColor outline-hidden focus:border-primary"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-textMuted mb-1">Customer Email</label>
                      <input
                        type="email"
                        value={formCustomerEmail}
                        onChange={(e) => setFormCustomerEmail(e.target.value)}
                        placeholder="eleanor@example.com"
                        className="w-full px-3.5 py-2 bg-bgColor rounded-xl border border-borderColor text-xs text-textColor outline-hidden focus:border-primary"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-textMuted mb-1">Phone Number</label>
                      <input
                        type="text"
                        value={formCustomerPhone}
                        onChange={(e) => setFormCustomerPhone(e.target.value)}
                        placeholder="+91 98451 23456"
                        className="w-full px-3.5 py-2 bg-bgColor rounded-xl border border-borderColor text-xs text-textColor outline-hidden focus:border-primary"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-textMuted mb-1">Order Reference ID</label>
                      <input
                        type="text"
                        value={formOrderId}
                        onChange={(e) => setFormOrderId(e.target.value)}
                        placeholder="ORD-9821"
                        className="w-full px-3.5 py-2 bg-bgColor rounded-xl border border-borderColor text-xs text-textColor outline-hidden focus:border-primary font-mono"
                      />
                    </div>
                    <div className="sm:col-span-2">
                      <label className="block text-xs font-bold text-textMuted mb-1">Billing &amp; Shipping Address</label>
                      <textarea
                        rows={2}
                        value={formBillingAddress}
                        onChange={(e) => setFormBillingAddress(e.target.value)}
                        placeholder="Street Address, City, State, Pincode"
                        className="w-full px-3.5 py-2 bg-bgColor rounded-xl border border-borderColor text-xs text-textColor outline-hidden focus:border-primary resize-none"
                      />
                    </div>
                  </div>
                </div>

                {/* Line Items */}
                <div className="space-y-3 pt-3 border-t border-borderColor">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-textMuted uppercase tracking-wider">
                      2. Products &amp; Services (HSN &amp; GST 18%)
                    </span>
                    <button
                      type="button"
                      onClick={addItemLine}
                      className="text-xs font-bold text-primary hover:underline flex items-center gap-1"
                    >
                      <Plus size={13} />
                      <span>Add Item</span>
                    </button>
                  </div>

                  <div className="space-y-2.5">
                    {formItems.map((item, idx) => (
                      <div
                        key={item.id}
                        className="p-3 rounded-xl bg-bgColor border border-borderColor space-y-2"
                      >
                        <div className="flex items-center justify-between gap-2">
                          <input
                            type="text"
                            placeholder="Product Name / Description *"
                            value={item.description}
                            onChange={(e) => updateItemLine(idx, 'description', e.target.value)}
                            className="flex-1 px-3 py-1.5 bg-surfaceColor rounded-lg border border-borderColor text-xs text-textColor outline-hidden focus:border-primary"
                          />
                          <button
                            type="button"
                            onClick={() => removeItemLine(idx)}
                            className="p-1.5 text-textMuted hover:text-red-500 hover:bg-surfaceColor rounded-lg"
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>

                        <div className="grid grid-cols-4 gap-2 text-xs">
                          <div>
                            <span className="text-[10px] text-textMuted block">HSN Code</span>
                            <input
                              type="text"
                              value={item.hsnCode}
                              onChange={(e) => updateItemLine(idx, 'hsnCode', e.target.value)}
                              className="w-full px-2 py-1 bg-surfaceColor rounded-lg border border-borderColor text-xs text-textColor font-mono"
                            />
                          </div>
                          <div>
                            <span className="text-[10px] text-textMuted block">Quantity</span>
                            <input
                              type="number"
                              min="1"
                              value={item.quantity}
                              onChange={(e) =>
                                updateItemLine(idx, 'quantity', parseInt(e.target.value) || 1)
                              }
                              className="w-full px-2 py-1 bg-surfaceColor rounded-lg border border-borderColor text-xs text-textColor"
                            />
                          </div>
                          <div>
                            <span className="text-[10px] text-textMuted block">Unit Price (₹)</span>
                            <input
                              type="number"
                              value={item.unitPrice || ''}
                              onChange={(e) =>
                                updateItemLine(idx, 'unitPrice', parseFloat(e.target.value) || 0)
                              }
                              placeholder="0"
                              className="w-full px-2 py-1 bg-surfaceColor rounded-lg border border-borderColor text-xs text-textColor font-mono"
                            />
                          </div>
                          <div>
                            <span className="text-[10px] text-textMuted block">Total (Incl. Tax)</span>
                            <div className="px-2 py-1 bg-surfaceColor/50 rounded-lg border border-borderColor/60 text-xs font-bold text-textColor font-mono">
                              ₹{item.total.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Payment Status & Method */}
                <div className="space-y-3 pt-3 border-t border-borderColor">
                  <span className="text-xs font-bold text-textMuted uppercase tracking-wider block">
                    3. Payment &amp; Status
                  </span>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-bold text-textMuted mb-1">Payment Status</label>
                      <select
                        value={formPaymentStatus}
                        onChange={(e) => setFormPaymentStatus(e.target.value as PaymentStatus)}
                        className="w-full px-3.5 py-2 bg-bgColor rounded-xl border border-borderColor text-xs font-semibold text-textColor outline-hidden"
                      >
                        <option value="Paid">Paid</option>
                        <option value="Pending">Pending</option>
                        <option value="Overdue">Overdue</option>
                        <option value="Draft">Draft</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-textMuted mb-1">Payment Method</label>
                      <select
                        value={formPaymentMethod}
                        onChange={(e) => setFormPaymentMethod(e.target.value as PaymentMethod)}
                        className="w-full px-3.5 py-2 bg-bgColor rounded-xl border border-borderColor text-xs font-semibold text-textColor outline-hidden"
                      >
                        <option value="UPI / QR">UPI / QR Code</option>
                        <option value="Credit Card">Credit Card</option>
                        <option value="Net Banking">Net Banking</option>
                        <option value="Cash on Delivery">Cash on Delivery (COD)</option>
                      </select>
                    </div>
                  </div>
                </div>

                {/* Calculation Summary Block */}
                <div className="p-4 rounded-xl bg-bgColor/70 border border-borderColor space-y-2 text-xs">
                  <div className="flex justify-between text-textMuted">
                    <span>Taxable Value (Subtotal):</span>
                    <span className="font-mono font-bold text-textColor">
                      ₹{formSubtotal.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                    </span>
                  </div>
                  <div className="flex justify-between text-textMuted">
                    <span>GST (CGST 9% + SGST 9%):</span>
                    <span className="font-mono font-bold text-textColor">
                      ₹{formTaxTotal.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                    </span>
                  </div>
                  <div className="flex justify-between text-sm font-black text-textColor pt-2 border-t border-borderColor">
                    <span>Grand Total:</span>
                    <span className="font-mono text-emerald-600">
                      ₹{formGrandTotal.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                    </span>
                  </div>
                </div>

                <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-borderColor shrink-0">
                  <button
                    type="button"
                    onClick={() => setShowCreateModal(false)}
                    className="px-4 py-2.5 rounded-xl bg-bgColor border border-borderColor text-xs font-bold text-textColor hover:bg-sidebarHover"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2.5 rounded-xl bg-primary text-white hover:bg-primary-hover text-xs font-bold shadow-sm shadow-primary/30"
                  >
                    Generate Tax Invoice
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* MODAL 2: OFFICIAL PRINTABLE TAX INVOICE VIEWER */}
        {selectedInvoice && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 print:p-0 print:static print:block print:bg-white print:z-auto">
            <div
              className="absolute inset-0 bg-black/60 backdrop-blur-xs print:hidden"
              onClick={() => setSelectedInvoice(null)}
            />

            <div className="relative bg-surfaceColor rounded-2xl border border-borderColor shadow-2xl w-full max-w-4xl max-h-[92vh] flex flex-col animate-in fade-in zoom-in-95 duration-200 print:shadow-none print:border-none print:max-h-none print:w-full print:max-w-none print:rounded-none print:p-0 print:m-0 print:bg-white">
              {/* Modal Top Actions Header - Hidden during print */}
              <div className="flex items-center justify-between px-6 py-4 border-b border-borderColor bg-bgColor/50 shrink-0 print:hidden">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-primary/10 text-primary flex items-center justify-center font-bold">
                    <FileText size={18} />
                  </div>
                  <div>
                    <h3 className="text-base font-black text-textColor">
                      {selectedInvoice.invoiceNumber}
                    </h3>
                    <div className="flex items-center gap-2 mt-0.5">
                      <span
                        className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${getStatusBadge(
                          selectedInvoice.paymentStatus
                        )}`}
                      >
                        {selectedInvoice.paymentStatus}
                      </span>
                      <span className="text-xs text-textMuted font-mono">
                        Order: {selectedInvoice.orderId}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <PrintableDocumentButton
                    type="invoice"
                    invoice={selectedInvoice}
                    buttonText="Print Invoice (PDF)"
                    className="shadow-sm shadow-primary/30"
                  />
                  <button
                    onClick={() => setSelectedInvoice(null)}
                    className="p-2 rounded-xl text-textMuted hover:text-textColor hover:bg-bgColor"
                  >
                    <X size={18} />
                  </button>
                </div>
              </div>

              {/* Printable Invoice Sheet Container */}
              <div className="flex-1 overflow-y-auto p-6 sm:p-8 custom-scrollbar print:overflow-visible print:p-0 print:m-0 print:border-none">
                <div
                  id="printable-invoice-target"
                  className="bg-surfaceColor p-6 sm:p-8 rounded-2xl border border-borderColor shadow-xs space-y-6 text-textColor print:bg-white print:text-black print:p-4 print:space-y-4 print:border-none print:shadow-none print:rounded-none"
                >
                  {/* Top Branding & Invoice Title */}
                  <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 pb-6 border-b border-borderColor print:border-black print:pb-4">
                    <div>
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-lg bg-[#e27429] text-white flex items-center justify-center font-black text-sm print:bg-[#e27429] print:text-white">
                          U
                        </div>
                        <span className="text-lg font-black tracking-tight text-textColor print:text-black">
                          URBN FURNISH PVT LTD
                        </span>
                      </div>
                      <p className="text-xs text-textMuted print:text-gray-700 max-w-sm mt-1 leading-relaxed">
                        {COMPANY_DETAILS.address}
                      </p>
                      <p className="text-xs text-textMuted print:text-gray-800 mt-1">
                        <strong>GSTIN:</strong> {COMPANY_DETAILS.companyGst} &bull;{' '}
                        <strong>PAN:</strong> {COMPANY_DETAILS.companyPan}
                      </p>
                      <p className="text-xs text-textMuted print:text-gray-700">
                        Email: {COMPANY_DETAILS.email} &bull; Web: {COMPANY_DETAILS.website}
                      </p>
                    </div>

                    <div className="sm:text-right space-y-1 print:text-right">
                      <span className="text-xl font-black tracking-tight text-[#e27429] print:text-black block uppercase">
                        TAX INVOICE
                      </span>
                      <p className="text-xs font-bold text-textColor print:text-black font-mono">
                        Invoice No: {selectedInvoice.invoiceNumber}
                      </p>
                      <p className="text-xs text-textMuted print:text-gray-800">Invoice Date: {selectedInvoice.date}</p>
                      <p className="text-xs text-textMuted print:text-gray-800">Due Date: {selectedInvoice.dueDate}</p>
                      <p className="text-xs text-textMuted print:text-gray-800">
                        Payment Mode: <strong>{selectedInvoice.paymentMethod}</strong>
                      </p>
                    </div>
                  </div>

                  {/* Customer Billing & Shipping Address */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 p-4 rounded-xl bg-bgColor/50 border border-borderColor text-xs print:grid-cols-2 print:bg-gray-50/50 print:border-black/30 print:p-3 print:gap-4">
                    <div>
                      <span className="font-bold uppercase tracking-wider text-textMuted print:text-black block mb-1">
                        Billed To:
                      </span>
                      <h4 className="font-bold text-sm text-textColor print:text-black">{selectedInvoice.customerName}</h4>
                      <p className="text-textMuted print:text-gray-800 mt-0.5">{selectedInvoice.billingAddress}</p>
                      <p className="text-textMuted print:text-gray-800 mt-1">
                        Phone: {selectedInvoice.customerPhone} &bull; Email: {selectedInvoice.customerEmail}
                      </p>
                      {selectedInvoice.customerGst && (
                        <p className="text-textMuted print:text-gray-800 mt-0.5">
                          <strong>Buyer GSTIN:</strong> {selectedInvoice.customerGst}
                        </p>
                      )}
                    </div>

                    <div>
                      <span className="font-bold uppercase tracking-wider text-textMuted print:text-black block mb-1">
                        Shipped / Delivered To:
                      </span>
                      <h4 className="font-bold text-sm text-textColor print:text-black">{selectedInvoice.customerName}</h4>
                      <p className="text-textMuted print:text-gray-800 mt-0.5">{selectedInvoice.shippingAddress}</p>
                      <p className="text-textMuted print:text-gray-800 mt-1">
                        State: Karnataka (Code: 29) &bull; Place of Supply: Inter-city Hub
                      </p>
                    </div>
                  </div>

                  {/* Items Table */}
                  <div className="overflow-x-auto print:overflow-visible">
                    <table className="w-full text-left text-xs border-collapse print:text-[11px]">
                      <thead>
                        <tr className="border-b-2 border-borderColor print:border-black text-textMuted print:text-black font-bold uppercase bg-bgColor/30 print:bg-gray-100">
                          <th className="py-2.5 px-3 print:py-1.5 print:px-2">#</th>
                          <th className="py-2.5 px-3 print:py-1.5 print:px-2">Item Description</th>
                          <th className="py-2.5 px-3 print:py-1.5 print:px-2">HSN Code</th>
                          <th className="py-2.5 px-3 text-center print:py-1.5 print:px-2">Qty</th>
                          <th className="py-2.5 px-3 text-right print:py-1.5 print:px-2">Unit Price</th>
                          <th className="py-2.5 px-3 text-right print:py-1.5 print:px-2">Taxable Amt</th>
                          <th className="py-2.5 px-3 text-right print:py-1.5 print:px-2">GST (18%)</th>
                          <th className="py-2.5 px-3 text-right print:py-1.5 print:px-2">Total</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-borderColor/50 print:divide-gray-300">
                        {selectedInvoice.items.map((item, idx) => (
                          <tr key={item.id} className="print:break-inside-avoid">
                            <td className="py-3 px-3 print:py-2 print:px-2 text-textMuted print:text-gray-800">{idx + 1}</td>
                            <td className="py-3 px-3 print:py-2 print:px-2 font-semibold text-textColor print:text-black">
                              {item.description}
                            </td>
                            <td className="py-3 px-3 print:py-2 print:px-2 font-mono text-textMuted print:text-gray-700">{item.hsnCode}</td>
                            <td className="py-3 px-3 print:py-2 print:px-2 text-center font-bold print:text-black">{item.quantity}</td>
                            <td className="py-3 px-3 print:py-2 print:px-2 text-right font-mono print:text-black">
                              ₹{item.unitPrice.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                            </td>
                            <td className="py-3 px-3 print:py-2 print:px-2 text-right font-mono print:text-black">
                              ₹{(item.unitPrice * item.quantity).toLocaleString('en-IN', {
                                minimumFractionDigits: 2,
                              })}
                            </td>
                            <td className="py-3 px-3 print:py-2 print:px-2 text-right font-mono text-textMuted print:text-gray-800">
                              ₹{item.taxAmount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                            </td>
                            <td className="py-3 px-3 print:py-2 print:px-2 text-right font-mono font-bold text-textColor print:text-black">
                              ₹{item.total.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>

                  {/* Summary & Tax Calculation Breakdown */}
                  <div className="flex flex-col sm:flex-row justify-between gap-6 pt-4 border-t border-borderColor print:border-black print:flex-row print:pt-3 text-xs print:break-inside-avoid">
                    <div className="space-y-2 max-w-sm">
                      <span className="font-bold uppercase tracking-wider text-textMuted print:text-black block">
                        Terms &amp; Notes:
                      </span>
                      <p className="text-textMuted print:text-gray-800 text-[11px] leading-relaxed">
                        {selectedInvoice.notes}
                      </p>
                      <p className="text-[10px] text-textMuted print:text-gray-600 italic">
                        This is a computer generated invoice and requires no physical signature under GST Rule 46.
                      </p>
                    </div>

                    <div className="space-y-1.5 min-w-[260px]">
                      <div className="flex justify-between text-textMuted print:text-gray-800">
                        <span>Taxable Amount (Subtotal):</span>
                        <span className="font-mono font-bold text-textColor print:text-black">
                          ₹{selectedInvoice.subtotal.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                        </span>
                      </div>
                      <div className="flex justify-between text-textMuted print:text-gray-800">
                        <span>CGST (9%):</span>
                        <span className="font-mono text-textColor print:text-black">
                          ₹{selectedInvoice.cgst.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                        </span>
                      </div>
                      <div className="flex justify-between text-textMuted print:text-gray-800">
                        <span>SGST (9%):</span>
                        <span className="font-mono text-textColor print:text-black">
                          ₹{selectedInvoice.sgst.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                        </span>
                      </div>
                      {selectedInvoice.igst > 0 && (
                        <div className="flex justify-between text-textMuted print:text-gray-800">
                          <span>IGST (18%):</span>
                          <span className="font-mono text-textColor print:text-black">
                            ₹{selectedInvoice.igst.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                          </span>
                        </div>
                      )}
                      <div className="flex justify-between text-sm font-black text-textColor print:text-black pt-2 border-t border-borderColor print:border-black">
                        <span>Grand Total (INR):</span>
                        <span className="font-mono text-emerald-600 print:text-black text-base font-bold">
                          ₹{selectedInvoice.grandTotal.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Print Signature & Seal line (visible only on print) */}
                  <div className="hidden print:flex items-center justify-between pt-6 border-t border-dashed border-gray-400 text-xs">
                    <div>
                      <p className="text-[10px] text-gray-500 font-mono">Invoice Ref: {selectedInvoice.id} • Order: {selectedInvoice.orderId}</p>
                    </div>
                    <div className="text-right space-y-1">
                      <p className="font-bold text-black text-xs">For URBN FURNISH PVT LTD</p>
                      <div className="h-6" />
                      <p className="text-[10.5px] text-gray-700 border-t border-black/50 pt-0.5">Authorized Signatory (Finance)</p>
                    </div>
                  </div>

                  {/* Status Toggle in Modal Footer - Hidden on print */}
                  <div className="flex items-center justify-between pt-4 border-t border-borderColor print:hidden">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-textMuted">Quick Status Update:</span>
                      <select
                        value={selectedInvoice.paymentStatus}
                        onChange={(e) =>
                          handleUpdateStatus(selectedInvoice.id, e.target.value as PaymentStatus)
                        }
                        className="px-2.5 py-1 bg-bgColor rounded-lg border border-borderColor text-xs font-bold text-textColor"
                      >
                        <option value="Paid">Mark as Paid</option>
                        <option value="Pending">Mark as Pending</option>
                        <option value="Overdue">Mark as Overdue</option>
                        <option value="Refunded">Mark as Refunded</option>
                      </select>
                    </div>

                    <span className="text-xs text-textMuted">
                      Authorized by: <strong>Urbn Furnish Finance Dept</strong>
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </AdminLayout>
  );
}
