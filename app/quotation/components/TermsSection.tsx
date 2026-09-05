'use client';

import React from 'react';
import { FileText } from 'lucide-react';

interface Props {
  terms: string;
  onTermsChange: (v: string) => void;
  notes: string;
  onNotesChange: (v: string) => void;
}

export default function TermsSection({ terms, onTermsChange, notes, onNotesChange }: Props) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
      {/* Terms & Conditions */}
      <div className="p-5 rounded-2xl bg-surfaceColor border border-borderColor space-y-3">
        <h3 className="text-xs font-black text-textMuted uppercase tracking-wider flex items-center gap-2">
          <FileText size={14} className="text-primary" /> Terms &amp; Conditions
        </h3>
        <textarea
          rows={4}
          value={terms}
          onChange={(e) => onTermsChange(e.target.value)}
          placeholder="Enter terms and payment conditions..."
          className="w-full p-3 rounded-xl border border-borderColor bg-bgColor text-textColor text-xs leading-relaxed focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all resize-none font-medium"
        />
      </div>

      {/* Internal Notes */}
      <div className="p-5 rounded-2xl bg-surfaceColor border border-borderColor space-y-3">
        <h3 className="text-xs font-black text-textMuted uppercase tracking-wider flex items-center gap-2">
          <FileText size={14} className="text-primary" /> Dispatch / Additional Notes
        </h3>
        <textarea
          rows={4}
          value={notes}
          onChange={(e) => onNotesChange(e.target.value)}
          placeholder="Add internal dispatch instructions, notes for driver or team..."
          className="w-full p-3 rounded-xl border border-borderColor bg-bgColor text-textColor text-xs leading-relaxed focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all resize-none font-medium"
        />
      </div>
    </div>
  );
}
