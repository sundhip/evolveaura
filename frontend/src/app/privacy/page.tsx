"use client";
import React from 'react';
import Link from 'next/link';
import { ArrowLeft, Shield, Lock, Download, Trash2, EyeOff, Server, FileText } from 'lucide-react';

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-[#0F172A] pb-16">
      <header className="border-b border-slate-800 bg-slate-900/60 backdrop-blur-md">
        <div className="max-w-6xl mx-auto px-4 py-4 flex justify-between items-center">
          <Link href="/dashboard" className="text-slate-400 hover:text-white flex items-center text-sm font-semibold">
            <ArrowLeft className="w-4 h-4 mr-2" /> Back
          </Link>
          <div className="text-white font-bold text-sm">Privacy & Data Protection</div>
        </div>
      </header>

      <div className="max-w-3xl mx-auto px-4 mt-12 space-y-8">
        <div className="glass-panel p-8 space-y-3 border-l-4 border-l-emerald-500">
          <div className="flex items-center gap-2 text-emerald-400 text-xs font-bold uppercase tracking-wider">
            <Shield className="w-4 h-4" />
            <span>Privacy First Architecture</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white">Your Health & Habit Data Belongs to You</h1>
          <p className="text-slate-350 text-xs sm:text-sm leading-relaxed">
            EvolveAura is built with privacy-by-design. We never sell your personal data, track your activity across other sites, or leak your sensitive habits into social features.
          </p>
        </div>

        {/* Section 1: Smoke-Free Path Privacy */}
        <div className="glass-panel p-6 sm:p-8 space-y-4">
          <h2 className="text-lg font-bold text-white flex items-center gap-2">
            <Lock className="w-5 h-5 text-emerald-400" />
            <span>Smoke-Free Path Confidentiality</span>
          </h2>
          <div className="space-y-3 text-slate-350 text-xs sm:text-sm leading-relaxed">
            <p>
              When you opt into the Smoke-Free Path, the following information is stored in dedicated, isolated tables:
            </p>
            <ul className="list-disc pl-5 space-y-1.5 text-slate-400">
              <li><strong>Screening Baseline:</strong> Daily tobacco quantity, time to first use, and Fagerström Dependence Score.</li>
              <li><strong>Plan Strategy:</strong> Chosen approach (Cold Turkey vs. Gradual Step-down) and target quit date.</li>
              <li><strong>Daily Check-Ins:</strong> Daily cigarette count, craving peak rating (0–10), and optional personal notes.</li>
              <li><strong>Craving Logs:</strong> Survived craving timestamps and chosen rescue tool (Breathing, Delay, Water, etc.).</li>
            </ul>
          </div>
        </div>

        {/* Section 2: Data Isolation */}
        <div className="glass-panel p-6 sm:p-8 space-y-4">
          <h2 className="text-lg font-bold text-white flex items-center gap-2">
            <EyeOff className="w-5 h-5 text-blue-400" />
            <span>Strict Isolation from Social and Game Leaderboards</span>
          </h2>
          <div className="space-y-2 text-slate-350 text-xs sm:text-sm leading-relaxed">
            <p>
              • <strong>No Leaderboard Exposure:</strong> Your smoke-free streak, cigarette counts, or lapse logs never appear on public leaderboards, peer duels, or friend activity feeds.
            </p>
            <p>
              • <strong>Equippable Titles are Neutral:</strong> Earned titles (like &quot;Wave Rider&quot; or &quot;Truth Seeker&quot;) are empowering and do not state smoking or addiction terms.
            </p>
            <p>
              • <strong>Aggregate Metrics Privacy:</strong> Platform-wide statistics (such as total community cravings survived) are only displayed in aggregate when there are 100 or more opted-in participants.
            </p>
          </div>
        </div>

        {/* Section 3: Right to Access and Right to be Forgotten */}
        <div className="glass-panel p-6 sm:p-8 space-y-4">
          <h2 className="text-lg font-bold text-white flex items-center gap-2">
            <Server className="w-5 h-5 text-purple-400" />
            <span>Right to Export & Right to be Forgotten</span>
          </h2>
          <div className="space-y-3 text-slate-350 text-xs sm:text-sm leading-relaxed">
            <p>
              Under digital privacy standards, you maintain absolute ownership of your personal health metrics:
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
              <div className="p-4 rounded-xl bg-slate-900/40 border border-slate-800 space-y-2">
                <div className="flex items-center gap-2 text-white font-semibold text-xs sm:text-sm">
                  <Download className="w-4 h-4 text-emerald-400" />
                  <span>Export Your Data (JSON)</span>
                </div>
                <p className="text-slate-400 text-xs">
                  Download a comprehensive JSON dump of your profile, all check-ins, cravings, and screening logs via the <Link href="/quit/progress" className="text-emerald-400 underline">Progress Hub</Link>.
                </p>
              </div>

              <div className="p-4 rounded-xl bg-slate-900/40 border border-slate-800 space-y-2">
                <div className="flex items-center gap-2 text-white font-semibold text-xs sm:text-sm">
                  <Trash2 className="w-4 h-4 text-red-400" />
                  <span>Permanent Erasure</span>
                </div>
                <p className="text-slate-400 text-xs">
                  Deleting your quit data permanently purges your quit profile, check-in history, craving records, and lapses from the database immediately.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Crisis Support Notice */}
        <div className="p-5 rounded-xl border border-slate-800 bg-slate-900/30 text-center space-y-1">
          <p className="text-xs text-slate-400">
            For mental health or tobacco crisis support, confidential counseling is available at:
          </p>
          <p className="text-xs font-semibold text-slate-200">
            National Tobacco Quitline: <span className="text-emerald-400">1800-11-2356</span> • Tele-MANAS: <span className="text-blue-400">14416</span>
          </p>
        </div>
      </div>
    </div>
  );
}
