export const ENV = {
  // In production the backend serves the app, so the API is on the same address
  API_BASE_URL: import.meta.env.VITE_API_BASE_URL ?? '/edu-tracker/api/v1',
};
