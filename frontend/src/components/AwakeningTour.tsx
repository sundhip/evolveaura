"use client";
import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowRight, Compass, ShieldAlert, Zap, Heart } from 'lucide-react';

interface TourProps {
  bottleneck: string;
  onComplete: () => void;
}

export default function AwakeningTour({ bottleneck, onComplete }: TourProps) {
  const [step, setStep] = useState(1);

  return (
    <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-slate-950/95 backdrop-blur-md">
      <div className="w-full max-w-md p-8 glass-panel text-center relative overflow-hidden">
        
        {/* Glow behind modal */}
        <div className="absolute inset-0 bg-gradient-to-tr from-[#8B5CF6]/10 to-transparent pointer-events-none" />

        <AnimatePresence mode="wait">
          {step === 1 && (
            <motion.div
              key="tour1"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0 }}
              className="space-y-6"
            >
              <h2 className="text-2xl font-extrabold tracking-wider uppercase text-[#8B5CF6]">System Awakening</h2>
              <div className="h-0.5 w-12 bg-[#8B5CF6] mx-auto" />
              <p className="text-slate-300 text-sm leading-relaxed">
                Scanning behavioral patterns... Digital saturation detected.<br />
                <span className="text-[#8B5CF6] font-bold">Initializing core stabilization matrix.</span>
              </p>
              <button 
                onClick={() => setStep(2)}
                className="mt-6 px-6 py-3 rounded-xl bg-[#8B5CF6] hover:bg-[#7c4fe3] text-white font-medium flex items-center justify-center mx-auto transition"
              >
                Proceed Matrix <ArrowRight className="w-4 h-4 ml-2" />
              </button>
            </motion.div>
          )}

          {step === 2 && (
            <motion.div
              key="tour2"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0 }}
              className="space-y-6"
            >
              <h2 className="text-xl font-bold text-white">Your Path Affinity</h2>
              <p className="text-slate-350 text-sm leading-relaxed">
                Your evaluation indicates a primary bottleneck in the <span className="text-[#F59E0B] font-bold">{bottleneck}</span> path.
              </p>
              <div className="p-4 bg-slate-950/40 border border-slate-800 rounded-xl text-left text-xs text-slate-400 space-y-2">
                <p>• The system has calibrated daily quests to heal this bottleneck.</p>
                <p>• Leveling up grants Skill Points to spend in your Evolution Tree.</p>
              </div>
              <button 
                onClick={onComplete}
                className="mt-6 px-8 py-3 rounded-xl bg-gradient-to-r from-[#8B5CF6] to-[#60A5FA] text-white font-bold hover:brightness-110 transition mx-auto"
              >
                Awaken Dashboard
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
