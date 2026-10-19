"use client";
import React, { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { apiRequest } from '../../lib/api';

interface QuestionItem {
  id: string;
  text: string;
  position: number;
}

const OPTIONS = [
  { text: "Strongly Agree", val: 5, color: "hover:bg-emerald-500/10 hover:border-emerald-500" },
  { text: "Agree", val: 4, color: "hover:bg-green-500/10 hover:border-green-500" },
  { text: "Neutral", val: 3, color: "hover:bg-slate-500/10 hover:border-slate-500" },
  { text: "Disagree", val: 2, color: "hover:bg-orange-500/10 hover:border-orange-500" },
  { text: "Strongly Disagree", val: 1, color: "hover:bg-red-500/10 hover:border-red-500" }
];

export default function AssessmentPage() {
  const router = useRouter();
  const [questions, setQuestions] = useState<QuestionItem[]>([]);
  const [attemptId, setAttemptId] = useState<string | null>(null);
  const [currentIdx, setCurrentIdx] = useState(0);
  const [answers, setAnswers] = useState<Record<string, number>>({});
  const [isSmoker, setIsSmoker] = useState<boolean | null>(null);
  const [reviewMode, setReviewMode] = useState(false);
  const [loading, setLoading] = useState(true);
  const [fetchError, setFetchError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [retrying, setRetrying] = useState(false);

  const fetchQuestions = useCallback(async (isRetry = false) => {
    if (isRetry) {
      setRetrying(true);
    } else {
      setLoading(true);
    }
    setFetchError(null);
    setSubmitError(null);
    try {
      const data = await apiRequest('/assessment/questions');
      if (!data.questions || data.questions.length === 0) {
        throw new Error('No assessment questions returned from matrix core.');
      }
      setAttemptId(data.attemptId);
      setQuestions(data.questions);
      setAnswers({});
      setIsSmoker(null);
      setCurrentIdx(0);
      setReviewMode(false);
    } catch (err: any) {
      setFetchError(err.message || 'Unable to connect to assessment matrix');
    } finally {
      setLoading(false);
      setRetrying(false);
    }
  }, []);

  useEffect(() => {
    fetchQuestions();
  }, [fetchQuestions]);

  const handleSelect = (val: number) => {
    const currentQ = questions[currentIdx];
    if (!currentQ) return;

    setAnswers(prev => ({ ...prev, [currentQ.id]: val }));

    if (currentIdx < questions.length - 1) {
      setCurrentIdx(currentIdx + 1);
    } else {
      // Advance to the lifestyle smoking question (Question 17)
      setCurrentIdx(questions.length);
    }
  };

  const handleSmokingChoice = async (smokerChoice: boolean) => {
    setIsSmoker(smokerChoice);
    if (typeof window !== 'undefined') {
      localStorage.setItem('user_is_smoker', smokerChoice ? 'true' : 'false');
    }
    if (!attemptId) return;

    setSubmitting(true);
    setSubmitError(null);
    try {
      await apiRequest('/assessment/submit', {
        method: 'POST',
        body: JSON.stringify({ attemptId, answers, isSmoker: smokerChoice })
      });

      try {
        await apiRequest('/profile/smoking-status', {
          method: 'POST',
          body: JSON.stringify({ isSmoker: smokerChoice })
        });
      } catch {
        // Non-fatal if already set by assessment submit
      }

      if (smokerChoice) {
        router.push('/quit/start');
      } else {
        router.push('/report');
      }
    } catch (err: any) {
      setSubmitError(err.message || 'Failed to submit assessment');
      setSubmitting(false);
    }
  };

  const submit = async () => {
    if (!attemptId) return;
    if (isSmoker === null) {
      setReviewMode(false);
      setCurrentIdx(questions.length);
      return;
    }
    setSubmitting(true);
    setSubmitError(null);
    try {
      await apiRequest('/assessment/submit', {
        method: 'POST',
        body: JSON.stringify({ attemptId, answers, isSmoker })
      });
      if (typeof window !== 'undefined') {
        localStorage.setItem('user_is_smoker', isSmoker ? 'true' : 'false');
      }
      if (isSmoker) {
        router.push('/quit/start');
      } else {
        router.push('/report');
      }
    } catch (err: any) {
      setSubmitError(err.message || 'Failed to submit assessment');
    } finally {
      setSubmitting(false);
    }
  };

  // Skeleton Loader during initial fetch
  if (loading) {
    return (
      <div className="min-h-screen flex flex-col justify-between items-center px-4 py-8 bg-[#0F172A]">
        <div className="w-full max-w-2xl flex items-center justify-between text-slate-500 text-sm mb-6 animate-pulse">
          <div className="h-4 w-36 bg-slate-800 rounded"></div>
          <div className="h-4 w-28 bg-slate-800 rounded"></div>
        </div>

        <div className="w-full max-w-2xl h-2 bg-slate-800 rounded-full mb-12 overflow-hidden">
          <div className="h-full bg-slate-700 w-1/4 animate-pulse"></div>
        </div>

        <div className="w-full max-w-2xl my-auto flex flex-col items-center space-y-8 animate-pulse">
          <div className="w-full h-24 bg-slate-800/60 rounded-2xl border border-slate-800"></div>
          <div className="flex flex-col gap-2.5 w-full max-w-md mx-auto pt-6">
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="w-full h-12 bg-slate-800/40 rounded-xl border border-slate-800/60"></div>
            ))}
          </div>
        </div>

        <div className="w-full max-w-2xl mt-8 pt-4 border-t border-slate-800/40 flex justify-between">
          <div className="h-8 w-28 bg-slate-800/40 rounded"></div>
        </div>
      </div>
    );
  }

  // Fetch Error State with Retry button
  if (fetchError || questions.length === 0) {
    return (
      <div className="min-h-screen flex flex-col justify-center items-center px-4 py-8 bg-[#0F172A]">
        <div className="w-full max-w-md glass-panel p-8 text-center space-y-6">
          <div className="w-12 h-12 rounded-full bg-red-500/10 border border-red-500/20 text-red-400 mx-auto flex items-center justify-center text-xl font-bold">
            !
          </div>
          <h2 className="text-xl font-bold text-white">Calibration Offline</h2>
          <p className="text-slate-400 text-sm leading-relaxed">
            {fetchError || 'Unable to load matrix assessment questions.'}
          </p>
          {fetchError?.includes('waking up') && (
            <div className="p-3 bg-purple-500/10 border border-purple-500/20 rounded-xl text-purple-300 text-xs text-left">
              Render free tier web services spin down after 15 minutes of inactivity and take ~30–50s to wake up. It is waking up now.
            </div>
          )}
          <button
            onClick={() => fetchQuestions(true)}
            disabled={retrying}
            className="w-full py-3.5 rounded-xl bg-[#8B5CF6] hover:bg-[#7c4fe3] disabled:opacity-50 text-white font-bold transition shadow-lg shadow-purple-500/20 flex items-center justify-center gap-2 cursor-pointer"
          >
            {retrying ? (
              <>
                <svg className="animate-spin h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z"></path>
                </svg>
                Connecting to Matrix...
              </>
            ) : (
              'Retry Connection'
            )}
          </button>
        </div>
      </div>
    );
  }

  const totalQuestions = questions.length + 1;
  const isSmokingStep = currentIdx === questions.length;
  const percent = Math.round(((currentIdx + 1) / totalQuestions) * 100);
  const currentQuestion = questions[currentIdx];

  // Review Mode Screen
  if (reviewMode) {
    return (
      <div className="min-h-screen flex flex-col justify-between items-center px-4 py-8 bg-[#0F172A]">
        <div className="w-full max-w-xl glass-panel p-8 space-y-6">
          <h2 className="text-2xl font-bold text-white text-center">Review Your Matrix Parameters</h2>

          {submitError && (
            <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm space-y-3">
              <p className="font-semibold text-center">{submitError}</p>
              <div className="flex justify-center">
                <button
                  onClick={() => fetchQuestions()}
                  className="px-4 py-2 bg-red-500/20 hover:bg-red-500/30 text-red-300 rounded-lg text-xs font-bold transition"
                >
                  Get a fresh set
                </button>
              </div>
            </div>
          )}

          <div className="space-y-4 max-h-[360px] overflow-y-auto pr-2">
            {questions.map((q, idx) => (
              <div key={q.id} className="flex justify-between items-center p-3 bg-slate-900/50 rounded-xl text-xs border border-slate-800">
                <span className="text-slate-300 pr-4">{idx + 1}. {q.text}</span>
                <span className="font-bold text-[#8B5CF6] shrink-0">Score: {answers[q.id] || 3}</span>
              </div>
            ))}
            <div className="flex justify-between items-center p-3 bg-slate-900/50 rounded-xl text-xs border border-slate-800">
              <span className="text-slate-300 pr-4">{questions.length + 1}. Do you smoke or use nicotine products?</span>
              <span className={`font-bold shrink-0 ${isSmoker === true ? 'text-emerald-400' : isSmoker === false ? 'text-slate-300' : 'text-amber-400'}`}>
                {isSmoker === true ? 'Yes, I smoke' : isSmoker === false ? 'No, I do not smoke' : 'Not specified'}
              </span>
            </div>
          </div>

          <div className="flex space-x-4 pt-4">
            <button
              onClick={() => { setReviewMode(false); setCurrentIdx(0); }}
              className="w-1/2 py-3 rounded-xl bg-slate-900 border border-slate-800 text-slate-400 hover:text-white font-bold transition cursor-pointer"
            >
              Reset Answers
            </button>
            <button
              onClick={submit}
              disabled={submitting}
              className="w-1/2 py-3 rounded-xl bg-[#8B5CF6] hover:bg-[#7c4fe3] disabled:opacity-50 text-white font-bold transition shadow-lg shadow-purple-500/20 cursor-pointer"
            >
              {submitting ? "Integrating..." : "Submit Matrix"}
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Main Question Walkthrough Screen
  return (
    <div className="min-h-screen flex flex-col justify-between items-center px-4 py-8 bg-[#0F172A]">
      <div className="w-full max-w-2xl flex items-center justify-between text-slate-400 text-sm mb-6">
        <span className="font-semibold text-[#8B5CF6] uppercase tracking-wider">Matrix Calibration</span>
        <span>Question {currentIdx + 1} of {totalQuestions}</span>
      </div>

      <div className="w-full max-w-2xl h-2 bg-slate-800 rounded-full mb-12 overflow-hidden">
        <div
          className="h-full bg-gradient-to-r from-[#8B5CF6] to-[#60A5FA] transition-all duration-300"
          style={{ width: `${percent}%` }}
        />
      </div>

      <div className="w-full max-w-2xl my-auto flex flex-col items-center">
        <AnimatePresence mode="wait">
          {isSmokingStep ? (
            <motion.div
              key="smoking-question"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              className="w-full text-center space-y-6"
            >
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-semibold uppercase tracking-wider">
                Lifestyle & Health Calibration
              </div>
              <h2 className="text-2xl md:text-3xl font-extrabold text-white max-w-xl mx-auto px-4">
                Do you smoke or use nicotine products?
              </h2>
              <p className="text-slate-400 text-sm max-w-md mx-auto">
                Help us calibrate your personalized health protocols and determine whether to activate the Smoke-Free module.
              </p>

              {submitError && (
                <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-xl text-red-400 text-xs max-w-md mx-auto">
                  {submitError}
                </div>
              )}

              <div className="flex flex-col gap-3.5 w-full max-w-md mx-auto pt-4">
                <button
                  type="button"
                  disabled={submitting}
                  onClick={() => handleSmokingChoice(true)}
                  className={`w-full p-4 rounded-xl border font-semibold text-left transition flex items-center justify-between group cursor-pointer ${
                    isSmoker === true
                      ? 'bg-emerald-500/20 border-emerald-500 text-white shadow-lg shadow-emerald-500/10'
                      : 'bg-slate-900/70 border-slate-800 hover:border-emerald-500/60 hover:bg-emerald-500/10 text-slate-200'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <span className="text-2xl">🔥</span>
                    <div>
                      <div className="font-bold text-white group-hover:text-emerald-300 transition">
                        Yes, I smoke
                      </div>
                      <div className="text-xs text-slate-400">
                        Redirect to Smoke-Free protocols, FTND screening, and craving tools
                      </div>
                    </div>
                  </div>
                  <span className="text-emerald-400 text-sm font-bold opacity-0 group-hover:opacity-100 transition">
                    Select →
                  </span>
                </button>

                <button
                  type="button"
                  disabled={submitting}
                  onClick={() => handleSmokingChoice(false)}
                  className={`w-full p-4 rounded-xl border font-semibold text-left transition flex items-center justify-between group cursor-pointer ${
                    isSmoker === false
                      ? 'bg-purple-500/20 border-purple-500 text-white shadow-lg shadow-purple-500/10'
                      : 'bg-slate-900/70 border-slate-800 hover:border-purple-500/60 hover:bg-purple-500/10 text-slate-200'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <span className="text-2xl">✨</span>
                    <div>
                      <div className="font-bold text-white group-hover:text-purple-300 transition">
                        No, I do not smoke
                      </div>
                      <div className="text-xs text-slate-400">
                        Proceed directly to your Aura score report and path awakening
                      </div>
                    </div>
                  </div>
                  <span className="text-[#8B5CF6] text-sm font-bold opacity-0 group-hover:opacity-100 transition">
                    Select →
                  </span>
                </button>
              </div>

              {submitting && (
                <div className="flex items-center justify-center gap-2 text-sm text-slate-400 pt-2 animate-pulse">
                  <svg className="animate-spin h-4 w-4 text-emerald-400" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z"></path>
                  </svg>
                  <span>Calibrating protocol matrix...</span>
                </div>
              )}
            </motion.div>
          ) : (
            <motion.div
              key={currentQuestion.id}
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              className="w-full text-center space-y-8"
            >
              <h2 className="text-xl md:text-2xl font-bold text-white max-w-xl mx-auto px-4 min-h-[96px] flex items-center justify-center">
                "{currentQuestion.text}"
              </h2>

              <div className="flex flex-col gap-2.5 w-full max-w-md mx-auto pt-6">
                {OPTIONS.map((opt) => (
                  <button
                    key={opt.val}
                    onClick={() => handleSelect(opt.val)}
                    className={`w-full py-3.5 rounded-xl bg-slate-900/60 border border-slate-800 text-slate-300 font-semibold transition hover:text-white ${opt.color} ${
                      answers[currentQuestion.id] === opt.val ? 'border-[#8B5CF6] bg-[#8B5CF6]/10 text-white' : ''
                    }`}
                  >
                    {opt.text}
                  </button>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <div className="flex justify-between w-full max-w-2xl mt-8 pt-4 border-t border-slate-800/40">
        <button
          onClick={() => currentIdx > 0 && setCurrentIdx(currentIdx - 1)}
          disabled={currentIdx === 0 || submitting}
          className="px-6 py-2 text-slate-500 hover:text-white disabled:opacity-30 transition font-medium cursor-pointer"
        >
          Previous Question
        </button>
        {!isSmokingStep && answers[currentQuestion?.id] && currentIdx < totalQuestions - 1 && (
          <button
            onClick={() => setCurrentIdx(currentIdx + 1)}
            className="px-6 py-2 text-[#8B5CF6] hover:text-purple-300 transition font-medium cursor-pointer"
          >
            Next Question
          </button>
        )}
      </div>
    </div>
  );
}
