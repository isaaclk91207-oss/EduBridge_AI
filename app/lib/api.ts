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
  LOGIN: '/api/v1/authentication/login',
  LOGOUT: '/api/v1/authentication/logout',
  REGISTER: '/api/v1/authentication/register',
  ME: '/api/v1/authentication/login',
  USER_PROFILE: '/api/v1/user/profile',
  USER_STORE: '/api/v1/user/profile',
  LECTURES: '/api/lectures',
  LECTURE: '/api/lectures/:id',
  CANDIDATES: '/api/candidates',
  CANDIDATE: '/api/candidates/:id',
  PROGRESS_UPDATE: '/api/progress/update',
  ANALYZE_CANDATE: '/api/v1/chat/portfolio-analysis',
  GENERATE_ROADMAP: '/api/v1/chat/roadmap',
  EXECUTE: '/api/execute',
  // AI Chat endpoints
  CHAT_COFOUNDER: '/api/v1/chat/cofounder',
  CHAT_MENTOR: '/api/v1/chat/mentor',
  CHAT_SUPPORT: '/api/v1/chat/support',
  CHAT_ROADMAP: '/api/v1/chat/roadmap',
  CHAT_PORTFOLIO: '/api/v1/chat/portfolio-analysis',
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

