import { useState, useEffect } from "react";
import { 
  FileText, 
  Search, 
  Trash2, 
  Eye, 
  Loader2,
  Calendar,
  User,
  Phone,
  Mail,
  DollarSign,
  Clock,
  CheckCircle,
  XCircle,
  RefreshCcw,
  AlertCircle,
  Filter,
  Building,
  Send,
  Archive 
} from "lucide-react";
import { toast } from "sonner";
import api from "@/service/api";

type DevisExpress = {
  id: number;
  nom: string;
  email: string;
  telephone: string;
  entreprise: string | null;
  besoin: string;
  budget: string | null;
  date_souhaitee: string | null;
  message: string | null;
  statut: "en_attente" | "traite" | "repondu" | "archive";
  date_creation: string;
  date_modification: string;
  created_at: string;
  updated_at: string;
};

const STATUT_LABELS: Record<string, string> = {
  en_attente: "En attente",
  traite: "Traité",
  repondu: "Répondu",
  archive: "Archivé",
};

const STATUT_STYLES: Record<string, string> = {
  en_attente: "bg-yellow-500/10 text-yellow-600 border-yellow-500/30",
  traite: "bg-green-500/10 text-green-600 border-green-500/30",
  repondu: "bg-blue-500/10 text-blue-600 border-blue-500/30",
  archive: "bg-gray-500/10 text-gray-600 border-gray-500/30",
};

const STATUT_ICONS: Record<string, JSX.Element> = {
  en_attente: <Clock className="h-3 w-3" />,
  traite: <CheckCircle className="h-3 w-3" />,
  repondu: <Send className="h-3 w-3" />,
  archive: <Archive className="h-3 w-3" />,
};

