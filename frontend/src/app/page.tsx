"use client";
import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { ShieldAlert, Zap, Compass, Heart } from 'lucide-react';
import AwakeningTour from '../components/AwakeningTour';
import { QUIT_COPY } from '@/lib/quitCopy';

export default function LandingPage() {
  const [showTour, setShowTour] = useState(false);

  useEffect(() => {
    const completed = localStorage.getItem('hasCompletedLandingTour');
    if (!completed) {
      setShowTour(true);
    }
  }, []);

  return (
    <div className="min-h-screen flex flex-col justify-between items-center px-4 py-8 bg-[#0F172A]">
      {showTour && (
        <AwakeningTour 
          steps={LANDING_TOUR_STEPS} 
          onComplete={() => { 
            setShowTour(false); 
            localStorage.setItem('hasCompletedLandingTour', 'true'); 
          }} 
        />
      )}

      {/* Header */}
      <div className="w-full max-w-6xl flex justify-between items-center py-4">
        <div className="text-2xl font-extrabold tracking-wider text-[#8B5CF6]">
          EVOLVE<span className="text-white">AURA</span>
        </div>
        <div className="flex items-center space-x-6">
          <Link id="landing-about" href="/about" className="text-slate-400 hover:text-white text-sm font-semibold transition">
            About
          </Link>
          <Link id="landing-faq" href="/faq" className="text-slate-400 hover:text-white text-sm font-semibold transition">
            FAQ
          </Link>
          <button onClick={() => setShowTour(true)} className="text-slate-400 hover:text-white text-sm font-semibold transition cursor-pointer">
            Tour
          </button>
          <Link id="landing-signin" href="/login" className="px-5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-medium border border-slate-700 transition duration-300">
            Sign In
          </Link>
          <Link id="landing-signup" href="/register" className="px-5 py-2 rounded-xl bg-[#8B5CF6] hover:bg-[#7c4fe3] text-white font-medium transition duration-300">
            Sign Up
          </Link>
        </div>
      </div>

      {/* Hero Section */}
      <div className="w-full max-w-4xl text-center flex flex-col items-center my-auto">
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="px-4 py-1.5 rounded-full bg-[#8B5CF6]/10 text-[#8B5CF6] text-xs font-semibold uppercase tracking-widest border border-[#8B5CF6]/20 mb-6"
        >
          Stop Scrolling. Start Evolving.
        </motion.div>

        <motion.h1 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="text-5xl md:text-7xl font-extrabold tracking-tight text-white mb-6 leading-tight"
        >
          Redirect Your Dopamine.<br />
          <span className="bg-gradient-to-r from-[#8B5CF6] via-[#60A5FA] to-[#2DD4BF] bg-clip-text text-transparent">
            Level Up in Real Life.
          </span>
        </motion.h1>

        <motion.p 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.8, delay: 0.4 }}
          className="text-slate-400 text-lg md:text-xl max-w-2xl mb-10 leading-relaxed"
        >
          EvolveAura is a psychology-driven digital detox platform. We replace instant-gratification loops of Reels, Shorts, and TikTok with a real-life gamified evolution system.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.6 }}
        >
          <Link href="/register" className="px-8 py-4 rounded-2xl bg-[#8B5CF6] hover:bg-[#7c4fe3] text-white text-lg font-bold shadow-lg shadow-[#8B5CF6]/30 hover:shadow-[#8B5CF6]/50 transition duration-300 transform hover:-translate-y-0.5">
            Begin Your Evolution
          </Link>
        </motion.div>
      </div>

      {/* Smoke-Free Path Invitation Section */}
      <div className="w-full max-w-4xl my-16">
        <div className="glass-panel p-8 sm:p-10 border border-emerald-500/30 bg-emerald-950/10 rounded-3xl relative overflow-hidden">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6 mb-8">
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-semibold mb-2">
                <span>{QUIT_COPY.landingSectionBadge}</span>
              </div>
              <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
                {QUIT_COPY.landingSectionTitle}
              </h2>
              <p className="text-xs sm:text-sm text-slate-300 mt-2 max-w-xl leading-relaxed">
                {QUIT_COPY.landingSectionSubtitle}
              </p>
            </div>

            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 w-full md:w-auto shrink-0">
              <Link
                href="/quit/try"
                className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs sm:text-sm font-semibold border border-slate-700 text-center transition"
              >
                {QUIT_COPY.landingTryButton}
              </Link>
              <Link
                href="/quit"
                className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs sm:text-sm font-bold text-center shadow-lg shadow-emerald-950/30 transition"
              >
                {QUIT_COPY.landingStartButton}
              </Link>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-6 border-t border-slate-800/80">
            <div className="p-3.5 rounded-xl bg-slate-900/60 border border-slate-800/80">
              <div className="text-xs font-bold text-emerald-400 mb-1">{QUIT_COPY.landingFeature1Title}</div>
              <div className="text-[11px] text-slate-400 leading-relaxed">{QUIT_COPY.landingFeature1Desc}</div>
            </div>
            <div className="p-3.5 rounded-xl bg-slate-900/60 border border-slate-800/80">
              <div className="text-xs font-bold text-amber-400 mb-1">{QUIT_COPY.landingFeature2Title}</div>
              <div className="text-[11px] text-slate-400 leading-relaxed">{QUIT_COPY.landingFeature2Desc}</div>
            </div>
            <div className="p-3.5 rounded-xl bg-slate-900/60 border border-slate-800/80">
              <div className="text-xs font-bold text-blue-400 mb-1">{QUIT_COPY.landingFeature3Title}</div>
              <div className="text-[11px] text-slate-400 leading-relaxed">{QUIT_COPY.landingFeature3Desc}</div>
            </div>
          </div>

          <div className="mt-6 pt-4 border-t border-slate-800/60 text-[11px] text-slate-500 text-center sm:text-left flex items-center justify-between flex-wrap gap-2">
            <span>{QUIT_COPY.landingProfessionalSupportNote}</span>
            <span className="text-emerald-400 font-medium">Toll-Free 1800-11-2356</span>
          </div>
        </div>
      </div>

      {/* Bottom Features */}
      <div className="w-full max-w-6xl grid grid-cols-2 md:grid-cols-4 gap-6 mt-4">
        <div className="glass-panel p-6 flex flex-col items-center text-center">
          <div className="w-12 h-12 rounded-xl bg-blue-500/10 flex items-center justify-center text-[#60A5FA] mb-4">
            <Zap className="w-6 h-6" />
          </div>
          <h3 className="text-white font-bold mb-1">Scholar</h3>
          <p className="text-slate-400 text-xs">Deep focus & active recall learning</p>
        </div>
        <div className="glass-panel p-6 flex flex-col items-center text-center">
          <div className="w-12 h-12 rounded-xl bg-green-500/10 flex items-center justify-center text-[#22C55E] mb-4">
            <ShieldAlert className="w-6 h-6" />
          </div>
          <h3 className="text-white font-bold mb-1">Warrior</h3>
          <p className="text-slate-400 text-xs">Sleep, energy & exercise discipline</p>
        </div>
        <div className="glass-panel p-6 flex flex-col items-center text-center">
          <div className="w-12 h-12 rounded-xl bg-teal-500/10 flex items-center justify-center text-[#2DD4BF] mb-4">
            <Compass className="w-6 h-6" />
          </div>
          <h3 className="text-white font-bold mb-1">Sage</h3>
          <p className="text-slate-400 text-xs">Mindfulness, stress & resilience</p>
        </div>
        <div className="glass-panel p-6 flex flex-col items-center text-center">
          <div className="w-12 h-12 rounded-xl bg-amber-500/10 flex items-center justify-center text-[#F59E0B] mb-4">
            <Heart className="w-6 h-6" />
          </div>
          <h3 className="text-white font-bold mb-1">Creator</h3>
          <p className="text-slate-400 text-xs">Curiosity & creative confidence</p>
        </div>
      </div>
    </div>
  );
}

