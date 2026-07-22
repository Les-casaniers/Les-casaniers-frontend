import { SiteLayout } from "@/components/site/SiteLayout";
import { formatAr } from "@/lib/products";
import { Link, useSearchParams } from "react-router-dom";
import { useEffect, useMemo, useState, useRef } from "react";
import {
  Heart,
  ShoppingBag,
  Star,
  SlidersHorizontal,
  Search,
  Filter,
  X,
  Loader2,
  ChevronRight,
  ChevronDown,
  FolderTree,
  Layers,
  Award,
  Grid,
  List,
  ChevronUp,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "@/hooks/use-toast";
import {
  Product,
  useCategories,
  useSousCategories,
} from "@/hooks/useProducts";
import { MiniHero } from "@/components/layout/MiniHero";
import api from "@/service/api";
import { useCartApi } from "@/hooks/useCartApi";

// Interface pour les templates
interface TemplateCaracteristique {
  id: number;
  sous_categorie_id: number;
  nom_champ: string;
  type_champ: string;
  ordre_affichage: number;
  est_obligatoire: boolean;
  valeur_par_defaut: string | null;
}

// Interface pour les produits avec caractéristiques
interface ProductWithCaracts extends Product {
  caracteristiques: Record<string, string>;
}

// Composant pour les filtres de caractéristiques avec checkboxes
const CaracteristiqueFilter = ({
  nomChamp,
  valeurs,
  selectedValues,
  onChange,
  isLoading,
}: {
  nomChamp: string;
  valeurs: string[];
  selectedValues: string[];
  onChange: (valeur: string, checked: boolean) => void;
  isLoading?: boolean;
}) => {
  const [isExpanded, setIsExpanded] = useState(true);

  if (isLoading) {
    return (
      <div className="space-y-1.5">
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          <Loader2 className="h-3 w-3 animate-spin" />
          Chargement...
        </div>
      </div>
    );
  }

  if (valeurs.length === 0) return null;

  return (
    <div className="space-y-1.5">
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="flex items-center justify-between w-full text-left text-sm font-bold text-foreground uppercase hover:text-primary transition-colors py-1"
      >
        <span>{nomChamp}</span>
        <div className="flex items-center gap-1.5">
          {selectedValues.length > 0 && (
            <span className="text-[10px] text-primary bg-primary/10 px-1.5 py-0.5 rounded-full">
              {selectedValues.length}
            </span>
          )}
          {isExpanded ? (
            <ChevronDown className="h-3.5 w-3.5" />
          ) : (
            <ChevronRight className="h-3.5 w-3.5" />
          )}
        </div>
      </button>
      {isExpanded && (
        <div className="space-y-1 pl-2">
          {valeurs.map((valeur) => (
            <label
              key={valeur}
              className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors cursor-pointer py-0.5"
            >
              <input
                type="checkbox"
                checked={selectedValues.includes(valeur)}
                onChange={(e) => onChange(valeur, e.target.checked)}
                className="rounded border-border/60 text-primary focus:ring-primary/20 h-3.5 w-3.5"
              />
              <span className="truncate">{valeur}</span>
            </label>
          ))}
        </div>
      )}
    </div>
  );
};

// Composant pour l'affichage des caractéristiques d'un produit (horizontal avec virgules)
// Le bouton Voir plus/Voir moins est déplacé en bas
const ProductCaracteristiques = ({
  caracteristiques,
}: {
  caracteristiques: Record<string, string>;
}) => {
  const entries = Object.entries(caracteristiques);
  if (entries.length === 0) return null;

  // Afficher toutes les caractéristiques, le bouton sera géré par le parent
  return (
    <div className="flex flex-wrap items-center gap-x-1 gap-y-0.5 text-[10px]">
      {entries.map(([nom, valeur], index) => (
        <span key={nom} className="text-muted-foreground">
          <span className="font-medium">{nom}:</span> {valeur}
          {index < entries.length - 1 && <span className="text-border mx-0.5">,</span>}
        </span>
      ))}
    </div>
  );
};

const Catalog = () => {
  const { addToCart } = useCartApi();
  const [searchParams, setSearchParams] = useSearchParams();
  const { data: categories } = useCategories();
  const { data: sousCategories } = useSousCategories();

  const searchNom = searchParams.get("nom") || "";
  const searchRef = searchParams.get("ref") || "";

  // États pour les filtres
  const [favorites, setFavorites] = useState<number[]>([]);
  const [q, setQ] = useState("");
  const [sort, setSort] = useState<"pop" | "asc" | "desc">("pop");
  const [allProducts, setAllProducts] = useState<ProductWithCaracts[]>([]);
  const [isLoadingProducts, setIsLoadingProducts] = useState(true);
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");

  // États pour les filtres de caractéristiques
  const [selectedCategory, setSelectedCategory] = useState<string>("");
  const [selectedSousCategory, setSelectedSousCategory] = useState<string>("");
  const [templatesBySousCategorie, setTemplatesBySousCategorie] = useState<TemplateCaracteristique[]>([]);
  const [valeursByTemplate, setValeursByTemplate] = useState<Record<string, string[]>>({});
  const [filterCaracteristiques, setFilterCaracteristiques] = useState<Record<string, string[]>>({});
  const [isLoadingTemplates, setIsLoadingTemplates] = useState(false);

  // État pour l'expansion des caractéristiques des produits
  const [expandedProductCaracts, setExpandedProductCaracts] = useState<Record<number, boolean>>({});

  useEffect(() => {
    document.title = "Catalogue PC sur-mesure — Les Casaniers Madagascar";
    fetchAllProducts();
  }, []);

  // Charger les templates et valeurs quand la sous-catégorie change
  useEffect(() => {
    if (selectedSousCategory) {
      loadTemplatesAndValues(selectedSousCategory);
    } else {
      setTemplatesBySousCategorie([]);
      setValeursByTemplate({});
      setFilterCaracteristiques({});
    }
  }, [selectedSousCategory]);

  // Mettre à jour les paramètres URL
  useEffect(() => {
    const params = new URLSearchParams();
    if (selectedCategory) params.set("categorie", selectedCategory);
    if (selectedSousCategory) params.set("sous_categorie", selectedSousCategory);
    if (searchNom) params.set("nom", searchNom);
    if (searchRef) params.set("ref", searchRef);
    setSearchParams(params, { replace: true });
  }, [selectedCategory, selectedSousCategory, searchNom, searchRef]);

  // Charger les produits avec leurs caractéristiques
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
      
      // Charger les caractéristiques pour chaque produit
      const productsWithCaracts = await Promise.all(
        products.map(async (product) => {
          try {
            const caractsResponse = await api.get(`/produits/${product.id}/caracteristiques`);
            const caracts = caractsResponse?.data?.data || [];
            const caractsObj: Record<string, string> = {};
            caracts.forEach((c: any) => {
              caractsObj[c.nom_champ] = c.valeur;
            });
            return {
              ...product,
              caracteristiques: caractsObj
            };
          } catch (error) {
            return {
              ...product,
              caracteristiques: {}
            };
          }
        })
      );
      
      setAllProducts(productsWithCaracts);
    } catch (error) {
      console.error("Erreur chargement produits:", error);
    } finally {
      setIsLoadingProducts(false);
    }
  };

  // Charger les templates et valeurs uniques pour une sous-catégorie
  const loadTemplatesAndValues = async (sousCategorieId: string) => {
    setIsLoadingTemplates(true);
    
    try {
      const templatesResponse = await api.get(`/sous-categories/${sousCategorieId}/templates`);
      const templates = templatesResponse?.data?.data || [];
      setTemplatesBySousCategorie(templates);

      const valeursMap: Record<string, string[]> = {};
      
      for (const template of templates) {
        try {
          const valuesResponse = await api.get(`/templates/${template.id}/valeurs-uniques`);
          const valeurs = valuesResponse?.data?.data || [];
          valeursMap[template.nom_champ] = valeurs;
        } catch (error) {
          console.error(`Erreur chargement valeurs pour ${template.nom_champ}:`, error);
          valeursMap[template.nom_champ] = [];
        }
      }
      
      setValeursByTemplate(valeursMap);
    } catch (error) {
      console.error("Erreur chargement templates:", error);
    } finally {
      setIsLoadingTemplates(false);
    }
  };

  const handleCaracteristiqueFilterChange = (nomChamp: string, valeur: string, checked: boolean) => {
    setFilterCaracteristiques(prev => {
      const current = prev[nomChamp] || [];
      if (checked) {
        return { ...prev, [nomChamp]: [...current, valeur] };
      } else {
        return { ...prev, [nomChamp]: current.filter(v => v !== valeur) };
      }
    });
  };

  const toggleProductCaracts = (productId: number) => {
    setExpandedProductCaracts(prev => ({
      ...prev,
      [productId]: !prev[productId]
    }));
  };

  useEffect(() => {
    fetchFavorites();
  }, []);

  const fetchFavorites = async () => {
    try {
      const response = await api.get("/favoris");
      let favorisData = [];
      if (response.data.data)
        favorisData = Array.isArray(response.data.data) ? response.data.data : [];
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

  const filterBySearch = (products: ProductWithCaracts[], searchTerm: string): ProductWithCaracts[] => {
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

  // Filtrer les produits avec tous les filtres
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
    
    if (selectedCategory) {
      const catId = parseInt(selectedCategory, 10);
      list = list.filter(
        (product) =>
          product.categorie_id === catId || product.categorie?.id === catId,
      );
    }
    
    if (selectedSousCategory) {
      const sousCatId = parseInt(selectedSousCategory, 10);
      list = list.filter(
        (product) =>
          product.id_sous_categorie === sousCatId ||
          (product as any).sous_categorie?.id === sousCatId,
      );
    }
    
    Object.entries(filterCaracteristiques).forEach(([nomChamp, valeurs]) => {
      if (valeurs.length > 0) {
        list = list.filter(p => {
          const produitCaracts = p.caracteristiques || {};
          const valeurProduit = produitCaracts[nomChamp] || "";
          return valeurs.some(v => valeurProduit.includes(v));
        });
      }
    });

    if (sort === "asc") list = [...list].sort((a, b) => a.prix - b.prix);
    if (sort === "desc") list = [...list].sort((a, b) => b.prix - a.prix);
    
    return list;
  }, [
    allProducts,
    q,
    sort,
    searchNom,
    searchRef,
    selectedCategory,
    selectedSousCategory,
    filterCaracteristiques,
  ]);

  return (
    <SiteLayout>
      {/* ─── HERO SIMPLIFIÉ ─── */}
      <div className="bg-primary/5 border-b border-border/50 py-3 px-4">
        <div className="container-x">
          <h1 className="text-lg sm:text-xl font-bold text-foreground">
            Trouvez les machines et les matériels informatiques qui vous correspondent.
          </h1>
        </div>
      </div>

      <div className="container-x py-4">
        {/* ─── CONTENEUR PRINCIPAL AVEC SCROLL INDÉPENDANT ─── */}
        <div className="flex flex-col md:flex-row gap-4 h-[calc(100vh-250px)] min-h-[450px]">
          
          {/* ─── COLONNE DE FILTRES (SCROLL INDÉPENDANT) ─── */}
          <aside className="w-full md:w-64 lg:w-72 shrink-0 flex flex-col">
            {/* Barre de recherche - FIXE */}
            <div className="relative mb-3 shrink-0">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <input
                value={q}
                onChange={(e) => setQ(e.target.value)}
                placeholder="Rechercher..."
                className="w-full h-10 pl-9 pr-3 rounded-xl bg-secondary/50 text-sm border border-border focus:border-primary/30 focus:outline-none transition-all"
              />
            </div>

            {/* Contenu des filtres - SCROLLABLE */}
            <div className="flex-1 overflow-y-auto space-y-3 pr-1 custom-scrollbar">
              {/* Filtre Catégories */}
              <div className="bg-card border border-border/50 rounded-xl overflow-hidden shrink-0">
                <div className="p-3 border-b border-border/50 flex items-center gap-2">
                  <FolderTree className="h-4 w-4 text-primary" />
                  <span className="text-xs font-semibold text-foreground uppercase tracking-wider">
                    Catégories
                  </span>
                </div>
                <div className="p-2 space-y-0.5">
                  <button
                    onClick={() => {
                      setSelectedCategory("");
                      setSelectedSousCategory("");
                      setTemplatesBySousCategorie([]);
                      setValeursByTemplate({});
                      setFilterCaracteristiques({});
                    }}
                    className={`w-full text-left px-3 py-1.5 rounded-lg text-sm transition-all ${
                      !selectedCategory
                        ? "bg-primary/10 text-primary font-medium"
                        : "text-muted-foreground hover:bg-secondary/50"
                    }`}
                  >
                    Toutes les catégories
                  </button>
                  {categories?.map((category) => {
                    if (selectedCategory && selectedCategory !== String(category.id)) {
                      return null;
                    }
                    return (
                      <button
                        key={category.id}
                        onClick={() => {
                          setSelectedCategory(String(category.id));
                          setSelectedSousCategory("");
                          setTemplatesBySousCategorie([]);
                          setValeursByTemplate({});
                          setFilterCaracteristiques({});
                        }}
                        className={`w-full text-left px-3 py-1.5 rounded-lg text-sm transition-all ${
                          selectedCategory === String(category.id)
                            ? "bg-primary/10 text-primary font-medium"
                            : "text-muted-foreground hover:bg-secondary/50"
                        }`}
                      >
                        {category.nom}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Filtre Sous-catégories */}
              {selectedCategory && (
                <div className="bg-card border border-border/50 rounded-xl overflow-hidden shrink-0">
                  <div className="p-3 border-b border-border/50 flex items-center gap-2">
                    <Layers className="h-4 w-4 text-primary" />
                    <span className="text-xs font-semibold text-foreground uppercase tracking-wider">
                      Sous-catégories
                    </span>
                  </div>
                  <div className="p-2 space-y-0.5">
                    <button
                      onClick={() => {
                        setSelectedSousCategory("");
                        setTemplatesBySousCategorie([]);
                        setValeursByTemplate({});
                        setFilterCaracteristiques({});
                      }}
                      className={`w-full text-left px-3 py-1.5 rounded-lg text-sm transition-all ${
                        !selectedSousCategory
                          ? "bg-primary/10 text-primary font-medium"
                          : "text-muted-foreground hover:bg-secondary/50"
                      }`}
                    >
                      Toutes les sous-catégories
                    </button>
                    {sousCategories
                      ?.filter((sc) => String(sc.id_categorie) === selectedCategory)
                      .map((sc) => {
                        if (selectedSousCategory && selectedSousCategory !== String(sc.id)) {
                          return null;
                        }
                        return (
                          <button
                            key={sc.id}
                            onClick={() => {
                              setSelectedSousCategory(String(sc.id));
                              setFilterCaracteristiques({});
                            }}
                            className={`w-full text-left px-3 py-1.5 rounded-lg text-sm transition-all ${
                              selectedSousCategory === String(sc.id)
                                ? "bg-primary/10 text-primary font-medium"
                                : "text-muted-foreground hover:bg-secondary/50"
                            }`}
                          >
                            {sc.nom}
                          </button>
                        );
                      })}
                  </div>
                </div>
              )}

              {/* Filtre Caractéristiques */}
              {selectedSousCategory && (
                <div className="bg-card border border-border/50 rounded-xl overflow-hidden shrink-0">
                  <div className="p-3 border-b border-border/50 flex items-center gap-2">
                    <Award className="h-4 w-4 text-primary" />
                    <span className="text-xs font-semibold text-foreground uppercase tracking-wider">
                      Caractéristiques
                    </span>
                    {isLoadingTemplates && (
                      <Loader2 className="h-3 w-3 animate-spin text-muted-foreground ml-auto" />
                    )}
                  </div>
                  <div className="p-3 space-y-3">
                    {isLoadingTemplates ? (
                      <div className="text-center py-4 text-xs text-muted-foreground">
                        Chargement des caractéristiques...
                      </div>
                    ) : templatesBySousCategorie.length === 0 ? (
                      <div className="text-center py-4 text-xs text-muted-foreground">
                        Aucune caractéristique disponible
                      </div>
                    ) : (
                      templatesBySousCategorie.map((template) => {
                        const valeurs = valeursByTemplate[template.nom_champ] || [];
                        return (
                          <CaracteristiqueFilter
                            key={template.id}
                            nomChamp={template.nom_champ}
                            valeurs={valeurs}
                            selectedValues={filterCaracteristiques[template.nom_champ] || []}
                            onChange={(valeur, checked) => 
                              handleCaracteristiqueFilterChange(template.nom_champ, valeur, checked)
                            }
                          />
                        );
                      })
                    )}
                  </div>
                </div>
              )}

              {/* Bouton Réinitialiser */}
              <button
                onClick={() => {
                  setSelectedCategory("");
                  setSelectedSousCategory("");
                  setTemplatesBySousCategorie([]);
                  setValeursByTemplate({});
                  setFilterCaracteristiques({});
                  setQ("");
                  setSort("pop");
                }}
                className="w-full py-2 text-sm font-medium rounded-xl border border-border/60 hover:bg-secondary/50 transition-all text-muted-foreground hover:text-foreground shrink-0"
              >
                Réinitialiser les filtres
              </button>
            </div>
          </aside>

          {/* ─── GRILLE PRODUITS (SCROLL INDÉPENDANT) ─── */}
          <div className="flex-1 min-w-0 flex flex-col">
            {/* En-tête résultats - FIXE */}
            <div className="flex flex-wrap items-center justify-between gap-2 mb-3 shrink-0">
              <div className="text-sm text-muted-foreground">
                <span className="font-medium text-foreground">{filtered.length}</span> produit(s) trouvé(s)
              </div>
              <div className="flex items-center gap-2">
                <div className="flex gap-0.5 border border-border/60 rounded-lg p-0.5 bg-secondary/20">
                  <button
                    onClick={() => setViewMode("grid")}
                    className={`p-1.5 rounded-md transition-all ${
                      viewMode === "grid"
                        ? "bg-primary text-primary-foreground"
                        : "text-muted-foreground hover:text-foreground hover:bg-secondary/50"
                    }`}
                    title="Vue grille"
                  >
                    <Grid className="h-4 w-4" />
                  </button>
                  <button
                    onClick={() => setViewMode("list")}
                    className={`p-1.5 rounded-md transition-all ${
                      viewMode === "list"
                        ? "bg-primary text-primary-foreground"
                        : "text-muted-foreground hover:text-foreground hover:bg-secondary/50"
                    }`}
                    title="Vue liste"
                  >
                    <List className="h-4 w-4" />
                  </button>
                </div>
                <SlidersHorizontal className="h-4 w-4 text-muted-foreground hidden sm:block" />
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

            {/* Filtres actifs - FIXE */}
            {(selectedCategory || selectedSousCategory || Object.keys(filterCaracteristiques).length > 0) && (
              <div className="flex flex-wrap items-center gap-2 p-2 mb-3 bg-primary/5 border border-primary/20 rounded-lg shrink-0">
                <span className="text-[10px] font-semibold uppercase tracking-wider text-primary">
                  Filtres actifs :
                </span>
                <div className="flex flex-wrap gap-1.5">
                  {selectedCategory && (
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-secondary text-foreground text-[10px] rounded-full">
                      Cat: {categories?.find(c => String(c.id) === selectedCategory)?.nom || selectedCategory}
                      <button
                        onClick={() => {
                          setSelectedCategory("");
                          setSelectedSousCategory("");
                          setTemplatesBySousCategorie([]);
                          setValeursByTemplate({});
                          setFilterCaracteristiques({});
                        }}
                        className="hover:text-red-500"
                      >
                        <X className="h-2.5 w-2.5" />
                      </button>
                    </span>
                  )}
                  {selectedSousCategory && (
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-secondary text-foreground text-[10px] rounded-full">
                      Sous-cat: {sousCategories?.find(sc => String(sc.id) === selectedSousCategory)?.nom || selectedSousCategory}
                      <button
                        onClick={() => {
                          setSelectedSousCategory("");
                          setTemplatesBySousCategorie([]);
                          setValeursByTemplate({});
                          setFilterCaracteristiques({});
                        }}
                        className="hover:text-red-500"
                      >
                        <X className="h-2.5 w-2.5" />
                      </button>
                    </span>
                  )}
                  {Object.entries(filterCaracteristiques).map(([nomChamp, valeurs]) => (
                    valeurs.map(v => (
                      <span key={`${nomChamp}-${v}`} className="inline-flex items-center gap-1 px-2 py-0.5 bg-secondary text-foreground text-[10px] rounded-full">
                        {nomChamp}: {v}
                        <button
                          onClick={() => handleCaracteristiqueFilterChange(nomChamp, v, false)}
                          className="hover:text-red-500"
                        >
                          <X className="h-2.5 w-2.5" />
                        </button>
                      </span>
                    ))
                  ))}
                </div>
                <button
                  onClick={() => {
                    setSelectedCategory("");
                    setSelectedSousCategory("");
                    setTemplatesBySousCategorie([]);
                    setValeursByTemplate({});
                    setFilterCaracteristiques({});
                  }}
                  className="ml-auto text-[10px] text-muted-foreground hover:text-primary underline"
                >
                  Tout réinitialiser
                </button>
              </div>
            )}

            {/* ─── CONTENU PRODUITS (SCROLLABLE) ─── */}
            <div className="flex-1 overflow-y-auto pr-1 custom-scrollbar">
              {isLoadingProducts ? (
                <div className="flex flex-col items-center justify-center py-12 gap-3">
                  <Loader2 className="h-8 w-8 animate-spin text-primary" />
                  <p className="text-xs text-muted-foreground">Chargement...</p>
                </div>
              ) : filtered.length === 0 ? (
                <div className="bg-card border border-border/50 rounded-xl p-8 text-center">
                  <p className="font-bold text-lg mb-1">Aucun résultat</p>
                  <p className="text-xs text-muted-foreground">
                    Essayez de changer de catégorie ou de modifier vos filtres.
                  </p>
                </div>
              ) : viewMode === "grid" ? (
                // ─── VUE GRILLE AVEC DESCRIPTION ET BOUTON EN BAS ───
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-3 xl:grid-cols-4 gap-3">
                  {filtered.map((p: ProductWithCaracts, i: number) => {
                    const fav = favorites.includes(p.id);
                    const caracteristiques = p.caracteristiques || {};
                    const isExpanded = expandedProductCaracts[p.id] || false;
                    const entries = Object.entries(caracteristiques);
                    const hasMoreThan3 = entries.length > 3;
                    const displayEntries = isExpanded ? entries : entries.slice(0, 3);
                    
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
                          
                          {/* Caractéristiques horizontales avec virgules (toujours affichées) */}
                          {entries.length > 0 && (
                            <div className="flex flex-wrap items-center gap-x-1 gap-y-0.5 text-[10px]">
                              {displayEntries.map(([nom, valeur], index) => (
                                <span key={nom} className="text-muted-foreground">
                                  <span className="font-medium">{nom}:</span> {valeur}
                                  {index < displayEntries.length - 1 && <span className="text-border mx-0.5">,</span>}
                                </span>
                              ))}
                            </div>
                          )}
                          
                          {/* Description */}
                          {p.description && (
                            <p className="text-[9px] text-muted-foreground line-clamp-2 leading-relaxed">
                              {p.description}
                            </p>
                          )}
                          
                          {/* Bouton Voir plus/Voir moins EN BAS de toutes les infos */}
                          {hasMoreThan3 && (
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                toggleProductCaracts(p.id);
                              }}
                              className="flex items-center gap-1 text-[9px] text-primary hover:text-primary/80 transition-colors"
                            >
                              {isExpanded ? (
                                <>
                                  <ChevronUp className="h-3 w-3" /> Voir moins
                                </>
                              ) : (
                                <>
                                  <ChevronDown className="h-3 w-3" /> Voir plus ({entries.length - 3})
                                </>
                              )}
                            </button>
                          )}
                          
                          <div className="flex items-center justify-between pt-1">
                            <div>
                              <span className="text-[9px] text-muted-foreground">
                                à partir de
                              </span>
                              <div className="font-bold text-xs">
                                {formatAr(p.prix)}
                              </div>
                            </div>
                            <Button
                              variant="hero"
                              size="sm"
                              className="h-6 px-2 text-[10px]"
                              onClick={async (e) => {
                                e.stopPropagation();
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
              ) : (
                // ─── VUE LISTE AVEC IMAGE NORMALE, DESCRIPTION ET BOUTON EN BAS ───
                <div className="space-y-2">
                  {filtered.map((p: ProductWithCaracts) => {
                    const fav = favorites.includes(p.id);
                    const caracteristiques = p.caracteristiques || {};
                    const isExpanded = expandedProductCaracts[p.id] || false;
                    const entries = Object.entries(caracteristiques);
                    const hasMoreThan3 = entries.length > 3;
                    const displayEntries = isExpanded ? entries : entries.slice(0, 3);
                    
                    return (
                      <div
                        key={p.id}
                        className="bg-card border border-border/50 rounded-xl overflow-hidden hover:shadow-md transition-all duration-200"
                      >
                        <div className="flex flex-col sm:flex-row gap-4 p-4">
                          {/* Image taille normale (w-32 h-32) */}
                          <Link
                            to={`/produit/${p.id}`}
                            className="block relative w-full sm:w-32 h-32 shrink-0 overflow-hidden rounded-lg bg-secondary/30"
                          >
                            <img
                              src={getProductImageUrl(p)}
                              alt={p.nom}
                              loading="lazy"
                              className="w-full h-full object-cover transition-transform duration-500 hover:scale-105"
                              onError={(e) => {
                                (e.target as HTMLImageElement).src =
                                  "/placeholder-pc.jpg";
                              }}
                            />
                            <button
                              onClick={(e) => toggleFavorite(p.id, e)}
                              className={`absolute bottom-1 right-1 h-7 w-7 rounded-full flex items-center justify-center backdrop-blur-sm transition-all ${fav ? "bg-primary text-white" : "bg-black/50 text-white/80 hover:bg-primary/80"}`}
                            >
                              <Heart
                                className={`h-3.5 w-3.5 ${fav ? "fill-current" : ""}`}
                              />
                            </button>
                          </Link>
                          
                          <div className="flex-1 min-w-0 flex flex-col">
                            <div className="flex flex-wrap items-start justify-between gap-2">
                              <div>
                                <div className="text-[10px] font-mono uppercase text-primary/70">
                                  {p.reference || "REF-001"}
                                </div>
                                <Link to={`/produit/${p.id}`}>
                                  <h3 className="font-semibold text-base hover:text-primary transition-colors">
                                    {p.nom}
                                  </h3>
                                </Link>
                                <div className="flex items-center gap-2 mt-0.5">
                                  <div className="flex items-center gap-0.5">
                                    <Star className="h-3 w-3 fill-primary text-primary" />
                                    <span className="text-xs font-medium">
                                      {p.note || 5.0}
                                    </span>
                                  </div>
                                  <span className="text-[10px] text-muted-foreground">
                                    • Stock: {p.quantite_stock}
                                  </span>
                                  <span className={`text-[10px] px-2 py-0.5 rounded-full ${
                                    p.est_dispo
                                      ? "bg-emerald-500/10 text-emerald-600"
                                      : "bg-red-500/10 text-red-600"
                                  }`}>
                                    {p.est_dispo ? "Disponible" : "Indisponible"}
                                  </span>
                                </div>
                              </div>
                              <div className="text-right shrink-0">
                                <div className="font-bold text-lg text-primary">
                                  {formatAr(p.prix)}
                                </div>
                                <div className="text-[10px] text-muted-foreground">
                                  TTC
                                </div>
                              </div>
                            </div>
                            
                            {/* Caractéristiques horizontales avec virgules (toujours affichées) */}
                            {entries.length > 0 && (
                              <div className="flex flex-wrap items-center gap-x-1 gap-y-0.5 text-[10px] mt-1">
                                {displayEntries.map(([nom, valeur], index) => (
                                  <span key={nom} className="text-muted-foreground">
                                    <span className="font-medium">{nom}:</span> {valeur}
                                    {index < displayEntries.length - 1 && <span className="text-border mx-0.5">,</span>}
                                  </span>
                                ))}
                              </div>
                            )}
                            
                            {/* Description */}
                            {p.description && (
                              <p className="text-xs text-muted-foreground mt-1 leading-relaxed">
                                {p.description}
                              </p>
                            )}
                            
                            {/* Bouton Voir plus/Voir moins EN BAS de toutes les infos */}
                            {hasMoreThan3 && (
                              <button
                                onClick={() => toggleProductCaracts(p.id)}
                                className="flex items-center gap-1 text-[10px] text-primary hover:text-primary/80 transition-colors mt-1"
                              >
                                {isExpanded ? (
                                  <>
                                    <ChevronUp className="h-3 w-3" /> Voir moins
                                  </>
                                ) : (
                                  <>
                                    <ChevronDown className="h-3 w-3" /> Voir plus ({entries.length - 3})
                                  </>
                                )}
                              </button>
                            )}
                            
                            <div className="flex items-center gap-2 mt-2 pt-2 border-t border-border/50">
                              <Button
                                variant="hero"
                                size="sm"
                                className="h-8 px-4 text-xs"
                                onClick={async () => {
                                  await addToCart({
                                    produit_id: p.id,
                                    quantite: 1,
                                    prix_unitaire: p.prix,
                                    titre: p.nom,
                                  });
                                }}
                              >
                                <ShoppingBag className="h-3.5 w-3.5 mr-1.5" /> 
                                Ajouter au panier
                              </Button>
                              <Link to={`/produit/${p.id}`}>
                                <Button
                                  variant="outline"
                                  size="sm"
                                  className="h-8 px-4 text-xs"
                                >
                                  Voir détails
                                </Button>
                              </Link>
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      <style>{`
        @keyframes slide-up {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-slide-up { animation: slide-up 0.3s ease-out both; }
        
        .custom-scrollbar::-webkit-scrollbar {
          width: 4px;
          height: 4px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: transparent;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: hsl(var(--border));
          border-radius: 4px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: hsl(var(--muted-foreground) / 0.3);
        }
      `}</style>
    </SiteLayout>
  );
};

export default Catalog;