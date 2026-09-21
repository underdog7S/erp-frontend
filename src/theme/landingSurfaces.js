/**
 * Shared dark tokens for public/landing pages.
 * Use `background` (not `bgcolor`) so the app Card theme cannot paint cards white.
 */
export const darkSurface = {
  page: '#080810',
  section: '#0d0d1a',
  sectionAlt: '#0a0a14',
  sectionDeep: '#040408',
  card: 'rgba(16, 20, 34, 0.92)',
  cardMuted: 'rgba(12, 16, 28, 0.94)',
  cardMission: 'rgba(12, 31, 56, 0.94)',
  cardVision: 'rgba(9, 38, 31, 0.94)',
  input: 'rgba(7, 12, 24, 0.88)',
};

export const darkBorder = {
  subtle: 'rgba(255,255,255,0.07)',
  strong: 'rgba(255,255,255,0.12)',
};

export const darkText = {
  primary: '#ffffff',
  secondary: 'rgba(255,255,255,0.85)',
  muted: 'rgba(255,255,255,0.6)',
  faint: 'rgba(255,255,255,0.5)',
};

export const landingCardSx = {
  background: darkSurface.card,
  border: `1px solid ${darkBorder.subtle}`,
  color: darkText.primary,
  boxShadow: 'none',
};
