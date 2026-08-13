import { useState, useEffect } from "react";
import { Outlet, Link, useLocation, useNavigate } from "react-router-dom";
import {
  LayoutDashboard, Package, MapPin, Heart,
  CreditCard, Settings, LogOut, ChevronRight,
  Menu, X
} from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { Header } from "@/components/site/Header";
import { TopBar } from "@/components/site/TopBar";
import logo from "@/assets/casaniers-logo.png";

const DashboardClientLayout = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const menuItems = [
    { icon: LayoutDashboard, label: "Aperçu", path: "/DashboardClient" },
    { icon: Package, label: "Mes commandes", path: "/DashboardClient/commandes" },
    { icon: MapPin, label: "Mes adresses", path: "/DashboardClient/adresses" },
    { icon: Heart, label: "Mes favoris", path: "/DashboardClient/favoris" },
    { icon: CreditCard, label: "Factures", path: "/DashboardClient/paiement" },
  ];

  const isActive = (path: string) => {
    if (path === "/DashboardClient") return location.pathname === "/DashboardClient";
    return location.pathname.startsWith(path);
  };

  // Fermer le menu mobile au resize (>= lg)
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 1024) setMobileMenuOpen(false);
    };
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // Fermer la sidebar au changement de route (mobile)
  useEffect(() => {
    setMobileMenuOpen(false);
  }, [location.pathname]);

  const handleLogout = () => {
    if (typeof logout === "function") {
      logout();
    }
    navigate("/");
  };

  // ─── Sidebar partagée ──────────────────────────────────────────────────────
  const SidebarContent = ({ onNavClick }: { onNavClick?: () => void }) => (
    <div className="flex flex-col h-full">
      {/* Logo */}
      <div className="p-3 border-b border-white/7">
        <div className="flex items-center justify-between">
       
          {onNavClick && (
            <button
              onClick={onNavClick}
              className="lg:hidden p-1.5 hover:bg-muted rounded-lg transition-all duration-200"
              aria-label="Fermer le menu"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* Profil court en haut de la sidebar */}
        <div className="px-3 py-3">
          <Link
            to=""
            onClick={onNavClick}
            className="flex items-center gap-3 p-3 rounded-lg border border-white/7 hover:bg-muted/50 transition-colors"
          >
            <div className="w-12 h-12 shrink-0 rounded-full bg-gradient-to-br from-primary to-primary/80 flex items-center justify-center text-white font-bold">
              {user?.prenom || user?.nom
                ? (user.prenom || user.nom)?.charAt(0).toUpperCase()
                : "U"}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-foreground line-clamp-1">
                {user?.prenom && user?.nom
                  ? `${user.prenom} ${user.nom}`
                  : user?.prenom || user?.nom || "Client"}
              </p>
              <p className="text-xs text-muted-foreground flex items-center gap-2">
                <span
                  className={
                    "inline-block w-2 h-2 rounded-full " +
                    (user && (user as any).statut ? "bg-green-400" : "bg-gray-400")
                  }
                />
                {user && (user as any).statut ? "Actif" : "Inactif"}
              </p>
            </div>
            <ChevronRight className="w-4 h-4 text-muted-foreground shrink-0" />
          </Link>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-3 space-y-0.5 overflow-y-auto">
        {menuItems.map((item) => {
          const active = isActive(item.path);
          return (
            <Link
              key={item.path}
              to={item.path}
              onClick={onNavClick}
              className={`
                relative flex items-center gap-3 px-3 py-2.5 rounded-lg
                transition-all duration-200 group
                ${active
                  ? "bg-primary text-primary-foreground shadow-sm"
                  : "text-muted-foreground hover:bg-muted/50 hover:text-foreground hover:translate-x-1"
                }
              `}
            >
              <item.icon
                className={`w-4 h-4 transition-all duration-200 ${
                  active ? "text-primary-foreground" : "group-hover:text-primary"
                }`}
              />
              <span className="text-sm font-medium flex-1">{item.label}</span>
              {active && <ChevronRight className="w-3 h-3 animate-pulse-slow" />}
            </Link>
          );
        })}
      </nav>

      {/* Footer sidebar : paramètres + déconnexion */}
        {/* <div className="p-3 border-t border-white/7 space-y-0.5">
          <Link
            to="/DashboardClient/details-client"
            onClick={onNavClick}
            className={`
              flex items-center gap-3 px-3 py-2.5 rounded-lg
              transition-all duration-200 group
              ${isActive("/DashboardClient/details-client")
                ? "bg-primary text-primary-foreground shadow-sm"
                : "text-muted-foreground hover:bg-muted/50 hover:text-foreground hover:translate-x-1"
              }
            `}
          >
            <Settings className="w-4 h-4 group-hover:text-primary transition-all duration-200" />
            <span className="text-sm font-medium flex-1">Paramètres</span>
          </Link>

          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-muted-foreground hover:bg-destructive/10 hover:text-destructive transition-all duration-200 group"
          >
            <LogOut className="w-4 h-4 group-hover:text-destructive transition-all duration-200" />
            <span className="text-sm font-medium flex-1 text-left">Déconnexion</span>
          </button>
        </div> */}
    </div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20 flex flex-col">
      {/* TopBar en haut */}
      <TopBar />

      {/* Header en haut, pleine largeur */}
      <Header />

      {/* Layout wrapper */}
      <div className="flex flex-1 relative">
        {/* Sidebar Desktop - toujours visible */}
        <aside className="hidden lg:flex w-72 bg-card/95 backdrop-blur-md border-r border-border flex-col overflow-y-auto">
          <SidebarContent />
        </aside>

        {/* Sidebar Mobile - overlay */}
        {mobileMenuOpen && (
          <>
            {/* Overlay */}
            <div
              className="fixed inset-0 bg-black/50 backdrop-blur-sm z-30 lg:hidden animate-fade-in"
              onClick={() => setMobileMenuOpen(false)}
            />
            {/* Mobile Sidebar */}
            <aside className="lg:hidden fixed left-0 top-0 w-72 h-screen bg-card/95 backdrop-blur-md border-r border-border flex flex-col z-40 overflow-y-auto animate-fade-in">
              <SidebarContent onNavClick={() => setMobileMenuOpen(false)} />
            </aside>
          </>
        )}

        {/* Bouton menu mobile */}
        <button
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="lg:hidden fixed bottom-8 right-8 z-50 p-3 rounded-full bg-primary text-primary-foreground shadow-lg hover:bg-primary/90 transition-all"
          aria-label="Ouvrir le menu"
        >
          {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>

        {/* Main content */}
        <div className="flex-1 w-full overflow-y-auto">
          <main className="p-4 md:p-6 lg:p-8">
            <div className="animate-fade-up">
              <Outlet />
            </div>
          </main>
        </div>
      </div>

      <style>{`
        @keyframes fade-in {
          from { opacity: 0; }
          to   { opacity: 1; }
        }
        .animate-fade-in { animation: fade-in 0.2s ease-out both; }

        @keyframes fade-up {
          from { opacity: 0; transform: translateY(20px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        .animate-fade-up { animation: fade-up 0.4s ease-out both; }

        @keyframes pulse-slow {
          0%, 100% { opacity: 1; transform: translateX(0); }
          50%       { opacity: 0.5; transform: translateX(2px); }
        }
        .animate-pulse-slow { animation: pulse-slow 2s ease-in-out infinite; }
      `}</style>
    </div>
  );
};

export default DashboardClientLayout;