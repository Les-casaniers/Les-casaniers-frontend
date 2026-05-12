/* eslint-disable no-empty */
import axios, { AxiosHeaders, AxiosInstance, AxiosResponse } from "axios";

/**
 * Note: These imports are referenced in the provided snippet but may not exist yet.
 * We provide stubs or comment them out if they are missing to ensure the code compiles.
 */
const isServerUnavailableError = (error: any) => {
  return !error.response || error.code === "ERR_NETWORK";
};
const recordApiFailure = () => { };
const recordApiSuccess = () => { };

// Base API URL
// - DEV: backend local sur 8000 (Laravel default)
// - PROD: même origin (baseURL vide)
export const API_BASE_URL =
  import.meta.env.VITE_API_URL ?? (import.meta.env.PROD ? "" : "http://localhost:8000/api");

export const AUTH_TOKEN_KEY = "authToken";
export const REFRESH_TOKEN_KEY = "refreshToken";
export const LAST_ROUTE_KEY = "last_route";

export const getAuthToken = (): string | null => {
  try {
    return localStorage.getItem(AUTH_TOKEN_KEY);
  } catch {
    return null;
  }
};

export const setAuthToken = (token: string) => {
  try {
    localStorage.setItem(AUTH_TOKEN_KEY, token);
  } catch (e) { }
};

export const getRefreshToken = (): string | null => {
  try {
    return localStorage.getItem(REFRESH_TOKEN_KEY);
  } catch {
    return null;
  }
};

export const setRefreshToken = (token: string) => {
  try {
    localStorage.setItem(REFRESH_TOKEN_KEY, token);
  } catch (e) { }
};

export const clearAuthStorage = () => {
  // Unregister FCM token from backend before clearing auth (dynamic import to avoid circular dep)
  // import("@/lib/pushNotifications")
  //   .then((m) => m.removePushToken())
  //   .catch(() => {});

  try {
    localStorage.removeItem(AUTH_TOKEN_KEY);
    localStorage.removeItem(REFRESH_TOKEN_KEY);
    localStorage.removeItem("user");
    localStorage.removeItem("is_admin");
    localStorage.removeItem(LAST_ROUTE_KEY);
  } catch (e) { }
};

export const setStoredUser = (user: {
  id?: number;
  email?: string;
  nom?: string;
  prenom?: string;
  telephone?: string;
}) => {
  try {
    localStorage.setItem("user", JSON.stringify(user));
  } catch (e) { }
};

const api: AxiosInstance = axios.create({
  baseURL: API_BASE_URL,
  timeout: 15000,
  withCredentials: true,
});

let isRefreshing = false;
let refreshSubscribers: ((token: string) => void)[] = [];

const subscribeTokenRefresh = (cb: (token: string) => void) => {
  refreshSubscribers.push(cb);
};

const onRefreshed = (token: string) => {
  refreshSubscribers.map((cb) => cb(token));
  refreshSubscribers = [];
};

api.interceptors.request.use((config) => {
  const token = getAuthToken();
  if (token) {
    const headers = AxiosHeaders.from(config.headers);
    headers.set("Authorization", `Bearer ${token}`);
    config.headers = headers;
  }
  return config;
});

api.interceptors.response.use(
  (response: AxiosResponse) => {
    recordApiSuccess();
    return response;
  },
  async (error) => {
    const originalRequest = error.config;

    // Si le token est expiré/invalide (401)
    if (error?.response?.status === 401 && !originalRequest._retry) {
      const refreshToken = getRefreshToken();

      // Si on a un refresh token, on tente de renouveler l'access token
      if (refreshToken) {
        if (isRefreshing) {
          return new Promise((resolve) => {
            subscribeTokenRefresh((token: string) => {
              originalRequest.headers["Authorization"] = `Bearer ${token}`;
              resolve(api(originalRequest));
            });
          });
        }

        originalRequest._retry = true;
        isRefreshing = true;

        try {
          const isAdmin = localStorage.getItem('is_admin') === 'true';
          const refreshEndpoint = isAdmin ? '/admin/refresh-token' : '/utilisateurs/refresh-token';

          // Use a clean axios instance for the refresh call to avoid interceptor recursion
          const response = await axios.post(`${API_BASE_URL}${refreshEndpoint}`, {
            refresh_token: refreshToken,
          });

          if (response.data.success && response.data.data.access_token) {
            const newToken = response.data.data.access_token;
            setAuthToken(newToken);
            isRefreshing = false;
            onRefreshed(newToken);

            originalRequest.headers["Authorization"] = `Bearer ${newToken}`;
            return api(originalRequest);
          } else {
            throw new Error("Refresh failed");
          }
        } catch (refreshError) {
          isRefreshing = false;
          clearAuthStorage();
          // Optional: redirect to login if refresh fails
          if (typeof window !== 'undefined') {
            window.location.href = '/login?session_expired=true';
          }
          return Promise.reject(refreshError);
        }
      } else {
        clearAuthStorage();
      }
    }

    // ERR_CANCELED = requête annulée lors d'une navigation React Router :
    // ce n'est pas une panne serveur, on ne compte pas cet échec.
    if (error?.code !== "ERR_CANCELED" && isServerUnavailableError(error)) {
      recordApiFailure();
    }

    return Promise.reject(error);
  },
);

export const logout = async () => {
  try {
    const isAdmin = localStorage.getItem('is_admin') === 'true';
    const logoutEndpoint = isAdmin ? '/admin/logout' : '/utilisateurs/logout';
    await api.post(logoutEndpoint);
  } catch (e) {
    // ignore
  }

  clearAuthStorage();

  try {
    // si une page a fourni ?next=..., on respecte
    const url = new URL(window.location.href);
    const next =
      url.searchParams.get("next") || url.searchParams.get("redirect");
    window.location.href = next || "/login";
  } catch (e) {
    try {
      window.location.href = "/login";
    } catch {
      // noop
    }
  }
};

export const uploadPractitionerPhoto = async (
  file: File,
  oldUrl?: string,
  utilisateurId?: number,
) => {
  const formData = new FormData();
  formData.append("file", file);
  if (oldUrl) {
    formData.append("oldUrl", oldUrl);
  }
  if (typeof utilisateurId === "number") {
    formData.append("utilisateurId", utilisateurId.toString());
  }

  const resp = oldUrl
    ? await api.put("/files/upload", formData)
    : await api.post("/files/upload", formData);
  const url = resp?.data?.url as string | undefined;
  if (!url) {
    throw new Error("Upload failed: missing url");
  }
  return url;
};

export { api };
export default api;

