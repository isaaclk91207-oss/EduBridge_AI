/**
 * Centralized API configuration for the EduBridge frontend
 * 
 * This utility provides a consistent way to access the FastAPI backend URL
 * across the entire application. The backend is deployed on Render.
 * 
 * Usage:
 *   import { buildApiUrl, API_ENDPOINTS } from '@/lib/api';
 *   
 *   // Get full URL for an endpoint
 *   const url = buildApiUrl('/api/auth/register');
 */

// Use environment variable with fallback to hardcoded URL for development
const BACKEND_URL = process.env.NEXT_PUBLIC_API_URL || 'https://edubridge-ai-ui2j.onrender.com';

/**
 * Build a full URL for an API endpoint
 * @param endpoint - The API endpoint path (e.g., '/api/auth/register')
 * @returns Full URL to the API endpoint
 */
export function buildApiUrl(endpoint: string): string {
  // Remove leading slash from endpoint if present to avoid double slashes
  const cleanEndpoint = endpoint.startsWith('/') ? endpoint.slice(1) : endpoint;
  const fullUrl = `${BACKEND_URL}/${cleanEndpoint}`;
  console.log('API URL:', fullUrl); // Debug log
  return fullUrl;
}

/**
 * Get the raw backend URL
 * @returns The backend URL
 */
export function getBackendUrl(): string {
  return BACKEND_URL;
}

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

/**
 * Get the API base URL
 * @returns The backend URL
 */
export function getApiUrl(): string {
  return BACKEND_URL;
}

export default buildApiUrl;

