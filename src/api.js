// Backwards-compatible export bridging to src/services/api.js
import { api, setToken, getToken, request, ApiError } from './services/api';

export { api, setToken, getToken, request, ApiError };

export function createApi(token) {
  if (token) {
    setToken(token);
  }
  return api;
}

export default api;
