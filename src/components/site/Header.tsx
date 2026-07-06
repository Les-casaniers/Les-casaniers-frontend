import {
  Search,
  User,
  Heart,
  ShoppingBag,
  Menu,
  Zap,
  FileText,
  Headphones,
  Shield,
  ChevronDown,
  LogOut,
  LayoutDashboard,
  SlidersHorizontal,
  X,
  Settings,
  HelpCircle,
  Gift,
  Truck,
  Sun,
  Moon,
  Laptop,
  Briefcase,
  Gamepad2,
  Cpu,
  Keyboard,
  Grid3x3,
  BookOpen,
  Package,
  ChevronRight,
  ChevronUp,
  TrendingUp,
  Award,
  Monitor,
  HardDrive,
  Layers,
  MousePointer,
  Printer,
  Tablet,
  Tv,
  Archive,
  RefreshCw,
  Wrench,
  Cat,
} from "lucide-react";
import mascot from "@/assets/casaniers-mascot.png";
import mascotListening from "@/assets/9.png";
import logo from "@/assets/casaniers-logo.png";
import { Button } from "@/components/ui/button";
import { useState, useRef, useEffect } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useShop } from "@/store/shop";
import { ThemeToggle } from "@/components/ThemeToggle";
import { useAuth } from "@/contexts/AuthContext";
import api from "@/service/api";
import { useCartApi } from "@/hooks/useCartApi";
import {
  useCategories,
  useSousCategories,
  useProductsBySubcategory,
  type Category,
  type SousCategory,
  type CategoryWithSubcategoriesAndProducts,
} from "@/hooks/useProducts";
import { SousCategoryMenuSection } from "../mega-menu/MenuProductComponents";


const useTheme = () => {
  const [theme, setTheme] = useState<"light" | "dark" | "system">(() => {
    const savedTheme = localStorage.getItem("theme");
    if (
      savedTheme === "light" ||
      savedTheme === "dark" ||
      savedTheme === "system"
    ) {
      return savedTheme;
    }
    return "system";
  });

  useEffect(() => {
    const root = document.documentElement;
    const systemTheme = window.matchMedia("(prefers-color-scheme: dark)")
      .matches
      ? "dark"
      : "light";
    const effectiveTheme = theme === "system" ? systemTheme : theme;
    root.classList.remove("light", "dark");
    root.classList.add(effectiveTheme);
    localStorage.setItem("theme", theme);
  }, [theme]);

  useEffect(() => {
    const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");
    const handleChange = () => {
      if (theme === "system") {
        const root = document.documentElement;
        const systemTheme = mediaQuery.matches ? "dark" : "light";
        root.classList.remove("light", "dark");
        root.classList.add(systemTheme);
      }
    };
    mediaQuery.addEventListener("change", handleChange);
    return () => mediaQuery.removeEventListener("change", handleChange);
  }, [theme]);

  return { theme, setTheme };
};

// ─── Dynamic Mega Menu helpers ─────────────────────────────────────────────────
const CATEGORY_ICONS: Record<string, React.ReactNode> = {
  default: <Grid3x3 className="h-4 w-4" />,
};

const quickNavLinks = [
  {
    label: "Pro & Freelance",
    href: "/pro",
    icon: <Briefcase className="h-3.5 w-3.5" />,
  },
  {
    label: "GAMER",
    href: "/gaming",
    icon: <Gamepad2 className="h-3.5 w-3.5" />,
    accent: true,
  },
  {
    label: "Importation",
    href: "/importation",
    icon: <Package className="h-3.5 w-3.5" />,
  },
  {
    label: "Guides",
    href: "/guides",
    icon: <BookOpen className="h-3.5 w-3.5" />,
  },
  {
    label: "Boutique de MISA",
    href: "/boutique-de-misa",
    icon: <Cat className="h-3.5 w-3.5" />,
  },
];

