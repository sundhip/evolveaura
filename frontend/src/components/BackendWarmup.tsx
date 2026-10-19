"use client";
import { useEffect } from 'react';
import { getBaseUrl } from '../lib/api';

/**
 * Client component that mounts once in the RootLayout to immediately pre-warm
 * the backend server on initial site visit, eliminating cold-start latency before
 * the user navigates to interactive flows like /assessment or /dashboard.
 */
export default function BackendWarmup() {
  useEffect(() => {
    try {
      const baseUrl = getBaseUrl();
      const healthUrl = baseUrl.endsWith('/api')
        ? `${baseUrl.slice(0, -4)}/health`
        : `${baseUrl}/health`;

      // Non-blocking fire-and-forget pre-warming ping
      fetch(healthUrl, {
        method: 'GET',
        cache: 'no-store',
      }).catch(() => {
        // Silently catch - this is purely a wake-up ping
      });
    } catch {
      // Ignore
    }
  }, []);

  return null;
}
