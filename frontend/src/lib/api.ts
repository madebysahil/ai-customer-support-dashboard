export class ApiError extends Error {
  status: number;
  data: any;
  constructor(status: number, message: string, data?: any) {
    super(message);
    this.status = status;
    this.data = data;
  }
}

let accessToken: string | null = null;

export const setAccessToken = (token: string | null) => {
  accessToken = token;
};

export const getAccessToken = () => accessToken;

async function fetchWithInterceptor(url: string, options: RequestInit = {}) {
  const baseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api/v1';
  const fullUrl = url.startsWith('http') ? url : `${baseUrl}${url}`;

  const headers = new Headers(options.headers);
  if (accessToken) {
    headers.set('Authorization', `Bearer ${accessToken}`);
  }
  
  if (!headers.has('Content-Type') && !(options.body instanceof FormData)) {
    headers.set('Content-Type', 'application/json');
  }

  const fetchOptions: RequestInit = {
    ...options,
    headers,
    credentials: 'include',
  };

  const response = await fetch(fullUrl, fetchOptions);

  if (!response.ok) {
    if (response.status === 401 && !fullUrl.endsWith('/auth/refresh') && !fullUrl.endsWith('/auth/login')) {
      // Attempt refresh
      const refreshResponse = await fetch(`${baseUrl}/auth/refresh`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
      });
      
      if (refreshResponse.ok) {
        const { accessToken: newToken } = await refreshResponse.json();
        setAccessToken(newToken);
        
        // Retry original request
        headers.set('Authorization', `Bearer ${newToken}`);
        const retryOptions: RequestInit = {
          ...options,
          headers,
          credentials: 'include',
        };
        const retryResponse = await fetch(fullUrl, retryOptions);
        if (!retryResponse.ok) throw await createApiError(retryResponse);
        return retryResponse;
      } else {
        // Refresh failed, clear token and let AuthContext handle redirect
        setAccessToken(null);
        if (typeof window !== 'undefined') {
          window.dispatchEvent(new CustomEvent('session_expired'));
        }
        throw new ApiError(401, 'Session expired');
      }
    }
    throw await createApiError(response);
  }
  
  return response;
}

async function createApiError(res: Response) {
  let data;
  try { data = await res.json(); } catch { data = null; }
  return new ApiError(res.status, data?.title || data?.detail || res.statusText, data);
}

export const api = {
  get: (url: string, opts?: RequestInit) => fetchWithInterceptor(url, { ...opts, method: 'GET' }),
  post: (url: string, body: any, opts?: RequestInit) => fetchWithInterceptor(url, { ...opts, method: 'POST', body: JSON.stringify(body) }),
  put: (url: string, body: any, opts?: RequestInit) => fetchWithInterceptor(url, { ...opts, method: 'PUT', body: JSON.stringify(body) }),
  patch: (url: string, body?: any, opts?: RequestInit) => fetchWithInterceptor(url, { ...opts, method: 'PATCH', body: body ? JSON.stringify(body) : undefined }),
  delete: (url: string, opts?: RequestInit) => fetchWithInterceptor(url, { ...opts, method: 'DELETE' }),
};
