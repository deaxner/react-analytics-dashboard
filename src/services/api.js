const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL?.replace(/\/$/, '') || '/api';

function buildUrl(path, params) {
  const url = new URL(`${API_BASE_URL}${path}`);

  Object.entries(params || {}).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== '') {
      url.searchParams.set(key, value);
    }
  });

  return url.toString();
}

async function apiRequest(path, options = {}) {
  const { token, params, headers, ...requestOptions } = options;
  const response = await fetch(buildUrl(path, params), {
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
  const payload = await apiRequest('/api/login', {
    method: 'POST',
    body: JSON.stringify(credentials),
  });

  return payload.data;
}

export async function getTasks({ token, params }) {
  const payload = await apiRequest('/api/tasks', {
    method: 'GET',
    token,
    params,
  });

  return {
    data: payload.data ?? [],
    meta: payload.meta ?? {},
  };
}
