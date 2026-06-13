"use client";
import React, { useState } from 'react';

const PRESETS = [
  { email: "sundhip@gmail.com", name: "sundhip", initial: "S", color: "bg-blue-600" },
  { email: "evolver.master@gmail.com", name: "Aura Master", initial: "A", color: "bg-purple-600" },
  { email: "test.aura@gmail.com", name: "Aura Initiate", initial: "I", color: "bg-emerald-600" }
];

export default function GoogleSimulatorPage() {
  const [customMode, setCustomMode] = useState(false);
  const [customName, setCustomName] = useState('');
  const [customEmail, setCustomEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [selectedUser, setSelectedUser] = useState<any>(null);

  const handleSelect = (name: string, email: string) => {
    setSelectedUser({ name, email });
    setLoading(true);
    setTimeout(() => {
      if (window.opener) {
        window.opener.postMessage(
          { type: 'GOOGLE_AUTH_SUCCESS', name, email },
          window.location.origin
        );
        window.close();
      } else {
        alert(`Logged in as ${name} (${email})! [No parent window detected]`);
        setLoading(false);
      }
    }, 1200);
  };

  const handleCustomSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customName || !customEmail) return;
    handleSelect(customName, customEmail);
  };

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4 font-sans selection:bg-blue-100 text-slate-800">
      <div className="w-full max-w-[450px] bg-white border border-slate-200 rounded-lg px-8 py-10 shadow-sm flex flex-col justify-between min-h-[500px]">
        <div>
          {/* Google Logo */}
          <div className="flex justify-center mb-6">
            <svg className="h-6" viewBox="0 0 74 24" fill="none">
              <path d="M7.9 16C5.4 16 3.4 14 3.4 11.2S5.4 6.4 7.9 6.4c1.2 0 2.4.5 3.2 1.4L13 5.9C11.7 4.5 9.9 3.6 7.9 3.6 3.8 3.6.5 7 .5 11.2s3.3 7.6 7.4 7.6c2.2 0 4.1-.9 5.3-2.4l-1.9-1.9c-.8.9-2 1.5-3.4 1.5z" fill="#4285F4"/>
              <path d="M19.4 6.4c-2.7 0-4.8 2.1-4.8 4.8s2.1 4.8 4.8 4.8 4.8-2.1 4.8-4.8-2.1-4.8-4.8-4.8zm0 7C17.9 13.4 16.7 12 16.7 11.2s1.2-2.2 2.7-2.2c1.5 0 2.7 1.4 2.7 2.2s-1.2 2.2-2.7 2.2z" fill="#EA4335"/>
              <path d="M30.4 6.4c-2.7 0-4.8 2.1-4.8 4.8s2.1 4.8 4.8 4.8 4.8-2.1 4.8-4.8-2.1-4.8-4.8-4.8zm0 7C28.9 13.4 27.7 12 27.7 11.2s1.2-2.2 2.7-2.2c1.5 0 2.7 1.4 2.7 2.2s-1.2 2.2-2.7 2.2z" fill="#FBBC05"/>
              <path d="M41 6.8v10.8c0 4.5-2.6 6.3-5.7 6.3-2.9 0-4.7-2-5.4-3.6l2.5-1c.4 1.1 1.4 2.3 2.9 2.3 1.9 0 3-1.2 3-3.4v-.8h-.1c-.6.8-1.8 1.5-3.3 1.5-3.1 0-5.9-2.7-5.9-6.3S32.3 3.6 35.4 3.6c1.5 0 2.7.7 3.3 1.5h.1v-1H41zm-2.8 4.4c0-1.6-1.1-2.8-2.6-2.8-1.5 0-2.7 1.2-2.7 2.8s1.2 2.8 2.7 2.8c1.5 0 2.6-1.2 2.6-2.8z" fill="#4285F4"/>
              <path d="M45.5.9h2.8v16.9h-2.8z" fill="#34A853"/>
              <path d="M55.8 8.8c.6-.9 1.6-1.4 2.7-1.4 1.2 0 2.1.6 2.6 1.4l.2.3-5.5 2.3zm2.5-5.2c-2.6 0-4.8 2.1-4.8 4.8S55.7 16 58.3 16c2.1 0 3.7-1.3 4.3-3l-.3-.2c-.7.5-1.9.9-2.9.9-1.9 0-3-1-3.6-2.4l7.6-3.1-1.2-3.1c-.5-1.2-1.8-2.5-4-2.5z" fill="#EA4335"/>
            </svg>
          </div>

          {!loading ? (
            <>
              {!customMode ? (
                <div className="space-y-6">
                  <div className="text-center">
                    <h1 className="text-2xl font-normal text-slate-900 tracking-tight">Choose an account</h1>
                    <p className="text-sm text-slate-500 mt-2">to continue to <span className="font-semibold text-indigo-600">EvolveAura</span></p>
                  </div>

                  {/* Preset Accounts List */}
                  <div className="border border-slate-200 rounded-md overflow-hidden divide-y divide-slate-100">
                    {PRESETS.map((user) => (
                      <button
                        key={user.email}
                        onClick={() => handleSelect(user.name, user.email)}
                        className="w-full px-4 py-3 flex items-center hover:bg-slate-50 transition text-left cursor-pointer"
                      >
                        <div className={`w-8 h-8 rounded-full ${user.color} text-white flex items-center justify-center font-bold text-sm mr-3`}>
                          {user.initial}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-semibold text-slate-800 truncate">{user.name}</p>
                          <p className="text-xs text-slate-500 truncate">{user.email}</p>
                        </div>
                      </button>
                    ))}

                    <button
                      onClick={() => setCustomMode(true)}
                      className="w-full px-4 py-3.5 flex items-center hover:bg-slate-50 transition text-left text-sm font-medium text-slate-600 cursor-pointer"
                    >
                      <div className="w-8 h-8 rounded-full border border-slate-200 text-slate-500 flex items-center justify-center text-lg mr-3">
                        +
                      </div>
                      Use another account
                    </button>
                  </div>
                </div>
              ) : (
                <div className="space-y-6">
                  <div className="text-center">
                    <h1 className="text-2xl font-normal text-slate-900 tracking-tight">Sign in</h1>
                    <p className="text-sm text-slate-500 mt-2">Use your mock Google Account</p>
                  </div>

                  <form onSubmit={handleCustomSubmit} className="space-y-4">
                    <div>
                      <input
                        type="text"
                        required
                        value={customName}
                        onChange={(e) => setCustomName(e.target.value)}
                        placeholder="Google Account Name"
                        className="w-full px-3 py-3 border border-slate-300 rounded-md focus:outline-none focus:border-blue-500 text-sm placeholder:text-slate-400"
                      />
                    </div>
                    <div>
                      <input
                        type="email"
                        required
                        value={customEmail}
                        onChange={(e) => setCustomEmail(e.target.value)}
                        placeholder="Email (e.g. user@gmail.com)"
                        className="w-full px-3 py-3 border border-slate-300 rounded-md focus:outline-none focus:border-blue-500 text-sm placeholder:text-slate-400"
                      />
                    </div>

                    <div className="flex justify-between items-center pt-4">
                      <button
                        type="button"
                        onClick={() => setCustomMode(false)}
                        className="text-sm text-blue-600 hover:text-blue-700 font-semibold cursor-pointer"
                      >
                        Back to accounts
                      </button>
                      <button
                        type="submit"
                        className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-md font-medium text-sm transition cursor-pointer"
                      >
                        Next
                      </button>
                    </div>
                  </form>
                </div>
              )}
            </>
          ) : (
            <div className="flex flex-col items-center justify-center space-y-6 py-12">
              {/* Spinner */}
              <div className="w-10 h-10 border-3 border-blue-600 border-t-transparent rounded-full animate-spin" />
              <div className="text-center">
                <p className="text-sm font-semibold text-slate-800">Signing you in...</p>
                <p className="text-xs text-slate-400 mt-1">Authenticating {selectedUser?.email}</p>
              </div>
            </div>
          )}
        </div>

        <div className="text-xs text-slate-400 mt-8 leading-relaxed">
          To continue, Google will share your name, email address, profile picture, and language preference with EvolveAura.
        </div>
      </div>
    </div>
  );
}
