"use client";
import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { apiRequest } from '../../lib/api';
import AwakeningTour from '../../components/AwakeningTour';
import FocusTimer from '../../components/FocusTimer';
import { Zap, ShieldCheck, Compass, Heart, Flame, Timer, Award, AlertCircle, Shield, Gift, Plus } from 'lucide-react';

export default function DashboardPage() {
  const router = useRouter();
  const handleSignOut = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    router.push('/');
  };
  const [user, setUser] = useState<any>(null);
  const [profile, setProfile] = useState<any>(null);
  const [quests, setQuests] = useState<any[]>([]);
  const [projects, setProjects] = useState<any[]>([]);
  const [activeBoss, setActiveBoss] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [showTour, setShowTour] = useState(false);
  const [showDistracted, setShowDistracted] = useState(false);
  const [breathCount, setBreathCount] = useState(60);
  const [breathActive, setBreathActive] = useState(false);
  const [newProjTitle, setNewProjTitle] = useState('');
  const [reflectionInput, setReflectionInput] = useState('');
  const [selectedQuestForVerify, setSelectedQuestForVerify] = useState<any>(null);

  // Load Dashboard Data
  async function loadData() {
    try {
      const u = await apiRequest('/auth/profile');
      setUser(u);
      setProfile(u.profile);
      
      const q = await apiRequest('/quests/daily');
      setQuests(q);

      const p = await apiRequest('/projects');
      setProjects(p);

      const b = await apiRequest('/bosses/active');
      setActiveBoss(b);

      if (u.profile && u.profile.auraScore === 0) {
        setShowTour(true);
      }
    } catch (e) {
      router.push('/login');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadData();
  }, []);

  // Emergency Breathing Timer
  useEffect(() => {
    let t: any = null;
    if (breathActive && breathCount > 0) {
      t = setInterval(() => setBreathCount(c => c - 1), 1000);
    } else if (breathCount === 0) {
      setBreathActive(false);
      alert("Deep breaths completed. Your mind is stabilized. Go back to study!");
      setShowDistracted(false);
      setBreathCount(60);
    }
    return () => clearInterval(t);
  }, [breathActive, breathCount]);

  const handleClaimReward = async () => {
    try {
      const res = await apiRequest('/quests/daily-reward/claim', { method: 'POST' });
      alert(`🎉 Reward claimed! +${res.xpGained} XP.`);
      loadData();
    } catch (e: any) {
      alert(e.message || "Already claimed today");
    }
  };

  const handleCreateProject = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newProjTitle) return;
    try {
      await apiRequest('/projects', {
        method: 'POST',
        body: JSON.stringify({ title: newProjTitle })
      });
      setNewProjTitle('');
      loadData();
    } catch (e) {
      alert("Failed to create project");
    }
  };

  const handleVerify = async (uqId: string) => {
    try {
      const res = await apiRequest('/quests/verify', {
        method: 'POST',
        body: JSON.stringify({ userQuestId: uqId, inputData: reflectionInput })
      });
      alert(`🎉 Verified! Gained +${res.xpGained} XP.`);
      setSelectedQuestForVerify(null);
      setReflectionInput('');
      loadData();
    } catch (e: any) {
      alert(e.message || "Failed to verify quest");
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center text-white bg-[#0F172A]">
        <div className="text-center space-y-4">
          <div className="w-12 h-12 rounded-full border-4 border-[#8B5CF6] border-t-transparent animate-spin mx-auto" />
          <p className="text-slate-400">Synchronizing Matrix parameters...</p>
        </div>
      </div>
    );
  }

  const xpRequired = 100 * Math.pow(profile.currentLevel, 1.5);
  const xpPercent = Math.round((profile.currentXP / xpRequired) * 100);

  return (
    <div className="min-h-screen bg-[#0F172A] pb-12 text-slate-300">
      {showTour && <AwakeningTour bottleneck={profile.auraRank} onComplete={() => setShowTour(false)} />}

      {/* Nav Header */}
      <header className="border-b border-slate-800 bg-slate-900/60 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-4 py-4 flex justify-between items-center">
          <div className="text-xl font-extrabold text-[#8B5CF6]">EVOLVE<span className="text-white">AURA</span></div>
          <nav className="flex space-x-6 text-sm font-medium items-center">
            <Link href="/dashboard" className="text-white">Dashboard</Link>
            <Link href="/focus" className="text-slate-400 hover:text-white">Focus</Link>
            <Link href="/subject-analysis" className="text-slate-400 hover:text-white">Subjects</Link>
            <Link href="/about" className="text-slate-400 hover:text-white">About</Link>
            <Link href="/faq" className="text-slate-400 hover:text-white">FAQ</Link>
            <button onClick={handleSignOut} className="text-red-400 hover:text-red-300 font-bold transition cursor-pointer">Sign Out</button>
          </nav>
        </div>
      </header>

      {/* Emergency Button */}
      <div className="max-w-6xl mx-auto px-4 mt-6 text-right">
        <button 
          onClick={() => { setShowDistracted(true); setBreathActive(true); }}
          className="px-6 py-2.5 rounded-xl bg-red-600 hover:bg-red-700 text-white font-bold text-xs uppercase tracking-wider shadow-lg shadow-red-600/20"
        >
          🚨 I'm Distracted!
        </button>
      </div>

      <div className="max-w-6xl mx-auto px-4 mt-6 grid grid-cols-1 md:grid-cols-3 gap-8">
        
        {/* Left Column */}
        <div className="space-y-6">
          
          {/* Profile Card */}
          <div className="glass-panel p-6 relative overflow-hidden flex flex-col items-center text-center">
            <div className="absolute top-4 right-4 flex items-center text-orange-400 font-bold bg-orange-400/10 px-2 py-0.5 rounded-full text-[10px]">
              <Flame className="w-3.5 h-3.5 mr-1 fill-orange-400" /> {profile.currentStreak} Days
            </div>

            <div className="w-16 h-16 rounded-full border border-[#8B5CF6] flex items-center justify-center text-2xl font-extrabold text-white bg-slate-900 mt-4 mb-2">
              {profile.auraRank}
            </div>
            <h3 className="font-extrabold text-white text-base">{profile.name}</h3>
            <p className="text-[10px] text-slate-400 uppercase tracking-widest">{profile.equippedTitle}</p>

            <div className="w-full mt-6 space-y-1.5 text-left text-xs font-semibold">
              <div className="flex justify-between text-slate-300">
                <span>Lvl {profile.currentLevel}</span>
                <span>{xpPercent}%</span>
              </div>
              <div className="w-full h-2 bg-slate-800 rounded-full overflow-hidden">
                <div className="h-full bg-gradient-to-r from-[#8B5CF6] to-[#60A5FA]" style={{ width: `${xpPercent}%` }} />
              </div>
            </div>

            <div className="flex justify-center w-full mt-4 text-xs pt-4 border-t border-slate-800/80">
              <span className="text-slate-400">Shields: <strong className="text-[#8B5CF6]">{profile.auraShields}</strong></span>
            </div>
          </div>

          {/* Aura Companion Widget */}
          <div className="glass-panel p-6 border-l-4 border-l-[#8B5CF6] space-y-3 bg-gradient-to-r from-slate-950/20 to-slate-900/40">
            <div className="text-[10px] font-bold text-[#8B5CF6] uppercase tracking-widest flex items-center">
              <Compass className="w-4 h-4 mr-1.5" /> Aura Companion
            </div>
            <p className="text-xs text-white leading-relaxed font-medium">
              "Good Morning Evolver. You completed {quests.filter(q => q.completed).length} quests today. Keep focus high to conquer the {activeBoss?.boss?.name || 'Sleep Reaper'}."
            </p>
          </div>

          {/* Daily Reward Chest */}
          <div className="glass-panel p-6 space-y-4">
            <h4 className="font-bold text-white text-xs uppercase tracking-wider flex items-center"><Gift className="w-4 h-4 mr-1.5 text-amber-400" /> Daily Chest Tracker</h4>
            <div className="grid grid-cols-7 gap-1">
              {[1, 2, 3, 4, 5, 6, 7].map((d) => {
                const isClaimed = profile.currentStreak >= d;
                return (
                  <div key={d} className={`aspect-square rounded-lg flex flex-col items-center justify-center border text-[10px] font-bold ${
                    isClaimed ? 'bg-[#22C55E]/15 border-[#22C55E]/40 text-[#22C55E]' : 'bg-slate-900 border-slate-800 text-slate-500'
                  }`}>
                    D{d}
                  </div>
                );
              })}
            </div>
            <button onClick={handleClaimReward} className="w-full py-2 rounded-xl bg-gradient-to-r from-[#8B5CF6] to-[#60A5FA] text-white text-xs font-bold transition">
              Claim Daily XP
            </button>
          </div>
        </div>

        {/* Right Column - Quests & Projects */}
        <div className="md:col-span-2 space-y-6">
          
          {/* Active Quests */}
          <div className="glass-panel p-8">
            <h2 className="text-xl font-bold text-white mb-6">Quest Matrix (7 Daily Tasks)</h2>
            <div className="space-y-4">
              {quests.map((uq) => (
                <div key={uq.id} className="p-4 rounded-xl border border-slate-800 bg-slate-900/30 flex justify-between items-center">
                  <div>
                    <span className="text-[10px] font-bold text-[#8B5CF6] uppercase tracking-widest">{uq.quest.path} • {uq.quest.difficulty}</span>
                    <h4 className="text-white font-bold text-sm mt-0.5">{uq.quest.title}</h4>
                    <p className="text-slate-400 text-xs mt-1">{uq.quest.description}</p>
                  </div>

                  <div>
                    {uq.completed ? (
                      <span className="text-xs font-bold text-emerald-400 bg-emerald-500/10 px-3 py-1 rounded-lg border border-emerald-500/20">Completed</span>
                    ) : (
                      <button 
                        onClick={() => setSelectedQuestForVerify(uq)}
                        className="px-4 py-1.5 rounded-lg bg-[#8B5CF6] hover:bg-[#7c4fe3] text-white text-xs font-bold transition shadow-md shadow-[#8B5CF6]/20"
                      >
                        Verify
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Personal Projects Widget */}
          <div className="glass-panel p-8">
            <h2 className="text-xl font-bold text-white mb-6">Personal Projects System</h2>
            
            <form onSubmit={handleCreateProject} className="flex space-x-2 mb-6">
              <input
                type="text"
                required
                value={newProjTitle}
                onChange={(e) => setNewProjTitle(e.target.value)}
                className="flex-1 px-4 py-2.5 rounded-xl bg-slate-900 border border-slate-800 text-white focus:outline-none focus:border-[#8B5CF6] text-xs"
                placeholder="e.g. Learn Python, Lose Weight"
              />
              <button type="submit" className="px-4 rounded-xl bg-[#8B5CF6] hover:bg-[#7c4fe3] text-white font-bold flex items-center justify-center">
                <Plus className="w-4 h-4" />
              </button>
            </form>

            <div className="space-y-4">
              {projects.length === 0 ? (
                <p className="text-slate-500 text-xs italic">No personal projects registered. Link quests to your actual life goals above.</p>
              ) : (
                projects.map((p) => (
                  <div key={p.id} className="p-4 bg-slate-900/20 border border-slate-800 rounded-xl space-y-2">
                    <div className="flex justify-between text-xs font-bold">
                      <span className="text-white">{p.title}</span>
                      <span className="text-slate-400">{p.progress}% Completed</span>
                    </div>
                    <div className="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden">
                      <div className="h-full bg-emerald-500" style={{ width: `${p.progress}%` }} />
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Emergency Distraction Modal */}
      {showDistracted && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-md">
          <div className="w-full max-w-sm p-8 glass-panel text-center space-y-6">
            <h3 className="text-xl font-bold text-red-500">Stabilize Cravings</h3>
            <p className="text-slate-400 text-xs leading-relaxed">
              We detected cognitive drift. Take deep, slow breaths. Focus entirely on the expand/contract loop.
            </p>
            <div className="text-5xl font-extrabold text-white tabular-nums">{breathCount}s</div>
            <button onClick={() => setShowDistracted(false)} className="px-6 py-2 rounded-xl bg-slate-900 border border-slate-800 text-slate-400 text-xs font-bold">
              Cancel Stabilizer
            </button>
          </div>
        </div>
      )}

      {/* Quest Verify Modal */}
      {selectedQuestForVerify && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-md">
          <div className="w-full max-w-md p-8 glass-panel space-y-6">
            <h3 className="text-lg font-bold text-white">Verify Quest: {selectedQuestForVerify.quest.title}</h3>
            
            {selectedQuestForVerify.quest.verificationType === 'REFLECTION' ? (
              <div className="space-y-4">
                <label className="text-slate-400 text-xs">Write down your daily reflection (min 50 chars):</label>
                <textarea
                  value={reflectionInput}
                  onChange={(e) => setReflectionInput(e.target.value)}
                  className="w-full h-32 px-4 py-3 rounded-xl bg-slate-900 border border-slate-800 text-white focus:outline-none focus:border-[#8B5CF6] text-xs font-normal"
                  placeholder="Today I learned how focus barriers occur when I multitasking..."
                />
                <span className="text-[10px] text-slate-500 block">Characters: {reflectionInput.length} / 50</span>
              </div>
            ) : (
              <p className="text-slate-400 text-xs">This quest requires action check confirmation. Ensure you completed the tasks before logging.</p>
            )}

            <div className="flex space-x-4 pt-4">
              <button onClick={() => setSelectedQuestForVerify(null)} className="w-1/2 py-2 rounded-xl bg-slate-900 border border-slate-800 text-slate-400 text-xs font-bold">
                Cancel
              </button>
              <button onClick={() => handleVerify(selectedQuestForVerify.id)} className="w-1/2 py-2 rounded-xl bg-[#8B5CF6] hover:bg-[#7c4fe3] text-white text-xs font-bold">
                Submit Verification
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
