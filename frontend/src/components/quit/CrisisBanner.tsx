import React from 'react';
import { QUIT_COPY } from '@/lib/quitCopy';
import { AlertTriangle, PhoneCall } from 'lucide-react';

interface CrisisBannerProps {
  reason?: string;
}

export default function CrisisBanner({ reason }: CrisisBannerProps) {
  return (
    <div
      role="alert"
      className="w-full mb-6 p-4 rounded-xl border border-red-500/40 bg-red-950/40 backdrop-blur-md text-red-200 shadow-lg shadow-red-950/20"
    >
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-start gap-3">
          <div className="p-2 rounded-lg bg-red-500/20 text-red-400 shrink-0 mt-0.5 sm:mt-0">
            <AlertTriangle className="w-5 h-5" />
          </div>
          <div>
            <h4 className="font-semibold text-sm sm:text-base text-red-100">
              {QUIT_COPY.crisisBannerTitle}
            </h4>
            <p className="text-xs sm:text-sm text-red-300/90 mt-0.5">
              {QUIT_COPY.crisisBannerBody}
            </p>
            {reason && (
              <p className="text-xs text-red-400/80 mt-1 italic">
                Triggered note: {reason}
              </p>
            )}
          </div>
        </div>

        <div className="flex flex-wrap sm:flex-nowrap items-center gap-2.5 w-full sm:w-auto shrink-0">
          <a
            href={`tel:${QUIT_COPY.teleManasHelpline}`}
            className="flex-1 sm:flex-none inline-flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg bg-red-600 hover:bg-red-500 text-white font-medium text-xs transition-colors shadow"
          >
            <PhoneCall className="w-3.5 h-3.5" />
            <span>Tele-MANAS: {QUIT_COPY.teleManasHelpline}</span>
          </a>
          <a
            href={`tel:${QUIT_COPY.quitlineHelpline}`}
            className="flex-1 sm:flex-none inline-flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-100 border border-slate-700 font-medium text-xs transition-colors"
          >
            <PhoneCall className="w-3.5 h-3.5" />
            <span>Quitline: {QUIT_COPY.quitlineHelpline}</span>
          </a>
        </div>
      </div>
    </div>
  );
}
