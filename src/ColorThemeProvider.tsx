import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';
import CssBaseline from '@mui/material/CssBaseline';
import { ThemeProvider } from '@mui/material/styles';
import {
  applyColorTheme,
  colorThemeList,
  colorThemes,
  getStoredColorTheme,
  type ColorTheme,
  type ColorThemeColors,
  type ColorThemeId,
} from './colorThemes';
import { createNeurosentiaTheme } from './theme';

type ColorThemeContextValue = {
  themeId: ColorThemeId;
  setThemeId: (id: ColorThemeId) => void;
  themes: ColorTheme[];
  colors: ColorThemeColors;
  mode: 'dark' | 'light';
};

const ColorThemeContext = createContext<ColorThemeContextValue | null>(null);

export function ColorThemeProvider({ children }: { children: ReactNode }) {
  const [themeId, setThemeIdState] = useState<ColorThemeId>(getStoredColorTheme);

  const setThemeId = (id: ColorThemeId) => {
    setThemeIdState(id);
    applyColorTheme(id);
  };

  const themeConfig = colorThemes[themeId];

  useEffect(() => {
    applyColorTheme(themeId);
  }, [themeId]);

  const muiTheme = useMemo(
    () => createNeurosentiaTheme(themeConfig.colors, themeConfig.mode),
    [themeConfig],
  );

  return (
    <ColorThemeContext.Provider
      value={{
        themeId,
        setThemeId,
        themes: colorThemeList,
        colors: themeConfig.colors,
        mode: themeConfig.mode,
      }}
    >
      <ThemeProvider theme={muiTheme}>
        <CssBaseline />
        {children}
      </ThemeProvider>
    </ColorThemeContext.Provider>
  );
}

export function useColorTheme() {
  const context = useContext(ColorThemeContext);
  if (!context) {
    throw new Error('useColorTheme must be used within ColorThemeProvider');
  }
  return context;
}
