const BASE_URL = (
  import.meta.env.VITE_API_URL || 'http://127.0.0.1:8000/api/v1'
).replace('/api/v1', '');

export const getMediaUrl = (path) => {
  if (!path) return null;
  if (path.startsWith('http')) return path;
  return `${BASE_URL}${path}`;
};