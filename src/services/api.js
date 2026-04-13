const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL?.replace(/\/$/, '') || '/api';
const SAAS_API_BASE_URL =
  import.meta.env.VITE_SAAS_API_BASE_URL?.replace(/\/$/, '') || '/saas-api';

function buildUrl(path, params, baseUrl = API_BASE_URL) {
  const normalizedPath = path.startsWith('/') ? path : `/${path}`;
  const base =
    baseUrl.startsWith('http://') || baseUrl.startsWith('https://')
      ? baseUrl
      : `${window.location.origin}${baseUrl}`;
  const url = new URL(`${base}${normalizedPath}`);

  Object.entries(params || {}).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== '') {
      url.searchParams.set(key, value);
    }
  });

  return url.toString();
}

async function apiRequest(path, options = {}) {
  const { token, params, headers, baseUrl = API_BASE_URL, ...requestOptions } = options;
  const response = await fetch(buildUrl(path, params, baseUrl), {
    ...requestOptions,
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...headers,
    },
  });
  const payload = await response.json().catch(() => ({}));

  if (!response.ok) {
    const message =
      payload.message ||
      payload.code ||
      'The server returned an unexpected response.';
    const error = new Error(message);
    error.status = response.status;
    error.payload = payload;
    throw error;
  }

  return payload;
}

export async function login(credentials) {
  const payload = await apiRequest('/login', {
    method: 'POST',
    body: JSON.stringify(credentials),
  });

  return payload.data;
}

export async function getTasks({ token, params }) {
  const payload = await apiRequest('/tasks', {
    method: 'GET',
    token,
    params,
  });

  return {
    data: payload.data ?? [],
    meta: payload.meta ?? {},
  };
}

export async function getProjects({ token }) {
  const payload = await apiRequest('/projects', {
    method: 'GET',
    token,
  });

  return payload.data ?? [];
}

export async function getTimeEntries({ token, params }) {
  const payload = await apiRequest('/time-entries', {
    method: 'GET',
    token,
    params,
  });

  return payload.data ?? [];
}

export async function getCommercialAnalytics({ email }) {
  const payload = await apiRequest('/commercial', {
    method: 'GET',
    baseUrl: SAAS_API_BASE_URL,
    params: { email },
  });

  return payload.data ?? { projects: [], clients: [], summary: {} };
}
