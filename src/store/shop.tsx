import { createContext, useContext, useEffect, useMemo, useState, ReactNode } from "react";
import { products, Product } from "@/lib/products";

type CartItem = { productId: string; qty: number };

type ShopCtx = {
  cart: CartItem[];
  favorites: string[];
  addToCart: (id: string, qty?: number) => void;
  removeFromCart: (id: string) => void;
  setQty: (id: string, qty: number) => void;
  toggleFavorite: (id: string) => void;
  clearCart: () => void;
  cartCount: number;
  cartTotal: number;
  cartDetailed: { product: Product; qty: number; subtotal: number }[];
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

  const addToCart = (id: string, qty = 1) => {
    setCart((c) => {
      const ex = c.find((i) => i.productId === id);
      if (ex) return c.map((i) => (i.productId === id ? { ...i, qty: i.qty + qty } : i));
      return [...c, { productId: id, qty }];
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
          const product = products.find((p) => p.id === i.productId);
          if (!product) return null;
          return { product, qty: i.qty, subtotal: product.price * i.qty };
        })
        .filter(Boolean) as { product: Product; qty: number; subtotal: number }[],
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
