"use client";
import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { ArrowRight, ArrowLeft, X, Sparkles } from 'lucide-react';

export interface TourStep {
  targetId: string | null;
  title: string;
  description: string;
  badge: string;
}

interface TourProps {
  steps: TourStep[];
  onComplete: () => void;
}

export default function AwakeningTour({ steps, onComplete }: TourProps) {
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

  // Update target coordinates when step changes with polling retries
  useEffect(() => {
    let active = true;
    const currentStep = steps[step - 1];
    if (!currentStep || !currentStep.targetId) {
      setCoords(null);
      return;
    }

    let selector = currentStep.targetId!;
    if (!selector.startsWith('#') && !selector.startsWith('.')) {
      selector = `#${selector}`;
    }

    let hasScrolled = false;

    const track = () => {
      if (!active) return;
      const el = document.querySelector(selector);
      if (el) {
        const rect = el.getBoundingClientRect();
        
        // Scroll into view once if not in viewport
        if (!hasScrolled && rect.width > 0 && rect.height > 0) {
          const isInViewport = 
            rect.top >= 0 &&
            rect.left >= 0 &&
            rect.bottom <= window.innerHeight &&
            rect.right <= window.innerWidth;

          if (!isInViewport) {
            el.scrollIntoView({ behavior: 'smooth', block: 'center' });
          }
          hasScrolled = true;
        }

        if (rect.width > 0 && rect.height > 0) {
          setCoords(prev => {
            if (prev &&
                Math.abs(prev.top - rect.top) < 2 &&
                Math.abs(prev.left - rect.left) < 2 &&
                Math.abs(prev.width - rect.width) < 2 &&
                Math.abs(prev.height - rect.height) < 2) {
              return prev;
            }
            return {
              top: rect.top,
              left: rect.left,
              width: rect.width,
              height: rect.height
            };
          });
        } else {
          setCoords(prev => prev === null ? null : null);
        }
      } else {
        setCoords(prev => prev === null ? null : null);
      }
    };

    track();
    const interval = setInterval(track, 150);

    // Also track on window resize for immediate responsiveness
    window.addEventListener('resize', track);

    return () => {
      active = false;
      clearInterval(interval);
      window.removeEventListener('resize', track);
    };
  }, [step, steps]);

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

  const currentStep = steps[step - 1];
  if (!currentStep) return null;

  return (
    <div className="fixed inset-0 z-55">
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
          className="fixed border border-[#8B5CF6]/80 rounded-2xl shadow-[0_0_25px_rgba(139,92,246,0.35)] pointer-events-none z-55 bg-[#8B5CF6]/5"
          style={{ position: 'fixed', top: 0, left: 0 }}
        />
      )}

      {/* Floating Card */}
      <motion.div
        animate={getCardStyle()}
        transition={{ type: 'spring', damping: 25, stiffness: 120 }}
        className="fixed z-55 glass-panel p-6 w-[380px] bg-slate-900/95 border border-slate-800 rounded-2xl shadow-2xl flex flex-col justify-between"
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
            Step {step} of {steps.length}
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

            {step < steps.length ? (
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
                Done <Sparkles className="w-3.5 h-3.5 ml-1" />
              </button>
            )}
          </div>
        </div>
      </motion.div>
    </div>
  );
}
