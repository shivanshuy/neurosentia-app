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
    white: {
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
      mode: 'dark',
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

  var id = localStorage.getItem('ns-color-theme') || 'gold';
  var theme = themes[id] || themes.gold;
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
