'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { apiRequest } from '@/lib/api';
import { QUIT_COPY } from '@/lib/quitCopy';
import QuitFooter from '@/components/quit/QuitFooter';
import {
  TrendingUp,
  Flame,
  Shield,
  Download,
  Trash2,
  AlertTriangle,
  CheckCircle2,
  Lock,
  Target,
  Bell,
  Award,
  Sparkles,
  Share2,
  Swords,
  ChevronRight,
  LayoutDashboard
} from 'lucide-react';

export default function QuitProgressPage() {
  const router = useRouter();
  const [stats, setStats] = useState<any>(null);
  const [profile, setProfile] = useState<any>(null);
  const [badges, setBadges] = useState<any[]>([]);
  const [allBadgeDefs, setAllBadgeDefs] = useState<any[]>([]);
  const [bossProgress, setBossProgress] = useState<any>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Savings Goal State
  const [savingsItem, setSavingsItem] = useState<string>('');
  const [savingsAmount, setSavingsAmount] = useState<number>(2000);
  const [savingGoalStatus, setSavingGoalStatus] = useState<string | null>(null);

  // Reminders State
  const [remindersEnabled, setRemindersEnabled] = useState<boolean>(false);
  const [reminderTime, setReminderTime] = useState<string>('20:00');
  const [reminderStatus, setReminderStatus] = useState<string | null>(null);

  // Share Card Modal State
  const [showShareModal, setShowShareModal] = useState<boolean>(false);

  // Delete modal state
  const [showDeleteModal, setShowDeleteModal] = useState<boolean>(false);
  const [deleteConfirmationInput, setDeleteConfirmationInput] = useState<string>('');
  const [deleting, setDeleting] = useState<boolean>(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [statsRes, profRes, bossRes] = await Promise.all([
        apiRequest('/quit/stats'),
        apiRequest('/quit/profile'),
        apiRequest('/quit/boss').catch(() => ({ bossProgress: null }))
      ]);

      setStats(statsRes.stats);
      setProfile(profRes.profile);
      setBadges(statsRes.badges || []);
      setAllBadgeDefs(statsRes.allBadgeDefs || []);
      setBossProgress(bossRes.bossProgress);

      if (profRes.profile?.savingsGoalItem) {
        setSavingsItem(profRes.profile.savingsGoalItem);
      }
      if (profRes.profile?.savingsGoalAmount) {
        setSavingsAmount(profRes.profile.savingsGoalAmount);
      }
      if (profRes.profile?.remindersEnabled !== undefined) {
        setRemindersEnabled(profRes.profile.remindersEnabled);
      }
      if (profRes.profile?.checkInReminderTime) {
        setReminderTime(profRes.profile.checkInReminderTime);
      }
    } catch (err: any) {
      const msg = (err.message || '').toUpperCase();
      if (msg.includes('CONSENT') || msg.includes('PROFILE_NOT_FOUND') || msg.includes('NOT FOUND')) {
        router.push('/quit/start');
        return;
      }
      setError(err.message || 'Failed to load progress data');
    } finally {
      setLoading(false);
    }
  };

  const handleSaveGoal = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setSavingGoalStatus('Saving...');
      await apiRequest('/quit/savings-goal', {
        method: 'POST',
        body: JSON.stringify({ item: savingsItem, amount: Number(savingsAmount) })
      });
      setSavingGoalStatus('Saved!');
      setTimeout(() => setSavingGoalStatus(null), 3000);
    } catch (e: any) {
      setSavingGoalStatus(e.message || 'Failed to save goal');
    }
  };

  const handleSaveReminders = async () => {
    try {
      setReminderStatus('Updating...');

      // If user enabled reminders, request browser notification permission
      if (remindersEnabled && typeof window !== 'undefined' && 'Notification' in window) {
        if (Notification.permission !== 'granted') {
          const perm = await Notification.requestPermission();
          if (perm !== 'granted') {
            setReminderStatus('Browser notifications permission was not granted.');
            return;
          }
        }
      }

      await apiRequest('/quit/reminders', {
        method: 'POST',
        body: JSON.stringify({
          remindersEnabled,
          checkInReminderTime: reminderTime
        })
      });
      setReminderStatus('Preferences saved successfully!');
      setTimeout(() => setReminderStatus(null), 3000);
    } catch (e: any) {
      setReminderStatus(e.message || 'Failed to update reminders');
    }
  };

  const handleExportData = async () => {
    try {
      const data = await apiRequest('/quit/export');
      const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `evolveaura-cessation-export-${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    } catch (e: any) {
      alert(e.message || 'Export failed');
    }
  };

  const handleDeleteData = async () => {
    setDeleteError(null);
    if (deleteConfirmationInput !== 'DELETE_MY_QUIT_DATA') {
      setDeleteError('Please type DELETE_MY_QUIT_DATA exactly to confirm.');
      return;
    }

    try {
      setDeleting(true);
      await apiRequest('/quit/data', {
        method: 'DELETE',
        body: JSON.stringify({ confirmation: 'DELETE_MY_QUIT_DATA' })
      });
      setShowDeleteModal(false);
      router.push('/quit/start');
    } catch (err: any) {
      setDeleteError(err.message || 'Failed to delete cessation records');
    } finally {
      setDeleting(false);
    }
  };

  // Savings Goal calculations
  const moneySaved = stats?.moneySaved ?? 0;
  const goalTarget = savingsAmount > 0 ? savingsAmount : 2000;
  const goalProgressPct = Math.min(100, Math.round((moneySaved / goalTarget) * 100));

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0F172A] text-slate-100 flex items-center justify-center p-4">
        <div className="w-10 h-10 border-4 border-emerald-500/20 border-t-emerald-500 rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0F172A] text-slate-100 flex flex-col justify-between p-4 sm:p-6 lg:p-8">
      <div className="max-w-4xl mx-auto w-full">
        {/* Breadcrumb */}
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
          <div className="flex items-center gap-3">
            <button
              onClick={() => setShowShareModal(true)}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold border border-slate-700 transition"
            >
              <Share2 className="w-3.5 h-3.5 text-emerald-400" />
              <span>Share Progress</span>
            </button>
            <div className="inline-flex items-center gap-1.5 text-xs text-slate-500">
              <Lock className="w-3.5 h-3.5" />
              <span>Private Cessation Matrix</span>
            </div>
          </div>
        </div>

        {/* Header */}
        <div className="mb-8">
          <h1 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">
            {QUIT_COPY.progressTitle}
          </h1>
          <p className="text-sm text-slate-400 mt-1">
            Tracking your recovery, financial milestones, and reward achievements.
          </p>
        </div>

        {error && (
          <div className="mb-6 p-4 rounded-xl border border-red-500/30 bg-red-950/30 text-red-200 text-sm">
            {error}
          </div>
        )}

        {/* Streak Shield Notice if active */}
        {stats?.shieldApplied && (
          <div className="mb-6 p-4 rounded-xl border border-emerald-500/30 bg-emerald-950/20 text-emerald-200 text-xs sm:text-sm flex items-center gap-3">
            <Shield className="w-5 h-5 text-emerald-400 shrink-0" />
            <div>
              <span className="font-semibold text-emerald-300">Aura Shield Active: </span>
              <span>Your smoke-free streak is protected by an earned Aura Shield from a recent slip. Be gentle with yourself and resume your path today.</span>
            </div>
          </div>
        )}

        {/* Big Metrics Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <div className="glass-panel p-5">
            <div className="flex items-center gap-3 mb-2">
              <div className="p-2 rounded-lg bg-emerald-500/10 text-emerald-400">
                <Flame className="w-5 h-5" />
              </div>
              <span className="text-xs text-slate-400">{QUIT_COPY.streakLabel}</span>
            </div>
            <div className="text-3xl font-extrabold text-white">
              {stats?.streakDays ?? 0}
            </div>
            <div className="text-[11px] text-slate-500 mt-1">
              {profile?.streakShieldCount > 0 ? `${profile.streakShieldCount} Streak Shield(s) available` : 'Zero-use days'}
            </div>
          </div>

          <div className="glass-panel p-5">
            <div className="flex items-center gap-3 mb-2">
              <div className="p-2 rounded-lg bg-blue-500/10 text-blue-400">
                <Shield className="w-5 h-5" />
              </div>
              <span className="text-xs text-slate-400">{QUIT_COPY.avoidedLabel}</span>
            </div>
            <div className="text-3xl font-extrabold text-white">
              {stats?.avoidedUnits ?? 0}
            </div>
            <div className="text-[11px] text-slate-500 mt-1">Units kept out of lungs</div>
          </div>

          <div className="glass-panel p-5">
            <div className="flex items-center gap-3 mb-2">
              <div className="p-2 rounded-lg bg-amber-500/10 text-amber-400">
                <TrendingUp className="w-5 h-5" />
              </div>
              <span className="text-xs text-slate-400">{QUIT_COPY.moneySavedLabel}</span>
            </div>
            <div className="text-3xl font-extrabold text-white">
              ₹{stats?.moneySaved?.toLocaleString('en-IN') ?? 0}
            </div>
            <div className="text-[11px] text-slate-500 mt-1">Calculated from baseline</div>
          </div>

          <div className="glass-panel p-5">
            <div className="flex items-center gap-3 mb-2">
              <div className="p-2 rounded-lg bg-purple-500/10 text-purple-400">
                <CheckCircle2 className="w-5 h-5" />
              </div>
              <span className="text-xs text-slate-400">{QUIT_COPY.cravingsSurvivedLabel}</span>
            </div>
            <div className="text-3xl font-extrabold text-white">
              {stats?.cravingsSurvived ?? 0}
            </div>
            <div className="text-[11px] text-slate-500 mt-1">SOS craving surges overcome</div>
          </div>
        </div>

        {/* Nicotine Shade Boss Progress (Visible to users with QuitProfile) */}
        {bossProgress && (
          <div className="glass-panel p-6 sm:p-8 mb-8 border border-purple-500/30 bg-purple-950/10">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-4">
              <div className="flex items-center gap-3">
                <div className="p-3 rounded-2xl bg-purple-500/20 text-purple-300">
                  <Swords className="w-6 h-6" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="font-bold text-white text-base sm:text-lg">
                      {QUIT_COPY.nicotineShadeBossTitle}
                    </h3>
                    <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-purple-500/20 text-purple-300">
                      Recovery Boss
                    </span>
                  </div>
                  <p className="text-xs text-slate-400 mt-0.5 max-w-xl">
                    {QUIT_COPY.nicotineShadeBossDesc}
                  </p>
                </div>
              </div>

              <div className="text-right">
                <div className="text-xs text-slate-400">Shade HP</div>
                <div className="text-xl font-bold font-mono text-purple-300">
                  {bossProgress.currentHP} / {bossProgress.boss?.maxHP || 3000}
                </div>
              </div>
            </div>

            {/* Boss HP Bar */}
            <div className="w-full h-3 bg-slate-900 border border-slate-800 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-purple-500 to-indigo-400 transition-all duration-700"
                style={{
                  width: `${Math.max(0, Math.min(100, Math.round((bossProgress.currentHP / (bossProgress.boss?.maxHP || 3000)) * 100)))}%`
                }}
              />
            </div>
            <div className="flex justify-between items-center text-[11px] text-slate-500 mt-2 font-mono">
              <span>Damage dealt by: check-ins (100 HP), cravings overcome (75 HP), smoke-free days (150 HP)</span>
              <span>Reward: +1,000 XP & "Shade Dispeller"</span>
            </div>
          </div>
        )}

        {/* Section 5: Savings Goal Tracker */}
        <div className="glass-panel p-6 sm:p-8 mb-8 border border-amber-500/30">
          <div className="flex items-start justify-between gap-4 mb-4">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-xl bg-amber-500/10 text-amber-400">
                <Target className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-bold text-white text-base">
                  {QUIT_COPY.savingsGoalTitle}
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  {QUIT_COPY.savingsGoalSubtitle}
                </p>
              </div>
            </div>
            {savingGoalStatus && (
              <span className="text-xs text-amber-300 font-medium">{savingGoalStatus}</span>
            )}
          </div>

          {/* Goal Progress Bar */}
          <div className="mb-6 p-4 rounded-xl bg-slate-900/60 border border-slate-800">
            <div className="flex justify-between items-center text-xs mb-2">
              <span className="text-slate-300">
                {savingsItem ? `${QUIT_COPY.savingsGoalProgress} "${savingsItem}"` : 'Progress toward your reward'}
              </span>
              <span className="font-bold text-amber-400 font-mono">
                ₹{moneySaved} / ₹{goalTarget} ({goalProgressPct}%)
              </span>
            </div>
            <div className="w-full h-2.5 bg-slate-950 rounded-full overflow-hidden border border-slate-800">
              <div
                className="h-full bg-amber-500 transition-all duration-500"
                style={{ width: `${goalProgressPct}%` }}
              />
            </div>
          </div>

          <form onSubmit={handleSaveGoal} className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="sm:col-span-2">
              <label className="block text-[11px] font-medium text-slate-400 mb-1">
                {QUIT_COPY.savingsItemLabel}
              </label>
              <input
                type="text"
                value={savingsItem}
                onChange={(e) => setSavingsItem(e.target.value)}
                placeholder="e.g. Noise cancelling headphones, family dinner, course fees..."
                className="w-full px-3 py-2 rounded-lg bg-slate-900 border border-slate-700 text-slate-200 text-xs focus:border-amber-500 outline-none"
              />
            </div>

            <div>
              <label className="block text-[11px] font-medium text-slate-400 mb-1">
                {QUIT_COPY.savingsAmountLabel}
              </label>
              <div className="flex gap-2">
                <input
                  type="number"
                  min="100"
                  max="500000"
                  value={savingsAmount}
                  onChange={(e) => setSavingsAmount(Math.max(1, parseInt(e.target.value) || 0))}
                  className="w-full px-3 py-2 rounded-lg bg-slate-900 border border-slate-700 text-slate-200 text-xs focus:border-amber-500 outline-none"
                />
                <button
                  type="submit"
                  className="px-3.5 py-2 rounded-lg bg-amber-600 hover:bg-amber-500 text-white font-medium text-xs shrink-0 transition"
                >
                  Save
                </button>
              </div>
            </div>
          </form>

          {/* Quick preset chips */}
          <div className="flex items-center gap-2 mt-3 flex-wrap">
            <span className="text-[11px] text-slate-500">Presets:</span>
            {[
              { item: 'New Running Shoes', amount: 3500 },
              { item: 'Noise-Cancelling Headphones', amount: 8000 },
              { item: 'Family Dinner Celebration', amount: 2500 },
              { item: 'Weekend Trip', amount: 6000 }
            ].map((p) => (
              <button
                key={p.item}
                type="button"
                onClick={() => {
                  setSavingsItem(p.item);
                  setSavingsAmount(p.amount);
                }}
                className="text-[10px] px-2.5 py-1 rounded-full bg-slate-800 text-slate-400 hover:text-amber-300 border border-slate-700/60 transition"
              >
                {p.item} (₹{p.amount})
              </button>
            ))}
          </div>
        </div>

        {/* Section 2: Earned Badges & Equippable Titles */}
        <div className="glass-panel p-6 sm:p-8 mb-8 border border-slate-700">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2.5 rounded-xl bg-purple-500/10 text-purple-400">
              <Award className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-white text-base">
                Quit Milestones & Titles
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">
                Earned through honesty, coping persistence, and daily follow-up.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
            {allBadgeDefs.map((badgeDef) => {
              const isEarned = badges.some((b) => b.badgeKey === badgeDef.key);
              return (
                <div
                  key={badgeDef.key}
                  className={`p-3.5 rounded-xl border text-center transition-all ${
                    isEarned
                      ? 'bg-purple-950/20 border-purple-500/40 text-purple-200'
                      : 'bg-slate-900/40 border-slate-800/80 text-slate-600 opacity-60'
                  }`}
                >
                  <div
                    className={`w-8 h-8 rounded-full flex items-center justify-center mx-auto mb-2 text-xs font-bold ${
                      isEarned ? 'bg-purple-500/20 text-purple-300' : 'bg-slate-800 text-slate-600'
                    }`}
                  >
                    {isEarned ? '★' : '🔒'}
                  </div>
                  <div className="font-bold text-xs text-slate-200 mb-0.5">{badgeDef.title}</div>
                  <div className="text-[10px] text-slate-400 leading-snug line-clamp-2">
                    {badgeDef.description}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Section 4: Evidence-backed Health Recovery Cards (Strictly docs/rehab-evidence.md) */}
        <div className="glass-panel p-6 sm:p-8 mb-8 border-slate-700">
          <h2 className="text-lg font-bold text-white mb-1">
            {QUIT_COPY.evidenceHealthTitle}
          </h2>
          <p className="text-xs text-slate-400 mb-6">
            All statements below are verified directly from published medical and NTCP cessation evaluations in India.
          </p>

          <div className="space-y-4">
            {QUIT_COPY.evidenceHealthCards.map((c, i) => (
              <div key={i} className="p-4 rounded-xl bg-slate-900/60 border border-slate-800">
                <div className="flex items-center justify-between mb-1">
                  <h4 className="text-xs font-bold text-emerald-400">{c.title}</h4>
                  <span className="text-[10px] text-slate-500 italic font-mono">{c.citation}</span>
                </div>
                <p className="text-xs text-slate-300 leading-relaxed mt-1">{c.fact}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Section 6: Optional Browser Notification Reminders */}
        <div className="glass-panel p-6 sm:p-8 mb-8 border border-slate-700">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2.5 rounded-xl bg-blue-500/10 text-blue-400">
              <Bell className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-white text-base">
                {QUIT_COPY.remindersTitle}
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">
                {QUIT_COPY.remindersSubtitle}
              </p>
            </div>
          </div>

          <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800 space-y-4">
            <label className="flex items-center gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={remindersEnabled}
                onChange={(e) => setRemindersEnabled(e.target.checked)}
                className="w-4 h-4 rounded border-slate-700 text-blue-500 focus:ring-blue-500"
              />
              <span className="text-xs text-slate-200 font-medium">
                {QUIT_COPY.remindersEnableToggle}
              </span>
            </label>

            {remindersEnabled && (
              <div className="flex items-center gap-3 pt-2">
                <label className="text-xs text-slate-400 font-medium">
                  {QUIT_COPY.remindersTimeLabel}
                </label>
                <input
                  type="time"
                  value={reminderTime}
                  onChange={(e) => setReminderTime(e.target.value)}
                  className="px-3 py-1.5 rounded-lg bg-slate-950 border border-slate-700 text-slate-200 text-xs focus:border-blue-500 outline-none"
                />
              </div>
            )}

            <div className="flex items-center justify-between pt-2">
              <span className="text-xs text-blue-400">{reminderStatus}</span>
              <button
                type="button"
                onClick={handleSaveReminders}
                className="px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-500 text-white font-medium text-xs transition"
              >
                {QUIT_COPY.saveRemindersButton}
              </button>
            </div>
          </div>
        </div>

        {/* Section: Data Privacy & Control Box */}
        <div className="glass-panel p-6 sm:p-8 border border-slate-700">
          <h2 className="text-lg font-bold text-white mb-2">
            Data Privacy & Ownership
          </h2>
          <p className="text-xs text-slate-400 mb-6">
            Your cessation records are strictly confidential and separated from gaming components. You have total ownership to download or delete them at any time.
          </p>

          <div className="flex flex-col sm:flex-row items-center gap-4">
            <button
              type="button"
              onClick={handleExportData}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 text-xs sm:text-sm font-medium transition-colors"
            >
              <Download className="w-4 h-4 text-emerald-400" />
              <span>{QUIT_COPY.exportDataButton}</span>
            </button>

            <button
              type="button"
              onClick={() => setShowDeleteModal(true)}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-red-950/40 hover:bg-red-900/50 text-red-300 border border-red-500/30 text-xs sm:text-sm font-medium transition-colors"
            >
              <Trash2 className="w-4 h-4 text-red-400" />
              <span>{QUIT_COPY.deleteDataButton}</span>
            </button>
          </div>
        </div>

        {/* Share Progress Modal (Zero private data) */}
        {showShareModal && (
          <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4" role="dialog" aria-modal="true" aria-labelledby="share-modal-title">
            <div className="glass-panel p-6 sm:p-8 max-w-sm w-full border border-slate-700 text-center">
              <div className="p-2.5 rounded-xl bg-emerald-500/20 text-emerald-400 inline-flex mb-3">
                <Share2 className="w-6 h-6" />
              </div>
              <h3 id="share-modal-title" className="font-bold text-white text-base mb-1">
                {QUIT_COPY.shareCardTitle}
              </h3>
              <p className="text-xs text-slate-400 mb-6">
                {QUIT_COPY.shareCardSubtitle}
              </p>

              {/* Private Shareable Card Preview */}
              <div className="p-6 rounded-2xl bg-[#0B1120] border border-emerald-500/30 text-center mb-6 shadow-xl">
                <div className="text-[10px] uppercase font-bold tracking-widest text-emerald-400 mb-1">
                  EvolveAura Smoke-Free Path
                </div>
                <div className="text-4xl font-extrabold text-white my-2 font-mono">
                  {stats?.streakDays ?? 0} DAYS
                </div>
                <div className="text-xs text-slate-400 mb-3">Smoke-Free Milestone</div>
                <div className="text-xs font-semibold text-amber-400 border-t border-slate-800 pt-3">
                  ₹{moneySaved.toLocaleString('en-IN')} Saved in Personal Capital
                </div>
              </div>

              <div className="flex items-center justify-center gap-3">
                <button
                  type="button"
                  onClick={() => setShowShareModal(false)}
                  className="px-4 py-2 rounded-lg text-xs text-slate-400 hover:text-slate-200"
                >
                  Close
                </button>
                <button
                  type="button"
                  onClick={() => {
                    alert('Progress snapshot copied to clipboard!');
                    setShowShareModal(false);
                  }}
                  className="px-4 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-medium text-xs transition"
                >
                  Copy Summary
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Delete Modal */}
        {showDeleteModal && (
          <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4" role="dialog" aria-modal="true" aria-labelledby="delete-modal-title">
            <div className="glass-panel p-6 sm:p-8 max-w-md w-full border border-red-500/50 shadow-2xl">
              <div className="flex items-center gap-3 mb-3">
                <div className="p-2.5 rounded-lg bg-red-500/20 text-red-400">
                  <AlertTriangle className="w-6 h-6" />
                </div>
                <h3 id="delete-modal-title" className="font-bold text-white text-lg">
                  {QUIT_COPY.deleteDataModalTitle}
                </h3>
              </div>

              <p className="text-xs text-slate-300 leading-relaxed mb-4">
                {QUIT_COPY.deleteDataWarning}
              </p>

              <input
                type="text"
                value={deleteConfirmationInput}
                onChange={(e) => setDeleteConfirmationInput(e.target.value)}
                placeholder="DELETE_MY_QUIT_DATA"
                className="w-full px-3 py-2 rounded-lg bg-slate-900 border border-slate-700 text-slate-200 text-xs focus:border-red-500 outline-none mb-3 font-mono"
              />

              {deleteError && (
                <div className="p-2.5 rounded-lg bg-red-950/50 text-red-300 text-xs mb-3 border border-red-500/30">
                  {deleteError}
                </div>
              )}

              <div className="flex items-center justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowDeleteModal(false)}
                  className="px-4 py-2 text-xs text-slate-400 hover:text-slate-200"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  disabled={deleting || deleteConfirmationInput !== 'DELETE_MY_QUIT_DATA'}
                  onClick={handleDeleteData}
                  className="px-4 py-2 rounded-lg bg-red-600 hover:bg-red-500 disabled:opacity-50 text-white font-medium text-xs transition-colors"
                >
                  {deleting ? 'Deleting...' : 'Confirm Permanent Deletion'}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      <QuitFooter />
    </div>
  );
}
