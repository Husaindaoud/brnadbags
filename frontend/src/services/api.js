import axios from 'axios';

const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

const api = axios.create({ baseURL: BASE_URL });

// Attach stored JWT to every request
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('admin_token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// Debug: log all responses
api.interceptors.response.use((response) => {
  console.log('[API]', response.config.url, typeof response.data, Array.isArray(response.data) ? 'array' : response.data);
  return response;
});

export default api;

export const getImageUrl = (url) => {
  if (!url) return null;
  if (url.startsWith('http')) return url;
  return `${BASE_URL}${url}`;
};

// ── API helpers ───────────────────────────────────────────────────────────────

export const settingsApi = {
  get: () => api.get('/settings').then(r => r.data),
  update: (data) => api.put('/settings', data).then(r => r.data),
  uploadLogo: (file) => {
    const fd = new FormData(); fd.append('file', file);
    return api.post('/settings/logo', fd).then(r => r.data);
  },
  deleteLogo: () => api.delete('/settings/logo').then(r => r.data),
  uploadFavicon: (file) => {
    const fd = new FormData(); fd.append('file', file);
    return api.post('/settings/favicon', fd).then(r => r.data);
  },
  deleteFavicon: () => api.delete('/settings/favicon').then(r => r.data),
};

export const categoriesApi = {
  list: () => api.get('/categories').then(r => r.data),
  get: (id) => api.get(`/categories/${id}`).then(r => r.data),
  create: (data) => api.post('/categories', data).then(r => r.data),
  update: (id, data) => api.put(`/categories/${id}`, data).then(r => r.data),
  uploadImage: (id, file) => {
    const fd = new FormData(); fd.append('file', file);
    return api.post(`/categories/${id}/image`, fd).then(r => r.data);
  },
  delete: (id) => api.delete(`/categories/${id}`),
};

export const brandsApi = {
  list: () => api.get('/brands').then(r => r.data),
  get: (id) => api.get(`/brands/${id}`).then(r => r.data),
  create: (data) => api.post('/brands', data).then(r => r.data),
  update: (id, data) => api.put(`/brands/${id}`, data).then(r => r.data),
  uploadLogo: (id, file) => {
    const fd = new FormData(); fd.append('file', file);
    return api.post(`/brands/${id}/logo`, fd).then(r => r.data);
  },
  delete: (id) => api.delete(`/brands/${id}`),
};

export const collectionsApi = {
  list: () => api.get('/collections').then(r => r.data),
  get: (id) => api.get(`/collections/${id}`).then(r => r.data),
  create: (data) => api.post('/collections', data).then(r => r.data),
  update: (id, data) => api.put(`/collections/${id}`, data).then(r => r.data),
  delete: (id) => api.delete(`/collections/${id}`),
};

export const productsApi = {
  list: (params) => api.get('/products', { params }).then(r => r.data),
  get: (id) => api.get(`/products/${id}`).then(r => r.data),
  create: (data) => api.post('/products', data).then(r => r.data),
  update: (id, data) => api.put(`/products/${id}`, data).then(r => r.data),
  delete: (id) => api.delete(`/products/${id}`),
  uploadImages: (id, files) => {
    const fd = new FormData();
    files.forEach(f => fd.append('files', f));
    return api.post(`/products/${id}/images`, fd).then(r => r.data);
  },
  setPrimaryImage: (productId, imageId) =>
    api.patch(`/products/${productId}/images/${imageId}/primary`).then(r => r.data),
  deleteImage: (productId, imageId) =>
    api.delete(`/products/${productId}/images/${imageId}`),
};

export const slidersApi = {
  list: () => api.get('/sliders').then(r => r.data),
  upload: (file, caption, link, order) => {
    const fd = new FormData();
    fd.append('file', file);
    if (caption) fd.append('caption', caption);
    if (link) fd.append('link', link);
    fd.append('order', order ?? 0);
    return api.post('/sliders', fd).then(r => r.data);
  },
  update: (id, data) => api.put(`/sliders/${id}`, data).then(r => r.data),
  reorder: (items) => api.put('/sliders/reorder/batch', { items }).then(r => r.data),
  delete: (id) => api.delete(`/sliders/${id}`),
};

export const announcementsApi = {
  active: () => api.get('/announcements/active').then(r => r.data),
  list: () => api.get('/announcements').then(r => r.data),
  create: (data) => api.post('/announcements', data).then(r => r.data),
  update: (id, data) => api.put(`/announcements/${id}`, data).then(r => r.data),
  toggle: (id) => api.patch(`/announcements/${id}/toggle`).then(r => r.data),
  delete: (id) => api.delete(`/announcements/${id}`),
};

export const ordersApi = {
  create: (data) => api.post('/orders', data).then(r => r.data),
  list: () => api.get('/orders').then(r => r.data),
  get: (id) => api.get(`/orders/${id}`).then(r => r.data),
  updateStatus: (id, status) => api.patch(`/orders/${id}/status`, { status }).then(r => r.data),
};

export const promoApi = {
  validate: (code) => api.get('/promo/validate', { params: { code } }).then(r => r.data),
};

export const promoCodesApi = {
  list: () => api.get('/promo-codes').then(r => r.data),
  create: (data) => api.post('/promo-codes', data).then(r => r.data),
  update: (id, data) => api.put(`/promo-codes/${id}`, data).then(r => r.data),
  delete: (id) => api.delete(`/promo-codes/${id}`),
};

export const authApi = {
  login: (username, password) =>
    api.post('/auth/login', { username, password }).then(r => r.data),
  me: () => api.get('/auth/me').then(r => r.data),
};
