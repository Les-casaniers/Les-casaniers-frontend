import {
  Cpu,
  Laptop,
  Droplet,
  Eye,
  ShoppingCart,
  X,
  Loader2,
  Settings,
  SlidersHorizontal,
  ChevronDown,
  Search,
  RotateCcw,
  CheckCircle2,
  PackageX,
} from "lucide-react";
import { useEffect, useState, useRef, useMemo } from "react";
import { createPortal } from "react-dom";
import { useNavigate } from "react-router-dom";
import api from "@/service/api";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "@/hooks/use-toast";

// ─── Types ──────────────────────────────────────────────────────────────────

interface Product {
  id: number;
  categorie_id: number;
  id_sous_categorie?: number;
  reference: string;
  nom: string;
  description_courte: string;
  description: string;
  atout?: string;
  type_produit: string;
  prix: number;
  devise: string;
  quantite_stock: number;
  est_dispo: boolean;
  actif: boolean;
  date_creation: string;
  date_modification: string;
  images?: { id: number; url: string; alt: string; ordre: number }[];
}

interface Category {
  id: number;
  parent_id: number | null;
  nom: string;
  type: string;
  ordre_tri: number;
  date_creation: string;
  date_modification: string;
}

interface SousCategorie {
  id: number;
  categorie_id: number;
  nom: string;
  created_at: string;
  updated_at: string;
}

interface Configuration {
  id: number;
  produit_id: number;
  utilisateur_id: number;
  nom_configuration: string;
  nom_configuration_autre: string | null;
  devise: string;
  prix_total: number;
  composants_json: any;
  date_creation: string;
  date_modification: string;
}

type ProductGroup = "unites-centrales" | "laptops" | "watercooling";

interface ClassifiedProduct extends Product {
  group: ProductGroup;
  sous_categorie_nom?: string;
}

type SortOption = "pertinence" | "prix-asc" | "prix-desc" | "nom-asc" | "nom-desc";

// Mapping des types de catégories vers les groupes
const CATEGORY_TYPE_TO_GROUP: Record<string, ProductGroup> = {
  "unite_centrale": "unites-centrales",
  "laptop": "laptops",
  "watercooling": "watercooling",
};

const GROUP_META: Record<
  ProductGroup,
  { label: string; icon: React.ReactNode; color: string; gradient: string }
> = {
  "unites-centrales": {
    label: "Unités Centrales",
    icon: <Cpu className="h-3.5 w-3.5" />,
    color: "purple",
    gradient: "from-purple-500 to-indigo-500",
  },
  laptops: {
    label: "Laptops Gaming",
    icon: <Laptop className="h-3.5 w-3.5" />,
    color: "blue",
    gradient: "from-blue-500 to-indigo-500",
  },
  watercooling: {
    label: "Watercooling",
    icon: <Droplet className="h-3.5 w-3.5" />,
    color: "cyan",
    gradient: "from-cyan-500 to-teal-500",
  },
};

const SORT_LABELS: Record<SortOption, string> = {
  pertinence: "Pertinence",
  "prix-asc": "Prix croissant",
  "prix-desc": "Prix décroissant",
  "nom-asc": "Nom, A à Z",
  "nom-desc": "Nom, Z à A",
};

const extractFromDescription = (description: string, ...keywords: string[]) => {
  if (!description) return "—";
  for (const keyword of keywords) {
    const regex = new RegExp(`${keyword}[\\s:]*([^\\n,]+)`, "i");
    const match = description.match(regex);
    if (match) return match[1].trim();
  }
  return "—";
};

const formatPrice = (prix: number, devise: string = "MGA") =>
  new Intl.NumberFormat("fr-FR").format(prix) + ` ${devise}`;

const getImageUrl = (product: Product) => {
  const images = product.images || [];
  if (images.length === 0) return null;
  const mainImage = images.find((img) => img.ordre === 0) || images[0];
  if (mainImage?.url) {
    if (mainImage.url.startsWith("/storage")) {
      return `http://127.0.0.1:8000${mainImage.url}`;
    }
    return mainImage.url;
  }
  return null;
};

// ─── Composant principal ────────────────────────────────────────────────────

