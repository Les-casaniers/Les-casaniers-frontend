// import axios from 'axios';

// // const api = axios.create({
// //     baseURL: 'http://127.0.0.1:8000/api',
// //     headers: {
// //         'Content-Type': 'application/json',
// //         'Accept': 'application/json',
// //     },
// //     timeout: 10000,
// // });

// const api = axios.create({
//     baseURL: 'http://192.168.1.134:8000/api', 
//     headers: {
//         'Content-Type': 'application/json',
//         'Accept': 'application/json',
//     },
// });

// // Intercepteur pour les erreurs
// api.interceptors.response.use(
//     response => response,
//     error => {
//         console.error('API Error:', error.response?.data || error.message);
//         return Promise.reject(error);
//     }
// );

// export default api;
import axios from 'axios';
import { getApiUrl } from '../config/api';

// Configuration dynamique
const API_URL = import.meta.env.VITE_API_URL || getApiUrl();

console.log('API URL:', API_URL); // Pour debug - à enlever en production

const api = axios.create({
    baseURL: API_URL,
    headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
    },
    timeout: 30000,
});

// Intercepteur pour les requêtes
api.interceptors.request.use(
    (config) => {
        // Ajouter le token si nécessaire
        const token = localStorage.getItem('token');
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

// Intercepteur pour les réponses
api.interceptors.response.use(
    (response) => {
        return response;
    },
    (error) => {
        console.error('API Error:', {
            message: error.message,
            url: error.config?.url,
            status: error.response?.status,
            data: error.response?.data
        });
        return Promise.reject(error);
    }
);

export default api;