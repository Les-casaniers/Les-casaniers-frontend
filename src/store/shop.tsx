import { createContext, useContext, useEffect, useMemo, useState, ReactNode } from "react";
import { products, Product as StaticProduct } from "@/lib/products";

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
  favorites: string[];
  addToCart: (id: string, qty?: number, product?: CartProduct) => void;
  removeFromCart: (id: string) => void;
  setQty: (id: string, qty: number) => void;
  toggleFavorite: (id: string) => void;
  clearCart: () => void;
  cartCount: number;
  cartTotal: number;
  cartDetailed: { product: CartProduct; qty: number; subtotal: number }[];
};

const Ctx = createContext<ShopCtx | null>(null);

const KEY = "fosatech-shop-v1";

export const ShopProvider = ({ children }: { children: ReactNode }) => {
  const [cart, setCart] = useState<CartItem[]>([]);
  const [favorites, setFavorites] = useState<string[]>([]);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(KEY);
      if (raw) {
        const data = JSON.parse(raw);
        setCart(data.cart ?? []);
        setFavorites(data.favorites ?? []);
      }
    } catch {}
  }, []);

  useEffect(() => {
    localStorage.setItem(KEY, JSON.stringify({ cart, favorites }));
  }, [cart, favorites]);

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
  const toggleFavorite = (id: string) =>
    setFavorites((f) => (f.includes(id) ? f.filter((x) => x !== id) : [...f, id]));
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
    cart, favorites, addToCart, removeFromCart, setQty, toggleFavorite, clearCart,
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
