import { Search, User, Heart, ShoppingBag, Menu, Sparkles, Zap, Crown, Star, FileText, Headphones, BarChart2, Ship, Shield, ChevronDown, ChevronUp, LogOut, LayoutDashboard } from "lucide-react";
import mascot from "@/assets/casaniers-mascot.png";
import logo from "@/assets/casaniers-logo.png";
import { Button } from "@/components/ui/button";
import { useState, useRef, useEffect } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useShop } from "@/store/shop";
import { ThemeToggle } from "@/components/ThemeToggle";
import { useAuth } from "@/contexts/AuthContext";
import api from "@/service/api";

const menuData = [
  { 
    label: "Pro & Freelance", 
    items: [],
    isDirectLink: true,
    href: "/pro-freelance",
  },
  { 
    label: "Gaming", 
    items: [],
    isDirectLink: true,
    href: "/gaming",
    icon: ""
  },
  { 
    label: "Component", 
    items: [],
    isDirectLink: true,
    href: "/composants",
    icon: ""
  },  
  { 
    label: "Périphériques", 
    items: [],
    isDirectLink: true,
    href: "/peripheriques",
    icon: ""
  },
  { 
    label: "catalogue", 
    items: [],
    isDirectLink: true,
    href: "/catalogue",
    icon: "",
  },
  { 
    label: "Guides", 
    items: [],
    isDirectLink: true,
    href: "/guides",
    baseHref: "/guides",
    icon: "",
  },
  { 
    label: "Importation", 
    items: [],
    isDirectLink: true,
    href: "/importation",
    icon: ""
  },
  { 
    label: "Devis express", 
    items: [],
    isDirectLink: true,
    href: "/devis-express",
    icon: "",
  }
];

