import { useCallback, useEffect, useRef, useState } from "react";
import api, { API_BASE_URL, getAuthToken } from "@/service/api";

// ─── Types ──────────────────────────────────────────────────────

export type TypeNotification =
  | "commande"
  | "produit"
  | "client"
  | "facture"
  | "paiement"
  | "livraison"
  | "message"
  | "alerte";

export type AdminNotification = {
  id: number;
  type: TypeNotification;
  titre: string;
  message: string;
  lien?: string | null;
  expediteur?: string | null;
  meta?: Record<string, any> | null;
  lue: boolean;
  date_creation: string;
  date_lecture?: string | null;
};

export type NotificationFiltre = "toutes" | "non-lues" | "lues";

// ─── WebSocket URL builder ──────────────────────────────────────

const getWebSocketUrl = (): string => {
  const envWsUrl = import.meta.env.VITE_WS_URL;
  if (envWsUrl) return envWsUrl;

  // Dériver automatiquement depuis l'API URL
  try {
    const url = new URL(API_BASE_URL || window.location.origin);
    const protocol = url.protocol === "https:" ? "wss:" : "ws:";
    const host = url.hostname;
    const port = import.meta.env.VITE_WS_PORT || "8090";
    return `${protocol}//${host}:${port}`;
  } catch {
    return "ws://localhost:8090";
  }
};

// ─── Hook principal ──────────────────────────────────────────────

