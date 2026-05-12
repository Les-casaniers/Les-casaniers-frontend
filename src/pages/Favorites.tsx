// src/pages/Favorites.tsx
import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Heart, Trash2, ShoppingBag, ArrowRight, Star, Sparkles, Shield, X } from "lucide-react";
import { useShop } from "@/store/shop";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

import mascot from "@/assets/casaniers-mascot.png"; // Import de la mascotte
import { Header } from "@/components/site/Header";
import { Footer } from "@/components/site/Footer";

interface Product {
  id: string;
  name: string;
  price: number;
  originalPrice?: number;
  image: string;
  category: string;
  inStock: boolean;
  isPremium?: boolean;
  isPro?: boolean;
  rating?: number;
  reviews?: number;
}

// Composant pour un produit favori individuel
const FavoriteProductCard = ({ 
  product, 
  onRemove, 
  onAddToCart 
}: { 
  product: Product; 
  onRemove: (id: string) => void;
  onAddToCart: (id: string) => void;
}) => {
  const [isHovered, setIsHovered] = useState(false);
  const [imageLoaded, setImageLoaded] = useState(false);

  return (
    <div 
      className="group relative bg-card border border-border rounded-xl overflow-hidden transition-all duration-300 hover:shadow-elevated hover:translate-y-[-2px]"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Badge Premium/Pro */}
      <div className="absolute top-3 left-3 z-10 flex gap-2">
        {product.isPremium && (
          <span className="inline-flex items-center gap-1 px-2 py-1 text-[10px] font-bold uppercase tracking-wider bg-gradient-to-r from-amber-500 to-orange-500 text-black rounded-full">
            <Sparkles className="h-2.5 w-2.5" />
            PREMIUM
          </span>
        )}
        {product.isPro && (
          <span className="inline-flex items-center gap-1 px-2 py-1 text-[10px] font-bold uppercase tracking-wider bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-full">
            <Shield className="h-2.5 w-2.5" />
            PRO
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
      <Link to={`/produit/${product.id}`} className="block relative aspect-square overflow-hidden bg-secondary">
        {!imageLoaded && (
          <div className="absolute inset-0 animate-pulse bg-muted" />
        )}
        <img
          src={product.image}
          alt={product.name}
          className={`w-full h-full object-cover transition-all duration-500 group-hover:scale-110 ${
            imageLoaded ? 'opacity-100' : 'opacity-0'
          }`}
          onLoad={() => setImageLoaded(true)}
        />
        {/* Overlay gradient sur hover */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
      </Link>

      {/* Contenu */}
      <div className="p-4 space-y-3">
        {/* Catégorie */}
        <div className="flex items-center justify-between">
          <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
            {product.category}
          </span>
          {product.rating && (
            <div className="flex items-center gap-1">
              <Star className="h-3 w-3 fill-amber-500 text-amber-500" />
              <span className="text-xs font-medium">{product.rating}</span>
              {product.reviews && (
                <span className="text-[10px] text-muted-foreground">({product.reviews})</span>
              )}
            </div>
          )}
        </div>

        {/* Nom du produit */}
        <Link to={`/produit/${product.id}`}>
          <h3 className="font-display font-semibold text-sm line-clamp-2 hover:text-primary transition-colors">
            {product.name}
          </h3>
        </Link>

        {/* Prix */}
        <div className="flex items-baseline gap-2">
          <span className="text-lg font-bold font-display">
            {product.price.toLocaleString('fr-FR')} €
          </span>
          {product.originalPrice && (
            <span className="text-sm text-muted-foreground line-through">
              {product.originalPrice.toLocaleString('fr-FR')} €
            </span>
          )}
        </div>

        {/* Stock */}
        <div className="flex items-center gap-2">
          <div className={`h-1.5 w-1.5 rounded-full ${product.inStock ? 'bg-green-500' : 'bg-red-500'}`} />
          <span className="text-[10px] font-medium uppercase tracking-wider text-muted-foreground">
            {product.inStock ? 'EN STOCK' : 'RUPTURE DE STOCK'}
          </span>
        </div>

        {/* Bouton Ajouter au panier */}
        <Button
          onClick={() => onAddToCart(product.id)}
          disabled={!product.inStock}
          className="w-full gap-2 btn-primary py-2.5 text-xs"
        >
          <ShoppingBag className="h-4 w-4" />
          Ajouter au panier
        </Button>
      </div>
    </div>
  );
};

// Composant pour la liste vide - AVEC MASCOOTTE
const EmptyFavorites = () => {
  return (
    <div className="flex flex-col items-center justify-center py-20 px-4 text-center">
      <div className="relative mb-8">
        {/* Mascotte animée à la place du cœur */}
        <div className="relative group">
          <div className="absolute inset-0 rounded-full bg-gradient-to-r from-amber-500/20 to-orange-500/20 blur-2xl animate-pulse" />
          <img 
            src={mascot} 
            alt="Mascotte Les Casaniers" 
            className="relative w-48 h-48 object-contain animate-float dropdown:animate-bounce"
          />
        </div>
        
        {/* Petites mascottes flottantes */}
        <div className="absolute -top-4 -right-4 animate-pulse-slow">
          <img src={mascot} alt="" className="w-12 h-12 object-contain opacity-60" />
        </div>
        <div className="absolute -bottom-4 -left-4 animate-pulse-slow animation-delay-500">
          <img src={mascot} alt="" className="w-10 h-10 object-contain opacity-40" />
        </div>
      </div>
      
      <h2 className="text-2xl font-display font-bold mb-2">
        Votre liste de favoris est vide
      </h2>
      <p className="text-muted-foreground mb-8 max-w-md">
        Explorez notre catalogue et ajoutez vos produits préférés en cliquant sur le cœur.
        <br />
        <span className="text-xs opacity-70">La mascotte vous attend ! 🎮</span>
      </p>
      
      <div className="flex flex-col sm:flex-row gap-4">
        <Link to="/catalogue">
          <Button className="gap-2 btn-primary">
            Explorer le catalogue
            <ArrowRight className="h-4 w-4" />
          </Button>
        </Link>
        <Link to="/configurateur">
          <Button variant="outline" className="gap-2">
            
            Configurer mon PC
          </Button>
        </Link>
      </div>
    </div>
  );
};

// Composant de confirmation pour actions - AVEC MASCOOTTE
const ActionToast = ({ message, type = 'success' }: { message: string; type?: 'success' | 'error' }) => {
  return (
    <div className="flex items-center gap-3">
      <div className="relative">
        <img 
          src={mascot} 
          alt="" 
          className="w-8 h-8 object-contain animate-bounce" 
        />
        <div className="absolute -top-1 -right-1 w-2 h-2 bg-green-500 rounded-full animate-pulse" />
      </div>
      <div className="flex flex-col">
        <span className="text-sm font-medium">{message}</span>
        <span className="text-xs text-muted-foreground">Les Casaniers</span>
      </div>
    </div>
  );
};

// Composant principal des favoris
export const Favorites = () => {
  const { favorites, addToCart } = useShop();
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedProducts, setSelectedProducts] = useState<Set<string>>(new Set());

  // Simulation de chargement des produits favoris - AVEC MASCOOTTE
  useEffect(() => {
    const loadFavorites = async () => {
      setIsLoading(true);
      await new Promise(resolve => setTimeout(resolve, 500));
      
      const mockProducts: Product[] = favorites.map((id, index) => ({
        id,
        name: `Produit ${index + 1}`,
        price: Math.floor(Math.random() * 500) + 50,
        originalPrice: Math.random() > 0.7 ? Math.floor(Math.random() * 600) + 100 : undefined,
        image: `https://picsum.photos/id/${index + 10}/400/400`,
        category: ['PC Gaming', 'Composants', 'Périphériques'][Math.floor(Math.random() * 3)],
        inStock: Math.random() > 0.2,
        isPremium: Math.random() > 0.8,
        isPro: Math.random() > 0.85,
        rating: 4 + Math.random(),
        reviews: Math.floor(Math.random() * 500) + 10,
      }));
      
      setProducts(mockProducts);
      setIsLoading(false);
    };
    
    loadFavorites();
  }, [favorites]);

  const handleRemove = (productId: string) => {
   
    setProducts(prev => prev.filter(p => p.id !== productId));
    setSelectedProducts(prev => {
      const newSet = new Set(prev);
      newSet.delete(productId);
      return newSet;
    });
    toast.custom((t) => (
      <ActionToast message="Produit retiré des favoris" type="success" />
    ));
  };

  const handleAddToCart = (productId: string) => {
    const product = products.find(p => p.id === productId);
    if (product && product.inStock) {
      addToCart(productId, 1);
      toast.custom((t) => (
        <ActionToast message={`${product.name} ajouté au panier`} type="success" />
      ));
    }
  };

  const handleAddSelectedToCart = () => {
    let addedCount = 0;
    products.forEach(product => {
      if (selectedProducts.has(product.id) && product.inStock) {
        addToCart(product.id, 1);
        addedCount++;
      }
    });
    
    if (addedCount > 0) {
      toast.custom((t) => (
        <ActionToast message={`${addedCount} produit(s) ajouté(s) au panier`} type="success" />
      ));
    }
  };

  const handleRemoveSelected = () => {
    selectedProducts.forEach(productId => {
     
      setProducts(prev => prev.filter(p => p.id !== productId));
    });
    setSelectedProducts(new Set());
    toast.custom((t) => (
      <ActionToast message={`${selectedProducts.size} produit(s) retiré(s) des favoris`} type="success" />
    ));
  };

  const toggleSelectProduct = (productId: string) => {
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

  // Skeleton loader - AVEC MASCOOTTE
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
            
            {/* Mascotte loader */}
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

  return (
    <>
      <Header />
      <main className="min-h-screen">
        <div className="container-x py-8">
          {/* Header avec mascotte */}
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
                  <h1 className="text-3xl font-display font-bold tracking-tight mb-2">
                    Mes favoris
                  </h1>
                  <p className="text-muted-foreground">
                    {products.length} produit{products.length > 1 ? 's' : ''} dans votre liste
                  </p>
                </div>
              </div>
              
              {/* Actions groupées */}
              {products.length > 0 && (
                <div className="flex gap-3">
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
                        className="gap-2 btn-primary"
                      >
                        <ShoppingBag className="h-4 w-4" />
                        Ajouter au panier ({selectedProducts.size})
                      </Button>
                    </>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Si liste vide */}
          {products.length === 0 ? (
            <EmptyFavorites />
          ) : (
            <>
              {/* Grille des produits */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {products.map((product) => (
                  <div key={product.id} className="relative">
                    {/* Checkbox de sélection */}
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
                    />
                  </div>
                ))}
              </div>

              {/* Recommandations avec mascotte */}
              <div className="mt-16 pt-8 border-t border-border">
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center gap-3">
                    <img 
                      src={mascot} 
                      alt="Mascotte" 
                      className="w-12 h-12 object-contain animate-float"
                    />
                    <div>
                      <h2 className="text-2xl font-display font-bold tracking-tight">
                        Vous pourriez aussi aimer
                      </h2>
                      <p className="text-muted-foreground text-sm mt-1">
                        La mascotte vous recommande ces produits !
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
                
                {/* Produits recommandés */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                  {[1, 2, 3, 4].map((i) => (
                    <div key={i} className="group bg-card border border-border rounded-xl overflow-hidden transition-all duration-300 hover:shadow-elevated hover:translate-y-[-2px]">
                      <div className="aspect-square bg-gradient-to-br from-secondary to-muted relative overflow-hidden">
                        <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300 bg-black/50">
                          <Button size="sm" className="btn-primary text-xs">
                            Voir le produit
                          </Button>
                        </div>
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