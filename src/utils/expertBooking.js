/**
 * Public booking links are supplied at build time. React embeds REACT_APP_*
 * values in the client bundle, so this must be a public HTTPS scheduling page
 * and never a Calendly API token or other secret.
 *
 * Keep the original string (do not URL#toString) so Google Appointment
 * short links such as calendar.app.google/... are not rewritten.
 *
 * Inline embeds must use calendar.google.com/calendar/appointments/schedules/ID?gv=true.
 * The share link (calendar.app.google/...) cannot be iframed.
 */
const configuredUrl = process.env.REACT_APP_EXPERT_BOOKING_URL?.trim();
const configuredEmbed = process.env.REACT_APP_EXPERT_BOOKING_EMBED_URL?.trim();

const isHttpsPublicUrl = (value) => {
  try {
    return new URL(value).protocol === 'https:';
  } catch {
    return false;
  }
};

const scheduleIdFromUrl = (value) => {
  if (!value) return '';
  try {
    const match = new URL(value).pathname.match(/appointments\/schedules\/([^/]+)/);
    return match?.[1] || '';
  } catch {
    return '';
  }
};

export const expertBookingUrl =
  configuredUrl && isHttpsPublicUrl(configuredUrl) ? configuredUrl : '';

const HERITAGE_SCHEDULE_ID =
  'AcZssZ2kALFZwClo9bBmY1l0Mnjj84LkKGVypN9Mh333ckVSnnQkqapu1InTVDRNqLl54w3lq635kc1I';

const resolvedScheduleId = (() => {
  const fromEmbed = configuredEmbed && isHttpsPublicUrl(configuredEmbed)
    ? scheduleIdFromUrl(configuredEmbed)
    : '';
  if (fromEmbed) return fromEmbed;
  const fromBooking = scheduleIdFromUrl(expertBookingUrl);
  if (fromBooking) return fromBooking;
  return HERITAGE_SCHEDULE_ID;
})();

export const expertBookingEmbedUrl = resolvedScheduleId
  ? `https://calendar.google.com/calendar/appointments/schedules/${resolvedScheduleId}?gv=true`
  : '';

export const openExpertBooking = () => {
  if (!expertBookingUrl) return false;
  window.open(expertBookingUrl, '_blank', 'noopener,noreferrer');
  return true;
};
