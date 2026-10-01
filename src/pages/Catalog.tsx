import { SiteLayout } from "@/components/site/SiteLayout";
import { formatAr } from "@/lib/products";
import { Link, useSearchParams } from "react-router-dom";
import { useEffect, useMemo, useRef, useState } from "react";
import {
  ArrowLeft,
  CheckCircle2,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Filter,
  Loader2,
  Plane,
  Sailboat,
  XCircle,
} from "lucide-react";
import { Product, useCategories, useSousCategories } from "@/hooks/useProducts";
import api from "@/service/api";
import { useCartApi } from "@/hooks/useCartApi";
import { useShop } from "@/store/shop";
import { getProductImageUrl } from "@/lib/utils";
import {
  CATALOG_SPEC_FIELDS,
  USAGE_OPTIONS,
  isCatalogColumnName,
  normalizeText,
  parseUsages,
} from "@/lib/catalogFields";
import curvedArrow from "@/assets/Curved Arrow Downward.png";
import favoriteIcon from "@/assets/Favorite.png";
import panierIcone from "@/assets/Basket.png";

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

const PRODUCTS_PER_PAGE = 10;

const SORT_OPTIONS = [
  { value: "pop", label: "Pertinence" },
  { value: "asc", label: "Prix croissant" },
  { value: "desc", label: "Prix décroissant" },
] as const;
type SortValue = (typeof SORT_OPTIONS)[number]["value"];

// Grille 3 colonnes de la maquette : Processeur SSD OS / GPU Résolution — / RAM Taille
const SPEC_GRID_BLANK_AFTER = "Résolution";
const MAX_EXTRA_SPECS = 3;

// Les filtres sur une colonne produit (processeur, ram…) sont préfixés pour les distinguer des templates
const SPEC_FILTER_PREFIX = "col:";
const specColumnOf = (filterId: string) =>
  filterId.startsWith(SPEC_FILTER_PREFIX)
    ? CATALOG_SPEC_FIELDS.find((f) => f.key === filterId.slice(SPEC_FILTER_PREFIX.length))?.key
    : undefined;

type FilterGroup = { id: string; label: string; valeurs: string[] };

// ─── Titre : trait plein + tirets + flèche (comme sur la maquette) ─────────────
const CatalogTitle = ({ children }: { children: React.ReactNode }) => (
  <div className="inline-block min-w-[9rem]">
    <h1 className="font-display text-2xl lg:text-3xl font-bold leading-tight text-white">
      {children}
    </h1>
    <div className="flex items-center w-full mt-1">
      <span className="h-0.5 w-14 shrink-0 rounded-full bg-white" />
      <span
        className="h-0.5 flex-1 ml-2"
        style={{
          backgroundImage:
            "repeating-linear-gradient(to right, #ffffff 0 14px, transparent 14px 22px)",
        }}
      />
      <img
        src={curvedArrow}
        alt=""
        aria-hidden="true"
        className="w-5 h-5 shrink-0 object-contain ml-1 translate-y-2 brightness-0 invert"
      />
    </div>
  </div>
);

// ─── Bouton "pilule" blanc de la colonne de gauche ─────────────────────────────
const FilterPill = ({
  label,
  active,
  open,
  count,
  onClick,
}: {
  label: string;
  active?: boolean;
  open?: boolean;
  count?: number;
  onClick: () => void;
}) => (
  <button
    onClick={onClick}
    className={`w-full flex items-center justify-between gap-2 px-4 py-2 rounded-lg bg-white text-black text-xs font-extrabold uppercase tracking-wide text-left transition-all hover:bg-zinc-200 ${
      active ? "ring-2 ring-orange-500" : ""
    }`}
  >
    <span className="truncate">{label}</span>
    <span className="flex items-center gap-1.5 shrink-0">
      {!!count && (
        <span className="text-[10px] bg-orange-500 text-white px-1.5 rounded-full">{count}</span>
      )}
      <ChevronRight className={`h-4 w-4 transition-transform ${open ? "rotate-90" : ""}`} />
    </span>
  </button>
);

