import { SiteLayout } from "@/components/site/SiteLayout";
import { formatAr } from "@/lib/products";
import { Link, useSearchParams } from "react-router-dom";
import { useEffect, useMemo, useState, useRef } from "react";
import { 
  Heart, ShoppingBag, Star, SlidersHorizontal, Search, Filter, 
  Volume2, VolumeX, X, HelpCircle, Loader2, 
  MessageCircle, Settings, Zap 
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "@/hooks/use-toast";
import fosa from "@/assets/casaniers-mascot.png";
import { Product, productSpec, useCategories } from "@/hooks/useProducts";
import { MiniHero } from "@/components/layout/MiniHero";
import api from "@/service/api";
import { useCartApi } from "@/hooks/useCartApi";

// Colors for dynamic category filters
const getFilterColorClass = (index: number) => {
  const colors = [
    "text-purple-500 border-purple-500/30 hover:bg-purple-500/10",
    "text-blue-500 border-blue-500/30 hover:bg-blue-500/10",
    "text-amber-500 border-amber-500/30 hover:bg-amber-500/10",
    "text-teal-500 border-teal-500/30 hover:bg-teal-500/10",
    "text-rose-500 border-rose-500/30 hover:bg-rose-500/10"
  ];
  return colors[index % colors.length];
};

const Profreelance = () => {
  const { addToCart } = useCartApi();
  const [searchParams, setSearchParams] = useSearchParams();
  const { data: categories } = useCategories();

  const searchNom = searchParams.get("nom") || "";
  const searchRef = searchParams.get("ref") || "";
  const searchCategory = searchParams.get("categorie") || "";

  const [favorites, setFavorites] = useState<number[]>([]);
  const [q, setQ] = useState("");
  const [sort, setSort] = useState<"pop" | "asc" | "desc">("pop");
  const [budget, setBudget] = useState(15000000);
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [currentMessage, setCurrentMessage] = useState("");
  const [showHelp, setShowHelp] = useState(false);
  const [allProducts, setAllProducts] = useState<Product[]>([]);
  const [isLoadingProducts, setIsLoadingProducts] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const speechSynthesisRef = useRef<SpeechSynthesis | null>(null);
  const currentUtteranceRef = useRef<SpeechSynthesisUtterance | null>(null);
  const [selectedVoice, setSelectedVoice] = useState<SpeechSynthesisVoice | null>(null);
  const [proCategoryId, setProCategoryId] = useState<number | null>(null);

  // Numéro WhatsApp du support
  const WHATSAPP_NUMBER = "261341234567"; // À remplacer par le vrai numéro

  useEffect(() => {
    document.title = "Catalogue Pro — Les Casaniers Madagascar";
    fetchAllProducts();
  }, []);

  // Récupérer l'ID de la catégorie "Pro"
  useEffect(() => {
    if (categories && categories.length > 0) {
      const proCategory = categories.find(cat => 
        cat.nom?.toLowerCase() === "pro" || 
        cat.nom?.toLowerCase() === "professionnel" ||
        cat.nom?.toLowerCase().includes("pro") ||
        cat.slug?.toLowerCase().includes("pro")
      );
      
      if (proCategory) {
        setProCategoryId(proCategory.id);
        const params = new URLSearchParams(searchParams);
        if (!params.get("categorie")) {
          params.set("categorie", String(proCategory.id));
          setSearchParams(params);
        }
      } else {
        console.warn("⚠️ Catégorie 'Pro' non trouvée, utilisation de la première catégorie");
        if (categories.length > 0) {
          setProCategoryId(categories[0].id);
          const params = new URLSearchParams(searchParams);
          if (!params.get("categorie")) {
            params.set("categorie", String(categories[0].id));
            setSearchParams(params);
          }
        }
      }
    }
  }, [categories]);

  const fetchAllProducts = async () => {
    try {
      setIsLoadingProducts(true);
      setError(null);
      
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 15000);
      
      const response = await api.get('/produits', { 
        params: { per_page: 1000 },
        signal: controller.signal 
      });
      
      clearTimeout(timeoutId);
      
      let products = [];
      if (response?.data?.data) {
        products = Array.isArray(response.data.data) ? response.data.data : [];
      } else if (Array.isArray(response?.data)) {
        products = response.data;
      }
      
      console.log(`✅ ${products.length} produits chargés avec succès`);
      setAllProducts(products);
      
    } catch (error: any) {
      if (error.name === 'AbortError') {
        console.warn('⏱️ Requête annulée (timeout)');
        setError("Le chargement des produits prend trop de temps.");
        toast({
          title: "Délai dépassé",
          description: "Le chargement prend plus de temps que prévu.",
          variant: "destructive"
        });
      } else {
        console.error("Erreur chargement produits:", error);
        setError("Impossible de charger les produits.");
        toast({
          title: "Erreur",
          description: "Impossible de charger les produits.",
          variant: "destructive"
        });
      }
    } finally {
      setIsLoadingProducts(false);
    }
  };

  useEffect(() => { 
    fetchFavorites(); 
  }, []);

  const fetchFavorites = async () => {
    try {
      const response = await api.get('/favoris');
      let favorisData = [];
      if (response?.data?.data) {
        favorisData = Array.isArray(response.data.data) ? response.data.data : [];
      } else if (Array.isArray(response?.data)) {
        favorisData = response.data;
      } else if (response?.data?.favoris) {
        favorisData = response.data.favoris;
      }
      const favoriteIds = favorisData.map((f: any) => f.produit_id).filter(Boolean);
      setFavorites(favoriteIds);
    } catch (error: any) {
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
    
    if (!produitId) return;
    
    try {
      const isCurrentlyFavorite = favorites.includes(produitId);
      if (isCurrentlyFavorite) {
        await api.delete('/favoris', { data: { produit_id: produitId } });
        setFavorites(favorites.filter(id => id !== produitId));
        toast({ 
          title: "Retiré des favoris", 
          description: "Produit retiré de votre liste" 
        });
      } else {
        await api.post('/favoris', { produit_id: produitId });
        setFavorites([...favorites, produitId]);
        toast({ 
          title: "Ajouté aux favoris", 
          description: "Produit ajouté à votre liste" 
        });
      }
    } catch (error: any) {
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

  const getProductImageUrl = (product: any) => {
    if (!product) return "/placeholder-pc.jpg";
    
    try {
      const images = product.images || [];
      if (images.length === 0) return "/placeholder-pc.jpg";
      
      const mainImage = images.find((img: any) => img.ordre === 0) || images[0];
      if (!mainImage?.url) return "/placeholder-pc.jpg";
      
      if (mainImage.url.startsWith('/storage')) {
        return `http://127.0.0.1:8000${mainImage.url}`;
      }
      if (mainImage.url.startsWith('http')) {
        return mainImage.url;
      }
      return `/storage/${mainImage.url}`;
    } catch (error) {
      console.error("Erreur lors du chargement de l'image:", error);
      return "/placeholder-pc.jpg";
    }
  };

  const filterBySearch = (products: Product[], searchTerm: string): Product[] => {
    if (!searchTerm || !products) return products || [];
    const term = searchTerm.toLowerCase();
    return products.filter(product =>
      product?.nom?.toLowerCase().includes(term) ||
      product?.description_courte?.toLowerCase().includes(term) ||
      product?.description?.toLowerCase().includes(term) ||
      product?.reference?.toLowerCase().includes(term)
    );
  };

  const searchSousCategory = searchParams.get("sous_categorie") || "";

  const filtered = useMemo(() => {
    if (!allProducts || allProducts.length === 0) {
      return [];
    }
    
    let list = [...allProducts];
    
    // FILTRE OBLIGATOIRE : UNIQUEMENT LA CATÉGORIE "PRO"
    if (proCategoryId !== null) {
      list = list.filter(product => 
        product?.categorie_id === proCategoryId || 
        product?.categorie?.id === proCategoryId
      );
    } else {
      return [];
    }
    
    if (q) list = filterBySearch(list, q);
    if (searchNom) {
      list = list.filter(product => 
        product?.nom?.toLowerCase().includes(searchNom.toLowerCase())
      );
    }
    if (searchRef) {
      list = list.filter(product => 
        product?.reference?.toLowerCase().includes(searchRef.toLowerCase())
      );
    }
    
    if (searchSousCategory) {
      const sousCatId = parseInt(searchSousCategory, 10);
      list = list.filter(product => 
        product?.id_sous_categorie === sousCatId || 
        (product as any)?.sous_categorie?.id === sousCatId
      );
    }
    
    list = list.filter((p) => (p?.prix || 0) <= budget);
    
    if (sort === "asc") {
      list = [...list].sort((a, b) => (a?.prix || 0) - (b?.prix || 0));
    }
    if (sort === "desc") {
      list = [...list].sort((a, b) => (b?.prix || 0) - (a?.prix || 0));
    }
    
    return list;
  }, [allProducts, q, sort, budget, searchNom, searchRef, searchSousCategory, proCategoryId]);

  // Charger les voix disponibles
  useEffect(() => {
    if (typeof window !== 'undefined') {
      speechSynthesisRef.current = window.speechSynthesis;
      
      const loadVoices = () => {
        try {
          const voices = speechSynthesisRef.current?.getVoices() || [];
          const frenchMaleVoice = voices.find(voice =>
            (voice.lang === 'fr-FR' || voice.lang === 'fr') &&
            (voice.name.toLowerCase().includes('male') || 
             voice.name.toLowerCase().includes('homme') || 
             voice.name.toLowerCase().includes('thomas'))
          );
          const frenchVoice = voices.find(voice => voice.lang === 'fr-FR' || voice.lang === 'fr');
          setSelectedVoice(frenchMaleVoice || frenchVoice || null);
        } catch (error) {
          console.warn("Erreur lors du chargement des voix:", error);
        }
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
    }
  }, []);

  const speakText = (text: string, onEnd?: () => void) => {
    if (!speechSynthesisRef.current || !text) return;
    
    try {
      const cleanText = text.replace(/[*_~`]/g, '').replace(/[🐧👋🎯✅🚚💰🏠💪⭐]/g, '');
      if (currentUtteranceRef.current) {
        speechSynthesisRef.current.cancel();
      }
      
      const utterance = new SpeechSynthesisUtterance(cleanText);
      utterance.lang = 'fr-FR';
      utterance.rate = 0.9;
      utterance.pitch = 0.8;
      utterance.volume = 1;
      if (selectedVoice) utterance.voice = selectedVoice;
      
      utterance.onstart = () => setIsSpeaking(true);
      utterance.onend = () => { 
        setIsSpeaking(false); 
        if (onEnd) onEnd(); 
      };
      utterance.onerror = () => {
        setIsSpeaking(false);
        console.warn("Erreur de synthèse vocale");
      };
      
      currentUtteranceRef.current = utterance;
      speechSynthesisRef.current.speak(utterance);
    } catch (error) {
      console.warn("Erreur lors de la synthèse vocale:", error);
    }
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
    const message = "🐧 *Je saute sur place* Bienvenue dans le catalogue Pro Les Casaniers ! *montre l'écran* Ici tu ne vois que les produits de la gamme Pro, conçus pour les professionnels. *sourit* Passe ta souris sur n'importe quel produit, je te le présente. Besoin d'aide pour choisir ?";
    setCurrentMessage(message);
    speakText(message);
  };

  const handleHelpClick = () => {
    setShowHelp(!showHelp);
    if (!showHelp) {
      const message = "🐧 *Je m'approche* Voici un petit guide ! *pointe* Tu es dans la gamme Pro, des produits haut de gamme pour les professionnels. *montre le curseur* Le curseur de budget ajuste les prix. *pointe les produits* Et chaque carte produit a un bouton cœur pour les favoris ! Des questions ?";
      setCurrentMessage(message);
      speakText(message);
    }
  };

  const speakAboutProduct = (product: Product) => {
    if (!product) return;
    
    try {
      const cpu = productSpec(product, "processeur") || "une configuration equilibree";
      const gpu = productSpec(product, "carte_graphique") || "des composants adaptes";
      const message = `Bienvenue sur ${product.nom || 'ce produit'}. ${product.description_courte || product.tagline || ""} C'est du ${product.categorie?.nom || product.type_produit || 'matériel professionnel'}, avec ${cpu} et ${gpu}. A partir de ${formatAr(product.prix || 0)}.`;
      setCurrentMessage(message);
      speakText(message);
    } catch (error) {
      console.warn("Erreur lors de la présentation du produit:", error);
    }
  };

  // Fonction pour ouvrir WhatsApp avec le produit
  const openWhatsApp = (product: Product, e?: React.MouseEvent) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }
    
    const message = `Bonjour, je suis intéressé par le produit : ${product.nom || 'Produit'}\nRéférence : ${product.reference || 'N/A'}\nPrix : ${formatAr(product.prix || 0)}\n\nPouvez-vous me donner plus d'informations ?`;
    const encodedMessage = encodeURIComponent(message);
    const whatsappUrl = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodedMessage}`;
    window.open(whatsappUrl, '_blank');
  };

  // Fonction pour ouvrir le super configurateur
  const openSuperConfigurateur = (product: Product, e?: React.MouseEvent) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }
    // Rediriger vers le configurateur avec le produit pré-sélectionné
    window.location.href = `/configurateur?produit=${product.id}`;
  };

  const proCategoryName = categories?.find(cat => cat.id === proCategoryId)?.nom || "Pro";

  return (
    <SiteLayout>
      <MiniHero
        title={`Gamme ${proCategoryName} — Performance professionnelle`}
        description="Des machines puissantes et fiables, conçues pour les professionnels exigeants."
        bg="5.png"
        pill={{ icon: <Filter className="h-3.5 w-3.5" />, label: `Catalogue ${proCategoryName}` }}
      />

      {/* Barre de navigation */}
      <nav className="sticky top-16 z-30 border-b border-border bg-background/80 backdrop-blur-md">
        <div className="container-x py-3">
          <div className="hidden sm:flex items-center gap-2 overflow-x-auto scrollbar-none">
            <Filter className="h-4 w-4 text-[#c8a96e] shrink-0 mr-1" />
            <span className="text-xs font-semibold text-primary px-2 py-1 rounded-full bg-primary/10">
              {proCategoryName}
            </span>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-2 sm:hidden">
            <span className="text-xs font-semibold text-primary px-2 py-2 rounded-full bg-primary/10 text-center">
              {proCategoryName}
            </span>
          </div>
        </div>
      </nav>

      {/* Barre de recherche et tri */}
      <section className="border-b border-border bg-background/50">
        <div className="container-x py-3">
          <div className="flex flex-wrap items-center gap-2">
            <div className="relative flex-1 min-w-[200px]">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
              <input
                value={q} 
                onChange={(e) => setQ(e.target.value)}
                placeholder="Rechercher dans la gamme Pro..."
                className="w-full h-8 pl-8 pr-3 rounded-full bg-secondary/50 text-xs border border-transparent focus:border-primary/30 focus:outline-none transition-all"
              />
            </div>
            <div className="flex items-center gap-2">
              <SlidersHorizontal className="h-3 w-3 text-muted-foreground hidden sm:block" />
              <input
                type="range" 
                min={1500000} 
                max={15000000} 
                step={500000} 
                value={budget}
                onChange={(e) => setBudget(Number(e.target.value))}
                className="accent-primary w-28 h-1"
              />
              <span className="text-[10px] font-mono text-muted-foreground">{formatAr(budget)}</span>
            </div>
            <select 
              value={sort} 
              onChange={(e) => setSort(e.target.value as "pop" | "asc" | "desc")}
              className="h-8 rounded-full bg-secondary/50 px-3 text-xs border border-transparent focus:border-primary/30 focus:outline-none"
            >
              <option value="pop">Populaire</option>
              <option value="asc">Prix ↑</option>
              <option value="desc">Prix ↓</option>
            </select>
            <button
              onClick={handleHelpClick}
              className="h-8 w-8 rounded-full bg-secondary/50 flex items-center justify-center hover:bg-primary/10 transition-all"
              aria-label="Aide"
            >
              <HelpCircle className="h-3.5 w-3.5 text-muted-foreground" />
            </button>
            {isLoadingProducts && <Loader2 className="h-4 w-4 animate-spin text-primary" />}
          </div>
        </div>
      </section>

      {/* Active Search Filters Indicator */}
      {(searchNom || searchRef || searchSousCategory) && (
        <div className="container-x pt-4">
          <div className="flex flex-wrap items-center gap-2 p-2 bg-primary/5 border border-primary/20 rounded-lg">
            <span className="text-[10px] font-semibold uppercase tracking-wider text-primary">Filtres actifs :</span>
            <div className="flex flex-wrap gap-1.5">
              <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-primary/10 text-primary text-[10px] rounded-full">
                Gamme {proCategoryName}
              </span>
              {searchNom && (
                <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-secondary text-foreground text-[10px] rounded-full">
                  Nom: {searchNom}
                  <button 
                    onClick={() => { 
                      const np = new URLSearchParams(searchParams); 
                      np.delete("nom"); 
                      setSearchParams(np); 
                    }} 
                    className="hover:text-red-500"
                    aria-label="Supprimer le filtre nom"
                  >
                    <X className="h-2.5 w-2.5" />
                  </button>
                </span>
              )}
              {searchRef && (
                <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-secondary text-foreground text-[10px] rounded-full">
                  Réf: {searchRef}
                  <button 
                    onClick={() => { 
                      const np = new URLSearchParams(searchParams); 
                      np.delete("ref"); 
                      setSearchParams(np); 
                    }} 
                    className="hover:text-red-500"
                    aria-label="Supprimer le filtre référence"
                  >
                    <X className="h-2.5 w-2.5" />
                  </button>
                </span>
              )}
              {searchSousCategory && (
                <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-secondary text-foreground text-[10px] rounded-full">
                  Sous-catégorie active
                  <button 
                    onClick={() => { 
                      const np = new URLSearchParams(searchParams); 
                      np.delete("sous_categorie"); 
                      setSearchParams(np); 
                    }} 
                    className="hover:text-red-500"
                    aria-label="Supprimer le filtre sous-catégorie"
                  >
                    <X className="h-2.5 w-2.5" />
                  </button>
                </span>
              )}
            </div>
            <button 
              onClick={() => { 
                const params = new URLSearchParams();
                if (proCategoryId) params.set("categorie", String(proCategoryId));
                setSearchParams(params);
                setQ("");
              }} 
              className="ml-auto text-[10px] text-muted-foreground hover:text-primary underline"
            >
              Réinitialiser
            </button>
          </div>
        </div>
      )}

      {/* Grille produits avec boutons WhatsApp et Super Configurateur */}
      <section className="container-x py-6">
        <div className="text-[11px] text-muted-foreground mb-4 flex items-center justify-between">
          <span>
            {isLoadingProducts ? "Chargement..." : 
             error ? "❌ Erreur de chargement" :
             `${filtered.length} produit(s) dans la gamme ${proCategoryName}`}
          </span>
          {showHelp && (
            <div className="card-soft p-2 max-w-md animate-fade-up">
              <div className="flex items-start gap-2 text-[10px]">
                <span className="text-sm">🐧</span>
                <p className="text-muted-foreground">Tu es dans la gamme Pro ! Utilise les filtres pour affiner ta recherche. Passe ta souris sur un produit pour que je te le présente !</p>
              </div>
            </div>
          )}
        </div>

        {isLoadingProducts ? (
          <div className="flex flex-col items-center justify-center py-12 gap-3">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
            <p className="text-xs text-muted-foreground">Chargement des produits Pro...</p>
          </div>
        ) : error ? (
          <div className="card-soft p-12 text-center">
            <div className="text-6xl mb-4">⚠️</div>
            <p className="font-bold text-lg mb-2 text-red-500">Erreur</p>
            <p className="text-xs text-muted-foreground mb-4">{error}</p>
            <Button onClick={fetchAllProducts} variant="outline" size="sm">
              Réessayer
            </Button>
          </div>
        ) : proCategoryId === null ? (
          <div className="card-soft p-12 text-center">
            <div className="text-6xl mb-4">⏳</div>
            <p className="font-bold text-lg mb-2">Chargement de la gamme Pro</p>
            <p className="text-xs text-muted-foreground">Veuillez patienter...</p>
          </div>
        ) : filtered.length === 0 ? (
          <div className="card-soft p-12 text-center">
            <div className="text-6xl mb-4">🔍</div>
            <p className="font-bold text-lg mb-1">Aucun produit Pro trouvé</p>
            <p className="text-xs text-muted-foreground">
              {q || searchNom || searchRef || searchSousCategory ? 
                "Essayez de modifier vos critères de recherche." : 
                "Aucun produit disponible dans la gamme Pro pour le moment."}
            </p>
            {(q || searchNom || searchRef || searchSousCategory) && (
              <Button 
                onClick={() => {
                  setQ("");
                  const params = new URLSearchParams();
                  if (proCategoryId) params.set("categorie", String(proCategoryId));
                  setSearchParams(params);
                }} 
                variant="outline" 
                size="sm" 
                className="mt-4"
              >
                Réinitialiser les filtres
              </Button>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
            {filtered.map((p: Product, i: number) => {
              const fav = favorites.includes(p.id);
              return (
                <article
                  key={p.id || i}
                  className="group bg-card border border-border/50 rounded-xl overflow-hidden hover:shadow-md hover:-translate-y-0.5 transition-all duration-200 cursor-pointer"
                  style={{ animationDelay: `${i * 30}ms` }}
                  onMouseEnter={() => speakAboutProduct(p)}
                >
                  <Link to={`/produit/${p.id}`} className="block relative aspect-square overflow-hidden bg-secondary/30">
                    <img
                      src={getProductImageUrl(p)}
                      alt={p.nom || 'Produit'}
                      loading="lazy"
                      className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                      onError={(e) => { 
                        (e.target as HTMLImageElement).src = "/placeholder-pc.jpg"; 
                      }}
                    />
                    {p.badge && (
                      <span className="absolute top-1.5 left-1.5 text-[8px] font-semibold bg-gradient-to-r from-primary to-accent text-white px-1.5 py-0.5 rounded-full">
                        {p.badge}
                      </span>
                    )}
                    <span className="absolute top-1.5 right-1.5 text-[8px] font-semibold bg-blue-600 text-white px-1.5 py-0.5 rounded-full">
                      Pro
                    </span>
                    <button
                      onClick={(e) => toggleFavorite(p.id, e)}
                      className={`absolute bottom-1.5 right-1.5 h-6 w-6 rounded-full flex items-center justify-center backdrop-blur-sm transition-all ${
                        fav ? "bg-primary text-white" : "bg-black/50 text-white/80 hover:bg-primary/80"
                      }`}
                      aria-label={fav ? "Retirer des favoris" : "Ajouter aux favoris"}
                    >
                      <Heart className={`h-3 w-3 ${fav ? "fill-current" : ""}`} />
                    </button>
                  </Link>
                  <div className="p-2.5 space-y-1.5">
                    <div className="flex items-start justify-between gap-1">
                      <div className="flex-1 min-w-0">
                        <div className="text-[8px] font-mono uppercase text-primary/70">
                          {p.reference?.split('-')[0] || p.categorie?.nom || 'Pro'}
                        </div>
                        <h3 className="font-semibold text-xs leading-tight truncate">
                          {p.nom || 'Produit sans nom'}
                        </h3>
                      </div>
                      <div className="flex items-center gap-0.5 shrink-0">
                        <Star className="h-2.5 w-2.5 fill-primary text-primary" />
                        <span className="text-[9px] font-medium">{p.note || 5.0}</span>
                      </div>
                    </div>
                    <p className="text-[9px] text-muted-foreground line-clamp-2 leading-relaxed">
                      {p.description_courte || p.tagline || 'Produit professionnel'}
                    </p>
                    <div className="flex flex-wrap gap-1">
                      {productSpec(p, "processeur") && (
                        <span className="text-[8px] bg-secondary px-1.5 py-0.5 rounded-full">
                          {productSpec(p, "processeur")?.slice(0, 12)}
                        </span>
                      )}
                      {productSpec(p, "carte_graphique") && (
                        <span className="text-[8px] bg-secondary px-1.5 py-0.5 rounded-full">
                          {productSpec(p, "carte_graphique")?.slice(0, 12)}
                        </span>
                      )}
                    </div>
                    
                    {/* Prix et boutons d'action */}
                    <div className="space-y-1.5 pt-1">
                      <div className="flex items-center justify-between">
                        <div>
                          <span className="text-[9px] text-muted-foreground">à partir de</span>
                          <div className="font-bold text-xs">{formatAr(p.prix || 0)}</div>
                        </div>
                    
                      </div>

                      {/* Boutons WhatsApp et Super Configurateur */}
                      <div className="flex gap-1.5">
                        <Button
                          variant="outline"
                          size="sm"
                          className="flex-1 h-6 px-1.5 text-[8px] border-green-500/50 text-green-600 hover:bg-green-50 hover:text-green-700 dark:hover:bg-green-950/30"
                          onClick={(e) => openWhatsApp(p, e)}
                        >
                          <MessageCircle className="h-3 w-3 mr-0.5" />
                          WhatsApp
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          className="flex-1 h-6 px-1.5 text-[8px] border-amber-500/50 text-amber-600 hover:bg-amber-50 hover:text-amber-700 dark:hover:bg-amber-950/30"
                          onClick={(e) => openSuperConfigurateur(p, e)}
                        >
                          <Settings className="h-3 w-3 mr-0.5" />
                          Super Config
                        </Button>
                      </div>
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
        <div className="fixed bottom-6 right-6 z-50 w-80 bg-background rounded-xl shadow-xl border border-border overflow-hidden animate-slide-up">
          <div className="bg-gradient-to-r from-primary/90 to-accent/90 text-white p-3 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <img src={fosa} alt="Casio" className="h-8 w-8 rounded-full object-contain bg-white/10 p-1" />
              <div>
                <div className="font-bold text-xs">Casio 🐧</div>
                <div className="text-[8px] opacity-80">{isSpeaking ? "🎙️ Parle..." : "🎧 Prêt"}</div>
              </div>
            </div>
            <div className="flex gap-1">
              {isSpeaking && (
                <button 
                  onClick={stopSpeaking} 
                  className="p-1 rounded hover:bg-white/10"
                  aria-label="Arrêter la parole"
                >
                  <VolumeX className="h-3 w-3" />
                </button>
              )}
              <button 
                onClick={() => setIsChatOpen(false)} 
                className="p-1 rounded hover:bg-white/10"
                aria-label="Fermer le chat"
              >
                <X className="h-3 w-3" />
              </button>
            </div>
          </div>
          <div className="p-3 bg-secondary/20">
            <div className="bg-card rounded-xl p-2 shadow-sm border border-border">
              <div className="text-[10px] leading-relaxed whitespace-pre-wrap">
                {currentMessage || "🐧 Salut ! Je suis Casio, ton guide pour la gamme Pro. Passe ta souris sur les produits, je te les présente !"}
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
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes fade-up {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-slide-up { animation: slide-up 0.3s ease-out both; }
        .animate-fade-up { animation: fade-up 0.3s ease-out both; }
      `}</style>
    </SiteLayout>
  );
};

export default Profreelance;  