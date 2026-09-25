

import { SiteLayout } from "@/components/site/SiteLayout";
import { formatAr } from "@/lib/products";
import { useParams, Link, Navigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { ShoppingBag, Star, Shield, Truck, Wrench, Minus, Plus, ChevronRight, Cpu, MonitorCog, MemoryStick, HardDrive, Zap, Snowflake, CircuitBoard, Box, Loader2, BadgeCheck } from "lucide-react";
import { useShop } from "@/store/shop";
import { toast } from "@/hooks/use-toast";
import fosa from "@/assets/casaniers-mascot.png";
import { Product, productImage, productSpec, useProduct, useProducts } from "@/hooks/useProducts";
import api from "@/service/api";
import { useAuth } from "@/contexts/AuthContext";
import { useCartApi } from "@/hooks/useCartApi";
import panierIncone from "@/assets/Basket.png";
import favoriteIcon from "@/assets/Favorite.png";
import { Plane, Sailboat } from "lucide-react";
import  curvedArrow  from "@/assets/Curved Arrow Downward.png"
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

// Types "souples" pour les champs que le backend n'expose pas forcément encore.
// ⚠️ À remplacer par les vrais types dès que l'API renvoie ces champs.
type AvisClient = {
  pseudo: string;
  note: number;
  achat_verifie?: boolean;
  commentaire: string;
};

type CaracteristiqueLigne = {
  label: string;
  valeur: string;
};

// Petit composant de titre avec la ligne décorative vue sur la maquette :
// un trait plein court suivi d'une ligne en pointillés, sous le texte (pas collée dessus).
const SectionTitle = ({ children, level = 2 }: { children: React.ReactNode; level?: 2 | 3 }) => {
  const Tag = level === 2 ? "h2" : "h3";
  const size = level === 2 ? "text-2xl lg:text-3xl" : "text-xl lg:text-2xl";
  return (
    <div className="mb-6 inline-block">
      <Tag className={`font-display ${size} font-bold`}>{children}</Tag>
      <div className="flex items-center gap-1.5 mt-2.5">
        <span className="h-0.5 w-7 bg-foreground/70 rounded-full" />
        <span className="h-0 w-20 border-t-2 border-dashed border-foreground/40" />
      </div>
    </div>
  );
};

const ProductPage = () => {
  const { id } = useParams();
  const productId = id ? Number(id) : null;
  const safeProductId = productId !== null && !Number.isNaN(productId) ? productId : null;
  const { data: product, isLoading, error } = useProduct(safeProductId);

  const { addToCart: addToLocalCart, toggleFavorite, favorites } = useShop();
  const { isAuthenticated } = useAuth();
  // ✅ Utiliser le hook useCartApi pour gérer le panier
  const { addToCart, updateQuantity, cartItems, refreshCart } = useCartApi();

  const [qty, setQty] = useState(1);
  const [tab, setTab] = useState<"specs" | "configs" | "story" | "garantie">("specs");
  const [isAddingToCart, setIsAddingToCart] = useState(false);
  const [selectedConfigId, setSelectedConfigId] = useState<number | null>(null);
  const [cartItemId, setCartItemId] = useState<number | null>(null);
  // ✅ Index de l'image principale affichée, piloté par les miniatures ET par l'encart incrusté
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);

  useEffect(() => {
    if (product) document.title = `${product.nom} — Les Casaniers Madagascar`;
  }, [product]);

  // ✅ Revenir à la première image quand on change de produit
  useEffect(() => {
    setSelectedImageIndex(0);
  }, [product?.id]);

  // ✅ Vérifier si le produit est déjà dans le panier
  useEffect(() => {
    if (product && cartItems.length > 0) {
      const existingItem = cartItems.find((item: any) =>
        item.produit_id === product.id
      );
      if (existingItem) {
        setCartItemId(existingItem.id);
        setQty(existingItem.quantite);
      } else {
        setCartItemId(null);
        setQty(1);
      }
    }
  }, [product, cartItems]);

  const activeConfig = product?.configurations?.find((c) => c.id === selectedConfigId);
  const displayedPrice = activeConfig ? Number(activeConfig.prix_total) : (product ? Number(product.prix) : 0);
  const displayedTitle = activeConfig
    ? `${product?.nom} (${activeConfig.nom_configuration_autre || activeConfig.nom_configuration})`
    : (product?.nom || "");

  // ✅ Fonction pour ajouter au panier avec le hook useCartApi
  const handleAddToCart = async () => {
    if (!product) return;

    if (!isAuthenticated) {
      toast({
        title: "🔒 Connexion requise",
        description: "Veuillez vous connecter pour ajouter au panier",
        variant: "destructive"
      });
      return;
    }

    setIsAddingToCart(true);
    try {
      const success = await addToCart({
        produit_id: product.id,
        quantite: qty,
        prix_unitaire: displayedPrice,
        titre: displayedTitle
      });

      if (success) {
        // ✅ Mettre à jour le store local
        addToLocalCart(String(product.id), qty, {
          id: String(product.id),
          name: displayedTitle,
          category: product.categorie?.nom || product.type_produit,
          tagline: product.description_courte || product.tagline || "Configuration Les Casaniers",
          price: displayedPrice,
          image: productImage(product),
        });

        // ✅ Rafraîchir le panier pour mettre à jour l'ID
        await refreshCart();
      }
    } finally {
      setIsAddingToCart(false);
    }
  };

  // ✅ Fonction pour mettre à jour la quantité en temps réel
  const handleUpdateQuantity = async (newQty: number) => {
    if (newQty < 1) {
      setQty(1);
      return;
    }

    setQty(newQty);

    // ✅ Si le produit est déjà dans le panier, mettre à jour la quantité
    if (cartItemId) {
      await updateQuantity(cartItemId, newQty);
      await refreshCart();
    }
  };

  // ✅ Fonction pour augmenter la quantité
  const increaseQty = async () => {
    const newQty = qty + 1;
    await handleUpdateQuantity(newQty);
  };

  // ✅ Fonction pour diminuer la quantité
  const decreaseQty = async () => {
    if (qty > 1) {
      const newQty = qty - 1;
      await handleUpdateQuantity(newQty);
    }
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

  const fav = favorites.includes(product.id);

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

  // ✅ Galerie d'images : si le produit n'a pas d'images additionnelles,
  // on retombe sur l'image principale pour toujours avoir au moins 1 entrée.
  const galleryImages: Array<{ url: string }> =
    product.images && product.images.length > 0
      ? product.images
      : [{ url: productImage(product) }];

  const mainImageUrl = galleryImages[selectedImageIndex]?.url || productImage(product);
  // ✅ Index de la "petite image" incrustée dans la grande image (l'image suivante de la galerie)
  const insetImageIndex = (selectedImageIndex + 1) % galleryImages.length;

  // =========================================================
  // Données dynamiques pour la section Description / Caractéristiques / Commentaires
  // Le back n'expose pas encore forcément tous ces champs : on utilise
  // product.xxx quand il existe, sinon on reconstruit à partir des specs déjà chargées.
  // ⚠️ À brancher directement sur les vrais champs API dès qu'ils existent
  //    (ex: product.points_forts, product.caracteristiques, product.avis...).
  // =========================================================

  const pointsForts: string[] =
    Array.isArray((product as any).points_forts) && (product as any).points_forts.length > 0
      ? (product as any).points_forts
      : (Object.keys(specs) as Array<keyof typeof specs>)
          .filter((k) => specs[k])
          .slice(0, 3)
          .map((k) => `${specLabels[k as keyof typeof specLabels]} : ${specs[k]}`);

  const caracteristiquesPrincipales: CaracteristiqueLigne[] =
    Array.isArray((product as any).caracteristiques_principales) && (product as any).caracteristiques_principales.length > 0
      ? (product as any).caracteristiques_principales
      : [
          { label: "Catégorie", valeur: product.categorie?.nom || product.type_produit || "—" },
          { label: "Référence", valeur: product.reference || "—" },
          ...(Object.keys(specs) as Array<keyof typeof specs>)
            .filter((k) => specs[k])
            .map((k) => ({ label: specLabels[k as keyof typeof specLabels], valeur: specs[k] as string })),
        ];

  const specsAsRows: CaracteristiqueLigne[] = (Object.keys(specs) as Array<keyof typeof specs>)
    .filter((k) => specs[k])
    .map((k) => ({ label: specLabels[k as keyof typeof specLabels], valeur: specs[k] as string }));

  // ✅ Repli garanti : si le back ne fournit ni `caracteristiques` ni de specs techniques
  // (processeur, RAM...), on affiche quand même les infos générales du produit plutôt
  // que de masquer entièrement le tableau.
  const caracteristiquesFallback: CaracteristiqueLigne[] = [
    { label: "Marque / Catégorie", valeur: product.categorie?.nom || product.type_produit || "—" },
    { label: "Référence", valeur: product.reference || "—" },
    { label: "Prix", valeur: formatAr(product.prix) },
    { label: "Disponibilité", valeur: product.quantite_stock > 0 ? `En stock (${product.quantite_stock})` : "Rupture de stock" },
  ];

  const caracteristiquesTableau: CaracteristiqueLigne[] =
    Array.isArray((product as any).caracteristiques) && (product as any).caracteristiques.length > 0
      ? (product as any).caracteristiques.map((c: any) => ({
          label: c.label ?? c.nom,
          valeur: c.valeur ?? c.value,
        }))
      : specsAsRows.length > 0
        ? specsAsRows
        : caracteristiquesFallback;

  const conseilCompatibilite: string =
    (product as any).conseil_compatibilite ||
    "Vérifie bien la compatibilité de ce produit avec le reste de ta configuration avant de valider ta commande.";
  const conseilCtaLabel: string = (product as any).conseil_cta_label || "Découvre nos produits compatibles";

  const avis: AvisClient[] = Array.isArray((product as any).avis) ? (product as any).avis : [];

  const messageMascotte: string =
    (product as any).message_mascotte ||
    product.description_courte ||
    product.tagline ||
    "Une machine taillée pour la performance, pensée par les Casaniers.";

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
            <img src={mainImageUrl} alt={product.nom} className="w-full aspect-square object-cover rounded-2xl" />
            {product.badge && (
              <span className="absolute top-6 left-6 pill bg-gradient-accent text-accent-foreground border-0">⚡ {product.badge}</span>
            )}
            <div className="absolute top-6 right-6 flex items-center gap-2">
              <button
                onClick={(e) => toggleFavorite(product.id, e)}
                className={`h-10 w-10 rounded-full backdrop-blur-sm shadow-md flex items-center justify-center hover:bg-red-400 hover:scale-105 transition-transform ${fav ? "bg-red-500" : "bg-black/90"}`}
                aria-label="Ajouter aux favoris"
              >
                <img src={favoriteIcon} alt="" className={`h-5 w-5 object-contain ${fav ? "brightness-0 invert" : ""}`} />
              </button>
              <button
                disabled={isAddingToCart}
                onClick={handleAddToCart}
                className={`h-10 w-10 rounded-full backdrop-blur-sm shadow-md flex items-center justify-center hover:scale-105 transition-transform disabled:opacity-60 ${cartItemId ? "bg-orange-500" : "bg-black/90"}`}
                aria-label="Ajouter au panier"
              >
                <img src={panierIncone} alt="" className={`h-5 w-5 object-contain ${cartItemId ? "brightness-0 invert" : ""}`} />
              </button>
            </div>

            {/* ✅ La "petite image" : un encart incrusté dans la grande image.
                Cliquer dessus la fait passer au premier plan (permutation avec la grande image). */}
            {galleryImages.length > 1 && (
              <button
                onClick={() => setSelectedImageIndex(insetImageIndex)}
                aria-label="Voir l'image suivante"
                className="absolute top-1/2 left-6 -translate-y-1/2 h-24 w-24 sm:h-32 sm:w-32 rounded-2xl overflow-hidden border-2 border-white shadow-xl hover:scale-105 transition-transform"
              >
                <img src={galleryImages[insetImageIndex].url} alt="" className="w-full h-full object-cover" />
              </button>
            )}
          </div>

          {/* ✅ Miniatures : cliquer sur une miniature change l'image principale ci-dessus */}
          {galleryImages.length > 1 && (
            <div className="grid grid-cols-4 gap-3 mt-4">
              {galleryImages.map((img, i) => (
                <button
                  key={i}
                  onClick={() => setSelectedImageIndex(i)}
                  aria-label={`Voir l'image ${i + 1}`}
                  className={`aspect-square rounded-xl overflow-hidden border-2 transition-colors ${
                    selectedImageIndex === i
                      ? "border-accent ring-2 ring-accent/40"
                      : "border-border hover:border-accent"
                  }`}
                >
                  <img src={img.url} alt="" className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Infos */}
        <div className="space-y-6">
          <div>
            <h1 className="font-display text-2xl lg:text-3xl font-bold tracking-tight">{product.nom}</h1>
            <p className="text-lg text-muted-foreground italic mt-2">"{product.description_courte || product.tagline || 'Une puissance inegalee.'}"</p>
          </div>

          <div className="flex items-center gap-4 text-sm">
            <div className="flex items-center gap-1">
                {Array.from({ length: 5 }).map((_, i) => {
                  const note = product.note || 5;
                  const fillPercent = Math.max(0, Math.min(1, note - i)) * 100;

                  return (
                    <div key={i} className="relative h-4 w-4">
                      {/* Base star: always outline/empty */}
                      <Star className="absolute inset-0 h-4 w-4 fill-transparent text-muted" />
                      {/* Gold star, clipped to the exact fraction of this star that's "earned" */}
                      <div className="absolute inset-0 overflow-hidden" style={{ width: `${fillPercent}%` }}>
                        <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                      </div>
                    </div>
                  );
                })}
                <span className="ml-1">{product.note || 5.0}/10</span>
              </div>
            <span className="h-4 w-px bg-border" />
            <span className={`text-xs font-medium ${product.quantite_stock > 5 ? "text-tech" : "text-accent"}`}>
              {product.quantite_stock > 5 ? `En stock (${product.quantite_stock})` : `Plus que ${product.quantite_stock} en stock !`}
            </span>
          </div>
          <div className="mt-5 border-b border-white py-4">
            <span className="text-[14px]">Ref: {product.reference} | EAN: </span>
          </div>
          <div>
            <div className="flex text-[14px]">
                <span>Expedition sous 02 a 03 semaines par</span>
                <span className="px-1 font-bold">Avion</span><Plane className="h-4 w-4 mt-1 fill-white" />
            </div>
          </div>
          <div>
            <div className="flex text-[14px] -mt-6">
                <span>Expedition sous 02 a 03 semaines par</span>
                <span className="px-1 font-bold">Bateau</span><Sailboat className="h-4 w-4 mt-1 fill-white" />
            </div>
          </div>
          <div className="flex items-center bg-secondary rounded-xl bg-white mr-[450px]">
              <button
                onClick={decreaseQty}
                className="h-4 w-12 flex items-center text-black justify-center hover:text-orange-500 transition-colors border-r"
                disabled={qty <= 1}
              >
                <Minus className="h-4 w-4" />
              </button>
              <span className="w-10 text-center text-black font-semibold tabular-nums">{qty}</span>
              <button
                onClick={increaseQty}
                className="h-4 w-12 flex items-center text-black justify-center hover:text-orange-500 transition-colors border-l"
              >
                <Plus className="h-4 w-4" />
              </button>
          </div>

          <div className="flex item-center p-6 bg-gradient-to-br to-secondary/30">
            <div className="font-display font-bold text-3xl -mt-8 -ml-6">{formatAr(displayedPrice)}</div>
            {/* ✅ Bouton Ajouter / Mettre à jour */}
                <Button
                  variant="hero"
                  size="sm"
                  className="bg-[#F2551A] hover:bg-[#F2551A]/90 text-white rounded-full -mt-8 ml-12"
                  onClick={handleAddToCart}
                  disabled={isAddingToCart}
                >
                  {isAddingToCart ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <ShoppingBag className="h-4 w-4" />
                  )}
                  {cartItemId ? "Mettre à jour" : "Ajouter dans mon panier"}
                </Button>
                {/* ✅ Affichage du statut du panier */}
              {cartItemId && (
                <div className="text-xs text-green-600 bg-green-50 dark:bg-green-900/20 p-2 rounded-lg text-center -mt-8 ml-8">
                  ✅ Déjà dans votre panier (quantité: {qty})
                </div>
              )}
          </div>

          {/* Selector variants/configurations */}
          {product.configurations && product.configurations.length > 0 && (
            <div className="space-y-3">
              <div className="text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
                <Cpu className="h-3.5 w-3.5 text-accent" />
                Choisir une configuration :
              </div>
              <div className="flex flex-col gap-2">
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

          <div className="grid grid-cols-3 gap-3 text-xs">
            <div className="card-soft p-3 flex flex-col items-center text-center gap-1">
              <Shield className="h-5 w-5 text-white-500" /><span className="font-semibold">Garantie 24 mois</span>
            </div>
            <div className="card-soft p-3 flex flex-col items-center text-center gap-1">
              <Truck className="h-5 w-5 text-white-500" /><span className="font-semibold">Livraison Tana</span>
            </div>
            <div className="card-soft p-3 flex flex-col items-center text-center gap-1">
              <Wrench className="h-5 w-5 text-white-500" /><span className="font-semibold">SAV à vie</span>
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

      {/* =========================================================
          Bandeau bulle mascotte — juste en dessous du produit,
          au-dessus de Description / Caractéristiques / Commentaires
          ========================================================= */}
      <section className="container-x pb-4">
        <div className="relative flex items-start gap-4 max-w-5xl">
          <div className="flex-1 rounded-2xl border-2 border-dashed border-foreground/25 bg-black/40 p-5 text-sm leading-relaxed text-foreground/90 italic">
            "{messageMascotte}"
          </div>
          <img
            src={fosa}
            alt="Mascotte Les Casaniers"
            className="hidden sm:block h-24 w-24 lg:h-32 lg:w-32 shrink-0 animate-float"
          />
        </div>
      </section>

      {/* =========================================================
          Description / Caractéristiques / Commentaires — dynamique,
          alimenté par `product` (avec repli si le champ n'existe pas encore côté back)
          ========================================================= */}
      <section className="container-x py-16 border-t border-border">
        {/* Tabs secondaires (ancres) */}
        <div className="flex gap-8 mb-10 text-sm">
          <a href="#description" className="text-foreground font-semibold border-b-2 border-accent pb-2">
            Description
          </a>
          <a href="#caracteristiques" className="text-muted-foreground hover:text-foreground transition-colors pb-2">
            Caractéristiques
          </a>
          <a href="#commentaires" className="text-muted-foreground hover:text-foreground transition-colors pb-2">
            Commentaires
          </a>
        </div>

        {/* ---- Description ---- */}
        <div id="description" className="mb-16 max-w-4xl">
          <SectionTitle>Description</SectionTitle>

          <h3 className="font-semibold text-lg mb-2">{product.nom}</h3>

          <p className="text-muted-foreground leading-relaxed mb-4">
            {product.description || product.description_courte || "Aucune description disponible pour ce produit."}
          </p>

          {pointsForts.length > 0 && (
            <>
              <p className="text-muted-foreground mb-2">À quoi t'attendre :</p>
              <ul className="space-y-1 text-sm text-muted-foreground mb-6">
                {pointsForts.map((point, i) => (
                  <li key={i}>• {point}</li>
                ))}
              </ul>
            </>
          )}

          <div className="text-center">
            <button
              onClick={() =>
                toast({ title: "Description complète", description: "Fonctionnalité à activer avec un state si besoin." })
              }
              className="text-sm text-muted-foreground hover:text-foreground transition-colors inline-flex items-center gap-2"
            >
              Afficher moins de description
              <ChevronRight className="h-4 w-4 rotate-[-90deg]" />
            </button>
          </div>
        </div>

{/* ---- Caractéristiques ---- */}
<div id="caracteristiques" className="mb-16 max-w-5xl">
  <SectionTitle>Caractéristiques principales</SectionTitle>

  {caracteristiquesPrincipales.length > 0 && (
    <ul className="space-y-1 text-sm mb-10">
      {caracteristiquesPrincipales.map((c, i) => (
        <li key={i}>
          <span className="text-muted-foreground">{c.label} :</span>{" "}
          <span className="font-medium">{c.valeur}</span>
        </li>
      ))}
    </ul>
  )}

  {caracteristiquesTableau.length > 0 && (
    <div className="mt-12">
      <div className="flex items-center gap-6 -mt-4">
        <SectionTitle level={3}>Caractéristiques</SectionTitle>
        <img
          src={curvedArrow}
          alt="Flèche"
          className="w-8 h-8 object-contain translate-y-5"
        />
      </div>

      <div className="relative mt-4 overflow-x-auto mx-auto w-full max-w-4xl">
        {/* Coins pointillés */}
        <span className="hidden sm:block absolute -top-2 -left-2 h-5 w-5 border-t-2 border-l-2 border-dashed border-foreground/50 pointer-events-none" />
        <span className="hidden sm:block absolute -top-2 -right-2 h-5 w-5 border-t-2 border-r-2 border-dashed border-foreground/50 pointer-events-none" />
        <span className="hidden sm:block absolute -bottom-2 -left-2 h-5 w-5 border-b-2 border-l-2 border-dashed border-foreground/50 pointer-events-none" />
        <span className="hidden sm:block absolute -bottom-2 -right-2 h-5 w-5 border-b-2 border-r-2 border-dashed border-foreground/50 pointer-events-none" />

        {/* Lunes + ampoule décoratives */}
        <span className="hidden sm:block absolute -top-3 -left-4 text-foreground/50 text-sm select-none pointer-events-none">⌒</span>
        <span className="hidden sm:block absolute -top-3 -right-4 text-foreground/50 text-sm select-none pointer-events-none rotate-180 inline-block">⌒</span>
        <span className="hidden sm:block absolute -top-4 left-1/2 -translate-x-1/2 text-sm select-none pointer-events-none">💡</span>

        <table className="w-full text-sm border-collapse">
          <thead>
            <tr>
              <th className="text-center px-4 py-3 font-bold uppercase tracking-wider text-xs border-b-2 border-dashed border-foreground/60 border-r-2 border-r-dashed border-r-foreground/60">
                Caractéristiques <span className="text-[10px] align-middle">✎</span>
              </th>
              <th className="text-center px-4 py-3 font-bold uppercase tracking-wider text-xs border-b-2 border-dashed border-foreground/60">
                Valeurs <span className="text-[10px] align-middle">🏷</span>
              </th>
            </tr>
          </thead>
          <tbody>
            {caracteristiquesTableau.map((c, i) => (
              <tr key={i}>
                <td className="px-4 py-4 text-center text-muted-foreground border-b border-dashed border-foreground/30 border-r-2 border-r-dashed border-r-foreground/40">
                  {c.label}
                </td>
                <td className="px-4 py-4 text-center font-medium border-b border-dashed border-foreground/30">
                  {c.valeur}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )}
</div>
        {/* ---- Conseil de compatibilité : toujours affiché, juste sous le tableau ---- */}
        <div className="relative mb-16 max-w-5xl">
          <div className="rounded-2xl border border-border bg-black/50 p-6 pr-32">
            <h4 className="font-bold uppercase tracking-wider text-xs mb-3">
              Conseil de compatibilités :
            </h4>
            <p className="text-sm italic text-muted-foreground mb-3">"{conseilCompatibilite}"</p>
            <div className="flex flex-wrap gap-3">
              <Button variant="outline" size="sm" className="rounded-full">
                Découvre notre guide
              </Button>
              <Button
                size="sm"
                className="rounded-full bg-[#F2551A] hover:bg-[#F2551A]/90 text-white"
              >
                {conseilCtaLabel}
              </Button>
            </div>
          </div>

          <img
            src={fosa}
            alt=""
            className="hidden md:block absolute right-2 top-1/2 -translate-y-1/2 h-32 w-32 animate-float"
          />
        </div>

        {/* ---- Commentaires ---- */}
        <div id="commentaires" className="mb-4 max-w-5xl">
          <SectionTitle>Commentaires</SectionTitle>

          {avis.length === 0 ? (
            <p className="text-sm text-muted-foreground">Aucun commentaire pour le moment. Soyez le premier à donner votre avis !</p>
          ) : (
            <ul className="space-y-8">
              {avis.map((c, i) => (
                <li key={i} className="border-b border-border/60 pb-6 last:border-0">
                  <div className="flex flex-wrap items-center gap-3 text-xs mb-3">
                    <div className="flex items-center gap-0.5">
                      {Array.from({ length: 5 }).map((_, s) => (
                        <Star
                          key={s}
                          className={`h-4 w-4 ${
                            s < c.note
                              ? "fill-yellow-400 text-yellow-400"
                              : "fill-transparent text-muted"
                          }`}
                        />
                      ))}
                    </div>
                    <span className="text-muted-foreground">
                      Par <span className="text-foreground font-medium">{c.pseudo}</span>
                    </span>
                    {c.achat_verifie && (
                      <>
                        <span className="h-3 w-px bg-border" />
                        <span className="text-muted-foreground inline-flex items-center gap-1">
                          <BadgeCheck className="h-3.5 w-3.5 text-tech" /> Achat vérifié
                        </span>
                      </>
                    )}
                    <span className="h-3 w-px bg-border" />
                    <button className="text-muted-foreground hover:text-foreground transition-colors">
                      Ajout de fichiers
                    </button>
                  </div>

                  <p className="text-sm italic text-muted-foreground leading-relaxed">"{c.commentaire}"</p>
                </li>
              ))}
            </ul>
          )}

          <div className="text-center mt-8">
            <button
              className="text-sm text-muted-foreground hover:text-foreground transition-colors inline-flex items-center gap-2"
              onClick={() =>
                toast({ title: "Chargement des commentaires", description: "À connecter à ton API." })
              }
            >
              Afficher plus de commentaires
              <ChevronRight className="h-4 w-4 rotate-90" />
            </button>
          </div>
        </div>
      </section>
    </SiteLayout>
  );
};

export default ProductPage;