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
  Home,
  Building,
  Package,
  ChevronRight,
  Clock,
  Phone,
  BadgeCheck,
  Lock,
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

const StepDot = ({
  label,
  active,
  done,
}: {
  label: string;
  active: boolean;
  done: boolean;
}) => (
  <div className="flex flex-col items-center gap-2">
    <div
      className={`w-9 h-9 rounded-full flex items-center justify-center border transition-all
      ${
        done || active
          ? "border-white text-white"
          : "border-white/30 text-white/40"
      }`}
    >
      <Lock className="h-3.5 w-3.5" />
    </div>
    <span
      className={`text-[11px] font-sans font-semibold tracking-wide ${
        done || active ? "text-white" : "text-white/40"
      }`}
    >
      {label}
    </span>
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
  <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-md p-4">
    <div className="bg-black border border-white/20 rounded-2xl shadow-2xl w-full max-w-md text-center p-8 animate-slide-up">
      <div className="relative inline-flex mb-6">
        <div className="w-20 h-20 rounded-full bg-white/10 flex items-center justify-center">
          <BadgeCheck className="h-10 w-10 text-white" />
        </div>
        <span className="absolute -top-1 -right-1 w-6 h-6 bg-orange-500 rounded-full flex items-center justify-center">
          <Check className="h-3.5 w-3.5 text-white" />
        </span>
      </div>

      <h2 className="font-sans text-2xl font-bold text-white mb-1">
        Commande enregistrée !
      </h2>
      <p className="text-xs font-mono text-white/50 mb-6">
        Réf. {commandeUuid}
      </p>

      <div className="bg-white/5 border border-white/10 rounded-xl p-4 mb-6 text-left space-y-3">
        <div className="flex items-start gap-3">
          <div className="p-1.5 bg-white/10 rounded-lg shrink-0 mt-0.5">
            <Phone className="h-4 w-4 text-white" />
          </div>
          <p className="text-sm text-white leading-relaxed font-sans">
            Un responsable vous recontactera sous{" "}
            <span className="font-semibold text-orange-400">24 à 48h</span> pour
            finaliser et valider votre commande.
          </p>
        </div>
        <div className="flex items-start gap-3">
          <div className="p-1.5 bg-white/10 rounded-lg shrink-0 mt-0.5">
            <Clock className="h-4 w-4 text-white" />
          </div>
          <p className="text-sm text-white/60 leading-relaxed font-sans">
            Aucun paiement ne sera effectué avant confirmation. Vous recevrez
            les détails par téléphone ou email.
          </p>
        </div>
      </div>

      <button
        onClick={onClose}
        className="w-full py-3 bg-orange-500 hover:bg-orange-600 text-white font-sans font-semibold rounded-full transition-colors duration-200 flex items-center justify-center gap-2"
      >
        Retour au catalogue
        <ArrowRight className="h-4 w-4" />
      </button>
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

  // Étape du stepper visuel (haut de page)
  const pageStep: 1 | 2 | 3 = showDevisModal
    ? modalStep === 1
      ? 2
      : 3
    : 1;

  const getProductImageUrl = (product: any, isBoutique?: boolean) => {
    if (!product) return fosa;
    if (isBoutique) {
      return product.image_url || fosa;
    }
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

      await Promise.all(
        cartDetailed
          .filter((item: CartItemDetailed) => item.isBoutique)
          .map(async (item) => {
            const getResponse = await api.get(
              `/boutique-misa/${item.product.id}`,
            );
            const product = getResponse.data.data || getResponse.data;
            const nouveauStock = (product.stock || 0) - item.qty;
            await api.patch(`/boutique-misa/${item.product.id}/stock`, {
              stock: nouveauStock,
            });
          }),
      );

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
        <section className="bg-black min-h-[60vh] flex items-center justify-center">
          <div className="flex flex-col items-center justify-center py-24">
            <Loader2 className="h-10 w-10 animate-spin text-white mb-4" />
            <p className="text-white/50 text-sm font-sans">
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
        <section className="bg-black py-16">
          <div className="container-x">
            <div className="relative border border-white/15 rounded-2xl p-12 text-center max-w-xl mx-auto overflow-hidden">
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
              <h2 className="font-sans text-2xl font-bold mb-2 text-white">
                Le Fosa s'ennuie un peu ici…
              </h2>
              <p className="text-white/50 mb-6 text-sm font-sans">
                Votre panier est vide. Découvrez nos configurations !
              </p>
              <Link
                to="/catalogue"
                className="inline-flex items-center gap-2 px-6 py-3 bg-orange-500 hover:bg-orange-600 text-white font-sans font-semibold rounded-full transition-colors duration-200"
              >
                Explorer le catalogue <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          </div>
        </section>
      </SiteLayout>
    );
  }

  // ── Vue principale ──────────────────────────────────────────────────────────

  return (
    <SiteLayout>
      <section className="bg-black py-12">
        <div className="container-x">
          {/* Header + Stepper */}
          <div className="mb-10 text-center">
            <h1 className="font-sans text-2xl md:text-3xl font-extrabold tracking-widest text-white mb-1">
              TON PANIER
            </h1>
            <div className="w-24 h-[3px] bg-white mx-auto mb-1" />
            <div className="w-24 h-px bg-white/30 mx-auto border-t border-dashed" />

            <div className="max-w-2xl mx-auto mt-8 border border-white/15 rounded-2xl px-8 py-6">
              <div className="flex items-center">
                <StepDot label="PANIER" active={pageStep === 1} done={pageStep > 1} />
                <div className="flex-1 h-px bg-white/20 mx-3 -mt-5" />
                <StepDot label="ADRESSE" active={pageStep === 2} done={pageStep > 2} />
                <div className="flex-1 h-px bg-white/20 mx-3 -mt-5" />
                <StepDot label="VALIDATION" active={pageStep === 3} done={false} />
              </div>
            </div>
          </div>

          <div className="grid lg:grid-cols-12 gap-8">
            {/* ── Liste des articles ──────────────────────────────────────── */}
            <div className="lg:col-span-8">
              {/* En-têtes colonnes */}
              <div className="grid grid-cols-12 gap-4 px-2 pb-2 border-b border-white/15 text-[11px] font-sans font-semibold uppercase tracking-wider text-white/50">
                <div className="col-span-6">Article</div>
                <div className="col-span-3 text-center">Quantité</div>
                <div className="col-span-3 text-right">Sous-total</div>
              </div>

              <div className="divide-y divide-white/10">
                {cartDetailed.map((item: CartItemDetailed) => {
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
                      className="grid grid-cols-12 gap-4 items-center py-4 px-2"
                    >
                      {/* Article */}
                      <div className="col-span-6 flex gap-4 items-center min-w-0">
                        <Link to={productLink} className="shrink-0">
                          <img
                            src={imageUrl}
                            alt={item.product.name}
                            className="h-16 w-16 rounded-lg object-cover"
                            onError={(e) => {
                              (e.target as HTMLImageElement).src = fosa;
                            }}
                          />
                        </Link>
                        <div className="min-w-0">
                          <Link
                            to={productLink}
                            className="font-sans font-bold text-sm text-white hover:text-orange-400 transition-colors line-clamp-1 block"
                          >
                            {item.product.name}
                          </Link>
                          <p className="text-xs text-white/50 font-sans line-clamp-1 mt-0.5">
                            {item.isBoutique
                              ? "Article de la boutique Misa"
                              : item.product.tagline}
                          </p>
                        </div>
                      </div>

                      {/* Quantité */}
                      <div className="col-span-3 flex justify-center">
                        <div className="flex items-center bg-white text-black rounded-full h-8">
                          <button
                            onClick={() => handleSetQty(item.id, item.qty - 1)}
                            className="h-8 w-8 flex items-center justify-center hover:opacity-70 transition-opacity rounded-full"
                          >
                            <Minus className="h-3 w-3" />
                          </button>
                          <span className="w-7 text-center font-semibold tabular-nums text-sm">
                            {item.qty}
                          </span>
                          <button
                            onClick={() => handleSetQty(item.id, item.qty + 1)}
                            className="h-8 w-8 flex items-center justify-center hover:opacity-70 transition-opacity rounded-full"
                          >
                            <Plus className="h-3 w-3" />
                          </button>
                        </div>
                      </div>

                      {/* Sous-total + suppression */}
                      <div className="col-span-3 flex items-center justify-end gap-3">
                        <span className="font-sans font-bold text-sm text-white whitespace-nowrap">
                          {formatAr(item.subtotal)}
                        </span>
                        <button
                          onClick={() =>
                            handleRemove(item.id, item.product.name)
                          }
                          className="text-white/40 hover:text-red-500 transition-colors p-1"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Actions bas de liste */}
              <div className="flex justify-between items-center pt-4 px-2">
                <button
                  onClick={handleClearCart}
                  className="text-xs text-white/40 hover:text-red-500 transition-colors flex items-center gap-1 font-sans"
                >
                  <Trash2 className="h-3 w-3" /> Vider le panier
                </button>
                <Link
                  to="/catalogue"
                  className="text-xs text-white/60 hover:text-white transition-colors font-sans"
                >
                  ← Continuer mes achats
                </Link>
              </div>
            </div>

            {/* ── Récapitulatif ───────────────────────────────────────────── */}
            <aside className="lg:col-span-4 lg:sticky lg:top-32 self-start">
              <div className="bg-white rounded-xl overflow-hidden">
                <div className="px-6 py-4 border-b border-black/10">
                  <h3 className="font-sans font-bold text-base text-black">
                    Récapitulatif
                  </h3>
                </div>
                <div className="px-6 py-5 space-y-2.5">
                  <div className="flex items-center justify-between">
                    <span className="text-black/50 text-sm font-sans">
                      Sous-total
                    </span>
                    <span className="tabular-nums text-sm font-semibold font-sans text-black">
                      {formatAr(calculateSubtotal())}
                    </span>
                  </div>
                  <div className="border-t border-black/10 pt-3 mt-2 flex items-end justify-between">
                    <span className="font-semibold text-sm font-sans text-black">
                      Estimé TTC
                    </span>
                    <span className="font-sans font-bold text-xl text-black">
                      {formatAr(calculateSubtotal())}
                    </span>
                  </div>
                </div>
                <button
                  onClick={handleOpenDevisModal}
                  className="w-full py-4 bg-orange-500 hover:bg-orange-600 text-white font-sans font-bold text-sm tracking-wide transition-colors duration-200 flex items-center justify-center gap-2"
                >
                  Valider ma commande
                  <ChevronRight className="h-4 w-4" />
                </button>
              </div>

              {/* Badges de confiance */}
              <div className="mt-4 space-y-2.5 px-1">
                <div className="flex items-center gap-2.5 text-xs text-white/50 font-sans">
                  <ShieldCheck className="h-4 w-4 text-orange-400 shrink-0" />
                  <span>Aucun paiement avant confirmation</span>
                </div>
                <div className="flex items-center gap-2.5 text-xs text-white/50 font-sans">
                  <Truck className="h-4 w-4 text-orange-400 shrink-0" />
                  <span>Livraison disponible à Antananarivo</span>
                </div>
                <div className="flex items-center gap-2.5 text-xs text-white/50 font-sans">
                  <Phone className="h-4 w-4 text-orange-400 shrink-0" />
                  <span>Un conseiller vous recontacte sous 24h</span>
                </div>
              </div>
            </aside>
          </div>

          {/* Bandeau garanties bas de page */}
          <div className="mt-16 pt-6 border-t border-white/15 grid grid-cols-1 md:grid-cols-3 gap-4 text-center">
            <span className="font-sans font-bold text-xs tracking-widest text-white">
              GARANTIE 24 MOIS
            </span>
            <span className="font-sans font-bold text-xs tracking-widest text-white">
              RETRAIT SHOWROOM ANTANANARIVO
            </span>
            <span className="font-sans font-bold text-xs tracking-widest text-white">
              LIVRAISON MADAGASCAR
            </span>
          </div>
        </div>
      </section>

      {/* ── MODAL COMMANDE ──────────────────────────────────────────────────── */}
      {showDevisModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
          <div className="bg-black border border-white/15 rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] flex flex-col animate-slide-up">
            {/* Header modal */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-white/10">
              <div>
                <h2 className="font-sans font-bold text-lg text-white">
                  Récapitulatif de commande
                </h2>
                <p className="text-xs text-white/50 mt-0.5 font-sans">
                  Vérifiez vos articles avant de confirmer
                </p>
              </div>
              <button
                onClick={() => setShowDevisModal(false)}
                className="p-2 rounded-lg hover:bg-white/10 transition text-white/60 hover:text-white"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            {/* Stepper interne */}
            <div className="flex items-center gap-0 px-6 pt-4 pb-2">
              {[
                { n: 1, label: "Articles" },
                { n: 2, label: "Options" },
              ].map((step, i, arr) => (
                <div key={step.n} className="flex items-center gap-0 flex-1">
                  <div className="flex items-center gap-2">
                    <div
                      className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold border transition-all
                      ${
                        modalStep > step.n
                          ? "bg-white border-white text-black"
                          : modalStep === step.n
                            ? "border-white text-white"
                            : "border-white/20 text-white/40"
                      }`}
                    >
                      {modalStep > step.n ? <Check className="h-3.5 w-3.5" /> : step.n}
                    </div>
                    <span
                      className={`text-xs font-sans font-medium ${modalStep === step.n ? "text-white" : "text-white/40"}`}
                    >
                      {step.label}
                    </span>
                  </div>
                  {i < arr.length - 1 && (
                    <div className="flex-1 h-px bg-white/15 mx-3" />
                  )}
                </div>
              ))}
            </div>

            {/* Contenu scrollable */}
            <div className="overflow-y-auto px-6 pb-6 flex-1">
              {modalStep === 1 && (
                <div className="space-y-4 pt-4">
                  <div className="space-y-2">
                    {cartDetailed.map((item) => {
                      const imageUrl = getProductImageUrl(
                        item.product,
                        item.isBoutique,
                      );
                      return (
                        <div
                          key={item.id}
                          className="flex items-center gap-3 p-3 rounded-xl bg-white/5 border border-white/10"
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
                            <p className="font-medium text-sm text-white line-clamp-1 font-sans">
                              {item.product.name}
                            </p>
                            <p className="text-xs text-white/50 font-sans">
                              Qté : {item.qty}
                            </p>
                          </div>
                          <p className="font-semibold text-sm text-white tabular-nums whitespace-nowrap font-sans">
                            {formatPriceWithDevise(
                              item.subtotal,
                              devisForm.devise,
                            )}
                          </p>
                        </div>
                      );
                    })}
                  </div>

                  <div>
                    <label className="block text-xs font-sans font-medium text-white/50 mb-1.5 uppercase tracking-wider">
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
                            className={`flex items-center gap-2 px-3 py-2.5 rounded-xl border text-sm font-sans font-medium transition-all
                            ${devisForm.devise === d.val ? "border-white bg-white/10 text-white" : "border-white/15 hover:border-white/40 text-white/50"}`}
                          >
                            <span>{d.flag}</span>
                            <span>{d.label}</span>
                          </button>
                        ),
                      )}
                    </div>
                  </div>

                  <div className="flex items-center justify-between p-4 bg-white/5 border border-white/10 rounded-xl">
                    <div className="flex items-center gap-3">
                      <Truck className="h-4 w-4 text-white shrink-0" />
                      <div>
                        <p className="text-sm font-medium text-white font-sans">
                          Livraison à domicile
                        </p>
                        <p className="text-xs text-white/50 font-sans">
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
                      className={`relative w-11 h-6 rounded-full transition-colors shrink-0 ${devisForm.besoinLivraison ? "bg-orange-500" : "bg-white/20"}`}
                    >
                      <span
                        className={`absolute top-0.5 w-5 h-5 rounded-full bg-white transition-transform shadow ${devisForm.besoinLivraison ? "right-0.5" : "left-0.5"}`}
                      />
                    </button>
                  </div>
                </div>
              )}

              {modalStep === 2 && (
                <div className="space-y-5 pt-4">
                  {devisForm.besoinLivraison && (
                    <div>
                      <label className="block text-xs font-sans font-medium text-white/50 mb-2 uppercase tracking-wider">
                        Adresse de livraison
                      </label>
                      {isLoadingAdresses ? (
                        <div className="flex items-center gap-2 text-sm text-white/50 p-3 font-sans">
                          <Loader2 className="h-4 w-4 animate-spin" />{" "}
                          Chargement…
                        </div>
                      ) : adresses.length > 0 ? (
                        <div className="space-y-2 max-h-44 overflow-y-auto">
                          {adresses.map((adr) => (
                            <label
                              key={adr.id}
                              className={`flex items-start gap-3 p-3 border rounded-xl cursor-pointer transition-all
                              ${devisForm.adresseId === adr.id ? "border-white bg-white/10" : "border-white/15 hover:border-white/40"}`}
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
                                className="mt-1 accent-white"
                              />
                              <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-1.5 mb-0.5">
                                  {adr.etiquette === "Maison" && (
                                    <Home className="h-3.5 w-3.5 text-green-400" />
                                  )}
                                  {adr.etiquette === "Appartement" && (
                                    <Building className="h-3.5 w-3.5 text-blue-400" />
                                  )}
                                  {adr.etiquette === "Bureau" && (
                                    <Package className="h-3.5 w-3.5 text-purple-400" />
                                  )}
                                  <p className="font-medium text-sm text-white font-sans">
                                    {adr.nom_complet}
                                  </p>
                                  {adr.par_defaut_expedition && (
                                    <span className="text-[10px] bg-white/15 text-white px-1.5 py-0.5 rounded-full font-sans">
                                      Par défaut
                                    </span>
                                  )}
                                </div>
                                <p className="text-xs text-white/50 font-sans">
                                  {adr.adresse_ligne1}
                                  {adr.adresse_ligne2 &&
                                    `, ${adr.adresse_ligne2}`}
                                </p>
                                <p className="text-xs text-white/50 font-sans">
                                  {adr.code_postal} {adr.ville}, {adr.region}
                                </p>
                              </div>
                            </label>
                          ))}
                        </div>
                      ) : null}

                      <div className="mt-3">
                        <p className="text-xs text-white/50 mb-1.5 font-sans">
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
                          className="w-full px-4 py-2.5 text-sm font-sans text-white bg-white/5 border border-white/15 rounded-xl focus:outline-none focus:border-white/40 resize-none placeholder:text-white/30"
                        />
                      </div>
                    </div>
                  )}

                  <div>
                    <label className="block text-xs font-sans font-medium text-white/50 mb-1.5 uppercase tracking-wider">
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
                      className="w-full px-4 py-2.5 text-sm font-sans text-white bg-white/5 border border-white/15 rounded-xl focus:outline-none focus:border-white/40 resize-none placeholder:text-white/30"
                    />
                  </div>

                  <div className="bg-white/5 border border-white/10 rounded-xl p-4">
                    <div className="flex justify-between text-sm mb-1.5 font-sans">
                      <span className="text-white/50">Sous-total</span>
                      <span className="font-medium text-white">
                        {formatPriceWithDevise(
                          calculateSubtotal(),
                          devisForm.devise,
                        )}
                      </span>
                    </div>
                    {devisForm.besoinLivraison && (
                      <div className="flex justify-between text-sm mb-1.5 font-sans">
                        <span className="text-white/50">Livraison</span>
                        <span className="font-medium text-white">
                          {formatPriceWithDevise(50000, devisForm.devise)}
                        </span>
                      </div>
                    )}
                    <div className="border-t border-white/10 pt-2.5 mt-2 flex justify-between items-center">
                      <span className="font-semibold text-sm text-white font-sans">
                        Total TTC
                      </span>
                      <span className="font-sans font-bold text-xl text-white">
                        {formatPriceWithDevise(
                          getTotalWithLivraison(),
                          devisForm.devise,
                        )}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-start gap-3 p-3 bg-white/5 border border-white/10 rounded-xl">
                    <Phone className="h-4 w-4 text-white shrink-0 mt-0.5" />
                    <p className="text-xs text-white/50 leading-relaxed font-sans">
                      Après confirmation, un responsable vous recontactera sous{" "}
                      <strong className="text-white">24 à 48h</strong> pour
                      valider votre commande. Aucun paiement ne sera demandé
                      avant ce contact.
                    </p>
                  </div>
                </div>
              )}
            </div>

            {/* Footer modal */}
            <div className="flex items-center justify-between gap-3 px-6 py-4 border-t border-white/10">
              <button
                onClick={() => setShowDevisModal(false)}
                className="px-4 py-2 text-sm font-sans text-white/50 hover:text-white transition"
              >
                Annuler
              </button>

              <div className="flex items-center gap-2">
                {modalStep === 2 && (
                  <button
                    onClick={() => setModalStep(1)}
                    className="px-4 py-2 text-sm font-sans border border-white/15 rounded-xl hover:bg-white/5 transition text-white/60"
                  >
                    Retour
                  </button>
                )}

                {modalStep === 1 && (
                  <button
                    onClick={() => setModalStep(2)}
                    className="flex items-center gap-2 px-5 py-2.5 bg-orange-500 hover:bg-orange-600 text-white font-sans font-semibold text-sm rounded-full transition-colors duration-200"
                  >
                    Continuer
                    <ChevronRight className="h-4 w-4" />
                  </button>
                )}

                {modalStep === 2 && (
                  <>
                    <button
                      onClick={handleValidateDevis}
                      disabled={isSubmitting || devisValide}
                      className="flex items-center gap-2 px-5 py-2.5 border border-white/20 text-white font-sans font-semibold text-sm rounded-full hover:bg-white/10 transition-colors duration-200 disabled:opacity-50"
                    >
                      {isSubmitting && !devisValide ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <Check className="h-4 w-4" />
                      )}
                      {devisValide ? "Devis validé ✓" : "Valider le devis"}
                    </button>
                    <button
                      onClick={handleCommander}
                      disabled={isSubmitting || !devisId}
                      className="flex items-center gap-2 px-5 py-2.5 bg-orange-500 hover:bg-orange-600 text-white font-sans font-semibold text-sm rounded-full transition-colors duration-200 disabled:opacity-50"
                    >
                      {isSubmitting ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <ShoppingBag className="h-4 w-4" />
                      )}
                      Confirmer la commande
                    </button>
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
        @keyframes slide-up { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }
        .animate-slide-up { animation: slide-up 0.3s ease-out both; }
        @keyframes heart-orbit { 0%, 100% { opacity: 0.6; transform: translate(-50%,-50%) scale(0.8); } 50% { opacity: 1; transform: translate(-50%,-50%) scale(1.2); } }
        .animate-heart-orbit { animation: heart-orbit 1.5s ease-in-out infinite; }
      `}</style>
    </SiteLayout>
  );
};

export default Cart;