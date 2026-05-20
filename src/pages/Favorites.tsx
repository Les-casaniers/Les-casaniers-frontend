// src/pages/Favorites.tsx
import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Heart, Trash2, ShoppingBag, ArrowRight, Star, Sparkles, Shield, X, Loader2 } from "lucide-react";
import { useShop } from "@/store/shop";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import api from "@/service/api";
import { useAuth } from "@/contexts/AuthContext";

import mascot from "@/assets/casaniers-mascot.png";
import { Header } from "@/components/site/Header";
import { Footer } from "@/components/site/Footer";

// Types
interface Product {
  id: number;
  nom: string;
  prix: number;
  devise: string;
  quantite_stock: number;
  description_courte: string;
  type_produit: string;
  images?: { id: number; url: string; alt: string; ordre: number }[];
  est_dispo: boolean;
  actif: boolean;
}

interface Favori {
  id: number;
  utilisateur_id: number;
  produit_id: number;
  date_creation: string;
  produit?: Product;
}

// Fonction pour obtenir l'URL de l'image principale
const getProductImageUrl = (product: Product) => {
  if (!product) return "/placeholder-pc.jpg";
  
  const images = product.images || [];
  if (images.length === 0) return "/placeholder-pc.jpg";
  
  const mainImage = images.find((img: any) => img.ordre === 0) || images[0];
  if (!mainImage?.url) return "/placeholder-pc.jpg";
  
  if (mainImage.url.startsWith('/storage')) {
    return `http://127.0.0.1:8000${mainImage.url}`;
  }
  
  return mainImage.url;
};

// Composant pour un produit favori individuel
const FavoriteProductCard = ({ 
  product, 
  onRemove, 
  onAddToCart,
  isAddingToCart 
}: { 
  product: Product; 
  onRemove: (id: number) => void;
  onAddToCart: (id: number) => void;
  isAddingToCart: boolean;
}) => {
  const [isHovered, setIsHovered] = useState(false);
  const [imageLoaded, setImageLoaded] = useState(false);
  const imageUrl = getProductImageUrl(product);

  const formatPrice = (prix: number, devise: string = 'MGA') => {
    return new Intl.NumberFormat('fr-FR').format(prix) + ` ${devise}`;
  };

  const getTypeLabel = (type: string) => {
    const types: Record<string, string> = {
      pc: "PC Gaming",
      portable: "Laptop Gaming",
      composant: "Composant",
      peripherique: "Périphérique",
      service: "Service"
    };
    return types[type] || "Produit";
  };

  return (
    <div 
      className="group relative bg-card border border-border rounded-xl overflow-hidden transition-all duration-300 hover:shadow-xl hover:-translate-y-1"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Badge Premium/Pro */}
      <div className="absolute top-3 left-3 z-10 flex gap-2">
        {product.type_produit === 'pc' && (
          <span className="inline-flex items-center gap-1 px-2 py-1 text-[10px] font-bold uppercase tracking-wider bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-full">
            <Sparkles className="h-2.5 w-2.5" />
            GAMING
          </span>
        )}
        {product.prix > 1000000 && (
          <span className="inline-flex items-center gap-1 px-2 py-1 text-[10px] font-bold uppercase tracking-wider bg-gradient-to-r from-amber-500 to-orange-500 text-black rounded-full">
            PREMIUM
          </span>
        )}
      </div>

      {/* Bouton supprimer */}
      <button
        onClick={() => onRemove(product.id)}
        className="absolute top-3 right-3 z-10 p-1.5 bg-black/50 backdrop-blur-sm rounded-full text-white opacity-0 group-hover:opacity-100 transition-all duration-300 hover:bg-red-500 hover:scale-110"
        aria-label="Retirer des favoris"
      >
        <Trash2 className="h-3.5 w-3.5" />
      </button>

      {/* Image */}
      <Link to={`/produit/${product.id}`} className="block relative aspect-square overflow-hidden bg-gradient-to-br from-secondary to-muted">
        {!imageLoaded && (
          <div className="absolute inset-0 animate-pulse bg-muted" />
        )}
        <img
          src={imageUrl}
          alt={product.nom}
          className={`w-full h-full object-cover transition-all duration-500 group-hover:scale-110 ${
            imageLoaded ? 'opacity-100' : 'opacity-0'
          }`}
          onLoad={() => setImageLoaded(true)}
          onError={(e) => {
            (e.target as HTMLImageElement).src = "/placeholder-pc.jpg";
          }}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
      </Link>

      {/* Contenu */}
      <div className="p-4 space-y-3">
        {/* Catégorie */}
        <div className="flex items-center justify-between">
          <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
            {getTypeLabel(product.type_produit)}
          </span>
          {product.quantite_stock <= 5 && product.quantite_stock > 0 && (
            <span className="text-[10px] text-orange-500 font-medium">Stock limité</span>
          )}
        </div>

        {/* Nom du produit */}
        <Link to={`/produit/${product.id}`}>
          <h3 className="font-semibold text-base line-clamp-2 hover:text-primary transition-colors">
            {product.nom}
          </h3>
        </Link>

        {/* Description courte */}
        {product.description_courte && (
          <p className="text-xs text-muted-foreground line-clamp-2">
            {product.description_courte}
          </p>
        )}

        {/* Prix */}
        <div className="flex items-baseline gap-2">
          <span className="text-xl font-bold text-primary">
            {formatPrice(product.prix, product.devise)}
          </span>
        </div>

        {/* Stock */}
        <div className="flex items-center gap-2">
          <div className={`h-1.5 w-1.5 rounded-full ${product.quantite_stock > 0 ? 'bg-green-500' : 'bg-red-500'}`} />
          <span className="text-[10px] font-medium uppercase tracking-wider text-muted-foreground">
            {product.quantite_stock > 0 ? 'EN STOCK' : 'RUPTURE DE STOCK'}
          </span>
        </div>

        {/* Bouton Ajouter au panier */}
        <Button
          onClick={() => onAddToCart(product.id)}
          disabled={product.quantite_stock <= 0 || isAddingToCart}
          className="w-full gap-2 bg-foreground text-background hover:bg-foreground/90 py-2.5 text-xs rounded-lg"
        >
          {isAddingToCart ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <ShoppingBag className="h-4 w-4" />
          )}
          Ajouter au panier
        </Button>
      </div>
    </div>
  );
};

