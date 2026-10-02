import { useState, useEffect } from "react";
import { Outlet, Link, useLocation, useNavigate } from "react-router-dom";
import {
  ChevronRight, ChevronDown, Edit3, Check, Menu, X
} from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { Header } from "@/components/site/Header";
import { TopBar } from "@/components/site/TopBar";
import { Footer } from "@/components/site/Footer";
import EditProfileModal from "@/components/ActionClient/EditProfileModal";
import { getProfilePhotoUrl } from "@/lib/utils";

const DashboardClientLayout = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [showProfileModal, setShowProfileModal] = useState(false);
  const displayPrenom = user?.prenom;
  const displayNom = user?.nom;
  const displayPhoto = getProfilePhotoUrl(user?.photo);

  const menuItems = [
    { label: "Mon aperçu", path: "/DashboardClient" },
    { label: "Mes adresses", path: "/DashboardClient/adresses" },
    { label: "Mes commandes", path: "/DashboardClient/commandes" },
    { label: "Mes favoris", path: "/DashboardClient/favoris" },
    { label: "Mes factures", path: "/DashboardClient/paiement" },
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

  // ─── Sidebar partagée conforme à la maquette ───────────────────────────────
  const SidebarContent = ({ onNavClick }: { onNavClick?: () => void }) => (
    <div className="p-4 w-full">
      {/* Conteneur encadré Profil + Menu */}
      <div className="rounded-xl border border-white/20 bg-black text-white overflow-hidden shadow-lg">
        {/* Header Profil */}
        <div className="relative z-20 flex h-12 items-center gap-3 px-4">
          {/* Avatar circular */}
          <div className="flex h-[60px] w-[60px] shrink-0 translate-y-3 items-center justify-center overflow-hidden rounded-full bg-white text-xl font-bold text-black shadow">
            {displayPhoto ? (
              <img src={displayPhoto} alt="Photo de profil" className="w-full h-full object-cover" />
            ) : displayPrenom || displayNom ? (
              (displayPrenom || displayNom)?.charAt(0).toUpperCase()
            ) : (
              "U"
            )}
          </div>

          {/* Pseudo / Nom & Statut */}
          <div className="min-w-0 flex-1 pr-6">
            <p className="text-base font-medium text-white truncate">
              {displayPrenom && displayNom
                ? `${displayPrenom} ${displayNom}`
                : displayPrenom || displayNom || "Pseudo"}
            </p>
            <p className="text-xs text-neutral-400 flex items-center gap-1 mt-0.5">
              <span>{user && (user as any).statut !== false ? "Actif" : "Inactif"}</span>
              <Check className="w-3.5 h-3.5 text-white" />
            </p>
          </div>

          {/* Bouton édition profil en haut à droite */}
          <button
            type="button"
            onClick={() => { setShowProfileModal(true); onNavClick?.(); }}
            className="absolute top-3 right-3 p-1 rounded border border-white/30 text-white hover:bg-white/10 transition-colors"
            aria-label="Modifier le profil"
            title="Modifier le profil"
          >
            <Edit3 className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Ligne de séparation */}
        <div className="border-t border-white/20" />

        {/* Navigation Menu */}
        <nav className="py-1">
          {menuItems.map((item) => {
            const active = isActive(item.path);
            return (
              <Link
                key={item.path}
                to={item.path}
                onClick={onNavClick}
                className={`
                  flex items-center justify-between px-5 py-3.5 text-sm font-medium
                  transition-colors duration-150
                  ${active
                    ? "text-white font-semibold bg-white/10"
                    : "text-neutral-300 hover:text-white hover:bg-white/5"
                  }
                `}
              >
                <span>{item.label}</span>
                {active ? (
                  <ChevronDown className="w-4 h-4 text-white" />
                ) : (
                  <ChevronRight className="w-4 h-4 text-neutral-400" />
                )}
              </Link>
            );
          })}
        </nav>
      </div>
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
        <aside className="hidden lg:flex w-80 bg-card/95 backdrop-blur-md border-r border-border flex-col overflow-y-auto">
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
            <aside className="lg:hidden fixed left-0 top-0 w-80 h-screen bg-card/95 backdrop-blur-md border-r border-border flex flex-col z-40 overflow-y-auto animate-fade-in">
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
      `}</style>
      <footer>
        <Footer />
      </footer>

      {showProfileModal && (
        <EditProfileModal
          initialNom={displayNom}
          initialPrenom={displayPrenom}
          onClose={() => setShowProfileModal(false)}
        />
      )}
    </div>
  );
};

export default DashboardClientLayout;
