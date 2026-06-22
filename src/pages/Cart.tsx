import { SiteLayout } from "@/components/site/SiteLayout";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import {
  Minus,
  Plus,
  Trash2,
  ShoppingBag,
  ArrowRight,
  ShieldCheck,
  Truck,
  Loader2,
  Heart,
  X,
  Check,
  MapPin,
  Home,
  Building,
  Package,
  ChevronRight,
  Clock,
  Phone,
  BadgeCheck,
} from "lucide-react";
import { formatAr } from "@/lib/products";
import { useEffect, useState, useRef } from "react";
import { toast } from "@/hooks/use-toast";
import fosa from "@/assets/8.png";
import { useCartApi } from "@/hooks/useCartApi";
import api from "@/service/api";
import { useNavigate } from "react-router-dom";

// Types
type Adresse = {
  id: number;
  utilisateur_id: number;
  etiquette: string;
  nom_complet: string;
  telephone: string;
  adresse_ligne1: string;
  adresse_ligne2: string | null;
  ville: string;
  region: string;
  code_postal: string;
  pays: string;
  par_defaut_expedition: boolean;
};

type StockCheckResult = {
  id: number;
  nom: string;
  quantite_demandee: number;
  stock_actuel: number;
  suffisant: boolean;
  error?: boolean;
  type?: string;
};

type StockUpdateResult = {
  id: number;
  nom: string;
  ancien_stock: number;
  nouveau_stock: number;
  success: boolean;
  error?: any;
};

type CartItemDetailed = {
  id: number;
  product: {
    id: number;
    name: string;
    price: number;
    image: string;
    category: string;
    tagline: string;
  };
  qty: number;
  subtotal: number;
  isBoutique?: boolean;
};

// ─── Composants utilitaires ───────────────────────────────────────────────────

const Row = ({
  label,
  value,
  accent,
}: {
  label: string;
  value: string;
  accent?: boolean;
}) => (
  <div className="flex items-center justify-between">
    <span className="text-muted-foreground text-sm">{label}</span>
    <span
      className={`tabular-nums text-sm font-medium ${accent ? "text-green-500" : "text-foreground"}`}
    >
      {value}
    </span>
  </div>
);

