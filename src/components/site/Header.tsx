import { Search, User, Heart, ShoppingBag, Menu, Sparkles, Zap, Crown, Star, FileText, Headphones, BarChart2, Ship, Shield, ChevronDown, ChevronUp } from "lucide-react";
import mascot from "@/assets/casaniers-mascot.png";
import logo from "@/assets/casaniers-logo.png";
import { Button } from "@/components/ui/button";
import { useState, useRef, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import { useShop } from "@/store/shop";
import { ThemeToggle } from "@/components/ThemeToggle";
import { useAuth } from "@/contexts/AuthContext";



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
  },/*
  { 
    label: "Bénéfice Pro", 
    items: [
      { label: "Facturation Normée & TVA",   href: "/pro#facturation" },
      { label: "SAV Prioritaire Entreprise", href: "/pro#sav"         },
      { label: "Audit de Parc Informatique", href: "/pro#audit"       },
      { label: "Contrats de maintenance",    href: "/pro#importation" },
    ],
    baseHref: "/pro",
    icon: "",
    isPro: true,
  },*/
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
  const { user } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [openDropdowns, setOpenDropdowns] = useState<{ [key: string]: boolean }>({});

  const location = useLocation();
  
  // Déterminer le label et le lien du bouton en fonction de l'état d'authentification
  const compteLabel = user ? "Compte" : "Login";
  const compteLink = user ? "/compte" : "/login";
  
  // Ref pour le menu mobile
  const mobileMenuRef = useRef<HTMLDivElement>(null);

  // Vérifie si un menu est actif (route courante correspond)
  const isMenuActive = (m: typeof menuData[0]) => {
    const pathname = location.pathname;
    // Lien direct
    if (m.href) return pathname === m.href || pathname.startsWith(m.href + "/");
    // Dropdown : vérifie le baseHref ou si un item correspond
    if (m.baseHref) return pathname === m.baseHref || pathname.startsWith(m.baseHref + "/");
    // Fallback : vérifie les items
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
  
  // Gestion du swipe
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

        {/* Actions */}
        <nav className="hidden md:flex items-center gap-6">
          <ThemeToggle />
          <IconButton to="/login" icon={<User className="h-5 w-5" />} label="Compte" badge="Le Coucou" />
          <IconButton to="/favoris" icon={<Heart className="h-5 w-5" />} label="Favoris" badge="Le Câlin" count={favorites.length || undefined} />
          <IconButton to="/panier" icon={<ShoppingBag className="h-5 w-5" />} label="Panier" badge="Le Bond" count={cartCount || undefined} />
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
          {/* Overlay backdrop */}
          <div 
            className="fixed inset-0 bg-black/50 z-50 lg:hidden animate-fade-in"
            onClick={() => setMobileMenuOpen(false)}
          />
          
          {/* Menu panel */}
          <div 
            ref={mobileMenuRef}
            className="fixed top-0 right-0 h-full w-[85%] max-w-sm bg-background z-50 lg:hidden shadow-2xl animate-slide-in-right"
          >
            {/* Swipe indicator */}
            <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-12 bg-gray-400/50 rounded-r-full opacity-50">
              <div className="w-full h-full bg-gray-500 rounded-r-full animate-pulse" />
            </div>
            
            {/* Close button */}
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
                  
                  // Lien direct
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
                            m.isPremium
                              ? active
                                ? "bg-gradient-to-r from-amber-500/40 to-orange-500/40 text-amber-600 dark:text-amber-400 border-2 border-amber-500"
                                : "bg-gradient-to-r from-amber-500/20 to-orange-500/20 text-amber-600 dark:text-amber-400 border-2 border-amber-500/50"
                              : m.isPro
                              ? active
                                ? "bg-gradient-to-r from-blue-500/25 to-blue-400/25 text-blue-600 dark:text-blue-400 border-2 border-blue-500"
                                : "bg-gradient-to-r from-blue-500/10 to-blue-400/10 text-blue-600 dark:text-blue-400 border-2 border-blue-500/50"
                              : active
                              ? "bg-foreground text-background"
                              : "bg-secondary/50 text-foreground hover:bg-secondary"
                          }`}
                        >
                          <span className="flex items-center gap-2">
                            <span>{m.icon}</span>
                            <span>{m.label}</span>
                            {m.isPremium && <Sparkles className="h-3 w-3 text-amber-500" />}
                            {m.isPro && <Shield className="h-3 w-3 text-blue-500" />}
                          </span>
                          {/* Indicateur actif */}
                          {active && !m.isPremium && !m.isPro && (
                            <span className="h-2 w-2 rounded-full bg-background shrink-0" />
                          )}
                        </Link>
                      </div>
                    );
                  }
                  
                  // Dropdown
                  return (
                    <div key={m.label} className="mb-2">
                      <button
                        onClick={() => toggleDropdown(m.label, hasItems)}
                        className={`w-full flex items-center justify-between px-4 py-3 text-sm font-bold uppercase tracking-[0.2em] transition-all rounded-lg ${
                          m.isPremium
                            ? active
                              ? "bg-gradient-to-r from-amber-500/40 to-orange-500/40 text-amber-600 dark:text-amber-400 border-2 border-amber-500"
                              : "bg-gradient-to-r from-amber-500/20 to-orange-500/20 text-amber-600 dark:text-amber-400 border-2 border-amber-500/50"
                            : m.isPro
                            ? active
                              ? "bg-gradient-to-r from-blue-500/25 to-blue-400/25 text-blue-600 dark:text-blue-400 border-2 border-blue-500"
                              : "bg-gradient-to-r from-blue-500/10 to-blue-400/10 text-blue-600 dark:text-blue-400 border-2 border-blue-500/50"
                            : active
                            ? "bg-foreground text-background"
                            : "bg-secondary/50 text-foreground hover:bg-secondary"
                        }`}
                      >
                        <span className="flex items-center gap-2">
                          <span>{m.icon}</span>
                          <span>{m.label}</span>
                          {m.isPremium && <Sparkles className="h-3 w-3 text-amber-500" />}
                          {m.isPro && <Shield className="h-3 w-3 text-blue-500" />}
                          {/* Indicateur actif */}
                          {active && !m.isPremium && !m.isPro && (
                            <span className="h-2 w-2 rounded-full bg-background shrink-0" />
                          )}
                        </span>
                        {hasItems && (
                          openDropdowns[m.label] ? 
                            <ChevronUp className="h-4 w-4 shrink-0" /> : 
                            <ChevronDown className="h-4 w-4 shrink-0" />
                        )}
                      </button>
                      
                      {/* Dropdown content */}
                      {hasItems && openDropdowns[m.label] && (
                        <div className="ml-4 mt-2 space-y-1 border-l-2 border-border pl-3 animate-slide-down">
                          {m.items.map((item, idx) => {
                            const itemActive = isItemActive(item.href || "");
                            return (
                              <Link
                                key={idx}
                                to={item.href || (m.isPremium ? "/configurateur" : m.isPro ? "/pro" : "/catalogue")}
                                onClick={() => {
                                  setMobileMenuOpen(false);
                                  setOpenDropdowns({});
                                }}
                                className={`flex items-center gap-2 px-4 py-2.5 text-sm transition-colors rounded-lg group ${
                                  itemActive
                                    ? m.isPro
                                      ? "bg-blue-500/15 text-blue-600 dark:text-blue-400 font-semibold"
                                      : "bg-foreground/10 text-foreground font-semibold"
                                    : "hover:bg-secondary"
                                }`}
                              >
                                {m.isPremium && item.label === "Configurateur Premium" && (
                                  <Star className="h-3 w-3 text-amber-500" />
                                )}
                                {m.isPremium && item.label === "Builds recommandées" && (
                                  <Zap className="h-3 w-3 text-orange-500" />
                                )}
                                {m.isPro && item.label === "Facturation Normée & TVA" && (
                                  <FileText className="h-3 w-3 text-blue-500" />
                                )}
                                {m.isPro && item.label === "SAV Prioritaire Entreprise" && (
                                  <Headphones className="h-3 w-3 text-green-500" />
                                )}
                                {m.isPro && item.label === "Audit de Parc Informatique" && (
                                  <BarChart2 className="h-3 w-3 text-purple-500" />
                                )}
                                <span className={`${!itemActive ? "group-hover:translate-x-1" : ""} transition-transform`}>
                                  {item.label}
                                </span>
                                {/* Dot actif sur l'item */}
                                {itemActive && (
                                  <span className="ml-auto h-1.5 w-1.5 rounded-full bg-foreground shrink-0" />
                                )}
                                {m.isPremium && item.label === "Configurateur Premium" && (
                                  <span className="text-[8px] bg-amber-500 text-black px-1.5 py-0.5 rounded-full ml-auto">
                                    POPULAIRE
                                  </span>
                                )}
                              </Link>
                            );
                          })}
                        </div>
                      )}
                    </div>
                  );
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
                  <IconButtonMobile to="/login" icon={<User className="h-5 w-5" />} label="Compte" />
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
            
            // Lien direct
            if (isDirectLink && m.href) {
              return (
                <Link
                  key={m.label}
                  to={m.href}
                  className={`px-6 py-4 text-[11px] font-bold uppercase tracking-[0.2em] transition-all relative flex items-center gap-1.5 ${
                    m.isPremium
                      ? "bg-gradient-to-r from-amber-500/10 to-orange-500/10 text-amber-600 dark:text-amber-400 rounded-t-lg"
                      : m.isPro
                      ? "bg-gradient-to-r from-blue-500/10 to-blue-400/10 text-blue-600 dark:text-blue-400 rounded-t-lg"
                      : active
                      ? "text-foreground"
                      : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  <span>{m.icon}</span>
                  <span>{m.isPremium ? "SUPER CONFIG" : m.label}</span>
                  {m.isPremium && <Sparkles className="h-3 w-3 text-amber-500 animate-pulse" />}
                  {m.isPro && <Shield className="h-3 w-3 text-blue-500" />}
                  {/* Barre active en bas */}
                  <span className={`absolute bottom-0 left-1/2 -translate-x-1/2 h-0.5 transition-all duration-300 ${
                    active ? "w-full" : "w-0"
                  } ${m.isPremium ? "bg-amber-500" : m.isPro ? "bg-blue-500" : "bg-foreground"}`} />
                </Link>
              );
            }
            
            // Dropdown
            return (
              <div key={m.label} className="relative">
                <button
                  onMouseEnter={() => setOpen(m.label)}
                  className={`px-6 py-4 text-[11px] font-bold uppercase tracking-[0.2em] transition-all relative flex items-center gap-1.5 ${
                    m.isPremium
                      ? "bg-gradient-to-r from-amber-500/10 to-orange-500/10 text-amber-600 dark:text-amber-400 rounded-t-lg"
                      : m.isPro
                      ? "bg-gradient-to-r from-blue-500/10 to-blue-400/10 text-blue-600 dark:text-blue-400 rounded-t-lg"
                      : active
                      ? "text-foreground"
                      : open === m.label
                      ? "text-foreground"
                      : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  <span>{m.icon}</span>
                  <span>{m.isPremium ? "SUPER CONFIG" : m.label}</span>
                  {m.isPremium && <Sparkles className="h-3 w-3 text-amber-500 animate-pulse" />}
                  {m.isPro && <Shield className="h-3 w-3 text-blue-500" />}
                  {m.isPremium && (
                    <span className="absolute -top-2 -right-2 h-2 w-2 bg-amber-500 rounded-full animate-ping" />
                  )}
                  {/* Barre active/hover en bas */}
                  <span className={`absolute bottom-0 left-1/2 -translate-x-1/2 h-0.5 transition-all duration-300 ${
                    active ? "w-full" : open === m.label ? "w-8" : "w-0"
                  } ${m.isPremium ? "bg-amber-500" : m.isPro ? "bg-blue-500" : "bg-foreground"}`} />
                </button>

                {open === m.label && hasItems && (
                  <div className={`absolute top-full left-1/2 -translate-x-1/2 mt-0 w-80 shadow-elevated p-2 animate-fade-in z-50 ${
                    m.isPremium
                      ? "bg-white dark:bg-black border-2 border-amber-500/30 rounded-xl"
                      : m.isPro
                      ? "bg-white dark:bg-black border-2 border-blue-500/30 rounded-xl"
                      : "bg-white dark:bg-black border border-border rounded-xl"
                  }`}>
                    {m.items.map((item, idx) => {
                      const itemActive = isItemActive(item.href || "");
                      return (
                        <a
                          key={idx}
                          href={item.href || (m.isPremium ? "/configurateur" : m.isPro ? "/pro" : "/catalogue")}
                          onClick={() => setOpen(null)}
                          className={`block px-9 py-2.5 text-sm transition-colors rounded-lg ${
                            itemActive
                              ? m.isPremium
                                ? "bg-amber-500/15 text-amber-600 font-semibold"
                                : m.isPro
                                ? "bg-blue-500/15 text-blue-600 font-semibold"
                                : "bg-black/10 dark:bg-white/10 text-gray-900 dark:text-white font-semibold"
                              : m.isPremium
                              ? "hover:bg-amber-500/10 hover:text-amber-600 text-gray-900 dark:text-white"
                              : m.isPro
                              ? "hover:bg-blue-500/10 hover:text-blue-600 text-gray-900 dark:text-white"
                              : "hover:bg-black/10 dark:hover:bg-white/10 text-gray-900 dark:text-white"
                          }`}
                        >
                          <div className="flex items-center gap-2">
                            {m.isPremium && item.label === "Configurateur Premium" && <Star className="h-3 w-3 text-amber-500" />}
                            {m.isPremium && item.label === "Builds recommandées" && <Zap className="h-3 w-3 text-orange-500" />}
                            {m.isPro && item.label === "Facturation Normée & TVA" && <FileText className="h-3 w-3 text-blue-500" />}
                            {m.isPro && item.label === "SAV Prioritaire Entreprise" && <Headphones className="h-3 w-3 text-green-500" />}
                            {m.isPro && item.label === "Audit de Parc Informatique" && <BarChart2 className="h-3 w-3 text-purple-500" />}
                            <span>{item.label}</span>
                            {/* Dot actif sur l'item du dropdown */}
                            {itemActive && (
                              <span className="ml-auto h-1.5 w-1.5 rounded-full bg-current shrink-0" />
                            )}
                            {m.isPremium && item.label === "Configurateur Premium" && (
                              <span className="text-[8px] bg-amber-500 text-black px-1.5 py-0.5 rounded-full">POPULAIRE</span>
                            )}
                          </div>
                        </a>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          })}

          {/* Bouton DEVIS EXPRESS */}
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