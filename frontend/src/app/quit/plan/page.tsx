'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { apiRequest } from '@/lib/api';
import { QUIT_COPY } from '@/lib/quitCopy';
import QuitFooter from '@/components/quit/QuitFooter';
import {
  FileText,
  Printer,
  Calendar,
  AlertTriangle,
  CheckCircle2,
  ArrowRight,
  ShieldAlert,
  ChevronDown,
  LayoutDashboard
} from 'lucide-react';

export default function QuitPlanPage() {
  const router = useRouter();
  const [profile, setProfile] = useState<any>(null);
  const [planMode, setPlanMode] = useState<'TAPER' | 'COLD_TURKEY'>('TAPER');
  const [taperWeeks, setTaperWeeks] = useState(4);
  const [targetQuitDate, setTargetQuitDate] = useState(() => {
    const d = new Date();
    d.setDate(d.getDate() + 7);
    return d.toISOString().split('T')[0];
  });

  const [taperDailyCaps, setTaperDailyCaps] = useState<number[]>([]);
  const [submitting, setSubmitting] = useState(false);
  const [loading, setLoading] = useState(true);
  const [savedNotice, setSavedNotice] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      setLoading(true);
      const res = await apiRequest('/quit/profile');
      if (!res.profile || !res.profile.hasConsented) {
        router.push('/quit/start');
        return;
      }
      setProfile(res.profile);
      if (res.profile.planMode) {
        setPlanMode(res.profile.planMode);
      }
      if (res.profile.targetQuitDate) {
        setTargetQuitDate(res.profile.targetQuitDate.split('T')[0]);
      }
      if (res.profile.taperWeeks) {
        setTaperWeeks(res.profile.taperWeeks);
      }
      if (res.profile.taperDailyCaps) {
        setTaperDailyCaps(res.profile.taperDailyCaps);
      }
    } catch (err: any) {
      const msg = (err.message || '').toUpperCase();
      if (msg.includes('CONSENT') || msg.includes('PROFILE_NOT_FOUND') || msg.includes('NOT FOUND')) {
        router.push('/quit/start');
        return;
      }
      setError(err.message || 'Failed to load quit profile');
    } finally {
      setLoading(false);
    }
  };

  const handleSavePlan = async () => {
    try {
      setSubmitting(true);
      setError(null);
      setSavedNotice(false);

      const res = await apiRequest('/quit/plan', {
        method: 'POST',
        body: JSON.stringify({
          planMode,
          taperWeeks: planMode === 'TAPER' ? Number(taperWeeks) : undefined,
          targetQuitDate: planMode === 'COLD_TURKEY' ? targetQuitDate : undefined
        })
      });

      setProfile(res.profile);
      if (res.profile.taperDailyCaps) {
        setTaperDailyCaps(res.profile.taperDailyCaps);
      }
      setSavedNotice(true);
      setTimeout(() => setSavedNotice(false), 4000);
    } catch (err: any) {
      setError(err.message || 'Failed to generate plan');
    } finally {
      setSubmitting(false);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0F172A] text-slate-100 flex items-center justify-center p-4">
        <div className="w-10 h-10 border-4 border-emerald-500/20 border-t-emerald-500 rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0F172A] text-slate-100 flex flex-col justify-between p-4 sm:p-6 lg:p-8 print:p-0 print:bg-white print:text-black">
      {/* Print-specific style */}
      <style jsx global>{`
        @media print {
          body {
            background-color: #ffffff !important;
            color: #000000 !important;
          }
          .no-print {
            display: none !important;
          }
          .glass-panel {
            background: #ffffff !important;
            border: 1px solid #cccccc !important;
            box-shadow: none !important;
            color: #000000 !important;
          }
          .print-black {
            color: #000000 !important;
          }
        }
      `}</style>

      <div className="max-w-3xl mx-auto w-full">
        {/* Header (Screen only) */}
        <div className="no-print flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">
              {QUIT_COPY.planBuilderTitle}
            </h1>
            <p className="text-sm text-slate-400 mt-1">
              {QUIT_COPY.planBuilderSubtitle}
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3 w-full sm:w-auto">
            <Link
              href="/dashboard"
              className="inline-flex items-center gap-1.5 px-3.5 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 text-xs sm:text-sm font-medium transition-colors"
            >
              <LayoutDashboard className="w-4 h-4 text-emerald-400" />
              <span>Dashboard</span>
            </Link>
            <button
              onClick={handlePrint}
              type="button"
              className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 text-xs sm:text-sm font-medium transition-colors"
            >
              <Printer className="w-4 h-4 text-slate-400" />
              <span>{QUIT_COPY.printPlanButton}</span>
            </button>
            <button
              onClick={() => router.push('/quit')}
              type="button"
              className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs sm:text-sm font-medium transition-colors"
            >
              <span>Back to Hub</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Chain smoker advisory alert if triggered */}
        {profile?.isChainSmoker && (
          <div className="mb-6 p-4 rounded-xl border border-amber-500/40 bg-amber-950/30 text-amber-200 text-xs sm:text-sm flex items-start gap-3">
            <ShieldAlert className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
            <div>
              <span className="font-semibold text-amber-100">Morning Intake Advisory: </span>
              <span>{QUIT_COPY.chainSmokerAdvisory}</span>
            </div>
          </div>
        )}

        {/* High dependence advisory alert if FTND >= 6 */}
        {(profile?.ftndScore ?? 0) >= 6 && (
          <div className="mb-6 p-4 rounded-xl border border-blue-500/40 bg-blue-950/30 text-blue-200 text-xs sm:text-sm flex items-start gap-3">
            <AlertTriangle className="w-5 h-5 text-blue-400 shrink-0 mt-0.5" />
            <div>
              <span className="font-semibold text-blue-100">Dependence Assessment: </span>
              <span>{QUIT_COPY.highDependenceAdvisory}</span>
            </div>
          </div>
        )}

        {error && (
          <div className="mb-6 p-4 rounded-xl border border-red-500/30 bg-red-950/30 text-red-200 text-sm">
            {error}
          </div>
        )}

        {savedNotice && (
          <div className="mb-6 p-4 rounded-xl border border-emerald-500/30 bg-emerald-950/30 text-emerald-200 text-sm flex items-center gap-2">
            <CheckCircle2 className="w-5 h-5 text-emerald-400" />
            <span>Your personalized plan has been generated and activated!</span>
          </div>
        )}

        {/* Plan Configuration Form (no-print) */}
        <div className="no-print glass-panel p-6 sm:p-8 mb-8">
          <h2 className="text-lg font-bold text-white mb-4">Choose Strategy</h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
            <button
              type="button"
              onClick={() => setPlanMode('TAPER')}
              className={`p-4 rounded-xl text-left border transition-all ${
                planMode === 'TAPER'
                  ? 'bg-emerald-500/15 border-emerald-500/50 text-white shadow-lg shadow-emerald-950/20'
                  : 'bg-slate-900/60 border-slate-800 text-slate-400 hover:border-slate-700'
              }`}
            >
              <div className="font-semibold text-sm mb-1 text-slate-100">
                {QUIT_COPY.planModeTaper}
              </div>
              <div className="text-xs text-slate-400 leading-relaxed">
                {QUIT_COPY.planModeTaperDesc}
              </div>
            </button>

            <button
              type="button"
              onClick={() => setPlanMode('COLD_TURKEY')}
              className={`p-4 rounded-xl text-left border transition-all ${
                planMode === 'COLD_TURKEY'
                  ? 'bg-emerald-500/15 border-emerald-500/50 text-white shadow-lg shadow-emerald-950/20'
                  : 'bg-slate-900/60 border-slate-800 text-slate-400 hover:border-slate-700'
              }`}
            >
              <div className="font-semibold text-sm mb-1 text-slate-100">
                {QUIT_COPY.planModeCold}
              </div>
              <div className="text-xs text-slate-400 leading-relaxed">
                {QUIT_COPY.planModeColdDesc}
              </div>
            </button>
          </div>

          {planMode === 'TAPER' ? (
            <div className="mb-6 p-4 rounded-xl bg-slate-900/60 border border-slate-800">
              <label className="block text-xs font-medium text-slate-300 mb-2">
                {QUIT_COPY.planTaperWeeksLabel} {taperWeeks} weeks ({taperWeeks * 7} days)
              </label>
              <input
                type="range"
                min="2"
                max="6"
                step="1"
                value={taperWeeks}
                onChange={(e) => setTaperWeeks(Number(e.target.value))}
                className="w-full accent-emerald-500 cursor-pointer"
              />
              <div className="flex justify-between text-[11px] text-slate-500 mt-1">
                <span>2 Weeks (Faster step-down)</span>
                <span>4 Weeks (Standard)</span>
                <span>6 Weeks (Gentle curve)</span>
              </div>
            </div>
          ) : (
            <div className="mb-6 p-4 rounded-xl bg-slate-900/60 border border-slate-800">
              <label className="block text-xs font-medium text-slate-300 mb-2">
                {QUIT_COPY.planQuitDateLabel}
              </label>
              <input
                type="date"
                value={targetQuitDate}
                onChange={(e) => setTargetQuitDate(e.target.value)}
                className="px-3 py-2.5 rounded-lg bg-slate-900 border border-slate-700 text-slate-200 text-sm focus:border-emerald-500 outline-none"
              />
              <p className="text-[11px] text-slate-500 mt-2">
                Guidelines recommend setting a date within 2 weeks to maintain active momentum.
              </p>
            </div>
          )}

          <button
            type="button"
            disabled={submitting}
            onClick={handleSavePlan}
            className="w-full py-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white font-medium text-sm transition-all shadow-lg shadow-emerald-950/30 flex items-center justify-center gap-2"
          >
            <span>{submitting ? 'Updating Plan...' : 'Activate & Save Plan'}</span>
            <CheckCircle2 className="w-4 h-4" />
          </button>
        </div>

        {/* Printable "My Quit Plan" Sheet */}
        <div className="glass-panel p-6 sm:p-8 border border-slate-700/80 print:p-0 print:border-none">
          <div className="border-b border-slate-800 print:border-black pb-4 mb-6 flex items-start justify-between">
            <div>
              <div className="text-xs uppercase tracking-wider text-emerald-400 font-semibold print:text-black">
                Self-Help Action Document
              </div>
              <h2 className="text-xl sm:text-2xl font-bold text-white print:text-black mt-1">
                {QUIT_COPY.printablePlanHeader}
              </h2>
            </div>
            <div className="text-right text-xs text-slate-400 print:text-black">
              <div>Date: {new Date().toLocaleDateString('en-IN')}</div>
              <div>Baseline: {profile?.baselineDailyCount ?? 15} units/day</div>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6 text-xs sm:text-sm">
            <div className="p-3.5 rounded-lg bg-slate-900/40 border border-slate-800 print:border-gray-300 print:bg-white">
              <span className="text-slate-400 print:text-gray-600 block">Assessment Score:</span>
              <span className="font-semibold text-white print:text-black">
                FTND {profile?.ftndScore ?? 0} / 10 ({profile?.ftndBand ?? 'LOW'})
              </span>
            </div>

            <div className="p-3.5 rounded-lg bg-slate-900/40 border border-slate-800 print:border-gray-300 print:bg-white">
              <span className="text-slate-400 print:text-gray-600 block">Strategy Selected:</span>
              <span className="font-semibold text-white print:text-black">
                {profile?.planMode === 'TAPER'
                  ? `Gradual Taper (${profile.taperWeeks ?? taperWeeks} weeks)`
                  : 'Target Quit Date'}
              </span>
            </div>
          </div>

          {/* If Taper Plan, show curve preview */}
          {profile?.planMode === 'TAPER' && taperDailyCaps.length > 0 && (
            <div className="mb-6">
              <h3 className="font-semibold text-white print:text-black text-sm mb-3">
                Daily Taper Targets (Step-down Schedule)
              </h3>
              <div className="grid grid-cols-7 gap-1.5 text-center text-xs">
                {taperDailyCaps.slice(0, 28).map((cap, idx) => (
                  <div
                    key={idx}
                    className="p-1.5 rounded bg-slate-900/80 border border-slate-800 print:border-gray-300 print:bg-white"
                  >
                    <div className="text-[10px] text-slate-500 print:text-gray-500">D{idx + 1}</div>
                    <div className="font-bold text-emerald-400 print:text-black">{cap}</div>
                  </div>
                ))}
              </div>
              {taperDailyCaps.length > 28 && (
                <div className="text-[11px] text-slate-500 print:text-gray-600 mt-2">
                  Showing first 4 weeks. Curve decreases strictly to 0 by final day.
                </div>
              )}
            </div>
          )}

          {/* 5 A's Coping & Commitment Checklist */}
          <div className="space-y-3 mb-6 text-xs sm:text-sm">
            <h3 className="font-semibold text-white print:text-black text-sm">
              My Action Commitments
            </h3>
            <div className="p-3 rounded-lg bg-slate-900/40 border border-slate-800 print:border-gray-300 print:bg-white">
              <strong>1. Identify & Delay:</strong> When a craving hits, I will wait 10 minutes and use 4-7-8 breathing before deciding.
            </div>
            <div className="p-3 rounded-lg bg-slate-900/40 border border-slate-800 print:border-gray-300 print:bg-white">
              <strong>2. Environmental Reset:</strong> Remove lighters, ashtrays, and leftover tobacco products from my living and work spaces.
            </div>
            <div className="p-3 rounded-lg bg-slate-900/40 border border-slate-800 print:border-gray-300 print:bg-white">
              <strong>3. Daily Tracking:</strong> Log my daily units every night to maintain continuous awareness and build my smoke-free streak.
            </div>
          </div>

          {/* Print footer notice */}
          <div className="border-t border-slate-800 print:border-black pt-4 text-[11px] text-slate-400 print:text-black">
            <p>{QUIT_COPY.footerDisclaimer}</p>
          </div>
        </div>
      </div>

      <QuitFooter />
    </div>
  );
}
