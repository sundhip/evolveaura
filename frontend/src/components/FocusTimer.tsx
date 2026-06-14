"use client";
import React, { useState, useEffect, useRef } from 'react';
import { apiRequest } from '../lib/api';
import { Play, Pause, RotateCcw, AlertTriangle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { audioEngine } from '../lib/AudioEngine';

interface TimerProps {
  onSessionComplete?: () => void;
}

export default function FocusTimer({ onSessionComplete }: TimerProps) {
  const [seconds, setSeconds] = useState(1500);
  const [isActive, setIsActive] = useState(false);
  const [sessionCount, setSessionCount] = useState(0);

  // Checkpoint states
  const [checkpointTime, setCheckpointTime] = useState<number | null>(null);
  const [showCheckpoint, setShowCheckpoint] = useState(false);
  const [checkpointTimer, setCheckpointTimer] = useState(60);
  const [checkpointTarget, setCheckpointTarget] = useState<number[]>([]);
  const [checkpointInput, setCheckpointInput] = useState<number[]>([]);
  const showCheckpointRef = useRef(false);

  useEffect(() => {
    showCheckpointRef.current = showCheckpoint;
  }, [showCheckpoint]);

  // Main countdown timer loop
  useEffect(() => {
    let interval: any = null;
    if (isActive && seconds > 0) {
      interval = setInterval(() => {
        if (showCheckpointRef.current) {
          return; // Freeze main countdown while checkpoint is active
        }
        
        setSeconds((prev) => {
          if (prev <= 1) {
            clearInterval(interval);
            setIsActive(false);
            handleComplete();
            return 0;
          }

          // Check if we hit the random checkpoint time
          const elapsed = 1500 - prev + 1;
          if (checkpointTime && elapsed === checkpointTime) {
            triggerCheckpoint();
          }

          return prev - 1;
        });
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isActive, seconds, checkpointTime]);

  // Checkpoint countdown timer
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

  const triggerCheckpoint = () => {
    const target = [1, 2, 3].sort(() => Math.random() - 0.5);
    setCheckpointTarget(target);
    setCheckpointInput([]);
    setCheckpointTimer(60);
    setShowCheckpoint(true);
    audioEngine.playBreach(); // play warning alarm
  };

  const handleCheckpointFailure = (reason: string) => {
    setShowCheckpoint(false);
    resetTimer();
    audioEngine.playBreach();
    alert(`Focus breached! Active presence verification failed. Focus session reset. Reason: ${reason}`);
  };

  const handleCheckpointNodeClick = (num: number) => {
    audioEngine.playNavTick();
    const nextInput = [...checkpointInput, num];
    const isCorrect = nextInput.every((val, index) => val === checkpointTarget[index]);
    
    if (!isCorrect) {
      setCheckpointInput([]);
      audioEngine.playBreach();
      return;
    }
    
    setCheckpointInput(nextInput);
    if (nextInput.length === checkpointTarget.length) {
      setShowCheckpoint(false);
      audioEngine.playSuccess();
    }
  };

  const handleComplete = async () => {
    try {
      setSessionCount(c => c + 1);
      // attack boss and log study
      await apiRequest('/bosses/attack', {
        method: 'POST',
        body: JSON.stringify({ actionType: 'TIMER', focusMinutes: 25 })
      });
      audioEngine.playSuccess();
      alert("🌳 Sapling planted! +25 mins of focus added to your Forest. Damage dealt to boss!");
      if (onSessionComplete) onSessionComplete();
      resetTimer();
    } catch (e) {
      console.error(e);
    }
  };

  const toggle = () => {
    audioEngine.playNavTick();
    if (!isActive && !checkpointTime) {
      // Generate random checkpoint time between 5 and 20 minutes (300 to 1200 seconds)
      const randomTime = Math.floor(300 + Math.random() * 900);
      setCheckpointTime(randomTime);
    }
    setIsActive(!isActive);
  };

  const resetTimer = () => {
    audioEngine.playNavTick();
    setIsActive(false);
    setSeconds(1500);
    setCheckpointTime(null);
    setShowCheckpoint(false);
  };

  const format = (sec: number) => {
    const m = Math.floor(sec / 60);
    const s = sec % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  const renderForest = () => {
    const trees = [];
    for (let i = 0; i < Math.max(1, sessionCount); i++) {
      trees.push("🌲");
    }
    return trees.join(" ");
  };

  return (
    <div className="flex flex-col items-center space-y-6 relative">
      <div className="w-64 h-64 rounded-full border-4 border-[#8B5CF6]/30 flex flex-col items-center justify-center bg-slate-900/40 relative shadow-xl shadow-[#8B5CF6]/5">
        <span className="text-5xl font-extrabold text-white tabular-nums">{format(seconds)}</span>
      </div>

      <div className="flex space-x-4">
        <button onClick={toggle} className="px-6 py-2.5 rounded-xl bg-[#8B5CF6] hover:bg-[#7c4fe3] text-white font-bold transition cursor-pointer">
          {isActive ? "Pause" : "Start Focus"}
        </button>
        <button onClick={resetTimer} className="px-6 py-2.5 rounded-xl bg-slate-900 border border-slate-800 text-slate-400 hover:text-white transition cursor-pointer">
          Reset
        </button>
      </div>

      {/* Focus Forest Grid Display */}
      <div className="p-4 glass-panel w-full max-w-sm text-center">
        <span className="text-slate-500 text-[10px] uppercase font-bold block mb-2">Focus Forest (Daily Grid)</span>
        <div className="text-2xl tracking-widest transition-all duration-300">{renderForest()}</div>
        <p className="text-[10px] text-slate-400 mt-2">1 Session = Sapling. 10 Sessions = Small Tree. 50 Sessions = Forest.</p>
      </div>

      {/* Random Checkpoint Modal */}
      <AnimatePresence>
        {showCheckpoint && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[1010] bg-slate-950/95 backdrop-blur-md flex flex-col items-center justify-center text-center space-y-6"
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
                        : 'bg-[#8B5CF6]/10 border-[#8B5CF6]/40 text-[#8B5CF6] hover:bg-[#8B5CF6] hover:text-white hover:scale-105'
                    }`}
                  >
                    Node {num}
                  </button>
                );
              })}
            </div>

            <div className="text-[10px] text-slate-500 font-mono italic">
              Verification failure aborts the focus session.
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
