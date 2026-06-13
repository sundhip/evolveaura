"use client";
import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { apiRequest } from '../../lib/api';

export default function OnboardingPage() {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [name, setName] = useState('');
  const [age, setAge] = useState(18);
  const [role, setRole] = useState('College Student');
  const [academicDetails, setAcademicDetails] = useState({ class: '', stream: '', semester: '', degree: '' });
  const [primaryGoal, setPrimaryGoal] = useState('Study');

  useEffect(() => {
    const userStr = localStorage.getItem('user');
    if (userStr) {
      const user = JSON.parse(userStr);
      if (user.profile && user.profile.name) {
        setName(user.profile.name);
      }
    }
  }, []);

  const handleNext = async () => {
    if (step < 5) {
      setStep(step + 1);
    } else {
      try {
        await apiRequest('/auth/profile', {
          method: 'PUT',
          body: JSON.stringify({
            name,
            role,
            academicDetails,
            primaryGoal
          })
        });
        router.push('/assessment');
      } catch (err) {
        console.error("Onboarding save error", err);
        router.push('/assessment');
      }
    }
  };

  const handlePrev = () => {
    if (step > 1) setStep(step - 1);
  };

  return (
    <div className="min-h-screen flex flex-col justify-between items-center px-4 py-12 bg-[#0F172A]">
      <div className="w-full max-w-lg flex items-center justify-between text-slate-400 text-sm mb-12">
        <span>Evolution Onboarding</span>
        <span>Step {step} of 5</span>
      </div>

      <div className="w-full max-w-lg glass-panel p-8 my-auto min-h-[380px] flex flex-col justify-between">
        <AnimatePresence mode="wait">
          {step === 1 && (
            <motion.div
              key="step1"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-4"
            >
              <h2 className="text-2xl font-bold text-white mb-2">What should we call you?</h2>
              <p className="text-slate-400 text-sm">Enter your preferred name or username.</p>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full px-4 py-3 rounded-xl bg-slate-900 border border-slate-700 text-white focus:outline-none focus:border-[#8B5CF6]"
                placeholder="Evolver Name"
              />
            </motion.div>
          )}

          {step === 2 && (
            <motion.div
              key="step2"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-4"
            >
              <h2 className="text-2xl font-bold text-white mb-2">How old are you?</h2>
              <p className="text-slate-400 text-sm">Age is a factor for tailored daily quests.</p>
              <input
                type="number"
                value={age}
                onChange={(e) => setAge(parseInt(e.target.value))}
                className="w-full px-4 py-3 rounded-xl bg-slate-900 border border-slate-700 text-white focus:outline-none focus:border-[#8B5CF6]"
                min="1"
                max="120"
              />
            </motion.div>
          )}

          {step === 3 && (
            <motion.div
              key="step3"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-4"
            >
              <h2 className="text-2xl font-bold text-white mb-4">Select your current role</h2>
              <div className="grid grid-cols-1 gap-3">
                {['School Student', 'JEE Aspirant', 'NEET Aspirant', 'College Student', 'Professional'].map((r) => (
                  <button
                    key={r}
                    type="button"
                    onClick={() => setRole(r)}
                    className={`w-full py-3 px-4 rounded-xl text-left font-medium border transition ${
                      role === r
                        ? 'bg-[#8B5CF6]/20 border-[#8B5CF6] text-white'
                        : 'bg-slate-900 border-slate-700 text-slate-400 hover:border-slate-600'
                    }`}
                  >
                    {r}
                  </button>
                ))}
              </div>
            </motion.div>
          )}

          {step === 4 && (
            <motion.div
              key="step4"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-4"
            >
              <h2 className="text-2xl font-bold text-white mb-2">Academic / Professional details</h2>
              {role.includes('Student') || role.includes('Aspirant') ? (
                <div className="space-y-3">
                  <input
                    type="text"
                    value={academicDetails.class || academicDetails.degree}
                    onChange={(e) => setAcademicDetails({ ...academicDetails, degree: e.target.value, class: e.target.value })}
                    className="w-full px-4 py-3 rounded-xl bg-slate-900 border border-slate-700 text-white focus:outline-none focus:border-[#8B5CF6]"
                    placeholder={role.includes('School') ? 'Class (e.g. 10)' : 'Degree (e.g. B.Tech)'}
                  />
                  <input
                    type="text"
                    value={academicDetails.stream || academicDetails.semester}
                    onChange={(e) => setAcademicDetails({ ...academicDetails, semester: e.target.value, stream: e.target.value })}
                    className="w-full px-4 py-3 rounded-xl bg-slate-900 border border-slate-700 text-white focus:outline-none focus:border-[#8B5CF6]"
                    placeholder={role.includes('School') ? 'Stream (e.g. Science)' : 'Semester (e.g. Sem 4)'}
                  />
                </div>
              ) : (
                <div className="space-y-3">
                  <input
                    type="text"
                    value={academicDetails.degree}
                    onChange={(e) => setAcademicDetails({ ...academicDetails, degree: e.target.value })}
                    className="w-full px-4 py-3 rounded-xl bg-slate-900 border border-slate-700 text-white focus:outline-none focus:border-[#8B5CF6]"
                    placeholder="Field of work / Job Title"
                  />
                </div>
              )}
            </motion.div>
          )}

          {step === 5 && (
            <motion.div
              key="step5"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-4"
            >
              <h2 className="text-2xl font-bold text-white mb-4">Choose your primary focus goal</h2>
              <div className="grid grid-cols-1 gap-3">
                {['Study', 'Fitness', 'Mental Wellness', 'Creativity', 'Balanced Growth'].map((g) => (
                  <button
                    key={g}
                    type="button"
                    onClick={() => setPrimaryGoal(g)}
                    className={`w-full py-3 px-4 rounded-xl text-left font-medium border transition ${
                      primaryGoal === g
                        ? 'bg-[#8B5CF6]/20 border-[#8B5CF6] text-white'
                        : 'bg-slate-900 border-slate-700 text-slate-400 hover:border-slate-600'
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
          <button
            onClick={handlePrev}
            disabled={step === 1}
            className="px-6 py-2 rounded-xl text-slate-400 hover:text-white disabled:opacity-30 transition"
          >
            Back
          </button>
          <button
            onClick={handleNext}
            disabled={step === 1 && !name}
            className="px-8 py-3 rounded-xl bg-[#8B5CF6] text-white font-bold hover:bg-[#7c4fe3] transition disabled:opacity-50"
          >
            {step === 5 ? 'Begin Evaluation' : 'Continue'}
          </button>
        </div>
      </div>
    </div>
  );
}
