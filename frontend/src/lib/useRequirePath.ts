"use client";
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { apiRequest } from './api';

export function useRequirePath() {
  const router = useRouter();
  const [checking, setChecking] = useState(true);
  const [profile, setProfile] = useState<any>(null);

  useEffect(() => {
    let isMounted = true;

    async function verify() {
      try {
        const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
        if (!token) {
          router.replace('/login');
          return;
        }

        // 1. Check assessment status
        const status = await apiRequest('/assessment/status');
        if (!status?.hasCompletedAssessment) {
          router.replace('/assessment');
          return;
        }

        // 2. Fetch profile to check chosenPath
        const user = await apiRequest('/auth/profile');
        const userProfile = user?.profile;

        if (!userProfile?.chosenPath) {
          router.replace('/choose-path');
          return;
        }

        if (isMounted) {
          setProfile(userProfile);
          setChecking(false);
        }
      } catch (err: any) {
        console.error('useRequirePath check error:', err);
        const hasToken = typeof window !== 'undefined' && !!localStorage.getItem('token');
        if (!hasToken || err?.message?.includes('401')) {
          router.replace('/login');
        }
      }
    }

    verify();

    return () => {
      isMounted = false;
    };
  }, [router]);

  return { checking, profile };
}
