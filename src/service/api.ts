// services/api.ts
import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

// Liste des routes publiques qui ne nécessitent pas d'authentification
const PUBLIC_ROUTES = [
  '/categories',
  '/sous-categories', 
  '/produits',
  '/guides',
  '/guides/',
  '/avis/latest',
  '/newsletter/subscribe',
  '/newsletter/unsubscribe',
  '/cookies/consent',
  '/cookies/consent/check',
  '/devis-express',
  '/profils-configurateur',
  '/utilisateurs/register',
  '/utilisateurs/login',
  '/admin/login',
  '/admin/register',
];

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  },
});

// Intercepteur pour ajouter le token UNIQUEMENT pour les routes protégées
api.interceptors.request.use(
  (config) => {
    // Vérifier si la route est publique
    const isPublicRoute = PUBLIC_ROUTES.some(route => {
      // Vérifier si l'URL commence par la route publique
      return config.url?.startsWith(route) || config.url === route;
    });

    // Si la route n'est pas publique, ajouter le token
    if (!isPublicRoute) {
      const token = localStorage.getItem('token');
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    }
    
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Intercepteur pour gérer les erreurs 401 (uniquement pour les routes protégées)
api.interceptors.response.use(
  (response) => response,
  (error) => {
    // Vérifier si la route est publique
    const isPublicRoute = PUBLIC_ROUTES.some(route => {
      return error.config?.url?.startsWith(route) || error.config?.url === route;
    });

    // Si l'erreur est 401 et que ce n'est pas une route publique
    if (error.response?.status === 401 && !isPublicRoute) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      // Ne pas rediriger automatiquement, laisser le composant gérer
      // window.location.href = '/login?session_expired=true';
    }
    
    return Promise.reject(error);
  }
);

export default api;