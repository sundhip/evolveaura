'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { apiRequest } from '@/lib/api';
import { QUIT_COPY } from '@/lib/quitCopy';
import QuitFooter from '@/components/quit/QuitFooter';
import { ShieldCheck, CheckCircle2, ChevronRight, AlertCircle } from 'lucide-react';

export default function QuitStartPage() {
  const router = useRouter();
  const [step, setStep] = useState<'CONSENT' | 'FTND' | 'READINESS' | 'BASELINE'>('CONSENT');

  // Step 0: Consent
  const [isOver18, setIsOver18] = useState(false);
  const [hasInformedConsent, setHasInformedConsent] = useState(false);
  const [consentError, setConsentError] = useState<string | null>(null);

  // Step 1: FTND
  const [ftndAnswers, setFtndAnswers] = useState<number[]>([0, 0, 0, 0, 0, 0]);

  // Step 2: Readiness
  const [stage, setStage] = useState('PREPARATION');
  const [confidence, setConfidence] = useState(7);
  const [importance, setImportance] = useState(8);
  const [triggers, setTriggers] = useState<string[]>([]);

  // Step 3: Baseline
  const [tobaccoType, setTobaccoType] = useState('Cigarettes');
  const [dailyCount, setDailyCount] = useState<number>(15);
  const [costPerUnit, setCostPerUnit] = useState<number>(18);
  const [yearsUsed, setYearsUsed] = useState<number>(5);

  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    checkExistingConsent();
  }, []);

  const checkExistingConsent = async () => {
    try {
      const res = await apiRequest('/quit/profile');
      if (res.profile?.hasConsented) {
        setIsOver18(true);
        setHasInformedConsent(true);
        if (res.profile.status === 'ASSESSING') {
          setStep('FTND');
        } else if (res.profile.status === 'PLANNING') {
          router.push('/quit/plan');
        } else if (res.profile.status === 'ACTIVE' || res.profile.status === 'QUIT_DATE_SET') {
          router.push('/quit');
        }
      }
    } catch {
      // User hasn't consented yet or no profile; stay on CONSENT step
    }
  };

  const handleConsentSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setConsentError(null);

    if (!isOver18) {
      setConsentError(QUIT_COPY.consentErrorUnder18);
      return;
    }
    if (!hasInformedConsent) {
      setConsentError(QUIT_COPY.consentErrorNoInformed);
      return;
    }

    try {
      setSubmitting(true);
      await apiRequest('/quit/consent', {
        method: 'POST',
        body: JSON.stringify({
          isOver18,
          hasInformedConsent,
          ageConfirmed18: isOver18,
          consentGiven: hasInformedConsent
        })
      });
      setStep('FTND');
    } catch (err: any) {
      setConsentError(err.message || 'Failed to record consent');
    } finally {
      setSubmitting(false);
    }
  };

  const handleFtndSelect = (questionIdx: number, val: number) => {
    const updated = [...ftndAnswers];
    updated[questionIdx] = val;
    setFtndAnswers(updated);
  };

  const handleTriggerToggle = (trigger: string) => {
    if (triggers.includes(trigger)) {
      setTriggers(triggers.filter((t) => t !== trigger));
    } else {
      setTriggers([...triggers, trigger]);
    }
  };

  const handleFinalSubmit = async () => {
    try {
      setSubmitting(true);
      setError(null);

      // FTND item 0: 0 -> >60m (70), 1 -> 31-60 (45), 2 -> 6-30 (15), 3 -> <=5 (5)
      let timeToFirstMins = 60;
      if (ftndAnswers[0] === 3) timeToFirstMins = 5;
      else if (ftndAnswers[0] === 2) timeToFirstMins = 15;
      else if (ftndAnswers[0] === 1) timeToFirstMins = 45;
      else timeToFirstMins = 90;

      await apiRequest('/quit/screening', {
        method: 'POST',
        body: JSON.stringify({
          ftndAnswers,
          readinessStage: stage,
          confidenceScore: confidence,
          importanceScore: importance,
          triggers,
          tobaccoType,
          baselineDailyCount: Number(dailyCount) || 1,
          costPerUnit: Number(costPerUnit) || 10,
          yearsUsed: Number(yearsUsed) || 1,
          timeToFirstMins
        })
      });

      router.push('/quit/plan');
    } catch (err: any) {
      setError(err.message || 'Failed to save screening assessment');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0F172A] text-slate-100 flex flex-col justify-between p-4 sm:p-6 lg:p-8">
      <div className="max-w-2xl mx-auto w-full">
        {/* Step Indicator */}
        <div className="mb-8">
          <div className="flex items-center justify-between text-xs text-slate-400 mb-2 font-medium">
            <span>
              {step === 'CONSENT'
                ? 'Step 0: Informed Consent'
                : step === 'FTND'
                ? 'Step 1 of 3: Nicotine Dependence (FTND)'
                : step === 'READINESS'
                ? 'Step 2 of 3: Motivation & Triggers'
                : 'Step 3 of 3: Baseline Intake'}
            </span>
            <span>
              {step === 'CONSENT' ? 'Agreement' : step === 'FTND' ? '33%' : step === 'READINESS' ? '66%' : '100%'}
            </span>
          </div>
          <div className="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden">
            <div
              className="h-full bg-emerald-500 transition-all duration-300"
              style={{
                width:
                  step === 'CONSENT'
                    ? '10%'
                    : step === 'FTND'
                    ? '40%'
                    : step === 'READINESS'
                    ? '70%'
                    : '100%'
              }}
            />
          </div>
        </div>

        {error && (
          <div className="mb-6 p-4 rounded-xl border border-red-500/30 bg-red-950/30 text-red-200 text-sm flex items-center gap-3">
            <AlertCircle className="w-5 h-5 text-red-400 shrink-0" />
            <p>{error}</p>
          </div>
        )}

        {/* STEP 0: CONSENT */}
        {step === 'CONSENT' && (
          <div className="glass-panel p-6 sm:p-8">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-medium mb-3">
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>Self-Help Onboarding</span>
            </div>
            <h2 className="text-xl sm:text-2xl font-bold text-white mb-2">
              {QUIT_COPY.consentTitle}
            </h2>
            <p className="text-sm text-slate-300 leading-relaxed mb-6">
              {QUIT_COPY.consentSubtitle}
            </p>

            <form onSubmit={handleConsentSubmit} className="space-y-4">
              <label className="flex items-start gap-3 p-4 rounded-xl bg-slate-900/60 border border-slate-800 cursor-pointer hover:border-slate-700 transition-colors">
                <input
                  type="checkbox"
                  checked={isOver18}
                  onChange={(e) => setIsOver18(e.target.checked)}
                  className="w-4 h-4 mt-0.5 rounded border-slate-700 text-emerald-500 focus:ring-emerald-500"
                />
                <span className="text-xs sm:text-sm text-slate-300">
                  {QUIT_COPY.consentCheckbox18}
                </span>
              </label>

              <label className="flex items-start gap-3 p-4 rounded-xl bg-slate-900/60 border border-slate-800 cursor-pointer hover:border-slate-700 transition-colors">
                <input
                  type="checkbox"
                  checked={hasInformedConsent}
                  onChange={(e) => setHasInformedConsent(e.target.checked)}
                  className="w-4 h-4 mt-0.5 rounded border-slate-700 text-emerald-500 focus:ring-emerald-500"
                />
                <span className="text-xs sm:text-sm text-slate-300 leading-relaxed">
                  {QUIT_COPY.consentCheckboxInformed}
                </span>
              </label>

              {consentError && (
                <div className="p-3 rounded-lg bg-red-950/40 border border-red-500/40 text-red-200 text-xs">
                  {consentError}
                </div>
              )}

              <button
                type="submit"
                disabled={submitting || !isOver18 || !hasInformedConsent}
                className="w-full mt-4 py-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white font-medium text-sm transition-all shadow-lg shadow-emerald-950/30 flex items-center justify-center gap-2"
              >
                <span>{submitting ? 'Recording Consent...' : QUIT_COPY.consentSubmitButton}</span>
                <ChevronRight className="w-4 h-4" />
              </button>
            </form>
          </div>
        )}

        {/* STEP 1: FTND */}
        {step === 'FTND' && (
          <div className="glass-panel p-6 sm:p-8">
            <h2 className="text-xl sm:text-2xl font-bold text-white mb-1">
              {QUIT_COPY.step1Title}
            </h2>
            <p className="text-xs sm:text-sm text-slate-400 mb-6">
              The Fagerström Test for Nicotine Dependence is a standard 6-item scale used in cessation centres globally.
            </p>

            <div className="space-y-6">
              {QUIT_COPY.ftndQuestions.map((q, qIdx) => (
                <div key={q.id} className="p-4 rounded-xl bg-slate-900/60 border border-slate-800">
                  <p className="text-sm font-medium text-slate-200 mb-3">
                    {qIdx + 1}. {q.question}
                  </p>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {q.options.map((opt) => (
                      <button
                        key={opt.label}
                        type="button"
                        onClick={() => handleFtndSelect(qIdx, opt.value)}
                        className={`text-left px-3 py-2.5 rounded-lg text-xs font-medium border transition-colors ${
                          ftndAnswers[qIdx] === opt.value
                            ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/50'
                            : 'bg-slate-800/40 text-slate-400 border-slate-700/60 hover:bg-slate-800 hover:text-slate-200'
                        }`}
                      >
                        {opt.label}
                      </button>
                    ))}
                  </div>
                </div>
              ))}

              <div className="flex items-center justify-between pt-4">
                <button
                  type="button"
                  onClick={() => setStep('CONSENT')}
                  className="px-4 py-2 rounded-lg text-xs text-slate-400 hover:text-slate-200"
                >
                  Back
                </button>
                <button
                  type="button"
                  onClick={() => setStep('READINESS')}
                  className="inline-flex items-center gap-1.5 px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-medium text-sm transition-all"
                >
                  <span>Continue to Readiness</span>
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        )}

        {/* STEP 2: READINESS */}
        {step === 'READINESS' && (
          <div className="glass-panel p-6 sm:p-8">
            <h2 className="text-xl sm:text-2xl font-bold text-white mb-1">
              {QUIT_COPY.step2Title}
            </h2>
            <p className="text-xs sm:text-sm text-slate-400 mb-6">
              Understanding your current stage of change and triggers strengthens your strategy.
            </p>

            <div className="space-y-6">
              {/* Stage of change */}
              <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800">
                <p className="text-sm font-medium text-slate-200 mb-3">
                  {QUIT_COPY.readinessQuestions.stage}
                </p>
                <div className="space-y-2">
                  {QUIT_COPY.readinessQuestions.stageOptions.map((opt) => (
                    <button
                      key={opt.value}
                      type="button"
                      onClick={() => setStage(opt.value)}
                      className={`w-full text-left px-3 py-2.5 rounded-lg text-xs font-medium border transition-colors ${
                        stage === opt.value
                          ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/50'
                          : 'bg-slate-800/40 text-slate-400 border-slate-700/60 hover:bg-slate-800 hover:text-slate-200'
                      }`}
                    >
                      {opt.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Confidence & Importance */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800">
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-xs font-medium text-slate-300">Confidence (1-10)</span>
                    <span className="text-sm font-bold text-emerald-400">{confidence}</span>
                  </div>
                  <input
                    type="range"
                    min="1"
                    max="10"
                    value={confidence}
                    onChange={(e) => setConfidence(Number(e.target.value))}
                    className="w-full accent-emerald-500 cursor-pointer"
                  />
                </div>

                <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800">
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-xs font-medium text-slate-300">Importance (1-10)</span>
                    <span className="text-sm font-bold text-blue-400">{importance}</span>
                  </div>
                  <input
                    type="range"
                    min="1"
                    max="10"
                    value={importance}
                    onChange={(e) => setImportance(Number(e.target.value))}
                    className="w-full accent-blue-500 cursor-pointer"
                  />
                </div>
              </div>

              {/* Triggers */}
              <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800">
                <p className="text-sm font-medium text-slate-200 mb-3">
                  {QUIT_COPY.readinessQuestions.triggers}
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {QUIT_COPY.readinessQuestions.triggerOptions.map((trig) => (
                    <button
                      key={trig}
                      type="button"
                      onClick={() => handleTriggerToggle(trig)}
                      className={`text-left px-3 py-2 rounded-lg text-xs border transition-colors ${
                        triggers.includes(trig)
                          ? 'bg-amber-500/20 text-amber-300 border-amber-500/50'
                          : 'bg-slate-800/40 text-slate-400 border-slate-700/60 hover:bg-slate-800'
                      }`}
                    >
                      {trig}
                    </button>
                  ))}
                </div>
              </div>

              <div className="flex items-center justify-between pt-4">
                <button
                  type="button"
                  onClick={() => setStep('FTND')}
                  className="px-4 py-2 rounded-lg text-xs text-slate-400 hover:text-slate-200"
                >
                  Back
                </button>
                <button
                  type="button"
                  onClick={() => setStep('BASELINE')}
                  className="inline-flex items-center gap-1.5 px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-medium text-sm transition-all"
                >
                  <span>Continue to Baseline</span>
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        )}

        {/* STEP 3: BASELINE */}
        {step === 'BASELINE' && (
          <div className="glass-panel p-6 sm:p-8">
            <h2 className="text-xl sm:text-2xl font-bold text-white mb-1">
              {QUIT_COPY.step3Title}
            </h2>
            <p className="text-xs sm:text-sm text-slate-400 mb-6">
              Your baseline numbers allow accurate calculation of money saved and avoided units.
            </p>

            <div className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1.5">
                  {QUIT_COPY.baselineQuestions.tobaccoType}
                </label>
                <select
                  value={tobaccoType}
                  onChange={(e) => setTobaccoType(e.target.value)}
                  className="w-full px-3 py-2.5 rounded-lg bg-slate-900 border border-slate-700 text-slate-200 text-sm focus:border-emerald-500 outline-none"
                >
                  {QUIT_COPY.baselineQuestions.tobaccoOptions.map((opt) => (
                    <option key={opt} value={opt}>
                      {opt}
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1.5">
                    {QUIT_COPY.baselineQuestions.dailyCount}
                  </label>
                  <input
                    type="number"
                    min="1"
                    max="100"
                    value={dailyCount}
                    onChange={(e) => setDailyCount(Math.max(1, parseInt(e.target.value) || 0))}
                    className="w-full px-3 py-2.5 rounded-lg bg-slate-900 border border-slate-700 text-slate-200 text-sm focus:border-emerald-500 outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1.5">
                    {QUIT_COPY.baselineQuestions.costPerUnit}
                  </label>
                  <input
                    type="number"
                    min="1"
                    max="200"
                    value={costPerUnit}
                    onChange={(e) => setCostPerUnit(Math.max(1, parseInt(e.target.value) || 0))}
                    className="w-full px-3 py-2.5 rounded-lg bg-slate-900 border border-slate-700 text-slate-200 text-sm focus:border-emerald-500 outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1.5">
                    {QUIT_COPY.baselineQuestions.yearsUsed}
                  </label>
                  <input
                    type="number"
                    min="1"
                    max="60"
                    value={yearsUsed}
                    onChange={(e) => setYearsUsed(Math.max(1, parseInt(e.target.value) || 0))}
                    className="w-full px-3 py-2.5 rounded-lg bg-slate-900 border border-slate-700 text-slate-200 text-sm focus:border-emerald-500 outline-none"
                  />
                </div>
              </div>

              <div className="flex items-center justify-between pt-6">
                <button
                  type="button"
                  onClick={() => setStep('READINESS')}
                  className="px-4 py-2 rounded-lg text-xs text-slate-400 hover:text-slate-200"
                >
                  Back
                </button>
                <button
                  type="button"
                  disabled={submitting}
                  onClick={handleFinalSubmit}
                  className="inline-flex items-center gap-1.5 px-6 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white font-medium text-sm transition-all shadow-lg shadow-emerald-950/30"
                >
                  <span>{submitting ? 'Creating Profile...' : 'Complete Assessment & Build Plan'}</span>
                  <CheckCircle2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      <QuitFooter />
    </div>
  );
}
