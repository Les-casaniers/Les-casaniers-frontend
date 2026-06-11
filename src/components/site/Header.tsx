import { 
  Search, User, Heart, ShoppingBag, Menu, Zap, FileText, Headphones, 
  Shield, ChevronDown, LogOut, LayoutDashboard, SlidersHorizontal, X, 
  Settings, HelpCircle, Gift, Truck, Sun, Moon, Laptop, Briefcase, 
  Gamepad2, Cpu, Keyboard, Grid3x3, BookOpen, Package, 
  ChevronRight, ChevronUp, TrendingUp, Award 
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
import { useCategories } from "@/hooks/useProducts";

// Hook pour le thème complet
const useTheme = () => {
  const [theme, setTheme] = useState<'light' | 'dark' | 'system'>(() => {
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme === 'light' || savedTheme === 'dark' || savedTheme === 'system') {
      return savedTheme;
    }
    return 'system';
  });

  useEffect(() => {
    const root = document.documentElement;
    const systemTheme = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
    const effectiveTheme = theme === 'system' ? systemTheme : theme;
    
    root.classList.remove('light', 'dark');
    root.classList.add(effectiveTheme);
    localStorage.setItem('theme', theme);
  }, [theme]);

  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    const handleChange = () => {
      if (theme === 'system') {
        const root = document.documentElement;
        const systemTheme = mediaQuery.matches ? 'dark' : 'light';
        root.classList.remove('light', 'dark');
        root.classList.add(systemTheme);
      }
    };
    
    mediaQuery.addEventListener('change', handleChange);
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, [theme]);

  return { theme, setTheme };
};

// Structure des données du menu avec sous-catégories
const menuData = [
  {
    label: "Pro & Freelance",
    href: "/pro-freelance",
    icon: <Briefcase className="h-4 w-4" />,
    categoryId: "pro-freelance",
    subItems: [
      { label: "Stations de travail", href: "/catalogue?categorie=station-travail", description: "Performance maximale" },
      { label: "PC Portables Pro", href: "/catalogue?categorie=portable-pro", description: "Mobilité et puissance" },
      { label: "Composants Pro", href: "/catalogue?categorie=composants-pro", description: "Qualité professionnelle" },
      { label: "Solutions Cloud", href: "/catalogue?categorie=cloud", description: "Travail à distance" }
    ]
  },
  {
    label: "Gaming",
    href: "/gaming",
    icon: <Gamepad2 className="h-4 w-4" />,
    categoryId: "gaming",
    subItems: [
      { label: "PC Gamer", href: "/catalogue?categorie=pc-gamer", description: "Prêts à jouer" },
      { label: "PC Gamer Montés", href: "/catalogue?categorie=pc-monte", description: "Configurations optimisées" },
      { label: "Accessoires Gaming", href: "/catalogue?categorie=accessoires-gaming", description: "Claviers, souris, casques" },
      { label: "Streaming", href: "/catalogue?categorie=streaming", description: "Matériel pour streamers" },
      { label: "Promotions Gaming", href: "/promotions", description: "Offres spéciales", badge: "PROMO" }
    ]
  },
  {
    label: "Composants",
    href: "/composants",
    icon: <Cpu className="h-4 w-4" />,
    categoryId: "composants",
    subItems: [
      { label: "Processeurs", href: "/catalogue?categorie=processeurs", badge: "CPU" },
      { label: "Cartes mères", href: "/catalogue?categorie=cartes-meres" },
      { label: "Cartes graphiques", href: "/catalogue?categorie=cartes-graphiques", badge: "GPU" },
      { label: "Mémoire RAM", href: "/catalogue?categorie=ram" },
      { label: "Stockage", href: "/catalogue?categorie=stockage", badge: "SSD/NVMe" },
      { label: "Alimentations", href: "/catalogue?categorie=alimentations" },
      { label: "Refroidissement", href: "/catalogue?categorie=refroidissement" }
    ]
  },
  {
    label: "Périphériques",
    href: "/peripheriques",
    icon: <Keyboard className="h-4 w-4" />,
    categoryId: "peripheriques",
    subItems: [
      { label: "Claviers", href: "/catalogue?categorie=claviers" },
      { label: "Souris", href: "/catalogue?categorie=souris" },
      { label: "Casques Audio", href: "/catalogue?categorie=casques" },
      { label: "Écrans", href: "/catalogue?categorie=ecrans" },
      { label: "Webcams", href: "/catalogue?categorie=webcams" }
    ]
  },
  {
    label: "Catalogue",
    href: "/catalogue",
    icon: <Grid3x3 className="h-4 w-4" />,
    isSimple: true
  },
  {
    label: "Guides",
    href: "/guides",
    icon: <BookOpen className="h-4 w-4" />,
    categoryId: "guides",
    subItems: [
      { label: "Guides d'achat", href: "/guides/achat", description: "Choisir le bon matériel" },
      { label: "Tutoriels", href: "/guides/tutoriels", description: "Montage et configuration" },
      { label: "Comparatifs", href: "/guides/comparatifs", description: "Comparez les produits" },
      { label: "Actualités", href: "/guides/actualites", description: "Tech news" }
    ]
  },
  {
    label: "Importation",
    href: "/importation",
    icon: <Package className="h-4 w-4" />,
    categoryId: "importation",
    subItems: [
      { label: "Devis Import", href: "/importation/devis" },
      { label: "Produits US/EU", href: "/catalogue?categorie=import-us-eu" },
      { label: "Douanes", href: "/importation/douanes" }
    ]
  },
  {
    label: "Devis express",
    href: "/devis-express",
    icon: <FileText className="h-4 w-4" />,
    isSimple: true
  }
];

// Quick actions pour mobile
const quickActions = [

];

export const Header = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isAdminUser, setIsAdminUser] = useState(false);
  const [isCheckingRole, setIsCheckingRole] = useState(true);
  const { user, isAuthenticated, logout } = useAuth();
  const { theme, setTheme } = useTheme();
  const navigate = useNavigate();
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [openDropdown, setOpenDropdown] = useState<string | null>(null);
  const [openMobileSubmenu, setOpenMobileSubmenu] = useState<string | null>(null);
  const userMenuRef = useRef<HTMLDivElement>(null);
  const userButtonRef = useRef<HTMLButtonElement>(null);
  const location = useLocation();
  const { favorites } = useShop();
  const { cartCount } = useCartApi();
  const { data: categories } = useCategories();
  const dropdownTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const menuRef = useRef<HTMLDivElement>(null);

  // Search states
  const [searchNom, setSearchNom] = useState("");
  const [searchRef, setSearchRef] = useState("");
  const [searchCategory, setSearchCategory] = useState("");
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [isSearchFocused, setIsSearchFocused] = useState(false);
  const advancedRef = useRef<HTMLDivElement>(null);
  const mobileMenuRef = useRef<HTMLDivElement>(null);

  // Gestion des menus déroulants avec délai pour meilleure UX
  const handleMouseEnter = (label: string) => {
    if (dropdownTimeoutRef.current) clearTimeout(dropdownTimeoutRef.current);
    setOpenDropdown(label);
  };

  const handleMouseLeave = () => {
    dropdownTimeoutRef.current = setTimeout(() => {
      setOpenDropdown(null);
    }, 150);
  };

  const handleDropdownMouseEnter = (label: string) => {
    if (dropdownTimeoutRef.current) clearTimeout(dropdownTimeoutRef.current);
    setOpenDropdown(label);
  };

  const handleDropdownMouseLeave = () => {
    dropdownTimeoutRef.current = setTimeout(() => {
      setOpenDropdown(null);
    }, 150);
  };

  // Gestion des sous-menus mobiles
  const toggleMobileSubmenu = (label: string) => {
    setOpenMobileSubmenu(openMobileSubmenu === label ? null : label);
  };

  // Cleanup
  useEffect(() => {
    return () => {
      if (dropdownTimeoutRef.current) clearTimeout(dropdownTimeoutRef.current);
    };
  }, []);

  // Sync search with URL
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    setSearchNom(params.get("nom") || "");
    setSearchRef(params.get("ref") || "");
    setSearchCategory(params.get("categorie") || "");
  }, [location.search]);

  // Click outside handlers
  useEffect(() => {
    const handleClickOutsideAdvanced = (event: MouseEvent) => {
      if (advancedRef.current && !advancedRef.current.contains(event.target as Node)) {
        setShowAdvanced(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutsideAdvanced);
    return () => document.removeEventListener("mousedown", handleClickOutsideAdvanced);
  }, []);

  useEffect(() => {
    const handleClickOutsideUserMenu = (event: MouseEvent) => {
      if (
        userMenuRef.current &&
        userButtonRef.current &&
        !userMenuRef.current.contains(event.target as Node) &&
        !userButtonRef.current.contains(event.target as Node)
      ) {
        setShowUserMenu(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutsideUserMenu);
    return () => document.removeEventListener('mousedown', handleClickOutsideUserMenu);
  }, []);

  // Prevent body scroll when mobile menu is open
  useEffect(() => {
    if (mobileMenuOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [mobileMenuOpen]);

  // Check admin status
  useEffect(() => {
    const checkAdminStatus = async () => {
      if (isAuthenticated && user) {
        try {
          const response = await api.post('/admin/check-by-email', { email: user.email });
          setIsAdminUser(response.data.isAdmin === true);
        } catch (error) {
          const adminEmails = ['admin@lescasaniers.mg', 'admin@dupont.com', 'admin@lescasaniers.com'];
          setIsAdminUser(adminEmails.includes(user.email || ''));
        }
      } else {
        setIsAdminUser(false);
      }
      setIsCheckingRole(false);
    };
    checkAdminStatus();
  }, [isAuthenticated, user]);

  const getUserName = () => {
    if (!isAuthenticated || !user) return "Compte";
    if (user.prenom && user.nom) return `${user.prenom} ${user.nom.charAt(0)}.`;
    if (user.prenom) return user.prenom;
    if (user.nom) return user.nom;
    if (user.email) return user.email.split('@')[0];
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

  const getDashboardUrl = () => isAdminUser ? "/DashboardAdmin" : "/DashboardClient";
  const getDashboardLabel = () => isAdminUser ? "Admin Dashboard" : "Mon compte";

  const isMenuActive = (href: string) => {
    const pathname = location.pathname;
    const search = location.search;
    
    // Pour les liens avec paramètres
    if (href.includes('?')) {
      const [path, query] = href.split('?');
      return pathname === path && search === `?${query}`;
    }
    
    if (href === '/catalogue') return pathname === '/catalogue';
    return pathname === href || pathname.startsWith(href + "/");
  };

  // Fonction pour changer le thème
  const handleThemeChange = (newTheme: 'light' | 'dark' | 'system') => {
    setTheme(newTheme);
  };

  // Obtenir le thème actuel pour l'affichage
  const getCurrentThemeLabel = () => {
    if (theme === 'light') return 'Clair';
    if (theme === 'dark') return 'Sombre';
    return 'Système';
  };

  const getCurrentThemeIcon = () => {
    if (theme === 'light') return <Sun className="h-4 w-4" />;
    if (theme === 'dark') return <Moon className="h-4 w-4" />;
    return <Laptop className="h-4 w-4" />;
  };

  // Theme options for mobile
  const themeOptions = [
    { value: 'light' as const, icon: <Sun className="h-4 w-4" />, label: 'Clair' },
    { value: 'dark' as const, icon: <Moon className="h-4 w-4" />, label: 'Sombre' },
 
  ];

  // Fonction pour gérer la navigation avec les paramètres
  const handleNavigation = (href: string) => {
    navigate(href);
    setMobileMenuOpen(false);
    setOpenMobileSubmenu(null);
  };

  return (
    <header className="sticky top-0 z-50 bg-background border-b border-border theme-transition">
      {/* Top bar - Hidden on mobile */}


      {/* Main header */}
      <div className="container-x py-3 lg:py-4">
        <div className="flex items-center gap-3 lg:gap-6">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2 shrink-0 group">
            <div className="rounded-lg transition-all duration-300 group-hover:scale-105">
              <img
                src={logo}
                alt="Les Casaniers"
                className="h-10 sm:h-12 lg:h-24 w-auto object-contain dark:brightness-0 dark:invert"
              />
            </div>
          </Link>

          {/* Search Bar */}
          <form onSubmit={handleSearchSubmit} className="relative flex-1 max-w-2xl">
            <div className="relative flex items-center">
              <div className="relative flex-1">
                <input
                  type="search"
                  value={searchNom}
                  onChange={(e) => setSearchNom(e.target.value)}
                  onFocus={() => setIsSearchFocused(true)}
                  onBlur={() => setIsSearchFocused(false)}
                  placeholder="Rechercher un produit..."
                  className="w-full h-10 lg:h-12 pl-4 lg:pl-5 pr-24 lg:pr-32 rounded-full bg-secondary border-2 border-transparent focus:border-primary/50 focus:bg-background focus:outline-none text-sm transition-all"
                />
                
                {/* Advanced search button */}
                <button
                  type="button"
                  onClick={() => setShowAdvanced(!showAdvanced)}
                  className={`absolute right-14 lg:right-16 top-1/2 -translate-y-1/2 p-1.5 lg:p-2 rounded-full transition-all ${
                    showAdvanced || searchRef || searchCategory
                      ? "bg-primary text-primary-foreground"
                      : "text-muted-foreground hover:text-foreground hover:bg-secondary"
                  }`}
                >
                  <SlidersHorizontal className="h-3.5 w-3.5 lg:h-4 lg:w-4" />
                </button>

                {/* Search button */}
                <button
                  type="submit"
                  className="absolute right-1 top-1/2 -translate-y-1/2 h-8 lg:h-10 w-8 lg:w-10 rounded-full bg-foreground text-background hover:bg-foreground/80 transition-all flex items-center justify-center"
                >
                  <Search className="h-3.5 w-3.5 lg:h-4 lg:w-4" />
                </button>
              </div>

              {/* Mascot */}
              <img
                src={isSearchFocused ? mascotListening : mascot}
                alt=""
                aria-hidden
                className="hidden lg:block absolute -top-8 -right-4 h-20 w-auto object-contain pointer-events-none transition-all duration-300"
              />
            </div>

            {/* Advanced Search Dropdown */}
            {showAdvanced && (
              <div
                ref={advancedRef}
                className="absolute left-0 right-0 top-full mt-2 bg-popover border border-border rounded-2xl shadow-xl p-4 z-50 animate-in fade-in slide-in-from-top-2 duration-200"
              >
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                      Référence produit
                    </label>
                    <input
                      type="text"
                      value={searchRef}
                      onChange={(e) => setSearchRef(e.target.value)}
                      placeholder="Ex: CPU-INTEL-12700K"
                      className="w-full h-10 px-3 rounded-lg bg-secondary border border-transparent focus:border-primary focus:outline-none text-sm transition-colors"
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
                        className="w-full h-10 px-3 rounded-lg bg-secondary border border-transparent focus:border-primary focus:outline-none appearance-none cursor-pointer text-sm"
                      >
                        <option value="">Toutes les catégories</option>
                        {categories?.map((cat) => (
                          <option key={cat.id} value={cat.id}>{cat.nom}</option>
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

          {/* Desktop Actions - Hidden on mobile */}
          <div className="hidden md:flex items-center gap-2 lg:gap-4">
            <ThemeToggle />
            
            <ActionButton to="/favoris" icon={<Heart className="h-5 w-5" />} label="Favoris" count={favorites?.length} />
            <ActionButton to="/panier" icon={<ShoppingBag className="h-5 w-5" />} label="Panier" count={cartCount} />
            
            {/* User Menu */}
            <div className="relative">
              {isAuthenticated ? (
                <>
                  <button
                    ref={userButtonRef}
                    onClick={() => setShowUserMenu(!showUserMenu)}
                    className="flex items-center gap-2 px-3 py-2 rounded-full hover:bg-secondary transition-all group"
                  >
                    <div className="relative">
                      <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary to-primary/60 flex items-center justify-center text-primary-foreground font-semibold text-sm">
                        {getUserName().charAt(0).toUpperCase()}
                      </div>
                      <span className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 bg-green-500 rounded-full border-2 border-background" />
                    </div>
                    <span className="text-sm font-medium hidden lg:inline">{getUserName()}</span>
                    <ChevronDown className={`h-3.5 w-3.5 transition-transform duration-200 ${showUserMenu ? 'rotate-180' : ''}`} />
                  </button>

                  {showUserMenu && (
                    <div
                      ref={userMenuRef}
                      className="absolute right-0 top-full mt-2 w-64 bg-popover border border-border rounded-xl shadow-xl py-2 z-50 animate-in fade-in slide-in-from-top-2 duration-200"
                    >
                      <div className="px-4 py-3 border-b border-border">
                        <p className="text-sm font-semibold text-foreground">{user?.prenom} {user?.nom}</p>
                        <p className="text-xs text-muted-foreground mt-0.5">{user?.email}</p>
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
                        to="/commandes"
                        onClick={() => setShowUserMenu(false)}
                        className="flex items-center gap-3 px-4 py-2.5 text-sm hover:bg-secondary transition-colors"
                      >
                        <Package className="h-4 w-4" />
                        Mes commandes
                      </Link>
                      
                      <Link
                        to="/parametres"
                        onClick={() => setShowUserMenu(false)}
                        className="flex items-center gap-3 px-4 py-2.5 text-sm hover:bg-secondary transition-colors"
                      >
                        <Settings className="h-4 w-4" />
                        Paramètres
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
                  <div className="p-2 rounded-full bg-secondary group-hover:bg-primary/20 transition-colors">
                    <User className="h-5 w-5" />
                  </div>
                  <span className="text-[10px] uppercase tracking-wider font-medium">Compte</span>
                </Link>
              )}
            </div>
          </div>

          {/* Mobile Menu Button - Only visible on mobile */}
          <div className="flex items-center gap-2 md:hidden">
            <Link to="/favoris" className="relative p-2">
              <Heart className="h-5 w-5" />
              {favorites?.length > 0 && (
                <span className="absolute -top-1 -right-1 h-4 min-w-4 px-1 rounded-full bg-primary text-primary-foreground text-[10px] font-bold flex items-center justify-center">
                  {favorites.length > 9 ? '9+' : favorites.length}
                </span>
              )}
            </Link>
            <Link to="/panier" className="relative p-2">
              <ShoppingBag className="h-5 w-5" />
              {cartCount > 0 && (
                <span className="absolute -top-1 -right-1 h-4 min-w-4 px-1 rounded-full bg-primary text-primary-foreground text-[10px] font-bold flex items-center justify-center">
                  {cartCount > 9 ? '9+' : cartCount}
                </span>
              )}
            </Link>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setMobileMenuOpen(true)}
              className="relative"
            >
              <Menu className="h-5 w-5" />
            </Button>
          </div>
        </div>
      </div>

      {/* Desktop Navigation avec dropdowns améliorés */}
      <nav 
        ref={menuRef}
        className="hidden lg:block border-t border-border bg-background shadow-sm"
        onMouseLeave={handleMouseLeave}
      >
        <div className="container-x">
          <div className="flex items-center justify-center gap-0 py-0">
            {menuData.map((item) => {
              const hasSubItems = item.subItems && item.subItems.length > 0;
              const isActive = isMenuActive(item.href);
              
              if (item.isSimple) {
                // Lien simple sans dropdown
                return (
                  <Link
                    key={item.label}
                    to={item.href}
                    className={`group relative px-5 py-4 text-xs font-semibold uppercase tracking-wider transition-all flex items-center gap-2 ${
                      isActive
                        ? "text-primary"
                        : "text-muted-foreground hover:text-foreground"
                    }`}
                  >
                    <span className="transition-transform duration-200 group-hover:scale-110">
                      {item.icon}
                    </span>
                    <span>{item.label}</span>
                    {isActive && (
                      <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary rounded-full" />
                    )}
                  </Link>
                );
              }

              // Menu avec dropdown
              return (
                <div
                  key={item.label}
                  className="relative"
                  onMouseEnter={() => handleMouseEnter(item.label)}
                  onMouseLeave={handleMouseLeave}
                >
                  <Link
                    to={item.href}
                    className={`group relative px-5 py-4 text-xs font-semibold uppercase tracking-wider transition-all flex items-center gap-2 ${
                      isActive
                        ? "text-primary"
                        : "text-muted-foreground hover:text-foreground"
                    }`}
                  >
                    <span className="transition-transform duration-200 group-hover:scale-110">
                      {item.icon}
                    </span>
                    <span>{item.label}</span>
                    <ChevronDown 
                      className={`h-3.5 w-3.5 transition-transform duration-200 ${
                        openDropdown === item.label ? "rotate-180" : ""
                      }`}
                    />
                    {isActive && (
                      <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary rounded-full" />
                    )}
                  </Link>

                  {/* Dropdown Menu */}
                  {hasSubItems && openDropdown === item.label && (
                    <div
                      className="absolute left-0 top-full pt-2 w-72 z-50"
                      onMouseEnter={() => handleDropdownMouseEnter(item.label)}
                      onMouseLeave={handleDropdownMouseLeave}
                    >
                      <div className="bg-popover border border-border rounded-xl shadow-2xl overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200">
                        <div className="p-2">
                          {item.subItems?.map((subItem) => (
                            <Link
                              key={subItem.label}
                              to={subItem.href}
                              className="flex items-center justify-between px-3 py-2.5 rounded-lg hover:bg-secondary transition-all group/item"
                              onClick={() => setOpenDropdown(null)}
                            >
                              <div className="flex-1">
                                <div className="flex items-center gap-2">
                                  <span className="text-sm font-medium text-foreground">
                                    {subItem.label}
                                  </span>
                                  {subItem.badge && (
                                    <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-full bg-primary/10 text-primary">
                                      {subItem.badge}
                                    </span>
                                  )}
                                </div>
                                {subItem.description && (
                                  <p className="text-xs text-muted-foreground mt-0.5">
                                    {subItem.description}
                                  </p>
                                )}
                              </div>
                              <ChevronRight className="h-4 w-4 text-muted-foreground opacity-0 group-hover/item:opacity-100 transition-all group-hover/item:translate-x-1" />
                            </Link>
                          ))}
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
            
            {/* Bouton Configurateur */}
            <Link
              to="/configurateur"
              className="ml-4 px-5 py-2.5 text-xs font-bold uppercase tracking-wider bg-gradient-to-r from-amber-500 to-orange-500 text-white hover:from-amber-600 hover:to-orange-600 transition-all rounded-full flex items-center gap-2 shadow-md hover:shadow-xl transform hover:-translate-y-0.5"
            >
              <Zap className="h-3.5 w-3.5" />
              <span>Configurateur Pro</span>
            </Link>
          </div>
        </div>
      </nav>

      {/* Mobile Menu Drawer - Solid background avec sous-menus */}
      {mobileMenuOpen && (
        <>
          {/* Overlay with blur */}
          <div
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 animate-in fade-in duration-200"
            onClick={() => setMobileMenuOpen(false)}
          />
          
          {/* Menu Drawer - Solid background */}
          <div
            ref={mobileMenuRef}
            className="fixed top-0 right-0 h-full w-[85%] max-w-sm bg-background z-50 shadow-2xl animate-in slide-in-from-right duration-300 overflow-y-auto"
          >
            {/* Header */}
            <div className="sticky top-0 bg-background border-b border-border z-10">
              <div className="flex items-center justify-between p-4 bg-gradient-to-r from-primary/5 to-transparent">
                <img src={logo} alt="Les Casaniers" className="h-8 w-auto dark:brightness-0 dark:invert" />
                <button
                  onClick={() => setMobileMenuOpen(false)}
                  className="p-2 rounded-full hover:bg-secondary transition-colors"
                  aria-label="Fermer le menu"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
            </div>

            {/* User Section */}
            <div className="p-4 border-b border-border">
              {isAuthenticated ? (
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-full bg-gradient-to-br from-primary to-primary/60 flex items-center justify-center text-primary-foreground font-bold text-lg">
                    {getUserName().charAt(0).toUpperCase()}
                  </div>
                  <div className="flex-1">
                    <p className="font-semibold">{user?.prenom} {user?.nom}</p>
                    <p className="text-xs text-muted-foreground">{user?.email}</p>
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

            {/* Theme Selector in Mobile Menu - Complet */}
            <div className="p-4 border-b border-border">
              <div className="flex items-center justify-between mb-3">
                <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                  Thème
                </p>
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  {getCurrentThemeIcon()}
                  <span>{getCurrentThemeLabel()}</span>
                </div>
              </div>
              <div className="grid grid-cols-3 gap-2">
                {themeOptions.map((option) => (
                  <button
                    key={option.value}
                    onClick={() => handleThemeChange(option.value)}
                    className={`flex items-center justify-center gap-2 py-2.5 px-3 rounded-lg transition-all ${
                      theme === option.value
                        ? 'bg-primary text-primary-foreground shadow-md'
                        : 'bg-secondary hover:bg-secondary/80 text-foreground'
                    }`}
                  >
                    {option.icon}
                    <span className="text-sm font-medium">{option.label}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Navigation Links avec sous-menus mobiles */}
            <div className="flex-1 py-4">
              <div className="px-4 space-y-1">
                <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider px-3 mb-2">
                  Navigation
                </p>
                {menuData.map((item) => {
                  const hasSubItems = item.subItems && item.subItems.length > 0;
                  const isActive = isMenuActive(item.href);
                  const isOpen = openMobileSubmenu === item.label;
                  
                  if (item.isSimple || !hasSubItems) {
                    return (
                      <Link
                        key={item.label}
                        to={item.href}
                        onClick={() => handleNavigation(item.href)}
                        className={`flex items-center gap-3 px-3 py-3 rounded-xl transition-all ${
                          isActive
                            ? "bg-primary/10 text-primary font-medium"
                            : "hover:bg-secondary"
                        }`}
                      >
                        <span className="text-primary">{item.icon}</span>
                        <span>{item.label}</span>
                      </Link>
                    );
                  }
                  
                  return (
                    <div key={item.label} className="space-y-1">
                      {/* Parent menu item */}
                      <button
                        onClick={() => toggleMobileSubmenu(item.label)}
                        className={`w-full flex items-center justify-between gap-3 px-3 py-3 rounded-xl transition-all ${
                          isActive
                            ? "bg-primary/10 text-primary font-medium"
                            : "hover:bg-secondary"
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <span className="text-primary">{item.icon}</span>
                          <span>{item.label}</span>
                        </div>
                        {isOpen ? (
                          <ChevronUp className="h-4 w-4 text-muted-foreground" />
                        ) : (
                          <ChevronDown className="h-4 w-4 text-muted-foreground" />
                        )}
                      </button>
                      
                      {/* Submenu items */}
                      {isOpen && (
                        <div className="ml-8 space-y-1 border-l-2 border-border pl-3 animate-in slide-in-from-left-2 duration-200">
                          {item.subItems?.map((subItem) => (
                            <Link
                              key={subItem.label}
                              to={subItem.href}
                              onClick={() => handleNavigation(subItem.href)}
                              className="flex flex-col px-3 py-2.5 rounded-lg hover:bg-secondary transition-all group"
                            >
                              <div className="flex items-center gap-2">
                                <span className="text-sm font-medium text-foreground">
                                  {subItem.label}
                                </span>
                                {subItem.badge && (
                                  <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-full bg-primary/10 text-primary">
                                    {subItem.badge}
                                  </span>
                                )}
                              </div>
                              {subItem.description && (
                                <p className="text-xs text-muted-foreground mt-0.5">
                                  {subItem.description}
                                </p>
                              )}
                            </Link>
                          ))}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>

              <div className="mt-6 px-4 space-y-1">
                <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider px-3 mb-2">
                  Mon compte
                </p>
                {isAuthenticated ? (
                  <>
                    <Link
                      to={getDashboardUrl()}
                      onClick={() => setMobileMenuOpen(false)}
                      className="flex items-center gap-3 px-3 py-3 rounded-xl hover:bg-secondary transition-all"
                    >
                      <LayoutDashboard className="h-4 w-4" />
                      {getDashboardLabel()}
                    </Link>
                    <Link
                      to="/commandes"
                      onClick={() => setMobileMenuOpen(false)}
                      className="flex items-center gap-3 px-3 py-3 rounded-xl hover:bg-secondary transition-all"
                    >
                      <Package className="h-4 w-4" />
                      Mes commandes
                    </Link>
                    <Link
                      to="/favoris"
                      onClick={() => setMobileMenuOpen(false)}
                      className="flex items-center gap-3 px-3 py-3 rounded-xl hover:bg-secondary transition-all"
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
                      className="flex items-center gap-3 px-3 py-3 rounded-xl hover:bg-secondary transition-all"
                    >
                      <Settings className="h-4 w-4" />
                      Paramètres
                    </Link>
                    <button
                      onClick={handleLogout}
                      className="w-full flex items-center gap-3 px-3 py-3 rounded-xl text-red-600 hover:bg-red-50 dark:hover:bg-red-950/30 transition-all"
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
                      className="flex items-center gap-3 px-3 py-3 rounded-xl hover:bg-secondary transition-all"
                    >
                      <Heart className="h-4 w-4" />
                      Favoris
                    </Link>
                    <Link
                      to="/aide"
                      onClick={() => setMobileMenuOpen(false)}
                      className="flex items-center gap-3 px-3 py-3 rounded-xl hover:bg-secondary transition-all"
                    >
                      <HelpCircle className="h-4 w-4" />
                      Aide
                    </Link>
                  </>
                )}
              </div>
            </div>

            {/* Quick Actions Footer */}
            <div className="sticky bottom-0 bg-background border-t border-border p-4">
              <div className="grid grid-cols-4 gap-2">
                {quickActions.map((action) => (
                  <Link
                    key={action.label}
                    to={action.href}
                    onClick={() => setMobileMenuOpen(false)}
                    className="flex flex-col items-center gap-1 py-2 rounded-lg hover:bg-secondary transition-colors"
                  >
                    {action.icon}
                    <span className="text-xs">{action.label}</span>
                  </Link>
                ))}
              </div>
            </div>
          </div>
        </>
      )}
    </header>
  );
};

// Helper Components
const ActionButton = ({ to, icon, label, count }: { to: string; icon: React.ReactNode; label: string; count?: number }) => (
  <Link to={to} className="relative flex flex-col items-center gap-0.5 group px-2 py-1 rounded-lg hover:bg-secondary transition-all">
    <div className="relative">
      {icon}
      {count !== undefined && count > 0 && (
        <span className="absolute -top-2 -right-2 h-4 min-w-4 px-1 rounded-full bg-primary text-primary-foreground text-[10px] font-bold flex items-center justify-center animate-in zoom-in">
          {count > 99 ? '99+' : count}
        </span>
      )}
    </div>
    <span className="text-[10px] uppercase tracking-wider font-medium">{label}</span>
  </Link>
);