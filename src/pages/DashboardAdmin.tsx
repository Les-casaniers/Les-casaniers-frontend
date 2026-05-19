import { useState, useEffect, useRef } from "react";
import { Outlet, Link, useLocation, useNavigate } from "react-router-dom";
import {
  LayoutDashboard, Package, ShoppingCart, Users, FileText, Star, ClipboardList,
  Bell, Settings, LogOut, ChevronRight, Shield, Menu, X, ExternalLink
} from "lucide-react";
import { ThemeToggle } from "@/components/ThemeToggle";
import { useAuth } from "@/contexts/AuthContext";

const DashboardAdmin = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const [showLogout, setShowLogout] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);

  // Données admin
  const adminFullName = [user?.prenom, user?.nom].filter(Boolean).join(" ").trim();
  const admin = {
    name: adminFullName || "Administrateur",
    email: user?.email || "admin@lescasaniers.mg",
    role: "Administrateur"
  };

  const menuItems = [
    { icon: LayoutDashboard, label: "Tableau de bord", path: "/DashboardAdmin" },
    { icon: Package, label: "Produits", path: "/DashboardAdmin/produits" },
    { icon: ShoppingCart, label: "Commandes", path: "/DashboardAdmin/commandes" },
    { icon: ClipboardList, label: "Devis", path: "/DashboardAdmin/devis" },
    { icon: Users, label: "Clients", path: "/DashboardAdmin/clients" },
    { icon: FileText, label: "Factures", path: "/DashboardAdmin/factures" },
    { icon: Star, label: "Avis clients", path: "/DashboardAdmin/avis" },
    { icon: FileText, label: "Devis express", path: "/DashboardAdmin/devis-express" },
    { icon: Shield, label: "Administrateurs", path: "/DashboardAdmin/admins" },
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
    setShowLogout(false);
  };

  const handleViewSite = () => {
    navigate("/catalogue");
    setShowLogout(false);
  };

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
            </Link>
          ))}
        </nav>

        {/* Footer sidebar */}
        <div className="p-4 border-t border-border">
          <ThemeToggle />
          <p className="text-xs text-muted-foreground mt-3">v1.0.0</p>
        </div>
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

            {/* Theme toggle mobile */}
            <div className="md:hidden mr-2">
              <ThemeToggle />
            </div>

            {/* Admin profile - MODIFIÉ pour ne pas se fermer au survol */}
            <div className="relative" ref={dropdownRef}>
              <button
                ref={buttonRef}
                onClick={() => setShowLogout(!showLogout)}
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

              {/* Dropdown - Voir le site + Déconnexion */}
              {showLogout && (
                <div className="absolute right-0 top-full mt-2 w-56 bg-popover border border-border rounded-lg shadow-lg py-1 z-50">
                  <div className="px-4 py-2 border-b border-border">
                    <p className="text-sm font-medium text-foreground">{admin.name}</p>
                    <p className="text-xs text-muted-foreground">{admin.email}</p>
                  </div>
                  
                  {/* Bouton Voir le site */}
                  <button
                    onClick={handleViewSite}
                    className="w-full flex items-center gap-2 px-4 py-2 text-sm text-foreground hover:bg-secondary transition"
                  >
                    <ExternalLink className="h-4 w-4" />
                    Voir le site
                  </button>
                  
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
                  </Link>
                ))}
              </nav>

              <div className="p-4 border-t border-border space-y-3">
                <ThemeToggle />
                {/* Boutons mobile */}
                <button
                  onClick={handleViewSite}
                  className="w-full flex items-center justify-center gap-2 px-4 py-2 text-sm text-foreground border border-border rounded-lg hover:bg-secondary transition"
                >
                  <ExternalLink className="h-4 w-4" />
                  Voir le site
                </button>
                <button
                  onClick={handleLogout}
                  className="w-full flex items-center justify-center gap-2 px-4 py-2 text-sm text-red-600 border border-red-600 rounded-lg hover:bg-red-600 hover:text-white transition"
                >
                  <LogOut className="h-4 w-4" />
                  Déconnexion
                </button>
                <p className="text-xs text-muted-foreground text-center">v1.0.0</p>
              </div>
            </div>
          </aside>
        </>
      )}

      <style>{`
        @keyframes fade-in {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        .animate-fade-in {
          animation: fade-in 0.2s ease-out both;
        }
        
        @keyframes slide-in-right {
          from { transform: translateX(100%); }
          to { transform: translateX(0); }
        }
        .animate-slide-in-right {
          animation: slide-in-right 0.3s ease-out both;
        }
      `}</style>
    </div>
  );
};

export default DashboardAdmin;