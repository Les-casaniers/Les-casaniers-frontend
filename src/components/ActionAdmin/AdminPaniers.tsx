import { useState, useEffect } from "react";
import {
  ShoppingCart,
  Search,
  Loader2,
  Send,
  RefreshCcw,
  User,
  Package,
  XCircle,
  DollarSign,
  Eye,
} from "lucide-react";
import { toast } from "sonner";
import api from "@/service/api";

// Types
type Produit = {
  id: number;
  nom: string;
  prix: number;
  image_url?: string;
  slug?: string;
  images?: any[];
  image?: string | null;
};

type PanierItem = {
  id: number;
  produit_id: number;
  titre: string;
  prix_unitaire: number;
  quantite: number;
  statut: string;
  date_creation: string;
  produit?: Produit;
};

type UtilisateurAvecPanier = {
  id: number;
  prenom: string;
  nom: string;
  email: string;
  telephone: string | null;
  statut: string;
  date_creation: string;
  paniers: PanierItem[];
  total_paniers: number;
  montant_total: number;
};

// Composant ImageProduit réutilisable
const ProductImageItem = ({ 
  produit, 
  className = "w-12 h-12 rounded-lg object-cover border border-border",
  fallbackClassName = "w-12 h-12 rounded-lg bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center border border-border"
}: { 
  produit?: Produit | null;
  className?: string;
  fallbackClassName?: string;
}) => {
  const [imageError, setImageError] = useState(false);
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    setImageError(false);
    setIsLoading(true);

    const extractImage = (obj: any): string | null => {
      if (!obj) return null;

      if (obj.images && Array.isArray(obj.images) && obj.images.length > 0) {
        const firstImage = obj.images[0];
        if (firstImage && typeof firstImage === 'object') {
          if (firstImage.url) return firstImage.url;
          if (firstImage.path) return firstImage.path;
          if (firstImage.filename) return firstImage.filename;
        }
        if (typeof firstImage === 'string') return firstImage;
      }

      const imageFields = ['image', 'image_url', 'photo', 'url_image'];
      for (const field of imageFields) {
        const value = obj[field];
        if (value && typeof value === 'string' && value.trim() !== '') {
          return value;
        }
      }

      return null;
    };

    const imageSource = extractImage(produit);
    console.log(`🎯 Source d'image pour produit ${produit?.id}:`, imageSource);

    if (!imageSource) {
      setImageUrl(null);
      setIsLoading(false);
      return;
    }

    if (imageSource.startsWith('data:image')) {
      setImageUrl(imageSource);
      setIsLoading(false);
      return;
    }

    if (imageSource.startsWith('http://') || imageSource.startsWith('https://')) {
      setImageUrl(imageSource);
      setIsLoading(false);
      return;
    }

    const baseUrl = import.meta.env.VITE_API_URL || 'http://localhost:8000';
    let fileName = imageSource;
    if (fileName.includes('/')) {
      fileName = fileName.split('/').pop() || fileName;
    }

    const finalUrl = `${baseUrl}/image/${fileName}`;
    console.log(`🔗 URL finale:`, finalUrl);
    setImageUrl(finalUrl);
    setIsLoading(false);
  }, [produit]);

  // Si pas de produit ou pas d'image
  if (!produit) {
    return (
      <div className={fallbackClassName}>
        <Package className="h-6 w-6 text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className={`relative ${className}`}>
      {isLoading ? (
        <div className={`${className} flex items-center justify-center bg-gray-100`}>
          <Loader2 className="h-4 w-4 animate-spin text-primary" />
        </div>
      ) : imageUrl && !imageError ? (
        <img
          src={imageUrl}
          alt={produit.nom || 'Produit'}
          className={className}
          onError={() => {
            console.error(`❌ Erreur chargement image:`, imageUrl);
            setImageError(true);
          }}
          onLoad={() => {
            console.log(`✅ Image chargée avec succès: ${produit.nom}`);
          }}
          loading="lazy"
        />
      ) : (
        <div className={fallbackClassName}>
          <Package className="h-6 w-6 text-muted-foreground" />
        </div>
      )}
    </div>
  );
};

// Composant principal
const AdminPaniers = () => {
  const [utilisateurs, setUtilisateurs] = useState<UtilisateurAvecPanier[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedUtilisateur, setSelectedUtilisateur] =
    useState<UtilisateurAvecPanier | null>(null);
  const [showDetails, setShowDetails] = useState(false);
  const [sendingEmail, setSendingEmail] = useState<number | null>(null);
  const [stats, setStats] = useState({
    totalUtilisateurs: 0,
    totalPaniers: 0,
    montantTotalPerdu: 0,
  });

  useEffect(() => {
    fetchUtilisateursAvecPaniers();
    fetchStats();
  }, []);

  const fetchUtilisateursAvecPaniers = async () => {
    try {
      setIsLoading(true);

      const response = await api.get("/admin/utilisateurs-avec-paniers");
      console.log("Réponse API:", response.data);

      let utilisateursData = [];
      if (response.data.data && Array.isArray(response.data.data)) {
        utilisateursData = response.data.data;
      } else if (Array.isArray(response.data)) {
        utilisateursData = response.data;
      } else {
        utilisateursData = [];
      }

      setUtilisateurs(utilisateursData);
    } catch (error: any) {
      console.error("Erreur chargement données:", error);
      toast.error(
        error.response?.data?.message || "Impossible de charger les paniers",
      );
    } finally {
      setIsLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      const response = await api.get("/admin/paniers/stats");
      console.log("Stats API response:", response.data);
      
      if (response.data.data) {
        setStats({
          totalUtilisateurs: response.data.data.total_utilisateurs || 0,
          totalPaniers: response.data.data.total_paniers || 0,
          montantTotalPerdu: response.data.data.montant_total_perdu || 0,
        });
      }
    } catch (error: any) {
      console.error("Erreur chargement stats:", error);
    }
  };

  const sendEmailRappel = async (utilisateur: UtilisateurAvecPanier) => {
    if (utilisateur.total_paniers === 0) {
      toast.error("Cet utilisateur n'a aucun panier");
      return;
    }

    setSendingEmail(utilisateur.id);

    try {
      // Générer le contenu HTML de l'email
      const produitsListHtml = utilisateur.paniers
        .map((item) => {
          const produit = item.produit;
          const sousTotal = item.prix_unitaire * item.quantite;
          
          // Récupérer l'URL de l'image pour l'email
          let imageUrl = "/image/placeholder.jpg";
          if (produit) {
            const imageSource = produit.image_url || 
                              (produit.images && produit.images.length > 0 ? produit.images[0]?.url : null) ||
                              produit.image ||
                              null;
            if (imageSource) {
              if (imageSource.startsWith('http')) {
                imageUrl = imageSource;
              } else {
                const baseUrl = import.meta.env.VITE_API_URL || 'http://localhost:8000';
                let fileName = imageSource;
                if (fileName.includes('/')) {
                  fileName = fileName.split('/').pop() || fileName;
                }
                imageUrl = `${baseUrl}/image/${fileName}`;
              }
            }
          }
          
          return `
          <div style="display: flex; align-items: center; gap: 15px; margin: 10px 0; padding: 10px; border: 1px solid #e0e0e0; border-radius: 8px;">
            <img src="${imageUrl}" alt="${item.titre}" style="width: 80px; height: 80px; object-fit: cover; border-radius: 8px;" onerror="this.src='/image/placeholder.jpg'" />
            <div style="flex: 1;">
              <h4 style="margin: 0 0 5px; font-size: 16px; font-weight: bold;">${item.titre}</h4>
              <p style="margin: 0; color: #666;">Quantité: ${item.quantite}</p>
              <p style="margin: 5px 0 0; color: #e67e22; font-weight: bold;">${formatPrice(item.prix_unitaire)} Ar</p>
            </div>
            <div style="text-align: right;">
              <p style="margin: 0; font-weight: bold;">Total: ${formatPrice(sousTotal)} Ar</p>
            </div>
          </div>
        `;
        })
        .join("");

      const emailHtml = `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="UTF-8">
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: linear-gradient(135deg, #e67e22, #d35400); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
            .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
            .footer { text-align: center; margin-top: 30px; padding-top: 20px; border-top: 1px solid #e0e0e0; font-size: 12px; color: #888; }
            .btn { display: inline-block; padding: 12px 24px; background-color: #e67e22; color: white; text-decoration: none; border-radius: 5px; margin-top: 20px; }
            .btn:hover { background-color: #d35400; }
            .total-box { background: #fff3e0; padding: 15px; border-radius: 8px; text-align: center; margin: 20px 0; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>🛒 Votre panier vous attend !</h1>
            </div>
            <div class="content">
              <h2>Bonjour ${utilisateur.prenom} ${utilisateur.nom},</h2>
              <p>Nous avons remarqué que vous avez laissé des articles dans votre panier sur <strong>Les Casaniers</strong>.</p>
              <p>Ces produits sont toujours disponibles et n'attendent plus que vous pour rejoindre votre configuration idéale. Finalisez votre commande dès maintenant et profitez de la livraison rapide dans toute Madagascar !</p>
              
              <h3>📦 Votre panier (${utilisateur.total_paniers} article(s)) :</h3>
              ${produitsListHtml}
              
              <div class="total-box">
                <p style="margin: 0; font-size: 18px; font-weight: bold;">Total de votre panier</p>
                <p style="margin: 10px 0 0; font-size: 24px; color: #e67e22; font-weight: bold;">${formatPrice(utilisateur.montant_total)} Ar</p>
              </div>
              
              <p>💡 <strong>Pourquoi finaliser votre commande ?</strong></p>
              <ul>
                <li>✅ Livraison sécurisée dans toute Madagascar</li>
                <li>✅ Garantie 24 mois sur tous nos produits</li>
                <li>✅ Paiement sécurisé (Mobile Money, Virement, Espèces)</li>
                <li>✅ Service client réactif et à votre écoute</li>
              </ul>
              
              <div style="text-align: center;">
                <a href="${window.location.origin}/panier" class="btn">🛍️ Finaliser ma commande</a>
              </div>
              
              <p style="margin-top: 20px;">N'hésitez pas à nous contacter pour toute question ou demande de configuration personnalisée. Notre équipe se tient à votre disposition.</p>
              
              <p>Cordialement,<br>
              <strong>L'équipe Les Casaniers</strong><br>
              <span style="font-size: 12px;">🐱 Votre expert PC à Madagascar</span></p>
            </div>
            <div class="footer">
              <p>Les Casaniers - Tananarive, Madagascar<br>
              📞 +261 34 12 345 67 | ✉️ contact@lescasaniers.mg</p>
              <p>Si vous ne souhaitez plus recevoir ce type d'emails, <a href="${window.location.origin}/compte/parametres">cliquez ici</a>.</p>
            </div>
          </div>
        </html>
      `;

      await api.post("/admin/paniers/envoyer-email", {
        utilisateur_id: utilisateur.id,
        email: utilisateur.email,
        sujet: `🛒 Votre panier vous attend chez Les Casaniers !`,
        contenu_html: emailHtml,
      });

      toast.success(
        `Email envoyé avec succès à ${utilisateur.prenom} ${utilisateur.nom}`,
      );
    } catch (error: any) {
      console.error("Erreur envoi email:", error);
      toast.error(
        error.response?.data?.message || "Impossible d'envoyer l'email",
      );
    } finally {
      setSendingEmail(null);
    }
  };

  const formatPrice = (prix: number) => {
    return new Intl.NumberFormat("fr-FR").format(prix);
  };

  const getInitials = (prenom: string, nom: string) => {
    return `${prenom.charAt(0)}${nom.charAt(0)}`.toUpperCase();
  };

  const utilisateursFiltres = utilisateurs.filter((user) => {
    if (!searchTerm) return true;
    const searchLower = searchTerm.toLowerCase();
    return (
      user.nom.toLowerCase().includes(searchLower) ||
      user.prenom.toLowerCase().includes(searchLower) ||
      user.email.toLowerCase().includes(searchLower)
    );
  });

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center py-20">
        <Loader2 className="h-12 w-12 animate-spin text-primary mb-4" />
        <p className="text-muted-foreground">Chargement des paniers...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">
            Paniers abandonnés
          </h1>
          <p className="text-muted-foreground">
            Consultez les paniers non finalisés et envoyez des rappels aux
            clients
          </p>
        </div>
        <button
          onClick={fetchUtilisateursAvecPaniers}
          className="inline-flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition"
        >
          <RefreshCcw className="h-4 w-4" />
          Actualiser
        </button>
      </div>

      {/* 3 Statistiques uniquement */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-card border border-border rounded-xl p-4 text-center">
          <User className="h-6 w-6 text-primary mx-auto mb-2" />
          <p className="text-2xl font-bold text-foreground">
            {stats.totalUtilisateurs}
          </p>
          <p className="text-xs text-muted-foreground">Clients avec panier</p>
        </div>
        <div className="bg-card border border-border rounded-xl p-4 text-center">
          <Package className="h-6 w-6 text-orange-500 mx-auto mb-2" />
          <p className="text-2xl font-bold text-foreground">
            {stats.totalPaniers}
          </p>
          <p className="text-xs text-muted-foreground">Produits dans paniers</p>
        </div>
        <div className="bg-card border border-border rounded-xl p-4 text-center">
          <DollarSign className="h-6 w-6 text-green-500 mx-auto mb-2" />
          <p className="text-2xl font-bold text-foreground">
            {formatPrice(stats.montantTotalPerdu)} Ar
          </p>
          <p className="text-xs text-muted-foreground">
            Chiffre d'affaires potentiel
          </p>
        </div>
      </div>

      {/* Recherche */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <input
          type="text"
          placeholder="Rechercher par nom, prénom ou email..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full pl-9 pr-4 py-2 text-sm border border-border rounded-lg bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
        />
      </div>

      {/* Liste des utilisateurs */}
      {utilisateursFiltres.length === 0 ? (
        <div className="bg-card border border-border rounded-2xl p-12 text-center">
          <ShoppingCart className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-foreground mb-2">
            Aucun panier trouvé
          </h3>
          <p className="text-muted-foreground">
            {searchTerm
              ? "Aucun client ne correspond à votre recherche"
              : "Aucun panier pour le moment"}
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {utilisateursFiltres.map((utilisateur) => (
            <div
              key={utilisateur.id}
              className="bg-card border border-border rounded-xl p-4 hover:shadow-md transition"
            >
              <div className="flex flex-wrap items-start justify-between gap-4">
                {/* Infos client */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-3 flex-wrap">
                    <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                      <span className="text-sm font-bold text-primary">
                        {getInitials(utilisateur.prenom, utilisateur.nom)}
                      </span>
                    </div>
                    <div>
                      <p className="font-semibold text-foreground">
                        {utilisateur.prenom} {utilisateur.nom}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {utilisateur.email}
                      </p>
                      {utilisateur.telephone && (
                        <p className="text-xs text-muted-foreground mt-0.5">
                          {utilisateur.telephone}
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Statistiques panier */}
                  <div className="mt-3 flex flex-wrap gap-3">
                    <div className="inline-flex items-center gap-1.5 px-2 py-1 rounded-full text-xs font-medium border">
                      <Package className="h-3 w-3 text-primary" />
                      <span>{utilisateur.total_paniers} produit(s)</span>
                    </div>
                    <div className="inline-flex items-center gap-1.5 px-2 py-1 rounded-full text-xs font-medium border">
                      <DollarSign className="h-3 w-3 text-green-500" />
                      <span>{formatPrice(utilisateur.montant_total)} Ar</span>
                    </div>
                  </div>

                  {/* Mini aperçu des produits avec images */}
                  {utilisateur.paniers && utilisateur.paniers.length > 0 && (
                    <div className="mt-3 flex items-center gap-2 flex-wrap">
                      {utilisateur.paniers.slice(0, 3).map((item) => (
                        <div key={item.id} className="relative group">
                          <ProductImageItem 
                            produit={item.produit}
                            className="w-12 h-12 rounded-lg object-cover border border-border"
                            fallbackClassName="w-12 h-12 rounded-lg bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center border border-border"
                          />
                          <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition rounded-lg flex items-center justify-center">
                            <span className="text-white text-[8px] text-center px-1">
                              {item.titre}
                            </span>
                          </div>
                        </div>
                      ))}
                      {utilisateur.paniers.length > 3 && (
                        <div className="w-12 h-12 rounded-lg bg-muted flex items-center justify-center">
                          <span className="text-xs text-muted-foreground">
                            +{utilisateur.paniers.length - 3}
                          </span>
                        </div>
                      )}
                    </div>
                  )}
                </div>

                {/* Actions */}
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => {
                      setSelectedUtilisateur(utilisateur);
                      setShowDetails(true);
                    }}
                    className="p-2 rounded-lg text-muted-foreground hover:text-primary hover:bg-primary/10 transition"
                    title="Voir tous les produits"
                  >
                    <Eye className="h-4 w-4" />
                  </button>

                  <button
                    onClick={() => sendEmailRappel(utilisateur)}
                    disabled={sendingEmail === utilisateur.id}
                    className="inline-flex items-center gap-2 px-3 py-2 rounded-lg bg-primary text-primary-foreground hover:bg-primary/90 transition disabled:opacity-50"
                    title="Envoyer un email de rappel"
                  >
                    {sendingEmail === utilisateur.id ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <>
                        <Send className="h-4 w-4" />
                        <span className="text-sm">Envoyer</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* MODAL DÉTAILS PANIER */}
      {showDetails && selectedUtilisateur && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="bg-background border border-border rounded-2xl shadow-2xl w-full max-w-3xl max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-background border-b border-border p-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-primary/10 rounded-xl">
                    <ShoppingCart className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <h2 className="font-bold text-lg text-foreground">
                      Panier de {selectedUtilisateur.prenom}{" "}
                      {selectedUtilisateur.nom}
                    </h2>
                    <p className="text-xs text-muted-foreground">
                      {selectedUtilisateur.email}
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => setShowDetails(false)}
                  className="p-1.5 rounded-lg hover:bg-secondary transition"
                >
                  <XCircle className="h-5 w-5 text-muted-foreground" />
                </button>
              </div>
            </div>

            <div className="p-6">
              {!selectedUtilisateur.paniers ||
              selectedUtilisateur.paniers.length === 0 ? (
                <div className="text-center py-12">
                  <ShoppingCart className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <p className="text-muted-foreground">
                    Ce client n'a aucun panier
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  {selectedUtilisateur.paniers.map((item) => (
                    <div
                      key={item.id}
                      className="flex gap-4 p-4 bg-card border border-border rounded-xl hover:shadow-md transition"
                    >
                      <ProductImageItem 
                        produit={item.produit}
                        className="w-24 h-24 rounded-lg object-cover border border-border"
                        fallbackClassName="w-24 h-24 rounded-lg bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center border border-border"
                      />
                      <div className="flex-1 min-w-0">
                        <h3 className="font-semibold text-foreground">
                          {item.titre}
                        </h3>
                        <div className="flex gap-4 mt-1 text-sm text-muted-foreground">
                          <span>Quantité: {item.quantite}</span>
                          <span>
                            Prix unitaire: {formatPrice(item.prix_unitaire)} Ar
                          </span>
                        </div>
                        <p className="text-lg font-bold text-primary mt-2">
                          Total:{" "}
                          {formatPrice(item.prix_unitaire * item.quantite)} Ar
                        </p>
                      </div>
                    </div>
                  ))}

                  <div className="bg-primary/5 rounded-xl p-4 text-center border border-primary/20">
                    <p className="text-lg font-semibold">Total du panier</p>
                    <p className="text-2xl font-bold text-primary mt-1">
                      {formatPrice(selectedUtilisateur.montant_total)} Ar
                    </p>
                  </div>
                </div>
              )}
            </div>

            <div className="sticky bottom-0 bg-background border-t border-border p-4 flex gap-3">
              {selectedUtilisateur.paniers &&
                selectedUtilisateur.paniers.length > 0 && (
                  <button
                    onClick={() => {
                      sendEmailRappel(selectedUtilisateur);
                      setShowDetails(false);
                    }}
                    disabled={sendingEmail === selectedUtilisateur.id}
                    className="flex-1 py-2 text-sm font-medium bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition flex items-center justify-center gap-2"
                  >
                    {sendingEmail === selectedUtilisateur.id ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <>
                        <Send className="h-4 w-4" />
                        Envoyer un rappel à {selectedUtilisateur.prenom}
                      </>
                    )}
                  </button>
                )}
              <button
                onClick={() => setShowDetails(false)}
                className="flex-1 py-2 text-sm font-medium border border-border rounded-lg hover:bg-secondary transition"
              >
                Fermer
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminPaniers;