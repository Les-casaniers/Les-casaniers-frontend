import { useState, useEffect } from "react";
import { Heart, Trash2, ShoppingBag, Eye, Gift, ChevronRight, Loader2 } from "lucide-react";
import { Link } from "react-router-dom";
import { toast } from "sonner";
import { useShop } from "@/store/shop";
import api from "@/service/api";
import ProductImage from "@/components/ProductImage"; // Import du composant partagé

type Produit = {
  id: number;
  categorie_id: number;
  reference: string;
  nom: string;
  description_courte: string;
  description: string;
  type_produit: string;
  prix: number;
  devise: string;
  quantite_stock: number;
  est_dispo: boolean;
  actif: boolean;
  date_creation: string;
  date_modification: string;
  images?: any[];
  image?: string | null;
  image_url?: string;
  photo?: string;
};

type Favori = {
  id: number;
  utilisateur_id: number;
  produit_id: number;
  date_creation: string;
  produit?: Produit;
};

// Le composant ProductImage a été supprimé car il est importé

// Composant DashboardFavoris complet
const DashboardFavoris = () => {
  const [favoris, setFavoris] = useState<Favori[]>([]);
  const [produitsFavoris, setProduitsFavoris] = useState<Produit[]>([]);
  const [recommandations, setRecommandations] = useState<Produit[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedItems, setSelectedItems] = useState<Set<number>>(new Set());
  const { addToCart } = useShop();

  useEffect(() => {
    fetchFavoris();
  }, []);

  const fetchFavoris = async () => {
    try {
      setIsLoading(true);
      
      const response = await api.get('/favoris');
      console.log("=== RÉPONSE FAVORIS ===", response.data);
      
      let favorisData: Favori[] = [];
      if (response.data?.data) {
        favorisData = Array.isArray(response.data.data) ? response.data.data : [];
      } else if (Array.isArray(response.data)) {
        favorisData = response.data;
      } else if (response.data?.favoris) {
        favorisData = response.data.favoris;
      }
      
      setFavoris(favorisData);
      
      if (favorisData.length > 0) {
        const produitIds = favorisData.map(f => f.produit_id);
        console.log("=== IDs PRODUITS ===", produitIds);
        
        const produitsDetails: Produit[] = [];
        
        for (const produitId of produitIds) {
          try {
            const produitResponse = await api.get(`/produits/${produitId}`);
            console.log(`📦 Produit ${produitId}:`, produitResponse.data);
            
            let produit = produitResponse.data?.data || produitResponse.data;
            
            if (produit && produit.actif !== false) {
              produitsDetails.push(produit);
            }
          } catch (error) {
            console.error(`❌ Erreur produit ${produitId}:`, error);
          }
        }
        
        console.log("=== PRODUITS RÉCUPÉRÉS ===", produitsDetails);
        setProduitsFavoris(produitsDetails);
        
        if (produitsDetails.length > 0) {
          await fetchRecommandations(produitsDetails);
        }
      }
      
    } catch (error: any) {
      console.error("Erreur:", error);
      toast.error("Impossible de charger vos favoris");
    } finally {
      setIsLoading(false);
    }
  };

  const fetchRecommandations = async (produitsFavorisList: Produit[]) => {
    try {
      const categoriesFavorites = [...new Set(produitsFavorisList.map(p => p.categorie_id))];
      const produitIdsFavoris = produitsFavorisList.map(p => p.id);
      
      const response = await api.get('/produits', {
        params: {
          ...(categoriesFavorites.length > 0 && { categorie_id: categoriesFavorites[0] }),
          limit: 4
        }
      });
      
      let allProducts: Produit[] = [];
      if (response.data?.data) {
        allProducts = Array.isArray(response.data.data) ? response.data.data : [];
      } else if (Array.isArray(response.data)) {
        allProducts = response.data;
      }
      
      const recommandationsList = allProducts
        .filter(p => !produitIdsFavoris.includes(p.id) && p.actif === true && p.quantite_stock > 0)
        .slice(0, 4);
      
      setRecommandations(recommandationsList);
      
    } catch (error) {
      console.error("Erreur recommandations:", error);
    }
  };

  const handleToggleSelect = (id: number) => {
    setSelectedItems(prev => {
      const newSet = new Set(prev);
      if (newSet.has(id)) {
        newSet.delete(id);
      } else {
        newSet.add(id);
      }
      return newSet;
    });
  };

  const handleSelectAll = () => {
    if (selectedItems.size === produitsFavoris.length) {
      setSelectedItems(new Set());
    } else {
      setSelectedItems(new Set(produitsFavoris.map(p => p.id)));
    }
  };

  const handleRemoveFavori = async (produitId: number, nom: string) => {
    try {
      const favori = favoris.find(f => f.produit_id === produitId);
      if (favori) {
        await api.delete(`/favoris/${favori.id}`);
        setFavoris(favoris.filter(f => f.produit_id !== produitId));
        setProduitsFavoris(produitsFavoris.filter(p => p.id !== produitId));
        setSelectedItems(prev => {
          const newSet = new Set(prev);
          newSet.delete(produitId);
          return newSet;
        });
        toast.success(`${nom} retiré des favoris`);
      }
    } catch (error) {
      console.error("Erreur suppression:", error);
      toast.error("Erreur lors de la suppression");
    }
  };

  const handleRemoveSelected = async () => {
    const itemsToRemove = Array.from(selectedItems);
    let removedCount = 0;
    for (const produitId of itemsToRemove) {
      const favori = favoris.find(f => f.produit_id === produitId);
      if (favori) {
        try {
          await api.delete(`/favoris/${favori.id}`);
          removedCount++;
        } catch (error) {
          console.error("Erreur suppression:", error);
        }
      }
    }
    setFavoris(favoris.filter(f => !itemsToRemove.includes(f.produit_id)));
    setProduitsFavoris(produitsFavoris.filter(p => !itemsToRemove.includes(p.id)));
    setSelectedItems(new Set());
    toast.success(`${removedCount} produit(s) retiré(s) des favoris`);
  };

  const handleAjouterPanier = (produit: Produit) => {
    if (produit.quantite_stock <= 0) {
      toast.error(`${produit.nom} n'est plus en stock`);
      return;
    }
    addToCart(produit.id.toString(), 1);
    toast.success(`${produit.nom} ajouté au panier`);
  };

  const handleAjouterSelectionPanier = () => {
    const selectedProduits = produitsFavoris.filter(p => selectedItems.has(p.id) && p.quantite_stock > 0);
    if (selectedProduits.length === 0) {
      toast.error("Aucun produit sélectionné disponible en stock");
      return;
    }
    selectedProduits.forEach(produit => {
      addToCart(produit.id.toString(), 1);
    });
    toast.success(`${selectedProduits.length} produit(s) ajouté(s) au panier`);
  };

  const handleAjouterToutPanier = () => {
    const enStock = produitsFavoris.filter(p => p.quantite_stock > 0);
    if (enStock.length === 0) {
      toast.error("Aucun produit en stock disponible");
      return;
    }
    enStock.forEach(produit => {
      addToCart(produit.id.toString(), 1);
    });
    toast.success(`${enStock.length} produit(s) ajouté(s) au panier`);
  };

  const handleSupprimerTout = async () => {
    let removedCount = 0;
    for (const favori of favoris) {
      try {
        await api.delete(`/favoris/${favori.id}`);
        removedCount++;
      } catch (error) {
        console.error("Erreur suppression:", error);
      }
    }
    setFavoris([]);
    setProduitsFavoris([]);
    setSelectedItems(new Set());
    toast.success(`${removedCount} favoris supprimés`);
  };

  const formatPrice = (prix: number, devise: string = 'MGA') => {
    return new Intl.NumberFormat('fr-FR').format(prix) + ` ${devise}`;
  };

  const stats = {
    total: produitsFavoris.length,
    enStock: produitsFavoris.filter(p => p.quantite_stock > 0).length,
    valeurTotale: produitsFavoris.reduce((sum, p) => sum + p.prix, 0),
  };

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center py-20">
        <Loader2 className="h-12 w-12 animate-spin text-primary mb-4" />
        <p className="text-muted-foreground">Chargement de vos favoris...</p>
      </div>
    );
  }

  if (produitsFavoris.length === 0) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="relative bg-card border border-border rounded-3xl p-12 text-center max-w-md mx-auto shadow-2xl">
          <div className="relative w-28 h-28 mx-auto mb-6 bg-gradient-to-br from-primary/30 to-secondary rounded-full flex items-center justify-center">
            <Heart className="h-14 w-14 text-primary" strokeWidth={1.5} />
          </div>
          <h2 className="text-2xl font-bold text-foreground mb-3">Votre liste est vide</h2>
          <p className="text-muted-foreground mb-8 leading-relaxed">
            Vous n'avez pas encore ajouté de produits à vos favoris.<br />
            Explorez notre catalogue et cliquez sur le cœur pour ajouter vos produits préférés.
          </p>
          <Link to="/catalogue">
            <button className="inline-flex items-center gap-2 px-8 py-3.5 bg-primary text-primary-foreground rounded-2xl hover:bg-primary/90 transition-all font-medium">
              <span>Découvrir le catalogue</span>
              <ChevronRight className="h-4 w-4" />
            </button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header avec statistiques */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-card via-card to-secondary/50 border border-border/50 p-6">
        <div className="relative flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <Heart className="h-6 w-6 text-rose-500 fill-rose-500/20" />
              <span className="text-sm font-medium text-rose-500 uppercase tracking-wider">Ma wishlist</span>
            </div>
            <h1 className="text-3xl lg:text-4xl font-bold text-foreground tracking-tight">Mes favoris</h1>
            <p className="text-muted-foreground mt-2">
              {produitsFavoris.length} produit{produitsFavoris.length > 1 ? 's' : ''} dans votre liste
            </p>
          </div>
          
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
            <div className="rounded-2xl bg-background/50 backdrop-blur-sm border border-border/50 p-4 text-center">
              <p className="text-2xl font-bold text-foreground">{stats.total}</p>
              <p className="text-xs text-muted-foreground uppercase tracking-wider mt-1">Total</p>
            </div>
            <div className="rounded-2xl bg-background/50 backdrop-blur-sm border border-border/50 p-4 text-center">
              <p className="text-2xl font-bold text-emerald-600">{stats.enStock}</p>
              <p className="text-xs text-muted-foreground uppercase tracking-wider mt-1">En stock</p>
            </div>
            <div className="rounded-2xl bg-background/50 backdrop-blur-sm border border-border/50 p-4 text-center">
              <p className="text-2xl font-bold text-primary">{(stats.valeurTotale / 1000).toFixed(0)}k</p>
              <p className="text-xs text-muted-foreground uppercase tracking-wider mt-1">Valeur</p>
            </div>
          </div>
        </div>
      </div>

      {/* Barre d'actions */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 p-4 bg-gradient-to-r from-secondary/50 to-transparent rounded-2xl border border-border/50">
        <div className="flex items-center gap-6">
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={selectedItems.size === produitsFavoris.length && produitsFavoris.length > 0}
              onChange={handleSelectAll}
              className="w-5 h-5 rounded-md border-2 border-muted-foreground/30 text-primary focus:ring-primary/20 cursor-pointer"
            />
            <span className="text-sm text-muted-foreground">
              {selectedItems.size === produitsFavoris.length ? "Désélectionner tout" : "Tout sélectionner"}
            </span>
          </label>
          {selectedItems.size > 0 && (
            <div className="px-3 py-1 bg-primary/10 rounded-full">
              <span className="text-xs font-medium text-primary">{selectedItems.size} sélectionné(s)</span>
            </div>
          )}
        </div>
        
        <div className="flex flex-wrap gap-3">
          {selectedItems.size > 0 && (
            <>
              <button
                onClick={handleAjouterSelectionPanier}
                className="inline-flex items-center gap-2 px-5 py-2.5 bg-primary/10 text-primary rounded-xl hover:bg-primary hover:text-primary-foreground transition text-sm font-medium"
              >
                <ShoppingBag className="h-4 w-4" />
                <span>Ajouter la sélection</span>
              </button>
              <button
                onClick={handleRemoveSelected}
                className="inline-flex items-center gap-2 px-5 py-2.5 border border-rose-500/30 text-rose-500 rounded-xl hover:bg-rose-500 hover:text-white transition text-sm font-medium"
              >
                <Trash2 className="h-4 w-4" />
                <span>Supprimer ({selectedItems.size})</span>
              </button>
            </>
          )}
          {produitsFavoris.some(p => p.quantite_stock > 0) && (
            <button
              onClick={handleAjouterToutPanier}
              className="inline-flex items-center gap-2 px-5 py-2.5 bg-primary text-primary-foreground rounded-xl hover:bg-primary/90 transition text-sm font-medium"
            >
              <ShoppingBag className="h-4 w-4" />
              <span>Tout ajouter</span>
            </button>
          )}
          <button
            onClick={handleSupprimerTout}
            className="inline-flex items-center gap-2 px-5 py-2.5 border border-border text-muted-foreground rounded-xl hover:bg-secondary hover:text-foreground transition text-sm font-medium"
          >
            <Trash2 className="h-4 w-4" />
            <span>Tout supprimer</span>
          </button>
        </div>
      </div>

      {/* Grille des produits favoris */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {produitsFavoris.map((produit) => (
          <div
            key={produit.id}
            className={`group relative bg-card rounded-3xl overflow-hidden transition-all duration-500 hover:shadow-2xl hover:-translate-y-3 ${
              selectedItems.has(produit.id) ? 'ring-2 ring-primary shadow-lg' : 'border border-border/50'
            }`}
          >
            <div className="relative aspect-square overflow-hidden">
              <div className="absolute top-4 left-4 z-20">
                <label className="relative cursor-pointer">
                  <input
                    type="checkbox"
                    checked={selectedItems.has(produit.id)}
                    onChange={() => handleToggleSelect(produit.id)}
                    className="w-5 h-5 rounded-md border-2 border-white/60 bg-black/20 backdrop-blur-sm checked:bg-primary checked:border-primary cursor-pointer"
                  />
                </label>
              </div>

              <button
                onClick={() => handleRemoveFavori(produit.id, produit.nom)}
                className="absolute bottom-4 right-4 z-10 p-2.5 rounded-full bg-black/60 backdrop-blur-md opacity-0 group-hover:opacity-100 transition-all duration-300 hover:bg-rose-500 hover:scale-110"
              >
                <Trash2 className="h-4 w-4 text-white" />
              </button>

              <Link to={`/produit/${produit.id}`} className="block w-full h-full">
                <ProductImage produit={produit} className="w-full h-full" />
              </Link>

              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
            </div>

            <div className="p-5 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground bg-secondary/50 px-2 py-0.5 rounded-full">
                  {produit.type_produit || 'Produit'}
                </span>
                {produit.images && produit.images.length > 0 && (
                  <span className="text-[10px] text-primary/60 bg-primary/10 px-2 py-0.5 rounded-full">
                    📷 Photo
                  </span>
                )}
              </div>

              <Link to={`/produit/${produit.id}`}>
                <h3 className="font-semibold text-foreground text-base line-clamp-2 hover:text-primary transition">
                  {produit.nom}
                </h3>
              </Link>

              {produit.description_courte && (
                <p className="text-xs text-muted-foreground line-clamp-2">
                  {produit.description_courte}
                </p>
              )}

              <div className="flex items-baseline gap-2">
                <span className="text-xl font-bold text-foreground">
                  {formatPrice(produit.prix, produit.devise)}
                </span>
              </div>

              <div className="flex items-center gap-2">
                <div className={`h-1.5 w-1.5 rounded-full ${produit.quantite_stock > 0 ? 'bg-emerald-500' : 'bg-rose-500'}`} />
                <span className={`text-[10px] font-medium uppercase ${produit.quantite_stock > 0 ? 'text-emerald-600' : 'text-rose-500'}`}>
                  {produit.quantite_stock > 0 ? 'EN STOCK' : 'RUPTURE DE STOCK'}
                </span>
                {produit.quantite_stock > 0 && produit.quantite_stock < 5 && (
                  <span className="text-[10px] text-amber-500 bg-amber-500/10 px-2 py-0.5 rounded-full">
                    Dernières pièces
                  </span>
                )}
              </div>

              <div className="flex gap-3 pt-3">
                <button
                  onClick={() => handleAjouterPanier(produit)}
                  disabled={produit.quantite_stock <= 0}
                  className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 bg-primary/10 text-primary rounded-xl hover:bg-primary hover:text-primary-foreground transition disabled:opacity-50 disabled:cursor-not-allowed text-sm font-medium"
                >
                  <ShoppingBag className="h-4 w-4" />
                  <span>Ajouter</span>
                </button>
                <Link
                  to={`/produit/${produit.id}`}
                  className="flex items-center justify-center px-4 py-2.5 border border-border rounded-xl hover:bg-secondary transition"
                >
                  <Eye className="h-4 w-4 text-muted-foreground" />
                </Link>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Recommandations */}
      {recommandations.length > 0 && (
        <div className="mt-12 pt-8 border-t border-border/50">
          <div className="flex items-center justify-between mb-8">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <Gift className="h-5 w-5 text-primary" />
                <h3 className="text-xl font-bold text-foreground">Vous pourriez aussi aimer</h3>
              </div>
              <p className="text-sm text-muted-foreground">Découvrez des produits similaires à vos favoris</p>
            </div>
            <Link to="/catalogue">
              <button className="group inline-flex items-center gap-2 text-sm font-medium text-primary hover:gap-3 transition-all">
                <span>Voir tout</span>
                <ChevronRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
              </button>
            </Link>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {recommandations.map((produit) => (
              <Link key={produit.id} to={`/produit/${produit.id}`}>
                <div className="group relative bg-card border border-border/50 rounded-2xl p-4 hover:shadow-xl hover:-translate-y-1 transition-all duration-300 overflow-hidden">
                  <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                  <div className="relative">
                    <div className="w-full aspect-square rounded-xl overflow-hidden">
                      <ProductImage produit={produit} className="w-full h-full rounded-xl" />
                    </div>
                    <h4 className="font-semibold text-foreground text-sm line-clamp-2 mb-2 mt-3 text-center">
                      {produit.nom}
                    </h4>
                    <p className="text-lg font-bold text-primary text-center">
                      {formatPrice(produit.prix, produit.devise)}
                    </p>
                    <p className="text-[10px] text-muted-foreground text-center mt-1">
                      {produit.type_produit || 'Produit'}
                    </p>
                    {produit.quantite_stock > 0 && (
                      <div className="flex items-center justify-center gap-1 mt-2">
                        <div className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                        <span className="text-[10px] text-emerald-600 font-medium">En stock</span>
                      </div>
                    )}
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default DashboardFavoris;