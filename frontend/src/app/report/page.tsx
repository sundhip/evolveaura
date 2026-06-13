"use client";
import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { apiRequest } from '../../lib/api';
import { ShieldCheck, Compass, Heart, Zap, ArrowRight } from 'lucide-react';

export default function ReportPage() {
  const router = useRouter();
  const [report, setReport] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadReport() {
      try {
        const data = await apiRequest('/assessment/latest');
        setReport(data);
      } catch (err) {
        console.error("Load report error", err);
      } finally {
        setLoading(false);
      }
    }
    loadReport();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center text-white bg-[#0F172A]">
        <div className="text-center space-y-4">
          <div className="w-12 h-12 rounded-full border-4 border-[#8B5CF6] border-t-transparent animate-spin mx-auto" />
          <p className="text-slate-400 font-medium">Analyzing your aura scores...</p>
        </div>
      </div>
    );
  }

  if (!report) {
    return (
      <div className="min-h-screen flex items-center justify-center text-white bg-[#0F172A]">
        <div className="text-center space-y-4">
          <p className="text-red-400">Failed to load report. Please complete assessment.</p>
          <button onClick={() => router.push('/assessment')} className="px-6 py-2 rounded-xl bg-[#8B5CF6]">
            Start Assessment
          </button>
        </div>
      </div>
    );
  }

  const { assessment, bottlenecks } = report;

  return (
    <div className="min-h-screen flex flex-col items-center px-4 py-12 bg-[#0F172A]">
      <div className="w-full max-w-4xl text-center space-y-4 mb-12">
        <h1 className="text-4xl font-extrabold text-white">Your Aura Report</h1>
        <p className="text-slate-400 text-sm">Evaluation results based on Self-Regulated Learning models.</p>
      </div>

      {/* Main Stats Block */}
      <div className="w-full max-w-4xl grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
        {/* Aura Score / Rank Ring */}
        <div className="glass-panel p-8 flex flex-col items-center justify-center text-center md:col-span-1 aura-glow">
          <div className="text-sm font-semibold text-[#8B5CF6] uppercase tracking-widest mb-4">Aura Rank</div>
          <div className="w-36 h-36 rounded-full border-4 border-[#8B5CF6]/30 flex flex-col items-center justify-center bg-slate-950/40 relative">
            {/* Pulsating center glow */}
            <div className="absolute inset-4 rounded-full bg-[#8B5CF6]/5 animate-ping" />
            <span className="text-6xl font-extrabold text-white relative z-10">{assessment.auraRank}</span>
            <span className="text-slate-400 text-xs mt-1 relative z-10">Score: {Math.round(assessment.auraScore)}%</span>
          </div>
          <div className="text-slate-400 text-xs mt-6 leading-relaxed max-w-xs">
            Ranks scale from E to S. Leveling up requires consistent daily detox.
          </div>
        </div>

        {/* Path Breakdowns */}
        <div className="glass-panel p-8 md:col-span-2 space-y-6">
          <h2 className="text-xl font-bold text-white mb-4">Path Attributes</h2>

          {/* Scholar */}
          <div className="space-y-2">
            <div className="flex justify-between items-center text-sm">
              <span className="flex items-center text-[#60A5FA] font-semibold">
                <Zap className="w-4 h-4 mr-2" /> Scholar (Focus & Study)
              </span>
              <span className="text-slate-300 font-bold">{Math.round(assessment.scholarScore)}%</span>
            </div>
            <div className="w-full h-2 bg-slate-800 rounded-full overflow-hidden">
              <div className="h-full bg-[#60A5FA]" style={{ width: `${assessment.scholarScore}%` }} />
            </div>
          </div>

          {/* Warrior */}
          <div className="space-y-2">
            <div className="flex justify-between items-center text-sm">
              <span className="flex items-center text-[#22C55E] font-semibold">
                <ShieldCheck className="w-4 h-4 mr-2" /> Warrior (Fitness & Routine)
              </span>
              <span className="text-slate-300 font-bold">{Math.round(assessment.warriorScore)}%</span>
            </div>
            <div className="w-full h-2 bg-slate-800 rounded-full overflow-hidden">
              <div className="h-full bg-[#22C55E]" style={{ width: `${assessment.warriorScore}%` }} />
            </div>
          </div>

          {/* Sage */}
          <div className="space-y-2">
            <div className="flex justify-between items-center text-sm">
              <span className="flex items-center text-[#2DD4BF] font-semibold">
                <Compass className="w-4 h-4 mr-2" /> Sage (Mindfulness & Stress)
              </span>
              <span className="text-slate-300 font-bold">{Math.round(assessment.sageScore)}%</span>
            </div>
            <div className="w-full h-2 bg-slate-800 rounded-full overflow-hidden">
              <div className="h-full bg-[#2DD4BF]" style={{ width: `${assessment.sageScore}%` }} />
            </div>
          </div>

          {/* Creator */}
          <div className="space-y-2">
            <div className="flex justify-between items-center text-sm">
              <span className="flex items-center text-[#F59E0B] font-semibold">
                <Heart className="w-4 h-4 mr-2" /> Creator (Curiosity & Output)
              </span>
              <span className="text-slate-300 font-bold">{Math.round(assessment.creatorScore)}%</span>
            </div>
            <div className="w-full h-2 bg-slate-800 rounded-full overflow-hidden">
              <div className="h-full bg-[#F59E0B]" style={{ width: `${assessment.creatorScore}%` }} />
            </div>
          </div>
        </div>
      </div>

      {/* Bottlenecks Card */}
      <div className="w-full max-w-4xl glass-panel p-8 mb-12 border-l-4 border-l-orange-500">
        <h2 className="text-xl font-bold text-white mb-2">Detected Growth Bottleneck</h2>
        <p className="text-slate-400 text-sm leading-relaxed mb-4">{bottlenecks.explanation}</p>
        <div className="text-slate-400 text-xs uppercase tracking-wider font-semibold">
          Focus Sub-skill Needed: <span className="text-orange-400">{bottlenecks.primary.subSkill}</span>
        </div>
      </div>

      {/* Action Button */}
      <motion.div
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
      >
        <button
          onClick={() => router.push('/dashboard')}
          className="px-8 py-4 rounded-xl bg-[#8B5CF6] hover:bg-[#7c4fe3] text-white font-bold flex items-center shadow-lg shadow-[#8B5CF6]/20 transition"
        >
          Enter Dashboard <ArrowRight className="w-5 h-5 ml-2" />
        </button>
      </motion.div>
    </div>
  );
}
