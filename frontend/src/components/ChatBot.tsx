"use client";
import React, { useState, useRef, useEffect } from 'react';
import { MessageSquare, Send, X, Bot, User, AlertTriangle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { audioEngine } from '../lib/AudioEngine';

interface Message {
  sender: 'user' | 'bot';
  text: string;
  timestamp: Date;
}

interface BotResponse {
  text: string;
  topic: string;
  suggestions: string[];
}

export default function ChatBot() {
  const [isOpen, setIsOpen] = useState(false);
  const [currentTopic, setCurrentTopic] = useState<string>('general');
  const [messages, setMessages] = useState<Message[]>([
    {
      sender: 'bot',
      text: "Greetings Evolver! 🌌 I am the EvolveAura System Core Assistant, trained on the website's leveling system, anti-cheat engine, stress adaptivity, and workspace mechanics. Ask me anything to calibrate your matrix!",
      timestamp: new Date()
    }
  ]);
  const [suggestions, setSuggestions] = useState<string[]>([
    "How do I level up?",
    "What is the anti-cheat engine?",
    "How does the Calm Reset work?",
    "What is a Recovery Boss?"
  ]);
  const [inputValue, setInputValue] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [thinkingSteps, setThinkingSteps] = useState<string[]>([]);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isTyping]);

  const generateReply = (text: string, topic: string): BotResponse => {
    const query = text.toLowerCase();
    
    // 1. Anti-Cheat Engine topic
    if (query.includes('cheat') || query.includes('anti-cheat') || query.includes('bypass') || query.includes('lockout') || query.includes('cooldown') || query.includes('integrity') || query.includes('anomaly') || query.includes('checkpoint')) {
      return {
        topic: 'cheating',
        text: `### 🕵️ Web Anti-Cheat Engine V2.0

EvolveAura implements strict browser-and-server-authoritative anti-cheat locks:

1. **Focus Session Verification**: TIMER quests log true timer ticks. If you submit a timer quest too early, the server rejects it.
2. **5-Minute Anomaly Check**: Quests verified within 5 minutes of each other decay your background **Integrity Score** by -15%. 
3. **XP Cooldown Lock**: If your Integrity Score drops below 70%, your account is locked in cooldown. For 1 hour, all quest XP payouts are slashed by **80%** (0.2x multiplier).
4. **Anti-Burst Cap**: You cannot complete more than 3 high-tier quests within a rolling 2-hour window.
5. **Deliverable note**: Reflection tasks require a summary note of at least **50 characters**.
6. **Random Synapse Checkpoints**: During focus blocks, you must click a specific node sequence within 60 seconds to confirm active presence, or your timer/shields will break.`,
        suggestions: ["What happens if I fail a checkpoint?", "How do I restore my Integrity Score?", "What are high-tier quests?"]
      };
    }
    
    // Follow up questions on cheating
    if (topic === 'cheating') {
      if (query.includes('fail') || query.includes('checkpoint') || query.includes('sequence')) {
        return {
          topic: 'cheating',
          text: `### 🚨 Checkpoint Failures
If you fail to click the correct sequence of nodes in a Synapse Checkpoint within 60 seconds (or if you walk away from your browser):
- **In Boss Arenas**: The boss counter-attacks, removing 1 Focus Shield life. If your shields hit 0, you **faint** (the timer aborts and the boss heals 15% HP).
- **In Focus Timers**: The Pomodoro focus block immediately aborts, resetting your timer to 25 minutes, and a warning is triggered.`,
          suggestions: ["How does VIT increase shields?", "What is the anomaly check?", "Can I bypass checkpoints?"]
        };
      }
      if (query.includes('restore') || query.includes('increase') || query.includes('trust')) {
        return {
          topic: 'cheating',
          text: `### 📈 Restoring Integrity
To rebuild your **Integrity Score** after a penalty:
- Complete tasks at standard, paced intervals (more than 5 minutes apart).
- Each clean, paced quest completion successfully restores **+2%** to your Integrity Score, up to a max of 100%.
- Once your Integrity Score rises above 70%, the XP Cooldown Lock is automatically deactivated!`,
          suggestions: ["What is the XP Cooldown Lock?", "How does the focus timer verify clicks?", "Explain stats balance."]
        };
      }
    }

    // 2. Stress & Recovery / Calm Reset topic
    if (query.includes('stress') || query.includes('calm') || query.includes('reset') || query.includes('pressure') || query.includes('recovery') || query.includes('overload')) {
      return {
        topic: 'stress',
        text: `### 🧘 Psychological Stress-Adaptive Engine

The platform calibrates work pressure dynamically to prevent burnout:

1. **Workload Slider**: Calibrate your stress (0-100%). Crossing the **70% overload threshold** scales down daily quest parameters and marks them as **[Recovery]** to preserve momentum.
2. **Calm Reset Button**: Click the Calm Reset button in your profile card to activate **Recovery Mode**.
3. **Recovery Mode UI**: The complex analytics grid is completely hidden. The dashboard centers only on a single **Micro Crisis Quest** (e.g., box breathing for 60 seconds).
4. **Recovery Bosses**: Under high pressure, Gate of Trials spawns bosses that are immune to standard study TIMER damage. They can only be defeated by SAGE, reflection, sleep, or breathing logs.`,
        suggestions: ["How do I start box breathing?", "How do I defeat a Recovery Boss?", "How do I exit Recovery Mode?"]
      };
    }
    
    // Follow ups on stress
    if (topic === 'stress') {
      if (query.includes('breathing') || query.includes('box') || query.includes('start') || query.includes('crisis')) {
        return {
          topic: 'stress',
          text: `### 💨 Box Breathing Guide
To complete the Calm Reset Breathing exercise:
1. Click **Start Breathing Loop** on your simplified Recovery dashboard.
2. Follow the center indicator:
   - **Breathe In** for 4 seconds.
   - **Hold** for 4 seconds.
   - **Breathe Out** for 4 seconds.
   - **Hold** for 4 seconds.
3. Complete this loop for 60 seconds with zero tab switches to verify and submit the Crisis Quest for **+50 XP**!`,
          suggestions: ["How does it damage the boss?", "How do I exit Recovery Mode?", "What is the Pressure Slider?"]
        };
      }
      if (query.includes('boss') || query.includes('beast') || query.includes('anxiety')) {
        return {
          topic: 'stress',
          text: `### 👹 Defeating Recovery Bosses
Recovery weekly bosses (such as *The Exam Pressure Beast*, *The Anxiety Phantom*, or *The Breakdown Shadow*):
- Standard deep-work timers (Focus page) deal **0 damage** (returns a block warning).
- They can only be damaged by **SAGE** quests, daily reflection logs, box breathing exercises, or verified sleep logs.
- These tasks deal **2x Quest XP** as direct damage to the boss, helping you clear the Weekly boss block while resting.`,
          suggestions: ["What is the Weekend Enraged phase?", "How to exit Recovery Mode?", "How does VIT affect shields?"]
        };
      }
      if (query.includes('exit') || query.includes('turn off') || query.includes('disable')) {
        return {
          topic: 'stress',
          text: `### 🧘 Exiting Recovery Mode
To return to your normal workspace:
- Simply tap the **Calm Reset** button on your dashboard again.
- It will play an organic exhale breath sound, disable the Single-Step UI compression, and restore the full analytics grids.`,
          suggestions: ["What is the Workload slider?", "Explain stats allocation.", "How do daily chest streaks work?"]
        };
      }
    }

    // 3. Leveling & Stats topic
    if (query.includes('level') || query.includes('xp') || query.includes('stats') || query.includes('points') || query.includes('allocate') || query.includes('int') || query.includes('str') || query.includes('vit') || query.includes('wis') || query.includes('agi') || query.includes('balance') || query.includes('ascend')) {
      return {
        topic: 'leveling',
        text: `### ⚔️ Solo Leveling & Stats Calibration

Every time you level up, you receive **5 Stat Points** to distribute manually:

- **INT (Intelligence)**: Lowers difficulty of academic quests.
- **STR (Strength)**: Shortens step thresholds for physical tasks.
- **VIT (Vitality)**: Increases your Focus Shield capacity (10 VIT = 3 HP, 11 VIT = 4 HP, 12+ VIT = 5 HP).
- **WIS (Wisdom)**: Multiplies gold rewards from reflection entries.
- **AGI (Agility)**: Increases XP multipliers for personal projects.

**⚠️ The Balanced Growth Cap**: To ensure balanced evolution, your lowest stat cannot be more than **3 levels behind** your highest. If it is, Rank Breakthroughs are locked!`,
        suggestions: ["How do I breakthrough / ascend?", "How is XP calculated?", "How do I get stat points?"]
      };
    }
    
    // Follow ups on leveling
    if (topic === 'leveling') {
      if (query.includes('breakthrough') || query.includes('ascend') || query.includes('trial') || query.includes('lock')) {
        return {
          topic: 'leveling',
          text: `### 🔓 Rank Breakthrough Trials
When you reach Level 10, 20, or 30, you hit a level cap breakthrough lock:
1. You must have your **stats balanced** (max - min <= 3) to begin.
2. Once unlocked, click **Begin Rank Breakthrough** in the lockdown screen.
3. This launches a **90-minute study session** with a strict **1 HP Focus Shield** (0 tolerances for tab switches).
4. Complete the session to breakthrough to the next Rank (D, C, B, A, or S) and unlock new level caps!`,
          suggestions: ["How does VIT increase shields?", "What is the XP formula?", "What is the dynamic daily quest?"]
        };
      }
      if (query.includes('xp') || query.includes('formula') || query.includes('required')) {
        return {
          topic: 'leveling',
          text: `### 📊 XP & Leveling Mathematics
- The XP required for your next level is: \`Required XP = 100 * (Level ^ 1.5)\` (rounded).
  - Lvl 1: 100 XP
  - Lvl 2: 283 XP
  - Lvl 3: 520 XP
- If your XP drops below 0 due to carry-over skipped penalties, you trigger **Level Demotion**, dropping back to your previous level threshold.`,
          suggestions: ["What are carry-over skipped penalties?", "How to get stat points?", "What are dynamic daily quests?"]
        };
      }
    }

    // 4. Default / Fallback
    return {
      topic: 'general',
      text: `### 🌌 Welcome to EvolveAura V2.0

I am your contextual system Core Guide. I can explain the mechanics of EvolveAura:

- **Daily Quests & Rollover**: 7 daily tasks that refresh at midnight local time. Skipped tasks carry forward with a **-25 XP** penalty.
- **Stress Calibration**: Slide your Pressure score to scale down quest difficulty or enter Recovery Mode.
- **Weekly Bosses**: Fight habit bosses in the Focus Arena, protected by your VIT-based Focus Shields.
- **Anti-Cheat Validation**: Strict server-side verification, anomaly checks, and random checkpoints to prevent cheating.`,
      suggestions: ["What is the anti-cheat engine?", "Explain Level cap Breakthroughs.", "How does Calm Reset work?"]
    };
  };

  const handleSend = (text: string) => {
    if (!text.trim()) return;

    audioEngine.playNavTick();

    // Add user message
    const userMsg: Message = {
      sender: 'user',
      text,
      timestamp: new Date()
    };
    setMessages(prev => [...prev, userMsg]);
    setInputValue('');

    // Trigger bot typing with reasoning trace simulation
    setIsTyping(true);
    setThinkingSteps(["Analyzing synapse query..."]);
    
    setTimeout(() => {
      setThinkingSteps(prev => [...prev, "Querying EvolveAura V2.0 Database..."]);
    }, 400);

    setTimeout(() => {
      setThinkingSteps(prev => [...prev, "Generating contextual matrix response..."]);
    }, 800);

    setTimeout(() => {
      setIsTyping(false);
      setThinkingSteps([]);
      const response = generateReply(text, currentTopic);
      setCurrentTopic(response.topic);
      setSuggestions(response.suggestions);
      
      const botMsg: Message = {
        sender: 'bot',
        text: response.text,
        timestamp: new Date()
      };
      setMessages(prev => [...prev, botMsg]);
    }, 1200);
  };

  const parseBoldText = (text: string) => {
    const parts = text.split('**');
    return parts.map((part, index) => {
      if (index % 2 === 1) {
        return <strong key={index} className="font-extrabold text-white">{part}</strong>;
      }
      return part;
    });
  };

  const formatMarkdown = (text: string) => {
    const lines = text.split('\n');
    return lines.map((line, idx) => {
      let content = line;
      
      // Parse Headers
      if (content.startsWith('### ')) {
        return (
          <h4 key={idx} className="font-extrabold text-white text-xs uppercase tracking-wider mb-2 mt-3 font-mono border-b border-slate-800 pb-1 flex items-center">
            {content.slice(4)}
          </h4>
        );
      }
      
      // Parse bullet points
      if (content.startsWith('- ') || content.startsWith('* ')) {
        return (
          <div key={idx} className="pl-3 relative mb-1.5 flex items-start text-[11px] text-slate-300 font-normal leading-relaxed">
            <span className="text-[#8B5CF6] mr-2">•</span>
            <span>{parseBoldText(content.slice(2))}</span>
          </div>
        );
      }

      // Parse numbered lists
      if (/^\d+\.\s/.test(content)) {
        const match = content.match(/^(\d+)\.\s(.*)/);
        if (match) {
          return (
            <div key={idx} className="pl-3 relative mb-1.5 flex items-start text-[11px] text-slate-300 font-normal leading-relaxed">
              <span className="text-[#8B5CF6] mr-2 font-bold font-mono">{match[1]}.</span>
              <span>{parseBoldText(match[2])}</span>
            </div>
          );
        }
      }

      if (content.trim() === '') {
        return <div key={idx} className="h-2" />;
      }

      return (
        <p key={idx} className="mb-2 text-[11px] text-slate-300 font-normal leading-relaxed">
          {parseBoldText(content)}
        </p>
      );
    });
  };

  return (
    <>
      {/* Floating Chat Button */}
      <button
        id="ai-sidebar-trigger"
        onClick={() => setIsOpen(!isOpen)}
        className="fixed bottom-6 right-6 w-14 h-14 bg-[#8B5CF6] hover:bg-[#7c4fe3] text-white rounded-full flex items-center justify-center shadow-lg shadow-[#8B5CF6]/30 hover:shadow-[#8B5CF6]/50 transition duration-300 transform hover:scale-105 z-40 cursor-pointer pointer-events-auto"
      >
        <MessageSquare className="w-6 h-6" />
      </button>

      {/* Chat window */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 50, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 50, scale: 0.9 }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="fixed bottom-24 right-6 w-[380px] h-[520px] bg-slate-900/95 border border-slate-800 rounded-2xl shadow-2xl flex flex-col justify-between overflow-hidden z-40 glass-panel pointer-events-auto"
          >
            {/* Header */}
            <div className="px-5 py-4 border-b border-slate-850 bg-slate-950/40 flex justify-between items-center">
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 rounded-xl bg-[#8B5CF6]/15 flex items-center justify-center text-[#8B5CF6]">
                  <Bot className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-white font-extrabold text-xs uppercase tracking-wider">Aura Core Intelligence</h4>
                  <span className="text-[10px] text-emerald-400 font-semibold block">Online & Contextual Calibrator</span>
                </div>
              </div>
              <button
                onClick={() => setIsOpen(false)}
                className="text-slate-500 hover:text-white transition cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Message area */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4 max-h-[350px]">
              {messages.map((msg, idx) => (
                <div
                  key={idx}
                  className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'} items-start space-x-2`}
                >
                  {msg.sender === 'bot' && (
                    <div className="w-6 h-6 rounded-lg bg-[#8B5CF6]/10 text-[#8B5CF6] flex items-center justify-center mt-0.5">
                      <Bot className="w-3.5 h-3.5" />
                    </div>
                  )}
                  <div
                    className={`p-3 rounded-2xl text-xs max-w-[280px] ${
                      msg.sender === 'user'
                        ? 'bg-[#8B5CF6] text-white rounded-tr-none shadow-md shadow-[#8B5CF6]/10'
                        : 'bg-slate-950/60 border border-slate-800 text-slate-300 rounded-tl-none leading-relaxed'
                    }`}
                  >
                    {msg.sender === 'user' ? msg.text : formatMarkdown(msg.text)}
                  </div>
                  {msg.sender === 'user' && (
                    <div className="w-6 h-6 rounded-lg bg-slate-800 text-white flex items-center justify-center mt-0.5">
                      <User className="w-3.5 h-3.5" />
                    </div>
                  )}
                </div>
              ))}

              {isTyping && (
                <div className="flex justify-start items-center space-x-2">
                  <div className="w-6 h-6 rounded-lg bg-[#8B5CF6]/10 text-[#8B5CF6] flex items-center justify-center">
                    <Bot className="w-3.5 h-3.5" />
                  </div>
                  <div className="flex flex-col space-y-1.5 p-3 bg-slate-950/40 border border-slate-850 rounded-2xl max-w-[280px] rounded-tl-none font-mono text-[9px] text-slate-500">
                    <div className="flex items-center space-x-1.5 text-[#8B5CF6]">
                      <span className="w-1.5 h-1.5 bg-[#8B5CF6] rounded-full animate-ping" />
                      <span className="font-bold uppercase tracking-wider">Reasoning Trace</span>
                    </div>
                    <div className="space-y-1">
                      {thinkingSteps.map((step, sidx) => (
                        <div key={sidx} className="flex items-center space-x-1.5">
                          <span className="text-[#8B5CF6]">✓</span>
                          <span>{step}</span>
                        </div>
                      ))}
                    </div>
                    <div className="flex space-x-1 items-center pt-1">
                      <span className="w-1 h-1 bg-slate-500 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                      <span className="w-1 h-1 bg-slate-500 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                      <span className="w-1 h-1 bg-slate-500 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                    </div>
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Suggestions & Input */}
            <div className="p-4 border-t border-slate-850 bg-slate-950/20 space-y-3">
              {!isTyping && suggestions.length > 0 && (
                <div className="flex flex-wrap gap-1.5 max-h-[80px] overflow-y-auto">
                  {suggestions.map((s) => (
                    <button
                      key={s}
                      onClick={() => handleSend(s)}
                      className="px-2.5 py-1 rounded-full bg-slate-950/50 hover:bg-slate-950 border border-slate-800 text-slate-400 hover:text-white transition text-[10px] font-semibold cursor-pointer"
                    >
                      {s}
                    </button>
                  ))}
                </div>
              )}

              <div className="flex space-x-2">
                <input
                  type="text"
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleSend(inputValue)}
                  placeholder="Ask about leveling, stress, anti-cheat..."
                  className="flex-1 px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white focus:outline-none focus:border-[#8B5CF6] placeholder:text-slate-600"
                />
                <button
                  onClick={() => handleSend(inputValue)}
                  className="p-2.5 rounded-xl bg-[#8B5CF6] hover:bg-[#7c4fe3] text-white flex items-center justify-center transition cursor-pointer"
                >
                  <Send className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
