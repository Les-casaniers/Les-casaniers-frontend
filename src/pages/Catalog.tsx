import { SiteLayout } from "@/components/site/SiteLayout";
import { formatAr } from "@/lib/products";
import { useShop } from "@/store/shop";
import { Link, useSearchParams } from "react-router-dom";
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
  Loader2,
  ChevronRight,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "@/hooks/use-toast";
import fosa from "@/assets/casaniers-mascot.png";
import {
  Product,
  productImage,
  productSpec,
  useProducts,
  useCategories,
} from "@/hooks/useProducts";
import { MiniHero } from "@/components/layout/MiniHero";
import api from "@/service/api";
import { useCartApi } from "@/hooks/useCartApi";

// Colors for dynamic category filters (cycling through some presets or using a primary color)
const getFilterColorClass = (index: number) => {
  const colors = [
    "text-purple-500 border-purple-500/30 hover:bg-purple-500/10",
    "text-blue-500 border-blue-500/30 hover:bg-blue-500/10",
    "text-amber-500 border-amber-500/30 hover:bg-amber-500/10",
    "text-teal-500 border-teal-500/30 hover:bg-teal-500/10",
    "text-rose-500 border-rose-500/30 hover:bg-rose-500/10",
  ];
  return colors[index % colors.length];
};

