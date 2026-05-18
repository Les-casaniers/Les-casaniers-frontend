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
  XCircle,
  Send,
  DollarSign,
  RefreshCcw,
  CheckCircle,
  Clock
} from "lucide-react";
import { toast } from "sonner";
import api from "@/service/api";

type Facture = {
  id: number;
  commande_id: number;
  facture_ref: string;
  statut: "brouillon" | "emise" | "payee" | "annulee";
  montant_total: number;
  devise: string;
  methode_paiement: string | null;
  date_emission: string | null;
  date_paiement: string | null;
  pdf_path: string | null;
  date_creation: string;
  date_modification: string;
  commande?: {
    commande_uuid: string;
    utilisateur?: {
      id: number;
      nom: string;
      prenom: string;
      email: string;
    };
  };
};

const FACTURE_STATUS_LABELS: Record<string, string> = {
  brouillon: "Brouillon",
  emise: "Émise",
  payee: "Payée",
  annulee: "Annulée",
};

const getStatutStyle = (statut: string) => {
  const styles: Record<string, string> = {
    brouillon: "bg-gray-500/10 text-gray-600 dark:text-gray-400 border-gray-500/30",
    emise: "bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/30",
    payee: "bg-green-500/10 text-green-600 dark:text-green-400 border-green-500/30",
    annulee: "bg-red-500/10 text-red-600 dark:text-red-400 border-red-500/30",
  };
  return styles[statut] || styles.brouillon;
};

const getStatutIcon = (statut: string) => {
  switch (statut) {
    case "payee": return <CheckCircle className="h-3 w-3" />;
    case "emise": return <Send className="h-3 w-3" />;
    case "annulee": return <XCircle className="h-3 w-3" />;
    default: return <Clock className="h-3 w-3" />;
  }
};

