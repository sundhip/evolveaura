"use client";
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowRight, ArrowLeft, X, Sparkles } from 'lucide-react';

interface TourProps {
  bottleneck: string;
  onComplete: () => void;
}

const STEPS = [
  {
    targetId: null,
    title: "System Awakening",
    description: "Welcome, Evolver. The EvolveAura system has scanned your digital signature. Digital saturation detected. Let's calibrate your stabilization matrix to target real-world growth.",
    badge: "Calibration Init"
  },
  {
    targetId: "rank-matrix",
    title: "Aura Rank Matrix",
    description: "This is your current Rank standing (from E to S). Calibrated by your assessments, it dictates your status, unlocked quests, and difficulty settings.",
    badge: "Evolution Status"
  },
  {
    targetId: "xp-leveling",
    title: "XP Stabilization Bar",
    description: "Monitor your level and experience growth. Verify quests and complete study sessions to gain XP. Leveling up boosts your standing and rewards.",
    badge: "Progression Module"
  },
  {
    targetId: "shields-vault",
    title: "Aura Shields Vault",
    description: "Shields protect your consistency streak. If you are unable to log focus or finish quests on a busy day, a shield is automatically consumed to maintain your streak.",
    badge: "Streak Protector"
  },
  {
    targetId: "assessment-portal",
    title: "Calibration Portal",
    description: "Felt your habits change? Access the assessment portal here at any time to retake the diagnostic and recalibrate your focus path bottleneck.",
    badge: "Recalibration Portal"
  },
  {
    targetId: "weakness-alerts",
    title: "Aura Companion AI",
    description: "Your behavioral assistant reads telemetry, identifies daily focus leaks, and gives psychological prompts based on Self-Determination Theory.",
    badge: "AI Guide"
  },
  {
    targetId: "chest-tracker",
    title: "Daily Login Tracker",
    description: "Build your streak by signing in every day. Each consecutive day unlocks larger chests containing higher XP rewards. Consistency pays off!",
    badge: "Daily Tracker"
  },
  {
    targetId: "boss-trials",
    title: "Gate of Trials (Weekly Boss)",
    description: "Your digital distractions (like doom-scrolling) take shape as weekly raid bosses. Deal damage to them by completing Pomodoro timers and tasks.",
    badge: "Habit Slayer"
  },
  {
    targetId: "gameplay-board",
    title: "Quest Matrix",
    description: "Your daily directive consists of 7 personalized tasks tailored to heal your bottleneck. Complete and submit reflections to verify them.",
    badge: "Daily Directive"
  },
  {
    targetId: "distraction-stabilizer",
    title: "Emergency Stabilizer",
    description: "Feeling an overwhelming urge to scroll short-form feeds? Tap this emergency button immediately to start a guided box-breathing stabilizer.",
    badge: "Crisis Stabilizer"
  },
  {
    targetId: null,
    title: "Evolution Matrix Calibrated",
    description: "Calibration complete! You are now equipped to navigate the evolutionary matrix. Break the distraction cycles and level up in real life.",
    badge: "Systems Online"
  }
];

export default function AwakeningTour({ bottleneck, onComplete }: TourProps) {
  const [step, setStep] = useState(1);
  const [coords, setCoords] = useState<{ top: number; left: number; width: number; height: number } | null>(null);
  const [viewport, setViewport] = useState({ width: 1200, height: 800 });

  // Watch viewport size on the client
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const handleResize = () => {
        setViewport({ width: window.innerWidth, height: window.innerHeight });
      };
      handleResize();
      window.addEventListener('resize', handleResize);
      return () => window.removeEventListener('resize', handleResize);
    }
  }, []);

  // Update target coordinates when step changes
  useEffect(() => {
    const currentStep = STEPS[step - 1];
    if (!currentStep.targetId) {
      setCoords(null);
      return;
    }

    const updateCoordinates = () => {
      const el = document.getElementById(currentStep.targetId!);
      if (el) {
        el.scrollIntoView({ behavior: 'smooth', block: 'center' });
        
        const checkRect = () => {
          const rect = el.getBoundingClientRect();
          setCoords({
            top: rect.top,
            left: rect.left,
            width: rect.width,
            height: rect.height
          });
        };
        
        checkRect();
        const timeoutId = setTimeout(checkRect, 300);
        return () => clearTimeout(timeoutId);
      } else {
        setCoords(null);
      }
    };

    const cleanup = updateCoordinates();
    
    window.addEventListener('resize', updateCoordinates);
    window.addEventListener('scroll', updateCoordinates);
    
    return () => {
      if (cleanup) cleanup();
      window.removeEventListener('resize', updateCoordinates);
      window.removeEventListener('scroll', updateCoordinates);
    };
  }, [step]);

  const getCardStyle = () => {
    const cardWidth = 380;
    const cardHeight = 240;
    const padding = 20;

    // Centered modal styling if no target element exists
    if (!coords) {
      return {
        top: '50%',
        left: '50%',
        transform: 'translate(-50%, -50%)',
        position: 'fixed' as const
      };
    }

    const spaceBelow = viewport.height - (coords.top + coords.height);
    const spaceAbove = coords.top;
    const spaceRight = viewport.width - (coords.left + coords.width);
    const spaceLeft = coords.left;

    let centerX = 0;
    let centerY = 0;

    if (spaceBelow > cardHeight + padding) {
      // Place card below target element
      centerY = coords.top + coords.height + padding + cardHeight / 2;
      centerX = coords.left + coords.width / 2;
    } else if (spaceAbove > cardHeight + padding) {
      // Place card above target element
      centerY = coords.top - padding - cardHeight / 2;
      centerX = coords.left + coords.width / 2;
    } else if (spaceRight > cardWidth + padding) {
      // Place card to the right of target element
      centerY = coords.top + coords.height / 2;
      centerX = coords.left + coords.width + padding + cardWidth / 2;
    } else if (spaceLeft > cardWidth + padding) {
      // Place card to the left of target element
      centerY = coords.top + coords.height / 2;
      centerX = coords.left - padding - cardWidth / 2;
    } else {
      // Centered fallback
      return {
        top: '50%',
        left: '50%',
        transform: 'translate(-50%, -50%)',
        position: 'fixed' as const
      };
    }

    // Prevent card from bleeding off viewport boundaries
    const margin = padding;
    centerX = Math.max(margin + cardWidth / 2, Math.min(viewport.width - margin - cardWidth / 2, centerX));
    centerY = Math.max(margin + cardHeight / 2, Math.min(viewport.height - margin - cardHeight / 2, centerY));

    return {
      top: `${centerY}px`,
      left: `${centerX}px`,
      transform: 'translate(-50%, -50%)',
      position: 'fixed' as const
    };
  };

  const currentStep = STEPS[step - 1];

  return (
    <div className="fixed inset-0 z-50">
      {/* SVG Spotlight Overlay */}
      <svg className="absolute inset-0 w-full h-full pointer-events-auto">
        <defs>
          <mask id="spotlight-mask">
            <rect x="0" y="0" width="100%" height="100%" fill="white" />
            <motion.rect
              animate={{
                x: coords ? coords.left - 8 : 0,
                y: coords ? coords.top - 8 : 0,
                width: coords ? coords.width + 16 : 0,
                height: coords ? coords.height + 16 : 0,
                rx: coords ? 16 : 0,
                ry: coords ? 16 : 0,
                opacity: coords ? 1 : 0
              }}
              transition={{ type: 'spring', damping: 25, stiffness: 120 }}
              fill="black"
            />
          </mask>
        </defs>
        <rect
          x="0"
          y="0"
          width="100%"
          height="100%"
          fill="rgba(8, 10, 20, 0.85)"
          mask="url(#spotlight-mask)"
        />
      </svg>

      {/* Spotlight Border Glow */}
      {coords && (
        <motion.div
          animate={{
            x: coords.left - 8,
            y: coords.top - 8,
            width: coords.width + 16,
            height: coords.height + 16,
            opacity: 1
          }}
          transition={{ type: 'spring', damping: 25, stiffness: 120 }}
          className="fixed border border-[#8B5CF6]/80 rounded-2xl shadow-[0_0_25px_rgba(139,92,246,0.35)] pointer-events-none z-50 bg-[#8B5CF6]/5"
          style={{ position: 'fixed', top: 0, left: 0 }}
        />
      )}

      {/* Floating Card */}
      <motion.div
        animate={getCardStyle()}
        transition={{ type: 'spring', damping: 25, stiffness: 120 }}
        className="fixed z-50 glass-panel p-6 w-[380px] bg-slate-900/95 border border-slate-800 rounded-2xl shadow-2xl flex flex-col justify-between"
        style={{ minHeight: '230px' }}
      >
        <div className="space-y-3">
          <div className="flex justify-between items-center">
            <span className="px-2 py-0.5 rounded-full bg-[#8B5CF6]/15 text-[#8B5CF6] text-[10px] font-bold uppercase tracking-wider">
              {currentStep.badge}
            </span>
            <button 
              onClick={onComplete}
              className="text-slate-500 hover:text-white transition cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <h3 className="text-lg font-extrabold text-white tracking-wide">
            {currentStep.title}
          </h3>

          <p className="text-slate-300 text-xs leading-relaxed font-normal">
            {currentStep.description}
          </p>
        </div>

        <div className="flex justify-between items-center pt-4 border-t border-slate-800/60 mt-4">
          <span className="text-[10px] text-slate-500 font-bold">
            Step {step} of {STEPS.length}
          </span>

          <div className="flex space-x-2">
            {step > 1 && (
              <button
                onClick={() => setStep(step - 1)}
                className="px-3.5 py-1.5 rounded-xl bg-slate-950/60 border border-slate-800 hover:text-white text-slate-400 text-xs font-bold transition flex items-center cursor-pointer"
              >
                <ArrowLeft className="w-3.5 h-3.5 mr-1" /> Back
              </button>
            )}

            {step < STEPS.length ? (
              <button
                onClick={() => setStep(step + 1)}
                className="px-4 py-1.5 rounded-xl bg-[#8B5CF6] hover:bg-[#7c4fe3] text-white text-xs font-bold transition flex items-center cursor-pointer"
              >
                Next <ArrowRight className="w-3.5 h-3.5 ml-1" />
              </button>
            ) : (
              <button
                onClick={onComplete}
                className="px-4 py-1.5 rounded-xl bg-gradient-to-r from-[#8B5CF6] to-[#60A5FA] text-white text-xs font-bold transition flex items-center cursor-pointer"
              >
                Awaken Matrix <Sparkles className="w-3.5 h-3.5 ml-1" />
              </button>
            )}
          </div>
        </div>
      </motion.div>
    </div>
  );
}
