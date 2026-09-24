// src/pages/BoutiqueDeMisa.tsx

import { SiteLayout } from "@/components/site/SiteLayout";
import { formatAr } from "@/lib/products";
/*
// [NON CONFORME MAQUETTE ADOBE XD - COMMENTÉ]
// import { Link } from "react-router-dom";
// import { useRef } from "react";
// import {
//   Star,
//   SlidersHorizontal,
//   Filter,
//   Volume2,
//   VolumeX,
//   X,
//   HelpCircle,
//   Leaf,
// } from "lucide-react";
// import fosa from "@/assets/casaniers-mascot.png";
// import { MiniHero } from "@/components/layout/MiniHero";
// import mascote from "@/assets/3.png";
// import { InfoBar } from "@/components/site/InfoBar";
*/
import { useEffect, useMemo, useState } from "react";
import { Heart, ShoppingBag, ArrowRight } from "lucide-react";
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
  /*
  // [NON CONFORME MAQUETTE ADOBE XD - COMMENTÉ]
  // note: number;
  // badge?: "new" | "limited" | null;
  // badgeLabel?: string;
  // tags: MerchTag[];
  // couleurs?: string[];
  // tailles?: string[];
  */
}

/*
// [NON CONFORME MAQUETTE ADOBE XD - FILTRES PAR CATÉGORIES COLORÉES COMMENTÉS]
const FOSA_FILTERS = [
  { id: "all", name: "Tout", types: null },
  { id: "vetement", name: "Vêtements", types: ["vetement"] },
  { id: "papeterie", name: "Papeterie", types: ["papeterie"] },
  { id: "accessoire", name: "Accessoires", types: ["accessoire"] },
  { id: "limited", name: "Édition limitée", types: ["limited"] },
] as const;

const FILTER_COLORS: Record<string, string> = {
  all: "text-amber-600 border-amber-600/30 hover:bg-amber-600/10",
  vetement: "text-purple-500 border-purple-500/30 hover:bg-purple-500/10",
  papeterie: "text-teal-500 border-teal-500/30 hover:bg-teal-500/10",
  accessoire: "text-blue-500 border-blue-500/30 hover:bg-blue-500/10",
  limited: "text-orange-500 border-orange-500/30 hover:bg-orange-500/10",
};
*/

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
  /*
  // [NON CONFORME MAQUETTE ADOBE XD - ÉTATS RECHERCHE / BUDGET / TTS / CHATBOT COMMENTÉS]
  // const [selectedFilter, setSelectedFilter] = useState<string>("all");
  // const [q, setQ] = useState("");
  // const [sort, setSort] = useState<"pop" | "asc" | "desc">("pop");
  // const [budget, setBudget] = useState(200000);
  // const [isChatOpen, setIsChatOpen] = useState(false);
  // const [isSpeaking, setIsSpeaking] = useState(false);
  // const [currentMessage, setCurrentMessage] = useState("");
  // const [showHelp, setShowHelp] = useState(false);

  // const speechSynthesisRef = useRef<SpeechSynthesis | null>(null);
  // const currentUtteranceRef = useRef<SpeechSynthesisUtterance | null>(null);
  // const [selectedVoice, setSelectedVoice] = useState<SpeechSynthesisVoice | null>(null);
  */

  // ✅ Hooks d'authentification et panier
  const { isAuthenticated } = useAuth();
  const { addToCart, refreshCart } = useCartApi();

  // 🔥 Récupération des données réelles depuis la base de données
  const { data: apiData, isLoading, error } = useBoutiqueMisa({ per_page: 100 });

  // Produits récupérés depuis la base de données
  const products: MerchProduct[] = useMemo(() => {
    if (!apiData?.data || !Array.isArray(apiData.data)) return [];

    return apiData.data.map((item: any) => {
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
        description_courte: item.description
          ? item.description.substring(0, 120)
          : "",
        description: item.description || "",
        prix: parseFloat(item.prix) || 0,
        stock: item.stock || 0,
        image_url: item.image_url || null,
      };
    });
  }, [apiData]);

  // 1. Image de fond pour la bannière principale (Baobabs de Madagascar au coucher de soleil)
  const bannerImage = useMemo(() => {
    if (apiData?.banner_url) return getFullImageUrl(apiData.banner_url);
    if (apiData?.banniere) return getFullImageUrl(apiData.banniere);
    return baobab || "/assets/baobab.png";
  }, [apiData]);

  // 2. Image du rayon TEXTILES (importée directement depuis la base de données)
  const textileImage = useMemo(() => {
    if (!products.length) return "";
    const item = products.find((p) => p.type === "textiles" && p.image_url);
    return item?.image_url ? getFullImageUrl(item.image_url) : "";
  }, [products]);

  // 3. Image du rayon ACCESSOIRES (importée directement depuis la base de données)
  const accessoireImage = useMemo(() => {
    if (!products.length) return "";
    const item = products.find((p) => p.type === "accessoires" && p.image_url);
    return item?.image_url ? getFullImageUrl(item.image_url) : "";
  }, [products]);

  useEffect(() => {
    document.title = "Boutique de Misa — Les Casaniers Madagascar";
  }, []);

  // 🔌 Vérification directe du backend (indépendante du hook) :
  // si le serveur ne répond pas, on affiche le message d'erreur rapidement,
  // y compris après un refresh de la page.
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

  // 🐞 Diagnostic : ouvrez la console du navigateur (F12) pour voir l'état réel
  useEffect(() => {
    console.warn("[BoutiqueDeMisa] diagnostic →", {
      backendStatus,
      isLoading,
      error,
      apiData,
      baseUrl: import.meta.env.VITE_APP_URL || "http://localhost:8000",
    });
  }, [backendStatus, isLoading, error, apiData]);

  /*
  // [NON CONFORME MAQUETTE ADOBE XD - SYNTHÈSE VOCALE TTS COMMENTÉE]
  // useEffect(() => {
  //   speechSynthesisRef.current = window.speechSynthesis;
  //   const loadVoices = () => {
  //     const voices = speechSynthesisRef.current?.getVoices() || [];
  //     const frVoice =
  //       voices.find(
  //         (v) =>
  //           (v.lang === "fr-FR" || v.lang === "fr") &&
  //           (v.name.toLowerCase().includes("thomas") ||
  //             v.name.toLowerCase().includes("male"))
  //       ) || voices.find((v) => v.lang === "fr-FR" || v.lang === "fr");
  //     setSelectedVoice(frVoice || null);
  //   };
  //   loadVoices();
  //   if (speechSynthesisRef.current)
  //     speechSynthesisRef.current.onvoiceschanged = loadVoices;
  //   return () => {
  //     if (currentUtteranceRef.current)
  //       speechSynthesisRef.current?.cancel();
  //   };
  // }, []);

  // const speakText = (text: string, onEnd?: () => void) => {
  //   if (!speechSynthesisRef.current) return;
  //   const clean = text.replace(/[*_~`]/g, "").replace(/[🐾🌿🛒❤️✅]/g, "");
  //   if (currentUtteranceRef.current) speechSynthesisRef.current.cancel();
  //   const u = new SpeechSynthesisUtterance(clean);
  //   u.lang = "fr-FR";
  //   u.rate = 0.9;
  //   u.pitch = 0.8;
  //   u.volume = 1;
  //   if (selectedVoice) u.voice = selectedVoice;
  //   u.onstart = () => setIsSpeaking(true);
  //   u.onend = () => {
  //     setIsSpeaking(false);
  //     if (onEnd) onEnd();
  //   };
  //   u.onerror = () => setIsSpeaking(false);
  //   currentUtteranceRef.current = u;
  //   speechSynthesisRef.current.speak(u);
  // };

  // const stopSpeaking = () => {
  //   speechSynthesisRef.current?.cancel();
  //   setIsSpeaking(false);
  // };
  */

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

  // ✅ Fonction pour ajouter au panier
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

  /*
  // [NON CONFORME MAQUETTE ADOBE XD - MASCOTTE FLOTTANTE ET CHATBOT ACTIONS COMMENTÉES]
  // const speakAboutProduct = (p: MerchProduct) => {
  //   const msg = `${p.nom}. ${p.description_courte} Référence ${p.reference}. Prix : ${formatAr(
  //     p.prix
  //   )}. ${p.stock} en stock.`;
  //   setCurrentMessage(msg);
  //   speakText(msg);
  // };

  // const handleMascotClick = () => {
  //   setIsChatOpen(true);
  //   setShowHelp(false);
  //   const msg =
  //     "Bienvenue dans la Boutique de Misa ! Je suis Misa, votre guide. Découvrez nos produits de qualité, tous à l'image du fosa, le plus grand carnivore endémique de Madagascar. Passez la souris sur un produit pour que je vous le présente !";
  //   setCurrentMessage(msg);
  //   speakText(msg);
  // };

  // const handleHelpClick = () => {
  //   setShowHelp(!showHelp);
  //   if (!showHelp) {
  //     const msg =
  //       "Voici comment naviguer : utilisez les filtres pour choisir une catégorie, le curseur pour ajuster votre budget, et le cœur sur chaque produit pour l'ajouter à vos favoris !";
  //     setCurrentMessage(msg);
  //     speakText(msg);
  //   }
  // };
  */

  // ---------------------------------------------------------------------------
  // [CORRECTION] Les écrans "Chargement de la boutique..." et "Erreur" sont
  // désactivés : la page (bannière + message de Misa) s'affiche toujours,
  // même sans backend. Seule la liste des produits affiche
  // "Aucun produit pour le moment" quand il n'y a rien à montrer.
  // ---------------------------------------------------------------------------
  // if (isLoading) {
  //   return (
  //     <SiteLayout>
  //       {/*
  //       // [NON CONFORME MAQUETTE ADOBE XD - MINIHERO COMMENTÉ]
  //       // <MiniHero
  //       //   title="Chargement de la boutique..."
  //       //   description="Veuillez patienter pendant que Misa prépare ses produits pour vous."
  //       //   bg="fosa.png"
  //       //   pill={{
  //       //     icon: <Leaf className="h-3.5 w-3.5" />,
  //       //     label: "Boutique de Misa · Endemika Madagascar",
  //       //   }}
  //       // />
  //       */}
  //       <div className="w-full max-w-[1780px] mx-auto px-4 py-24 text-center">
  //         <p className="text-stone-400 font-medium">Chargement de la Boutique de Misa...</p>
  //       </div>
  //     </SiteLayout>
  //   );
  // }

  // if (error) {
  //   return (
  //     <SiteLayout>
  //       <div className="w-full max-w-[1780px] mx-auto px-4 py-24 text-center">
  //         <p className="text-red-500 font-semibold mb-4">Une erreur est survenue lors du chargement des produits.</p>
  //         <Button className="bg-[#F2551A] hover:bg-[#d94812] text-white" onClick={() => window.location.reload()}>
  //           Réessayer
  //         </Button>
  //       </div>
  //     </SiteLayout>
  //   );
  // }

  return (
    <SiteLayout>
      {/* ✨ Animation d'entrée de la page (fondu + glissement vers le haut, en cascade) */}
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
        
        {/* ================================================================= */}
        {/* 1. BANNIÈRE PRINCIPALE CONFORME ADOBE XD (Noeuds 68, 69, 70, 71)  */}
        {/* Dimensions maquette : 1779 x 255 px avec fond baobabs sunset      */}
        {/* ================================================================= */}
        <div className="relative w-full rounded-[15px] overflow-hidden min-h-[120px] sm:min-h-[140px] md:min-h-[160px] bg-[#221008] border border-white/10 flex items-center shadow-2xl">
          {/* Image de fond baobabs au coucher de soleil */}
          {bannerImage && (
            <div
              className="absolute inset-0 bg-cover bg-center opacity-85 transition-transform duration-700 hover:scale-105"
              style={{ backgroundImage: `url('${bannerImage}')` }}
            />
          )}
          {/* Calque sombre à 45% d'opacité conforme à Rectangle 302 Adobe XD */}
          <div className="absolute inset-0 bg-black/45" />

          {/*
          // [NON CONFORME MAQUETTE ADOBE XD - FILIGRANE SHOP NOW COMMENTÉ]
          // <div
          //   className="absolute left-1/4 sm:left-1/3 top-1/2 -translate-y-1/2 pointer-events-none select-none text-white/20 font-serif italic text-6xl sm:text-7xl md:text-8xl lg:text-9xl whitespace-nowrap -rotate-2"
          //   style={{ fontFamily: "'Brush Script MT', 'Dancing Script', cursive, sans-serif" }}
          // >
          //   Shop now
          // </div>
          */}

          {/* Textes de la bannière conformes à la maquette Adobe XD - Positionnés à gauche avec marge resserrée */}
          <div className="relative z-10 pl-4 sm:pl-6 md:pl-8 pr-4 sm:pr-6 md:pr-8 py-5 sm:py-6 text-left flex flex-col items-start justify-center">
            <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-[46px] font-bold text-white tracking-wide leading-tight mb-2 drop-shadow-md text-left">
              Bienvenue dans la boutique de Misa !
            </h1>
            <p className="text-xs sm:text-sm md:text-base lg:text-[20px] text-white/95 italic font-normal tracking-wide drop-shadow text-left">
              “ Chaque achat que tu fais ici permettra de financer une action de reboisement ”
            </p>
          </div>
        </div>

        {/* ================================================================= */}
        {/* 2. MESSAGE OFFICIEL DE MISA EN BLANC CONFORME ADOBE XD (Noeud 72)  */}
        {/* Toujours strictement sur 3 lignes quel que soit le zoom            */}
        {/* ================================================================= */}
        <div className="space-y-2 pt-1 text-white text-left">
          <h2 className="text-sm sm:text-base font-bold tracking-normal text-white">
            Mbola tsara, cher compatriote !
          </h2>
          <div className="text-[clamp(10px,1.05vw,14px)] leading-relaxed text-white/95 italic space-y-1.5 w-full overflow-x-auto scrollbar-none">
            <p className="whitespace-nowrap">
              Je m'appelle Misa. Mon habitat naturel recule chaque année. En tant que fossa — le plus grand félin de Madagascar — je veux aider à protéger ce milieu et ceux qui y vivent.
            </p>
            <p className="whitespace-nowrap">
              C'est là que j'ai besoin de toi : lorsque tu achètes un goodie dans ma boutique, <strong>Les Casaniers reverse 60% des bénéfices aux actions de reboisement à Madagascar</strong>.
            </p>
            <p className="whitespace-nowrap">
              Alors, si quelque chose te plaît, fais-toi plaisir : tu soutiendras aussi une forêt qui a besoin de nous. Merci, ou comme on dit chez nous : <span className="text-white font-bold not-italic">misaotra !</span>
            </p>
          </div>
        </div>

        {/*
        // [NON CONFORME MAQUETTE ADOBE XD - INFOBAR COMMENTÉE]
        // <InfoBar />
        */}

        {/*
        // [NON CONFORME MAQUETTE ADOBE XD - BARRE DE FILTRES NAV COMMENTÉE]
        // <nav className="sticky top-16 z-30 border-b border-border bg-background/80 backdrop-blur-md">
        // ...
        // </nav>
        */}

        {/*
        // [NON CONFORME MAQUETTE ADOBE XD - BARRE DE RECHERCHE ET BUDGET SLIDER COMMENTÉE]
        // <section className="border-b border-border bg-background/50">
        // ...
        // </section>
        */}

        {/* ================================================================= */}
        {/* 3. SECTION PRODUITS OU ÉTAT VIDE SELON LA BASE DE DONNÉES         */}
        {/* - Backend injoignable (error ou ping en échec) : message d'erreur   */}
        {/* - Vérification en cours : animation du texte "Boutique de Misa"  */}
        {/* - Backend OK mais aucun produit : "Aucun produit pour le moment"  */}
        {/* Aucun textile ou accessoire par défaut n'est affiché.             */}
        {/* ================================================================= */}
        {error || (backendStatus === "down" && !apiData && products.length === 0) ? (
          // ❌ Backend injoignable / non démarré : message d'erreur distinct
          <div className="w-full py-20 px-6 text-center border border-red-500/30 rounded-[15px] bg-red-500/[0.04] shadow-xl flex flex-col items-center justify-center">
            <div className="w-16 h-16 rounded-full bg-red-500/10 border border-red-500/30 flex items-center justify-center mb-4">
              <ShoppingBag className="w-7 h-7 text-red-400 stroke-[1.5]" />
            </div>
            <p className="text-red-400 font-bold text-base sm:text-lg mb-2">
              Impossible de charger les produits
            </p>
            <p className="text-white/70 text-sm mb-5 max-w-md">
              Le serveur ne répond pas. Vérifiez que le backend est démarré, puis réessayez.
            </p>
            <Button className="bg-[#F2551A] hover:bg-[#d94812] text-white" onClick={() => window.location.reload()}>
              Réessayer
            </Button>
          </div>
        ) : (isLoading || (backendStatus === "checking" && !apiData)) && products.length === 0 ? (
          // ⏳ Vérification en cours : animation du texte "Boutique de Misa"
          // (évite d'afficher "Aucun produit" avant de savoir si le backend répond)
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
              className="flex flex-wrap justify-center text-white font-bold tracking-wider text-2xl sm:text-3xl md:text-4xl select-none"
              style={{ animation: "misaGlow 2s ease-in-out 1.6s infinite" }}
            >
              {"Boutique de Misa".split("").map((ch, i) => (
                <span
                  key={i}
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
            <p className="text-white font-bold text-base sm:text-lg">
              Aucun produit pour le moment
            </p>
          </div>
        ) : (
          <section className="grid grid-cols-1 md:grid-cols-2 gap-6 lg:gap-8 pt-2 pb-10">
            {/* CARTE 1 : TEXTILES (affichée uniquement s'il y a des produits textiles en BDD) */}
            {textileImage && (
              <div
                className="group relative rounded-[15px] overflow-hidden aspect-[883/581] bg-[#1a1a1a] border border-white/10 cursor-pointer flex flex-col justify-end items-center p-6 sm:p-8 shadow-2xl transition-transform duration-300 hover:scale-[1.01]"
              >
                <img
                  src={textileImage}
                  alt="Rayon Textiles"
                  className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                />
                <div className="absolute inset-0 bg-black/45 group-hover:bg-black/35 transition-colors duration-300" />
                <div className="relative z-10 w-[176px] h-[56px] rounded-[15px] bg-white flex items-center justify-center shadow-xl transition-transform duration-200 group-hover:scale-105">
                  <span className="text-black font-extrabold text-base tracking-wider uppercase select-none">
                    TEXTILES
                  </span>
                </div>
              </div>
            )}

            {/* CARTE 2 : ACCESSOIRES (affichée uniquement s'il y a des produits accessoires en BDD) */}
            {accessoireImage && (
              <div
                className="group relative rounded-[15px] overflow-hidden aspect-[880/581] bg-[#1a1a1a] border border-white/10 cursor-pointer flex flex-col justify-end items-center p-6 sm:p-8 shadow-2xl transition-transform duration-300 hover:scale-[1.01]"
              >
                <img
                  src={accessoireImage}
                  alt="Rayon Accessoires"
                  className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                />
                <div className="absolute inset-0 bg-black/45 group-hover:bg-black/35 transition-colors duration-300" />
                <div className="relative z-10 w-[244px] h-[56px] rounded-[15px] bg-white flex items-center justify-center shadow-xl transition-transform duration-200 group-hover:scale-105">
                  <span className="text-black font-extrabold text-base tracking-wider uppercase select-none">
                    ACCESSOIRES
                  </span>
                </div>
              </div>
            )}
          </section>
        )}

        {/*
        // [NON CONFORME MAQUETTE ADOBE XD - MASCOTTE FLOTTANTE COMMENTÉE]
        // <button
        //   onClick={handleMascotClick}
        //   className="fixed bottom-6 left-6 z-50 h-14 w-14 rounded-full overflow-hidden border-2 border-amber-500/60 shadow-lg hover:scale-105 transition-transform"
        //   title="Parler à Misa"
        //   aria-label="Ouvrir l'assistant Misa"
        // >
        //   <img
        //     src={fosa}
        //     alt="Misa"
        //     className="w-full h-full object-contain bg-amber-950/80 p-1"
        //   />
        // </button>
        */}

        {/*
        // [NON CONFORME MAQUETTE ADOBE XD - CHATBOT POPUP COMMENTÉ]
        // {isChatOpen && (
        //   <div className="fixed bottom-6 right-6 z-50 w-80 bg-background rounded-xl shadow-xl border border-border overflow-hidden animate-slide-up">
        //     ...
        //   </div>
        // )}
        */}

      </div>
    </SiteLayout>
  );
};

export default BoutiqueDeMisa;