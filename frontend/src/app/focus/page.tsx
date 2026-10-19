"use client";
import React from 'react';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import FocusTimer from '../../components/FocusTimer';
import { useRequirePath } from '../../lib/useRequirePath';

export default function FocusPage() {
  const { checking } = useRequirePath();

  if (checking) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#0F172A] text-white">
        <div className="text-center space-y-4">
          <div className="w-12 h-12 rounded-full border-4 border-[#8B5CF6] border-t-transparent animate-spin mx-auto" />
          <p className="text-slate-400 font-medium font-mono text-xs">Calibrating Focus Parameters...</p>
        </div>
      </div>
    );
  }

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
        <FocusTimer />
      </div>

      <div className="text-slate-500 text-xs text-center max-w-sm mx-auto px-4">
        Every completed Pomodoro session grows a tree in your Forest and strikes damage to the Weekly Boss.
      </div>
    </div>
  );
}
