"use client";
import React, { useEffect, useState, useRef, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { apiRequest } from '../../lib/api';
import { 
  Zap, 
  ShieldCheck, 
  Compass, 
  Heart, 
  Sparkles, 
  TrendingUp, 
  Lock, 
  Check, 
  ArrowRight, 
  X,
  AlertCircle
} from 'lucide-react';

interface PathCardConfig {
  id: 'SCHOLAR' | 'WARRIOR' | 'SAGE' | 'CREATOR';
  name: string;
  desc: string;
  colorHex: string;
  borderClass: string;
  badgeBg: string;
  badgeText: string;
  icon: any;
  exampleTasks: string[];
}

const PATHS: PathCardConfig[] = [
  {
    id: 'SCHOLAR',
    name: 'Scholar',
    desc: 'Deep focus, disciplined study habits & active recall retention',
    colorHex: '#60A5FA',
    borderClass: 'border-blue-500/30 hover:border-blue-500/70',
    badgeBg: 'bg-blue-500/10 text-blue-400 border border-blue-500/30',
    badgeText: 'text-blue-400',
    icon: Zap,
    exampleTasks: [
      'Complete 2× 45-min distraction-free focus blocks',
      'Active recall self-testing using spaced flashcards'
    ]
  },
  {
    id: 'WARRIOR',
    name: 'Warrior',
    desc: 'Sleep consistency, physical conditioning & baseline stamina',
    colorHex: '#22C55E',
    borderClass: 'border-emerald-500/30 hover:border-emerald-500/70',
    badgeBg: 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30',
    badgeText: 'text-emerald-400',
    icon: ShieldCheck,
    exampleTasks: [
      'Execute 30 minutes of physical conditioning or running',
      'Maintain 1-hour screen-free recovery wind-down before bed'
    ]
  },
  {
    id: 'SAGE',
    name: 'Sage',
    desc: 'Mindfulness, stress regulation & digital noise detox',
    colorHex: '#2DD4BF',
    borderClass: 'border-cyan-500/30 hover:border-cyan-500/70',
    badgeBg: 'bg-cyan-500/10 text-cyan-400 border border-cyan-500/30',
    badgeText: 'text-cyan-400',
    icon: Compass,
    exampleTasks: [
      '5-minute box breathing meditation to stabilize focus',
      'Reflective evening journaling and daily digital detox'
    ]
  },
  {
    id: 'CREATOR',
    name: 'Creator',
    desc: 'Curiosity, deliberate skill craft & shipping finished projects',
    colorHex: '#F59E0B',
    borderClass: 'border-amber-500/30 hover:border-amber-500/70',
    badgeBg: 'bg-amber-500/10 text-amber-400 border border-amber-500/30',
    badgeText: 'text-amber-400',
    icon: Heart,
    exampleTasks: [
      'Ship a tangible incremental draft on your creative project',
      '20 minutes of deliberate practice drills in your craft'
    ]
  }
];

export default function ChoosePathPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [assessment, setAssessment] = useState<any>(null);
  const [suggestion, setSuggestion] = useState<any>(null);
  const [profile, setProfile] = useState<any>(null);
  const [selectedPath, setSelectedPath] = useState<'SCHOLAR' | 'WARRIOR' | 'SAGE' | 'CREATOR' | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [focusedIndex, setFocusedIndex] = useState(0);

  const cardRefs = useRef<(HTMLDivElement | null)[]>([]);
  const confirmBtnRef = useRef<HTMLButtonElement | null>(null);
  const cancelBtnRef = useRef<HTMLButtonElement | null>(null);

  useEffect(() => {
    async function loadData() {
      try {
        const token = localStorage.getItem('token');
        if (!token) {
          router.replace('/login');
          return;
        }

        const [assessData, profileData] = await Promise.all([
          apiRequest('/assessment/latest').catch(() => null),
          apiRequest('/auth/profile').catch(() => null),
        ]);

        if (!assessData?.assessment) {
          router.replace('/assessment');
          return;
        }

        setAssessment(assessData.assessment);
        setSuggestion(assessData.suggestion || assessData.assessment?.suggestionJson || null);
        setProfile(profileData?.profile || null);
      } catch (err: any) {
        setErrorMsg(err.message || 'Failed to load assessment data');
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, [router]);

  const recommendedPath = suggestion?.recommended?.toUpperCase() || null;
  const growthAreaPath = suggestion?.growthArea?.toUpperCase() || null;
  const reasons: string[] = suggestion?.reasons || [];

  const now = new Date();
  const isLocked = Boolean(
    profile?.chosenPath &&
    profile?.pathChangeUnlocksAt &&
    new Date(profile.pathChangeUnlocksAt) > now
  );
  const unlockDateFormatted = profile?.pathChangeUnlocksAt
    ? new Date(profile.pathChangeUnlocksAt).toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric'
      })
    : '';

  const getScoreForPath = (pathId: string): number => {
    if (!assessment) return 50;
    switch (pathId) {
      case 'SCHOLAR': return Math.round(assessment.scholarScore || 0);
      case 'WARRIOR': return Math.round(assessment.warriorScore || 0);
      case 'SAGE': return Math.round(assessment.sageScore || 0);
      case 'CREATOR': return Math.round(assessment.creatorScore || 0);
      default: return 50;
    }
  };

  const handleOpenModal = useCallback((pathId: 'SCHOLAR' | 'WARRIOR' | 'SAGE' | 'CREATOR') => {
    if (isLocked && profile?.chosenPath?.toUpperCase() !== pathId) {
      return;
    }
    setSelectedPath(pathId);
    setModalOpen(true);
    setErrorMsg(null);
  }, [isLocked, profile]);

  const handleConfirmChoice = async () => {
    if (!selectedPath) return;
    setSubmitting(true);
    setErrorMsg(null);
    try {
      await apiRequest('/profile/choose-path', {
        method: 'POST',
        body: JSON.stringify({ path: selectedPath }),
      });
      if (typeof window !== 'undefined') {
        window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
      }
      router.push('/dashboard', { scroll: true });
    } catch (err: any) {
      setErrorMsg(err.message || 'Failed to set path');
      setSubmitting(false);
    }
  };

  // Keyboard navigation across cards
  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (modalOpen) {
      if (e.key === 'Escape') {
        setModalOpen(false);
      } else if (e.key === 'Tab') {
        if (e.shiftKey) {
          if (document.activeElement === confirmBtnRef.current) {
            e.preventDefault();
            cancelBtnRef.current?.focus();
          }
        } else {
          if (document.activeElement === cancelBtnRef.current) {
            e.preventDefault();
            confirmBtnRef.current?.focus();
          }
        }
      }
      return;
    }

    if (e.key === 'ArrowRight' || e.key === 'ArrowDown') {
      e.preventDefault();
      setFocusedIndex((prev) => {
        const next = (prev + 1) % PATHS.length;
        cardRefs.current[next]?.focus();
        return next;
      });
    } else if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') {
      e.preventDefault();
      setFocusedIndex((prev) => {
        const next = (prev - 1 + PATHS.length) % PATHS.length;
        cardRefs.current[next]?.focus();
        return next;
      });
    } else if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      const currentPath = PATHS[focusedIndex].id;
      handleOpenModal(currentPath);
    }
  }, [modalOpen, focusedIndex, handleOpenModal]);

  useEffect(() => {
    if (modalOpen) {
      setTimeout(() => confirmBtnRef.current?.focus(), 50);
    }
  }, [modalOpen]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#0F172A] text-white">
        <div className="text-center space-y-4">
          <div className="w-12 h-12 rounded-full border-4 border-[#8B5CF6] border-t-transparent animate-spin mx-auto" />
          <p className="text-slate-400 font-medium font-mono text-sm">Evaluating Path Matrices...</p>
        </div>
      </div>
    );
  }

  const selectedConfig = selectedPath ? PATHS.find((p) => p.id === selectedPath) : null;

  return (
    <div 
      className="min-h-screen bg-[#0F172A] text-white px-4 py-12 flex flex-col items-center justify-between"
      onKeyDown={handleKeyDown}
    >
      <div className="w-full max-w-5xl mx-auto space-y-8">
        {/* Header */}
        <div className="text-center space-y-3">
          <span className="text-xs font-black uppercase tracking-widest text-[#8B5CF6] font-mono">
            Matrix Calibration • Step 3
          </span>
          <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight">
            Pick the path you want to grow on
          </h1>
          <p className="text-slate-400 text-sm max-w-xl mx-auto">
            This is a suggestion from your answers. Any path is a good choice, and you can switch after 7 days.
          </p>
        </div>

        {/* 7-day Lock Banner if engaged */}
        {isLocked && (
          <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-center space-x-3 text-amber-300 text-xs font-medium max-w-2xl mx-auto">
            <Lock className="w-5 h-5 flex-shrink-0 text-amber-400" />
            <div>
              <span>You chose the <strong>{profile?.chosenPath}</strong> path. Path changes are locked until <strong>{unlockDateFormatted}</strong> to build sustainable discipline.</span>
            </div>
          </div>
        )}

        {/* Path Cards Grid */}
        <div 
          className="grid grid-cols-1 md:grid-cols-2 gap-6"
          role="radiogroup"
          aria-label="Selectable growth paths"
        >
          {PATHS.map((path, idx) => {
            const isRec = recommendedPath === path.id;
            const isGrowth = growthAreaPath === path.id && !isRec;
            const isCurrentlyChosen = profile?.chosenPath?.toUpperCase() === path.id;
            const cardDisabled = isLocked && !isCurrentlyChosen;
            const score = getScoreForPath(path.id);
            const Icon = path.icon;

            return (
              <div
                key={path.id}
                ref={(el) => { cardRefs.current[idx] = el; }}
                tabIndex={cardDisabled ? -1 : 0}
                role="radio"
                aria-checked={isCurrentlyChosen}
                aria-disabled={cardDisabled}
                aria-label={`${path.name} Path, score ${score} percent`}
                onClick={() => !cardDisabled && handleOpenModal(path.id)}
                className={`glass-panel p-6 rounded-2xl flex flex-col justify-between transition-all duration-200 border-2 relative outline-none cursor-pointer ${
                  path.borderClass
                } ${
                  cardDisabled ? 'opacity-40 cursor-not-allowed hover:border-slate-800' : 'hover:-translate-y-1 hover:shadow-xl'
                } ${
                  focusedIndex === idx ? 'ring-2 ring-[#8B5CF6] ring-offset-2 ring-offset-[#0F172A]' : ''
                } ${
                  isCurrentlyChosen ? 'ring-2 ring-emerald-500 bg-emerald-950/10' : ''
                }`}
              >
                {/* Badges row */}
                <div className="flex flex-wrap items-center justify-between gap-2 mb-4">
                  <div className="flex items-center space-x-2">
                    <div 
                      className="w-8 h-8 rounded-xl flex items-center justify-center"
                      style={{ backgroundColor: `${path.colorHex}15` }}
                    >
                      <Icon className="w-4 h-4" style={{ color: path.colorHex }} />
                    </div>
                    <span className="text-xl font-extrabold text-white">{path.name}</span>
                  </div>

                  <div className="flex items-center space-x-2">
                    {isRec && (
                      <span className="px-3 py-1 rounded-full text-[11px] font-extrabold uppercase tracking-wider bg-[#8B5CF6] text-white flex items-center shadow-sm shadow-[#8B5CF6]/30">
                        <Sparkles className="w-3 h-3 mr-1" /> Recommended for you
                      </span>
                    )}
                    {isGrowth && (
                      <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-orange-500/10 text-orange-400 border border-orange-500/30 flex items-center">
                        <TrendingUp className="w-3 h-3 mr-1" /> Biggest room to grow
                      </span>
                    )}
                    {isCurrentlyChosen && (
                      <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-emerald-500/20 text-emerald-400 border border-emerald-500/40">
                        Current Path
                      </span>
                    )}
                  </div>
                </div>

                {/* Description & Score */}
                <div className="space-y-3 mb-5">
                  <p className="text-slate-300 text-xs leading-relaxed">{path.desc}</p>
                  
                  {/* Score pill */}
                  <div className="flex items-center justify-between p-2.5 rounded-xl bg-slate-900/60 border border-slate-800">
                    <span className="text-[11px] font-semibold text-slate-400">Baseline Assessment Score</span>
                    <span className="text-sm font-bold font-mono" style={{ color: path.colorHex }}>
                      {score}%
                    </span>
                  </div>

                  {/* Recommendation Reasons (if recommended) */}
                  {isRec && reasons.length > 0 && (
                    <div className="p-3 rounded-xl bg-[#8B5CF6]/10 border border-[#8B5CF6]/20 space-y-1.5 text-xs text-slate-300">
                      <span className="text-[10px] font-extrabold uppercase tracking-wider text-[#a78bfa] block">
                        Why this fits your matrix:
                      </span>
                      {reasons.slice(0, 2).map((r, i) => (
                        <p key={i} className="text-slate-300 text-[11px] leading-relaxed">
                          • {r}
                        </p>
                      ))}
                    </div>
                  )}
                </div>

                {/* Example Daily Quests */}
                <div className="space-y-2 mb-6 pt-3 border-t border-slate-800/60">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 block">
                    Example Daily Quests:
                  </span>
                  {path.exampleTasks.map((task, i) => (
                    <div key={i} className="flex items-start text-xs text-slate-400">
                      <Check className="w-3.5 h-3.5 mr-1.5 text-slate-500 flex-shrink-0 mt-0.5" />
                      <span className="text-[11px]">{task}</span>
                    </div>
                  ))}
                </div>

                {/* Select Button */}
                <button
                  type="button"
                  disabled={cardDisabled}
                  onClick={(e) => {
                    e.stopPropagation();
                    if (!cardDisabled) handleOpenModal(path.id);
                  }}
                  className={`w-full py-3 rounded-xl font-bold text-xs uppercase tracking-wider flex items-center justify-center transition cursor-pointer ${
                    cardDisabled
                      ? 'bg-slate-800 text-slate-500 cursor-not-allowed'
                      : isCurrentlyChosen
                      ? 'bg-emerald-600 hover:bg-emerald-500 text-white'
                      : isRec
                      ? 'bg-[#8B5CF6] hover:bg-[#7c4fe3] text-white shadow-lg shadow-[#8B5CF6]/20'
                      : 'bg-slate-800 hover:bg-slate-700 text-white border border-slate-700'
                  }`}
                >
                  {isCurrentlyChosen ? 'Currently Active' : cardDisabled ? 'Locked' : `Select ${path.name}`}
                  {!cardDisabled && <ArrowRight className="w-3.5 h-3.5 ml-1.5" />}
                </button>
              </div>
            );
          })}
        </div>
      </div>

      {/* Confirmation Modal */}
      <AnimatePresence>
        {modalOpen && selectedConfig && (
          <div 
            className="fixed inset-0 z-50 flex items-center justify-center px-4 bg-slate-950/80 backdrop-blur-sm"
            role="dialog"
            aria-modal="true"
            aria-labelledby="confirm-modal-title"
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="glass-panel w-full max-w-md p-6 rounded-2xl border border-slate-700 bg-slate-900/95 space-y-6 shadow-2xl relative"
            >
              {/* Close Icon */}
              <button
                type="button"
                onClick={() => setModalOpen(false)}
                aria-label="Close modal"
                className="absolute top-4 right-4 text-slate-400 hover:text-white p-1 rounded-lg transition"
              >
                <X className="w-5 h-5" />
              </button>

              <div className="space-y-2">
                <div className="flex items-center space-x-2">
                  <div
                    className="w-8 h-8 rounded-xl flex items-center justify-center"
                    style={{ backgroundColor: `${selectedConfig.colorHex}20` }}
                  >
                    <selectedConfig.icon className="w-4 h-4" style={{ color: selectedConfig.colorHex }} />
                  </div>
                  <h3 id="confirm-modal-title" className="text-xl font-extrabold text-white">
                    Confirm Path: {selectedConfig.name}
                  </h3>
                </div>
                <p className="text-slate-300 text-xs leading-relaxed">
                  Your daily tasks will come only from the <strong>{selectedConfig.name}</strong> path.
                </p>
              </div>

              <div className="p-4 rounded-xl bg-slate-950/60 border border-slate-800 space-y-2 text-xs text-slate-400">
                <div className="flex items-center text-slate-300 font-semibold">
                  <AlertCircle className="w-4 h-4 mr-1.5 text-amber-400 flex-shrink-0" />
                  7-Day Focus Commitment
                </div>
                <p className="text-[11px] leading-relaxed">
                  Once chosen, your path is locked for 7 days to give your habits time to compound. You can switch freely when the 7-day cycle unlocks.
                </p>
              </div>

              {errorMsg && (
                <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/30 text-red-400 text-xs">
                  {errorMsg}
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex items-center justify-end space-x-3 pt-2">
                <button
                  ref={cancelBtnRef}
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="px-5 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold text-xs transition cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  ref={confirmBtnRef}
                  type="button"
                  disabled={submitting}
                  onClick={handleConfirmChoice}
                  className="px-6 py-2.5 rounded-xl bg-[#8B5CF6] hover:bg-[#7c4fe3] text-white font-bold text-xs flex items-center shadow-lg shadow-[#8B5CF6]/30 transition cursor-pointer disabled:opacity-50"
                >
                  {submitting ? 'Confirming...' : 'Confirm & Enter Dashboard'}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
