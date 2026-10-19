'use client';

import React from 'react';
import Link from 'next/link';
import { QUIT_COPY } from '@/lib/quitCopy';
import QuitFooter from '@/components/quit/QuitFooter';
import {
  Building2,
  PhoneCall,
  HeartPulse,
  HelpCircle,
  FileQuestion,
  ExternalLink,
  ShieldCheck,
  Clock,
  LayoutDashboard
} from 'lucide-react';

export default function QuitHelpPage() {
  return (
    <div className="min-h-screen bg-[#0F172A] text-slate-100 flex flex-col justify-between p-4 sm:p-6 lg:p-8">
      <div className="max-w-3xl mx-auto w-full">
        {/* Navigation Breadcrumb */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <Link
              href="/dashboard"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-800/80 hover:bg-slate-700 text-slate-300 hover:text-white border border-slate-700 text-xs font-medium transition"
            >
              <LayoutDashboard className="w-3.5 h-3.5 text-emerald-400" />
              <span>Dashboard</span>
            </Link>
            <Link
              href="/quit"
              className="text-xs text-slate-400 hover:text-emerald-400 transition-colors flex items-center gap-1"
            >
              ← Back to Smoke-Free Hub
            </Link>
          </div>
          <div className="inline-flex items-center gap-1.5 text-xs text-emerald-400">
            <ShieldCheck className="w-4 h-4" />
            <span>National Health Directory</span>
          </div>
        </div>

        {/* Header */}
        <div className="mb-8">
          <h1 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">
            {QUIT_COPY.helpTitle}
          </h1>
          <p className="text-sm text-slate-400 mt-1">
            {QUIT_COPY.helpSubtitle}
          </p>
        </div>

        {/* Section 1: What is a TCC */}
        <div className="glass-panel p-6 sm:p-8 mb-6 border-slate-700">
          <div className="flex items-start gap-3 mb-3">
            <div className="p-2.5 rounded-xl bg-emerald-500/10 text-emerald-400 shrink-0">
              <Building2 className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-white">
                {QUIT_COPY.whatIsTccTitle}
              </h2>
            </div>
          </div>
          <p className="text-xs sm:text-sm text-slate-300 leading-relaxed mb-4">
            {QUIT_COPY.whatIsTccBody}
          </p>
          <div className="p-3.5 rounded-xl bg-slate-900/60 border border-slate-800 text-xs text-slate-400 flex items-start gap-2">
            <span className="text-emerald-400 font-semibold shrink-0">Note:</span>
            <span>{QUIT_COPY.tccDoctorAdviceNote}</span>
          </div>
        </div>

        {/* Section 2: Helplines Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
          {/* National Tobacco Quitline */}
          <div className="glass-panel p-5 border-emerald-500/30 flex flex-col justify-between">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <div className="p-2 rounded-lg bg-emerald-500/15 text-emerald-300">
                  <PhoneCall className="w-4 h-4" />
                </div>
                <h3 className="font-semibold text-white text-sm">
                  {QUIT_COPY.nationalQuitlineTitle}
                </h3>
              </div>
              <div className="text-2xl font-bold text-emerald-400 font-mono my-2">
                {QUIT_COPY.nationalQuitlineNumber}
              </div>
              <p className="text-xs text-slate-400 leading-relaxed mb-4">
                {QUIT_COPY.nationalQuitlineTimings}
              </p>
            </div>
            <a
              href={`tel:${QUIT_COPY.nationalQuitlineNumber}`}
              className="w-full inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-medium text-xs transition-colors shadow"
            >
              <PhoneCall className="w-3.5 h-3.5" />
              <span>{QUIT_COPY.callQuitlineButton}</span>
            </a>
          </div>

          {/* Tele-MANAS */}
          <div className="glass-panel p-5 border-blue-500/30 flex flex-col justify-between">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <div className="p-2 rounded-lg bg-blue-500/15 text-blue-300">
                  <HeartPulse className="w-4 h-4" />
                </div>
                <h3 className="font-semibold text-white text-sm">
                  {QUIT_COPY.teleManasTitle}
                </h3>
              </div>
              <div className="text-2xl font-bold text-blue-400 font-mono my-2">
                {QUIT_COPY.teleManasNumber}
              </div>
              <p className="text-xs text-slate-400 leading-relaxed mb-4">
                {QUIT_COPY.teleManasTimings}
              </p>
            </div>
            <a
              href={`tel:${QUIT_COPY.teleManasNumber}`}
              className="w-full inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-medium text-xs transition-colors shadow"
            >
              <PhoneCall className="w-3.5 h-3.5" />
              <span>{QUIT_COPY.callTeleManasButton}</span>
            </a>
          </div>
        </div>

        {/* Section 3: Questions for your Doctor */}
        <div className="glass-panel p-6 sm:p-8 mb-6 border-slate-700">
          <div className="flex items-start gap-3 mb-4">
            <div className="p-2 rounded-lg bg-purple-500/10 text-purple-400 shrink-0">
              <FileQuestion className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-white">
                {QUIT_COPY.questionsForDoctorTitle}
              </h2>
              <p className="text-xs text-slate-400 mt-0.5">
                Take these practical questions to your next appointment or clinic visit.
              </p>
            </div>
          </div>

          <div className="space-y-3">
            {QUIT_COPY.questionsForDoctorList.map((q, idx) => (
              <div
                key={idx}
                className="flex items-start gap-3 p-3.5 rounded-xl bg-slate-900/60 border border-slate-800 text-xs text-slate-300"
              >
                <div className="w-5 h-5 rounded-full bg-slate-800 text-slate-400 flex items-center justify-center text-[10px] font-bold shrink-0 mt-0.5">
                  {idx + 1}
                </div>
                <span className="leading-relaxed">{q}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <QuitFooter />
    </div>
  );
}
