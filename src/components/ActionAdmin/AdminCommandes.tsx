import { useState, useEffect } from "react";
import {
  Package,
  Clock,
  CheckCircle,
  XCircle,
  Eye,
  Search,
  Filter,
  Calendar,
  Loader2,
  Trash2,
  Truck,
  Gift,
  RefreshCw,
  DollarSign,
  ChevronLeft,
  ChevronRight,
  AlertCircle,
  Users,
  CreditCard,
  LayoutGrid,
  List,
} from "lucide-react";
import { Link } from "react-router-dom";
import api from "@/service/api";
import { toast } from "@/hooks/use-toast";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { fr } from "date-fns/locale";

type StatutCommande =
  | "en_attente"
  | "payee"
  | "en_traitement"
  | "expediee"
  | "terminee"
  | "annulee";

type ProduitCommande = {
  id: number;
  nom: string;
  quantite: number;
  prix_unitaire: number;
  sous_total: number;
};

type Commande = {
  id: number;
  commande_uuid: string;
  utilisateur_id: number;
  statut: StatutCommande;
  total: number;
  devise: string;
  date_creation: string;
  quantite: number;
  sous_total: number;
  livraison: number;
  titre?: string;
  produit_id?: number;
  prix_unitaire?: number;
  meta_json?: string | null;
  devis_id?: number | null;
  utilisateur?: {
    id: number;
    nom: string;
    prenom: string;
    email: string;
  };
  produits?: ProduitCommande[];
};

type Statistiques = {
  total: number;
  enAttente: number;
  enPreparation: number;
  payee: number;
  expediee: number;
  livree: number;
  annulee: number;
};

const statutsDisponibles: {
  value: StatutCommande;
  label: string;
  color: string;
}[] = [
  {
    value: "en_attente",
    label: "En attente",
    color: "bg-amber-500/10 text-amber-600",
  },
  { value: "payee", label: "Payée", color: "bg-blue-500/10 text-blue-600" },
  {
    value: "en_traitement",
    label: "En préparation",
    color: "bg-purple-500/10 text-purple-600",
  },
  {
    value: "expediee",
    label: "Expédiée",
    color: "bg-indigo-500/10 text-indigo-600",
  },
  {
    value: "terminee",
    label: "Livrée",
    color: "bg-green-500/10 text-green-600",
  },
  { value: "annulee", label: "Annulée", color: "bg-red-500/10 text-red-600" },
];

// Ordre de progression des statuts
const statutOrder = ["en_attente", "payee", "expediee", "en_traitement", "terminee", "annulee"];

// Fonction pour construire la liste des produits à partir des données de la commande
const getProduitsFromCommande = (commande: Commande): ProduitCommande[] => {
  const produits: ProduitCommande[] = [];
  
  // Si la commande a déjà des produits dans produits
  if (commande.produits && commande.produits.length > 0) {
    return commande.produits;
  }
  
  // Si la commande a des produits dans meta_json
  if (commande.meta_json) {
    try {
      const meta = typeof commande.meta_json === 'string' ? JSON.parse(commande.meta_json) : commande.meta_json;
      if (meta.produits && Array.isArray(meta.produits)) {
        return meta.produits;
      }
      if (meta.items && Array.isArray(meta.items)) {
        return meta.items;
      }
    } catch (e) {
      console.error("Erreur parsing meta_json:", e);
    }
  }
  
  // Sinon, construire un produit à partir des données de base
  if (commande.titre) {
    produits.push({
      id: commande.produit_id || 0,
      nom: commande.titre,
      quantite: commande.quantite || 1,
      prix_unitaire: commande.prix_unitaire || 0,
      sous_total: (commande.prix_unitaire || 0) * (commande.quantite || 1)
    });
  }
  
  return produits;
};

