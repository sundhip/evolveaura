"use client";
import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { apiRequest } from '../../lib/api';
import { Zap, ShieldCheck, Compass, Heart, Flame, Timer, BarChart3, BookOpen, AlertCircle } from 'lucide-react';

export default function DashboardPage() {
  const router = useRouter();
  const [profile, setProfile] = useState<any>(null);
  const [quests, setQuests] = useState<any[]>([]);
  const [insight, setInsight] = useState<string>('');
  const [loading, setLoading] = useState(true);
  const [completeMsg, setCompleteMsg] = useState<any>(null);

  useEffect(() => {
    async function loadDashboard() {
      try {
        const user = await apiRequest('/auth/profile');
        setProfile(user.profile);
        
        const dailyQuests = await apiRequest('/quests/daily');
        setQuests(dailyQuests);

        const dailyInsight = await apiRequest('/analysis/insight');
        setInsight(dailyInsight.insight);
      } catch (err) {
        console.error("Load dashboard error", err);
        // Redirect to login if unauthorized
        router.push('/login');
      } finally {
        setLoading(false);
      }
    }
    loadDashboard();
  }, []);

  const handleCompleteQuest = async (uqId: string) => {
    try {
      const res = await apiRequest(`/quests/complete/${uqId}`, { method: 'POST' });
      setCompleteMsg({
        title: "Quest Completed!",
        xp: res.xpDetails.xpAdded,
        leveledUp: res.xpDetails.leveledUp,
        level: res.xpDetails.level
      });

      // Update local state
      setQuests(quests.map(q => q.id === uqId ? { ...q, completed: true } : q));
      
      // Reload profile
      const user = await apiRequest('/auth/profile');
      setProfile(user.profile);

      setTimeout(() => setCompleteMsg(null), 4000);
    } catch (err: any) {
      alert(err.message || "Failed to complete quest");
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center text-white bg-[#0F172A]">
        <div className="text-center space-y-4">
          <div className="w-12 h-12 rounded-full border-4 border-[#8B5CF6] border-t-transparent animate-spin mx-auto" />
          <p className="text-slate-400">Loading your Evolve dashboard...</p>
        </div>
      </div>
    );
  }

  const getPathIcon = (pathName: string) => {
    switch (pathName) {
      case 'Scholar': return <Zap className="w-4 h-4 text-[#60A5FA]" />;
      case 'Warrior': return <ShieldCheck className="w-4 h-4 text-[#22C55E]" />;
      case 'Sage': return <Compass className="w-4 h-4 text-[#22C55E]" />;
      default: return <Heart className="w-4 h-4 text-[#F59E0B]" />;
    }
  };

  const getPathColor = (pathName: string) => {
    switch (pathName) {
      case 'Scholar': return 'text-[#60A5FA]';
      case 'Warrior': return 'text-[#22C55E]';
      case 'Sage': return 'text-[#2DD4BF]';
      default: return 'text-[#F59E0B]';
    }
  };

  const xpPercent = profile ? Math.round((profile.currentXP / (100 * Math.pow(profile.currentLevel, 1.5))) * 100) : 0;

  return (
    <div className="min-h-screen bg-[#0F172A] pb-12">
      {/* Navigation Header */}
      <header className="border-b border-slate-800 bg-slate-900/60 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-4 py-4 flex justify-between items-center">
          <div className="text-xl font-extrabold tracking-wider text-[#8B5CF6] cursor-pointer" onClick={() => router.push('/dashboard')}>
            EVOLVE<span className="text-white">AURA</span>
          </div>
          <nav className="flex space-x-6 text-sm font-medium">
            <Link href="/dashboard" className="text-white hover:text-[#8B5CF6]">Dashboard</Link>
            <Link href="/focus" className="text-slate-400 hover:text-white">Focus</Link>
            <Link href="/evolution" className="text-slate-400 hover:text-white">Evolution</Link>
            <Link href="/subject-analysis" className="text-slate-400 hover:text-white">Subjects</Link>
            <Link href="/analysis" className="text-slate-400 hover:text-white">Analysis</Link>
          </nav>
        </div>
      </header>

      {/* Main Container */}
      <div className="max-w-6xl mx-auto px-4 mt-8 grid grid-cols-1 md:grid-cols-3 gap-8">
        
        {/* Left column - User details */}
        <div className="space-y-6 md:col-span-1">
          {/* Stats Card */}
          <div className="glass-panel p-6 flex flex-col items-center text-center relative overflow-hidden">
            <div className="absolute top-4 right-4 flex items-center text-orange-400 font-bold bg-orange-400/10 px-3 py-1 rounded-full text-xs">
              <Flame className="w-4 h-4 mr-1 fill-orange-400" /> {profile.currentStreak} Day Streak
            </div>
            
            <div className="w-20 h-20 rounded-full border-2 border-[#8B5CF6] flex items-center justify-center text-3xl font-extrabold text-white bg-slate-900 shadow-md shadow-[#8B5CF6]/20 mb-4 mt-4">
              {profile.auraRank}
            </div>
            
            <h2 className="text-lg font-bold text-white mb-0.5">{profile.name}</h2>
            <p className="text-xs text-slate-400 mb-6">{profile.title}</p>

            {/* Level & XP */}
            <div className="w-full space-y-2 text-left mb-4">
              <div className="flex justify-between text-xs font-semibold text-slate-300">
                <span>Level {profile.currentLevel}</span>
                <span>{xpPercent}% ({profile.currentXP} XP)</span>
              </div>
              <div className="w-full h-2.5 bg-slate-800 rounded-full overflow-hidden">
                <div className="h-full bg-gradient-to-r from-[#8B5CF6] to-[#60A5FA] transition-all duration-300" style={{ width: `${xpPercent}%` }} />
              </div>
            </div>
          </div>

          {/* Quick Actions / Focus */}
          <div className="glass-panel p-6 space-y-4">
            <h3 className="font-bold text-white text-sm">Quick Session</h3>
            <button
              onClick={() => router.push('/focus')}
              className="w-full py-4 rounded-xl bg-slate-900 border border-slate-800 hover:border-[#8B5CF6] text-slate-300 hover:text-white transition flex items-center justify-center font-bold"
            >
              <Timer className="w-5 h-5 mr-2 text-[#8B5CF6]" /> Start Focus Mode
            </button>
          </div>

          {/* Daily Insight */}
          <div className="glass-panel p-6 space-y-2 border-l-4 border-l-[#8B5CF6]">
            <div className="text-xs font-bold text-[#8B5CF6] uppercase tracking-wider flex items-center">
              <AlertCircle className="w-4 h-4 mr-1.5" /> Daily Insight
            </div>
            <p className="text-slate-400 text-xs leading-relaxed">{insight}</p>
          </div>
        </div>

        {/* Right column - Quests */}
        <div className="md:col-span-2 space-y-6">
          <div className="glass-panel p-8">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold text-white">Today's Quests</h2>
              <span className="text-xs text-slate-400 font-semibold">4 Path challenges</span>
            </div>

            <div className="space-y-4">
              {quests.map((uq) => (
                <div 
                  key={uq.id}
                  className={`p-5 rounded-xl border border-slate-800/80 bg-slate-900/40 flex justify-between items-start transition hover:border-slate-700 ${
                    uq.completed ? 'opacity-50' : ''
                  }`}
                >
                  <div className="space-y-1 pr-4">
                    <div className="flex items-center space-x-2">
                      {getPathIcon(uq.quest.path)}
                      <span className={`text-xs font-semibold ${getPathColor(uq.quest.path)}`}>
                        {uq.quest.path} • {uq.quest.difficulty}
                      </span>
                    </div>
                    <h4 className="text-white font-bold text-sm md:text-base">{uq.quest.title}</h4>
                    <p className="text-slate-400 text-xs leading-relaxed">{uq.quest.description}</p>
                  </div>

                  <div className="flex flex-col items-end justify-between h-full min-h-[64px]">
                    <span className="text-xs font-bold text-slate-300">+{uq.quest.xpReward} XP</span>
                    {uq.completed ? (
                      <span className="px-3 py-1 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-[#22C55E] text-xs font-bold">
                        Completed
                      </span>
                    ) : (
                      <button
                        onClick={() => handleCompleteQuest(uq.id)}
                        className="px-4 py-1.5 rounded-lg bg-[#8B5CF6] hover:bg-[#7c4fe3] text-white text-xs font-bold shadow-md shadow-[#8B5CF6]/20 transition"
                      >
                        Claim XP
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Level Up / Completion Alert Notification Modal */}
      <AnimatePresence>
        {completeMsg && (
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 50 }}
            className="fixed bottom-6 right-6 z-50 glass-panel p-6 border-l-4 border-l-[#22C55E] max-w-sm"
          >
            <h4 className="text-white font-extrabold text-lg">{completeMsg.title}</h4>
            <p className="text-slate-400 text-xs mt-1">You gained +{completeMsg.xp} XP from this action.</p>
            {completeMsg.leveledUp && (
              <div className="mt-3 p-2 bg-[#8B5CF6]/15 border border-[#8B5CF6]/30 rounded-lg text-center font-bold text-[#8B5CF6] text-xs animate-bounce">
                🎉 LEVELED UP TO LEVEL {completeMsg.level}!
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
