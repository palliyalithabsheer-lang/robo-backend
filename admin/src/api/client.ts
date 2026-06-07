import type { ApiResponse } from '../types';

const API_BASE_URL = import.meta.env.VITE_API_URL ? `${import.meta.env.VITE_API_URL}/api/v1` : 'http://localhost:3000/api/v1';

export async function apiRequest<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<ApiResponse<T>> {
  
  const token = localStorage.getItem('admin_auth_token');
  
  const headers = new Headers(options.headers || {});
  headers.set('Content-Type', 'application/json');
  if (token) {
    headers.set('Authorization', `Bearer ${token}`);
  }

  try {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, { ...options, headers });
    
    // We expect the backend to return { data, status, error }
    const json = await response.json();

    if (response.status === 401) {
      // Trigger logout if we had a proper event bus or context reference here
      console.warn('Unauthorized request');
    }

    return {
      data: json.data !== undefined ? json.data : null,
      error: json.error || (!response.ok ? response.statusText : null),
      status: response.status
    };
  } catch (err: any) {
    console.error(`[API Error] ${endpoint}:`, err);
    return { data: null, error: err.message || 'Network error', status: 500 };
  }
}
