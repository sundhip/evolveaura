"use client";
import React from 'react';
import Link from 'next/link';
import { ShieldCheck, Compass, Heart, Zap, ArrowLeft } from 'lucide-react';

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-[#0F172A] pb-16">
      <header className="border-b border-slate-800 bg-slate-900/60 backdrop-blur-md">
        <div className="max-w-6xl mx-auto px-4 py-4 flex justify-between items-center">
          <Link href="/dashboard" className="text-slate-400 hover:text-white flex items-center text-sm font-semibold">
            <ArrowLeft className="w-4 h-4 mr-2" /> Back
          </Link>
          <div className="text-white font-bold text-sm">About EvolveAura</div>
        </div>
      </header>

      <div className="max-w-3xl mx-auto px-4 mt-12 space-y-12">
        <div className="glass-panel p-8 space-y-4 border-l-4 border-l-[#8B5CF6]">
          <h1 className="text-3xl font-extrabold text-white">Stop Scrolling. Start Evolving.</h1>
          <p className="text-slate-350 text-sm leading-relaxed">
            EvolveAura is a digital detox platform founded on self-regulated learning and behavioral psychology models. 
            We replace dopamine loops associated with short-form videos with real-life parameters across Scholar, Warrior, Sage, and Creator paths.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="p-6 bg-slate-900/40 border border-slate-800 rounded-xl space-y-2">
            <h3 className="font-bold text-white text-base flex items-center"><Zap className="w-5 h-5 text-[#60A5FA] mr-2" /> Scholar Path</h3>
            <p className="text-slate-400 text-xs leading-relaxed">Focuses on deep study sessions, active recall revision, comprehension parameters, and structured study goals.</p>
          </div>
          <div className="p-6 bg-slate-900/40 border border-slate-800 rounded-xl space-y-2">
            <h3 className="font-bold text-white text-base flex items-center"><ShieldCheck className="w-5 h-5 text-[#22C55E] mr-2" /> Warrior Path</h3>
            <p className="text-slate-400 text-xs leading-relaxed">Governs sleep recovery hours, active walking/exercise loggers, stable day energy levels, and food discipline parameters.</p>
          </div>
          <div className="p-6 bg-slate-900/40 border border-slate-800 rounded-xl space-y-2">
            <h3 className="font-bold text-white text-base flex items-center"><Compass className="w-5 h-5 text-[#2DD4BF] mr-2" /> Sage Path</h3>
            <p className="text-slate-400 text-xs leading-relaxed">Develops mindfulness resilience, meditation timers, box breathing control, and nightly reflection summaries.</p>
          </div>
          <div className="p-6 bg-slate-900/40 border border-slate-800 rounded-xl space-y-2">
            <h3 className="font-bold text-white text-base flex items-center"><Heart className="w-5 h-5 text-[#F59E0B] mr-2" /> Creator Path</h3>
            <p className="text-slate-400 text-xs leading-relaxed">Unlocks curiosity, writing logs, blueprints layout drafts, and execution rates for personal projects.</p>
          </div>
        </div>
      </div>
    </div>
  );
}
