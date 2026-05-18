import { useState, useEffect } from "react";
import { 
  Star, 
  Search, 
  Trash2, 
  Eye, 
  Loader2,
  Calendar,
  User,
  Package,
  CheckCircle,
  XCircle,
  RefreshCcw,
  AlertCircle,
  Filter
} from "lucide-react";
import { toast } from "sonner";
import api from "@/service/api";

type Avis = {
  id: number;
  produit_id: number;
  utilisateur_id: number;
  note: number;
  corps: string;
  publie: boolean;
  date_creation: string;
  date_modification: string;
  produit?: {
    id: number;
    nom: string;
    reference: string;
  };
  utilisateur?: {
    id: number;
    nom: string;
    prenom: string;
    email: string;
  };
};

const AdminAvis = () => {
  const [avis, setAvis] = useState<Avis[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterPublie, setFilterPublie] = useState<string>("tous");
  const [selectedAvis, setSelectedAvis] = useState<Avis | null>(null);
  const [showDetails, setShowDetails] = useState(false);
  const [actionLoading, setActionLoading] = useState<number | null>(null);

  useEffect(() => {
    fetchAvis();
  }, []);

  const fetchAvis = async () => {
    try {
      setIsLoading(true);
      const response = await api.get('/admin/avis');
      console.log("Avis récupérés:", response.data);
      
      let avisData: Avis[] = [];
      if (response.data.data && Array.isArray(response.data.data)) {
        avisData = response.data.data;
      } else if (Array.isArray(response.data)) {
        avisData = response.data;
      } else {
        avisData = [];
      }
      
      setAvis(avisData);
    } catch (error: any) {
      console.error("Erreur chargement avis:", error);
      toast.error(error.response?.data?.message || "Impossible de charger les avis");
    } finally {
      setIsLoading(false);
    }
  };

  const togglePublier = async (avisId: number, currentStatus: boolean) => {
    try {
      setActionLoading(avisId);
      const response = await api.put(`/admin/avis/${avisId}/publier`);
      
      if (response.data.success) {
        toast.success(currentStatus ? "Avis dépublié" : "Avis publié");
        await fetchAvis();
      }
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Erreur lors de la modification");
    } finally {
      setActionLoading(null);
    }
  };

  const deleteAvis = async (avisId: number) => {
    try {
      setActionLoading(avisId);
      const response = await api.delete(`/avis/${avisId}`);
      
      if (response.data.success) {
        toast.success("Avis supprimé avec succès");
        await fetchAvis();
        setShowDetails(false);
      }
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Erreur lors de la suppression");
    } finally {
      setActionLoading(null);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("fr-FR", { day: "numeric", month: "long", year: "numeric" });
  };

  const getNoteStars = (note: number) => {
    return Array(5).fill(0).map((_, i) => (
      <Star key={i} className={`h-3.5 w-3.5 ${i < note ? "fill-yellow-500 text-yellow-500" : "text-gray-300"}`} />
    ));
  };

  const avisFiltres = avis.filter(a => {
    const searchLower = searchTerm.toLowerCase();
    const bySearch = searchTerm === "" || 
      a.corps.toLowerCase().includes(searchLower) ||
      a.produit?.nom?.toLowerCase().includes(searchLower) ||
      a.utilisateur?.prenom?.toLowerCase().includes(searchLower) ||
      a.utilisateur?.nom?.toLowerCase().includes(searchLower);
    
    const byStatut = filterPublie === "tous" || 
      (filterPublie === "publie" && a.publie) ||
      (filterPublie === "non_publie" && !a.publie);
    
    return bySearch && byStatut;
  });

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center py-20">
        <Loader2 className="h-12 w-12 animate-spin text-primary mb-4" />
        <p className="text-muted-foreground">Chargement des avis...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Avis clients</h1>
          <p className="text-muted-foreground">Gérez les avis des clients sur les produits</p>
        </div>
        <button
          onClick={fetchAvis}
          className="inline-flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition"
        >
          <RefreshCcw className="h-4 w-4" />
          Actualiser
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4">
        <div className="bg-card border border-border rounded-xl p-4 text-center">
          <p className="text-2xl font-bold text-foreground">{avis.length}</p>
          <p className="text-xs text-muted-foreground">Total avis</p>
        </div>
        <div className="bg-card border border-border rounded-xl p-4 text-center">
          <p className="text-2xl font-bold text-green-600">{avis.filter(a => a.publie).length}</p>
          <p className="text-xs text-muted-foreground">Publiés</p>
        </div>
        <div className="bg-card border border-border rounded-xl p-4 text-center">
          <p className="text-2xl font-bold text-yellow-600">{avis.filter(a => !a.publie).length}</p>
          <p className="text-xs text-muted-foreground">En attente</p>
        </div>
      </div>

      {/* Filtres */}
      <div className="flex flex-col md:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <input
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Rechercher par produit, client, commentaire..."
            className="w-full pl-9 pr-3 py-2 rounded-lg border border-border bg-background"
          />
        </div>
        <div className="relative">
          <Filter className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <select
            value={filterPublie}
            onChange={(e) => setFilterPublie(e.target.value)}
            className="pl-9 pr-8 py-2 rounded-lg border border-border bg-background appearance-none"
          >
            <option value="tous">Tous les statuts</option>
            <option value="publie">Publiés</option>
            <option value="non_publie">Non publiés</option>
          </select>
        </div>
      </div>

      {/* Liste des avis */}
      {avisFiltres.length === 0 ? (
        <div className="bg-card border border-border rounded-2xl p-12 text-center">
          <Star className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-foreground mb-2">Aucun avis trouvé</h3>
          <p className="text-muted-foreground">Aucun avis ne correspond à votre recherche</p>
        </div>
      ) : (
        <div className="space-y-4">
          {avisFiltres.map((avisItem) => (
            <div
              key={avisItem.id}
              className="bg-card border border-border rounded-xl p-4 hover:shadow-md transition"
            >
              <div className="flex flex-wrap items-start justify-between gap-4">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-3 flex-wrap">
                    <div className="flex items-center gap-1">
                      {getNoteStars(avisItem.note)}
                      <span className="text-xs font-semibold ml-1">({avisItem.note}/5)</span>
                    </div>
                    <span className={`inline-flex items-center gap-1 text-[10px] px-2 py-0.5 rounded-full font-medium border ${
                      avisItem.publie 
                        ? "bg-green-500/10 text-green-600 border-green-500/30"
                        : "bg-yellow-500/10 text-yellow-600 border-yellow-500/30"
                    }`}>
                      {avisItem.publie ? <CheckCircle className="h-3 w-3" /> : <XCircle className="h-3 w-3" />}
                      {avisItem.publie ? "Publié" : "En attente"}
                    </span>
                  </div>
                  <div className="flex items-center gap-4 mt-2 text-sm">
                    <span className="flex items-center gap-1 text-muted-foreground">
                      <Package className="h-3.5 w-3.5" />
                      {avisItem.produit?.nom || "Produit inconnu"}
                    </span>
                    <span className="flex items-center gap-1 text-muted-foreground">
                      <User className="h-3.5 w-3.5" />
                      {avisItem.utilisateur?.prenom} {avisItem.utilisateur?.nom}
                    </span>
                    <span className="flex items-center gap-1 text-muted-foreground">
                      <Calendar className="h-3.5 w-3.5" />
                      {formatDate(avisItem.date_creation)}
                    </span>
                  </div>
                  <div className="mt-2">
                    <p className="text-sm text-muted-foreground line-clamp-2">
                      "{avisItem.corps}"
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => {
                      setSelectedAvis(avisItem);
                      setShowDetails(true);
                    }}
                    className="p-1.5 rounded-lg text-muted-foreground hover:text-primary hover:bg-primary/10 transition"
                    title="Voir détails"
                  >
                    <Eye className="h-4 w-4" />
                  </button>
                  <button
                    onClick={() => togglePublier(avisItem.id, avisItem.publie)}
                    disabled={actionLoading === avisItem.id}
                    className={`p-1.5 rounded-lg transition ${
                      avisItem.publie
                        ? "text-yellow-500 hover:bg-yellow-500/10"
                        : "text-green-500 hover:bg-green-500/10"
                    }`}
                    title={avisItem.publie ? "Dépublier" : "Publier"}
                  >
                    {actionLoading === avisItem.id ? <Loader2 className="h-4 w-4 animate-spin" /> : (
                      avisItem.publie ? <XCircle className="h-4 w-4" /> : <CheckCircle className="h-4 w-4" />
                    )}
                  </button>
                  <button
                    onClick={() => deleteAvis(avisItem.id)}
                    disabled={actionLoading === avisItem.id}
                    className="p-1.5 rounded-lg text-red-500 hover:bg-red-500/10 transition"
                    title="Supprimer"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* MODAL DÉTAILS */}
      {showDetails && selectedAvis && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="bg-background border border-border rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-primary/10 rounded-xl">
                    <Star className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <h2 className="font-bold text-lg text-foreground">Détail de l'avis</h2>
                    <p className="text-xs text-muted-foreground">Produit: {selectedAvis.produit?.nom}</p>
                  </div>
                </div>
                <button onClick={() => setShowDetails(false)} className="p-1.5 rounded-lg hover:bg-secondary transition">
                  <XCircle className="h-5 w-5 text-muted-foreground" />
                </button>
              </div>
              <div className="space-y-3 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Client</span>
                  <span className="font-medium text-foreground">{selectedAvis.utilisateur?.prenom} {selectedAvis.utilisateur?.nom}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Email</span>
                  <span>{selectedAvis.utilisateur?.email}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Note</span>
                  <div className="flex items-center gap-1">{getNoteStars(selectedAvis.note)}</div>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Date</span>
                  <span>{formatDate(selectedAvis.date_creation)}</span>
                </div>
                <div className="border-t border-border pt-3">
                  <p className="text-muted-foreground mb-1">Commentaire :</p>
                  <p className="text-foreground">{selectedAvis.corps}</p>
                </div>
              </div>
            </div>
            <div className="flex gap-3 px-6 py-4 border-t border-border">
              <button
                onClick={() => togglePublier(selectedAvis.id, selectedAvis.publie)}
                className={`flex-1 py-2 text-sm font-medium rounded-lg transition ${
                  selectedAvis.publie
                    ? "text-yellow-500 border border-yellow-500 hover:bg-yellow-500 hover:text-white"
                    : "text-green-500 border border-green-500 hover:bg-green-500 hover:text-white"
                }`}
              >
                {selectedAvis.publie ? "Dépublier" : "Publier"}
              </button>
              <button
                onClick={() => deleteAvis(selectedAvis.id)}
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

export default AdminAvis;