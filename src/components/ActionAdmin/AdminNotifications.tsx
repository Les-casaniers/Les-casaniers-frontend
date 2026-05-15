import { useState } from "react";
import {
  Bell,
  Check,
  Trash2,
  AlertTriangle,
  X,
  Package,
  ShoppingBag,
  Users,
  FileText,
  CreditCard,
  CheckCheck,
  Filter,
  Clock,
  MessageCircle,
  Truck,
  Wifi,
  WifiOff,
  RefreshCw,
  Loader2,
} from "lucide-react";
import useAdminNotifications, {
  type AdminNotification,
  type TypeNotification,
  type NotificationFiltre,
} from "@/hooks/useAdminNotifications";

// ─── Icônes et styles par type ───────────────────────────────────

const getTypeIcone = (type: TypeNotification) => {
  const icones: Record<TypeNotification, JSX.Element> = {
    commande: <ShoppingBag className="h-4 w-4" />,
    produit: <Package className="h-4 w-4" />,
    client: <Users className="h-4 w-4" />,
    facture: <FileText className="h-4 w-4" />,
    paiement: <CreditCard className="h-4 w-4" />,
    livraison: <Truck className="h-4 w-4" />,
    message: <MessageCircle className="h-4 w-4" />,
    alerte: <AlertTriangle className="h-4 w-4" />,
  };
  return icones[type] || <Bell className="h-4 w-4" />;
};

const getTypeStyle = (type: TypeNotification) => {
  const styles: Record<TypeNotification, string> = {
    commande: "bg-blue-500/10 text-blue-600 dark:text-blue-400",
    produit: "bg-purple-500/10 text-purple-600 dark:text-purple-400",
    client: "bg-green-500/10 text-green-600 dark:text-green-400",
    facture: "bg-amber-500/10 text-amber-600 dark:text-amber-400",
    paiement: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400",
    livraison: "bg-cyan-500/10 text-cyan-600 dark:text-cyan-400",
    message: "bg-indigo-500/10 text-indigo-600 dark:text-indigo-400",
    alerte: "bg-red-500/10 text-red-600 dark:text-red-400",
  };
  return styles[type] ?? "bg-black/5 text-black/60 dark:bg-white/10 dark:text-white/60";
};

const getTypeLabel = (type: TypeNotification): string => {
  const labels: Record<TypeNotification, string> = {
    commande: "Commande",
    produit: "Produit",
    client: "Client",
    facture: "Facture",
    paiement: "Paiement",
    livraison: "Livraison",
    message: "Message",
    alerte: "Alerte",
  };
  return labels[type] ?? type;
};

// ─── Formatage date ──────────────────────────────────────────────

const getFriendlyDate = (dateString: string) => {
  const date = new Date(dateString);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffMins < 1) return "À l'instant";
  if (diffMins < 60) return `Il y a ${diffMins} min`;
  if (diffHours < 24) return `Il y a ${diffHours} h`;
  if (diffDays < 7) return `Il y a ${diffDays} j`;
  return date.toLocaleDateString("fr-FR", {
    day: "numeric",
    month: "short",
    year: diffDays > 365 ? "numeric" : undefined,
  });
};

// ─── Composant principal ─────────────────────────────────────────

