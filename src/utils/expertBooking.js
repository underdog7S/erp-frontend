/**
 * Public booking links are supplied at build time. React embeds REACT_APP_*
 * values in the client bundle, so this must be a public HTTPS scheduling page
 * and never a Calendly API token or other secret.
 *
 * Keep the original string (do not URL#toString) so Google Appointment
 * short links such as calendar.app.google/... are not rewritten.
 */
const configuredUrl = process.env.REACT_APP_EXPERT_BOOKING_URL?.trim();

const isHttpsPublicUrl = (value) => {
  try {
    return new URL(value).protocol === 'https:';
  } catch {
    return false;
  }
};

export const expertBookingUrl =
  configuredUrl && isHttpsPublicUrl(configuredUrl) ? configuredUrl : '';

export const openExpertBooking = () => {
  if (!expertBookingUrl) return false;
  window.open(expertBookingUrl, '_blank', 'noopener,noreferrer');
  return true;
};
