'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { apiRequest } from '@/lib/api';
import { QUIT_COPY } from '@/lib/quitCopy';
import QuitFooter from '@/components/quit/QuitFooter';
import {
  LifeBuoy,
  Wind,
  Clock,
  Droplet,
  Activity,
  Eye,
  CheckCircle2,
  Sparkles,
  ArrowRight
} from 'lucide-react';

export default function QuitSosPage() {
  const [activeTool, setActiveTool] = useState<'NONE' | 'BREATHE' | 'DELAY' | 'WATER' | 'MOVE' | 'DISTRACT'>('NONE');
  const [cravingId, setCravingId] = useState<string | null>(null);
  const [intensity, setIntensity] = useState<number>(7);
  const [delayTimerSec, setDelayTimerSec] = useState<number>(600); // 10 min = 600s
  const [isDelayActive, setIsDelayActive] = useState<boolean>(false);

  // Breathing state: 4s inhale, 7s hold, 8s exhale
  const [breathePhase, setBreathePhase] = useState<'Inhale' | 'Hold' | 'Exhale'>('Inhale');
  const [breatheCount, setBreatheCount] = useState<number>(4);

  const [completed, setCompleted] = useState<boolean>(false);
  const [submitting, setSubmitting] = useState<boolean>(false);

  // Start craving session on mount
  useEffect(() => {
    startCravingSession();
  }, []);

  const startCravingSession = async () => {
    try {
      const res = await apiRequest('/quit/craving/start', {
        method: 'POST',
        body: JSON.stringify({ intensity: 7 })
      });
      if (res.craving) {
        setCravingId(res.craving.id);
      }
    } catch (e) {
      console.error('Failed to start craving session', e);
    }
  };

  // Delay timer countdown
  useEffect(() => {
    let interval: any = null;
    if (isDelayActive && delayTimerSec > 0) {
      interval = setInterval(() => {
        setDelayTimerSec((prev) => prev - 1);
      }, 1000);
    } else if (delayTimerSec === 0) {
      setIsDelayActive(false);
    }
    return () => clearInterval(interval);
  }, [isDelayActive, delayTimerSec]);

  // Breathing animation cycle
  useEffect(() => {
    let breatheTimer: any = null;
    if (activeTool === 'BREATHE') {
      breatheTimer = setInterval(() => {
        setBreatheCount((prev) => {
          if (prev <= 1) {
            setBreathePhase((currentPhase) => {
              if (currentPhase === 'Inhale') return 'Hold';
              if (currentPhase === 'Hold') return 'Exhale';
              return 'Inhale';
            });
            return breathePhase === 'Inhale' ? 7 : breathePhase === 'Hold' ? 8 : 4;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => clearInterval(breatheTimer);
  }, [activeTool, breathePhase]);

  const handleToolComplete = async (toolName: string) => {
    try {
      setSubmitting(true);
      if (cravingId) {
        await apiRequest('/quit/craving/end', {
          method: 'POST',
          body: JSON.stringify({
            cravingId,
            toolUsed: toolName,
            survived: true
          })
        });
      }
      setCompleted(true);
    } catch (e) {
      console.error('Failed to log tool completion', e);
      setCompleted(true);
    } finally {
      setSubmitting(false);
    }
  };

  const formatTimer = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}:${s < 10 ? '0' : ''}${s}`;
  };

  return (
    <div className="min-h-screen bg-[#0F172A] text-slate-100 flex flex-col justify-between p-4 sm:p-6 lg:p-8">
      <div className="max-w-2xl mx-auto w-full">
        {/* Navigation Breadcrumb */}
        <div className="flex items-center justify-between mb-6">
          <Link
            href="/quit"
            className="text-xs text-slate-400 hover:text-emerald-400 transition-colors flex items-center gap-1"
          >
            ← Back to Smoke-Free Hub
          </Link>
          <div className="flex items-center gap-2">
            <span className="text-xs text-slate-500">Urge Intensity:</span>
            <div className="flex gap-1">
              {[3, 5, 7, 9].map((lvl) => (
                <button
                  key={lvl}
                  type="button"
                  onClick={() => setIntensity(lvl)}
                  className={`px-2 py-0.5 rounded text-[11px] font-bold ${
                    intensity === lvl
                      ? 'bg-amber-500 text-black'
                      : 'bg-slate-800 text-slate-400 hover:text-slate-200'
                  }`}
                >
                  {lvl}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center p-3 rounded-2xl bg-amber-500/10 text-amber-400 mb-3">
            <LifeBuoy className="w-8 h-8 animate-pulse" />
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">
            {QUIT_COPY.sosTitle}
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-1 max-w-md mx-auto">
            {QUIT_COPY.sosSubtitle}
          </p>
        </div>

        {/* Completion Card */}
        {completed ? (
          <div className="glass-panel p-8 text-center border-emerald-500/30 bg-emerald-950/20">
            <div className="inline-flex p-3 rounded-full bg-emerald-500/20 text-emerald-400 mb-4">
              <CheckCircle2 className="w-10 h-10" />
            </div>
            <h2 className="text-xl font-bold text-white mb-2">
              {QUIT_COPY.cravingLoggedSuccess}
            </h2>
            <p className="text-xs sm:text-sm text-slate-300 max-w-md mx-auto mb-6">
              You rode the wave without giving in. Each survived urge weakens the chemical and behavioural grip of nicotine.
            </p>
            <div className="flex items-center justify-center gap-3">
              <button
                type="button"
                onClick={() => {
                  setCompleted(false);
                  setActiveTool('NONE');
                  startCravingSession();
                }}
                className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium"
              >
                Reset / Another Tool
              </button>
              <Link
                href="/quit"
                className="inline-flex items-center gap-1.5 px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs sm:text-sm font-medium transition-all"
              >
                <span>Return to Hub</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>
        ) : (
          <div>
            {/* Tool 1: 4-7-8 Breathing Tool Interactive View */}
            {activeTool === 'BREATHE' && (
              <div className="glass-panel p-8 text-center mb-6 border-emerald-500/40">
                <div className="relative w-44 h-44 mx-auto flex flex-col items-center justify-center mb-6">
                  <div
                    className={`absolute inset-0 rounded-full border-4 border-emerald-500/40 transition-all duration-1000 ${
                      breathePhase === 'Inhale'
                        ? 'scale-110 bg-emerald-500/20 border-emerald-400'
                        : breathePhase === 'Hold'
                        ? 'scale-110 bg-amber-500/20 border-amber-400'
                        : 'scale-90 bg-blue-500/20 border-blue-400'
                    }`}
                  />
                  <div className="text-xl font-bold text-white z-10" aria-live="polite" aria-atomic="true">
                    {breathePhase}
                  </div>
                  <div className="text-3xl font-extrabold text-emerald-300 z-10 mt-1" aria-live="off" aria-label={`${breatheCount} seconds remaining in ${breathePhase}`}>
                    {breatheCount}
                  </div>
                </div>

                <p className="text-xs text-slate-400 max-w-xs mx-auto mb-6">
                  Follow the rhythm: Inhale 4s, gently Hold 7s, exhale smoothly 8s.
                </p>

                <div className="flex items-center justify-center gap-3">
                  <button
                    type="button"
                    onClick={() => setActiveTool('NONE')}
                    className="px-4 py-2 rounded-lg text-xs text-slate-400 hover:text-slate-200"
                  >
                    Change Tool
                  </button>
                  <button
                    type="button"
                    disabled={submitting}
                    onClick={() => handleToolComplete('BREATHE_4_7_8')}
                    className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-medium text-xs transition-colors"
                  >
                    Mark Urge Overcome
                  </button>
                </div>
              </div>
            )}

            {/* Tool 2: Delay Timer View */}
            {activeTool === 'DELAY' && (
              <div className="glass-panel p-8 text-center mb-6 border-amber-500/40" role="region" aria-label="10-minute delay urge surfing timer">
                <div className="text-4xl sm:text-5xl font-mono font-bold text-amber-300 mb-2" aria-live="polite" aria-atomic="true" aria-label={`Timer: ${formatTimer(delayTimerSec)} remaining`}>
                  {formatTimer(delayTimerSec)}
                </div>
                <p className="text-xs text-slate-400 max-w-xs mx-auto mb-6">
                  Urges are temporary brain neurochemical surges. Waiting 10 minutes allows the wave to naturally crest and decline.
                </p>

                <div className="flex items-center justify-center gap-3">
                  <button
                    type="button"
                    onClick={() => setIsDelayActive(!isDelayActive)}
                    className="px-4 py-2 rounded-xl bg-amber-600 hover:bg-amber-500 text-black font-semibold text-xs transition-colors"
                  >
                    {isDelayActive ? 'Pause Timer' : 'Start 10m Timer'}
                  </button>
                  <button
                    type="button"
                    disabled={submitting}
                    onClick={() => handleToolComplete('DELAY_10M')}
                    className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-medium text-xs transition-colors"
                  >
                    Urge Passed Early
                  </button>
                </div>
              </div>
            )}

            {/* Tool Selector Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Tool 1 */}
              <button
                type="button"
                onClick={() => {
                  setActiveTool('BREATHE');
                  setBreathePhase('Inhale');
                  setBreatheCount(4);
                }}
                className={`glass-panel p-5 text-left border transition-all ${
                  activeTool === 'BREATHE'
                    ? 'border-emerald-500 bg-emerald-950/20'
                    : 'border-slate-800 hover:border-slate-700'
                }`}
              >
                <div className="flex items-center gap-3 mb-2">
                  <div className="p-2 rounded-lg bg-emerald-500/10 text-emerald-400">
                    <Wind className="w-5 h-5" />
                  </div>
                  <h3 className="font-semibold text-white text-sm">{QUIT_COPY.sosToolBreathe}</h3>
                </div>
                <p className="text-xs text-slate-400 leading-relaxed">
                  {QUIT_COPY.sosToolBreatheDesc}
                </p>
              </button>

              {/* Tool 2 */}
              <button
                type="button"
                onClick={() => {
                  setActiveTool('DELAY');
                  setIsDelayActive(true);
                }}
                className={`glass-panel p-5 text-left border transition-all ${
                  activeTool === 'DELAY'
                    ? 'border-amber-500 bg-amber-950/20'
                    : 'border-slate-800 hover:border-slate-700'
                }`}
              >
                <div className="flex items-center gap-3 mb-2">
                  <div className="p-2 rounded-lg bg-amber-500/10 text-amber-400">
                    <Clock className="w-5 h-5" />
                  </div>
                  <h3 className="font-semibold text-white text-sm">{QUIT_COPY.sosToolDelay}</h3>
                </div>
                <p className="text-xs text-slate-400 leading-relaxed">
                  {QUIT_COPY.sosToolDelayDesc}
                </p>
              </button>

              {/* Tool 3: Water */}
              <button
                type="button"
                onClick={() => handleToolComplete('WATER_MINDFUL')}
                className="glass-panel p-5 text-left border border-slate-800 hover:border-blue-500/50 transition-all group"
              >
                <div className="flex items-center gap-3 mb-2">
                  <div className="p-2 rounded-lg bg-blue-500/10 text-blue-400 group-hover:bg-blue-500/20">
                    <Droplet className="w-5 h-5" />
                  </div>
                  <h3 className="font-semibold text-white text-sm">{QUIT_COPY.sosToolWater}</h3>
                </div>
                <p className="text-xs text-slate-400 leading-relaxed">
                  {QUIT_COPY.sosToolWaterDesc}
                </p>
              </button>

              {/* Tool 4: Movement */}
              <button
                type="button"
                onClick={() => handleToolComplete('PHYSICAL_RESET_60S')}
                className="glass-panel p-5 text-left border border-slate-800 hover:border-purple-500/50 transition-all group"
              >
                <div className="flex items-center gap-3 mb-2">
                  <div className="p-2 rounded-lg bg-purple-500/10 text-purple-400 group-hover:bg-purple-500/20">
                    <Activity className="w-5 h-5" />
                  </div>
                  <h3 className="font-semibold text-white text-sm">{QUIT_COPY.sosToolMove}</h3>
                </div>
                <p className="text-xs text-slate-400 leading-relaxed">
                  {QUIT_COPY.sosToolMoveDesc}
                </p>
              </button>

              {/* Tool 5: Distract */}
              <button
                type="button"
                onClick={() => handleToolComplete('MENTAL_SHIFT_54321')}
                className="glass-panel p-5 text-left border border-slate-800 hover:border-amber-500/50 transition-all group sm:col-span-2"
              >
                <div className="flex items-center gap-3 mb-2">
                  <div className="p-2 rounded-lg bg-yellow-500/10 text-yellow-400 group-hover:bg-yellow-500/20">
                    <Eye className="w-5 h-5" />
                  </div>
                  <h3 className="font-semibold text-white text-sm">{QUIT_COPY.sosToolDistract}</h3>
                </div>
                <p className="text-xs text-slate-400 leading-relaxed">
                  {QUIT_COPY.sosToolDistractDesc}
                </p>
              </button>
            </div>
          </div>
        )}
      </div>

      <QuitFooter />
    </div>
  );
}
