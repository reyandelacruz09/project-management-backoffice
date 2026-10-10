const baseUrl = (import.meta.env.VITE_API_BASE_URL || '/api').replace(/\/$/, '');

export function createApi(token) {
  async function request(path, options = {}) {
    const headers = {
      Accept: 'application/json',
      ...(options.body ? { 'Content-Type': 'application/json' } : {}),
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...options.headers,
    };
    const response = await fetch(`${baseUrl}${path}`, { ...options, headers });
    if (response.status === 204) return null;

    const payload = await response.json().catch(() => ({}));
    if (!response.ok) {
      if (response.status === 401) window.dispatchEvent(new Event('api-unauthorized'));
      const validation = payload.errors ? Object.values(payload.errors).flat().join(' ') : '';
      throw new Error(validation || payload.message || `Request failed (${response.status})`);
    }
    return payload;
  }

  const json = (method, data) => ({ method, body: JSON.stringify(data) });

  return {
    login: (email, password) => request('/login', json('POST', { email, password })),
    me: () => request('/user'),
    logout: () => request('/logout', json('POST', {})),
    projects: (search = '') => request(`/projects?per_page=100${search ? `&search=${encodeURIComponent(search)}` : ''}`),
    project: (id) => request(`/projects/${id}`),
    createProject: (data) => request('/projects', json('POST', data)),
    updateProject: (id, data) => request(`/projects/${id}`, json('PUT', data)),
    deleteProject: (id) => request(`/projects/${id}`, { method: 'DELETE' }),
    teams: () => request('/teams'),
    tasks: (projectId) => request(`/projects/${projectId}/tasks`),
    createTask: (projectId, data) => request(`/projects/${projectId}/tasks`, json('POST', data)),
    updateTask: (projectId, taskId, data) => request(`/projects/${projectId}/tasks/${taskId}`, json('PATCH', data)),
    deleteTask: (projectId, taskId) => request(`/projects/${projectId}/tasks/${taskId}`, { method: 'DELETE' }),
  };
}