const LANDING_TOUR_STEPS = [
  {
    targetId: null,
    title: "Welcome to EvolveAura",
    description: "Welcome! EvolveAura is a digital detox and stabilization platform designed to help you replace short-form media habits with real-world growth and psychological evolution.",
    badge: "EvolveAura Intro"
  },
  {
    targetId: "landing-about",
    title: "About Platform",
    description: "Learn about EvolveAura's core paths: Scholar, Warrior, Sage, and Creator. Read our self-regulated learning and psychological research foundations here.",
    badge: "Platform Info"
  },
  {
    targetId: "landing-faq",
    title: "Frequently Asked Questions",
    description: "Find structured answers explaining streaks, shields, Pomodoro forest calculations, and Boss habits.",
    badge: "Support Hub"
  },
  {
    targetId: "landing-signin",
    title: "Access Core Matrix",
    description: "Already registered? Click Sign In to load your profile, manage active quests, and resume your evolutionary stats.",
    badge: "Sign In Portal"
  },
  {
    targetId: "landing-signup",
    title: "Begin Your Evolution",
    description: "New to the platform? Click Sign Up to complete onboarding, calibrate your assessment, and unlock your personal growth dashboard.",
    badge: "Registration Portal"
  },
  {
    targetId: null,
    title: "Calibrate Your Aura",
    description: "Ready to proceed? Register a new account or sign in to begin your digital detox journey!",
    badge: "Systems Ready"
  }
];
