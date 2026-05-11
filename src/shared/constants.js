const STORAGE_KEY = 'keywords';
const HIGHLIGHT_KEY = 'highlightKeywords';
const MAX_WALK_DEPTH = 15;
const DEBOUNCE_MS = 100;
const HIGHLIGHT_COLORS = {
  yellow: { border: '#fbbc04', bg: '#fffde7' },
  red:    { border: '#ea4335', bg: '#fce8e6' },
  green:  { border: '#34a853', bg: '#e6f4ea' },
  blue:   { border: '#1a73e8', bg: '#e8f0fe' },
  orange: { border: '#fa7b17', bg: '#fff3e0' },
  purple: { border: '#9334e6', bg: '#f3e8fd' },
};
const HIGHLIGHT_COLOR_KEYS = Object.keys(HIGHLIGHT_COLORS);
