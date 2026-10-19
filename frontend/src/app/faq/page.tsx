"use client";
import React, { useState } from 'react';
import Link from 'next/link';
import { ArrowLeft, ChevronDown } from 'lucide-react';

const FAQS = [
  { q: "Is EvolveAura completely free of cost?", a: "Yes, EvolveAura is 100% free of charge. There are no subscriptions, paywalls, or hidden costs. It is built as a public utility for digital health." },
  { q: "How do assessment questions refresh over time?", a: "Each assessment serves 16 questions (4 per path). The assessment engine automatically excludes questions you answered in your last 3 attempts, ensuring you receive fresh behavioral scenarios every time you take it." },
  { q: "Why is there a 7-day lock when I choose a path?", a: "Behavioral science demonstrates that constant context switching prevents habit crystallization. Locking your chosen path for 7 days ensures you receive pure, focused daily quests aligned with your core archetype before re-evaluating." },
  { q: "What is an Aura Shield?", a: "Aura Shields protect your streak from resetting. If you complete a 7-day streak or reach smoke-free milestones (days 3, 7, 14), you earn an Aura Shield. If life gets in the way or you slip, the shield absorbs the disruption to maintain your momentum." },
  { q: "Is the Smoke-Free Path really confidential?", a: "Yes, completely. Your smoking history, craving logs, and check-in entries are stored in isolated tables. They are NEVER shared on leaderboards, profile badges, duels, or social feeds. You can export or permanently delete your quit data at any time." },
  { q: "What evidence is the Smoke-Free Path based on?", a: "It is modeled on findings from official Tobacco Cessation Clinics (Kaushik et al., 2023, 2025; J Family Med Prim Care 2023), which found that regular follow-up and daily self-monitoring are the single biggest predictors of long-term success. Slips are treated non-judgmentally with honesty bonuses." },
  { q: "How do I deal damage to Bosses?", a: "Bosses represent negative habits. You deal damage to the active Boss by completing focus blocks (25 min focus = 100 damage), submitting reflections, completing daily quests, and surviving cravings. For the Nicotine Shade recovery boss, healthy actions deal damage, and slips NEVER heal the boss." }
];

export default function FAQPage() {
  const [openIdx, setOpenIdx] = useState<number | null>(null);

  return (
    <div className="min-h-screen bg-[#0F172A] pb-16">
      <header className="border-b border-slate-800 bg-slate-900/60 backdrop-blur-md">
        <div className="max-w-6xl mx-auto px-4 py-4 flex justify-between items-center">
          <Link href="/dashboard" className="text-slate-400 hover:text-white flex items-center text-sm font-semibold">
            <ArrowLeft className="w-4 h-4 mr-2" /> Back
          </Link>
          <div className="text-white font-bold text-sm">FAQ</div>
        </div>
      </header>

      <div className="max-w-2xl mx-auto px-4 mt-12 space-y-6">
        <h1 className="text-2xl font-bold text-white text-center mb-8">Frequently Asked Questions</h1>

        <div className="space-y-4">
          {FAQS.map((faq, idx) => (
            <div key={idx} className="glass-panel overflow-hidden border border-slate-800/80">
              <button 
                onClick={() => setOpenIdx(openIdx === idx ? null : idx)}
                className="w-full p-5 flex justify-between items-center text-left font-bold text-white text-sm md:text-base hover:bg-slate-900/40 transition"
              >
                <span>{faq.q}</span>
                <ChevronDown className={`w-5 h-5 text-slate-500 transition-transform ${openIdx === idx ? 'rotate-180' : ''}`} />
              </button>
              {openIdx === idx && (
                <div className="p-5 border-t border-slate-800/60 text-slate-400 text-xs md:text-sm leading-relaxed bg-slate-900/20">
                  {faq.a}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