// Composant pour la liste vide
const EmptyFavorites = () => {
  return (
    <div className="flex flex-col items-center justify-center py-20 px-4 text-center">
      <div className="relative mb-8">
        <div className="relative group">
          <div className="absolute inset-0 rounded-full bg-gradient-to-r from-amber-500/20 to-orange-500/20 blur-2xl animate-pulse" />
          <img 
            src={mascot} 
            alt="Mascotte Les Casaniers" 
            className="relative w-48 h-48 object-contain animate-float"
          />
        </div>
        <div className="absolute -top-4 -right-4 animate-pulse-slow">
          <img src={mascot} alt="" className="w-12 h-12 object-contain opacity-60" />
        </div>
        <div className="absolute -bottom-4 -left-4 animate-pulse-slow">
          <img src={mascot} alt="" className="w-10 h-10 object-contain opacity-40" />
        </div>
      </div>
      
      <h2 className="text-2xl font-bold mb-2">
        Votre liste de favoris est vide
      </h2>
      <p className="text-muted-foreground mb-8 max-w-md">
        Explorez notre catalogue et ajoutez vos produits préférés en cliquant sur le cœur.
      </p>
      
      <div className="flex flex-col sm:flex-row gap-4">
        <Link to="/catalogue">
          <Button className="gap-2 bg-foreground text-background hover:bg-foreground/90">
            Explorer le catalogue
            <ArrowRight className="h-4 w-4" />
          </Button>
        </Link>
      </div>
    </div>
  );
};

