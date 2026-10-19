export const getBaseUrl = () => {
  if (typeof window !== 'undefined') {
    if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
      return 'http://localhost:5000/api';
    }
    // Allow custom override in localStorage if configured
    const savedApi = localStorage.getItem('NEXT_PUBLIC_API_URL');
    if (savedApi && savedApi.trim()) {
      const trimmed = savedApi.trim().replace(/\/+$/, '');
      return trimmed.endsWith('/api') ? trimmed : `${trimmed}/api`;
    }
  }

  let url = process.env.NEXT_PUBLIC_API_URL || '';
  if (!url) {
    if (typeof window !== 'undefined' && window.location.hostname !== 'localhost') {
      url = '/api';
    } else {
      url = 'http://localhost:5000/api';
    }
  }

  if (!url.endsWith('/api')) {
    url = url.replace(/\/+$/, '') + '/api';
  }
  return url;
};

export async function apiRequest(endpoint: string, options: RequestInit = {}) {
  const baseUrl = getBaseUrl();
  const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...((options.headers as Record<string, string>) || {})
  };

  const targetUrl = `${baseUrl}${endpoint}`;

  let response: Response;
  try {
    response = await fetch(targetUrl, {
      ...options,
      headers
    });
  } catch (err: any) {
    const isNetworkError =
      err?.name === 'TypeError' ||
      err?.message?.includes('fetch') ||
      err?.message?.includes('NetworkError');

    if (isNetworkError) {
      throw new Error(
        'Unable to connect to backend server. Render free instances sleep after inactivity and take ~30–50s to wake up. Please wait a moment and retry.'
      );
    }
    throw err;
  }

  const contentType = response.headers.get('content-type') || '';
  let data: any = null;

  if (contentType.includes('application/json')) {
    try {
      data = await response.json();
    } catch {
      data = null;
    }
  } else {
    // Non-JSON response (such as HTML 502/503 from Render cold start, Cloudflare, or 404 from frontend router)
    if (!response.ok) {
      if (response.status === 502 || response.status === 503 || response.status === 504) {
        throw new Error(
          'Backend server is waking up from sleep (Render free tier spin-up takes ~30–50s). Please wait a few seconds and click Retry.'
        );
      }
      if (response.status === 404) {
        throw new Error(
          `API endpoint not found (404) at ${targetUrl}. Please ensure your backend is deployed and NEXT_PUBLIC_API_URL is configured.`
        );
      }
      throw new Error(`Server returned HTTP ${response.status} (${response.statusText || 'Error'}).`);
    }
  }

  if (!response.ok) {
    throw new Error(data?.error || `Request failed with status ${response.status}`);
  }

  return data;
}

export async function determinePostAuthRoute(user?: any): Promise<string> {
  try {
    const status = await apiRequest('/assessment/status');
    if (status.hasCompletedAssessment) {
      let chosenPath = user?.profile?.chosenPath;
      if (!chosenPath) {
        try {
          const profileData = await apiRequest('/auth/profile');
          chosenPath = profileData?.profile?.chosenPath;
        } catch {
          // ignore
        }
      }
      return chosenPath ? '/dashboard' : '/choose-path';
    }
  } catch {
    // If status check fails, fallback to profile check
  }

  const profile = user?.profile;
  const isProfileIncomplete = !profile || !profile.name || !profile.role || !profile.primaryGoal;
  return isProfileIncomplete ? '/onboarding' : '/assessment';
}
