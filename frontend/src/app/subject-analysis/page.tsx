"use client";
import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { apiRequest } from '../../lib/api';
import { BookOpen, Award, CheckCircle2, ChevronRight, AlertTriangle, ArrowLeft } from 'lucide-react';

export default function SubjectAnalysisPage() {
  const router = useRouter();
  const [analysis, setAnalysis] = useState<any>(null);
  const [subjectName, setSubjectName] = useState('');
  const [understanding, setUnderstanding] = useState(50);
  const [retention, setRetention] = useState(50);
  const [problemSolving, setProblemSolving] = useState(50);
  const [confidence, setConfidence] = useState(50);
  const [loading, setLoading] = useState(true);

  async function loadSubjects() {
    try {
      const data = await apiRequest('/subjects/analysis');
      setAnalysis(data);
    } catch (err) {
      console.error(err);
      router.push('/login');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadSubjects();
  }, []);

  const handleAddSubject = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!subjectName) return;
    try {
      await apiRequest('/subjects/upsert', {
        method: 'POST',
        body: JSON.stringify({
          subjectName,
          understanding,
          retention,
          problemSolving,
          confidence
        })
      });
      setSubjectName('');
      loadSubjects();
    } catch (err) {
      alert("Failed to save subject details");
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center text-white bg-[#0F172A]">
        <div className="text-center space-y-4">
          <div className="w-12 h-12 rounded-full border-4 border-[#8B5CF6] border-t-transparent animate-spin mx-auto" />
          <p className="text-slate-400">Scanning subject parameters...</p>
        </div>
      </div>
    );
  }

  const weakest = analysis?.weakestSubject;

  return (
    <div className="min-h-screen bg-[#0F172A] pb-16">
      {/* Navigation Header */}
      <header className="border-b border-slate-800 bg-slate-900/60 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-4 py-4 flex justify-between items-center">
          <div className="text-xl font-extrabold tracking-wider text-[#8B5CF6] cursor-pointer" onClick={() => router.push('/dashboard')}>
            EVOLVE<span className="text-white">AURA</span>
          </div>
          <nav className="flex space-x-6 text-sm font-medium">
            <Link href="/dashboard" className="text-slate-400 hover:text-white">Dashboard</Link>
            <Link href="/focus" className="text-slate-400 hover:text-white">Focus</Link>
            <Link href="/subject-analysis" className="text-white hover:text-[#8B5CF6]">Subjects</Link>
            <Link href="/analysis" className="text-slate-400 hover:text-white">Analysis</Link>
          </nav>
        </div>
      </header>

      {/* Main Container */}
      <div className="max-w-5xl mx-auto px-4 mt-10 grid grid-cols-1 md:grid-cols-3 gap-8">
        
        {/* Left Column: Form to Add/Edit */}
        <div className="space-y-6 md:col-span-1">
          <div className="glass-panel p-6 space-y-6">
            <h3 className="text-lg font-bold text-white mb-2">Subject Assessment</h3>
            
            <form onSubmit={handleAddSubject} className="space-y-4 text-xs font-semibold">
              <div>
                <label className="block text-slate-300 mb-1.5">Subject Name</label>
                <input
                  type="text"
                  required
                  value={subjectName}
                  onChange={(e) => setSubjectName(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl bg-slate-900 border border-slate-700 text-white focus:outline-none focus:border-[#8B5CF6] text-sm font-normal"
                  placeholder="e.g. Physics, Calculus"
                />
              </div>

              <div>
                <div className="flex justify-between text-slate-300 mb-1">
                  <span>Understanding</span>
                  <span>{understanding}%</span>
                </div>
                <input
                  type="range"
                  min="0" max="100"
                  value={understanding}
                  onChange={(e) => setUnderstanding(parseInt(e.target.value))}
                  className="w-full h-1 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-[#8B5CF6]"
                />
              </div>

              <div>
                <div className="flex justify-between text-slate-300 mb-1">
                  <span>Retention</span>
                  <span>{retention}%</span>
                </div>
                <input
                  type="range"
                  min="0" max="100"
                  value={retention}
                  onChange={(e) => setRetention(parseInt(e.target.value))}
                  className="w-full h-1 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-[#8B5CF6]"
                />
              </div>

              <div>
                <div className="flex justify-between text-slate-300 mb-1">
                  <span>Problem Solving</span>
                  <span>{problemSolving}%</span>
                </div>
                <input
                  type="range"
                  min="0" max="100"
                  value={problemSolving}
                  onChange={(e) => setProblemSolving(parseInt(e.target.value))}
                  className="w-full h-1 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-[#8B5CF6]"
                />
              </div>

              <div>
                <div className="flex justify-between text-slate-300 mb-1">
                  <span>Confidence</span>
                  <span>{confidence}%</span>
                </div>
                <input
                  type="range"
                  min="0" max="100"
                  value={confidence}
                  onChange={(e) => setConfidence(parseInt(e.target.value))}
                  className="w-full h-1 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-[#8B5CF6]"
                />
              </div>

              <button
                type="submit"
                className="w-full py-3.5 rounded-xl bg-[#8B5CF6] hover:bg-[#7c4fe3] text-white text-xs font-bold transition mt-4"
              >
                Log parameters
              </button>
            </form>
          </div>
        </div>

        {/* Right Column: List & Analysis */}
        <div className="md:col-span-2 space-y-8">
          
          {/* Weakest Subject Warning card */}
          {weakest && (
            <div className="glass-panel p-6 border-l-4 border-l-orange-500 bg-gradient-to-r from-orange-950/10 to-slate-900">
              <div className="flex items-center space-x-3 mb-2">
                <AlertTriangle className="w-5 h-5 text-orange-400" />
                <h3 className="text-white font-extrabold text-base">Weakest Subject: {weakest.subjectName}</h3>
              </div>
              <p className="text-slate-400 text-xs leading-relaxed mb-4">
                Your parameters for "{weakest.subjectName}" indicate a core bottleneck in **{weakest.recommendation.skill}**. We recommend using the following active strategy:
              </p>
              <div className="p-4 rounded-xl bg-slate-950/40 border border-slate-800">
                <div className="text-xs font-bold text-[#8B5CF6] uppercase tracking-wider mb-1">
                  Recommended Method: {weakest.recommendation.method}
                </div>
                <p className="text-slate-400 text-xs leading-relaxed">
                  {weakest.recommendation.description}
                </p>
              </div>
            </div>
          )}

          {/* Subjects Parameters List */}
          <div className="glass-panel p-8">
            <h2 className="text-xl font-bold text-white mb-6">Subject Inventory</h2>
            
            {(!analysis?.subjects || analysis.subjects.length === 0) ? (
              <p className="text-slate-500 text-xs italic text-center py-12">
                No subjects registered yet. Log subject parameters on the left to track academic cognitive assets.
              </p>
            ) : (
              <div className="space-y-6">
                {analysis.subjects.map((sub: any) => (
                  <div key={sub.id} className="p-5 rounded-xl border border-slate-800 bg-slate-900/20 space-y-4">
                    <div className="flex justify-between items-center">
                      <h4 className="text-white font-bold text-base">{sub.subjectName}</h4>
                      <span className="text-xs font-semibold text-slate-400">Health Index: {sub.health}%</span>
                    </div>

                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-xs">
                      <div>
                        <span className="text-slate-500 font-bold block mb-1">Comprehension</span>
                        <div className="flex items-center space-x-2">
                          <div className="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden">
                            <div className="h-full bg-blue-500" style={{ width: `${sub.understanding}%` }} />
                          </div>
                          <span>{sub.understanding}</span>
                        </div>
                      </div>

                      <div>
                        <span className="text-slate-500 font-bold block mb-1">Retention</span>
                        <div className="flex items-center space-x-2">
                          <div className="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden">
                            <div className="h-full bg-teal-500" style={{ width: `${sub.retention}%` }} />
                          </div>
                          <span>{sub.retention}</span>
                        </div>
                      </div>

                      <div>
                        <span className="text-slate-500 font-bold block mb-1">Problem Solving</span>
                        <div className="flex items-center space-x-2">
                          <div className="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden">
                            <div className="h-full bg-green-500" style={{ width: `${sub.problemSolving}%` }} />
                          </div>
                          <span>{sub.problemSolving}</span>
                        </div>
                      </div>

                      <div>
                        <span className="text-slate-500 font-bold block mb-1">Confidence</span>
                        <div className="flex items-center space-x-2">
                          <div className="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden">
                            <div className="h-full bg-amber-500" style={{ width: `${sub.confidence}%` }} />
                          </div>
                          <span>{sub.confidence}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
