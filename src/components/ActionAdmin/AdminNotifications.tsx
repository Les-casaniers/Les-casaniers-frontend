import { useState } from "react";
import { Bell, Check, Trash2, AlertTriangle, X, Package, ShoppingBag, Users, FileText, CreditCard, Mail, CheckCheck, Eye, Filter, Clock, MessageCircle, Truck } from "lucide-react";

type TypeNotification = 
  | "commande" 
  | "produit" 
  | "client" 
  | "facture" 
  | "paiement" 
  | "livraison" 
  | "message"
  | "alerte";

type Notification = {
  id: string;
  titre: string;
  message: string;
  type: TypeNotification;
  date: string;
  lue: boolean;
  lien?: string;
  expediteur?: string;
};

// Données mockées
const notificationsParDefaut: Notification[] = [
  {
    id: "NOT-001",
    titre: "Nouvelle commande #CMD-042",
    message: "Jean Dupont a passé une commande de 1 250 000 Ar",
    type: "commande",
    date: "2025-05-11T09:30:00",
    lue: false,
    lien: "/admin/commandes",
  },
  {
    id: "NOT-002",
    titre: "Paiement reçu",
    message: "Paiement confirmé pour la commande #CMD-041 - 89 900 Ar",
    type: "paiement",
    date: "2025-05-11T08:15:00",
    lue: false,
    lien: "/admin/factures",
  },
  {
    id: "NOT-003",
    titre: "Stock faible",
    message: "Plus que 3 unités du produit 'PC Gaming RTX 4070'",
    type: "produit",
    date: "2025-05-10T18:45:00",
    lue: false,
    lien: "/admin/produits",
  },
  {
    id: "NOT-004",
    titre: "Nouveau client inscrit",
    message: "Bienvenue à Miora Rabe - 1ère commande à 25 000 Ar",
    type: "client",
    date: "2025-05-10T14:20:00",
    lue: true,
    lien: "/admin/clients",
  },
  {
    id: "NOT-005",
    titre: "Facture en retard",
    message: "La facture #FAC-003 de Pierre Andrian arrive à échéance demain",
    type: "facture",
    date: "2025-05-10T10:00:00",
    lue: false,
    lien: "/admin/factures",
  },
  {
    id: "NOT-006",
    titre: "Nouveau message support",
    message: "Un client a contacté le support technique",
    type: "message",
    date: "2025-05-09T16:30:00",
    lue: true,
    expediteur: "client@email.com",
  },
  {
    id: "NOT-007",
    titre: "Commande expédiée",
    message: "La commande #CMD-039 a été expédiée avec suivi #TRK123456",
    type: "livraison",
    date: "2025-05-09T11:45:00",
    lue: true,
  },
  {
    id: "NOT-008",
    titre: "Alerte sécurité",
    message: "Tentative de connexion suspecte détectée",
    type: "alerte",
    date: "2025-05-08T23:15:00",
    lue: true,
  },
];

