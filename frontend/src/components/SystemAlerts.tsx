// RPG-Style High-Fidelity Alert Notification Suite
"use client";
import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { audioEngine } from '../lib/AudioEngine';
import { Shield, CheckCircle, AlertTriangle } from 'lucide-react';

export interface AlertDetail {
  id: string;
  type: 'QUEST_CLEAR' | 'BREACH' | 'BOSS_ENCOUNTER';
  title: string;
  message: string;
  subtext?: string;
  duration?: number;
}

export function triggerSystemAlert(detail: Omit<AlertDetail, 'id'>) {
  if (typeof window !== 'undefined') {
    const event = new CustomEvent('system-alert', {
      detail: { ...detail, id: Math.random().toString(36).substr(2, 9) }
    });
    window.dispatchEvent(event);
  }
}

export default function SystemAlerts() {
  const [alerts, setAlerts] = useState<AlertDetail[]>([]);

  useEffect(() => {
    const handleAlert = (e: Event) => {
      const detail = (e as CustomEvent).detail as AlertDetail;
      setAlerts((prev) => [...prev, detail]);

      // Play matching sounds
      if (detail.type === 'BREACH') {
        audioEngine.playBreach();
      } else if (detail.type === 'QUEST_CLEAR') {
        audioEngine.playLevelUp();
      } else if (detail.type === 'BOSS_ENCOUNTER') {
        audioEngine.playBreach(); // aggressive start
      }

      const duration = detail.duration || (detail.type === 'BREACH' ? 4000 : 6000);
      setTimeout(() => {
        setAlerts((prev) => prev.filter((a) => a.id !== detail.id));
      }, duration);
    };

    window.addEventListener('system-alert', handleAlert);
    return () => window.removeEventListener('system-alert', handleAlert);
  }, []);

  return (
    <div className="fixed inset-x-0 top-6 z-[9999] flex flex-col items-center pointer-events-none space-y-4 px-4">
      <AnimatePresence>
        {alerts.map((alert) => (
          <AlertCard key={alert.id} alert={alert} />
        ))}
      </AnimatePresence>
    </div>
  );
}

function AlertCard({ alert }: { alert: AlertDetail }) {
  const [typedMessage, setTypedMessage] = useState('');
  const [typedSubtext, setTypedSubtext] = useState('');

  // Typewriter effect for messages
  useEffect(() => {
    setTypedMessage('');
    setTypedSubtext('');
    let index = 0;
    const msg = alert.message;
    const timer = setInterval(() => {
      if (index < msg.length) {
        setTypedMessage(msg.substring(0, index + 1));
        // Play typewriter click every 2 characters to avoid audio overload
        if (index % 2 === 0) {
          audioEngine.playTypewriter();
        }
        index++;
      } else {
        clearInterval(timer);
        // Start subtext if present
        if (alert.subtext) {
          let sIndex = 0;
          const sub = alert.subtext;
          const subTimer = setInterval(() => {
            if (sIndex < sub.length) {
              setTypedSubtext(sub.substring(0, sIndex + 1));
              if (sIndex % 2 === 0) {
                audioEngine.playTypewriter();
              }
              sIndex++;
            } else {
              clearInterval(subTimer);
            }
          }, 30);
        }
      }
    }, 25);

    return () => clearInterval(timer);
  }, [alert]);

  if (alert.type === 'BREACH') {
    // Red Flashing Overlay Center Alert
    return (
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        className="pointer-events-auto w-full max-w-md bg-red-950/80 border-2 border-red-500/50 backdrop-blur-xl p-6 rounded-2xl shadow-[0_0_50px_rgba(239,68,68,0.3)] text-center text-white relative overflow-hidden"
      >
        <div className="absolute inset-0 bg-red-600/5 animate-pulse" />
        <div className="flex flex-col items-center space-y-3 relative z-10">
          <div className="w-12 h-12 rounded-full bg-red-500/20 border border-red-500 flex items-center justify-center animate-bounce">
            <AlertTriangle className="w-6 h-6 text-red-500" />
          </div>
          <h2 className="text-red-400 font-extrabold tracking-widest text-sm uppercase">
            🚨 {alert.title}
          </h2>
          <p className="font-mono text-xs text-red-200 mt-2 leading-relaxed">
            "{typedMessage}"
          </p>
          {alert.subtext && (
            <p className="text-red-400 text-xs font-bold font-mono tracking-widest mt-1">
              {typedSubtext}
            </p>
          )}
        </div>
      </motion.div>
    );
  }

  if (alert.type === 'BOSS_ENCOUNTER') {
    // Shaking alert with screen distortion effect
    return (
      <motion.div
        initial={{ y: -50, opacity: 0 }}
        animate={{ 
          y: 0, 
          opacity: 1,
          x: [0, -10, 10, -10, 10, 0] // shake effect
        }}
        transition={{ x: { duration: 0.5, repeat: 1 } }}
        exit={{ y: -30, opacity: 0 }}
        className="pointer-events-auto w-full max-w-lg bg-slate-950/90 border-2 border-red-600/60 backdrop-blur-2xl p-6 rounded-2xl shadow-[0_0_40px_rgba(220,38,38,0.4)] text-center relative overflow-hidden"
      >
        <div className="absolute inset-0 bg-gradient-to-r from-red-950/30 to-slate-950/30" />
        <div className="flex flex-col items-center space-y-3 relative z-10">
          <span className="text-2xl animate-pulse">⚠️</span>
          <h3 className="text-red-500 font-black tracking-widest text-sm uppercase font-mono">
            {alert.title}
          </h3>
          <p className="text-slate-300 text-xs font-semibold leading-relaxed mt-2 font-mono">
            "{typedMessage}"
          </p>
          {alert.subtext && (
            <div className="text-xs text-red-400 font-black font-mono tracking-widest mt-2 border-t border-red-500/20 pt-2 w-full">
              {typedSubtext}
            </div>
          )}
        </div>
      </motion.div>
    );
  }

  // QUEST_CLEAR (Golden Border, elegant typewriter entry)
  return (
    <motion.div
      initial={{ y: -50, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      exit={{ y: -30, opacity: 0 }}
      className="pointer-events-auto w-full max-w-md bg-slate-950/90 border-2 border-amber-500/50 backdrop-blur-xl p-5 rounded-2xl shadow-[0_0_30px_rgba(245,158,11,0.25)] relative"
    >
      <div className="absolute top-0 right-4 h-full flex items-center opacity-10">
        <CheckCircle className="w-24 h-24 text-amber-500" />
      </div>
      <div className="relative z-10 flex items-start space-x-4">
        <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400 flex-shrink-0">
          ✨
        </div>
        <div className="space-y-1">
          <h4 className="text-amber-400 font-black text-xs uppercase tracking-widest font-mono">
            {alert.title}
          </h4>
          <p className="text-slate-200 text-xs font-semibold leading-relaxed font-mono">
            "{typedMessage}"
          </p>
          {alert.subtext && (
            <p className="text-amber-500 font-mono text-[10px] font-bold tracking-wider pt-1">
              {typedSubtext}
            </p>
          )}
        </div>
      </div>
    </motion.div>
  );
}
