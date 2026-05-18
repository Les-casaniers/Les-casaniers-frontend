import { useState, useEffect } from "react";
import { 
  FileText, 
  Search, 
  Trash2, 
  Eye, 
  Download, 
  Loader2,
  Calendar,
  CreditCard,
  AlertCircle,
  XCircle
} from "lucide-react";
import { toast } from "sonner";
import api from "@/service/api";

type Facture = {
  id: number;
  commande_id: number;
  facture_ref: string;
  statut: "en_attente" | "payee" | "annulee";
  montant_total: number;
  devise: string;
  methode_paiement: string;
  date_emission: string;
  date_paiement: string | null;
  pdf_path: string | null;
  date_creation: string;
  commande?: {
    commande_uuid: string;
  };
};

const DashboardPaiement = () => {
  const [factures, setFactures] = useState<Facture[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [showDeleteAlert, setShowDeleteAlert] = useState(false);
  const [selectedFacture, setSelectedFacture] = useState<Facture | null>(null);
  const [deletingId, setDeletingId] = useState<number | null>(null);

  useEffect(() => {
    fetchFactures();
  }, []);

  const fetchFactures = async () => {
    try {
      setIsLoading(true);
      const response = await api.get('/factures');
      console.log("Factures récupérées:", response.data);
      
      let facturesData: Facture[] = [];
      if (response.data.data && Array.isArray(response.data.data)) {
        facturesData = response.data.data;
      } else if (Array.isArray(response.data)) {
        facturesData = response.data;
      } else {
        facturesData = [];
      }
      
      setFactures(facturesData);
    } catch (error: any) {
      console.error("Erreur chargement factures:", error);
      toast.error("Impossible de charger vos factures");
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async (facture: Facture) => {
    setSelectedFacture(facture);
    setShowDeleteAlert(true);
  };

  const confirmDelete = async () => {
    if (!selectedFacture) return;
    
    try {
      setDeletingId(selectedFacture.id);
      const response = await api.delete(`/factures/${selectedFacture.id}`);
      
      if (response.data.success) {
        toast.success(`Facture ${selectedFacture.facture_ref} supprimée`);
        await fetchFactures();
      } else {
        throw new Error(response.data.message);
      }
    } catch (error: any) {
      console.error("Erreur suppression:", error);
      toast.error(error.response?.data?.message || "Impossible de supprimer la facture");
    } finally {
      setDeletingId(null);
      setShowDeleteAlert(false);
      setSelectedFacture(null);
    }
  };

  const handleDownload = async (facture: Facture) => {
    try {
      const response = await api.get(`/factures/${facture.id}/download`, {
        responseType: 'blob'
      });
      
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `${facture.facture_ref}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
      
      toast.success("PDF téléchargé avec succès");
    } catch (error: any) {
      console.error("Erreur téléchargement:", error);
      toast.error("Impossible de télécharger le PDF");
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("fr-FR", { day: "numeric", month: "long", year: "numeric" });
  };

  const formatPrice = (prix: number, devise: string = 'MGA') => {
    return new Intl.NumberFormat('fr-FR').format(prix) + ` ${devise}`;
  };

  const getStatutStyle = (statut: string) => {
    if (statut === 'payee') {
      return "bg-green-500/10 text-green-600 dark:text-green-400 border-green-500/30";
    }
    return "bg-yellow-500/10 text-yellow-600 dark:text-yellow-400 border-yellow-500/30";
  };

  const getStatutLabel = (statut: string) => {
    return statut === 'payee' ? 'Payée' : 'En attente';
  };

  const facturesFiltrees = factures.filter(facture => {
    if (!searchTerm) return true;
    const searchLower = searchTerm.toLowerCase();
    return (
      facture.facture_ref.toLowerCase().includes(searchLower) ||
      facture.commande?.commande_uuid?.toLowerCase().includes(searchLower) ||
      formatDate(facture.date_emission).includes(searchLower)
    );
  });

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center py-20">
        <Loader2 className="h-12 w-12 animate-spin text-primary mb-4" />
        <p className="text-muted-foreground">Chargement de vos factures...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-foreground">Mes factures</h1>
        <p className="text-muted-foreground">Consultez et téléchargez vos factures</p>
      </div>

      {/* Recherche */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <input
          type="text"
          placeholder="Rechercher par numéro de facture, commande ou date..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full pl-9 pr-4 py-2 text-sm border border-border rounded-lg bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
        />
      </div>

      {/* Liste des factures */}
      {facturesFiltrees.length === 0 ? (
        <div className="bg-card border border-border rounded-2xl p-12 text-center">
          <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-foreground mb-2">Aucune facture trouvée</h3>
          <p className="text-muted-foreground">
            {searchTerm ? "Aucune facture ne correspond à votre recherche" : "Vous n'avez pas encore de facture"}
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {facturesFiltrees.map((facture) => (
            <div
              key={facture.id}
              className="bg-card border border-border rounded-xl p-4 hover:shadow-md transition"
            >
              <div className="flex flex-wrap items-start justify-between gap-4">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-3 flex-wrap">
                    <p className="font-mono font-semibold text-foreground">{facture.facture_ref}</p>
                    <span className={`inline-flex items-center gap-1 text-[10px] px-2 py-0.5 rounded-full font-medium border ${getStatutStyle(facture.statut)}`}>
                      {getStatutLabel(facture.statut)}
                    </span>
                  </div>
                  <div className="flex items-center gap-4 mt-2 text-sm">
                    <span className="flex items-center gap-1 text-muted-foreground">
                      <Calendar className="h-3.5 w-3.5" />
                      {formatDate(facture.date_emission)}
                    </span>
                    <span className="flex items-center gap-1 text-muted-foreground">
                      <CreditCard className="h-3.5 w-3.5" />
                      Commande: {facture.commande?.commande_uuid || 'N/A'}
                    </span>
                  </div>
                  <div className="mt-2">
                    <p className="text-sm text-muted-foreground">
                      Méthode de paiement: <span className="capitalize">{facture.methode_paiement}</span>
                    </p>
                  </div>
                </div>

                <div className="text-right">
                  <p className="text-xl font-bold text-foreground">{formatPrice(facture.montant_total, facture.devise)}</p>
                  <div className="flex items-center justify-end gap-2 mt-2">
                    <button
                      onClick={() => handleDownload(facture)}
                      className="inline-flex items-center gap-1 text-sm text-blue-500 hover:text-blue-600 transition"
                    >
                      <Download className="h-4 w-4" />
                      PDF
                    </button>
                    <button
                      onClick={() => handleDelete(facture)}
                      disabled={deletingId === facture.id}
                      className="inline-flex items-center gap-1 text-sm text-red-500 hover:text-red-600 transition"
                    >
                      {deletingId === facture.id ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <Trash2 className="h-4 w-4" />
                      )}
                      Supprimer
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* MODAL SUPPRESSION */}
      {showDeleteAlert && selectedFacture && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="bg-background border border-border rounded-2xl shadow-2xl w-full max-w-md">
            <div className="p-6 text-center">
              <div className="w-16 h-16 mx-auto mb-4 bg-destructive/10 rounded-full flex items-center justify-center">
                <AlertCircle className="h-8 w-8 text-destructive" />
              </div>
              <h3 className="text-xl font-bold text-foreground mb-2">Supprimer la facture</h3>
              <p className="text-muted-foreground">
                Facture <span className="font-semibold text-foreground">{selectedFacture.facture_ref}</span>
              </p>
              <p className="text-sm text-destructive mt-2">Cette action est irréversible.</p>
            </div>
            <div className="flex gap-3 p-6 pt-0">
              <button onClick={() => setShowDeleteAlert(false)} className="flex-1 px-4 py-2 text-sm font-medium text-muted-foreground border border-border rounded-xl hover:bg-secondary transition">
                Annuler
              </button>
              <button onClick={confirmDelete} className="flex-1 px-4 py-2 text-sm font-medium bg-destructive text-destructive-foreground rounded-xl hover:bg-destructive/90 transition">
                Supprimer
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DashboardPaiement;