// ─── Slider de prix à deux curseurs ────────────────────────────────────────────
const PriceRange = ({
  min,
  max,
  value,
  onChange,
  onReset,
}: {
  min: number;
  max: number;
  value: [number, number];
  onChange: (v: [number, number]) => void;
  onReset?: () => void;
}) => {
  const span = Math.max(max - min, 1);
  const left = ((value[0] - min) / span) * 100;
  const right = ((value[1] - min) / span) * 100;
  // Pas de 1 000 Ar minimum, ~200 crans sur toute la plage
  const step = Math.max(Math.round(span / 200 / 1000) * 1000, 1000);
  const disabled = max <= min;
  // Quand le curseur min est collé à droite, il doit passer au-dessus pour rester attrapable
  const minOnTop = value[0] > min + span / 2;

  return (
    <div>
      <div className="flex items-center gap-3">
        <span className="flex items-center gap-1.5 text-sm font-bold text-white shrink-0">
          <Filter className="h-4 w-4 fill-white" /> Prix
        </span>
        <div className="relative flex-1 h-4">
          <div className="absolute top-1/2 -translate-y-1/2 left-0 right-0 h-0.5 bg-white/30 rounded-full" />
          <div
            className="absolute top-1/2 -translate-y-1/2 h-0.5 bg-white rounded-full"
            style={{ left: `${left}%`, right: `${100 - right}%` }}
          />
          <input
            type="range"
            min={min}
            max={max}
            step={step}
            value={value[0]}
            disabled={disabled}
            onChange={(e) => onChange([Math.min(Number(e.target.value), value[1]), value[1]])}
            className={`price-thumb ${minOnTop ? "z-20" : "z-10"}`}
            aria-label="Prix minimum"
          />
          <input
            type="range"
            min={min}
            max={max}
            step={step}
            value={value[1]}
            disabled={disabled}
            onChange={(e) => onChange([value[0], Math.max(Number(e.target.value), value[0])])}
            className="price-thumb z-10"
            aria-label="Prix maximum"
          />
        </div>
      </div>
      <div className="flex justify-between pl-[3.75rem] mt-1 text-[11px] font-bold text-white/90">
        <span>{formatAr(value[0])}</span>
        <span>{formatAr(value[1])}</span>
      </div>
      {onReset && (
        <button
          onClick={onReset}
          className="block ml-auto mt-1 text-[10px] text-white/50 hover:text-white underline"
        >
          Réinitialiser le prix
        </button>
      )}
    </div>
  );
};

// ─── Pagination compacte "‹ 1,2,...6 ›" ────────────────────────────────────────
const Pagination = ({
  page,
  totalPages,
  onChange,
}: {
  page: number;
  totalPages: number;
  onChange: (p: number) => void;
}) => {
  const pages: (number | "...")[] = [];
  for (let p = 1; p <= totalPages; p++) {
    if (p <= 2 || p === totalPages || p === page) pages.push(p);
    else if (pages[pages.length - 1] !== "...") pages.push("...");
  }

  return (
    <div className="flex items-center gap-2 text-xs font-bold text-white">
      <button
        onClick={() => onChange(page - 1)}
        disabled={page <= 1}
        className="h-5 w-5 rounded-full bg-white text-black flex items-center justify-center disabled:opacity-40"
        aria-label="Page précédente"
      >
        <ChevronLeft className="h-3.5 w-3.5" />
      </button>
      <span className="flex items-center">
        {pages.map((p, i) => (
          <span key={i} className="flex items-center">
            {p === "..." ? (
              <span className="text-white/70">...</span>
            ) : (
              <button
                onClick={() => onChange(p)}
                className={p === page ? "text-white underline underline-offset-2" : "text-white/60 hover:text-white"}
              >
                {p}
              </button>
            )}
            {i < pages.length - 1 && pages[i + 1] !== "..." && p !== "..." && <span>,</span>}
          </span>
        ))}
      </span>
      <button
        onClick={() => onChange(page + 1)}
        disabled={page >= totalPages}
        className="h-5 w-5 rounded-full bg-white text-black flex items-center justify-center disabled:opacity-40"
        aria-label="Page suivante"
      >
        <ChevronRight className="h-3.5 w-3.5" />
      </button>
    </div>
  );
};