export const useAdminNotifications = () => {
  const [notifications, setNotifications] = useState<AdminNotification[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [nonLues, setNonLues] = useState(0);
  const [wsConnected, setWsConnected] = useState(false);

  const wsRef = useRef<WebSocket | null>(null);
  const reconnectTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const reconnectAttemptsRef = useRef(0);
  const maxReconnectAttempts = 10;
  const mountedRef = useRef(true);

  // ─── Fetch notifications via API REST ──────────────────────

  const fetchNotifications = useCallback(
    async (filtre?: NotificationFiltre, type?: string) => {
      setLoading(true);
      setError(null);
      try {
        const params: Record<string, string> = {};
        if (filtre && filtre !== "toutes") params.filtre = filtre;
        if (type) params.type = type;

        const response = await api.get("/admin/notifications", { params });
        const data = response?.data?.data ?? [];
        const count = response?.data?.meta?.non_lues ?? 0;

        setNotifications(
          data.map((n: any) => ({
            ...n,
            id: Number(n.id),
            lue: Boolean(n.lue),
          }))
        );
        setNonLues(count);
      } catch (e: any) {
        setError(
          e?.response?.data?.message ||
            "Erreur lors du chargement des notifications"
        );
      } finally {
        setLoading(false);
      }
    },
    []
  );

  // ─── Marquer comme lue ─────────────────────────────────────

  const markAsRead = useCallback(
    async (id: number) => {
      try {
        const response = await api.patch(`/admin/notifications/${id}/lire`);
        setNonLues(response?.data?.non_lues ?? 0);
        setNotifications((prev) =>
          prev.map((n) =>
            n.id === id
              ? { ...n, lue: true, date_lecture: new Date().toISOString() }
              : n
          )
        );
      } catch (e: any) {
        console.error("Erreur markAsRead:", e);
      }
    },
    []
  );

  // ─── Marquer toutes comme lues ─────────────────────────────

  const markAllAsRead = useCallback(async () => {
    try {
      await api.patch("/admin/notifications/lire-tout");
      setNonLues(0);
      setNotifications((prev) =>
        prev.map((n) => ({
          ...n,
          lue: true,
          date_lecture: n.date_lecture || new Date().toISOString(),
        }))
      );
    } catch (e: any) {
      console.error("Erreur markAllAsRead:", e);
    }
  }, []);

  // ─── Supprimer une notification ────────────────────────────

  const deleteNotification = useCallback(async (id: number) => {
    try {
      const response = await api.delete(`/admin/notifications/${id}`);
      setNonLues(response?.data?.non_lues ?? 0);
      setNotifications((prev) => prev.filter((n) => n.id !== id));
    } catch (e: any) {
      console.error("Erreur deleteNotification:", e);
    }
  }, []);

  // ─── Supprimer toutes ──────────────────────────────────────

  const deleteAllNotifications = useCallback(async () => {
    try {
      await api.delete("/admin/notifications/all");
      setNotifications([]);
      setNonLues(0);
    } catch (e: any) {
      console.error("Erreur deleteAllNotifications:", e);
    }
  }, []);

  // ─── WebSocket ─────────────────────────────────────────────

  const connectWebSocket = useCallback(() => {
    // Ne pas connecter si pas authentifié
    const token = getAuthToken();
    if (!token) return;

    // Fermer l'ancienne connexion si elle existe
    if (wsRef.current) {
      wsRef.current.close();
      wsRef.current = null;
    }

    try {
      const wsUrl = getWebSocketUrl();
      const ws = new WebSocket(wsUrl);

      ws.onopen = () => {
        if (!mountedRef.current) return;
        setWsConnected(true);
        reconnectAttemptsRef.current = 0;
        console.log("[WS] Connexion WebSocket établie");
      };

      ws.onmessage = (event) => {
        if (!mountedRef.current) return;

        try {
          const payload = JSON.parse(event.data);

          if (payload.event === "admin.notification" && payload.data) {
            const notif: AdminNotification = {
              ...payload.data,
              id: Number(payload.data.id),
              lue: Boolean(payload.data.lue),
            };

            // Ajouter la notification en tête de liste
            setNotifications((prev) => {
              // Éviter les doublons
              if (prev.some((n) => n.id === notif.id)) return prev;
              return [notif, ...prev];
            });

            // Incrémenter le compteur non-lues
            if (!notif.lue) {
              setNonLues((prev) => prev + 1);
            }
          }
        } catch {
          // Message non-JSON, ignorer
        }
      };

      ws.onclose = (event) => {
        if (!mountedRef.current) return;
        setWsConnected(false);
        console.log(`[WS] Connexion fermée (code: ${event.code})`);

        // Reconnexion automatique avec backoff exponentiel
        if (reconnectAttemptsRef.current < maxReconnectAttempts) {
          const delay = Math.min(
            1000 * Math.pow(2, reconnectAttemptsRef.current),
            30000
          );
          reconnectAttemptsRef.current++;
          console.log(
            `[WS] Reconnexion dans ${delay / 1000}s (tentative ${reconnectAttemptsRef.current}/${maxReconnectAttempts})`
          );
          reconnectTimerRef.current = setTimeout(() => {
            if (mountedRef.current) connectWebSocket();
          }, delay);
        }
      };

      ws.onerror = () => {
        if (!mountedRef.current) return;
        setWsConnected(false);
      };

      wsRef.current = ws;
    } catch (e) {
      console.error("[WS] Erreur de connexion:", e);
      setWsConnected(false);
    }
  }, []);

  // ─── Ping keepalive ────────────────────────────────────────

  useEffect(() => {
    const interval = setInterval(() => {
      if (wsRef.current?.readyState === WebSocket.OPEN) {
        wsRef.current.send(
          JSON.stringify({ event: "ping", data: { timestamp: Date.now() } })
        );
      }
    }, 25000);

    return () => clearInterval(interval);
  }, []);

  // ─── Initialisation ────────────────────────────────────────

  useEffect(() => {
    mountedRef.current = true;
    fetchNotifications();
    connectWebSocket();

    return () => {
      mountedRef.current = false;

      if (reconnectTimerRef.current) {
        clearTimeout(reconnectTimerRef.current);
      }

      if (wsRef.current) {
        wsRef.current.close();
        wsRef.current = null;
      }
    };
  }, [fetchNotifications, connectWebSocket]);

  return {
    notifications,
    loading,
    error,
    nonLues,
    wsConnected,
    fetchNotifications,
    markAsRead,
    markAllAsRead,
    deleteNotification,
    deleteAllNotifications,
  };
};

export default useAdminNotifications;
