import { useState, useEffect } from "react";
import { 
  Package, 
  Clock, 
  CheckCircle, 
  XCircle, 
  Eye, 
  ChevronRight, 
  Search, 
  Filter, 
  Calendar, 
  Loader2, 
  Trash2, 
  AlertCircle,
  CreditCard,
  Check,
  Lock,
  Smartphone,
  X
} from "lucide-react";
import { Link } from "react-router-dom";
import api from "@/service/api";
import { toast } from "@/hooks/use-toast";
import fosa from "@/assets/casaniers-mascot.png";

// ✅ CORRECTION 1 : Ajouter 'en_preparation' et 'payee' au type
type StatutCommande = "en_attente" | "payee" | "en_traitement" | "expediee" | "terminee" | "annulee";

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
  panier_id: number | null;
  devis_id: number | null;
  statut: StatutCommande;
  sous_total: number;
  livraison: number;
  total: number;
  devise: string;
  adresse_expedition_id: number | null;
  adresse_facturation_id: number | null;
  produit_id: number | null;
  titre: string;
  reference: string;
  prix_unitaire: number;
  quantite: number;
  meta_json: string | null;
  date_creation: string;
  date_modification: string;
  produits?: ProduitCommande[];
};

// ✅ CORRECTION 2 : Mapping correct des statuts
const getStatutLabel = (statut: StatutCommande): string => {
  const map: Record<StatutCommande, string> = {
    "en_attente": "En attente",
    "payee": "Payée",
    "en_traitement": "En préparation",
    "expediee": "Expédiée",
    "terminee": "Livrée",
    "annulee": "Annulée"
  };
  return map[statut] || statut;
};

// ✅ CORRECTION 3 : Styles corrects pour tous les statuts
const getStatutStyle = (statut: StatutCommande) => {
  const styles: Record<StatutCommande, string> = {
    "en_attente": "bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/30",
    "payee": "bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/30",
    "en_traitement": "bg-purple-500/10 text-purple-600 dark:text-purple-400 border-purple-500/30",
    "expediee": "bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border-indigo-500/30",
    "terminee": "bg-green-500/10 text-green-600 dark:text-green-400 border-green-500/30",
    "annulee": "bg-red-500/10 text-red-600 dark:text-red-400 border-red-500/30",
  };
  return styles[statut] || styles["en_attente"];
};

const getStatutIcone = (statut: StatutCommande) => {
  switch (statut) {
    case "terminee": return <CheckCircle className="h-3 w-3" />;
    case "annulee": return <XCircle className="h-3 w-3" />;
    case "payee": return <CheckCircle className="h-3 w-3" />;
    default: return <Clock className="h-3 w-3" />;
  }
};

// ✅ CORRECTION 4 : canCancel avec les bons statuts
const canCancel = (statut: StatutCommande): boolean => {
  return ["en_attente", "en_traitement", "payee"].includes(statut);
};