const AdminCommandes = () => {
  const [commandes, setCommandes] = useState<Commande[]>([]);
  const [filteredCommandes, setFilteredCommandes] = useState<Commande[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedStatut, setSelectedStatut] = useState<string>("toutes");
  const [startDate, setStartDate] = useState<Date | null>(null);
  const [endDate, setEndDate] = useState<Date | null>(null);
  const [selectedCommande, setSelectedCommande] = useState<Commande | null>(null);
  const [showDetails, setShowDetails] = useState(false);
  const [showDeleteAlert, setShowDeleteAlert] = useState(false);
  const [actionInProgress, setActionInProgress] = useState<number | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);
  const [viewMode, setViewMode] = useState<"list" | "card">("list");
  const [statistiques, setStatistiques] = useState<Statistiques>({
    total: 0,
    enAttente: 0,
    enPreparation: 0,
    payee: 0,
    expediee: 0,
    livree: 0,
    annulee: 0,
  });

  useEffect(() => {
    fetchCommandes();
  }, []);

  useEffect(() => {
    filterCommandes();
  }, [commandes, searchTerm, selectedStatut, startDate, endDate]);

  const fetchCommandes = async () => {
    try {
      setIsLoading(true);
      const response = await api.get("/admin/commandes");
      console.log("Commandes admin:", response.data);

      let commandesData: Commande[] = [];
      if (response.data.data && Array.isArray(response.data.data)) {
        commandesData = response.data.data;
      } else if (Array.isArray(response.data)) {
        commandesData = response.data;
      } else {
        commandesData = [];
      }

      const commandesMap = new Map<string, Commande>();
      commandesData.forEach((cmd) => {
        if (!commandesMap.has(cmd.commande_uuid)) {
          commandesMap.set(cmd.commande_uuid, cmd);
        }
      });

      const commandesUniques = Array.from(commandesMap.values());
      setCommandes(commandesUniques);

      const stats: Statistiques = {
        total: commandesUniques.length,
        enAttente: commandesUniques.filter((c) => c.statut === "en_attente").length,
        enPreparation: commandesUniques.filter((c) => c.statut === "en_traitement").length,
        payee: commandesUniques.filter((c) => c.statut === "payee").length,
        expediee: commandesUniques.filter((c) => c.statut === "expediee").length,
        livree: commandesUniques.filter((c) => c.statut === "terminee").length,
        annulee: commandesUniques.filter((c) => c.statut === "annulee").length,
      };
      setStatistiques(stats);
    } catch (error: any) {
      console.error("Erreur chargement commandes:", error);
      toast({
        title: "Erreur",
        description: "Impossible de charger les commandes",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const filterCommandes = () => {
    let filtered = [...commandes];

    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(
        (cmd) =>
          cmd.commande_uuid.toLowerCase().includes(term) ||
          cmd.utilisateur?.prenom?.toLowerCase().includes(term) ||
          cmd.utilisateur?.nom?.toLowerCase().includes(term) ||
          cmd.utilisateur?.email?.toLowerCase().includes(term),
      );
    }

    if (selectedStatut !== "toutes") {
      filtered = filtered.filter((cmd) => cmd.statut === selectedStatut);
    }

    if (startDate) {
      filtered = filtered.filter((cmd) => new Date(cmd.date_creation) >= startDate);
    }
    if (endDate) {
      const endOfDay = new Date(endDate);
      endOfDay.setHours(23, 59, 59);
      filtered = filtered.filter((cmd) => new Date(cmd.date_creation) <= endOfDay);
    }

    filtered.sort(
      (a, b) =>
        new Date(b.date_creation).getTime() - new Date(a.date_creation).getTime(),
    );

    setFilteredCommandes(filtered);
    setCurrentPage(1);
  };

  const updateStatut = async (commande: Commande, nouveauStatut: StatutCommande) => {
    try {
      setActionInProgress(commande.id);
      
      const response = await api.patch(
        `/admin/commandes/${commande.commande_uuid}/statut`,
        { statut: nouveauStatut },
      );

      if (response.data.success) {
        toast({
          title: "Statut mis à jour",
          description: `Commande ${commande.commande_uuid} → ${statutsDisponibles.find((s) => s.value === nouveauStatut)?.label}`,
        });
        await fetchCommandes();
        if (showDetails && selectedCommande?.id === commande.id) {
          setSelectedCommande({ ...commande, statut: nouveauStatut });
        }
      } else {
        throw new Error(response.data.message);
      }
    } catch (error: any) {
      console.error("Erreur mise à jour statut:", error);
      const errorMessage = error.response?.data?.message || "Impossible de mettre à jour le statut";
      toast({
        title: "Erreur",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setActionInProgress(null);
    }
  };

  const handleDelete = async (commande: Commande) => {
    try {
      setActionInProgress(commande.id);
      const response = await api.delete(`/admin/commandes/${commande.commande_uuid}`);

      if (response.data.success) {
        toast({
          title: "Commande supprimée",
          description: `La commande ${commande.commande_uuid} a été supprimée`,
        });
        await fetchCommandes();
        setShowDeleteAlert(false);
        setSelectedCommande(null);
        if (showDetails) setShowDetails(false);
      } else {
        throw new Error(response.data.message);
      }
    } catch (error: any) {
      console.error("Erreur suppression:", error);
      toast({
        title: "Erreur",
        description: error.response?.data?.message || "Impossible de supprimer la commande",
        variant: "destructive",
      });
    } finally {
      setActionInProgress(null);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("fr-FR", {
      day: "numeric",
      month: "long",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const formatPrice = (prix: number, devise: string = "MGA") => {
    return new Intl.NumberFormat("fr-FR").format(prix) + ` ${devise}`;
  };

  const getStatutColor = (statut: StatutCommande) => {
    const found = statutsDisponibles.find((s) => s.value === statut);
    return found?.color || statutsDisponibles[0].color;
  };

  const getStatutLabel = (statut: StatutCommande) => {
    const found = statutsDisponibles.find((s) => s.value === statut);
    return found?.label || statut;
  };

  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = filteredCommandes.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(filteredCommandes.length / itemsPerPage);

  const goToPrevPage = () => setCurrentPage((p) => Math.max(1, p - 1));
  const goToNextPage = () => setCurrentPage((p) => Math.min(totalPages, p + 1));

  const statCards = [
    { label: "Total", value: statistiques.total, icon: Package, color: "bg-gray-500/10 text-gray-600" },
    { label: "En attente", value: statistiques.enAttente, icon: Clock, color: "bg-amber-500/10 text-amber-600" },
    { label: "Payée", value: statistiques.payee, icon: CreditCard, color: "bg-blue-500/10 text-blue-600" },
    { label: "Expédiée", value: statistiques.expediee, icon: Truck, color: "bg-indigo-500/10 text-indigo-600" },
    { label: "En préparation", value: statistiques.enPreparation, icon: RefreshCw, color: "bg-purple-500/10 text-purple-600" },
    { label: "Livrée", value: statistiques.livree, icon: Gift, color: "bg-green-500/10 text-green-600" },
    { label: "Annulée", value: statistiques.annulee, icon: XCircle, color: "bg-red-500/10 text-red-600" },
  ];

  // Composant pour les boutons d'actions
  const ActionButtons = ({ commande }: { commande: Commande }) => (
    <div className="flex flex-wrap items-center gap-2 mt-4 pt-3 border-t border-border/50">
      {/* Bouton PAYER */}
      {(commande.statut === "en_attente" || commande.statut === "payee") && commande.statut !== "payee" && (
        <button
          onClick={() => updateStatut(commande, "payee")}
          disabled={actionInProgress === commande.id}
          className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium bg-blue-500/10 text-blue-600 rounded-lg hover:bg-blue-500 hover:text-white transition"
        >
          {actionInProgress === commande.id ? <Loader2 className="h-3 w-3 animate-spin" /> : <DollarSign className="h-3 w-3" />}
          Payer
        </button>
      )}

      {/* Bouton EXPÉDIÉE */}
      {(commande.statut === "payee" || commande.statut === "expediee") && commande.statut !== "expediee" && (
        <button
          onClick={() => updateStatut(commande, "expediee")}
          disabled={actionInProgress === commande.id}
          className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium bg-indigo-500/10 text-indigo-600 rounded-lg hover:bg-indigo-500 hover:text-white transition"
        >
          {actionInProgress === commande.id ? <Loader2 className="h-3 w-3 animate-spin" /> : <Truck className="h-3 w-3" />}
          Expédiée
        </button>
      )}

      {/* Bouton EN PRÉPARATION */}
      {commande.statut === "expediee" && (
        <button
          onClick={() => updateStatut(commande, "en_traitement")}
          disabled={actionInProgress === commande.id}
          className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium bg-purple-500/10 text-purple-600 rounded-lg hover:bg-purple-500 hover:text-white transition"
        >
          {actionInProgress === commande.id ? <Loader2 className="h-3 w-3 animate-spin" /> : <RefreshCw className="h-3 w-3" />}
          En préparation
        </button>
      )}

      {/* Bouton LIVRÉE */}
      {commande.statut === "en_traitement" && (
        <button
          onClick={() => updateStatut(commande, "terminee")}
          disabled={actionInProgress === commande.id}
          className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium bg-green-500/10 text-green-600 rounded-lg hover:bg-green-500 hover:text-white transition"
        >
          {actionInProgress === commande.id ? <Loader2 className="h-3 w-3 animate-spin" /> : <Gift className="h-3 w-3" />}
          Livrée
        </button>
      )}

      {/* Bouton ANNULER */}
      {commande.statut !== "annulee" && commande.statut !== "terminee" && (
        <button
          onClick={() => updateStatut(commande, "annulee")}
          disabled={actionInProgress === commande.id}
          className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium bg-red-500/10 text-red-600 rounded-lg hover:bg-red-500 hover:text-white transition"
        >
          {actionInProgress === commande.id ? <Loader2 className="h-3 w-3 animate-spin" /> : <XCircle className="h-3 w-3" />}
          Annuler
        </button>
      )}

      {/* Bouton SUPPRIMER */}
      {(commande.statut === "annulee" || commande.statut === "terminee") && (
        <button
          onClick={() => {
            setSelectedCommande(commande);
            setShowDeleteAlert(true);
          }}
          disabled={actionInProgress === commande.id}
          className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium bg-red-500/10 text-red-600 rounded-lg hover:bg-red-500 hover:text-white transition"
        >
          <Trash2 className="h-3 w-3" />
          Supprimer
        </button>
      )}
    </div>
  );

  // Composant pour l'affichage en mode liste
  const ListView = () => (
    <div className="space-y-3">
      {currentItems.map((commande) => (
        <div key={commande.id} className="bg-card border border-border rounded-xl p-4 hover:shadow-md transition">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-3 flex-wrap">
                <p className="font-mono font-semibold text-foreground">{commande.commande_uuid}</p>
                <span className={`inline-flex items-center gap-1 text-[10px] px-2 py-0.5 rounded-full font-medium border ${getStatutColor(commande.statut)}`}>
                  {getStatutLabel(commande.statut)}
                </span>
              </div>
              <div className="flex items-center gap-4 mt-2 text-sm">
                <span className="flex items-center gap-1 text-muted-foreground">
                  <Users className="h-3.5 w-3.5" />
                  {commande.utilisateur?.prenom} {commande.utilisateur?.nom}
                </span>
                <span className="flex items-center gap-1 text-muted-foreground">
                  <Calendar className="h-3.5 w-3.5" />
                  {formatDate(commande.date_creation)}
                </span>
                <span className="text-muted-foreground">
                  {commande.quantite} article{commande.quantite > 1 ? "s" : ""}
                </span>
              </div>
            </div>
            <div className="text-right">
              <p className="text-xl font-bold text-foreground">{formatPrice(commande.total, commande.devise)}</p>
              <button
                onClick={() => {
                  setSelectedCommande(commande);
                  setShowDetails(true);
                }}
                className="inline-flex items-center gap-2 mt-2 px-3 py-1.5 text-sm font-medium bg-white border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 hover:border-gray-400 transition shadow-sm"
              >
                <Eye className="h-4 w-4" />
                Détails
              </button>
            </div>
          </div>
          <ActionButtons commande={commande} />
        </div>
      ))}
    </div>
  );

  // Composant pour l'affichage en mode carte
  const CardView = () => (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {currentItems.map((commande) => (
        <div key={commande.id} className="bg-card border border-border rounded-xl p-4 hover:shadow-md transition flex flex-col">
          <div className="flex items-start justify-between mb-3">
            <p className="font-mono font-semibold text-foreground text-sm truncate">{commande.commande_uuid}</p>
            <span className={`inline-flex items-center gap-1 text-[10px] px-2 py-0.5 rounded-full font-medium border ${getStatutColor(commande.statut)}`}>
              {getStatutLabel(commande.statut)}
            </span>
          </div>
          
          <div className="flex items-center gap-2 text-sm mb-2">
            <Users className="h-3.5 w-3.5 text-muted-foreground" />
            <span className="text-muted-foreground text-xs truncate">
              {commande.utilisateur?.prenom} {commande.utilisateur?.nom}
            </span>
          </div>
          
          <div className="flex items-center gap-2 text-sm mb-3">
            <Calendar className="h-3.5 w-3.5 text-muted-foreground" />
            <span className="text-muted-foreground text-xs">
              {formatDate(commande.date_creation).split('à')[0]}
            </span>
          </div>
          
          <div className="flex items-center justify-between mt-2 pt-3 border-t border-border">
            <p className="text-lg font-bold text-foreground">{formatPrice(commande.total, commande.devise)}</p>
            <button
              onClick={() => {
                setSelectedCommande(commande);
                setShowDetails(true);
              }}
              className="inline-flex items-center gap-1 px-2 py-1 text-xs font-medium bg-white border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition shadow-sm"
            >
              <Eye className="h-3 w-3" />
              Détails
            </button>
          </div>
          <ActionButtons commande={commande} />
        </div>
      ))}
    </div>
  );

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center py-20">
        <Loader2 className="h-12 w-12 animate-spin text-primary mb-4" />
        <p className="text-muted-foreground">Chargement des commandes...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Gestion des commandes</h1>
          <p className="text-muted-foreground">Gérez les commandes des clients</p>
        </div>
        <button
          onClick={fetchCommandes}
          className="inline-flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition"
        >
          <RefreshCw className="h-4 w-4" />
          Actualiser
        </button>
      </div>

      {/* Statistiques */}
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-3">
        {statCards.map((stat) => (
          <div key={stat.label} className="bg-card border border-border rounded-xl p-3 text-center">
            <div className={`w-8 h-8 mx-auto ${stat.color} rounded-lg flex items-center justify-center mb-2`}>
              <stat.icon className="h-4 w-4" />
            </div>
            <p className="text-xl font-bold text-foreground">{stat.value}</p>
            <p className="text-xs text-muted-foreground">{stat.label}</p>
          </div>
        ))}
      </div>

      {/* Filtres */}
      <div className="bg-card border border-border rounded-xl p-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <input
              type="text"
              placeholder="Rechercher par n° commande, client, email..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-4 py-2 text-sm border border-border rounded-lg bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
            />
          </div>

          <div className="relative">
            <Filter className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <select
              value={selectedStatut}
              onChange={(e) => setSelectedStatut(e.target.value)}
              className="w-full pl-9 pr-4 py-2 text-sm border border-border rounded-lg bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary appearance-none"
            >
              <option value="toutes">Tous les statuts</option>
              {statutsDisponibles.map((s) => (
                <option key={s.value} value={s.value}>{s.label}</option>
              ))}
            </select>
          </div>

          <div className="relative">
            <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground z-10" />
            <DatePicker
              selected={startDate}
              onChange={(date) => setStartDate(date)}
              placeholderText="Date de début"
              locale={fr}
              dateFormat="dd/MM/yyyy"
              className="w-full pl-9 pr-4 py-2 text-sm border border-border rounded-lg bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
              isClearable
            />
          </div>

          <div className="relative">
            <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground z-10" />
            <DatePicker
              selected={endDate}
              onChange={(date) => setEndDate(date)}
              placeholderText="Date de fin"
              locale={fr}
              dateFormat="dd/MM/yyyy"
              className="w-full pl-9 pr-4 py-2 text-sm border border-border rounded-lg bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
              isClearable
            />
          </div>
        </div>
      </div>

      {/* Barre d'outils avec mode vue et pagination */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center gap-2 bg-card border border-border rounded-lg p-1 w-fit">
          <button
            onClick={() => setViewMode("list")}
            className={`flex items-center gap-2 px-3 py-1.5 text-sm font-medium rounded-md transition ${
              viewMode === "list"
                ? "bg-primary text-primary-foreground"
                : "text-muted-foreground hover:bg-secondary"
            }`}
          >
            <List className="h-4 w-4" />
            Liste
          </button>
          <button
            onClick={() => setViewMode("card")}
            className={`flex items-center gap-2 px-3 py-1.5 text-sm font-medium rounded-md transition ${
              viewMode === "card"
                ? "bg-primary text-primary-foreground"
                : "text-muted-foreground hover:bg-secondary"
            }`}
          >
            <LayoutGrid className="h-4 w-4" />
            Cartes
          </button>
        </div>

        {totalPages > 1 && (
          <div className="flex items-center gap-2">
            <button
              onClick={goToPrevPage}
              disabled={currentPage === 1}
              className="p-1.5 rounded-lg border border-border hover:bg-secondary disabled:opacity-50 disabled:cursor-not-allowed transition"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>
            <span className="text-sm text-muted-foreground">
              Page {currentPage} sur {totalPages}
            </span>
            <button
              onClick={goToNextPage}
              disabled={currentPage === totalPages}
              className="p-1.5 rounded-lg border border-border hover:bg-secondary disabled:opacity-50 disabled:cursor-not-allowed transition"
            >
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>
        )}
      </div>

      {/* Liste des commandes selon le mode */}
      {filteredCommandes.length === 0 ? (
        <div className="bg-card border border-border rounded-xl p-12 text-center">
          <Package className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-foreground mb-2">Aucune commande trouvée</h3>
          <p className="text-muted-foreground">
            {searchTerm || selectedStatut !== "toutes" || startDate || endDate
              ? "Aucune commande ne correspond aux filtres"
              : "Aucune commande pour le moment"}
          </p>
        </div>
      ) : (
        viewMode === "list" ? <ListView /> : <CardView />
      )}

      {/* MODAL DÉTAILS COMMANDE */}
      {showDetails && selectedCommande && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
          <div className="bg-background border border-border rounded-2xl shadow-2xl w-full max-w-2xl mx-4 max-h-[90vh] flex flex-col">
            <div className="flex items-center justify-between px-6 py-4 border-b border-border">
              <div>
                <h2 className="text-lg font-semibold text-foreground">Détails de la commande</h2>
                <p className="text-xs text-muted-foreground font-mono">{selectedCommande.commande_uuid}</p>
              </div>
              <button onClick={() => setShowDetails(false)} className="p-1.5 rounded-lg hover:bg-secondary transition">
                <XCircle className="h-5 w-5 text-muted-foreground" />
              </button>
            </div>
            
            <div className="overflow-y-auto px-6 py-5 flex-1 space-y-5">
              {/* En-tête */}
              <div className="flex justify-between items-start flex-wrap gap-3">
                <div>
                  <span className={`inline-flex items-center gap-1 text-xs px-2 py-1 rounded-full font-medium border ${getStatutColor(selectedCommande.statut)}`}>
                    {getStatutLabel(selectedCommande.statut)}
                  </span>
                  <p className="text-sm text-muted-foreground mt-2">
                    Commandé le {formatDate(selectedCommande.date_creation)}
                  </p>
                  {selectedCommande.devis_id && (
                    <p className="text-xs text-muted-foreground mt-1">
                      Devis N°{selectedCommande.devis_id}
                    </p>
                  )}
                  <p className="text-sm text-muted-foreground mt-1">
                    Client: {selectedCommande.utilisateur?.prenom} {selectedCommande.utilisateur?.nom} ({selectedCommande.utilisateur?.email})
                  </p>
                </div>
                <p className="text-2xl font-bold text-foreground">{formatPrice(selectedCommande.total, selectedCommande.devise)}</p>
              </div>

              {/* Articles commandés - TABLEAU COMPLET */}
              <div>
                <h3 className="text-sm font-semibold text-foreground mb-3">Articles commandés</h3>
                <div className="border border-border rounded-lg overflow-hidden">
                  <table className="w-full text-sm">
                    <thead className="bg-secondary">
                      <tr>
                        <th className="text-left py-2 px-3 text-xs text-muted-foreground">Produit</th>
                        <th className="text-center py-2 px-3 text-xs text-muted-foreground">Qté</th>
                        <th className="text-right py-2 px-3 text-xs text-muted-foreground">Prix unitaire</th>
                        <th className="text-right py-2 px-3 text-xs text-muted-foreground">Total</th>
                      </tr>
                    </thead>
                    <tbody>
                      {(() => {
                        const produits = getProduitsFromCommande(selectedCommande);
                        if (produits.length === 0) {
                          return (
                            <tr className="border-t border-border">
                              <td colSpan={4} className="py-4 px-3 text-center text-muted-foreground">
                                Aucun produit trouvé
                              </td>
                            </tr>
                          );
                        }
                        return produits.map((produit, idx) => {
                          const totalLigne = produit.quantite * produit.prix_unitaire;
                          return (
                            <tr key={idx} className="border-t border-border">
                              <td className="py-2 px-3 text-foreground">{produit.nom}</td>
                              <td className="text-center py-2 px-3 text-muted-foreground">{produit.quantite}</td>
                              <td className="text-right py-2 px-3 text-muted-foreground">{formatPrice(produit.prix_unitaire, selectedCommande.devise)}</td>
                              <td className="text-right py-2 px-3 font-medium text-foreground">{formatPrice(totalLigne, selectedCommande.devise)}</td>
                            </tr>
                          );
                        });
                      })()}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Résumé */}
              <div className="border-t border-border pt-3">
                <div className="flex justify-end">
                  <div className="w-64 space-y-1 text-sm">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Sous-total :</span>
                      <span className="text-foreground">{formatPrice(selectedCommande.sous_total, selectedCommande.devise)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Livraison :</span>
                      <span className={selectedCommande.livraison > 0 ? "text-foreground" : "text-green-600 dark:text-green-400"}>
                        {selectedCommande.livraison > 0 ? formatPrice(selectedCommande.livraison, selectedCommande.devise) : "Gratuite"}
                      </span>
                    </div>
                    <div className="flex justify-between pt-1 border-t border-border font-semibold">
                      <span className="text-foreground">Total :</span>
                      <span className="text-foreground">{formatPrice(selectedCommande.total, selectedCommande.devise)}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Note si présente */}
              {selectedCommande.meta_json && (() => {
                try {
                  const meta = typeof selectedCommande.meta_json === 'string' ? JSON.parse(selectedCommande.meta_json) : selectedCommande.meta_json;
                  if (meta.note) {
                    return (
                      <div className="bg-secondary/30 rounded-lg p-3">
                        <p className="text-xs text-muted-foreground mb-1">📝 Note associée :</p>
                        <p className="text-sm text-foreground">{meta.note}</p>
                      </div>
                    );
                  }
                } catch (e) { return null; }
                return null;
              })()}
            </div>

            <div className="flex gap-3 px-6 py-4 border-t border-border">
              <button
                onClick={() => window.print()}
                className="flex-1 py-2 text-sm font-medium text-foreground border border-border rounded-lg hover:bg-secondary transition"
              >
                🖨️ Imprimer
              </button>
              <button
                onClick={() => {
                  setShowDetails(false);
                  setSelectedCommande(selectedCommande);
                  setShowDeleteAlert(true);
                }}
                className="flex-1 py-2 text-sm font-medium text-red-500 border border-red-500 rounded-lg hover:bg-red-500 hover:text-white transition"
              >
                Supprimer la commande
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL SUPPRESSION */}
      {showDeleteAlert && selectedCommande && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="bg-background border border-border rounded-2xl shadow-2xl w-full max-w-md">
            <div className="p-6 text-center">
              <div className="w-16 h-16 mx-auto mb-4 bg-destructive/10 rounded-full flex items-center justify-center">
                <AlertCircle className="h-8 w-8 text-destructive" />
              </div>
              <h3 className="text-xl font-bold text-foreground mb-2">Supprimer la commande</h3>
              <p className="text-muted-foreground">
                Commande <span className="font-semibold text-foreground">{selectedCommande.commande_uuid}</span>
              </p>
              <p className="text-sm text-destructive mt-2">Cette action est irréversible.</p>
            </div>
            <div className="flex gap-3 p-6 pt-0">
              <button onClick={() => setShowDeleteAlert(false)} className="flex-1 px-4 py-2 text-sm font-medium border border-border rounded-lg hover:bg-secondary transition">
                Annuler
              </button>
              <button onClick={() => handleDelete(selectedCommande)} className="flex-1 px-4 py-2 text-sm font-medium bg-destructive text-destructive-foreground rounded-lg hover:bg-destructive/90 transition">
                Supprimer
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminCommandes;