import { useState, useEffect } from "react";
import { 
  Heart, 
  Search, 
  Loader2,
  Send,
  RefreshCcw,
  Mail,
  ShoppingBag,
  User,
  Package,
  XCircle,
  Star
} from "lucide-react";
import { toast } from "sonner";
import api from "@/service/api";
import ProductImage from "@/components/ProductImage";

// Types
type Utilisateur = {
  id: number;
  prenom: string;
  nom: string;
  email: string;
  telephone: string | null;
  statut: string;
  date_creation: string;
};

type Produit = {
  id: number;
  nom: string;
  prix: number;
  image_url?: string;
  slug?: string;
  images?: any[];
  image?: string | null;
  reference?: string;
};

type FavoriItem = {
  id: number;
  utilisateur_id: number;
  produit_id: number;
  date_creation: string;
  produit?: Produit;
};

type UtilisateurAvecFavoris = {
  id: number;
  prenom: string;
  nom: string;
  email: string;
  telephone: string | null;
  statut: string;
  date_creation: string;
  favoris: FavoriItem[];
  total_favoris: number;
};

// Composant principal
const AdminFavoris = () => {
  const [utilisateurs, setUtilisateurs] = useState<UtilisateurAvecFavoris[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedUtilisateur, setSelectedUtilisateur] = useState<UtilisateurAvecFavoris | null>(null);
  const [showDetails, setShowDetails] = useState(false);
  const [sendingEmail, setSendingEmail] = useState<number | null>(null);
  const [stats, setStats] = useState({
    totalUsers: 0,
    usersWithFavorites: 0,
    totalFavorites: 0,
    avgFavoritesPerUser: 0,
  });

  useEffect(() => {
    fetchUtilisateursAvecFavoris();
    fetchStats();
  }, []);

  const fetchUtilisateursAvecFavoris = async () => {
    try {
      setIsLoading(true);
      
      const response = await api.get('/admin/utilisateurs-avec-favoris');
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
      toast.error(error.response?.data?.message || "Impossible de charger les favoris");
    } finally {
      setIsLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      const response = await api.get('/admin/favoris/stats');
      if (response.data.data) {
        setStats({
          totalUsers: response.data.data.total_utilisateurs || 0,
          usersWithFavorites: response.data.data.utilisateurs_avec_favoris || 0,
          totalFavorites: response.data.data.total_favoris || 0,
          avgFavoritesPerUser: response.data.data.moyenne_favoris_par_utilisateur || 0,
        });
      }
    } catch (error: any) {
      console.error("Erreur chargement stats:", error);
    }
  };

  const sendEmailFavoris = async (utilisateur: UtilisateurAvecFavoris) => {
    if (utilisateur.total_favoris === 0) {
      toast.error("Cet utilisateur n'a aucun favori à envoyer");
      return;
    }
    
    setSendingEmail(utilisateur.id);
    
    try {
      // Générer le HTML des produits avec images
      const produitsListHtml = utilisateur.favoris.map((fav: FavoriItem) => {
        const produit = fav.produit;
        if (!produit) return '';
        
        // Récupérer l'URL de l'image
        let imageUrl = '/image/placeholder.jpg';
        if (produit.images && produit.images.length > 0) {
          imageUrl = produit.images[0]?.url || produit.image_url || '/image/placeholder.jpg';
        } else if (produit.image_url) {
          imageUrl = produit.image_url;
        } else if (produit.image) {
          const baseUrl = import.meta.env.VITE_API_URL || 'http://localhost:8000';
          let fileName = produit.image;
          if (fileName.includes('/')) {
            fileName = fileName.split('/').pop() || fileName;
          }
          imageUrl = `${baseUrl}/image/${fileName}`;
        }
        
        return `
          <div style="display: inline-block; width: 200px; margin: 10px; padding: 10px; border: 1px solid #e0e0e0; border-radius: 8px; text-align: center;">
            <img src="${imageUrl}" alt="${produit.nom}" style="width: 100%; height: 150px; object-fit: cover; border-radius: 8px; margin-bottom: 10px;" onerror="this.src='/image/placeholder.jpg'" />
            <h4 style="margin: 10px 0; font-size: 16px; font-weight: bold;">${produit.nom}</h4>
            <p style="color: #e67e22; font-size: 14px; font-weight: bold;">${formatPrice(produit.prix)} Ar</p>
            <a href="${window.location.origin}/produit/${produit.id}" style="display: inline-block; margin-top: 10px; padding: 8px 16px; background-color: #e67e22; color: white; text-decoration: none; border-radius: 5px;">Voir le produit</a>
          </div>
        `;
      }).join('');
      
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
            .produits { display: flex; flex-wrap: wrap; justify-content: center; margin: 20px 0; }
            .footer { text-align: center; margin-top: 30px; padding-top: 20px; border-top: 1px solid #e0e0e0; font-size: 12px; color: #888; }
            .btn { display: inline-block; padding: 12px 24px; background-color: #e67e22; color: white; text-decoration: none; border-radius: 5px; margin-top: 20px; }
            .btn:hover { background-color: #d35400; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>🎁 Vos produits favoris vous attendent !</h1>
            </div>
            <div class="content">
              <h2>Bonjour ${utilisateur.prenom} ${utilisateur.nom},</h2>
              <p>Nous avons remarqué que vous avez montré de l'intérêt pour certains produits sur <strong>Les Casaniers</strong>.</p>
              <p>Ces produits sont toujours disponibles et nous pensons qu'ils pourraient parfaitement répondre à vos besoins.</p>
              
              <h3>❤️ Vos produits favoris (${utilisateur.total_favoris} produit(s)) :</h3>
              <div class="produits">
                ${produitsListHtml}
              </div>
              
              <p>💡 <strong>Pourquoi ne pas franchir le pas ?</strong></p>
              <ul>
                <li>✅ Livraison sécurisée dans toute Madagascar</li>
                <li>✅ Garantie 24 mois sur tous nos produits</li>
                <li>✅ Paiement sécurisé et livraison express</li>
                <li>✅ Service client réactif et à votre écoute</li>
              </ul>
              
              <div style="text-align: center;">
                <a href="${window.location.origin}/catalogue" class="btn">🛒 Découvrir notre catalogue</a>
              </div>
              
              <p style="margin-top: 20px;">N'hésitez pas à nous contacter pour toute question ou demande de configuration personnalisée. Notre équipe se tient à votre disposition pour vous accompagner dans votre choix.</p>
              
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
      
      await api.post('/admin/favoris/envoyer-email', {
        utilisateur_id: utilisateur.id,
        email: utilisateur.email,
        sujet: `❤️ Vos produits favoris vous attendent chez Les Casaniers !`,
        contenu_html: emailHtml,
      });
      
      toast.success(`Email envoyé avec succès à ${utilisateur.prenom} ${utilisateur.nom}`);
      
    } catch (error: any) {
      console.error("Erreur envoi email:", error);
      toast.error(error.response?.data?.message || "Impossible d'envoyer l'email");
    } finally {
      setSendingEmail(null);
    }
  };

  const formatPrice = (prix: number) => {
    return new Intl.NumberFormat('fr-FR').format(prix);
  };

  const getInitials = (prenom: string, nom: string) => {
    return `${prenom.charAt(0)}${nom.charAt(0)}`.toUpperCase();
  };

  const utilisateursFiltres = utilisateurs.filter(user => {
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
        <p className="text-muted-foreground">Chargement des favoris...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Gestion des favoris clients</h1>
          <p className="text-muted-foreground">Consultez les favoris de vos clients et envoyez-leur des rappels personnalisés</p>
        </div>
        <button
          onClick={fetchUtilisateursAvecFavoris}
          className="inline-flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition"
        >
          <RefreshCcw className="h-4 w-4" />
          Actualiser
        </button>
      </div>

      {/* Statistiques */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-card border border-border rounded-xl p-4 text-center">
          <User className="h-6 w-6 text-primary mx-auto mb-2" />
          <p className="text-2xl font-bold text-foreground">{stats.totalUsers}</p>
          <p className="text-xs text-muted-foreground">Total clients</p>
        </div>
        <div className="bg-card border border-border rounded-xl p-4 text-center">
          <Heart className="h-6 w-6 text-rose-500 mx-auto mb-2" />
          <p className="text-2xl font-bold text-foreground">{stats.usersWithFavorites}</p>
          <p className="text-xs text-muted-foreground">Clients avec favoris</p>
        </div>
        <div className="bg-card border border-border rounded-xl p-4 text-center">
          <Star className="h-6 w-6 text-yellow-500 mx-auto mb-2" />
          <p className="text-2xl font-bold text-foreground">{stats.totalFavorites}</p>
          <p className="text-xs text-muted-foreground">Total favoris</p>
        </div>
        <div className="bg-card border border-border rounded-xl p-4 text-center">
          <Mail className="h-6 w-6 text-primary mx-auto mb-2" />
          <p className="text-2xl font-bold text-foreground">{stats.avgFavoritesPerUser}</p>
          <p className="text-xs text-muted-foreground">Moyenne/client</p>
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
          <Heart className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-foreground mb-2">Aucun client trouvé</h3>
          <p className="text-muted-foreground">
            {searchTerm ? "Aucun client ne correspond à votre recherche" : "Aucun client pour le moment"}
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
                      <p className="text-xs text-muted-foreground">{utilisateur.email}</p>
                      {utilisateur.telephone && (
                        <p className="text-xs text-muted-foreground mt-0.5">{utilisateur.telephone}</p>
                      )}
                    </div>
                  </div>
                  
                  {/* Nombre de favoris */}
                  <div className="mt-3">
                    <div className="inline-flex items-center gap-1.5 px-2 py-1 rounded-full text-xs font-medium border">
                      <Heart className={`h-3 w-3 ${utilisateur.total_favoris > 0 ? 'text-rose-500' : 'text-muted-foreground'}`} />
                      <span className={utilisateur.total_favoris > 0 ? 'text-rose-500' : 'text-muted-foreground'}>
                        {utilisateur.total_favoris} produit(s) favori(s)
                      </span>
                    </div>
                  </div>
                  
                  {/* Mini aperçu des produits favoris avec ProductImage */}
                  {utilisateur.favoris && utilisateur.favoris.length > 0 && (
                    <div className="mt-3 flex items-center gap-2 flex-wrap">
                      {utilisateur.favoris.slice(0, 3).map((fav) => (
                        <div key={fav.id} className="relative group">
                          <div className="w-12 h-12 rounded-lg overflow-hidden border border-border">
                            <ProductImage 
                              produit={fav.produit} 
                              className="w-full h-full"
                              showReference={false}
                            />
                          </div>
                          <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition rounded-lg flex items-center justify-center">
                            <span className="text-white text-[8px] text-center px-1">{fav.produit?.nom}</span>
                          </div>
                        </div>
                      ))}
                      {utilisateur.favoris.length > 3 && (
                        <div className="w-12 h-12 rounded-lg bg-muted flex items-center justify-center">
                          <span className="text-xs text-muted-foreground">+{utilisateur.favoris.length - 3}</span>
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
                    title="Voir tous les favoris"
                  >
                    <Heart className="h-4 w-4" />
                  </button>
                  
                  {utilisateur.total_favoris > 0 && (
                    <button
                      onClick={() => sendEmailFavoris(utilisateur)}
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
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* MODAL DÉTAILS FAVORIS */}
      {showDetails && selectedUtilisateur && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="bg-background border border-border rounded-2xl shadow-2xl w-full max-w-3xl max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-background border-b border-border p-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-primary/10 rounded-xl">
                    <Heart className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <h2 className="font-bold text-lg text-foreground">
                      Favoris de {selectedUtilisateur.prenom} {selectedUtilisateur.nom}
                    </h2>
                    <p className="text-xs text-muted-foreground">{selectedUtilisateur.email}</p>
                  </div>
                </div>
                <button onClick={() => setShowDetails(false)} className="p-1.5 rounded-lg hover:bg-secondary transition">
                  <XCircle className="h-5 w-5 text-muted-foreground" />
                </button>
              </div>
            </div>
            
            <div className="p-6">
              {!selectedUtilisateur.favoris || selectedUtilisateur.favoris.length === 0 ? (
                <div className="text-center py-12">
                  <Heart className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <p className="text-muted-foreground">Cet utilisateur n'a aucun produit favori</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {selectedUtilisateur.favoris.map((fav) => (
                    <div key={fav.id} className="flex gap-4 p-4 bg-card border border-border rounded-xl hover:shadow-md transition">
                      <div className="w-24 h-24 rounded-lg overflow-hidden border border-border flex-shrink-0">
                        <ProductImage 
                          produit={fav.produit} 
                          className="w-full h-full"
                          showReference={false}
                        />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="font-semibold text-foreground line-clamp-2">{fav.produit?.nom}</h3>
                        <p className="text-lg font-bold text-primary mt-1">{formatPrice(fav.produit?.prix || 0)} Ar</p>
                        <div className="flex items-center gap-2 mt-2">
                          <a
                            href={`/produit/${fav.produit?.id}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1 text-xs text-primary hover:underline"
                          >
                            <ShoppingBag className="h-3 w-3" />
                            Voir le produit
                          </a>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
            
            <div className="sticky bottom-0 bg-background border-t border-border p-4 flex gap-3">
              {selectedUtilisateur.favoris && selectedUtilisateur.favoris.length > 0 && (
                <button
                  onClick={() => {
                    sendEmailFavoris(selectedUtilisateur);
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
                      Envoyer un email à {selectedUtilisateur.prenom}
                    </>
                  )}
                </button>
              )}
              <button onClick={() => setShowDetails(false)} className="flex-1 py-2 text-sm font-medium border border-border rounded-lg hover:bg-secondary transition">
                Fermer
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminFavoris;