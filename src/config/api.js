// Configuration API dynamique
export const getApiUrl = () => {
    // En production, utiliser l'URL de production
    if (import.meta.env.PROD) {
        return import.meta.env.VITE_API_URL || 'https://api.lescasaniers.com/api';
    }
    
    // En développement, détection automatique
    const hostname = window.location.hostname;
    
    // Si c'est localhost ou 127.0.0.1
    if (hostname === 'localhost' || hostname === '127.0.0.1') {
        return 'http://127.0.0.1:8000/api';
    }
    
    // Si c'est une IP sur le réseau (192.168.x.x, 10.x.x.x, etc.)
    // Utilise la même IP que le frontend avec le port 8000
    return `http://${hostname}:8000/api`;
};

export default getApiUrl;