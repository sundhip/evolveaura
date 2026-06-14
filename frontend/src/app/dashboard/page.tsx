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
import CameraViewport from '../../components/CameraViewport';
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
  TrendingUp, 
  Activity, 
  Heart, 
  Star,
  Wind,
  CheckCircle2,
  X
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
  
  // V3 specific states
  const [cameraVerifyQuest, setCameraVerifyQuest] = useState<any>(null);
  const [capturedImg, setCapturedImg] = useState<string | null>(null);
  const [detectedObject, setDetectedObject] = useState<string>('');
  const [showCameraScanner, setShowCameraScanner] = useState<boolean>(false);
  const [trials, setTrials] = useState<any[]>([]);
  const [duels, setDuels] = useState<any[]>([]);
  const [shadows, setShadows] = useState<any[]>([]);
  const [showExamModal, setShowExamModal] = useState<boolean>(false);
  const [dungeonFloorNotes, setDungeonFloorNotes] = useState<Record<string, string>>({});
  const [activeTourSteps, setActiveTourSteps] = useState<any[]>(DASHBOARD_TOUR_STEPS);
  const [activeConvertDungeonId, setActiveConvertDungeonId] = useState<string | null>(null);
  
  // V2 Specific States
  const [activeArenaBoss, setActiveArenaBoss] = useState<any>(null); // when weekly boss fight is active
  const [activeTrialMode, setActiveTrialMode] = useState<boolean>(false); // when rank ascension trial is active
  const [isBgmPlaying, setIsBgmPlaying] = useState<boolean>(false);

  // Recovery Mode Breathing Timer
  const [crisisBreathCount, setCrisisBreathCount] = useState(60);
  const [crisisBreathActive, setCrisisBreathActive] = useState(false);
  const [breathingPhase, setBreathingPhase] = useState<'IN' | 'HOLD_IN' | 'OUT' | 'HOLD_OUT'>('IN');

  // Secure Sign Out Protocol
  const handleSignOut = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    audioEngine.stopBattleMusic();
    router.push('/');
  };

  // Load & Hydrate Dashboard Data
  async function loadData() {
    try {
      // 1. Calculate user browser local calendar day and timezone offset to avoid UTC date mismatch
      const now = new Date();
      const year = now.getFullYear();
      const month = String(now.getMonth() + 1).padStart(2, '0');
      const day = String(now.getDate()).padStart(2, '0');
      const clientDate = `${year}-${month}-${day}`;
      const timezoneOffset = now.getTimezoneOffset();

      // Fire on-demand Hydration check first to handle midnight rollover carry-overs
      const hyd = await apiRequest('/dashboard/hydrate', { 
        method: 'POST',
        body: JSON.stringify({ clientDate, timezoneOffset })
      });
      
      // Play rollover drop SFX if skipped tasks were penalized
      if (hyd.skippedCount > 0) {
        audioEngine.playMidnightDrop();
        hyd.alerts.forEach((alertText: string) => {
          triggerSystemAlert({
            type: 'BREACH',
            title: 'MATRIX REGRESSION',
            message: alertText,
            subtext: `Profile updated. Remaining XP: ${hyd.profile.currentXP}`
          });
        });
      }

      // Play boot shimmer sound effect and System Proclamation on first successful render
      if (loading) {
        audioEngine.playBoot();
        triggerSystemAlert({
          type: 'QUEST_CLEAR',
          title: 'SYSTEM ACTIVE',
          message: '[System: Welcome back, Player. Your biological matrix has successfully synced. Daily Quests have been rolled.]',
          subtext: 'DISCIPLINE SYNC ONLINE'
        });
      }

      const u = await apiRequest('/auth/profile');
      setUser(u);
      setProfile(u.profile);
      
      // Sync quests (migrated/hydrated)
      setQuests(hyd.quests);

      const p = await apiRequest('/projects');
      setProjects(p);

      const b = await apiRequest('/bosses/active');
      setActiveBoss(b);

      // Fetch V3 Sparring Duels and Shadows
      const dl = await apiRequest('/duels');
      setDuels(dl);

      const sh = await apiRequest('/shadows');
      setShadows(sh);

      // Fetch Local Record of Trials
      const tr = JSON.parse(localStorage.getItem('record_of_trials') || '[]');
      setTrials(tr);

      // Check Phase 2 contextual sub-tours
      const activeDuels = dl.filter((d: any) => d.status === 'ACTIVE');
      if (activeDuels.length > 0 && !localStorage.getItem('tour_seen_sparring_arena')) {
        setActiveTourSteps(SPARRING_ARENA_TOUR_STEPS);
        setShowTour(true);
        localStorage.setItem('tour_seen_sparring_arena', 'true');
      } else if (u.profile.fatigueActive && !localStorage.getItem('tour_seen_fatigue_lockout')) {
        setActiveTourSteps(FATIGUE_LOCKOUT_TOUR_STEPS);
        setShowTour(true);
        localStorage.setItem('tour_seen_fatigue_lockout', 'true');
      } else if (u.profile.levelLocked && !localStorage.getItem('tour_seen_rank_exam')) {
        setActiveTourSteps(RANK_EXAM_TOUR_STEPS);
        setShowTour(true);
        localStorage.setItem('tour_seen_rank_exam', 'true');
      }

      // Show onboarding tour only for first login after registration (shouldShowTour flag)
      const shouldShow = localStorage.getItem('shouldShowTour') === 'true';
      if (shouldShow) {
        setActiveTourSteps(PHASE1_TOUR_STEPS);
        setShowTour(true);
        localStorage.removeItem('shouldShowTour');
        localStorage.setItem('hasCompletedTour', 'true');
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

  // V2 Recovery Mode Box Breathing loop (4s In -> 4s Hold -> 4s Out -> 4s Hold)
  useEffect(() => {
    let t: any = null;
    if (crisisBreathActive && crisisBreathCount > 0) {
      t = setInterval(() => {
        setCrisisBreathCount(c => c - 1);
        
        // Calibrate breathing cycle phases every 4 seconds
        const elapsed = 60 - (crisisBreathCount - 1);
        const cycle = elapsed % 16;
        if (cycle < 4) setBreathingPhase('IN');
        else if (cycle < 8) setBreathingPhase('HOLD_IN');
        else if (cycle < 12) setBreathingPhase('OUT');
        else setBreathingPhase('HOLD_OUT');
      }, 1000);
    } else if (crisisBreathCount === 0) {
      setCrisisBreathActive(false);
      triggerSystemAlert({
        type: 'QUEST_CLEAR',
        title: 'CRISIS STABILIZED',
        message: 'Breathing cycle completed successfully.',
        subtext: 'Your focus state is calibrated.'
      });
      setCrisisBreathCount(60);
      if (profile && profile.fatigueActive) {
        handleClearFatigue();
      }
    }
    return () => clearInterval(t);
  }, [crisisBreathActive, crisisBreathCount]);

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
      audioEngine.playTypewriter();

      triggerSystemAlert({
        type: 'QUEST_CLEAR',
        title: 'PARAM CALIBRATED',
        message: '[System: Attribute allocation complete. Your cognitive processing bounds have expanded.]',
        subtext: `Current ${statName}: ${res.profile['stat' + statName]} | Points Remaining: ${res.profile.unallocatedPoints}`
      });
    } catch (e: any) {
      alert(e.message || "Failed to allocate point");
    }
  };

  // Calm Reset (Recovery Mode Toggle) API Handler
  const handleCalmReset = async () => {
    try {
      const res = await apiRequest('/auth/profile/calm-reset', { method: 'POST' });
      setProfile(res.profile);
      
      // Play procedural wind exhale SFX
      audioEngine.playExhale();
      
      triggerSystemAlert({
        type: 'QUEST_CLEAR',
        title: res.profile.recoveryModeActive ? 'RECOVERY MODE ENGAGED' : 'STANDARD WORKSPACE ONLINE',
        message: res.profile.recoveryModeActive
          ? 'Deep analytics hidden. Bypassing load to focus entirely on calm exercises.'
          : 'Stabilization matrices restored. Normal operations unlocked.',
        subtext: res.profile.recoveryModeActive ? 'Micro Crisis Quest generated.' : 'Standard calibrated dashboard online.'
      });
      
      loadData();
    } catch (e: any) {
      alert(e.message || "Failed to toggle Calm Reset");
    }
  };

  // V3 Clear Fatigue API Handler
  const handleClearFatigue = async () => {
    try {
      const res = await apiRequest('/auth/profile/clear-fatigue', { method: 'POST' });
      setUser({ ...user, profile: res.profile });
      setProfile(res.profile);
      triggerSystemAlert({
        type: 'QUEST_CLEAR',
        title: 'FATIGUE CLEARED',
        message: '[System: Your neural overload parameters have stabilized. Grayscale suppression deactivated.]',
        subtext: 'STANDARD FREQUENCIES RESTORED'
      });
      loadData();
    } catch (e: any) {
      alert(e.message || "Failed to clear fatigue");
    }
  };

  // V3 Start Rank Exam API Handler
  const handleStartExam = async () => {
    try {
      const res = await apiRequest('/exams/start', { method: 'POST' });
      setUser({ ...user, profile: res.profile });
      setProfile(res.profile);
      triggerSystemAlert({
        type: 'QUEST_CLEAR',
        title: 'RANK TRIAL ACTIVE',
        message: res.proclamation,
        subtext: 'PROMOTION TRIAL ENGAGED'
      });
      // Trigger the Rank Exam Tour if not seen yet
      if (!localStorage.getItem('tour_seen_rank_exam')) {
        setActiveTourSteps(RANK_EXAM_TOUR_STEPS);
        setShowTour(true);
        localStorage.setItem('tour_seen_rank_exam', 'true');
      }
      loadData();
    } catch (e: any) {
      alert(e.message || "Failed to start exam");
    }
  };

  // V3 Complete Rank Exam API Handler
  const handleCompleteExam = async () => {
    try {
      const res = await apiRequest('/exams/complete', { method: 'POST' });
      setUser({ ...user, profile: res.profile });
      setProfile(res.profile);
      setShowExamModal(false);
      triggerSystemAlert({
        type: 'QUEST_CLEAR',
        title: 'RANK TRIAL CLEARED',
        message: res.proclamation,
        subtext: 'LEVEL CEILING UNLOCKED'
      });
      loadData();
    } catch (e: any) {
      alert(e.message || "Failed to complete exam");
    }
  };

  // Pressure Meter Score API Handler
  const handleUpdatePressure = async (val: number) => {
    try {
      const res = await apiRequest('/auth/profile/pressure', {
        method: 'POST',
        body: JSON.stringify({ pressureScore: val })
      });
      setProfile(res.profile);
      audioEngine.playTypewriter();
      
      // Auto-trigger alerts on high overload thresholds
      if (val >= 70) {
        triggerSystemAlert({
          type: 'BREACH',
          title: 'PRESSURE OVERLOAD ENGAGED',
          message: 'Extreme stress parameters detected. Quest matrices scaled down to Recovery Mode levels.',
          subtext: `Current Load: ${val}% | Scaling parameters 50%`
        });
      }
      
      loadData();
    } catch (e: any) {
      alert(e.message || "Failed to update pressure");
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
        title: `CHALLENGE ENGAGED: TIER ${tier}`,
        message: `The weekly focus parameters have locked in. Clear the quest on any day of the week.`,
        subtext: `Ready for activation inside your Gate of Trials.`
      });
    } catch (e: any) {
      alert(e.message || "Failed to select boss tier");
    }
  };

  // Quest Verification Start Timer
  const handleStartQuestTimer = async (userQuestId: string) => {
    try {
      await apiRequest('/quests/start-timer', {
        method: 'POST',
        body: JSON.stringify({ userQuestId })
      });
      
      // Play lock engage click + low hum
      audioEngine.playVerifyInit();
      
      triggerSystemAlert({
        type: 'QUEST_CLEAR',
        title: 'TIMER SECURED',
        message: '[System: You have entered an isolated instance dungeon. Maintain absolute focus or face the failure penalty.]',
        subtext: 'DISCIPLINE FIELD ACTIVE'
      });
      
      loadData();
    } catch (e: any) {
      alert(e.message || "Failed to start quest timer");
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
    if (reflectionInput.trim().length < 50) {
      alert("Reflection note is too short. Minimum 50 characters required.");
      return;
    }
    try {
      let res;
      if (capturedImg) {
        // 1. Create verification session
        const session = await apiRequest('/verification/create', {
          method: 'POST',
          body: JSON.stringify({ userQuestId: uqId })
        });
        // 2. Submit session with base64 image details and reflection note
        res = await apiRequest('/verification/submit', {
          method: 'POST',
          body: JSON.stringify({
            sessionId: session.id,
            objectResult: detectedObject,
            manualTextInput: reflectionInput,
            devBypass: false
          })
        });
      } else {
        // Standard verify with reflection note
        res = await apiRequest('/quests/verify', {
          method: 'POST',
          body: JSON.stringify({ userQuestId: uqId, inputData: reflectionInput })
        });
      }
      
      triggerSystemAlert({
        type: 'QUEST_CLEAR',
        title: 'DAILY MATRIX VERIFIED',
        message: `Quest successfully completed.`,
        subtext: `+${res.xpGained} XP deposited | Streak: ${res.streak} Days`
      });

      setSelectedQuestForVerify(null);
      setReflectionInput('');
      setCapturedImg(null);
      setDetectedObject('');

      if (res.shadowExtracted) {
        triggerSystemAlert({
          type: 'QUEST_CLEAR',
          title: 'SHADOW EXTRACTED',
          message: `[System: Streaks crystallized. Quest verified and extracted as a permanent Shadow Soldier!]`,
          subtext: 'AUTOMATED HARVESTING ENABLED'
        });
        if (!localStorage.getItem('tour_seen_shadow_extraction')) {
          setActiveTourSteps(SHADOW_EXTRACTION_TOUR_STEPS);
          setShowTour(true);
          localStorage.setItem('tour_seen_shadow_extraction', 'true');
        }
      }

      loadData();
    } catch (e: any) {
      alert(e.message || "Failed to verify quest");
    }
  };

  // Play hover tick sound
  const handleHoverTick = () => {
    audioEngine.playNavTick();
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center text-white bg-[#0F172A]">
        <div className="text-center space-y-4">
          <div className="w-12 h-12 rounded-full border-4 border-[#8B5CF6] border-t-transparent animate-spin mx-auto" />
          <p className="text-slate-400 font-mono text-xs">Synchronizing Matrix parameters...</p>
        </div>
      </div>
    );
  }

  // Stats configuration and balanced growth check
  const stats = profile
    ? [profile.statINT, profile.statSTR, profile.statVIT, profile.statWIS, profile.statAGI]
    : [10, 10, 10, 10, 10];

  const maxStat = Math.max(...stats);
  const minStat = Math.min(...stats);
  const isBalanced = (maxStat - minStat) <= 3;

  // XP Progress Calculation
  const xpRequired = Math.round(100 * Math.pow(profile.currentLevel, 1.5));
  const xpPercent = Math.min(100, Math.round((profile.currentXP / xpRequired) * 100));

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
        <div className="absolute top-[-20%] left-[-25%] w-[80%] h-[80%] rounded-full bg-red-600/10 blur-[180px] pointer-events-none animate-pulse" />
        <div className="absolute bottom-[-20%] right-[-25%] w-[80%] h-[80%] rounded-full bg-[#8B5CF6]/10 blur-[180px] pointer-events-none" />

        <SystemAlerts />

        <header className="border-b border-slate-900 bg-slate-950/70 backdrop-blur-md px-6 py-4 flex justify-between items-center relative z-20">
          <div className="text-xl font-extrabold text-red-500 tracking-wider">SYSTEM LOCKDOWN</div>
          <button onClick={handleSignOut} className="text-xs font-bold text-red-400 border border-red-500/20 px-4 py-2 rounded-xl hover:bg-red-500/10 transition cursor-pointer">
            Sign Out Profile
          </button>
        </header>

        <main className="max-w-4xl mx-auto px-6 mt-12 grid grid-cols-1 md:grid-cols-2 gap-8 relative z-10 flex-1 items-center">
          
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

  // Find Crisis Quest for Recovery Mode View
  const recoveryCrisisQuest = quests.find(q => q.quest.title.includes("Calm Reset") || q.quest.title.includes("Breathe")) || quests.find(q => !q.completed);

  return (
    <div className={`min-h-screen pb-12 transition-colors duration-700 text-slate-300 relative ${
      isWeekendEnraged 
        ? 'bg-gradient-to-b from-[#180505] via-[#090202] to-[#040101] border-t-2 border-red-800/40' 
        : 'bg-[#0F172A]'
    }`}>
      
      {isWeekendEnraged ? (
        <div className="absolute top-[-10%] left-[-10%] w-[60%] h-[60%] rounded-full bg-red-600/10 opacity-[0.08] blur-[150px] pointer-events-none animate-pulse" />
      ) : (
        <>
          <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] rounded-full bg-[#8B5CF6] opacity-[0.03] blur-[150px] pointer-events-none" />
          <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] rounded-full bg-[#60A5FA] opacity-[0.03] blur-[150px] pointer-events-none" />
        </>
      )}

      <SystemAlerts />

      {showTour && (
        <AwakeningTour 
          steps={activeTourSteps} 
          onComplete={() => { 
            setShowTour(false); 
            localStorage.setItem('hasCompletedTour', 'true'); 
          }} 
        />
      )}

      {/* Nav Header */}
      <header className="border-b border-slate-800/80 bg-slate-900/50 backdrop-blur-xl sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-4 py-4 flex justify-between items-center">
          <div onMouseEnter={handleHoverTick} className="text-xl font-extrabold text-[#8B5CF6] tracking-wide flex items-center">
            EVOLVE<span className="text-white">AURA</span>
            {isWeekendEnraged && (
              <span className="ml-2 text-[10px] font-black text-red-500 bg-red-500/10 border border-red-500/30 px-2 py-0.5 rounded-full animate-pulse">
                👹 ENRAGED PHASE
              </span>
            )}
          </div>
          
          <nav className="flex space-x-6 text-sm font-medium items-center">
            <Link onMouseEnter={handleHoverTick} href="/dashboard" className="text-white">Dashboard</Link>
            <Link onMouseEnter={handleHoverTick} id="focus-telemetry" href="/focus" className="text-slate-400 hover:text-white transition">Focus</Link>
            <Link onMouseEnter={handleHoverTick} id="subjects-grid" href="/subject-analysis" className="text-slate-400 hover:text-white transition">Subjects</Link>
            <button onMouseEnter={handleHoverTick} onClick={() => { setActiveTourSteps(DASHBOARD_TOUR_STEPS); setShowTour(true); }} className="text-slate-400 hover:text-white font-medium transition cursor-pointer">Tour</button>
            <button onMouseEnter={handleHoverTick} onClick={handleSignOut} className="text-red-400 hover:text-red-300 font-bold transition flex items-center cursor-pointer">
              <LogOut className="w-4 h-4 mr-1" /> Sign Out
            </button>
          </nav>
        </div>
      </header>

      {/* RENDER CRITICAL RECOVERY VIEW IF ENGAGED */}
      {profile.recoveryModeActive ? (
        <main className="max-w-xl mx-auto px-4 mt-12 space-y-8 relative z-10">
          
          {/* Recovery view header */}
          <div className="text-center space-y-2">
            <div className="flex items-center justify-center space-x-2">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <span className="text-[10px] font-black text-emerald-400 uppercase tracking-widest font-mono">RECOVERY INSTANCE ACTIVE</span>
            </div>
            <h2 className="text-2xl font-black text-white tracking-wide uppercase font-mono">STABILIZE MIND</h2>
            <p className="text-slate-400 text-xs">Complex panels are hidden. Concentrate entirely on this single recovery node.</p>
          </div>

          {/* Micro Crisis Quest Card */}
          {recoveryCrisisQuest ? (
            <div className="glass-panel p-6 border-emerald-500/30 shadow-[0_0_20px_rgba(16,185,129,0.1)] space-y-6">
              <div className="flex justify-between items-start">
                <div>
                  <span className="text-[10px] font-bold text-emerald-400 uppercase tracking-widest font-mono">
                    Active Crisis Quest
                  </span>
                  <h4 className="text-white font-extrabold text-sm mt-1">{recoveryCrisisQuest.quest.title}</h4>
                  <p className="text-slate-400 text-xs mt-1 leading-relaxed">{recoveryCrisisQuest.quest.description}</p>
                </div>
                <span className="text-2xl">🧘</span>
              </div>

              {/* Box Breathing Timer widget */}
              <div className="p-6 bg-slate-950/60 rounded-2xl border border-slate-900 text-center space-y-4">
                {crisisBreathActive ? (
                  <div className="space-y-4">
                    <div className="w-28 h-28 rounded-full border-2 border-emerald-500/25 flex items-center justify-center mx-auto relative overflow-hidden">
                      <div className={`absolute inset-2 rounded-full bg-emerald-500/10 transition-transform duration-[4000ms] ease-in-out ${
                        breathingPhase === 'IN' ? 'scale-100' : breathingPhase === 'OUT' ? 'scale-50' : 'scale-75'
                      }`} />
                      <span className="text-2xl font-black text-white font-mono tabular-nums relative z-10">{crisisBreathCount}s</span>
                    </div>
                    
                    <div className="text-xs font-mono font-bold tracking-wider text-emerald-400 uppercase transition-all duration-300">
                      {breathingPhase === 'IN' && '💨 Breathe In (4s)'}
                      {breathingPhase === 'HOLD_IN' && '✋ Hold Breath (4s)'}
                      {breathingPhase === 'OUT' && '💨 Breathe Out (4s)'}
                      {breathingPhase === 'HOLD_OUT' && '✋ Hold Breath (4s)'}
                    </div>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <div className="text-slate-400 text-xs font-medium">
                      Requires 60 seconds of zero-violation deep box breathing.
                    </div>
                    <button
                      onClick={() => {
                        setCrisisBreathActive(true);
                        audioEngine.playVerifyInit();
                      }}
                      className="px-6 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold uppercase tracking-wider transition"
                    >
                      Start Breathing Loop
                    </button>
                  </div>
                )}
              </div>

              <div className="flex justify-between items-center text-xs border-t border-slate-900 pt-4 font-mono text-[10px]">
                <span className="text-slate-500">XP Reward: +{recoveryCrisisQuest.quest.xpReward} XP</span>
                {recoveryCrisisQuest.completed ? (
                  <span className="text-emerald-400 font-bold bg-emerald-500/10 px-2 py-0.5 rounded-lg border border-emerald-500/20">Completed</span>
                ) : (
                  <button
                    onClick={() => {
                      if (crisisBreathActive) {
                        alert("Please finish the breathing timer first.");
                        return;
                      }
                      setSelectedQuestForVerify(recoveryCrisisQuest);
                    }}
                    className="px-4 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-bold transition shadow-md shadow-emerald-600/10 cursor-pointer"
                  >
                    Log Verification
                  </button>
                )}
              </div>
            </div>
          ) : (
            <p className="text-slate-500 text-xs italic text-center">No crisis objectives active. Breathe calmly and relax.</p>
          )}

          {/* Exit Recovery Mode button */}
          <button 
            onClick={handleCalmReset}
            className="w-full py-3 rounded-xl border border-slate-800 bg-slate-900/40 text-slate-400 text-xs font-bold font-mono tracking-wider hover:text-white hover:border-slate-700 transition cursor-pointer"
          >
            🧘 Bypassing Recovery: Exit to Dashboard
          </button>
        </main>
      ) : (
        <>
          {/* RENDER STANDARD DASHBOARD MODULE */}
          <div className={profile?.fatigueActive ? 'grayscale opacity-45 pointer-events-none select-none' : ''}>
          {/* Top action row */}
          <div className="max-w-6xl mx-auto px-4 mt-6 flex justify-between items-center flex-wrap gap-4">
            {isWeekendEnraged ? (
              <div className="glass-panel p-2.5 px-4 flex items-center space-x-3 border-red-500/20 shadow-[0_0_15px_rgba(239,68,68,0.1)]">
                <span className="text-[10px] font-black text-red-400 uppercase tracking-widest font-mono flex items-center">
                  <Swords className="w-3.5 h-3.5 mr-1.5 animate-spin" /> Battle Synth Drums:
                </span>
                <button
                  onClick={() => setIsBgmPlaying(!isBgmPlaying)}
                  className="p-1 rounded bg-red-500/10 hover:bg-red-500/20 text-red-400 transition cursor-pointer"
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

            {/* Distraction stabilizers */}
            <button 
              id="distraction-stabilizer"
              onClick={() => { setShowDistracted(true); setBreathActive(true); }}
              className="px-6 py-2.5 rounded-xl bg-red-600 hover:bg-red-700 text-white font-bold text-xs uppercase tracking-wider shadow-lg shadow-red-600/20 transition cursor-pointer"
            >
              🚨 I'm Distracted!
            </button>
          </div>

          {/* Tug of war bar for active duels */}
          {duels.filter(d => d.status === 'ACTIVE').map(d => {
            const isChallenger = d.challengerId === user?.id;
            const myXP = isChallenger ? d.challengerXP : d.opponentXP;
            const peerXP = isChallenger ? d.opponentXP : d.challengerXP;
            const totalXP = myXP + peerXP || 1;
            const myPct = Math.round((myXP / totalXP) * 100);
            const peerPct = 100 - myPct;
            const hoursLeft = Math.max(0, Math.round((new Date(d.endTime).getTime() - Date.now()) / (1000 * 60 * 60)));
            const myStance = isChallenger ? d.challengerStance : d.opponentStance;

            return (
              <div key={d.id} id="arena-clash-header-strip" className="max-w-6xl mx-auto px-4 mt-6">
                <div className="glass-panel p-4 border-l-4 border-l-cyan-500 bg-cyan-950/10 flex flex-col md:flex-row md:items-center justify-between gap-6">
                  <div className="text-xs">
                    <span className="text-[10px] font-black text-cyan-400 uppercase tracking-widest font-mono block">
                      ⚔️ ACTIVE DUEL INSTANCE
                    </span>
                    <span className="text-white font-extrabold text-xs mt-0.5 block">
                      Opponent: {isChallenger ? d.opponentName : d.challengerName} ({isChallenger ? d.opponentRank : d.challengerRank}-Rank)
                    </span>
                    <span className="duel-countdown-timestamp text-slate-500 text-[10px] font-mono block mt-0.5">
                      Time Left: <strong className="text-white">{hoursLeft} Hours</strong>
                    </span>
                  </div>

                  {/* Tug-of-war slider */}
                  <div className="flex-1 max-w-md space-y-1.5">
                    <div className="flex justify-between text-[10px] font-bold font-mono text-xs">
                      <span className="text-cyan-400">YOU: {myXP} XP ({myPct}%)</span>
                      <span className="text-red-400">PEER: {peerXP} XP ({peerPct}%)</span>
                    </div>
                    <div className="w-full h-3 bg-slate-950 border border-slate-800 rounded-full overflow-hidden flex relative">
                      <div className="duel-tug-bar-divider h-full bg-cyan-500 transition-all duration-700 ease-out" style={{ width: `${myPct}%` }} />
                      <div className="h-full bg-red-600 transition-all duration-700 ease-out" style={{ width: `${peerPct}%` }} />
                    </div>
                  </div>

                  {/* Stance Selector */}
                  <div className="flex items-center space-x-2">
                    <span className="text-[10px] text-slate-400 font-bold uppercase font-mono">Combat Stance:</span>
                    <div className="stance-selector-button-group flex space-x-1">
                      {[
                        { key: 'NONE', label: 'None', desc: 'Standard yields' },
                        { key: 'BERSERKER', label: 'Shadow Berserker', desc: '1.5x Physical Warrior tasks' },
                        { key: 'FOCUS', label: 'Absolute Focus', desc: '2.0x Focus block last 4 hours' }
                      ].map(s => (
                        <button
                          key={s.key}
                          onClick={async () => {
                            try {
                              await apiRequest('/duels/stance', {
                                method: 'POST',
                                body: JSON.stringify({ duelId: d.id, stance: s.key })
                              });
                              triggerSystemAlert({
                                type: 'QUEST_CLEAR',
                                title: 'COMBAT STANCE ACTIVE',
                                message: `Stance set to: ${s.label}. Yield multipliers recalibrated.`,
                                subtext: 'ARENA MATRICES STABILIZED'
                              });
                              loadData();
                            } catch (err) {
                              alert("Failed to set stance");
                            }
                          }}
                          className={`px-2 py-1.5 rounded-lg text-[9px] font-bold uppercase transition cursor-pointer font-mono ${
                            myStance === s.key 
                              ? 'bg-cyan-500 text-slate-950 border border-cyan-400 shadow-lg shadow-cyan-500/20'
                              : 'bg-slate-950/80 border border-slate-800 text-slate-400 hover:text-white'
                          }`}
                          title={s.desc}
                        >
                          {s.label.split(' ')[s.label.split(' ').length - 1]}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}

          {/* Four Paths Archetype Row */}
          <div id="archetype-cards-container" className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6 max-w-6xl mx-auto px-4">
            {[
              { path: 'Scholar', stat: profile?.statINT || 10, color: 'border-blue-500/20 bg-blue-500/5 hover:border-blue-500/50 hover:bg-blue-500/10 text-blue-400', desc: 'Focus & deep recall learning' },
              { path: 'Warrior', stat: profile?.statSTR || 10, color: 'border-emerald-500/20 bg-emerald-500/5 hover:border-emerald-500/50 hover:bg-emerald-500/10 text-emerald-400', desc: 'Sleep, energy & exercise' },
              { path: 'Sage', stat: profile?.statWIS || 10, color: 'border-cyan-500/20 bg-cyan-500/5 hover:border-cyan-500/50 hover:bg-cyan-500/10 text-cyan-400', desc: 'Mindfulness & resilience' },
              { path: 'Creator', stat: profile?.statAGI || 10, color: 'border-amber-500/20 bg-amber-500/5 hover:border-amber-500/50 hover:bg-amber-500/10 text-amber-400', desc: 'Curiosity & creative building' }
            ].map(p => (
              <div key={p.path} className={`glass-panel p-4 border rounded-2xl flex flex-col justify-between transition-all duration-300 transform hover:-translate-y-1 hover:shadow-lg group relative overflow-hidden ${p.color}`}>
                <div className="space-y-1.5 z-10">
                  <span className="text-[10px] font-bold uppercase tracking-widest block opacity-70">{p.path} Path</span>
                  <p className="text-[10px] text-slate-400 leading-tight block">{p.desc}</p>
                </div>
                
                <div className="flex justify-between items-center mt-4 pt-2 border-t border-slate-800/40 z-10">
                  <span className="text-[10px] text-slate-500 font-mono">CALIBRATION INDEX</span>
                  <span className="text-sm font-black font-mono">[{p.stat}]</span>
                </div>

                {/* Level tracker tag revealed on hover */}
                <div className="absolute inset-0 bg-slate-950/90 flex flex-col items-center justify-center p-3 text-center transition-all duration-300 opacity-0 group-hover:opacity-100 z-20">
                  <span className="text-[10px] font-bold text-white uppercase tracking-widest">{p.path} Path Level</span>
                  <div className="text-xl font-extrabold text-[#8B5CF6] font-mono mt-1">Lvl {p.stat}</div>
                  <span className="text-[8px] text-slate-500 font-mono mt-1">BREAKTHROUGH STABLE</span>
                </div>
              </div>
            ))}
          </div>

          <div id="dashboard-grid" className="max-w-6xl mx-auto px-4 mt-6 grid grid-cols-1 md:grid-cols-3 gap-8">
            
            {/* Left Column: Core Status Menu */}
            <div className="space-y-6">
              
              {/* RPG Glassmorphic Profile Status Panel */}
              <div className={`glass-panel p-6 relative overflow-hidden flex flex-col items-center text-center transition-all duration-300 border ${getRankGlowClass(profile.auraRank)}`}>
                
                {/* Streak Counter Badge */}
                <div className="absolute top-4 right-4 flex items-center text-orange-400 font-bold bg-orange-400/10 px-2 py-0.5 rounded-full text-[10px] font-mono">
                  <Flame className="w-3.5 h-3.5 mr-1 fill-orange-400" /> {profile.currentStreak} Days
                </div>

                {/* Core Rank Display */}
                <div id="rank-matrix" className={`user-rank-display-badge w-16 h-16 rounded-full border flex items-center justify-center text-2xl font-black bg-slate-950 mt-4 mb-2 shadow-inner font-mono ${getRankBadgeClass(profile.auraRank)}`}>
                  {profile.auraRank}
                </div>
                
                <h3 className="font-extrabold text-white text-base tracking-wide mt-1">{profile.name}</h3>
                <p className="character-rank-tier-text text-[10px] text-slate-400 uppercase tracking-widest font-mono mt-0.5">{profile.equippedTitle}</p>

                {/* Level and XP progress */}
                <div id="xp-leveling" className="w-full mt-6 space-y-1.5 text-left text-xs font-semibold">
                  <div className="flex justify-between text-slate-300 font-mono">
                    <span className="flex items-center">
                      LEVEL {profile.currentLevel}
                      {profile.levelLocked && <Lock className="w-3 h-3 text-red-500 ml-1.5 animate-pulse" />}
                    </span>
                    <span>{profile.levelLocked ? '100% [LOCKED]' : `${xpPercent}% (${profile.currentXP} / ${xpRequired} XP)`}</span>
                  </div>
                  <div 
                    id="xp-progress-bar-main"
                    onClick={() => {
                      if (profile.levelLocked) {
                        setShowExamModal(true);
                      }
                    }}
                    className={`w-full h-2.5 bg-slate-950 rounded-full overflow-hidden border border-slate-900 cursor-pointer ${
                      profile.levelLocked ? 'border-red-500 animate-pulse' : ''
                    }`}
                  >
                    <div 
                      className={`h-full transition-all duration-500 ${
                        profile.levelLocked 
                          ? 'bg-white shadow-[0_0_15px_rgba(255,255,255,0.8)]' 
                          : 'bg-gradient-to-r from-[#8B5CF6] to-[#60A5FA]'
                      }`} 
                      style={{ width: profile.levelLocked ? '100%' : `${xpPercent}%` }} 
                    />
                  </div>
                </div>

                {/* Shields & Streak info */}
                <div className="flex justify-center w-full mt-4 text-xs pt-4 border-t border-slate-800/80 flex-col items-center space-y-2">
                  <span id="shields-vault" className="text-slate-400 font-mono">
                    Streak Shields: <strong className="text-[#8B5CF6]">{profile.auraShields}</strong>
                  </span>
                  <Link id="assessment-portal" href="/assessment" className="text-[10px] font-bold text-[#8B5CF6] hover:underline mt-1 block tracking-wider uppercase font-mono">
                    Entrance Portal (Recalibrate)
                  </Link>
                </div>

                {/* Integrity, Pressure, and Stability Indicators Grid */}
                <div className="w-full mt-4 pt-4 border-t border-slate-800/80 grid grid-cols-2 gap-3 text-left font-mono text-[10px] leading-relaxed">
                  <div className="space-y-0.5">
                    <span className="text-slate-500 uppercase tracking-wider block text-[8px]">Integrity Score</span>
                    <strong className="text-slate-200 block text-xs">{Math.round(profile.integrityScore)}%</strong>
                  </div>
                  <div className="space-y-0.5">
                    <span className="text-slate-500 uppercase tracking-wider block text-[8px]">Pressure Load</span>
                    <strong className={`block text-xs ${profile.pressureScore >= 70 ? 'text-red-400 animate-pulse' : 'text-slate-200'}`}>
                      {profile.pressureScore}% {profile.pressureScore >= 70 && '[OVERLOAD]'}
                    </strong>
                  </div>
                  <div className="space-y-0.5">
                    <span className="text-slate-500 uppercase tracking-wider block text-[8px]">Stability Score</span>
                    <strong className="text-slate-200 block text-xs">{Math.round(profile.stabilityScore)}%</strong>
                  </div>
                  <div className="space-y-0.5 global-xp-multiplier-display">
                    <span className="text-slate-500 uppercase tracking-wider block text-[8px]">XP Multiplier</span>
                    <strong className={`block text-[10px] ${profile.fatigueActive ? 'text-red-500 animate-pulse font-bold' : 'text-emerald-400'}`}>
                      {profile.fatigueActive ? '0.0x [FATIGUED]' : '1.0x'}
                    </strong>
                  </div>
                </div>

                {/* Calm Reset Button */}
                <button
                  onClick={handleCalmReset}
                  className={`w-full mt-5 py-2.5 rounded-xl border text-xs font-bold font-mono tracking-wider transition cursor-pointer shadow-md ${
                    profile.recoveryModeActive
                      ? 'bg-emerald-500/15 border-emerald-500/35 text-emerald-400'
                      : 'bg-slate-950/40 border-slate-800 text-slate-400 hover:text-white hover:border-slate-700'
                  }`}
                >
                  🧘 Calm Reset (Recovery Mode)
                </button>
              </div>

              {/* Interactive Workload Stress Calibration Slider */}
              <div className="glass-panel p-6 space-y-4">
                <h4 className="font-bold text-white text-xs uppercase tracking-wider flex items-center font-mono">
                  🧘 Workload Calibration
                </h4>
                <p className="text-slate-500 text-[10px] leading-relaxed">
                  Calibrate local stress factors (fatigue, deadlines, exams) to scale daily task parameters.
                </p>
                <div className="flex items-center space-x-4 pt-2">
                  <input 
                    type="range" 
                    min="0" 
                    max="100" 
                    value={profile.pressureScore} 
                    onChange={(e) => handleUpdatePressure(parseInt(e.target.value))}
                    className="w-full accent-[#8B5CF6] h-1 bg-slate-800 rounded-lg appearance-none cursor-pointer"
                  />
                  <span className="font-mono text-xs text-[#8B5CF6] font-bold w-10 text-right">{profile.pressureScore}%</span>
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

              {/* Record of Trials Panel */}
              <div className="glass-panel p-6 space-y-4">
                <h4 className="font-bold text-white text-xs uppercase tracking-wider flex items-center font-mono">
                  📷 Record of Trials
                </h4>
                <p className="text-slate-500 text-[10px] leading-relaxed">
                  Visual log of daily anchor tasks verified by the system's camera.
                </p>
                <div id="record-of-trials-link" className="grid grid-cols-3 gap-2">
                  {trials.length > 0 ? (
                    trials.map((trial: any) => (
                      <div key={trial.id} className="relative aspect-square bg-slate-950 rounded-lg overflow-hidden group border border-slate-800">
                        <img src={trial.image} alt={trial.questTitle} className="w-full h-full object-cover opacity-85 group-hover:opacity-100 transition duration-300" />
                        <div className="absolute inset-0 bg-slate-950/70 opacity-0 group-hover:opacity-100 transition flex items-center justify-center p-1 text-[8px] text-white font-mono text-center">
                          {trial.questTitle}
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="col-span-3 text-center text-slate-600 text-[10px] py-4 italic border border-dashed border-slate-850 rounded-xl">
                      No proofs logged yet.
                    </div>
                  )}
                </div>
              </div>

              {/* Sparring Arena Challenges Panel */}
              <div className="glass-panel p-6 space-y-4">
                <h4 className="font-bold text-white text-xs uppercase tracking-wider flex items-center font-mono">
                  <Swords className="w-4 h-4 mr-1.5 text-cyan-400" /> Sparring Arena Duels
                </h4>
                
                {/* Challenge a friend form */}
                <form 
                  onSubmit={async (e) => {
                    e.preventDefault();
                    const email = (e.target as any).opponentEmail.value;
                    const hours = (e.target as any).durationHours.value;
                    if (!email) return;
                    try {
                      await apiRequest('/duels/challenge', {
                        method: 'POST',
                        body: JSON.stringify({ opponentEmail: email, durationHours: hours })
                      });
                      (e.target as any).reset();
                      triggerSystemAlert({
                        type: 'QUEST_CLEAR',
                        title: 'DUEL SENT',
                        message: `Challenge dispatched to ${email}.`,
                        subtext: 'AWAITING OPPONENT RESPONSE'
                      });
                      loadData();
                    } catch (err: any) {
                      alert(err.message || 'Failed to send challenge');
                    }
                  }}
                  className="space-y-2"
                >
                  <div className="flex space-x-2">
                    <input
                      name="opponentEmail"
                      type="email"
                      required
                      placeholder="Friend's email"
                      className="flex-1 px-3 py-2 rounded-xl bg-slate-950 border border-slate-850 text-slate-200 text-[11px] focus:outline-none focus:border-cyan-500"
                    />
                    <select
                      name="durationHours"
                      className="px-2 py-2 rounded-xl bg-slate-950 border border-slate-850 text-slate-300 text-[11px]"
                    >
                      <option value="24">24h</option>
                      <option value="48">48h</option>
                    </select>
                    <button type="submit" className="px-3 rounded-xl bg-cyan-600 hover:bg-cyan-700 text-white font-bold text-xs cursor-pointer transition">
                      Duel
                    </button>
                  </div>
                </form>

                {/* Challenges list */}
                <div className="space-y-2 pt-2">
                  {duels.filter(d => d.status === 'PENDING').map(d => {
                    const isOpponent = d.opponentId === user?.id;
                    return (
                      <div key={d.id} className="p-3 bg-slate-950/40 border border-slate-850 rounded-xl flex justify-between items-center text-xs font-mono">
                        <div>
                          <div className="font-bold text-white text-[10px]">Duel: {d.challengerName}</div>
                          <div className="text-[9px] text-slate-500 mt-0.5">Duration: {d.durationHours}h</div>
                        </div>
                        {isOpponent ? (
                          <div className="flex space-x-1.5">
                            <button
                              onClick={async () => {
                                await apiRequest('/duels/respond', {
                                  method: 'POST',
                                  body: JSON.stringify({ duelId: d.id, accept: true })
                                });
                                loadData();
                              }}
                              className="px-2 py-1 rounded bg-cyan-600 hover:bg-cyan-700 text-white font-bold text-[9px] cursor-pointer transition"
                            >
                              Accept
                            </button>
                            <button
                              onClick={async () => {
                                await apiRequest('/duels/respond', {
                                  method: 'POST',
                                  body: JSON.stringify({ duelId: d.id, accept: false })
                                });
                                loadData();
                              }}
                              className="px-2 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-400 text-[9px] cursor-pointer transition"
                            >
                              Reject
                            </button>
                          </div>
                        ) : (
                          <span className="text-[9px] text-slate-500 italic">Pending...</span>
                        )}
                      </div>
                    );
                  })}
                </div>
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
                    // ACTIVE IN INVENTORY
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
                              : '⚔️ ACTIVE IN INVENTORY (READY)'
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
                  {quests.filter(uq => !shadows.some(s => s.questId === uq.questId && s.active)).map((uq) => (
                    <div key={uq.id} className="p-4 rounded-xl border border-slate-800 bg-slate-900/30 flex justify-between items-center">
                      <div>
                        <div className="flex items-center space-x-2">
                          <span className="text-[10px] font-bold text-[#8B5CF6] uppercase tracking-widest">{uq.quest.path} • {uq.quest.difficulty}</span>
                          {uq.isHighTier && (
                            <span className="text-[8px] font-black text-amber-400 bg-amber-400/10 border border-amber-400/20 px-1.5 py-0.2 rounded-full uppercase font-mono">
                              ⚓ Main Anchor
                            </span>
                          )}
                          {uq.proofType && (
                            <span className="text-[8px] font-black text-cyan-400 bg-cyan-400/10 border border-cyan-400/20 px-1.5 py-0.2 rounded-full uppercase font-mono">
                              Proof Required
                            </span>
                          )}
                        </div>
                        <h4 className="text-white font-bold text-sm mt-0.5">{uq.quest.title}</h4>
                        <p className="text-slate-400 text-xs mt-1">{uq.quest.description}</p>
                      </div>

                      <div className="flex items-center space-x-3">
                        {/* Timer start button if it requires a TIMER and hasn't started */}
                        {uq.quest.verificationType === 'TIMER' && !uq.completed && !uq.timerStartedAt && (
                          <button
                            onClick={() => handleStartQuestTimer(uq.id)}
                            className="px-3 py-1.5 rounded-lg border border-[#8B5CF6]/40 hover:bg-[#8B5CF6]/10 text-white text-xs font-bold transition cursor-pointer"
                          >
                            ▶ Initiate Timer
                          </button>
                        )}
                        {uq.quest.verificationType === 'TIMER' && !uq.completed && uq.timerStartedAt && (
                          <span className="text-[10px] font-bold text-amber-400 bg-amber-500/10 border border-amber-500/20 px-2.5 py-1 rounded-lg animate-pulse font-mono">
                            ⚡ Focus Active
                          </span>
                        )}

                        {uq.completed ? (
                          <span className="text-xs font-bold text-emerald-400 bg-emerald-500/10 px-3 py-1 rounded-lg border border-emerald-500/20">Completed</span>
                        ) : (
                          <button 
                            id="journal-qc"
                            onClick={() => {
                              setSelectedQuestForVerify(uq);
                              setCapturedImg(null);
                              setDetectedObject('');
                              setReflectionInput('');
                              if (uq.isHighTier && !localStorage.getItem('tour_seen_proof_capture')) {
                                setActiveTourSteps(PROOF_CAPTURE_TOUR_STEPS);
                                setShowTour(true);
                                localStorage.setItem('tour_seen_proof_capture', 'true');
                              }
                            }}
                            className="verify-trigger-btn px-4 py-1.5 rounded-lg bg-[#8B5CF6] hover:bg-[#7c4fe3] text-white text-xs font-bold transition shadow-md shadow-[#8B5CF6]/20 cursor-pointer"
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
                    projects.map((p) => {
                      const isConverting = activeConvertDungeonId === p.id;
                      return (
                        <div key={p.id} className={`p-5 rounded-2xl border transition-all duration-300 ${
                          p.isDungeon 
                            ? 'dungeon-card-active border-[#8B5CF6]/40 bg-gradient-to-r from-slate-950/40 to-[#8B5CF6]/5 shadow-[0_0_20px_rgba(139,92,246,0.05)]' 
                            : 'bg-slate-900/20 border-slate-800'
                        } space-y-4`}>
                          <div className="flex justify-between items-start text-xs font-bold">
                            <div>
                              <div className="flex items-center space-x-2">
                                <span className="text-white font-extrabold text-sm">{p.title}</span>
                                {p.isDungeon && (
                                  <span className="text-[8px] font-black text-[#8B5CF6] bg-[#8B5CF6]/15 border border-[#8B5CF6]/20 px-1.5 py-0.2 rounded-full uppercase tracking-wider font-mono">
                                    🏰 Grand Dungeon
                                  </span>
                                )}
                              </div>
                              {p.isDungeon && (
                                <p className="text-[10px] text-slate-500 font-mono mt-0.5">Progress: Floor {p.currentFloor} / 3</p>
                              )}
                            </div>
                            <span className="text-slate-400 font-mono">{p.progress}% Completed</span>
                          </div>

                          <div className="w-full h-1.5 bg-slate-950 border border-slate-900 rounded-full overflow-hidden">
                            <div className={`h-full ${p.isDungeon ? 'bg-[#8B5CF6]' : 'bg-emerald-500'}`} style={{ width: `${p.progress}%` }} />
                          </div>

                          {/* Non-dungeon: Show dungeon converter action */}
                          {!p.isDungeon && !isConverting && (
                            <button
                              onClick={() => setActiveConvertDungeonId(p.id)}
                              className="w-full py-2 bg-slate-955 hover:bg-slate-900 border border-slate-800 text-slate-400 hover:text-white text-[10px] font-mono font-bold uppercase rounded-xl transition cursor-pointer flex items-center justify-center space-x-2"
                            >
                              <span>🏰 Evolve into Grand Dungeon</span>
                            </button>
                          )}

                          {/* Convert form */}
                          {isConverting && (
                            <form 
                              onSubmit={async (e) => {
                                e.preventDefault();
                                const f1 = (e.target as any).f1.value;
                                const f2 = (e.target as any).f2.value;
                                const f3 = (e.target as any).f3.value;
                                try {
                                  await apiRequest('/projects/convert-dungeon', {
                                    method: 'POST',
                                    body: JSON.stringify({ projectId: p.id, floor1Title: f1, floor2Title: f2, floor3Title: f3 })
                                  });
                                  setActiveConvertDungeonId(null);
                                  audioEngine.playBoot(); // sweep chime
                                  triggerSystemAlert({
                                    type: 'QUEST_CLEAR',
                                    title: 'DUNGEON UNLOCKED',
                                    message: `Dungeon instance generated: ${p.title}`,
                                    subtext: 'LEVEL CEILING ENGAGED'
                                  });
                                  if (!localStorage.getItem('tour_seen_dungeons')) {
                                    setActiveTourSteps(GRAND_DUNGEONS_TOUR_STEPS);
                                    setShowTour(true);
                                    localStorage.setItem('tour_seen_dungeons', 'true');
                                  }
                                  loadData();
                                } catch (err: any) {
                                  alert(err.message || "Failed to convert dungeon");
                                }
                              }}
                              className="space-y-3 p-3 bg-slate-955 rounded-xl border border-slate-850"
                            >
                              <div className="text-[10px] font-bold text-[#8B5CF6] uppercase font-mono tracking-wider">Set Dungeon Milestones (Floors)</div>
                              
                              <div className="space-y-2 text-xs">
                                <input name="f1" required placeholder="Floor 1: (e.g. Draft manuscript outline)" className="w-full px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-800 text-white focus:outline-none focus:border-[#8B5CF6] text-[11px]" />
                                <input name="f2" required placeholder="Floor 2: (e.g. Character profiles structure)" className="w-full px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-800 text-white focus:outline-none focus:border-[#8B5CF6] text-[11px]" />
                                <input name="f3" required placeholder="Boss Room: (e.g. Export 15,000 word draft)" className="w-full px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-800 text-white focus:outline-none focus:border-[#8B5CF6] text-[11px]" />
                              </div>

                              <div className="flex space-x-2">
                                <button type="submit" className="flex-1 py-1.5 bg-[#8B5CF6] hover:bg-[#7c4fe3] text-white text-[10px] font-bold uppercase rounded-lg transition cursor-pointer">
                                  Generate Dungeon
                                </button>
                                <button type="button" onClick={() => setActiveConvertDungeonId(null)} className="py-1.5 px-3 bg-slate-800 hover:bg-slate-700 text-slate-400 text-[10px] font-bold uppercase rounded-lg transition cursor-pointer">
                                  Cancel
                                </button>
                              </div>
                            </form>
                          )}

                          {/* Dungeon floors list */}
                          {p.isDungeon && (
                            <div className="dungeon-floors-vertical-stepper space-y-3 pt-2">
                              {[
                                { floorNum: 1, title: p.floor1Title, completed: p.floor1Completed },
                                { floorNum: 2, title: p.floor2Title, completed: p.floor2Completed },
                                { floorNum: 3, title: p.floor3Title, completed: p.floor3Completed, isBoss: true }
                              ].map((f) => {
                                const isCurrent = p.currentFloor === f.floorNum;
                                const isLocked = p.currentFloor < f.floorNum;
                                
                                return (
                                  <div 
                                    key={f.floorNum} 
                                    className={`p-3 rounded-xl border transition-all duration-300 ${
                                      isCurrent 
                                        ? 'border-[#8B5CF6]/50 bg-[#8B5CF6]/5' 
                                        : isLocked 
                                        ? 'border-slate-950 bg-slate-950/20 opacity-40 select-none' 
                                        : 'border-slate-800 bg-slate-950/60'
                                    } text-xs relative`}
                                  >
                                    {/* Floor header indicator */}
                                    <div className="flex justify-between items-center font-mono font-bold leading-none">
                                      <span className={`${f.isBoss ? 'text-red-500 font-extrabold' : 'text-[#8B5CF6]'} uppercase tracking-wider text-[10px] flex items-center`}>
                                        {f.isBoss && <span className="boss-room-indicator-node mr-1 animate-pulse">👹</span>}
                                        {f.isBoss ? 'BOSS ROOM' : `FLOOR ${f.floorNum}`}
                                      </span>
                                      <span className="text-[10px] text-slate-500">
                                        {f.completed ? '✅ CLEARED' : isLocked ? '🔒 GATED' : '▶ ACTIVE'}
                                      </span>
                                    </div>

                                    <div className="font-bold text-white mt-1.5">{f.title}</div>

                                    {/* Active floor note verification form */}
                                    {isCurrent && !f.completed && (
                                      <div className="mt-3 space-y-2 border-t border-slate-800/40 pt-3">
                                        <textarea
                                          value={dungeonFloorNotes[p.id] || ''}
                                          onChange={(e) => setDungeonFloorNotes({ ...dungeonFloorNotes, [p.id]: e.target.value })}
                                          placeholder="Milestone proof description... (min 50 characters summarizing your work for this floor)"
                                          className="w-full h-16 px-3 py-1.5 rounded-lg bg-slate-950 border border-slate-800 text-slate-200 focus:outline-none focus:border-[#8B5CF6] text-[11px]"
                                        />
                                        <div className="flex justify-between items-center text-[9px] font-mono">
                                          <span className="text-slate-500">Chars: {(dungeonFloorNotes[p.id] || '').length} / 50</span>
                                          <button
                                            onClick={async () => {
                                              const note = dungeonFloorNotes[p.id] || '';
                                              if (note.length < 50) {
                                                alert("Milestone proof insufficient. Notes must be at least 50 characters.");
                                                return;
                                              }
                                              try {
                                                const res = await apiRequest('/projects/verify-floor', {
                                                  method: 'POST',
                                                  body: JSON.stringify({ projectId: p.id, floorNum: f.floorNum, verificationText: note })
                                                });
                                                setDungeonFloorNotes({ ...dungeonFloorNotes, [p.id]: '' });
                                                
                                                if (res.dungeonCompleted) {
                                                  audioEngine.playBoot(); // System boot sweep shimmer
                                                  triggerSystemAlert({
                                                    type: 'QUEST_CLEAR',
                                                    title: 'DUNGEON CLEARED',
                                                    message: `Boss room defeated! Title unlocked: ${res.unlockedTitle}`,
                                                    subtext: '+5 Stat Points awarded'
                                                  });
                                                } else {
                                                  audioEngine.playQuestClear();
                                                  triggerSystemAlert({
                                                    type: 'QUEST_CLEAR',
                                                    title: `FLOOR ${f.floorNum} CLEARED`,
                                                    message: `Milestone cleared successfully.`,
                                                    subtext: `Floor ${f.floorNum + 1} is now open.`
                                                  });
                                                }
                                                loadData();
                                              } catch (err: any) {
                                                alert(err.message || "Failed to verify floor");
                                              }
                                            }}
                                            className="px-3 py-1 rounded bg-[#8B5CF6] hover:bg-[#7c4fe3] text-white font-extrabold uppercase rounded-md transition cursor-pointer"
                                          >
                                            Clear Floor
                                          </button>
                                        </div>
                                      </div>
                                    )}
                                  </div>
                                );
                              })}
                            </div>
                          )}
                        </div>
                      );
                    })
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>

      {/* V3 Rank Promotion Exam Modal */}
      {showExamModal && (
        <div id="rank-promotion-exam-modal" className="fixed inset-0 z-55 flex items-center justify-center bg-slate-950/85 backdrop-blur-md">
          <div className="w-full max-w-md p-8 glass-panel space-y-6 relative border border-slate-800 bg-slate-900 rounded-3xl">
            <button 
              onClick={() => setShowExamModal(false)}
              className="absolute top-4 right-4 text-slate-400 hover:text-white cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
            
            <div className="text-center space-y-2">
              <span className="px-2.5 py-0.5 rounded-full bg-[#8B5CF6]/15 text-[#8B5CF6] text-[10px] font-bold uppercase tracking-wider font-mono">
                System Advancement Bureau
              </span>
              <h3 className="text-xl font-extrabold text-white">Rank Advancement Exam</h3>
            </div>

            {!profile?.examActive ? (
              <div className="space-y-4">
                <p className="text-slate-300 text-xs leading-relaxed">
                  You have reached the level-cap ceiling. Further task experience points will remain locked at 0 XP until you prove your worth.
                </p>
                <div className="p-4 bg-slate-950/40 border border-slate-800 rounded-xl space-y-2">
                  <div className="text-[10px] font-bold text-[#8B5CF6] uppercase font-mono">Exam Trial Details</div>
                  <p className="text-slate-400 text-[11px] leading-relaxed">
                    The System Scanner will analyze your lowest-performing lifestyle path (bottleneck) and formulate a 3-day discipline challenge to balance your matrix.
                  </p>
                </div>
                <button 
                  onClick={handleStartExam}
                  className="w-full py-3 rounded-xl bg-gradient-to-r from-[#8B5CF6] to-[#60A5FA] text-white text-xs font-bold transition shadow-lg shadow-[#8B5CF6]/20 cursor-pointer"
                >
                  Accept Rank Promotion Exam Trial
                </button>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="p-4 bg-slate-950/60 border border-[#8B5CF6]/20 rounded-xl space-y-2">
                  <div className="text-[10px] font-bold text-[#8B5CF6] uppercase font-mono tracking-widest">Active Bottleneck Trial</div>
                  <div className="text-white font-bold text-sm">3-Day Lifestyle Synchronization</div>
                  <p className="text-slate-300 text-xs leading-relaxed font-mono mt-1">
                    Complete your daily bottleneck trials. Grinding Standard tasks yields 0 XP.
                  </p>
                </div>

                <div className="text-slate-400 text-[10px] leading-relaxed italic text-center font-mono">
                  [Status: Monitoring continuity parameters. Ensure all daily requirements are synced.]
                </div>

                <div className="flex space-x-3 pt-2">
                  <button 
                    onClick={() => setShowExamModal(false)}
                    className="w-1/2 py-2.5 rounded-xl bg-slate-955 border border-slate-800 text-slate-400 text-xs font-bold cursor-pointer"
                  >
                    Close Portal
                  </button>
                  <button 
                    onClick={handleCompleteExam}
                    className="w-1/2 py-2.5 rounded-xl bg-[#8B5CF6] hover:bg-[#7c4fe3] text-white text-xs font-bold transition cursor-pointer"
                  >
                    Submit Trial Proof
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* V3 Fatigue Lockout Screen */}
      {profile?.fatigueActive && (
        <div id="fatigue-lockout-blur-screen" className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/90 backdrop-blur-xl">
          <div className="w-full max-w-md p-8 glass-panel text-center space-y-6 border border-slate-800/80 bg-slate-900/95 rounded-3xl">
            <div className="space-y-2">
              <span className="px-2.5 py-0.5 rounded-full bg-red-500/10 text-red-500 text-[10px] font-bold uppercase tracking-wider font-mono animate-pulse">
                ⚠️ BURNOUT PROTECTION ENABLED
              </span>
              <h3 className="text-xl font-black text-white">Enforced Recovery Calibration</h3>
            </div>
            
            <p className="text-slate-300 text-xs leading-relaxed">
              Your focus and anchor task thresholds have exceeded safe parameters. Standard dashboard functionality is locked to prevent physical fatigue.
            </p>

            <div id="sidebar-sage-breathing-assistant-card" className="p-6 bg-slate-950/60 border border-slate-800 rounded-2xl flex flex-col items-center justify-center space-y-4">
              <div className="text-[10px] font-bold text-[#8B5CF6] uppercase font-mono tracking-widest">SAGE Box Breathing Assistant</div>
              
              {/* Box Breathing Circle Animation */}
              <div className="relative w-32 h-32 flex items-center justify-center">
                <div 
                  className={`absolute rounded-full border-4 border-[#8B5CF6]/30 transition-all duration-1000 ${
                    breathingPhase === 'IN' ? 'scale-105 border-[#8B5CF6]' : 
                    breathingPhase === 'HOLD_IN' ? 'scale-105 border-cyan-400' :
                    breathingPhase === 'OUT' ? 'scale-95 border-blue-500' :
                    'scale-95 border-indigo-500'
                  }`}
                  style={{ width: '100%', height: '100%' }}
                />
                <div className="text-center">
                  <div className="text-xs font-black text-white font-mono">{breathingPhase}</div>
                  <div className="text-2xl font-black text-[#8B5CF6] font-mono mt-1">{crisisBreathCount}s</div>
                </div>
              </div>

              <button 
                onClick={() => {
                  setCrisisBreathActive(true);
                  audioEngine.playExhale();
                }}
                disabled={crisisBreathActive}
                className="px-6 py-2 rounded-xl bg-[#8B5CF6] hover:bg-[#7c4fe3] disabled:opacity-50 text-white font-bold text-xs transition cursor-pointer"
              >
                {crisisBreathActive ? 'Calibrating...' : 'Start 60s Calm Reset'}
              </button>
            </div>

            <div className="text-[10px] text-slate-500 font-mono italic">
              [Grayscale sleep state ends in: 120 minutes]
            </div>

            {/* Simulated instant bypass to complete calm breathing for testing */}
            <button 
              onClick={handleClearFatigue}
              className="text-[10px] text-slate-500 hover:text-slate-400 underline cursor-pointer"
            >
              [Override: Force Frequencies Stabilize]
            </button>
          </div>
        </div>
      )}

      {/* V3 Shadow Roster Collapsed Deck */}
      <div id="shadow-roster-panel-footer" className="max-w-6xl mx-auto px-4 mt-8 mb-12">
        <div className="glass-panel p-6 border-slate-800 bg-slate-900/50 backdrop-blur-md rounded-2xl">
          <div className="flex justify-between items-center border-b border-slate-800 pb-3 mb-4">
            <h3 className="text-sm font-bold text-slate-300 font-mono tracking-wider flex items-center">
              👤 Shadow Roster ({shadows?.filter(s => s.active).length || 0} Soldiers Active)
            </h3>
            <span className="text-[10px] text-slate-500 font-mono">PASSIVE REWARDS ONLINE</span>
          </div>
          
          {!shadows || shadows.filter(s => s.active).length === 0 ? (
            <div className="text-center py-6 text-xs text-slate-500 italic">
              No shadow soldiers extracted yet. Maintain a 21-day streak on any daily quest to crystallize it.
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
              {shadows.filter(s => s.active).map(s => (
                <div 
                  key={s.id} 
                  className="extracted-shadow-node-active p-4 rounded-xl bg-slate-950/40 border border-slate-800 flex items-center justify-between shadow-[0_0_15px_rgba(139,92,246,0.05)] animate-pulse"
                >
                  <div>
                    <h4 className="text-white text-xs font-bold font-mono uppercase">{s.title}</h4>
                    <p className="text-[10px] text-slate-500 font-mono mt-0.5">Active automated soldier</p>
                  </div>
                  <span className="shadow-passive-xp-tag text-[9px] font-bold text-[#8B5CF6] bg-[#8B5CF6]/15 border border-[#8B5CF6]/20 px-2 py-0.5 rounded font-mono">
                    +5 XP / Day (Passive)
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
      </>
      )}

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

      {/* Camera Viewport Modal for Unified Verification */}
      {showCameraScanner && selectedQuestForVerify && (
        <CameraViewport 
          userQuestId={selectedQuestForVerify.id}
          questTitle={selectedQuestForVerify.quest.title}
          questPath={selectedQuestForVerify.quest.path || 'SCHOLAR'}
          onClose={() => setShowCameraScanner(false)}
          onCapture={(dataUrl, objectName) => {
            setCapturedImg(dataUrl);
            setDetectedObject(objectName);
            setShowCameraScanner(false);
          }}
          onVerifySuccess={() => {}}
        />
      )}

      {/* Quest Verify Modal */}
      {selectedQuestForVerify && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-md">
          <div className="w-full max-w-md p-8 glass-panel space-y-6 border border-slate-800 bg-slate-900 rounded-3xl overflow-y-auto max-h-[90vh]">
            <h3 className="text-lg font-bold text-white">Verify Quest: {selectedQuestForVerify.quest.title}</h3>

            {/* Timer initiation if needed */}
            {selectedQuestForVerify.quest.verificationType === 'TIMER' && (
              <div className="p-4 bg-slate-950/60 border border-slate-800 rounded-xl space-y-3">
                <div className="text-[10px] font-bold text-amber-400 uppercase font-mono">⚡ Focus Timer Node</div>
                {!selectedQuestForVerify.timerStartedAt ? (
                  <>
                    <p className="text-slate-400 text-[11px] leading-relaxed">
                      This task requires a focus timer. You must initiate and complete the focus block before final verification.
                    </p>
                    <button
                      onClick={() => handleStartQuestTimer(selectedQuestForVerify.id)}
                      className="w-full py-2 bg-gradient-to-r from-amber-600 to-amber-500 hover:from-amber-700 hover:to-amber-600 text-white rounded-xl text-xs font-bold transition flex items-center justify-center cursor-pointer"
                    >
                      ▶ Initiate Focus Timer
                    </button>
                  </>
                ) : (
                  <p className="text-emerald-400 font-mono text-[11px] animate-pulse">
                    ⚡ Focus Active (Started at {new Date(selectedQuestForVerify.timerStartedAt).toLocaleTimeString()}). Complete deep work before submitting.
                  </p>
                )}
              </div>
            )}

            {/* Anti-cheat image scanner proof section */}
            <div className="space-y-4">
              <label className="text-slate-400 text-xs font-medium block font-mono">
                📷 CAMERA PROOF (ANTI-CHEAT SCANNER):
              </label>
              {capturedImg ? (
                <div className="space-y-2">
                  <div className="relative aspect-video bg-slate-950 border border-slate-850 rounded-xl overflow-hidden">
                    <img src={capturedImg} alt="Camera proof" className="w-full h-full object-cover" />
                    <div className="absolute top-2 right-2 px-2 py-0.5 rounded bg-emerald-500/80 text-white font-mono text-[9px]">
                      {detectedObject.toUpperCase()} MATCHED
                    </div>
                  </div>
                  <button
                    onClick={() => setShowCameraScanner(true)}
                    className="w-full py-1.5 rounded-lg border border-slate-800 bg-slate-950 hover:text-white text-slate-400 text-xs font-bold transition cursor-pointer"
                  >
                    📷 Retake / Change Image
                  </button>
                </div>
              ) : (
                <button
                  onClick={() => setShowCameraScanner(true)}
                  className="w-full py-2.5 rounded-xl border border-cyan-500/30 bg-cyan-500/5 hover:bg-cyan-500/15 text-cyan-400 text-xs font-bold font-mono tracking-wider transition cursor-pointer flex items-center justify-center space-x-2"
                >
                  <span>📷 Launch Camera Scanner</span>
                </button>
              )}
            </div>

            {/* Reflection entry: mandatory for all daily quests */}
            <div className="space-y-4">
              <label className="text-slate-400 text-xs font-medium block">
                Write down your daily reflection / challenge prompts (min 50 chars):
                <span className="text-[10px] text-slate-500 block italic mt-1">Prompt: "Summarize what you did and what was the hardest part."</span>
              </label>
              <textarea
                value={reflectionInput}
                onChange={(e) => setReflectionInput(e.target.value)}
                className="w-full h-24 px-4 py-3 rounded-xl bg-slate-900 border border-slate-800 text-white focus:outline-none focus:border-[#8B5CF6] text-xs font-normal"
                placeholder="Today I built my Next.js client-side Web Audio Synth engine... The hardest part was tuning the lowpass filter sweep decay times..."
              />
              <div className="flex justify-between items-center text-[10px] text-slate-500 font-mono">
                <span>Characters: {reflectionInput.length} / 50</span>
                {reflectionInput.length < 50 && (
                  <span className="text-red-400">Insufficient Length</span>
                )}
              </div>
            </div>

            <div className="flex space-x-4 pt-4">
              <button 
                onClick={() => {
                  setSelectedQuestForVerify(null);
                  setCapturedImg(null);
                  setDetectedObject('');
                  setReflectionInput('');
                }} 
                className="w-1/2 py-2 rounded-xl bg-slate-900 border border-slate-800 text-slate-400 text-xs font-bold cursor-pointer"
              >
                Cancel
              </button>
              <button 
                onClick={() => handleVerify(selectedQuestForVerify.id)} 
                disabled={reflectionInput.length < 50}
                className="w-1/2 py-2 rounded-xl bg-[#8B5CF6] hover:bg-[#7c4fe3] disabled:opacity-50 disabled:cursor-not-allowed text-white text-xs font-bold cursor-pointer"
              >
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
    targetId: "xp-progress-bar-main",
    title: "The Experience Cap Barrier",
    description: "[System Guide: Upon hitting milestone levels (10, 20, 30, and 50), the level progress bar locks. Further tasks yield 0 XP until you initiate and complete a Rank Advancement Exam.]",
    badge: "Rank Exam Ceiling"
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
    targetId: "arena-clash-header-strip",
    title: "Sparring Arena Duels",
    description: "[System Guide: Challenge peers to asynchronous discipline duels. Earning verified XP pushes the live split tug-of-war bar divider to compress your opponent's block in real time.]",
    badge: "Sparring Arena"
  },
  {
    targetId: "gameplay-board",
    title: "Quest Matrix",
    description: "Your daily directive consists of 7 personalized tasks tailored to heal your bottleneck. Complete and submit reflections to verify them.",
    badge: "Daily Directive"
  },
  {
    targetId: ".verify-trigger-btn",
    title: "System Proof Capture",
    description: "[System Guide: High-value anchor tasks require automated proof capture. Tapping 'Verify' opens a frictionless camera view scanning workspace items to prevent cheating.]",
    badge: "Proof Capture"
  },
  {
    targetId: ".dungeon-card-active",
    title: "Grand Dungeons Instance",
    description: "[System Guide: Turn long-term life projects into multi-floor episodic dungeons. Higher floors are gated until previous milestone proofs clear, leading to title rewards.]",
    badge: "Grand Dungeons"
  },
  {
    targetId: "shadow-roster-panel-footer",
    title: "Shadow Roster & Extraction",
    description: "[System Guide: Flawless 21-day task streaks crystallize into Shadow Soldiers. They move to the bottom Shadow Roster to generate passive daily experience points automatically.]",
    badge: "Shadow Roster"
  },
  {
    targetId: "fatigue-lockout-blur-screen",
    title: "Burnout Fatigue Lockout",
    description: "[System Guide: Over-exertion locks the dashboard in monochromatic grayscale. Standard list access is blocked until you run a deep SAGE Box Breathing calibration cycle.]",
    badge: "Fatigue Lockout"
  },
  {
    targetId: "distraction-stabilizer",
    title: "Emergency Stabilizer",
    description: "Feeling an overwhelming urge to scroll short-form feeds? Tap this emergency button immediately to start a guided box-breathing stabilizer.",
    badge: "Crisis Stabilizer"
  },
  {
    targetId: "ai-sidebar-trigger",
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

const PHASE1_TOUR_STEPS = [
  {
    targetId: "dashboard-grid",
    title: "Your Lifecycle Dashboard",
    description: "[System Guide: Your real-world lifecycle parameters have been digitized. This is your active daily workspace to track and manage your growth.]",
    badge: "System Guide"
  },
  {
    targetId: "archetype-cards-container",
    title: "The Four Paths",
    description: "[System Guide: Your evolution is divided into four unique paths: Scholar, Warrior, Sage, and Creator. Keeping these tracks balanced prevents your stats from decaying.]",
    badge: "System Guide"
  },
  {
    targetId: "ai-sidebar-trigger",
    title: "Your Cognitive Companion",
    description: "[System Guide: The system's cognitive core resides here. Expand this panel whenever you face execution friction or need a clear strategy blueprint.]",
    badge: "System Guide"
  }
];

const PROOF_CAPTURE_TOUR_STEPS = [
  {
    targetId: ".verify-trigger-btn",
    title: "Real-World Validation",
    description: "[System Guide: High-value operations require absolute verification. The System demands a quick real-world proof capture to award experience points.]",
    badge: "System Guide"
  },
  {
    targetId: "camera-viewport-modal",
    title: "Zero-Friction Framing",
    description: "[System Guide: The camera screen handles verification automatically. Simply hold your physical proof item inside the box boundaries.]",
    badge: "System Guide"
  },
  {
    targetId: "ai-bounding-box-overlay",
    title: "Smart Object Matching",
    description: "[System Guide: The built-in AI will track your item in real-time. Once the bounding box turns green, the system will instantly process your proof.]",
    badge: "System Guide"
  },
  {
    targetId: "record-of-trials-link",
    title: "The Record of Trials",
    description: "[System Guide: Verification approved. Your high-contrast proof has been logged inside your private Record of Trials archive.]",
    badge: "System Guide"
  }
];

const GRAND_DUNGEONS_TOUR_STEPS = [
  {
    targetId: ".dungeon-card-active",
    title: "Dungeon Construction",
    description: "[System Guide: Your real-world project tracking card has successfully evolved into an active Grand Dungeon Instance.]",
    badge: "System Guide"
  },
  {
    targetId: ".dungeon-floors-vertical-stepper",
    title: "Gated Floor Steps",
    description: "[System Guide: Milestones are organized into individual Floors. Higher levels remain greyed out and locked until the previous floor clears its proof checks.]",
    badge: "System Guide"
  },
  {
    targetId: ".boss-room-indicator-node",
    title: "The Ultimate Boss Room",
    description: "[System Guide: The final segment contains the Boss Room. Clearing it requires your definitive project completion, like launching a live deployment or submitting a manuscript.]",
    badge: "System Guide"
  },
  {
    targetId: ".user-rank-display-badge",
    title: "Legendary Title Rewards",
    description: "[System Guide: Successfully clearing a project dungeon awards your character massive attribute metrics and a permanent, custom profile title.]",
    badge: "System Guide"
  }
];

const SPARRING_ARENA_TOUR_STEPS = [
  {
    targetId: "arena-clash-header-strip",
    title: "Entering the Arena",
    description: "[System Guide: An active asynchronous Duel Instance has locked onto your dashboard. Distracting social chatter is completely removed—sheer execution dictates victory.]",
    badge: "System Guide"
  },
  {
    targetId: ".duel-tug-bar-divider",
    title: "The Live Tug-of-War Bar",
    description: "[System Guide: This split bar tracks progress in real-time. Earning verified experience points pushes the divider forward, physically compressing your opponent's side of the bar.]",
    badge: "System Guide"
  },
  {
    targetId: ".stance-selector-button-group",
    title: "Adjusting Your Combat Stance",
    description: "[System Guide: Select an active Combat Stance to adjust your modifiers for the day based on your expected schedule and workflow.]",
    badge: "System Guide"
  },
  {
    targetId: ".duel-countdown-timestamp",
    title: "Normalized Countdown Clocks",
    description: "[System Guide: The duel tracks synchronization metrics using localized timezone alignment variables. Maintain performance continuity until the timer hits zero.]",
    badge: "System Guide"
  }
];

const SHADOW_EXTRACTION_TOUR_STEPS = [
  {
    targetId: ".extracted-shadow-node-active",
    title: "Shadow Extraction",
    description: "[System Guide: Flawless habit continuity has crystallized this task. The system is extracting its shadow configuration to automate your rewards.]",
    badge: "System Guide"
  },
  {
    targetId: "shadow-roster-panel-footer",
    title: "The Shadow Roster",
    description: "[System Guide: This habit now exits your main active daily list, keeping your dashboard clean. It moves down to your permanent Shadow Roster.]",
    badge: "System Guide"
  },
  {
    targetId: ".shadow-passive-xp-tag",
    title: "Passive Experience Generation",
    description: "[System Guide: While active, shadows feed your profile a passive drip of daily experience points. Warning: Letting your consistency drop significantly will shatter your shadows.]",
    badge: "System Guide"
  }
];

const FATIGUE_LOCKOUT_TOUR_STEPS = [
  {
    targetId: "fatigue-lockout-blur-screen",
    title: "Enforced Recovery Overrides",
    description: "[System Guide: High-intensity neural and task focus execution limits have crossed safety bounds. An enforced recovery override has engaged to protect you from burnout.]",
    badge: "System Guide"
  },
  {
    targetId: ".global-xp-multiplier-display",
    title: "Experience Suppression Caps",
    description: "[System Guide: Core task experience generation has been throttled to exactly 0%. The system will block further grinding metrics for the next 120 minutes.]",
    badge: "System Guide"
  },
  {
    targetId: "sidebar-sage-breathing-assistant-card",
    title: "Controlled Deep Re-entry",
    description: "[System Guide: Deep, restful recovery is a non-negotiable metric for long-term real-world evolution. Use the SAGE Box Breathing ring to normalize your stats and clear your fatigue state.]",
    badge: "System Guide"
  }
];

const RANK_EXAM_TOUR_STEPS = [
  {
    targetId: "xp-progress-bar-main",
    title: "The Experience Cap Barrier",
    description: "[System Guide: You have reached a strict level-cap boundary threshold. Further incoming standard task experience points remain locked.]",
    badge: "System Guide"
  },
  {
    targetId: "rank-promotion-exam-modal",
    title: "Accessing the Promotion Exam",
    description: "[System Guide: The system's automated scanner has identified your core lifestyle bottleneck. To break the ceiling, you must initiate a multi-day Rank Promotion Exam.]",
    badge: "System Guide"
  },
  {
    targetId: ".character-rank-tier-text",
    title: "Global Tier Evolution",
    description: "[System Guide: Successfully surviving the exam trial removes the level block and evolves your global tier rank permanently. Prepare your workspace before starting.]",
    badge: "System Guide"
  }
];
