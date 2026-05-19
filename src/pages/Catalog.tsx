import { SiteLayout } from "@/components/site/SiteLayout";
import { formatAr } from "@/lib/products";
import { useShop } from "@/store/shop";
import { Link } from "react-router-dom";
import { useEffect, useMemo, useState, useRef } from "react";
import { Heart, ShoppingBag, Star, SlidersHorizontal, Search, Filter, Volume2, VolumeX, X, HelpCircle, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "@/hooks/use-toast";
import fosa from "@/assets/casaniers-mascot.png";
import { Product, productImage, productSpec, useProducts, useCategories } from "@/hooks/useProducts";
import { MiniHero } from "@/components/layout/MiniHero";
import api from "@/service/api";
import { useCartApi } from "@/hooks/useCartApi";


const Catalog = () => {
  //const { addToCart } = useShop();
  const { addToCart } = useCartApi();
  const [favorites, setFavorites] = useState<number[]>([]);
  const [catId, setCatId] = useState<number | "Tout">("Tout");
  const [q, setQ] = useState("");
  const [sort, setSort] = useState<"pop" | "asc" | "desc">("pop");
  const [budget, setBudget] = useState(15000000);
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [currentMessage, setCurrentMessage] = useState("");
  const [showHelp, setShowHelp] = useState(false);
  const speechSynthesisRef = useRef<SpeechSynthesis | null>(null);
  const currentUtteranceRef = useRef<SpeechSynthesisUtterance | null>(null);
  const [selectedVoice, setSelectedVoice] = useState<SpeechSynthesisVoice | null>(null);

  const { data: categories = [], isLoading: isLoadingCats } = useCategories();
  const { data: products = [], isLoading: isLoadingProducts } = useProducts({
    categorie_id: catId === "Tout" ? undefined : catId,
    search: q || undefined
  });

  useEffect(() => {
    document.title = "Catalogue PC sur-mesure — Les Casaniers Madagascar";
  }, []);

  // Charger les favoris de l'utilisateur connecté
  useEffect(() => {
    fetchFavorites();
  }, []);

  const fetchFavorites = async () => {
    try {
      const response = await api.get('/favoris');
      let favorisData = [];
      if (response.data.data) {
        favorisData = Array.isArray(response.data.data) ? response.data.data : [];
      } else if (Array.isArray(response.data)) {
        favorisData = response.data;
      } else if (response.data.favoris) {
        favorisData = response.data.favoris;
      } else {
        favorisData = [];
      }
      const favoriteIds = favorisData.map((f: any) => f.produit_id);
      setFavorites(favoriteIds);
    } catch (error: any) {
      // Si l'utilisateur n'est pas connecté, ce n'est pas une erreur
      if (error.response?.status !== 401) {
        console.error("Erreur chargement favoris:", error);
      }
    }
  };

  const toggleFavorite = async (produitId: number, e?: React.MouseEvent) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }
    
    try {
      const isCurrentlyFavorite = favorites.includes(produitId);
      
      if (isCurrentlyFavorite) {
        await api.delete('/favoris', {
          data: { produit_id: produitId }
        });
        setFavorites(favorites.filter(id => id !== produitId));
        toast({ 
          title: "Retiré des favoris", 
          description: "Produit retiré de votre liste"
        });
      } else {
        await api.post('/favoris', {
          produit_id: produitId
        });
        setFavorites([...favorites, produitId]);
        toast({ 
          title: "Ajouté aux favoris", 
          description: "Produit ajouté à votre liste"
        });
      }
    } catch (error: any) {
      console.error("Erreur favori:", error);
      if (error.response?.status === 401) {
        toast({ 
          title: "Connexion requise", 
          description: "Veuillez vous connecter pour ajouter aux favoris",
          variant: "destructive"
        });
      } else {
        toast({ 
          title: "Erreur", 
          description: "Une erreur est survenue",
          variant: "destructive"
        });
      }
    }
  };

  // Fonction pour obtenir l'URL de l'image principale d'un produit
  const getProductImageUrl = (product: any) => {
    if (!product) return "/placeholder-pc.jpg";
    
    const images = product.images || [];
    if (images.length === 0) return "/placeholder-pc.jpg";
    
    const mainImage = images.find((img: any) => img.ordre === 0) || images[0];
    if (!mainImage?.url) return "/placeholder-pc.jpg";
    
    // Si l'URL commence par /storage, ajouter le domaine
    if (mainImage.url.startsWith('/storage')) {
      return `http://127.0.0.1:8000${mainImage.url}`;
    }
    
    return mainImage.url;
  };

  // Charger les voix disponibles
  useEffect(() => {
    speechSynthesisRef.current = window.speechSynthesis;

    const loadVoices = () => {
      const voices = speechSynthesisRef.current?.getVoices() || [];

      const frenchMaleVoice = voices.find(voice =>
        (voice.lang === 'fr-FR' || voice.lang === 'fr') &&
        (voice.name.toLowerCase().includes('male') ||
          voice.name.toLowerCase().includes('homme') ||
          voice.name.toLowerCase().includes('thomas') ||
          !voice.name.toLowerCase().includes('female'))
      );

      const frenchVoice = voices.find(voice => voice.lang === 'fr-FR' || voice.lang === 'fr');
      setSelectedVoice(frenchMaleVoice || frenchVoice || null);
    };

    loadVoices();

    if (speechSynthesisRef.current) {
      speechSynthesisRef.current.onvoiceschanged = loadVoices;
    }

    return () => {
      if (currentUtteranceRef.current) {
        speechSynthesisRef.current?.cancel();
      }
    };
  }, []);

  const speakText = (text: string, onEnd?: () => void) => {
    if (!speechSynthesisRef.current) return;

    const cleanText = text.replace(/[*_~`]/g, '').replace(/[🐧👋🎯✅🚚💰🏠💪⭐]/g, '');

    if (currentUtteranceRef.current) {
      speechSynthesisRef.current.cancel();
    }

    const utterance = new SpeechSynthesisUtterance(cleanText);
    utterance.lang = 'fr-FR';
    utterance.rate = 0.9;
    utterance.pitch = 0.8;
    utterance.volume = 1;

    if (selectedVoice) {
      utterance.voice = selectedVoice;
    }

    utterance.onstart = () => setIsSpeaking(true);
    utterance.onend = () => {
      setIsSpeaking(false);
      if (onEnd) onEnd();
    };
    utterance.onerror = () => setIsSpeaking(false);

    currentUtteranceRef.current = utterance;
    speechSynthesisRef.current.speak(utterance);
  };

  const stopSpeaking = () => {
    if (speechSynthesisRef.current) {
      speechSynthesisRef.current.cancel();
      setIsSpeaking(false);
    }
  };

  const handleMascotClick = () => {
    setIsChatOpen(true);
    setShowHelp(false);
    const message = "🐧 *Je saute sur place* Bienvenue dans le catalogue Les Casaniers ! *montre l'écran* Ici tu peux filtrer par catégorie. *compte sur ses doigts* Tu peux aussi trier par prix ou popularité, et ajuster ton budget avec le curseur ! *sourit* Passe ta souris sur n'importe quel produit, je te le présente. Besoin d'aide pour choisir ?";
    setCurrentMessage(message);
    speakText(message);
  };

  const handleHelpClick = () => {
    setShowHelp(!showHelp);
    if (!showHelp) {
      const message = "🐧 *Je m'approche* Voici un petit guide ! *pointe* Les filtres en haut : choisis ta catégorie pour voir les modèles. *montre le curseur* Le curseur de budget ajuste les prix. *pointe les produits* Et chaque carte produit a un bouton cœur pour les favoris ! Des questions ?";
      setCurrentMessage(message);
      speakText(message);
    }
  };

  const toCartProduct = (product: Product) => ({
    id: String(product.id),
    name: product.nom,
    category: product.categorie?.nom || product.type_produit,
    tagline: product.description_courte || product.tagline || "Configuration Les Casaniers",
    price: Number(product.prix),
    image: productImage(product),
  });

  const speakAboutProduct = (product: Product) => {
    const cpu = productSpec(product, "processeur") || "une configuration equilibree";
    const gpu = productSpec(product, "carte_graphique") || "des composants adaptes";
    const message = `Bienvenue sur ${product.nom}. ${product.description_courte || product.tagline || ""} C'est du ${product.categorie?.nom || product.type_produit}, avec ${cpu} et ${gpu}. A partir de ${formatAr(product.prix)}.`;
    setCurrentMessage(message);
    speakText(message);
  };

  const speakAboutFilter = (name: string) => {
    const message = `🐧 *J'ouvre les bras* La catégorie ${name} ! *sourit* Trouve celle qui te correspond !`;
    setCurrentMessage(message);
    speakText(message);
  };

  const filtered = useMemo(() => {
    if (!products) return [];
    let list = products.filter((p) => p.prix <= budget && p.est_dispo && p.quantite_stock > 0 && p.actif);
    if (sort === "asc") list = [...list].sort((a, b) => a.prix - b.prix);
    if (sort === "desc") list = [...list].sort((a, b) => b.prix - a.prix);
    return list;
  }, [products, sort, budget]);

  return (
    <SiteLayout>
      {/* Hero catalogue */}
      <MiniHero
        title="Trouvez la machine qui vous correspond."
        description="Filtres intelligents, comparaisons instantanées, et le Fosa qui veille sur vos choix."
        bg="5.png"
      />

      {/* Filtres */}
      <section className="sticky top-[73px] z-30 glass border-b border-border">
        <div className="container-x py-4 flex flex-wrap items-center gap-3">
          <div className="relative flex-1 min-w-[220px] max-w-md">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <input
              value={q} onChange={(e) => setQ(e.target.value)}
              placeholder="Rechercher dans le catalogue..."
              className="w-full h-10 pl-10 pr-4 rounded-full bg-secondary text-sm focus:outline-none focus:ring-4 focus:ring-accent/15 border border-transparent focus:border-accent transition-all"
            />
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => {
                setCatId("Tout");
                speakAboutFilter("Toutes");
              }}
              className={`px-4 h-10 rounded-full text-sm font-medium transition-all ${catId === "Tout" ? "bg-gradient-accent text-accent-foreground shadow-glow" : "bg-secondary text-muted-foreground hover:text-foreground"
                }`}
            >
              Tout
            </button>
            {categories?.map((c: any) => (
              <button
                key={c.id}
                onClick={() => {
                  setCatId(c.id);
                  speakAboutFilter(c.nom);
                }}
                className={`px-4 h-10 rounded-full text-sm font-medium transition-all ${catId === c.id ? "bg-gradient-accent text-accent-foreground shadow-glow" : "bg-secondary text-muted-foreground hover:text-foreground"
                  }`}
              >
                {c.nom}
              </button>
            ))}
            {(isLoadingCats || isLoadingProducts) && (
              <div className="flex items-center ml-2">
                <Loader2 className="h-5 w-5 animate-spin text-accent" />
              </div>
            )}
          </div>
          <div className="ml-auto flex items-center gap-3">
            <label className="hidden md:flex items-center gap-2 text-xs text-muted-foreground">
              <SlidersHorizontal className="h-3.5 w-3.5" />
              Budget max&nbsp;: <strong className="text-foreground tabular-nums">{formatAr(budget)}</strong>
              <input type="range" min={1500000} max={15000000} step={500000} value={budget}
                onChange={(e) => setBudget(Number(e.target.value))} className="accent-accent w-40" />
            </label>
            <select value={sort} onChange={(e) => setSort(e.target.value as never)}
              className="h-10 rounded-full bg-secondary px-4 text-sm border border-transparent focus:outline-none focus:border-accent">
              <option value="pop">Popularité</option>
              <option value="asc">Prix croissant</option>
              <option value="desc">Prix décroissant</option>
            </select>
            <button
              onClick={handleHelpClick}
              className="h-10 w-10 rounded-full bg-secondary flex items-center justify-center hover:bg-accent hover:text-accent-foreground transition-all"
              title="Aide"
            >
              <HelpCircle className="h-4 w-4" />
            </button>
          </div>
        </div>
      </section>

      {/* Grille */}
      <section className="container-x py-12">
        <div className="text-sm text-muted-foreground mb-6 flex items-center justify-between">
          <span>{filtered.length} configurations trouvées</span>
          {showHelp && (
            <div className="card-soft p-3 max-w-md animate-fade-up">
              <div className="flex items-start gap-2 text-xs">
                <span className="text-lg">🐧</span>
                <p className="text-muted-foreground">Utilise les filtres pour trouver ton bonheur ! Le curseur ajuste ton budget. Et passe ta souris sur un produit pour que je te le présente !</p>
              </div>
            </div>
          )}
        </div>

        {isLoadingProducts ? (
          <div className="flex flex-col items-center justify-center py-20 gap-4">
            <Loader2 className="h-12 w-12 animate-spin text-accent" />
            <p className="text-muted-foreground animate-pulse">Chargement des configurations...</p>
          </div>
        ) : filtered.length === 0 ? (
          <div className="card-soft p-12 text-center">
            <p className="font-display text-2xl font-bold mb-2">Aucun résultat</p>
            <p className="text-muted-foreground">Essayez d'élargir votre budget ou de changer de catégorie.</p>
          </div>
        ) : (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {filtered.map((p: Product, i: number) => {
              const fav = favorites.includes(String(p.id));
              const cpu = productSpec(p, "processeur");
              const gpu = productSpec(p, "carte_graphique");
              const ram = productSpec(p, "ram");
              return (
                <article
                  key={p.id}
                  className="group card-soft overflow-hidden hover-lift animate-fade-up cursor-pointer"
                  style={{ animationDelay: `${i * 60}ms` }}
                  onMouseEnter={() => speakAboutProduct(p)}
                >
                  <Link to={`/produit/${p.id}`} className="block relative aspect-[4/3] overflow-hidden bg-secondary">
                    <img src={productImage(p)} alt={p.nom} loading="lazy"
                      className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" />
                    {p.badge && (
                      <span className="absolute top-3 left-3 pill bg-gradient-accent text-accent-foreground border-0">
                        ⚡ {p.badge}
                      </span>
                    )}
                    
                    {/* Bouton favori */}
                    <button
                      onClick={(e) => { e.preventDefault(); toggleFavorite(String(p.id)); }}
                      className={`absolute top-3 right-3 h-9 w-9 rounded-full flex items-center justify-center backdrop-blur transition-all ${fav ? "bg-accent text-accent-foreground" : "bg-card/90 text-foreground hover:bg-accent hover:text-accent-foreground"
                        }`}
                      aria-label="Favori">
                      <Heart className={`h-4 w-4 ${fav ? "fill-current" : ""}`} />
                    </button>
                  </Link>
                  <div className="p-5 space-y-3">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <div className="text-xs font-mono uppercase tracking-wider text-accent">{p.categorie?.nom}</div>
                        <h3 className="font-display text-xl font-bold mt-1">{p.nom}</h3>
                      </div>
                      <div className="flex items-center gap-1 text-xs text-muted-foreground shrink-0">
                        <Star className="h-3.5 w-3.5 fill-accent text-accent" />
                        <span className="font-semibold text-foreground">{p.note || 5.0}</span>
                      </div>
                    </div>
                    <p className="text-sm text-muted-foreground italic">"{p.description_courte || p.tagline || 'Une configuration exceptionnelle.'}"</p>
                    <div className="flex flex-wrap gap-1.5 text-[11px]">
                      {cpu && <span className="pill !py-1 !px-2">{cpu}</span>}
                      {gpu && <span className="pill !py-1 !px-2">{gpu}</span>}
                      {ram && <span className="pill !py-1 !px-2">{ram}</span>}
                    </div>
                    <div className="flex items-end justify-between pt-2">
                      <div>
                        <div className="text-[10px] text-muted-foreground uppercase tracking-wider">à partir de</div>
                        <div className="font-display font-bold text-2xl">{formatAr(p.prix)}</div>
                      </div>
                      {/* <Button variant="hero" size="sm"
                        onClick={() => { addToCart(String(p.id)); toast({ title: "Ajouté au panier", description: p.nom }); }}>
                        <ShoppingBag className="h-4 w-4" /> Ajouter
                      </Button> */}
                      <Button variant="hero" size="sm"
                        onClick={() => { addToCart(String(p.id), 1, toCartProduct(p)); toast({ title: "Ajoute au panier", description: p.nom }); }}>
                        <ShoppingBag className="h-4 w-4" /> Ajouter
                      </Button>
                    </div>
                  </div>
                </article>
              );
            })}
          </div>
        )}
      </section>

      {/* CHATBOT POPUP */}
      {isChatOpen && (
        <div className="fixed bottom-6 right-6 z-50 w-96 bg-background rounded-2xl shadow-2xl border-2 border-border overflow-hidden animate-slide-up theme-transition">
          <div className="bg-gradient-to-r from-gray-900 to-gray-800 text-white p-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <img src={fosa} alt="Casio" className="h-10 w-10 rounded-full object-contain bg-white/10 p-1" />
              <div>
                <div className="font-bold text-sm flex items-center gap-2">
                  Casio 🐧
                  <span className="text-[8px] bg-blue-600 text-white px-1.5 py-0.5 rounded-full">GUIDE VOCAL</span>
                </div>
                <div className="text-[9px] opacity-80">
                  {isSpeaking ? "🎙️ Parle en ce moment..." : "🎧 Prêt à guider"}
                </div>
              </div>
            </div>
            <div className="flex gap-1">
              {isSpeaking && (
                <button onClick={stopSpeaking} className="p-1 rounded-lg hover:bg-white/10 transition">
                  <VolumeX className="h-3 w-3" />
                </button>
              )}
              <button onClick={() => setIsChatOpen(false)} className="p-1 rounded-lg hover:bg-white/10 transition">
                <X className="h-3 w-3" />
              </button>
            </div>
          </div>
          <div className="p-4 bg-secondary/30">
            <div className="bg-white dark:bg-card rounded-2xl p-3 shadow-sm border border-border">
              <div className="text-xs leading-relaxed whitespace-pre-wrap">
                {currentMessage || "🐧 Salut ! Je suis Casio, ton guide dans le catalogue. Passe ta souris sur les produits, je te les présente vocalement ! Clique sur les filtres, je t'explique chaque catégorie. Bonne recherche !"}
              </div>
              {currentMessage && (
                <button onClick={() => speakText(currentMessage)} className="mt-2 text-[9px] opacity-60 hover:opacity-100 flex items-center gap-1 transition">
                  <Volume2 className="h-2.5 w-2.5" /> Réécouter
                </button>
              )}
            </div>
          </div>
          <div className="p-3 border-t border-border text-center">
            <p className="text-[9px] text-muted-foreground">
              💡 Passe ta souris sur un produit → Casio te le présente vocalement !
            </p>
          </div>
        </div>
      )}

      <style>{`
        @keyframes slide-up {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-slide-up { animation: slide-up 0.3s ease-out both; }
        .theme-transition { transition: all 0.3s ease; }
      `}</style>
    </SiteLayout>
  );
};

export default Catalog;