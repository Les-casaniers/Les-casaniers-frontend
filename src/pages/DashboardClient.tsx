import { useState, useEffect } from "react";
import { Outlet, Link, useLocation, useNavigate } from "react-router-dom";
import {
  LayoutDashboard, Package, MapPin, Heart, 
  CreditCard, LogOut, ChevronRight, User, Bell,
  Menu, X, Sun, Moon
} from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";

// Hook personnalisé pour le thème
const useTheme = () => {
  const [theme, setTheme] = useState<"light" | "dark">(() => {
    // Vérifier si un thème est sauvegardé dans localStorage
    const savedTheme = localStorage.getItem("theme");
    if (savedTheme === "light" || savedTheme === "dark") {
      return savedTheme;
    }
    // Vérifier les préférences système
    if (window.matchMedia("(prefers-color-scheme: dark)").matches) {
      return "dark";
    }
    return "light";
  });

  useEffect(() => {
    // Appliquer le thème au document
    const root = document.documentElement;
    if (theme === "dark") {
      root.classList.add("dark");
    } else {
      root.classList.remove("dark");
    }
    // Sauvegarder dans localStorage
    localStorage.setItem("theme", theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme(prev => prev === "dark" ? "light" : "dark");
  };

  return { theme, toggleTheme };
};

const DashboardClientLayout = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const [showLogout, setShowLogout] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const userData = {
    name: user?.name || "Jean Dupont",
    email: user?.email || "jean.dupont@email.com",
  };

  const menuItems = [
    { icon: LayoutDashboard, label: "Aperçu", path: "/DashboardClient" },
    { icon: Package, label: "Mes commandes", path: "/DashboardClient/commandes" },
    { icon: MapPin, label: "Mes adresses", path: "/DashboardClient/adresses" },
    { icon: Heart, label: "Mes favoris", path: "/DashboardClient/favoris" },
    { icon: CreditCard, label: "Paiement", path: "/DashboardClient/paiement" },
  ];

  const isActive = (path: string) => {
    if (path === "/DashboardClient") return location.pathname === "/DashboardClient";
    return location.pathname.startsWith(path);
  };

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  // Fermer le menu mobile sur resize
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 768) {
        setMobileMenuOpen(false);
      }
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return (
    <div className="flex h-screen bg-background">
      {/* Sidebar Desktop */}
      <aside className="hidden md:flex w-64 bg-card border-r border-border flex-col fixed h-full z-30">
        {/* Logo */}
        <div className="p-6 border-b border-border">
          <Link to="/DashboardClient" className="flex items-center gap-3">
            <div className="h-10 w-10 bg-foreground rounded-xl flex items-center justify-center">
              <User className="h-5 w-5 text-background" />
            </div>
            <div>
              <h2 className="font-bold text-lg text-foreground">Mon compte</h2>
              <p className="text-xs text-muted-foreground">Les Casaniers</p>
            </div>
          </Link>
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
          {menuItems.map((item) => (
            <Link
              key={item.path}
              to={item.path}
              className={`flex items-center justify-between px-4 py-2.5 rounded-lg text-sm font-medium transition ${
                isActive(item.path)
                  ? "bg-primary text-primary-foreground"
                  : "text-muted-foreground hover:bg-secondary hover:text-foreground"
              }`}
            >
              <div className="flex items-center gap-3">
                <item.icon className="h-5 w-5" />
                <span>{item.label}</span>
              </div>
              <ChevronRight className={`h-4 w-4 transition ${isActive(item.path) ? 'translate-x-0.5' : ''}`} />
            </Link>
          ))}
        </nav>

        {/* Footer sidebar */}
   
      </aside>

      {/* Main content */}
      <div className="flex-1 md:ml-64">
        {/* Header */}
        <header className="bg-card border-b border-border sticky top-0 z-20">
          <div className="flex items-center justify-between px-4 py-3">
            {/* Mobile menu button */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-2 rounded-lg hover:bg-secondary transition"
            >
              <Menu className="h-5 w-5" />
            </button>

            <div className="flex-1" />

            {/* Actions groupées - Notifications + Theme Toggle */}
            <div className="flex items-center gap-2">
              {/* Notifications */}
              <button className="relative p-2 rounded-lg hover:bg-secondary transition">
                <Bell className="h-5 w-5 text-muted-foreground" />
                <span className="absolute top-1 right-1 h-2 w-2 bg-destructive rounded-full animate-pulse"></span>
              </button>

              {/* Theme Toggle Button avec icône fonctionnelle */}
              <button
                onClick={toggleTheme}
                className="p-2 rounded-lg hover:bg-secondary transition"
                aria-label="Changer de thème"
              >
                {theme === "dark" ? (
                  <Sun className="h-5 w-5 text-amber-500 hover:text-amber-400 transition" />
                ) : (
                  <Moon className="h-5 w-5 text-primary hover:text-primary/80 transition" />
                )}
              </button>
            </div>

            {/* User profile */}
            <div 
              className="relative ml-2"
              onMouseEnter={() => setShowLogout(true)}
              onMouseLeave={() => setShowLogout(false)}
            >
              <button className="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-secondary transition">
                <div className="h-8 w-8 bg-primary rounded-full flex items-center justify-center">
                  <span className="text-sm font-bold text-primary-foreground">
                    {userData.name.charAt(0).toUpperCase()}
                  </span>
                </div>
                <div className="text-left hidden sm:block">
                  <p className="text-sm font-medium text-foreground">{userData.name}</p>
                  <p className="text-xs text-muted-foreground">{userData.email}</p>
                </div>
              </button>

              {/* Dropdown déconnexion */}
              {showLogout && (
                <div className="absolute right-0 top-full mt-2 w-56 bg-popover border border-border rounded-lg shadow-lg py-1 z-50 animate-fade-in">
                  <div className="px-4 py-2 border-b border-border">
                    <p className="text-sm font-medium text-foreground">{userData.name}</p>
                    <p className="text-xs text-muted-foreground">{userData.email}</p>
                  </div>
                  <button
                    onClick={handleLogout}
                    className="w-full flex items-center gap-2 px-4 py-2 text-sm text-destructive hover:bg-secondary transition"
                  >
                    <LogOut className="h-4 w-4" />
                    Déconnexion
                  </button>
                </div>
              )}
            </div>
          </div>
        </header>

        {/* Page content */}
        <main className="p-4 md:p-6 overflow-y-auto" style={{ height: 'calc(100vh - 57px)' }}>
          <Outlet />
        </main>
      </div>

      {/* Mobile Sidebar */}
      {mobileMenuOpen && (
        <>
          <div 
            className="fixed inset-0 bg-black/50 z-40 md:hidden animate-fade-in"
            onClick={() => setMobileMenuOpen(false)}
          />
          <aside className="fixed left-0 top-0 h-full w-80 bg-card border-r border-border z-50 md:hidden animate-slide-in-right">
            <div className="flex flex-col h-full">
              <div className="p-4 border-b border-border flex items-center justify-between">
                <Link to="/DashboardClient" className="flex items-center gap-3" onClick={() => setMobileMenuOpen(false)}>
                  <div className="h-10 w-10 bg-foreground rounded-xl flex items-center justify-center">
                    <User className="h-5 w-5 text-background" />
                  </div>
                  <div>
                    <h2 className="font-bold text-lg text-foreground">Mon compte</h2>
                    <p className="text-xs text-muted-foreground">Les Casaniers</p>
                  </div>
                </Link>
                <button 
                  onClick={() => setMobileMenuOpen(false)}
                  className="p-2 rounded-lg hover:bg-secondary transition"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
                {menuItems.map((item) => (
                  <Link
                    key={item.path}
                    to={item.path}
                    onClick={() => setMobileMenuOpen(false)}
                    className={`flex items-center justify-between px-4 py-3 rounded-lg text-sm font-medium transition ${
                      isActive(item.path)
                        ? "bg-primary text-primary-foreground"
                        : "text-muted-foreground hover:bg-secondary hover:text-foreground"
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <item.icon className="h-5 w-5" />
                      <span>{item.label}</span>
                    </div>
                    <ChevronRight className={`h-4 w-4 transition ${isActive(item.path) ? 'translate-x-0.5' : ''}`} />
                  </Link>
                ))}
              </nav>

              <div className="p-4 border-t border-border space-y-3">
                <button
                  onClick={toggleTheme}
                  className="w-full flex items-center justify-between px-3 py-2 rounded-lg bg-secondary/50 hover:bg-secondary transition-all duration-200"
                >
                  <div className="flex items-center gap-2">
                    {theme === "dark" ? (
                      <Sun className="h-4 w-4 text-amber-500" />
                    ) : (
                      <Moon className="h-4 w-4 text-primary" />
                    )}
                    <span className="text-sm text-foreground">
                      {theme === "dark" ? "Mode clair" : "Mode sombre"}
                    </span>
                  </div>
                  <div className="w-8 h-4 bg-muted rounded-full relative">
                    <div className={`absolute top-0.5 w-3 h-3 rounded-full bg-foreground transition-transform duration-200 ${
                      theme === "dark" ? 'translate-x-4' : 'translate-x-0.5'
                    }`} />
                  </div>
                </button>
                <p className="text-xs text-muted-foreground text-center">v1.0.0</p>
              </div>
            </div>
          </aside>
        </>
      )}
    </div>
  );
};

export default DashboardClientLayout;