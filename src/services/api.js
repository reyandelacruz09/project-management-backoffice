const baseUrl = (import.meta.env.VITE_API_BASE_URL || '/api').replace(/\/$/, '');

let currentToken = sessionStorage.getItem('backoffice_token') || '';

export function setToken(token) {
  currentToken = token;
  if (token) {
    sessionStorage.setItem('backoffice_token', token);
  } else {
    sessionStorage.removeItem('backoffice_token');
  }
}

export function getToken() {
  return currentToken;
}

export class ApiError extends Error {
  constructor(message, status, errors = {}) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.errors = errors;
  }
}

export async function request(path, options = {}) {
  const headers = {
    Accept: 'application/json',
    ...(options.body ? { 'Content-Type': 'application/json' } : {}),
    ...(currentToken ? { Authorization: `Bearer ${currentToken}` } : {}),
    ...options.headers,
  };

  const response = await fetch(`${baseUrl}${path}`, { ...options, headers });

  if (response.status === 204) {
    return null;
  }

  const payload = await response.json().catch(() => ({}));

  if (!response.ok) {
    if (response.status === 401) {
      window.dispatchEvent(new CustomEvent('auth:unauthorized'));
    }

    const firstValidationMessage = payload.errors
      ? Object.values(payload.errors).flat()[0]
      : null;

    const message =
      firstValidationMessage ||
      payload.message ||
      `Request failed with status ${response.status}`;

    throw new ApiError(message, response.status, payload.errors || {});
  }

  return payload;
}

const json = (method, data) => ({
  method,
  body: JSON.stringify(data),
});

export const api = {
  // Auth
  login: (email, password) => request('/login', json('POST', { email, password })),
  user: () => request('/user'),
  logout: () => request('/logout', json('POST', {})),

  // Users
  users: (search = '') => request(`/users${search ? `?search=${encodeURIComponent(search)}` : ''}`),

  // Projects
  projects: (params = {}) => {
    const query = new URLSearchParams();
    if (params.search) query.set('search', params.search);
    if (params.status) query.set('status', params.status);
    if (params.page) query.set('page', params.page);
    if (params.per_page) query.set('per_page', params.per_page);
    const qs = query.toString();
    return request(`/projects${qs ? `?${qs}` : ''}`);
  },
  project: (id) => request(`/projects/${id}`),
  createProject: (data) => request('/projects', json('POST', data)),
  updateProject: (id, data) => request(`/projects/${id}`, json('PUT', data)),
  deleteProject: (id) => request(`/projects/${id}`, { method: 'DELETE' }),

  // Tasks
  tasks: (projectId) => request(`/projects/${projectId}/tasks`),
  task: (projectId, taskId) => request(`/projects/${projectId}/tasks/${taskId}`),
  createTask: (projectId, data) => request(`/projects/${projectId}/tasks`, json('POST', data)),
  updateTask: (projectId, taskId, data) => request(`/projects/${projectId}/tasks/${taskId}`, json('PUT', data)),
  deleteTask: (projectId, taskId) => request(`/projects/${projectId}/tasks/${taskId}`, { method: 'DELETE' }),

  // Teams
  teams: () => request('/teams'),
  team: (id) => request(`/teams/${id}`),
  createTeam: (data) => request('/teams', json('POST', data)),
  updateTeam: (id, data) => request(`/teams/${id}`, json('PUT', data)),
  deleteTeam: (id) => request(`/teams/${id}`, { method: 'DELETE' }),

  // Comments
  comments: (type, id) => {
    const fullType = type === 'Task' ? 'App\\Models\\Task' : 'App\\Models\\Project';
    return request(`/comments?commentable_type=${encodeURIComponent(fullType)}&commentable_id=${id}&per_page=100`);
  },
  createComment: (type, id, body) => {
    const fullType = type === 'Task' ? 'App\\Models\\Task' : 'App\\Models\\Project';
    return request('/comments', json('POST', {
      commentable_type: fullType,
      commentable_id: Number(id),
      body,
    }));
  },
  deleteComment: (commentId) => request(`/comments/${commentId}`, { method: 'DELETE' }),
};
