// Premium Interactive Character Status Menu & Workspace
"use client";
import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { apiRequest } from '../../lib/api';
import AwakeningTour from '../../components/AwakeningTour';
import ChatBot from '../../components/ChatBot';
import BossArena from '../../components/BossArena';
import SystemAlerts, { triggerSystemAlert } from '../../components/SystemAlerts';
import { audioEngine } from '../../lib/AudioEngine';
import { 
  Zap, 
  Flame, 
  Shield, 
  Gift, 
  Plus, 
  Volume2, 
  VolumeX, 
  AlertTriangle, 
  Swords, 
  Sparkles, 
  LogOut, 
  Lock, 
  Unlock, 
  BookOpen, 
  TrendingUp, 
  Eye, 
  Activity, 
  Heart, 
  Star 
} from 'lucide-react';

export default function DashboardPage() {
  const router = useRouter();
  
  // Dashboard & State variables
  const [user, setUser] = useState<any>(null);
  const [profile, setProfile] = useState<any>(null);
  const [quests, setQuests] = useState<any[]>([]);
  const [projects, setProjects] = useState<any[]>([]);
  const [activeBoss, setActiveBoss] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  
  // Modals & UI States
  const [showTour, setShowTour] = useState(false);
  const [showDistracted, setShowDistracted] = useState(false);
  const [breathCount, setBreathCount] = useState(60);
  const [breathActive, setBreathActive] = useState(false);
  const [newProjTitle, setNewProjTitle] = useState('');
  const [reflectionInput, setReflectionInput] = useState('');
  const [selectedQuestForVerify, setSelectedQuestForVerify] = useState<any>(null);
  
  // V2 Specific States
  const [activeArenaBoss, setActiveArenaBoss] = useState<any>(null); // when weekly boss fight is active
  const [activeTrialMode, setActiveTrialMode] = useState<boolean>(false); // when rank ascension trial is active
  const [isBgmPlaying, setIsBgmPlaying] = useState<boolean>(false);

  // Secure Sign Out Protocol
  const handleSignOut = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    audioEngine.stopBattleMusic();
    router.push('/');
  };

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

      const completedTour = localStorage.getItem('hasCompletedTour');
      if (!completedTour) {
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

  // Weekend Enraged Checks
  const todayDay = new Date().getDay();
  const isWeekend = todayDay === 6 || todayDay === 0; // Saturday=6, Sunday=0
  const isWeekendEnraged = isWeekend && activeBoss && activeBoss.selectedTier > 0 && !activeBoss.questCompleted;

  // Manage weekend enraged background BGM
  useEffect(() => {
    if (isWeekendEnraged && isBgmPlaying) {
      audioEngine.startBattleMusic();
    } else {
      audioEngine.stopBattleMusic();
    }
    return () => {
      audioEngine.stopBattleMusic();
    };
  }, [isWeekendEnraged, isBgmPlaying]);

  // Stats Allocation API Handler
  const handleAllocateStat = async (statName: string) => {
    try {
      const res = await apiRequest('/auth/profile/allocate-stat', {
        method: 'POST',
        body: JSON.stringify({ statName })
      });
      setProfile(res.profile);
      
      // Level Up or general status upgrade sound
      audioEngine.playTypewriter();

      triggerSystemAlert({
        type: 'QUEST_CLEAR',
        title: 'PARAM CALIBRATED',
        message: `Allocated 1 point to ${statName}.`,
        subtext: `Current ${statName}: ${res.profile['stat' + statName]} | Points Remaining: ${res.profile.unallocatedPoints}`
      });
    } catch (e: any) {
      alert(e.message || "Failed to allocate point");
    }
  };

  // Weekly Boss Tier Selection API Handler
  const handleSelectBossTier = async (tier: number) => {
    try {
      const res = await apiRequest('/bosses/select-tier', {
        method: 'POST',
        body: JSON.stringify({ tier })
      });
      setActiveBoss(res);
      
      triggerSystemAlert({
        type: 'BOSS_ENCOUNTER',
        title: `CHALLENGE TIED: TIER ${tier}`,
        message: `The weekly focus parameters have locked in. Clear the quest on any day of the week.`,
        subtext: `Ready for activation inside your Gate of Trials.`
      });
    } catch (e: any) {
      alert(e.message || "Failed to select boss tier");
    }
  };

  const handleClaimReward = async () => {
    try {
      const res = await apiRequest('/quests/daily-reward/claim', { method: 'POST' });
      triggerSystemAlert({
        type: 'QUEST_CLEAR',
        title: 'DAILY CHEST UNLOCKED',
        message: `Streak Reward claimed!`,
        subtext: `+${res.xpGained} XP deposited to matrix.`
      });
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
      
      triggerSystemAlert({
        type: 'QUEST_CLEAR',
        title: 'DAILY MATRIX VERIFIED',
        message: `Quest successfully completed.`,
        subtext: `+${res.xpGained} XP | +25 Gold Depositing...`
      });

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

  // XP Progress Calculation
  const xpRequired = Math.round(100 * Math.pow(profile.currentLevel, 1.5));
  const xpPercent = Math.min(100, Math.round((profile.currentXP / xpRequired) * 100));

  // Balanced Growth Checking
  const stats = [profile.statINT, profile.statSTR, profile.statVIT, profile.statWIS, profile.statAGI];
  const maxStat = Math.max(...stats);
  const minStat = Math.min(...stats);
  const isBalanced = (maxStat - minStat) <= 3;

  // Rank Ascension Locks (10, 20, 30 level thresholds)
  const isRankTrialLocked = 
    (profile.currentLevel === 10 && profile.auraRank === 'E') ||
    (profile.currentLevel === 20 && ['E', 'D'].includes(profile.auraRank)) ||
    (profile.currentLevel === 30 && ['E', 'D', 'C'].includes(profile.auraRank));

  // Ambient aura glows tailored to Rank
  const getRankGlowClass = (rank: string) => {
    if (rank === 'S') return 'border-amber-500/35 shadow-[0_0_30px_rgba(245,158,11,0.15)] bg-gradient-to-b from-slate-900/60 to-amber-950/10';
    if (['A', 'B'].includes(rank)) return 'border-cyan-500/30 shadow-[0_0_25px_rgba(6,182,212,0.12)] bg-gradient-to-b from-slate-900/60 to-cyan-950/10';
    if (['C', 'D'].includes(rank)) return 'border-fuchsia-500/25 shadow-[0_0_20px_rgba(217,70,239,0.1)] bg-gradient-to-b from-slate-900/60 to-fuchsia-950/10';
    return 'border-slate-800 bg-slate-900/40';
  };

  const getRankBadgeClass = (rank: string) => {
    if (rank === 'S') return 'text-amber-400 bg-amber-500/10 border-amber-500/30';
    if (['A', 'B'].includes(rank)) return 'text-cyan-400 bg-cyan-500/10 border-cyan-500/30';
    if (['C', 'D'].includes(rank)) return 'text-fuchsia-400 bg-fuchsia-500/10 border-fuchsia-500/30';
    return 'text-slate-400 bg-slate-500/10 border-slate-700';
  };

  // Render Rank Up Trial Breakthrough Lockdown Screen
  if (isRankTrialLocked && !activeTrialMode) {
    return (
      <div className="min-h-screen bg-[#060A13] text-slate-300 flex flex-col justify-between pb-12 relative overflow-hidden">
        {/* Cinematic Backdrop Glow */}
        <div className="absolute top-[-20%] left-[-25%] w-[80%] h-[80%] rounded-full bg-red-600/10 blur-[180px] pointer-events-none animate-pulse" />
        <div className="absolute bottom-[-20%] right-[-25%] w-[80%] h-[80%] rounded-full bg-[#8B5CF6]/10 blur-[180px] pointer-events-none" />

        {/* System Alert Overlay component */}
        <SystemAlerts />

        {/* Minimal Header */}
        <header className="border-b border-slate-900 bg-slate-950/70 backdrop-blur-md px-6 py-4 flex justify-between items-center relative z-20">
          <div className="text-xl font-extrabold text-red-500 tracking-wider">SYSTEM LOCKDOWN</div>
          <button onClick={handleSignOut} className="text-xs font-bold text-red-400 border border-red-500/20 px-4 py-2 rounded-xl hover:bg-red-500/10 transition cursor-pointer">
            Sign Out Profile
          </button>
        </header>

        {/* Core Challenge View */}
        <main className="max-w-4xl mx-auto px-6 mt-12 grid grid-cols-1 md:grid-cols-2 gap-8 relative z-10 flex-1 items-center">
          
          {/* Left Column: Interactive Stats balancing */}
          <div className="glass-panel p-6 border-red-950/40 space-y-6">
            <div className="text-center space-y-2">
              <h3 className="text-sm font-bold text-red-400 uppercase tracking-widest font-mono">Calibrate Character Nodes</h3>
              <p className="text-slate-400 text-xs">Ensure your attributes are balanced to start the ascension test.</p>
            </div>

            <div className="p-4 bg-slate-950/50 rounded-xl space-y-4">
              <div className="flex justify-between items-center text-xs">
                <span className="font-mono text-slate-400">Unallocated Points:</span>
                <span className="font-bold text-amber-400 font-mono bg-amber-400/10 px-2 py-0.5 rounded-full">{profile.unallocatedPoints} Avail</span>
              </div>

              {/* Stats Allocator list */}
              <div className="space-y-3">
                {[
                  { key: 'INT', name: 'INT (Intelligence)', desc: 'Lowers Academic Quest Difficulty', val: profile.statINT },
                  { key: 'STR', name: 'STR (Strength)', desc: 'Shortens Smartphone Telemetry Thresholds', val: profile.statSTR },
                  { key: 'VIT', name: 'VIT (Vitality)', desc: 'Increases Focus Shield HP Pool', val: profile.statVIT },
                  { key: 'WIS', name: 'WIS (Wisdom)', desc: 'Multiplies Reflection Gold drop rate', val: profile.statWIS },
                  { key: 'AGI', name: 'AGI (Agility)', desc: 'Increases Personal Project Multipliers', val: profile.statAGI }
                ].map((s) => (
                  <div key={s.key} className="flex items-center justify-between p-2.5 rounded-lg border border-slate-800 bg-slate-900/20 text-xs">
                    <div>
                      <div className="font-bold text-white font-mono">{s.name}</div>
                      <div className="text-[10px] text-slate-500 font-medium">{s.desc}</div>
                    </div>
                    <div className="flex items-center space-x-3">
                      <span className="font-extrabold text-[#8B5CF6] font-mono text-sm">[{s.val}]</span>
                      <button
                        onClick={() => handleAllocateStat(s.key)}
                        disabled={profile.unallocatedPoints <= 0}
                        className={`w-6 h-6 rounded-md flex items-center justify-center font-bold text-xs transition cursor-pointer ${
                          profile.unallocatedPoints > 0
                            ? 'bg-[#8B5CF6] hover:bg-[#7c4fe3] text-white'
                            : 'bg-slate-900 border border-slate-800 text-slate-600 cursor-not-allowed'
                        }`}
                      >
                        +
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Growth Wall Warning */}
            <div className={`p-4 rounded-xl border text-xs font-mono tracking-wide ${
              isBalanced 
                ? 'bg-emerald-950/20 border-emerald-500/20 text-emerald-400' 
                : 'bg-red-950/20 border-red-500/20 text-red-400'
            }`}>
              <div className="flex items-start space-x-2">
                <span className="text-base">{isBalanced ? '🔓' : '🔒'}</span>
                <div>
                  <div className="font-bold uppercase">{isBalanced ? 'Balanced Growth Achieved' : 'Ascension Lock Active'}</div>
                  <p className="text-[10px] leading-relaxed mt-1 text-slate-400">
                    Highest Stat: {maxStat} | Lowest Stat: {minStat} (Diff: {maxStat - minStat})
                    {!isBalanced && "\nYour lowest stat cannot be more than 3 levels behind your highest stat."}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column: Breakthrough challenge trigger */}
          <div className="glass-panel p-8 border-red-950/40 text-center space-y-6 flex flex-col justify-center">
            <div className="w-16 h-16 rounded-full border-2 border-red-500/30 bg-red-950/20 flex items-center justify-center text-red-400 mx-auto animate-pulse">
              <Lock className="w-8 h-8" />
            </div>

            <div className="space-y-2">
              <h2 className="text-2xl font-black text-white tracking-widest uppercase font-mono">
                RANK breakthrough TRIAL
              </h2>
              <p className="text-slate-400 text-xs leading-relaxed max-w-xs mx-auto">
                Evolver #{profile.name}, you have reached the maximum level cap for your current tier (<strong className="text-red-400">Level {profile.currentLevel}</strong>). Complete the trial to unlock Rank ascension.
              </p>
            </div>

            <div className="p-4 bg-slate-950/60 border border-slate-900 rounded-xl text-left space-y-3 font-mono text-[11px] leading-relaxed">
              <div className="text-red-400 font-bold uppercase tracking-wider">⚠️ Trial Parameters:</div>
              <ul className="list-disc pl-4 space-y-1 text-slate-400">
                <li>Strict consecutive focus duration: <strong className="text-white">90 Minutes</strong></li>
                <li>Focus Shield Capacity: <strong className="text-red-400 font-bold">1 Life (Zero Tolerances)</strong></li>
                <li>Tab switches, minimization, or loss of focus immediately aborts the block.</li>
              </ul>
            </div>

            <button
              onClick={() => setActiveTrialMode(true)}
              disabled={!isBalanced}
              className={`w-full py-3 rounded-xl font-bold uppercase tracking-widest text-xs transition-all duration-300 cursor-pointer shadow-lg ${
                isBalanced
                  ? 'bg-gradient-to-r from-red-600 to-[#8B5CF6] hover:from-red-700 hover:to-[#7c4fe3] text-white shadow-red-900/20'
                  : 'bg-slate-900 border border-slate-800 text-slate-500 cursor-not-allowed'
              }`}
            >
              Begin Rank Breakthrough
            </button>
          </div>
        </main>
        
        <footer className="text-center text-[10px] text-slate-600 font-mono mt-12 relative z-10">
          EvolveAura V2.0 System Lockdown Module • Calibrating User Cohorts
        </footer>
      </div>
    );
  }

  // Active Trial Arena Trigger overlay
  if (activeTrialMode) {
    return (
      <BossArena
        isTrial={true}
        bossProgress={null}
        profile={profile}
        onVictory={() => {
          setActiveTrialMode(false);
          loadData();
        }}
        onDefeat={() => {
          setActiveTrialMode(false);
          triggerSystemAlert({
            type: 'BREACH',
            title: 'TRIAL FAILED',
            message: 'You fainted during the Rank Up Trial focus block. Calibrate parameters and retry.',
            subtext: 'Focus Shield HP hit 0.'
          });
        }}
        onClose={() => setActiveTrialMode(false)}
      />
    );
  }

  // Render Weekly Boss Battle overlay if selected
  if (activeArenaBoss) {
    return (
      <BossArena
        bossProgress={activeArenaBoss}
        profile={profile}
        onVictory={() => {
          setActiveArenaBoss(null);
          loadData();
        }}
        onDefeat={() => {
          setActiveArenaBoss(null);
          loadData();
        }}
        onClose={() => {
          setActiveArenaBoss(null);
          loadData();
        }}
      />
    );
  }

  return (
    <div className={`min-h-screen pb-12 transition-colors duration-700 text-slate-300 relative ${
      isWeekendEnraged 
        ? 'bg-gradient-to-b from-[#180505] via-[#090202] to-[#040101] border-t-2 border-red-800/40' 
        : 'bg-[#0F172A]'
    }`}>
      {/* Cinematic Weekend Enraged Red Filters or Standard Blue/Purple Ambient Auras */}
      {isWeekendEnraged ? (
        <div className="absolute top-[-10%] left-[-10%] w-[60%] h-[60%] rounded-full bg-red-600/10 opacity-[0.08] blur-[150px] pointer-events-none animate-pulse" />
      ) : (
        <>
          <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] rounded-full bg-[#8B5CF6] opacity-[0.03] blur-[150px] pointer-events-none" />
          <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] rounded-full bg-[#60A5FA] opacity-[0.03] blur-[150px] pointer-events-none" />
        </>
      )}

      {/* RPG Center alerts overlay */}
      <SystemAlerts />

      {/* Onboarding / Interactive Tour */}
      {showTour && (
        <AwakeningTour 
          steps={DASHBOARD_TOUR_STEPS} 
          onComplete={() => { 
            setShowTour(false); 
            localStorage.setItem('hasCompletedTour', 'true'); 
          }} 
        />
      )}

      {/* Nav Header */}
      <header className="border-b border-slate-800/80 bg-slate-900/50 backdrop-blur-xl sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-4 py-4 flex justify-between items-center">
          <div className="text-xl font-extrabold text-[#8B5CF6] tracking-wide flex items-center">
            EVOLVE<span className="text-white">AURA</span>
            {isWeekendEnraged && (
              <span className="ml-2 text-[10px] font-black text-red-500 bg-red-500/10 border border-red-500/30 px-2 py-0.5 rounded-full animate-pulse">
                👹 ENRAGED PHASE
              </span>
            )}
          </div>
          
          <nav className="flex space-x-6 text-sm font-medium items-center">
            <Link href="/dashboard" className="text-white">Dashboard</Link>
            <Link id="focus-telemetry" href="/focus" className="text-slate-400 hover:text-white transition">Focus</Link>
            <Link id="subjects-grid" href="/subject-analysis" className="text-slate-400 hover:text-white transition">Subjects</Link>
            <button onClick={() => setShowTour(true)} className="text-slate-400 hover:text-white font-medium transition cursor-pointer">Tour</button>
            <button onClick={handleSignOut} className="text-red-400 hover:text-red-300 font-bold transition flex items-center cursor-pointer">
              <LogOut className="w-4 h-4 mr-1" /> Sign Out
            </button>
          </nav>
        </div>
      </header>

      {/* Top action row */}
      <div className="max-w-6xl mx-auto px-4 mt-6 flex justify-between items-center flex-wrap gap-4">
        {/* Weekend Cinematic music controller */}
        {isWeekendEnraged ? (
          <div className="glass-panel p-2.5 px-4 flex items-center space-x-3 border-red-500/20 shadow-[0_0_15px_rgba(239,68,68,0.1)]">
            <span className="text-[10px] font-black text-red-400 uppercase tracking-widest font-mono flex items-center">
              <Swords className="w-3.5 h-3.5 mr-1.5 animate-spin" /> Battle Synth Drums:
            </span>
            <button
              onClick={() => setIsBgmPlaying(!isBgmPlaying)}
              className="p-1 rounded bg-red-500/10 hover:bg-red-500/20 text-red-400 transition"
              title="Toggle cinematic high-tempo synth battle music"
            >
              {isBgmPlaying ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
            </button>
            <span className="text-[9px] text-slate-500 font-mono uppercase font-bold">145 BPM</span>
          </div>
        ) : (
          <div className="text-[10px] text-slate-500 font-mono uppercase tracking-widest flex items-center bg-slate-900/20 px-3 py-1 rounded-full border border-slate-800">
            <Sparkles className="w-3 h-3 text-[#8B5CF6] mr-1.5" /> Growth Calibrators Stable
          </div>
        )}

        {/* Emergency Button */}
        <button 
          id="distraction-stabilizer"
          onClick={() => { setShowDistracted(true); setBreathActive(true); }}
          className="px-6 py-2.5 rounded-xl bg-red-600 hover:bg-red-700 text-white font-bold text-xs uppercase tracking-wider shadow-lg shadow-red-600/20 transition cursor-pointer"
        >
          🚨 I'm Distracted!
        </button>
      </div>

      <div className="max-w-6xl mx-auto px-4 mt-6 grid grid-cols-1 md:grid-cols-3 gap-8">
        
        {/* Left Column: Core Status Menu */}
        <div className="space-y-6">
          
          {/* RPG Glassmorphic Profile Status Panel */}
          <div className={`glass-panel p-6 relative overflow-hidden flex flex-col items-center text-center transition-all duration-300 border ${getRankGlowClass(profile.auraRank)}`}>
            
            {/* Streak Counter Badge */}
            <div className="absolute top-4 right-4 flex items-center text-orange-400 font-bold bg-orange-400/10 px-2 py-0.5 rounded-full text-[10px] font-mono">
              <Flame className="w-3.5 h-3.5 mr-1 fill-orange-400" /> {profile.currentStreak} Days
            </div>

            {/* Core Rank Display */}
            <div id="rank-matrix" className={`w-16 h-16 rounded-full border flex items-center justify-center text-2xl font-black bg-slate-950 mt-4 mb-2 shadow-inner font-mono ${getRankBadgeClass(profile.auraRank)}`}>
              {profile.auraRank}
            </div>
            
            <h3 className="font-extrabold text-white text-base tracking-wide mt-1">{profile.name}</h3>
            <p className="text-[10px] text-slate-400 uppercase tracking-widest font-mono mt-0.5">{profile.equippedTitle}</p>

            {/* Level and XP progress */}
            <div id="xp-leveling" className="w-full mt-6 space-y-1.5 text-left text-xs font-semibold">
              <div className="flex justify-between text-slate-300 font-mono">
                <span>LEVEL {profile.currentLevel}</span>
                <span>{xpPercent}% ({profile.currentXP} / {xpRequired} XP)</span>
              </div>
              <div className="w-full h-2.5 bg-slate-950 rounded-full overflow-hidden border border-slate-900">
                <div 
                  className="h-full bg-gradient-to-r from-[#8B5CF6] to-[#60A5FA]" 
                  style={{ width: `${xpPercent}%` }} 
                />
              </div>
            </div>

            {/* Shields & Calibration portals */}
            <div className="flex justify-center w-full mt-4 text-xs pt-4 border-t border-slate-800/80 flex-col items-center space-y-2">
              <span id="shields-vault" className="text-slate-400 font-mono">
                Streak Shields: <strong className="text-[#8B5CF6]">{profile.auraShields}</strong>
              </span>
              <Link id="assessment-portal" href="/assessment" className="text-[10px] font-bold text-[#8B5CF6] hover:underline mt-1 block tracking-wider uppercase font-mono">
                Entrance Portal (Recalibrate)
              </Link>
            </div>
          </div>

          {/* Interactive Stats Upgrade Allocation Menu */}
          <div id="stats-menu" className="glass-panel p-6 space-y-4">
            <div className="flex justify-between items-center border-b border-slate-800 pb-3">
              <h4 className="font-bold text-white text-xs uppercase tracking-wider flex items-center font-mono">
                <TrendingUp className="w-4 h-4 mr-1.5 text-[#8B5CF6]" /> Attributes Calibration
              </h4>
              {profile.unallocatedPoints > 0 && (
                <span className="text-[10px] font-bold text-amber-400 bg-amber-400/10 px-2 py-0.5 rounded-full font-mono animate-pulse">
                  {profile.unallocatedPoints} SP Available
                </span>
              )}
            </div>

            <div className="space-y-3">
              {[
                { key: 'INT', name: 'INT (Intelligence)', desc: 'Lowers Academic Quest Difficulty', val: profile.statINT },
                { key: 'STR', name: 'STR (Strength)', desc: 'Shortens Smartphone Telemetry Thresholds', val: profile.statSTR },
                { key: 'VIT', name: 'VIT (Vitality)', desc: 'Increases Focus Shield HP Pool', val: profile.statVIT },
                { key: 'WIS', name: 'WIS (Wisdom)', desc: 'Multiplies Journal reflection gold', val: profile.statWIS },
                { key: 'AGI', name: 'AGI (Agility)', desc: 'Increases Personal Project Multipliers', val: profile.statAGI }
              ].map((s) => (
                <div key={s.key} className="flex items-center justify-between p-2.5 rounded-xl border border-slate-850 bg-slate-950/20 text-xs">
                  <div>
                    <div className="font-bold text-white font-mono flex items-center">
                      {s.name}
                      {s.key === 'VIT' && (
                        <span className="ml-1.5 text-[9px] text-slate-500 font-mono">
                          (Shields: {Math.min(5, Math.max(3, 3 + (profile.statVIT - 10)))} HP)
                        </span>
                      )}
                    </div>
                    <div className="text-[10px] text-slate-500">{s.desc}</div>
                  </div>
                  <div className="flex items-center space-x-2.5">
                    <span className="font-extrabold text-[#8B5CF6] font-mono text-sm">[{s.val}]</span>
                    {profile.unallocatedPoints > 0 && (
                      <button
                        onClick={() => handleAllocateStat(s.key)}
                        className="w-5 h-5 rounded bg-[#8B5CF6] hover:bg-[#7c4fe3] text-white flex items-center justify-center font-bold text-xs cursor-pointer transition"
                      >
                        +
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>

            {/* Growth Cap Notification */}
            <div className={`p-3 rounded-xl border text-[10px] font-mono leading-relaxed mt-2 ${
              isBalanced 
                ? 'bg-slate-950/20 border-slate-800/80 text-slate-500' 
                : 'bg-red-950/15 border-red-500/20 text-red-400 animate-pulse'
            }`}>
              {isBalanced ? (
                <span>⚖️ Stats balanced: Highest stat ({maxStat}) and Lowest stat ({minStat}) are within 3 levels. Ascension pathways unlocked.</span>
              ) : (
                <span>⚠️ Balanced Growth Cap Warning: Your lowest stat ({minStat}) is more than 3 levels behind your highest stat ({maxStat}). Upgrade your lowest attributes to unlock Rank breakthroughs.</span>
              )}
            </div>
          </div>

          {/* Daily Reward Chest */}
          <div id="chest-tracker" className="glass-panel p-6 space-y-4">
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
            <button onClick={handleClaimReward} className="w-full py-2 rounded-xl bg-gradient-to-r from-[#8B5CF6] to-[#60A5FA] text-white text-xs font-bold transition cursor-pointer">
              Claim Daily XP
            </button>
          </div>
        </div>

        {/* Right Column: Quests & Weekly Boss trials */}
        <div className="md:col-span-2 space-y-6">
          
          {/* Gate of Trials: Weekly Boss Quest Selection & Arena controller */}
          {activeBoss && (
            <div 
              id="boss-trials" 
              className={`glass-panel p-6 space-y-6 transition-all duration-300 border-l-4 ${
                isWeekendEnraged 
                  ? 'border-l-red-600 bg-gradient-to-r from-red-950/20 to-red-900/10 border-red-500/20 shadow-[0_0_20px_rgba(239,68,68,0.05)]' 
                  : 'border-l-[#8B5CF6] bg-gradient-to-r from-slate-950/10 to-[#8B5CF6]/5'
              }`}
            >
              <div className="flex justify-between items-start">
                <div>
                  <span className={`text-[10px] font-black uppercase tracking-widest font-mono ${isWeekendEnraged ? 'text-red-500 animate-pulse' : 'text-[#8B5CF6]'}`}>
                    Gate of Trials • Weekly Boss Quest
                  </span>
                  <h4 className="text-white font-extrabold text-base mt-0.5">
                    {activeBoss.boss.name}
                  </h4>
                </div>
                <span className="text-2xl">👹</span>
              </div>

              {/* TIER SELECTION MATRIX */}
              {activeBoss.selectedTier === 0 ? (
                <div className="space-y-4">
                  <p className="text-slate-400 text-xs italic">
                    Generate the Weekly Boss Quest based on your habits. Select one difficulty level below:
                  </p>
                  
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {/* Tier 1: Easy */}
                    <div className="p-4 bg-slate-950/40 border border-slate-900 rounded-2xl flex flex-col justify-between space-y-4">
                      <div>
                        <div className="text-[10px] font-bold text-emerald-400 uppercase font-mono">Tier 1: Easy Mode</div>
                        <h5 className="font-extrabold text-white text-xs mt-1">Minor Quantum</h5>
                        <p className="text-[10px] text-slate-500 mt-1 leading-relaxed">Focus Block: 30 Mins. 1x Base Damage. Yields base XP status payouts.</p>
                      </div>
                      <button
                        onClick={() => handleSelectBossTier(1)}
                        className="w-full py-1.5 rounded-lg border border-emerald-500/20 bg-emerald-500/5 hover:bg-emerald-500/15 text-emerald-400 text-[10px] font-bold uppercase transition cursor-pointer"
                      >
                        Select Tier 1
                      </button>
                    </div>

                    {/* Tier 2: Medium */}
                    <div className="p-4 bg-slate-950/40 border border-slate-900 rounded-2xl flex flex-col justify-between space-y-4">
                      <div>
                        <div className="text-[10px] font-bold text-amber-400 uppercase font-mono">Tier 2: Medium Mode</div>
                        <h5 className="font-extrabold text-white text-xs mt-1">Apex Titan</h5>
                        <p className="text-[10px] text-slate-500 mt-1 leading-relaxed">Focus Block: 60 Mins. 2x Base Damage. Recommended balance baseline.</p>
                      </div>
                      <button
                        onClick={() => handleSelectBossTier(2)}
                        className="w-full py-1.5 rounded-lg border border-amber-500/20 bg-amber-500/5 hover:bg-amber-500/15 text-amber-400 text-[10px] font-bold uppercase transition cursor-pointer"
                      >
                        Select Tier 2
                      </button>
                    </div>

                    {/* Tier 3: Hard */}
                    <div className="p-4 bg-slate-950/40 border border-slate-900 rounded-2xl flex flex-col justify-between space-y-4">
                      <div>
                        <div className="text-[10px] font-bold text-red-500 uppercase font-mono">Tier 3: Hard Mode</div>
                        <h5 className="font-extrabold text-white text-xs mt-1">Void Overlord</h5>
                        <p className="text-[10px] text-slate-500 mt-1 leading-relaxed">Focus Block: 120 Mins. 4x Base Damage. Deep work focus session.</p>
                      </div>
                      <button
                        onClick={() => handleSelectBossTier(3)}
                        className="w-full py-1.5 rounded-lg border border-red-500/20 bg-red-500/5 hover:bg-red-500/15 text-red-500 text-[10px] font-bold uppercase transition cursor-pointer"
                      >
                        Select Tier 3
                      </button>
                    </div>
                  </div>
                </div>
              ) : (
                // ACTIVE INVENTORY STATE
                <div className="space-y-4">
                  <div className="flex justify-between items-center text-xs font-semibold font-mono">
                    <span className="text-slate-400">Boss HP Pool</span>
                    <span className="text-red-500 font-bold">{activeBoss.currentHP} / {activeBoss.boss.maxHP}</span>
                  </div>
                  <div className="w-full h-2 bg-slate-950 rounded-full overflow-hidden border border-slate-900">
                    <div 
                      className="h-full bg-red-600 transition-all duration-500" 
                      style={{ width: `${Math.round((activeBoss.currentHP / activeBoss.boss.maxHP) * 100)}%` }} 
                    />
                  </div>

                  <div className="flex justify-between items-center p-3 rounded-xl bg-slate-950/50 border border-slate-900 text-xs">
                    <div>
                      <div className="font-bold text-white font-mono uppercase tracking-wider">
                        Tier {activeBoss.selectedTier}: {activeBoss.selectedTier === 1 ? 'Minor Quantum' : activeBoss.selectedTier === 2 ? 'Apex Titan' : 'Void Overlord'}
                      </div>
                      <div className="text-[10px] text-slate-500 font-mono mt-0.5">
                        {activeBoss.questCompleted 
                          ? '✅ QUEST COMPLETED FOR THIS WEEK' 
                          : '⚔️ ACTIVE IN INVENTORY (UNRESOLVED)'
                        }
                      </div>
                    </div>

                    {!activeBoss.questCompleted && (
                      <button
                        onClick={() => setActiveArenaBoss(activeBoss)}
                        className="px-4 py-2 rounded-xl bg-gradient-to-r from-red-600 to-[#8B5CF6] hover:from-red-700 hover:to-[#7c4fe3] text-white text-xs font-black uppercase tracking-wider transition shadow-lg shadow-red-900/10 cursor-pointer"
                      >
                        Enter Focus Arena
                      </button>
                    )}
                  </div>

                  {isWeekendEnraged && (
                    <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-xl text-[10px] text-red-400 font-bold animate-pulse text-center leading-relaxed">
                      ⚠️ Weekend Enraged Phase is active! The uncompleted quest has entered enraged mode. Gradients shifted, animations speed doubled, and battle synth is active in your audio context. Eliminate target now!
                    </div>
                  )}
                </div>
              )}
            </div>
          )}

          {/* Quest Matrix (7 Daily Tasks) */}
          <div id="gameplay-board" className="glass-panel p-6 md:p-8">
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
                        id="journal-qc"
                        onClick={() => setSelectedQuestForVerify(uq)}
                        className="px-4 py-1.5 rounded-lg bg-[#8B5CF6] hover:bg-[#7c4fe3] text-white text-xs font-bold transition shadow-md shadow-[#8B5CF6]/20 cursor-pointer"
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
          <div className="glass-panel p-6 md:p-8">
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
              <button type="submit" className="px-4 rounded-xl bg-[#8B5CF6] hover:bg-[#7c4fe3] text-white font-bold flex items-center justify-center cursor-pointer">
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
            <button onClick={() => setShowDistracted(false)} className="px-6 py-2 rounded-xl bg-slate-900 border border-slate-800 text-slate-400 text-xs font-bold cursor-pointer">
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
              <button onClick={() => setSelectedQuestForVerify(null)} className="w-1/2 py-2 rounded-xl bg-slate-900 border border-slate-800 text-slate-400 text-xs font-bold cursor-pointer">
                Cancel
              </button>
              <button onClick={() => handleVerify(selectedQuestForVerify.id)} className="w-1/2 py-2 rounded-xl bg-[#8B5CF6] hover:bg-[#7c4fe3] text-white text-xs font-bold cursor-pointer">
                Submit Verification
              </button>
            </div>
          </div>
        </div>
      )}
      
      {/* Floating Guided Helper Bot */}
      <ChatBot />
    </div>
  );
}

const DASHBOARD_TOUR_STEPS = [
  {
    targetId: null,
    title: "System Awakening",
    description: "Welcome, Evolver. Let's calibrate your stabilization matrix to target real-world growth.",
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
    targetId: "stats-menu",
    title: "Attributes Allocation Matrix",
    description: "Leveling up awards you 5 Stat Points. Manually distribute them here. Keep them balanced within 3 levels to prevent Rank Up lock!",
    badge: "Core Attributes"
  },
  {
    targetId: "assessment-portal",
    title: "Calibration Portal",
    description: "Access the assessment portal here at any time to retake the diagnostic and recalibrate your focus path bottleneck.",
    badge: "Recalibration Portal"
  },
  {
    targetId: "focus-telemetry",
    title: "Focus Mode Tab",
    description: "Jump to the Focus section to run Pomodoro study timers. Every completed session plants a tree in your Forest and damages weekly bosses.",
    badge: "Focus Module"
  },
  {
    targetId: "subjects-grid",
    title: "Subjects Analysis Tab",
    description: "Review and rate your subject understanding, retention, problem-solving, and confidence. Keep academic disciplines stable.",
    badge: "Subject Grid"
  },
  {
    targetId: "chest-tracker",
    title: "Daily Login Tracker",
    description: "Build your streak by signing in every day. Each consecutive day unlocks larger chests containing higher XP rewards.",
    badge: "Daily Tracker"
  },
  {
    targetId: "boss-trials",
    title: "Gate of Trials (Weekly Boss)",
    description: "Every Monday, choose from 3 Weekly Boss tiers. Launch the Focus Arena before Sunday. Uncompleted weekend bosses enter Enraged Phase with high tempo synth tracks!",
    badge: "Gate of Trials"
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
    targetId: "aura-chatbot",
    title: "Aura Assistant Bot",
    description: "Got doubts about EvolveAura's mechanics, leveling, or quests? Click this bubble to chat with the built-in guide at any time!",
    badge: "Platform Helper"
  },
  {
    targetId: null,
    title: "Evolution Matrix Calibrated",
    description: "Calibration complete! You are now equipped to navigate the evolutionary matrix. Break the distraction cycles and level up in real life.",
    badge: "Systems Online"
  }
];
