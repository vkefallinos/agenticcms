'use client';

import { remult } from 'remult';

/**
 * HTTP client wrapper with error handling
 */
async function httpClientWithErrorHandling(
  url: URL | RequestInfo,
  init?: RequestInit
): Promise<Response> {
  try {
    const response = await fetch(url, init);

    // If response is not ok, try to parse error details
    if (!response.ok) {
      let errorData: any;
      try {
        errorData = await response.json();
      } catch {
        // If JSON parsing fails, use status text
        errorData = { message: response.statusText };
      }

      // Create error with enhanced information
      const error: any = new Error(errorData.message || response.statusText);
      error.httpStatusCode = response.status;
      error.httpStatusText = response.statusText;
      error.modelState = errorData.fields;
      error.code = errorData.code;

      throw error;
    }

    return response;
  } catch (error: any) {
    // If it's already our formatted error, rethrow it
    if (error.httpStatusCode) {
      throw error;
    }

    // Network or other errors
    if (error instanceof TypeError) {
      const networkError: any = new Error('Network error: Unable to connect to the server');
      networkError.httpStatusCode = 0;
      networkError.networkError = true;
      throw networkError;
    }

    // Rethrow unknown errors
    throw error;
  }
}

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

      return httpClientWithErrorHandling(url, {
        ...init,
        headers,
      });
    };
  } else {
    // Even without token, use error handling wrapper
    api.apiClient.httpClient = httpClientWithErrorHandling;
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

      return httpClientWithErrorHandling(url, {
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
    api.apiClient.httpClient = httpClientWithErrorHandling;
  }
}

// Legacy support - will be removed in future versions
/** @deprecated Use setAuthToken instead */
export const setSessionId = setAuthToken;
/** @deprecated Use clearAuth instead */
export const clearSession = clearAuth;