const Catalog = () => {
  const { addToCart } = useCartApi();
  const [searchParams, setSearchParams] = useSearchParams();
  const { data: categories } = useCategories();
  const { data: sousCategories } = useSousCategories();
  const { favorites, toggleFavorite } = useShop();

  // L'URL est la source de vérité pour la catégorie / sous-catégorie / recherche
  const selectedCategory = searchParams.get("categorie") || "";
  const selectedSousCategory = searchParams.get("sous_categorie") || "";
  const searchNom = searchParams.get("nom") || "";
  const searchRef = searchParams.get("ref") || "";

  const [sort, setSort] = useState<SortValue>("pop");
  const [sortOpen, setSortOpen] = useState(false);
  const sortRef = useRef<HTMLDivElement>(null);
  const [usage, setUsage] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [priceRange, setPriceRange] = useState<[number, number] | null>(null);

  const [allProducts, setAllProducts] = useState<ProductWithCaracts[]>([]);
  const [isLoadingProducts, setIsLoadingProducts] = useState(true);

  // Filtres de caractéristiques (templates de la sous-catégorie)
  const [templatesBySousCategorie, setTemplatesBySousCategorie] = useState<TemplateCaracteristique[]>([]);
  const [valeursByTemplate, setValeursByTemplate] = useState<Record<string, string[]>>({});
  const [filterCaracteristiques, setFilterCaracteristiques] = useState<Record<string, string[]>>({});
  const [isLoadingTemplates, setIsLoadingTemplates] = useState(false);
  const [openFilter, setOpenFilter] = useState<string | null>(null);

  useEffect(() => {
    fetchAllProducts();
  }, []);

  // Charger les templates et valeurs quand la sous-catégorie change
  useEffect(() => {
    setFilterCaracteristiques({});
    setOpenFilter(null);
    if (selectedSousCategory) {
      loadTemplatesAndValues(selectedSousCategory);
    } else {
      setTemplatesBySousCategorie([]);
      setValeursByTemplate({});
    }
  }, [selectedSousCategory]);

  // Réinitialiser le prix et la page quand on change de rayon
  useEffect(() => {
    setPriceRange(null);
    setPage(1);
  }, [selectedCategory, selectedSousCategory]);

  useEffect(() => {
    const h = (e: MouseEvent) => {
      if (sortRef.current && !sortRef.current.contains(e.target as Node)) setSortOpen(false);
    };
    document.addEventListener("mousedown", h);
    return () => document.removeEventListener("mousedown", h);
  }, []);

  const selectCategory = (categoryId: string, sousCategoryId = "") => {
    const params = new URLSearchParams(searchParams);
    if (categoryId) params.set("categorie", categoryId);
    else params.delete("categorie");
    if (sousCategoryId) params.set("sous_categorie", sousCategoryId);
    else params.delete("sous_categorie");
    setSearchParams(params, { replace: true });
  };

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
            return { ...product, caracteristiques: caractsObj };
          } catch (error) {
            return { ...product, caracteristiques: {} };
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
      // EAN / Usage / specs sont des colonnes du produit, leurs filtres sont calculés à part
      const templates = ((templatesResponse?.data?.data || []) as TemplateCaracteristique[]).filter(
        (t) => !isCatalogColumnName(t.nom_champ),
      );
      setTemplatesBySousCategorie(templates);

      const valeursMap: Record<string, string[]> = {};
      for (const template of templates) {
        try {
          const valuesResponse = await api.get(`/templates/${template.id}/valeurs-uniques`);
          valeursMap[template.nom_champ] = valuesResponse?.data?.data || [];
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
    setPage(1);
    setFilterCaracteristiques((prev) => {
      const current = prev[nomChamp] || [];
      return checked
        ? { ...prev, [nomChamp]: [...current, valeur] }
        : { ...prev, [nomChamp]: current.filter((v) => v !== valeur) };
    });
  };

  // Produits du rayon courant (catégorie / sous-catégorie / recherche) — sert aussi aux bornes de prix
  const scoped = useMemo(() => {
    let list = [...allProducts];
    if (searchNom)
      list = list.filter((p) => p.nom?.toLowerCase().includes(searchNom.toLowerCase()));
    if (searchRef)
      list = list.filter((p) => p.reference?.toLowerCase().includes(searchRef.toLowerCase()));
    if (selectedCategory) {
      const catId = parseInt(selectedCategory, 10);
      list = list.filter((p) => p.categorie_id === catId || p.categorie?.id === catId);
    }
    if (selectedSousCategory) {
      const scId = parseInt(selectedSousCategory, 10);
      list = list.filter((p) => p.id_sous_categorie === scId || p.sous_categorie?.id === scId);
    }
    return list;
  }, [allProducts, searchNom, searchRef, selectedCategory, selectedSousCategory]);

  // Filtres de la colonne de gauche : specs (colonnes produit, valeurs du rayon) + templates de la sous-catégorie
  const filterGroups = useMemo<FilterGroup[]>(() => {
    const specGroups = CATALOG_SPEC_FIELDS.map(({ key, label }) => ({
      id: `${SPEC_FILTER_PREFIX}${key}`,
      label,
      valeurs: [...new Set(scoped.map((p) => (p[key] ?? "").trim()).filter(Boolean))].sort(),
    })).filter((g) => g.valeurs.length > 0);

    const templateGroups = templatesBySousCategorie.map((t) => ({
      id: t.nom_champ,
      label: t.nom_champ,
      valeurs: valeursByTemplate[t.nom_champ] || [],
    }));

    return [...specGroups, ...templateGroups];
  }, [scoped, templatesBySousCategorie, valeursByTemplate]);

  // Bornes du slider : de 0 au prix le plus élevé du rayon, arrondi au palier supérieur
  const priceBounds = useMemo<[number, number]>(() => {
    const maxPrice = Math.max(0, ...scoped.map((p) => Number(p.prix) || 0));
    if (maxPrice === 0) return [0, 0];
    // Palier adapté à l'ordre de grandeur : 20 000 → 20 000, 6 990 000 → 7 000 000
    const rounding = Math.max(10 ** (Math.floor(Math.log10(maxPrice)) - 1), 1000);
    return [0, Math.ceil(maxPrice / rounding) * rounding];
  }, [scoped]);

  const activePrice: [number, number] = priceRange
    ? [Math.max(priceRange[0], priceBounds[0]), Math.min(priceRange[1], priceBounds[1])]
    : priceBounds;

  const filtered = useMemo(() => {
    let list = scoped;
    if (priceRange) {
      list = list.filter((p) => {
        const prix = Number(p.prix) || 0;
        return prix >= activePrice[0] && prix <= activePrice[1];
      });
    }

    if (usage) {
      // Usage renseigné dans l'admin en priorité, sinon recherche du mot dans le produit
      const term = normalizeText(usage);
      list = list.filter((p) => {
        const usages = parseUsages(p.usages);
        if (usages.length > 0) return usages.some((u) => normalizeText(u) === term);
        return normalizeText(
          [p.nom, p.description_courte, p.description, ...Object.values(p.caracteristiques || {})]
            .filter(Boolean)
            .join(" "),
        ).includes(term);
      });
    }

    Object.entries(filterCaracteristiques).forEach(([filterId, valeurs]) => {
      if (valeurs.length > 0) {
        list = list.filter((p) => {
          const column = specColumnOf(filterId);
          if (column) return valeurs.includes(String(p[column] ?? ""));
          const valeurProduit = (p.caracteristiques || {})[filterId] || "";
          return valeurs.some((v) => valeurProduit.includes(v));
        });
      }
    });

    if (sort === "asc") list = [...list].sort((a, b) => a.prix - b.prix);
    if (sort === "desc") list = [...list].sort((a, b) => b.prix - a.prix);
    return list;
  }, [scoped, priceRange, activePrice[0], activePrice[1], usage, filterCaracteristiques, sort]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PRODUCTS_PER_PAGE));
  const currentPage = Math.min(page, totalPages);
  const pageProducts = filtered.slice(
    (currentPage - 1) * PRODUCTS_PER_PAGE,
    currentPage * PRODUCTS_PER_PAGE,
  );

  const currentCategory = categories?.find((c) => String(c.id) === selectedCategory);
  const currentSousCategory = sousCategories?.find((sc) => String(sc.id) === selectedSousCategory);
  const categorySousCategories =
    sousCategories?.filter((sc) => String(sc.id_categorie) === selectedCategory) ?? [];

  const title =
    currentSousCategory?.nom ||
    currentCategory?.nom ||
    (searchNom ? `« ${searchNom} »` : "Catalogue");

  useEffect(() => {
    document.title = `${title} — Les Casaniers Madagascar`;
  }, [title]);

  // Specs de la maquette (saisies dans l'admin), puis quelques caractéristiques libres en plus
  const getSpecs = (p: ProductWithCaracts) => {
    const specs: { label: string; value: string }[] = [];
    CATALOG_SPEC_FIELDS.forEach(({ key, label }) => {
      specs.push({ label, value: p[key] ?? "" });
      if (label === SPEC_GRID_BLANK_AFTER) specs.push({ label: "", value: "" });
    });
    Object.entries(p.caracteristiques || {})
      .filter(([nom, valeur]) => valeur && !isCatalogColumnName(nom))
      .slice(0, MAX_EXTRA_SPECS)
      .forEach(([label, value]) => specs.push({ label, value }));
    return specs;
  };

  const getEan = (p: ProductWithCaracts) => p.ean ?? "";

  // ─── Colonne de gauche : pilules dynamiques selon le niveau ───────────────────
  const renderLeftFilters = () => {
    // Niveau 3 : sous-catégorie choisie → caractéristiques (MARQUE, TAILLE ECRAN…)
    if (selectedSousCategory) {
      if (isLoadingTemplates) {
        return (
          <div className="flex items-center gap-2 text-xs text-white/60 py-2">
            <Loader2 className="h-4 w-4 animate-spin" /> Chargement des filtres…
          </div>
        );
      }
      if (filterGroups.length === 0) {
        return <p className="text-xs italic text-white/50 py-2">Aucun filtre pour ce rayon.</p>;
      }
      return filterGroups.map((group) => {
        const valeurs = group.valeurs;
        const selected = filterCaracteristiques[group.id] || [];
        const isOpen = openFilter === group.id;
        return (
          <div key={group.id}>
            <FilterPill
              label={group.label}
              open={isOpen}
              active={selected.length > 0}
              count={selected.length}
              onClick={() => setOpenFilter(isOpen ? null : group.id)}
            />
            {isOpen && (
              <div className="mt-2 mb-1 pl-3 space-y-1.5">
                {valeurs.length === 0 ? (
                  <p className="text-xs italic text-white/50">Aucune valeur</p>
                ) : (
                  valeurs.map((valeur) => (
                    <label
                      key={valeur}
                      className="flex items-center gap-2 text-xs text-white/80 hover:text-white cursor-pointer"
                    >
                      <input
                        type="checkbox"
                        checked={selected.includes(valeur)}
                        onChange={(e) =>
                          handleCaracteristiqueFilterChange(group.id, valeur, e.target.checked)
                        }
                        className="h-3.5 w-3.5 accent-orange-500"
                      />
                      <span className="truncate">{valeur}</span>
                    </label>
                  ))
                )}
              </div>
            )}
          </div>
        );
      });
    }

    // Niveau 2 : catégorie choisie → ses sous-catégories
    if (selectedCategory) {
      if (categorySousCategories.length === 0) {
        return <p className="text-xs italic text-white/50 py-2">Aucune sous-catégorie.</p>;
      }
      return categorySousCategories.map((sc) => (
        <FilterPill
          key={sc.id}
          label={sc.nom}
          onClick={() => selectCategory(selectedCategory, String(sc.id))}
        />
      ));
    }

    // Niveau 1 : toutes les catégories
    return (categories ?? []).map((cat) => (
      <FilterPill key={cat.id} label={cat.nom} onClick={() => selectCategory(String(cat.id))} />
    ));
  };

  return (
    <SiteLayout>
      <div className="bg-black text-white min-h-[70vh]">
        <div className="container-x py-8">
          {/* ─── TITRE ─── */}
          <div className="text-center mb-8">
            <CatalogTitle>{title}</CatalogTitle>
          </div>

          <div className="flex flex-col md:flex-row gap-6 lg:gap-12">
            {/* ─── COLONNE DE GAUCHE ─── */}
            <aside className="w-full md:w-52 lg:w-56 shrink-0 space-y-5">
              <PriceRange
                min={priceBounds[0]}
                max={priceBounds[1]}
                value={activePrice}
                onChange={(v) => {
                  setPriceRange(v);
                  setPage(1);
                }}
                onReset={priceRange ? () => setPriceRange(null) : undefined}
              />

              {(selectedCategory || selectedSousCategory) && (
                <button
                  onClick={() =>
                    selectedSousCategory ? selectCategory(selectedCategory) : selectCategory("")
                  }
                  className="flex items-center gap-1.5 text-xs text-white/60 hover:text-white transition-colors"
                >
                  <ArrowLeft className="h-3.5 w-3.5" />
                  {selectedSousCategory
                    ? currentCategory?.nom ?? "Retour"
                    : "Toutes les catégories"}
                </button>
              )}

              <div className="space-y-3">{renderLeftFilters()}</div>
            </aside>

            {/* ─── LISTE PRODUITS ─── */}
            <section className="flex-1 min-w-0">
              {/* Barre d'outils */}
              <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-white/40">
                <Pagination page={currentPage} totalPages={totalPages} onChange={setPage} />

                <div className="flex flex-wrap items-center gap-3 lg:gap-4">
                  <div className="flex items-center text-sm text-white/90">
                    {USAGE_OPTIONS.map((u, i) => (
                      <span key={u} className="flex items-center">
                        <button
                          onClick={() => {
                            setUsage(usage === u ? null : u);
                            setPage(1);
                          }}
                          className={`hover:text-white transition-colors ${
                            usage === u ? "text-orange-500 font-semibold" : ""
                          }`}
                        >
                          {u}
                        </button>
                        {i < USAGE_OPTIONS.length - 1 && <span className="mx-1.5 text-white/60">|</span>}
                      </span>
                    ))}
                  </div>

                  <div ref={sortRef} className="relative">
                    <button
                      onClick={() => setSortOpen(!sortOpen)}
                      className="flex items-center gap-2 px-3 py-2 rounded-lg bg-white text-black text-sm font-bold"
                    >
                      Trier par
                      <ChevronDown className={`h-4 w-4 transition-transform ${sortOpen ? "rotate-180" : ""}`} />
                    </button>
                    {sortOpen && (
                      <div className="absolute right-0 top-full mt-1 w-44 bg-white text-black rounded-lg shadow-xl py-1 z-20">
                        {SORT_OPTIONS.map((opt) => (
                          <button
                            key={opt.value}
                            onClick={() => {
                              setSort(opt.value);
                              setSortOpen(false);
                            }}
                            className={`w-full text-left px-3 py-2 text-sm hover:bg-zinc-100 ${
                              sort === opt.value ? "font-bold text-orange-600" : ""
                            }`}
                          >
                            {opt.label}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Produits */}
              {isLoadingProducts ? (
                <div className="flex flex-col items-center justify-center py-16 gap-3">
                  <Loader2 className="h-8 w-8 animate-spin text-orange-500" />
                  <p className="text-xs text-white/60">Chargement...</p>
                </div>
              ) : pageProducts.length === 0 ? (
                <div className="py-16 text-center">
                  <p className="font-bold text-lg mb-1">Aucun résultat</p>
                  <p className="text-xs text-white/60">
                    Essayez de changer de catégorie ou de modifier vos filtres.
                  </p>
                </div>
              ) : (
                <div>
                  {pageProducts.map((p) => {
                    const fav = favorites.includes(p.id);
                    const specs = getSpecs(p);
                    const enStock = (p.quantite_stock ?? 0) > 0;
                    return (
                      <article
                        key={p.id}
                        className="relative flex flex-col sm:flex-row gap-4 lg:gap-5 py-4 border-b border-white/40"
                      >
                        {/* Image */}
                        <Link
                          to={`/produit/${p.id}`}
                          className="block w-full sm:w-44 lg:w-52 aspect-[4/3] sm:h-36 sm:aspect-auto shrink-0 bg-white overflow-hidden"
                        >
                          <img
                            src={getProductImageUrl(p)}
                            alt={p.nom}
                            loading="lazy"
                            className="w-full h-full object-cover"
                            onError={(e) => {
                              (e.target as HTMLImageElement).src = "/placeholder-pc.jpg";
                            }}
                          />
                        </Link>

                        {/* Infos */}
                        <div className="flex-1 min-w-0 flex flex-col">
                          <div className="flex items-start justify-between gap-3">
                            <div className="min-w-0">
                              <span className="text-[10px] italic underline text-white/80">
                                {p.sous_categorie?.nom ?? p.categorie?.nom ?? ""}
                              </span>
                              <Link to={`/produit/${p.id}`}>
                                <h3 className="font-extrabold text-sm lg:text-base leading-snug hover:text-orange-400 transition-colors">
                                  {p.nom}
                                </h3>
                              </Link>
                              <p className="text-[11px] font-bold mt-0.5">
                                Ref: {p.reference ?? ""} | EAN: {getEan(p)}
                              </p>
                            </div>
                            <div className="flex items-center gap-1.5 shrink-0">
                              <button
                                onClick={(e) => toggleFavorite(p.id, e)}
                                className={`h-6 w-6 rounded-full flex items-center justify-center transition-colors ${
                                  fav ? "bg-red-500" : "bg-white hover:bg-zinc-200"
                                }`}
                                aria-label="Ajouter aux favoris"
                              >
                                <img
                                  src={favoriteIcon}
                                  alt=""
                                  className={`h-3.5 w-3.5 object-contain ${fav ? "brightness-0 invert" : "brightness-0"}`}
                                />
                              </button>
                              <button
                                onClick={() =>
                                  addToCart({ produit_id: p.id, quantite: 1, prix_unitaire: p.prix, titre: p.nom })
                                }
                                className="h-6 w-6 rounded-full bg-orange-500 hover:bg-orange-600 flex items-center justify-center transition-colors"
                                aria-label="Ajouter au panier"
                              >
                                <img src={panierIcone} alt="" className="h-3.5 w-3.5 object-contain brightness-0 invert" />
                              </button>
                            </div>
                          </div>

                          {/* Caractéristiques en 3 colonnes */}
                          <div className="grid grid-cols-2 lg:grid-cols-3 gap-x-6 gap-y-1.5 mt-3 text-[11px] text-white/80">
                            {specs.map((s, i) =>
                              s.label ? (
                                <div key={`${s.label}-${i}`} className="truncate">
                                  {s.label} : <span className="text-white">{s.value}</span>
                                </div>
                              ) : (
                                <div key={`empty-${i}`} className="hidden lg:block" />
                              ),
                            )}
                          </div>

                          {/* Prix + bouton / disponibilité */}
                          <div className="mt-auto pt-3 flex flex-col lg:flex-row lg:items-end justify-between gap-3">
                            <div className="flex items-center gap-4 lg:gap-6">
                              <span className="px-4 py-1 rounded-lg bg-white text-black font-extrabold text-sm lg:text-base whitespace-nowrap">
                                {formatAr(p.prix)}
                              </span>
                              <button
                                onClick={() =>
                                  addToCart({ produit_id: p.id, quantite: 1, prix_unitaire: p.prix, titre: p.nom })
                                }
                                className="px-3 py-1.5 rounded-lg bg-orange-600 hover:bg-orange-700 text-white text-xs font-bold whitespace-nowrap transition-colors"
                              >
                                Ajouter à mon panier
                              </button>
                            </div>

                            <div className="text-[10px] space-y-0.5 lg:text-left">
                              {enStock ? (
                                <p className="flex items-center gap-1.5 text-xs font-bold">
                                  <CheckCircle2 className="h-4 w-4 text-white fill-green-500" />
                                  En stock
                                </p>
                              ) : p.est_dispo ? (
                                <p className="flex items-center gap-1.5 text-xs font-bold">
                                  <CheckCircle2 className="h-4 w-4 text-white fill-green-500" />
                                  Disponible chez notre fournisseur
                                </p>
                              ) : (
                                <p className="flex items-center gap-1.5 text-xs font-bold">
                                  <XCircle className="h-4 w-4 text-white fill-red-500" />
                                  Indisponible
                                </p>
                              )}
                              {!enStock && p.est_dispo && (
                                <>
                                  <p className="flex items-center gap-1 italic">
                                    Expédition sous 02 à 03 semaines par{" "}
                                    <span className="font-bold not-italic">Avion</span>
                                    <Plane className="h-3 w-3 fill-white" />
                                  </p>
                                  <p className="flex items-center gap-1 italic">
                                    Expédition sous 02 à 03 mois par{" "}
                                    <span className="font-bold not-italic">Bateaux</span>
                                    <Sailboat className="h-3 w-3 fill-white" />
                                  </p>
                                </>
                              )}
                            </div>
                          </div>
                        </div>
                      </article>
                    );
                  })}
                </div>
              )}

              {/* Pagination bas de page */}
              {!isLoadingProducts && totalPages > 1 && (
                <div className="flex justify-center pt-6">
                  <Pagination page={currentPage} totalPages={totalPages} onChange={setPage} />
                </div>
              )}
            </section>
          </div>
        </div>
      </div>

      <style>{`
        .price-thumb {
          position: absolute;
          inset: 0;
          width: 100%;
          height: 100%;
          margin: 0;
          background: transparent;
          pointer-events: none;
          -webkit-appearance: none;
          appearance: none;
        }
        .price-thumb::-webkit-slider-thumb {
          -webkit-appearance: none;
          pointer-events: auto;
          height: 14px;
          width: 14px;
          border-radius: 9999px;
          background: #ffffff;
          cursor: pointer;
          border: none;
        }
        .price-thumb::-moz-range-thumb {
          pointer-events: auto;
          height: 14px;
          width: 14px;
          border-radius: 9999px;
          background: #ffffff;
          cursor: pointer;
          border: none;
        }
        .price-thumb::-webkit-slider-runnable-track { background: transparent; }
        .price-thumb::-moz-range-track { background: transparent; }
      `}</style>
    </SiteLayout>
  );
};

export default Catalog;
