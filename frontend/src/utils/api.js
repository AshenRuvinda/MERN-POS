import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:5000/api',
});

api.interceptors.request.use(config => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export const adminRegister = data => api.post('/users/admin-register', data);
export const login = data => api.post('/users/login', data);
export const register = data => api.post('/users/register', data);
export const getUsers = () => api.get('/users');
export const updateUser = (id, data) => api.put(`/users/${id}`, data);
export const getProducts = () => api.get('/products');
export const createProduct = data => api.post('/products', data);
export const updateProduct = (id, data) => api.put(`/products/${id}`, data);
export const deleteProduct = id => api.delete(`/products/${id}`);
export const updateStock = (id, data) => api.put(`/products/stock/${id}`, data);
export const createSale = data => api.post('/sales', data);
export const getSales = () => api.get('/sales');
export const getReports = () => api.get('/sales/reports');