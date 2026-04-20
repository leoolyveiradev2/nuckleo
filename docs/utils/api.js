// Camada de comunicação com a API - Placeholder
/* utils/api.js — Centralized API layer */
const API_BASE = window.location.hostname === 'localhost'
  ? 'http://localhost:5000/api'
  : 'https://nuckleo-production.up.railway.app/api';

const api = {
  /* ── Internal ───────────────────────────────────── */
  _getToken() {
    return localStorage.getItem('nuckleo_token');
  },

  async _request(method, endpoint, body = null, isFormData = false) {
    const headers = {};
    const token = this._getToken();
    if (token) headers['Authorization'] = `Bearer ${token}`;
    if (!isFormData && body) headers['Content-Type'] = 'application/json';

    const config = { method, headers };
    if (body) config.body = isFormData ? body : JSON.stringify(body);

    try {
      const res = await fetch(`${API_BASE}${endpoint}`, config);
      const data = await res.json();

      if (!res.ok) {
        throw { status: res.status, message: data.message || 'Request failed', data };
      }
      return data;
    } catch (err) {
      if (err.status === 401) {
        // Token expired
        localStorage.removeItem('nuckleo_token');
        window.dispatchEvent(new CustomEvent('auth:expired'));
      }
      throw err;
    }
  },

  get:    (url)         => api._request('GET', url),
  post:   (url, body)   => api._request('POST', url, body),
  put:    (url, body)   => api._request('PUT', url, body),
  delete: (url)         => api._request('DELETE', url),
  upload: (url, fd)     => api._request('POST', url, fd, true),

  /* ── Auth ────────────────────────────────────────── */
  auth: {
    register: (data)       => api.post('/auth/register', data),
    login:    (data)       => api.post('/auth/login', data),
    google:   (credential) => api.post('/auth/google', { credential }),
    me:       ()           => api.get('/auth/me'),
  },

  /* ── Spaces ──────────────────────────────────────── */
  spaces: {
    list:     (params = '') => api.get(`/spaces?${params}`),
    create:   (data)        => api.post('/spaces', data),
    get:      (id)          => api.get(`/spaces/${id}`),
    update:   (id, data)    => api.put(`/spaces/${id}`, data),
    delete:   (id)          => api.delete(`/spaces/${id}`),
    byToken:  (token)       => api.get(`/spaces/shared/${token}`),
    items:    (spaceId, p)  => api.get(`/spaces/${spaceId}/items${p ? '?' + p : ''}`),
    addItem:  (spaceId, d)  => api.post(`/spaces/${spaceId}/items`, d),
  },

  /* ── Items ───────────────────────────────────────── */
  items: {
    get:       (id)      => api.get(`/items/${id}`),
    update:    (id, d)   => api.put(`/items/${id}`, d),
    delete:    (id)      => api.delete(`/items/${id}`),
    favorites: (p = '')  => api.get(`/items/favorites?${p}`),
    byToken:   (token)   => api.get(`/items/shared/${token}`),
  },

  /* ── Users ───────────────────────────────────────── */
  users: {
    profile:       (username) => api.get(`/users/${username}`),
    updateProfile: (data)     => api.put('/users/me/profile', data),
    preferences:   (data)     => api.put('/users/me/preferences', data),
    friends:       ()         => api.get('/users/friends'),
    search:        (q)        => api.get(`/users/search?q=${encodeURIComponent(q)}`),
    sendRequest:   (id)       => api.post(`/users/${id}/friend-request`),
    acceptRequest: (id)       => api.post(`/users/${id}/accept-friend`),
    removeFriend:  (id)       => api.delete(`/users/${id}/friend`),
  },

  /* ── Search ──────────────────────────────────────── */
  search: (q, type = '') => api.get(`/search?q=${encodeURIComponent(q)}&type=${type}`),

  /* ── Notifications ───────────────────────────────── */
  notifications: {
    list:    ()   => api.get('/notifications'),
    readAll: ()   => api.put('/notifications/read-all'),
    read:    (id) => api.put(`/notifications/${id}/read`),
    delete:  (id) => api.delete(`/notifications/${id}`),
  },
};