const DashboardCommandes = () => {
  const [commandes, setCommandes] = useState<Commande[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filtre, setFiltre] = useState<"toutes" | StatutCommande>("toutes");
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCommande, setSelectedCommande] = useState<Commande | null>(null);
  const [showDetails, setShowDetails] = useState(false);
  const [cancellingId, setCancellingId] = useState<number | null>(null);

  const [payingId, setPayingId] = useState<number | null>(null);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [selectedCommandeForPayment, setSelectedCommandeForPayment] = useState<Commande | null>(null);
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState<string>("");
  const [paymentInProgress, setPaymentInProgress] = useState(false);

  useEffect(() => {
    fetchCommandes();
  }, []);

  const paymentMethods = [
    { id: "carte", name: "Carte Bancaire", icon: <CreditCard className="h-5 w-5" />, bgColor: "bg-blue-500/10", textColor: "text-blue-600" },
    { id: "mvola", name: "MVola", icon: <Smartphone className="h-5 w-5" />, bgColor: "bg-purple-500/10", textColor: "text-purple-600" },
    { id: "airtel", name: "Airtel Money", icon: <Smartphone className="h-5 w-5" />, bgColor: "bg-red-500/10", textColor: "text-red-600" },
    { id: "orange_money", name: "Orange Money", icon: <Smartphone className="h-5 w-5" />, bgColor: "bg-orange-500/10", textColor: "text-orange-600" },
  ];

  const handlePayer = async (commande: Commande) => {
    setSelectedCommandeForPayment(commande);
    setSelectedPaymentMethod("");
    setShowPaymentModal(true);
  };

  const confirmPayment = async () => {
    if (!selectedPaymentMethod) {
      toast({ title: "Erreur", description: "Veuillez choisir un moyen de paiement", variant: "destructive" });
      return;
    }

    try {
      setPaymentInProgress(true);
      
      const factureResponse = await api.post('/factures/generate', {
        commande_uuid: selectedCommandeForPayment?.commande_uuid,
        methode_paiement: selectedPaymentMethod
      });
      
      if (factureResponse.data.success) {
        const factureId = factureResponse.data.data.id;
        await api.post(`/factures/${factureId}/pay`);
        
        toast({ 
          title: "✅ Paiement réussi !", 
          description: `Votre commande ${selectedCommandeForPayment?.commande_uuid} a été payée avec succès.`,
          duration: 5000
        });
        
        setShowPaymentModal(false);
        await fetchCommandes();
      }
      
    } catch (error: any) {
      console.error("Erreur paiement:", error);
      toast({ 
        title: "Erreur de paiement", 
        description: error.response?.data?.message || "Une erreur est survenue",
        variant: "destructive"
      });
    } finally {
      setPaymentInProgress(false);
    }
  };

  const fetchCommandes = async () => {
    try {
      setIsLoading(true);
      const response = await api.get('/commandes');
      console.log("Commandes récupérées (brutes):", response.data);
      
      let commandesData: Commande[] = [];
      if (response.data.data && Array.isArray(response.data.data)) {
        commandesData = response.data.data;
      } else if (Array.isArray(response.data)) {
        commandesData = response.data;
      } else if (response.data.items && Array.isArray(response.data.items)) {
        commandesData = response.data.items;
      } else {
        commandesData = [];
      }
      
      const commandesMap = new Map<string, Commande>();
      
      commandesData.forEach(cmd => {
        let produitsFromMeta: ProduitCommande[] = [];
        if (cmd.meta_json) {
          try {
            const meta = typeof cmd.meta_json === 'string' ? JSON.parse(cmd.meta_json) : cmd.meta_json;
            if (meta.produits && Array.isArray(meta.produits)) {
              produitsFromMeta = meta.produits;
            } else if (meta.items && Array.isArray(meta.items)) {
              produitsFromMeta = meta.items;
            }
          } catch (e) {
            console.error("Erreur parsing meta_json:", e);
          }
        }
        
        if (produitsFromMeta.length === 0 && cmd.titre) {
          produitsFromMeta = [{
            id: cmd.produit_id || 0,
            nom: cmd.titre,
            quantite: cmd.quantite || 1,
            prix_unitaire: cmd.prix_unitaire || 0,
            sous_total: (cmd.prix_unitaire || 0) * (cmd.quantite || 1)
          }];
        }
        
        if (commandesMap.has(cmd.commande_uuid)) {
          const existingCommande = commandesMap.get(cmd.commande_uuid)!;
          const existingProduits = existingCommande.produits || [];
          
          const produitsMap = new Map<string, ProduitCommande>();
          existingProduits.forEach(p => {
            produitsMap.set(p.nom, p);
          });
          
          produitsFromMeta.forEach(produit => {
            if (!produitsMap.has(produit.nom)) {
              produitsMap.set(produit.nom, produit);
            }
          });
          
          const produitsUniques = Array.from(produitsMap.values());
          const quantiteTotale = produitsUniques.reduce((sum, p) => sum + p.quantite, 0);
          
          commandesMap.set(cmd.commande_uuid, {
            ...existingCommande,
            produits: produitsUniques,
            quantite: quantiteTotale,
            sous_total: existingCommande.sous_total,
            livraison: existingCommande.livraison,
            total: existingCommande.total,
          });
        } else {
          const produitsMap = new Map<string, ProduitCommande>();
          produitsFromMeta.forEach(produit => {
            if (!produitsMap.has(produit.nom)) {
              produitsMap.set(produit.nom, produit);
            }
          });
          
          const produitsUniques = Array.from(produitsMap.values());
          const quantiteTotale = produitsUniques.reduce((sum, p) => sum + p.quantite, 0);
          
          commandesMap.set(cmd.commande_uuid, {
            ...cmd,
            produits: produitsUniques,
            quantite: quantiteTotale,
            sous_total: cmd.sous_total,
            livraison: cmd.livraison,
            total: cmd.total,
          });
        }
      });
      
      let commandesGrouped = Array.from(commandesMap.values());
      commandesGrouped.sort((a, b) => 
        new Date(b.date_creation).getTime() - new Date(a.date_creation).getTime()
      );
      
      console.log("Commandes groupées:", commandesGrouped);
      setCommandes(commandesGrouped);
      
    } catch (error: any) {
      console.error("Erreur chargement commandes:", error);
      toast({ 
        title: "Erreur", 
        description: "Impossible de charger vos commandes",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancelCommande = async (commande: Commande) => {
    if (!canCancel(commande.statut)) {
      toast({ 
        title: "Impossible", 
        description: "Cette commande ne peut plus être annulée",
        variant: "destructive"
      });
      return;
    }
    
    try {
      setCancellingId(commande.id);
      const response = await api.post(`/commandes/${commande.commande_uuid}/cancel`);
      
      if (response.data.success) {
        toast({ 
          title: "Commande annulée", 
          description: `La commande ${commande.commande_uuid} a été annulée avec succès`,
        });
        await fetchCommandes();
        if (showDetails && selectedCommande?.id === commande.id) {
          setShowDetails(false);
        }
      } else {
        throw new Error(response.data.message || "Erreur lors de l'annulation");
      }
    } catch (error: any) {
      console.error("Erreur annulation:", error);
      toast({ 
        title: "Erreur", 
        description: error.response?.data?.message || "Impossible d'annuler la commande",
        variant: "destructive"
      });
    } finally {
      setCancellingId(null);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("fr-FR", { day: "numeric", month: "long", year: "numeric" });
  };

  const formatPrice = (prix: number, devise: string = 'MGA') => {
    return new Intl.NumberFormat('fr-FR').format(prix) + ` ${devise}`;
  };

  // ✅ CORRECTION 5 : Statistiques avec les bons statuts
  const stats = {
    total: commandes.length,
    livrees: commandes.filter(c => c.statut === "terminee").length,
    enCours: commandes.filter(c => ["en_traitement", "expediee", "en_attente"].includes(c.statut)).length,
    annulees: commandes.filter(c => c.statut === "annulee").length,
  };

  // ✅ CORRECTION 6 : Liste des filtres avec les bons statuts
  const commandesFiltrees = commandes.filter(cmd => {
    if (filtre !== "toutes" && cmd.statut !== filtre) return false;
    if (searchTerm && !cmd.commande_uuid.toLowerCase().includes(searchTerm.toLowerCase())) return false;
    return true;
  });

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center py-20">
        <Loader2 className="h-12 w-12 animate-spin text-primary mb-4" />
        <p className="text-muted-foreground">Chargement de vos commandes...</p>
      </div>
    );
  }

  if (commandes.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12">
        <div className="relative bg-card border border-border rounded-3xl p-12 text-center max-w-md mx-auto">
          <img src={fosa} alt="Le Fosa" className="h-28 w-28 mx-auto mb-4 animate-float" />
          <h2 className="text-2xl font-bold text-foreground mb-3">Aucune commande pour le moment</h2>
          <p className="text-muted-foreground mb-6">
            Vous n'avez pas encore passé de commande.<br />
            Explorez notre catalogue et trouvez votre bonheur !
          </p>
          <Link
            to="/catalogue"
            className="inline-flex items-center gap-2 px-6 py-3 bg-primary text-primary-foreground rounded-xl hover:bg-primary/90 transition font-medium"
          >
            Explorer le catalogue
            <ChevronRight className="h-4 w-4" />
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* En-tête */}
      <div>
        <h1 className="text-2xl font-bold text-foreground">Mes commandes</h1>
        <p className="text-muted-foreground">Consultez l'historique et le suivi de vos commandes</p>
      </div>

      {/* Statistiques */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-card border border-border rounded-xl p-4">
          <div className="w-10 h-10 bg-secondary rounded-lg flex items-center justify-center mb-3">
            <Package className="h-5 w-5 text-foreground" />
          </div>
          <p className="text-2xl font-bold text-foreground">{stats.total}</p>
          <p className="text-sm text-muted-foreground">Total commandes</p>
        </div>
        <div className="bg-card border border-border rounded-xl p-4">
          <div className="w-10 h-10 bg-green-100 dark:bg-green-900/30 rounded-lg flex items-center justify-center mb-3">
            <CheckCircle className="h-5 w-5 text-green-600 dark:text-green-400" />
          </div>
          <p className="text-2xl font-bold text-foreground">{stats.livrees}</p>
          <p className="text-sm text-muted-foreground">Commandes livrées</p>
        </div>
        <div className="bg-card border border-border rounded-xl p-4">
          <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900/30 rounded-lg flex items-center justify-center mb-3">
            <Clock className="h-5 w-5 text-blue-600 dark:text-blue-400" />
          </div>
          <p className="text-2xl font-bold text-foreground">{stats.enCours}</p>
          <p className="text-sm text-muted-foreground">En cours</p>
        </div>
        <div className="bg-card border border-border rounded-xl p-4">
          <div className="w-10 h-10 bg-red-100 dark:bg-red-900/30 rounded-lg flex items-center justify-center mb-3">
            <XCircle className="h-5 w-5 text-red-600 dark:text-red-400" />
          </div>
          <p className="text-2xl font-bold text-foreground">{stats.annulees}</p>
          <p className="text-sm text-muted-foreground">Commandes annulées</p>
        </div>
      </div>

      {/* Filtres et recherche - ✅ CORRECTION 7 : Utiliser les bons statuts */}
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
        <div className="flex flex-wrap items-center gap-2">
          <Filter className="h-4 w-4 text-muted-foreground" />
          {["toutes", "en_attente", "payee", "en_traitement", "expediee", "terminee", "annulee"].map((f) => (
            <button
              key={f}
              onClick={() => setFiltre(f as typeof filtre)}
              className={`px-3 py-1.5 text-xs font-medium rounded-lg transition ${
                filtre === f
                  ? "bg-primary text-primary-foreground"
                  : "bg-secondary text-muted-foreground hover:bg-secondary/80"
              }`}
            >
              {getStatutLabel(f as StatutCommande)}
            </button>
          ))}
        </div>
        <div className="relative w-full sm:w-64">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <input
            type="text"
            placeholder="Rechercher une commande..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-4 py-2 text-sm border border-border rounded-lg bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
          />
        </div>
      </div>

      {/* Liste des commandes */}
      {commandesFiltrees.length === 0 ? (
        <div className="bg-card border border-border rounded-xl p-12 text-center">
          <Package className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-foreground mb-2">Aucune commande trouvée</h3>
          <p className="text-muted-foreground">
            {searchTerm ? "Aucune commande ne correspond à votre recherche" : "Aucune commande dans cette catégorie"}
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {commandesFiltrees.map((commande) => (
            <div
              key={commande.id}
              className="bg-card border border-border rounded-xl p-4 hover:shadow-md transition"
            >
              <div className="flex flex-wrap items-start justify-between gap-4">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-3 flex-wrap">
                    <p className="font-mono font-semibold text-foreground">{commande.commande_uuid}</p>
                    <span className={`inline-flex items-center gap-1 text-[10px] px-2 py-0.5 rounded-full font-medium border ${getStatutStyle(commande.statut)}`}>
                      {getStatutIcone(commande.statut)}
                      {getStatutLabel(commande.statut)}
                    </span>

                    {commande.statut === 'en_attente' && (
                      <button
                        onClick={() => handlePayer(commande)}
                        className="inline-flex items-center gap-1 text-[10px] px-2 py-0.5 rounded-full font-medium border border-green-500/30 text-green-500 hover:bg-green-500 hover:text-white transition"
                      >
                        <CreditCard className="h-3 w-3" />
                        Payer
                      </button>
                    )}

                    {commande.statut === 'payee' && (
                      <span className="inline-flex items-center gap-1 text-[10px] px-2 py-0.5 rounded-full font-medium border border-green-500/30 bg-green-500/10 text-green-600 dark:text-green-400">
                        <CheckCircle className="h-3 w-3" />
                        Payée
                      </span>
                    )}
                    
                    {canCancel(commande.statut) && (
                      <button
                        onClick={() => handleCancelCommande(commande)}
                        disabled={cancellingId === commande.id}
                        className="inline-flex items-center gap-1 text-[10px] px-2 py-0.5 rounded-full font-medium border border-red-500/30 text-red-500 hover:bg-red-500 hover:text-white transition"
                      >
                        {cancellingId === commande.id ? (
                          <Loader2 className="h-3 w-3 animate-spin" />
                        ) : (
                          <Trash2 className="h-3 w-3" />
                        )}
                        Annuler
                      </button>
                    )}
                  </div>
                  
                  <div className="flex items-center gap-4 mt-2 text-sm">
                    <span className="flex items-center gap-1 text-muted-foreground">
                      <Calendar className="h-3.5 w-3.5" />
                      {formatDate(commande.date_creation)}
                    </span>
                    <span className="text-muted-foreground">
                      {commande.quantite} article{commande.quantite > 1 ? "s" : ""}
                    </span>
                  </div>
                  
                  <div className="mt-2">
                    <p className="text-sm text-muted-foreground line-clamp-2">
                      {commande.produits && commande.produits.length > 0 ? (
                        commande.produits.map((p, idx) => (
                          <span key={idx}>
                            {p.nom} <span className="font-medium text-foreground">({p.quantite})</span>
                            {idx < commande.produits.length - 1 && ", "}
                          </span>
                        ))
                      ) : (
                        commande.titre || "Produit"
                      )}
                    </p>
                  </div>
                </div>

                <div className="text-right">
                  <p className="text-xl font-bold text-foreground">{formatPrice(commande.total, commande.devise)}</p>
                  <button
                    onClick={() => {
                      setSelectedCommande(commande);
                      setShowDetails(true);
                    }}
                    className="inline-flex items-center gap-1 mt-2 text-sm text-muted-foreground hover:text-primary transition"
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

      {/* //Modal concernant la validation de commande */}
      {/* MODAL PAIEMENT */}
      {showPaymentModal && selectedCommandeForPayment && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="bg-background border border-border rounded-2xl shadow-2xl w-full max-w-md max-h-[90vh] flex flex-col">
            <div className="flex items-center justify-between px-6 py-4 border-b border-border">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-primary/10 rounded-xl">
                  <CreditCard className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-foreground">Paiement</h2>
                  <p className="text-xs text-muted-foreground font-mono">{selectedCommandeForPayment.commande_uuid}</p>
                </div>
              </div>
              <button onClick={() => setShowPaymentModal(false)} className="p-1.5 rounded-lg hover:bg-secondary transition">
                <XCircle className="h-5 w-5 text-muted-foreground" />
              </button>
            </div>

            <div className="p-6 space-y-5">
              {/* Montant */}
              <div className="bg-secondary/30 rounded-xl p-4 text-center">
                <p className="text-sm text-muted-foreground mb-1">Montant à payer</p>
                <p className="text-3xl font-bold text-foreground">{formatPrice(selectedCommandeForPayment.total, selectedCommandeForPayment.devise)}</p>
              </div>

              {/* Moyens de paiement */}
              <div>
                <p className="text-sm font-medium text-foreground mb-3">Choisissez votre moyen de paiement</p>
                <div className="space-y-2">
                  {paymentMethods.map((method) => (
                    <button
                      key={method.id}
                      onClick={() => setSelectedPaymentMethod(method.id)}
                      className={`w-full flex items-center gap-3 p-3 rounded-xl border transition-all ${
                        selectedPaymentMethod === method.id
                          ? "border-primary bg-primary/10"
                          : "border-border hover:border-primary/50"
                      }`}
                    >
                      <div className={`p-2 rounded-lg ${method.bgColor} ${method.textColor}`}>
                        {method.icon}
                      </div>
                      <span className="flex-1 text-left font-medium text-foreground">{method.name}</span>
                      {selectedPaymentMethod === method.id && (
                        <CheckCircle className="h-5 w-5 text-primary" />
                      )}
                    </button>
                  ))}
                </div>
              </div>

              {/* Sécurité */}
              <div className="flex items-center gap-2 text-xs text-muted-foreground justify-center pt-2">
                <Lock className="h-3 w-3" />
                <span>Paiement 100% sécurisé</span>
              </div>
            </div>

            <div className="flex gap-3 px-6 py-4 border-t border-border">
              <button
                onClick={() => setShowPaymentModal(false)}
                className="flex-1 py-2.5 text-sm font-medium border border-border rounded-xl hover:bg-secondary transition"
              >
                Annuler
              </button>
              <button
                onClick={confirmPayment}
                disabled={!selectedPaymentMethod || paymentInProgress}
                className="flex-1 py-2.5 text-sm font-medium bg-primary text-primary-foreground rounded-xl hover:bg-primary/90 transition disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {paymentInProgress ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Check className="h-4 w-4" />
                )}
                Payer {formatPrice(selectedCommandeForPayment.total, selectedCommandeForPayment.devise)}
              </button>
            </div>
          </div>
        </div>
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
                  <span className={`inline-flex items-center gap-1 text-xs px-2 py-1 rounded-full font-medium border ${getStatutStyle(selectedCommande.statut)}`}>
                    {getStatutIcone(selectedCommande.statut)}
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
                </div>
                <p className="text-2xl font-bold text-foreground">{formatPrice(selectedCommande.total, selectedCommande.devise)}</p>
              </div>

              {/* Articles */}
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
                      {(selectedCommande.produits || []).map((produit, idx) => {
                        const totalLigne = produit.quantite * produit.prix_unitaire;
                        return (
                          <tr key={idx} className="border-t border-border">
                            <td className="py-2 px-3 text-foreground">{produit.nom}</td>
                            <td className="text-center py-2 px-3 text-muted-foreground">{produit.quantite}</td>
                            <td className="text-right py-2 px-3 text-muted-foreground">{formatPrice(produit.prix_unitaire, selectedCommande.devise)}</td>
                            <td className="text-right py-2 px-3 font-medium text-foreground">{formatPrice(totalLigne, selectedCommande.devise)}</td>
                          </tr>
                        );
                      })}
                      {(!selectedCommande.produits || selectedCommande.produits.length === 0) && (
                        <tr className="border-t border-border">
                          <td colSpan={4} className="py-4 px-3 text-center text-muted-foreground">
                            {selectedCommande.titre || "Produit"}
                          </td>
                        </tr>
                      )}
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
              {canCancel(selectedCommande.statut) && (
                <button
                  onClick={() => {
                    handleCancelCommande(selectedCommande);
                    setShowDetails(false);
                  }}
                  disabled={cancellingId === selectedCommande.id}
                  className="flex-1 py-2 text-sm font-medium text-red-500 border border-red-500 rounded-lg hover:bg-red-500 hover:text-white transition"
                >
                  {cancellingId === selectedCommande.id ? (
                    <Loader2 className="h-4 w-4 animate-spin mx-auto" />
                  ) : (
                    "Annuler la commande"
                  )}
                </button>
              )}
              <button
                onClick={() => window.print()}
                className="flex-1 py-2 text-sm font-medium text-foreground border border-border rounded-lg hover:bg-secondary transition"
              >
                🖨️ Imprimer
              </button>
              <Link
                to="/contact"
                className="flex-1 py-2 text-sm font-medium bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition text-center"
              >
                Assistance
              </Link>
            </div>
          </div>
        </div>
      )}

      <style>{`
        @keyframes float {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-10px); }
        }
        .animate-float {
          animation: float 3s ease-in-out infinite;
        }
      `}</style>

    </div>
  );
};

export default DashboardCommandes;