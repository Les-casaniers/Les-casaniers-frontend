import { useState } from "react";
import { Package, Clock, CheckCircle, XCircle, Eye, ChevronRight, Search, Filter, Calendar } from "lucide-react";
import { Link } from "react-router-dom";

type StatutCommande = "En attente" | "En préparation" | "Expédiée" | "Livrée" | "Annulée";

type Commande = {
  id: string;
  date: string;
  statut: StatutCommande;
  total: string;
  articles: number;
  image?: string;
  produits: { nom: string; quantite: number; prix: string }[];
};

// Données mockées
const commandesParDefaut: Commande[] = [
  {
    id: "CMD-2024-001",
    date: "2024-03-12",
    statut: "Livrée",
    total: "1 249 000 Ar",
    articles: 3,
    produits: [
      { nom: "PC Gaming RTX 4060", quantite: 1, prix: "1 200 000 Ar" },
      { nom: "Souris Gaming", quantite: 2, prix: "49 000 Ar" },
    ],
  },
  {
    id: "CMD-2024-002",
    date: "2024-02-28",
    statut: "En préparation",
    total: "89 900 Ar",
    articles: 1,
    produits: [{ nom: "Clavier Mécanique RGB", quantite: 1, prix: "89 900 Ar" }],
  },
  {
    id: "CMD-2024-003",
    date: "2024-02-15",
    statut: "Livrée",
    total: "459 000 Ar",
    articles: 2,
    produits: [
      { nom: "Écran 27 pouces", quantite: 1, prix: "450 000 Ar" },
      { nom: "Câble HDMI", quantite: 1, prix: "9 000 Ar" },
    ],
  },
  {
    id: "CMD-2024-004",
    date: "2024-03-01",
    statut: "Expédiée",
    total: "125 000 Ar",
    articles: 2,
    produits: [
      { nom: "Webcam HD", quantite: 1, prix: "75 000 Ar" },
      { nom: "Casque Gaming", quantite: 1, prix: "50 000 Ar" },
    ],
  },
  {
    id: "CMD-2024-005",
    date: "2024-01-20",
    statut: "Annulée",
    total: "2 500 Ar",
    articles: 1,
    produits: [{ nom: "Souris simple", quantite: 1, prix: "2 500 Ar" }],
  },
];

const getStatutStyle = (statut: StatutCommande) => {
  const styles = {
    "En attente": "bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/30",
    "En préparation": "bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/30",
    "Expédiée": "bg-purple-500/10 text-purple-600 dark:text-purple-400 border-purple-500/30",
    "Livrée": "bg-green-500/10 text-green-600 dark:text-green-400 border-green-500/30",
    "Annulée": "bg-red-500/10 text-red-600 dark:text-red-400 border-red-500/30",
  };
  return styles[statut];
};

const getStatutIcone = (statut: StatutCommande) => {
  switch (statut) {
    case "Livrée": return <CheckCircle className="h-3 w-3" />;
    case "Annulée": return <XCircle className="h-3 w-3" />;
    default: return <Clock className="h-3 w-3" />;
  }
};

