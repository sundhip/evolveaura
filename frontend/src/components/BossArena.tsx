// Live Focus Arena Overlay for Weekly Boss Battles
"use client";
import React, { useEffect, useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Shield, ShieldAlert, Zap, AlertTriangle, Swords, Compass } from 'lucide-react';
import { apiRequest } from '../lib/api';
import { triggerSystemAlert } from './SystemAlerts';
import { audioEngine } from '../lib/AudioEngine';

interface BossArenaProps {
  bossProgress: any; // userBossProgress object
  profile: any;
  onVictory: (data: any) => void;
  onDefeat: (data: any) => void;
  onClose: () => void;
  isTrial?: boolean;
}

export default function BossArena({ bossProgress, profile, onVictory, onDefeat, onClose, isTrial = false }: BossArenaProps) {
  const boss = isTrial ? { name: 'RANK ASCENSION TRIAL', description: 'Complete a consecutive 90-minute study session with absolute zero tab-switching violations to ascend.' } : bossProgress.boss;
  const selectedTier = isTrial ? 4 : bossProgress.selectedTier;
  
  // Calculate initial Focus Shield HP based on VIT: 10 VIT = 3 HP, 11 VIT = 4 HP, 12+ VIT = 5 HP.
  // In trial mode, HP is strictly 1 (absolute zero tab-switching violations).
  const maxShieldHP = isTrial ? 1 : Math.min(5, Math.max(3, 3 + (profile.statVIT - 10)));
  const [shieldHP, setShieldHP] = useState(maxShieldHP);
  
  // Determine duration based on tier: Tier 1 = 30m, Tier 2 = 60m, Tier 3 = 120m, Trial = 90m
  let totalSeconds = 30 * 60;
  if (isTrial) totalSeconds = 90 * 60;
  else if (selectedTier === 2) totalSeconds = 60 * 60;
  else if (selectedTier === 3) totalSeconds = 120 * 60;

  const [timeLeft, setTimeLeft] = useState(totalSeconds);
  const [isFainting, setIsFainting] = useState(false);
  const [isVictory, setIsVictory] = useState(false);
  const [shakeScreen, setShakeScreen] = useState(false);
  const [isDevSkipped, setIsDevSkipped] = useState(false);
  const timerRef = useRef<any>(null);

  // Checkpoint states
  const [checkpointTimes, setCheckpointTimes] = useState<number[]>([]);
  const [showCheckpoint, setShowCheckpoint] = useState(false);
  const [checkpointTimer, setCheckpointTimer] = useState(60);
  const [checkpointTarget, setCheckpointTarget] = useState<number[]>([]);
  const [checkpointInput, setCheckpointInput] = useState<number[]>([]);
  const showCheckpointRef = useRef(false);

  useEffect(() => {
    showCheckpointRef.current = showCheckpoint;
  }, [showCheckpoint]);

  // Initialize and run the timer
  useEffect(() => {
    // Start weekend high-tempo battle synth music if applicable
    audioEngine.startBattleMusic();

    // Call start endpoint to activate in DB
    if (!isTrial) {
      apiRequest('/bosses/start-quest', { method: 'POST' }).catch((e) => {
        console.error("Failed to start boss quest in database:", e);
      });
    }

    triggerSystemAlert({
      type: 'BOSS_ENCOUNTER',
      title: isTrial ? `RANK UP TRIAL ENGAGED` : `BATTLE ENGAGED: TIER ${selectedTier}`,
      message: isTrial ? `Breach limits! Complete 90 minutes of absolute concentration.` : `The ${boss.name} looms. Maintain absolute focus for ${Math.round(totalSeconds / 60)} minutes.`,
      subtext: isTrial ? `Focus Shield Capacity: 1 HP (Strict Mode) | Anti-cheat Active.` : `Focus Shield Capacity: ${maxShieldHP} HP | Anti-cheat Active.`
    });

    // Generate random checkpoint times (e.g., one checkpoint per 20-30 minutes)
    const times: number[] = [];
    const sessionMinutes = totalSeconds / 60;
    const numCheckpoints = Math.max(1, Math.floor(sessionMinutes / 25));
    for (let i = 0; i < numCheckpoints; i++) {
      const segment = totalSeconds / numCheckpoints;
      const min = i * segment + 60;
      const max = (i + 1) * segment - 60;
      const randomTime = Math.floor(min + Math.random() * (max - min));
      times.push(randomTime);
    }
    setCheckpointTimes(times);

    timerRef.current = setInterval(() => {
      setTimeLeft((prev) => {
        if (showCheckpointRef.current) {
          return prev; // Freeze main countdown during active checkpoints
        }
        if (prev <= 1) {
          clearInterval(timerRef.current);
          handleVictoryResolution();
          return 0;
        }

        const elapsed = totalSeconds - prev + 1;
        if (times.includes(elapsed)) {
          // Trigger synapse checkpoint
          const target = [1, 2, 3].sort(() => Math.random() - 0.5);
          setCheckpointTarget(target);
          setCheckpointInput([]);
          setCheckpointTimer(60);
          setShowCheckpoint(true);
          audioEngine.playBreach();
        }

        return prev - 1;
      });
    }, 1000);

    return () => {
      clearInterval(timerRef.current);
      audioEngine.stopBattleMusic();
    };
  }, []);

  // Monitor Window Visibility and Blur
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.hidden) {
        handleBreachDetected("Tab switch / Window minimization detected.");
      }
    };

    const handleWindowBlur = () => {
      handleBreachDetected("Window focus lost (tab variation / system popup).");
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    window.addEventListener('blur', handleWindowBlur);

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('blur', handleWindowBlur);
    };
  }, [shieldHP]);

  // Checkpoint countdown timer and validation
  useEffect(() => {
    let t: any = null;
    if (showCheckpoint && checkpointTimer > 0) {
      t = setInterval(() => {
        setCheckpointTimer((prev) => {
          if (prev <= 1) {
            clearInterval(t);
            handleCheckpointFailure("Verification timed out.");
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => clearInterval(t);
  }, [showCheckpoint, checkpointTimer]);

  const handleCheckpointFailure = (reason: string) => {
    setShowCheckpoint(false);
    handleBreachDetected(`Checkpoint failed: ${reason}`);
  };

  const handleCheckpointNodeClick = (num: number) => {
    audioEngine.playNavTick();
    const nextInput = [...checkpointInput, num];
    
    // Check correctness
    const isCorrect = nextInput.every((val, index) => val === checkpointTarget[index]);
    
    if (!isCorrect) {
      // Wrong! Reset and play alarm sound
      setCheckpointInput([]);
      audioEngine.playBreach();
      return;
    }
    
    setCheckpointInput(nextInput);
    
    if (nextInput.length === checkpointTarget.length) {
      // Success!
      setShowCheckpoint(false);
      triggerSystemAlert({
        type: 'QUEST_CLEAR',
        title: 'VERIFICATION SUCCESSFUL',
        message: 'Active focus presence verified.',
        subtext: 'Resuming focus timer.'
      });
      audioEngine.playSuccess();
    }
  };

  const handleBreachDetected = (reason: string) => {
    if (isFainting || isVictory) return;

    setShakeScreen(true);
    setTimeout(() => setShakeScreen(false), 500);

    setShieldHP((prev) => {
      const nextHP = prev - 1;
      
      triggerSystemAlert({
        type: 'BREACH',
        title: 'WARNING: FOCUS BREACHED',
        message: `${reason} Boss launched counter-attack!`,
        subtext: `Focus Shield HP: ${nextHP}/${maxShieldHP} remaining.`
      });

      if (nextHP <= 0) {
        clearInterval(timerRef.current);
        handleFaintResolution();
        return 0;
      }
      return nextHP;
    });
  };

  const handleFaintResolution = async () => {
    setIsFainting(true);
    audioEngine.stopBattleMusic();
    try {
      if (isTrial) {
        setTimeout(() => {
          onDefeat(null);
        }, 3000);
        return;
      }
      const res = await apiRequest('/bosses/fail-quest', { method: 'POST' });
      setTimeout(() => {
        onDefeat(res);
      }, 3000);
    } catch (e) {
      console.error("Failed to sync defeat:", e);
      onClose();
    }
  };

  const handleVictoryResolution = async () => {
    setIsVictory(true);
    audioEngine.stopBattleMusic();
    audioEngine.playLevelUp();
    try {
      if (isTrial) {
        const res = await apiRequest('/profile/ascend-rank', {
          method: 'POST',
          body: JSON.stringify({ devBypass: isDevSkipped })
        });
        triggerSystemAlert({
          type: 'QUEST_CLEAR',
          title: 'RANK ASCENDED',
          message: `Successfully ascended to Rank ${res.profile.auraRank}!`,
          subtext: `New Level: ${res.profile.currentLevel}`
        });
        setTimeout(() => {
          onVictory(res);
        }, 4000);
        return;
      }
      const res = await apiRequest('/bosses/complete-quest', {
        method: 'POST',
        body: JSON.stringify({ devBypass: isDevSkipped })
      });
      
      triggerSystemAlert({
        type: 'QUEST_CLEAR',
        title: isDevSkipped ? 'DEV BYPASS ACTIVATED' : 'VICTORY ACHIEVED',
        message: isDevSkipped ? `Weekly Boss ${boss.name} bypassed (skip penalty applied).` : `Weekly Boss ${boss.name} defeated!`,
        subtext: isDevSkipped ? `Allocating ${res.xpGained} XP to status.` : `Allocating +${res.xpGained} XP to status.`
      });

      setTimeout(() => {
        onVictory(res);
      }, 4000);
    } catch (e) {
      console.error("Failed to sync victory:", e);
      onClose();
    }
  };

  const handleForfeit = () => {
    const confirmForfeit = window.confirm("Are you sure you want to forfeit? This will cause you to faint, heal the boss by 15%, and reset your timer.");
    if (confirmForfeit) {
      handleFaintResolution();
    }
  };

  // Dev Speed-up hack to test resolutions (only visible in development)
  const devFastForward = () => {
    setIsDevSkipped(true);
    setTimeLeft(5);
  };

  const minutes = Math.floor(timeLeft / 60);
  const seconds = timeLeft % 60;
  const progressPercent = ((totalSeconds - timeLeft) / totalSeconds) * 100;

  return (
    <div className={`fixed inset-0 z-[999] flex flex-col items-center justify-center bg-slate-950/95 backdrop-blur-2xl transition-all duration-300 ${shakeScreen ? 'animate-shake' : ''}`}>
      {/* Cinematic Red Ambient Shroud */}
      <div className="absolute inset-0 bg-radial-gradient from-red-950/15 via-transparent to-black/90 pointer-events-none" />

      {/* Main Container */}
      <div className="w-full max-w-2xl px-6 relative z-10 text-center space-y-8">
        
        {/* Boss Header */}
        <div className="space-y-2">
          <div className="flex items-center justify-center space-x-2">
            <span className="w-2.5 h-2.5 rounded-full bg-red-600 animate-ping" />
            <span className="text-[10px] font-black text-red-500 uppercase tracking-widest font-mono">GATE OF TRIALS ACTIVATED</span>
          </div>
          <h2 className="text-3xl font-black text-white tracking-wide uppercase font-mono drop-shadow-[0_0_15px_rgba(239,68,68,0.2)]">
            {boss.name}
          </h2>
          <p className="text-slate-400 text-xs italic">
            "{boss.description}"
          </p>
        </div>

        {/* Boss HP Bar */}
        <div className="space-y-1 bg-slate-900/50 border border-slate-800/80 p-4 rounded-2xl max-w-md mx-auto">
          <div className="flex justify-between text-xs font-semibold font-mono">
            <span className="text-slate-400">Boss HP</span>
            <span className="text-red-500 font-black">
              {isVictory ? '0' : bossProgress.currentHP} / {boss.maxHP}
            </span>
          </div>
          <div className="w-full h-3 bg-slate-950 rounded-full overflow-hidden border border-slate-800">
            <motion.div
              className="h-full bg-gradient-to-r from-red-700 to-red-500"
              initial={{ width: `${(bossProgress.currentHP / boss.maxHP) * 100}%` }}
              animate={{ width: isVictory ? '0%' : `${(bossProgress.currentHP / boss.maxHP) * 100}%` }}
              transition={{ duration: 0.8 }}
            />
          </div>
        </div>

        {/* Live Timer Circle */}
        <div className="relative w-64 h-64 mx-auto flex items-center justify-center">
          {/* Neon background circle */}
          <div className="absolute inset-0 rounded-full bg-red-950/10 border border-slate-800/80" />
          
          {/* Radial Progress */}
          <svg className="w-full h-full transform -rotate-90">
            <circle
              cx="128"
              cy="128"
              r="112"
              className="stroke-slate-900"
              strokeWidth="8"
              fill="transparent"
            />
            <motion.circle
              cx="128"
              cy="128"
              r="112"
              className="stroke-red-600"
              strokeWidth="8"
              fill="transparent"
              strokeDasharray={703.7}
              initial={{ strokeDashoffset: 703.7 }}
              animate={{ strokeDashoffset: 703.7 - (703.7 * progressPercent) / 100 }}
              transition={{ duration: 0.5, ease: 'linear' }}
            />
          </svg>

          {/* Time digits */}
          <div className="absolute flex flex-col items-center justify-center space-y-1">
            <div className="text-5xl font-black text-white font-mono tracking-tighter tabular-nums">
              {String(minutes).padStart(2, '0')}:{String(seconds).padStart(2, '0')}
            </div>
            <div className="text-[10px] font-bold text-slate-500 uppercase tracking-widest font-mono">
              Matrix Focus Locked
            </div>
          </div>
        </div>

        {/* Active Focus Shield (User HP) */}
        <div className="space-y-2 max-w-sm mx-auto">
          <div className="text-xs font-black text-slate-400 uppercase tracking-wider font-mono">
            🛡️ Focus Shield (Active HP)
          </div>
          <div className="flex justify-center space-x-2">
            {Array.from({ length: maxShieldHP }).map((_, idx) => {
              const active = idx < shieldHP;
              return (
                <motion.div
                  key={idx}
                  initial={{ scale: 1 }}
                  animate={active ? { scale: [1, 1.2, 1] } : { scale: 0.8, opacity: 0.3 }}
                  className={`w-10 h-10 rounded-xl border flex items-center justify-center ${
                    active
                      ? 'bg-amber-500/10 border-amber-500/50 text-amber-400 shadow-[0_0_10px_rgba(245,158,11,0.2)]'
                      : 'bg-slate-900 border-slate-850 text-slate-600'
                  }`}
                >
                  <Shield className={`w-5 h-5 ${active ? 'fill-amber-500/20' : ''}`} />
                </motion.div>
              );
            })}
          </div>
          <p className="text-[10px] text-slate-500 italic">
            VIT allocation yields higher shields. Tab blurs trigger counter-attacks.
          </p>
        </div>

        {/* Controls */}
        <div className="flex justify-center items-center space-x-4 pt-4">
          <button
            onClick={handleForfeit}
            className="px-6 py-2.5 rounded-xl border border-red-500/20 bg-red-950/20 text-red-400 text-xs font-bold uppercase tracking-wider hover:bg-red-950/40 transition cursor-pointer"
          >
            Forfeit Run
          </button>

          {/* Dev button (ONLY visible when running locally on localhost) */}
          {typeof window !== 'undefined' && (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') && (
            <button
              onClick={devFastForward}
              className="px-4 py-2 rounded-xl bg-slate-900 border border-slate-800 text-slate-400 text-[10px] font-bold uppercase tracking-wider hover:text-white hover:border-slate-700 transition"
            >
              ⚡ Dev Skip
            </button>
          )}
        </div>
      </div>

      {/* Screen Shake Animations Styles */}
      <style jsx global>{`
        @keyframes shake {
          0%, 100% { transform: translate(0, 0); }
          10%, 30%, 50%, 70%, 90% { transform: translate(-8px, -4px); }
          20%, 40%, 60%, 80% { transform: translate(8px, 4px); }
        }
        .animate-shake {
          animation: shake 0.5s ease-in-out;
        }
      `}</style>

      {/* Full-Screen Fainting Overlay */}
      <AnimatePresence>
        {isFainting && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="fixed inset-0 z-[1000] bg-black/90 flex flex-col items-center justify-center text-center space-y-6"
          >
            <div className="w-16 h-16 rounded-full bg-red-600/10 border border-red-500/40 flex items-center justify-center text-red-500 animate-pulse">
              <ShieldAlert className="w-10 h-10" />
            </div>
            <div className="space-y-2">
              <h1 className="text-3xl font-black text-red-600 tracking-wider font-mono uppercase">
                YOU HAVE FAINTED
              </h1>
              <p className="text-slate-400 text-sm max-w-sm mx-auto leading-relaxed px-4">
                Your Focus Shield depleted entirely. The timer was aborted, and the boss recovered 15% HP. Return when your vitality is restored.
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Full-Screen Victory Overlay */}
      <AnimatePresence>
        {isVictory && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="fixed inset-0 z-[1000] bg-slate-950 flex flex-col items-center justify-center text-center space-y-6"
          >
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: [0, 1.2, 1] }}
              transition={{ duration: 0.6 }}
              className="w-20 h-20 rounded-full bg-amber-500/15 border-2 border-amber-400 flex items-center justify-center text-amber-400 shadow-[0_0_30px_rgba(245,158,11,0.4)]"
            >
              <Swords className="w-10 h-10" />
            </motion.div>
            <div className="space-y-2">
              <motion.h1
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.4 }}
                className="text-4xl font-black text-amber-400 tracking-widest font-mono uppercase"
              >
                BOSS ELIMINATED
              </motion.h1>
              <motion.p
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.6 }}
                className="text-slate-400 text-sm max-w-sm mx-auto font-medium"
              >
                You successfully sustained your focus block to clear the trial. Experience points and streak allocations are updating...
              </motion.p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Random Checkpoint Modal */}
      <AnimatePresence>
        {showCheckpoint && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[1010] bg-slate-950/90 backdrop-blur-md flex flex-col items-center justify-center text-center space-y-6"
          >
            <div className="w-16 h-16 rounded-full bg-amber-500/10 border border-amber-500/40 flex items-center justify-center text-amber-500 animate-pulse">
              <AlertTriangle className="w-8 h-8" />
            </div>
            
            <div className="space-y-2 max-w-sm px-4">
              <h2 className="text-xl font-black text-amber-400 tracking-wider font-mono uppercase animate-pulse">
                SYNAPSE CHECKPOINT
              </h2>
              <p className="text-slate-400 text-xs leading-relaxed">
                Confirm your presence in the matrix. Click the nodes in the exact sequence requested within 60 seconds:
              </p>
              <div className="font-mono text-sm font-bold text-white bg-slate-900 border border-slate-800 p-2.5 rounded-xl mt-2">
                ORDER: {checkpointTarget.map((t, idx) => (
                  <span key={idx} className="mx-1 px-2.5 py-1 rounded bg-[#8B5CF6]/20 border border-[#8B5CF6]/30 text-[#8B5CF6]">
                    Node {t}
                  </span>
                ))}
              </div>
            </div>

            {/* Checkpoint timer */}
            <div className="text-3xl font-black text-red-500 font-mono tabular-nums">
              {checkpointTimer}s Remaining
            </div>

            {/* Node clickable options */}
            <div className="flex space-x-4">
              {[1, 2, 3].map((num) => {
                const isClicked = checkpointInput.includes(num);
                return (
                  <button
                    key={num}
                    onClick={() => handleCheckpointNodeClick(num)}
                    disabled={isClicked}
                    className={`w-14 h-14 rounded-2xl border flex items-center justify-center font-bold text-sm transition-all duration-200 cursor-pointer ${
                      isClicked
                        ? 'bg-slate-900 border-slate-800 text-slate-600'
                        : 'bg-[#8B5CF6]/10 border-[#8B5CF6]/40 text-[#8B5CF6] hover:bg-[#8B5CF6] hover:text-white hover:scale-105 shadow-md shadow-[#8B5CF6]/10'
                    }`}
                  >
                    Node {num}
                  </button>
                );
              })}
            </div>

            <div className="text-[10px] text-slate-500 font-mono italic">
              Verification failure triggers structural shield decay.
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
