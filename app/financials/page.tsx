'use client';

import React, { useState, useEffect, useMemo } from 'react';
import AdminLayout from '../common/AdminLayout';
import {
  CreditCard,
  Download,
  Search,
  Filter,
  ArrowUpRight,
  ArrowDownLeft,
  DollarSign,
  IndianRupee,
  Receipt,
  CheckCircle2,
  Clock,
  AlertTriangle,
  RotateCcw,
  Eye,
  FileSpreadsheet,
  X,
  Building,
  RefreshCw,
  Plus,
  Send,
  SlidersHorizontal,
  ChevronDown,
  Percent,
  Wallet,
  Landmark,
} from 'lucide-react';
import {
  FinancialTransaction,
  PaymentGateway,
  TransactionStatus,
  TransactionType,
  getStoredTransactions,
  saveStoredTransactions,
  INITIAL_TRANSACTIONS,
} from '@/lib/financialsStore';
import toast from 'react-hot-toast';

export default function FinancialsPage() {
  const [transactions, setTransactions] = useState<FinancialTransaction[]>(INITIAL_TRANSACTIONS);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [gatewayFilter, setGatewayFilter] = useState<string>('all');
  const [typeFilter, setTypeFilter] = useState<string>('all');

  // Modals & Drawers
  const [selectedTxn, setSelectedTxn] = useState<FinancialTransaction | null>(null);
  const [showPayoutModal, setShowPayoutModal] = useState(false);
  const [payoutBank, setPayoutBank] = useState('HDFC Bank - Current A/C (**** 8821)');
  const [payoutAmount, setPayoutAmount] = useState('150000');
  const [payoutRef, setPayoutRef] = useState('');

  // Load from local storage
  useEffect(() => {
    setTransactions(getStoredTransactions());
  }, []);

  // Filtered dataset
  const filteredTransactions = useMemo(() => {
    return transactions.filter((t) => {
      const matchSearch =
        t.id.toLowerCase().includes(search.toLowerCase()) ||
        t.customerName.toLowerCase().includes(search.toLowerCase()) ||
        (t.orderId && t.orderId.toLowerCase().includes(search.toLowerCase())) ||
        (t.invoiceNumber && t.invoiceNumber.toLowerCase().includes(search.toLowerCase())) ||
        t.gatewayTxnId.toLowerCase().includes(search.toLowerCase());

      const matchStatus = statusFilter === 'all' || t.status === statusFilter;
      const matchGateway = gatewayFilter === 'all' || t.gateway === gatewayFilter;
      const matchType = typeFilter === 'all' || t.type === typeFilter;

      return matchSearch && matchStatus && matchGateway && matchType;
    });
  }, [transactions, search, statusFilter, gatewayFilter, typeFilter]);

  // KPI Calculations
  const totalSettledGross = transactions
    .filter((t) => t.status === 'Settled')
    .reduce((sum, t) => sum + t.grossAmount, 0);

  const totalGatewayFees = transactions
    .filter((t) => t.status === 'Settled')
    .reduce((sum, t) => sum + t.fee + t.taxOnFee, 0);

  const totalNetSettled = transactions
    .filter((t) => t.status === 'Settled')
    .reduce((sum, t) => sum + t.netAmount, 0);

  const totalPendingSettlement = transactions
    .filter((t) => t.status === 'Processing' || t.status === 'Pending')
    .reduce((sum, t) => sum + t.grossAmount, 0);

  const totalRefunds = Math.abs(
    transactions
      .filter((t) => t.status === 'Refunded' || t.type === 'Refund Payout')
      .reduce((sum, t) => sum + t.grossAmount, 0)
  );

  // Status Badge Helper
  const getStatusBadge = (status: TransactionStatus) => {
    switch (status) {
      case 'Settled':
        return 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20';
      case 'Processing':
        return 'bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20';
      case 'Pending':
        return 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20';
      case 'Refunded':
        return 'bg-purple-500/10 text-purple-600 dark:text-purple-400 border-purple-500/20';
      case 'Failed':
        return 'bg-rose-500/10 text-rose-600 border-rose-500/20';
      default:
        return 'bg-gray-500/10 text-gray-600 border-gray-500/20';
    }
  };

  const getGatewayColor = (gateway: PaymentGateway) => {
    switch (gateway) {
      case 'Razorpay':
        return 'bg-blue-600/10 text-blue-600 dark:text-blue-400 border-blue-500/20';
      case 'Stripe':
        return 'bg-indigo-600/10 text-indigo-600 dark:text-indigo-400 border-indigo-500/20';
      case 'UPI / Direct':
        return 'bg-emerald-600/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20';
      case 'PayTM':
        return 'bg-cyan-600/10 text-cyan-600 dark:text-cyan-400 border-cyan-500/20';
      case 'Cashfree':
        return 'bg-amber-600/10 text-amber-600 dark:text-amber-400 border-amber-500/20';
      case 'COD Settlement':
        return 'bg-orange-600/10 text-orange-600 dark:text-orange-400 border-orange-500/20';
      default:
        return 'bg-gray-500/10 text-gray-600 border-gray-500/20';
    }
  };

  // Export CSV Handler
  const handleExportCSV = () => {
    if (filteredTransactions.length === 0) {
      toast.error('No transactions to export');
      return;
    }

    const headers = [
      'Transaction ID',
      'Order Ref',
      'Invoice Ref',
      'Customer',
      'Timestamp',
      'Gateway',
      'Gateway Txn ID',
      'Gross Amount (INR)',
      'Gateway Fee (INR)',
      'Tax on Fee (GST)',
      'Net Payout (INR)',
      'Status',
      'Payout Batch',
    ];

    const rows = filteredTransactions.map((t) => [
      `"${t.id}"`,
      `"${t.orderId || ''}"`,
      `"${t.invoiceNumber || ''}"`,
      `"${t.customerName}"`,
      `"${t.timestamp}"`,
      `"${t.gateway}"`,
      `"${t.gatewayTxnId}"`,
      t.grossAmount,
      t.fee,
      t.taxOnFee,
      t.netAmount,
      `"${t.status}"`,
      `"${t.payoutBatch || ''}"`,
    ]);

    const csvContent =
      'data:text/csv;charset=utf-8,' +
      [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `financial_settlements_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    toast.success(`Exported ${filteredTransactions.length} transactions to CSV`);
  };

  // Reconcile / Mark Settled
  const handleMarkSettled = (id: string) => {
    const updated = transactions.map((t) =>
      t.id === id ? { ...t, status: 'Settled' as TransactionStatus, settlementDate: new Date().toISOString().split('T')[0] } : t
    );
    setTransactions(updated);
    saveStoredTransactions(updated);
    if (selectedTxn && selectedTxn.id === id) {
      setSelectedTxn({ ...selectedTxn, status: 'Settled', settlementDate: new Date().toISOString().split('T')[0] });
    }
    toast.success(`Transaction ${id} marked as Settled`);
  };

  // Initiate Payout Batch
  const handleInitiatePayout = (e: React.FormEvent) => {
    e.preventDefault();
    const amountNum = parseFloat(payoutAmount);
    if (isNaN(amountNum) || amountNum <= 0) {
      toast.error('Please enter a valid payout amount');
      return;
    }

    const newPayoutTxn: FinancialTransaction = {
      id: `TXN-${Math.floor(88400 + Math.random() * 1000)}`,
      customerName: 'Bank Settlement Payout',
      timestamp: 'Just now',
      gateway: 'UPI / Direct',
      gatewayTxnId: `bank_trn_${Date.now().toString().slice(-8)}`,
      type: 'Vendor Payout',
      grossAmount: -amountNum,
      fee: 0,
      taxOnFee: 0,
      netAmount: -amountNum,
      status: 'Settled',
      payoutBatch: `BATCH-${new Date().toISOString().split('T')[0]}-DISBURSE`,
      settlementDate: new Date().toISOString().split('T')[0],
    };

    const updated = [newPayoutTxn, ...transactions];
    setTransactions(updated);
    saveStoredTransactions(updated);
    toast.success(`Bank transfer of ₹${amountNum.toLocaleString('en-IN')} initiated successfully!`);
    setShowPayoutModal(false);
  };

  return (
    <AdminLayout>
      <div className="space-y-6 sm:space-y-8 animate-fadeIn max-w-7xl mx-auto pb-12">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-2xl font-black text-textColor tracking-tight">
                Financials &amp; Payments
              </h1>
              <span className="text-[11px] font-bold px-2 py-0.5 rounded-md bg-emerald-500/10 text-emerald-600 border border-emerald-500/20">
                Live Settlements
              </span>
            </div>
            <p className="text-xs sm:text-sm text-textMuted mt-0.5">
              Payment gateway reconciliations, merchant fee deductions, escrow settlements, and payout ledgers.
            </p>
          </div>

          <div className="flex items-center gap-2.5">
            <button
              onClick={handleExportCSV}
              className="px-4 py-2.5 rounded-xl bg-surfaceColor border border-borderColor hover:bg-sidebarHover font-bold text-xs flex items-center gap-2 text-textColor shadow-xs transition-colors"
            >
              <FileSpreadsheet size={15} className="text-emerald-500" />
              <span>Export Ledger</span>
            </button>
            <button
              onClick={() => setShowPayoutModal(true)}
              className="px-4 py-2.5 rounded-xl bg-primary text-white hover:bg-primary-hover font-bold text-xs flex items-center gap-2 shadow-xs shadow-primary/30"
            >
              <Landmark size={15} />
              <span>Disburse Payout</span>
            </button>
          </div>
        </div>

        {/* 4 Financial KPI Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5">
          <div className="p-5 rounded-2xl bg-surfaceColor border border-borderColor shadow-xs">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-textMuted uppercase tracking-wider">
                Gross Inflow
              </span>
              <div className="p-2.5 rounded-xl bg-emerald-500/10 text-emerald-600">
                <ArrowUpRight size={18} />
              </div>
            </div>
            <p className="text-2xl sm:text-3xl font-black text-textColor tracking-tight mt-2 font-mono">
              ₹{totalSettledGross.toLocaleString('en-IN', { maximumFractionDigits: 0 })}
            </p>
            <span className="text-xs text-emerald-500 font-bold mt-1 block">
              +14.8% vs last 30 days
            </span>
          </div>

          <div className="p-5 rounded-2xl bg-surfaceColor border border-borderColor shadow-xs">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-textMuted uppercase tracking-wider">
                Net Payout (Realized)
              </span>
              <div className="p-2.5 rounded-xl bg-primary/10 text-primary">
                <IndianRupee size={18} />
              </div>
            </div>
            <p className="text-2xl sm:text-3xl font-black text-primary tracking-tight mt-2 font-mono">
              ₹{totalNetSettled.toLocaleString('en-IN', { maximumFractionDigits: 0 })}
            </p>
            <span className="text-xs text-textMuted mt-1 block">
              Transferred to bank accounts
            </span>
          </div>

          <div className="p-5 rounded-2xl bg-surfaceColor border border-borderColor shadow-xs">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-textMuted uppercase tracking-wider">
                Gateway Fees &amp; Tax
              </span>
              <div className="p-2.5 rounded-xl bg-amber-500/10 text-amber-600">
                <Percent size={18} />
              </div>
            </div>
            <p className="text-2xl sm:text-3xl font-black text-amber-600 tracking-tight mt-2 font-mono">
              ₹{totalGatewayFees.toLocaleString('en-IN', { maximumFractionDigits: 0 })}
            </p>
            <span className="text-xs text-textMuted mt-1 block">
              Avg MDR: 1.95% + 18% GST
            </span>
          </div>

          <div className="p-5 rounded-2xl bg-surfaceColor border border-borderColor shadow-xs">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-textMuted uppercase tracking-wider">
                In-Transit / Escrow
              </span>
              <div className="p-2.5 rounded-xl bg-blue-500/10 text-blue-600">
                <Clock size={18} />
              </div>
            </div>
            <p className="text-2xl sm:text-3xl font-black text-blue-600 tracking-tight mt-2 font-mono">
              ₹{totalPendingSettlement.toLocaleString('en-IN', { maximumFractionDigits: 0 })}
            </p>
            <span className="text-xs text-textMuted mt-1 block">
              Settling in T+1 business days
            </span>
          </div>
        </div>

        {/* Gateway Split Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
          {(['Razorpay', 'Stripe', 'UPI / Direct', 'PayTM', 'Cashfree', 'COD Settlement'] as PaymentGateway[]).map((gw) => {
            const count = transactions.filter((t) => t.gateway === gw).length;
            const sum = transactions.filter((t) => t.gateway === gw && t.grossAmount > 0).reduce((acc, t) => acc + t.grossAmount, 0);

            return (
              <div
                key={gw}
                onClick={() => setGatewayFilter(gatewayFilter === gw ? 'all' : gw)}
                className={`p-3.5 rounded-2xl border transition-all cursor-pointer ${
                  gatewayFilter === gw
                    ? 'bg-surfaceColor border-primary shadow-xs ring-1 ring-primary/30'
                    : 'bg-surfaceColor/80 border-borderColor hover:border-primary/40'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-bold text-textMuted truncate">{gw}</span>
                  <span className="text-[10px] font-mono px-1.5 py-0.2 rounded-md bg-bgColor border border-borderColor text-textMuted">
                    {count}
                  </span>
                </div>
                <p className="text-sm font-black text-textColor font-mono mt-1.5">
                  ₹{sum.toLocaleString('en-IN', { maximumFractionDigits: 0 })}
                </p>
              </div>
            );
          })}
        </div>

        {/* Filter and Search Bar */}
        <div className="p-4 rounded-2xl bg-surfaceColor border border-borderColor flex flex-col lg:flex-row items-center justify-between gap-3 shadow-xs">
          <div className="flex items-center px-3.5 py-2 bg-bgColor rounded-xl border border-borderColor w-full lg:w-96 shadow-2xs">
            <Search size={15} className="text-textMuted mr-2.5 shrink-0" />
            <input
              type="text"
              placeholder="Search txn ID, gateway ref, order ID, customer..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full bg-transparent text-xs text-textColor outline-hidden placeholder:text-textMuted"
            />
            {search && (
              <button onClick={() => setSearch('')} className="text-textMuted hover:text-textColor">
                <X size={14} />
              </button>
            )}
          </div>

          <div className="flex items-center gap-2 flex-wrap w-full lg:w-auto">
            {/* Status Pills */}
            <div className="flex items-center p-1 bg-bgColor rounded-xl border border-borderColor">
              {(['all', 'Settled', 'Processing', 'Refunded'] as const).map((st) => (
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

            {/* Gateway Filter Dropdown */}
            <select
              value={gatewayFilter}
              onChange={(e) => setGatewayFilter(e.target.value)}
              className="px-3 py-2 bg-bgColor rounded-xl border border-borderColor text-xs font-bold text-textColor outline-none cursor-pointer"
            >
              <option value="all">All Gateways</option>
              <option value="Razorpay">Razorpay</option>
              <option value="Stripe">Stripe</option>
              <option value="UPI / Direct">UPI / Direct</option>
              <option value="PayTM">PayTM</option>
              <option value="Cashfree">Cashfree</option>
              <option value="COD Settlement">COD Settlement</option>
            </select>
          </div>
        </div>

        {/* Financial Transactions Table */}
        <div className="rounded-2xl bg-surfaceColor border border-borderColor shadow-xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm border-collapse">
              <thead>
                <tr className="border-b border-borderColor text-[11px] font-bold text-textMuted uppercase bg-bgColor/40 select-none">
                  <th className="px-5 py-3.5">Transaction ID</th>
                  <th className="px-5 py-3.5">Order / Ref</th>
                  <th className="px-5 py-3.5">Customer</th>
                  <th className="px-5 py-3.5">Gateway &amp; Ref</th>
                  <th className="px-5 py-3.5">Gross (INR)</th>
                  <th className="px-5 py-3.5">Fee + Tax</th>
                  <th className="px-5 py-3.5">Net Payout</th>
                  <th className="px-5 py-3.5">Status</th>
                  <th className="px-5 py-3.5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-borderColor/50">
                {filteredTransactions.length === 0 ? (
                  <tr>
                    <td colSpan={9} className="px-5 py-14 text-center">
                      <CreditCard size={36} className="mx-auto text-textMuted/30 mb-2" />
                      <p className="text-sm font-bold text-textMuted">No financial transactions found</p>
                      <p className="text-xs text-textMuted/70 mt-0.5">
                        Try modifying your search filter or clear gateway selection.
                      </p>
                    </td>
                  </tr>
                ) : (
                  filteredTransactions.map((tx) => (
                    <tr
                      key={tx.id}
                      onClick={() => setSelectedTxn(tx)}
                      className="hover:bg-sidebarHover/60 transition-colors cursor-pointer group"
                    >
                      <td className="px-5 py-3.5">
                        <div className="flex items-center gap-2">
                          <span className="font-mono font-bold text-xs text-primary group-hover:underline">
                            {tx.id}
                          </span>
                        </div>
                        <span className="text-[10px] text-textMuted block mt-0.5">{tx.timestamp}</span>
                      </td>

                      <td className="px-5 py-3.5">
                        <div className="font-mono text-xs font-semibold text-textColor">
                          {tx.orderId || '—'}
                        </div>
                        {tx.invoiceNumber && (
                          <span className="text-[10px] font-mono text-textMuted block">
                            {tx.invoiceNumber}
                          </span>
                        )}
                      </td>

                      <td className="px-5 py-3.5">
                        <p className="font-semibold text-xs text-textColor leading-tight">
                          {tx.customerName}
                        </p>
                        <p className="text-[11px] text-textMuted truncate max-w-[140px]">
                          {tx.customerEmail || 'Direct Settlement'}
                        </p>
                      </td>

                      <td className="px-5 py-3.5">
                        <span
                          className={`text-[10px] font-bold px-2 py-0.5 rounded-md border inline-block ${getGatewayColor(
                            tx.gateway
                          )}`}
                        >
                          {tx.gateway}
                        </span>
                        <p className="font-mono text-[10px] text-textMuted mt-0.5 truncate max-w-[130px]">
                          {tx.gatewayTxnId}
                        </p>
                      </td>

                      <td className="px-5 py-3.5 font-bold text-xs font-mono text-textColor">
                        {tx.grossAmount >= 0 ? (
                          `₹${tx.grossAmount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}`
                        ) : (
                          <span className="text-red-500">
                            -₹{Math.abs(tx.grossAmount).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                          </span>
                        )}
                      </td>

                      <td className="px-5 py-3.5 text-xs font-mono text-red-500 font-medium">
                        {tx.fee > 0 ? (
                          `-₹${(tx.fee + tx.taxOnFee).toLocaleString('en-IN', { minimumFractionDigits: 2 })}`
                        ) : (
                          <span className="text-textMuted">₹0.00</span>
                        )}
                      </td>

                      <td className="px-5 py-3.5 font-bold text-xs font-mono">
                        {tx.netAmount >= 0 ? (
                          <span className="text-emerald-600 dark:text-emerald-400">
                            ₹{tx.netAmount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                          </span>
                        ) : (
                          <span className="text-red-500">
                            -₹{Math.abs(tx.netAmount).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                          </span>
                        )}
                      </td>

                      <td className="px-5 py-3.5">
                        <span
                          className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full border ${getStatusBadge(
                            tx.status
                          )}`}
                        >
                          {tx.status}
                        </span>
                      </td>

                      <td className="px-5 py-3.5 text-right">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelectedTxn(tx);
                          }}
                          className="px-3 py-1.5 rounded-lg bg-bgColor border border-borderColor hover:bg-primary hover:text-white text-textColor text-xs font-bold transition-all inline-flex items-center gap-1.5"
                        >
                          <Eye size={13} />
                          <span>Details</span>
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          <div className="p-4 border-t border-borderColor flex items-center justify-between text-xs text-textMuted bg-bgColor/20">
            <span>
              Showing {filteredTransactions.length} of {transactions.length} total ledger records
            </span>
            <div className="flex items-center gap-2">
              <button disabled className="px-3 py-1 rounded-lg border border-borderColor opacity-50 cursor-not-allowed text-xs">
                Previous
              </button>
              <button disabled className="px-3 py-1 rounded-lg border border-borderColor opacity-50 cursor-not-allowed text-xs">
                Next
              </button>
            </div>
          </div>
        </div>

        {/* MODAL 1: TRANSACTION DETAILS DRAWER / MODAL */}
        {selectedTxn && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div
              className="absolute inset-0 bg-black/50 backdrop-blur-xs"
              onClick={() => setSelectedTxn(null)}
            />

            <div className="relative bg-surfaceColor rounded-2xl border border-borderColor shadow-2xl w-full max-w-lg overflow-hidden animate-in fade-in zoom-in-95 duration-200">
              <div className="flex items-center justify-between px-6 py-4 border-b border-borderColor">
                <div className="flex items-center gap-2.5">
                  <div className="w-9 h-9 rounded-xl bg-primary/10 text-primary flex items-center justify-center font-bold">
                    <Receipt size={18} />
                  </div>
                  <div>
                    <h3 className="text-base font-black text-textColor">
                      Settlement Details &bull; {selectedTxn.id}
                    </h3>
                    <p className="text-xs text-textMuted">{selectedTxn.timestamp}</p>
                  </div>
                </div>
                <button
                  onClick={() => setSelectedTxn(null)}
                  className="p-1.5 rounded-lg text-textMuted hover:text-textColor hover:bg-bgColor"
                >
                  <X size={18} />
                </button>
              </div>

              <div className="p-6 space-y-4 text-xs">
                {/* Status and Gateway Pill */}
                <div className="p-4 rounded-xl bg-bgColor border border-borderColor flex items-center justify-between">
                  <div>
                    <span className="text-[10px] font-bold text-textMuted uppercase block mb-1">
                      Gateway &amp; Protocol
                    </span>
                    <span className={`text-xs font-bold px-2 py-0.5 rounded-md border ${getGatewayColor(selectedTxn.gateway)}`}>
                      {selectedTxn.gateway}
                    </span>
                  </div>
                  <div className="text-right">
                    <span className="text-[10px] font-bold text-textMuted uppercase block mb-1">
                      Settlement Status
                    </span>
                    <span className={`text-xs font-bold px-2.5 py-0.5 rounded-full border ${getStatusBadge(selectedTxn.status)}`}>
                      {selectedTxn.status}
                    </span>
                  </div>
                </div>

                {/* Ledger Breakdown */}
                <div className="space-y-2 border-t border-borderColor pt-3">
                  <span className="text-xs font-bold text-textMuted uppercase tracking-wider block">
                    Financial Ledger Breakdown
                  </span>
                  <div className="space-y-1.5">
                    <div className="flex justify-between py-1 border-b border-borderColor/40">
                      <span className="text-textMuted">Gross Transaction:</span>
                      <span className="font-mono font-bold text-textColor">
                        ₹{selectedTxn.grossAmount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                      </span>
                    </div>
                    <div className="flex justify-between py-1 border-b border-borderColor/40">
                      <span className="text-textMuted">Gateway MDR Fee:</span>
                      <span className="font-mono font-medium text-red-500">
                        -₹{selectedTxn.fee.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                      </span>
                    </div>
                    <div className="flex justify-between py-1 border-b border-borderColor/40">
                      <span className="text-textMuted">GST on Gateway Fee (18%):</span>
                      <span className="font-mono font-medium text-red-500">
                        -₹{selectedTxn.taxOnFee.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                      </span>
                    </div>
                    <div className="flex justify-between py-1.5 font-bold text-sm text-emerald-600 dark:text-emerald-400">
                      <span>Net Settlement Deposited:</span>
                      <span className="font-mono">
                        ₹{selectedTxn.netAmount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Reference Identifiers */}
                <div className="space-y-2 border-t border-borderColor pt-3">
                  <span className="text-xs font-bold text-textMuted uppercase tracking-wider block">
                    System Identifiers
                  </span>
                  <div className="grid grid-cols-2 gap-2 text-xs">
                    <div className="p-2.5 rounded-lg bg-bgColor border border-borderColor">
                      <span className="text-[10px] text-textMuted block">Gateway Reference</span>
                      <span className="font-mono font-semibold text-textColor">{selectedTxn.gatewayTxnId}</span>
                    </div>
                    <div className="p-2.5 rounded-lg bg-bgColor border border-borderColor">
                      <span className="text-[10px] text-textMuted block">Order Reference</span>
                      <span className="font-mono font-semibold text-textColor">{selectedTxn.orderId || 'Direct'}</span>
                    </div>
                    <div className="p-2.5 rounded-lg bg-bgColor border border-borderColor">
                      <span className="text-[10px] text-textMuted block">Tax Invoice</span>
                      <span className="font-mono font-semibold text-textColor">{selectedTxn.invoiceNumber || 'None'}</span>
                    </div>
                    <div className="p-2.5 rounded-lg bg-bgColor border border-borderColor">
                      <span className="text-[10px] text-textMuted block">Payout Batch</span>
                      <span className="font-mono font-semibold text-textColor">{selectedTxn.payoutBatch || 'Pending'}</span>
                    </div>
                  </div>
                </div>

                {/* Actions */}
                <div className="pt-3 border-t border-borderColor flex items-center justify-between gap-3">
                  {selectedTxn.status !== 'Settled' ? (
                    <button
                      onClick={() => handleMarkSettled(selectedTxn.id)}
                      className="px-4 py-2 rounded-xl bg-emerald-600 text-white font-bold text-xs hover:bg-emerald-700 transition-colors flex items-center gap-1.5"
                    >
                      <CheckCircle2 size={14} />
                      <span>Mark Reconciled &amp; Settled</span>
                    </button>
                  ) : (
                    <span className="text-emerald-500 font-bold flex items-center gap-1 text-xs">
                      <CheckCircle2 size={14} />
                      <span>Fully settled &amp; credited</span>
                    </span>
                  )}
                  <button
                    onClick={() => setSelectedTxn(null)}
                    className="px-4 py-2 rounded-xl bg-bgColor border border-borderColor text-textColor font-bold text-xs hover:bg-sidebarHover"
                  >
                    Close
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* MODAL 2: DISBURSE PAYOUT FORM */}
        {showPayoutModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div
              className="absolute inset-0 bg-black/50 backdrop-blur-xs"
              onClick={() => setShowPayoutModal(false)}
            />

            <div className="relative bg-surfaceColor rounded-2xl border border-borderColor shadow-2xl w-full max-w-md overflow-hidden animate-in fade-in zoom-in-95 duration-200">
              <div className="flex items-center justify-between px-6 py-4 border-b border-borderColor">
                <div className="flex items-center gap-2.5">
                  <div className="w-9 h-9 rounded-xl bg-primary/10 text-primary flex items-center justify-center font-bold">
                    <Landmark size={18} />
                  </div>
                  <div>
                    <h3 className="text-base font-black text-textColor">Disburse Bank Payout</h3>
                    <p className="text-xs text-textMuted">Transfer funds from settlement balance</p>
                  </div>
                </div>
                <button
                  onClick={() => setShowPayoutModal(false)}
                  className="p-1.5 rounded-lg text-textMuted hover:text-textColor hover:bg-bgColor"
                >
                  <X size={18} />
                </button>
              </div>

              <form onSubmit={handleInitiatePayout} className="p-6 space-y-4">
                <div>
                  <label className="block text-xs font-bold text-textMuted uppercase tracking-wider mb-1.5">
                    Destination Bank Account *
                  </label>
                  <select
                    value={payoutBank}
                    onChange={(e) => setPayoutBank(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-bgColor rounded-xl border border-borderColor text-xs font-semibold text-textColor outline-none focus:border-primary"
                  >
                    <option value="HDFC Bank - Current A/C (**** 8821)">
                      HDFC Bank - Current A/C (**** 8821) &bull; IFSC: HDFC0001234
                    </option>
                    <option value="ICICI Bank - Operations A/C (**** 4402)">
                      ICICI Bank - Operations A/C (**** 4402) &bull; IFSC: ICIC0005678
                    </option>
                    <option value="State Bank of India - Escrow A/C (**** 9110)">
                      State Bank of India - Escrow A/C (**** 9110)
                    </option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-textMuted uppercase tracking-wider mb-1.5">
                    Disbursement Amount (INR) *
                  </label>
                  <div className="relative">
                    <span className="absolute left-3.5 top-1/2 -translate-y-1/2 font-bold text-textMuted text-xs">
                      ₹
                    </span>
                    <input
                      type="number"
                      required
                      min="1000"
                      step="100"
                      value={payoutAmount}
                      onChange={(e) => setPayoutAmount(e.target.value)}
                      placeholder="50000"
                      className="w-full pl-8 pr-3.5 py-2.5 bg-bgColor rounded-xl border border-borderColor text-xs font-mono font-bold text-textColor outline-none focus:border-primary"
                    />
                  </div>
                  <span className="text-[10px] text-textMuted mt-1 block">
                    Available balance for instant RTGS/NEFT: ₹{totalNetSettled.toLocaleString('en-IN', { maximumFractionDigits: 0 })}
                  </span>
                </div>

                <div>
                  <label className="block text-xs font-bold text-textMuted uppercase tracking-wider mb-1.5">
                    Remarks / Transfer Note
                  </label>
                  <input
                    type="text"
                    value={payoutRef}
                    onChange={(e) => setPayoutRef(e.target.value)}
                    placeholder="e.g. Weekly vendor settlement batch"
                    className="w-full px-3.5 py-2.5 bg-bgColor rounded-xl border border-borderColor text-xs text-textColor outline-none focus:border-primary"
                  />
                </div>

                <div className="pt-3 border-t border-borderColor flex items-center justify-end gap-2.5">
                  <button
                    type="button"
                    onClick={() => setShowPayoutModal(false)}
                    className="px-4 py-2.5 rounded-xl bg-bgColor border border-borderColor text-xs font-bold text-textColor hover:bg-sidebarHover"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2.5 rounded-xl bg-primary text-white hover:bg-primary-hover text-xs font-bold shadow-xs shadow-primary/30 flex items-center gap-1.5"
                  >
                    <Send size={14} />
                    <span>Authorize &amp; Transfer</span>
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </AdminLayout>
  );
}
