import { useState, useEffect, useRef } from "react";
import { Outlet, Link, useLocation, useNavigate } from "react-router-dom";
import {
  LayoutDashboard, Package, ShoppingCart, Users, FileText,
  Bell, Settings, LogOut, ChevronRight, Shield, Menu, X,
  Sun, Moon, User as UserIcon
} from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";

// Hook personnalisé pour le thème
const useTheme = () => {
  const [theme, setTheme] = useState<"light" | "dark">(() => {
    const savedTheme = localStorage.getItem("theme");
    if (savedTheme === "light" || savedTheme === "dark") {
      return savedTheme;
    }
    return window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
  });

  useEffect(() => {
    const root = document.documentElement;
    if (theme === "dark") {
      root.classList.add("dark");
    } else {
      root.classList.remove("dark");
    }
    localStorage.setItem("theme", theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme(prev => prev === "dark" ? "light" : "dark");
  };

  return { theme, toggleTheme };
};

const AdminLayout = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const [showLogout, setShowLogout] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const profileRef = useRef<HTMLDivElement>(null);

  // Données admin
  const admin = {
    name: user?.nom || "Admin Test",
    email: user?.email || "admin@lescasaniers.mg",
    role: "Administrateur"
  };

  const menuItems = [
    { icon: LayoutDashboard, label: "Tableau de bord", path: "/DashboardAdmin" },
    { icon: Package, label: "Produits", path: "/DashboardAdmin/produits" },
    { icon: ShoppingCart, label: "Commandes", path: "/DashboardAdmin/commandes", badge: "3" },
    { icon: Users, label: "Clients", path: "/DashboardAdmin/clients" },
    { icon: FileText, label: "Factures", path: "/DashboardAdmin/factures" },
    { icon: Bell, label: "Notifications", path: "/DashboardAdmin/notifications" },
    { icon: Settings, label: "Paramètres", path: "/DashboardAdmin/parametres" },
  ];

  const isActive = (path: string) => {
    if (path === "/DashboardAdmin") return location.pathname === "/DashboardAdmin";
    return location.pathname.startsWith(path);
  };

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  // Toggle le menu profil au clic
  const toggleProfileMenu = () => {
    setShowLogout(!showLogout);
  };

  // Fermer le menu quand on clique en dehors
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (profileRef.current && !profileRef.current.contains(event.target as Node)) {
        setShowLogout(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

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
          <Link to="/DashboardAdmin" className="flex items-center gap-3">
            <div className="h-10 w-10 bg-foreground rounded-xl flex items-center justify-center">
              <Shield className="h-5 w-5 text-background" />
            </div>
            <div>
              <h2 className="font-bold text-lg text-foreground">Admin</h2>
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
              className={`flex items-center justify-between px-4 py-2.5 rounded-lg text-sm font-medium transition ${isActive(item.path)
                  ? "bg-primary text-primary-foreground"
                  : "text-muted-foreground hover:bg-secondary hover:text-foreground"
                }`}
            >
              <div className="flex items-center gap-3">
                <item.icon className="h-5 w-5" />
                <span>{item.label}</span>
              </div>
              {item.badge && (
                <span className={`h-5 min-w-5 px-1 rounded-full text-[10px] font-bold flex items-center justify-center ${isActive(item.path)
                    ? "bg-primary-foreground text-primary"
                    : "bg-destructive text-destructive-foreground"
                  }`}>
                  {item.badge}
                </span>
              )}
            </Link>
          ))}
        </nav>

        {/* Footer sidebar avec bouton thème */}

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

            {/* Admin profile - Menu au clic */}
            <div className="relative ml-2" ref={profileRef}>
              <button
                onClick={toggleProfileMenu}
                className="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-secondary transition"
              >
                <div className="h-8 w-8 bg-primary rounded-full flex items-center justify-center">
                  <span className="text-sm font-bold text-primary-foreground">
                    {admin.name.charAt(0).toUpperCase()}
                  </span>
                </div>
                <div className="text-left hidden sm:block">
                  <p className="text-sm font-medium text-foreground">{admin.name}</p>
                  <p className="text-xs text-muted-foreground">{admin.email}</p>
                </div>
              </button>

              {/* Dropdown déconnexion - Apparaît au clic */}
              {showLogout && (
                <div className="absolute right-0 top-full mt-2 w-56 bg-popover border border-border rounded-lg shadow-lg py-1 z-50 animate-fade-in">
                  <div className="px-4 py-3 border-b border-border">
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 bg-primary/10 rounded-full flex items-center justify-center">
                        <UserIcon className="h-5 w-5 text-primary" />
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-foreground">{admin.name}</p>
                        <p className="text-xs text-muted-foreground">{admin.email}</p>
                      </div>
                    </div>
                    <div className="mt-2 pt-2 border-t border-border/50">
                      <p className="text-xs text-muted-foreground">
                        <span className="font-medium">Rôle :</span> {admin.role}
                      </p>
                    </div>
                  </div>
                  <Link
                    to="/DashboardAdmin/parametres"
                    onClick={() => setShowLogout(false)}
                    className="flex items-center gap-3 px-4 py-2.5 text-sm text-muted-foreground hover:bg-secondary hover:text-foreground transition"
                  >
                    <Settings className="h-4 w-4" />
                    Paramètres du compte
                  </Link>
                  <button
                    onClick={handleLogout}
                    className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-950/20 transition"
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
                <Link to="/DashboardAdmin" className="flex items-center gap-3" onClick={() => setMobileMenuOpen(false)}>
                  <div className="h-10 w-10 bg-foreground rounded-xl flex items-center justify-center">
                    <Shield className="h-5 w-5 text-background" />
                  </div>
                  <div>
                    <h2 className="font-bold text-lg text-foreground">Admin</h2>
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
                    className={`flex items-center justify-between px-4 py-3 rounded-lg text-sm font-medium transition ${isActive(item.path)
                        ? "bg-primary text-primary-foreground"
                        : "text-muted-foreground hover:bg-secondary hover:text-foreground"
                      }`}
                  >
                    <div className="flex items-center gap-3">
                      <item.icon className="h-5 w-5" />
                      <span>{item.label}</span>
                    </div>
                    {item.badge && (
                      <span className="h-5 min-w-5 px-1 rounded-full bg-destructive text-destructive-foreground text-[10px] font-bold flex items-center justify-center">
                        {item.badge}
                      </span>
                    )}
                  </Link>
                ))}
              </nav>


            </div>
          </aside>
        </>
      )}
    </div>
  );
};

export default AdminLayout;