const StepDot = ({
  n,
  active,
  done,
}: {
  n: number;
  active: boolean;
  done: boolean;
}) => (
  <div
    className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold border-2 transition-all
    ${
      done
        ? "bg-primary border-primary text-primary-foreground"
        : active
          ? "border-primary text-primary bg-primary/10"
          : "border-border text-muted-foreground"
    }`}
  >
    {done ? <Check className="h-3.5 w-3.5" /> : n}
  </div>
);

// ─── Écran de confirmation post-commande ──────────────────────────────────────

const OrderConfirmationScreen = ({
  commandeUuid,
  onClose,
}: {
  commandeUuid: string;
  onClose: () => void;
}) => (
  <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-md p-4">
    <div className="bg-background border border-border rounded-2xl shadow-2xl w-full max-w-md text-center p-8 animate-slide-up">
      {/* Icône animée */}
      <div className="relative inline-flex mb-6">
        <div className="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center">
          <BadgeCheck className="h-10 w-10 text-primary" />
        </div>
        <span className="absolute -top-1 -right-1 w-6 h-6 bg-green-500 rounded-full flex items-center justify-center">
          <Check className="h-3.5 w-3.5 text-white" />
        </span>
      </div>

      <h2 className="font-display text-2xl font-bold text-foreground mb-1">
        Commande enregistrée !
      </h2>
      <p className="text-xs font-mono text-muted-foreground mb-6">
        Réf. {commandeUuid}
      </p>

      {/* Message principal */}
      <div className="bg-secondary/40 border border-border rounded-xl p-4 mb-6 text-left space-y-3">
        <div className="flex items-start gap-3">
          <div className="p-1.5 bg-primary/10 rounded-lg shrink-0 mt-0.5">
            <Phone className="h-4 w-4 text-primary" />
          </div>
          <p className="text-sm text-foreground leading-relaxed">
            Un responsable vous recontactera sous{" "}
            <span className="font-semibold text-primary">24 à 48h</span> pour
            finaliser et valider votre commande.
          </p>
        </div>
        <div className="flex items-start gap-3">
          <div className="p-1.5 bg-primary/10 rounded-lg shrink-0 mt-0.5">
            <Clock className="h-4 w-4 text-primary" />
          </div>
          <p className="text-sm text-muted-foreground leading-relaxed">
            Aucun paiement ne sera effectué avant confirmation. Vous recevrez
            les détails par téléphone ou email.
          </p>
        </div>
      </div>

      <Button variant="hero" size="lg" className="w-full" onClick={onClose}>
        Retour au catalogue
        <ArrowRight className="h-4 w-4 ml-2" />
      </Button>
    </div>
  </div>
);

// ─── Composant principal ──────────────────────────────────────────────────────

const Cart = () => {
  const {
    cartDetailed,
    cartTotal,
    isLoading,
    updateQuantity,
    removeFromCart,
    clearCart,
    refreshCart,
    cartItems,
  } = useCartApi();
  const [showHeartAnimation, setShowHeartAnimation] = useState(false);
  const [lastAddedProduct, setLastAddedProduct] = useState<string | null>(null);
  const previousCartCountRef = useRef(0);
  const navigate = useNavigate();

  // Modal devis
  const [showDevisModal, setShowDevisModal] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [devisId, setDevisId] = useState<number | null>(null);
  const [devisValide, setDevisValide] = useState(false);
  const [commandeUuid, setCommandeUuid] = useState<string | null>(null);
  const [showConfirmation, setShowConfirmation] = useState(false);

  // Formulaire devis
  const [devisForm, setDevisForm] = useState({
    besoinLivraison: false,
    adresseId: 0,
    adressePersonnalisee: "",
    note: "",
    devise: "MGA",
  });

  const [adresses, setAdresses] = useState<Adresse[]>([]);
  const [isLoadingAdresses, setIsLoadingAdresses] = useState(false);

  // Étape modale : 1 = récap/options, 2 = livraison/note
  const [modalStep, setModalStep] = useState<1 | 2>(1);

  // ✅ Fonction corrigée pour gérer les deux types d'images
  const getProductImageUrl = (product: any, isBoutique?: boolean) => {
    if (!product) return fosa;

    // Si c'est un article de boutique Misa
    if (isBoutique) {
      return product.image_url || fosa;
    }

    // Si c'est un produit classique
    const images = product.images || [];
    if (images.length === 0) return fosa;
    const mainImage = images.find((img: any) => img.ordre === 0) || images[0];
    if (!mainImage?.url) return fosa;
    let finalUrl = mainImage.url;
    if (mainImage.url.startsWith("/storage")) {
      finalUrl = `http://127.0.0.1:8000${mainImage.url}`;
    }
    return finalUrl;
  };

  useEffect(() => {
    document.title = "Mon panier — Les Casaniers Madagascar";
  }, []);

  useEffect(() => {
    const currentCount = cartDetailed.length;
    if (currentCount > previousCartCountRef.current && currentCount > 0) {
      const newItem = cartDetailed[0];
      if (newItem) {
        setLastAddedProduct(newItem.product.name);
        setShowHeartAnimation(true);
        setTimeout(() => setShowHeartAnimation(false), 3000);
      }
    }
    previousCartCountRef.current = currentCount;
  }, [cartDetailed]);

  const handleRemove = async (itemId: number, productName: string) => {
    await removeFromCart(itemId);
    toast({
      title: "Article retiré",
      description: `${productName} a été supprimé.`,
    });
  };

  const handleSetQty = async (itemId: number, newQty: number) => {
    if (newQty < 1) return;
    await updateQuantity(itemId, newQty);
  };

  const handleClearCart = () => {
    if (cartDetailed.length > 0) clearCart();
  };

  const calculateSubtotal = () =>
    cartDetailed.reduce((sum, item) => sum + item.subtotal, 0);

  const getLivraisonAmount = () => (devisForm.besoinLivraison ? 50000 : 0);

  const getTotalWithLivraison = () =>
    calculateSubtotal() + getLivraisonAmount();

  const formatPriceWithDevise = (prix: number, devise: string) => {
    if (devise === "EUR") return `€ ${prix.toLocaleString("fr-FR")}`;
    if (devise === "USD") return `$ ${prix.toLocaleString("fr-FR")}`;
    return `${prix.toLocaleString("fr-FR")} Ar`;
  };

  const fetchAdresses = async () => {
    try {
      setIsLoadingAdresses(true);
      const response = await api.get("/adresses");
      let adressesData: Adresse[] = [];
      if (response.data.data)
        adressesData = Array.isArray(response.data.data)
          ? response.data.data
          : [];
      else if (Array.isArray(response.data)) adressesData = response.data;
      setAdresses(adressesData);
      const defaultAdresse = adressesData.find((a) => a.par_defaut_expedition);
      if (defaultAdresse)
        setDevisForm((prev) => ({ ...prev, adresseId: defaultAdresse.id }));
    } catch (error) {
      console.error("Erreur chargement adresses:", error);
    } finally {
      setIsLoadingAdresses(false);
    }
  };

  const handleOpenDevisModal = async () => {
    if (cartDetailed.length === 0) {
      toast({
        title: "Panier vide",
        description: "Ajoutez des produits avant de passer commande.",
        variant: "destructive",
      });
      return;
    }
    setShowDevisModal(true);
    setDevisId(null);
    setDevisValide(false);
    setModalStep(1);
    await fetchAdresses();
  };

  const handleValidateDevis = async () => {
    try {
      setIsSubmitting(true);
      const userResponse = await api.get("/utilisateurs/profile");
      const userData = userResponse.data.data || userResponse.data;
      const userId = userData.id;
      const firstCartItem = cartItems[0];
      const panierId = firstCartItem?.id;

      const devisData = {
        utilisateur_id: userId,
        panier_id: panierId,
        statut: "en_attente",
        note: devisForm.note || "",
        montant_total: getTotalWithLivraison(),
        devise: devisForm.devise,
      };

      const response = await api.post("/devis", devisData);

      if (response.data.success && response.data.data) {
        const newDevisId = response.data.data.id;
        if (newDevisId) {
          setDevisId(newDevisId);
          setDevisValide(true);
          toast({
            title: "Devis validé",
            description: `Devis N°${newDevisId} prêt.`,
            duration: 2000,
          });
        } else {
          throw new Error("ID non trouvé");
        }
      } else {
        throw new Error(response.data.message || "Erreur");
      }
    } catch (error: any) {
      toast({
        title: "Erreur",
        description:
          error.response?.data?.message || "Impossible de créer le devis",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCommander = async () => {
    if (!devisId || !devisValide) {
      toast({
        title: "Validation requise",
        description: "Validez d'abord le devis.",
        variant: "destructive",
      });
      return;
    }

    try {
      setIsSubmitting(true);

      // ✅ Vérification des stocks (produits classiques)
      const stockChecksProduits: StockCheckResult[] = await Promise.all(
        cartDetailed
          .filter((item: CartItemDetailed) => !item.isBoutique)
          .map(async (item) => {
            try {
              const response = await api.get(`/produits/${item.product.id}`);
              const product = response.data.data || response.data;
              return {
                id: item.product.id,
                nom: item.product.name,
                quantite_demandee: item.qty,
                stock_actuel: product.quantite_stock,
                suffisant: product.quantite_stock >= item.qty,
                type: "produit",
              };
            } catch (error) {
              return {
                id: item.product.id,
                nom: item.product.name,
                quantite_demandee: item.qty,
                stock_actuel: 0,
                suffisant: false,
                error: true,
                type: "produit",
              };
            }
          }),
      );

      // ✅ Vérification des stocks (articles boutique Misa)
      const stockChecksBoutique: StockCheckResult[] = await Promise.all(
        cartDetailed
          .filter((item: CartItemDetailed) => item.isBoutique)
          .map(async (item) => {
            try {
              const response = await api.get(
                `/boutique-misa/${item.product.id}`,
              );
              const product = response.data.data || response.data;
              return {
                id: item.product.id,
                nom: item.product.name,
                quantite_demandee: item.qty,
                stock_actuel: product.stock || 0,
                suffisant: (product.stock || 0) >= item.qty,
                type: "boutique",
              };
            } catch (error) {
              return {
                id: item.product.id,
                nom: item.product.name,
                quantite_demandee: item.qty,
                stock_actuel: 0,
                suffisant: false,
                error: true,
                type: "boutique",
              };
            }
          }),
      );

      const allStockChecks = [...stockChecksProduits, ...stockChecksBoutique];
      const stockInsuffisant = allStockChecks.filter((c) => !c.suffisant);

      if (stockInsuffisant.length > 0) {
        toast({
          title: "❌ Stock insuffisant",
          description: stockInsuffisant
            .map((c) => `• ${c.nom}: ${c.stock_actuel} disponible(s)`)
            .join("\n"),
          variant: "destructive",
          duration: 5000,
        });
        setIsSubmitting(false);
        return;
      }

      // ✅ Réduction des stocks pour les produits classiques
      await Promise.all(
        cartDetailed
          .filter((item: CartItemDetailed) => !item.isBoutique)
          .map(async (item) => {
            const getResponse = await api.get(`/produits/${item.product.id}`);
            const product = getResponse.data.data || getResponse.data;
            const nouveauStock = product.quantite_stock - item.qty;
            await api.put(`/produits/${item.product.id}`, {
              quantite_stock: nouveauStock,
              est_dispo: nouveauStock > 0,
            });
          }),
      );

      // ✅ Réduction des stocks pour les articles boutique Misa
      await Promise.all(
        cartDetailed
          .filter((item: CartItemDetailed) => item.isBoutique)
          .map(async (item) => {
            const getResponse = await api.get(
              `/boutique-misa/${item.product.id}`,
            );
            const product = getResponse.data.data || getResponse.data;
            const nouveauStock = (product.stock || 0) - item.qty;
            // ✅ Utiliser la route publique au lieu de /admin/
            await api.patch(`/boutique-misa/${item.product.id}/stock`, {
              stock: nouveauStock,
            });
          }),
      );

      // ✅ Création de la commande avec les bons IDs
      const commandeData: any = {
        livraison: getLivraisonAmount(),
        devise: devisForm.devise,
        adresse_expedition_id:
          devisForm.besoinLivraison && devisForm.adresseId > 0
            ? devisForm.adresseId
            : null,
        adresse_facturation_id: null,
        devis_id: devisId,
        meta_json: {
          note: devisForm.note || null,
          date_creation: new Date().toISOString(),
          besoin_livraison: devisForm.besoinLivraison,
          adresse_personnalisee: devisForm.adressePersonnalisee || null,
          devis_id: devisId,
          produits: cartDetailed.map((item: CartItemDetailed) => ({
            id: item.product.id,
            nom: item.product.name,
            quantite: item.qty,
            prix_unitaire: item.product.price,
            sous_total: item.subtotal,
            type: item.isBoutique ? "boutique" : "produit",
          })),
        },
      };

      const response = await api.post("/commandes", commandeData);

      if (response.status === 200 || response.status === 201) {
        const uuid = response.data.data?.commande_uuid || "—";
        setCommandeUuid(uuid);
        setShowDevisModal(false);
        setDevisId(null);
        setDevisValide(false);
        await clearCart();
        setShowConfirmation(true);

        toast({
          title: "✅ Commande confirmée !",
          description: `Commande ${uuid} enregistrée avec succès.`,
        });
      }
    } catch (error: any) {
      const msg =
        error.response?.data?.message || "Impossible de créer la commande.";
      toast({
        title: "❌ Erreur",
        description: msg,
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  // ── Loading ─────────────────────────────────────────────────────────────────

  if (isLoading) {
    return (
      <SiteLayout>
        <section className="container-x py-12">
          <div className="flex flex-col items-center justify-center py-24">
            <Loader2 className="h-10 w-10 animate-spin text-primary mb-4" />
            <p className="text-muted-foreground text-sm">
              Chargement du panier…
            </p>
          </div>
        </section>
      </SiteLayout>
    );
  }

  // ── Panier vide ─────────────────────────────────────────────────────────────

  if (cartDetailed.length === 0) {
    return (
      <SiteLayout>
        <section className="container-x py-12">
          <div className="relative card-soft p-12 text-center max-w-xl mx-auto overflow-hidden">
            <div className="relative inline-block mb-4">
              <img
                src={fosa}
                alt="Le Fosa"
                className="h-36 w-36 mx-auto animate-float rounded-full"
              />
              {[...Array(10)].map((_, i) => (
                <Heart
                  key={i}
                  className="absolute fill-rose-500 text-rose-500 animate-heart-orbit"
                  style={{
                    width: `${12 + (i % 3) * 8}px`,
                    height: `${12 + (i % 3) * 8}px`,
                    top: `${50 + 52 * Math.sin((i / 10) * 2 * Math.PI)}%`,
                    left: `${50 + 52 * Math.cos((i / 10) * 2 * Math.PI)}%`,
                    transform: "translate(-50%, -50%)",
                    animationDelay: `${i * 0.18}s`,
                  }}
                />
              ))}
            </div>
            <h2 className="font-display text-2xl font-bold mb-2">
              Le Fosa s'ennuie un peu ici…
            </h2>
            <p className="text-muted-foreground mb-6 text-sm">
              Votre panier est vide. Découvrez nos configurations !
            </p>
            <Button variant="hero" size="lg" asChild>
              <Link to="/catalogue">
                Explorer le catalogue <ArrowRight className="h-4 w-4" />
              </Link>
            </Button>
          </div>
        </section>
      </SiteLayout>
    );
  }

  // ── Vue principale ──────────────────────────────────────────────────────────

  return (
    <SiteLayout>
      <section className="container-x py-12">
        {/* Header */}
        <div className="mb-10">
          <div className="pill mb-3">
            <ShoppingBag className="h-3.5 w-3.5 text-accent" /> Le Bond
          </div>
          <h1 className="font-display text-4xl lg:text-5xl font-bold tracking-tight">
            Votre panier
          </h1>
          <p className="text-muted-foreground mt-2 text-sm">
            {cartDetailed.length} article{cartDetailed.length > 1 ? "s" : ""}{" "}
            sélectionné{cartDetailed.length > 1 ? "s" : ""}
          </p>
        </div>

        <div className="grid lg:grid-cols-12 gap-8">
          {/* ── Liste des articles ──────────────────────────────────────────── */}
          <div className="lg:col-span-8 space-y-3">
            {cartDetailed.map((item: CartItemDetailed) => {
              // ✅ Appel corrigé avec isBoutique
              const imageUrl = getProductImageUrl(
                item.product,
                item.isBoutique,
              );
              const productLink = item.isBoutique
                ? `/boutique-misa/${item.product.id}`
                : `/produit/${item.product.id}`;

              return (
                <div
                  key={item.id}
                  className="card-soft p-4 flex gap-4 hover-lift group"
                >
                  <Link to={productLink} className="shrink-0">
                    <img
                      src={imageUrl}
                      alt={item.product.name}
                      className="h-24 w-24 rounded-xl object-cover transition-transform group-hover:scale-105"
                      onError={(e) => {
                        (e.target as HTMLImageElement).src = fosa;
                      }}
                    />
                  </Link>
                  <div className="flex-1 min-w-0 flex flex-col justify-between py-0.5">
                    <div>
                      <div className="text-[10px] font-mono uppercase tracking-wider text-accent mb-0.5">
                        {item.isBoutique
                          ? "Boutique Misa"
                          : item.product.category}
                      </div>
                      <Link
                        to={productLink}
                        className="font-display font-bold text-base leading-tight hover:text-accent transition-colors line-clamp-1"
                      >
                        {item.product.name}
                      </Link>
                      <p className="text-xs text-muted-foreground italic line-clamp-1 mt-0.5">
                        {item.isBoutique
                          ? "Article de la boutique Misa"
                          : item.product.tagline}
                      </p>
                    </div>
                    <div className="flex items-center justify-between mt-3">
                      {/* Contrôle quantité */}
                      <div className="flex items-center bg-secondary rounded-full h-8">
                        <button
                          onClick={() => handleSetQty(item.id, item.qty - 1)}
                          className="h-8 w-8 flex items-center justify-center hover:text-accent transition-colors rounded-full"
                        >
                          <Minus className="h-3 w-3" />
                        </button>
                        <span className="w-7 text-center font-semibold tabular-nums text-sm">
                          {item.qty}
                        </span>
                        <button
                          onClick={() => handleSetQty(item.id, item.qty + 1)}
                          className="h-8 w-8 flex items-center justify-center hover:text-accent transition-colors rounded-full"
                        >
                          <Plus className="h-3 w-3" />
                        </button>
                      </div>
                      {/* Prix + suppression */}
                      <div className="flex items-center gap-3">
                        <span className="font-display font-bold text-sm">
                          {formatAr(item.subtotal)}
                        </span>
                        <button
                          onClick={() =>
                            handleRemove(item.id, item.product.name)
                          }
                          className="text-muted-foreground/50 hover:text-destructive transition-colors p-1"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}

            {/* Actions bas de liste */}
            <div className="flex justify-between items-center pt-1">
              <button
                onClick={handleClearCart}
                className="text-xs text-muted-foreground/60 hover:text-destructive transition-colors flex items-center gap-1"
              >
                <Trash2 className="h-3 w-3" /> Vider le panier
              </button>
              <Link
                to="/catalogue"
                className="text-xs text-accent hover:underline"
              >
                ← Continuer mes achats
              </Link>
            </div>
          </div>

          {/* ── Récapitulatif ───────────────────────────────────────────────── */}
          <aside className="lg:col-span-4 lg:sticky lg:top-32 self-start space-y-4">
            <div className="card-soft p-6">
              <h3 className="font-display font-bold text-base mb-4">
                Récapitulatif
              </h3>
              <div className="space-y-2.5">
                <Row label="Sous-total" value={formatAr(calculateSubtotal())} />
              </div>

              <div className="border-t border-border mt-4 pt-4 flex items-end justify-between">
                <span className="font-semibold text-sm">Estimé TTC</span>
                <span className="font-display font-bold text-2xl text-primary">
                  {formatAr(calculateSubtotal())}
                </span>
              </div>

              <Button
                variant="hero"
                size="lg"
                className="w-full mt-5 group"
                onClick={handleOpenDevisModal}
              >
                Passer commande
                <ChevronRight className="h-4 w-4 ml-1 transition-transform group-hover:translate-x-1" />
              </Button>
            </div>

            {/* Badges de confiance */}
            <div className="card-soft p-4 space-y-2.5">
              <div className="flex items-center gap-2.5 text-xs text-muted-foreground">
                <ShieldCheck className="h-4 w-4 text-accent shrink-0" />
                <span>Aucun paiement avant confirmation</span>
              </div>
              <div className="flex items-center gap-2.5 text-xs text-muted-foreground">
                <Truck className="h-4 w-4 text-accent shrink-0" />
                <span>Livraison disponible à Antananarivo</span>
              </div>
              <div className="flex items-center gap-2.5 text-xs text-muted-foreground">
                <Phone className="h-4 w-4 text-accent shrink-0" />
                <span>Un conseiller vous recontacte sous 24h</span>
              </div>
            </div>
          </aside>
        </div>
      </section>

      {/* ── MODAL COMMANDE ──────────────────────────────────────────────────── */}
      {showDevisModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="bg-background border border-border rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] flex flex-col animate-slide-up">
            {/* Header modal */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-border">
              <div>
                <h2 className="font-display font-bold text-lg text-foreground">
                  Récapitulatif de commande
                </h2>
                <p className="text-xs text-muted-foreground mt-0.5">
                  Vérifiez vos articles avant de confirmer
                </p>
              </div>
              <button
                onClick={() => setShowDevisModal(false)}
                className="p-2 rounded-lg hover:bg-secondary transition text-muted-foreground hover:text-foreground"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            {/* Stepper */}
            <div className="flex items-center gap-0 px-6 pt-4 pb-2">
              {[
                { n: 1, label: "Articles" },
                { n: 2, label: "Options" },
              ].map((step, i, arr) => (
                <div key={step.n} className="flex items-center gap-0 flex-1">
                  <div className="flex items-center gap-2">
                    <StepDot
                      n={step.n}
                      active={modalStep === step.n}
                      done={modalStep > step.n}
                    />
                    <span
                      className={`text-xs font-medium ${modalStep === step.n ? "text-foreground" : "text-muted-foreground"}`}
                    >
                      {step.label}
                    </span>
                  </div>
                  {i < arr.length - 1 && (
                    <div className="flex-1 h-px bg-border mx-3" />
                  )}
                </div>
              ))}
            </div>

            {/* Contenu scrollable */}
            <div className="overflow-y-auto px-6 pb-6 flex-1">
              {/* Étape 1 : Articles + devise */}
              {modalStep === 1 && (
                <div className="space-y-4 pt-4">
                  {/* Articles */}
                  <div className="space-y-2">
                    {cartDetailed.map((item) => {
                      const imageUrl = getProductImageUrl(
                        item.product,
                        item.isBoutique,
                      );
                      return (
                        <div
                          key={item.id}
                          className="flex items-center gap-3 p-3 rounded-xl bg-secondary/20 border border-border/50"
                        >
                          <img
                            src={imageUrl}
                            alt={item.product.name}
                            className="h-11 w-11 rounded-lg object-cover shrink-0"
                            onError={(e) => {
                              (e.target as HTMLImageElement).src = fosa;
                            }}
                          />
                          <div className="flex-1 min-w-0">
                            <p className="font-medium text-sm text-foreground line-clamp-1">
                              {item.product.name}
                            </p>
                            <p className="text-xs text-muted-foreground">
                              Qté : {item.qty}
                            </p>
                          </div>
                          <p className="font-semibold text-sm text-primary tabular-nums whitespace-nowrap">
                            {formatPriceWithDevise(
                              item.subtotal,
                              devisForm.devise,
                            )}
                          </p>
                        </div>
                      );
                    })}
                  </div>

                  {/* Devise */}
                  <div>
                    <label className="block text-xs font-medium text-muted-foreground mb-1.5 uppercase tracking-wider">
                      Devise
                    </label>
                    <div className="grid grid-cols-3 gap-2">
                      {[{ val: "MGA", label: "Ariary", flag: "🇲🇬" }].map(
                        (d) => (
                          <button
                            key={d.val}
                            onClick={() =>
                              setDevisForm((prev) => ({
                                ...prev,
                                devise: d.val,
                              }))
                            }
                            className={`flex items-center gap-2 px-3 py-2.5 rounded-xl border text-sm font-medium transition-all
                            ${devisForm.devise === d.val ? "border-primary bg-primary/10 text-primary" : "border-border hover:border-primary/40 text-muted-foreground"}`}
                          >
                            <span>{d.flag}</span>
                            <span>{d.label}</span>
                          </button>
                        ),
                      )}
                    </div>
                  </div>

                  {/* Toggle livraison */}
                  <div className="flex items-center justify-between p-4 bg-secondary/20 border border-border/50 rounded-xl">
                    <div className="flex items-center gap-3">
                      <Truck className="h-4 w-4 text-primary shrink-0" />
                      <div>
                        <p className="text-sm font-medium text-foreground">
                          Livraison à domicile
                        </p>
                        <p className="text-xs text-muted-foreground">
                          +50 000 Ar
                        </p>
                      </div>
                    </div>
                    <button
                      onClick={() =>
                        setDevisForm((prev) => ({
                          ...prev,
                          besoinLivraison: !prev.besoinLivraison,
                        }))
                      }
                      className={`relative w-11 h-6 rounded-full transition-colors shrink-0 ${devisForm.besoinLivraison ? "bg-primary" : "bg-border"}`}
                    >
                      <span
                        className={`absolute top-0.5 w-5 h-5 rounded-full bg-white transition-transform shadow ${devisForm.besoinLivraison ? "right-0.5" : "left-0.5"}`}
                      />
                    </button>
                  </div>
                </div>
              )}

              {/* Étape 2 : Adresse + note */}
              {modalStep === 2 && (
                <div className="space-y-5 pt-4">
                  {/* Adresse (si livraison) */}
                  {devisForm.besoinLivraison && (
                    <div>
                      <label className="block text-xs font-medium text-muted-foreground mb-2 uppercase tracking-wider">
                        Adresse de livraison
                      </label>
                      {isLoadingAdresses ? (
                        <div className="flex items-center gap-2 text-sm text-muted-foreground p-3">
                          <Loader2 className="h-4 w-4 animate-spin" />{" "}
                          Chargement…
                        </div>
                      ) : adresses.length > 0 ? (
                        <div className="space-y-2 max-h-44 overflow-y-auto">
                          {adresses.map((adr) => (
                            <label
                              key={adr.id}
                              className={`flex items-start gap-3 p-3 border rounded-xl cursor-pointer transition-all
                              ${devisForm.adresseId === adr.id ? "border-primary bg-primary/5" : "border-border hover:border-primary/30"}`}
                            >
                              <input
                                type="radio"
                                name="adresse"
                                checked={devisForm.adresseId === adr.id}
                                onChange={() =>
                                  setDevisForm((prev) => ({
                                    ...prev,
                                    adresseId: adr.id,
                                    adressePersonnalisee: "",
                                  }))
                                }
                                className="mt-1 accent-primary"
                              />
                              <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-1.5 mb-0.5">
                                  {adr.etiquette === "Maison" && (
                                    <Home className="h-3.5 w-3.5 text-green-500" />
                                  )}
                                  {adr.etiquette === "Appartement" && (
                                    <Building className="h-3.5 w-3.5 text-blue-500" />
                                  )}
                                  {adr.etiquette === "Bureau" && (
                                    <Package className="h-3.5 w-3.5 text-purple-500" />
                                  )}
                                  <p className="font-medium text-sm text-foreground">
                                    {adr.nom_complet}
                                  </p>
                                  {adr.par_defaut_expedition && (
                                    <span className="text-[10px] bg-primary/15 text-primary px-1.5 py-0.5 rounded-full">
                                      Par défaut
                                    </span>
                                  )}
                                </div>
                                <p className="text-xs text-muted-foreground">
                                  {adr.adresse_ligne1}
                                  {adr.adresse_ligne2 &&
                                    `, ${adr.adresse_ligne2}`}
                                </p>
                                <p className="text-xs text-muted-foreground">
                                  {adr.code_postal} {adr.ville}, {adr.region}
                                </p>
                              </div>
                            </label>
                          ))}
                        </div>
                      ) : null}

                      <div className="mt-3">
                        <p className="text-xs text-muted-foreground mb-1.5">
                          Ou saisissez une adresse :
                        </p>
                        <textarea
                          value={devisForm.adressePersonnalisee}
                          onChange={(e) =>
                            setDevisForm((prev) => ({
                              ...prev,
                              adressePersonnalisee: e.target.value,
                              adresseId: 0,
                            }))
                          }
                          placeholder="Rue, quartier, ville, téléphone…"
                          rows={3}
                          className="w-full px-4 py-2.5 text-sm border border-border rounded-xl bg-background focus:outline-none focus:ring-2 focus:ring-primary/20 resize-none"
                        />
                      </div>
                    </div>
                  )}

                  {/* Note */}
                  <div>
                    <label className="block text-xs font-medium text-muted-foreground mb-1.5 uppercase tracking-wider">
                      Note (optionnelle)
                    </label>
                    <textarea
                      value={devisForm.note}
                      onChange={(e) =>
                        setDevisForm((prev) => ({
                          ...prev,
                          note: e.target.value,
                        }))
                      }
                      placeholder="Informations complémentaires, préférences de contact…"
                      rows={3}
                      className="w-full px-4 py-2.5 text-sm border border-border rounded-xl bg-background focus:outline-none focus:ring-2 focus:ring-primary/20 resize-none"
                    />
                  </div>

                  {/* Total récap */}
                  <div className="bg-secondary/20 border border-border/50 rounded-xl p-4">
                    <div className="flex justify-between text-sm mb-1.5">
                      <span className="text-muted-foreground">Sous-total</span>
                      <span className="font-medium">
                        {formatPriceWithDevise(
                          calculateSubtotal(),
                          devisForm.devise,
                        )}
                      </span>
                    </div>
                    {devisForm.besoinLivraison && (
                      <div className="flex justify-between text-sm mb-1.5">
                        <span className="text-muted-foreground">Livraison</span>
                        <span className="font-medium">
                          {formatPriceWithDevise(50000, devisForm.devise)}
                        </span>
                      </div>
                    )}
                    <div className="border-t border-border pt-2.5 mt-2 flex justify-between items-center">
                      <span className="font-semibold text-sm">Total TTC</span>
                      <span className="font-display font-bold text-xl text-primary">
                        {formatPriceWithDevise(
                          getTotalWithLivraison(),
                          devisForm.devise,
                        )}
                      </span>
                    </div>
                  </div>

                  {/* Message info contact */}
                  <div className="flex items-start gap-3 p-3 bg-primary/5 border border-primary/20 rounded-xl">
                    <Phone className="h-4 w-4 text-primary shrink-0 mt-0.5" />
                    <p className="text-xs text-muted-foreground leading-relaxed">
                      Après confirmation, un responsable vous recontactera sous{" "}
                      <strong className="text-foreground">24 à 48h</strong> pour
                      valider votre commande. Aucun paiement ne sera demandé
                      avant ce contact.
                    </p>
                  </div>
                </div>
              )}
            </div>

            {/* Footer modal */}
            <div className="flex items-center justify-between gap-3 px-6 py-4 border-t border-border bg-secondary/5">
              <button
                onClick={() => setShowDevisModal(false)}
                className="px-4 py-2 text-sm text-muted-foreground hover:text-foreground transition"
              >
                Annuler
              </button>

              <div className="flex items-center gap-2">
                {modalStep === 2 && (
                  <button
                    onClick={() => setModalStep(1)}
                    className="px-4 py-2 text-sm border border-border rounded-xl hover:bg-secondary transition text-muted-foreground"
                  >
                    Retour
                  </button>
                )}

                {modalStep === 1 && (
                  <Button
                    variant="hero"
                    onClick={() => setModalStep(2)}
                    className="flex items-center gap-2"
                  >
                    Continuer
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                )}

                {modalStep === 2 && (
                  <>
                    <Button
                      variant="soft"
                      onClick={handleValidateDevis}
                      disabled={isSubmitting || devisValide}
                      className="flex items-center gap-2"
                    >
                      {isSubmitting && !devisValide ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <Check className="h-4 w-4" />
                      )}
                      {devisValide ? "Devis validé ✓" : "Valider le devis"}
                    </Button>
                    <Button
                      variant="hero"
                      onClick={handleCommander}
                      disabled={isSubmitting || !devisId}
                      className="flex items-center gap-2"
                    >
                      {isSubmitting ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <ShoppingBag className="h-4 w-4" />
                      )}
                      Confirmer la commande
                    </Button>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── ÉCRAN DE CONFIRMATION ───────────────────────────────────────────── */}
      {showConfirmation && commandeUuid && (
        <OrderConfirmationScreen
          commandeUuid={commandeUuid}
          onClose={() => {
            setShowConfirmation(false);
            navigate("/catalogue");
          }}
        />
      )}

      <style>{`
        @keyframes float { 0%, 100% { transform: translateY(0px); } 50% { transform: translateY(-10px); } }
        .animate-float { animation: float 3s ease-in-out infinite; }
        @keyframes bounce-slow { 0%, 100% { transform: translateY(0); } 50% { transform: translateY(-8px); } }
        .animate-bounce-slow { animation: bounce-slow 1s ease-in-out infinite; }
        @keyframes float-up { 0% { opacity: 1; transform: translateY(0) scale(1); } 100% { opacity: 0; transform: translateY(-30px) scale(1.5); } }
        .animate-float-up { animation: float-up 1s ease-out forwards; }
        @keyframes slide-up { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }
        .animate-slide-up { animation: slide-up 0.3s ease-out both; }
        @keyframes heart-orbit { 0%, 100% { opacity: 0.6; transform: translate(-50%,-50%) scale(0.8); } 50% { opacity: 1; transform: translate(-50%,-50%) scale(1.2); } }
        .animate-heart-orbit { animation: heart-orbit 1.5s ease-in-out infinite; }
      `}</style>
    </SiteLayout>
  );
};

export default Cart;
