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
import favoriteIcon from "@/assets/Favorite.png";
import profileIncone from "@/assets/Profile.png";
import lightIncone from "@/assets/Light.png"
import panierIncone from "@/assets/Basket.png";
import searchIncone from "@/assets/Search.png"
import { Button } from "@/components/ui/button";
import { useState, useRef, useEffect } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useShop } from "@/store/shop";
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
import { CategoriesMegaMenu } from '../mega-menu/CategoriesMegaMenu';
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
  { label: "Pro & Freelance", href: "/pro" },
  { label: "Gamer", href: "/gaming", accent: true },
  { label: "Guides", href: "/guides" },
  { label: "Importation", href: "/importation" },
  { label: "Boutique de MISA", href: "/boutique-de-misa" },
  { label: "Devis Express", href: "/devis-express" },
];

// Padding horizontal partagé entre toutes les lignes du header, pour garantir l'alignement des bords
const HEADER_PADDING_X = "px-4 lg:px-6";
// Hauteur fixe de la ligne du haut — TOUT (logo, recherche, compte/favoris/panier) est centré dedans,
// donc plus aucune dépendance au plus grand élément (fini les décalages verticaux imprévisibles)
const HEADER_TOP_ROW_HEIGHT = "h-28 lg:h-32";

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

  const activeCategory =
    categories?.find((c) => c.id === activeCategoryId) ??
    categories?.[0] ??
    null;
  const activeSousCategories = activeCategory
    ? getSousCategoriesForCategory(activeCategory.id)
    : [];

  return (
    <header className="sticky top-0 z-50 bg-black text-white border-b border-white/20 theme-transition">
      {/* Top row: logo + search + account/favorites/cart — hauteur fixe, tout est centré dedans */}
      <div className={`w-full ${HEADER_PADDING_X}`}>
        <div className={`flex items-center gap-2 lg:gap-3 ${HEADER_TOP_ROW_HEIGHT}`}>
         {/* Logo — hauteur ajustée pour correspondre visuellement au bouton CATEGORIE, sans toucher à CATEGORIE lui-même */}
{/* Logo — encore plus grand */}
<Link to="/" className="flex items-center shrink-0 group -ml-4 lg:-ml-4">
  <img
    src={logo}
    alt="Les Casaniers"
    className="h-40 w-auto object-contain brightness-0 invert scale-110 transition-transform duration-300 group-hover:scale-115"
  />
</Link>
          {/* Search — Center */}
<form
  onSubmit={handleSearchSubmit}
  className="relative flex-1 max-w-xl lg:max-w-[500px] xl:max-w-[560px] mx-6 translate-y-9 -translate-x-6"
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
                  className="w-full h-8 lg:h-9 pl-4 lg:pl-5 pr-12 rounded-full bg-white border-2 border-white text-black placeholder:text-zinc-400 focus:border-white focus:outline-none text-sm italic transition-all"
                />
                <button
                  type="button"
                  onClick={() => setShowAdvanced(!showAdvanced)}
                  className={`hidden absolute right-12 top-1/2 -translate-y-1/2 p-1.5 rounded-full transition-all ${showAdvanced || searchRef || searchCategory ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:text-foreground hover:bg-secondary"}`}
                >
                  <SlidersHorizontal className="h-3.5 w-3.5" />
                </button>
                <button
                  type="submit"
                  className="absolute right-2 top-1/2 -translate-y-1/2 h-8 w-8 rounded-full text-zinc-500 hover:text-black transition-all flex items-center justify-center"
                >
                  <img
          src={searchIncone}
          alt="Rechercher"
          className="h-6 w-6 object-contain"
        />
                </button>
              </div>
              <img
                src={isSearchFocused ? mascotListening : mascot}
                alt=""
                aria-hidden
                className="hidden"
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
                        className="w-full h- px-3 rounded-lg bg-secondary border border-transparent focus:border-primary focus:outline-none appearance-none text-sm"
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

          {/* Compte / Favoris / Panier — centré verticalement dans la ligne fixe, collé au bord droit grâce à lg:ml-auto */}
<div className="hidden md:flex items-center gap-3 lg:ml-auto lg:gap-5 xl:gap-7 shrink-2 translate-y-8">
            <div className="relative">
              {isAuthenticated ? (
                <>
                  <button
                    ref={userButtonRef}
                    onClick={() => setShowUserMenu(!showUserMenu)}
                    className="flex flex-col items-center gap-1 px-2 py-1.5 rounded-lg hover:bg-white/10 transition-all"
                  >
                    <div className="relative">
                      <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary to-primary/60 flex items-center justify-center text-primary-foreground font-semibold text-xs">
                        {getUserName().charAt(0).toUpperCase()}
                      </div>
                      <span className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 bg-green-500 rounded-full border-2 border-background" />
                    </div>
                    <span className="text-[10px] uppercase tracking-wider font-medium">
                      {getUserName()}
                    </span>
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
                  className="flex flex-col items-center gap-1 group px-2 py-1.5 rounded-lg hover:bg-white/10 transition-all"
                >
                  <img src={profileIncone} alt="" className="h-7 w-7 object-contain" />
                  <span className="text-[10px] uppercase tracking-wider font-medium">
                    Compte
                  </span>
                </Link>
              )}
            </div>

            <ActionButton
              to="/favoris"
              icon={<img src={favoriteIcon} alt="" className="h-7 w-7 object-contain" />}
              label="Favoris"
              count={favorites?.length}
            />
            <ActionButton
              to="/panier"
              icon={<img src={panierIncone} alt="" className="h-7 w-7 object-contain" />}
              label="Panier"
              count={cartCount}
            />
          </div>

          {/* Mobile icons */}
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

      {/* Desktop Navigation Bar — MÊME padding horizontal que la ligne du haut (HEADER_PADDING_X) */}
      <nav className="hidden sm:block bg-black">
        <div className={`w-full ${HEADER_PADDING_X}`}>
          <div className="flex items-center gap-2 xl:gap-3 py-1.5 overflow-x-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
            {/* "Nos Produits" mega trigger */}
            <div
              className="relative shrink-0"
              onMouseEnter={openMegaMenu}
              onMouseLeave={closeMegaMenu}
            >
<button
  className={`
    flex items-center gap-2 px-3 py-2.5 font-bold text-xs transition-all
    bg-white text-black rounded-md ml-2 xl:ml-4
    hover:bg-zinc-200
    ${megaMenuOpen ? "bg-zinc-200" : ""}
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
                  className="absolute left-0 top-full z-50 animate-in fade-in slide-in-from-top-1 duration-150 pt-2"
                >
                  <CategoriesMegaMenu />
                </div>
              )}
            </div>

            {/* Quick nav links — espacement resserré à lg, comme avant à partir de xl */}
            <div className="flex items-center gap-2 xl:gap-5 ml-3 xl:ml-8 shrink-0">
{quickNavLinks.map((item) => (
  <Link
    key={item.label}
    to={item.href}
    className={`
      relative group flex items-center border rounded-md gap-1.5 px-3 xl:px-6 py-2.5 text-xs font-semibold tracking-wide transition-all whitespace-nowrap
      ${item.accent
        ? "text-white hover:text-white"
        : "text-zinc-200 hover:text-white"
      }
      ${isActive(item.href) ? "text-primary" : ""}
      ${item.label === "Devis Express" ? "xl:mr-4" : ""}
      border-zinc-600 bg-black
    `}
  >
    <span>{item.label}</span>
    <span
      className={`absolute bottom-0 left-0 right-0 h-0.5 bg-primary rounded-full transition-all duration-200 ${isActive(item.href) ? "opacity-100" : "opacity-0 group-hover:opacity-40"}`}
    />
  </Link>
))}
           
            </div>

            {/* Configurateur Pro — padding et marges resserrés à lg, comme avant à partir de xl */}
<Link
  to="/configurateur"
  className="ml-auto flex items-center gap-2 xl:gap-3 pl-4 xl:pl-12 pr-4 xl:pr-12 py-2 shrink-0
  text-xs font-bold tracking-wide bg-gradient-to-r from-orange-500 to-orange-600 
  text-white hover:from-orange-600 hover:to-orange-700 transition-all 
  rounded-md shadow-md
  hover:shadow-xl transform hover:-translate-y-0.5 whitespace-nowrap"
>
  <img 
    src={lightIncone} 
    alt="" 
    className="h-5 w-5 xl:h-7 xl:w-7 object-contain" 
  />
  <span className="text-sm">Configurateur Pro</span>
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
            className="dark fixed top-0 right-0 h-full w-[85%] max-w-sm bg-background z-50 shadow-2xl animate-in slide-in-from-right duration-300 overflow-y-auto"
          >
            <div className="sticky top-0 bg-background border-b border-border z-10">
              <div className="flex items-center justify-between p-4 bg-gradient-to-r from-primary/5 to-transparent">
                <img
                  src={logo}
                  alt="Les Casaniers"
                  className="h-12 w-auto dark:brightness-0 dark:invert"
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
                    <span>{item.label}</span>
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
    className="relative flex flex-col items-center gap-1 group px-2 py-1.5 rounded-lg hover:bg-white/10 transition-all"
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