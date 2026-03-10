/**
 * Centralized API configuration for the EduBridge frontend
 * 
 * This utility provides a consistent way to access the FastAPI backend URL
 * across the entire application. It uses environment variables with a fallback
 * to the production Vercel deployment.
 * 
 * Usage:
 *   import { getApiUrl, API_ENDPOINTS } from '@/lib/api';
 *   
 *   // Get full URL for an endpoint
 *   const url = getApiUrl('/authentication/login');
 *   
 *   // Or use predefined endpoints
 *   const chatUrl = getApiUrl(API_ENDPOINTS.CHAT);
 */

// Default to production URL - this is the Vercel deployed backend
const DEFAULT_API_URL = 'https://edu-bridge-ai-backend.vercel.app';

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
 * @param endpoint - The API endpoint path (e.g., '/authentication/login')
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
 */
export const API_ENDPOINTS = {
  // Authentication
  LOGIN: '/authentication/login',
  LOGOUT: '/authentication/logout',
  SIGNUP: '/authentication/signup',
  
  // Chat endpoints
  CHAT: '/api/chat',
  CHAT_MENTOR: '/chat/mentor',
  CHAT_COFOUNDER: '/chat/cofounder',
  
  // User endpoints
  USER_PROFILE: '/api/user/profile',
  USER_STORE: '/api/user/store',
  
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

