// contexts/AuthContext.tsx
import { clearAuthStorage, getAuthToken, setAuthToken, setUser } from '@/components/ActionClient/services/api';
import api from '@/service/api';
import React, { createContext, useContext, useState, useEffect } from 'react';


interface AuthContextType {
  user: any;
  isAuthenticated: boolean;
  isAdmin: boolean;
  login: (email: string, password: string) => Promise<any>;
  logout: () => void;
  loading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUserState] = useState<any>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
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

      try {
        const response = await api.get('/utilisateurs/profile');
        console.log('AuthProvider - Profil récupéré:', response.data);
        const userData = response.data.data;
        setUserState(userData);
        setIsAuthenticated(true);
        // Vérifier si l'utilisateur est admin
        setIsAdmin(userData.role === 'admin' || userData.isAdmin === true);
      } catch (error) {
        console.error('AuthProvider - Erreur vérification auth:', error);
        clearAuthStorage();
        setUserState(null);
        setIsAuthenticated(false);
        setIsAdmin(false);
      } finally {
        setLoading(false);
      }
    };

    checkAuth();
  }, []);

  const login = async (email: string, password: string) => {
    try {
      console.log('Tentative de connexion pour:', email);
      const response = await api.post('/utilisateurs/login', { 
        email, 
        mot_de_passe: password 
      });
      
      console.log('Réponse login:', response.data);
      
      const { access_token, utilisateur } = response.data.data;
      
      // Stocker le token
      setAuthToken(access_token);
      setUser(utilisateur);
      
      setUserState(utilisateur);
      setIsAuthenticated(true);
      setIsAdmin(utilisateur.role === 'admin' || utilisateur.isAdmin === true);
      
      console.log('Connexion réussie, utilisateur:', utilisateur);
      
      return {
        success: true,
        isAdmin: utilisateur.role === 'admin' || utilisateur.isAdmin === true,
        user: utilisateur
      };
    } catch (error: any) {
      console.error('Erreur login:', error);
      const errorData = error.response?.data || error;
      return {
        success: false,
        message: errorData.message || 'Email ou mot de passe incorrect',
        errors: errorData.errors || {}
      };
    }
  };

  const logout = () => {
    clearAuthStorage();
    setUserState(null);
    setIsAuthenticated(false);
    setIsAdmin(false);
    window.location.href = '/login';
  };

  return (
    <AuthContext.Provider value={{ 
      user, 
      isAuthenticated, 
      isAdmin, 
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