export type FontPresetId =
  | 'current'
  | 'original'
  | 'sora'
  | 'syne'
  | 'outfit'
  | 'exo'
  | 'tektur'
  | 'orbitron'
  | 'oxanium'
  | 'michroma'
  | 'genos'
  | 'electrolize';

export type FontPreset = {
  id: FontPresetId;
  label: string;
  description: string;
  sans: string;
  display: string;
  mono: string;
};

export const fontPresets: Record<FontPresetId, FontPreset> = {
  current: {
    id: 'current',
    label: 'Current',
    description: 'Space Grotesk + Fira Code',
    sans: '"Space Grotesk", "Helvetica Neue", Arial, sans-serif',
    display: '"Space Grotesk", "Helvetica Neue", Arial, sans-serif',
    mono: '"Fira Code", "JetBrains Mono", monospace',
  },
  original: {
    id: 'original',
    label: 'Original',
    description: 'System monospace — your first site font',
    sans: 'monospace, Helvetica, Arial, sans-serif',
    display: 'monospace, Helvetica, Arial, sans-serif',
    mono: 'monospace, Helvetica, Arial, sans-serif',
  },
  sora: {
    id: 'sora',
    label: 'A — Sora',
    description: 'Clean AI product sans',
    sans: '"Sora", "Helvetica Neue", Arial, sans-serif',
    display: '"Sora", "Helvetica Neue", Arial, sans-serif',
    mono: '"IBM Plex Mono", "Fira Code", monospace',
  },
  syne: {
    id: 'syne',
    label: 'B — Syne',
    description: 'Editorial art + tech',
    sans: '"Syne", "Helvetica Neue", Arial, sans-serif',
    display: '"Syne", "Helvetica Neue", Arial, sans-serif',
    mono: '"Fira Code", "JetBrains Mono", monospace',
  },
  outfit: {
    id: 'outfit',
    label: 'C — Outfit',
    description: 'Minimal premium startup',
    sans: '"Outfit", "Helvetica Neue", Arial, sans-serif',
    display: '"Outfit", "Helvetica Neue", Arial, sans-serif',
    mono: '"JetBrains Mono", "Fira Code", monospace',
  },
  exo: {
    id: 'exo',
    label: 'D — Exo 2',
    description: 'Sci-fi headings + Grotesk body',
    sans: '"Space Grotesk", "Helvetica Neue", Arial, sans-serif',
    display: '"Exo 2", "Space Grotesk", sans-serif',
    mono: '"Fira Code", "JetBrains Mono", monospace',
  },
  tektur: {
    id: 'tektur',
    label: 'E — Tektur',
    description: 'Cyber geometric AI sans',
    sans: '"Tektur", "Space Grotesk", sans-serif',
    display: '"Tektur", "Space Grotesk", sans-serif',
    mono: '"IBM Plex Mono", "Fira Code", monospace',
  },
  orbitron: {
    id: 'orbitron',
    label: 'F — Orbitron',
    description: 'Retro-future display + Sora body',
    sans: '"Sora", "Helvetica Neue", Arial, sans-serif',
    display: '"Orbitron", "Sora", sans-serif',
    mono: '"Share Tech Mono", "Fira Code", monospace',
  },
  oxanium: {
    id: 'oxanium',
    label: 'G — Oxanium',
    description: 'Edgy game-tech future',
    sans: '"Oxanium", "Space Grotesk", sans-serif',
    display: '"Oxanium", "Space Grotesk", sans-serif',
    mono: '"JetBrains Mono", "Fira Code", monospace',
  },
  michroma: {
    id: 'michroma',
    label: 'H — Michroma',
    description: 'Sharp tech display + Outfit body',
    sans: '"Outfit", "Helvetica Neue", Arial, sans-serif',
    display: '"Michroma", "Outfit", sans-serif',
    mono: '"Fira Code", "JetBrains Mono", monospace',
  },
  genos: {
    id: 'genos',
    label: 'I — Genos',
    description: 'Angular variable tech sans',
    sans: '"Genos", "Space Grotesk", sans-serif',
    display: '"Genos", "Space Grotesk", sans-serif',
    mono: '"IBM Plex Mono", "Fira Code", monospace',
  },
  electrolize: {
    id: 'electrolize',
    label: 'J — Electrolize',
    description: 'Digital LCD terminal vibe',
    sans: '"Electrolize", "Space Grotesk", sans-serif',
    display: '"Electrolize", "Space Grotesk", sans-serif',
    mono: '"Share Tech Mono", "Fira Code", monospace',
  },
};

export const fontPresetList: FontPreset[] = Object.values(fontPresets);

const STORAGE_KEY = 'ns-font-preset';

export function getStoredFontPreset(): FontPresetId {
  const stored = localStorage.getItem(STORAGE_KEY);
  if (stored && stored in fontPresets) {
    return stored as FontPresetId;
  }
  return 'current';
}

export function applyFontPreset(presetId: FontPresetId) {
  const preset = fontPresets[presetId];
  const root = document.documentElement;
  root.style.setProperty('--ns-font-sans', preset.sans);
  root.style.setProperty('--ns-font-display', preset.display);
  root.style.setProperty('--ns-font-mono', preset.mono);
  root.setAttribute('data-font-preset', presetId);
  localStorage.setItem(STORAGE_KEY, presetId);
}
