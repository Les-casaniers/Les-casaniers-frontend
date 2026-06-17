// contexts/AuthContext.tsx
import { clearAuthStorage, getAuthToken, setAuthToken, setUser } from '@/components/ActionClient/services/api';
import api from '@/service/api';
import React, { createContext, useContext, useState, useEffect } from 'react';
import { toast } from '@/hooks/use-toast';

interface AuthContextType {
  user: any;
  isAuthenticated: boolean;
  isAdmin: boolean;
  isLivreur: boolean;
  login: (email: string, password: string) => Promise<any>;
  logout: () => void;
  loading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUserState] = useState<any>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const [isLivreur, setIsLivreur] = useState(false);
  const [loading, setLoading] = useState(true);

  // Vérifier l'authentification au chargement
  useEffect(() => {
    const checkAuth = async () => {
      const token = getAuthToken();
      console.log('AuthProvider - Token présent:', token ? 'Oui' : 'Non');
      
      if (!token) {
        setLoading(false);
        return;
      }

      // ✅ Configurer le token dans axios
      api.defaults.headers.common['Authorization'] = `Bearer ${token}`;

      try {
        // ✅ Essayer d'abord la route admin (pour admin et livreur)
        let userData = null;
        let isAdminUser = false;
        let isLivreurUser = false;

        try {
          const response = await api.get('/admin/profile');
          console.log('AuthProvider - Profil admin récupéré:', response.data);
          userData = response.data.data;
          isAdminUser = userData.poste === 'admin';
          isLivreurUser = userData.poste === 'livreur';
        } catch (adminError) {
          console.log('Pas de profil admin, tentative client...');
          // Si pas admin, essayer client
          try {
            const response = await api.get('/utilisateurs/profile');
            console.log('AuthProvider - Profil client récupéré:', response.data);
            userData = response.data.data || response.data;
            isAdminUser = false;
            isLivreurUser = false;
          } catch (clientError) {
            console.error('AuthProvider - Erreur récupération profil client:', clientError);
            throw new Error('Non authentifié');
          }
        }
        
        setUserState(userData);
        setIsAuthenticated(true);
        setIsAdmin(isAdminUser);
        setIsLivreur(isLivreurUser);
        
        console.log('AuthProvider - Utilisateur connecté:', userData);
        console.log('AuthProvider - isAdmin:', isAdminUser);
        console.log('AuthProvider - isLivreur:', isLivreurUser);
        
      } catch (error) {
        console.error('AuthProvider - Erreur vérification auth:', error);
        clearAuthStorage();
        delete api.defaults.headers.common['Authorization'];
        setUserState(null);
        setIsAuthenticated(false);
        setIsAdmin(false);
        setIsLivreur(false);
      } finally {
        setLoading(false);
      }
    };

    checkAuth();
  }, []);

  const login = async (email: string, password: string) => {
    try {
      console.log('Tentative de connexion pour:', email);
      
      // ✅ Étape 1: Essayer la connexion admin (pour admin et livreur)
      try {
        const adminResponse = await api.post('/admin/login', { 
          email, 
          mot_de_passe: password 
        });
        
        console.log('Réponse login admin:', adminResponse.data);
        
        if (adminResponse.data.success) {
          const { admin, access_token } = adminResponse.data.data;
          
          // Stocker le token
          setAuthToken(access_token);
          api.defaults.headers.common['Authorization'] = `Bearer ${access_token}`;
          setUser(admin);
          
          setUserState(admin);
          setIsAuthenticated(true);
          setIsAdmin(admin.poste === 'admin');
          setIsLivreur(admin.poste === 'livreur');
          
          console.log('Connexion admin/livreur réussie:', admin);
          
          toast({
            title: 'Connexion réussie',
            description: `Bienvenue ${admin.prenom} !`,
          });
          
          return {
            success: true,
            isAdmin: admin.poste === 'admin',
            isLivreur: admin.poste === 'livreur',
            user: admin
          };
        }
      } catch (adminError: any) {
        console.log('Connexion admin échouée, tentative client...');
        // Si c'est une erreur 404 ou 401, on continue vers le client
        if (adminError.response?.status !== 404 && adminError.response?.status !== 401 && adminError.response?.status !== 422) {
          throw adminError;
        }
      }
      
      // ✅ Étape 2: Essayer la connexion client
      try {
        const clientResponse = await api.post('/utilisateurs/login', { 
          email, 
          mot_de_passe: password 
        });
        
        console.log('Réponse login client:', clientResponse.data);
        
        const data = clientResponse.data;
        const token = data.data?.access_token || data.data?.token || data.token;
        const userData = data.data?.utilisateur || data.data?.user || data.data || data.user;
        
        if (token && userData) {
          // Stocker le token
          setAuthToken(token);
          api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
          setUser(userData);
          
          setUserState(userData);
          setIsAuthenticated(true);
          setIsAdmin(false);
          setIsLivreur(false);
          
          console.log('Connexion client réussie:', userData);
          
          toast({
            title: 'Connexion réussie',
            description: `Bienvenue ${userData.prenom || userData.nom || 'Client'} !`,
          });
          
          return {
            success: true,
            isAdmin: false,
            isLivreur: false,
            user: userData
          };
        }
      } catch (clientError: any) {
        console.error('Erreur login client:', clientError);
        // Si on arrive ici, c'est que les deux tentatives ont échoué
        throw clientError;
      }
      
      // Si on arrive ici, aucune connexion n'a fonctionné
      return {
        success: false,
        message: 'Email ou mot de passe incorrect',
        errors: {},
      };
      
    } catch (error: any) {
      console.error('Erreur login:', error);
      
      // Gérer les erreurs de validation
      if (error.response?.data?.errors) {
        const errorData = error.response.data;
        return {
          success: false,
          message: errorData.message || 'Email ou mot de passe incorrect',
          errors: errorData.errors,
        };
      }
      
      // Gérer les erreurs d'authentification
      if (error.response?.status === 401) {
        return {
          success: false,
          message: error.response?.data?.message || 'Email ou mot de passe incorrect',
          errors: {},
        };
      }
      
      return {
        success: false,
        message: error.response?.data?.message || 'Une erreur est survenue lors de la connexion',
        errors: {},
      };
    }
  };

  const logout = () => {
    clearAuthStorage();
    delete api.defaults.headers.common['Authorization'];
    setUserState(null);
    setIsAuthenticated(false);
    setIsAdmin(false);
    setIsLivreur(false);
    
    toast({
      title: 'Déconnexion',
      description: 'Vous avez été déconnecté avec succès',
    });
    
    window.location.href = '/login';
  };

  return (
    <AuthContext.Provider value={{ 
      user, 
      isAuthenticated, 
      isAdmin,
      isLivreur,
      login, 
      logout,
      loading 
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};