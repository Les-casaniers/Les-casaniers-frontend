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
  CreditCard,
  X,
  LayoutGrid,
  List,
  Hourglass,
  Truck,
  RefreshCw,
  ShoppingBag,
  PartyPopper,
  Frown
} from "lucide-react";
import { Link } from "react-router-dom";
import api from "@/service/api";
import { toast } from "@/hooks/use-toast";

// Import des images selon le statut
import fosa from "@/assets/casaniers-mascot.png";
import enAttente from "@/assets/en-attente.png";
import paye from "@/assets/paye.png";
import enPreparation from "@/assets/en-preparation.png";
import expediee from "@/assets/expediee.png";
import livree from "@/assets/livree.png";
import annulee from "@/assets/annulee.png";

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

// Ordre des statuts pour la progression
const statusOrder: StatutCommande[] = ["en_attente", "payee", "expediee", "en_traitement", "terminee"];

// Configuration des statuts avec images spécifiques
const getStatutConfig = (statut: StatutCommande) => {
  const config: Record<StatutCommande, {
    label: string;
    icon: React.ReactNode;
    image: string;
    message: string;
    gesture: string;
    shortGesture: string;
    emoji: string;
    color: string;
    bgColor: string;
    borderColor: string;
    progress: number;
    animation: string;
    bgGradient: string;
  }> = {
    "en_attente": {
      label: "En attente",
      icon: <Hourglass className="h-5 w-5" />,
      image: enAttente,
      message: "Votre commande est en attente de confirmation.",
      gesture: "🤔 En attente de validation...",
      shortGesture: "🤔 En attente",
      emoji: "⏳",
      color: "text-amber-600",
      bgColor: "bg-amber-500/10",
      borderColor: "border-amber-500/30",
      progress: 0,
      animation: "animate-pulse-slow",
      bgGradient: "from-amber-500/10 to-transparent"
    },
    
    "payee": {
      label: "Payée",
      icon: <CreditCard className="h-5 w-5" />,
      image: paye,
      message: "Paiement confirmé !",
      gesture: "💰 Paiement validé !",
      shortGesture: "💰 Payée",
      emoji: "💳",
      color: "text-blue-600",
      bgColor: "bg-blue-500/10",
      borderColor: "border-blue-500/30",
      progress: 25,
      animation: "animate-bounce-gentle",
      bgGradient: "from-blue-500/10 to-transparent"
    },
    
    "expediee": {
      label: "Expédiée",
      icon: <Truck className="h-5 w-5" />,
      image: expediee,
      message: "Votre commande est en route !",
      gesture: "🚚 En route vers vous !",
      shortGesture: "🚚 Expédiée",
      emoji: "🚛",
      color: "text-indigo-600",
      bgColor: "bg-indigo-500/10",
      borderColor: "border-indigo-500/30",
      progress: 50,
      animation: "animate-move-right",
      bgGradient: "from-indigo-500/10 to-transparent"
    },
    
    "en_traitement": {
      label: "En préparation",
      icon: <RefreshCw className="h-5 w-5" />,
      image: enPreparation,
      message: "Votre commande est en cours de préparation.",
      gesture: "🔧 Préparation en cours...",
      shortGesture: "🔧 En préparation",
      emoji: "📦",
      color: "text-purple-600",
      bgColor: "bg-purple-500/10",
      borderColor: "border-purple-500/30",
      progress: 75,
      animation: "animate-work",
      bgGradient: "from-purple-500/10 to-transparent"
    },
    
    "terminee": {
      label: "Livrée",
      icon: <PartyPopper className="h-5 w-5" />,
      image: livree,
      message: "Commande livrée avec succès !",
      gesture: "🎉 Livrée ! Merci !",
      shortGesture: "🎉 Livrée !",
      emoji: "🎊",
      color: "text-green-600",
      bgColor: "bg-green-500/10",
      borderColor: "border-green-500/30",
      progress: 100,
      animation: "animate-celebrate",
      bgGradient: "from-green-500/10 to-transparent"
    },
    
    "annulee": {
      label: "Annulée",
      icon: <Frown className="h-5 w-5" />,
      image: annulee,
      message: "Cette commande a été annulée.",
      gesture: "😢 Commande annulée",
      shortGesture: "😢 Annulée",
      emoji: "💔",
      color: "text-red-600",
      bgColor: "bg-red-500/10",
      borderColor: "border-red-500/30",
      progress: 0,
      animation: "animate-sad",
      bgGradient: "from-red-500/10 to-transparent"
    }
  };
  return config[statut] || config["en_attente"];
};

