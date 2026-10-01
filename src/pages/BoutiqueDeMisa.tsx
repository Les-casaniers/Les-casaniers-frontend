// export default BoutiqueDeMisa;

import { SiteLayout } from "@/components/site/SiteLayout";
import { formatAr } from "@/lib/products";
import { useEffect, useMemo, useState } from "react";
import { Heart, ShoppingBag } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "@/hooks/use-toast";
import { useBoutiqueMisa } from "@/hooks/useBoutiqueMisa";
import { useAuth } from "@/contexts/AuthContext";
import { useCartApi } from "@/hooks/useCartApi";
import baobab from "@/assets/baobab.png";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export type MerchTag = string;

export interface MerchProduct {
  id: number;
  reference: string;
  nom: string;
  categorie: string;
  type: "textiles" | "accessoires" | "vetement" | "papeterie" | "accessoire" | "limited";
  description_courte: string;
  description: string;
  prix: number;
  stock: number;
  image_url: string | null;
}

// Helper pour l'URL des images
const getFullImageUrl = (imageUrl: string | null | undefined): string => {
  if (!imageUrl) {
    return "";
  }

  if (imageUrl.startsWith("http://") || imageUrl.startsWith("https://") || imageUrl.startsWith("data:")) {
    return imageUrl;
  }

  const baseUrl = import.meta.env.VITE_APP_URL || "http://localhost:8000";
  return `${baseUrl}${imageUrl.startsWith("/") ? "" : "/"}${imageUrl}`;
};

// ---------------------------------------------------------------------------
// Composant principal
// ---------------------------------------------------------------------------

