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
  ChevronLeft,
  Clock,
  Phone,
  BadgeCheck,
  Lock,
  MapPin,
  Store,
} from "lucide-react";
import { formatAr } from "@/lib/products";
import { useEffect, useState, useRef } from "react";
import { createPortal } from "react-dom";
import { toast } from "@/hooks/use-toast";
import fosa from "@/assets/8.png";
import { useCartApi } from "@/hooks/useCartApi";
import api from "@/service/api";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";

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

type CheckoutStep = "panier" | "adresse" | "reglement";
type DeliveryMode = "livraison" | "retrait";

type NewAddressForm = {
  etiquette: string;
  nom: string;
  prenom: string;
  nom_complet: string;
  telephone: string;
  adresse_ligne1: string;
  ville: string;
  region: string;
  code_postal: string;
};

const EMPTY_ADDRESS_FORM: NewAddressForm = {
  etiquette: "Maison",
  nom: "",
  prenom: "",
  nom_complet: "",
  telephone: "",
  adresse_ligne1: "",
  ville: "",
  region: "",
  code_postal: "",
};

const ModalPortal = ({ children, onClose }: { children: React.ReactNode; onClose: () => void }) => {
  useEffect(() => {
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, []);

  return createPortal(
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4" style={{ margin: 0 }}>
      <div className="absolute inset-0 bg-black/65 backdrop-blur-sm" onClick={onClose} />
      <div className="relative z-10 w-full flex items-center justify-center">{children}</div>
    </div>,
    document.body,
  );
};

const ModalPanel = ({ children }: { children: React.ReactNode }) => (
  <div className="bg-white border border-slate-200 rounded-2xl shadow-2xl w-full max-w-2xl overflow-hidden">
    {children}
  </div>
);

const ModalHeader = ({ title, subtitle, onClose }: { title: string; subtitle?: string; onClose: () => void }) => (
  <div className="flex items-center justify-between gap-4 px-6 py-4 border-b border-slate-200 bg-white">
    <div>
      <p className="text-xs font-sans uppercase tracking-wider text-slate-500 mb-1">
        {title}
      </p>
      {subtitle && <p className="text-sm text-slate-600">{subtitle}</p>}
    </div>
    <button
      onClick={onClose}
      className="p-2 rounded-full text-slate-500 hover:text-slate-900 hover:bg-slate-100 transition"
      aria-label="Fermer le modal"
    >
      <X className="h-5 w-5" />
    </button>
  </div>
);

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
  const { isAuthenticated } = useAuth();
  const [showHeartAnimation, setShowHeartAnimation] = useState(false);
  const [lastAddedProduct, setLastAddedProduct] = useState<string | null>(null);
  const previousCartCountRef = useRef(0);
  const navigate = useNavigate();

  // Étape de commande : panier -> adresse -> reglement
  const [checkoutStep, setCheckoutStep] = useState<CheckoutStep>("panier");
  const [deliveryMode, setDeliveryMode] = useState<DeliveryMode>("livraison");

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

  // Formulaire d'ajout d'adresse
  const [addAddressMode, setAddAddressMode] = useState<
    "none" | "defaut" | "optionnelle"
  >("none");
  const [newAddressForm, setNewAddressForm] =
    useState<NewAddressForm>(EMPTY_ADDRESS_FORM);
  const [isSavingAddress, setIsSavingAddress] = useState(false);

  // pageStep pour le stepper visuel (haut de page)
  const pageStep: 1 | 2 | 3 =
    checkoutStep === "panier" ? 1 : checkoutStep === "adresse" ? 2 : 3;

  const pageTitle =
    checkoutStep === "panier"
      ? "TON PANIER"
      : checkoutStep === "adresse"
        ? "TON ADRESSE"
        : "REGLEMENT";

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

  const getLivraisonAmount = () =>
    deliveryMode === "livraison" ? 50000 : 0;

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

  // ── Étape 1 → 2 : passer au choix de l'adresse ────────────────────────────

  const handleGoToAddress = async () => {
    if (cartDetailed.length === 0) {
      toast({
        title: "Panier vide",
        description: "Ajoutez des produits avant de passer commande.",
        variant: "destructive",
      });
      return;
    }
    setDevisId(null);
    setDevisValide(false);
    setCheckoutStep("adresse");
    setDeliveryMode("livraison");
    setDevisForm((prev) => ({ ...prev, besoinLivraison: true }));
    await fetchAdresses();
  };

  const handleSelectDeliveryMode = (mode: DeliveryMode) => {
    setDeliveryMode(mode);
    setAddAddressMode("none");
    setDevisForm((prev) => ({
      ...prev,
      besoinLivraison: mode === "livraison",
    }));
  };

  const handleOpenAddAddress = (mode: "defaut" | "optionnelle") => {
    setAddAddressMode(mode);
    setNewAddressForm(EMPTY_ADDRESS_FORM);
  };

  const handleSaveNewAddress = async () => {
    const fullName = `${newAddressForm.prenom} ${newAddressForm.nom}`.trim();
    if (
      !fullName ||
      !newAddressForm.telephone ||
      !newAddressForm.adresse_ligne1 ||
      !newAddressForm.ville ||
      !newAddressForm.code_postal
    ) {
      toast({
        title: "Champs manquants",
        description: "Merci de remplir tous les champs obligatoires.",
        variant: "destructive",
      });
      return;
    }
    try {
      setIsSavingAddress(true);
      const payload = {
        etiquette: newAddressForm.etiquette,
        nom_complet: fullName,
        telephone: newAddressForm.telephone,
        adresse_ligne1: newAddressForm.adresse_ligne1,
        ville: newAddressForm.ville,
        region: newAddressForm.region,
        code_postal: newAddressForm.code_postal,
        pays: "Madagascar",
        par_defaut_expedition: addAddressMode === "defaut",
      };
      const response = await api.post("/adresses", payload);
      const created: Adresse = response.data.data || response.data;
      setAdresses((prev) => [...prev, created]);
      setDevisForm((prev) => ({ ...prev, adresseId: created.id }));
      setAddAddressMode("none");
      toast({
        title: "Adresse ajoutée",
        description: "Votre nouvelle adresse a été enregistrée.",
      });
    } catch (error: any) {
      console.error('Erreur POST /adresses', error);
      toast({
        title: "Erreur",
        description:
          error.response?.data?.message || "Impossible d'ajouter l'adresse.",
        variant: "destructive",
      });
    } finally {
      setIsSavingAddress(false);
    }
  };

  const ensureAuthenticatedOrRedirect = () => {
    if (!isAuthenticated) {
      toast({
        title: "Connexion requise",
        description: "Vous devez être connecté pour enregistrer une adresse.",
        variant: "destructive",
      });
      navigate('/login');
      return false;
    }
    return true;
  };

  // ── Étape 2 → 3 : passer au règlement ──────────────────────────────────────

  const handleContinueToReglement = () => {
    if (
      deliveryMode === "livraison" &&
      devisForm.adresseId === 0 &&
      !devisForm.adressePersonnalisee
    ) {
      toast({
        title: "Adresse requise",
        description: "Sélectionnez ou ajoutez une adresse de livraison.",
        variant: "destructive",
      });
      return;
    }
    setCheckoutStep("reglement");
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
          deliveryMode === "livraison" && devisForm.adresseId > 0
            ? devisForm.adresseId
            : null,
        adresse_facturation_id: null,
        devis_id: devisId,
        meta_json: {
          note: devisForm.note || null,
          date_creation: new Date().toISOString(),
          besoin_livraison: deliveryMode === "livraison",
          point_de_retrait: deliveryMode === "retrait",
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
        setCheckoutStep("panier");
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

  if (cartDetailed.length === 0 && checkoutStep === "panier") {
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

  // ── Sidebar récapitulatif réutilisable ──────────────────────────────────────

  const RecapSidebar = ({
    ctaLabel,
    onCta,
    ctaDisabled,
    ctaLoading,
    showLivraisonLine,
    secondaryCta,
  }: {
    ctaLabel?: string;
    onCta?: () => void;
    ctaDisabled?: boolean;
    ctaLoading?: boolean;
    showLivraisonLine?: boolean;
    secondaryCta?: { label: string; onClick: () => void };
  }) => (
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
              {formatPriceWithDevise(calculateSubtotal(), devisForm.devise)}
            </span>
          </div>
          {showLivraisonLine && deliveryMode === "livraison" && (
            <div className="flex items-center justify-between">
              <span className="text-black/50 text-sm font-sans">
                Livraison
              </span>
              <span className="tabular-nums text-sm font-semibold font-sans text-black">
                {formatPriceWithDevise(50000, devisForm.devise)}
              </span>
            </div>
          )}
          <div className="border-t border-black/10 pt-3 mt-2 flex items-end justify-between">
            <span className="font-semibold text-sm font-sans text-black">
              Estimé TTC
            </span>
            <span className="font-sans font-bold text-xl text-black">
              {formatPriceWithDevise(
                showLivraisonLine
                  ? getTotalWithLivraison()
                  : calculateSubtotal(),
                devisForm.devise,
              )}
            </span>
          </div>
        </div>
        {secondaryCta && (
          <button
            onClick={secondaryCta.onClick}
            className="w-full py-3 border-t border-black/10 text-black/60 hover:text-black font-sans font-semibold text-sm tracking-wide transition-colors duration-200 flex items-center justify-center gap-2"
          >
            <ChevronLeft className="h-4 w-4" />
            {secondaryCta.label}
          </button>
        )}
        <button
          onClick={onCta}
          disabled={ctaDisabled}
          className="w-full py-4 bg-orange-500 hover:bg-orange-600 disabled:opacity-50 disabled:cursor-not-allowed text-white font-sans font-bold text-sm tracking-wide transition-colors duration-200 flex items-center justify-center gap-2"
        >
          {ctaLoading ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <>
              {ctaLabel}
              <ChevronRight className="h-4 w-4" />
            </>
          )}
        </button>
      </div>

      {checkoutStep === "panier" && (
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
      )}
    </aside>
  );

  // ── Vue principale ──────────────────────────────────────────────────────────

  return (
    <SiteLayout>
      <section className="bg-black py-12">
        <div className="container-x">
          {/* Header + Stepper */}
          <div className="mb-10 text-center">
            <h1 className="font-sans text-2xl md:text-3xl font-extrabold tracking-widest text-white mb-1">
              {pageTitle}
            </h1>
            <div className="w-24 h-[3px] bg-white mx-auto mb-1" />
            <div className="w-24 h-px bg-white/30 mx-auto border-t border-dashed" />

            <div className="max-w-2xl mx-auto mt-8 border border-white/15 rounded-2xl px-8 py-6">
              <div className="flex items-center">
                <StepDot label="PANIER" active={pageStep === 1} done={pageStep > 1} />
                <div className="flex-1 h-px bg-white/20 mx-3 -mt-5" />
                <StepDot label="ADRESSE" active={pageStep === 2} done={pageStep > 2} />
                <div className="flex-1 h-px bg-white/20 mx-3 -mt-5" />
                <StepDot label="REGLEMENT" active={pageStep === 3} done={false} />
              </div>
            </div>
          </div>

          {/* ── ÉTAPE PANIER ─────────────────────────────────────────────────── */}
          {checkoutStep === "panier" && (
            <div className="grid lg:grid-cols-12 gap-8">
              <div className="lg:col-span-8">
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

              <RecapSidebar
                ctaLabel="Je valide ma commande"
                onCta={handleGoToAddress}
              />
            </div>
          )}

          {/* ── ÉTAPE ADRESSE ────────────────────────────────────────────────── */}
          {checkoutStep === "adresse" && (
            <div className="grid lg:grid-cols-12 gap-8">
              <div className="lg:col-span-8 space-y-6">
                {/* Tabs livraison / retrait */}
                <div className="flex flex-wrap gap-3 border-b border-white/10 pb-5">
                  <button
                    onClick={() => handleSelectDeliveryMode("livraison")}
                    className={`flex items-center gap-2 px-4 py-2.5 rounded-full border text-sm font-sans font-semibold transition-all
                    ${
                      deliveryMode === "livraison"
                        ? "bg-white border-white text-black"
                        : "border-white/20 text-white/60 hover:border-white/40"
                    }`}
                  >
                    <Home className="h-4 w-4" />
                    Adresse de livraison
                  </button>
                  <button
                    onClick={() => handleSelectDeliveryMode("retrait")}
                    className={`flex items-center gap-2 px-4 py-2.5 rounded-full border text-sm font-sans font-semibold transition-all
                    ${
                      deliveryMode === "retrait"
                        ? "bg-white border-white text-black"
                        : "border-white/20 text-white/60 hover:border-white/40"
                    }`}
                  >
                    <Store className="h-4 w-4" />
                    Point de retrait
                  </button>
                </div>

                {deliveryMode === "livraison" ? (
                  <>
                    <div className="space-y-6">
                    <p className="font-sans font-semibold text-sm text-white/70 italic">
                      Adresse de livraison :
                    </p>

                    {/* Adresse par défaut */}
                    <div>
                      <p className="text-xs font-sans italic text-white/40 mb-2">
                        Par défaut
                      </p>

                      {isLoadingAdresses ? (
                        <div className="flex items-center gap-2 text-sm text-white/50 p-3 font-sans">
                          <Loader2 className="h-4 w-4 animate-spin" />
                          Chargement…
                        </div>
                      ) : (
                        <div className="space-y-2">
                          {adresses
                            .filter((a) => a.par_defaut_expedition)
                            .map((adr) => (
                              <AddressCard
                                key={adr.id}
                                adr={adr}
                                selected={devisForm.adresseId === adr.id}
                                onSelect={() =>
                                  setDevisForm((prev) => ({
                                    ...prev,
                                    adresseId: adr.id,
                                    adressePersonnalisee: "",
                                  }))
                                }
                              />
                            ))}
                        </div>
                      )}

                      {addAddressMode !== "defaut" && (
                        <button
                          onClick={() => handleOpenAddAddress("defaut")}
                          className="mt-3 inline-flex items-center gap-2 px-4 py-2.5 rounded-full border border-white/20 text-white/70 hover:border-white/50 hover:text-white text-sm font-sans font-semibold transition-all"
                        >
                          <Plus className="h-4 w-4" />
                          Ajouter une adresse
                        </button>
                      )}

                    </div>

                    {/* Adresse optionnelle */}
                    <div>
                      <p className="text-xs font-sans italic text-white/40 mb-2">
                        Optionnelle
                      </p>

                      {adresses
                        .filter((a) => !a.par_defaut_expedition)
                        .length > 0 && (
                        <div className="space-y-2 mb-3">
                          {adresses
                            .filter((a) => !a.par_defaut_expedition)
                            .map((adr) => (
                              <AddressCard
                                key={adr.id}
                                adr={adr}
                                selected={devisForm.adresseId === adr.id}
                                onSelect={() =>
                                  setDevisForm((prev) => ({
                                    ...prev,
                                    adresseId: adr.id,
                                    adressePersonnalisee: "",
                                  }))
                                }
                              />
                            ))}
                        </div>
                      )}

                      {addAddressMode !== "optionnelle" && (
                        <button
                          onClick={() => handleOpenAddAddress("optionnelle")}
                          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-full border border-white/20 text-white/70 hover:border-white/50 hover:text-white text-sm font-sans font-semibold transition-all"
                        >
                          <Plus className="h-4 w-4" />
                          Ajouter une nouvelle adresse
                        </button>
                      )}

                    </div>
                  </div>
                    {addAddressMode !== "none" && (
                      <ModalPortal onClose={() => setAddAddressMode("none")}>
                        <ModalPanel>
                          <ModalHeader
                            title={addAddressMode === "defaut" ? "Adresse par défaut" : "Adresse optionnelle"}
                            subtitle="Ajoutez une adresse pour la livraison."
                            onClose={() => setAddAddressMode("none")}
                          />
                          <div className="px-6 py-5 space-y-4">
                            <p className="text-sm text-white/70">
                              Remplissez les informations pour enregistrer une nouvelle adresse dans votre compte.
                            </p>
                            <AddAddressForm
                              form={newAddressForm}
                              setForm={setNewAddressForm}
                              onCancel={() => setAddAddressMode("none")}
                              onSave={handleSaveNewAddress}
                              isSaving={isSavingAddress}
                            />
                          </div>
                        </ModalPanel>
                      </ModalPortal>
                    )}
                  </>
                ) : (
                  <div className="border border-white/10 rounded-xl p-6 bg-white/5">
                    <div className="flex items-start gap-3">
                      <MapPin className="h-5 w-5 text-orange-400 shrink-0 mt-0.5" />
                      <div>
                        <p className="font-sans font-semibold text-white text-sm mb-1">
                          Retrait au showroom Antananarivo
                        </p>
                        <p className="text-xs text-white/50 font-sans leading-relaxed">
                          Aucune adresse n'est nécessaire. Votre commande
                          sera disponible en showroom après validation par
                          un conseiller.
                        </p>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              <RecapSidebar
                ctaLabel="Je continue"
                onCta={handleContinueToReglement}
                showLivraisonLine
                secondaryCta={{
                  label: "Retour au panier",
                  onClick: () => setCheckoutStep("panier"),
                }}
              />
            </div>
          )}

          {/* ── ÉTAPE REGLEMENT ──────────────────────────────────────────────── */}
          {checkoutStep === "reglement" && (
            <div className="grid lg:grid-cols-12 gap-8">
              <div className="lg:col-span-8 space-y-8">
                <div className="rounded-[32px] border border-white/10 bg-gradient-to-br from-slate-950/95 via-slate-900/90 to-slate-950/95 p-8 shadow-[0_40px_80px_rgba(0,0,0,0.45)] relative overflow-hidden">
                  <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,_rgba(255,255,255,0.12),_transparent_35%)] pointer-events-none" />
                  <div className="relative grid gap-8 lg:grid-cols-[1.6fr_1fr] items-center">
                    <div>
                      <p className="text-[11px] uppercase tracking-[0.35em] text-orange-300 mb-3">
                        REGLEMENT
                      </p>
                      <h2 className="text-3xl md:text-4xl font-extrabold text-white leading-tight">
                        GG pour ta commande !
                      </h2>
                      <p className="mt-4 text-sm leading-7 text-slate-300 max-w-xl">
                        Notre équipe vérifie tout ça et te contactera sous 24h ouvré pour la suite. Tu pourras payer soit par virement bancaire, par mobile money (MVola ou Orange Money) ou même par espèces.
                      </p>
                      <button
                        onClick={handleValidateDevis}
                        disabled={isSubmitting || devisValide}
                        className="mt-8 inline-flex items-center justify-center gap-2 rounded-full bg-orange-500 px-7 py-3 text-sm font-semibold text-white shadow-lg shadow-orange-500/20 hover:bg-orange-600 transition disabled:opacity-50"
                      >
                        {isSubmitting && !devisValide ? (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                          "J'accepte les conditions"
                        )}
                      </button>
                    </div>
                    <div className="rounded-[28px] border border-white/10 bg-slate-950/90 p-4 flex items-center justify-center">
                      <img
                        src={fosa}
                        alt="Mascotte"
                        className="h-44 w-44 rounded-3xl object-cover"
                        onError={(e) => {
                          (e.target as HTMLImageElement).src = fosa;
                        }}
                      />
                    </div>
                  </div>
                </div>

                <div className="grid gap-4">
                  <InfoBox
                    title="COMMENT SE DEROULE LE REGLEMENT ?"
                    description="Une fois que notre équipe aura vérifié les délais d’approvisionnement et les tarifs, nous t’enverrons une confirmation de commande avec le récapitulatif. Tu seras rappelé pour finaliser le règlement. Tu pourras payer soit par virement bancaire, par mobile money (MVola ou Orange Money) ou même par espèces."
                  />
                  <InfoBox
                    title="COMMENT JE PEUX CHANGER MON ADRESSE ?"
                    description="Tu peux modifier ton adresse à tout moment depuis ton espace, dans la section Mes adresses."
                  />
                  <InfoBox
                    title="QUAND EST-CE QUE MA COMMANDE ARRIVERA ?"
                    description="Après validation du devis, nous te confirmerons le délai de livraison et les conditions de retrait."
                  />
                </div>
              </div>

              <RecapSidebar
                ctaLabel="Confirmer la commande"
                onCta={handleCommander}
                ctaDisabled={isSubmitting || !devisId}
                ctaLoading={isSubmitting}
                showLivraisonLine
                secondaryCta={{
                  label: "Retour à l'adresse",
                  onClick: () => setCheckoutStep("adresse"),
                }}
              />
            </div>
          )}

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

// ─── Carte d'adresse sélectionnable ────────────────────────────────────────

const AddressCard = ({
  adr,
  selected,
  onSelect,
}: {
  adr: Adresse;
  selected: boolean;
  onSelect: () => void;
}) => (
  <label
    className={`flex items-start gap-3 p-3 border rounded-xl cursor-pointer transition-all
    ${selected ? "border-white bg-white/10" : "border-white/15 hover:border-white/40"}`}
  >
    <input
      type="radio"
      name="adresse"
      checked={selected}
      onChange={onSelect}
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
        {adr.adresse_ligne2 && `, ${adr.adresse_ligne2}`}
      </p>
      <p className="text-xs text-white/50 font-sans">
        {adr.code_postal} {adr.ville}, {adr.region}
      </p>
    </div>
  </label>
);

// ─── Formulaire d'ajout d'adresse ──────────────────────────────────────────

const AddAddressForm = ({
  form,
  setForm,
  onCancel,
  onSave,
  isSaving,
}: {
  form: NewAddressForm;
  setForm: React.Dispatch<React.SetStateAction<NewAddressForm>>;
  onCancel: () => void;
  onSave: () => void;
  isSaving: boolean;
}) => (
  <div className="mt-3 p-6 border border-slate-200 rounded-3xl bg-white shadow-sm space-y-4">
    <div className="grid grid-cols-2 gap-4">
      <div className="space-y-2">
        <label className="block text-xs font-semibold text-slate-700">Nom</label>
        <input
          value={form.nom}
          onChange={(e) =>
            setForm((prev) => ({ ...prev, nom: e.target.value }))
          }
          placeholder="Obligatoire"
          className="w-full px-4 py-3 text-sm font-sans text-slate-900 bg-white border border-slate-200 rounded-2xl focus:outline-none focus:border-slate-400 placeholder:text-slate-400"
        />
      </div>
      <div className="space-y-2">
        <label className="block text-xs font-semibold text-slate-700">Prénom</label>
        <input
          value={form.prenom}
          onChange={(e) =>
            setForm((prev) => ({ ...prev, prenom: e.target.value }))
          }
          placeholder="Obligatoire"
          className="w-full px-4 py-3 text-sm font-sans text-slate-900 bg-white border border-slate-200 rounded-2xl focus:outline-none focus:border-slate-400 placeholder:text-slate-400"
        />
      </div>
    </div>
    <div className="space-y-2">
      <label className="block text-xs font-semibold text-slate-700">Téléphone</label>
      <input
        value={form.telephone}
        onChange={(e) =>
          setForm((prev) => ({ ...prev, telephone: e.target.value }))
        }
        placeholder="Obligatoire"
        className="w-full px-4 py-3 text-sm font-sans text-slate-900 bg-white border border-slate-200 rounded-2xl focus:outline-none focus:border-slate-400 placeholder:text-slate-400"
      />
    </div>
    <div className="space-y-2">
      <label className="block text-xs font-semibold text-slate-700">Adresse</label>
      <input
        value={form.adresse_ligne1}
        onChange={(e) =>
          setForm((prev) => ({ ...prev, adresse_ligne1: e.target.value }))
        }
        placeholder="Obligatoire"
        className="w-full px-4 py-3 text-sm font-sans text-slate-900 bg-white border border-slate-200 rounded-2xl focus:outline-none focus:border-slate-400 placeholder:text-slate-400"
      />
    </div>
    <div className="grid grid-cols-2 gap-4">
      <div className="space-y-2">
        <label className="block text-xs font-semibold text-slate-700">Ville</label>
        <input
          value={form.ville}
          onChange={(e) =>
            setForm((prev) => ({ ...prev, ville: e.target.value }))
          }
          placeholder="Obligatoire"
          className="w-full px-4 py-3 text-sm font-sans text-slate-900 bg-white border border-slate-200 rounded-2xl focus:outline-none focus:border-slate-400 placeholder:text-slate-400"
        />
      </div>
      <div className="space-y-2">
        <label className="block text-xs font-semibold text-slate-700">Code Postal</label>
        <input
          value={form.code_postal}
          onChange={(e) =>
            setForm((prev) => ({ ...prev, code_postal: e.target.value }))
          }
          placeholder="Obligatoire"
          className="w-full px-4 py-3 text-sm font-sans text-slate-900 bg-white border border-slate-200 rounded-2xl focus:outline-none focus:border-slate-400 placeholder:text-slate-400"
        />
      </div>
    </div>
    <div className="flex items-center justify-end gap-3 pt-2">
      <button
        onClick={onCancel}
        className="px-5 py-3 rounded-full bg-slate-950 text-white text-xs font-semibold uppercase tracking-[0.08em] hover:bg-slate-900 transition"
      >
        J'annule
      </button>
      <button
        onClick={onSave}
        disabled={isSaving}
        className="px-5 py-3 rounded-full bg-orange-600 text-white text-xs font-semibold uppercase tracking-[0.08em] hover:bg-orange-700 disabled:opacity-50 transition"
      >
        {isSaving ? (
          <Loader2 className="h-4 w-4 animate-spin" />
        ) : (
          "J'enregistre"
        )}
      </button>
    </div>
  </div>
);

const InfoBox = ({
  title,
  description,
}: {
  title: string;
  description: string;
}) => (
  <div className="rounded-3xl border border-white/10 bg-white/5 p-6">
    <h3 className="text-sm font-bold text-white tracking-[0.15em] uppercase mb-3">
      {title}
    </h3>
    <p className="text-sm text-slate-300 leading-7 font-sans">
      {description}
    </p>
  </div>
);

export default Cart;