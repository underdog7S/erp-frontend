import api from '../services/api';

// Fetch a PDF from the API (with the login token) and open it in a new tab. Resolves true on success.
export async function openPdf(path) {
  try {
    const res = await api.get(path, { responseType: 'blob' });
    window.open(URL.createObjectURL(new Blob([res.data], { type: 'application/pdf' })), '_blank', 'noopener');
    return true;
  } catch (e) {
    return false;
  }
}
