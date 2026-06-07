export type ColorThemeId = 'gold' | 'yellow' | 'orange' | 'white' | 'white-accent';

export type ColorThemeColors = {
  bg: string;
  bgPaper: string;
  text: string;
  textSecondary: string;
  textMuted: string;
  accent: string;
  footer: string;
  border: string;
  onAccent: string;
  accentMuted: string;
  hoverBg: string;
};

export type ColorTheme = {
  id: ColorThemeId;
  label: string;
  description: string;
  mode: 'dark' | 'light';
  colors: ColorThemeColors;
};

export const colorThemes: Record<ColorThemeId, ColorTheme> = {
  gold: {
    id: 'gold',
    label: 'Gold',
    description: 'Premium dark theme with gold accents',
    mode: 'dark',
    colors: {
      bg: '#1d1d1d',
      bgPaper: '#252525',
      text: '#f9f0ff',
      textSecondary: '#d2d2d2',
      textMuted: '#b1b1b1',
      accent: '#D4AF37',
      footer: '#C9A227',
      border: '#454041',
      onAccent: '#1d1d1d',
      accentMuted: 'rgba(212, 175, 55, 0.12)',
      hoverBg: 'rgba(249, 240, 255, 0.05)',
    },
  },
  yellow: {
    id: 'yellow',
    label: 'Yellow',
    description: 'Dark theme with bright yellow highlights',
    mode: 'dark',
    colors: {
      bg: '#1d1d1d',
      bgPaper: '#252525',
      text: '#f9f0ff',
      textSecondary: '#d2d2d2',
      textMuted: '#b1b1b1',
      accent: '#FFD60A',
      footer: '#E6C200',
      border: '#454041',
      onAccent: '#1d1d1d',
      accentMuted: 'rgba(255, 214, 10, 0.14)',
      hoverBg: 'rgba(249, 240, 255, 0.05)',
    },
  },
  orange: {
    id: 'orange',
    label: 'Orange',
    description: 'Dark theme with warm orange accents',
    mode: 'dark',
    colors: {
      bg: '#1d1d1d',
      bgPaper: '#252525',
      text: '#f9f0ff',
      textSecondary: '#d2d2d2',
      textMuted: '#b1b1b1',
      accent: '#FF8C42',
      footer: '#E86A17',
      border: '#454041',
      onAccent: '#1d1d1d',
      accentMuted: 'rgba(255, 140, 66, 0.14)',
      hoverBg: 'rgba(249, 240, 255, 0.05)',
    },
  },
  white: {
    id: 'white',
    label: 'White',
    description: 'Dark theme with clean white accents',
    mode: 'dark',
    colors: {
      bg: '#1d1d1d',
      bgPaper: '#252525',
      text: '#f9f0ff',
      textSecondary: '#d2d2d2',
      textMuted: '#b1b1b1',
      accent: '#FFFFFF',
      footer: '#F0F0F0',
      border: '#454041',
      onAccent: '#1d1d1d',
      accentMuted: 'rgba(255, 255, 255, 0.1)',
      hoverBg: 'rgba(249, 240, 255, 0.05)',
    },
  },
  'white-accent': {
    id: 'white-accent',
    label: 'White + Accent',
    description: 'Minimal light theme — white surfaces, one accent only',
    mode: 'light',
    colors: {
      bg: '#FFFFFF',
      bgPaper: '#F7F7F7',
      text: '#1a1a1a',
      textSecondary: '#525252',
      textMuted: '#737373',
      accent: '#D4AF37',
      footer: '#D4AF37',
      border: '#E5E5E5',
      onAccent: '#1a1a1a',
      accentMuted: 'rgba(212, 175, 55, 0.12)',
      hoverBg: 'rgba(0, 0, 0, 0.04)',
    },
  },
};

export const colorThemeList: ColorTheme[] = Object.values(colorThemes);

const STORAGE_KEY = 'ns-color-theme';

export function getStoredColorTheme(): ColorThemeId {
  const stored = localStorage.getItem(STORAGE_KEY);
  if (stored && stored in colorThemes) {
    return stored as ColorThemeId;
  }
  return 'gold';
}

export function applyColorTheme(themeId: ColorThemeId) {
  const theme = colorThemes[themeId];
  const { colors } = theme;
  const root = document.documentElement;

  root.style.setProperty('--ns-bg', colors.bg);
  root.style.setProperty('--ns-bg-paper', colors.bgPaper);
  root.style.setProperty('--ns-text', colors.text);
  root.style.setProperty('--ns-text-secondary', colors.textSecondary);
  root.style.setProperty('--ns-text-muted', colors.textMuted);
  root.style.setProperty('--ns-accent', colors.accent);
  root.style.setProperty('--ns-footer', colors.footer);
  root.style.setProperty('--ns-border', colors.border);
  root.style.setProperty('--ns-on-accent', colors.onAccent);
  root.style.setProperty('--ns-accent-muted', colors.accentMuted);
  root.style.setProperty('--ns-hover-bg', colors.hoverBg);
  root.setAttribute('data-color-theme', themeId);
  root.setAttribute('data-theme-mode', theme.mode);
  localStorage.setItem(STORAGE_KEY, themeId);
}
