// src/pages/BoutiqueDeMisa.tsx

import { SiteLayout } from "@/components/site/SiteLayout";
import { formatAr } from "@/lib/products";
import { Link } from "react-router-dom";
import { useEffect, useMemo, useState, useRef } from "react";
import {
  Heart,
  ShoppingBag,
  Star,
  SlidersHorizontal,
  Search,
  Filter,
  Volume2,
  VolumeX,
  X,
  HelpCircle,
  PackageOpen,
  Leaf,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "@/hooks/use-toast";
import fosa from "@/assets/casaniers-mascot.png";
import { MiniHero } from "@/components/layout/MiniHero";
import { useBoutiqueMisa } from "@/hooks/useBoutiqueMisa";
import { useAuth } from "@/contexts/AuthContext";
import { useCartApi } from "@/hooks/useCartApi";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export type MerchTag = string;

export interface MerchProduct {
  id: number;
  reference: string;
  nom: string;
  categorie: string;
  type: "vetement" | "papeterie" | "accessoire" | "limited";
  description_courte: string;
  description: string;
  prix: number;
  note: number;
  badge?: "new" | "limited" | null;
  badgeLabel?: string;
  tags: MerchTag[];
  couleurs?: string[];
  tailles?: string[];
  stock: number;
  image_url: string | null;
}

// ---------------------------------------------------------------------------
// Filtres
// ---------------------------------------------------------------------------

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

// Helper pour l'URL des images
const getFullImageUrl = (imageUrl: string | null): string => {
  if (!imageUrl) {
    return '/images/placeholder.jpg';
  }
  
  if (imageUrl.startsWith('http://') || imageUrl.startsWith('https://')) {
    return imageUrl;
  }
  
  const baseUrl = import.meta.env.VITE_APP_URL || 'http://localhost:8000';
  return `${baseUrl}${imageUrl}`;
};

// ---------------------------------------------------------------------------
// Composant principal
// ---------------------------------------------------------------------------

const BoutiqueDeMisa = () => {
  const [favorites, setFavorites] = useState<number[]>([]);
  const [selectedFilter, setSelectedFilter] = useState<string>("all");
  const [q, setQ] = useState("");
  const [sort, setSort] = useState<"pop" | "asc" | "desc">("pop");
  const [budget, setBudget] = useState(200000);
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [currentMessage, setCurrentMessage] = useState("");
  const [showHelp, setShowHelp] = useState(false);

  const speechSynthesisRef = useRef<SpeechSynthesis | null>(null);
  const currentUtteranceRef = useRef<SpeechSynthesisUtterance | null>(null);
  const [selectedVoice, setSelectedVoice] = useState<SpeechSynthesisVoice | null>(null);

  // ✅ Hooks d'authentification et panier
  const { isAuthenticated } = useAuth();
  const { addToCart, refreshCart } = useCartApi();

  // 🔥 Récupération des données réelles depuis la base de données
  const { data: apiData, isLoading, error } = useBoutiqueMisa({ per_page: 100 });

  // Transformation des données API vers le format MerchProduct
  const products = useMemo(() => {
    if (!apiData?.data) return [];

    return apiData.data.map((item: any) => {
      let type: "vetement" | "papeterie" | "accessoire" | "limited" = "accessoire";
      let categorie = "Accessoire";
      
      const nomLower = item.nom.toLowerCase();
      if (nomLower.includes('t-shirt') || nomLower.includes('hoodie') || nomLower.includes('sweat') || nomLower.includes('chemise')) {
        type = "vetement";
        categorie = "Vêtement";
      } else if (nomLower.includes('stylo') || nomLower.includes('carnet') || nomLower.includes('papier')) {
        type = "papeterie";
        categorie = "Papeterie";
      }

      const tags: string[] = [];
      if (item.description) {
        const descLower = item.description.toLowerCase();
        if (descLower.includes('coton')) tags.push('Coton');
        if (descLower.includes('bio')) tags.push('Bio');
        if (descLower.includes('recyclé')) tags.push('Recyclé');
        if (descLower.includes('artisan')) tags.push('Artisanal');
        if (descLower.includes('local')) tags.push('Local');
      }
      if (tags.length === 0) tags.push('Qualité');

      return {
        id: item.id,
        reference: `FOSA-${String(item.id).padStart(3, '0')}`,
        nom: item.nom,
        categorie: categorie,
        type: type,
        description_courte: item.description ? item.description.substring(0, 100) : 'Description non disponible',
        description: item.description || 'Description non disponible',
        prix: parseFloat(item.prix),
        note: 4.5 + Math.random() * 0.5,
        badge: item.stock < 10 ? "limited" : null,
        badgeLabel: item.stock < 10 ? "Stock limité" : null,
        tags: tags,
        couleurs: undefined,
        tailles: undefined,
        stock: item.stock,
        image_url: item.image_url,
      };
    });
  }, [apiData]);

  useEffect(() => {
    document.title = "Boutique de Misa — Collection Fosa · Les Casaniers Madagascar";
  }, []);

  // Voix TTS
  useEffect(() => {
    speechSynthesisRef.current = window.speechSynthesis;
    const loadVoices = () => {
      const voices = speechSynthesisRef.current?.getVoices() || [];
      const frVoice =
        voices.find(
          (v) =>
            (v.lang === "fr-FR" || v.lang === "fr") &&
            (v.name.toLowerCase().includes("thomas") ||
              v.name.toLowerCase().includes("male"))
        ) || voices.find((v) => v.lang === "fr-FR" || v.lang === "fr");
      setSelectedVoice(frVoice || null);
    };
    loadVoices();
    if (speechSynthesisRef.current)
      speechSynthesisRef.current.onvoiceschanged = loadVoices;
    return () => {
      if (currentUtteranceRef.current)
        speechSynthesisRef.current?.cancel();
    };
  }, []);

  const speakText = (text: string, onEnd?: () => void) => {
    if (!speechSynthesisRef.current) return;
    const clean = text.replace(/[*_~`]/g, "").replace(/[🐾🌿🛒❤️✅]/g, "");
    if (currentUtteranceRef.current) speechSynthesisRef.current.cancel();
    const u = new SpeechSynthesisUtterance(clean);
    u.lang = "fr-FR";
    u.rate = 0.9;
    u.pitch = 0.8;
    u.volume = 1;
    if (selectedVoice) u.voice = selectedVoice;
    u.onstart = () => setIsSpeaking(true);
    u.onend = () => {
      setIsSpeaking(false);
      if (onEnd) onEnd();
    };
    u.onerror = () => setIsSpeaking(false);
    currentUtteranceRef.current = u;
    speechSynthesisRef.current.speak(u);
  };

  const stopSpeaking = () => {
    speechSynthesisRef.current?.cancel();
    setIsSpeaking(false);
  };

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
    // Vérifier si l'utilisateur est connecté
    if (!isAuthenticated) {
      toast({
        title: "🔒 Connexion requise",
        description: "Veuillez vous connecter pour ajouter au panier.",
        variant: "destructive",
      });
      return;
    }

    // Vérifier le stock
    if (product.stock <= 0) {
      toast({
        title: "❌ Rupture de stock",
        description: `${product.nom} n'est plus disponible.`,
        variant: "destructive",
      });
      return;
    }

    // Ajouter au panier avec boutique_id
    const success = await addToCart({
      boutique_id: product.id,
      quantite: 1,
      titre: product.nom,
      prix_unitaire: product.prix,
    });

    if (success) {
      // Rafraîchir le panier après ajout
      await refreshCart();
    }
  };

  // Filtrage & tri
  const filtered = useMemo(() => {
    let list = [...products];

    if (selectedFilter !== "all") {
      list = list.filter((p) => p.type === selectedFilter);
    }

    if (q) {
      const term = q.toLowerCase();
      list = list.filter(
        (p) =>
          p.nom.toLowerCase().includes(term) ||
          p.description_courte.toLowerCase().includes(term) ||
          p.reference.toLowerCase().includes(term) ||
          p.categorie.toLowerCase().includes(term)
      );
    }

    list = list.filter((p) => p.prix <= budget);

    if (sort === "asc") list = [...list].sort((a, b) => a.prix - b.prix);
    if (sort === "desc") list = [...list].sort((a, b) => b.prix - a.prix);

    return list;
  }, [products, selectedFilter, q, budget, sort]);

  const speakAboutProduct = (p: MerchProduct) => {
    const msg = `${p.nom}. ${p.description_courte} Référence ${p.reference}. Prix : ${formatAr(p.prix)}. ${p.stock} en stock.`;
    setCurrentMessage(msg);
    speakText(msg);
  };

  const handleMascotClick = () => {
    setIsChatOpen(true);
    setShowHelp(false);
    const msg =
      "Bienvenue dans la Boutique de Misa ! Je suis Misa, votre guide. Découvrez nos produits de qualité, tous à l'image du fosa, le plus grand carnivore endémique de Madagascar. Passez la souris sur un produit pour que je vous le présente !";
    setCurrentMessage(msg);
    speakText(msg);
  };

  const handleHelpClick = () => {
    setShowHelp(!showHelp);
    if (!showHelp) {
      const msg =
        "Voici comment naviguer : utilisez les filtres pour choisir une catégorie, le curseur pour ajuster votre budget, et le cœur sur chaque produit pour l'ajouter à vos favoris !";
      setCurrentMessage(msg);
      speakText(msg);
    }
  };

  if (isLoading) {
    return (
      <SiteLayout>
        <MiniHero
          title="Chargement de la boutique..."
          description="Veuillez patienter pendant que Misa prépare ses produits pour vous."
          bg="fosa.png"
          pill={{
            icon: <Leaf className="h-3.5 w-3.5" />,
            label: "Boutique de Misa · Endemika Madagascar",
          }}
        />
        <div className="container-x py-20 text-center">
          <div className="animate-pulse">
            <div className="h-12 w-12 mx-auto rounded-full bg-amber-200/20"></div>
            <p className="mt-4 text-muted-foreground">Chargement des produits...</p>
          </div>
        </div>
      </SiteLayout>
    );
  }

  if (error) {
    return (
      <SiteLayout>
        <MiniHero
          title="Erreur de chargement"
          description="Impossible de charger les produits. Veuillez réessayer plus tard."
          bg="fosa.png"
          pill={{
            icon: <Leaf className="h-3.5 w-3.5" />,
            label: "Boutique de Misa · Endemika Madagascar",
          }}
        />
        <div className="container-x py-20 text-center">
          <p className="text-red-500">Une erreur est survenue lors du chargement des produits.</p>
          <Button 
            className="mt-4"
            onClick={() => window.location.reload()}
          >
            Réessayer
          </Button>
        </div>
      </SiteLayout>
    );
  }

  return (
    <SiteLayout>
      {/* Hero */}
      <MiniHero
        title="Portez la fierté de Madagascar."
        description="Collection Misa — vêtements, papeterie et accessoires à l'image du fosa, carnivore endémique et symbole sauvage de l'île."
        bg="fosa.png"
        pill={{
          icon: <Leaf className="h-3.5 w-3.5" />,
          label: "Boutique de Misa · Endemika Madagascar",
        }}
      />

      {/* Barre de filtres */}
      <nav className="sticky top-16 z-30 border-b border-border bg-background/80 backdrop-blur-md">
        <div className="container-x py-3">
          {/* Mobile */}
          <div className="grid grid-cols-2 sm:hidden gap-2">
            {FOSA_FILTERS.map((f) => {
              const isActive = selectedFilter === f.id;
              const color = FILTER_COLORS[f.id] || FILTER_COLORS.all;
              return (
                <button
                  key={f.id}
                  onClick={() => setSelectedFilter(f.id)}
                  className={`text-xs font-semibold px-2 py-2 rounded-full border transition-all text-center ${
                    isActive
                      ? `${color} bg-opacity-10 border-opacity-60`
                      : `${color} opacity-60 hover:opacity-100`
                  }`}
                >
                  {f.name}
                </button>
              );
            })}
          </div>

          {/* Desktop */}
          <div className="hidden sm:flex items-center gap-2 overflow-x-auto scrollbar-none">
            <Filter className="h-4 w-4 text-amber-600 shrink-0 mr-1" />
            {FOSA_FILTERS.map((f) => {
              const isActive = selectedFilter === f.id;
              const color = FILTER_COLORS[f.id] || FILTER_COLORS.all;
              return (
                <button
                  key={f.id}
                  onClick={() => setSelectedFilter(f.id)}
                  className={`shrink-0 text-xs font-semibold px-4 py-1.5 rounded-full border transition-all ${
                    isActive
                      ? `${color} bg-opacity-10 border-opacity-60`
                      : `${color} opacity-60 hover:opacity-100`
                  }`}
                >
                  {f.name}
                </button>
              );
            })}
          </div>
        </div>
      </nav>

      {/* Barre de recherche et tri */}
      <section className="border-b border-border bg-background/50">
        <div className="container-x py-3">
          <div className="flex flex-wrap items-center gap-2">
            {/* Recherche */}
            <div className="relative flex-1 min-w-[200px]">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
              <input
                value={q}
                onChange={(e) => setQ(e.target.value)}
                placeholder="Rechercher dans la boutique de Misa..."
                className="w-full h-8 pl-8 pr-3 rounded-full bg-secondary/50 text-xs border border-transparent focus:border-amber-500/30 focus:outline-none transition-all"
              />
            </div>

            {/* Budget */}
            <div className="flex items-center gap-2">
              <SlidersHorizontal className="h-3 w-3 text-muted-foreground hidden sm:block" />
              <input
                type="range"
                min={10000}
                max={200000}
                step={5000}
                value={budget}
                onChange={(e) => setBudget(Number(e.target.value))}
                className="accent-amber-600 w-28 h-1"
              />
              <span className="text-[10px] font-mono text-muted-foreground">
                {formatAr(budget)}
              </span>
            </div>

            {/* Tri */}
            <select
              value={sort}
              onChange={(e) => setSort(e.target.value as "pop" | "asc" | "desc")}
              className="h-8 rounded-full bg-secondary/50 px-3 text-xs border border-transparent focus:border-amber-500/30 focus:outline-none"
            >
              <option value="pop">Populaire</option>
              <option value="asc">Prix ↑</option>
              <option value="desc">Prix ↓</option>
            </select>

            {/* Aide */}
            <button
              onClick={handleHelpClick}
              className="h-8 w-8 rounded-full bg-secondary/50 flex items-center justify-center hover:bg-amber-500/10 transition-all"
            >
              <HelpCircle className="h-3.5 w-3.5 text-muted-foreground" />
            </button>
          </div>
        </div>
      </section>

      {/* Bannière Endemika */}
      <div className="container-x pt-5">
        <p className="text-xs text-muted-foreground">
          Tous les gains seront dédiés pour aider au reboisement de l'île rouge.
        </p>
      </div>

      {/* Grille produits */}
      <section className="container-x py-6">
        <div className="text-[11px] text-muted-foreground mb-4 flex items-center justify-between">
          <span>{filtered.length} produit(s)</span>
          {showHelp && (
            <div className="card-soft p-2 max-w-md animate-fade-up">
              <div className="flex items-start gap-2 text-[10px]">
                <span className="text-sm">🦁</span>
                <p className="text-muted-foreground">
                  Filtrez par catégorie, ajustez votre budget et cliquez sur le
                  cœur pour sauvegarder vos favoris !
                </p>
              </div>
            </div>
          )}
        </div>

        {filtered.length === 0 ? (
          <div className="card-soft p-8 text-center">
            <PackageOpen className="h-8 w-8 mx-auto text-muted-foreground mb-3" />
            <p className="font-bold text-lg mb-1">Aucun produit trouvé</p>
            <p className="text-xs text-muted-foreground">
              Essayez d'élargir votre budget ou de changer de catégorie.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
            {filtered.map((p, i) => {
              const fav = favorites.includes(p.id);
              const imageUrl = getFullImageUrl(p.image_url);
              
              return (
                <article
                  key={p.id}
                  className="group bg-card border border-border/50 rounded-xl overflow-hidden hover:shadow-md hover:-translate-y-0.5 transition-all duration-200 cursor-pointer"
                  style={{ animationDelay: `${i * 30}ms` }}
                  onMouseEnter={() => speakAboutProduct(p)}
                >
                  {/* Image produit */}
                  <div className="relative aspect-square overflow-hidden bg-secondary/30">
                    <img
                      src={imageUrl}
                      alt={p.nom}
                      loading="lazy"
                      className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                      onError={(e) => {
                        (e.target as HTMLImageElement).src = '/images/placeholder.jpg';
                      }}
                    />

                    {/* Badge */}
                    {p.badge && (
                      <span
                        className={`absolute top-1.5 left-1.5 text-[8px] font-semibold px-1.5 py-0.5 rounded-full ${
                          p.badge === "new"
                            ? "bg-emerald-500 text-white"
                            : "bg-amber-500 text-white"
                        }`}
                      >
                        {p.badgeLabel}
                      </span>
                    )}

                    {/* Stock bas */}
                    {p.stock < 40 && (
                      <span className="absolute bottom-1.5 left-1.5 text-[8px] font-medium bg-black/60 text-amber-300 px-1.5 py-0.5 rounded-full">
                        {p.stock} restants
                      </span>
                    )}

                    {/* Favori */}
                    <button
                      onClick={(e) => toggleFavorite(p.id, e)}
                      className={`absolute top-1.5 right-1.5 h-6 w-6 rounded-full flex items-center justify-center backdrop-blur-sm transition-all ${
                        fav
                          ? "bg-amber-500 text-white"
                          : "bg-black/50 text-white/80 hover:bg-amber-500/80"
                      }`}
                    >
                      <Heart className={`h-3 w-3 ${fav ? "fill-current" : ""}`} />
                    </button>
                  </div>

                  {/* Corps de la carte */}
                  <div className="p-2.5 space-y-1.5">
                    <div className="flex items-start justify-between gap-1">
                      <div className="flex-1 min-w-0">
                        <div className="text-[8px] font-mono uppercase text-amber-600/80">
                          {p.reference.split("-")[0]}-{p.reference.split("-")[1]}
                        </div>
                        <h3 className="font-semibold text-xs leading-tight truncate">
                          {p.nom}
                        </h3>
                      </div>
                      <div className="flex items-center gap-0.5 shrink-0">
                        <Star className="h-2.5 w-2.5 fill-amber-500 text-amber-500" />
                        <span className="text-[9px] font-medium">{p.note.toFixed(1)}</span>
                      </div>
                    </div>

                    <p className="text-[9px] text-muted-foreground line-clamp-2 leading-relaxed">
                      {p.description_courte}
                    </p>

                    {/* Tags */}
                    <div className="flex flex-wrap gap-1">
                      {p.tags.slice(0, 2).map((t) => (
                        <span
                          key={t}
                          className="text-[8px] bg-secondary px-1.5 py-0.5 rounded-full"
                        >
                          {t}
                        </span>
                      ))}
                    </div>

                    {/* Couleurs disponibles */}
                    {p.couleurs && p.couleurs.length > 0 && (
                      <p className="text-[8px] text-muted-foreground">
                        {p.couleurs.join(" · ")}
                      </p>
                    )}

                    {/* Prix + CTA */}
                    <div className="flex items-center justify-between pt-1">
                      <div>
                        <span className="text-[9px] text-muted-foreground">
                          à partir de
                        </span>
                        <div className="font-bold text-xs">{formatAr(p.prix)}</div>
                      </div>
                      {/* ✅ Bouton Ajouter au panier */}
                      <Button
                        variant="hero"
                        size="sm"
                        className="h-6 px-2 text-[10px]"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleAddToCart(p);
                        }}
                        disabled={p.stock <= 0}
                      >
                        <ShoppingBag className="h-3 w-3 mr-1" />
                        Ajouter
                      </Button>
                    </div>
                  </div>
                </article>
              );
            })}
          </div>
        )}
      </section>

      {/* Mascotte flottante */}
      <button
        onClick={handleMascotClick}
        className="fixed bottom-6 left-6 z-50 h-14 w-14 rounded-full overflow-hidden border-2 border-amber-500/60 shadow-lg hover:scale-105 transition-transform"
        title="Parler à Misa"
        aria-label="Ouvrir l'assistant Misa"
      >
        <img
          src={fosa}
          alt="Misa"
          className="w-full h-full object-contain bg-amber-950/80 p-1"
        />
      </button>

      {/* Chatbot popup */}
      {isChatOpen && (
        <div className="fixed bottom-6 right-6 z-50 w-80 bg-background rounded-xl shadow-xl border border-border overflow-hidden animate-slide-up">
          {/* Header */}
          <div className="bg-gradient-to-r from-amber-900/90 to-amber-700/90 text-white p-3 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <img
                src={fosa}
                alt="Misa"
                className="h-8 w-8 rounded-full object-contain bg-white/10 p-1"
              />
              <div>
                <div className="font-bold text-xs">Misa 🦁</div>
                <div className="text-[8px] opacity-80">
                  {isSpeaking ? "🎙️ Parle..." : "🎧 Prête"}
                </div>
              </div>
            </div>
            <div className="flex gap-1">
              {isSpeaking && (
                <button
                  onClick={stopSpeaking}
                  className="p-1 rounded hover:bg-white/10"
                >
                  <VolumeX className="h-3 w-3" />
                </button>
              )}
              <button
                onClick={() => setIsChatOpen(false)}
                className="p-1 rounded hover:bg-white/10"
              >
                <X className="h-3 w-3" />
              </button>
            </div>
          </div>

          {/* Message */}
          <div className="p-3 bg-secondary/20">
            <div className="bg-card rounded-xl p-2 shadow-sm border border-border">
              <div className="text-[10px] leading-relaxed whitespace-pre-wrap">
                {currentMessage ||
                  "🦁 Bienvenue dans ma boutique ! Je suis Misa, votre fosa guide. Passez la souris sur mes produits, je vous les présente !"}
              </div>
              {currentMessage && (
                <button
                  onClick={() => speakText(currentMessage)}
                  className="mt-1 text-[8px] opacity-60 hover:opacity-100 flex items-center gap-1"
                >
                  <Volume2 className="h-2 w-2" /> Réécouter
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      <style>{`
        @keyframes slide-up {
          from { opacity: 0; transform: translateY(20px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        .animate-slide-up { animation: slide-up 0.3s ease-out both; }
      `}</style>
    </SiteLayout>
  );
};

export default BoutiqueDeMisa;