export const Header = () => {
  const [open, setOpen] = useState<string | null>(null);
  const { cartCount, favorites } = useShop();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [openDropdowns, setOpenDropdowns] = useState<{ [key: string]: boolean }>({});
  const [isAdminUser, setIsAdminUser] = useState(false);
  const [isCheckingRole, setIsCheckingRole] = useState(true);

  const { user, isAuthenticated, logout } = useAuth();
  const navigate = useNavigate();
  const [showLogout, setShowLogout] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);

  const location = useLocation();
  
  // Ref pour le menu mobile
  const mobileMenuRef = useRef<HTMLDivElement>(null);

  // Vérifier si l'utilisateur connecté est dans la table admin
  useEffect(() => {
    const checkAdminStatus = async () => {
      if (isAuthenticated && user) {
        try {
          // Appel API pour vérifier si l'utilisateur est dans la table admin
          const response = await api.post('/admin/check-by-email', {
            email: user.email
          });
          setIsAdminUser(response.data.isAdmin === true);
        } catch (error) {
          console.error("Erreur vérification admin:", error);
          // Fallback: vérifier par email si l'API échoue
          const adminEmails = [
            'admin@lescasaniers.mg',
            'admin@dupont.com',
            'admin@lescasaniers.com'
          ];
          setIsAdminUser(adminEmails.includes(user.email || ''));
        }
      } else {
        setIsAdminUser(false);
      }
      setIsCheckingRole(false);
    };
    
    checkAdminStatus();
  }, [isAuthenticated, user]);

  // Récupérer le nom de l'utilisateur connecté
  const getUserName = () => {
    if (!isAuthenticated || !user) return "Compte";
    
    if (user.prenom && user.nom) return `${user.prenom}`;
    if (user.nom) return user.nom;
    if (user.prenom) return user.prenom;
    if (user.email) return user.email.split('@')[0];
    return "Compte";
  };

  const userData = {
    name: getUserName(),
    email: user?.email || "client@lescasaniers.mg"
  };

  // Vérifie si un menu est actif (route courante correspond)
  const isMenuActive = (m: typeof menuData[0]) => {
    const pathname = location.pathname;
    if (m.href) return pathname === m.href || pathname.startsWith(m.href + "/");
    if (m.baseHref) return pathname === m.baseHref || pathname.startsWith(m.baseHref + "/");
    return m.items?.some(item => item.href && pathname === item.href.split("#")[0]);
  };

  // Vérifie si un sous-item est actif
  const isItemActive = (href: string) => {
    const [path] = href.split("#");
    return location.pathname === path;
  };
  
  // Toggle dropdown mobile
  const toggleDropdown = (label: string, hasItems: boolean) => {
    if (!hasItems) return;
    setOpenDropdowns(prev => ({
      ...prev,
      [label]: !prev[label]
    }));
  };
  
  const handleLogout = () => {
    logout();
    navigate("/login");
    setShowLogout(false);
    setMobileMenuOpen(false);
  };

  const getDashboardUrl = () => {
    return isAdminUser ? "/DashboardAdmin" : "/DashboardClient";
  };

  const getDashboardLabel = () => {
    return isAdminUser ? "Tableau de bord Admin" : "Tableau de bord";
  };

  // Composant CompteButton
  const CompteButton = () => (
    <div className="relative" ref={dropdownRef}>
      {isAuthenticated ? (
        // ========== UTILISATEUR CONNECTÉ ==========
        <>
          <button
            ref={buttonRef}
            onClick={() => setShowLogout(!showLogout)}
            className="relative flex flex-col items-center gap-1 group"
          >
            <div className="relative">
              <div className="p-2 rounded-full bg-secondary group-hover:bg-primary/20 transition-colors">
                <User className="h-5 w-5" />
              </div>
              <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-green-500 rounded-full animate-pulse" />
            </div>
            <span className="text-xs font-medium transition-colors group-hover:text-primary">
              {getUserName()}
            </span>
          </button>

          {/* Dropdown déconnexion */}
          {showLogout && (
            <div className="absolute right-0 top-full mt-2 w-56 bg-popover border border-border rounded-lg shadow-lg py-1 z-50">
              <div className="px-4 py-2 border-b border-border">
                <p className="text-sm font-medium text-foreground">{userData.name}</p>
                <p className="text-xs text-muted-foreground">{userData.email}</p>
              </div>
              
              {/* Bouton Dashboard - Redirige selon le rôle */}
              <Link
                to={getDashboardUrl()}
                onClick={() => setShowLogout(false)}
                className="w-full flex items-center gap-2 px-4 py-2 text-sm text-foreground hover:bg-secondary transition"
              >
                <LayoutDashboard className="h-4 w-4" />
                {getDashboardLabel()}
              </Link>
              
              {/* Bouton Déconnexion en rouge */}
              <button
                onClick={handleLogout}
                className="w-full flex items-center gap-2 px-4 py-2 text-sm text-red-600 hover:bg-red-50 dark:hover:bg-red-950/30 transition"
              >
                <LogOut className="h-4 w-4" />
                Déconnexion
              </button>
            </div>
          )}
        </>
      ) : (
        // ========== UTILISATEUR NON CONNECTÉ ==========
        <Link
          to="/login"
          className="relative flex flex-col items-center gap-1 group"
        >
          <div className="relative">
            <div className="p-2 rounded-full bg-secondary group-hover:bg-primary/20 transition-colors">
              <User className="h-5 w-5" />
            </div>
          </div>
          <span className="text-xs font-medium transition-colors group-hover:text-primary">
            Compte
          </span>
        </Link>
      )}
    </div>
  );

  // Gérer le clic en dehors pour fermer le dropdown
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current && 
        buttonRef.current &&
        !dropdownRef.current.contains(event.target as Node) &&
        !buttonRef.current.contains(event.target as Node)
      ) {
        setShowLogout(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Gestion du swipe pour fermer le menu mobile
  useEffect(() => {
    let touchStartX = 0;
    let touchEndX = 0;
    
    const handleTouchStart = (e: TouchEvent) => {
      touchStartX = e.changedTouches[0].screenX;
    };
    
    const handleTouchMove = (e: TouchEvent) => {
      touchEndX = e.changedTouches[0].screenX;
    };
    
    const handleTouchEnd = () => {
      const swipeDistance = touchStartX - touchEndX;
      if (swipeDistance > 50 && mobileMenuOpen) {
        setMobileMenuOpen(false);
      }
    };
    
    if (mobileMenuOpen) {
      document.addEventListener('touchstart', handleTouchStart);
      document.addEventListener('touchmove', handleTouchMove);
      document.addEventListener('touchend', handleTouchEnd);
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    
    return () => {
      document.removeEventListener('touchstart', handleTouchStart);
      document.removeEventListener('touchmove', handleTouchMove);
      document.removeEventListener('touchend', handleTouchEnd);
      document.body.style.overflow = 'unset';
    };
  }, [mobileMenuOpen]);
  
  // Fermer le menu si on clique en dehors
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (mobileMenuRef.current && !mobileMenuRef.current.contains(event.target as Node)) {
        const menuButton = document.querySelector('[data-mobile-menu-button]');
        if (menuButton && !menuButton.contains(event.target as Node)) {
          setMobileMenuOpen(false);
        }
      }
    };
    
    if (mobileMenuOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [mobileMenuOpen]);

  return (
    <header className="sticky top-0 z-40 bg-background border-b border-border theme-transition">
      <div className="container-x flex items-center gap-8 py-5">
        {/* Logo */}
        <Link to="/" className="flex items-center gap-3 shrink-0 group">
          <div className="rounded-lg p-1.5 transition-all duration-300 group-hover:scale-105">
            <img 
              src={logo} 
              alt="Les Casaniers" 
              className="h-16 w-auto object-contain dark:brightness-0 dark:invert" 
            />
          </div>
        </Link>

        {/* Search */}
        <div className="relative flex-1 max-w-2xl group">
          <input
            type="search"
            placeholder="Rechercher un PC, un composant, une marque…"
            className="w-full h-12 pl-5 pr-14 bg-secondary border border-transparent focus:border-foreground focus:outline-none focus:bg-background text-sm transition-all rounded-full theme-transition"
          />
          <button className="absolute right-0 top-0 bottom-0 px-5 bg-foreground text-background hover:bg-foreground/80 transition-colors flex items-center justify-center rounded-r-full">
            <Search className="h-4 w-4" />
          </button>
          <img
            src={mascot}
            alt=""
            aria-hidden
            className="absolute -top-8 right-20 h-24 w-auto object-contain pointer-events-none transition-all duration-500 group-focus-within:-translate-y-3 group-focus-within:scale-125"
          />
        </div>

        {/* Actions Desktop */}
        <nav className="hidden md:flex items-center gap-6">
          <ThemeToggle />
          <IconButton to="/favoris" icon={<Heart className="h-5 w-5" />} label="Favoris" badge="Le Câlin" count={favorites.length || undefined} />
          <IconButton to="/panier" icon={<ShoppingBag className="h-5 w-5" />} label="Panier" badge="Le Bond" count={cartCount || undefined} />
          <CompteButton />
        </nav>

        {/* Mobile menu button */}
        <div className="flex items-center gap-2 md:hidden">
          <ThemeToggle />
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            data-mobile-menu-button
          >
            <Menu />
          </Button>
        </div>
      </div>

      {/* Mobile menu - Drawer avec dropdowns */}
      {mobileMenuOpen && (
        <>
          <div 
            className="fixed inset-0 bg-black/50 z-50 lg:hidden animate-fade-in"
            onClick={() => setMobileMenuOpen(false)}
          />
          
          <div 
            ref={mobileMenuRef}
            className="fixed top-0 right-0 h-full w-[85%] max-w-sm bg-background z-50 lg:hidden shadow-2xl animate-slide-in-right"
          >
            <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-12 bg-gray-400/50 rounded-r-full opacity-50">
              <div className="w-full h-full bg-gray-500 rounded-r-full animate-pulse" />
            </div>
            
            <button
              onClick={() => setMobileMenuOpen(false)}
              className="absolute top-4 right-4 p-2 rounded-full hover:bg-secondary transition-colors z-10"
              aria-label="Fermer le menu"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
            
            <div className="flex flex-col h-full overflow-y-auto">
              <div className="p-4 pt-16 flex-1">
                {menuData.map((m) => {
                  const hasItems = m.items && m.items.length > 0;
                  const isDirectLink = m.isDirectLink || (!hasItems && m.href);
                  const active = isMenuActive(m);
                  
                  if (isDirectLink && m.href) {
                    return (
                      <div key={m.label} className="mb-2">
                        <Link
                          to={m.href}
                          onClick={() => {
                            setMobileMenuOpen(false);
                            setOpenDropdowns({});
                          }}
                          className={`w-full flex items-center justify-between px-4 py-3 text-sm font-bold uppercase tracking-[0.2em] transition-all rounded-lg ${
                            active
                              ? "bg-foreground text-background"
                              : "bg-secondary/50 text-foreground hover:bg-secondary"
                          }`}
                        >
                          <span className="flex items-center gap-2">
                            <span>{m.icon}</span>
                            <span>{m.label}</span>
                          </span>
                          {active && (
                            <span className="h-2 w-2 rounded-full bg-background shrink-0" />
                          )}
                        </Link>
                      </div>
                    );
                  }
                  
                  return null;
                })}
              </div>

              {/* Bottom CTA Buttons */}
              <div className="p-4 border-t border-border space-y-2 mt-auto">
                <Link 
                  to="/configurateur" 
                  onClick={() => {
                    setMobileMenuOpen(false);
                    setOpenDropdowns({});
                  }}
                  className="block px-4 py-3 text-sm font-bold uppercase tracking-[0.2em] bg-gradient-to-r from-amber-500 to-orange-500 text-black hover:from-amber-600 hover:to-orange-600 transition-colors text-center rounded-lg"
                >
                  ⚡ Configurer maintenant
                </Link>
                
                {/* Mobile action icons */}
                <div className="flex items-center justify-around pt-4">
                  {isAuthenticated ? (
                    <>
                      <Link 
                        to={getDashboardUrl()} 
                        onClick={() => {
                          setMobileMenuOpen(false);
                          setOpenDropdowns({});
                        }}
                        className="flex flex-col items-center gap-1 px-4 py-2 hover:bg-secondary rounded-lg transition"
                      >
                        <LayoutDashboard className="h-5 w-5" />
                        <span className="text-[10px] uppercase tracking-wider">Dashboard</span>
                      </Link>
                      <button
                        onClick={handleLogout}
                        className="flex flex-col items-center gap-1 px-4 py-2 text-sm text-red-600 hover:bg-red-50 dark:hover:bg-red-950/30 rounded-lg transition"
                      >
                        <LogOut className="h-5 w-5" />
                        <span className="text-[10px] uppercase tracking-wider">Déconnexion</span>
                      </button>
                    </>
                  ) : (
                    <IconButtonMobile to="/login" icon={<User className="h-5 w-5" />} label="Compte" />
                  )}
                  <IconButtonMobile to="/favoris" icon={<Heart className="h-5 w-5" />} label="Favoris" count={favorites.length || undefined} />
                  <IconButtonMobile to="/panier" icon={<ShoppingBag className="h-5 w-5" />} label="Panier" count={cartCount || undefined} />
                </div>
              </div>
            </div>
          </div>
        </>
      )}

      {/* Bottom nav - Desktop */}
      <nav className="hidden lg:block border-t border-border" onMouseLeave={() => setOpen(null)}>
        <div className="container-x flex items-center justify-center gap-1 py-0">
          {menuData.map((m) => {
            const hasItems = m.items && m.items.length > 0;
            const isDirectLink = m.isDirectLink || (!hasItems && m.href);
            const active = isMenuActive(m);
            
            if (isDirectLink && m.href) {
              return (
                <Link
                  key={m.label}
                  to={m.href}
                  className={`px-6 py-4 text-[11px] font-bold uppercase tracking-[0.2em] transition-all relative flex items-center gap-1.5 ${
                    active
                      ? "text-foreground"
                      : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  <span>{m.icon}</span>
                  <span>{m.label}</span>
                  <span className={`absolute bottom-0 left-1/2 -translate-x-1/2 h-0.5 transition-all duration-300 ${
                    active ? "w-full" : "w-0"
                  } bg-foreground`} />
                </Link>
              );
            }
            
            return null;
          })}

          <Link 
            to="/configurateur" 
            className="ml-2 px-5 py-4 text-[11px] font-bold uppercase tracking-[0.2em] bg-gradient-to-r from-amber-500 to-orange-500 text-black hover:from-amber-600 hover:to-orange-600 transition-all flex items-center gap-2 shadow-glow"
          >
            SUPER CONFIGURATEUR
          </Link>
        </div>
      </nav>
    </header>
  );
};

const IconButton = ({
  to, icon, label, badge, count,
}: { to: string; icon: React.ReactNode; label: string; badge: string; count?: number }) => (
  <Link to={to} className="relative group flex flex-col items-center gap-0.5">
    <div className="relative">
      {icon}
      {count !== undefined && count > 0 && (
        <span className="absolute -top-2 -right-2 h-4 min-w-4 px-1 rounded-full bg-foreground text-background text-[10px] font-bold flex items-center justify-center">
          {count > 9 ? '9+' : count}
        </span>
      )}
    </div>
    <span className="text-[10px] uppercase tracking-wider font-medium">{label}</span>
    <span className="absolute top-full mt-1 px-2 py-1 bg-foreground text-background text-[10px] opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none z-50">
      {badge}
    </span>
  </Link>
);

const IconButtonMobile = ({
  to, icon, label, count,
}: { to: string; icon: React.ReactNode; label: string; count?: number }) => (
  <Link to={to} className="relative flex flex-col items-center gap-1">
    <div className="relative">
      {icon}
      {count !== undefined && count > 0 && (
        <span className="absolute -top-2 -right-2 h-4 min-w-4 px-1 rounded-full bg-foreground text-background text-[10px] font-bold flex items-center justify-center">
          {count > 9 ? '9+' : count}
        </span>
      )}
    </div>
    <span className="text-[10px] uppercase tracking-wider font-medium">{label}</span>
  </Link>
);