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
  const headers = new Headers(options.headers);
  if (accessToken) {
    headers.set('Authorization', `Bearer ${accessToken}`);
  }
  
  if (!headers.has('Content-Type') && !(options.body instanceof FormData)) {
    headers.set('Content-Type', 'application/json');
  }

  const response = await fetch(url, {
    ...options,
    headers,
  });

  if (!response.ok) {
    if (response.status === 401) {
      // Attempt refresh
      const refreshResponse = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/auth/refresh`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        // Native fetch handles cookies automatically based on credentials mode
      });
      
      if (refreshResponse.ok) {
        const { accessToken: newToken } = await refreshResponse.json();
        setAccessToken(newToken);
        
        // Retry original request
        headers.set('Authorization', `Bearer ${newToken}`);
        const retryResponse = await fetch(url, { ...options, headers });
        if (!retryResponse.ok) throw await createApiError(retryResponse);
        return retryResponse;
      } else {
        // Refresh failed, clear token and let AuthContext handle redirect
        setAccessToken(null);
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
