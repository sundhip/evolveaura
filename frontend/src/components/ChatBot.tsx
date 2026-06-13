"use client";
import React, { useState, useRef, useEffect } from 'react';
import { MessageSquare, Send, X, Bot, User } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface Message {
  sender: 'user' | 'bot';
  text: string;
  timestamp: Date;
}

const SUGGESTIONS = [
  "How do I level up?",
  "What are Aura Shields?",
  "How to defeat bosses?",
  "What is a bottleneck?"
];

export default function ChatBot() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    {
      sender: 'bot',
      text: "Hello Evolver! I am your EvolveAura guide. Ask me any doubts about how the platform works, leveling up, quests, bosses, or streaks!",
      timestamp: new Date()
    }
  ]);
  const [inputValue, setInputValue] = useState('');
  const [isTyping, setIsTyping] = useState(false);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Auto scroll to bottom of chat
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isTyping]);

  const getBotReply = (text: string): string => {
    const query = text.toLowerCase();
    
    if (query.includes('level') || query.includes('xp') || query.includes('progress') || query.includes('up')) {
      return "Leveling up requires XP! You gain XP by completing daily quests, claiming daily chests (+20 to +250 XP depending on your streak), and defeating weekly bosses. Your next level requires XP calculated by: 100 * (Level ^ 1.5).";
    }
    if (query.includes('shield') || query.includes('streak') || query.includes('protect')) {
      return "Aura Shields protect your daily streak. If you fail to complete your quests, a shield is consumed automatically to keep your streak intact. You earn 1 Aura Shield for every 7-day consistency streak you maintain.";
    }
    if (query.includes('boss') || query.includes('hp') || query.includes('doom') || query.includes('demon') || query.includes('slay')) {
      return "Bosses represent negative digital habits (like doom-scrolling). You deal damage to the active boss by completing focus blocks (25 minutes = 100 damage) and completing daily quests. Defeating a boss yields rare badges and large XP rewards!";
    }
    if (query.includes('quest') || query.includes('verify') || query.includes('daily') || query.includes('task')) {
      return "You get 7 daily quests customized to your bottleneck path. Complete them and click 'Verify'. For reflection quests, write a reflection log of at least 50 characters to claim your XP.";
    }
    if (query.includes('bottleneck') || query.includes('path') || query.includes('affinity')) {
      return "Bottlenecks are your lowest-performing paths among Scholar (study), Warrior (discipline/sleep), Sage (mindfulness), and Creator (projects). EvolveAura prioritizes quests in your bottleneck path to help you stabilize.";
    }
    if (query.includes('focus') || query.includes('timer') || query.includes('forest') || query.includes('pomodoro')) {
      return "The Focus page features a Pomodoro timer. Every 25-minute focus session you complete plants a tree in your Focus Forest and deals 100 damage to the active weekly boss!";
    }
    if (query.includes('subject') || query.includes('recall') || query.includes('study') || query.includes('analysis')) {
      return "In the Subjects tab, you can rate your understanding, retention, problem-solving, and confidence for different topics. Use active recall and spaced repetition to boost these stats.";
    }
    if (query.includes('free') || query.includes('cost') || query.includes('payment') || query.includes('money')) {
      return "EvolveAura is 100% free of charge! There are no premium plans, locks, or hidden fees. It is built purely as a self-improvement utility.";
    }

    return "I can help you with that! EvolveAura is built on Self-Regulated Learning models. You can retake the assessment to change your path, complete quests to level up, build your Focus Forest, and defeat distraction bosses!";
  };

  const handleSend = (text: string) => {
    if (!text.trim()) return;

    // Add user message
    const userMsg: Message = {
      sender: 'user',
      text,
      timestamp: new Date()
    };
    setMessages(prev => [...prev, userMsg]);
    setInputValue('');

    // Trigger bot typing
    setIsTyping(true);
    setTimeout(() => {
      setIsTyping(false);
      const botMsg: Message = {
        sender: 'bot',
        text: getBotReply(text),
        timestamp: new Date()
      };
      setMessages(prev => [...prev, botMsg]);
    }, 1000);
  };

  return (
    <>
      {/* Floating Chat Button */}
      <button
        id="aura-chatbot"
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
                  <h4 className="text-white font-extrabold text-xs uppercase tracking-wider">Aura Assistant</h4>
                  <span className="text-[10px] text-emerald-400 font-semibold block">Online & Calibration Ready</span>
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
                        ? 'bg-[#8B5CF6] text-white rounded-tr-none'
                        : 'bg-slate-950/60 border border-slate-800 text-slate-300 rounded-tl-none leading-relaxed'
                    }`}
                  >
                    {msg.text}
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
                  <div className="px-3.5 py-2.5 rounded-2xl bg-slate-950/60 border border-slate-800 text-slate-400 text-xs flex space-x-1 items-center rounded-tl-none">
                    <span className="w-1.5 h-1.5 bg-slate-500 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                    <span className="w-1.5 h-1.5 bg-slate-500 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                    <span className="w-1.5 h-1.5 bg-slate-500 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Suggestions & Input */}
            <div className="p-4 border-t border-slate-850 bg-slate-950/20 space-y-3">
              {messages.length === 1 && !isTyping && (
                <div className="flex flex-wrap gap-1.5">
                  {SUGGESTIONS.map((s) => (
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
                  placeholder="Ask a question about the platform..."
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
