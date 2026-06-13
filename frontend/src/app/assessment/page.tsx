"use client";
import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { apiRequest } from '../../lib/api';

const QUESTIONS = [
  // Scholar (1-12)
  "I find it easy to stay focused on a single study task for more than 45 minutes without checking my phone.",
  "I regularly review my notes or materials using active recall rather than just re-reading.",
  "I am confident in my ability to break down complex, unfamiliar problems into solvable parts.",
  "I maintain a consistent daily study schedule, even when I don't feel motivated.",
  "I plan how I will learn a topic before diving into the material.",
  "I can explain complex topics I've studied in simple terms to someone else.",
  "I rarely get distracted by social media notifications during my learning sessions.",
  "I space out my reviews of a subject over days or weeks to ensure long-term memory.",
  "When stuck on a difficult problem, I try multiple approaches before seeking help.",
  "I set specific, realistic study goals for each day.",
  "I monitor my understanding of a topic as I study it, adjusting my methods if needed.",
  "I try to connect new information to concepts I already know.",
  // Warrior (13-24)
  "I regularly get 7-8 hours of high-quality sleep and wake up feeling refreshed.",
  "I engage in at least 30 minutes of moderate to high-intensity physical activity daily.",
  "I feel physically capable and alert during my primary productive hours.",
  "I dedicate time to physical recovery (e.g., stretching, relaxation) after strenuous activity.",
  "I stick to my fitness or health routines even when I am tired or busy.",
  "I maintain a consistent sleep schedule (sleeping and waking at the same times) on weekends.",
  "I count daily steps or active movement as an essential part of my routine.",
  "My energy levels remain stable throughout the day without heavy reliance on caffeine.",
  "I listen to my body and rest when I feel signs of burnout or overtraining.",
  "I can easily resist unhealthy food cravings or sedentary temptations.",
  "I avoid screen time for at least 30-60 minutes before going to bed.",
  "I incorporate movement (like walking or stretching) during breaks from sitting.",
  // Sage (25-36)
  "I practice mindfulness or meditation techniques regularly to ground myself.",
  "I bounce back quickly from academic, professional, or personal setbacks.",
  "I can easily identify and label the emotions I am feeling in real-time.",
  "I have effective strategies to calm down when experiencing high stress or anxiety.",
  "I spend time reflecting on my thoughts, behavior, and progress at the end of the day.",
  "I can stay fully present in the current moment without feeling the urge to check my phone.",
  "I view failures or mistakes as valuable opportunities for growth rather than personal flaws.",
  "I understand the root causes of my stress and how they affect my behavior.",
  "I use deep breathing or progressive muscle relaxation to manage physical stress.",
  "I regularly write down things I am grateful for or log my reflections.",
  "I notice how digital content (reels, shorts) affects my mood and energy level.",
  "When faced with criticism or failure, I remain calm and objective.",
  // Creator (37-48)
  "I actively seek out new knowledge, ideas, or skills outside my required curriculum/job.",
  "I can express my ideas clearly and persuasively, both in writing and speaking.",
  "I trust my creative instincts and feel confident sharing unique ideas with others.",
  "I consistently turn my creative ideas into actual projects, drawings, writings, or prototypes.",
  "I like to find unconventional or novel solutions to everyday problems.",
  "I ask 'why' and 'how' questions when encountering something new or unfamiliar.",
  "I can tailor my communication style to suit different audiences.",
  "I don't let the fear of judgment prevent me from trying new creative pursuits.",
  "I finish the projects I start, rather than abandoning them midway.",
  "I experiment with different mediums or tools to express myself.",
  "I draw inspiration from diverse sources (art, nature, science, history).",
  "I collaborate effectively with others to brainstorm and refine ideas."
];

