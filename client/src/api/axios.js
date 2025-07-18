import axios from 'axios';
import { store } from '../store/store';
import { logout, reset } from '../features/auth/authSlice';
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';
const axiosInstance = axios.create({
    baseURL: API_BASE_URL
});
let isNetworkErrorToastVisible = false;
axiosInstance.interceptors.response.use(
  (response) => {
    if (isNetworkErrorToastVisible) {
      isNetworkErrorToastVisible = false;
    }
    return response;
  },
  (error) => {
    if (!error.response) {
      if (!isNetworkErrorToastVisible) {
        isNetworkErrorToastVisible = true;
        toast.error(
          'Could not connect to the server. Please check your connection or try again later.', 
          { 
            id: 'network-error-toast',
            duration: 5000
          }
        );
      }
      return Promise.reject(error);
    }
    if (error.response.status === 401) {
      console.log('Authentication error (401) detected. Logging out user.');
      store.dispatch(logout());
      store.dispatch(reset());
    }
    return Promise.reject(error);
  }
);

export default axiosInstance;