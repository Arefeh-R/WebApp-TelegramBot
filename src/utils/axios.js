import axios from 'axios';

// Create axios instance with base configuration
const axiosServices = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:8000/api1'
});

// ==============================|| AXIOS - REQUEST INTERCEPTOR ||============================== //

axiosServices.interceptors.request.use(
  async (config) => {
    // Get token from localStorage
    const accessToken = localStorage.getItem('authToken');
    
    if (accessToken) {
      config.headers['Authorization'] = `Bearer ${accessToken}`;
    }
    
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// ==============================|| AXIOS - RESPONSE INTERCEPTOR ||============================== //

axiosServices.interceptors.response.use(
  (response) => response,
  (error) => {
    // Handle 401 Unauthorized
    if (error.response?.status === 401 && !window.location.href.includes('/login')) {
      localStorage.removeItem('authToken');
      window.location.pathname = '/login';
    }
    
    // Handle 500 Server Error
    if (error.response?.status === 500) {
      console.error('Server Error:', error.response.data);
    }
    
    return Promise.reject((error.response && error.response.data) || 'Something went wrong');
  }
);

export default axiosServices;

// ==============================|| FETCHER FOR SWR ||============================== //

export const fetcher = async (args) => {
  const [url, config] = Array.isArray(args) ? args : [args];
  
  const res = await axiosServices.get(url, { ...config });
  
  return res.data;
};

// ==============================|| AXIOS - MULTIPLE GET ||============================== //

export const fetcherMultiple = async (...urls) => {
  const promises = urls.map((url) => axiosServices.get(url).then((res) => res.data));
  return Promise.all(promises);
};