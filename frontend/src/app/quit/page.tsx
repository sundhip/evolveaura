'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { apiRequest } from '@/lib/api';
import { QUIT_COPY } from '@/lib/quitCopy';
import QuitFooter from '@/components/quit/QuitFooter';
import CrisisBanner from '@/components/quit/CrisisBanner';
import {
  Flame,
  Shield,
  Calendar,
  Sparkles,
  TrendingUp,
  HeartHandshake,
  CheckCircle2,
  AlertCircle,
  HelpCircle,
  ArrowRight,
  LifeBuoy
} from 'lucide-react';

interface QuitProfile {
  id: string;
  hasConsented: boolean;
  isOver18: boolean;
  ftndScore?: number;
  ftndBand?: string;
  isChainSmoker?: boolean;
  planMode?: string;
  targetQuitDate?: string;
  dailyTarget?: number;
  startDate?: string;
}

interface QuitStats {
  streakDays: number;
  avoidedUnits: number;
  moneySaved: number;
  cravingsSurvived: number;
  consistencyRate: number;
  hasPlan: boolean;
  planMode?: string;
  dailyTarget?: number;
  targetQuitDate?: string;
  daysToTarget?: number;
}

export default function QuitHubPage() {
  const router = useRouter();
  const [profile, setProfile] = useState<QuitProfile | null>(null);
  const [stats, setStats] = useState<QuitStats | null>(null);
  const [todayCheckin, setTodayCheckin] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchHubData();
  }, []);

  const fetchHubData = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await apiRequest('/quit/profile');
      if (!res.profile || !res.profile.hasConsented) {
        router.push('/quit/start');
        return;
      }
      setProfile(res.profile);

      // fetch stats and today checkin
      try {
        const statsRes = await apiRequest('/quit/stats');
        setStats(statsRes.stats);
      } catch (e) {
        console.error('Stats fetch error', e);
      }

      try {
        const checkinRes = await apiRequest('/quit/checkin/today');
        setTodayCheckin(checkinRes.checkIn);
      } catch (e) {
        console.error('Today checkin fetch error', e);
      }
    } catch (err: any) {
      if (err.message?.includes('consent') || err.message?.includes('profile not found')) {
        router.push('/quit/start');
      } else {
        setError(err.message || 'Failed to load Smoke-Free path');
      }
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0F172A] text-slate-100 flex items-center justify-center p-4">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 border-4 border-emerald-500/20 border-t-emerald-500 rounded-full animate-spin" />
          <p className="text-sm text-slate-400">Loading Smoke-Free Path...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0F172A] text-slate-100 flex flex-col justify-between p-4 sm:p-6 lg:p-8">
      <div className="max-w-5xl mx-auto w-full">
        {/* Hub Header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-8">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-medium mb-2">
              <Shield className="w-3.5 h-3.5" />
              <span>Cessation Support & Motivation Hub</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">
              Smoke-Free Path
            </h1>
            <p className="text-sm text-slate-400 mt-1 max-w-2xl">
              Evidence-based habit replacement, craving resilience tools, and non-judgmental progress tracking.
            </p>
          </div>

          <div className="flex items-center gap-3 w-full sm:w-auto">
            <Link
              href="/quit/sos"
              className="flex-1 sm:flex-none inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-amber-500/20 text-amber-300 border border-amber-500/30 hover:bg-amber-500/30 font-medium text-sm transition-all shadow-lg shadow-amber-950/20"
            >
              <LifeBuoy className="w-4 h-4 text-amber-400 animate-pulse" />
              <span>Craving SOS</span>
            </Link>
            <Link
              href="/quit/checkin"
              className="flex-1 sm:flex-none inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-medium text-sm transition-all shadow-lg shadow-emerald-950/30"
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>{todayCheckin ? 'Update Check-in' : 'Today’s Check-in'}</span>
            </Link>
          </div>
        </div>

        {error && (
          <div className="mb-6 p-4 rounded-xl border border-red-500/30 bg-red-950/30 text-red-200 text-sm flex items-center gap-3">
            <AlertCircle className="w-5 h-5 text-red-400 shrink-0" />
            <p>{error}</p>
          </div>
        )}

        {/* Gentle Re-engagement Banner (shown if no checkin logged for today) */}
        {!todayCheckin && (
          <div className="mb-6 p-4 rounded-2xl border border-emerald-500/30 bg-emerald-950/20 text-slate-200 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="flex items-start gap-3">
              <div className="p-2 rounded-xl bg-emerald-500/20 text-emerald-400 shrink-0 mt-0.5">
                <HeartHandshake className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-sm font-bold text-white">
                  {QUIT_COPY.reengagementBannerTitle}
                </h4>
                <p className="text-xs text-slate-300 mt-0.5 max-w-xl">
                  {QUIT_COPY.reengagementBannerBody}
                </p>
              </div>
            </div>
            <Link
              href="/quit/checkin"
              className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-medium text-xs shrink-0 transition"
            >
              1-Minute Check-in →
            </Link>
          </div>
        )}

        {/* Milestone Quick Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
          <div className="glass-panel p-4 flex flex-col items-center text-center">
            <div className="p-2.5 rounded-xl bg-emerald-500/10 text-emerald-400 mb-2">
              <Flame className="w-5 h-5" />
            </div>
            <div className="text-2xl font-bold text-white">
              {stats?.streakDays ?? 0}
            </div>
            <div className="text-xs text-slate-400 mt-0.5">Smoke-Free Days</div>
          </div>

          <div className="glass-panel p-4 flex flex-col items-center text-center">
            <div className="p-2.5 rounded-xl bg-blue-500/10 text-blue-400 mb-2">
              <Shield className="w-5 h-5" />
            </div>
            <div className="text-2xl font-bold text-white">
              {stats?.avoidedUnits ?? 0}
            </div>
            <div className="text-xs text-slate-400 mt-0.5">Units Avoided</div>
          </div>

          <div className="glass-panel p-4 flex flex-col items-center text-center">
            <div className="p-2.5 rounded-xl bg-amber-500/10 text-amber-400 mb-2">
              <TrendingUp className="w-5 h-5" />
            </div>
            <div className="text-2xl font-bold text-white">
              ₹{stats?.moneySaved?.toLocaleString('en-IN') ?? 0}
            </div>
            <div className="text-xs text-slate-400 mt-0.5">Money Saved</div>
          </div>

          <div className="glass-panel p-4 flex flex-col items-center text-center">
            <div className="p-2.5 rounded-xl bg-purple-500/10 text-purple-400 mb-2">
              <Sparkles className="w-5 h-5" />
            </div>
            <div className="text-2xl font-bold text-white">
              {stats?.cravingsSurvived ?? 0}
            </div>
            <div className="text-xs text-slate-400 mt-0.5">Cravings Overcome</div>
          </div>
        </div>

        {/* Plan Status Banner */}
        <div className="glass-panel p-5 sm:p-6 mb-8 border border-slate-700/60 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-start gap-4">
            <div className="p-3 rounded-xl bg-emerald-500/10 text-emerald-400 shrink-0">
              <Calendar className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-semibold text-white text-base">
                  {profile?.planMode === 'TAPER'
                    ? 'Gradual Taper Active'
                    : profile?.planMode === 'COLD_TURKEY'
                    ? 'Target Quit Date Active'
                    : 'Personal Quit Plan'}
                </h3>
                {profile?.planMode && (
                  <span className="px-2 py-0.5 rounded text-[10px] font-semibold tracking-wider bg-emerald-500/20 text-emerald-300 uppercase">
                    Configured
                  </span>
                )}
              </div>
              <p className="text-xs sm:text-sm text-slate-400 mt-1 max-w-xl">
                {profile?.planMode === 'TAPER'
                  ? `Today's target cap: ${profile.dailyTarget ?? 0} units. Stay mindful of your intake and log each day.`
                  : profile?.planMode === 'COLD_TURKEY' && profile.targetQuitDate
                  ? `Quit date scheduled for ${new Date(profile.targetQuitDate).toLocaleDateString('en-IN', {
                      day: 'numeric',
                      month: 'short',
                      year: 'numeric'
                    })}. Focus on stress buffers and craving delays.`
                  : 'Customize your personal tapering or quit-date strategy adapted from 5 A’s guidelines.'}
              </p>
            </div>
          </div>

          <Link
            href="/quit/plan"
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 text-xs sm:text-sm font-medium transition-colors shrink-0"
          >
            <span>{profile?.planMode ? 'View / Print Plan' : 'Setup Plan'}</span>
            <ArrowRight className="w-4 h-4 text-slate-400" />
          </Link>
        </div>

        {/* Feature Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          {/* Card 1: Daily Checkin */}
          <Link
            href="/quit/checkin"
            className="glass-panel p-5 glass-panel-hover flex flex-col justify-between group"
          >
            <div>
              <div className="flex items-center justify-between mb-3">
                <div className="p-2.5 rounded-xl bg-emerald-500/10 text-emerald-400">
                  <CheckCircle2 className="w-5 h-5" />
                </div>
                <ArrowRight className="w-4 h-4 text-slate-500 group-hover:text-emerald-400 transition-colors" />
              </div>
              <h3 className="font-semibold text-white text-base">Daily Check-In</h3>
              <p className="text-xs text-slate-400 mt-1.5 leading-relaxed">
                Log your intake, cravings, and mood. Consistent follow-up increases long-term quit rates.
              </p>
            </div>
            <div className="mt-4 pt-3 border-t border-slate-800/80 flex items-center justify-between text-xs">
              <span className="text-slate-500">Status:</span>
              <span className={todayCheckin ? 'text-emerald-400 font-medium' : 'text-amber-400'}>
                {todayCheckin ? 'Logged for today' : 'Pending today'}
              </span>
            </div>
          </Link>

          {/* Card 2: Craving SOS */}
          <Link
            href="/quit/sos"
            className="glass-panel p-5 glass-panel-hover flex flex-col justify-between group"
          >
            <div>
              <div className="flex items-center justify-between mb-3">
                <div className="p-2.5 rounded-xl bg-amber-500/10 text-amber-400">
                  <LifeBuoy className="w-5 h-5" />
                </div>
                <ArrowRight className="w-4 h-4 text-slate-500 group-hover:text-amber-400 transition-colors" />
              </div>
              <h3 className="font-semibold text-white text-base">Craving SOS</h3>
              <p className="text-xs text-slate-400 mt-1.5 leading-relaxed">
                5 rapid behavioural tools: 4-7-8 breathing, 10-minute delay timer, water, movement, and distraction.
              </p>
            </div>
            <div className="mt-4 pt-3 border-t border-slate-800/80 flex items-center justify-between text-xs">
              <span className="text-slate-500">Duration:</span>
              <span className="text-slate-300">2 to 5 minutes</span>
            </div>
          </Link>

          {/* Card 3: Milestones & Data */}
          <Link
            href="/quit/progress"
            className="glass-panel p-5 glass-panel-hover flex flex-col justify-between group"
          >
            <div>
              <div className="flex items-center justify-between mb-3">
                <div className="p-2.5 rounded-xl bg-purple-500/10 text-purple-400">
                  <TrendingUp className="w-5 h-5" />
                </div>
                <ArrowRight className="w-4 h-4 text-slate-500 group-hover:text-purple-400 transition-colors" />
              </div>
              <h3 className="font-semibold text-white text-base">Progress & Privacy</h3>
              <p className="text-xs text-slate-400 mt-1.5 leading-relaxed">
                Review your timeline, export your cessation records as JSON, or permanently delete data anytime.
              </p>
            </div>
            <div className="mt-4 pt-3 border-t border-slate-800/80 flex items-center justify-between text-xs">
              <span className="text-slate-500">Control:</span>
              <span className="text-slate-300">Self-serve export & delete</span>
            </div>
          </Link>
        </div>

        {/* TCC & National Helpline Help Guide */}
        <div className="glass-panel p-5 sm:p-6 border border-emerald-500/20 bg-emerald-950/10 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-start gap-4">
            <div className="p-3 rounded-xl bg-emerald-500/20 text-emerald-300 shrink-0">
              <HeartHandshake className="w-6 h-6" />
            </div>
            <div>
              <h3 className="font-semibold text-white text-base">
                Tobacco Cessation Centre (TCC) Resources
              </h3>
              <p className="text-xs sm:text-sm text-slate-400 mt-1">
                Learn how TCC clinics operate across India, questions to ask your doctor, and call the National Quitline.
              </p>
            </div>
          </div>
          <Link
            href="/quit/help"
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-emerald-600/20 hover:bg-emerald-600/30 text-emerald-300 border border-emerald-500/30 text-xs sm:text-sm font-medium transition-colors shrink-0"
          >
            <HelpCircle className="w-4 h-4" />
            <span>Support Directory</span>
          </Link>
        </div>
      </div>

      <QuitFooter />
    </div>
  );
}
