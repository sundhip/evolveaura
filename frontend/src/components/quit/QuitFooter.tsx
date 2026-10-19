import React from 'react';
import { QUIT_COPY } from '@/lib/quitCopy';
import { ShieldCheck, PhoneCall } from 'lucide-react';

export default function QuitFooter() {
  return (
    <footer className="w-full mt-12 pt-6 pb-8 border-t border-slate-800 text-xs text-slate-400">
      <div className="max-w-4xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-start gap-2 max-w-xl text-center sm:text-left">
          <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
          <p>{QUIT_COPY.footerDisclaimer}</p>
        </div>
        <div className="flex items-center gap-3 shrink-0">
          <a
            href={`tel:${QUIT_COPY.quitlineHelpline}`}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-500/10 text-emerald-300 border border-emerald-500/20 hover:bg-emerald-500/20 transition-colors"
          >
            <PhoneCall className="w-3.5 h-3.5" />
            <span>Quitline: {QUIT_COPY.quitlineHelpline}</span>
          </a>
        </div>
      </div>
    </footer>
  );
}