const OPTIONS = [
  { text: "Strongly Agree", val: 5, color: "hover:bg-emerald-500/20 hover:border-emerald-500" },
  { text: "Agree", val: 4, color: "hover:bg-green-500/20 hover:border-green-500" },
  { text: "Neutral", val: 3, color: "hover:bg-slate-500/20 hover:border-slate-500" },
  { text: "Disagree", val: 2, color: "hover:bg-orange-500/20 hover:border-orange-500" },
  { text: "Strongly Disagree", val: 1, color: "hover:bg-red-500/20 hover:border-red-500" }
];

export default function AssessmentPage() {
  const router = useRouter();
  const [currentIdx, setCurrentIdx] = useState(0);
  const [answers, setAnswers] = useState<Record<string, number>>({});
  const [loading, setLoading] = useState(false);

  const getPathColor = () => {
    if (currentIdx < 12) return 'border-[#60A5FA]'; // Scholar
    if (currentIdx < 24) return 'border-[#22C55E]'; // Warrior
    if (currentIdx < 36) return 'border-[#2DD4BF]'; // Sage
    return 'border-[#F59E0B]'; // Creator
  };

  const getPathName = () => {
    if (currentIdx < 12) return 'Scholar';
    if (currentIdx < 24) return 'Warrior';
    if (currentIdx < 36) return 'Sage';
    return 'Creator';
  };

  const handleSelect = async (val: number) => {
    const qKey = `q${currentIdx + 1}`;
    const updatedAnswers = { ...answers, [qKey]: val };
    setAnswers(updatedAnswers);

    if (currentIdx < QUESTIONS.length - 1) {
      setCurrentIdx(currentIdx + 1);
    } else {
      // Submit assessment
      setLoading(true);
      try {
        await apiRequest('/assessment/submit', {
          method: 'POST',
          body: JSON.stringify({ answers: updatedAnswers })
        });
        
        // Fetch updated profile
        const profile = await apiRequest('/auth/profile');
        localStorage.setItem('user', JSON.stringify(profile));

        router.push('/report');
      } catch (err) {
        console.error("Submission failed", err);
        router.push('/report');
      } finally {
        setLoading(false);
      }
    }
  };

  const percent = Math.round((currentIdx / QUESTIONS.length) * 100);

  return (
    <div className="min-h-screen flex flex-col justify-between items-center px-4 py-8 bg-[#0F172A]">
      <div className="w-full max-w-2xl flex items-center justify-between text-slate-400 text-sm mb-6">
        <span className="font-semibold text-[#8B5CF6] uppercase tracking-wider">{getPathName()} Path Evaluation</span>
        <span>Question {currentIdx + 1} of {QUESTIONS.length}</span>
      </div>

      {/* Progress Bar */}
      <div className="w-full max-w-2xl h-2 bg-slate-800 rounded-full mb-12 overflow-hidden">
        <div className="h-full bg-gradient-to-r from-[#8B5CF6] to-[#60A5FA] transition-all duration-300" style={{ width: `${percent}%` }} />
      </div>

      <div className="w-full max-w-2xl my-auto flex flex-col items-center">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentIdx}
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -15 }}
            transition={{ duration: 0.3 }}
            className="w-full text-center space-y-8"
          >
            <h2 className="text-2xl md:text-3xl font-extrabold text-white leading-relaxed max-w-xl mx-auto px-4 min-h-[96px] flex items-center justify-center">
              "{QUESTIONS[currentIdx]}"
            </h2>

            <div className="flex flex-col gap-3 w-full max-w-md mx-auto pt-6">
              {OPTIONS.map((opt) => (
                <button
                  key={opt.val}
                  type="button"
                  disabled={loading}
                  onClick={() => handleSelect(opt.val)}
                  className={`w-full py-4 rounded-xl bg-slate-900/60 border border-slate-800 text-slate-300 font-semibold transition duration-200 text-sm cursor-pointer ${opt.color}`}
                >
                  {opt.text}
                </button>
              ))}
            </div>
          </motion.div>
        </AnimatePresence>
      </div>

      <div className="text-slate-500 text-xs mt-12 text-center">
        Be completely honest. The Aura Engine utilizes behavioral psychology to detect bottlenecks.
      </div>
    </div>
  );
}
