// src/components/ActionLivreur/LivreurLivraisons.tsx
import React, { useState, useEffect, useRef } from "react";
import {
  Search,
  Eye,
  CheckCircle,
  XCircle,
  Clock,
  MapPin,
  Navigation,
  Phone,
  User,
  DollarSign,
  Filter,
  Package,
  Camera,
  X,
  ChevronLeft,
  ChevronRight,
  Truck,
  Calendar,
  ChevronDown,
  Loader2,
  AlertCircle,
  RefreshCw,
  Check,
  Send,
  Gift,
  Map,
  Image as ImageIcon,
  ChevronUp,
} from "lucide-react";
import api from "@/service/api";
import { toast } from "@/hooks/use-toast";

interface Livraison {
  id: number;
  commande_uuid: string;
  trackingNumber: string;
  clientName: string;
  clientPhone: string;
  clientAddress: string;
  destinationAddress: string;
  status: "pending" | "pickup" | "in_transit" | "delivered" | "cancelled";
  amount: number;
  createdAt: Date;
  deliveredAt?: Date;
  estimatedDelivery: Date;
  clientPhotos?: string[];
  deliveryLocation?: {
    lat: number;
    lng: number;
  };
  utilisateur_id: number;
  statut_commande: string;
  adresse_livraison?: string;
  produits?: any[];
  adresseTelephone?: string;
  adresseDetails?: {
    nom_complet: string;
    telephone: string;
    adresse_ligne1: string;
    adresse_ligne2: string | null;
    ville: string;
    region: string;
    code_postal: string;
    pays: string;
    image_adress: string | null;
    latitude: number | null;
    longitude: number | null;
  };
  utilisateurDetails?: {
    prenom: string;
    nom: string;
    email: string;
  };
}