const Catalog = () => {
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
  const speechSynthesisRef = useRef<SpeechSynthesis | null>(null);
  const currentUtteranceRef = useRef<SpeechSynthesisUtterance | null>(null);
  const [selectedVoice, setSelectedVoice] =
    useState<SpeechSynthesisVoice | null>(null);

  useEffect(() => {
    document.title = "Catalogue PC sur-mesure — Les Casaniers Madagascar";
    fetchAllProducts();
  }, []);

  const fetchAllProducts = async () => {
    try {
      setIsLoadingProducts(true);
      const response = await api.get("/produits", {
        params: { per_page: 1000 },
      });
      let products = [];
      if (response.data.data)
        products = Array.isArray(response.data.data) ? response.data.data : [];
      else if (Array.isArray(response.data)) products = response.data;
      setAllProducts(products);
    } catch (error) {
      console.error("Erreur chargement produits:", error);
    } finally {
      setIsLoadingProducts(false);
    }
  };

  useEffect(() => {
    fetchFavorites();
  }, []);

  const fetchFavorites = async () => {
    try {
      const response = await api.get("/favoris");
      let favorisData = [];
      if (response.data.data)
        favorisData = Array.isArray(response.data.data)
          ? response.data.data
          : [];
      else if (Array.isArray(response.data)) favorisData = response.data;
      else if (response.data.favoris) favorisData = response.data.favoris;
      const favoriteIds = favorisData.map((f: any) => f.produit_id);
      setFavorites(favoriteIds);
    } catch (error: any) {
      if (error.response?.status !== 401)
        console.error("Erreur chargement favoris:", error);
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
        await api.delete("/favoris", { data: { produit_id: produitId } });
        setFavorites(favorites.filter((id) => id !== produitId));
        toast({
          title: "Retiré des favoris",
          description: "Produit retiré de votre liste",
        });
      } else {
        await api.post("/favoris", { produit_id: produitId });
        setFavorites([...favorites, produitId]);
        toast({
          title: "Ajouté aux favoris",
          description: "Produit ajouté à votre liste",
        });
      }
    } catch (error: any) {
      if (error.response?.status === 401) {
        toast({
          title: "Connexion requise",
          description: "Veuillez vous connecter pour ajouter aux favoris",
          variant: "destructive",
        });
      } else {
        toast({
          title: "Erreur",
          description: "Une erreur est survenue",
          variant: "destructive",
        });
      }
    }
  };

  const getProductImageUrl = (product: any) => {
    if (!product) return "/placeholder-pc.jpg";
    const images = product.images || [];
    if (images.length === 0) return "/placeholder-pc.jpg";
    const mainImage = images.find((img: any) => img.ordre === 0) || images[0];
    if (!mainImage?.url) return "/placeholder-pc.jpg";
    if (mainImage.url.startsWith("/storage"))
      return `http://127.0.0.1:8000${mainImage.url}`;
    return mainImage.url;
  };

  const filterBySearch = (
    products: Product[],
    searchTerm: string,
  ): Product[] => {
    if (!searchTerm) return products;
    const term = searchTerm.toLowerCase();
    return products.filter(
      (product) =>
        product.nom?.toLowerCase().includes(term) ||
        product.description_courte?.toLowerCase().includes(term) ||
        product.description?.toLowerCase().includes(term) ||
        product.reference?.toLowerCase().includes(term),
    );
  };

  const searchSousCategory = searchParams.get("sous_categorie") || "";

  const filtered = useMemo(() => {
    let list = [...allProducts];
    if (q) list = filterBySearch(list, q);
    if (searchNom)
      list = list.filter((product) =>
        product.nom?.toLowerCase().includes(searchNom.toLowerCase()),
      );
    if (searchRef)
      list = list.filter((product) =>
        product.reference?.toLowerCase().includes(searchRef.toLowerCase()),
      );
    if (searchCategory) {
      const catId = parseInt(searchCategory, 10);
      list = list.filter(
        (product) =>
          product.categorie_id === catId || product.categorie?.id === catId,
      );
    }
    if (searchSousCategory) {
      const sousCatId = parseInt(searchSousCategory, 10);
      list = list.filter(
        (product) =>
          product.id_sous_categorie === sousCatId ||
          (product as any).sous_categorie?.id === sousCatId,
      );
    }
    list = list.filter((p) => p.prix <= budget);
    if (sort === "asc") list = [...list].sort((a, b) => a.prix - b.prix);
    if (sort === "desc") list = [...list].sort((a, b) => b.prix - a.prix);
    return list;
  }, [
    allProducts,
    q,
    sort,
    budget,
    searchNom,
    searchRef,
    searchCategory,
    searchSousCategory,
  ]);

  return (
    <SiteLayout>
      <MiniHero
        title="Trouvez la machine qui vous correspond."
        description="Filtres intelligents, comparaisons instantanées, et le Fosa qui veille sur vos choix."
        bg="5.png"
        pill={{ icon: <Filter className="h-3.5 w-3.5" />, label: "Catalogue" }}
      />

      {/* Barre de navigation filtres - style comme Gaming */}
      <nav className="sticky top-16 z-30 border-b border-border bg-background/80 backdrop-blur-md">
        <div className="container-x py-3">
          {/* Mobile : grille responsive */}
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-2 sm:hidden">
            <button
              onClick={() => {
                const params = new URLSearchParams(searchParams);
                params.delete("categorie");
                params.delete("sous_categorie");
                setSearchParams(params);
              }}
              className={`text-xs font-semibold px-2 py-2 rounded-full border transition-all text-center ${
                !searchCategory
                  ? "text-gray-500 border-gray-500/30 bg-gray-500/10"
                  : "text-gray-500 border-gray-500/30 opacity-60 hover:opacity-100 hover:bg-gray-500/10"
              }`}
            >
              Tout
            </button>
            {categories?.map((category, idx) => {
              const isActive = searchCategory === String(category.id);
              const colorClass = getFilterColorClass(idx);
              return (
                <button
                  key={category.id}
                  onClick={() => {
                    const params = new URLSearchParams(searchParams);
                    params.set("categorie", String(category.id));
                    params.delete("sous_categorie");
                    setSearchParams(params);
                  }}
                  className={`text-xs font-semibold px-2 py-2 rounded-full border transition-all text-center ${
                    isActive
                      ? `${colorClass} bg-opacity-10 border-opacity-60`
                      : `${colorClass} opacity-60 hover:opacity-100`
                  }`}
                >
                  {category.nom}
                </button>
              );
            })}
          </div>

          {/* Desktop : ligne horizontale */}
          <div className="hidden sm:flex items-center gap-2 overflow-x-auto scrollbar-none">
            <Filter className="h-4 w-4 text-[#c8a96e] shrink-0 mr-1" />
            <button
              onClick={() => {
                const params = new URLSearchParams(searchParams);
                params.delete("categorie");
                params.delete("sous_categorie");
                setSearchParams(params);
              }}
              className={`shrink-0 text-xs font-semibold px-4 py-1.5 rounded-full border transition-all ${
                !searchCategory
                  ? "text-gray-500 border-gray-500/30 bg-gray-500/10"
                  : "text-gray-500 border-gray-500/30 opacity-60 hover:opacity-100 hover:bg-gray-500/10"
              }`}
            >
              Tout
            </button>
            {categories?.map((category, idx) => {
              const isActive = searchCategory === String(category.id);
              const colorClass = getFilterColorClass(idx);
              return (
                <button
                  key={category.id}
                  onClick={() => {
                    const params = new URLSearchParams(searchParams);
                    params.set("categorie", String(category.id));
                    params.delete("sous_categorie");
                    setSearchParams(params);
                  }}
                  className={`shrink-0 text-xs font-semibold px-4 py-1.5 rounded-full border transition-all ${
                    isActive
                      ? `${colorClass} bg-opacity-10 border-opacity-60`
                      : `${colorClass} opacity-60 hover:opacity-100`
                  }`}
                >
                  {category.nom}
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
            <div className="relative flex-1 min-w-[200px]">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
              <input
                value={q}
                onChange={(e) => setQ(e.target.value)}
                placeholder="Rechercher..."
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
              <span className="text-[10px] font-mono text-muted-foreground">
                {formatAr(budget)}
              </span>
            </div>
            <select
              value={sort}
              onChange={(e) => setSort(e.target.value as never)}
              className="h-8 rounded-full bg-secondary/50 px-3 text-xs border border-transparent focus:border-primary/30 focus:outline-none"
            >
              <option value="pop">Populaire</option>
              <option value="asc">Prix ↑</option>
              <option value="desc">Prix ↓</option>
            </select>
            {isLoadingProducts && (
              <Loader2 className="h-4 w-4 animate-spin text-primary" />
            )}
          </div>
        </div>
      </section>

      {/* Active Search Filters Indicator */}
      {(searchNom || searchRef || searchCategory || searchSousCategory) && (
        <div className="container-x pt-4">
          <div className="flex flex-wrap items-center gap-2 p-2 bg-primary/5 border border-primary/20 rounded-lg">
            <span className="text-[10px] font-semibold uppercase tracking-wider text-primary">
              Filtres actifs :
            </span>
            <div className="flex flex-wrap gap-1.5">
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
                  >
                    <X className="h-2.5 w-2.5" />
                  </button>
                </span>
              )}
              {searchCategory && (
                <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-secondary text-foreground text-[10px] rounded-full">
                  Catégorie:{" "}
                  {categories?.find((c) => String(c.id) === searchCategory)
                    ?.nom || searchCategory}
                  <button
                    onClick={() => {
                      const np = new URLSearchParams(searchParams);
                      np.delete("categorie");
                      np.delete("sous_categorie");
                      setSearchParams(np);
                    }}
                    className="hover:text-red-500"
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
                  >
                    <X className="h-2.5 w-2.5" />
                  </button>
                </span>
              )}
            </div>
            <button
              onClick={() => setSearchParams({})}
              className="ml-auto text-[10px] text-muted-foreground hover:text-primary underline"
            >
              Réinitialiser
            </button>
          </div>
        </div>
      )}

      {/* Grille produits - cartes compactes */}
      <section className="container-x py-6">
        <div className="text-[11px] text-muted-foreground mb-4 flex items-center justify-between">
          <span>{filtered.length} produit(s)</span>
          {showHelp && (
            <div className="card-soft p-2 max-w-md animate-fade-up">
              <div className="flex items-start gap-2 text-[10px]">
                <span className="text-sm">🐧</span>
                <p className="text-muted-foreground">
                  Utilise les filtres pour trouver ton bonheur ! Passe ta souris
                  sur un produit pour que je te le présente !
                </p>
              </div>
            </div>
          )}
        </div>

        {isLoadingProducts ? (
          <div className="flex flex-col items-center justify-center py-12 gap-3">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
            <p className="text-xs text-muted-foreground">Chargement...</p>
          </div>
        ) : filtered.length === 0 ? (
          <div className="card-soft p-8 text-center">
            <p className="font-bold text-lg mb-1">Aucun résultat</p>
            <p className="text-xs text-muted-foreground">
              Essayez d'élargir votre budget ou de changer de catégorie.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
            {filtered.map((p: Product, i: number) => {
              const fav = favorites.includes(p.id);
              return (
                <article
                  key={p.id}
                  className="group bg-card border border-border/50 rounded-xl overflow-hidden hover:shadow-md hover:-translate-y-0.5 transition-all duration-200 cursor-pointer"
                  style={{ animationDelay: `${i * 30}ms` }}
                >
                  <Link
                    to={`/produit/${p.id}`}
                    className="block relative aspect-square overflow-hidden bg-secondary/30"
                  >
                    <img
                      src={getProductImageUrl(p)}
                      alt={p.nom}
                      loading="lazy"
                      className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                      onError={(e) => {
                        (e.target as HTMLImageElement).src =
                          "/placeholder-pc.jpg";
                      }}
                    />
                    {p.badge && (
                      <span className="absolute top-1.5 left-1.5 text-[8px] font-semibold bg-gradient-to-r from-primary to-accent text-white px-1.5 py-0.5 rounded-full">
                        {p.badge}
                      </span>
                    )}
                    <button
                      onClick={(e) => toggleFavorite(p.id, e)}
                      className={`absolute bottom-1.5 right-1.5 h-6 w-6 rounded-full flex items-center justify-center backdrop-blur-sm transition-all ${fav ? "bg-primary text-white" : "bg-black/50 text-white/80 hover:bg-primary/80"}`}
                    >
                      <Heart
                        className={`h-3 w-3 ${fav ? "fill-current" : ""}`}
                      />
                    </button>
                  </Link>
                  <div className="p-2.5 space-y-1.5">
                    <div className="flex items-start justify-between gap-1">
                      <div className="flex-1 min-w-0">
                        <div className="text-[8px] font-mono uppercase text-primary/70">
                          {p.reference?.split("-")[0] || p.categorie?.nom}
                        </div>
                        <h3 className="font-semibold text-xs leading-tight truncate">
                          {p.nom}
                        </h3>
                      </div>
                      <div className="flex items-center gap-0.5 shrink-0">
                        <Star className="h-2.5 w-2.5 fill-primary text-primary" />
                        <span className="text-[9px] font-medium">
                          {p.note || 5.0}
                        </span>
                      </div>
                    </div>
                    <p className="text-[9px] text-muted-foreground line-clamp-2 leading-relaxed">
                      {p.description_courte ||
                        p.tagline ||
                        "Produit exceptionnel"}
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
                    <div className="flex items-center justify-between pt-1">
                      <div>
                        <span className="text-[9px] text-muted-foreground">
                          à partir de
                        </span>
                        <div className="font-bold text-xs">
                          {formatAr(p.prix)}
                        </div>
                      </div>
                      {/* <Button
                        variant="hero"
                        size="sm"
                        className="h-6 px-2 text-[10px]"
                        onClick={async () => { await addToCart(p.id, 1, p.prix, p.nom); toast({ title: "Ajouté", description: p.nom }); }}
                      >
                        <ShoppingBag className="h-3 w-3 mr-1" /> Ajouter
                      </Button> */}
                      <Button
                        variant="hero"
                        size="sm"
                        className="h-6 px-2 text-[10px]"
                        onClick={async (e) => {
                          e.stopPropagation();
                          // ✅ Appel correct avec les bons paramètres
                          await addToCart({
                            produit_id: p.id,
                            quantite: 1,
                            prix_unitaire: p.prix,
                            titre: p.nom,
                          });
                        }}
                      >
                        <ShoppingBag className="h-3 w-3 mr-1" /> Ajouter
                      </Button>
                    </div>
                  </div>
                </article>
              );
            })}
          </div>
        )}
      </section>

      <style>{`
        @keyframes slide-up {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-slide-up { animation: slide-up 0.3s ease-out both; }
      `}</style>
    </SiteLayout>
  );
};

export default Catalog;