const getStatutLabel = (statut: StatutCommande): string => {
  return getStatutConfig(statut).label;
};

const getStatutStyle = (statut: StatutCommande) => {
  const config = getStatutConfig(statut);
  return `${config.bgColor} ${config.color} ${config.borderColor}`;
};

const getStatutIcone = (statut: StatutCommande) => {
  return getStatutConfig(statut).icon;
};

const getStatutProgress = (statut: StatutCommande): number => {
  const progressMap: Record<StatutCommande, number> = {
    "en_attente": 0,
    "payee": 25,
    "expediee": 50,
    "en_traitement": 75,
    "terminee": 100,
    "annulee": 0
  };
  return progressMap[statut] || 0;
};

const canCancel = (statut: StatutCommande): boolean => {
  return ["en_attente", "en_traitement"].includes(statut);
};

const DashboardCommandes = () => {
  const [commandes, setCommandes] = useState<Commande[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filtre, setFiltre] = useState<"toutes" | StatutCommande>("toutes");
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCommande, setSelectedCommande] = useState<Commande | null>(null);
  const [showDetails, setShowDetails] = useState(false);
  const [cancellingId, setCancellingId] = useState<number | null>(null);
  const [viewMode, setViewMode] = useState<"list" | "card">("card");

  useEffect(() => {
    fetchCommandes();
  }, []);

  const fetchCommandes = async () => {
    try {
      setIsLoading(true);
      const response = await api.get('/commandes');

      let commandesData: Commande[] = [];
      if (response.data.data && Array.isArray(response.data.data)) {
        commandesData = response.data.data;
      } else if (Array.isArray(response.data)) {
        commandesData = response.data;
      } else if (response.data.items && Array.isArray(response.data.items)) {
        commandesData = response.data.items;
      }

      const commandesMap = new Map<string, Commande>();

      commandesData.forEach(cmd => {
        let produitsFromMeta: ProduitCommande[] = [];
        if (cmd.meta_json) {
          try {
            const meta = typeof cmd.meta_json === 'string' ? JSON.parse(cmd.meta_json) : cmd.meta_json;
            if (meta.produits && Array.isArray(meta.produits)) {
              produitsFromMeta = meta.produits;
            }
          } catch (e) { }
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
          existingProduits.forEach(p => produitsMap.set(p.nom, p));
          produitsFromMeta.forEach(p => {
            if (!produitsMap.has(p.nom)) produitsMap.set(p.nom, p);
          });
          const produitsUniques = Array.from(produitsMap.values());
          const quantiteTotale = produitsUniques.reduce((sum, p) => sum + p.quantite, 0);

          commandesMap.set(cmd.commande_uuid, {
            ...existingCommande,
            produits: produitsUniques,
            quantite: quantiteTotale,
          });
        } else {
          const produitsMap = new Map<string, ProduitCommande>();
          produitsFromMeta.forEach(p => {
            if (!produitsMap.has(p.nom)) produitsMap.set(p.nom, p);
          });
          const produitsUniques = Array.from(produitsMap.values());
          const quantiteTotale = produitsUniques.reduce((sum, p) => sum + p.quantite, 0);

          commandesMap.set(cmd.commande_uuid, {
            ...cmd,
            produits: produitsUniques,
            quantite: quantiteTotale,
          });
        }
      });

      let commandesGrouped = Array.from(commandesMap.values());
      commandesGrouped.sort((a, b) =>
        new Date(b.date_creation).getTime() - new Date(a.date_creation).getTime()
      );

      setCommandes(commandesGrouped);

    } catch (error) {
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
        description: "Cette commande ne peut plus être annulée.",
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
          description: `La commande a été annulée avec succès`,
        });
        await fetchCommandes();
        if (showDetails && selectedCommande?.id === commande.id) {
          setShowDetails(false);
        }
      }
    } catch (error: any) {
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

  const stats = {
    total: commandes.length,
    livrees: commandes.filter(c => c.statut === "terminee").length,
    enCours: commandes.filter(c => ["en_traitement", "expediee", "en_attente"].includes(c.statut)).length,
    annulees: commandes.filter(c => c.statut === "annulee").length,
  };

  const commandesFiltrees = commandes.filter(cmd => {
    if (filtre !== "toutes" && cmd.statut !== filtre) return false;
    if (searchTerm && !cmd.commande_uuid.toLowerCase().includes(searchTerm.toLowerCase())) return false;
    return true;
  });

  // Vue Liste - avec mascotte positionnée selon l'ordre des statuts
  const ListView = () => (
    <div className="space-y-4">
      {commandesFiltrees.map((commande) => {
        const config = getStatutConfig(commande.statut);
        const progressValue = getStatutProgress(commande.statut);
        const isCancelled = commande.statut === "annulee";
        
        // Trouver la position du statut dans l'ordre
        const positionInOrder = statusOrder.indexOf(commande.statut);
        const isCompleted = positionInOrder !== -1;
        const stepNumber = isCompleted ? positionInOrder + 1 : 0;
        const totalSteps = statusOrder.length;
        
        return (
          <div key={commande.id} className="bg-card border border-border rounded-xl p-4 hover:shadow-md transition">
            
            {/* En-tête avec UUID, statut et date */}
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-3 flex-wrap">
                  <p className="font-mono font-semibold text-foreground">{commande.commande_uuid}</p>
                  <span className={`inline-flex items-center gap-1 text-[10px] px-2 py-0.5 rounded-full font-medium border ${getStatutStyle(commande.statut)}`}>
                    {getStatutIcone(commande.statut)}
                    {getStatutLabel(commande.statut)}
                  </span>
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
                          {p.nom} ({p.quantite}){idx < commande.produits.length - 1 && ", "}
                        </span>
                      ))
                    ) : (commande.titre || "Produit")}
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
                  className="inline-flex items-center gap-2 mt-2 px-3 py-1.5 text-sm font-medium bg-white border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition shadow-sm"
                >
                  <Eye className="h-4 w-4" />
                  Détails
                </button>
              </div>
            </div>

            {/* TIMELINE AVEC MASCOTTES POSITIONNÉES SELON L'ORDRE DES STATUTS */}
            <div className="mt-4 pt-3 border-t border-border/50">
              <div className="relative">
                {/* Ligne de fond */}
                <div className="absolute top-8 left-0 right-0 h-1 bg-muted rounded-full" />
                
                {/* Ligne de progression */}
                {!isCancelled && isCompleted && (
                  <div 
                    className="absolute top-8 left-0 h-1 bg-primary rounded-full transition-all duration-500"
                    style={{ width: `${(positionInOrder / (totalSteps - 1)) * 100}%` }}
                  />
                )}
                
                {/* Container des mascottes */}
                <div className="relative flex justify-between items-start">
                  {statusOrder.map((statut, idx) => {
                    const stepConfig = getStatutConfig(statut);
                    const isActive = statut === commande.statut;
                    const isPast = positionInOrder > idx;
                    const isFuture = positionInOrder < idx;
                    
                    return (
                      <div key={statut} className="flex flex-col items-center" style={{ flex: 1 }}>
                        {/* Point / Mascotte */}
                        <div className="relative z-10">
                          {isActive ? (
                            // Mascotte active (celle de la commande) - AGRANDIE AVEC ANIMATION SPÉCIFIQUE
                            <div className={`relative ${stepConfig.animation}`}>
                              <img 
                                src={stepConfig.image} 
                                alt={stepConfig.label} 
                                className="w-24 h-24 object-contain cursor-pointer hover:scale-110 transition-transform duration-200"
                                onError={(e) => {
                                  (e.target as HTMLImageElement).src = fosa;
                                }}
                              />
                              <div className="absolute -top-1 -right-1 bg-white dark:bg-gray-800 rounded-full p-0.5 shadow-sm border border-border">
                                <span className="text-xs">{stepConfig.emoji}</span>
                              </div>
                              {/* Indicateur de sélection */}
                              <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-2 h-2 bg-primary rounded-full animate-pulse" />
                            </div>
                          ) : isPast ? (
                            // Étapes déjà passées (check) - TAILLE NORMALE
                            <div className="w-10 h-10 rounded-full bg-primary text-primary-foreground flex items-center justify-center shadow-md">
                              <CheckCircle className="w-5 h-5" />
                            </div>
                          ) : (
                            // Étapes futures - TAILLE NORMALE
                            <div className="w-10 h-10 rounded-full bg-muted border-2 border-border flex items-center justify-center">
                              <span className="text-xs text-muted-foreground font-semibold">{idx + 1}</span>
                            </div>
                          )}
                        </div>
                        
                        {/* Libellé */}
                        <p className={`text-[8px] mt-2 text-center font-medium ${
                          isActive 
                            ? 'text-primary font-bold' 
                            : isPast 
                            ? 'text-muted-foreground' 
                            : 'text-muted-foreground/50'
                        }`}>
                          {stepConfig.label}
                        </p>
                        
                        {/* Indicateur de statut actif */}
                        {isActive && (
                          <div className="mt-0.5 flex items-center gap-1">
                            <div className="w-1 h-1 bg-primary rounded-full" />
                            <span className="text-[6px] text-primary font-semibold uppercase">Actuel</span>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Bouton annuler */}
            {canCancel(commande.statut) && (
              <div className="mt-3 pt-2 border-t border-border/50">
                <button
                  onClick={() => handleCancelCommande(commande)}
                  disabled={cancellingId === commande.id}
                  className="w-full inline-flex items-center justify-center gap-1.5 px-3 py-1.5 text-xs font-medium bg-red-500/10 text-red-600 rounded-lg hover:bg-red-500 hover:text-white transition"
                >
                  {cancellingId === commande.id ? <Loader2 className="h-3 w-3 animate-spin" /> : <Trash2 className="h-3 w-3" />}
                  Annuler la commande
                </button>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );

  // Vue Carte
  const CardView = () => (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
      {commandesFiltrees.map((commande) => {
        const config = getStatutConfig(commande.statut);
        const progressValue = getStatutProgress(commande.statut);
        const isCancelled = commande.statut === "annulee";

        return (
          <div
            key={commande.id}
            className={`bg-card border-2 ${config.borderColor} rounded-xl overflow-hidden hover:shadow-xl transition-all duration-300 hover:-translate-y-1 flex flex-col`}
          >
            {/* Bannière colorée en haut selon le statut */}
            <div className={`h-1 w-full ${config.color.replace('text', 'bg')}`} />

            <div className="p-5 flex flex-col">
              {/* En-tête avec badge */}
              <div className="flex items-start justify-between mb-3">
                <p className="font-mono font-semibold text-foreground text-xs truncate max-w-[120px]">
                  {commande.commande_uuid}
                </p>
                <span className={`inline-flex items-center gap-1 text-[10px] px-2 py-0.5 rounded-full font-medium border ${getStatutStyle(commande.statut)}`}>
                  {getStatutIcone(commande.statut)}
                  {getStatutLabel(commande.statut)}
                </span>
              </div>

              {/* Mascotte avec fond gradient selon statut et ANIMATION SPÉCIFIQUE */}
              <div className={`flex flex-col items-center justify-center py-4 mb-3 rounded-xl bg-gradient-to-br ${config.bgGradient}`}>
                <div className={`relative ${config.animation}`}>
                  <img
                    src={config.image}
                    alt="Fosa"
                    className="w-32 h-32 object-contain drop-shadow-lg"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src = fosa;
                    }}
                  />
                  <div className="absolute -top-2 -right-2 bg-white dark:bg-gray-800 rounded-full p-1.5 shadow-md border border-border">
                    <span className="text-lg">{config.emoji}</span>
                  </div>
                </div>
                <p className="text-sm text-center text-muted-foreground mt-3 font-medium max-w-[160px]">
                  {config.shortGesture}
                </p>
              </div>

              {/* Date */}
              <div className="flex items-center gap-2 mb-2">
                <Calendar className="h-3.5 w-3.5 text-muted-foreground" />
                <span className="text-muted-foreground text-[11px]">
                  {formatDate(commande.date_creation)}
                </span>
              </div>

              {/* Produits */}
              <div className="flex-1 min-h-[45px]">
                <p className="text-xs text-muted-foreground line-clamp-2">
                  {commande.produits && commande.produits.length > 0 ? (
                    commande.produits.slice(0, 2).map((p, idx) => (
                      <span key={idx}>
                        {p.nom} ({p.quantite}){idx < Math.min(commande.produits.length, 2) - 1 && ", "}
                      </span>
                    ))
                  ) : (commande.titre || "Produit")}
                  {commande.produits && commande.produits.length > 2 && (
                    <span className="text-primary"> +{commande.produits.length - 2}</span>
                  )}
                </p>
              </div>

              {/* Prix et bouton */}
              <div className="flex items-center justify-between mt-4 pt-3 border-t border-border">
                <p className="text-lg font-bold text-foreground">{formatPrice(commande.total, commande.devise)}</p>
                <button
                  onClick={() => {
                    setSelectedCommande(commande);
                    setShowDetails(true);
                  }}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium bg-primary/10 text-primary rounded-lg hover:bg-primary hover:text-white transition-all duration-300"
                >
                  <Eye className="h-3.5 w-3.5" />
                  Détails
                </button>
              </div>

              {/* Timeline progression */}
              {!isCancelled && (
                <div className="mt-3 pt-2 border-t border-border/50">
                  <div className="relative">
                    <div className="absolute top-2 left-0 right-0 h-1 bg-muted rounded-full" />
                    <div
                      className="absolute top-2 left-0 h-1 bg-primary rounded-full transition-all duration-500"
                      style={{ width: `${progressValue}%` }}
                    />
                    <div className="relative flex justify-between">
                      {[
                        { key: "1", label: "Cde" },
                        { key: "2", label: "Payée" },
                        { key: "3", label: "Exp" },
                        { key: "4", label: "Prép" },
                        { key: "5", label: "Liv" }
                      ].map((step, idx) => {
                        const isCompleted = progressValue >= (idx * 25);
                        return (
                          <div key={step.key} className="flex flex-col items-center">
                            <div
                              className={`w-4 h-4 rounded-full flex items-center justify-center transition-all z-10
                                ${isCompleted
                                  ? 'bg-primary ring-2 ring-primary/30'
                                  : 'bg-muted border border-border'
                                }
                              `}
                            >
                              {isCompleted && <CheckCircle className="w-2.5 h-2.5 text-white" />}
                            </div>
                            <p className={`text-[8px] mt-1 ${isCompleted ? 'text-primary font-medium' : 'text-muted-foreground'}`}>
                              {step.label}
                            </p>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>
              )}

              {/* Bouton annuler */}
              {canCancel(commande.statut) && (
                <div className="mt-3 pt-2">
                  <button
                    onClick={() => handleCancelCommande(commande)}
                    disabled={cancellingId === commande.id}
                    className="w-full inline-flex items-center justify-center gap-1.5 px-2 py-1.5 text-[10px] font-medium bg-red-500/10 text-red-600 rounded-lg hover:bg-red-500 hover:text-white transition"
                  >
                    {cancellingId === commande.id ? (
                      <Loader2 className="h-2.5 w-2.5 animate-spin" />
                    ) : (
                      <Trash2 className="h-2.5 w-2.5" />
                    )}
                    Annuler
                  </button>
                </div>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );

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
          <img src={fosa} alt="Le Fosa" className="h-32 w-32 mx-auto mb-4 animate-float" />
          <h2 className="text-2xl font-bold text-foreground mb-3">Aucune commande pour le moment</h2>
          <p className="text-muted-foreground mb-6">Vous n'avez pas encore passé de commande.</p>
          <Link to="/catalogue" className="inline-flex items-center gap-2 px-6 py-3 bg-primary text-primary-foreground rounded-xl hover:bg-primary/90 transition font-medium">
            Explorer le catalogue <ChevronRight className="h-4 w-4" />
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
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

      {/* Filtres */}
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
        <div className="flex flex-wrap items-center gap-2">
          <Filter className="h-4 w-4 text-muted-foreground" />
          {["toutes", "en_attente", "payee", "expediee", "en_traitement", "terminee", "annulee"].map((f) => (
            <button
              key={f}
              onClick={() => setFiltre(f as typeof filtre)}
              className={`px-3 py-1.5 text-xs font-medium rounded-lg transition ${
                filtre === f ? "bg-primary text-primary-foreground" : "bg-secondary text-muted-foreground hover:bg-secondary/80"
              }`}
            >
              {f === "toutes" ? "Tous" : getStatutLabel(f as StatutCommande)}
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

      {/* Mode vue */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-end gap-4">
        <div className="flex items-center gap-2 bg-card border border-border rounded-lg p-1 w-fit">
          <button onClick={() => setViewMode("list")} className={`flex items-center gap-2 px-3 py-1.5 text-sm font-medium rounded-md transition ${viewMode === "list" ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:bg-secondary"}`}>
            <List className="h-4 w-4" /> Liste
          </button>
          <button onClick={() => setViewMode("card")} className={`flex items-center gap-2 px-3 py-1.5 text-sm font-medium rounded-md transition ${viewMode === "card" ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:bg-secondary"}`}>
            <LayoutGrid className="h-4 w-4" /> Cartes
          </button>
        </div>
      </div>

      {commandesFiltrees.length === 0 ? (
        <div className="bg-card border border-border rounded-xl p-12 text-center">
          <Package className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-foreground mb-2">Aucune commande trouvée</h3>
        </div>
      ) : (
        viewMode === "list" ? <ListView /> : <CardView />
      )}

      {/* MODAL DÉTAILS */}
      {showDetails && selectedCommande && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
          <div className="bg-background border border-border rounded-2xl shadow-2xl w-full max-w-2xl mx-4 max-h-[90vh] flex flex-col overflow-hidden">
            {/* Bannière colorée */}
            <div className={`h-1 w-full ${getStatutConfig(selectedCommande.statut).color.replace('text', 'bg')}`} />

            <div className="flex items-center justify-between px-6 py-4 border-b border-border">
              <div>
                <h2 className="text-lg font-semibold text-foreground">Détails de la commande</h2>
                <p className="text-xs text-muted-foreground font-mono">{selectedCommande.commande_uuid}</p>
              </div>
              <button onClick={() => setShowDetails(false)} className="p-1.5 rounded-lg hover:bg-secondary transition">
                <X className="h-5 w-5 text-muted-foreground" />
              </button>
            </div>

            <div className="overflow-y-auto px-6 py-5 flex-1 space-y-5">
              {/* Mascotte avec fond gradient selon statut et ANIMATION SPÉCIFIQUE */}
              <div className={`flex flex-col items-center justify-center py-6 rounded-2xl bg-gradient-to-br ${getStatutConfig(selectedCommande.statut).bgGradient}`}>
                <div className={`relative ${getStatutConfig(selectedCommande.statut).animation}`}>
                  <img
                    src={getStatutConfig(selectedCommande.statut).image}
                    alt="Fosa"
                    className="w-40 h-40 object-contain drop-shadow-xl"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src = fosa;
                    }}
                  />
                  <div className="absolute -top-2 -right-2 bg-white dark:bg-gray-800 rounded-full p-1.5 shadow-md border border-border">
                    <span className="text-xl">{getStatutConfig(selectedCommande.statut).emoji}</span>
                  </div>
                </div>
                <div className="mt-4 text-center">
                  <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border bg-card/50">
                    {getStatutIcone(selectedCommande.statut)}
                    <span className={`text-sm font-semibold ${getStatutConfig(selectedCommande.statut).color}`}>
                      {getStatutLabel(selectedCommande.statut)}
                    </span>
                  </div>
                  <p className="text-sm text-muted-foreground mt-3 italic max-w-md">
                    "{getStatutConfig(selectedCommande.statut).gesture}"
                  </p>
                </div>
              </div>

              <div className="flex justify-between items-start flex-wrap gap-3">
                <div>
                  <p className="text-sm text-muted-foreground">
                    Commandé le {formatDate(selectedCommande.date_creation)}
                  </p>
                  {selectedCommande.devis_id && (
                    <p className="text-xs text-muted-foreground mt-1">Devis N°{selectedCommande.devis_id}</p>
                  )}
                </div>
                <p className="text-2xl font-bold text-foreground">
                  {formatPrice(selectedCommande.total, selectedCommande.devise)}
                </p>
              </div>

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
                      {(selectedCommande.produits || []).map((produit, idx) => (
                        <tr key={idx} className="border-t border-border">
                          <td className="py-2 px-3 text-foreground">{produit.nom}</td>
                          <td className="text-center py-2 px-3 text-muted-foreground">{produit.quantite}</td>
                          <td className="text-right py-2 px-3 text-muted-foreground">
                            {formatPrice(produit.prix_unitaire, selectedCommande.devise)}
                          </td>
                          <td className="text-right py-2 px-3 font-medium text-foreground">
                            {formatPrice(produit.quantite * produit.prix_unitaire, selectedCommande.devise)}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Barre de progression */}
              <div className="mt-2">
                <div className="flex justify-between text-xs text-muted-foreground mb-1">
                  <span>Progression de la commande</span>
                  <span className="font-semibold">{getStatutProgress(selectedCommande.statut)}%</span>
                </div>
                <div className="w-full h-2 bg-muted rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all duration-700 ${getStatutConfig(selectedCommande.statut).color.replace('text', 'bg')}`}
                    style={{ width: `${getStatutProgress(selectedCommande.statut)}%` }}
                  />
                </div>
              </div>

              {/* Timeline étapes */}
              {selectedCommande.statut !== "annulee" && (
                <div className="mt-2 pt-2">
                  <div className="relative">
                    <div className="absolute top-3 left-0 right-0 h-0.5 bg-muted" />
                    <div
                      className="absolute top-3 left-0 h-0.5 bg-primary transition-all duration-500"
                      style={{ width: `${getStatutProgress(selectedCommande.statut)}%` }}
                    />
                    <div className="relative flex justify-between">
                      {[
                        { key: "1", label: "Commande" },
                        { key: "2", label: "Payée" },
                        { key: "3", label: "Expédiée" },
                        { key: "4", label: "Préparation" },
                        { key: "5", label: "Livrée" }
                      ].map((step, idx) => {
                        const isCompleted = getStatutProgress(selectedCommande.statut) >= (idx * 25);
                        return (
                          <div key={step.key} className="flex flex-col items-center">
                            <div
                              className={`w-6 h-6 rounded-full flex items-center justify-center transition-all z-10
                                ${isCompleted
                                  ? 'bg-primary text-primary-foreground shadow-md'
                                  : 'bg-muted text-muted-foreground'
                                }
                              `}
                            >
                              {isCompleted ? <CheckCircle className="w-3 h-3" /> : idx + 1}
                            </div>
                            <p className={`text-[10px] mt-1 text-center font-medium ${isCompleted ? 'text-primary' : 'text-muted-foreground'}`}>
                              {step.label}
                            </p>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>
              )}

              <div className="border-t border-border pt-3">
                <div className="flex justify-end">
                  <div className="w-64 space-y-1 text-sm">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Sous-total :</span>
                      <span>{formatPrice(selectedCommande.sous_total, selectedCommande.devise)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Livraison :</span>
                      <span className={selectedCommande.livraison > 0 ? "text-foreground" : "text-green-600"}>
                        {selectedCommande.livraison > 0 ? formatPrice(selectedCommande.livraison, selectedCommande.devise) : "Gratuite"}
                      </span>
                    </div>
                    <div className="flex justify-between pt-1 border-t border-border font-semibold">
                      <span>Total :</span>
                      <span>{formatPrice(selectedCommande.total, selectedCommande.devise)}</span>
                    </div>
                  </div>
                </div>
              </div>
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
        /* Animations existantes */
        @keyframes float { 0%,100% { transform: translateY(0); } 50% { transform: translateY(-10px); } }
        @keyframes bounce-gentle { 0%,100% { transform: translateY(0); } 50% { transform: translateY(-5px); } }
        @keyframes spin-slow { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
        @keyframes wiggle { 0%,100% { transform: rotate(0deg); } 25% { transform: rotate(-5deg); } 75% { transform: rotate(5deg); } }
        @keyframes celebrate { 0%,100% { transform: scale(1); } 25% { transform: scale(1.05) rotate(-3deg); } 75% { transform: scale(1.05) rotate(3deg); } }
        @keyframes sad { 0%,100% { transform: translateY(0); } 50% { transform: translateY(5px); opacity: 0.7; } }
        @keyframes pulse-slow { 0%,100% { opacity: 1; } 50% { opacity: 0.8; transform: scale(1.02); } }
        
        /* NOUVELLES ANIMATIONS */
        @keyframes move-right { 
          0% { transform: translateX(0); } 
          50% { transform: translateX(20px); } 
          100% { transform: translateX(0); } 
        }
        
        @keyframes work { 
          0% { transform: translateY(0) rotate(0deg) scale(1); } 
          25% { transform: translateY(-5px) rotate(-3deg) scale(1.02); }
          75% { transform: translateY(0) rotate(3deg) scale(1.02); }
          100% { transform: translateY(0) rotate(0deg) scale(1); } 
        }
        
        /* Classes d'animation */
        .animate-float { animation: float 3s ease-in-out infinite; }
        .animate-bounce-gentle { animation: bounce-gentle 2s ease-in-out infinite; }
        .animate-spin-slow { animation: spin-slow 4s linear infinite; }
        .animate-wiggle { animation: wiggle 0.5s ease-in-out infinite; }
        .animate-celebrate { animation: celebrate 0.8s ease-in-out infinite; }
        .animate-sad { animation: sad 2s ease-in-out infinite; }
        .animate-pulse-slow { animation: pulse-slow 2s ease-in-out infinite; }
        
        /* NOUVELLES CLASSES */
        .animate-move-right { animation: move-right 2s ease-in-out infinite; }
        .animate-work { animation: work 1.5s ease-in-out infinite; }
      `}</style>
    </div>
  );
};

export default DashboardCommandes;