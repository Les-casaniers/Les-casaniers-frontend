import { createContext, useContext, useEffect, useMemo, useState, ReactNode, MouseEvent } from "react";
import { products, Product as StaticProduct } from "@/lib/products";
import api from "@/service/api";
import { toast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";

export type CartProduct = {
  id: string;
  name: string;
  category: string;
  tagline: string;
  price: number;
  image: string;
};

type CartItem = { productId: string; qty: number; product?: CartProduct };

type ShopCtx = {
  cart: CartItem[];
  favorites: number[];
  addToCart: (id: string, qty?: number, product?: CartProduct) => void;
  removeFromCart: (id: string) => void;
  setQty: (id: string, qty: number) => void;
  toggleFavorite: (produitId: number, e?: MouseEvent) => Promise<void>;
  removeFavoriteLocal: (produitId: number) => void;
  clearCart: () => void;
  cartCount: number;
  cartTotal: number;
  cartDetailed: { product: CartProduct; qty: number; subtotal: number }[];
};

const Ctx = createContext<ShopCtx | null>(null);

const KEY = "fosatech-shop-v1";

export const ShopProvider = ({ children }: { children: ReactNode }) => {
  const { isAuthenticated } = useAuth();
  const [cart, setCart] = useState<CartItem[]>([]);
  const [favorites, setFavorites] = useState<number[]>([]);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(KEY);
      if (raw) {
        const data = JSON.parse(raw);
        setCart(data.cart ?? []);
      }
    } catch {}
  }, []);

  // Favorites now come from the server, not localStorage, so Product.tsx,
  // Pro.tsx and Favorites.tsx all agree on the same source of truth.
  useEffect(() => {
    if (!isAuthenticated) {
      setFavorites([]);
      return;
    }

    const fetchFavorites = async () => {
      try {
        const response = await api.get("/favoris");
        let favorisData: any[] = [];
        if (response?.data?.data) {
          favorisData = Array.isArray(response.data.data) ? response.data.data : [];
        } else if (Array.isArray(response?.data)) {
          favorisData = response.data;
        } else if (response?.data?.favoris) {
          favorisData = response.data.favoris;
        }
        const favoriteIds = favorisData.map((f: any) => f.produit_id).filter(Boolean);
        setFavorites(favoriteIds);
      } catch (error: any) {
        if (error.response?.status !== 401) {
          console.error("Erreur chargement favoris:", error);
        }
      }
    };

    fetchFavorites();
  }, [isAuthenticated]);

  useEffect(() => {
    localStorage.setItem(KEY, JSON.stringify({ cart }));
  }, [cart]);

  const addToCart = (id: string, qty = 1, product?: CartProduct) => {
    setCart((c) => {
      const ex = c.find((i) => i.productId === id);
      if (ex) return c.map((i) => (i.productId === id ? { ...i, qty: i.qty + qty, product: product ?? i.product } : i));
      return [...c, { productId: id, qty, product }];
    });
  };

  const removeFromCart = (id: string) => setCart((c) => c.filter((i) => i.productId !== id));
  const setQty = (id: string, qty: number) =>
    setCart((c) => c.map((i) => (i.productId === id ? { ...i, qty: Math.max(1, qty) } : i)));
  const toggleFavorite = async (produitId: number, e?: MouseEvent) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }

    if (!produitId) return;

    try {
      const isCurrentlyFavorite = favorites.includes(produitId);
      if (isCurrentlyFavorite) {
        await api.delete(`/favoris/${produitId}`);
        setFavorites(favorites.filter((id) => id !== produitId));
        toast({
          title: "Retiré des favoris",
          description: "Produit retiré de votre liste",
        });
      } else {
        await api.post("/favoris", { produit_id: produitId });
        setFavorites([...favorites, produitId]);
        toast({
          title: "Ajouté aux favoris",
          description: "Produit ajouté à votre liste",
        });
      }
    } catch (error: any) {
      if (error.response?.status === 401) {
        toast({
          title: "Connexion requise",
          description: "Veuillez vous connecter pour ajouter aux favoris",
          variant: "destructive",
        });
      } else {
        toast({
          title: "Erreur",
          description: "Une erreur est survenue",
          variant: "destructive",
        });
      }
    }
  };
  const removeFavoriteLocal = (produitId: number) =>
    setFavorites((f) => f.filter((id) => id !== produitId));

  const clearCart = () => setCart([]);

  const cartDetailed = useMemo(
    () =>
      cart
        .map((i) => {
          const staticProduct = products.find((p) => p.id === i.productId);
          const product: CartProduct | undefined = i.product ?? (staticProduct ? {
            id: staticProduct.id,
            name: staticProduct.name,
            category: staticProduct.category,
            tagline: staticProduct.tagline,
            price: staticProduct.price,
            image: staticProduct.image,
          } : undefined);
          if (!product) return null;
          return { product, qty: i.qty, subtotal: product.price * i.qty };
        })
        .filter(Boolean) as { product: CartProduct; qty: number; subtotal: number }[],
    [cart],
  );

  const value: ShopCtx = {
    cart, favorites, addToCart, removeFromCart, setQty, toggleFavorite, removeFavoriteLocal, clearCart,
    cartCount: cart.reduce((s, i) => s + i.qty, 0),
    cartTotal: cartDetailed.reduce((s, i) => s + i.subtotal, 0),
    cartDetailed,
  };
  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
};

export const useShop = () => {
  const c = useContext(Ctx);
  if (!c) throw new Error("useShop must be used within ShopProvider");
  return c;
};
