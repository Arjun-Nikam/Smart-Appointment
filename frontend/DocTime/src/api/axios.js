import axios from 'axios';
import * as SecureStore from 'expo-secure-store';

// Your Spring Boot backend URL
// Change this to your deployed URL when going to production
const BASE_URL = 'https://pace-camping-wind-epinions.trycloudflare.com'; // ← Replace with your IP


const api = axios.create({
    baseURL: BASE_URL,
    headers: {
        'Content-Type': 'application/json',
    },
});

// Automatically attach JWT token to every request
api.interceptors.request.use(
    async (config) => {
        const token = await SecureStore.getItemAsync('token');
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => Promise.reject(error)
);

// Automatically handle token expiry
api.interceptors.response.use(
    (response) => response,
    async (error) => {
        if (error.response?.status === 401) {
            // Token expired or blacklisted — clear storage
            await SecureStore.deleteItemAsync('token');
            await SecureStore.deleteItemAsync('role');
            await SecureStore.deleteItemAsync('user');
        }
        return Promise.reject(error);
    }
);

export default api;