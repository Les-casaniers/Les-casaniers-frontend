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
import api from "@/service/api";
import { useAuth } from "@/contexts/AuthContext";

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
  
  const { addToCart: addToLocalCart, toggleFavorite, favorites } = useShop();
  const { user, isAuthenticated } = useAuth();
  const [qty, setQty] = useState(1);
  const [tab, setTab] = useState<"specs" | "configs" | "story" | "garantie">("specs");
  const [isAddingToCart, setIsAddingToCart] = useState(false);
  const [selectedConfigId, setSelectedConfigId] = useState<number | null>(null);

  useEffect(() => {
    if (product) document.title = `${product.nom} — Les Casaniers Madagascar`;
  }, [product]);

  const activeConfig = product?.configurations?.find((c) => c.id === selectedConfigId);
  const displayedPrice = activeConfig ? Number(activeConfig.prix_total) : (product ? Number(product.prix) : 0);
  const displayedTitle = activeConfig 
    ? `${product?.nom} (${activeConfig.nom_configuration_autre || activeConfig.nom_configuration})`
    : (product?.nom || "");

  // Fonction pour ajouter au panier dans la base de données
  const addToCartDatabase = async (productId: number, quantite: number) => {
    if (!isAuthenticated) {
      toast({
        title: "Connexion requise",
        description: "Veuillez vous connecter pour ajouter au panier",
        variant: "destructive"
      });
      return false;
    }

    try {
      setIsAddingToCart(true);
      
      // Appel à la route POST api/panier/ajouter
      const response = await api.post('/panier/ajouter', {
        produit_id: productId,
        quantite: quantite,
        utilisateur_id: user?.id,
        configuration_id: selectedConfigId,
        prix_unitaire: displayedPrice,
        titre: displayedTitle
      });
      
      console.log("Réponse ajout panier:", response.data);
      
      toast({
        title: "Ajouté au panier",
        description: `${quantite} x ${displayedTitle}`
      });
      
      // Mettre à jour le store local également pour la cohérence
      addToLocalCart(String(productId), quantite, toCartProduct({ ...product!, prix: displayedPrice, nom: displayedTitle }));
      
      return true;
    } catch (error: any) {
      console.error("Erreur lors de l'ajout au panier:", error);
      toast({
        title: "Erreur",
        description: error.response?.data?.message || "Impossible d'ajouter au panier",
        variant: "destructive"
      });
      return false;
    } finally {
      setIsAddingToCart(false);
    }
  };

  // Fonction pour mettre à jour la quantité en temps réel
  const updateCartQuantity = async (productId: number, newQuantity: number) => {
    if (!isAuthenticated || !product) return;
    
    try {
      // D'abord, récupérer l'ID de l'item dans le panier
      const cartResponse = await api.get('/panier', {
        params: {
          utilisateur_id: user?.id
        }
      });
      
      const cartItems = cartResponse.data?.data || [];
      const cartItem = cartItems.find((item: any) => item.produit_id === productId);
      
      if (cartItem) {
        // Appel à la route PUT api/panier/modifier/{itemId}
        await api.put(`/panier/modifier/${cartItem.id}`, {
          quantite: newQuantity
        });
        
        // Mettre à jour le store local
        addToLocalCart(String(productId), newQuantity, toCartProduct(product));
        
        toast({
          title: "Quantité mise à jour",
          description: `${newQuantity} x ${product.nom}`
        });
      }
    } catch (error) {
      console.error("Erreur lors de la mise à jour de la quantité:", error);
    }
  };

  const handleAddToCart = async () => {
    if (!product) return;
    await addToCartDatabase(product.id, qty);
  };

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
            <div className="font-display font-bold text-4xl mt-1">{formatAr(displayedPrice)}</div>
            <div className="text-xs text-muted-foreground mt-1">ou 3× {formatAr(Math.round(displayedPrice / 3))} sans frais</div>
          </div>

          {/* Selector variants/configurations */}
          {product.configurations && product.configurations.length > 0 && (
            <div className="space-y-3">
              <div className="text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
                <Cpu className="h-3.5 w-3.5 text-accent" />
                Choisir une configuration :
              </div>
              <div className="flex flex-col gap-2">
                {/* Standard Config Button */}
                <button
                  onClick={() => setSelectedConfigId(null)}
                  className={`w-full text-left p-4 rounded-xl border transition-all flex justify-between items-center ${
                    selectedConfigId === null
                      ? "border-accent bg-accent/5 ring-1 ring-accent"
                      : "border-border bg-card/50 hover:bg-card"
                  }`}
                >
                  <div>
                    <div className="text-sm font-semibold">Configuration Standard (Base)</div>
                    <div className="text-xs text-muted-foreground mt-0.5">Spécifications par défaut</div>
                  </div>
                  <div className="font-display font-bold text-base text-foreground">
                    {formatAr(product.prix)}
                  </div>
                </button>

                {/* Other Configs Buttons */}
                {product.configurations.map((cfg) => (
                  <button
                    key={cfg.id}
                    onClick={() => setSelectedConfigId(cfg.id)}
                    className={`w-full text-left p-4 rounded-xl border transition-all flex justify-between items-center ${
                      selectedConfigId === cfg.id
                        ? "border-accent bg-accent/5 ring-1 ring-accent"
                        : "border-border bg-card/50 hover:bg-card"
                    }`}
                  >
                    <div className="min-w-0">
                      <div className="text-sm font-semibold capitalize truncate">
                        {cfg.nom_configuration_autre || cfg.nom_configuration}
                      </div>
                      {Array.isArray(cfg.composants_json) && cfg.composants_json.length > 0 && (
                        <div className="text-xs text-muted-foreground mt-0.5 truncate max-w-[280px] md:max-w-[360px]">
                          {cfg.composants_json.map((c) => `${c.quantite || 1}x ${c.nom}`).join(" + ")}
                        </div>
                      )}
                    </div>
                    <div className="font-display font-bold text-base text-accent shrink-0 ml-3">
                      {formatAr(cfg.prix_total)}
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}

          <div className="flex items-center gap-3">
            <div className="flex items-center bg-secondary rounded-full">
              <button 
                onClick={() => setQty(Math.max(1, qty - 1))} 
                className="h-12 w-12 flex items-center justify-center hover:text-accent"
              >
                <Minus className="h-4 w-4" />
              </button>
              <span className="w-10 text-center font-semibold tabular-nums">{qty}</span>
              <button 
                onClick={() => setQty(qty + 1)} 
                className="h-12 w-12 flex items-center justify-center hover:text-accent"
              >
                <Plus className="h-4 w-4" />
              </button>
            </div>
            <Button 
              variant="hero" 
              size="lg" 
              className="flex-1"
              onClick={handleAddToCart}
              disabled={isAddingToCart}
            >
              {isAddingToCart ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <ShoppingBag className="h-4 w-4" />
              )}
              Ajouter au panier
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
            <div className="flex gap-1 border-b border-border overflow-x-auto scrollbar-none">
              {([
                "specs",
                product.configurations && product.configurations.length > 0 ? "configs" : null,
                "story",
                "garantie"
              ].filter(Boolean) as Array<"specs" | "configs" | "story" | "garantie">).map((t) => (
                <button key={t} onClick={() => setTab(t)}
                  className={`px-4 py-3 text-sm font-medium relative whitespace-nowrap ${tab === t ? "text-foreground" : "text-muted-foreground"}`}>
                  {t === "specs" 
                    ? "Composants" 
                    : t === "configs" 
                      ? `Configurations (${product.configurations?.length || 0})` 
                      : t === "story" 
                        ? "L'histoire" 
                        : "Garantie & SAV"}
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
              {tab === "configs" && (
                <div className="space-y-4">
                  {product.configurations?.map((cfg) => (
                    <div key={cfg.id} className="card-soft p-5 border border-border/80 hover:border-accent/40 transition-colors space-y-4">
                      <div className="flex flex-wrap items-start justify-between gap-3">
                        <div>
                          <h4 className="font-display font-bold text-lg capitalize text-foreground">
                            {cfg.nom_configuration_autre || cfg.nom_configuration}
                          </h4>
                          <p className="text-xs text-muted-foreground mt-0.5">
                            Variante ID : <span className="font-mono">{cfg.id}</span> • Statut : <span className="text-tech font-semibold">Disponible</span>
                          </p>
                        </div>
                        <div className="text-right">
                          <div className="font-display font-bold text-xl text-accent font-semibold">
                            {formatAr(cfg.prix_total)}
                          </div>
                          <button
                            onClick={() => {
                              setSelectedConfigId(cfg.id);
                              window.scrollTo({ top: 0, behavior: 'smooth' });
                              toast({
                                title: "Configuration sélectionnée",
                                description: `Vous avez choisi la variante: ${cfg.nom_configuration_autre || cfg.nom_configuration}`
                              });
                            }}
                            className="text-xs text-accent hover:underline mt-1 font-medium"
                          >
                            Sélectionner cette variante ↑
                          </button>
                        </div>
                      </div>
                      
                      {Array.isArray(cfg.composants_json) && cfg.composants_json.length > 0 && (
                        <div className="border-t border-border/50 pt-3">
                          <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider block mb-2">Composants inclus</span>
                          <div className="grid sm:grid-cols-2 gap-2">
                            {cfg.composants_json.map((c, idx) => (
                              <div key={idx} className="flex justify-between items-center text-xs bg-secondary/40 rounded-lg px-3 py-2 border border-border/30">
                                <span className="font-medium text-foreground">{c.nom}</span>
                                <span className="text-muted-foreground shrink-0 ml-2 font-mono">
                                  {c.quantite || 1}x • {formatAr(c.prix || 0)}
                                </span>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
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