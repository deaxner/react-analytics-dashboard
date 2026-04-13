import { createContext, useEffect, useMemo, useState } from 'react';

export const ThemeContext = createContext(null);

const THEME_STORAGE_KEY = 'analytics-dashboard-theme';

function readStoredTheme() {
  if (typeof window === 'undefined') {
    return 'dark';
  }

  return window.localStorage.getItem(THEME_STORAGE_KEY) || 'dark';
}

export function ThemeProvider({ children }) {
  const [theme, setTheme] = useState(readStoredTheme);

  useEffect(() => {
    document.documentElement.dataset.theme = theme;
    window.localStorage.setItem(THEME_STORAGE_KEY, theme);
  }, [theme]);

  const value = useMemo(
    () => ({
      theme,
      toggleTheme() {
        setTheme((currentTheme) =>
          currentTheme === 'dark' ? 'light' : 'dark'
        );
      },
    }),
    [theme]
  );

  return (
    <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>
  );
}
