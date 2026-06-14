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
        // Generate a fake JWT token payload that mirrors Google GSI's JWT structure
        // This allows the backend to parse it correctly in sandbox mode.
        const header = btoa(JSON.stringify({ alg: "RS256", kid: "mock" }));
        const payload = btoa(JSON.stringify({
          iss: "accounts.google.com",
          sub: `google-mock-${Math.random().toString(36).substring(2, 11)}`,
          email: email,
          email_verified: true,
          name: name,
          picture: `https://api.dicebear.com/7.x/bottts/svg?seed=${name}`,
          given_name: name,
          iat: Math.floor(Date.now() / 1000),
          exp: Math.floor(Date.now() / 1000) + 3600
        }));
        const signature = "mock-signature";
        const credential = `${header}.${payload}.${signature}`;

        window.opener.postMessage(
          { type: 'GOOGLE_AUTH_SUCCESS', name, email, credential },
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
    <div className="min-h-screen bg-[#0F172A] text-slate-100 flex items-center justify-center p-6 font-sans">
      <div className="w-full max-w-[1000px] grid grid-cols-1 md:grid-cols-12 gap-8 items-stretch">
        
        {/* Left Column: Google Accounts Chooser (Simulator UI) */}
        <div className="md:col-span-5 bg-white text-slate-800 border border-slate-200 rounded-2xl px-6 py-8 shadow-2xl flex flex-col justify-between min-h-[480px]">
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
                      <h1 className="text-xl font-normal text-slate-900 tracking-tight">Choose an account</h1>
                      <p className="text-xs text-slate-500 mt-2">to continue to <span className="font-semibold text-indigo-600">EvolveAura</span></p>
                    </div>

                    {/* Preset Accounts List */}
                    <div className="border border-slate-200 rounded-lg overflow-hidden divide-y divide-slate-100">
                      {PRESETS.map((user) => (
                        <button
                          key={user.email}
                          onClick={() => handleSelect(user.name, user.email)}
                          className="w-full px-4 py-3 flex items-center hover:bg-slate-50 transition text-left cursor-pointer"
                        >
                          <div className={`w-7 h-7 rounded-full ${user.color} text-white flex items-center justify-center font-bold text-xs mr-3`}>
                            {user.initial}
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-xs font-semibold text-slate-800 truncate">{user.name}</p>
                            <p className="text-[10px] text-slate-500 truncate">{user.email}</p>
                          </div>
                        </button>
                      ))}

                      <button
                        onClick={() => setCustomMode(true)}
                        className="w-full px-4 py-3 flex items-center hover:bg-slate-50 transition text-left text-xs font-medium text-slate-600 cursor-pointer"
                      >
                        <div className="w-7 h-7 rounded-full border border-slate-200 text-slate-500 flex items-center justify-center text-sm mr-3">
                          +
                        </div>
                        Use another account
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-6">
                    <div className="text-center">
                      <h1 className="text-xl font-normal text-slate-900 tracking-tight">Sign in</h1>
                      <p className="text-xs text-slate-500 mt-1">Use a sandbox Google Account</p>
                    </div>

                    <form onSubmit={handleCustomSubmit} className="space-y-4">
                      <div>
                        <input
                          type="text"
                          required
                          value={customName}
                          onChange={(e) => setCustomName(e.target.value)}
                          placeholder="Full Name"
                          className="w-full px-3 py-2.5 border border-slate-300 rounded-md focus:outline-none focus:border-indigo-500 text-xs placeholder:text-slate-400"
                        />
                      </div>
                      <div>
                        <input
                          type="email"
                          required
                          value={customEmail}
                          onChange={(e) => setCustomEmail(e.target.value)}
                          placeholder="Email Address"
                          className="w-full px-3 py-2.5 border border-slate-300 rounded-md focus:outline-none focus:border-indigo-500 text-xs placeholder:text-slate-400"
                        />
                      </div>

                      <div className="flex justify-between items-center pt-2">
                        <button
                          type="button"
                          onClick={() => setCustomMode(false)}
                          className="text-xs text-indigo-600 hover:text-indigo-700 font-semibold cursor-pointer"
                        >
                          Back to presets
                        </button>
                        <button
                          type="submit"
                          className="px-5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-md font-medium text-xs transition cursor-pointer"
                        >
                          Continue
                        </button>
                      </div>
                    </form>
                  </div>
                )}
              </>
            ) : (
              <div className="flex flex-col items-center justify-center space-y-4 py-12">
                <div className="w-8 h-8 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin" />
                <div className="text-center">
                  <p className="text-xs font-semibold text-slate-800">Signing you in...</p>
                  <p className="text-[10px] text-slate-400 mt-0.5">Redirecting credentials</p>
                </div>
              </div>
            )}
          </div>

          <div className="text-[10px] text-slate-400 mt-8 leading-normal border-t border-slate-100 pt-4">
            Sandbox Simulator: Google Identity Services token structure is generated and returned to your host.
          </div>
        </div>

        {/* Right Column: Google OAuth Integration Setup Guide */}
        <div className="md:col-span-7 bg-[#1E293B] border border-slate-800 rounded-2xl p-6 shadow-2xl flex flex-col justify-between text-slate-200">
          <div>
            <div className="flex items-center space-x-2 mb-4 border-b border-slate-800 pb-3">
              <span className="p-1.5 bg-indigo-500/10 text-indigo-400 rounded-lg text-sm">💡</span>
              <h2 className="text-lg font-bold text-white tracking-tight">Zero-Cost Google Integration Setup</h2>
            </div>
            
            <p className="text-xs text-slate-400 mb-4 leading-relaxed">
              Google Identity Services is 100% free with no usage limits. To hook up real Google Authentication and enable Google One Tap, complete these simple steps:
            </p>

            <div className="space-y-4 text-xs">
              <div className="flex space-x-3">
                <span className="font-bold text-indigo-400">1.</span>
                <div>
                  <p className="font-semibold text-white">Register a Google Cloud Project</p>
                  <p className="text-slate-400">Go to <a href="https://console.cloud.google.com/" target="_blank" rel="noopener noreferrer" className="text-indigo-400 hover:underline">console.cloud.google.com</a> and create a free project.</p>
                </div>
              </div>

              <div className="flex space-x-3">
                <span className="font-bold text-indigo-400">2.</span>
                <div>
                  <p className="font-semibold text-white">Setup OAuth Consent Screen</p>
                  <p className="text-slate-400">Navigate to <b>OAuth consent screen</b>, choose <b>External</b>, and add your app name (e.g., EvolveAura). No payment/verification is required for testing.</p>
                </div>
              </div>

              <div className="flex space-x-3">
                <span className="font-bold text-indigo-400">3.</span>
                <div>
                  <p className="font-semibold text-white">Create credentials (Web App Client ID)</p>
                  <p className="text-slate-400">Go to <b>Credentials</b> → <b>Create Credentials</b> → <b>OAuth client ID</b>.</p>
                  <ul className="list-disc list-inside mt-1 space-y-0.5 text-slate-400 pl-1">
                    <li>Application Type: <b>Web Application</b></li>
                    <li>Authorized JavaScript Origins: <code className="bg-slate-900 px-1 py-0.5 rounded text-[11px]">http://localhost:3000</code></li>
                  </ul>
                </div>
              </div>

              <div className="flex space-x-3">
                <span className="font-bold text-indigo-400">4.</span>
                <div>
                  <p className="font-semibold text-white">Configure Environment Variables</p>
                  <p className="text-slate-400">Add the client ID you received to the variables below:</p>
                </div>
              </div>
            </div>
          </div>

          <div className="mt-6 pt-4 border-t border-slate-800">
            <p className="text-[11px] font-bold text-indigo-400 mb-2 uppercase tracking-wider">Required Environment Variables</p>
            <div className="space-y-2">
              <div>
                <p className="text-[10px] text-slate-500 font-mono">Frontend: root-dir/.env (or inline)</p>
                <div className="bg-slate-950 p-2.5 rounded-lg border border-slate-800 text-[11px] font-mono text-emerald-400 overflow-x-auto break-all select-all">
                  NEXT_PUBLIC_GOOGLE_CLIENT_ID=your-client-id.apps.googleusercontent.com
                </div>
              </div>
              <div>
                <p className="text-[10px] text-slate-500 font-mono">Backend: backend/.env</p>
                <div className="bg-slate-950 p-2.5 rounded-lg border border-slate-800 text-[11px] font-mono text-emerald-400 overflow-x-auto break-all select-all">
                  GOOGLE_CLIENT_ID=your-client-id.apps.googleusercontent.com
                </div>
              </div>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
