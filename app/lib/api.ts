/**
 * Centralized API configuration for the EduBridge frontend
 */

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'https://edubridge-ai-ui2j.onrender.com';
const DEMO_TOKEN = 'DEMO_TOKEN_12345';

export const getEndpointUrl = (endpoint: string): string => {
  const cleanEndpoint = endpoint.startsWith('/') ? endpoint.slice(1) : endpoint;
  return `${API_BASE_URL}/${cleanEndpoint}`;
};

export const getApiBaseUrl = (): string => API_BASE_URL;

export const API_ENDPOINTS = {
  LOGIN: '/api/auth/login',
  LOGOUT: '/api/auth/logout',
  REGISTER: '/api/auth/register',
  ME: '/api/auth/me',
  USER_PROFILE: '/api/users/profile',
  USER_STORE: '/api/users/store',
  LECTURES: '/api/lectures',
  LECTURE: '/api/lectures/:id',
  CANDIDATES: '/api/candidates',
  CANDIDATE: '/api/candidates/:id',
  PROGRESS_UPDATE: '/api/progress/update',
  ANALYZE_CANDIDATE: '/api/analyze-candidate',
  GENERATE_ROADMAP: '/api/generate-roadmap',
  EXECUTE: '/api/execute',
} as const;

export const getFullEndpointUrl = (endpointKey: keyof typeof API_ENDPOINTS): string => {
  return getEndpointUrl(API_ENDPOINTS[endpointKey]);
};

function getAuthToken(): string | null {
  if (typeof window === 'undefined') return null;
  const localToken = localStorage.getItem('access_token');
  if (localToken) return localToken;
  const cookieMatch = document.cookie.match(/access_token=([^;]+)/);
  if (cookieMatch) return cookieMatch[1];
  return null;
}

export async function fetchWithAuth(url: string, options: RequestInit = {}): Promise<Response> {
  const token = getAuthToken();
  const headers = new Headers(options.headers);
  
  if (['POST', 'PUT', 'PATCH'].includes(options.method || '') && !headers.has('Content-Type')) {
    headers.set('Content-Type', 'application/json');
  }
  
  if (token) {
    headers.set('Authorization', `Bearer ${token}`);
  }
  
  return fetch(url, { ...options, headers, credentials: 'include' });
}

export default getEndpointUrl;
export { getEndpointUrl as buildApiUrl };