const AdminDevisExpress = () => {
  const [devis, setDevis] = useState<DevisExpress[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatut, setFilterStatut] = useState<string>("tous");
  const [selectedDevis, setSelectedDevis] = useState<DevisExpress | null>(null);
  const [showDetails, setShowDetails] = useState(false);
  const [actionLoading, setActionLoading] = useState<number | null>(null);

  useEffect(() => {
    fetchDevisExpress();
  }, []);

  const fetchDevisExpress = async () => {
    try {
      setIsLoading(true);
      const response = await api.get('/admin/devis-express');
      console.log("Réponse brute devis express:", response.data);
      
      let devisData: DevisExpress[] = [];
      
      // Adapter à la structure de votre API
      if (response.data.success && response.data.data) {
        // Si la réponse a une structure { success: true, data: { data: [...] } }
        if (response.data.data.data && Array.isArray(response.data.data.data)) {
          devisData = response.data.data.data;
        }
        // Si la réponse a une structure { success: true, data: [...] }
        else if (Array.isArray(response.data.data)) {
          devisData = response.data.data;
        }
        // Si la réponse a une structure { success: true, data: { items: [...] } }
        else if (response.data.data.items && Array.isArray(response.data.data.items)) {
          devisData = response.data.data.items;
        }
      }
      // Si la réponse est directement un tableau
      else if (Array.isArray(response.data)) {
        devisData = response.data;
      }
      // Si la réponse a une propriété data qui est un tableau
      else if (response.data.data && Array.isArray(response.data.data)) {
        devisData = response.data.data;
      }
      
      console.log("Devis express récupérés:", devisData);
      setDevis(devisData);
    } catch (error: any) {
      console.error("Erreur chargement devis express:", error);
      toast.error(error.response?.data?.message || "Impossible de charger les devis express");
    } finally {
      setIsLoading(false);
    }
  };

  const updateStatut = async (devisId: number, nouveauStatut: string) => {
    try {
      setActionLoading(devisId);
      const response = await api.put(`/admin/devis-express/${devisId}/statut`, { statut: nouveauStatut });
      
      if (response.data.success) {
        toast.success(`Devis marqué comme ${STATUT_LABELS[nouveauStatut].toLowerCase()}`);
        await fetchDevisExpress();
        if (showDetails && selectedDevis?.id === devisId) {
          setSelectedDevis({ ...selectedDevis, statut: nouveauStatut as any });
        }
      }
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Erreur lors de la mise à jour");
    } finally {
      setActionLoading(null);
    }
  };

  const deleteDevis = async (devisId: number) => {
    try {
      setActionLoading(devisId);
      const response = await api.delete(`/admin/devis-express/${devisId}`);
      
      if (response.data.success) {
        toast.success("Devis supprimé avec succès");
        await fetchDevisExpress();
        setShowDetails(false);
      }
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Erreur lors de la suppression");
    } finally {
      setActionLoading(null);
    }
  };

  const formatDate = (dateString: string | null) => {
    if (!dateString) return "-";
    const date = new Date(dateString);
    return date.toLocaleDateString("fr-FR", { day: "numeric", month: "long", year: "numeric" });
  };

  const devisFiltres = devis.filter(d => {
    const searchLower = searchTerm.toLowerCase();
    const bySearch = searchTerm === "" || 
      d.nom.toLowerCase().includes(searchLower) ||
      d.email.toLowerCase().includes(searchLower) ||
      d.telephone.includes(searchLower) ||
      (d.entreprise?.toLowerCase().includes(searchLower) || false) ||
      d.besoin.toLowerCase().includes(searchLower);
    
    const byStatut = filterStatut === "tous" || d.statut === filterStatut;
    
    return bySearch && byStatut;
  });

  const stats = {
    total: devis.length,
    enAttente: devis.filter(d => d.statut === "en_attente").length,
    traite: devis.filter(d => d.statut === "traite").length,
    repondu: devis.filter(d => d.statut === "repondu").length,
    archive: devis.filter(d => d.statut === "archive").length,
  };

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center py-20">
        <Loader2 className="h-12 w-12 animate-spin text-primary mb-4" />
        <p className="text-muted-foreground">Chargement des devis express...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Devis Express</h1>
          <p className="text-muted-foreground">Gérez les demandes de devis rapides</p>
        </div>
        <button
          onClick={fetchDevisExpress}
          className="inline-flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition"
        >
          <RefreshCcw className="h-4 w-4" />
          Actualiser
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-card border border-border rounded-xl p-4 text-center">
          <p className="text-2xl font-bold text-foreground">{stats.total}</p>
          <p className="text-xs text-muted-foreground">Total</p>
        </div>
        <div className="bg-card border border-border rounded-xl p-4 text-center">
          <p className="text-2xl font-bold text-yellow-600">{stats.enAttente}</p>
          <p className="text-xs text-muted-foreground">En attente</p>
        </div>
        <div className="bg-card border border-border rounded-xl p-4 text-center">
          <p className="text-2xl font-bold text-green-600">{stats.traite}</p>
          <p className="text-xs text-muted-foreground">Traités</p>
        </div>
        <div className="bg-card border border-border rounded-xl p-4 text-center">
          <p className="text-2xl font-bold text-gray-600">{stats.archive}</p>
          <p className="text-xs text-muted-foreground">Archivés</p>
        </div>
      </div>

      {/* Filtres */}
      <div className="flex flex-col md:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <input
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Rechercher par nom, email, téléphone, entreprise..."
            className="w-full pl-9 pr-3 py-2 rounded-lg border border-border bg-background"
          />
        </div>
        <div className="relative">
          <Filter className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <select
            value={filterStatut}
            onChange={(e) => setFilterStatut(e.target.value)}
            className="pl-9 pr-8 py-2 rounded-lg border border-border bg-background appearance-none"
          >
            <option value="tous">Tous les statuts</option>
            <option value="en_attente">En attente</option>
            <option value="traite">Traités</option>
            <option value="repondu">Répondu</option>
            <option value="archive">Archivés</option>
          </select>
        </div>
      </div>

      {/* Liste des devis */}
      {devisFiltres.length === 0 ? (
        <div className="bg-card border border-border rounded-2xl p-12 text-center">
          <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-foreground mb-2">Aucun devis trouvé</h3>
          <p className="text-muted-foreground">Aucun devis express ne correspond à votre recherche</p>
        </div>
      ) : (
        <div className="space-y-4">
          {devisFiltres.map((devisItem) => (
            <div
              key={devisItem.id}
              className="bg-card border border-border rounded-xl p-4 hover:shadow-md transition"
            >
              <div className="flex flex-wrap items-start justify-between gap-4">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-3 flex-wrap">
                    <p className="font-mono font-semibold text-foreground">#{devisItem.id}</p>
                    <span className={`inline-flex items-center gap-1 text-[10px] px-2 py-0.5 rounded-full font-medium border ${STATUT_STYLES[devisItem.statut]}`}>
                      {STATUT_ICONS[devisItem.statut]}
                      {STATUT_LABELS[devisItem.statut]}
                    </span>
                  </div>
                  <div className="flex items-center gap-4 mt-2 text-sm">
                    <span className="flex items-center gap-1 text-muted-foreground">
                      <User className="h-3.5 w-3.5" />
                      {devisItem.nom}
                    </span>
                    <span className="flex items-center gap-1 text-muted-foreground">
                      <Mail className="h-3.5 w-3.5" />
                      {devisItem.email}
                    </span>
                    <span className="flex items-center gap-1 text-muted-foreground">
                      <Phone className="h-3.5 w-3.5" />
                      {devisItem.telephone}
                    </span>
                    {devisItem.entreprise && (
                      <span className="flex items-center gap-1 text-muted-foreground">
                        <Building className="h-3.5 w-3.5" />
                        {devisItem.entreprise}
                      </span>
                    )}
                  </div>
                  <div className="mt-2">
                    <p className="text-sm text-muted-foreground line-clamp-2">
                      Besoin: {devisItem.besoin}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => {
                      setSelectedDevis(devisItem);
                      setShowDetails(true);
                    }}
                    className="p-1.5 rounded-lg text-muted-foreground hover:text-primary hover:bg-primary/10 transition"
                    title="Voir détails"
                  >
                    <Eye className="h-4 w-4" />
                  </button>
                  {devisItem.statut === "en_attente" && (
                    <button
                      onClick={() => updateStatut(devisItem.id, "traite")}
                      disabled={actionLoading === devisItem.id}
                      className="p-1.5 rounded-lg text-green-500 hover:bg-green-500/10 transition"
                      title="Marquer traité"
                    >
                      <CheckCircle className="h-4 w-4" />
                    </button>
                  )}
                  {devisItem.statut === "traite" && (
                    <button
                      onClick={() => updateStatut(devisItem.id, "repondu")}
                      disabled={actionLoading === devisItem.id}
                      className="p-1.5 rounded-lg text-blue-500 hover:bg-blue-500/10 transition"
                      title="Marquer répondu"
                    >
                      <Send className="h-4 w-4" />
                    </button>
                  )}
                  {devisItem.statut !== "archive" && (
                    <button
                      onClick={() => updateStatut(devisItem.id, "archive")}
                      disabled={actionLoading === devisItem.id}
                      className="p-1.5 rounded-lg text-gray-500 hover:bg-gray-500/10 transition"
                      title="Archiver"
                    >
                      <Archive className="h-4 w-4" />
                    </button>
                  )}
                  <button
                    onClick={() => deleteDevis(devisItem.id)}
                    disabled={actionLoading === devisItem.id}
                    className="p-1.5 rounded-lg text-red-500 hover:bg-red-500/10 transition"
                    title="Supprimer"
                  >
                    {actionLoading === devisItem.id ? <Loader2 className="h-4 w-4 animate-spin" /> : <Trash2 className="h-4 w-4" />}
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* MODAL DÉTAILS */}
      {showDetails && selectedDevis && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="bg-background border border-border rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-primary/10 rounded-xl">
                    <FileText className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <h2 className="font-bold text-lg text-foreground">Détail du devis</h2>
                    <p className="text-xs text-muted-foreground">#{selectedDevis.id}</p>
                  </div>
                </div>
                <button onClick={() => setShowDetails(false)} className="p-1.5 rounded-lg hover:bg-secondary transition">
                  <XCircle className="h-5 w-5 text-muted-foreground" />
                </button>
              </div>
              <div className="space-y-3 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Nom complet</span>
                  <span className="font-medium text-foreground">{selectedDevis.nom}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Email</span>
                  <span>{selectedDevis.email}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Téléphone</span>
                  <span>{selectedDevis.telephone}</span>
                </div>
                {selectedDevis.entreprise && (
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Entreprise</span>
                    <span>{selectedDevis.entreprise}</span>
                  </div>
                )}
                {selectedDevis.budget && (
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Budget</span>
                    <span>{selectedDevis.budget}</span>
                  </div>
                )}
                {selectedDevis.date_souhaitee && (
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Date souhaitée</span>
                    <span>{formatDate(selectedDevis.date_souhaitee)}</span>
                  </div>
                )}
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Date de création</span>
                  <span>{formatDate(selectedDevis.created_at || selectedDevis.date_creation)}</span>
                </div>
                <div className="border-t border-border pt-3">
                  <p className="text-muted-foreground mb-1">Besoin :</p>
                  <p className="text-foreground">{selectedDevis.besoin}</p>
                </div>
                {selectedDevis.message && (
                  <div className="border-t border-border pt-3">
                    <p className="text-muted-foreground mb-1">Message :</p>
                    <p className="text-foreground">{selectedDevis.message}</p>
                  </div>
                )}
              </div>
            </div>
            <div className="flex gap-3 px-6 py-4 border-t border-border">
              {selectedDevis.statut === "en_attente" && (
                <button
                  onClick={() => updateStatut(selectedDevis.id, "traite")}
                  className="flex-1 py-2 text-sm font-medium text-green-600 border border-green-600 rounded-lg hover:bg-green-600 hover:text-white transition"
                >
                  Marquer traité
                </button>
              )}
              {selectedDevis.statut === "traite" && (
                <button
                  onClick={() => updateStatut(selectedDevis.id, "repondu")}
                  className="flex-1 py-2 text-sm font-medium text-blue-600 border border-blue-600 rounded-lg hover:bg-blue-600 hover:text-white transition"
                >
                  Marquer répondu
                </button>
              )}
              {selectedDevis.statut !== "archive" && (
                <button
                  onClick={() => updateStatut(selectedDevis.id, "archive")}
                  className="flex-1 py-2 text-sm font-medium text-gray-600 border border-gray-600 rounded-lg hover:bg-gray-600 hover:text-white transition"
                >
                  Archiver
                </button>
              )}
              <button
                onClick={() => deleteDevis(selectedDevis.id)}
                className="flex-1 py-2 text-sm font-medium text-red-500 border border-red-500 rounded-lg hover:bg-red-500 hover:text-white transition"
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

export default AdminDevisExpress;