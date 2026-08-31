'use client';

import React, { useState, useRef, useCallback } from 'react';
import { X, Upload, FileSpreadsheet, Download, CheckCircle2, AlertCircle, Trash2, FileText } from 'lucide-react';
import { AdminProduct, parseCsvToProducts, generateCsvTemplate } from '@/lib/productData';

interface CsvUploadModalProps {
  onImport: (products: AdminProduct[]) => void;
  onCancel: () => void;
}

type UploadStep = 'upload' | 'preview' | 'result';

export default function CsvUploadModal({ onImport, onCancel }: CsvUploadModalProps) {
  const [step, setStep] = useState<UploadStep>('upload');
  const [isDragging, setIsDragging] = useState(false);
  const [fileName, setFileName] = useState('');
  const [parsedProducts, setParsedProducts] = useState<AdminProduct[]>([]);
  const [parseErrors, setParseErrors] = useState<string[]>([]);
  const [importCount, setImportCount] = useState(0);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const processFile = (file: File) => {
    if (!file.name.endsWith('.csv')) {
      setParseErrors(['Please upload a valid CSV file (.csv extension).']);
      return;
    }

    setFileName(file.name);

    const reader = new FileReader();
    reader.onload = (e) => {
      const text = e.target?.result as string;
      const { products, errors } = parseCsvToProducts(text);
      setParsedProducts(products);
      setParseErrors(errors);
      setStep('preview');
    };
    reader.readAsText(file);
  };

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file) processFile(file);
  }, []);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) processFile(file);
  };

  const handleImport = () => {
    onImport(parsedProducts);
    setImportCount(parsedProducts.length);
    setStep('result');
  };

  const downloadTemplate = () => {
    const csv = generateCsvTemplate();
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'product_template.csv';
    a.click();
    URL.revokeObjectURL(url);
  };

  const resetUpload = () => {
    setStep('upload');
    setParsedProducts([]);
    setParseErrors([]);
    setFileName('');
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onCancel} />

      {/* Modal */}
      <div className="relative bg-surfaceColor rounded-2xl border border-borderColor shadow-2xl w-full max-w-2xl max-h-[85vh] flex flex-col animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-borderColor shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
              <FileSpreadsheet size={20} className="text-primary" />
            </div>
            <div>
              <h2 className="text-lg font-black text-textColor">CSV Bulk Upload</h2>
              <p className="text-xs text-textMuted">Import products from a CSV file</p>
            </div>
          </div>
          <button
            onClick={onCancel}
            className="p-2 rounded-xl text-textMuted hover:text-textColor hover:bg-bgColor transition-colors"
          >
            <X size={18} />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6 custom-scrollbar">
          {/* Step: Upload */}
          {step === 'upload' && (
            <div className="space-y-4">
              {/* Drag & Drop Zone */}
              <div
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
                onClick={() => fileInputRef.current?.click()}
                className={`relative border-2 border-dashed rounded-2xl p-10 text-center cursor-pointer transition-all ${
                  isDragging
                    ? 'border-primary bg-primary/5 scale-[1.02]'
                    : 'border-borderColor hover:border-primary/40 hover:bg-bgColor'
                }`}
              >
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".csv"
                  onChange={handleFileSelect}
                  className="hidden"
                />
                <div className={`mx-auto w-16 h-16 rounded-2xl flex items-center justify-center mb-4 transition-colors ${
                  isDragging ? 'bg-primary/15' : 'bg-bgColor border border-borderColor'
                }`}>
                  <Upload size={28} className={isDragging ? 'text-primary' : 'text-textMuted'} />
                </div>
                <p className="text-sm font-bold text-textColor mb-1">
                  {isDragging ? 'Drop your CSV file here' : 'Drag & drop your CSV file here'}
                </p>
                <p className="text-xs text-textMuted mb-3">
                  or click to browse files
                </p>
                <span className="inline-block px-3 py-1 rounded-full bg-bgColor border border-borderColor text-[10px] font-mono text-textMuted">
                  Accepted: .csv files only
                </span>
              </div>

              {/* Download Template */}
              <button
                onClick={downloadTemplate}
                className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-bgColor border border-borderColor text-sm font-semibold text-textColor hover:bg-sidebarHover hover:border-primary/30 transition-all"
              >
                <Download size={16} className="text-primary" />
                Download CSV Template
              </button>

              {/* Format Info */}
              <div className="p-4 rounded-xl bg-bgColor border border-borderColor">
                <p className="text-xs font-bold text-textColor mb-2 flex items-center gap-1.5">
                  <FileText size={12} className="text-primary" />
                  CSV Format Guide
                </p>
                <ul className="text-[11px] text-textMuted space-y-1 ml-4 list-disc">
                  <li>First row must contain column headers</li>
                  <li>Required columns: <span className="font-mono text-primary">name, price</span></li>
                  <li>Use <span className="font-mono text-primary">|</span> (pipe) to separate multiple images and features</li>
                  <li>Boolean fields (<span className="font-mono">inStock</span>): use <span className="font-mono text-primary">true</span> / <span className="font-mono text-primary">false</span></li>
                  <li>All other columns are optional with sensible defaults</li>
                </ul>
              </div>

              {parseErrors.length > 0 && (
                <div className="p-3 rounded-xl bg-red-500/5 border border-red-500/15">
                  {parseErrors.map((err, idx) => (
                    <p key={idx} className="text-xs text-red-600 flex items-center gap-1.5">
                      <AlertCircle size={12} />
                      {err}
                    </p>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Step: Preview */}
          {step === 'preview' && (
            <div className="space-y-4">
              {/* File Info */}
              <div className="flex items-center justify-between p-3 rounded-xl bg-bgColor border border-borderColor">
                <div className="flex items-center gap-2">
                  <FileSpreadsheet size={16} className="text-primary" />
                  <span className="text-sm font-semibold text-textColor">{fileName}</span>
                </div>
                <button
                  onClick={resetUpload}
                  className="flex items-center gap-1 text-xs text-textMuted hover:text-red-500 transition-colors"
                >
                  <Trash2 size={12} />
                  Remove
                </button>
              </div>

              {/* Parse Results */}
              <div className="flex items-center gap-3">
                <span className="px-2.5 py-1 rounded-lg bg-emerald-500/10 text-emerald-600 text-xs font-bold">
                  {parsedProducts.length} products parsed
                </span>
                {parseErrors.length > 0 && (
                  <span className="px-2.5 py-1 rounded-lg bg-amber-500/10 text-amber-600 text-xs font-bold">
                    {parseErrors.length} warnings
                  </span>
                )}
              </div>

              {/* Errors/Warnings */}
              {parseErrors.length > 0 && (
                <div className="p-3 rounded-xl bg-amber-500/5 border border-amber-500/15 max-h-24 overflow-y-auto custom-scrollbar">
                  {parseErrors.map((err, idx) => (
                    <p key={idx} className="text-[11px] text-amber-600 flex items-start gap-1.5 mb-1">
                      <AlertCircle size={11} className="mt-0.5 shrink-0" />
                      {err}
                    </p>
                  ))}
                </div>
              )}

              {/* Preview Table */}
              <div className="rounded-xl border border-borderColor overflow-hidden">
                <div className="overflow-x-auto max-h-72 custom-scrollbar">
                  <table className="w-full text-left text-xs">
                    <thead className="sticky top-0 z-10">
                      <tr className="bg-bgColor border-b border-borderColor text-[10px] font-bold text-textMuted uppercase">
                        <th className="px-3 py-2">#</th>
                        <th className="px-3 py-2">Product Name</th>
                        <th className="px-3 py-2">Category</th>
                        <th className="px-3 py-2">Price</th>
                        <th className="px-3 py-2">Stock</th>
                        <th className="px-3 py-2">Material</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-borderColor/50">
                      {parsedProducts.map((p, idx) => (
                        <tr key={idx} className="hover:bg-sidebarHover/50 transition-colors">
                          <td className="px-3 py-2 text-textMuted font-mono">{idx + 1}</td>
                          <td className="px-3 py-2 font-semibold text-textColor max-w-[200px] truncate">
                            {p.name}
                          </td>
                          <td className="px-3 py-2 text-textMuted">{p.category}</td>
                          <td className="px-3 py-2 font-bold text-textColor">₹{p.price.toLocaleString('en-IN')}</td>
                          <td className="px-3 py-2 text-textMuted">{p.stock}</td>
                          <td className="px-3 py-2 text-textMuted">{p.material || '—'}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* Step: Result */}
          {step === 'result' && (
            <div className="text-center py-8">
              <div className="mx-auto w-16 h-16 rounded-full bg-emerald-500/10 flex items-center justify-center mb-4">
                <CheckCircle2 size={32} className="text-emerald-500" />
              </div>
              <h3 className="text-lg font-bold text-textColor mb-2">Import Successful!</h3>
              <p className="text-sm text-textMuted mb-6">
                <span className="font-bold text-emerald-600">{importCount} products</span> have been imported to your catalog.
              </p>
              <button
                onClick={onCancel}
                className="px-6 py-2.5 rounded-xl bg-primary text-white text-sm font-bold hover:bg-primary-hover transition-colors shadow-sm shadow-primary/20"
              >
                Done
              </button>
            </div>
          )}
        </div>

        {/* Footer — only on preview step */}
        {step === 'preview' && (
          <div className="flex items-center justify-between px-6 py-4 border-t border-borderColor shrink-0">
            <button
              onClick={resetUpload}
              className="px-4 py-2.5 rounded-xl bg-bgColor border border-borderColor text-sm font-semibold text-textColor hover:bg-sidebarHover transition-colors"
            >
              Back
            </button>
            <button
              onClick={handleImport}
              disabled={parsedProducts.length === 0}
              className="px-5 py-2.5 rounded-xl bg-primary text-white text-sm font-bold hover:bg-primary-hover transition-colors shadow-sm shadow-primary/20 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
            >
              <Upload size={14} />
              Import {parsedProducts.length} Products
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