const AdminNotifications = () => {
  const {
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
  } = useAdminNotifications();

  const [filtre, setFiltre] = useState<NotificationFiltre>("toutes");
  const [typeFiltre, setTypeFiltre] = useState<TypeNotification | "">("");
  const [showDeleteAlert, setShowDeleteAlert] = useState(false);
  const [deleteAll, setDeleteAll] = useState(false);
  const [selectedNotification, setSelectedNotification] =
    useState<AdminNotification | null>(null);
  const [refreshing, setRefreshing] = useState(false);

  // ─── Actions ─────────────────────────────────────────────

  const handleRefresh = async () => {
    setRefreshing(true);
    await fetchNotifications(filtre, typeFiltre || undefined);
    setRefreshing(false);
  };

  const handleFiltreChange = (newFiltre: NotificationFiltre) => {
    setFiltre(newFiltre);
    fetchNotifications(newFiltre, typeFiltre || undefined);
  };

  const handleTypeFiltreChange = (newType: string) => {
    setTypeFiltre(newType as TypeNotification | "");
    fetchNotifications(filtre, newType || undefined);
  };

  const handleMarquerCommeLue = async (id: number) => {
    await markAsRead(id);
  };

  const handleMarquerToutLu = async () => {
    await markAllAsRead();
  };

  const handleSupprimer = (notification: AdminNotification) => {
    setSelectedNotification(notification);
    setDeleteAll(false);
    setShowDeleteAlert(true);
  };

  const handleSupprimerTout = () => {
    setDeleteAll(true);
    setSelectedNotification(null);
    setShowDeleteAlert(true);
  };

  const handleConfirmDelete = async () => {
    if (deleteAll) {
      await deleteAllNotifications();
    } else if (selectedNotification) {
      await deleteNotification(selectedNotification.id);
    }
    setShowDeleteAlert(false);
    setSelectedNotification(null);
    setDeleteAll(false);
  };

  // ─── Filtrage local (le filtre est aussi envoyé côté API) ───

  const notificationsFiltrees = notifications.filter((n) => {
    if (filtre === "non-lues") return !n.lue;
    if (filtre === "lues") return n.lue;
    return true;
  });

  // ─── Types disponibles pour le filtre ──────────────────────

  const typesDisponibles: TypeNotification[] = [
    "commande",
    "produit",
    "client",
    "facture",
    "paiement",
    "livraison",
    "message",
    "alerte",
  ];

  return (
    <div className="space-y-6">
      {/* ─── En-tête ─────────────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="relative">
            <Bell className="h-6 w-6 text-black dark:text-white" />
            {nonLues > 0 && (
              <span className="absolute -top-2 -right-2 bg-red-500 text-white text-[10px] font-bold rounded-full h-5 w-5 flex items-center justify-center animate-pulse">
                {nonLues > 99 ? "99+" : nonLues}
              </span>
            )}
          </div>
          <div>
            <h1 className="text-2xl font-bold text-black dark:text-white">
              Notifications
            </h1>
            <p className="text-sm text-black/50 dark:text-white/50">
              Centre de notifications et alertes en temps réel
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {/* Indicateur WebSocket */}
          <div
            className={`flex items-center gap-1.5 px-3 py-1.5 text-xs rounded-lg transition ${
              wsConnected
                ? "bg-green-500/10 text-green-600 dark:text-green-400"
                : "bg-red-500/10 text-red-500 dark:text-red-400"
            }`}
            title={
              wsConnected
                ? "Connecté en temps réel"
                : "WebSocket déconnecté — les notifications sont mises à jour par polling"
            }
          >
            {wsConnected ? (
              <Wifi className="h-3 w-3" />
            ) : (
              <WifiOff className="h-3 w-3" />
            )}
            <span className="hidden sm:inline">
              {wsConnected ? "Temps réel" : "Hors ligne"}
            </span>
          </div>

          {/* Bouton rafraîchir */}
          <button
            onClick={handleRefresh}
            disabled={refreshing || loading}
            className="flex items-center gap-2 px-3 py-1.5 text-sm bg-black/5 dark:bg-white/10 text-black dark:text-white rounded-lg hover:bg-black/10 dark:hover:bg-white/20 transition disabled:opacity-40"
            title="Rafraîchir"
          >
            <RefreshCw
              className={`h-3.5 w-3.5 ${refreshing ? "animate-spin" : ""}`}
            />
          </button>
        </div>
      </div>

      {/* ─── Erreur ──────────────────────────────────────────── */}
      {error && (
        <div className="bg-red-500/10 border border-red-500/20 text-red-600 dark:text-red-400 px-4 py-3 rounded-xl text-sm flex items-center gap-2">
          <AlertTriangle className="h-4 w-4 shrink-0" />
          {error}
          <button
            onClick={handleRefresh}
            className="ml-auto text-xs underline hover:no-underline"
          >
            Réessayer
          </button>
        </div>
      )}

      {/* ─── Filtres statut + type ───────────────────────────── */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-2">
          <Filter className="h-4 w-4 text-black/50 dark:text-white/50" />

          {/* Filtre par statut */}
          {(["toutes", "non-lues", "lues"] as NotificationFiltre[]).map(
            (f) => (
              <button
                key={f}
                onClick={() => handleFiltreChange(f)}
                className={`px-3 py-1.5 text-xs font-medium rounded-lg transition ${
                  filtre === f
                    ? "bg-black dark:bg-white text-white dark:text-black"
                    : "bg-black/5 dark:bg-white/10 text-black/70 dark:text-white/70 hover:bg-black/10 dark:hover:bg-white/20"
                }`}
              >
                {f === "toutes" && "Toutes"}
                {f === "non-lues" && `Non lues (${nonLues})`}
                {f === "lues" && "Lues"}
              </button>
            )
          )}

          {/* Filtre par type */}
          <select
            value={typeFiltre}
            onChange={(e) => handleTypeFiltreChange(e.target.value)}
            className="px-2 py-1.5 text-xs rounded-lg bg-black/5 dark:bg-white/10 text-black/70 dark:text-white/70 border-0 outline-none cursor-pointer"
          >
            <option value="">Tous les types</option>
            {typesDisponibles.map((t) => (
              <option key={t} value={t}>
                {getTypeLabel(t)}
              </option>
            ))}
          </select>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleMarquerToutLu}
            disabled={nonLues === 0}
            className={`flex items-center gap-2 px-3 py-1.5 text-sm rounded-lg transition ${
              nonLues > 0
                ? "bg-black/5 dark:bg-white/10 text-black dark:text-white hover:bg-black/10 dark:hover:bg-white/20"
                : "opacity-40 cursor-not-allowed"
            }`}
          >
            <CheckCheck className="h-4 w-4" />
            Tout marquer lu
          </button>
          <button
            onClick={handleSupprimerTout}
            disabled={notifications.length === 0}
            className={`flex items-center gap-2 px-3 py-1.5 text-sm rounded-lg transition ${
              notifications.length > 0
                ? "text-red-600 dark:text-red-400 hover:bg-red-500/10"
                : "opacity-40 cursor-not-allowed"
            }`}
          >
            <Trash2 className="h-4 w-4" />
            Tout supprimer
          </button>
        </div>
      </div>

      {/* ─── Loader ──────────────────────────────────────────── */}
      {loading && notifications.length === 0 && (
        <div className="bg-white dark:bg-black border border-black/10 dark:border-white/10 rounded-xl py-12 text-center">
          <Loader2 className="h-8 w-8 mx-auto text-black/30 dark:text-white/30 animate-spin mb-3" />
          <p className="text-black/40 dark:text-white/40">
            Chargement des notifications...
          </p>
        </div>
      )}

      {/* ─── Liste des notifications ─────────────────────────── */}
      {!loading || notifications.length > 0 ? (
        <div className="space-y-2">
          {notificationsFiltrees.length === 0 ? (
            <div className="bg-white dark:bg-black border border-black/10 dark:border-white/10 rounded-xl py-12 text-center">
              <Bell className="h-12 w-12 mx-auto text-black/20 dark:text-white/20 mb-3" />
              <p className="text-black/40 dark:text-white/40">
                Aucune notification
              </p>
              <p className="text-xs text-black/30 dark:text-white/30 mt-1">
                {wsConnected
                  ? "Les nouvelles notifications apparaîtront ici en temps réel"
                  : "Cliquez sur rafraîchir pour vérifier"}
              </p>
            </div>
          ) : (
            notificationsFiltrees.map((notif) => (
              <div
                key={notif.id}
                className={`bg-white dark:bg-black border rounded-xl p-4 transition-all hover:shadow-md ${
                  notif.lue
                    ? "border-black/10 dark:border-white/10 opacity-70"
                    : "border-l-4 border-l-black dark:border-l-white border-black/10 dark:border-white/10 shadow-sm"
                }`}
              >
                <div className="flex items-start gap-3">
                  {/* Icône type */}
                  <div
                    className={`p-2 rounded-lg shrink-0 ${getTypeStyle(notif.type)}`}
                  >
                    {getTypeIcone(notif.type)}
                  </div>

                  {/* Contenu */}
                  <div className="flex-1 min-w-0">
                    <div className="flex flex-wrap items-start justify-between gap-2">
                      <div>
                        <h3
                          className={`font-semibold text-black dark:text-white ${!notif.lue && "font-bold"}`}
                        >
                          {notif.titre}
                        </h3>
                        <p className="text-sm text-black/60 dark:text-white/60 mt-0.5">
                          {notif.message}
                        </p>
                        {notif.expediteur && (
                          <p className="text-xs text-black/40 dark:text-white/40 mt-1">
                            De : {notif.expediteur}
                          </p>
                        )}
                      </div>
                      <div className="flex items-center gap-1 shrink-0">
                        {!notif.lue && (
                          <button
                            onClick={() => handleMarquerCommeLue(notif.id)}
                            className="p-1.5 rounded-lg text-black/40 dark:text-white/40 hover:text-green-600 dark:hover:text-green-400 hover:bg-green-500/10 transition"
                            title="Marquer comme lue"
                          >
                            <Check className="h-3.5 w-3.5" />
                          </button>
                        )}
                        <button
                          onClick={() => handleSupprimer(notif)}
                          className="p-1.5 rounded-lg text-black/40 dark:text-white/40 hover:text-red-600 dark:hover:text-red-400 hover:bg-red-500/10 transition"
                          title="Supprimer"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    </div>
                    <div className="flex items-center gap-3 mt-2">
                      <span className="inline-flex items-center gap-1 text-[10px] text-black/40 dark:text-white/40">
                        <Clock className="h-3 w-3" />
                        {getFriendlyDate(notif.date_creation)}
                      </span>
                      <span
                        className={`inline-flex items-center gap-1 text-[10px] px-1.5 py-0.5 rounded ${getTypeStyle(notif.type)}`}
                      >
                        {getTypeLabel(notif.type)}
                      </span>
                      {notif.lue && (
                        <span className="text-[10px] text-black/30 dark:text-white/30">
                          ✓ Lu
                        </span>
                      )}
                      {notif.lien && (
                        <button className="text-[10px] text-black/50 dark:text-white/50 hover:text-black dark:hover:text-white transition">
                          Voir détails →
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      ) : null}

      {/* ─── ALERTE SUPPRESSION ──────────────────────────────── */}
      {showDeleteAlert && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
          <div className="bg-white dark:bg-black border border-black/10 dark:border-white/10 rounded-2xl shadow-2xl w-full max-w-sm mx-4">
            <div className="px-6 py-6 flex flex-col items-center text-center gap-4">
              <div className="p-3 bg-red-500/10 rounded-full">
                <AlertTriangle className="h-6 w-6 text-red-500" />
              </div>
              <div>
                <h3 className="text-base font-semibold text-black dark:text-white">
                  {deleteAll
                    ? "Supprimer toutes les notifications"
                    : "Confirmer la suppression"}
                </h3>
                <p className="text-sm text-black/50 dark:text-white/50 mt-1">
                  {deleteAll
                    ? "Voulez-vous vraiment supprimer toutes les notifications ? Cette action est irréversible."
                    : `Voulez-vous vraiment supprimer la notification "${selectedNotification?.titre}" ?`}
                </p>
              </div>
            </div>
            <div className="flex gap-3 px-6 pb-6">
              <button
                onClick={() => setShowDeleteAlert(false)}
                className="flex-1 py-2 text-sm font-medium text-black/70 dark:text-white/70 border border-black/20 dark:border-white/20 rounded-lg hover:bg-black/5 dark:hover:bg-white/10 transition"
              >
                Annuler
              </button>
              <button
                onClick={handleConfirmDelete}
                className="flex-1 py-2 text-sm font-medium bg-red-500 text-white rounded-lg hover:bg-red-600 transition"
              >
                Supprimer
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminNotifications;