'use client';

import { remult } from 'remult';

// Configure Remult to connect to the API server
export const api = remult;

if (typeof window !== 'undefined') {
  api.apiClient.url = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api';

  // Set JWT token from localStorage if available
  const token = localStorage.getItem('authToken');
  if (token) {
    api.apiClient.httpClient = async (url, init) => {
      const headers = new Headers(init?.headers);
      headers.set('Authorization', `Bearer ${token}`);

      return fetch(url, {
        ...init,
        headers,
      });
    };
  }
}

/**
 * Set the JWT authentication token
 * @param token - JWT token from login/register
 */
export function setAuthToken(token: string) {
  if (typeof window !== 'undefined') {
    localStorage.setItem('authToken', token);

    // Update the HTTP client with the new token
    api.apiClient.httpClient = async (url, init) => {
      const headers = new Headers(init?.headers);
      headers.set('Authorization', `Bearer ${token}`);

      return fetch(url, {
        ...init,
        headers,
      });
    };
  }
}

/**
 * Clear authentication (logout)
 */
export function clearAuth() {
  if (typeof window !== 'undefined') {
    localStorage.removeItem('authToken');
    api.apiClient.httpClient = fetch;
  }
}

// Legacy support - will be removed in future versions
/** @deprecated Use setAuthToken instead */
export const setSessionId = setAuthToken;
/** @deprecated Use clearAuth instead */
export const clearSession = clearAuth;
