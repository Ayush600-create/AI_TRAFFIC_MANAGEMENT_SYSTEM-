export const API_BASE_URL = import.meta.env.VITE_API_URL || '';

if (!import.meta.env.VITE_API_URL && import.meta.env.MODE === 'production') {
  console.error('[API ERROR] VITE_API_URL environment variable is not set. API calls will fallback to empty string (same-origin relative paths).');
}

export const apiUrl = (path) => `${API_BASE_URL}${path}`;