const BoutiqueDeMisa = () => {
  const [favorites, setFavorites] = useState<number[]>([]);

  // ✅ Hooks d'authentification et panier
  const { isAuthenticated } = useAuth();
  const { addToCart, refreshCart } = useCartApi();

  // 🔥 Récupération des données réelles depuis la base de données
  const { data: apiData, isLoading, error } = useBoutiqueMisa({ per_page: 100 });

  // Produits récupérés depuis la base de données (TOUS les produits)
  const products: MerchProduct[] = useMemo(() => {
    const raw: any[] = Array.isArray(apiData)
      ? apiData
      : Array.isArray(apiData?.data)
      ? apiData.data
      : Array.isArray(apiData?.data?.data)
      ? apiData.data.data
      : Array.isArray(apiData?.products)
      ? apiData.products
      : [];

    if (!raw.length) return [];

    return raw.map((item: any) => {
      const nomLower = (item.nom || "").toLowerCase();
      const descLower = (item.description || "").toLowerCase();

      const isTextile =
        nomLower.includes("t-shirt") ||
        nomLower.includes("hoodie") ||
        nomLower.includes("sweat") ||
        nomLower.includes("chemise") ||
        nomLower.includes("tote") ||
        nomLower.includes("casquette") ||
        nomLower.includes("textile") ||
        descLower.includes("coton");

      return {
        id: item.id,
        reference: `FOSA-${String(item.id).padStart(3, "0")}`,
        nom: item.nom,
        categorie: isTextile ? "TEXTILES" : "ACCESSOIRES",
        type: isTextile ? "textiles" : "accessoires",
        description_courte: item.description ? item.description.substring(0, 120) : "",
        description: item.description || "",
        prix: parseFloat(item.prix) || 0,
        stock: item.stock || 0,
        image_url: item.image_url || null,
      };
    });
  }, [apiData]);

  const bannerImage = useMemo(() => {
    if (apiData?.banner_url) return getFullImageUrl(apiData.banner_url);
    if (apiData?.banniere) return getFullImageUrl(apiData.banniere);
    return baobab || "/assets/baobab.png";
  }, [apiData]);

  useEffect(() => {
    document.title = "Boutique de Misa — Les Casaniers Madagascar";
  }, []);

  const [backendStatus, setBackendStatus] = useState<"checking" | "up" | "down">("checking");

  useEffect(() => {
    let cancelled = false;
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 4000);
    const baseUrl = import.meta.env.VITE_APP_URL || "http://localhost:8000";

    fetch(baseUrl, { method: "GET", mode: "no-cors", cache: "no-store", signal: controller.signal })
      .then(() => {
        if (!cancelled) setBackendStatus("up");
      })
      .catch(() => {
        if (!cancelled) setBackendStatus("down");
      })
      .finally(() => clearTimeout(timeout));

    return () => {
      cancelled = true;
      clearTimeout(timeout);
      controller.abort();
    };
  }, []);

  useEffect(() => {
    console.warn("[BoutiqueDeMisa] diagnostic →", {
      backendStatus,
      isLoading,
      error,
      apiData,
      nbProduitsAffiches: products.length,
      baseUrl: import.meta.env.VITE_APP_URL || "http://localhost:8000",
    });
  }, [backendStatus, isLoading, error, apiData, products.length]);

  const toggleFavorite = (id: number, e?: React.MouseEvent) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }
    const isFav = favorites.includes(id);
    if (isFav) {
      setFavorites(favorites.filter((f) => f !== id));
      toast({ title: "Retiré des favoris" });
    } else {
      setFavorites([...favorites, id]);
      toast({ title: "Ajouté aux favoris", description: "Produit Misa sauvegardé" });
    }
  };

  const handleAddToCart = async (product: MerchProduct) => {
    if (!isAuthenticated) {
      toast({
        title: "🔒 Connexion requise",
        description: "Veuillez vous connecter pour ajouter au panier.",
        variant: "destructive",
      });
      return;
    }

    if (product.stock <= 0) {
      toast({
        title: "❌ Rupture de stock",
        description: `${product.nom} n'est plus disponible.`,
        variant: "destructive",
      });
      return;
    }

    const success = await addToCart({
      boutique_id: product.id,
      quantite: 1,
      titre: product.nom,
      prix_unitaire: product.prix,
    });

    if (success) {
      await refreshCart();
      toast({ title: "Ajouté au panier", description: `${product.nom} ajouté !` });
    }
  };

  return (
    <SiteLayout>
      <style>{`
        @keyframes misaPageIn {
          from { opacity: 0; transform: translateY(24px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        .misa-page > *,
        .misa-page section > * {
          animation: misaPageIn 0.7s ease-out backwards;
        }
        .misa-page > *:nth-child(1) { animation-delay: 0.05s; }
        .misa-page > *:nth-child(2) { animation-delay: 0.2s; }
        .misa-page > *:nth-child(3) { animation-delay: 0.35s; }
        .misa-page section > *:nth-child(2) { animation-delay: 0.15s; }
        @media (prefers-reduced-motion: reduce) {
          .misa-page > *,
          .misa-page section > * { animation: none; }
        }
      `}</style>
      <div className="misa-page w-full max-w-[1780px] mx-auto px-4 sm:px-6 lg:px-8 py-6 flex flex-col gap-6 lg:gap-8">
        {/* Bannière */}
        <div className="relative w-full rounded-[15px] overflow-hidden min-h-[120px] sm:min-h-[140px] md:min-h-[160px] bg-[#221008] border border-white/10 flex items-center shadow-2xl">
          {bannerImage && (
            <div
              className="absolute inset-0 bg-cover bg-center opacity-85 transition-transform duration-700 hover:scale-105"
              style={{ backgroundImage: `url('${bannerImage}')` }}
            />
          )}
          <div className="absolute inset-0 bg-black/45" />

          <div className="relative z-10 pl-4 sm:pl-6 md:pl-8 pr-4 sm:pr-6 md:pr-8 py-5 sm:py-6 text-left flex flex-col items-start justify-center">
            <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-[46px] font-bold !text-white tracking-wide leading-tight mb-2 drop-shadow-md text-left">
              Bienvenue dans la boutique de Misa !
            </h1>
            <p className="text-xs sm:text-sm md:text-base lg:text-[20px] !text-white/95 italic font-normal tracking-wide drop-shadow text-left">
              “ Chaque achat que tu fais ici permettra de financer une action de reboisement ”
            </p>
          </div>
        </div>

        {/* Texte de présentation */}
        <div className="space-y-2 pt-1 text-black dark:text-white text-left">
          <h2 className="text-sm sm:text-base font-bold tracking-normal text-black dark:text-white">
            Mbola tsara, cher compatriote !
          </h2>
          <div className="text-[clamp(10px,1.05vw,14px)] leading-relaxed text-black/90 dark:text-white/95 italic space-y-1.5 w-full overflow-x-auto scrollbar-none">
            <p className="whitespace-nowrap">
              Je m'appelle Misa. Mon habitat naturel recule chaque année. En tant que fossa — le plus grand félin de Madagascar — je veux aider à protéger ce milieu et ceux qui y vivent.
            </p>
            <p className="whitespace-nowrap">
              C'est là que j'ai besoin de toi : lorsque tu achètes un goodie dans ma boutique, <strong>Les Casaniers reverse 60% des bénéfices aux actions de reboisement à Madagascar</strong>.
            </p>
            <p className="whitespace-nowrap">
              Alors, si quelque chose te plaît, fais-toi plaisir : tu soutiendras aussi une forêt qui a besoin de nous. Merci, ou comme on dit chez nous : <span className="text-black dark:text-white font-bold not-italic">misaotra !</span>
            </p>
          </div>
        </div>

        {error || (backendStatus === "down" && !apiData && products.length === 0) ? (
          <div className="w-full py-20 px-6 text-center border border-red-500/30 rounded-[15px] bg-red-500/[0.04] shadow-xl flex flex-col items-center justify-center">
            <div className="w-16 h-16 rounded-full bg-red-500/10 border border-red-500/30 flex items-center justify-center mb-4">
              <ShoppingBag className="w-7 h-7 text-red-400 stroke-[1.5]" />
            </div>
            <p className="text-red-400 font-bold text-base sm:text-lg mb-2">
              Impossible de charger les produits
            </p>
            <p className="text-black/70 dark:text-white/70 text-sm mb-5 max-w-md">
              Le serveur ne répond pas. Vérifiez que le backend est démarré, puis réessayez.
            </p>
            <Button className="bg-[#F2551A] hover:bg-[#d94812] text-white" onClick={() => window.location.reload()}>
              Réessayer
            </Button>
          </div>
        ) : (isLoading || (backendStatus === "checking" && !apiData)) && products.length === 0 ? (
          <div
            className="w-full min-h-[280px] flex items-center justify-center"
            aria-busy="true"
            aria-label="Boutique de Misa"
          >
            <style>{`
              @keyframes misaLetterIn {
                0%   { opacity: 0; transform: translateY(14px); }
                100% { opacity: 1; transform: translateY(0); }
              }
              @keyframes misaGlow {
                0%, 100% { opacity: 1; }
                50%      { opacity: 0.55; }
              }
            `}</style>
            <h2
              className="flex flex-wrap justify-center !text-black dark:!text-white font-bold tracking-wider text-2xl sm:text-3xl md:text-4xl select-none"
              style={{ animation: "misaGlow 2s ease-in-out 1.6s infinite" }}
            >
              {"Boutique de Misa".split("").map((ch, i) => (
                <span
                  key={i}
                  className="!text-black dark:!text-white"
                  style={{
                    display: "inline-block",
                    opacity: 0,
                    animation: `misaLetterIn 0.5s ease-out ${i * 0.08}s forwards`,
                  }}
                >
                  {ch === " " ? "\u00A0" : ch}
                </span>
              ))}
            </h2>
          </div>
        ) : products.length === 0 ? (
          <div className="w-full py-20 px-6 text-center border border-white/10 rounded-[15px] bg-white/[0.02] shadow-xl flex flex-col items-center justify-center">
            <div className="w-16 h-16 rounded-full bg-white/5 border border-white/10 flex items-center justify-center mb-4">
              <ShoppingBag className="w-7 h-7 text-stone-400 stroke-[1.5]" />
            </div>
            <p className="text-black dark:text-white font-bold text-base sm:text-lg">
              Aucun produit pour le moment
            </p>
          </div>
        ) : (
          <section className="pt-2 pb-10">
            {/* DESIGN : Grille de catégories style capture d'écran */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 lg:gap-6">
              {/* Catégorie TEXTILES — affichée uniquement s'il y a des produits textiles */}
              {products.filter(p => p.type === "textiles").length > 0 && (
                <div className="relative rounded-[15px] overflow-hidden bg-black/40 border border-white/10 shadow-lg group">
                  <img
                    src={getFullImageUrl(products.find(p => p.type === "textiles")?.image_url || "")}
                    alt="Textiles"
                    className="w-full h-full object-cover opacity-80 group-hover:scale-105 transition-transform duration-700 border border-white/15"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
                  <div className="absolute bottom-5 left-1/2 -translate-x-1/2">
                    <span className="inline-block bg-white text-black font-bold text-xs sm:text-sm px-3 py-1.5 rounded-full uppercase tracking-wider shadow-md text-center">
                      TEXTILES
                    </span>
                  </div>
                </div>
              )}

              {/* Catégorie ACCESSOIRES — affichée uniquement s'il y a des produits accessoires */}
              {products.filter(p => p.type === "accessoires").length > 0 && (
                <div className="relative rounded-[15px] overflow-hidden bg-black/40 border border-white/10 shadow-lg group">
                  <img
                    src={getFullImageUrl(products.find(p => p.type === "accessoires")?.image_url || "")}
                    alt="Accessoires"
                    className="w-full h-full object-cover opacity-80 group-hover:scale-105 transition-transform duration-700 border border-white/15"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
                  <div className="absolute bottom-5 left-1/2 -translate-x-1/2">
                    <span className="inline-block bg-white text-black font-bold text-xs sm:text-sm px-3 py-1.5 rounded-full uppercase tracking-wider shadow-md text-center">
                      ACCESSOIRES
                    </span>
                  </div>
                </div>
              )}
            </div>
          </section>
        )}
      </div>
    </SiteLayout>
  );
};

export default BoutiqueDeMisa;