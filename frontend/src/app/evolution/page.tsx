"use client";
import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { apiRequest } from '../../lib/api';
import { Award, Shield, Timer, Flame, Check } from 'lucide-react';

export default function EvolutionPage() {
  const router = useRouter();
  const [profile, setProfile] = useState<any>(null);
  const [skills, setSkills] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [availablePoints, setAvailablePoints] = useState(0);

  async function loadEvolution() {
    try {
      const u = await apiRequest('/auth/profile');
      setProfile(u.profile);
      setSkills(u.skills || []);

      const spent = u.skills?.length || 0;
      setAvailablePoints(Math.max(0, u.profile.currentLevel - spent));
    } catch (e) {
      router.push('/login');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadEvolution();
  }, []);

  const handleUnlockSkill = async (path: string, nodeName: string) => {
    try {
      await apiRequest('/auth/skills/unlock', {
        method: 'POST',
        body: JSON.stringify({ path, nodeName })
      });
      alert(`🎉 Unlocked node: ${nodeName}!`);
      loadEvolution();
    } catch (e: any) {
      alert(e.message || "Failed to unlock node");
    }
  };

  const handleBuyRelic = async (relicId: string, name: string, cost: number) => {
    try {
      await apiRequest('/auth/relics/buy', {
        method: 'POST',
        body: JSON.stringify({ relicId, name, cost, type: 'title' })
      });
      alert(`🎉 Purchased and equipped title: ${name}!`);
      loadEvolution();
    } catch (e: any) {
      alert(e.message || "Failed to purchase title");
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center text-white bg-[#0F172A]">
        <div className="text-center space-y-4">
          <div className="w-12 h-12 rounded-full border-4 border-[#8B5CF6] border-t-transparent animate-spin mx-auto" />
          <p className="text-slate-400">Loading Evolution Skill Map...</p>
        </div>
      </div>
    );
  }

  const skillTree = [
    { path: "SCHOLAR", title: "Scholar Nodes", nodes: ["Deep Work", "Concentration", "Flow State"] },
    { path: "WARRIOR", title: "Warrior Nodes", nodes: ["Recovery", "Energy", "Discipline"] }
  ];

  const cosmeticShop = [
    { id: "title_focus", name: "Focus Master", cost: 100 },
    { id: "title_shadow", name: "Shadow Scholar", cost: 250 },
    { id: "title_ascended", name: "The Ascended", cost: 500 }
  ];

  const hasSkill = (path: string, name: string) => {
    return skills.some(s => s.path === path && s.nodeName === name);
  };

  const hasRelic = (relicId: string) => {
    const relics = profile.unlockedRelics || [];
    return relics.some((r: any) => r.id === relicId);
  };

  return (
    <div className="min-h-screen bg-[#0F172A] pb-16 text-slate-300">
      <header className="border-b border-slate-800 bg-slate-900/60 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-4 py-4 flex justify-between items-center">
          <div className="text-xl font-extrabold text-[#8B5CF6]">EVOLVE<span className="text-white">AURA</span></div>
          <nav className="flex space-x-6 text-sm font-medium">
            <Link href="/dashboard" className="text-slate-400 hover:text-white">Dashboard</Link>
            <Link href="/focus" className="text-slate-400 hover:text-white">Focus</Link>
            <Link href="/evolution" className="text-white">Evolution Tree</Link>
            <Link href="/subjects" className="text-slate-400 hover:text-white">Subjects</Link>
            <Link href="/about" className="text-slate-400 hover:text-white">About</Link>
            <Link href="/faq" className="text-slate-400 hover:text-white">FAQ</Link>
          </nav>
        </div>
      </header>

      <div className="max-w-4xl mx-auto px-4 mt-10 space-y-12">
        {/* Evolution Skill Points */}
        <div className="glass-panel p-6 flex justify-between items-center border-l-4 border-l-[#8B5CF6]">
          <div>
            <h2 className="text-lg font-bold text-white">Evolution Tree Parameters</h2>
            <p className="text-slate-400 text-xs">Leveling up grants +1 Skill Point to unlock nodes.</p>
          </div>
          <div className="px-5 py-2.5 rounded-xl bg-[#8B5CF6]/15 border border-[#8B5CF6]/30 text-[#8B5CF6] font-bold text-sm">
            {availablePoints} Skill Points Available
          </div>
        </div>

        {/* Skill Maps */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {skillTree.map((tree) => (
            <div key={tree.path} className="glass-panel p-6 space-y-6">
              <h3 className="font-bold text-white text-base">{tree.title}</h3>
              <div className="flex flex-col space-y-4">
                {tree.nodes.map((node) => {
                  const unlocked = hasSkill(tree.path, node);
                  return (
                    <div key={node} className="p-4 bg-slate-900/30 border border-slate-800 rounded-xl flex justify-between items-center">
                      <div>
                        <h4 className="text-white font-bold text-sm">{node}</h4>
                        <span className="text-[10px] text-slate-500 uppercase tracking-widest">{tree.path} Path</span>
                      </div>
                      {unlocked ? (
                        <span className="text-emerald-400 bg-emerald-500/10 p-1.5 rounded-full"><Check className="w-4 h-4" /></span>
                      ) : (
                        <button 
                          onClick={() => handleUnlockSkill(tree.path, node)}
                          disabled={availablePoints <= 0}
                          className="px-4 py-1.5 rounded-lg bg-[#8B5CF6] hover:bg-[#7c4fe3] text-white text-xs font-bold transition disabled:opacity-30"
                        >
                          Unlock
                        </button>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>

        {/* Cosmetics Shop */}
        <div className="glass-panel p-8 space-y-6">
          <h2 className="text-xl font-bold text-white">Relics & Titles Shop</h2>
          <p className="text-slate-400 text-xs">Spend Aura Gold earned from daily quests to buy special titles.</p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {cosmeticShop.map((item) => {
              const bought = hasRelic(item.id);
              const equipped = profile.equippedTitle === item.name;
              return (
                <div key={item.id} className="p-5 bg-slate-900/20 border border-slate-800 rounded-xl flex flex-col justify-between min-h-[160px]">
                  <div>
                    <h4 className="text-white font-bold text-sm">"{item.name}"</h4>
                    <span className="text-slate-500 text-[10px] uppercase font-bold block mt-1">Cost: {item.cost} Coins</span>
                  </div>
                  {bought ? (
                    <span className="text-slate-400 font-medium text-xs text-center border border-slate-800/80 p-2 rounded-lg bg-slate-950/20">
                      {equipped ? "Equipped" : "Purchased"}
                    </span>
                  ) : (
                    <button 
                      onClick={() => handleBuyRelic(item.id, item.name, item.cost)}
                      className="w-full py-2 rounded-lg bg-amber-500 hover:bg-amber-600 text-slate-950 text-xs font-bold transition"
                    >
                      Buy Title
                    </button>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
