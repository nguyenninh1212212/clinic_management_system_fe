import { CssBaseline, ThemeProvider } from '@mui/material';
import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { createAppTheme, ThemeMode } from './theme';

const STORAGE_KEY = 'clinic-ui-theme-mode';

interface ThemeModeContextValue {
  mode: ThemeMode;
  toggleTheme: () => void;
}

const ThemeModeContext = createContext<ThemeModeContextValue | undefined>(undefined);

const getInitialMode = (): ThemeMode => {
  const savedMode = localStorage.getItem(STORAGE_KEY);
  return savedMode === 'dark' || savedMode === 'light' ? savedMode : 'light';
};

export const ThemeModeProvider: React.FC<React.PropsWithChildren> = ({ children }) => {
  const [mode, setMode] = useState<ThemeMode>(getInitialMode);
  const theme = useMemo(() => createAppTheme(mode), [mode]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, mode);
  }, [mode]);

  const value = useMemo(
    () => ({ mode, toggleTheme: () => setMode((current) => current === 'light' ? 'dark' : 'light') }),
    [mode],
  );

  return (
    <ThemeModeContext.Provider value={value}>
      <ThemeProvider theme={theme}>
        <CssBaseline />
        {children}
      </ThemeProvider>
    </ThemeModeContext.Provider>
  );
};

export const useThemeMode = (): ThemeModeContextValue => {
  const context = useContext(ThemeModeContext);
  if (!context) throw new Error('useThemeMode must be used within ThemeModeProvider');
  return context;
};
