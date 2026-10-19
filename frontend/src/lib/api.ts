const getBaseUrl = () => {
  if (typeof window !== 'undefined' && (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1')) {
    return 'http://localhost:5000/api';
  }
  let url = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';
  if (!url.endsWith('/api')) {
    url = `${url}/api`;
  }
  return url;
};

const BASE_URL = getBaseUrl();

export async function apiRequest(endpoint: string, options: RequestInit = {}) {
  const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
  const headers = {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...(options.headers || {})
  };

  const response = await fetch(`${BASE_URL}${endpoint}`, {
    ...options,
    headers
  });

  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.error || 'Something went wrong');
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
