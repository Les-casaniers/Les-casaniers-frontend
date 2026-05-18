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
  Users
} from "lucide-react";
import { Link } from "react-router-dom";
import api from "@/service/api";
import { toast } from "@/hooks/use-toast";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { fr } from "date-fns/locale";

// type StatutCommande = "en_attente" | "en_preparation" | "expediee" | "livree" | "annulee" | "payee";
type StatutCommande = "en_attente" | "payee" | "en_traitement" | "expediee" | "terminee" | "annulee" | "remboursee";

type Commande = {
  id: number;
  commande_uuid: string;
  utilisateur_id: number;
  statut: StatutCommande;
  total: number;
  devise: string;
  date_creation: string;
  quantite: number;
  utilisateur?: {
    id: number;
    nom: string;
    prenom: string;
    email: string;
  };
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

// const statutsDisponibles: { value: StatutCommande; label: string; color: string }[] = [
//   { value: "en_attente", label: "En attente", color: "bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/30" },
//   { value: "payee", label: "Payée", color: "bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/30" },
//   { value: "en_preparation", label: "En préparation", color: "bg-purple-500/10 text-purple-600 dark:text-purple-400 border-purple-500/30" },
//   { value: "expediee", label: "Expédiée", color: "bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border-indigo-500/30" },
//   { value: "livree", label: "Livrée", color: "bg-green-500/10 text-green-600 dark:text-green-400 border-green-500/30" },
//   { value: "annulee", label: "Annulée", color: "bg-red-500/10 text-red-600 dark:text-red-400 border-red-500/30" },
// ];



const statutsDisponibles: { value: StatutCommande; label: string; color: string }[] = [
  { value: "en_attente", label: "En attente", color: "bg-amber-500/10 text-amber-600" },
  { value: "payee", label: "Payée", color: "bg-blue-500/10 text-blue-600" },
  { value: "en_traitement", label: "En préparation", color: "bg-purple-500/10 text-purple-600" },
  { value: "expediee", label: "Expédiée", color: "bg-indigo-500/10 text-indigo-600" },
  { value: "terminee", label: "Livrée", color: "bg-green-500/10 text-green-600" },
  { value: "annulee", label: "Annulée", color: "bg-red-500/10 text-red-600" },
];

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
      const response = await api.get('/admin/commandes');
      console.log("Commandes admin:", response.data);
      
      let commandesData: Commande[] = [];
      if (response.data.data && Array.isArray(response.data.data)) {
        commandesData = response.data.data;
      } else if (Array.isArray(response.data)) {
        commandesData = response.data;
      } else {
        commandesData = [];
      }
      
      // Grouper par commande_uuid
      const commandesMap = new Map<string, Commande>();
      commandesData.forEach(cmd => {
        if (!commandesMap.has(cmd.commande_uuid)) {
          commandesMap.set(cmd.commande_uuid, cmd);
        }
      });
      
      const commandesUniques = Array.from(commandesMap.values());
      setCommandes(commandesUniques);
      
      // Calculer les statistiques
      const stats: Statistiques = {
        total: commandesUniques.length,
        enAttente: commandesUniques.filter(c => c.statut === "en_attente").length,
        enPreparation: commandesUniques.filter(c => c.statut === "en_traitement").length,
        payee: commandesUniques.filter(c => c.statut === "payee").length,
        expediee: commandesUniques.filter(c => c.statut === "expediee").length,
        livree: commandesUniques.filter(c => c.statut === "terminee").length,
        annulee: commandesUniques.filter(c => c.statut === "annulee").length,
      };
      setStatistiques(stats);
      
    } catch (error: any) {
      console.error("Erreur chargement commandes:", error);
      toast({ 
        title: "Erreur", 
        description: "Impossible de charger les commandes",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const filterCommandes = () => {
    let filtered = [...commandes];
    
    // Filtre par recherche
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(cmd => 
        cmd.commande_uuid.toLowerCase().includes(term) ||
        cmd.utilisateur?.prenom?.toLowerCase().includes(term) ||
        cmd.utilisateur?.nom?.toLowerCase().includes(term) ||
        cmd.utilisateur?.email?.toLowerCase().includes(term)
      );
    }
    
    // Filtre par statut
    if (selectedStatut !== "toutes") {
      filtered = filtered.filter(cmd => cmd.statut === selectedStatut);
    }
    
    // Filtre par date
    if (startDate) {
      filtered = filtered.filter(cmd => new Date(cmd.date_creation) >= startDate);
    }
    if (endDate) {
      const endOfDay = new Date(endDate);
      endOfDay.setHours(23, 59, 59);
      filtered = filtered.filter(cmd => new Date(cmd.date_creation) <= endOfDay);
    }
    
    // Trier par date décroissante
    filtered.sort((a, b) => new Date(b.date_creation).getTime() - new Date(a.date_creation).getTime());
    
    setFilteredCommandes(filtered);
    setCurrentPage(1);
  };

  const updateStatut = async (commande: Commande, nouveauStatut: StatutCommande) => {
    try {
      setActionInProgress(commande.id);
      const response = await api.patch(`/admin/commandes/${commande.commande_uuid}/statut`, {
        statut: nouveauStatut
      });
      
      if (response.data.success) {
        toast({ 
          title: "Statut mis à jour", 
          description: `Commande ${commande.commande_uuid} → ${statutsDisponibles.find(s => s.value === nouveauStatut)?.label}`,
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
      toast({ 
        title: "Erreur", 
        description: error.response?.data?.message || "Impossible de mettre à jour le statut",
        variant: "destructive"
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
        variant: "destructive"
      });
    } finally {
      setActionInProgress(null);
    }
  };

  const handleRemboursement = async (commande: Commande) => {
    try {
      setActionInProgress(commande.id);
      const response = await api.post(`/admin/commandes/${commande.commande_uuid}/rembourser`);
      
      if (response.data.success) {
        toast({ 
          title: "Remboursement effectué", 
          description: `La commande ${commande.commande_uuid} a été remboursée`,
        });
        await fetchCommandes();
      } else {
        throw new Error(response.data.message);
      }
    } catch (error: any) {
      console.error("Erreur remboursement:", error);
      toast({ 
        title: "Erreur", 
        description: error.response?.data?.message || "Impossible de rembourser la commande",
        variant: "destructive"
      });
    } finally {
      setActionInProgress(null);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("fr-FR", { day: "numeric", month: "long", year: "numeric", hour: "2-digit", minute: "2-digit" });
  };

  const formatPrice = (prix: number, devise: string = 'MGA') => {
    return new Intl.NumberFormat('fr-FR').format(prix) + ` ${devise}`;
  };

  const getStatutColor = (statut: StatutCommande) => {
    const found = statutsDisponibles.find(s => s.value === statut);
    return found?.color || statutsDisponibles[0].color;
  };

  const getStatutLabel = (statut: StatutCommande) => {
    const found = statutsDisponibles.find(s => s.value === statut);
    return found?.label || statut;
  };

  // Pagination
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = filteredCommandes.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(filteredCommandes.length / itemsPerPage);

  const statCards = [
    { label: "Total", value: statistiques.total, icon: Package, color: "bg-gray-500/10 text-gray-600" },
    { label: "En attente", value: statistiques.enAttente, icon: Clock, color: "bg-amber-500/10 text-amber-600" },
    { label: "Payée", value: statistiques.payee, icon: DollarSign, color: "bg-blue-500/10 text-blue-600" },
    { label: "En préparation", value: statistiques.enPreparation, icon: RefreshCw, color: "bg-purple-500/10 text-purple-600" },
    { label: "Expédiée", value: statistiques.expediee, icon: Truck, color: "bg-indigo-500/10 text-indigo-600" },
    { label: "Livrée", value: statistiques.livree, icon: Gift, color: "bg-green-500/10 text-green-600" },
    { label: "Annulée", value: statistiques.annulee, icon: XCircle, color: "bg-red-500/10 text-red-600" },
  ];

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
          {/* Recherche par texte */}
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
          
          {/* Filtre par statut */}
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
          
          {/* Date de début */}
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
          
          {/* Date de fin */}
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

      {/* Liste des commandes */}
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
        <>
          <div className="space-y-3">
            {currentItems.map((commande) => (
              <div
                key={commande.id}
                className="bg-card border border-border rounded-xl p-4 hover:shadow-md transition"
              >
                <div className="flex flex-wrap items-start justify-between gap-4">
                  {/* Infos gauche */}
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

                  {/* Infos droite */}
                  <div className="text-right">
                    <p className="text-xl font-bold text-foreground">{formatPrice(commande.total, commande.devise)}</p>
                    <div className="flex items-center justify-end gap-2 mt-2">
                      <button
                        onClick={() => {
                          setSelectedCommande(commande);
                          setShowDetails(true);
                        }}
                        className="p-1.5 rounded-lg text-muted-foreground hover:text-primary hover:bg-primary/10 transition"
                        title="Voir détails"
                      >
                        <Eye className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                </div>

                {/* Actions admin */}
                {/* Actions admin */}
<div className="flex flex-wrap items-center gap-2 mt-4 pt-3 border-t border-border/50">
  {commande.statut === "en_attente" && (
    <button
      onClick={() => updateStatut(commande, "en_traitement")}  // ← Changé
      disabled={actionInProgress === commande.id}
      className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium bg-purple-500/10 text-purple-600 rounded-lg hover:bg-purple-500 hover:text-white transition"
    >
      {actionInProgress === commande.id ? <Loader2 className="h-3 w-3 animate-spin" /> : <RefreshCw className="h-3 w-3" />}
      Mettre en préparation
    </button>
  )}
  
  {commande.statut === "payee" && (
    <button
      onClick={() => updateStatut(commande, "en_traitement")}  // ← Changé
      disabled={actionInProgress === commande.id}
      className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium bg-purple-500/10 text-purple-600 rounded-lg hover:bg-purple-500 hover:text-white transition"
    >
      {actionInProgress === commande.id ? <Loader2 className="h-3 w-3 animate-spin" /> : <RefreshCw className="h-3 w-3" />}
      Mettre en préparation
    </button>
  )}
  
  {commande.statut === "en_traitement" && (  // ← Changé
    <>
      <button
        onClick={() => updateStatut(commande, "expediee")}
        disabled={actionInProgress === commande.id}
        className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium bg-indigo-500/10 text-indigo-600 rounded-lg hover:bg-indigo-500 hover:text-white transition"
      >
        {actionInProgress === commande.id ? <Loader2 className="h-3 w-3 animate-spin" /> : <Truck className="h-3 w-3" />}
        Marquer expédiée
      </button>
      <button
        onClick={() => updateStatut(commande, "annulee")}
        disabled={actionInProgress === commande.id}
        className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium bg-red-500/10 text-red-600 rounded-lg hover:bg-red-500 hover:text-white transition"
      >
        {actionInProgress === commande.id ? <Loader2 className="h-3 w-3 animate-spin" /> : <XCircle className="h-3 w-3" />}
        Annuler
      </button>
    </>
  )}
  
  {commande.statut === "expediee" && (
    <button
      onClick={() => updateStatut(commande, "terminee")}  // ← Changé
      disabled={actionInProgress === commande.id}
      className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium bg-green-500/10 text-green-600 rounded-lg hover:bg-green-500 hover:text-white transition"
    >
      {actionInProgress === commande.id ? <Loader2 className="h-3 w-3 animate-spin" /> : <Gift className="h-3 w-3" />}
      Marquer livrée
    </button>
  )}
  
  {commande.statut === "payee" && (
    <button
      onClick={() => handleRemboursement(commande)}
      disabled={actionInProgress === commande.id}
      className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium bg-yellow-500/10 text-yellow-600 rounded-lg hover:bg-yellow-500 hover:text-white transition"
    >
      {actionInProgress === commande.id ? <Loader2 className="h-3 w-3 animate-spin" /> : <DollarSign className="h-3 w-3" />}
      Rembourser
    </button>
  )}
  
  {(commande.statut === "annulee" || commande.statut === "terminee") && (  // ← Changé
    <button
      onClick={() => {
        setSelectedCommande(commande);
        setShowDeleteAlert(true);
      }}
      disabled={actionInProgress === commande.id}
      className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium bg-red-500/10 text-red-600 rounded-lg hover:bg-red-500 hover:text-white transition"
    >
      {actionInProgress === commande.id ? <Loader2 className="h-3 w-3 animate-spin" /> : <Trash2 className="h-3 w-3" />}
      Supprimer
    </button>
  )}
</div>
              </div>
            ))}
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between pt-4">
              <button
                onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                disabled={currentPage === 1}
                className="px-3 py-1.5 text-sm border border-border rounded-lg hover:bg-secondary disabled:opacity-50 disabled:cursor-not-allowed transition"
              >
                <ChevronLeft className="h-4 w-4" />
              </button>
              <span className="text-sm text-muted-foreground">
                Page {currentPage} sur {totalPages}
              </span>
              <button
                onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                disabled={currentPage === totalPages}
                className="px-3 py-1.5 text-sm border border-border rounded-lg hover:bg-secondary disabled:opacity-50 disabled:cursor-not-allowed transition"
              >
                <ChevronRight className="h-4 w-4" />
              </button>
            </div>
          )}
        </>
      )}

      {/* MODAL DÉTAILS COMMANDE */}
      {showDetails && selectedCommande && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="bg-background border border-border rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] flex flex-col">
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
              <div className="flex justify-between items-start flex-wrap gap-3">
                <div>
                  <span className={`inline-flex items-center gap-1 text-xs px-2 py-1 rounded-full font-medium border ${getStatutColor(selectedCommande.statut)}`}>
                    {getStatutLabel(selectedCommande.statut)}
                  </span>
                  <p className="text-sm text-muted-foreground mt-2">
                    Commandé le {formatDate(selectedCommande.date_creation)}
                  </p>
                  <p className="text-sm text-muted-foreground mt-1">
                    Client: {selectedCommande.utilisateur?.prenom} {selectedCommande.utilisateur?.nom} ({selectedCommande.utilisateur?.email})
                  </p>
                </div>
                <p className="text-2xl font-bold text-foreground">{formatPrice(selectedCommande.total, selectedCommande.devise)}</p>
              </div>
            </div>
            <div className="flex gap-3 px-6 py-4 border-t border-border">
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
              <button onClick={() => window.print()} className="flex-1 py-2 text-sm font-medium border border-border rounded-lg hover:bg-secondary transition">
                🖨️ Imprimer
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