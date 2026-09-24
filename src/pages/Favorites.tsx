// src/pages/Favorites.tsx
import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Trash2, ShoppingBag, ArrowRight, Loader2 } from "lucide-react";
import { useShop } from "@/store/shop";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import api from "@/service/api";
import { useAuth } from "@/contexts/AuthContext";
import mascot from "@/assets/casaniers-mascot.png";
import { Header } from "@/components/site/Header";
import { Footer } from "@/components/site/Footer";
import { getProductImageUrl } from "@/lib/utils";

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
  const imageUrl = getProductImageUrl(product);

  const formatPrice = (prix: number, devise: string = 'MGA') => {
    return new Intl.NumberFormat('fr-FR').format(prix) + ` ${devise}`;
  };

  const getTypeLabel = (type: string | undefined) => {
    if (!type) return "Produit";
    return type.charAt(0).toUpperCase() + type.slice(1);
  };

  return (
    <article className="group relative overflow-hidden rounded-xl bg-white p-3 text-black shadow-sm">
      {/* Catégorie + bouton ajouter au panier */}
      <div className="flex items-center justify-between text-[10px] italic text-black/70">
        <span className="font-medium not-italic text-black/80">
          {getTypeLabel(product.type_produit)}
        </span>
        <button
          onClick={() => onAddToCart(product.id)}
          disabled={product.quantite_stock <= 0 || isAddingToCart}
          aria-label="Ajouter au panier"
          className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-orange-500 text-white transition hover:bg-orange-600 disabled:opacity-50"
        >
          {isAddingToCart ? (
            <Loader2 className="h-3.5 w-3.5 animate-spin" />
          ) : (
            <ShoppingBag className="h-3.5 w-3.5" />
          )}
        </button>
      </div>

      {/* Image */}
      <Link to={`/produit/${product.id}`} className="mt-2 block h-36 sm:h-40">
        <img
          src={imageUrl}
          alt={product.nom}
          className="h-full w-full object-contain"
          onError={(e) => {
            (e.target as HTMLImageElement).src = "/placeholder-pc.jpg";
          }}
        />
      </Link>

      {/* Séparateur */}
      <div className="mt-3 h-[2px] w-full rounded-full bg-black" />

      {/* Nom + bouton supprimer */}
      <div className="mt-3 flex items-start justify-between gap-2">
        <Link
          to={`/produit/${product.id}`}
          className="flex-1 text-xs font-bold leading-snug transition hover:underline"
        >
          {product.nom}
        </Link>
        <button
          onClick={() => onRemove(product.id)}
          aria-label="Retirer des favoris"
          className="shrink-0 rounded p-1 text-black/40 transition hover:bg-black hover:text-white"
        >
          <Trash2 className="h-3.5 w-3.5" />
        </button>
      </div>

      {/* Prix */}
      <p className="mt-4 rounded-full bg-black py-2 text-center text-sm font-bold text-white">
        {formatPrice(product.prix, product.devise)}
      </p>
    </article>
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
  const { addToCart: addToLocalCart, removeFavoriteLocal } = useShop();
  const { isAuthenticated, user } = useAuth();
  const [favoris, setFavoris] = useState<Favori[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [addingToCart, setAddingToCart] = useState<number | null>(null);

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
        await api.delete(`/favoris/${productId}`);
        setFavoris(favoris.filter(f => f.produit_id !== productId));
        setProducts(products.filter(p => p.id !== productId));
        removeFavoriteLocal(productId);
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
              <div>
                <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">
                  Salut,
                </h1>
                <p className="mt-1 inline-block border-b border-foreground/60 pb-1 text-sm font-medium italic text-muted-foreground sm:text-base">
                  Consulte tes produits favoris
                </p>
              </div>
            </div>
          </div>

          {products.length === 0 ? (
            <EmptyFavorites />
          ) : (
            <>
              {/* Grille des produits */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
                {products.map((product) => (
                  <FavoriteProductCard
                    key={product.id}
                    product={product}
                    onRemove={handleRemove}
                    onAddToCart={handleAddToCart}
                    isAddingToCart={addingToCart === product.id}
                  />
                ))}
              </div>

              {/* Bloc "Besoin d'ajouter des produits au favoris ?" */}
              <div className="mt-8 rounded-xl bg-white px-6 py-9 text-center text-black shadow-sm sm:py-10">
                <p className="text-sm italic text-black/65 sm:text-base">
                  Besoin d&apos;ajouter des produits au favoris ?
                </p>
                <div className="mt-3 flex flex-wrap items-center justify-center gap-x-2 gap-y-1 text-sm font-semibold sm:text-base">
                  <Link to="/catalogue" className="transition hover:text-primary hover:underline">
                    Ajoute-les ici
                  </Link>
                  <span className="font-normal text-black/65">ou</span>
                  <Link to="/configurateur" className="transition hover:text-primary hover:underline">
                    Configure ton propre setup
                  </Link>
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