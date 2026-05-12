import { useState, useEffect } from "react";
import { Heart, Trash2, ShoppingBag, Star, Sparkles, Shield, Eye, X, Check, TrendingUp, Clock, Zap, Gift, Truck, Award, ChevronRight } from "lucide-react";
import { Link } from "react-router-dom";
import { toast } from "sonner";
import { useShop } from "@/store/shop";

type ProduitFavori = {
  id: string;
  nom: string;
  prix: number;
  ancienPrix?: number;
  image: string;
  categorie: string;
  enStock: boolean;
  isPremium?: boolean;
  isPro?: boolean;
  note?: number;
  avis?: number;
  reduction?: number;
  bestseller?: boolean;
  nouveau?: boolean;
  livraisonGratuite?: boolean;
};

// Données mockées enrichies
const produitsMock: ProduitFavori[] = [
  {
    id: "1",
    nom: "PC Gaming RTX 4060",
    prix: 1250000,
    ancienPrix: 1499000,
    reduction: 15,
    image: "https://picsum.photos/id/0/400/400",
    categorie: "PC Gaming",
    enStock: true,
    isPremium: true,
    note: 4.8,
    avis: 124,
    bestseller: true,
    livraisonGratuite: true,
  },
  {
    id: "2",
    nom: "Clavier Mécanique RGB",
    prix: 120000,
    image: "https://picsum.photos/id/1/400/400",
    categorie: "Périphériques",
    enStock: true,
    note: 4.5,
    avis: 89,
    livraisonGratuite: true,
  },
  {
    id: "3",
    nom: "Souris Gaming",
    prix: 85000,
    image: "https://picsum.photos/id/2/400/400",
    categorie: "Périphériques",
    enStock: false,
    note: 4.2,
    avis: 56,
  },
  {
    id: "4",
    nom: "Processeur Intel i7",
    prix: 450000,
    ancienPrix: 520000,
    reduction: 13,
    image: "https://picsum.photos/id/3/400/400",
    categorie: "Composants",
    enStock: true,
    isPro: true,
    note: 4.9,
    avis: 203,
    nouveau: true,
  },
  {
    id: "5",
    nom: "Écran 144Hz 27 pouces",
    prix: 650000,
    image: "https://picsum.photos/id/4/400/400",
    categorie: "Périphériques",
    enStock: true,
    note: 4.7,
    avis: 78,
    livraisonGratuite: true,
  },
];

