import { SiteLayout } from "@/components/site/SiteLayout";
import { useShop } from "@/store/shop";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Minus, Plus, Trash2, ShoppingBag, ArrowRight, ShieldCheck, Truck, Tag } from "lucide-react";
import { formatAr } from "@/lib/products";
import { useEffect, useState } from "react";
import { toast } from "@/hooks/use-toast";
import fosa from "@/assets/casaniers-mascot.png";

const Cart = () => {
  const { cartDetailed, setQty, removeFromCart, cartTotal, clearCart } = useShop();
  const [promo, setPromo] = useState("");
  const [discount, setDiscount] = useState(0);

  useEffect(() => { document.title = "Mon panier â€” Les Casaniers Madagascar"; }, []);

  const shipping = cartTotal > 5000000 ? 0 : 50000;
  const total = Math.max(0, cartTotal - discount + shipping);

  const applyPromo = () => {
    if (promo.toUpperCase() === "FOSA10") {
      setDiscount(Math.round(cartTotal * 0.1));
      toast({ title: "Code appliquÃ© !", description: "-10% sur votre commande." });
    } else {
      toast({ title: "Code invalide", description: "Essayez FOSA10." });
    }
  };

  return (
    <SiteLayout>
      <section className="container-x py-12">
        <div className="mb-8">
          <div className="pill mb-3"><ShoppingBag className="h-3.5 w-3.5 text-accent" /> Le Bond</div>
          <h1 className="font-display text-4xl lg:text-5xl font-bold tracking-tight">Votre panier</h1>
        </div>

        {cartDetailed.length === 0 ? (
          <div className="card-soft p-12 text-center max-w-xl mx-auto">
            <img src={fosa} alt="" className="h-24 w-24 mx-auto animate-float mb-4" />
            <h2 className="font-display text-2xl font-bold mb-2">Le Fosa s'ennuie un peu iciâ€¦</h2>
            <p className="text-muted-foreground mb-6">Aucun article dans votre panier. Allez vite dÃ©couvrir nos configurations !</p>
            <Button variant="hero" size="lg" asChild>
              <Link to="/catalogue">Explorer le catalogue <ArrowRight /></Link>
            </Button>
          </div>
        ) : (
          <div className="grid lg:grid-cols-12 gap-8">
            <div className="lg:col-span-8 space-y-4">
              {cartDetailed.map(({ product, qty, subtotal }) => (
                <div key={product.id} className="card-soft p-5 flex gap-4 hover-lift">
                  <Link to={`/produit/${product.id}`} className="shrink-0">
                    <img src={product.image} alt={product.name} className="h-28 w-28 rounded-xl object-cover" />
                  </Link>
                  <div className="flex-1 min-w-0">
                    <div className="text-xs font-mono uppercase tracking-wider text-accent">{product.category}</div>
                    <Link to={`/produit/${product.id}`} className="font-display font-bold text-lg hover:text-accent transition-colors">{product.name}</Link>
                    <p className="text-xs text-muted-foreground italic line-clamp-1">"{product.tagline}"</p>
                    <div className="flex items-center justify-between mt-3">
                      <div className="flex items-center bg-secondary rounded-full">
                        <button onClick={() => setQty(product.id, qty - 1)} className="h-9 w-9 flex items-center justify-center hover:text-accent">
                          <Minus className="h-3.5 w-3.5" />
                        </button>
                        <span className="w-8 text-center font-semibold tabular-nums text-sm">{qty}</span>
                        <button onClick={() => setQty(product.id, qty + 1)} className="h-9 w-9 flex items-center justify-center hover:text-accent">
                          <Plus className="h-3.5 w-3.5" />
                        </button>
                      </div>
                      <div className="flex items-center gap-3">
                        <div className="font-display font-bold">{formatAr(subtotal)}</div>
                        <button onClick={() => removeFromCart(product.id)} className="text-muted-foreground hover:text-destructive transition-colors">
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}

              <button onClick={clearCart} className="text-xs text-muted-foreground hover:text-destructive transition-colors">
                Vider le panier
              </button>
            </div>

            <aside className="lg:col-span-4 lg:sticky lg:top-32 self-start space-y-4">
              <div className="card-soft p-6">
                <h3 className="font-display font-bold text-lg mb-4">RÃ©capitulatif</h3>
                <div className="space-y-2 text-sm">
                  <Row label="Sous-total" value={formatAr(cartTotal)} />
                  {discount > 0 && <Row label="Remise FOSA10" value={`- ${formatAr(discount)}`} accent />}
                  <Row label="Livraison" value={shipping === 0 ? "Offerte ðŸŽ‰" : formatAr(shipping)} />
                </div>
                <div className="border-t border-border mt-4 pt-4 flex items-end justify-between">
                  <span className="font-semibold">Total</span>
                  <span className="font-display font-bold text-2xl">{formatAr(total)}</span>
                </div>

                <div className="flex gap-2 mt-4">
                  <input value={promo} onChange={(e) => setPromo(e.target.value)} placeholder="Code promo"
                    className="flex-1 h-10 px-4 rounded-full bg-secondary text-sm border border-transparent focus:outline-none focus:border-accent" />
                  <Button variant="soft" size="sm" onClick={applyPromo}><Tag className="h-3.5 w-3.5" /></Button>
                </div>

                <Button variant="hero" size="lg" className="w-full mt-4">
                  Demander mon devis <ArrowRight />
                </Button>
                <Button variant="soft" size="sm" className="w-full mt-2" asChild>
                  <Link to="/catalogue">Continuer mes achats</Link>
                </Button>
              </div>

              <div className="card-soft p-4 space-y-2 text-xs">
                <div className="flex items-center gap-2"><ShieldCheck className="h-4 w-4 text-accent" /><span>Paiement sÃ©curisÃ© Â· 3Ã— sans frais</span></div>
                <div className="flex items-center gap-2"><Truck className="h-4 w-4 text-accent" /><span>Livraison gratuite dÃ¨s 5 000 000 Ar</span></div>
              </div>
            </aside>
          </div>
        )}
      </section>
    </SiteLayout>
  );
};

const Row = ({ label, value, accent }: { label: string; value: string; accent?: boolean }) => (
  <div className="flex items-center justify-between">
    <span className="text-muted-foreground">{label}</span>
    <span className={`tabular-nums ${accent ? "text-accent font-semibold" : ""}`}>{value}</span>
  </div>
);

export default Cart;