export const GamingCatalogue = () => {
  const [allProducts, setAllProducts] = useState<ClassifiedProduct[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [sousCategories, setSousCategories] = useState<SousCategorie[]>([]);
  const [selectedSousCategories, setSelectedSousCategories] = useState<Set<number>>(new Set());
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuth();

  // Filtres
  const [activeGroups, setActiveGroups] = useState<Set<ProductGroup>>(
    new Set(["unites-centrales", "laptops", "watercooling"]),
  );
  const [search, setSearch] = useState("");
  const [priceMin, setPriceMin] = useState<string>("");
  const [priceMax, setPriceMax] = useState<string>("");
  const [inStockOnly, setInStockOnly] = useState(false);
  const [sortOption, setSortOption] = useState<SortOption>("pertinence");
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);

  // Modal produit
  const [selectedProduct, setSelectedProduct] = useState<ClassifiedProduct | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [configurations, setConfigurations] = useState<Configuration[]>([]);
  const [isLoadingConfigs, setIsLoadingConfigs] = useState(false);
  const [addingToCart, setAddingToCart] = useState<number | null>(null);

  useEffect(() => {
    fetchAllData();
  }, []);

  useEffect(() => {
    document.body.style.overflow = isModalOpen || mobileFiltersOpen ? "hidden" : "unset";
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [isModalOpen, mobileFiltersOpen]);

  const fetchAllData = async () => {
    try {
      setIsLoading(true);
      setError(null);

      // Charger les catégories
      const categoriesResponse = await api.get("/categories");
      let categoriesData: Category[] = [];
      if (categoriesResponse.data && categoriesResponse.data.data) {
        categoriesData = Array.isArray(categoriesResponse.data.data) ? categoriesResponse.data.data : [];
      } else if (Array.isArray(categoriesResponse.data)) {
        categoriesData = categoriesResponse.data;
      }
      setCategories(categoriesData);

      // Charger les sous-catégories
      const sousCategoriesResponse = await api.get("/sous-categories");
      let sousCategoriesData: SousCategorie[] = [];
      if (sousCategoriesResponse.data && sousCategoriesResponse.data.data) {
        sousCategoriesData = Array.isArray(sousCategoriesResponse.data.data) ? sousCategoriesResponse.data.data : [];
      } else if (Array.isArray(sousCategoriesResponse.data)) {
        sousCategoriesData = sousCategoriesResponse.data;
      }
      setSousCategories(sousCategoriesData);

      // Charger les produits
      const productsResponse = await api.get("/produits", { params: { per_page: 1000 } });
      let rawProducts: Product[] = [];
      if (productsResponse.data && productsResponse.data.data) {
        rawProducts = Array.isArray(productsResponse.data.data) ? productsResponse.data.data : [];
      } else if (Array.isArray(productsResponse.data)) {
        rawProducts = productsResponse.data;
      }

      // Créer un map des catégories par ID
      const categoryMap = new Map<number, Category>();
      categoriesData.forEach(cat => categoryMap.set(cat.id, cat));

      // Créer un map des sous-catégories par ID
      const sousCategorieMap = new Map<number, SousCategorie>();
      sousCategoriesData.forEach(sc => sousCategorieMap.set(sc.id, sc));

      // Classifier les produits
      const classified: ClassifiedProduct[] = [];
      rawProducts
        .filter((p) => p.actif === true)
        .forEach((p) => {
          const category = categoryMap.get(p.categorie_id);
          let group: ProductGroup | null = null;
          
          if (category && category.type) {
            group = CATEGORY_TYPE_TO_GROUP[category.type] || null;
          }
          
          if (!group) {
            if (p.reference?.startsWith("CASE-")) group = "unites-centrales";
            else if (p.reference?.startsWith("PC-")) group = "laptops";
            else if (p.reference?.startsWith("CL-")) group = "watercooling";
          }

          if (group) {
            const sousCategorie = p.id_sous_categorie ? sousCategorieMap.get(p.id_sous_categorie) : null;
            classified.push({ 
              ...p, 
              group, 
              sous_categorie_nom: sousCategorie?.nom 
            });
          }
        });

      console.log("✅ Produits classifiés:", classified);
      console.log("📊 Sous-catégories:", sousCategoriesData);
      console.log("📊 Produits avec sous-catégorie:", classified.filter(p => p.id_sous_categorie).length);
      
      setAllProducts(classified);
    } catch (err: any) {
      console.error("❌ Erreur détaillée:", err);
      setError(`Impossible de charger les données: ${err.response?.data?.message || err.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchConfigurations = async (produitId: number) => {
    try {
      setIsLoadingConfigs(true);
      const response = await api.get("/configurations");

      let allConfigs: Configuration[] = [];
      if (response.data && response.data.data) {
        allConfigs = Array.isArray(response.data.data) ? response.data.data : [];
      } else if (response.data && Array.isArray(response.data)) {
        allConfigs = response.data;
      }

      setConfigurations(
        allConfigs.filter((c) => Number(c.produit_id) === Number(produitId)),
      );
    } catch (err) {
      console.error("Erreur chargement configurations:", err);
      setConfigurations([]);
    } finally {
      setIsLoadingConfigs(false);
    }
  };

  const addToCart = async (product: Product, quantity: number = 1) => {
    if (!isAuthenticated) {
      toast({
        title: "Connexion requise",
        description: "Veuillez vous connecter pour ajouter au panier",
        variant: "destructive",
      });
      navigate("/login");
      return;
    }

    setAddingToCart(product.id);
    try {
      await api.post("/panier/ajouter", {
        produit_id: product.id,
        quantite: quantity,
        utilisateur_id: user?.id,
        prix_unitaire: product.prix,
        titre: product.nom,
      });
      toast({ title: "Ajouté au panier", description: `${quantity} x ${product.nom}` });
    } catch (err: any) {
      console.error("Erreur lors de l'ajout au panier:", err);
      toast({
        title: "Erreur",
        description: err.response?.data?.message || "Impossible d'ajouter au panier",
        variant: "destructive",
      });
    } finally {
      setAddingToCart(null);
    }
  };

  const openModal = async (product: ClassifiedProduct) => {
    setSelectedProduct(product);
    setIsModalOpen(true);
    if (product.group !== "watercooling") {
      await fetchConfigurations(product.id);
    } else {
      setConfigurations([]);
    }
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setSelectedProduct(null);
    setConfigurations([]);
  };

  const toggleGroup = (group: ProductGroup) => {
    setActiveGroups((prev) => {
      const next = new Set(prev);
      if (next.has(group)) next.delete(group);
      else next.add(group);
      return next;
    });
  };

  const toggleSousCategorie = (id: number) => {
    setSelectedSousCategories((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const resetFilters = () => {
    setActiveGroups(new Set(["unites-centrales", "laptops", "watercooling"]));
    setSelectedSousCategories(new Set());
    setSearch("");
    setPriceMin("");
    setPriceMax("");
    setInStockOnly(false);
    setSortOption("pertinence");
  };

  const priceBounds = useMemo(() => {
    if (allProducts.length === 0) return { min: 0, max: 0 };
    const prices = allProducts.map((p) => p.prix);
    return { min: Math.min(...prices), max: Math.max(...prices) };
  }, [allProducts]);

  const filteredProducts = useMemo(() => {
    const searchLower = search.trim().toLowerCase();
    const min = priceMin ? Number(priceMin) : null;
    const max = priceMax ? Number(priceMax) : null;

    let result = allProducts.filter((p) => {
      // Si des sous-catégories sont sélectionnées, on ignore le filtre de groupe
      // pour permettre l'affichage des produits des sous-catégories sélectionnées
      if (selectedSousCategories.size === 0) {
        // Si aucune sous-catégorie sélectionnée, on applique le filtre de groupe
        if (!activeGroups.has(p.group)) return false;
      } else {
        // Si des sous-catégories sont sélectionnées, on filtre d'abord par sous-catégorie
        if (!p.id_sous_categorie || !selectedSousCategories.has(p.id_sous_categorie)) {
          return false;
        }
        // Si une sous-catégorie est sélectionnée, on ignore le filtre de groupe
        // pour afficher tous les produits de cette sous-catégorie
      }

      if (inStockOnly && (!p.est_dispo || p.quantite_stock <= 0)) return false;
      if (min !== null && p.prix < min) return false;
      if (max !== null && p.prix > max) return false;
      
      if (searchLower) {
        const haystack = `${p.nom} ${p.reference}`.toLowerCase();
        if (!haystack.includes(searchLower)) return false;
      }
      
      return true;
    });

    // Appliquer le tri
    switch (sortOption) {
      case "prix-asc":
        result = [...result].sort((a, b) => a.prix - b.prix);
        break;
      case "prix-desc":
        result = [...result].sort((a, b) => b.prix - a.prix);
        break;
      case "nom-asc":
        result = [...result].sort((a, b) => a.nom.localeCompare(b.nom));
        break;
      case "nom-desc":
        result = [...result].sort((a, b) => b.nom.localeCompare(a.nom));
        break;
      default:
        break;
    }

    console.log(`📊 Produits filtrés: ${result.length} sur ${allProducts.length}`);
    if (selectedSousCategories.size > 0) {
      console.log(`🔍 Sous-catégories sélectionnées:`, Array.from(selectedSousCategories));
      console.log(`📝 Produits correspondants:`, result.map(p => ({nom: p.nom, sous_categorie: p.id_sous_categorie})));
    }

    return result;
  }, [allProducts, activeGroups, selectedSousCategories, search, priceMin, priceMax, inStockOnly, sortOption]);

  const groupCounts = useMemo(() => {
    const counts: Record<ProductGroup, number> = {
      "unites-centrales": 0,
      laptops: 0,
      watercooling: 0,
    };
    allProducts.forEach((p) => {
      counts[p.group]++;
    });
    return counts;
  }, [allProducts]);

  const sousCategorieFilters = useMemo(() => {
    const counts = new Map<number, number>();
    allProducts.forEach((p) => {
      if (p.id_sous_categorie) {
        const current = counts.get(p.id_sous_categorie) || 0;
        counts.set(p.id_sous_categorie, current + 1);
      }
    });

    const result = sousCategories
      .map((sc) => ({
        ...sc,
        count: counts.get(sc.id) || 0,
        checked: selectedSousCategories.has(sc.id),
      }))
      .sort((a, b) => a.nom.localeCompare(b.nom));

    return result;
  }, [allProducts, sousCategories, selectedSousCategories]);

  const activeFilterCount =
    (selectedSousCategories.size > 0 ? 1 : 0) +
    (activeGroups.size < 3 && selectedSousCategories.size === 0 ? 1 : 0) +
    (search ? 1 : 0) +
    (priceMin || priceMax ? 1 : 0) +
    (inStockOnly ? 1 : 0);

  // ─── États de chargement / erreur ───────────────────────────────────────

  if (isLoading) {
    return (
      <section className="py-8 bg-secondary/20">
        <div className="container-x">
          <div className="flex items-center gap-2 mb-5">
            <div className="h-6 w-6 bg-secondary animate-pulse rounded-full" />
            <div className="h-6 w-48 bg-secondary animate-pulse rounded" />
          </div>
          <div className="flex gap-6">
            <div className="hidden lg:block w-64 shrink-0 space-y-4">
              <div className="h-40 bg-secondary/50 animate-pulse rounded-xl" />
              <div className="h-32 bg-secondary/50 animate-pulse rounded-xl" />
            </div>
            <div className="flex-1 grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
              {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
                <div key={i} className="bg-card border border-border/50 rounded-xl overflow-hidden animate-pulse">
                  <div className="aspect-square bg-secondary/50" />
                  <div className="p-2.5 space-y-2">
                    <div className="h-3 bg-secondary rounded w-3/4" />
                    <div className="h-2 bg-secondary rounded w-full" />
                    <div className="h-4 bg-secondary rounded w-1/3 mt-2" />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>
    );
  }

  if (error) {
    return (
      <section className="py-8 bg-secondary/20">
        <div className="container-x">
          <div className="bg-red-500/10 border border-red-500 rounded-lg p-6 text-center">
            <p className="text-red-500 text-sm mb-3">{error}</p>
            <button
              onClick={fetchAllData}
              className="px-4 py-1.5 bg-purple-600 text-white text-xs rounded-lg hover:bg-purple-700 transition"
            >
              Réessayer
            </button>
          </div>
        </div>
      </section>
    );
  }

  // ─── Rendu principal ─────────────────────────────────────────────────────

  return (
    <>
    <section className="py-8 bg-secondary/20">
  <div className="w-full max-w-[1700px] mx-auto px-4 sm:px-6 lg:px-8">
          {/*
          <div className="flex items-center justify-between mb-5 gap-3">
            <div className="flex items-center gap-2">
              <div className="h-7 w-7 rounded-lg bg-gradient-to-br from-purple-500 to-indigo-500 flex items-center justify-center shrink-0">
                <Cpu className="h-3.5 w-3.5 text-white" />
              </div>
              <div>
                <h2 className="text-base font-bold">Composants &amp; PC Gaming</h2>
                <p className="text-[10px] text-muted-foreground">
                  Unités centrales, laptops et watercooling pour gamers et streamers
                </p>
              </div>
            </div>
          </div>
          */}

          {/*
          <button
            onClick={() => setMobileFiltersOpen(true)}
            className="lg:hidden flex items-center gap-1.5 px-3 py-2 rounded-lg border border-border bg-background text-xs font-semibold shrink-0"
          >
            <SlidersHorizontal className="h-3.5 w-3.5" />
            Filtres
            {activeFilterCount > 0 && (
              <span className="h-4 min-w-4 px-1 rounded-full bg-purple-600 text-white text-[10px] flex items-center justify-center">
                {activeFilterCount}
              </span>
            )}
          </button>
          */}

          <div className="flex gap-6">
            {/* ── Sidebar filtres (desktop) ── */}
            {/*
            <aside className="hidden lg:block w-64 shrink-0">
              <div className="sticky top-20">
                <FilterPanel
                  activeGroups={activeGroups}
                  toggleGroup={toggleGroup}
                  groupCounts={groupCounts}
                  sousCategories={sousCategorieFilters}
                  toggleSousCategorie={toggleSousCategorie}
                  selectedSousCategories={selectedSousCategories}
                  search={search}
                  setSearch={setSearch}
                  priceMin={priceMin}
                  setPriceMin={setPriceMin}
                  priceMax={priceMax}
                  setPriceMax={setPriceMax}
                  priceBounds={priceBounds}
                  inStockOnly={inStockOnly}
                  setInStockOnly={setInStockOnly}
                  onReset={resetFilters}
                  activeFilterCount={activeFilterCount}
                />
              </div>
            </aside>
            */}

            {/* ── Zone produits ── */}
            <div className="flex-1 min-w-0">
              {/* Barre de tri et textes de pertinence conservés en commentaire. */}
              {/*
              <div className="flex items-center justify-between gap-3 mb-4 pb-3 border-b border-border/50">
                <p className="text-xs text-muted-foreground">
                  <span className="font-semibold text-foreground">{filteredProducts.length}</span>{" "}
                  produit{filteredProducts.length !== 1 ? "s" : ""}
                  {selectedSousCategories.size > 0 && (
                    <span className="ml-2 inline-flex items-center gap-1 px-2 py-0.5 bg-purple-500/10 text-purple-600 rounded-full text-[10px] font-medium">
                      <CheckCircle2 className="h-3 w-3" />
                      {sousCategories
                        .filter(sc => selectedSousCategories.has(sc.id))
                        .map(sc => sc.nom)
                        .join(", ")}
                    </span>
                  )}
                  {selectedSousCategories.size === 0 && activeGroups.size < 3 && (
                    <span className="ml-2 text-[10px] text-muted-foreground">
                      • Filtre de type actif
                    </span>
                  )}
                </p>
              </div>
              */}

              {filteredProducts.length === 0 ? (
                <div className="bg-yellow-500/10 border border-yellow-500 rounded-lg p-8 text-center flex flex-col items-center gap-3">
                  <PackageX className="h-8 w-8 text-yellow-600 dark:text-yellow-400" />
                  <p className="text-yellow-700 dark:text-yellow-400 text-sm font-medium">
                    {selectedSousCategories.size > 0 
                      ? `Aucun produit dans ${sousCategories.filter(sc => selectedSousCategories.has(sc.id)).map(sc => sc.nom).join(", ")}.` 
                      : "Aucun produit ne correspond à ces filtres."}
                  </p>
                  <button
                    onClick={resetFilters}
                    className="text-xs font-semibold text-purple-600 hover:text-purple-700 flex items-center gap-1.5"
                  >
                    <RotateCcw className="h-3 w-3" /> Réinitialiser les filtres
                  </button>
                </div>
              ) : (
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
                  {filteredProducts.map((product, index) => (
                    <ProductCard
                      key={product.id}
                      product={product}
                      index={index}
                      addingToCart={addingToCart}
                      onOpenModal={() => openModal(product)}
                      onAddToCart={() => addToCart(product, 1)}
                    />
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        <style>{`
          @keyframes fade-up {
            from { opacity: 0; transform: translateY(20px); }
            to { opacity: 1; transform: translateY(0); }
          }
          .animate-fade-up {
            animation: fade-up 0.4s cubic-bezier(0.2, 0.9, 0.4, 1.1) forwards;
          }
        `}</style>
      </section>

      {/* ── Drawer filtres mobile désactivé ── */}
      {false && mobileFiltersOpen &&
        createPortal(
          <>
            <div
              className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[9999] animate-in fade-in duration-200"
              onClick={() => setMobileFiltersOpen(false)}
            />
            <div className="fixed top-0 left-0 h-full w-[85%] max-w-xs bg-background z-[10000] shadow-2xl animate-in slide-in-from-left duration-300 overflow-y-auto">
              <div className="sticky top-0 bg-background border-b border-border z-10 flex items-center justify-between p-4">
                <h3 className="text-sm font-bold flex items-center gap-2">
                  <SlidersHorizontal className="h-4 w-4" /> Filtres
                </h3>
                <button
                  onClick={() => setMobileFiltersOpen(false)}
                  className="p-1.5 rounded-full hover:bg-secondary transition-colors"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
              <div className="p-4">
                <FilterPanel
                  activeGroups={activeGroups}
                  toggleGroup={toggleGroup}
                  groupCounts={groupCounts}
                  sousCategories={sousCategorieFilters}
                  toggleSousCategorie={toggleSousCategorie}
                  selectedSousCategories={selectedSousCategories}
                  search={search}
                  setSearch={setSearch}
                  priceMin={priceMin}
                  setPriceMin={setPriceMin}
                  priceMax={priceMax}
                  setPriceMax={setPriceMax}
                  priceBounds={priceBounds}
                  inStockOnly={inStockOnly}
                  setInStockOnly={setInStockOnly}
                  onReset={resetFilters}
                  activeFilterCount={activeFilterCount}
                />
              </div>
              <div className="sticky bottom-0 bg-background border-t border-border p-4">
                <button
                  onClick={() => setMobileFiltersOpen(false)}
                  className="w-full py-2.5 bg-purple-600 text-white text-sm font-semibold rounded-lg hover:bg-purple-700 transition-colors"
                >
                  Voir {filteredProducts.length} résultat{filteredProducts.length !== 1 ? "s" : ""}
                </button>
              </div>
            </div>
          </>,
          document.body,
        )}

      {/* ── Modal produit ── */}
      {isModalOpen &&
        selectedProduct &&
        createPortal(
          <ProductModal
            product={selectedProduct}
            configurations={configurations}
            isLoadingConfigs={isLoadingConfigs}
            onClose={closeModal}
            onAddToCart={() => addToCart(selectedProduct, 1)}
          />,
          document.body,
        )}
    </>
  );
};

// ─── Sous-composant : Panneau de filtres ───────────────────────────────────

interface FilterPanelProps {
  activeGroups: Set<ProductGroup>;
  toggleGroup: (group: ProductGroup) => void;
  groupCounts: Record<ProductGroup, number>;
  sousCategories: (SousCategorie & { count: number; checked: boolean })[];
  toggleSousCategorie: (id: number) => void;
  selectedSousCategories: Set<number>;
  search: string;
  setSearch: (v: string) => void;
  priceMin: string;
  setPriceMin: (v: string) => void;
  priceMax: string;
  setPriceMax: (v: string) => void;
  priceBounds: { min: number; max: number };
  inStockOnly: boolean;
  setInStockOnly: (v: boolean) => void;
  onReset: () => void;
  activeFilterCount: number;
}

const FilterPanel = ({
  activeGroups,
  toggleGroup,
  groupCounts,
  sousCategories,
  toggleSousCategorie,
  selectedSousCategories,
  search,
  setSearch,
  priceMin,
  setPriceMin,
  priceMax,
  setPriceMax,
  priceBounds,
  inStockOnly,
  setInStockOnly,
  onReset,
  activeFilterCount,
}: FilterPanelProps) => {
  const sousCategoriesWithProducts = sousCategories.filter(sc => sc.count > 0);
  const sousCategoriesWithoutProducts = sousCategories.filter(sc => sc.count === 0);

  return (
    <div className="space-y-5">
      {activeFilterCount > 0 && (
        <button
          onClick={onReset}
          className="flex items-center gap-1.5 text-xs font-semibold text-purple-600 hover:text-purple-700 transition-colors"
        >
          <RotateCcw className="h-3 w-3" /> Réinitialiser ({activeFilterCount})
        </button>
      )}

      {/* Recherche */}
      <div className="space-y-2">
        <h4 className="text-xs font-bold uppercase tracking-wider text-foreground/80">
          Recherche
        </h4>
        <div className="relative">
          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Nom ou référence..."
            className="w-full h-9 pl-8 pr-3 rounded-lg bg-secondary/50 border border-transparent focus:border-purple-500/50 focus:bg-background focus:outline-none text-xs transition-all"
          />
        </div>
        {selectedSousCategories.size > 0 && (
          <p className="text-[10px] text-purple-600">
            ⚡ Les sous-catégories sélectionnées ignorent le filtre de type
          </p>
        )}
      </div>

      {/* Filtre de type désactivé : ce catalogue affiche uniquement les produits gamer. */}
      {/* <div className="space-y-2">
        <div className="flex items-center justify-between">
          <h4 className={`text-xs font-bold uppercase tracking-wider ${selectedSousCategories.size > 0 ? 'text-muted-foreground' : 'text-foreground/80'}`}>
            Type de produit
          </h4>
          {selectedSousCategories.size > 0 && (
            <span className="text-[9px] text-purple-600 font-medium">(ignoré)</span>
          )}
        </div>
        <div className="space-y-1">
          {(Object.keys(GROUP_META) as ProductGroup[]).map((group) => {
            const meta = GROUP_META[group];
            const checked = activeGroups.has(group);
            const isDisabled = selectedSousCategories.size > 0;
            return (
              <label
                key={group}
                className={`flex items-center gap-2.5 px-2 py-1.5 rounded-lg transition-colors ${
                  isDisabled ? 'opacity-50 cursor-not-allowed' : 'hover:bg-secondary/50 cursor-pointer'
                }`}
              >
                <button
                  type="button"
                  onClick={() => !isDisabled && toggleGroup(group)}
                  disabled={isDisabled}
                  className={`h-4 w-4 rounded border shrink-0 flex items-center justify-center transition-colors ${
                    checked && !isDisabled
                      ? "bg-purple-600 border-purple-600"
                      : "border-border bg-background"
                  } ${isDisabled ? 'opacity-50' : ''}`}
                >
                  {checked && !isDisabled && <CheckCircle2 className="h-3 w-3 text-white" />}
                </button>
                <span className={`text-muted-foreground shrink-0 ${isDisabled ? 'opacity-50' : ''}`}>
                  {meta.icon}
                </span>
                <span className={`text-xs flex-1 ${isDisabled ? 'text-muted-foreground' : ''}`}>
                  {meta.label}
                </span>
                <span className="text-[10px] text-muted-foreground">
                  {groupCounts[group]}
                </span>
              </label>
            );
          })}
        </div>
      </div> */}

      {/* Sous-catégories */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <h4 className="text-xs font-bold uppercase tracking-wider text-foreground/80">
            Sous-catégories
          </h4>
          <span className="text-[10px] text-muted-foreground">
            {sousCategoriesWithProducts.length} avec produits
          </span>
        </div>
        
        {sousCategories.length === 0 ? (
          <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-lg p-3 text-center">
            <p className="text-xs text-yellow-600 dark:text-yellow-400">
              ⚠️ Aucune sous-catégorie trouvée
            </p>
          </div>
        ) : (
          <div className="space-y-1 max-h-[200px] overflow-y-auto pr-1">
            {sousCategoriesWithProducts.map((sc) => (
              <label
                key={sc.id}
                className={`flex items-center gap-2.5 px-2 py-1.5 rounded-lg transition-colors cursor-pointer hover:bg-secondary/30 ${
                  sc.checked ? 'bg-purple-500/10' : ''
                }`}
                title={`${sc.count} produit(s)`}
              >
                <button
                  type="button"
                  onClick={() => toggleSousCategorie(sc.id)}
                  className={`h-4 w-4 rounded border shrink-0 flex items-center justify-center transition-colors ${
                    sc.checked
                      ? "bg-purple-600 border-purple-600"
                      : "border-border bg-background hover:border-purple-400"
                  }`}
                >
                  {sc.checked && <CheckCircle2 className="h-3 w-3 text-white" />}
                </button>
                <span className={`text-xs flex-1 font-medium ${sc.checked ? 'text-purple-600' : ''}`}>
                  {sc.nom}
                </span>
                <span className={`text-[10px] font-medium ${sc.checked ? 'text-purple-600' : 'text-muted-foreground'}`}>
                  {sc.count}
                </span>
              </label>
            ))}

            {sousCategoriesWithoutProducts.length > 0 && sousCategoriesWithProducts.length > 0 && (
              <div className="border-t border-border/50 my-1.5" />
            )}

            {sousCategoriesWithoutProducts.map((sc) => (
              <div
                key={sc.id}
                className="flex items-center gap-2.5 px-2 py-1.5 rounded-lg opacity-50 cursor-not-allowed"
                title="Aucun produit dans cette sous-catégorie"
              >
                <div className="h-4 w-4 rounded border border-border bg-background shrink-0" />
                <span className="text-xs flex-1 text-muted-foreground">{sc.nom}</span>
                <span className="text-[10px] text-muted-foreground">0</span>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Prix */}
      <div className="space-y-2">
        <h4 className="text-xs font-bold uppercase tracking-wider text-foreground/80">
          Prix ({priceBounds.min ? formatPrice(priceBounds.min) : "—"} —{" "}
          {priceBounds.max ? formatPrice(priceBounds.max) : "—"})
        </h4>
        <div className="flex items-center gap-2">
          <input
            type="number"
            value={priceMin}
            onChange={(e) => setPriceMin(e.target.value)}
            placeholder="Min"
            className="w-full h-9 px-2.5 rounded-lg bg-secondary/50 border border-transparent focus:border-purple-500/50 focus:bg-background focus:outline-none text-xs transition-all"
          />
          <span className="text-muted-foreground text-xs">—</span>
          <input
            type="number"
            value={priceMax}
            onChange={(e) => setPriceMax(e.target.value)}
            placeholder="Max"
            className="w-full h-9 px-2.5 rounded-lg bg-secondary/50 border border-transparent focus:border-purple-500/50 focus:bg-background focus:outline-none text-xs transition-all"
          />
        </div>
      </div>

      {/* Disponibilité */}
      <div className="space-y-2">
        <h4 className="text-xs font-bold uppercase tracking-wider text-foreground/80">
          Disponibilité
        </h4>
        <label className="flex items-center gap-2.5 px-2 py-1.5 rounded-lg hover:bg-secondary/50 transition-colors cursor-pointer">
          <button
            type="button"
            onClick={() => setInStockOnly(!inStockOnly)}
            className={`h-4 w-4 rounded border shrink-0 flex items-center justify-center transition-colors ${
              inStockOnly ? "bg-purple-600 border-purple-600" : "border-border bg-background"
            }`}
          >
            {inStockOnly && <CheckCircle2 className="h-3 w-3 text-white" />}
          </button>
          <span className="text-xs">En stock uniquement</span>
        </label>
      </div>
    </div>
  );
};

// ─── Sous-composant : Carte produit ────────────────────────────────────────

interface ProductCardProps {
  product: ClassifiedProduct;
  index: number;
  addingToCart: number | null;
  onOpenModal: () => void;
  onAddToCart: () => void;
}

const ProductCard = ({ product, index, addingToCart, onOpenModal, onAddToCart }: ProductCardProps) => {
  const meta = GROUP_META[product.group];
  const imageUrl = getImageUrl(product);

  return (
    <div
      className="group bg-card border border-border/50 rounded-xl overflow-hidden hover:shadow-md hover:-translate-y-0.5 transition-all duration-200 animate-fade-up"
      style={{ animationDelay: `${Math.min(index, 12) * 40}ms`, animationFillMode: "forwards" }}
    >
      <div
        className={`relative aspect-square overflow-hidden bg-gradient-to-br from-${meta.color}-500/5 to-secondary/30`}
      >
        {imageUrl ? (
          <img
            src={imageUrl}
            alt={product.nom}
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-muted-foreground/20">
            {meta.icon}
          </div>
        )}

        <div className="absolute top-1.5 left-1.5 bg-black/60 backdrop-blur-sm text-white text-[8px] px-1.5 py-0.5 rounded-full flex items-center gap-1">
          {meta.icon}
          <span>{meta.label}</span>
        </div>

        <div className="absolute top-1.5 right-1.5 bg-black/60 backdrop-blur-sm text-white text-[8px] px-1.5 py-0.5 rounded-full font-mono">
          {product.reference}
        </div>

        {product.quantite_stock <= 5 && product.quantite_stock > 0 && (
          <span className="absolute bottom-1.5 left-1.5 px-1.5 py-0.5 bg-orange-500 text-white text-[8px] font-semibold rounded-full">
            Stock limité
          </span>
        )}

        <button
          onClick={onOpenModal}
          className="absolute bottom-1.5 right-1.5 h-6 w-6 rounded-full bg-black/50 backdrop-blur-sm flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-200 hover:bg-purple-600"
        >
          <Eye className="h-3 w-3 text-white" />
        </button>
      </div>

      <div className="p-2.5 space-y-1.5">
        <h3 className="font-semibold text-xs leading-tight line-clamp-1 group-hover:text-purple-600 transition-colors">
          {product.nom}
        </h3>

        <p className="text-[9px] text-muted-foreground line-clamp-2 leading-relaxed">
          {product.description_courte || product.description?.substring(0, 60) || meta.label}
        </p>

        <div className="flex items-center justify-between pt-1.5">
          <div>
            <span className="text-xs font-bold text-purple-600">
              {formatPrice(product.prix, product.devise)}
            </span>
            {product.quantite_stock === 0 && <p className="text-[8px] text-red-500">Rupture</p>}
          </div>

          <button
            onClick={onAddToCart}
            disabled={product.quantite_stock === 0 || addingToCart === product.id}
            className="h-6 px-2 bg-white text-black text-[9px] font-medium rounded-lg hover:bg-gray-100 transition-all duration-200 flex items-center gap-1 border border-gray-200 shadow-sm disabled:opacity-50"
          >
            {addingToCart === product.id ? (
              <Loader2 className="h-2.5 w-2.5 animate-spin" />
            ) : (
              <ShoppingCart className="h-2.5 w-2.5" />
            )}
            <span>Ajouter</span>
          </button>
        </div>
      </div>
    </div>
  );
};

// ─── Sous-composant : Modal produit ────────────────────────────────────────

interface ProductModalProps {
  product: ClassifiedProduct;
  configurations: Configuration[];
  isLoadingConfigs: boolean;
  onClose: () => void;
  onAddToCart: () => void;
}

const ProductModal = ({ product, configurations, isLoadingConfigs, onClose, onAddToCart }: ProductModalProps) => {
  const meta = GROUP_META[product.group];
  const imageUrl = getImageUrl(product);

  const laptopSpecs =
    product.group === "laptops"
      ? {
          processor: extractFromDescription(product.description, "Processeur", "CPU"),
          gpu: extractFromDescription(product.description, "GPU", "Carte graphique"),
          ram: extractFromDescription(product.description, "RAM", "Mémoire"),
          storage: extractFromDescription(product.description, "Stockage", "SSD", "Disque"),
          screen: extractFromDescription(product.description, "Écran", "Ecran", "Taille"),
          battery: extractFromDescription(product.description, "Batterie", "Autonomie"),
          weight: extractFromDescription(product.description, "Poids", "Weight"),
        }
      : null;

  const watercoolingSpecs =
    product.group === "watercooling"
      ? {
          type: extractFromDescription(product.description, "Type", "Kit", "Type de refroidissement"),
          compatibility: extractFromDescription(
            product.description,
            "Compatible",
            "Compatibilité",
            "Socket",
            "Supporté",
          ),
          radiator: extractFromDescription(product.description, "Radiateur", "Rad", "Taille radiateur"),
          pump: extractFromDescription(product.description, "Pompe", "Pump"),
          material: extractFromDescription(product.description, "Matériau", "Material", "Tube", "Tuyau"),
        }
      : null;

  return (
    <>
      <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-[9999]" onClick={onClose} />
      <div className="fixed inset-0 z-[10000] flex items-center justify-center p-4">
        <div
          className="bg-background rounded-xl max-w-lg w-full max-h-[85vh] overflow-hidden shadow-2xl animate-scale-up"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="sticky top-0 bg-background border-b border-border/50 p-3 flex justify-between items-center">
            <div className="flex items-center gap-2">
              <div className={`h-8 w-8 rounded-lg bg-gradient-to-br ${meta.gradient} flex items-center justify-center`}>
                {meta.icon}
              </div>
              <div>
                <h3 className="text-sm font-bold line-clamp-1">{product.nom}</h3>
                <p className="text-[10px] text-muted-foreground font-mono">{product.reference}</p>
              </div>
            </div>
            <button onClick={onClose} className="p-1.5 hover:bg-secondary rounded-lg transition-colors">
              <X className="h-4 w-4" />
            </button>
          </div>

          <div className="p-4 overflow-y-auto max-h-[calc(85vh-120px)]">
            <div className="space-y-3">
              <div className="aspect-video bg-secondary/30 rounded-lg overflow-hidden">
                {imageUrl ? (
                  <img src={imageUrl} alt={product.nom} className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-muted-foreground/30">
                    {meta.icon}
                  </div>
                )}
              </div>

              {product.group === "unites-centrales" && (
                <div className="grid grid-cols-2 gap-2">
                  <div className="bg-secondary/30 rounded-lg p-2">
                    <h4 className="font-semibold text-[10px] text-purple-600 mb-1.5 uppercase tracking-wider">
                      Informations
                    </h4>
                    <div className="space-y-1 text-[10px]">
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Référence :</span>
                        <span className="font-medium font-mono">{product.reference}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Stock :</span>
                        <span className="font-medium">
                          {product.quantite_stock > 0 ? `${product.quantite_stock} unités` : "Rupture"}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Disponibilité :</span>
                        <span className={`font-medium ${product.est_dispo ? "text-green-600" : "text-red-600"}`}>
                          {product.est_dispo ? "Disponible" : "Indisponible"}
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="bg-secondary/30 rounded-lg p-2">
                    <h4 className="font-semibold text-[10px] text-purple-600 mb-1.5 uppercase tracking-wider">
                      Caractéristiques
                    </h4>
                    <div className="space-y-1 text-[10px]">
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Type :</span>
                        <span className="font-medium">PC Gaming</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Catégorie :</span>
                        <span className="font-medium">Unité Centrale</span>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {laptopSpecs && (
                <div className="grid grid-cols-2 gap-2">
                  <div className="bg-secondary/30 rounded-lg p-2">
                    <h4 className="font-semibold text-[10px] text-blue-600 mb-1.5 uppercase tracking-wider">
                      Caractéristiques
                    </h4>
                    <div className="space-y-1 text-[10px]">
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Processeur :</span>
                        <span className="font-medium">{laptopSpecs.processor}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">GPU :</span>
                        <span className="font-medium text-right">{laptopSpecs.gpu}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">RAM :</span>
                        <span className="font-medium">{laptopSpecs.ram}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Stockage :</span>
                        <span className="font-medium">{laptopSpecs.storage}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Écran :</span>
                        <span className="font-medium">{laptopSpecs.screen}</span>
                      </div>
                    </div>
                  </div>
                  <div className="bg-secondary/30 rounded-lg p-2">
                    <h4 className="font-semibold text-[10px] text-blue-600 mb-1.5 uppercase tracking-wider">
                      Informations
                    </h4>
                    <div className="space-y-1 text-[10px]">
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Batterie :</span>
                        <span className="font-medium">{laptopSpecs.battery}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Poids :</span>
                        <span className="font-medium">{laptopSpecs.weight}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Stock :</span>
                        <span className="font-medium">
                          {product.quantite_stock > 0 ? `${product.quantite_stock} unités` : "Rupture"}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Disponibilité :</span>
                        <span className={`font-medium ${product.est_dispo ? "text-green-600" : "text-red-600"}`}>
                          {product.est_dispo ? "Disponible" : "Indisponible"}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {watercoolingSpecs && (
                <div className="grid grid-cols-2 gap-2">
                  <div className="bg-secondary/30 rounded-lg p-2">
                    <h4 className="font-semibold text-[10px] text-cyan-600 mb-1.5 uppercase tracking-wider">
                      Caractéristiques
                    </h4>
                    <div className="space-y-1 text-[10px]">
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Type :</span>
                        <span className="font-medium">{watercoolingSpecs.type}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Compatibilité :</span>
                        <span className="font-medium text-right">{watercoolingSpecs.compatibility}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Radiateur :</span>
                        <span className="font-medium">{watercoolingSpecs.radiator}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Pompe :</span>
                        <span className="font-medium">{watercoolingSpecs.pump}</span>
                      </div>
                    </div>
                  </div>
                  <div className="bg-secondary/30 rounded-lg p-2">
                    <h4 className="font-semibold text-[10px] text-cyan-600 mb-1.5 uppercase tracking-wider">
                      Informations
                    </h4>
                    <div className="space-y-1 text-[10px]">
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Matériau :</span>
                        <span className="font-medium">{watercoolingSpecs.material}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Stock :</span>
                        <span className="font-medium">
                          {product.quantite_stock > 0 ? `${product.quantite_stock} unités` : "Rupture"}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Disponibilité :</span>
                        <span className={`font-medium ${product.est_dispo ? "text-green-600" : "text-red-600"}`}>
                          {product.est_dispo ? "Disponible" : "Indisponible"}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {product.group !== "watercooling" &&
                (isLoadingConfigs ? (
                  <div className="bg-secondary/30 rounded-lg p-3 flex justify-center">
                    <Loader2 className="h-5 w-5 animate-spin text-purple-500" />
                  </div>
                ) : (
                  configurations.length > 0 && (
                    <div className="bg-purple-500/5 rounded-lg p-3 border border-purple-500/10">
                      <div className="flex items-center gap-1.5 mb-2">
                        <Settings className="h-3.5 w-3.5 text-purple-500" />
                        <h4 className="font-semibold text-[10px] text-purple-600 uppercase tracking-wider">
                          Configurations disponibles
                        </h4>
                      </div>
                      <div className="space-y-1.5">
                        {configurations.map((config) => (
                          <div
                            key={config.id}
                            className="flex justify-between items-center text-[10px] border-b border-border/30 pb-1 last:border-0"
                          >
                            <span className="font-medium">{config.nom_configuration}</span>
                            <span className="font-bold text-purple-600">
                              {formatPrice(config.prix_total, config.devise)}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )
                ))}

              <div className="bg-purple-500/5 rounded-lg p-3 border border-purple-500/10">
                <h4 className="font-semibold text-[10px] text-purple-600 mb-1.5 uppercase tracking-wider">
                  Description
                </h4>
                <p className="text-[11px] leading-relaxed text-muted-foreground">
                  {product.description || product.description_courte || "Aucune description disponible"}
                </p>
              </div>
            </div>
          </div>

          <div className="sticky bottom-0 bg-background border-t border-border/50 p-3 flex gap-2">
            <div className="flex-1">
              <div className="text-[9px] text-muted-foreground">Prix total</div>
              <div className="font-bold text-sm text-purple-600">{formatPrice(product.prix, product.devise)}</div>
            </div>
            <button
              onClick={onClose}
              className="px-4 py-1.5 border border-border rounded-lg text-xs hover:bg-secondary transition-colors"
            >
              Fermer
            </button>
            <button
              onClick={onAddToCart}
              disabled={product.quantite_stock === 0}
              className="px-4 py-1.5 bg-white text-black text-xs font-medium rounded-lg hover:bg-gray-100 transition-colors flex items-center gap-1.5 border border-gray-200 disabled:opacity-50"
            >
              <ShoppingCart className="h-3 w-3" />
              Ajouter
            </button>
          </div>
        </div>
      </div>

      <style>{`
        @keyframes scale-up {
          from { opacity: 0; transform: scale(0.95); }
          to { opacity: 1; transform: scale(1); }
        }
        .animate-scale-up { animation: scale-up 0.25s ease-out; }
      `}</style>
    </>
  );
};