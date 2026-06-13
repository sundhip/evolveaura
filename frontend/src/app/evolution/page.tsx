"use client";
import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { apiRequest } from '../../lib/api';
import { Compass, Zap, Shield, Heart, Trophy, Award, Lock, ArrowLeft } from 'lucide-react';

export default function EvolutionPage() {
  const router = useRouter();
  const [profile, setProfile] = useState<any>(null);
  const [achievements, setAchievements] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadEvolution() {
      try {
        const user = await apiRequest('/auth/profile');
        setProfile(user.profile);
        
        // Fetch achievements
        const allAchievements = user.achievements || [];
        setAchievements(allAchievements);
      } catch (err) {
        console.error("Load evolution page error", err);
        router.push('/login');
      } finally {
        setLoading(false);
      }
    }
    loadEvolution();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center text-white bg-[#0F172A]">
        <div className="text-center space-y-4">
          <div className="w-12 h-12 rounded-full border-4 border-[#8B5CF6] border-t-transparent animate-spin mx-auto" />
          <p className="text-slate-400">Syncing evolution boards...</p>
        </div>
      </div>
    );
  }

  // Predefined achievements to show locked states
  const achievementLibrary = [
    { name: "7 Day Streak", description: "Maintain a study or habits streak for 7 consecutive days.", icon: "Flame", req: "7 Days" },
    { name: "30 Day Streak", description: "Maintain a study or habits streak for 30 consecutive days.", icon: "Crown", req: "30 Days" },
    { name: "Scholar Rank B", description: "Reach Rank B in the Scholar path.", icon: "BookOpen", req: "Rank B" },
    { name: "Detox Champion", description: "Achieve a Detox Score of 90 or higher in a single day.", icon: "ShieldCheck", req: "90% Detox" },
    { name: "Focus Master", description: "Complete a total of 10 Focus sessions.", icon: "Timer", req: "10 Sessions" },
    { name: "Consistency Master", description: "Complete all 4 daily quests for 5 days in a row.", icon: "Award", req: "5 Days 4/4" }
  ];

  const hasUnlocked = (name: string) => {
    return achievements.some(a => a.achievement.name === name);
  };

  return (
    <div className="min-h-screen bg-[#0F172A] pb-16">
      {/* Navigation Header */}
      <header className="border-b border-slate-800 bg-slate-900/60 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-4 py-4 flex justify-between items-center">
          <div className="text-xl font-extrabold tracking-wider text-[#8B5CF6] cursor-pointer" onClick={() => router.push('/dashboard')}>
            EVOLVE<span className="text-white">AURA</span>
          </div>
          <nav className="flex space-x-6 text-sm font-medium">
            <Link href="/dashboard" className="text-slate-400 hover:text-white">Dashboard</Link>
            <Link href="/focus" className="text-slate-400 hover:text-white">Focus</Link>
            <Link href="/evolution" className="text-white hover:text-[#8B5CF6]">Evolution</Link>
            <Link href="/subject-analysis" className="text-slate-400 hover:text-white">Subjects</Link>
            <Link href="/analysis" className="text-slate-400 hover:text-white">Analysis</Link>
          </nav>
        </div>
      </header>

      {/* Content Container */}
      <div className="max-w-4xl mx-auto px-4 mt-10 space-y-12">
        {/* Profile Stats Overview */}
        <div className="glass-panel p-8 grid grid-cols-1 md:grid-cols-2 gap-8 items-center border-l-4 border-l-[#8B5CF6]">
          <div className="space-y-4">
            <div className="text-[#8B5CF6] font-bold text-xs uppercase tracking-widest">Evolver Status</div>
            <h1 className="text-3xl font-extrabold text-white tracking-tight">{profile.name}</h1>
            <p className="text-slate-400 text-sm leading-relaxed">
              Your status represents your progress against instant gratification triggers. Strengthen your parameters across all fields.
            </p>
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div className="p-4 bg-slate-950/40 border border-slate-800 rounded-xl">
              <span className="text-slate-500 text-[10px] uppercase font-bold">Aura Rank</span>
              <div className="text-3xl font-extrabold text-[#8B5CF6] mt-1">{profile.auraRank}</div>
            </div>
            <div className="p-4 bg-slate-950/40 border border-slate-800 rounded-xl">
              <span className="text-slate-500 text-[10px] uppercase font-bold">Level Parameters</span>
              <div className="text-3xl font-extrabold text-white mt-1">Lvl {profile.currentLevel}</div>
            </div>
          </div>
        </div>

        {/* Boss Battles Section */}
        <div className="space-y-6">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-bold text-white">Internal Boss Encounters</h2>
            <span className="text-xs text-orange-400 font-semibold uppercase tracking-wider flex items-center">
              <Trophy className="w-4 h-4 mr-1" /> XP Boss Multipliers
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Boss 1 */}
            <div className="glass-panel p-6 bg-gradient-to-br from-red-950/20 to-slate-900 border border-red-900/20 relative overflow-hidden flex flex-col justify-between min-h-[220px]">
              <div className="absolute top-[-20px] right-[-20px] w-24 h-24 rounded-full bg-red-600/10 blur-xl pointer-events-none" />
              <div>
                <span className="text-red-400 font-bold text-[10px] uppercase tracking-widest">Rank D Threat</span>
                <h3 className="text-lg font-bold text-white mt-1">Doom Scroll Demon</h3>
                <p className="text-slate-400 text-xs mt-2 leading-relaxed">
                  Defeat by keeping social media locked for 3 hours. Rewards +100 XP.
                </p>
              </div>
              <button 
                onClick={() => router.push('/focus')}
                className="mt-6 w-full py-2.5 rounded-lg bg-red-950/50 hover:bg-red-900/30 text-red-300 border border-red-800/40 text-xs font-bold transition"
              >
                Engage Battle
              </button>
            </div>

            {/* Boss 2 */}
            <div className="glass-panel p-6 bg-gradient-to-br from-[#8B5CF6]/10 to-slate-900 border border-[#8B5CF6]/20 relative overflow-hidden flex flex-col justify-between min-h-[220px]">
              <div className="absolute top-[-20px] right-[-20px] w-24 h-24 rounded-full bg-[#8B5CF6]/10 blur-xl pointer-events-none" />
              <div>
                <span className="text-[#8B5CF6] font-bold text-[10px] uppercase tracking-widest">Rank B Threat</span>
                <h3 className="text-lg font-bold text-white mt-1">Attention Destroyer</h3>
                <p className="text-slate-400 text-xs mt-2 leading-relaxed">
                  Defeat by completing a 90-minute focus session. Rewards +250 XP.
                </p>
              </div>
              <button 
                onClick={() => router.push('/focus')}
                className="mt-6 w-full py-2.5 rounded-lg bg-[#8B5CF6]/25 hover:bg-[#8B5CF6]/35 text-[#8B5CF6] border border-[#8B5CF6]/40 text-xs font-bold transition"
              >
                Engage Battle
              </button>
            </div>

            {/* Boss 3 */}
            <div className="glass-panel p-6 bg-gradient-to-br from-amber-950/20 to-slate-900 border border-amber-900/20 relative overflow-hidden flex flex-col justify-between min-h-[220px]">
              <div className="absolute top-[-20px] right-[-20px] w-24 h-24 rounded-full bg-amber-600/10 blur-xl pointer-events-none" />
              <div>
                <span className="text-amber-400 font-bold text-[10px] uppercase tracking-widest">Rank S Threat</span>
                <h3 className="text-lg font-bold text-white mt-1">Procrastination King</h3>
                <p className="text-slate-400 text-xs mt-2 leading-relaxed">
                  Defeat by completing all 4 daily quests today. Rewards +500 XP.
                </p>
              </div>
              <button 
                onClick={() => router.push('/dashboard')}
                className="mt-6 w-full py-2.5 rounded-lg bg-amber-950/50 hover:bg-amber-900/30 text-amber-300 border border-amber-800/40 text-xs font-bold transition"
              >
                Engage Battle
              </button>
            </div>
          </div>
        </div>

        {/* Achievements Section */}
        <div className="space-y-6">
          <h2 className="text-xl font-bold text-white">Achievements / Badges</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {achievementLibrary.map((ach) => {
              const unlocked = hasUnlocked(ach.name);
              return (
                <div 
                  key={ach.name}
                  className={`glass-panel p-5 flex items-center justify-between border transition ${
                    unlocked ? 'border-emerald-500/20 bg-slate-900/40' : 'border-slate-800/50 opacity-40 bg-slate-950/20'
                  }`}
                >
                  <div className="flex items-center space-x-4">
                    <div className={`w-12 h-12 rounded-xl flex items-center justify-center border ${
                      unlocked ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400' : 'bg-slate-950/50 border-slate-800 text-slate-500'
                    }`}>
                      {unlocked ? <Award className="w-6 h-6" /> : <Lock className="w-6 h-6" />}
                    </div>
                    <div>
                      <h4 className="text-white font-bold text-sm">{ach.name}</h4>
                      <p className="text-slate-400 text-xs leading-relaxed max-w-xs mt-0.5">{ach.description}</p>
                    </div>
                  </div>
                  <div className="text-[10px] font-bold text-slate-500 bg-slate-950/50 px-2.5 py-1 rounded-md">
                    {ach.req}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
