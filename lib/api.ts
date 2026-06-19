import { useAuthStore } from '@/store/useAuthStore';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8000';

class ApiError extends Error {
  status: number;
  data: any;

  constructor(message: string, status: number, data?: any) {
    super(message);
    this.status = status;
    this.data = data;
    this.name = 'ApiError';
  }
}

// Global variable to track if we're already refreshing the token
let isRefreshing = false;
// Queue to hold requests that are waiting for the token to refresh
let refreshSubscribers: Array<(token: string) => void> = [];

// Function to subscribe to the refresh queue
function subscribeToRefresh(callback: (token: string) => void) {
  refreshSubscribers.push(callback);
}

// Function to notify all subscribers when the token is refreshed
function notifySubscribers(token: string) {
  refreshSubscribers.forEach(callback => callback(token));
  refreshSubscribers = [];
}

async function refreshTokens(refreshToken: string) {
  const response = await fetch(`${API_BASE_URL}/api/auth/refresh`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ refresh_token: refreshToken })
  });
  
  if (!response.ok) {
    throw new Error('Token refresh failed');
  }
  
  return response.json();
}

export async function apiRequest(
  endpoint: string,
  options: RequestInit = {},
  token?: string
) {
  const headers = new Headers(options.headers);
  
  // Don't set Content-Type for FormData (let browser handle it with boundary)
  if (!(options.body instanceof FormData)) {
    headers.set('Content-Type', 'application/json');
  }

  if (token) {
    headers.set('Authorization', `Bearer ${token}`);
  }

  const url = `${API_BASE_URL}${endpoint}`;
  const response = await fetch(url, { ...options, headers });

  let responseData;
  try {
    const text = await response.text();
    console.log('API Response Raw:', text);
    responseData = text ? JSON.parse(text) : null;
    console.log('API Response Parsed:', responseData);
  } catch (e) {
    responseData = null;
  }

  // If token expired (401 Unauthorized)
  if (response.status === 401 && token) {
    const authStore = useAuthStore.getState();
    const currentRefreshToken = authStore.refreshToken;
    
    if (!currentRefreshToken) {
      authStore.logout();
      throw new ApiError(
        responseData?.message || 'Token expired',
        response.status,
        responseData
      );
    }

    if (!isRefreshing) {
      isRefreshing = true;
      try {
        const newTokens = await refreshTokens(currentRefreshToken);
        authStore.setAuth(authStore.user!, newTokens.access_token, newTokens.refresh_token);
        notifySubscribers(newTokens.access_token);
        
        // Retry original request with new token
        const retryHeaders = new Headers(options.headers);
        if (!(options.body instanceof FormData)) {
          retryHeaders.set('Content-Type', 'application/json');
        }
        retryHeaders.set('Authorization', `Bearer ${newTokens.access_token}`);
        const retryResponse = await fetch(url, { ...options, headers: retryHeaders });
        
        let retryData;
        try {
          const retryText = await retryResponse.text();
          retryData = retryText ? JSON.parse(retryText) : null;
        } catch (e) {
          retryData = null;
        }
        
        if (!retryResponse.ok) {
          throw new ApiError(
            retryData?.message || 'Request failed',
            retryResponse.status,
            retryData
          );
        }
        
        return retryResponse.status === 204 ? null : retryData;
      } catch (refreshError) {
        authStore.logout();
        throw new ApiError(
          'Token refresh failed',
          401,
          null
        );
      } finally {
        isRefreshing = false;
      }
    } else {
      // Wait for token to refresh
      return new Promise((resolve, reject) => {
        subscribeToRefresh(async (newToken) => {
          try {
            const retryHeaders = new Headers(options.headers);
            if (!(options.body instanceof FormData)) {
              retryHeaders.set('Content-Type', 'application/json');
            }
            retryHeaders.set('Authorization', `Bearer ${newToken}`);
            const retryResponse = await fetch(url, { ...options, headers: retryHeaders });
            
            let retryData;
            try {
              const retryText = await retryResponse.text();
              retryData = retryText ? JSON.parse(retryText) : null;
            } catch (e) {
              retryData = null;
            }
            
            if (!retryResponse.ok) {
              reject(new ApiError(
                retryData?.message || 'Request failed',
                retryResponse.status,
                retryData
              ));
            } else {
              resolve(retryResponse.status === 204 ? null : retryData);
            }
          } catch (error) {
            reject(error);
          }
        });
      });
    }
  }

  if (!response.ok) {
    throw new ApiError(
      responseData?.message || 'Request failed',
      response.status,
      responseData
    );
  }

  if (response.status === 204) {
    return null;
  }

  return responseData;
}

