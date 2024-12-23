import axios from 'axios';

export const getApiBaseUrl = () => {
  const protocol = window.location.protocol === 'https:' ? 'https' : 'http';
  const baseUrl = process.env.REACT_APP_URL.replace(/^https?:\/\//, '');
  return `${protocol}://${baseUrl}`;
};

export const fetchProducts = () => axios.get(`${getApiBaseUrl()}/barang`, { withCredentials: true });
export const fetchCategories = () => axios.get(`${getApiBaseUrl()}/kategori`, { withCredentials: true });
export const fetchBranchName = () => axios.get(`${getApiBaseUrl()}/cabang`, { withCredentials: true });
export const createTransaction = (data) =>
  axios.post(`${getApiBaseUrl()}/createtransaksi`, data, { withCredentials: true });
export const getTransactionNotification = (orderId) =>
  axios.get(`${getApiBaseUrl()}/gettransaksinotification/${orderId}`);
