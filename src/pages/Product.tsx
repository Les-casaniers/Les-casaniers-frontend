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
import curvedArrow from "@/assets/Curved Arrow Downward.png";
import chat from "@/assets/chat.png";
import fille from "@/assets/fille.png";
// ✅ Même fonction que dans l'admin pour construire l'URL des images
import { getProductImageUrl } from "@/lib/utils";

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

const PLACEHOLDER_IMG = "/placeholder-pc.jpg";

// ✅ Image robuste : essaie chaque source dans l'ordre, puis le placeholder
const SafeImg = ({ sources, alt = "", className = "" }: { sources: string[]; alt?: string; className?: string }) => {
  const list = [...sources.filter(Boolean), PLACEHOLDER_IMG];
  const key = list.join("|");
  const [idx, setIdx] = useState(0);
  useEffect(() => {
    setIdx(0);
  }, [key]);
  return (
    <img
      src={list[Math.min(idx, list.length - 1)]}
      alt={alt}
      className={className}
      onError={(e) => {
        console.warn("Image KO :", (e.target as HTMLImageElement).src);
        setIdx((i) => (i < list.length - 1 ? i + 1 : i));
      }}
    />
  );
};

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

// ✅ Titre de section : trait plein + tirets séparés + flèche juste après (comme sur la maquette)
const SectionTitle = ({
  children,
  level = 2,
}: {
  children: React.ReactNode;
  level?: 2 | 3;
}) => {
  const Tag = level === 2 ? "h2" : "h3";
  return (
    <div className="mb-6 inline-block min-w-[8rem] align-top">
      <Tag className="font-display text-base sm:text-lg font-medium leading-tight tracking-wide">{children}</Tag>
      <div className="flex items-center w-full mt-1.5">
        <span className="h-px w-12 shrink-0 bg-foreground" />
        <span
          className="h-px flex-1 ml-2"
          style={{
            backgroundImage:
              "repeating-linear-gradient(to right, hsl(var(--foreground)) 0 8px, transparent 8px 14px)",
          }}
        />
        <img
          src={curvedArrow}
          alt=""
          aria-hidden="true"
          className="w-5 h-5 shrink-0 object-contain ml-1 translate-y-0.5"
        />
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
  // ✅ Index de l'image principale affichée (dans la liste triée)
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  // ✅ Images chargées directement depuis /produits/{id} (useProduct ne les renvoie pas)
  const [detailImages, setDetailImages] = useState<any[]>([]);
const [caracExpanded, setCaracExpanded] = useState(true);
  useEffect(() => {
    if (product) document.title = `${product.nom} — Les Casaniers Madagascar`;
  }, [product]);

  // ✅ Revenir à la première image quand on change de produit
  useEffect(() => {
    setSelectedImageIndex(0);
    setDetailImages([]);
  }, [product?.id]);

  // ✅ Charger les images depuis /produits/{id}, comme le fait l'admin
  useEffect(() => {
    if (!product?.id) return;
    let cancelled = false;
    api
      .get(`/produits/${product.id}`)
      .then((res) => {
        if (cancelled) return;
        const imgs = res?.data?.data?.images ?? [];
        console.log("IMAGES via /produits/id :", imgs);
        setDetailImages(Array.isArray(imgs) ? imgs : []);
      })
      .catch((e) => console.error("Erreur chargement images produit:", e));
    return () => {
      cancelled = true;
    };
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

  // =========================================================
  // ✅ Galerie d'images
  // - triée par "ordre" (comme dans l'admin : la 1re = image principale)
  // - URL construites avec getProductImageUrl (même logique que l'admin)
  // - repli sur productImage(product) s'il n'y a aucune image
  // =========================================================
  const rawImages: any[] =
    Array.isArray((product as any).images) && (product as any).images.length > 0
      ? (product as any).images
      : detailImages;

  const sortedImages = [...rawImages].sort(
    (a: any, b: any) => (a.ordre ?? 999) - (b.ordre ?? 999)
  );

  // Chaque image a plusieurs sources possibles, essayées dans l'ordre :
  // 1) img.url tel que renvoyé par l'API (ce qui marchait avant)
  // 2) l'URL construite par getProductImageUrl (comme dans l'admin)
  const galleryItems: Array<{ sources: string[] }> =
    sortedImages.length > 0
      ? sortedImages.map((img: any) => {
          let resolved = "";
          try {
            resolved = getProductImageUrl({ images: [img] } as any);
          } catch {
            resolved = "";
          }
          return {
            sources: Array.from(new Set([img?.url, resolved].filter(Boolean))) as string[],
          };
        })
      : [{ sources: [getProductImageUrl(product)].filter(Boolean) as string[] }];

  // Évite un index hors limites si le nombre d'images change
  const safeIndex = Math.min(selectedImageIndex, galleryItems.length - 1);

  const mainItem = galleryItems[safeIndex];

  // Toutes les images sauf celle affichée en grand → colonne "Photos variantes"
  const otherImages = galleryItems
    .map((item, i) => ({ item, i }))
    .filter(({ i }) => i !== safeIndex);

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
        {/* ===================== Images ===================== */}
        <div className="relative">
          <div className="absolute inset-0 bg-gradient-glow rounded-[2rem] blur-2xl" />

          <div className="relative card-soft overflow-hidden p-2 flex items-center gap-3">
            {/* Colonne gauche : rectangle(s) "Photos variantes" */}
            <div className="flex flex-col justify-center gap-3 shrink-0 w-20 sm:w-24 self-stretch">
              {otherImages.length > 0 ? (
                otherImages.map(({ item, i }) => (
                  <button
                    key={i}
                    onClick={() => setSelectedImageIndex(i)}
                    aria-label={`Voir l'image ${i + 1}`}
                    className="w-full aspect-[3/7] bg-white border border-black/70 overflow-hidden hover:border-accent hover:scale-105 transition-all"
                  >
                    <SafeImg sources={item.sources} className="w-full h-full object-contain p-1" />
                  </button>
                ))
              ) : (
                <div className="w-full aspect-[3/7] bg-white border border-black/70 flex items-center justify-center text-center text-[11px] text-black px-1">
                  Photos variantes
                </div>
              )}
            </div>

            {/* Image principale */}
            <div className="relative flex-1 min-w-0 aspect-square">
              <SafeImg
                sources={mainItem.sources}
                alt={product.nom}
                className="absolute inset-0 w-full h-full object-contain rounded-2xl"
              />

              {product.badge && (
                <span className="absolute top-3 left-3 pill bg-gradient-accent text-accent-foreground border-0">
                  ⚡ {product.badge}
                </span>
              )}

              <div className="absolute top-3 right-3 flex items-center gap-2">
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
            </div>
          </div>
        </div>

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
        <div className="relative flex items-center max-w-5xl my-6">
          {/* Bulle de dialogue sombre avec bordure dorée brillante */}
          <div className="flex-1 rounded-2xl border-2 border-amber-500/70 bg-zinc-950 p-6 pr-20 text-sm leading-relaxed text-zinc-100 italic shadow-[0_0_20px_rgba(245,158,11,0.25)]">
            "{messageMascotte}"
          </div>

          {/* Mascotte intégrée et chevauchant le côté droit du rectangle */}
          <div className="absolute right-[-1.5rem] shrink-0 z-20 flex items-center">
            <img
              src={chat}
              alt="Mascotte Les Casaniers"
              className="h-36 w-auto lg:h-48 object-contain drop-shadow-[0_10px_10px_rgba(0,0,0,0.8)] animate-float"
            />
          </div>
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
             <SectionTitle level={3}>Caractéristiques</SectionTitle>

<div className="mt-8 mx-auto w-full max-w-4xl">
  <div className="relative rounded-md border-2 border-white bg-black text-white">
    <span className="hidden sm:block absolute -top-4 left-1/2 -translate-x-1/2 text-sm select-none pointer-events-none">💡</span>
    <span className="hidden sm:block absolute -bottom-4 left-1/2 -translate-x-1/2 text-sm select-none pointer-events-none rotate-180">💡</span>

    <div className="overflow-x-auto rounded-md">
      <table className="w-full text-sm border-collapse text-white">
        <thead>
          <tr>
            <th className="w-1/2 px-4 py-2 text-center font-bold uppercase tracking-wider text-[11px] border-b border-white/50 border-r border-r-white/70">
              Caractéristiques <span className="text-[10px] align-middle">✎</span>
            </th>
            <th className="w-1/2 px-4 py-2 text-center font-bold uppercase tracking-wider text-[11px] border-b border-white/50">
              Valeurs <span className="text-[10px] align-middle">🏷</span>
            </th>
          </tr>
        </thead>
        <tbody>
          {(caracExpanded ? caracteristiquesTableau : caracteristiquesTableau.slice(0, 5)).map((c, i) => (
            <tr key={i}>
              <td className="px-4 py-2 text-center text-xs text-white border-b border-white/40 border-r border-r-white/70">
                {c.label}
              </td>
              <td className="px-4 py-2 text-center text-xs font-medium text-white border-b border-white/40">
                {c.valeur}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  </div>

  {/* ===== Bouton Afficher moins / plus ===== */}
  {caracteristiquesTableau.length > 5 && (
    <div className="text-center mt-8">
      <button
        onClick={() => setCaracExpanded((v) => !v)}
        className="text-xs text-muted-foreground hover:text-foreground transition-colors inline-flex items-center gap-2"
      >
        {caracExpanded ? "Afficher moins" : "Afficher plus"}
        <ChevronRight className={`h-4 w-4 ${caracExpanded ? "rotate-[-90deg]" : "rotate-90"}`} />
      </button>
    </div>
  )}
</div>
            </div>
          )}
        </div>

        {/* ---- Conseil de compatibilité : toujours affiché, juste sous le tableau ---- */}
        <div className="relative mb-16 max-w-5xl mx-auto px-4 md:px-8">
          {/* Boîte principale */}
          <div className="relative overflow-visible rounded-2xl border border-amber-500/40 bg-[#121212] p-6 pr-6 md:pr-44 shadow-[0_0_15px_rgba(0,0,0,0.5)]">
            {/* Titre souligné */}
            <h4 className="font-bold uppercase tracking-wider text-xs text-zinc-100 underline decoration-1 underline-offset-4 mb-4">
              Conseil de compatibilités :
            </h4>

            {/* Contenu du message */}
            <p className="text-sm italic text-zinc-300 leading-relaxed whitespace-pre-line">
              "{conseilCompatibilite}"
            </p>

            {/* Mascotte décorative */}
            <img
              src={fille}
              alt=""
              aria-hidden="true"
              className="hidden md:block absolute -right-6 -top-6 -bottom-6 h-[calc(100%+3rem)] w-auto object-contain z-10 animate-float drop-shadow-xl pointer-events-none"
            />
          </div>

          {/* Boutons d'action */}
          <div className="flex flex-wrap justify-center items-center gap-4 mt-6">
            <Button
              variant="outline"
              className="rounded-full bg-white text-black hover:bg-zinc-200 border-none font-medium px-6 py-2 h-auto"
            >
              Découvre notre guide
            </Button>

            <Button
              className="rounded-full bg-[#F2551A] hover:bg-[#F2551A]/90 text-white font-medium px-6 py-2 h-auto shadow-md"
            >
              {conseilCtaLabel}
            </Button>
          </div>
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
