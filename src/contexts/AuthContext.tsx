import { createContext, useContext, useState, ReactNode, useEffect } from "react";
import api, { 
  setAuthToken, 
  setRefreshToken, 
  getAuthToken, 
  getRefreshToken, 
  clearAuthStorage, 
  setStoredUser,
  logout as apiLogout 
} from "@/service/api";

interface User {
  id: number;
  prenom: string;
  nom: string;
  email: string;
  telephone?: string;
  poste?: string;
  date_creation: string;
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<{ success: boolean; message?: string; errors?: Record<string, string[]>; isAdmin?: boolean }>;
  logout: () => Promise<void>;
  isAdmin: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check if user is already logged in on mount
    try {
      const storedUser = localStorage.getItem('user');
      const storedIsAdmin = localStorage.getItem('is_admin') === 'true';
      const token = getAuthToken();

      if (storedUser && token && storedUser !== "undefined") {
        setUser(JSON.parse(storedUser));
        setIsAdmin(storedIsAdmin);
      }
    } catch (error) {
      console.error("Auth initialization error:", error);
      clearAuthStorage();
    } finally {
      setLoading(false);
    }
  }, []);

  const login = async (email: string, password: string) => {
    const isAdminEmailNotFound = (errors?: Record<string, string[]>) => {
      const emailErrors = errors?.email;
      if (!emailErrors) return false;
      const messages = Array.isArray(emailErrors) ? emailErrors : [String(emailErrors)];
      return messages.some((message) => {
        const normalized = String(message).toLowerCase();
        return normalized.includes("adresse email incorrecte") || normalized.includes("adresse e-mail incorrecte");
      });
    };

    const attemptLogin = async (type: 'client' | 'admin') => {
      try {
        const endpoint = type === 'admin' ? '/admin/login' : '/utilisateurs/login';
        const response = await api.post(endpoint, {
          email,
          mot_de_passe: password,
        });

        const success = response.data?.success;
        const data = response.data?.data;

        if (success && data) {
          const userObj = type === 'admin' ? data.admin : data.utilisateur;

          if (!userObj) {
            throw new Error("User data missing from response");
          }

          const token = data.access_token;
          const refreshToken = data.refresh_token;

          setAuthToken(token);
          if (refreshToken) setRefreshToken(refreshToken);
          setStoredUser(userObj);
          localStorage.setItem('is_admin', type === 'admin' ? 'true' : 'false');

          setUser(userObj);
          setIsAdmin(type === 'admin');

          return { success: true, isAdmin: type === 'admin' };
        }

        return {
          success: false,
          message: response.data?.message || "Erreur de connexion",
          errors: response.data?.errors,
          status: response.status,
        };
      } catch (error: any) {
        console.error("Login error details:", error);

        const status = error.response?.status;
        const responseData = error.response?.data;
        let message = responseData?.message || "Email ou mot de passe incorrect";

        if (responseData?.errors) {
          const errorKeys = Object.keys(responseData.errors);
          if (errorKeys.length > 0) {
            const firstError = responseData.errors[errorKeys[0]];
            message = Array.isArray(firstError) ? firstError[0] : firstError;
          }
        }

        if (typeof message !== 'string') {
          message = JSON.stringify(message);
        }

        return {
          success: false,
          message,
          errors: responseData?.errors,
          status,
        };
      }
    };

    const adminResult = await attemptLogin('admin');
    if (adminResult.success) {
      return adminResult;
    }

    const shouldFallbackToClient =
      isAdminEmailNotFound(adminResult.errors) ||
      (!adminResult.errors && (adminResult.status === 401 || adminResult.status === 404 || adminResult.status === undefined));

    if (!shouldFallbackToClient) {
      return {
        success: false,
        message: adminResult.message,
        errors: adminResult.errors,
      };
    }

    const clientResult = await attemptLogin('client');
    if (clientResult.success) {
      return clientResult;
    }

    return {
      success: false,
      message: "Email ou mot de passe incorrect",
      errors: clientResult.errors || adminResult.errors,
    };
  };

  const logout = async () => {
    try {
      await apiLogout();
    } catch (error) {
      console.error("Logout error:", error);
    } finally {
      setUser(null);
      setIsAdmin(false);
    }
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, logout, isAdmin }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
