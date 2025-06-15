import axios from "axios";

const axiosInstance = axios.create({
  baseURL: "http://localhost:9090/api/admin",
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json'
  }
});

// Add request interceptor to handle CSRF token
// axiosInstance.interceptors.request.use(
//   async (config) => {
//     // Only fetch CSRF token for non-GET requests
//     if (config.method !== 'get') {
//       try {
//         const response = await axios.get("https://client-1-6rax.onrender.com/api/csrf-token", {
//           withCredentials: true,
//         });
//         config.headers["x-csrf-token"] = response.data.csrfToken;
//       } catch (error) {
//         console.error("Error fetching CSRF token:", error);
//       }
//     }
//     return config;
//   },
//   (error) => {
//     return Promise.reject(error);
//   }
// );

// Add response interceptor to handle authentication errors
axiosInstance.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response?.status === 401) {
      // Clear localStorage and redirect to admin login page if unauthorized
      localStorage.removeItem('adminToken');
      localStorage.removeItem('admin-logged');
      localStorage.removeItem('adminInfo');
      window.location.href = '/admin';
      return Promise.reject(error);
    }
    return Promise.reject(error);
  }
);

// Add a method to check if admin is authenticated
axiosInstance.isAuthenticated = async () => {
  try {
    const response = await axiosInstance.get('/check-auth');
    return response.data.success === true;
  } catch (error) {
    return false;
  }
};

export default axiosInstance;
