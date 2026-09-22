export const PALETTES = [
  {
    id: 'deep-sea',
    name: 'Deep Sea',
    colors: {
      bg: '#0D1B2A',
      surface: '#1B263B',
      accent: '#415A77',
      muted: '#778DA9',
      text: '#E0E1DD',
    },
  },
  {
    id: 'evergreen',
    name: 'Evergreen',
    colors: {
      bg: '#081C15',
      surface: '#1B4332',
      accent: '#2D6A4F',
      muted: '#74C69D',
      text: '#D8F3DC',
    },
  },
  {
    id: 'ember',
    name: 'Ember',
    colors: {
      bg: '#1A1210',
      surface: '#2B1C18',
      accent: '#8C4A32',
      muted: '#C4A484',
      text: '#F2E8DC',
    },
  },
  {
    id: 'onyx',
    name: 'Onyx',
    colors: {
      bg: '#000000',
      surface: '#161616',
      accent: '#5C5C5C',
      muted: '#9A9A9A',
      text: '#F2F2F2',
    },
  },
];

export const DEFAULT_PALETTE = 'onyx';

export function getPalette(id) {
  return PALETTES.find((palette) => palette.id === id) || PALETTES[0];
}

export function applyPalette(id) {
  const palette = getPalette(id);
  const root = document.documentElement;
  root.dataset.palette = palette.id;
  root.style.setProperty('--bg', palette.colors.bg);
  root.style.setProperty('--surface', palette.colors.surface);
  root.style.setProperty('--accent', palette.colors.accent);
  root.style.setProperty('--muted', palette.colors.muted);
  root.style.setProperty('--text', palette.colors.text);
}
