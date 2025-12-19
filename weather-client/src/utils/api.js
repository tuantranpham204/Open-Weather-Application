// src/utils/api.js
import axios from 'axios';
import { jwtDecode } from 'jwt-decode';

const API_URL = 'http://127.0.0.1:8000/api/';

const api = axios.create({
    baseURL: API_URL,
    headers: {
        'Content-Type': 'application/json',
    },
});

// Request interceptor - Add token and check expiration
api.interceptors.request.use(
    async (config) => {
        const tokenString = localStorage.getItem('authTokens');
        if (tokenString) {
            const tokens = JSON.parse(tokenString);
            const accessToken = tokens.access;
            
            if (accessToken) {
                // Check if token is expired
                const decoded = jwtDecode(accessToken);
                const currentTime = Date.now() / 1000;
                
                // If token expires in less than 30 seconds, refresh it
                if (decoded.exp < currentTime + 30) {
                    try {
                        const response = await axios.post(`${API_URL}token/refresh/`, {
                            refresh: tokens.refresh
                        });
                        
                        // Update tokens
                        const newTokens = {
                            access: response.data.access,
                            refresh: tokens.refresh
                        };
                        localStorage.setItem('authTokens', JSON.stringify(newTokens));
                        config.headers.Authorization = `Bearer ${response.data.access}`;
                    } catch (error) {
                        // Refresh token failed, logout user
                        console.error('Token refresh failed:', error);
                        localStorage.removeItem('authTokens');
                        window.location.href = '/login';
                        return Promise.reject(error);
                    }
                } else {
                    config.headers.Authorization = `Bearer ${accessToken}`;
                }
            }
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

// Response interceptor - Handle 401 errors
api.interceptors.response.use(
    (response) => response,
    async (error) => {
        const originalRequest = error.config;
        
        // If 401 and not already retried
        if (error.response?.status === 401 && !originalRequest._retry) {
            originalRequest._retry = true;
            
            const tokenString = localStorage.getItem('authTokens');
            if (tokenString) {
                try {
                    const tokens = JSON.parse(tokenString);
                    const response = await axios.post(`${API_URL}token/refresh/`, {
                        refresh: tokens.refresh
                    });
                    
                    const newTokens = {
                        access: response.data.access,
                        refresh: tokens.refresh
                    };
                    localStorage.setItem('authTokens', JSON.stringify(newTokens));
                    
                    // Retry original request with new token
                    originalRequest.headers.Authorization = `Bearer ${response.data.access}`;
                    return api(originalRequest);
                } catch (refreshError) {
                    console.error('Token refresh failed:', refreshError);
                    localStorage.removeItem('authTokens');
                    window.location.href = '/login';
                    return Promise.reject(refreshError);
                }
            }
        }
        
        return Promise.reject(error);
    }
);

export default api;