const DashboardCommandes = () => {
  const [commandes, setCommandes] = useState<Commande[]>(commandesParDefaut);
  const [filtre, setFiltre] = useState<"toutes" | StatutCommande>("toutes");
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCommande, setSelectedCommande] = useState<Commande | null>(null);
  const [showDetails, setShowDetails] = useState(false);

  const stats = {
    total: commandes.length,
    livrees: commandes.filter(c => c.statut === "Livrée").length,
    enCours: commandes.filter(c => ["En préparation", "Expédiée", "En attente"].includes(c.statut)).length,
    annulees: commandes.filter(c => c.statut === "Annulée").length,
  };

  const commandesFiltrees = commandes.filter(cmd => {
    if (filtre !== "toutes" && cmd.statut !== filtre) return false;
    if (searchTerm && !cmd.id.toLowerCase().includes(searchTerm.toLowerCase())) return false;
    return true;
  });

  const handleViewDetails = (commande: Commande) => {
    setSelectedCommande(commande);
    setShowDetails(true);
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("fr-FR", { day: "numeric", month: "long", year: "numeric" });
  };

  return (
    <div className="space-y-6">
      {/* En-tête */}
      <div>
        <h1 className="text-2xl font-bold text-black dark:text-white">Mes commandes</h1>
        <p className="text-gray-500 dark:text-gray-400">Consultez l'historique et le suivi de vos commandes</p>
      </div>

      {/* Statistiques */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-black border border-gray-300 dark:border-gray-700 rounded-xl p-4">
          <div className="w-10 h-10 bg-gray-200 dark:bg-gray-800 rounded-lg flex items-center justify-center mb-3">
            <Package className="h-5 w-5 text-black dark:text-white" />
          </div>
          <p className="text-2xl font-bold text-black dark:text-white">{stats.total}</p>
          <p className="text-sm text-gray-500 dark:text-gray-400">Total commandes</p>
        </div>
        <div className="bg-white dark:bg-black border border-gray-300 dark:border-gray-700 rounded-xl p-4">
          <div className="w-10 h-10 bg-green-100 dark:bg-green-900/30 rounded-lg flex items-center justify-center mb-3">
            <CheckCircle className="h-5 w-5 text-green-600 dark:text-green-400" />
          </div>
          <p className="text-2xl font-bold text-black dark:text-white">{stats.livrees}</p>
          <p className="text-sm text-gray-500 dark:text-gray-400">Commandes livrées</p>
        </div>
        <div className="bg-white dark:bg-black border border-gray-300 dark:border-gray-700 rounded-xl p-4">
          <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900/30 rounded-lg flex items-center justify-center mb-3">
            <Clock className="h-5 w-5 text-blue-600 dark:text-blue-400" />
          </div>
          <p className="text-2xl font-bold text-black dark:text-white">{stats.enCours}</p>
          <p className="text-sm text-gray-500 dark:text-gray-400">En cours</p>
        </div>
        <div className="bg-white dark:bg-black border border-gray-300 dark:border-gray-700 rounded-xl p-4">
          <div className="w-10 h-10 bg-red-100 dark:bg-red-900/30 rounded-lg flex items-center justify-center mb-3">
            <XCircle className="h-5 w-5 text-red-600 dark:text-red-400" />
          </div>
          <p className="text-2xl font-bold text-black dark:text-white">{stats.annulees}</p>
          <p className="text-sm text-gray-500 dark:text-gray-400">Commandes annulées</p>
        </div>
      </div>

      {/* Filtres et recherche */}
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
        <div className="flex flex-wrap items-center gap-2">
          <Filter className="h-4 w-4 text-gray-500 dark:text-gray-400" />
          {["toutes", "En attente", "En préparation", "Expédiée", "Livrée", "Annulée"].map((f) => (
            <button
              key={f}
              onClick={() => setFiltre(f as typeof filtre)}
              className={`px-3 py-1.5 text-xs font-medium rounded-lg transition ${
                filtre === f
                  ? "bg-black dark:bg-white text-white dark:text-black"
                  : "bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700"
              }`}
            >
              {f === "toutes" ? "Toutes" : f}
            </button>
          ))}
        </div>
        <div className="relative w-full sm:w-64">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
          <input
            type="text"
            placeholder="Rechercher une commande..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-4 py-2 text-sm border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-black text-black dark:text-white focus:outline-none focus:ring-2 focus:ring-black dark:focus:ring-white focus:border-transparent"
          />
        </div>
      </div>

      {/* Liste des commandes */}
      {commandesFiltrees.length === 0 ? (
        <div className="bg-white dark:bg-black border border-gray-300 dark:border-gray-700 rounded-xl p-12 text-center">
          <Package className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-black dark:text-white mb-2">Aucune commande trouvée</h3>
          <p className="text-gray-500 dark:text-gray-400 mb-6">
            {searchTerm ? "Aucune commande ne correspond à votre recherche" : "Vous n'avez pas encore passé de commande"}
          </p>
          <Link
            to="/catalogue"
            className="inline-flex items-center gap-2 px-4 py-2 bg-black text-white dark:bg-white dark:text-black rounded-lg text-sm font-medium hover:bg-gray-800 dark:hover:bg-gray-200 transition"
          >
            Explorer le catalogue
            <ChevronRight className="h-4 w-4" />
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          {commandesFiltrees.map((commande) => (
            <div
              key={commande.id}
              className="bg-white dark:bg-black border border-gray-300 dark:border-gray-700 rounded-xl p-4 hover:shadow-md transition"
            >
              <div className="flex flex-wrap items-start justify-between gap-4">
                {/* Infos gauche */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-3 flex-wrap">
                    <p className="font-mono font-semibold text-black dark:text-white">{commande.id}</p>
                    <span className={`inline-flex items-center gap-1 text-[10px] px-2 py-0.5 rounded-full font-medium border ${getStatutStyle(commande.statut)}`}>
                      {getStatutIcone(commande.statut)}
                      {commande.statut}
                    </span>
                  </div>
                  <div className="flex items-center gap-4 mt-2 text-sm">
                    <span className="flex items-center gap-1 text-gray-500 dark:text-gray-400">
                      <Calendar className="h-3.5 w-3.5" />
                      {formatDate(commande.date)}
                    </span>
                    <span className="text-gray-500 dark:text-gray-400">
                      {commande.articles} article{commande.articles > 1 ? "s" : ""}
                    </span>
                  </div>
                  <div className="mt-2">
                    <p className="text-sm text-gray-600 dark:text-gray-300 line-clamp-1">
                      {commande.produits.map(p => p.nom).join(", ")}
                    </p>
                  </div>
                </div>

                {/* Infos droite */}
                <div className="text-right">
                  <p className="text-xl font-bold text-black dark:text-white">{commande.total}</p>
                  <button
                    onClick={() => handleViewDetails(commande)}
                    className="inline-flex items-center gap-1 mt-2 text-sm text-gray-500 dark:text-gray-400 hover:text-black dark:hover:text-white transition"
                  >
                    <Eye className="h-4 w-4" />
                    Détails
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* MODAL DÉTAILS COMMANDE */}
      {showDetails && selectedCommande && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
          <div className="bg-white dark:bg-black border border-gray-300 dark:border-gray-700 rounded-2xl shadow-2xl w-full max-w-2xl mx-4 max-h-[90vh] flex flex-col">
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200 dark:border-gray-800">
              <div>
                <h2 className="text-lg font-semibold text-black dark:text-white">Détails de la commande</h2>
                <p className="text-xs text-gray-500 dark:text-gray-400 font-mono">{selectedCommande.id}</p>
              </div>
              <button onClick={() => setShowDetails(false)} className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition">
                <XCircle className="h-5 w-5 text-gray-500" />
              </button>
            </div>
            <div className="overflow-y-auto px-6 py-5 flex-1 space-y-5">
              {/* En-tête */}
              <div className="flex justify-between items-start">
                <div>
                  <span className={`inline-flex items-center gap-1 text-xs px-2 py-1 rounded-full font-medium border ${getStatutStyle(selectedCommande.statut)}`}>
                    {getStatutIcone(selectedCommande.statut)}
                    {selectedCommande.statut}
                  </span>
                  <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">
                    Commandé le {formatDate(selectedCommande.date)}
                  </p>
                </div>
                <p className="text-2xl font-bold text-black dark:text-white">{selectedCommande.total}</p>
              </div>

              {/* Articles */}
              <div>
                <h3 className="text-sm font-semibold text-black dark:text-white mb-3">Articles commandés</h3>
                <div className="border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden">
                  <table className="w-full text-sm">
                    <thead className="bg-gray-50 dark:bg-gray-900">
                      <tr>
                        <th className="text-left py-2 px-3 text-xs text-gray-500 dark:text-gray-400">Produit</th>
                        <th className="text-center py-2 px-3 text-xs text-gray-500 dark:text-gray-400">Qté</th>
                        <th className="text-right py-2 px-3 text-xs text-gray-500 dark:text-gray-400">Prix</th>
                      </tr>
                    </thead>
                    <tbody>
                      {selectedCommande.produits.map((produit, idx) => (
                        <tr key={idx} className="border-t border-gray-200 dark:border-gray-700">
                          <td className="py-2 px-3 text-black dark:text-white">{produit.nom}</td>
                          <td className="text-center py-2 px-3 text-gray-600 dark:text-gray-400">{produit.quantite}</td>
                          <td className="text-right py-2 px-3 text-gray-600 dark:text-gray-400">{produit.prix}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Résumé */}
              <div className="border-t border-gray-200 dark:border-gray-700 pt-3">
                <div className="flex justify-end">
                  <div className="w-48 space-y-1 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-500">Sous-total :</span>
                      <span className="text-black dark:text-white">{selectedCommande.total}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-500">Livraison :</span>
                      <span className="text-green-600 dark:text-green-400">Gratuite</span>
                    </div>
                    <div className="flex justify-between pt-1 border-t border-gray-200 dark:border-gray-700 font-semibold">
                      <span className="text-black dark:text-white">Total :</span>
                      <span className="text-black dark:text-white">{selectedCommande.total}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <div className="flex gap-3 px-6 py-4 border-t border-gray-200 dark:border-gray-800">
              <button
                onClick={() => window.print()}
                className="flex-1 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 border border-gray-300 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition"
              >
                🖨️ Imprimer
              </button>
              <Link
                to="/contact"
                className="flex-1 py-2 text-sm font-medium bg-black text-white dark:bg-white dark:text-black rounded-lg hover:bg-gray-800 dark:hover:bg-gray-200 transition text-center"
              >
                Assistance
              </Link>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DashboardCommandes;