const getTypeIcone = (type: TypeNotification) => {
  const icones = {
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
  const styles = {
    commande: "bg-blue-500/10 text-blue-600 dark:text-blue-400",
    produit: "bg-purple-500/10 text-purple-600 dark:text-purple-400",
    client: "bg-green-500/10 text-green-600 dark:text-green-400",
    facture: "bg-amber-500/10 text-amber-600 dark:text-amber-400",
    paiement: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400",
    livraison: "bg-cyan-500/10 text-cyan-600 dark:text-cyan-400",
    message: "bg-indigo-500/10 text-indigo-600 dark:text-indigo-400",
    alerte: "bg-red-500/10 text-red-600 dark:text-red-400",
  };
  return styles[type];
};

const AdminNotifications = () => {
  const [notifications, setNotifications] = useState<Notification[]>(notificationsParDefaut);
  const [filtre, setFiltre] = useState<"toutes" | "non-lues" | "lues">("toutes");
  const [showDeleteAlert, setShowDeleteAlert] = useState(false);
  const [deleteAll, setDeleteAll] = useState(false);
  const [selectedNotification, setSelectedNotification] = useState<Notification | null>(null);
  const [testMode, setTestMode] = useState(false);

  const notificationsNonLues = notifications.filter(n => !n.lue).length;

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
    return date.toLocaleDateString("fr-FR");
  };

  const handleMarquerCommeLue = (id: string) => {
    setNotifications(prev =>
      prev.map(n => (n.id === id ? { ...n, lue: true } : n))
    );
  };

  const handleMarquerToutLu = () => {
    setNotifications(prev => prev.map(n => ({ ...n, lue: true })));
  };

  const handleSupprimer = (notification: Notification) => {
    setSelectedNotification(notification);
    setDeleteAll(false);
    setShowDeleteAlert(true);
  };

  const handleSupprimerTout = () => {
    setDeleteAll(true);
    setSelectedNotification(null);
    setShowDeleteAlert(true);
  };

  const handleConfirmDelete = () => {
    if (deleteAll) {
      setNotifications([]);
    } else if (selectedNotification) {
      setNotifications(prev => prev.filter(n => n.id !== selectedNotification.id));
    }
    setShowDeleteAlert(false);
    setSelectedNotification(null);
    setDeleteAll(false);
  };

  const handleAjouterTest = () => {
    const nouveauxTitres = [
      "Nouvelle commande flash !",
      "Promotion : -20% sur les écrans",
      "Rappel : Stock à réapprovisionner",
      "Bienvenue à notre nouveau client",
    ];
    const randomTitle = nouveauxTitres[Math.floor(Math.random() * nouveauxTitres.length)];
    const newNotif: Notification = {
      id: `NOT-${Date.now()}`,
      titre: randomTitle,
      message: `Ceci est une notification de test générée à ${new Date().toLocaleTimeString()}`,
      type: "message",
      date: new Date().toISOString(),
      lue: false,
    };
    setNotifications(prev => [newNotif, ...prev]);
  };

  const notificationsFiltrees = notifications.filter(n => {
    if (filtre === "non-lues") return !n.lue;
    if (filtre === "lues") return n.lue;
    return true;
  });

  return (
    <div className="space-y-6">
      {/* En-tête */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="relative">
            <Bell className="h-6 w-6 text-black dark:text-white" />
            {notificationsNonLues > 0 && (
              <span className="absolute -top-2 -right-2 bg-red-500 text-white text-[10px] font-bold rounded-full h-4 w-4 flex items-center justify-center">
                {notificationsNonLues}
              </span>
            )}
          </div>
          <div>
            <h1 className="text-2xl font-bold text-black dark:text-white">Notifications</h1>
            <p className="text-sm text-black/50 dark:text-white/50">Centre de notifications et alertes</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {testMode && (
            <button
              onClick={handleAjouterTest}
              className="flex items-center gap-2 px-3 py-1.5 text-sm bg-black/5 dark:bg-white/10 text-black dark:text-white rounded-lg hover:bg-black/10 dark:hover:bg-white/20 transition"
            >
              <Bell className="h-3 w-3" />
              Simuler
            </button>
          )}
          <button
            onClick={() => setTestMode(!testMode)}
            className={`px-3 py-1.5 text-xs rounded-lg transition ${
              testMode 
                ? "bg-green-500 text-white" 
                : "bg-black/5 dark:bg-white/10 text-black/70 dark:text-white/70"
            }`}
          >
            {testMode ? "Mode test ON" : "Mode test OFF"}
          </button>
        </div>
      </div>

      {/* Actions et filtres */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-2">
          <Filter className="h-4 w-4 text-black/50 dark:text-white/50" />
          {["toutes", "non-lues", "lues"].map((f) => (
            <button
              key={f}
              onClick={() => setFiltre(f as typeof filtre)}
              className={`px-3 py-1.5 text-xs font-medium rounded-lg transition ${
                filtre === f
                  ? "bg-black dark:bg-white text-white dark:text-black"
                  : "bg-black/5 dark:bg-white/10 text-black/70 dark:text-white/70 hover:bg-black/10 dark:hover:bg-white/20"
              }`}
            >
              {f === "toutes" && "Toutes"}
              {f === "non-lues" && `Non lues (${notificationsNonLues})`}
              {f === "lues" && "Lues"}
            </button>
          ))}
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={handleMarquerToutLu}
            disabled={notificationsNonLues === 0}
            className={`flex items-center gap-2 px-3 py-1.5 text-sm rounded-lg transition ${
              notificationsNonLues > 0
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

      {/* Liste des notifications */}
      <div className="space-y-2">
        {notificationsFiltrees.length === 0 ? (
          <div className="bg-white dark:bg-black border border-black/10 dark:border-white/10 rounded-xl py-12 text-center">
            <Bell className="h-12 w-12 mx-auto text-black/20 dark:text-white/20 mb-3" />
            <p className="text-black/40 dark:text-white/40">Aucune notification</p>
            {testMode && (
              <button
                onClick={handleAjouterTest}
                className="mt-3 text-sm text-black/60 dark:text-white/60 hover:text-black dark:hover:text-white"
              >
                + Créer une notification test
              </button>
            )}
          </div>
        ) : (
          notificationsFiltrees.map((notif) => (
            <div
              key={notif.id}
              className={`bg-white dark:bg-black border rounded-xl p-4 transition-all ${
                notif.lue
                  ? "border-black/10 dark:border-white/10 opacity-70"
                  : "border-l-4 border-l-black dark:border-l-white border-black/10 dark:border-white/10 shadow-sm"
              }`}
            >
              <div className="flex items-start gap-3">
                {/* Icône type */}
                <div className={`p-2 rounded-lg ${getTypeStyle(notif.type)}`}>
                  {getTypeIcone(notif.type)}
                </div>
                
                {/* Contenu */}
                <div className="flex-1 min-w-0">
                  <div className="flex flex-wrap items-start justify-between gap-2">
                    <div>
                      <h3 className={`font-semibold text-black dark:text-white ${!notif.lue && "font-bold"}`}>
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
                          className="p-1.5 rounded-lg text-black/40 dark:text-white/40 hover:text-green-600 dark:hover:text-green-400 transition"
                          title="Marquer comme lue"
                        >
                          <Check className="h-3.5 w-3.5" />
                        </button>
                      )}
                      <button
                        onClick={() => handleSupprimer(notif)}
                        className="p-1.5 rounded-lg text-black/40 dark:text-white/40 hover:text-red-600 dark:hover:text-red-400 transition"
                        title="Supprimer"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 mt-2">
                    <span className="inline-flex items-center gap-1 text-[10px] text-black/40 dark:text-white/40">
                      <Clock className="h-3 w-3" />
                      {getFriendlyDate(notif.date)}
                    </span>
                    {notif.lue && (
                      <span className="text-[10px] text-black/30 dark:text-white/30">✓ Lu</span>
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

      {/* ALERTE SUPPRESSION */}
      {showDeleteAlert && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
          <div className="bg-white dark:bg-black border border-black/10 dark:border-white/10 rounded-2xl shadow-2xl w-full max-w-sm mx-4">
            <div className="px-6 py-6 flex flex-col items-center text-center gap-4">
              <div className="p-3 bg-red-500/10 rounded-full">
                <AlertTriangle className="h-6 w-6 text-red-500" />
              </div>
              <div>
                <h3 className="text-base font-semibold text-black dark:text-white">
                  {deleteAll ? "Supprimer toutes les notifications" : "Confirmer la suppression"}
                </h3>
                <p className="text-sm text-black/50 dark:text-white/50 mt-1">
                  {deleteAll 
                    ? "Voulez-vous vraiment supprimer toutes les notifications ? Cette action est irréversible."
                    : `Voulez-vous vraiment supprimer la notification "${selectedNotification?.titre}" ?`
                  }
                </p>
              </div>
            </div>
            <div className="flex gap-3 px-6 pb-6">
              <button onClick={() => setShowDeleteAlert(false)}
                className="flex-1 py-2 text-sm font-medium text-black/70 dark:text-white/70 border border-black/20 dark:border-white/20 rounded-lg hover:bg-black/5 dark:hover:bg-white/10 transition">
                Annuler
              </button>
              <button onClick={handleConfirmDelete}
                className="flex-1 py-2 text-sm font-medium bg-red-500 text-white rounded-lg hover:bg-red-600 transition">
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