const AdminFactures = () => {
  const [factures, setFactures] = useState<Facture[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedFacture, setSelectedFacture] = useState<Facture | null>(null);
  const [showDetails, setShowDetails] = useState(false);
  const [showDeleteAlert, setShowDeleteAlert] = useState(false);
  const [actionLoading, setActionLoading] = useState<number | null>(null);
  
  // Stats
  const [stats, setStats] = useState({
    total: 0,
    brouillon: 0,
    emises: 0,
    payees: 0,
    annulees: 0,
    montantTotal: 0,
  });

  // Payment modal
  const [payModal, setPayModal] = useState<Facture | null>(null);
  const [payMethod, setPayMethod] = useState("");

  useEffect(() => {
    fetchFactures();
  }, []);

  const fetchFactures = async () => {
    try {
      setIsLoading(true);
      const response = await api.get('/admin/factures');
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
      
      // Calculer les statistiques
      const statsData = {
        total: facturesData.length,
        brouillon: facturesData.filter(f => f.statut === "brouillon").length,
        emises: facturesData.filter(f => f.statut === "emise").length,
        payees: facturesData.filter(f => f.statut === "payee").length,
        annulees: facturesData.filter(f => f.statut === "annulee").length,
        montantTotal: facturesData.reduce((sum, f) => sum + (f.statut === "payee" ? f.montant_total : 0), 0),
      };
      setStats(statsData);
      
    } catch (error: any) {
      console.error("Erreur chargement factures:", error);
      toast.error(error.response?.data?.message || "Impossible de charger les factures");
    } finally {
      setIsLoading(false);
    }
  };

  const getClientName = (f: Facture) => {
    const u = f.commande?.utilisateur;
    return [u?.prenom, u?.nom].filter(Boolean).join(" ").trim() || "Client";
  };

  const emitFacture = async (id: number) => {
    try {
      setActionLoading(id);
      const response = await api.post(`/admin/factures/${id}/emettre`);
      if (response.data.success) {
        toast.success("Facture émise avec succès");
        await fetchFactures();
      }
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Erreur lors de l'émission");
    } finally {
      setActionLoading(null);
    }
  };

  const markAsPaid = async (id: number, methode?: string) => {
    try {
      setActionLoading(id);
      const response = await api.post(`/admin/factures/${id}/payer`, { methode });
      if (response.data.success) {
        toast.success("Facture marquée comme payée");
        await fetchFactures();
        setPayModal(null);
        setPayMethod("");
      }
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Erreur lors du paiement");
    } finally {
      setActionLoading(null);
    }
  };

  const cancelFacture = async (id: number) => {
    try {
      setActionLoading(id);
      const response = await api.post(`/admin/factures/${id}/annuler`);
      if (response.data.success) {
        toast.success("Facture annulée avec succès");
        await fetchFactures();
      }
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Erreur lors de l'annulation");
    } finally {
      setActionLoading(null);
    }
  };

  const deleteFacture = async (id: number) => {
    try {
      setActionLoading(id);
      const response = await api.delete(`/admin/factures/${id}`);
      if (response.data.success) {
        toast.success("Facture supprimée avec succès");
        await fetchFactures();
        setShowDeleteAlert(false);
        setSelectedFacture(null);
      }
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Erreur lors de la suppression");
    } finally {
      setActionLoading(null);
    }
  };

  const handleDownload = async (facture: Facture) => {
    try {
      const response = await api.get(`/admin/factures/${facture.id}/download`, {
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

  const formatDate = (dateString: string | null) => {
    if (!dateString) return "-";
    const date = new Date(dateString);
    return date.toLocaleDateString("fr-FR", { day: "numeric", month: "long", year: "numeric" });
  };

  const formatPrice = (prix: number, devise: string = 'MGA') => {
    return new Intl.NumberFormat('fr-FR').format(prix) + ` ${devise}`;
  };

  const facturesFiltrees = factures.filter(facture => {
    if (!searchTerm) return true;
    const searchLower = searchTerm.toLowerCase();
    const clientName = getClientName(facture).toLowerCase();
    return (
      facture.facture_ref.toLowerCase().includes(searchLower) ||
      clientName.includes(searchLower) ||
      facture.commande?.commande_uuid?.toLowerCase().includes(searchLower) ||
      facture.commande?.utilisateur?.email?.toLowerCase().includes(searchLower)
    );
  });

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center py-20">
        <Loader2 className="h-12 w-12 animate-spin text-primary mb-4" />
        <p className="text-muted-foreground">Chargement des factures...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Gestion des factures</h1>
          <p className="text-muted-foreground">Gérez les factures des clients</p>
        </div>
        <button
          onClick={fetchFactures}
          className="inline-flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition"
        >
          <RefreshCcw className="h-4 w-4" />
          Actualiser
        </button>
      </div>

      {/* Statistiques */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        <div className="bg-card border border-border rounded-xl p-4 text-center">
          <p className="text-2xl font-bold text-foreground">{stats.total}</p>
          <p className="text-xs text-muted-foreground">Total</p>
        </div>
        <div className="bg-card border border-border rounded-xl p-4 text-center">
          <p className="text-2xl font-bold text-gray-600">{stats.brouillon}</p>
          <p className="text-xs text-muted-foreground">Brouillons</p>
        </div>
        <div className="bg-card border border-border rounded-xl p-4 text-center">
          <p className="text-2xl font-bold text-blue-600">{stats.emises}</p>
          <p className="text-xs text-muted-foreground">Émises</p>
        </div>
        <div className="bg-card border border-border rounded-xl p-4 text-center">
          <p className="text-2xl font-bold text-green-600">{stats.payees}</p>
          <p className="text-xs text-muted-foreground">Payées</p>
        </div>
        <div className="bg-card border border-border rounded-xl p-4 text-center">
          <p className="text-2xl font-bold text-red-600">{stats.annulees}</p>
          <p className="text-xs text-muted-foreground">Annulées</p>
        </div>
        <div className="bg-card border border-border rounded-xl p-4 text-center">
          <p className="text-2xl font-bold text-primary">{(stats.montantTotal / 1000).toFixed(0)}K</p>
          <p className="text-xs text-muted-foreground">CA facturé</p>
        </div>
      </div>

      {/* Recherche */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <input
          type="text"
          placeholder="Rechercher par numéro de facture, commande, client..."
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
            {searchTerm ? "Aucune facture ne correspond à votre recherche" : "Aucune facture pour le moment"}
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
                {/* Infos gauche */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-3 flex-wrap">
                    <p className="font-mono font-semibold text-foreground">{facture.facture_ref}</p>
                    <span className={`inline-flex items-center gap-1 text-[10px] px-2 py-0.5 rounded-full font-medium border ${getStatutStyle(facture.statut)}`}>
                      {getStatutIcon(facture.statut)}
                      {FACTURE_STATUS_LABELS[facture.statut]}
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
                      Client: <span className="font-medium text-foreground">{getClientName(facture)}</span>
                      {facture.commande?.utilisateur?.email && (
                        <span className="text-xs ml-2">({facture.commande.utilisateur.email})</span>
                      )}
                    </p>
                  </div>
                  {facture.methode_paiement && (
                    <div className="mt-1">
                      <p className="text-xs text-muted-foreground">
                        Méthode de paiement: <span className="capitalize">{facture.methode_paiement}</span>
                      </p>
                    </div>
                  )}
                </div>

                {/* Infos droite */}
                <div className="text-right">
                  <p className="text-xl font-bold text-foreground">{formatPrice(facture.montant_total, facture.devise)}</p>
                  <div className="flex items-center justify-end gap-2 mt-2">
                    <button
                      onClick={() => {
                        setSelectedFacture(facture);
                        setShowDetails(true);
                      }}
                      className="p-1.5 rounded-lg text-muted-foreground hover:text-primary hover:bg-primary/10 transition"
                      title="Détails"
                    >
                      <Eye className="h-4 w-4" />
                    </button>
                    
                    {facture.statut === "brouillon" && (
                      <button
                        onClick={() => emitFacture(facture.id)}
                        disabled={actionLoading === facture.id}
                        className="p-1.5 rounded-lg text-blue-500 hover:bg-blue-500/10 transition"
                        title="Émettre"
                      >
                        {actionLoading === facture.id ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
                      </button>
                    )}
                    
                    {facture.statut === "emise" && (
                      <button
                        onClick={() => { setPayModal(facture); setPayMethod(""); }}
                        className="p-1.5 rounded-lg text-green-500 hover:bg-green-500/10 transition"
                        title="Marquer payée"
                      >
                        <DollarSign className="h-4 w-4" />
                      </button>
                    )}
                    
                    {(facture.statut === "brouillon" || facture.statut === "emise") && (
                      <button
                        onClick={() => cancelFacture(facture.id)}
                        disabled={actionLoading === facture.id}
                        className="p-1.5 rounded-lg text-orange-500 hover:bg-orange-500/10 transition"
                        title="Annuler"
                      >
                        <XCircle className="h-4 w-4" />
                      </button>
                    )}
                    
                    {(facture.statut === "annulee" || facture.statut === "payee") && (
                      <button
                        onClick={() => {
                          setSelectedFacture(facture);
                          setShowDeleteAlert(true);
                        }}
                        disabled={actionLoading === facture.id}
                        className="p-1.5 rounded-lg text-red-500 hover:bg-red-500/10 transition"
                        title="Supprimer"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    )}
                    
                    {facture.statut !== "brouillon" && (
                      <button
                        onClick={() => handleDownload(facture)}
                        className="p-1.5 rounded-lg text-muted-foreground hover:text-primary hover:bg-primary/10 transition"
                        title="Télécharger PDF"
                      >
                        <Download className="h-4 w-4" />
                      </button>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* MODAL DÉTAILS FACTURE */}
      {showDetails && selectedFacture && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="bg-background border border-border rounded-2xl shadow-2xl w-full max-w-md max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-primary/10 rounded-xl">
                    <FileText className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <h2 className="font-bold text-lg text-foreground">Facture {selectedFacture.facture_ref}</h2>
                    <p className="text-xs text-muted-foreground">Commande: {selectedFacture.commande?.commande_uuid?.slice(0, 8) ?? "-"}...</p>
                  </div>
                </div>
                <button onClick={() => setShowDetails(false)} className="p-1.5 rounded-lg hover:bg-secondary transition">
                  <XCircle className="h-5 w-5 text-muted-foreground" />
                </button>
              </div>
              <div className="space-y-3 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Client</span>
                  <span className="font-medium text-foreground">{getClientName(selectedFacture)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Email</span>
                  <span className="text-foreground">{selectedFacture.commande?.utilisateur?.email ?? "-"}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Montant</span>
                  <span className="font-bold text-lg text-primary">{formatPrice(selectedFacture.montant_total, selectedFacture.devise)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Date émission</span>
                  <span>{formatDate(selectedFacture.date_emission)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Date paiement</span>
                  <span>{formatDate(selectedFacture.date_paiement)}</span>
                </div>
                {selectedFacture.methode_paiement && (
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Méthode</span>
                    <span className="capitalize">{selectedFacture.methode_paiement}</span>
                  </div>
                )}
                <div className="flex justify-between items-center">
                  <span className="text-muted-foreground">Statut</span>
                  <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border ${getStatutStyle(selectedFacture.statut)}`}>
                    {getStatutIcon(selectedFacture.statut)}
                    {FACTURE_STATUS_LABELS[selectedFacture.statut]}
                  </span>
                </div>
              </div>
            </div>
            <div className="flex gap-3 px-6 py-4 border-t border-border">
              {selectedFacture.statut !== "brouillon" && (
                <button
                  onClick={() => handleDownload(selectedFacture)}
                  className="flex-1 py-2 text-sm font-medium text-primary border border-primary rounded-lg hover:bg-primary hover:text-white transition"
                >
                  <Download className="h-4 w-4 inline mr-2" />
                  Télécharger PDF
                </button>
              )}
              <button onClick={() => setShowDetails(false)} className="flex-1 py-2 text-sm font-medium border border-border rounded-lg hover:bg-secondary transition">
                Fermer
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL PAIEMENT */}
      {payModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="bg-background border border-border rounded-2xl shadow-2xl w-full max-w-md">
            <div className="p-6 space-y-4">
              <h3 className="font-bold text-lg text-foreground">Marquer comme payée</h3>
              <p className="text-sm text-muted-foreground">
                Facture <span className="font-semibold text-foreground">{payModal.facture_ref}</span> — 
                <span className="font-bold ml-1">{formatPrice(payModal.montant_total, payModal.devise)}</span>
              </p>
              <input
                value={payMethod}
                onChange={(e) => setPayMethod(e.target.value)}
                placeholder="Méthode de paiement (ex: Virement, Espèces, Carte...)"
                className="w-full px-3 py-2 rounded-lg border border-border bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
              />
              <div className="flex gap-3">
                <button onClick={() => setPayModal(null)} className="flex-1 px-4 py-2 text-sm border border-border rounded-xl hover:bg-secondary transition">
                  Annuler
                </button>
                <button 
                  onClick={() => markAsPaid(payModal.id, payMethod || undefined)} 
                  disabled={actionLoading === payModal.id}
                  className="flex-1 px-4 py-2 text-sm bg-green-600 text-white rounded-xl hover:bg-green-700 transition flex items-center justify-center gap-2"
                >
                  {actionLoading === payModal.id ? <Loader2 className="h-4 w-4 animate-spin" /> : <DollarSign className="h-4 w-4" />}
                  Confirmer le paiement
                </button>
              </div>
            </div>
          </div>
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
              <button onClick={() => setShowDeleteAlert(false)} className="flex-1 px-4 py-2 text-sm font-medium border border-border rounded-xl hover:bg-secondary transition">
                Annuler
              </button>
              <button 
                onClick={() => deleteFacture(selectedFacture.id)} 
                disabled={actionLoading === selectedFacture.id}
                className="flex-1 px-4 py-2 text-sm font-medium bg-destructive text-destructive-foreground rounded-xl hover:bg-destructive/90 transition flex items-center justify-center gap-2"
              >
                {actionLoading === selectedFacture.id ? <Loader2 className="h-4 w-4 animate-spin" /> : <Trash2 className="h-4 w-4" />}
                Supprimer
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminFactures;