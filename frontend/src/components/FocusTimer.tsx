"use client";
import React, { useState, useEffect } from 'react';
import { apiRequest } from '../lib/api';
import { Play, Pause, RotateCcw, Volume2, VolumeX } from 'lucide-react';

interface TimerProps {
  onSessionComplete?: () => void;
}

export default function FocusTimer({ onSessionComplete }: TimerProps) {
  const [seconds, setSeconds] = useState(1500);
  const [isActive, setIsActive] = useState(false);
  const [sessionCount, setSessionCount] = useState(0);

  useEffect(() => {
    let interval: any = null;
    if (isActive && seconds > 0) {
      interval = setInterval(() => setSeconds(s => s - 1), 1000);
    } else if (seconds === 0) {
      setIsActive(false);
      handleComplete();
    }
    return () => clearInterval(interval);
  }, [isActive, seconds]);

  const handleComplete = async () => {
    try {
      setSessionCount(c => c + 1);
      // attack boss and log study
      await apiRequest('/bosses/attack', {
        method: 'POST',
        body: JSON.stringify({ actionType: 'TIMER', focusMinutes: 25 })
      });
      alert("🌳 Sapling planted! +25 mins of focus added to your Forest. Damage dealt to boss!");
      if (onSessionComplete) onSessionComplete();
      resetTimer();
    } catch (e) {
      console.error(e);
    }
  };

  const toggle = () => setIsActive(!isActive);
  const resetTimer = () => {
    setIsActive(false);
    setSeconds(1500);
  };

  const format = (sec: number) => {
    const m = Math.floor(sec / 60);
    const s = sec % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  // Renders the Forest trees based on sessionCount
  const renderForest = () => {
    const trees = [];
    for (let i = 0; i < Math.max(1, sessionCount); i++) {
      trees.push("🌲");
    }
    return trees.join(" ");
  };

  return (
    <div className="flex flex-col items-center space-y-6">
      <div className="w-64 h-64 rounded-full border-4 border-[#8B5CF6]/30 flex flex-col items-center justify-center bg-slate-900/40 relative shadow-xl shadow-[#8B5CF6]/5">
        <span className="text-5xl font-extrabold text-white tabular-nums">{format(seconds)}</span>
      </div>

      <div className="flex space-x-4">
        <button onClick={toggle} className="px-6 py-2.5 rounded-xl bg-[#8B5CF6] hover:bg-[#7c4fe3] text-white font-bold transition">
          {isActive ? "Pause" : "Start Focus"}
        </button>
        <button onClick={resetTimer} className="px-6 py-2.5 rounded-xl bg-slate-900 border border-slate-800 text-slate-400 hover:text-white transition">
          Reset
        </button>
      </div>

      {/* Focus Forest Grid Display */}
      <div className="p-4 glass-panel w-full max-w-sm text-center">
        <span className="text-slate-500 text-[10px] uppercase font-bold block mb-2">Focus Forest (Daily Grid)</span>
        <div className="text-2xl tracking-widest transition-all duration-300">{renderForest()}</div>
        <p className="text-[10px] text-slate-400 mt-2">1 Session = Sapling. 10 Sessions = Small Tree. 50 Sessions = Forest.</p>
      </div>
    </div>
  );
}
