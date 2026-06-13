"use client";
import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { apiRequest } from '../../lib/api';

export default function OnboardingPage() {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [name, setName] = useState('');
  const [role, setRole] = useState('PROFESSIONAL');
  const [primaryGoal, setPrimaryGoal] = useState('Balanced Growth');

  const handleNext = async () => {
    if (step < 3) {
      setStep(step + 1);
    } else {
      try {
        await apiRequest('/auth/profile', {
          method: 'PUT',
          body: JSON.stringify({ name, role, primaryGoal })
        });
        router.push('/assessment');
      } catch (e) {
        router.push('/assessment');
      }
    }
  };

  return (
    <div className="min-h-screen flex flex-col justify-between items-center px-4 py-12 bg-[#0F172A]">
      <div className="w-full max-w-lg flex items-center justify-between text-slate-400 text-sm mb-12">
        <span>EvolveAura Matrix Integration</span>
        <span>Step {step} of 3</span>
      </div>

      <div className="w-full max-w-lg glass-panel p-8 my-auto min-h-[380px] flex flex-col justify-between">
        <AnimatePresence mode="wait">
          {step === 1 && (
            <motion.div key="step1" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-4">
              <h2 className="text-2xl font-bold text-white mb-2">Identify Username</h2>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full px-4 py-3 rounded-xl bg-slate-900 border border-slate-700 text-white focus:outline-none focus:border-[#8B5CF6]"
                placeholder="Aura Identity Name"
              />
            </motion.div>
          )}

          {step === 2 && (
            <motion.div key="step2" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-4">
              <h2 className="text-2xl font-bold text-white mb-4">Select User Demographic</h2>
              <div className="grid grid-cols-1 gap-2 max-h-[260px] overflow-y-auto pr-2">
                {['SCHOOL_CLASS_1_5', 'SCHOOL_CLASS_6_12', 'JEE_ASPIRANT', 'NEET_ASPIRANT', 'COLLEGE_STUDENT', 'PROFESSIONAL'].map((r) => (
                  <button
                    key={r}
                    onClick={() => setRole(r)}
                    className={`w-full py-2.5 px-4 rounded-xl text-left border text-xs font-bold transition ${
                      role === r ? 'bg-[#8B5CF6]/20 border-[#8B5CF6] text-white' : 'bg-slate-900 border-slate-800 text-slate-400 hover:border-slate-700'
                    }`}
                  >
                    {r.replace(/_/g, ' ')}
                  </button>
                ))}
              </div>
            </motion.div>
          )}

          {step === 3 && (
            <motion.div key="step3" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-4">
              <h2 className="text-2xl font-bold text-white mb-4">Core Focus Goal</h2>
              <div className="grid grid-cols-1 gap-3">
                {['Study', 'Fitness', 'Mental Wellness', 'Creativity', 'Balanced Growth'].map((g) => (
                  <button
                    key={g}
                    onClick={() => setPrimaryGoal(g)}
                    className={`w-full py-3 px-4 rounded-xl text-left font-medium border text-sm transition ${
                      primaryGoal === g ? 'bg-[#8B5CF6]/20 border-[#8B5CF6] text-white' : 'bg-slate-900 border-slate-800 text-slate-400 hover:border-slate-700'
                    }`}
                  >
                    {g}
                  </button>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <div className="flex justify-between mt-8 pt-4 border-t border-slate-800">
          <button onClick={() => step > 1 && setStep(step - 1)} disabled={step === 1} className="px-6 py-2 text-slate-500 hover:text-white disabled:opacity-30">
            Back
          </button>
          <button onClick={handleNext} disabled={step === 1 && !name} className="px-8 py-3 rounded-xl bg-[#8B5CF6] text-white font-bold hover:bg-[#7c4fe3] transition disabled:opacity-50">
            {step === 3 ? 'Awaken Matrix' : 'Continue'}
          </button>
        </div>
      </div>
    </div>
  );
}
