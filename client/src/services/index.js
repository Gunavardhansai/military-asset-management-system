import apiClient from './api.js';

export const authService = {
  login: (email, password) =>
    apiClient.post('/auth/login', { email, password }),

  register: (fullName, email, password, role, base) =>
    apiClient.post('/auth/register', {
      fullName,
      email,
      password,
      role,
      base,
    }),

  logout: () => apiClient.post('/auth/logout'),

  getMe: () => apiClient.get('/auth/me'),
};

export const purchaseService = {
  create: (data) => apiClient.post('/purchases', data),
  getAll: (params) => apiClient.get('/purchases', { params }),
  getById: (id) => apiClient.get(`/purchases/${id}`),
  update: (id, data) => apiClient.put(`/purchases/${id}`, data),
  delete: (id) => apiClient.delete(`/purchases/${id}`),
};

export const transferService = {
  create: (data) => apiClient.post('/transfers', data),
  getAll: (params) => apiClient.get('/transfers', { params }),
  getById: (id) => apiClient.get(`/transfers/${id}`),
  approve: (id) => apiClient.patch(`/transfers/${id}/approve`),
  receive: (id) => apiClient.patch(`/transfers/${id}/receive`),
  cancel: (id) => apiClient.patch(`/transfers/${id}/cancel`),
};

export const assignmentService = {
  create: (data) => apiClient.post('/assignments', data),
  getAll: (params) => apiClient.get('/assignments', { params }),
  getById: (id) => apiClient.get(`/assignments/${id}`),
  update: (id, data) => apiClient.put(`/assignments/${id}`, data),
  return: (id) => apiClient.patch(`/assignments/${id}/return`),
  delete: (id) => apiClient.delete(`/assignments/${id}`),
};

export const expenditureService = {
  create: (data) => apiClient.post('/expenditures', data),
  getAll: (params) => apiClient.get('/expenditures', { params }),
  getById: (id) => apiClient.get(`/expenditures/${id}`),
  update: (id, data) => apiClient.put(`/expenditures/${id}`, data),
  delete: (id) => apiClient.delete(`/expenditures/${id}`),
};

export const dashboardService = {
  getStats: (params) => apiClient.get('/dashboard/stats', { params }),
  getMonthlyMovement: (params) =>
    apiClient.get('/dashboard/monthly-movement', { params }),
  getAssetDistribution: (params) =>
    apiClient.get('/dashboard/asset-distribution', { params }),
  getNetMovement: (params) =>
    apiClient.get('/dashboard/net-movement', { params }),
};

export const auditLogService = {
  getAll: (params) => apiClient.get('/audit-logs', { params }),
  getById: (id) => apiClient.get(`/audit-logs/${id}`),
  getUserActivity: (userId, params) =>
    apiClient.get(`/audit-logs/user/${userId}/activity`, { params }),
  getActionSummary: (params) =>
    apiClient.get('/audit-logs/report/summary', { params }),
};

export const userService = {
  create: (data) => apiClient.post('/users', data),
  getAll: (params) => apiClient.get('/users', { params }),
  getById: (id) => apiClient.get(`/users/${id}`),
  update: (id, data) => apiClient.put(`/users/${id}`, data),
  delete: (id) => apiClient.delete(`/users/${id}`),
};

export const baseService = {
  create: (data) => apiClient.post('/bases', data),
  getAll: (params) => apiClient.get('/bases', { params }),
  getById: (id) => apiClient.get(`/bases/${id}`),
  update: (id, data) => apiClient.put(`/bases/${id}`, data),
  delete: (id) => apiClient.delete(`/bases/${id}`),
};

export const assetService = {
  create: (data) => apiClient.post('/assets', data),
  getAll: (params) => apiClient.get('/assets', { params }),
  getById: (id) => apiClient.get(`/assets/${id}`),
  update: (id, data) => apiClient.put(`/assets/${id}`, data),
  delete: (id) => apiClient.delete(`/assets/${id}`),
};

export const inventoryService = {
  getAll: (params) => apiClient.get('/inventory', { params }),
  getByBaseAndAsset: (base, asset) =>
    apiClient.get(`/inventory/${base}/${asset}`),
  getReport: (params) =>
    apiClient.get('/inventory/report/summary', { params }),
};
