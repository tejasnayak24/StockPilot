const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api';

interface RequestOptions extends RequestInit {
  skipAuth?: boolean;
}

let isRefreshing = false;
let refreshSubscribers: ((token: string) => void)[] = [];

function subscribeTokenRefresh(cb: (token: string) => void) {
  refreshSubscribers.push(cb);
}

function onRefreshed(token: string) {
  refreshSubscribers.forEach(cb => cb(token));
  refreshSubscribers = [];
}

export async function apiRequest(path: string, options: RequestOptions = {}): Promise<any> {
  const { skipAuth = false, ...fetchOptions } = options;
  const url = `${API_BASE_URL}${path}`;

  const headers = new Headers(fetchOptions.headers || {});
  if (!headers.has('Content-Type') && !(fetchOptions.body instanceof FormData)) {
    headers.set('Content-Type', 'application/json');
  }

  if (!skipAuth) {
    const token = typeof window !== 'undefined' ? localStorage.getItem('accessToken') : null;
    if (token) {
      headers.set('Authorization', `Bearer ${token}`);
    }
  }

  fetchOptions.headers = headers;

  const response = await fetch(url, fetchOptions);

  if (response.status === 401 && !skipAuth && typeof window !== 'undefined') {
    // Handle 401: Refresh Token
    if (isRefreshing) {
      return new Promise(resolve => {
        subscribeTokenRefresh((newToken: string) => {
          headers.set('Authorization', `Bearer ${newToken}`);
          resolve(fetch(url, fetchOptions).then(res => handleResponse(res)));
        });
      });
    }

    const refreshToken = localStorage.getItem('refreshToken');
    if (!refreshToken) {
      handleUnauthorizedLogout();
      throw new Error('Unauthorized');
    }

    isRefreshing = true;

    try {
      const refreshResponse = await fetch(`${API_BASE_URL}/auth/refresh`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ refreshToken }),
      });

      if (!refreshResponse.ok) {
        throw new Error('Refresh failed');
      }

      const data = await refreshResponse.json();
      localStorage.setItem('accessToken', data.accessToken);
      localStorage.setItem('refreshToken', data.refreshToken);

      isRefreshing = false;
      onRefreshed(data.accessToken);

      headers.set('Authorization', `Bearer ${data.accessToken}`);
      return fetch(url, fetchOptions).then(res => handleResponse(res));
    } catch (err) {
      isRefreshing = false;
      handleUnauthorizedLogout();
      throw new Error('Session expired');
    }
  }

  return handleResponse(response);
}

async function handleResponse(response: Response) {
  const text = await response.text();
  let data;
  try {
    data = text ? JSON.parse(text) : {};
  } catch (e) {
    data = { message: text };
  }

  if (!response.ok) {
    const errorMsg = data.message || 'Something went wrong';
    throw new Error(Array.isArray(errorMsg) ? errorMsg.join(', ') : errorMsg);
  }

  return data;
}

function handleUnauthorizedLogout() {
  if (typeof window !== 'undefined') {
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    localStorage.removeItem('user');
    if (window.location.pathname !== '/login') {
      window.location.href = '/login';
    }
  }
}