export const Header = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isAdminUser, setIsAdminUser] = useState(false);
  const [isCheckingRole, setIsCheckingRole] = useState(true);
  const { user, isAuthenticated, logout } = useAuth();
  const { theme, setTheme } = useTheme();
  const navigate = useNavigate();
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [megaMenuOpen, setMegaMenuOpen] = useState(false);
  const [activeCategoryId, setActiveCategoryId] = useState<number | null>(null);
  const [activeColumnId, setActiveColumnId] = useState<number | null>(null);
  const [openMobileSubmenu, setOpenMobileSubmenu] = useState<string | null>(
    null,
  );
  const userMenuRef = useRef<HTMLDivElement>(null);
  const userButtonRef = useRef<HTMLButtonElement>(null);
  const location = useLocation();
  const { favorites } = useShop();
  const { cartCount } = useCartApi();
  const { data: categories } = useCategories();
  const { data: sousCategories } = useSousCategories();
  const { data: categoriesWithProducts, isLoading: isLoadingProducts } =
    useProductsBySubcategory(3);

  // Debug léger
  useEffect(() => {
    if (categoriesWithProducts) {
      let totalProducts = 0;
      let productsWithImages = 0;
      categoriesWithProducts.forEach(cat => {
        cat.sous_categories.forEach(sc => {
          sc.produits.forEach(product => {
            totalProducts++;
            if (product.image_principale || product.images?.length) {
              productsWithImages++;
            }
          });
        });
      });
      console.log(`📊 Menu chargé: ${categoriesWithProducts.length} catégories, ${totalProducts} produits (${productsWithImages} avec images)`);
    }
  }, [categoriesWithProducts]);

  // Set default active category when categories load
  useEffect(() => {
    if (categories?.length && activeCategoryId === null) {
      setActiveCategoryId(categories[0].id);
    }
  }, [categories, activeCategoryId]);

  const getSousCategoriesForCategory = (catId: number) =>
    sousCategories?.filter((sc) => sc.id_categorie === catId) ?? [];

  const megaMenuRef = useRef<HTMLDivElement>(null);
  const megaMenuTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const [searchNom, setSearchNom] = useState("");
  const [searchRef, setSearchRef] = useState("");
  const [searchCategory, setSearchCategory] = useState("");
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [isSearchFocused, setIsSearchFocused] = useState(false);
  const advancedRef = useRef<HTMLDivElement>(null);
  const mobileMenuRef = useRef<HTMLDivElement>(null);

  const openMegaMenu = () => {
    if (megaMenuTimeoutRef.current) clearTimeout(megaMenuTimeoutRef.current);
    setMegaMenuOpen(true);
  };

  const closeMegaMenu = () => {
    megaMenuTimeoutRef.current = setTimeout(() => setMegaMenuOpen(false), 120);
  };

  const keepMegaMenuOpen = () => {
    if (megaMenuTimeoutRef.current) clearTimeout(megaMenuTimeoutRef.current);
  };

  useEffect(
    () => () => {
      if (megaMenuTimeoutRef.current) clearTimeout(megaMenuTimeoutRef.current);
    },
    [],
  );

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    setSearchNom(params.get("nom") || "");
    setSearchRef(params.get("ref") || "");
    setSearchCategory(params.get("categorie") || "");
  }, [location.search]);

  useEffect(() => {
    const h = (e: MouseEvent) => {
      if (
        advancedRef.current &&
        !advancedRef.current.contains(e.target as Node)
      )
        setShowAdvanced(false);
    };
    document.addEventListener("mousedown", h);
    return () => document.removeEventListener("mousedown", h);
  }, []);

  useEffect(() => {
    const h = (e: MouseEvent) => {
      if (
        userMenuRef.current &&
        userButtonRef.current &&
        !userMenuRef.current.contains(e.target as Node) &&
        !userButtonRef.current.contains(e.target as Node)
      )
        setShowUserMenu(false);
    };
    document.addEventListener("mousedown", h);
    return () => document.removeEventListener("mousedown", h);
  }, []);

  useEffect(() => {
    document.body.style.overflow = mobileMenuOpen ? "hidden" : "unset";
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [mobileMenuOpen]);

  useEffect(() => {
    const check = async () => {
      if (isAuthenticated && user) {
        try {
          const r = await api.post("/admin/check-by-email", {
            email: user.email,
          });
          setIsAdminUser(r.data.isAdmin === true);
        } catch {
          setIsAdminUser(
            [
              "admin@lescasaniers.mg",
              "admin@dupont.com",
              "admin@lescasaniers.com",
            ].includes(user.email || ""),
          );
        }
      } else setIsAdminUser(false);
      setIsCheckingRole(false);
    };
    check();
  }, [isAuthenticated, user]);

  const getUserName = () => {
    if (!isAuthenticated || !user) return "Compte";
    if (user.prenom && user.nom) return `${user.prenom} ${user.nom.charAt(0)}.`;
    if (user.prenom) return user.prenom;
    if (user.nom) return user.nom;
    if (user.email) return user.email.split("@")[0];
    return "Compte";
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const params = new URLSearchParams();
    if (searchNom.trim()) params.set("nom", searchNom.trim());
    if (searchRef.trim()) params.set("ref", searchRef.trim());
    if (searchCategory) params.set("categorie", searchCategory);
    setShowAdvanced(false);
    navigate(`/catalogue?${params.toString()}`);
    if (window.innerWidth < 768) setMobileMenuOpen(false);
  };

  const handleLogout = () => {
    logout();
    navigate("/login");
    setShowUserMenu(false);
    setMobileMenuOpen(false);
  };

  const getDashboardUrl = () =>
    isAdminUser ? "/DashboardAdmin" : "/DashboardClient";
  const getDashboardLabel = () =>
    isAdminUser ? "Admin Dashboard" : "Mon compte";

  const isActive = (href: string) => {
    const p = location.pathname,
      s = location.search;
    if (href.includes("?")) {
      const [path, query] = href.split("?");
      return p === path && s === `?${query}`;
    }
    if (href === "/catalogue") return p === "/catalogue";
    return p === href || p.startsWith(href + "/");
  };

  const themeOptions = [
    {
      value: "light" as const,
      icon: <Sun className="h-4 w-4" />,
      label: "Clair",
    },
    {
      value: "dark" as const,
      icon: <Moon className="h-4 w-4" />,
      label: "Sombre",
    },
  ];

  const activeCategory =
    categories?.find((c) => c.id === activeCategoryId) ??
    categories?.[0] ??
    null;
  const activeSousCategories = activeCategory
    ? getSousCategoriesForCategory(activeCategory.id)
    : [];

  return (
    <header className="sticky top-0 z-50 bg-background border-b border-border theme-transition">
      {/* Main header */}
      <div className="container-x py-3 lg:py-3.5">
        <div className="flex items-center gap-3 lg:gap-5">
          <Link to="/" className="flex items-center gap-2 shrink-0 group">
            <img
              src={logo}
              alt="Les Casaniers"
              className="h-10 sm:h-11 lg:h-20 w-auto object-contain dark:brightness-0 dark:invert transition-transform duration-300 group-hover:scale-105"
            />
          </Link>

          <form
            onSubmit={handleSearchSubmit}
            className="relative flex-1 max-w-2xl"
          >
            <div className="relative flex items-center">
              <div className="relative flex-1">
                <input
                  type="search"
                  value={searchNom}
                  onChange={(e) => setSearchNom(e.target.value)}
                  onFocus={() => setIsSearchFocused(true)}
                  onBlur={() => setIsSearchFocused(false)}
                  placeholder="Rechercher un produit, une référence..."
                  className="w-full h-10 lg:h-11 pl-4 lg:pl-5 pr-24 rounded-full bg-secondary border-2 border-transparent focus:border-primary/50 focus:bg-background focus:outline-none text-sm transition-all"
                />
                <button
                  type="button"
                  onClick={() => setShowAdvanced(!showAdvanced)}
                  className={`absolute right-12 top-1/2 -translate-y-1/2 p-1.5 rounded-full transition-all ${showAdvanced || searchRef || searchCategory ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:text-foreground hover:bg-secondary"}`}
                >
                  <SlidersHorizontal className="h-3.5 w-3.5" />
                </button>
                <button
                  type="submit"
                  className="absolute right-1 top-1/2 -translate-y-1/2 h-8 w-8 rounded-full bg-foreground text-background hover:bg-foreground/80 transition-all flex items-center justify-center"
                >
                  <Search className="h-3.5 w-3.5" />
                </button>
              </div>
              <img
                src={isSearchFocused ? mascotListening : mascot}
                alt=""
                aria-hidden
                className="hidden lg:block absolute -top-6 right-20 h-20 w-auto object-contain pointer-events-none transition-all duration-300"
              />
            </div>

            {showAdvanced && (
              <div
                ref={advancedRef}
                className="absolute left-0 right-0 top-full mt-2 bg-popover border border-border rounded-2xl shadow-xl p-4 z-50 animate-in fade-in slide-in-from-top-2 duration-200"
              >
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                      Référence
                    </label>
                    <input
                      type="text"
                      value={searchRef}
                      onChange={(e) => setSearchRef(e.target.value)}
                      placeholder="Ex: CPU-INTEL-12700K"
                      className="w-full h-10 px-3 rounded-lg bg-secondary border border-transparent focus:border-primary focus:outline-none text-sm"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                      Catégorie
                    </label>
                    <div className="relative">
                      <select
                        value={searchCategory}
                        onChange={(e) => setSearchCategory(e.target.value)}
                        className="w-full h-10 px-3 rounded-lg bg-secondary border border-transparent focus:border-primary focus:outline-none appearance-none text-sm"
                      >
                        <option value="">Toutes les catégories</option>
                        {categories?.map((cat) => (
                          <option key={cat.id} value={cat.id}>
                            {cat.nom}
                          </option>
                        ))}
                      </select>
                      <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
                    </div>
                  </div>
                </div>
                <div className="flex justify-end gap-2 mt-4 pt-3 border-t border-border">
                  <button
                    type="button"
                    onClick={() => {
                      setSearchRef("");
                      setSearchCategory("");
                    }}
                    className="px-3 py-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors"
                  >
                    Effacer
                  </button>
                  <button
                    type="submit"
                    onClick={handleSearchSubmit}
                    className="px-4 py-1.5 bg-primary text-primary-foreground rounded-lg text-sm font-medium hover:bg-primary/90 transition-colors"
                  >
                    Appliquer
                  </button>
                </div>
              </div>
            )}
          </form>

          <div className="hidden md:flex items-center gap-1 lg:gap-2">
            <ThemeToggle />
            <ActionButton
              to="/favoris"
              icon={<Heart className="h-5 w-5" />}
              label="Favoris"
              count={favorites?.length}
            />
            <ActionButton
              to="/panier"
              icon={<ShoppingBag className="h-5 w-5" />}
              label="Panier"
              count={cartCount}
            />

            <div className="relative">
              {isAuthenticated ? (
                <>
                  <button
                    ref={userButtonRef}
                    onClick={() => setShowUserMenu(!showUserMenu)}
                    className="flex items-center gap-2 px-3 py-2 rounded-full hover:bg-secondary transition-all"
                  >
                    <div className="relative">
                      <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary to-primary/60 flex items-center justify-center text-primary-foreground font-semibold text-sm">
                        {getUserName().charAt(0).toUpperCase()}
                      </div>
                      <span className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 bg-green-500 rounded-full border-2 border-background" />
                    </div>
                    <span className="text-sm font-medium hidden lg:inline">
                      {getUserName()}
                    </span>
                    <ChevronDown
                      className={`h-3.5 w-3.5 transition-transform duration-200 ${showUserMenu ? "rotate-180" : ""}`}
                    />
                  </button>
                  {showUserMenu && (
                    <div
                      ref={userMenuRef}
                      className="absolute right-0 top-full mt-2 w-64 bg-popover border border-border rounded-xl shadow-xl py-2 z-50 animate-in fade-in slide-in-from-top-2 duration-200"
                    >
                      <div className="px-4 py-3 border-b border-border">
                        <p className="text-sm font-semibold">
                          {user?.prenom} {user?.nom}
                        </p>
                        <p className="text-xs text-muted-foreground mt-0.5">
                          {user?.email}
                        </p>
                      </div>
                      <Link
                        to={getDashboardUrl()}
                        onClick={() => setShowUserMenu(false)}
                        className="flex items-center gap-3 px-4 py-2.5 text-sm hover:bg-secondary transition-colors"
                      >
                        <LayoutDashboard className="h-4 w-4" />
                        {getDashboardLabel()}
                      </Link>
                      <Link
                        to="/DashboardClient/commandes"
                        onClick={() => setShowUserMenu(false)}
                        className="flex items-center gap-3 px-4 py-2.5 text-sm hover:bg-secondary transition-colors"
                      >
                        <Package className="h-4 w-4" />
                        Mes commandes
                      </Link>
                      <button
                        onClick={handleLogout}
                        className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 dark:hover:bg-red-950/30 transition-colors border-t border-border mt-2 pt-2"
                      >
                        <LogOut className="h-4 w-4" />
                        Déconnexion
                      </button>
                    </div>
                  )}
                </>
              ) : (
                <Link
                  to="/login"
                  className="flex flex-col items-center gap-0.5 group px-2 py-1 rounded-lg hover:bg-secondary transition-all"
                >
                  <div>
                    <User className="h-5 w-5" />
                  </div>
                  <span className="text-[10px] uppercase tracking-wider font-medium">
                    Compte
                  </span>
                </Link>
              )}
            </div>
          </div>

          <div className="flex items-center gap-1 md:hidden">
            <Link to="/favoris" className="relative p-2">
              <Heart className="h-5 w-5" />
              {favorites?.length > 0 && (
                <span className="absolute -top-1 -right-1 h-4 min-w-4 px-1 rounded-full bg-primary text-primary-foreground text-[10px] font-bold flex items-center justify-center">
                  {favorites.length > 9 ? "9+" : favorites.length}
                </span>
              )}
            </Link>
            <Link to="/panier" className="relative p-2">
              <ShoppingBag className="h-5 w-5" />
              {cartCount > 0 && (
                <span className="absolute -top-1 -right-1 h-4 min-w-4 px-1 rounded-full bg-primary text-primary-foreground text-[10px] font-bold flex items-center justify-center">
                  {cartCount > 9 ? "9+" : cartCount}
                </span>
              )}
            </Link>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setMobileMenuOpen(true)}
            >
              <Menu className="h-5 w-5" />
            </Button>
          </div>
        </div>
      </div>

      {/* Desktop Navigation Bar */}
      <nav className="hidden lg:block border-t border-border bg-background">
        <div className="container-x">
          <div className="flex items-center gap-0">
            {/* "Nos Produits" mega trigger */}
            <div
              className="relative"
              onMouseEnter={openMegaMenu}
              onMouseLeave={closeMegaMenu}
            >
              <button
                className={`
                  flex items-center gap-2 px-5 py-3.5 font-bold text-sm transition-all
                  bg-foreground text-background rounded-md
                  hover:bg-foreground/90
                  ${megaMenuOpen ? "bg-foreground/90" : ""}
                `}
              >
                <Menu className="h-4 w-4" />
                <span>CATEGORIE </span>
                <ChevronDown
                  className={`h-3.5 w-3.5 transition-transform duration-200 ${megaMenuOpen ? "rotate-180" : ""}`}
                />
              </button>

              {/* Mega Menu Panel */}
              {megaMenuOpen && (
                <div
                  ref={megaMenuRef}
                  onMouseEnter={keepMegaMenuOpen}
                  onMouseLeave={closeMegaMenu}
                  className="absolute left-0 top-full z-50 animate-in fade-in slide-in-from-top-1 duration-150"
                  style={{ width: "1000px" }}
                >
                  <div className="mt-1 bg-popover border border-border rounded-xl shadow-2xl overflow-hidden">
                    <div className="flex" style={{ maxHeight: "560px" }}>
                      {/* Sidebar catégories */}
                      <div className="w-64 shrink-0 bg-gradient-to-b from-secondary/40 to-secondary/20 border-r border-border/50 overflow-y-auto">
                        {categories?.map((cat) => (
                          <button
                            key={cat.id}
                            onMouseEnter={() => setActiveCategoryId(cat.id)}
                            onClick={() => {
                              navigate(`/catalogue?categorie=${cat.id}`);
                              setMegaMenuOpen(false);
                            }}
                            className={`
                              w-full flex items-center justify-between gap-2 px-5 py-3 text-sm transition-all duration-200 text-left
                              ${activeCategoryId === cat.id
                                ? "bg-gradient-to-r from-primary/10 to-transparent text-primary font-semibold border-l-4 border-primary"
                                : "text-foreground/80 hover:bg-secondary/50 hover:text-foreground"
                              }
                            `}
                          >
                            <span className="flex items-center gap-3">
                              <span
                                className={`transition-colors duration-200 ${activeCategoryId === cat.id ? "text-primary" : "text-muted-foreground"}`}
                              >
                                {CATEGORY_ICONS.default}
                              </span>
                              <span className="font-medium">{cat.nom}</span>
                            </span>
                            <ChevronRight
                              className={`h-3.5 w-3.5 transition-all duration-200 ${activeCategoryId === cat.id ? "text-primary translate-x-0.5" : "text-muted-foreground/40"}`}
                            />
                          </button>
                        ))}
                      </div>

                      {/* Panel contenu - SOUS-CATÉGORIES AVEC PRODUITS */}
                      <div className="flex-1 overflow-y-auto p-6 bg-popover">
                        {activeCategory && (
                          <div>
                            <div className="flex items-center justify-between mb-5 pb-2 border-b border-border">
                              <h3 className="text-sm font-bold uppercase tracking-wider bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
                                {activeCategory.nom}
                              </h3>
                              <Link
                                to={`/catalogue?categorie=${activeCategory.id}`}
                                onClick={() => setMegaMenuOpen(false)}
                                className="text-xs text-primary hover:text-primary/80 font-medium flex items-center gap-1 transition-colors"
                              >
                                Voir tout <ChevronRight className="h-3 w-3" />
                              </Link>
                            </div>

                            {isLoadingProducts ? (
                              <div className="flex justify-center py-8">
                                <RefreshCw className="h-6 w-6 animate-spin text-muted-foreground" />
                              </div>
                            ) : (
                              <div className="grid grid-cols-2 gap-x-8 gap-y-4">
                                {(() => {
                                  const activeCategoryData = categoriesWithProducts?.find(
                                    (c) => c.id === activeCategory.id
                                  );

                                  if (activeCategoryData?.sous_categories?.length) {
                                    return activeCategoryData.sous_categories.map((sousCat) => (
                                      <SousCategoryMenuSection
                                        key={sousCat.id}
                                        sousCategory={sousCat}
                                        categoryId={activeCategory.id}
                                        onClose={() => setMegaMenuOpen(false)}
                                      />
                                    ));
                                  }

                                  // Fallback: liens simples
                                  return activeSousCategories.map((sc) => (
                                    <Link
                                      key={sc.id}
                                      to={`/catalogue?categorie=${activeCategory.id}&sous_categorie=${sc.id}`}
                                      onClick={() => setMegaMenuOpen(false)}
                                      className="group/link flex items-center gap-2 py-2 text-sm text-foreground/75 hover:text-primary transition-all duration-200"
                                    >
                                      <ChevronRight className="h-3 w-3 text-muted-foreground/40 group-hover/link:text-primary transition-all duration-200 shrink-0" />
                                      <span className="group-hover/link:translate-x-0.5 transition-transform duration-200">
                                        {sc.nom}
                                      </span>
                                    </Link>
                                  ));
                                })()}
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Footer avec avantages */}
                    <div className="border-t border-border/50 bg-gradient-to-r from-secondary/30 to-secondary/10 px-6 py-3 flex items-center justify-between">
                      <div className="flex items-center gap-4 text-xs text-muted-foreground">
                        <span className="flex items-center gap-1.5">
                          <Truck className="h-3.5 w-3.5" /> Livraison offerte
                          dès + de 5 000 000 Ar
                        </span>
                        <span className="flex items-center gap-1.5">
                          <Shield className="h-3.5 w-3.5" /> Paiement sécurisé
                        </span>
                        <span className="flex items-center gap-1.5">
                          <Headphones className="h-3.5 w-3.5" /> Support 7j/7
                        </span>
                      </div>
                      <Link
                        to="/promotions"
                        className="text-xs font-medium text-primary hover:text-primary/80 flex items-center gap-1.5 transition-colors"
                      >
                        <Gift className="h-3.5 w-3.5" /> Voir les promotions
                      </Link>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Quick nav links */}
            {quickNavLinks.map((item) => (
              <Link
                key={item.label}
                to={item.href}
                className={`
                  relative group flex items-center border border-1 rounded-md m-1 gap-1 px-4 py-3.5 text-xs font-semibold uppercase tracking-wide transition-all whitespace-nowrap
                  ${item.highlight
                    ? "text-amber-600 dark:text-amber-400 hover:text-amber-700"
                    : item.accent
                      ? "text-primary hover:text-primary/80"
                      : "text-muted-foreground hover:text-foreground"
                  }
                  ${isActive(item.href) ? "text-primary" : ""}
                  border-r border-border
                  bg-background
                `}
              >
                <span className="transition-transform duration-200 group-hover:scale-110">
                  {item.icon}
                </span>
                <span>{item.label}</span>
                {item.badge && (
                  <span className="text-[9px] font-extrabold px-1.5 py-0.5 rounded-full bg-amber-500 text-white leading-none">
                    {item.badge}
                  </span>
                )}
                <span
                  className={`absolute bottom-0 left-0 right-0 h-0.5 bg-primary rounded-full transition-all duration-200 ${isActive(item.href) ? "opacity-100" : "opacity-0 group-hover:opacity-40"}`}
                />
              </Link>
            ))}

            <Link
              to="/configurateur"
              className="ml-auto flex items-center gap-2 px-5 py-2 text-xs font-bold uppercase tracking-wider bg-gradient-to-r from-amber-500 to-orange-500 text-white hover:from-amber-600 hover:to-orange-600 transition-all rounded-full shadow-md hover:shadow-xl transform hover:-translate-y-0.5 mr-1 whitespace-nowrap"
            >
              <Zap className="h-3.5 w-3.5" />
              <span>Configurateur Pro</span>
            </Link>
          </div>
        </div>
      </nav>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <>
          <div
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 animate-in fade-in duration-200"
            onClick={() => setMobileMenuOpen(false)}
          />
          <div
            ref={mobileMenuRef}
            className="fixed top-0 right-0 h-full w-[85%] max-w-sm bg-background z-50 shadow-2xl animate-in slide-in-from-right duration-300 overflow-y-auto"
          >
            <div className="sticky top-0 bg-background border-b border-border z-10">
              <div className="flex items-center justify-between p-4 bg-gradient-to-r from-primary/5 to-transparent">
                <img
                  src={logo}
                  alt="Les Casaniers"
                  className="h-8 w-auto dark:brightness-0 dark:invert"
                />
                <button
                  onClick={() => setMobileMenuOpen(false)}
                  className="p-2 rounded-full hover:bg-secondary transition-colors"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
            </div>

            <div className="p-4 border-b border-border">
              {isAuthenticated ? (
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-full bg-gradient-to-br from-primary to-primary/60 flex items-center justify-center text-primary-foreground font-bold text-lg">
                    {getUserName().charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <p className="font-semibold">
                      {user?.prenom} {user?.nom}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {user?.email}
                    </p>
                  </div>
                </div>
              ) : (
                <Link
                  to="/login"
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center justify-center gap-2 w-full py-3 bg-primary text-primary-foreground rounded-xl font-medium"
                >
                  <User className="h-4 w-4" />
                  Se connecter
                </Link>
              )}
            </div>

            <div className="p-4 border-b border-border">
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">
                Thème
              </p>
              <div className="grid grid-cols-2 gap-2">
                {themeOptions.map((o) => (
                  <button
                    key={o.value}
                    onClick={() => setTheme(o.value)}
                    className={`flex items-center justify-center gap-2 py-2.5 px-3 rounded-lg transition-all ${theme === o.value ? "bg-primary text-primary-foreground shadow-md" : "bg-secondary hover:bg-secondary/80"}`}
                  >
                    {o.icon}
                    <span className="text-sm font-medium">{o.label}</span>
                  </button>
                ))}
              </div>
            </div>

            <div className="py-4">
              <div className="px-4 space-y-1">
                <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider px-3 mb-2">
                  Nos Produits
                </p>
                {categories?.map((cat) => {
                  const isOpen = openMobileSubmenu === String(cat.id);
                  const catSousCategories = getSousCategoriesForCategory(
                    cat.id,
                  );

                  return (
                    <div
                      key={cat.id}
                      className="space-y-1 border border-border rounded-lg mb-2 bg-background"
                    >
                      <button
                        onClick={() =>
                          setOpenMobileSubmenu(isOpen ? null : String(cat.id))
                        }
                        className="w-full flex items-center justify-between gap-3 px-3 py-3 rounded-xl hover:bg-secondary transition-all"
                      >
                        <div className="flex items-center gap-3 text-sm">
                          <span className="text-primary">
                            {CATEGORY_ICONS.default}
                          </span>
                          <span>{cat.nom}</span>
                        </div>
                        {isOpen ? (
                          <ChevronUp className="h-4 w-4 text-muted-foreground" />
                        ) : (
                          <ChevronDown className="h-4 w-4 text-muted-foreground" />
                        )}
                      </button>
                      {isOpen && (
                        <div className="ml-8 space-y-0.5 border-l-2 border-border pl-3 animate-in slide-in-from-left-2 duration-200">
                          <div className="mb-3">
                            <Link
                              to={`/catalogue?categorie=${cat.id}`}
                              onClick={() => {
                                setMobileMenuOpen(false);
                                setOpenMobileSubmenu(null);
                              }}
                              className="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-secondary transition-all text-sm font-semibold"
                            >
                              <ChevronRight className="h-3 w-3 text-primary shrink-0" />
                              <span>Tous les produits</span>
                            </Link>
                            {catSousCategories.map((sc) => (
                              <Link
                                key={sc.id}
                                to={`/catalogue?categorie=${cat.id}&sous_categorie=${sc.id}`}
                                onClick={() => {
                                  setMobileMenuOpen(false);
                                  setOpenMobileSubmenu(null);
                                }}
                                className="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-secondary transition-all text-sm"
                              >
                                <ChevronRight className="h-3 w-3 text-muted-foreground shrink-0" />
                                <span>{sc.nom}</span>
                              </Link>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>

              <div className="mt-4 px-4 space-y-1">
                <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider px-3 mb-2">
                  Accès rapide
                </p>
                {quickNavLinks.map((item) => (
                  <Link
                    key={item.label}
                    to={item.href}
                    onClick={() => setMobileMenuOpen(false)}
                    className={`flex items-center gap-3 px-3 py-3 rounded-xl transition-all text-sm ${isActive(item.href) ? "bg-primary/10 text-primary font-medium" : "hover:bg-secondary"} border border-border bg-background mb-2`}
                  >
                    <span className="text-primary">{item.icon}</span>
                    <span>{item.label}</span>
                    {item.badge && (
                      <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-full bg-amber-500 text-white ml-auto">
                        {item.badge}
                      </span>
                    )}
                  </Link>
                ))}
              </div>

              <div className="mt-4 px-4 space-y-1">
                <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider px-3 mb-2">
                  Mon compte
                </p>
                {isAuthenticated ? (
                  <>
                    <Link
                      to={getDashboardUrl()}
                      onClick={() => setMobileMenuOpen(false)}
                      className="flex items-center gap-3 px-3 py-3 rounded-xl hover:bg-secondary transition-all text-sm border border-border bg-background mb-2"
                    >
                      <LayoutDashboard className="h-4 w-4" />
                      {getDashboardLabel()}
                    </Link>
                    <Link
                      to="/commandes"
                      onClick={() => setMobileMenuOpen(false)}
                      className="flex items-center gap-3 px-3 py-3 rounded-xl hover:bg-secondary transition-all text-sm border border-border bg-background mb-2"
                    >
                      <Package className="h-4 w-4" />
                      Mes commandes
                    </Link>
                    <Link
                      to="/favoris"
                      onClick={() => setMobileMenuOpen(false)}
                      className="flex items-center gap-3 px-3 py-3 rounded-xl hover:bg-secondary transition-all text-sm border border-border bg-background mb-2"
                    >
                      <Heart className="h-4 w-4" />
                      Favoris
                      {favorites?.length > 0 && (
                        <span className="ml-auto text-xs bg-primary/10 text-primary px-2 py-0.5 rounded-full">
                          {favorites.length}
                        </span>
                      )}
                    </Link>
                    <Link
                      to="/parametres"
                      onClick={() => setMobileMenuOpen(false)}
                      className="flex items-center gap-3 px-3 py-3 rounded-xl hover:bg-secondary transition-all text-sm border border-border bg-background mb-2"
                    >
                      <Settings className="h-4 w-4" />
                      Paramètres
                    </Link>
                    <button
                      onClick={handleLogout}
                      className="w-full flex items-center gap-3 px-3 py-3 rounded-xl text-red-600 hover:bg-red-50 dark:hover:bg-red-950/30 transition-all text-sm border border-border bg-background mb-2"
                    >
                      <LogOut className="h-4 w-4" />
                      Déconnexion
                    </button>
                  </>
                ) : (
                  <>
                    <Link
                      to="/favoris"
                      onClick={() => setMobileMenuOpen(false)}
                      className="flex items-center gap-3 px-3 py-3 rounded-xl hover:bg-secondary transition-all text-sm border border-border bg-background mb-2"
                    >
                      <Heart className="h-4 w-4" />
                      Favoris
                    </Link>
                    <Link
                      to="/aide"
                      onClick={() => setMobileMenuOpen(false)}
                      className="flex items-center gap-3 px-3 py-3 rounded-xl hover:bg-secondary transition-all text-sm border border-border bg-background mb-2"
                    >
                      <HelpCircle className="h-4 w-4" />
                      Aide
                    </Link>
                  </>
                )}
              </div>
            </div>
          </div>
        </>
      )}
    </header>
  );
};

const ActionButton = ({
  to,
  icon,
  label,
  count,
}: {
  to: string;
  icon: React.ReactNode;
  label: string;
  count?: number;
}) => (
  <Link
    to={to}
    className="relative flex flex-col items-center gap-0.5 group px-2 py-1 rounded-lg hover:bg-secondary transition-all"
  >
    <div className="relative">
      {icon}
      {count !== undefined && count > 0 && (
        <span className="absolute -top-2 -right-2 h-4 min-w-4 px-1 rounded-full bg-primary text-primary-foreground text-[10px] font-bold flex items-center justify-center animate-in zoom-in">
          {count > 99 ? "99+" : count}
        </span>
      )}
    </div>
    <span className="text-[10px] uppercase tracking-wider font-medium">
      {label}
    </span>
  </Link>
);