import { createContext, useEffect, useMemo, useState } from 'react';
import { login as loginRequest } from '../services/api';

export const AuthContext = createContext(null);

const AUTH_STORAGE_KEY = 'analytics-dashboard-auth';

function readStoredAuth() {
  if (typeof window === 'undefined') {
    return { token: '', user: null };
  }

  try {
    return JSON.parse(window.localStorage.getItem(AUTH_STORAGE_KEY)) ?? {
      token: '',
      user: null,
    };
  } catch {
    return { token: '', user: null };
  }
}

export function AuthProvider({ children }) {
  const [authState, setAuthState] = useState(readStoredAuth);

  useEffect(() => {
    if (typeof window === 'undefined') {
      return;
    }

    if (authState.token) {
      window.localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(authState));
      return;
    }

    window.localStorage.removeItem(AUTH_STORAGE_KEY);
  }, [authState]);

  const value = useMemo(
    () => ({
      token: authState.token,
      user: authState.user,
      isAuthenticated: Boolean(authState.token),
      async login(credentials) {
        const payload = await loginRequest(credentials);
        setAuthState({
          token: payload.token,
          user: payload.user,
        });

        return payload;
      },
      logout() {
        setAuthState({ token: '', user: null });
      },
    }),
    [authState.token, authState.user]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
