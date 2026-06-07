(function () {
  var presets = {
    current: {
      sans: '"Space Grotesk", "Helvetica Neue", Arial, sans-serif',
      display: '"Space Grotesk", "Helvetica Neue", Arial, sans-serif',
      mono: '"Fira Code", "JetBrains Mono", monospace',
    },
    original: {
      sans: 'monospace, Helvetica, Arial, sans-serif',
      display: 'monospace, Helvetica, Arial, sans-serif',
      mono: 'monospace, Helvetica, Arial, sans-serif',
    },
    sora: {
      sans: '"Sora", "Helvetica Neue", Arial, sans-serif',
      display: '"Sora", "Helvetica Neue", Arial, sans-serif',
      mono: '"IBM Plex Mono", "Fira Code", monospace',
    },
    syne: {
      sans: '"Syne", "Helvetica Neue", Arial, sans-serif',
      display: '"Syne", "Helvetica Neue", Arial, sans-serif',
      mono: '"Fira Code", "JetBrains Mono", monospace',
    },
    outfit: {
      sans: '"Outfit", "Helvetica Neue", Arial, sans-serif',
      display: '"Outfit", "Helvetica Neue", Arial, sans-serif',
      mono: '"JetBrains Mono", "Fira Code", monospace',
    },
    exo: {
      sans: '"Space Grotesk", "Helvetica Neue", Arial, sans-serif',
      display: '"Exo 2", "Space Grotesk", sans-serif',
      mono: '"Fira Code", "JetBrains Mono", monospace',
    },
    tektur: {
      sans: '"Tektur", "Space Grotesk", sans-serif',
      display: '"Tektur", "Space Grotesk", sans-serif',
      mono: '"IBM Plex Mono", "Fira Code", monospace',
    },
    orbitron: {
      sans: '"Sora", "Helvetica Neue", Arial, sans-serif',
      display: '"Orbitron", "Sora", sans-serif',
      mono: '"Share Tech Mono", "Fira Code", monospace',
    },
    oxanium: {
      sans: '"Oxanium", "Space Grotesk", sans-serif',
      display: '"Oxanium", "Space Grotesk", sans-serif',
      mono: '"JetBrains Mono", "Fira Code", monospace',
    },
    michroma: {
      sans: '"Outfit", "Helvetica Neue", Arial, sans-serif',
      display: '"Michroma", "Outfit", sans-serif',
      mono: '"Fira Code", "JetBrains Mono", monospace',
    },
    genos: {
      sans: '"Genos", "Space Grotesk", sans-serif',
      display: '"Genos", "Space Grotesk", sans-serif',
      mono: '"IBM Plex Mono", "Fira Code", monospace',
    },
    electrolize: {
      sans: '"Electrolize", "Space Grotesk", sans-serif',
      display: '"Electrolize", "Space Grotesk", sans-serif',
      mono: '"Share Tech Mono", "Fira Code", monospace',
    },
  };

  var id = localStorage.getItem('ns-font-preset') || 'current';
  var preset = presets[id] || presets.current;
  var root = document.documentElement;
  root.style.setProperty('--ns-font-sans', preset.sans);
  root.style.setProperty('--ns-font-display', preset.display);
  root.style.setProperty('--ns-font-mono', preset.mono);
  root.setAttribute('data-font-preset', id);
})();
