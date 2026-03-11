/**
 * Centralized API configuration for the EduBridge frontend
 * 
 * This utility provides a consistent way to access the FastAPI backend URL
 * across the entire application. It uses environment variables with a fallback
 * to the production Render backend.
 * 
 * Usage:
 *   import { getApiUrl, API_ENDPOINTS } from '@/lib/api';
 *   
 *   // Get full URL for an endpoint
 *   const url = getApiUrl('/auth/login');
 *   
 *   // Or use predefined endpoints
 *   const url = getApiUrl(API_ENDPOINTS.LOGIN);
 */

// Default to production URL - this is the Render deployed backend
const DEFAULT_API_URL = 'https://edubridge-ai-ui2j.onrender.com';

/**
 * Get the API base URL
 * Uses NEXT_PUBLIC_API_URL env variable if set, otherwise falls back to default
 */
export function getApiUrl(): string {
  if (typeof window !== 'undefined') {
    // Client-side
    return process.env.NEXT_PUBLIC_API_URL || DEFAULT_API_URL;
  }
  // Server-side
  return process.env.NEXT_PUBLIC_API_URL || DEFAULT_API_URL;
}

/**
 * Build a full URL for an API endpoint
 * @param endpoint - The API endpoint path (e.g., '/auth/login')
 * @returns Full URL to the API endpoint
 */
export function buildApiUrl(endpoint: string): string {
  const baseUrl = getApiUrl();
  // Remove leading slash from endpoint if present to avoid double slashes
  const cleanEndpoint = endpoint.startsWith('/') ? endpoint.slice(1) : endpoint;
  return `${baseUrl}/${cleanEndpoint}`;
}

/**
 * Predefined API endpoints for consistent usage across the app
 * Note: These match the backend routes in the new FastAPI structure
 */
export const API_ENDPOINTS = {
  // Authentication - matches /api/auth/* routes
  LOGIN: '/api/auth/login',
  LOGOUT: '/api/auth/logout',
  SIGNUP: '/api/auth/register',
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
 * Type for predefined endpoint keys
 */
export type ApiEndpointKey = keyof typeof API_ENDPOINTS;

/**
 * Get the full URL for a predefined endpoint
 * @param endpointKey - The key from API_ENDPOINTS
 * @returns Full URL to the API endpoint
 */
export function getEndpointUrl(endpointKey: ApiEndpointKey): string {
  return buildApiUrl(API_ENDPOINTS[endpointKey]);
}

// Re-export buildApiUrl as getApiUrl for backward compatibility
// Note: The main export is the function getApiUrl defined above

export default getApiUrl;

