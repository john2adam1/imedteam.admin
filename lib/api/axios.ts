
import axios, { AxiosError, InternalAxiosRequestConfig } from 'axios';
import Cookies from 'js-cookie';

// Helper to get base URL - prioritized: env var > default
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'https://dev.axadjonovsardorbek.uz/api';

const api = axios.create({
    baseURL: API_BASE_URL,
    headers: {
        'Content-Type': 'application/json',
    },
});

// Request Interceptor
api.interceptors.request.use(
    (config: InternalAxiosRequestConfig) => {
        // Get token from cookies or local storage
        // Using js-cookie for consistency
        const token = Cookies.get('admin_token');

        if (token && config.headers) {
            config.headers.Authorization = `Bearer ${token}`;
        }

        return config;
    },
    (error: AxiosError) => {
        return Promise.reject(error);
    }
);

// Response Interceptor
api.interceptors.response.use(
    (response) => response,
    (error: AxiosError) => {
        // Handle 401 Unauthorized
        if (error.response?.status === 401) {
            // Clear token
            Cookies.remove('admin_token');

            // Optional: Redirect to login page if we are in the browser
            if (typeof window !== 'undefined' && !window.location.pathname.includes('/auth/login')) {
                window.location.href = '/auth/login';
            }
        }

        return Promise.reject(error);
    }
);

export default api;
