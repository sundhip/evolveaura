"use client";
import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { apiRequest } from '../../lib/api';

const QUESTIONS = [
  "I prioritize deep study and focus blocks over passive phone scrolling.",
  "I maintain active study loops using review cards or active recall sheets.",
  "I regularly commit 7.5+ hours of screen-free night rest recovery.",
  "I perform 30+ minutes of active walking or workout routines daily.",
  "I practice box breathing or meditation when attention boundaries slip.",
  "I write down nightly reflection feedback regarding my behavior.",
  "I actively seek learning challenges outside standard workflows.",
  "I complete code, writing, or layouts for my personal projects weekly.",
  "I stay focused during study blocks without checking social media.",
  "I review study cards at spaced intervals to ensure long-term memory.",
  "I wake up at consistent times without multiple snoozes.",
  "I take active movement breaks during study focus sessions.",
  "I spend time checking what triggers my stress levels daily.",
  "I notice immediately how instant-gratification reels affect my energy.",
  "I ask why and how questions when studying complex subjects.",
  "I commit to finishing personal drafts even when motivation drops."
];

const OPTIONS = [
  { text: "Strongly Agree", val: 5, color: "hover:bg-emerald-500/10 hover:border-emerald-500" },
  { text: "Agree", val: 4, color: "hover:bg-green-500/10 hover:border-green-500" },
  { text: "Neutral", val: 3, color: "hover:bg-slate-500/10 hover:border-slate-500" },
  { text: "Disagree", val: 2, color: "hover:bg-orange-500/10 hover:border-orange-500" },
  { text: "Strongly Disagree", val: 1, color: "hover:bg-red-500/10 hover:border-red-500" }
];

export default function AssessmentPage() {
  const router = useRouter();
  const [currentIdx, setCurrentIdx] = useState(0);
  const [answers, setAnswers] = useState<Record<string, number>>({});
  const [reviewMode, setReviewMode] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSelect = (val: number) => {
    const qKey = `q${currentIdx + 1}`;
    setAnswers({ ...answers, [qKey]: val });

    if (currentIdx < QUESTIONS.length - 1) {
      setCurrentIdx(currentIdx + 1);
    } else {
      setReviewMode(true);
    }
  };

  const submit = async () => {
    setLoading(true);
    try {
      await apiRequest('/assessment/submit', {
        method: 'POST',
        body: JSON.stringify({ answers })
      });
      router.push('/report');
    } catch (e) {
      router.push('/report');
    } finally {
      setLoading(false);
    }
  };

  const percent = Math.round((currentIdx / QUESTIONS.length) * 100);

  if (reviewMode) {
    return (
      <div className="min-h-screen flex flex-col justify-between items-center px-4 py-8 bg-[#0F172A]">
        <div className="w-full max-w-xl glass-panel p-8 space-y-6">
          <h2 className="text-2xl font-bold text-white text-center">Review Your Matrix Parameters</h2>
          <div className="space-y-4 max-h-[360px] overflow-y-auto pr-2">
            {QUESTIONS.map((q, idx) => (
              <div key={idx} className="flex justify-between items-center p-3 bg-slate-900/50 rounded-xl text-xs border border-slate-800">
                <span className="text-slate-300 pr-4">{idx + 1}. {q}</span>
                <span className="font-bold text-[#8B5CF6]">Score: {answers[`q${idx + 1}`] || 3}</span>
              </div>
            ))}
          </div>

          <div className="flex space-x-4 pt-4">
            <button onClick={() => { setReviewMode(false); setCurrentIdx(0); }} className="w-1/2 py-3 rounded-xl bg-slate-900 border border-slate-800 text-slate-400 font-bold transition">
              Reset
            </button>
            <button onClick={submit} disabled={loading} className="w-1/2 py-3 rounded-xl bg-[#8B5CF6] hover:bg-[#7c4fe3] text-white font-bold transition">
              {loading ? "Integrating..." : "Submit Matrix"}
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col justify-between items-center px-4 py-8 bg-[#0F172A]">
      <div className="w-full max-w-2xl flex items-center justify-between text-slate-400 text-sm mb-6">
        <span className="font-semibold text-[#8B5CF6] uppercase tracking-wider">Matrix Calibration</span>
        <span>Question {currentIdx + 1} of {QUESTIONS.length}</span>
      </div>

      <div className="w-full max-w-2xl h-2 bg-slate-800 rounded-full mb-12 overflow-hidden">
        <div className="h-full bg-gradient-to-r from-[#8B5CF6] to-[#60A5FA] transition-all duration-300" style={{ width: `${percent}%` }} />
      </div>

      <div className="w-full max-w-2xl my-auto flex flex-col items-center">
        <AnimatePresence mode="wait">
          <motion.div key={currentIdx} initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -15 }} className="w-full text-center space-y-8">
            <h2 className="text-xl md:text-2xl font-bold text-white max-w-xl mx-auto px-4 min-h-[96px] flex items-center justify-center">
              "{QUESTIONS[currentIdx]}"
            </h2>

            <div className="flex flex-col gap-2.5 w-full max-w-md mx-auto pt-6">
              {OPTIONS.map((opt) => (
                <button
                  key={opt.val}
                  onClick={() => handleSelect(opt.val)}
                  className="w-full py-3.5 rounded-xl bg-slate-900/60 border border-slate-800 text-slate-300 font-semibold transition hover:text-white"
                >
                  {opt.text}
                </button>
              ))}
            </div>
          </motion.div>
        </AnimatePresence>
      </div>

      <div className="flex justify-between w-full max-w-2xl mt-8 pt-4 border-t border-slate-800/40">
        <button onClick={() => currentIdx > 0 && setCurrentIdx(currentIdx - 1)} disabled={currentIdx === 0} className="px-6 py-2 text-slate-500 hover:text-white disabled:opacity-30">
          Previous Question
        </button>
      </div>
    </div>
  );
}
