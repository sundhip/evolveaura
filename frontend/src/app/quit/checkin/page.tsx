'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { apiRequest } from '@/lib/api';
import { QUIT_COPY } from '@/lib/quitCopy';
import QuitFooter from '@/components/quit/QuitFooter';
import CrisisBanner from '@/components/quit/CrisisBanner';
import {
  CheckCircle2,
  Calendar,
  Smile,
  Frown,
  Meh,
  AlertTriangle,
  History,
  ShieldAlert,
  ArrowRight
} from 'lucide-react';

export default function QuitCheckinPage() {
  const [profile, setProfile] = useState<any>(null);
  const [cigarettesSmoked, setCigarettesSmoked] = useState<number>(0);
  const [cravingCount, setCravingCount] = useState<number>(0);
  const [mood, setMood] = useState<number>(3);
  const [notes, setNotes] = useState<string>('');

  // Slip logging modal
  const [showSlipModal, setShowSlipModal] = useState<boolean>(false);
  const [slipUnits, setSlipUnits] = useState<number>(1);
  const [slipTrigger, setSlipTrigger] = useState<string>('Stress');
  const [slipNotes, setSlipNotes] = useState<string>('');

  const [history, setHistory] = useState<any[]>([]);
  const [crisisAlert, setCrisisAlert] = useState<{ triggered: boolean; reasons: string[] } | null>(null);
  const [savedNotice, setSavedNotice] = useState<boolean>(false);
  const [submitting, setSubmitting] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchInitialData();
  }, []);

  const fetchInitialData = async () => {
    try {
      setLoading(true);
      const [profRes, todayRes, histRes] = await Promise.all([
        apiRequest('/quit/profile'),
        apiRequest('/quit/checkin/today'),
        apiRequest('/quit/checkin/history?days=7')
      ]);

      setProfile(profRes.profile);
      if (todayRes.checkIn) {
        setCigarettesSmoked(todayRes.checkIn.cigarettesSmoked ?? 0);
        setCravingCount(todayRes.checkIn.cravingCount ?? 0);
        setMood(todayRes.checkIn.mood ?? 3);
        setNotes(todayRes.checkIn.notes ?? '');
      }
      setHistory(histRes.checkIns || []);
    } catch (err: any) {
      setError(err.message || 'Failed to load check-in data');
    } finally {
      setLoading(false);
    }
  };

  const handleSaveCheckin = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setSubmitting(true);
      setError(null);
      setSavedNotice(false);

      const res = await apiRequest('/quit/checkin', {
        method: 'POST',
        body: JSON.stringify({
          cigarettesSmoked: Number(cigarettesSmoked),
          cravingCount: Number(cravingCount),
          mood: Number(mood),
          notes
        })
      });

      if (res.crisisAlert?.triggered) {
        setCrisisAlert(res.crisisAlert);
      } else {
        setCrisisAlert(null);
      }

      setSavedNotice(true);
      setTimeout(() => setSavedNotice(false), 4000);

      // Refresh history
      const histRes = await apiRequest('/quit/checkin/history?days=7');
      setHistory(histRes.checkIns || []);
    } catch (err: any) {
      setError(err.message || 'Failed to save check-in');
    } finally {
      setSubmitting(false);
    }
  };

  const handleLogSlip = async () => {
    try {
      setSubmitting(true);
      setError(null);

      await apiRequest('/quit/lapse', {
        method: 'POST',
        body: JSON.stringify({
          unitsSmoked: Number(slipUnits),
          trigger: slipTrigger,
          notes: slipNotes
        })
      });

      setShowSlipModal(false);
      setSavedNotice(true);
      setTimeout(() => setSavedNotice(false), 4000);

      // Update today's count
      setCigarettesSmoked((prev) => prev + Number(slipUnits));
    } catch (err: any) {
      setError(err.message || 'Failed to record slip');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0F172A] text-slate-100 flex items-center justify-center p-4">
        <div className="w-10 h-10 border-4 border-emerald-500/20 border-t-emerald-500 rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0F172A] text-slate-100 flex flex-col justify-between p-4 sm:p-6 lg:p-8">
      <div className="max-w-3xl mx-auto w-full">
        {/* Navigation Breadcrumb */}
        <div className="flex items-center justify-between mb-6">
          <Link
            href="/quit"
            className="text-xs text-slate-400 hover:text-emerald-400 transition-colors flex items-center gap-1"
          >
            ← Back to Smoke-Free Hub
          </Link>
          <button
            type="button"
            onClick={() => setShowSlipModal(true)}
            className="text-xs px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 transition-colors"
          >
            {QUIT_COPY.lapseModalTitle}
          </button>
        </div>

        {/* Crisis Banner if triggered */}
        {crisisAlert?.triggered && (
          <CrisisBanner reason={crisisAlert.reasons.join('; ')} />
        )}

        {/* Header */}
        <div className="mb-8">
          <h1 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">
            {QUIT_COPY.checkinTitle}
          </h1>
          <p className="text-sm text-slate-400 mt-1">
            {QUIT_COPY.checkinSubtitle}
          </p>
        </div>

        {error && (
          <div className="mb-6 p-4 rounded-xl border border-red-500/30 bg-red-950/30 text-red-200 text-sm">
            {error}
          </div>
        )}

        {savedNotice && (
          <div className="mb-6 p-4 rounded-xl border border-emerald-500/30 bg-emerald-950/30 text-emerald-200 text-sm flex items-center gap-2">
            <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
            <span>{QUIT_COPY.checkinSavedMessage}</span>
          </div>
        )}

        {/* Daily Target Context Card */}
        {profile?.dailyTarget !== undefined && (
          <div className="glass-panel p-4 mb-6 flex items-center justify-between border-slate-700">
            <div className="flex items-center gap-3">
              <Calendar className="w-5 h-5 text-emerald-400" />
              <div>
                <div className="text-xs text-slate-400">Today's Planned Target Cap</div>
                <div className="text-lg font-bold text-white">
                  {profile.dailyTarget} {profile.tobaccoType?.toLowerCase() || 'units'}
                </div>
              </div>
            </div>
            <span className="text-xs text-slate-500">
              {profile.planMode === 'TAPER' ? 'Step-down Phase' : 'Zero Tolerance Phase'}
            </span>
          </div>
        )}

        {/* Check-in Form */}
        <form onSubmit={handleSaveCheckin} className="glass-panel p-6 sm:p-8 space-y-6 mb-8">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-2">
                {QUIT_COPY.cigarettesSmokedToday}
              </label>
              <input
                type="number"
                min="0"
                max="100"
                value={cigarettesSmoked}
                onChange={(e) => setCigarettesSmoked(Math.max(0, parseInt(e.target.value) || 0))}
                className="w-full px-4 py-2.5 rounded-lg bg-slate-900 border border-slate-700 text-slate-200 text-sm focus:border-emerald-500 outline-none"
              />
              <p className="text-[11px] text-slate-500 mt-1">
                Enter 0 if you stayed completely smoke-free today!
              </p>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-300 mb-2">
                {QUIT_COPY.cravingCountToday}
              </label>
              <input
                type="number"
                min="0"
                max="50"
                value={cravingCount}
                onChange={(e) => setCravingCount(Math.max(0, parseInt(e.target.value) || 0))}
                className="w-full px-4 py-2.5 rounded-lg bg-slate-900 border border-slate-700 text-slate-200 text-sm focus:border-emerald-500 outline-none"
              />
              <p className="text-[11px] text-slate-500 mt-1">
                Number of strong urges noticed during the day.
              </p>
            </div>
          </div>

          {/* Mood Selector (1 to 5) */}
          <div>
            <label className="block text-xs font-medium text-slate-300 mb-2">
              {QUIT_COPY.moodLabel}
            </label>
            <div className="grid grid-cols-5 gap-2">
              {[
                { val: 1, label: 'Very Low', icon: Frown, color: 'text-red-400' },
                { val: 2, label: 'Low', icon: Frown, color: 'text-amber-400' },
                { val: 3, label: 'Neutral', icon: Meh, color: 'text-yellow-400' },
                { val: 4, label: 'Good', icon: Smile, color: 'text-emerald-400' },
                { val: 5, label: 'Great', icon: Smile, color: 'text-emerald-300' }
              ].map((m) => {
                const IconComponent = m.icon;
                const isSelected = mood === m.val;
                return (
                  <button
                    key={m.val}
                    type="button"
                    onClick={() => setMood(m.val)}
                    className={`flex flex-col items-center justify-center py-2.5 px-1 rounded-xl border text-xs transition-all ${
                      isSelected
                        ? 'bg-emerald-500/20 border-emerald-500/60 text-white font-semibold shadow'
                        : 'bg-slate-900/60 border-slate-800 text-slate-400 hover:border-slate-700'
                    }`}
                  >
                    <IconComponent className={`w-5 h-5 mb-1 ${m.color}`} />
                    <span className="text-[11px]">{m.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Notes */}
          <div>
            <label className="block text-xs font-medium text-slate-300 mb-2">
              {QUIT_COPY.notesLabel}
            </label>
            <textarea
              rows={3}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder={QUIT_COPY.notesPlaceholder}
              className="w-full px-4 py-2.5 rounded-lg bg-slate-900 border border-slate-700 text-slate-200 text-sm focus:border-emerald-500 outline-none"
            />
          </div>

          <button
            type="submit"
            disabled={submitting}
            className="w-full py-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white font-medium text-sm transition-all shadow-lg shadow-emerald-950/30 flex items-center justify-center gap-2"
          >
            <span>{submitting ? 'Recording Check-in...' : 'Save Today’s Check-In'}</span>
            <CheckCircle2 className="w-4 h-4" />
          </button>
        </form>

        {/* 7-Day History Table */}
        {history.length > 0 && (
          <div className="glass-panel p-6 sm:p-8">
            <div className="flex items-center gap-2 mb-4">
              <History className="w-4 h-4 text-emerald-400" />
              <h3 className="font-semibold text-white text-base">Past 7 Days History</h3>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-slate-300">
                <thead>
                  <tr className="border-b border-slate-800 text-slate-500">
                    <th className="py-2 px-3">Date</th>
                    <th className="py-2 px-3">Smoked</th>
                    <th className="py-2 px-3">Cravings</th>
                    <th className="py-2 px-3">Mood</th>
                    <th className="py-2 px-3">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60">
                  {history.map((h) => (
                    <tr key={h.id} className="hover:bg-slate-900/40">
                      <td className="py-2.5 px-3">
                        {new Date(h.date).toLocaleDateString('en-IN', {
                          month: 'short',
                          day: 'numeric'
                        })}
                      </td>
                      <td className="py-2.5 px-3 font-semibold text-white">
                        {h.cigarettesSmoked}
                      </td>
                      <td className="py-2.5 px-3">{h.cravingCount}</td>
                      <td className="py-2.5 px-3">{h.mood}/5</td>
                      <td className="py-2.5 px-3">
                        {h.isSmokeFree ? (
                          <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-emerald-500/20 text-emerald-300">
                            Smoke-Free
                          </span>
                        ) : (
                          <span className="px-2 py-0.5 rounded text-[10px] bg-slate-800 text-slate-400">
                            Logged
                          </span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Slip / Lapse Modal */}
        {showSlipModal && (
          <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
            <div className="glass-panel p-6 sm:p-8 max-w-md w-full border border-slate-700 shadow-2xl">
              <div className="flex items-center gap-3 mb-2">
                <div className="p-2 rounded-lg bg-amber-500/20 text-amber-400">
                  <ShieldAlert className="w-5 h-5" />
                </div>
                <h3 className="font-bold text-white text-lg">
                  {QUIT_COPY.lapseModalTitle}
                </h3>
              </div>
              <p className="text-xs text-slate-300 leading-relaxed mb-6">
                {QUIT_COPY.lapseModalSubtitle}
              </p>

              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">
                    {QUIT_COPY.lapseUnitsLabel}
                  </label>
                  <input
                    type="number"
                    min="1"
                    max="50"
                    value={slipUnits}
                    onChange={(e) => setSlipUnits(Math.max(1, parseInt(e.target.value) || 1))}
                    className="w-full px-3 py-2 rounded-lg bg-slate-900 border border-slate-700 text-slate-200 text-xs focus:border-amber-500 outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">
                    {QUIT_COPY.lapseTriggerLabel}
                  </label>
                  <input
                    type="text"
                    value={slipTrigger}
                    onChange={(e) => setSlipTrigger(e.target.value)}
                    placeholder="e.g. Work stress, party with friends..."
                    className="w-full px-3 py-2 rounded-lg bg-slate-900 border border-slate-700 text-slate-200 text-xs focus:border-amber-500 outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">
                    {QUIT_COPY.lapseNotesLabel}
                  </label>
                  <textarea
                    rows={2}
                    value={slipNotes}
                    onChange={(e) => setSlipNotes(e.target.value)}
                    placeholder="e.g. Next time I'll carry chewing cloves or use 4-7-8 breathing..."
                    className="w-full px-3 py-2 rounded-lg bg-slate-900 border border-slate-700 text-slate-200 text-xs focus:border-amber-500 outline-none"
                  />
                </div>

                <p className="text-[11px] text-amber-300/80 italic">
                  {QUIT_COPY.lapseEncouragement}
                </p>

                <div className="flex items-center justify-end gap-3 pt-4">
                  <button
                    type="button"
                    onClick={() => setShowSlipModal(false)}
                    className="px-4 py-2 text-xs text-slate-400 hover:text-slate-200"
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    disabled={submitting}
                    onClick={handleLogSlip}
                    className="px-4 py-2 rounded-lg bg-amber-600 hover:bg-amber-500 text-white font-medium text-xs transition-colors shadow"
                  >
                    {submitting ? 'Saving...' : QUIT_COPY.lapseSubmitButton}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      <QuitFooter />
    </div>
  );
}