// Composant principal des favoris
export const Favorites = () => {
  const { addToCart: addToLocalCart } = useShop();
  const { isAuthenticated, user } = useAuth();
  const [favoris, setFavoris] = useState<Favori[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedProducts, setSelectedProducts] = useState<Set<number>>(new Set());
  const [addingToCart, setAddingToCart] = useState<number | null>(null);
  const [isAddingSelected, setIsAddingSelected] = useState(false);

  // Récupérer les favoris de l'utilisateur connecté
  useEffect(() => {
    if (isAuthenticated) {
      fetchFavoris();
    } else {
      setIsLoading(false);
    }
  }, [isAuthenticated]);

  const fetchFavoris = async () => {
    try {
      setIsLoading(true);
      const response = await api.get('/favoris');
      console.log("Favoris récupérés:", response.data);
      
      let favorisData: Favori[] = [];
      if (response.data.data && Array.isArray(response.data.data)) {
        favorisData = response.data.data;
      } else if (Array.isArray(response.data)) {
        favorisData = response.data;
      } else {
        favorisData = [];
      }
      
      setFavoris(favorisData);
      
      // Récupérer les détails des produits
      if (favorisData.length > 0) {
        const productIds = favorisData.map(f => f.produit_id);
        const productsPromises = productIds.map(id => 
          api.get(`/produits/${id}`).catch(() => ({ data: null }))
        );
        
        const productsResponses = await Promise.all(productsPromises);
        const productsData = productsResponses
          .map(res => res.data?.data || res.data)
          .filter(p => p !== null && p !== undefined);
        
        setProducts(productsData);
      } else {
        setProducts([]);
      }
      
    } catch (error: any) {
      console.error("Erreur chargement favoris:", error);
      if (error.response?.status !== 401) {
        toast.error("Impossible de charger vos favoris");
      }
    } finally {
      setIsLoading(false);
    }
  };

  // Fonction pour ajouter au panier (identique à Product.tsx)
  const addToCartDatabase = async (product: Product, quantity: number = 1) => {
    if (!isAuthenticated) {
      toast.error("Veuillez vous connecter pour ajouter au panier");
      return false;
    }

    if (product.quantite_stock <= 0) {
      toast.error("Ce produit n'est plus disponible");
      return false;
    }

    try {
      await api.post('/panier/ajouter', {
        produit_id: product.id,
        quantite: quantity,
        utilisateur_id: user?.id,
        prix_unitaire: product.prix,
        titre: product.nom
      });
      
      toast.success(`${quantity} x ${product.nom} ajouté au panier`);
      
      // Mettre à jour le store local
      addToLocalCart(String(product.id), quantity, {
        id: String(product.id),
        name: product.nom,
        category: product.type_produit,
        tagline: product.description_courte || "Produit Les Casaniers",
        price: Number(product.prix),
        image: getProductImageUrl(product),
      });
      
      return true;
    } catch (error: any) {
      console.error("Erreur lors de l'ajout au panier:", error);
      toast.error(error.response?.data?.message || "Impossible d'ajouter au panier");
      return false;
    }
  };

  const handleRemove = async (productId: number) => {
    try {
      const favori = favoris.find(f => f.produit_id === productId);
      if (favori) {
        await api.delete(`/favoris/${favori.id}`);
        setFavoris(favoris.filter(f => f.produit_id !== productId));
        setProducts(products.filter(p => p.id !== productId));
        setSelectedProducts(prev => {
          const newSet = new Set(prev);
          newSet.delete(productId);
          return newSet;
        });
        toast.success("Produit retiré des favoris");
      }
    } catch (error) {
      console.error("Erreur suppression favori:", error);
      toast.error("Impossible de retirer le produit");
    }
  };

  const handleAddToCart = async (productId: number) => {
    const product = products.find(p => p.id === productId);
    if (!product) return;
    
    setAddingToCart(productId);
    await addToCartDatabase(product, 1);
    setAddingToCart(null);
  };

  const handleAddSelectedToCart = async () => {
    if (selectedProducts.size === 0) {
      toast.error("Aucun produit sélectionné");
      return;
    }
    
    setIsAddingSelected(true);
    let successCount = 0;
    let errorCount = 0;
    
    for (const productId of selectedProducts) {
      const product = products.find(p => p.id === productId);
      if (product && product.quantite_stock > 0) {
        const success = await addToCartDatabase(product, 1);
        if (success) {
          successCount++;
        } else {
          errorCount++;
        }
      } else {
        errorCount++;
      }
    }
    
    setIsAddingSelected(false);
    
    if (successCount > 0) {
      toast.success(`${successCount} produit(s) ajouté(s) au panier${errorCount > 0 ? ` (${errorCount} erreur(s))` : ''}`);
    } else {
      toast.error("Aucun produit n'a pu être ajouté au panier");
    }
  };

  const handleRemoveSelected = () => {
    selectedProducts.forEach(async (productId) => {
      const favori = favoris.find(f => f.produit_id === productId);
      if (favori) {
        try {
          await api.delete(`/favoris/${favori.id}`);
        } catch (error) {
          console.error("Erreur suppression:", error);
        }
      }
    });
    
    setProducts(products.filter(p => !selectedProducts.has(p.id)));
    setFavoris(favoris.filter(f => !selectedProducts.has(f.produit_id)));
    setSelectedProducts(new Set());
    toast.success(`${selectedProducts.size} produit(s) retiré(s) des favoris`);
  };

  const toggleSelectProduct = (productId: number) => {
    setSelectedProducts(prev => {
      const newSet = new Set(prev);
      if (newSet.has(productId)) {
        newSet.delete(productId);
      } else {
        newSet.add(productId);
      }
      return newSet;
    });
  };

  const toggleSelectAll = () => {
    if (selectedProducts.size === products.length) {
      setSelectedProducts(new Set());
    } else {
      setSelectedProducts(new Set(products.map(p => p.id)));
    }
  };

  // Skeleton loader
  if (isLoading) {
    return (
      <>
        <Header />
        <main className="min-h-screen">
          <div className="container-x py-8">
            <div className="mb-8">
              <div className="h-8 w-48 bg-muted rounded-lg animate-pulse mb-2" />
              <div className="h-4 w-64 bg-muted rounded-lg animate-pulse" />
            </div>
            
            <div className="flex justify-center mb-8">
              <div className="relative">
                <img 
                  src={mascot} 
                  alt="Chargement..." 
                  className="w-24 h-24 object-contain animate-bounce"
                />
                <div className="absolute -bottom-6 left-1/2 transform -translate-x-1/2 whitespace-nowrap">
                  <div className="flex gap-1">
                    <span className="w-2 h-2 bg-foreground rounded-full animate-bounce" style={{ animationDelay: '0s' }} />
                    <span className="w-2 h-2 bg-foreground rounded-full animate-bounce" style={{ animationDelay: '0.2s' }} />
                    <span className="w-2 h-2 bg-foreground rounded-full animate-bounce" style={{ animationDelay: '0.4s' }} />
                  </div>
                </div>
              </div>
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="bg-card border border-border rounded-xl overflow-hidden">
                  <div className="aspect-square bg-muted animate-pulse" />
                  <div className="p-4 space-y-3">
                    <div className="h-4 w-24 bg-muted rounded animate-pulse" />
                    <div className="h-5 w-full bg-muted rounded animate-pulse" />
                    <div className="h-6 w-32 bg-muted rounded animate-pulse" />
                    <div className="h-10 w-full bg-muted rounded animate-pulse" />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </main>
        <Footer />
      </>
    );
  }

  // Non authentifié
  if (!isAuthenticated) {
    return (
      <>
        <Header />
        <main className="min-h-screen">
          <div className="container-x py-8">
            <div className="flex flex-col items-center justify-center py-20 px-4 text-center">
              <div className="relative mb-8">
                <img src={mascot} alt="Mascotte" className="w-48 h-48 object-contain animate-float" />
              </div>
              <h2 className="text-2xl font-bold mb-2">Connectez-vous</h2>
              <p className="text-muted-foreground mb-8 max-w-md">
                Connectez-vous pour voir vos produits favoris
              </p>
              <Link to="/login">
                <Button className="gap-2 bg-foreground text-background hover:bg-foreground/90">
                  Se connecter
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </Link>
            </div>
          </div>
        </main>
        <Footer />
      </>
    );
  }

  return (
    <>
      <Header />
      <main className="min-h-screen">
        <div className="container-x py-8">
          {/* Header */}
          <div className="mb-8">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div className="flex items-center gap-4">
                <div className="relative">
                  <img 
                    src={mascot} 
                    alt="Mascotte" 
                    className="w-16 h-16 object-contain animate-float hidden sm:block"
                  />
                  <div className="absolute -top-1 -right-1 w-3 h-3 bg-rose-500 rounded-full animate-pulse" />
                </div>
                <div>
                  <h1 className="text-3xl font-bold tracking-tight mb-2">
                    Mes favoris
                  </h1>
                  <p className="text-muted-foreground">
                    {products.length} produit{products.length > 1 ? 's' : ''} dans votre liste
                  </p>
                </div>
              </div>
              
              {/* Actions groupées */}
              {products.length > 0 && (
                <div className="flex flex-wrap gap-3">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={toggleSelectAll}
                    className="gap-2"
                  >
                    <div className={`w-4 h-4 rounded border-2 flex items-center justify-center transition-colors ${
                      selectedProducts.size === products.length
                        ? 'bg-foreground border-foreground'
                        : 'border-border'
                    }`}>
                      {selectedProducts.size === products.length && (
                        <svg className="w-3 h-3 text-background" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                        </svg>
                      )}
                    </div>
                    {selectedProducts.size === products.length ? 'Tout désélectionner' : 'Tout sélectionner'}
                  </Button>
                  
                  {selectedProducts.size > 0 && (
                    <>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={handleRemoveSelected}
                        className="gap-2 text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-950/20"
                      >
                        <Trash2 className="h-4 w-4" />
                        Retirer ({selectedProducts.size})
                      </Button>
                      
                      <Button
                        size="sm"
                        onClick={handleAddSelectedToCart}
                        disabled={isAddingSelected}
                        className="gap-2 bg-foreground text-background hover:bg-foreground/90"
                      >
                        {isAddingSelected ? (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                          <ShoppingBag className="h-4 w-4" />
                        )}
                        Ajouter au panier ({selectedProducts.size})
                      </Button>
                    </>
                  )}
                </div>
              )}
            </div>
          </div>

          {products.length === 0 ? (
            <EmptyFavorites />
          ) : (
            <>
              {/* Grille des produits */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {products.map((product) => (
                  <div key={product.id} className="relative">
                    <button
                      onClick={() => toggleSelectProduct(product.id)}
                      className="absolute top-3 left-3 z-20 w-6 h-6 rounded-full bg-black/50 backdrop-blur-sm border-2 border-white flex items-center justify-center transition-all hover:scale-110"
                    >
                      <div className={`w-4 h-4 rounded-full transition-all ${
                        selectedProducts.has(product.id)
                          ? 'bg-foreground scale-100'
                          : 'scale-0'
                      }`} />
                    </button>
                    
                    <FavoriteProductCard
                      product={product}
                      onRemove={handleRemove}
                      onAddToCart={handleAddToCart}
                      isAddingToCart={addingToCart === product.id}
                    />
                  </div>
                ))}
              </div>

              {/* Recommandations */}
              <div className="mt-16 pt-8 border-t border-border">
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center gap-3">
                    <img 
                      src={mascot} 
                      alt="Mascotte" 
                      className="w-12 h-12 object-contain animate-float"
                    />
                    <div>
                      <h2 className="text-2xl font-bold tracking-tight">
                        Vous pourriez aussi aimer
                      </h2>
                      <p className="text-muted-foreground text-sm mt-1">
                        Découvrez d'autres produits similaires
                      </p>
                    </div>
                  </div>
                  <Link to="/catalogue">
                    <Button variant="ghost" className="gap-2 group">
                      Voir tout
                      <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                    </Button>
                  </Link>
                </div>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                  {[1, 2, 3, 4].map((i) => (
                    <div key={i} className="group bg-card border border-border rounded-xl overflow-hidden transition-all duration-300 hover:shadow-xl hover:-translate-y-1">
                      <div className="aspect-square bg-gradient-to-br from-secondary to-muted relative overflow-hidden flex items-center justify-center">
                        <img src={mascot} alt="" className="w-24 h-24 object-contain opacity-30" />
                      </div>
                      <div className="p-4">
                        <div className="h-4 w-24 bg-muted rounded mb-2" />
                        <div className="h-5 w-3/4 bg-muted rounded mb-3" />
                        <div className="h-6 w-1/3 bg-muted rounded" />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </>
          )}
        </div>
      </main>
      <Footer />
    </>
  );
};

export default Favorites;