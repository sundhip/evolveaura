"use client";
import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { apiRequest } from '../../lib/api';
import { BarChart3, LineChart, ShieldCheck, Flame, Zap, Compass, ArrowLeft } from 'lucide-react';

export default function AnalysisPage() {
  const router = useRouter();
  const [weekly, setWeekly] = useState<any>(null);
  const [prediction, setPrediction] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadAnalysis() {
      try {
        const weeklyData = await apiRequest('/analysis/weekly');
        setWeekly(weeklyData);

        const predictionData = await apiRequest('/analysis/prediction');
        setPrediction(predictionData);
      } catch (err) {
        console.error(err);
        router.push('/login');
      } finally {
        setLoading(false);
      }
    }
    loadAnalysis();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center text-white bg-[#0F172A]">
        <div className="text-center space-y-4">
          <div className="w-12 h-12 rounded-full border-4 border-[#8B5CF6] border-t-transparent animate-spin mx-auto" />
          <p className="text-slate-400">Generating growth predictions...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0F172A] pb-16">
      {/* Navigation Header */}
      <header className="border-b border-slate-800 bg-slate-900/60 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-4 py-4 flex justify-between items-center">
          <div className="text-xl font-extrabold tracking-wider text-[#8B5CF6] cursor-pointer" onClick={() => router.push('/dashboard')}>
            EVOLVE<span className="text-white">AURA</span>
          </div>
          <nav className="flex space-x-6 text-sm font-medium">
            <Link href="/dashboard" className="text-slate-400 hover:text-white">Dashboard</Link>
            <Link href="/focus" className="text-slate-400 hover:text-white">Focus</Link>
            <Link href="/subject-analysis" className="text-slate-400 hover:text-white">Subjects</Link>
            <Link href="/analysis" className="text-white hover:text-[#8B5CF6]">Analysis</Link>
          </nav>
        </div>
      </header>

      {/* Main Container */}
      <div className="max-w-4xl mx-auto px-4 mt-10 space-y-8">
        
        {/* Weekly Stats summary */}
        <div className="glass-panel p-8 grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="p-4 bg-slate-950/40 border border-slate-850 rounded-xl flex items-center space-x-4">
            <div className="w-10 h-10 rounded-lg bg-teal-500/10 flex items-center justify-center text-[#2DD4BF]">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <div>
              <span className="text-slate-500 text-[10px] uppercase font-bold">Avg Detox Score</span>
              <div className="text-2xl font-extrabold text-white">{weekly?.averageDetoxScore || 50}%</div>
            </div>
          </div>

          <div className="p-4 bg-slate-950/40 border border-slate-850 rounded-xl flex items-center space-x-4">
            <div className="w-10 h-10 rounded-lg bg-blue-500/10 flex items-center justify-center text-[#60A5FA]">
              <BarChart3 className="w-6 h-6" />
            </div>
            <div>
              <span className="text-slate-500 text-[10px] uppercase font-bold">Focus Minutes</span>
              <div className="text-2xl font-extrabold text-white">{weekly?.focusMinutes || 0} min</div>
            </div>
          </div>

          <div className="p-4 bg-slate-950/40 border border-slate-850 rounded-xl flex items-center space-x-4">
            <div className="w-10 h-10 rounded-lg bg-purple-500/10 flex items-center justify-center text-[#8B5CF6]">
              <Flame className="w-6 h-6" />
            </div>
            <div>
              <span className="text-slate-500 text-[10px] uppercase font-bold">Quests Completed</span>
              <div className="text-2xl font-extrabold text-white">{weekly?.questsCompleted || 0}</div>
            </div>
          </div>
        </div>

        {/* Growth Simulation */}
        {prediction && (
          <div className="glass-panel p-8 space-y-6">
            <div className="flex items-center space-x-3">
              <LineChart className="w-5 h-5 text-[#8B5CF6]" />
              <h2 className="text-xl font-bold text-white">30-Day Growth Simulation</h2>
            </div>
            
            <p className="text-slate-400 text-xs leading-relaxed">
              Based on your historical quest consistency rate, the EvolveAura simulation plots your projected parameters over the next 30 days.
            </p>

            <div className="space-y-4 pt-4">
              {prediction.history.map((h: any) => (
                <div key={h.day} className="flex items-center justify-between p-4 bg-slate-900/30 border border-slate-800 rounded-xl text-xs">
                  <span className="font-bold text-slate-400">Day {h.day} Projection</span>
                  <div className="flex items-center space-x-4">
                    <span className="text-white">Level {h.level}</span>
                    <span className="text-slate-500 font-bold">({h.xp} XP carry-over)</span>
                  </div>
                </div>
              ))}
            </div>

            <div className="p-4 bg-[#8B5CF6]/10 border border-[#8B5CF6]/20 rounded-xl text-xs text-[#8B5CF6] font-semibold leading-relaxed mt-4">
              {prediction.summary}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
