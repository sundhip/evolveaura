"use client";
import React, { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { apiRequest } from '../../lib/api';

export default function RegisterPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleGoogleAuth = useCallback(async (payload: { email?: string; name?: string; googleId?: string; credential?: string; accessToken?: string }) => {
    setLoading(true);
    setError('');
    try {
      const bodyPayload: any = {};
      if (payload.credential) {
        bodyPayload.credential = payload.credential;
      } else if (payload.accessToken) {
        bodyPayload.accessToken = payload.accessToken;
      } else {
        bodyPayload.email = payload.email;
        bodyPayload.name = payload.name;
        bodyPayload.googleId = payload.googleId || `google-mock-${Math.random().toString(36).substring(2, 11)}`;
      }

      const data = await apiRequest('/auth/google', {
        method: 'POST',
        body: JSON.stringify(bodyPayload)
      });
      localStorage.setItem('token', data.token);
      localStorage.setItem('user', JSON.stringify(data.user));
      
      if (data.user.profile && data.user.profile.auraScore > 0) {
        router.push('/dashboard');
      } else {
        localStorage.setItem('shouldShowTour', 'true');
        router.push('/onboarding');
      }
    } catch (err: any) {
      setError(err.message || 'Google Authentication failed');
    } finally {
      setLoading(false);
    }
  }, [router]);

  const triggerGoogleLogin = () => {
    const clientId = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID;
    if (!clientId) {
      handleGoogleClick();
      return;
    }

    try {
      const google = (window as any).google;
      if (google?.accounts?.oauth2) {
        const tokenClient = google.accounts.oauth2.initTokenClient({
          client_id: clientId,
          scope: 'email profile openid',
          callback: (res: any) => {
            if (res && res.access_token) {
              handleGoogleAuth({ accessToken: res.access_token });
            }
          }
        });
        tokenClient.requestAccessToken();
      } else {
        setError('Google Sign-In SDK is loading. Please try again.');
      }
    } catch (err: any) {
      setError(err.message || 'Google Sign-In initialization failed');
    }
  };

  useEffect(() => {
    const handleMessage = async (event: MessageEvent) => {
      if (event.origin !== window.location.origin) return;
      if (event.data?.type === 'GOOGLE_AUTH_SUCCESS') {
        const { email: gEmail, name: gName, credential, googleId } = event.data;
        handleGoogleAuth({ email: gEmail, name: gName, credential, googleId });
      }
    };

    window.addEventListener('message', handleMessage);

    const clientId = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID;
    let script: HTMLScriptElement | null = null;

    if (clientId) {
      script = document.createElement('script');
      script.src = 'https://accounts.google.com/gsi/client';
      script.async = true;
      script.defer = true;
      script.onload = () => {
        const google = (window as any).google;
        if (google?.accounts?.id) {
          (window as any).googleAuthCallback = (res: any) => {
            if (res.credential) {
              handleGoogleAuth({ credential: res.credential });
            }
          };

          if (!(window as any).googleAccountsInitialized) {
            google.accounts.id.initialize({
              client_id: clientId,
              callback: (res: any) => {
                if (typeof (window as any).googleAuthCallback === 'function') {
                  (window as any).googleAuthCallback(res);
                }
              }
            });
            (window as any).googleAccountsInitialized = true;
          }

          // Trigger Google One Tap Login (runs in background, zero cost, optional popup)
          google.accounts.id.prompt();
        }
      };
      document.body.appendChild(script);
    }

    return () => {
      window.removeEventListener('message', handleMessage);
      if (script && document.body.contains(script)) {
        document.body.removeChild(script);
      }
    };
  }, [handleGoogleAuth]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const data = await apiRequest('/auth/register', {
        method: 'POST',
        body: JSON.stringify({ email, password, name })
      });
      localStorage.setItem('token', data.token);
      localStorage.setItem('user', JSON.stringify(data.user));
      localStorage.setItem('shouldShowTour', 'true');
      router.push('/onboarding');
    } catch (err: any) {
      setError(err.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleClick = () => {
    const width = 500;
    const height = 600;
    const left = window.screenX + (window.innerWidth - width) / 2;
    const top = window.screenY + (window.innerHeight - height) / 2;
    window.open(
      '/google-simulator',
      'GoogleAuthPopup',
      `width=${width},height=${height},left=${left},top=${top}`
    );
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-12 bg-[#0F172A]">
      <div className="w-full max-w-md glass-panel p-8">
        <h2 className="text-3xl font-extrabold text-white text-center mb-2">Create Account</h2>
        <p className="text-slate-400 text-sm text-center mb-8">Start your journey to digital freedom.</p>

        {error && (
          <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm mb-6 text-center">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-slate-300 text-sm font-semibold mb-2">Your Name</label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-4 py-3 rounded-xl bg-slate-900 border border-slate-700 text-white focus:outline-none focus:border-[#8B5CF6] transition"
              placeholder="John Doe"
            />
          </div>

          <div>
            <label className="block text-slate-300 text-sm font-semibold mb-2">Email Address</label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-3 rounded-xl bg-slate-900 border border-slate-700 text-white focus:outline-none focus:border-[#8B5CF6] transition"
              placeholder="name@domain.com"
            />
          </div>

          <div>
            <label className="block text-slate-300 text-sm font-semibold mb-2">Password</label>
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-3 rounded-xl bg-slate-900 border border-slate-700 text-white focus:outline-none focus:border-[#8B5CF6] transition"
              placeholder="••••••••"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-4 rounded-xl bg-[#8B5CF6] hover:bg-[#7c4fe3] disabled:opacity-50 text-white font-bold transition duration-300 cursor-pointer"
          >
            {loading ? 'Creating...' : 'Register'}
          </button>
        </form>

        <div className="relative my-6 flex items-center justify-center">
          <div className="absolute inset-0 h-px bg-slate-800" />
          <span className="relative px-3 text-xs text-slate-500 uppercase tracking-widest bg-[#0F172A]">Or continue with</span>
        </div>

        <button
          onClick={triggerGoogleLogin}
          disabled={loading}
          className="w-full py-4 rounded-xl bg-[#8B5CF6] hover:bg-[#7c4fe3] disabled:opacity-50 text-white font-bold transition duration-300 flex items-center justify-center space-x-2 cursor-pointer"
        >
          <svg className="w-5 h-5 mr-1" viewBox="0 0 24 24">
            <path fill="#EA4335" d="M12.24 10.285V14.4h6.887c-.648 2.41-2.519 4.114-5.136 4.114-3.41 0-6.19-2.78-6.19-6.19s2.78-6.19 6.19-6.19c1.7 0 3.107.674 4.14 1.767l3.123-3.123C19.26 2.03 16.02 0 12.24 0 5.48 0 0 5.48 0 12.24s5.48 12.24 12.24 12.24c6.88 0 12.24-5.36 12.24-12.24 0-.768-.072-1.5-.216-2.185H12.24z"/>
          </svg>
          <span>Sign Up with Google</span>
        </button>

        <p className="text-slate-400 text-sm text-center mt-6">
          Already have an account?{' '}
          <Link href="/login" className="text-[#8B5CF6] font-semibold hover:underline">
            Sign In
          </Link>
        </p>
      </div>
    </div>
  );
}
