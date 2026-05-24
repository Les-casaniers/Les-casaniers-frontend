import { SiteLayout } from "@/components/site/SiteLayout";
import { formatAr } from "@/lib/products";
import { useParams, Link, Navigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Heart, ShoppingBag, Star, Shield, Truck, Wrench, Minus, Plus, ChevronRight, Cpu, MonitorCog, MemoryStick, HardDrive, Zap, Snowflake, CircuitBoard, Box, Loader2 } from "lucide-react";
import { useShop } from "@/store/shop";
import { toast } from "@/hooks/use-toast";
import fosa from "@/assets/casaniers-mascot.png";
import { Product, productImage, productSpec, useProduct, useProducts } from "@/hooks/useProducts";

const specIcons = { 
  processeur: Cpu, 
  carte_graphique: MonitorCog, 
  ram: MemoryStick, 
  disque_dur: HardDrive, 
  alimentation: Zap, 
  refroidissement: Snowflake, 
  carte_mere: CircuitBoard, 
  boitier: Box 
} as const;

const specLabels = { 
  processeur: "Processeur", 
  carte_graphique: "Carte graphique", 
  ram: "Mémoire vive", 
  disque_dur: "Stockage", 
  alimentation: "Alimentation", 
  refroidissement: "Refroidissement", 
  carte_mere: "Carte mère", 
  boitier: "Boîtier" 
} as const;

