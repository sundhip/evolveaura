"use client";
import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { ShieldAlert, Zap, Compass, Heart } from 'lucide-react';
import AwakeningTour from '../components/AwakeningTour';

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

      {/* Bottom Features */}
      <div className="w-full max-w-6xl grid grid-cols-2 md:grid-cols-4 gap-6 mt-12">
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
