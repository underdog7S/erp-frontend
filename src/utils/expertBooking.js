/**
 * Public booking links are supplied at build time. React embeds REACT_APP_*
 * values in the client bundle, so this must be a public HTTPS scheduling page
 * and never a Calendly API token or other secret.
 */
const configuredUrl = process.env.REACT_APP_EXPERT_BOOKING_URL?.trim();

export const expertBookingUrl = (() => {
  if (!configuredUrl) return '';

  try {
    const url = new URL(configuredUrl);
    return url.protocol === 'https:' ? url.toString() : '';
  } catch {
    return '';
  }
})();

export const openExpertBooking = () => {
  if (!expertBookingUrl) return false;
  window.open(expertBookingUrl, '_blank', 'noopener,noreferrer');
  return true;
};