const ProductPage = () => {
  const { id } = useParams();
  const productId = id ? Number(id) : null;
  const safeProductId = productId !== null && !Number.isNaN(productId) ? productId : null;
  const { data: product, isLoading, error } = useProduct(safeProductId);
  const { data: allProducts } = useProducts();
  
  const { addToCart, toggleFavorite, favorites } = useShop();
  const [qty, setQty] = useState(1);
  const [tab, setTab] = useState<"specs" | "story" | "garantie">("specs");

  useEffect(() => {
    if (product) document.title = `${product.nom} — Les Casaniers Madagascar`;
  }, [product]);

  if (isLoading) {
    return (
      <SiteLayout>
        <div className="min-h-[70vh] flex flex-col items-center justify-center gap-4">
          <Loader2 className="h-12 w-12 animate-spin text-accent" />
          <p className="text-muted-foreground animate-pulse">Chargement de votre configuration...</p>
        </div>
      </SiteLayout>
    );
  }

  if (!product || error) return <Navigate to="/catalogue" replace />;
  if (!product.est_dispo || product.quantite_stock <= 0 || !product.actif) return <Navigate to="/catalogue" replace />;

  const fav = favorites.includes(product.id.toString());
  const related = allProducts?.filter((p: any) => p.id !== product.id && p.categorie_id === product.categorie_id && p.est_dispo && p.quantite_stock > 0 && p.actif).slice(0, 3) || [];

  const specs: any = {
    processeur: productSpec(product, "processeur"),
    carte_graphique: productSpec(product, "carte_graphique"),
    ram: productSpec(product, "ram"),
    disque_dur: productSpec(product, "disque_dur") || productSpec(product, "stockage"),
    alimentation: productSpec(product, "alimentation"),
    refroidissement: productSpec(product, "refroidissement"),
    carte_mere: productSpec(product, "carte_mere"),
    boitier: productSpec(product, "boitier")
  };

  const toCartProduct = (item: Product) => ({
    id: String(item.id),
    name: item.nom,
    category: item.categorie?.nom || item.type_produit,
    tagline: item.description_courte || item.tagline || "Configuration Les Casaniers",
    price: Number(item.prix),
    image: productImage(item),
  });

  return (
    <SiteLayout>
      {/* Breadcrumb */}
      <div className="container-x pt-6 pb-2 text-xs text-muted-foreground flex items-center gap-1.5">
        <Link to="/" className="hover:text-foreground">Accueil</Link>
        <ChevronRight className="h-3 w-3" />
        <Link to="/catalogue" className="hover:text-foreground">Catalogue</Link>
        <ChevronRight className="h-3 w-3" />
        <span className="text-foreground">{product.nom}</span>
      </div>

      <section className="container-x py-8 grid lg:grid-cols-2 gap-12">
        {/* Image */}
        <div className="relative">
          <div className="absolute inset-0 bg-gradient-glow rounded-[2rem] blur-2xl" />
          <div className="relative card-soft overflow-hidden p-2">
            <img src={productImage(product)} alt={product.nom} className="w-full aspect-square object-cover rounded-2xl" />
            {product.badge && (
              <span className="absolute top-6 left-6 pill bg-gradient-accent text-accent-foreground border-0">⚡ {product.badge}</span>
            )}
          </div>
          {product.images && product.images.length > 0 && (
            <div className="grid grid-cols-4 gap-3 mt-4">
              {product.images.map((img: any, i: number) => (
                <button key={i} className="aspect-square rounded-xl overflow-hidden border border-border hover:border-accent transition-colors">
                  <img src={img.url} alt="" className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Infos */}
        <div className="space-y-6">
          <div>
            <div className="text-xs font-mono uppercase tracking-wider text-accent mb-2">{product.categorie?.nom}</div>
            <h1 className="font-display text-4xl lg:text-5xl font-bold tracking-tight">{product.nom}</h1>
            <p className="text-lg text-muted-foreground italic mt-2">"{product.description_courte || product.tagline || 'Une puissance inegalee.'}"</p>
          </div>

          <div className="flex items-center gap-4 text-sm">
            <div className="flex items-center gap-1">
              {Array.from({ length: 5 }).map((_, i) => (
                <Star key={i} className={`h-4 w-4 ${i < Math.round(product.note || 5) ? "fill-accent text-accent" : "text-muted"}`} />
              ))}
              <span className="font-semibold ml-1">{product.note || 5.0}</span>
            </div>
            <span className="h-4 w-px bg-border" />
            <span className={`text-xs font-medium ${product.quantite_stock > 5 ? "text-tech" : "text-accent"}`}>
              {product.quantite_stock > 5 ? `En stock (${product.quantite_stock})` : `Plus que ${product.quantite_stock} en stock !`}
            </span>
          </div>

          <div className="card-soft p-6 bg-gradient-to-br from-card to-secondary/30">
            <div className="text-xs text-muted-foreground uppercase tracking-wider">Prix tout compris</div>
            <div className="font-display font-bold text-4xl mt-1">{formatAr(product.prix)}</div>
            <div className="text-xs text-muted-foreground mt-1">ou 3× {formatAr(Math.round(product.prix / 3))} sans frais</div>
          </div>

          <div className="flex items-center gap-3">
            <div className="flex items-center bg-secondary rounded-full">
              <button onClick={() => setQty(Math.max(1, qty - 1))} className="h-12 w-12 flex items-center justify-center hover:text-accent">
                <Minus className="h-4 w-4" />
              </button>
              <span className="w-10 text-center font-semibold tabular-nums">{qty}</span>
              <button onClick={() => setQty(qty + 1)} className="h-12 w-12 flex items-center justify-center hover:text-accent">
                <Plus className="h-4 w-4" />
              </button>
            </div>
            <Button variant="hero" size="lg" className="flex-1"
              onClick={() => { addToCart(String(product.id), qty, toCartProduct(product)); toast({ title: "Ajoute au panier", description: `${qty} x ${product.nom}` }); }}>
              <ShoppingBag /> Ajouter au panier
            </Button>
            <Button variant="soft" size="icon" className="h-12 w-12" onClick={() => toggleFavorite(product.id.toString())}>
              <Heart className={fav ? "fill-accent text-accent" : ""} />
            </Button>
          </div>

          <div className="grid grid-cols-3 gap-3 text-xs">
            <div className="card-soft p-3 flex flex-col items-center text-center gap-1">
              <Shield className="h-5 w-5 text-accent" /><span className="font-semibold">Garantie 24 mois</span>
            </div>
            <div className="card-soft p-3 flex flex-col items-center text-center gap-1">
              <Truck className="h-5 w-5 text-accent" /><span className="font-semibold">Livraison Tana</span>
            </div>
            <div className="card-soft p-3 flex flex-col items-center text-center gap-1">
              <Wrench className="h-5 w-5 text-accent" /><span className="font-semibold">SAV à vie</span>
            </div>
          </div>

          {/* Tabs */}
          <div>
            <div className="flex gap-1 border-b border-border">
              {(["specs", "story", "garantie"] as const).map((t) => (
                <button key={t} onClick={() => setTab(t)}
                  className={`px-4 py-3 text-sm font-medium relative ${tab === t ? "text-foreground" : "text-muted-foreground"}`}>
                  {t === "specs" ? "Composants" : t === "story" ? "L'histoire" : "Garantie & SAV"}
                  {tab === t && <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-accent rounded-full" />}
                </button>
              ))}
            </div>
            <div className="pt-6 animate-fade-in">
              {tab === "specs" && (
                <div className="grid sm:grid-cols-2 gap-3">
                  {(Object.keys(specs) as Array<keyof typeof specs>).map((k) => {
                    const Icon = specIcons[k as keyof typeof specIcons];
                    if (!specs[k]) return null;
                    const specKey = String(k);
                    return (
                      <div key={specKey} className="card-soft p-4 flex items-start gap-3 hover:border-accent/40 transition-colors">
                        <div className="h-10 w-10 rounded-xl bg-secondary flex items-center justify-center shrink-0">
                          <Icon className="h-5 w-5 text-accent" />
                        </div>
                        <div className="min-w-0">
                          <div className="text-[10px] uppercase tracking-wider text-muted-foreground">{specLabels[k as keyof typeof specLabels]}</div>
                          <div className="font-medium text-sm truncate">{specs[k]}</div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
              {tab === "story" && (
                <div className="flex gap-4">
                  <img src={fosa} alt="" className="h-16 w-16 shrink-0 animate-float" />
                  <p className="text-muted-foreground leading-relaxed">{product.description || "Aucune description disponible pour ce produit."}</p>
                </div>
              )}
              {tab === "garantie" && (
                <ul className="space-y-2 text-sm text-muted-foreground">
                  <li>✓ Garantie pièces et main d'œuvre 24 mois</li>
                  <li>✓ Diagnostic gratuit à vie au showroom</li>
                  <li>✓ Mise à jour BIOS et drivers offerte 1×/an</li>
                  <li>✓ Pièces de rechange importées d'Europe</li>
                </ul>
              )}
            </div>
          </div>
        </div>
      </section>

      <section className="container-x pb-12">
        <div className="card-soft p-6">
          <div className="flex items-center justify-between gap-4">
            <div>
              <div className="text-xs text-muted-foreground uppercase tracking-wider">Configurations disponibles</div>
              <h2 className="font-display text-2xl font-bold">Choisissez votre profil</h2>
            </div>
            <div className="text-xs text-muted-foreground">
              {(product.configurations?.length || 0)} configuration(s)
            </div>
          </div>

          {product.configurations && product.configurations.length > 0 ? (
            <div className="mt-6 grid md:grid-cols-2 gap-4">
              {product.configurations.map((config) => (
                <div key={config.id} className="card-soft p-4 border border-border/60">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <div className="text-[10px] uppercase tracking-wider text-muted-foreground">{config.type || "Configuration"}</div>
                      <div className="font-semibold text-base">{config.nom_configuration}</div>
                    </div>
                    {config.prix_total !== null && config.prix_total !== undefined && (
                      <div className="text-sm font-bold text-accent">{formatAr(config.prix_total)}</div>
                    )}
                  </div>
                  {(config.detail || config.capacite) && (
                    <div className="mt-3 text-sm text-muted-foreground space-y-1">
                      {config.detail && <div>{config.detail}</div>}
                      {config.capacite && <div>Capacite : {config.capacite}</div>}
                    </div>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <div className="mt-4 text-sm text-muted-foreground">
              Aucune configuration detaillee disponible pour ce produit.
            </div>
          )}
        </div>
      </section>

      {/* Related */}
      {related.length > 0 && (
        <section className="container-x py-16 border-t border-border mt-8">
          <h2 className="font-display text-3xl font-bold mb-8">Vous aimerez aussi</h2>
          <div className="grid md:grid-cols-3 gap-6">
            {related.map((r: any) => (
              <Link key={r.id} to={`/produit/${r.id}`} className="card-soft overflow-hidden hover-lift block group">
                <div className="aspect-[4/3] overflow-hidden bg-secondary">
                  <img src={productImage(r)} alt={r.nom} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" />
                </div>
                <div className="p-5">
                  <h3 className="font-display font-bold text-lg">{r.nom}</h3>
                  <div className="font-display font-bold text-accent mt-1">{formatAr(r.prix)}</div>
                </div>
              </Link>
            ))}
          </div>
        </section>
      )}
    </SiteLayout>
  );
};

export default ProductPage;