export const api = {
  auth: {
    register: (data: any) => apiRequest('/api/auth/register', { method: 'POST', body: JSON.stringify(data) }),
    login: (data: any) => apiRequest('/api/auth/login', { method: 'POST', body: JSON.stringify(data) }),
    refresh: (refreshToken: string) => apiRequest('/api/auth/refresh', { method: 'POST', body: JSON.stringify({ refresh_token: refreshToken }) }),
    logout: (token: string) => apiRequest('/api/auth/logout', { method: 'POST' }, token),
    forgotPassword: (data: any) => apiRequest('/api/auth/forgot-password', { method: 'POST', body: JSON.stringify(data) }),
    resetPassword: (data: any) => apiRequest('/api/auth/reset-password', { method: 'POST', body: JSON.stringify(data) }),
  },
  users: {
    me: (token: string) => apiRequest('/api/users/me', {}, token),
    get: (token: string) => apiRequest('/api/users', {}, token),
    getById: (token: string, id: string) => apiRequest(`/api/users/${id}`, {}, token),
    updateActiveStatus: (token: string, userId: string, isActive: boolean) => apiRequest(`/api/users/${userId}/active`, { method: 'PATCH', body: JSON.stringify({ is_active: isActive }) }, token),
    delete: (token: string, userId: string) => apiRequest(`/api/users/${userId}`, { method: 'DELETE' }, token),
  },
  incidents: {
    create: (token: string, data: any) => apiRequest('/api/incidents', { method: 'POST', body: JSON.stringify(data) }, token),
    get: (token: string, params?: any) => {
      const url = params ? `/api/incidents?${new URLSearchParams(params)}` : '/api/incidents';
      return apiRequest(url, {}, token);
    },
    getNearby: (token: string, params: any) => apiRequest(`/api/incidents/nearby?${new URLSearchParams(params)}`, {}, token),
    getById: (token: string, id: string) => apiRequest(`/api/incidents/${id}`, {}, token),
    update: (token: string, id: string, data: any) => apiRequest(`/api/incidents/${id}`, { method: 'PATCH', body: JSON.stringify(data) }, token),
    assign: (token: string, id: string, responder_id: string) => apiRequest(`/api/incidents/${id}/assign`, { method: 'PATCH', body: JSON.stringify({ responder_id }) }, token),
    delete: (token: string, id: string) => apiRequest(`/api/incidents/${id}`, { method: 'DELETE' }, token),
  },
  responders: {
    tasks: (token: string) => apiRequest('/api/responders/tasks', {}, token),
    updateStatus: (token: string, id: string, data: any) => apiRequest(`/api/responders/tasks/${id}/status`, { method: 'PATCH', body: JSON.stringify(data) }, token),
    shareLocation: (token: string, data: any) => apiRequest('/api/responders/location', { method: 'POST', body: JSON.stringify(data) }, token),
  },
  notifications: {
    get: (token: string) => apiRequest('/api/notifications', {}, token),
    markRead: (token: string, id: string) => apiRequest(`/api/notifications/${id}/read`, { method: 'PATCH' }, token),
  },
  analytics: {
    overview: (token: string) => apiRequest('/api/analytics/overview', {}, token),
    byCategory: (token: string) => apiRequest('/api/analytics/incidents-by-category', {}, token),
    byStatus: (token: string) => apiRequest('/api/analytics/incidents-by-status', {}, token),
    monthlyTrends: (token: string) => apiRequest('/api/analytics/monthly-trends', {}, token),
    responderPerformance: (token: string) => apiRequest('/api/analytics/responder-performance', {}, token),
  },
  media: {
    getSignedUpload: (token: string) => apiRequest('/api/media/sign-upload', { method: 'POST' }, token),
  },
};
