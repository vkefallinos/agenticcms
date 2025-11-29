'use client';

import { remult } from 'remult';

// Configure Remult to connect to the API server
export const api = remult;

if (typeof window !== 'undefined') {
  api.apiClient.url = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api';

  // Set session ID from localStorage if available
  const sessionId = localStorage.getItem('sessionId');
  if (sessionId) {
    api.apiClient.httpClient = async (url, init) => {
      const headers = new Headers(init?.headers);
      headers.set('x-session-id', sessionId);

      return fetch(url, {
        ...init,
        headers,
      });
    };
  }
}

export function setSessionId(sessionId: string) {
  if (typeof window !== 'undefined') {
    localStorage.setItem('sessionId', sessionId);

    // Update the HTTP client with the new session ID
    api.apiClient.httpClient = async (url, init) => {
      const headers = new Headers(init?.headers);
      headers.set('x-session-id', sessionId);

      return fetch(url, {
        ...init,
        headers,
      });
    };
  }
}

export function clearSession() {
  if (typeof window !== 'undefined') {
    localStorage.removeItem('sessionId');
    api.apiClient.httpClient = fetch;
  }
}