const DashboardFavoris = () => {
  const [favoris, setFavoris] = useState<ProduitFavori[]>(produitsMock);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedItems, setSelectedItems] = useState<Set<string>>(new Set());
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const { addToCart } = useShop();

  const handleToggleSelect = (id: string) => {
    const newSelected = new Set(selectedItems);
    if (newSelected.has(id)) {
      newSelected.delete(id);
    } else {
      newSelected.add(id);
    }
    setSelectedItems(newSelected);
  };

  const handleSelectAll = () => {
    if (selectedItems.size === favoris.length) {
      setSelectedItems(new Set());
    } else {
      setSelectedItems(new Set(favoris.map(p => p.id)));
    }
  };

  const handleRemoveFavori = (id: string, nom: string) => {
    setFavoris(favoris.filter(p => p.id !== id));
    setSelectedItems(prev => {
      const newSet = new Set(prev);
      newSet.delete(id);
      return newSet;
    });
    toast.custom((t) => (
      <div className="flex items-center gap-3 bg-background border border-border rounded-xl shadow-lg p-3">
        <Heart className="h-5 w-5 text-rose-500" />
        <div>
          <p className="text-sm font-medium text-foreground">{nom}</p>
          <p className="text-xs text-muted-foreground">Retiré des favoris</p>
        </div>
      </div>
    ));
  };

  const handleRemoveSelected = () => {
    const itemsToRemove = Array.from(selectedItems);
    setFavoris(favoris.filter(p => !selectedItems.has(p.id)));
    toast.success(`${itemsToRemove.length} produit(s) retiré(s) des favoris`);
    setSelectedItems(new Set());
  };

  const handleAjouterPanier = (produit: ProduitFavori) => {
    if (!produit.enStock) {
      toast.error(`${produit.nom} n'est plus en stock`);
      return;
    }
    addToCart(produit.id, 1);
    toast.custom((t) => (
      <div className="flex items-center gap-3 bg-background border border-border rounded-xl shadow-lg p-3">
        <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
          <ShoppingBag className="h-5 w-5 text-primary" />
        </div>
        <div>
          <p className="text-sm font-medium text-foreground">{produit.nom}</p>
          <p className="text-xs text-muted-foreground">Ajouté au panier</p>
        </div>
      </div>
    ));
  };

  const handleAjouterSelectionPanier = () => {
    const selectedProduits = favoris.filter(p => selectedItems.has(p.id) && p.enStock);
    if (selectedProduits.length === 0) {
      toast.error("Aucun produit sélectionné disponible en stock");
      return;
    }
    selectedProduits.forEach(produit => {
      addToCart(produit.id, 1);
    });
    toast.success(`${selectedProduits.length} produit(s) ajouté(s) au panier`);
  };

  const handleAjouterToutPanier = () => {
    const enStock = favoris.filter(p => p.enStock);
    if (enStock.length === 0) {
      toast.error("Aucun produit en stock disponible");
      return;
    }
    enStock.forEach(produit => {
      addToCart(produit.id, 1);
    });
    toast.success(`${enStock.length} produit(s) ajouté(s) au panier`);
  };

  const handleSupprimerTout = () => {
    setFavoris([]);
    setSelectedItems(new Set());
    toast.success("Tous les favoris ont été supprimés");
  };

  // Statistiques
  const stats = {
    total: favoris.length,
    enStock: favoris.filter(p => p.enStock).length,
    valeurTotale: favoris.reduce((sum, p) => sum + p.prix, 0),
    economie: favoris.reduce((sum, p) => sum + (p.ancienPrix ? p.ancienPrix - p.prix : 0), 0),
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <div className="h-8 w-48 bg-muted rounded-lg animate-pulse" />
            <div className="h-4 w-64 bg-muted rounded-lg animate-pulse mt-2" />
          </div>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="bg-card border border-border rounded-2xl overflow-hidden">
              <div className="aspect-square bg-gradient-to-br from-muted to-secondary animate-pulse" />
              <div className="p-5 space-y-3">
                <div className="h-4 w-24 bg-muted rounded animate-pulse" />
                <div className="h-5 w-full bg-muted rounded animate-pulse" />
                <div className="h-6 w-32 bg-muted rounded animate-pulse" />
                <div className="h-10 w-full bg-muted rounded animate-pulse" />
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (favoris.length === 0) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="relative">
          {/* Decorative elements */}
          <div className="absolute -top-10 -left-10 w-40 h-40 bg-primary/5 rounded-full blur-3xl" />
          <div className="absolute -bottom-10 -right-10 w-40 h-40 bg-rose-500/5 rounded-full blur-3xl" />
          
          <div className="relative bg-card border border-border rounded-3xl p-12 text-center max-w-md mx-auto shadow-2xl">
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-br from-primary/20 to-transparent rounded-full blur-xl" />
              <div className="relative w-28 h-28 mx-auto mb-6 bg-gradient-to-br from-primary/30 to-secondary rounded-full flex items-center justify-center animate-float">
                <Heart className="h-14 w-14 text-primary" strokeWidth={1.5} />
              </div>
            </div>
            <h2 className="text-2xl font-bold text-foreground mb-3">Votre liste est vide</h2>
            <p className="text-muted-foreground mb-8 leading-relaxed">
              Explorez notre catalogue et ajoutez vos produits préférés<br />
              en cliquant sur le cœur.
            </p>
            <Link to="/catalogue">
              <button className="group inline-flex items-center gap-2 px-8 py-3.5 bg-gradient-to-r from-primary to-primary/80 text-primary-foreground rounded-2xl hover:from-primary/90 hover:to-primary transition-all duration-300 font-medium shadow-lg hover:shadow-xl hover:scale-105">
                <span>Découvrir le catalogue</span>
                <ChevronRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
              </button>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header avec statistiques premium */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-card via-card to-secondary/50 border border-border/50 p-6">
        <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 rounded-full blur-3xl" />
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-rose-500/5 rounded-full blur-3xl" />
        
        <div className="relative flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <Heart className="h-6 w-6 text-rose-500 fill-rose-500/20" />
              <span className="text-sm font-medium text-rose-500 uppercase tracking-wider">Ma wishlist</span>
            </div>
            <h1 className="text-3xl lg:text-4xl font-bold text-foreground tracking-tight">Mes favoris</h1>
            <p className="text-muted-foreground mt-2">
              {favoris.length} produit{favoris.length > 1 ? 's' : ''} dans votre liste
            </p>
          </div>
          
          {/* Cartes stats premium */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div className="group relative overflow-hidden rounded-2xl bg-background/50 backdrop-blur-sm border border-border/50 p-4 text-center hover:border-primary/30 transition-all duration-300">
              <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
              <p className="text-2xl font-bold text-foreground">{stats.total}</p>
              <p className="text-xs text-muted-foreground uppercase tracking-wider mt-1">Total</p>
            </div>
            <div className="group relative overflow-hidden rounded-2xl bg-background/50 backdrop-blur-sm border border-border/50 p-4 text-center hover:border-emerald-500/30 transition-all duration-300">
              <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
              <p className="text-2xl font-bold text-emerald-600">{stats.enStock}</p>
              <p className="text-xs text-muted-foreground uppercase tracking-wider mt-1">En stock</p>
            </div>
            <div className="group relative overflow-hidden rounded-2xl bg-background/50 backdrop-blur-sm border border-border/50 p-4 text-center hover:border-primary/30 transition-all duration-300">
              <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
              <p className="text-2xl font-bold text-primary">{(stats.valeurTotale / 1000).toFixed(0)}k</p>
              <p className="text-xs text-muted-foreground uppercase tracking-wider mt-1">Valeur</p>
            </div>
            {stats.economie > 0 && (
              <div className="group relative overflow-hidden rounded-2xl bg-gradient-to-br from-emerald-500/10 to-emerald-500/5 border border-emerald-500/20 p-4 text-center">
                <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                <p className="text-2xl font-bold text-emerald-600">{(stats.economie / 1000).toFixed(0)}k</p>
                <p className="text-xs text-emerald-600 uppercase tracking-wider mt-1">Économie</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Barre d'actions premium */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 p-4 bg-gradient-to-r from-secondary/50 to-transparent rounded-2xl border border-border/50 backdrop-blur-sm">
        <div className="flex items-center gap-6">
          <label className="flex items-center gap-2 cursor-pointer group">
            <div className="relative">
              <input
                type="checkbox"
                checked={selectedItems.size === favoris.length && favoris.length > 0}
                onChange={handleSelectAll}
                className="w-5 h-5 rounded-md border-2 border-muted-foreground/30 text-primary focus:ring-primary/20 cursor-pointer"
              />
            </div>
            <span className="text-sm text-muted-foreground group-hover:text-foreground transition">
              {selectedItems.size === favoris.length ? "Désélectionner tout" : "Tout sélectionner"}
            </span>
          </label>
          {selectedItems.size > 0 && (
            <div className="flex items-center gap-2 px-3 py-1 bg-primary/10 rounded-full">
              <span className="text-xs font-medium text-primary">{selectedItems.size} sélectionné(s)</span>
            </div>
          )}
        </div>
        
        <div className="flex flex-wrap gap-3">
          {selectedItems.size > 0 && (
            <>
              <button
                onClick={handleAjouterSelectionPanier}
                className="group inline-flex items-center gap-2 px-5 py-2.5 bg-primary/10 text-primary rounded-xl hover:bg-primary hover:text-primary-foreground transition-all duration-300 text-sm font-medium"
              >
                <ShoppingBag className="h-4 w-4 transition-transform group-hover:scale-110" />
                <span>Ajouter la sélection</span>
              </button>
              <button
                onClick={handleRemoveSelected}
                className="group inline-flex items-center gap-2 px-5 py-2.5 border border-rose-500/30 text-rose-500 rounded-xl hover:bg-rose-500 hover:text-white transition-all duration-300 text-sm font-medium"
              >
                <Trash2 className="h-4 w-4 transition-transform group-hover:scale-110" />
                <span>Supprimer ({selectedItems.size})</span>
              </button>
            </>
          )}
          {favoris.some(p => p.enStock) && (
            <button
              onClick={handleAjouterToutPanier}
              className="group inline-flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-primary to-primary/80 text-primary-foreground rounded-xl hover:shadow-lg transition-all duration-300 text-sm font-medium"
            >
              <ShoppingBag className="h-4 w-4" />
              <span>Tout ajouter</span>
            </button>
          )}
          <button
            onClick={handleSupprimerTout}
            className="group inline-flex items-center gap-2 px-5 py-2.5 border border-border text-muted-foreground rounded-xl hover:bg-secondary hover:text-foreground transition-all duration-300 text-sm font-medium"
          >
            <Trash2 className="h-4 w-4" />
            <span>Tout supprimer</span>
          </button>
        </div>
      </div>

      {/* Grille des favoris premium */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {favoris.map((produit) => (
          <div
            key={produit.id}
            className={`group relative bg-card rounded-3xl overflow-hidden transition-all duration-500 hover:shadow-2xl hover:-translate-y-3 ${
              selectedItems.has(produit.id) ? 'ring-2 ring-primary shadow-lg' : 'border border-border/50'
            }`}
          >
            {/* Image avec badges premium */}
            <div className="relative aspect-square overflow-hidden bg-gradient-to-br from-secondary to-muted">
              {/* Checkbox de sélection */}
              <div className="absolute top-4 left-4 z-20">
                <label className="relative cursor-pointer">
                  <input
                    type="checkbox"
                    checked={selectedItems.has(produit.id)}
                    onChange={() => handleToggleSelect(produit.id)}
                    className="w-5 h-5 rounded-md border-2 border-white/60 bg-black/20 backdrop-blur-sm checked:bg-primary checked:border-primary focus:ring-primary/20 cursor-pointer"
                  />
                </label>
              </div>

              {/* Badges premium */}
              <div className="absolute top-4 right-4 z-10 flex flex-col gap-2 items-end">
                {produit.nouveau && (
                  <span className="flex items-center gap-1.5 px-2.5 py-1.5 text-[10px] font-bold uppercase bg-gradient-to-r from-emerald-500 to-teal-500 text-white rounded-full shadow-lg animate-pulse">
                    <Sparkles className="h-2.5 w-2.5" />
                    NOUVEAU
                  </span>
                )}
                {produit.bestseller && (
                  <span className="flex items-center gap-1.5 px-2.5 py-1.5 text-[10px] font-bold uppercase bg-gradient-to-r from-amber-500 to-orange-500 text-black rounded-full shadow-lg">
                    <Zap className="h-2.5 w-2.5" />
                    BESTSELLER
                  </span>
                )}
                {produit.reduction && (
                  <span className="flex items-center gap-1.5 px-2.5 py-1.5 text-[10px] font-bold uppercase bg-gradient-to-r from-rose-500 to-red-500 text-white rounded-full shadow-lg">
                    -{produit.reduction}%
                  </span>
                )}
                {produit.isPremium && (
                  <span className="flex items-center gap-1.5 px-2.5 py-1.5 text-[10px] font-bold uppercase bg-gradient-to-r from-amber-500 to-orange-500 text-black rounded-full shadow-lg">
                    <Sparkles className="h-2.5 w-2.5" />
                    PREMIUM
                  </span>
                )}
                {produit.isPro && (
                  <span className="flex items-center gap-1.5 px-2.5 py-1.5 text-[10px] font-bold uppercase bg-gradient-to-r from-blue-500 to-indigo-500 text-white rounded-full shadow-lg">
                    <Shield className="h-2.5 w-2.5" />
                    PRO
                  </span>
                )}
              </div>

              {/* Bouton supprimer au hover */}
              <button
                onClick={() => handleRemoveFavori(produit.id, produit.nom)}
                className="absolute bottom-4 right-4 z-10 p-2.5 rounded-full bg-black/60 backdrop-blur-md opacity-0 group-hover:opacity-100 transition-all duration-300 hover:bg-rose-500 hover:scale-110"
              >
                <Trash2 className="h-4 w-4 text-white" />
              </button>

              <Link to={`/produit/${produit.id}`} className="block w-full h-full">
                <img
                  src={produit.image}
                  alt={produit.nom}
                  className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                  loading="lazy"
                />
              </Link>

              {/* Overlay gradient */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
            </div>

            {/* Contenu premium */}
            <div className="p-5 space-y-3 bg-gradient-to-b from-card to-card/95">
              {/* Catégorie et note */}
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground bg-secondary/50 px-2 py-0.5 rounded-full">
                  {produit.categorie}
                </span>
                {produit.note && (
                  <div className="flex items-center gap-1.5 bg-amber-500/10 px-2 py-0.5 rounded-full">
                    <Star className="h-3 w-3 fill-amber-500 text-amber-500" />
                    <span className="text-xs font-semibold text-foreground">{produit.note}</span>
                    {produit.avis && (
                      <span className="text-[10px] text-muted-foreground">({produit.avis})</span>
                    )}
                  </div>
                )}
              </div>

              {/* Nom */}
              <Link to={`/produit/${produit.id}`}>
                <h3 className="font-semibold text-foreground text-base line-clamp-2 hover:text-primary transition-colors duration-300">
                  {produit.nom}
                </h3>
              </Link>

              {/* Prix */}
              <div className="flex items-baseline gap-2 flex-wrap">
                <span className="text-xl font-bold text-foreground">
                  {produit.prix.toLocaleString('fr-FR')} Ar
                </span>
                {produit.ancienPrix && (
                  <span className="text-sm text-muted-foreground line-through">
                    {produit.ancienPrix.toLocaleString('fr-FR')} Ar
                  </span>
                )}
              </div>

              {/* Stock et livraison */}
              <div className="flex flex-col gap-1.5">
                <div className="flex items-center gap-2">
                  <div className={`h-1.5 w-1.5 rounded-full ${produit.enStock ? 'bg-emerald-500 animate-pulse' : 'bg-rose-500'}`} />
                  <span className={`text-[10px] font-medium uppercase tracking-wider ${produit.enStock ? 'text-emerald-600' : 'text-rose-500'}`}>
                    {produit.enStock ? 'EN STOCK' : 'RUPTURE DE STOCK'}
                  </span>
                </div>
                {produit.livraisonGratuite && produit.enStock && (
                  <div className="flex items-center gap-1.5">
                    <Truck className="h-3 w-3 text-emerald-500" />
                    <span className="text-[9px] text-emerald-600 font-medium">Livraison offerte</span>
                  </div>
                )}
              </div>

              {/* Actions premium */}
              <div className="flex gap-3 pt-3">
                <button
                  onClick={() => handleAjouterPanier(produit)}
                  disabled={!produit.enStock}
                  className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 bg-gradient-to-r from-primary/10 to-primary/5 text-primary rounded-xl hover:from-primary hover:to-primary/90 hover:text-primary-foreground transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed text-sm font-medium group/btn"
                >
                  <ShoppingBag className="h-4 w-4 transition-transform group-hover/btn:scale-110" />
                  <span>Ajouter</span>
                </button>
                <Link
                  to={`/produit/${produit.id}`}
                  className="flex items-center justify-center px-4 py-2.5 border border-border rounded-xl hover:bg-secondary hover:border-primary/30 transition-all duration-300 group/link"
                >
                  <Eye className="h-4 w-4 text-muted-foreground transition-transform group-hover/link:scale-110" />
                </Link>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Recommandations premium */}
      {favoris.length >= 3 && (
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
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="group relative bg-card border border-border/50 rounded-2xl p-4 text-center hover:shadow-xl hover:-translate-y-1 transition-all duration-300 overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                <div className="relative">
                  <div className="w-full aspect-square bg-gradient-to-br from-secondary to-muted rounded-xl animate-pulse mb-4" />
                  <div className="h-4 w-3/4 bg-muted rounded animate-pulse mx-auto mb-2" />
                  <div className="h-5 w-1/2 bg-muted rounded animate-pulse mx-auto" />
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default DashboardFavoris;