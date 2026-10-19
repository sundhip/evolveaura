'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { QUIT_COPY } from '@/lib/quitCopy';
import QuitFooter from '@/components/quit/QuitFooter';
import {
  LifeBuoy,
  Wind,
  CheckCircle2,
  ArrowRight,
  ShieldCheck,
  Sparkles,
  Lock
} from 'lucide-react';

export default function TryQuitSosPage() {
  const [breathePhase, setBreathePhase] = useState<'Inhale' | 'Hold' | 'Exhale'>('Inhale');
  const [breatheCount, setBreatheCount] = useState<number>(4);
  const [completedCycles, setCompletedCycles] = useState<number>(0);
  const [finished, setFinished] = useState<boolean>(false);

  // 4-7-8 Breathing animation cycle
  useEffect(() => {
    if (finished) return;

    const timer = setInterval(() => {
      setBreatheCount((prev) => {
        if (prev <= 1) {
          setBreathePhase((currentPhase) => {
            if (currentPhase === 'Inhale') return 'Hold';
            if (currentPhase === 'Hold') return 'Exhale';
            // Completed one full cycle
            setCompletedCycles((c) => {
              const next = c + 1;
              if (next >= 4) {
                setFinished(true);
              }
              return next;
            });
            return 'Inhale';
          });
          return breathePhase === 'Inhale' ? 7 : breathePhase === 'Hold' ? 8 : 4;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [breathePhase, finished]);

  return (
    <div className="min-h-screen bg-[#0F172A] text-slate-100 flex flex-col justify-between p-4 sm:p-6 lg:p-8">
      <div className="max-w-xl mx-auto w-full my-auto text-center">
        {/* Header Badge */}
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-semibold mb-4">
          <ShieldCheck className="w-3.5 h-3.5" />
          <span>Public Low-Friction Rescue • No Sign-up Required</span>
        </div>

        <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight mb-2">
          2-Minute Craving Rescue
        </h1>
        <p className="text-xs sm:text-sm text-slate-400 mb-8 max-w-md mx-auto">
          Cravings are temporary physiological waves. Follow the calming 4-7-8 rhythm below to reset your parasympathetic nervous system.
        </p>

        {/* Breathing Circle Widget */}
        <div className="glass-panel p-8 sm:p-10 mb-8 border border-emerald-500/30 shadow-2xl relative overflow-hidden">
          {!finished ? (
            <div>
              <div className="relative w-48 h-48 mx-auto flex flex-col items-center justify-center mb-6">
                <div
                  className={`absolute inset-0 rounded-full border-4 transition-all duration-1000 ${
                    breathePhase === 'Inhale'
                      ? 'scale-110 bg-emerald-500/20 border-emerald-400'
                      : breathePhase === 'Hold'
                      ? 'scale-110 bg-amber-500/20 border-amber-400'
                      : 'scale-90 bg-blue-500/20 border-blue-400'
                  }`}
                />
                <div className="text-xl font-bold text-white z-10 font-mono tracking-wide" aria-live="polite" aria-atomic="true">
                  {breathePhase}
                </div>
                <div className="text-4xl font-extrabold text-emerald-300 z-10 mt-1 font-mono" aria-live="off" aria-label={`${breatheCount} seconds remaining in ${breathePhase}`}>
                  {breatheCount}s
                </div>
              </div>

              <div className="text-xs font-medium text-slate-400">
                Cycle {Math.min(4, completedCycles + 1)} of 4 • Inhale 4s, Hold 7s, Exhale 8s
              </div>
            </div>
          ) : (
            <div className="py-4">
              <div className="w-14 h-14 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center mx-auto mb-4">
                <CheckCircle2 className="w-8 h-8" />
              </div>
              <h2 className="text-xl font-bold text-white mb-2">
                Wave Successfully Rode
              </h2>
              <p className="text-xs sm:text-sm text-slate-300 max-w-sm mx-auto mb-6 leading-relaxed">
                Notice how the urgency softened. You just trained your brain to outlast a craving without giving in.
              </p>

              <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
                <button
                  type="button"
                  onClick={() => {
                    setFinished(false);
                    setCompletedCycles(0);
                    setBreathePhase('Inhale');
                    setBreatheCount(4);
                  }}
                  className="w-full sm:w-auto px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold"
                >
                  Repeat 2-Min Cycle
                </button>
                <Link
                  href="/register"
                  className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs sm:text-sm font-bold shadow-lg shadow-emerald-950/40 transition-all"
                >
                  <Sparkles className="w-4 h-4" />
                  <span>Create Free Account to Track</span>
                </Link>
              </div>
            </div>
          )}
        </div>

        {/* Privacy Note */}
        <div className="flex items-center justify-center gap-2 text-[11px] text-slate-500">
          <Lock className="w-3.5 h-3.5 text-slate-600" />
          <span>This trial page runs entirely in your browser. Zero data is recorded or stored.</span>
        </div>
      </div>

      <QuitFooter />
    </div>
  );
}
