import axios from "axios";

const axiosInstance = axios.create({
  baseURL: "https://client-1-6rax.onrender.com/api",
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json'
  }
});

// ✅ Request Interceptor – Add Bearer token
axiosInstance.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");
    if (token) {
      config.headers["Authorization"] = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// ✅ Response Interceptor (optional: handle auth errors)
axiosInstance.interceptors.response.use(
  (response) => response,
  async (error) => {
    // Optional: auto-logout or redirect on 401, etc.
    if (error.response?.status === 401) {
      console.warn("Unauthorized request – possible token issue");
    }
    return Promise.reject(error);
  }
);

export default axiosInstance;
