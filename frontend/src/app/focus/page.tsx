"use client";
import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { apiRequest } from '../../lib/api';
import { Play, Pause, RotateCcw, Timer, Volume2, VolumeX, ArrowLeft } from 'lucide-react';

export default function FocusPage() {
  const router = useRouter();
  const [seconds, setSeconds] = useState(1500); // 25 min default
  const [isActive, setIsActive] = useState(false);
  const [isBreak, setIsBreak] = useState(false);
  const [soundOn, setSoundOn] = useState(false);
  const [audio, setAudio] = useState<any>(null);

  useEffect(() => {
    // Generate ambient sound using a synth/web audio if requested
    if (soundOn) {
      try {
        const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
        // Create brown noise generator
        const bufferSize = 2 * audioContext.sampleRate;
        const noiseBuffer = audioContext.createBuffer(1, bufferSize, audioContext.sampleRate);
        const output = noiseBuffer.getChannelData(0);
        let lastOut = 0.0;
        for (let i = 0; i < bufferSize; i++) {
          const white = Math.random() * 2 - 1;
          output[i] = (lastOut + (0.02 * white)) / 1.02;
          lastOut = output[i];
          output[i] *= 3.5; // compensation
        }
        const brownNoise = audioContext.createBufferSource();
        brownNoise.buffer = noiseBuffer;
        brownNoise.loop = true;

        const gainNode = audioContext.createGain();
        gainNode.gain.value = 0.15; // Volume low

        brownNoise.connect(gainNode);
        gainNode.connect(audioContext.destination);
        brownNoise.start();

        setAudio({ brownNoise, audioContext });
      } catch (err) {
        console.error("Audio Context initialization failed", err);
      }
    } else {
      if (audio) {
        audio.brownNoise.stop();
        audio.audioContext.close();
        setAudio(null);
      }
    }
    return () => {
      if (audio) {
        audio.brownNoise.stop();
        audio.audioContext.close();
      }
    };
  }, [soundOn]);

  useEffect(() => {
    let interval: any = null;
    if (isActive && seconds > 0) {
      interval = setInterval(() => {
        setSeconds(prev => prev - 1);
      }, 1000);
    } else if (seconds === 0) {
      setIsActive(false);
      handleSessionCompletion();
    }
    return () => clearInterval(interval);
  }, [isActive, seconds]);

  const handleSessionCompletion = async () => {
    try {
      if (!isBreak) {
        // Log study session: 25 minutes = 1500 seconds
        await apiRequest('/detox/log', {
          method: 'POST',
          body: JSON.stringify({
            studyTimeSeconds: 1500,
            screenTimeSeconds: 0
          })
        });
        alert("🎉 Deep Focus Session complete! +25 min added to study time.");
        // Flip to break
        setIsBreak(true);
        setSeconds(300); // 5 min break
      } else {
        alert("Break complete! Ready to focus again?");
        setIsBreak(false);
        setSeconds(1500);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const toggleStart = () => setIsActive(!isActive);
  const resetTimer = () => {
    setIsActive(false);
    setSeconds(isBreak ? 300 : 1500);
  };

  const formatTime = (totalSec: number) => {
    const min = Math.floor(totalSec / 60);
    const sec = totalSec % 60;
    return `${min.toString().padStart(2, '0')}:${sec.toString().padStart(2, '0')}`;
  };

  return (
    <div className="min-h-screen bg-[#0F172A] flex flex-col justify-between pb-12">
      {/* Header */}
      <header className="border-b border-slate-800 bg-slate-900/60 backdrop-blur-md">
        <div className="max-w-6xl mx-auto px-4 py-4 flex justify-between items-center">
          <Link href="/dashboard" className="text-slate-400 hover:text-white flex items-center text-sm font-semibold">
            <ArrowLeft className="w-4 h-4 mr-2" /> Back to Dashboard
          </Link>
          <div className="text-white font-bold text-sm">Focus Mode</div>
        </div>
      </header>

      {/* Timer Display */}
      <div className="my-auto flex flex-col items-center">
        <div className="w-80 h-80 rounded-full border-4 border-[#8B5CF6]/30 flex flex-col items-center justify-center bg-slate-900/40 relative shadow-2xl shadow-[#8B5CF6]/5 mb-12">
          {/* Animated glow when active */}
          {isActive && (
            <div className="absolute inset-2 rounded-full border border-dashed border-[#8B5CF6]/30 animate-spin" style={{ animationDuration: '30s' }} />
          )}
          <span className="text-[#8B5CF6] text-xs font-bold uppercase tracking-widest mb-2">
            {isBreak ? "Short Break" : "Deep Work Focus"}
          </span>
          <span className="text-6xl font-extrabold text-white tracking-tight tabular-nums">
            {formatTime(seconds)}
          </span>
        </div>

        {/* Controls */}
        <div className="flex items-center space-x-6">
          <button 
            onClick={() => setSoundOn(!soundOn)}
            className="w-12 h-12 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-center text-slate-400 hover:text-white transition cursor-pointer"
          >
            {soundOn ? <Volume2 className="w-5 h-5 text-[#8B5CF6]" /> : <VolumeX className="w-5 h-5" />}
          </button>
          
          <button 
            onClick={toggleStart}
            className="w-20 h-20 rounded-full bg-[#8B5CF6] hover:bg-[#7c4fe3] flex items-center justify-center text-white shadow-lg shadow-[#8B5CF6]/30 transition transform hover:scale-105 active:scale-95 cursor-pointer"
          >
            {isActive ? <Pause className="w-8 h-8 fill-white" /> : <Play className="w-8 h-8 fill-white ml-1" />}
          </button>

          <button 
            onClick={resetTimer}
            className="w-12 h-12 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-center text-slate-400 hover:text-white transition cursor-pointer"
          >
            <RotateCcw className="w-5 h-5" />
          </button>
        </div>
      </div>

      <div className="text-slate-500 text-xs text-center max-w-sm mx-auto px-4">
        Synthesizing active Brown Noise coordinates alpha brainwave frequencies, enhancing attention spans and blocking digital noise.
      </div>
    </div>
  );
}