const LivreurLivraisons: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [selectedDelivery, setSelectedDelivery] = useState<Livraison | null>(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [hoveredRow, setHoveredRow] = useState<number | null>(null);
  const [selectedPhotoIndex, setSelectedPhotoIndex] = useState<number>(0);
  const [showFullPhoto, setShowFullPhoto] = useState(false);
  const [livraisons, setLivraisons] = useState<Livraison[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [actionInProgress, setActionInProgress] = useState<number | null>(null);
  const [showCommandeDetails, setShowCommandeDetails] = useState(false);
  
  const modalRef = useRef<HTMLDivElement>(null);

  // ✅ Gérer l'ouverture du modal
  useEffect(() => {
    if (showDetailsModal) {
      // Bloquer le scroll de la page
      document.body.style.overflow = 'hidden';
      
      // Scroller en haut du modal
      setTimeout(() => {
        if (modalRef.current) {
          modalRef.current.scrollTop = 0;
        }
        // Scroller la page en haut
        window.scrollTo({ top: 0, behavior: 'smooth' });
      }, 100);
    } else {
      // Réactiver le scroll
      document.body.style.overflow = '';
    }
    
    return () => {
      document.body.style.overflow = '';
    };
  }, [showDetailsModal]);

  useEffect(() => {
    fetchCommandes();
  }, []);

  const fetchCommandes = async () => {
    try {
      setIsLoading(true);
      setError(null);

      const response = await api.get("/livreur-test/commandes", {
        params: { per_page: 100 },
      });

      console.log("Commandes récupérées:", response.data);

      let commandesData = [];
      if (response.data.data && Array.isArray(response.data.data)) {
        commandesData = response.data.data;
      } else if (Array.isArray(response.data)) {
        commandesData = response.data;
      } else {
        commandesData = [];
      }

      const livraisonsData = await Promise.all(
        commandesData.map(async (commande: any) => {
          let deliveryStatus:
            | "pending"
            | "pickup"
            | "in_transit"
            | "delivered"
            | "cancelled" = "pending";

          switch (commande.statut) {
            case "en_attente":
              deliveryStatus = "pending";
              break;
            case "payee":
              deliveryStatus = "pickup";
              break;
            case "expediee":
            case "en_traitement":
              deliveryStatus = "in_transit";
              break;
            case "terminee":
              deliveryStatus = "delivered";
              break;
            case "annulee":
              deliveryStatus = "cancelled";
              break;
            default:
              deliveryStatus = "pending";
          }

          const clientName = commande.utilisateur
            ? `${commande.utilisateur.prenom || ""} ${commande.utilisateur.nom || ""}`.trim() ||
              "Client inconnu"
            : "Client inconnu";

          let adresseDetails = null;
          let adresseTelephone = "Téléphone non disponible";
          let clientPhone = "Téléphone non disponible";

          if (commande.adresse_expedition_id) {
            try {
              const adresseResponse = await api.get(
                `/adresses/${commande.adresse_expedition_id}`
              );
              if (adresseResponse.data?.data) {
                const adresse = adresseResponse.data.data;
                adresseDetails = {
                  nom_complet: adresse.nom_complet || "",
                  telephone: adresse.telephone || "Téléphone non disponible",
                  adresse_ligne1: adresse.adresse_ligne1 || "",
                  adresse_ligne2: adresse.adresse_ligne2 || null,
                  ville: adresse.ville || "",
                  region: adresse.region || "",
                  code_postal: adresse.code_postal || "",
                  pays: adresse.pays || "",
                  image_adress: adresse.image_adress || null,
                  latitude: adresse.latitude || null,
                  longitude: adresse.longitude || null,
                };
                adresseTelephone = adresse.telephone || "Téléphone non disponible";
                clientPhone = adresseTelephone;
              }
            } catch (error) {
              console.error("Erreur récupération adresse:", error);
            }
          }

          const utilisateurDetails = commande.utilisateur
            ? {
                prenom: commande.utilisateur.prenom || "",
                nom: commande.utilisateur.nom || "",
                email: commande.utilisateur.email || "Email non disponible",
              }
            : {
                prenom: "",
                nom: "",
                email: "Email non disponible",
              };

          const clientEmail = commande.utilisateur?.email || "Email non disponible";
          const adresseLivraison = commande.adresse_livraison || "Adresse non disponible";

          const createdAt = new Date(commande.date_creation);
          const estimatedDelivery = new Date(createdAt);
          estimatedDelivery.setDate(estimatedDelivery.getDate() + 7);

          const photos = commande.photos || [];

          return {
            id: commande.id,
            commande_uuid: commande.commande_uuid,
            trackingNumber: commande.commande_uuid,
            clientName: clientName,
            clientPhone: clientPhone,
            clientAddress: clientEmail,
            destinationAddress: adresseLivraison,
            status: deliveryStatus,
            amount: parseFloat(commande.total) || 0,
            createdAt: createdAt,
            deliveredAt: commande.statut === "terminee" ? new Date() : undefined,
            estimatedDelivery: estimatedDelivery,
            clientPhotos: photos.length > 0 ? photos : undefined,
            utilisateur_id: commande.utilisateur_id || 0,
            statut_commande: commande.statut,
            produits: commande.produits || [],
            deliveryLocation: undefined,
            adresseTelephone: adresseTelephone,
            adresseDetails: adresseDetails,
            utilisateurDetails: utilisateurDetails,
          };
        })
      );

      setLivraisons(livraisonsData);
    } catch (error: any) {
      console.error("Erreur chargement commandes:", error);
      setError("Impossible de charger les livraisons");
      toast({
        title: "Erreur",
        description:
          error?.response?.data?.message ||
          "Impossible de charger les livraisons",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const extractAddressOnly = (fullAddress: string): string => {
    if (!fullAddress || fullAddress === "Adresse non disponible") {
      return fullAddress;
    }
    const parts = fullAddress.split(", ");
    if (parts.length > 1) {
      return parts.slice(1).join(", ");
    }
    return fullAddress;
  };

  const marquerLivree = async (commande_uuid: string) => {
    try {
      setActionInProgress(commande_uuid as any);

      const response = await api.patch(
        `/livreur-test/commandes/${commande_uuid}/statut`,
        {
          statut: "terminee",
        }
      );

      if (response.data.success) {
        toast({
          title: "✅ Livraison confirmée",
          description: `La commande ${commande_uuid} a été marquée comme livrée`,
        });
        await fetchCommandes();
        if (showDetailsModal) {
          setShowDetailsModal(false);
        }
      } else {
        throw new Error(
          response.data.message || "Erreur lors de la mise à jour"
        );
      }
    } catch (error: any) {
      console.error("Erreur marquage livrée:", error);
      toast({
        title: "Erreur",
        description:
          error?.response?.data?.message ||
          "Impossible de marquer comme livrée",
        variant: "destructive",
      });
    } finally {
      setActionInProgress(null);
    }
  };

  const getStatusConfig = (status: string) => {
    const config: Record<
      string,
      { label: string; bg: string; text: string; icon: any }
    > = {
      pending: {
        label: "En attente",
        bg: "bg-amber-500/10",
        text: "text-amber-600",
        icon: Clock,
      },
      pickup: {
        label: "À prendre",
        bg: "bg-blue-500/10",
        text: "text-blue-600",
        icon: MapPin,
      },
      in_transit: {
        label: "En transit",
        bg: "bg-purple-500/10",
        text: "text-purple-600",
        icon: Navigation,
      },
      delivered: {
        label: "Livrée",
        bg: "bg-emerald-500/10",
        text: "text-emerald-600",
        icon: CheckCircle,
      },
      cancelled: {
        label: "Annulée",
        bg: "bg-red-500/10",
        text: "text-red-600",
        icon: XCircle,
      },
    };
    return config[status] || config.pending;
  };

  const getTimeRemaining = (date: Date) => {
    const diff = date.getTime() - Date.now();
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    if (hours > 0) return `${hours}h ${minutes}min`;
    if (minutes > 0) return `${minutes}min`;
    return "Très bientôt";
  };

  const filteredLivraisons = livraisons.filter((livraison) => {
    const matchesSearch =
      livraison.trackingNumber
        .toLowerCase()
        .includes(searchTerm.toLowerCase()) ||
      livraison.clientName.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus =
      statusFilter === "all" || livraison.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const statsCards = [
    {
      label: "À livrer",
      value: livraisons.filter(
        (l) => l.status === "pending" || l.status === "pickup"
      ).length,
      icon: Package,
      color: "from-blue-500 to-cyan-500",
    },
    {
      label: "En cours",
      value: livraisons.filter((l) => l.status === "in_transit").length,
      icon: Navigation,
      color: "from-purple-500 to-indigo-500",
    },
    {
      label: "Livrées",
      value: livraisons.filter((l) => l.status === "delivered").length,
      icon: CheckCircle,
      color: "from-emerald-500 to-teal-500",
    },
    {
      label: "Gains",
      value: `${livraisons.reduce((sum, l) => sum + (l.status === "delivered" ? l.amount : 0), 0)} Ar`,
      icon: DollarSign,
      color: "from-primary to-primary/80",
    },
  ];

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center py-20">
        <Loader2 className="h-12 w-12 animate-spin text-primary mb-4" />
        <p className="text-muted-foreground">Chargement des livraisons...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center py-20">
        <AlertCircle className="h-12 w-12 text-destructive mb-4" />
        <p className="text-destructive font-medium">{error}</p>
        <button
          onClick={fetchCommandes}
          className="mt-4 px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition"
        >
          Réessayer
        </button>
      </div>
    );
  }

  if (livraisons.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20">
        <Package className="h-12 w-12 text-muted-foreground mb-4" />
        <p className="text-lg font-medium text-foreground">Aucune livraison</p>
        <p className="text-sm text-muted-foreground mt-1">
          Aucune commande n'a été trouvée pour le moment.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-5 animate-fade-up">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-display font-bold tracking-tight">
          Mes livraisons
        </h1>
        <p className="text-sm text-muted-foreground mt-1">
          Suivez et gérez toutes vos livraisons
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {statsCards.map((stat, index) => (
          <div
            key={stat.label}
            className="relative overflow-hidden rounded-xl bg-card border border-border/50 p-4 hover:shadow-md transition-all hover:-translate-y-0.5"
          >
            <div className="flex items-center gap-3">
              <div
                className={`w-10 h-10 rounded-lg bg-gradient-to-br ${stat.color} flex items-center justify-center`}
              >
                <stat.icon className="w-5 h-5 text-white" />
              </div>
              <div>
                <p className="text-xl font-bold">{stat.value}</p>
                <p className="text-xs text-muted-foreground">{stat.label}</p>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div className="rounded-xl bg-card border border-border/50 p-4">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <input
              type="text"
              placeholder="Rechercher par n° de commande ou client..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-3 py-2 text-sm rounded-lg bg-muted/30 border border-border/50 focus:border-primary/50 focus:outline-none focus:ring-1 focus:ring-primary/20"
            />
          </div>
          <div className="relative">
            <Filter className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="pl-9 pr-8 py-2 text-sm rounded-lg bg-muted/30 border border-border/50 focus:border-primary/50 focus:outline-none focus:ring-1 focus:ring-primary/20 appearance-none cursor-pointer sm:w-36"
            >
              <option value="all">Tous les statuts</option>
              <option value="pending">En attente</option>
              <option value="pickup">À prendre</option>
              <option value="in_transit">En transit</option>
              <option value="delivered">Livrées</option>
              <option value="cancelled">Annulées</option>
            </select>
            <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
          </div>
          <button
            onClick={fetchCommandes}
            className="px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition text-sm flex items-center gap-2"
          >
            <RefreshCw className="w-4 h-4" />
            Actualiser
          </button>
        </div>
      </div>

      {/* Tableau - Scrollable */}
      <div className="rounded-xl bg-card border border-border/50 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-muted/30">
              <tr>
                <th className="text-left py-3 px-4 text-xs font-semibold uppercase text-muted-foreground">
                  N° commande
                </th>
                <th className="text-left py-3 px-4 text-xs font-semibold uppercase text-muted-foreground">
                  Client
                </th>
                <th className="text-left py-3 px-4 text-xs font-semibold uppercase text-muted-foreground hidden md:table-cell">
                  Destination
                </th>
                <th className="text-left py-3 px-4 text-xs font-semibold uppercase text-muted-foreground">
                  Montant
                </th>
                <th className="text-left py-3 px-4 text-xs font-semibold uppercase text-muted-foreground">
                  Statut
                </th>
                <th className="text-left py-3 px-4 text-xs font-semibold uppercase text-muted-foreground">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody>
              {filteredLivraisons.map((livraison) => {
                const statusConfig = getStatusConfig(livraison.status);
                const StatusIcon = statusConfig.icon;
                const isDelivered = livraison.status === "delivered";
                const isCancelled = livraison.status === "cancelled";

                const addressOnly = extractAddressOnly(
                  livraison.destinationAddress
                );

                return (
                  <tr
                    key={livraison.id}
                    className={`border-t border-border/50 transition-all ${hoveredRow === livraison.id ? "bg-muted/20" : "hover:bg-muted/10"}`}
                    onMouseEnter={() => setHoveredRow(livraison.id)}
                    onMouseLeave={() => setHoveredRow(null)}
                  >
                    <td className="py-3 px-4">
                      <span className="font-mono text-sm font-semibold bg-muted/50 px-2 py-1 rounded">
                        {livraison.trackingNumber}
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      <p className="text-sm font-medium">
                        {livraison.clientName}
                      </p>
                      <p className="text-xs text-muted-foreground flex items-center gap-1">
                        <Phone className="w-3 h-3" />
                        {livraison.clientPhone}
                      </p>
                    </td>
                    <td className="py-3 px-4 hidden md:table-cell">
                      <p className="text-sm text-foreground">{addressOnly}</p>
                    </td>
                    <td className="py-3 px-4">
                      <span className="text-sm font-semibold text-primary">
                        {livraison.amount.toFixed(2)} Ar
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      <span
                        className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${statusConfig.bg} ${statusConfig.text}`}
                      >
                        <StatusIcon className="w-3 h-3" />
                        {statusConfig.label}
                      </span>
                      {livraison.status === "in_transit" && (
                        <p className="text-[11px] text-muted-foreground mt-1">
                          {getTimeRemaining(livraison.estimatedDelivery)}
                        </p>
                      )}
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => {
                            setSelectedDelivery(livraison);
                            setShowDetailsModal(true);
                            setShowCommandeDetails(false);
                          }}
                          className="inline-flex items-center gap-2 px-3 py-1.5 text-sm font-medium bg-white border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition shadow-sm"
                        >
                          <Eye className="h-4 w-4" />
                          Détails
                        </button>
                        {!isDelivered && !isCancelled && (
                          <button
                            onClick={() => marquerLivree(livraison.commande_uuid)}
                            disabled={actionInProgress === livraison.id}
                            className="inline-flex items-center gap-2 px-3 py-1.5 text-sm font-medium bg-emerald-500 text-white rounded-lg hover:bg-emerald-600 transition disabled:opacity-50"
                          >
                            {actionInProgress === livraison.id ? (
                              <Loader2 className="h-4 w-4 animate-spin" />
                            ) : (
                              <Gift className="h-4 w-4" />
                            )}
                            Marquer Livrée
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {filteredLivraisons.length === 0 && (
          <div className="text-center py-12">
            <Package className="h-12 w-12 text-muted-foreground mx-auto mb-3" />
            <p className="text-sm text-muted-foreground">
              Aucune livraison trouvée
            </p>
            <p className="text-xs text-muted-foreground/60 mt-1">
              Essayez de modifier vos critères de recherche
            </p>
          </div>
        )}
      </div>

      {/* ✅ MODAL DÉTAILS - EN HAUT DE PAGE */}
      {showDetailsModal && selectedDelivery && (
        <div
          className="fixed inset-0 z-[100] bg-black/60 backdrop-blur-sm"
          onClick={() => {
            setShowDetailsModal(false);
          }}
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            overflow: 'hidden',
            display: 'flex',
            alignItems: 'flex-start',
            justifyContent: 'center',
            paddingTop: '20px',
          }}
        >
          <div
            ref={modalRef}
            className="relative w-full max-w-2xl max-h-[90vh] bg-card border border-border shadow-2xl rounded-2xl overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
            style={{
              margin: '0 auto',
            }}
          >
            <div className="absolute top-0 left-0 right-0 h-1 bg-primary rounded-t-2xl" />

            {/* Header - sticky */}
            <div className="sticky top-0 z-10 flex items-center justify-between p-4 border-b border-border bg-card rounded-t-2xl">
              <div className="min-w-0 flex-1">
                <h3 className="text-lg font-semibold truncate">
                  Détails de la livraison
                </h3>
                <p className="text-xs text-muted-foreground font-mono truncate">
                  Commande #{selectedDelivery.trackingNumber}
                </p>
              </div>
              <button
                onClick={() => {
                  setShowDetailsModal(false);
                }}
                className="p-2 ml-2 rounded-lg hover:bg-muted/50 transition-colors flex-shrink-0"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Content - responsive */}
            <div className="p-4 sm:p-5 space-y-4">
              {/* INFOS CLIENT */}
              <div className="bg-muted/10 rounded-xl p-4 border border-border/50">
                <h4 className="text-sm font-semibold flex items-center gap-2 mb-3">
                  <User className="h-4 w-4 text-primary flex-shrink-0" />
                  <span>Informations client</span>
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <p className="text-xs text-muted-foreground">Nom complet</p>
                    <p className="text-sm font-medium truncate">
                      {selectedDelivery.adresseDetails?.nom_complet || selectedDelivery.clientName}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Téléphone</p>
                    <p className="text-sm font-medium flex items-center gap-1 truncate">
                      <Phone className="h-3 w-3 text-muted-foreground flex-shrink-0" />
                      {selectedDelivery.adresseDetails?.telephone || selectedDelivery.clientPhone}
                    </p>
                  </div>
                  <div className="sm:col-span-2">
                    <p className="text-xs text-muted-foreground">Email</p>
                    <p className="text-sm font-medium truncate">
                      {selectedDelivery.utilisateurDetails?.email || selectedDelivery.clientAddress}
                    </p>
                  </div>
                </div>
              </div>

              {/* ADRESSE DE LIVRAISON */}
              <div className="bg-muted/10 rounded-xl p-4 border border-border/50">
                <h4 className="text-sm font-semibold flex items-center gap-2 mb-3">
                  <MapPin className="h-4 w-4 text-primary flex-shrink-0" />
                  <span>Adresse de livraison</span>
                </h4>
                <div className="space-y-1 text-sm">
                  {selectedDelivery.adresseDetails?.adresse_ligne1 && (
                    <p className="break-words">{selectedDelivery.adresseDetails.adresse_ligne1}</p>
                  )}
                  {selectedDelivery.adresseDetails?.adresse_ligne2 && (
                    <p className="break-words">{selectedDelivery.adresseDetails.adresse_ligne2}</p>
                  )}
                  {(selectedDelivery.adresseDetails?.code_postal || selectedDelivery.adresseDetails?.ville) && (
                    <p className="break-words">
                      {selectedDelivery.adresseDetails?.code_postal || ""}{" "}
                      {selectedDelivery.adresseDetails?.ville || ""}
                    </p>
                  )}
                  {(selectedDelivery.adresseDetails?.region || selectedDelivery.adresseDetails?.pays) && (
                    <p className="text-muted-foreground break-words">
                      {selectedDelivery.adresseDetails?.region || ""}
                      {selectedDelivery.adresseDetails?.region && selectedDelivery.adresseDetails?.pays && ", "}
                      {selectedDelivery.adresseDetails?.pays || ""}
                    </p>
                  )}
                  <a
                    href={`https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(
                      selectedDelivery.destinationAddress
                    )}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 text-xs text-primary hover:underline mt-1"
                  >
                    <Navigation className="w-3 h-3" />
                    Itinéraire
                  </a>
                </div>
              </div>

              {/* IMAGE DU LIEU */}
              <div className="bg-muted/10 rounded-xl p-4 border border-border/50">
                <h4 className="text-sm font-semibold flex items-center gap-2 mb-3">
                  <ImageIcon className="h-4 w-4 text-primary flex-shrink-0" />
                  <span>Photo du lieu</span>
                </h4>
                {selectedDelivery.adresseDetails?.image_adress ? (
                  <div className="relative w-full rounded-lg overflow-hidden border border-border/50 bg-muted/20">
                    <img
                      src={selectedDelivery.adresseDetails.image_adress}
                      alt="Photo du lieu"
                      className="w-full h-auto max-h-48 object-cover"
                      onError={(e) => {
                        (e.target as HTMLImageElement).src = "/placeholder-image.jpg";
                      }}
                    />
                  </div>
                ) : (
                  <div className="flex items-center justify-center p-6 bg-muted/20 rounded-lg border border-dashed border-border">
                    <p className="text-sm text-muted-foreground">Aucune photo disponible</p>
                  </div>
                )}
              </div>

              {/* DÉTAILS DE LA COMMANDE */}
              <div className="bg-muted/10 rounded-xl p-4 border border-border/50">
                <button
                  onClick={() => setShowCommandeDetails(!showCommandeDetails)}
                  className="w-full flex items-center justify-between text-sm font-semibold"
                >
                  <span className="flex items-center gap-2">
                    <Package className="h-4 w-4 text-primary flex-shrink-0" />
                    <span>Détails de la commande</span>
                  </span>
                  {showCommandeDetails ? (
                    <ChevronUp className="h-4 w-4 flex-shrink-0" />
                  ) : (
                    <ChevronDown className="h-4 w-4 flex-shrink-0" />
                  )}
                </button>
                
                {showCommandeDetails && (
                  <div className="mt-3 space-y-3 pt-3 border-t border-border/50">
                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <p className="text-xs text-muted-foreground">N° commande</p>
                        <p className="text-sm font-mono truncate">{selectedDelivery.trackingNumber}</p>
                      </div>
                      <div>
                        <p className="text-xs text-muted-foreground">Date</p>
                        <p className="text-sm">
                          {selectedDelivery.createdAt.toLocaleDateString("fr-FR")}
                        </p>
                      </div>
                      <div>
                        <p className="text-xs text-muted-foreground">Statut</p>
                        <span
                          className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium ${getStatusConfig(selectedDelivery.status).bg} ${getStatusConfig(selectedDelivery.status).text}`}
                        >
                          {React.createElement(getStatusConfig(selectedDelivery.status).icon, { className: "w-3 h-3" })}
                          {getStatusConfig(selectedDelivery.status).label}
                        </span>
                      </div>
                      <div>
                        <p className="text-xs text-muted-foreground">Total</p>
                        <p className="text-sm font-semibold text-primary">
                          {selectedDelivery.amount.toFixed(2)} Ar
                        </p>
                      </div>
                    </div>

                    {selectedDelivery.produits && selectedDelivery.produits.length > 0 && (
                      <div>
                        <p className="text-xs text-muted-foreground mb-2">Articles commandés</p>
                        <div className="space-y-1 max-h-32 overflow-y-auto">
                          {selectedDelivery.produits.slice(0, 5).map((produit: any, index: number) => (
                            <div key={index} className="flex justify-between text-sm border-b border-border/30 pb-1">
                              <span className="truncate mr-2">{produit.nom || produit.titre || "Produit"}</span>
                              <span className="text-muted-foreground whitespace-nowrap">
                                {produit.quantite || 1} × {produit.prix_unitaire || 0} Ar
                              </span>
                            </div>
                          ))}
                          {selectedDelivery.produits.length > 5 && (
                            <p className="text-xs text-muted-foreground text-center">
                              + {selectedDelivery.produits.length - 5} autre(s) article(s)
                            </p>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>

            {/* Footer - sticky */}
            {selectedDelivery.status !== "delivered" && selectedDelivery.status !== "cancelled" ? (
              <div className="sticky bottom-0 flex flex-col sm:flex-row gap-3 p-4 border-t border-border bg-card rounded-b-2xl">
                <button
                  onClick={() => {
                    setShowDetailsModal(false);
                  }}
                  className="flex-1 px-4 py-2.5 rounded-xl border border-border text-sm font-medium hover:bg-muted/30 transition-colors order-2 sm:order-1"
                >
                  Fermer
                </button>
                <button
                  onClick={() => marquerLivree(selectedDelivery.commande_uuid)}
                  disabled={actionInProgress === selectedDelivery.id}
                  className="flex-1 inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-emerald-500 text-white text-sm font-medium hover:bg-emerald-600 transition-all disabled:opacity-50 order-1 sm:order-2"
                >
                  {actionInProgress === selectedDelivery.id ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Gift className="h-4 w-4" />
                  )}
                  Marquer livrée
                </button>
              </div>
            ) : (
              <div className="sticky bottom-0 flex flex-col sm:flex-row gap-3 p-4 border-t border-border bg-card rounded-b-2xl">
                <button
                  onClick={() => {
                    setShowDetailsModal(false);
                  }}
                  className="flex-1 px-4 py-2.5 rounded-xl border border-border text-sm font-medium hover:bg-muted/30 transition-colors"
                >
                  Fermer
                </button>
                <div className="flex-1 text-center py-2.5 text-sm font-medium text-emerald-600 bg-emerald-50 rounded-xl">
                  <CheckCircle className="w-4 h-4 inline-block mr-2" />
                  Livraison confirmée
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Modal photos plein écran */}
      {showFullPhoto && selectedDelivery && selectedDelivery.clientPhotos && (
        <div
          className="fixed inset-0 bg-black/80 flex items-center justify-center z-[200] p-4"
          onClick={() => setShowFullPhoto(false)}
        >
          <div
            className="relative max-w-3xl w-full"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={() => setShowFullPhoto(false)}
              className="absolute -top-12 right-0 p-2 rounded-full bg-white/10 hover:bg-white/20 transition"
            >
              <X className="w-6 h-6 text-white" />
            </button>

            {selectedDelivery.clientPhotos.length > 1 && (
              <>
                <button
                  onClick={() =>
                    setSelectedPhotoIndex((prev) =>
                      prev === 0
                        ? selectedDelivery.clientPhotos!.length - 1
                        : prev - 1
                    )
                  }
                  className="absolute left-2 top-1/2 -translate-y-1/2 p-2 rounded-full bg-black/50 hover:bg-black/70 transition"
                >
                  <ChevronLeft className="w-6 h-6 text-white" />
                </button>
                <button
                  onClick={() =>
                    setSelectedPhotoIndex((prev) =>
                      prev === selectedDelivery.clientPhotos!.length - 1
                        ? 0
                        : prev + 1
                    )
                  }
                  className="absolute right-2 top-1/2 -translate-y-1/2 p-2 rounded-full bg-black/50 hover:bg-black/70 transition"
                >
                  <ChevronRight className="w-6 h-6 text-white" />
                </button>
              </>
            )}

            <img
              src={selectedDelivery.clientPhotos[selectedPhotoIndex]}
              alt="Photo client"
              className="w-full h-auto max-h-[85vh] object-contain rounded-xl shadow-2xl"
            />

            {selectedDelivery.clientPhotos.length > 1 && (
              <>
                <div className="flex justify-center gap-2 mt-4">
                  {selectedDelivery.clientPhotos.map((_, idx) => (
                    <button
                      key={idx}
                      onClick={() => setSelectedPhotoIndex(idx)}
                      className={`h-1.5 rounded-full transition-all ${
                        idx === selectedPhotoIndex
                          ? "bg-white w-6"
                          : "bg-white/40 w-2"
                      }`}
                    />
                  ))}
                </div>
                <p className="text-center text-sm text-white/60 mt-2">
                  {selectedPhotoIndex + 1} /{" "}
                  {selectedDelivery.clientPhotos.length}
                </p>
              </>
            )}
          </div>
        </div>
      )}

      <style>{`
        @keyframes fade-up {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-fade-up { animation: fade-up 0.3s ease-out both; }

        @keyframes modal-in {
          from { opacity: 0; transform: scale(0.95) translateY(20px); }
          to { opacity: 1; transform: scale(1) translateY(0); }
        }
        .animate-modal-in { animation: modal-in 0.3s ease-out both; }
        
        @media (max-width: 640px) {
          .max-w-2xl {
            max-width: 100%;
            margin: 0 8px;
            max-height: 95vh;
          }
        }
        
        .overflow-y-auto::-webkit-scrollbar {
          width: 4px;
        }
        .overflow-y-auto::-webkit-scrollbar-track {
          background: transparent;
        }
        .overflow-y-auto::-webkit-scrollbar-thumb {
          background: #cbd5e1;
          border-radius: 10px;
        }
        .overflow-y-auto::-webkit-scrollbar-thumb:hover {
          background: #94a3b8;
        }
      `}</style>
    </div>
  );
};

export default LivreurLivraisons;