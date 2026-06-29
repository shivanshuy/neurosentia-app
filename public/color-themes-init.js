(function () {
  var themes = {
    gold: {
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
      mode: 'dark',
    },
    yellow: {
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
      mode: 'dark',
    },
    orange: {
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
      mode: 'dark',
    },
    'white-on-black': {
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
      mode: 'dark',
    },
    'green-on-black': {
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
      mode: 'dark',
    },
    'red-on-black': {
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
      mode: 'dark',
    },
    paperwhite: {
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
      mode: 'light',
    },
    'white-accent': {
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
      mode: 'light',
    },
  };

  var id = localStorage.getItem('ns-color-theme') || 'white-on-black';
  if (id === 'white') {
    id = 'white-on-black';
  }
  var theme = themes[id] || themes['white-on-black'];
  var root = document.documentElement;

  root.style.setProperty('--ns-bg', theme.bg);
  root.style.setProperty('--ns-bg-paper', theme.bgPaper);
  root.style.setProperty('--ns-text', theme.text);
  root.style.setProperty('--ns-text-secondary', theme.textSecondary);
  root.style.setProperty('--ns-text-muted', theme.textMuted);
  root.style.setProperty('--ns-accent', theme.accent);
  root.style.setProperty('--ns-footer', theme.footer);
  root.style.setProperty('--ns-border', theme.border);
  root.style.setProperty('--ns-on-accent', theme.onAccent);
  root.style.setProperty('--ns-accent-muted', theme.accentMuted);
  root.style.setProperty('--ns-hover-bg', theme.hoverBg);
  root.setAttribute('data-color-theme', id);
  root.setAttribute('data-theme-mode', theme.mode);
})();
