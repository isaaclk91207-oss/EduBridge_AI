/**
 * Centralized API configuration for the EduBridge frontend
 * 
 * This utility provides a consistent way to access the FastAPI backend URL
 * across the entire application. The backend is deployed on Render.
 * 
 * Usage:
 *   import { getEndpointUrl } from '@/lib/api';
 *   
 *   // Get full URL for an endpoint - FORCES use of the full Render URL
 *   const url = getEndpointUrl('/api/auth/register');
 */

// Use environment variable with fallback to hardcoded URL for development
// THIS IS YOUR RENDER BACKEND URL - ALL API CALLS GO THROUGH HERE
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'https://edubridge-ai-ui2j.onrender.com';

/**
 * Build a full URL for an API endpoint - FORCES use of the full Render URL
 * @param endpoint - The API endpoint path (e.g., '/api/auth/register')
 * @returns Full URL to the API endpoint on Render
 * 
 * @example
 * const url = getEndpointUrl('/api/auth/register');
 * // Returns: 'https://edubridge-ai-ui2j.onrender.com/api/auth/register'
 */
export const getEndpointUrl = (endpoint: string): string => {
  // Remove leading slash from endpoint if present to avoid double slashes
  const cleanEndpoint = endpoint.startsWith('/') ? endpoint.slice(1) : endpoint;
  const fullUrl = `${API_BASE_URL}/${cleanEndpoint}`;
  
  // Debug log so you can verify in browser console
  console.log(`[API] Calling: ${fullUrl}`);
  
  return fullUrl;
};

/**
 * Get the raw backend URL
 * @returns The backend URL
 */
export const getApiBaseUrl = (): string => {
  return API_BASE_URL;
};

/**
 * Predefined API endpoints for consistent usage across the app
 * Note: These match the backend routes in the FastAPI structure
 */
export const API_ENDPOINTS = {
  // Authentication - matches /api/auth/* routes
  LOGIN: '/api/auth/login',
  LOGOUT: '/api/auth/logout',
  REGISTER: '/api/auth/register',
  ME: '/api/auth/me',
  
  // User endpoints - matches /api/users/* routes
  USER_PROFILE: '/api/users/profile',
  USER_STORE: '/api/users/store',
  
  // Lecture endpoints - matches /api/lectures/* routes
  LECTURES: '/api/lectures',
  LECTURE: '/api/lectures/:id',
  
  // Candidate endpoints - matches /api/candidates/* routes
  CANDIDATES: '/api/candidates',
  CANDIDATE: '/api/candidates/:id',
  
  // Progress endpoints
  PROGRESS_UPDATE: '/api/progress/update',
  
  // AI endpoints
  ANALYZE_CANDIDATE: '/api/analyze-candidate',
  GENERATE_ROADMAP: '/api/generate-roadmap',
  EXECUTE: '/api/execute',
} as const;

/**
 * Get the full URL for a predefined endpoint
 * @param endpointKey - The key from API_ENDPOINTS
 * @returns Full URL to the API endpoint
 */
export const getFullEndpointUrl = (endpointKey: keyof typeof API_ENDPOINTS): string => {
  return getEndpointUrl(API_ENDPOINTS[endpointKey]);
};

export default getEndpointUrl;
export { getEndpointUrl as buildApiUrl };

