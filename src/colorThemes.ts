export type ColorThemeId =
  | 'gold'
  | 'yellow'
  | 'orange'
  | 'white-on-black'
  | 'green-on-black'
  | 'red-on-black'
  | 'paperwhite'
  | 'white-accent';

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
  'white-on-black': {
    id: 'white-on-black',
    label: 'White on Black',
    description: 'Monochrome dark theme — white accents on black',
    mode: 'dark',
    colors: {
      bg: '#0a0a0a',
      bgPaper: '#141414',
      text: '#f5f5f5',
      textSecondary: '#c8c8c8',
      textMuted: '#8a8a8a',
      accent: '#FFFFFF',
      footer: '#E8E8E8',
      border: '#3a3a3a',
      onAccent: '#0a0a0a',
      accentMuted: 'rgba(255, 255, 255, 0.12)',
      hoverBg: 'rgba(255, 255, 255, 0.05)',
    },
  },
  'green-on-black': {
    id: 'green-on-black',
    label: 'Green on Black',
    description: 'Dark theme with emerald green accents',
    mode: 'dark',
    colors: {
      bg: '#0a0a0a',
      bgPaper: '#121816',
      text: '#eef8f3',
      textSecondary: '#b8d4c6',
      textMuted: '#7a9a8a',
      accent: '#27A87C',
      footer: '#1E8449',
      border: '#2a3d34',
      onAccent: '#FFFFFF',
      accentMuted: 'rgba(39, 168, 124, 0.14)',
      hoverBg: 'rgba(39, 168, 124, 0.08)',
    },
  },
  'red-on-black': {
    id: 'red-on-black',
    label: 'Red on Black',
    description: 'Dark theme with coral red accents',
    mode: 'dark',
    colors: {
      bg: '#0a0a0a',
      bgPaper: '#181212',
      text: '#faf0f0',
      textSecondary: '#d4b8b8',
      textMuted: '#9a7a7a',
      accent: '#D25353',
      footer: '#B84343',
      border: '#3d2a2a',
      onAccent: '#FFFFFF',
      accentMuted: 'rgba(210, 83, 83, 0.14)',
      hoverBg: 'rgba(210, 83, 83, 0.08)',
    },
  },
  paperwhite: {
    id: 'paperwhite',
    label: 'Paperwhite',
    description: 'E-ink reading screen — warm paper tone, soft ink',
    mode: 'light',
    colors: {
      bg: '#F3F0E8',
      bgPaper: '#EAE6DC',
      text: '#2B2824',
      textSecondary: '#5A554D',
      textMuted: '#8C867C',
      accent: '#5A6E7A',
      footer: '#6B5E52',
      border: '#D8D2C6',
      onAccent: '#F3F0E8',
      accentMuted: 'rgba(90, 110, 122, 0.14)',
      hoverBg: 'rgba(43, 40, 36, 0.06)',
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
  if (stored === 'white') {
    return 'white-on-black';
  }
  if (stored && stored in colorThemes) {
    return stored as ColorThemeId;
  }
  return 'white-on-black';
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
