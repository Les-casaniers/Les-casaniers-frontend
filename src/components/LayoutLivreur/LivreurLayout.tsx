// src/components/layout/LivreurLayout.tsx
import React, { useState, useEffect, useRef } from 'react';
import { Outlet, NavLink, useLocation, useNavigate } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Package, 
  Calendar, 
  BarChart3, 
  LogOut,
  Menu,
  X,
  Truck,
  User,
  ChevronRight,
  Bell,
  Settings,
  Sun,
  Moon,
  TrendingUp,
  Award,
  ExternalLink
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import logo from "@/assets/casaniers-logo.png";

const LivreurLayout: React.FC = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [showLogout, setShowLogout] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const dropdownRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);

  // Données utilisateur
  const userData = {
    name: user?.prenom && user?.nom ? `${user.prenom} ${user.nom}` : (user?.prenom || user?.nom || "Livreur"),
    email: user?.email || "livreur@lescasaniers.mg",
  };

  // Vérifier le thème au chargement
  useEffect(() => {
    const savedTheme = localStorage.getItem('theme');
    const isDark = savedTheme === 'dark' || (!savedTheme && window.matchMedia('(prefers-color-scheme: dark)').matches);
    setIsDarkMode(isDark);
    if (isDark) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, []);

  // Fermer la sidebar sur mobile lors du changement de route
  useEffect(() => {
    setSidebarOpen(false);
  }, [location.pathname]);

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

  const menuItems = [
    { path: '/DashboardLivreur', icon: LayoutDashboard, label: 'Dashboard' },
    { path: '/DashboardLivreur/livraisons', icon: Package, label: 'Mes livraisons' },
  ];

  const toggleTheme = () => {
    setIsDarkMode(!isDarkMode);
    if (!isDarkMode) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
    setShowLogout(false);
  };

  // Vérifier si le chemin est actif
  const isActivePath = (path: string) => {
    if (path === '/DashboardLivreur') {
      return location.pathname === '/DashboardLivreur';
    }
    return location.pathname.startsWith(path);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20">
      {/* Overlay mobile */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40 lg:hidden animate-fade-in"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside className={`
        fixed top-0 left-0 h-full w-72 bg-card/95 backdrop-blur-md border-r border-border
        transform transition-all duration-300 ease-out z-50
        shadow-2xl lg:shadow-none
        ${sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
      `}>
        <div className="flex flex-col h-full">
          {/* Logo */}
          <div className="p-5 border-b border-border/50">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3 group">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary to-primary/80 flex items-center justify-center shadow-md transition-transform group-hover:scale-105 duration-300 overflow-hidden">
                  <img 
                    src={logo} 
                    alt="Logo Les Casaniers" 
                    className="w-full h-full object-cover rounded-xl"
                  />
                </div>
                <div>
                  <h1 className="text-lg font-bold bg-gradient-to-r from-foreground to-primary bg-clip-text text-transparent">
                    Livraison
                  </h1>
                  <p className="text-[10px] text-muted-foreground">Espace Livreur</p>
                </div>
              </div>
              <button 
                onClick={() => setSidebarOpen(false)}
                className="lg:hidden p-1.5 hover:bg-muted rounded-lg transition-all duration-200"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Navigation */}
          <nav className="flex-1 p-3 space-y-1 overflow-y-auto">
            {menuItems.map((item) => {
              const isActive = isActivePath(item.path);
              return (
                <NavLink
                  key={item.path}
                  to={item.path}
                  className={`
                    relative flex items-center gap-3 px-3 py-2.5 rounded-lg
                    transition-all duration-200 group
                    ${isActive 
                      ? 'bg-primary text-primary-foreground shadow-sm' 
                      : 'text-muted-foreground hover:bg-muted/50 hover:text-foreground hover:translate-x-1'
                    }
                  `}
                >
                  <item.icon className={`w-4 h-4 transition-all duration-200 ${isActive ? 'text-primary-foreground' : 'group-hover:text-primary'}`} />
                  <div className="flex-1">
                    <span className="text-sm font-medium">{item.label}</span>
                  </div>
                  {isActive && (
                    <ChevronRight className="w-3 h-3 animate-pulse-slow" />
                  )}
                </NavLink>
              );
            })}
          </nav>

        </div>
      </aside>

      {/* Main content */}
      <div className="lg:pl-72 min-h-screen">
        {/* Header */}
        <header className="sticky top-0 bg-card/80 backdrop-blur-md border-b border-border/50 z-30 shadow-sm">
          <div className="flex items-center justify-between px-4 py-3">
            <div className="flex items-center gap-3">
              <button
                onClick={() => setSidebarOpen(true)}
                className="lg:hidden p-2 hover:bg-muted rounded-lg transition-all duration-200 hover:scale-105 active:scale-95"
              >
                <Menu className="w-5 h-5" />
              </button>
              
              {/* Breadcrumb */}
              <div className="hidden md:flex items-center gap-2 text-sm">
                <span className="text-muted-foreground">Livreur</span>
                <ChevronRight className="w-3 h-3 text-muted-foreground" />
                <span className="font-medium text-foreground capitalize">
                  {menuItems.find(item => isActivePath(item.path))?.label || 'Dashboard'}
                </span>
              </div>
            </div>

            <div className="flex items-center gap-3">
              {/* Theme toggle rapide */}
              <button
                onClick={toggleTheme}
                className="p-2 rounded-full bg-muted/50 hover:bg-muted transition-all duration-300 hover:scale-110 active:scale-95"
              >
                {isDarkMode ? (
                  <Sun className="w-4 h-4 text-amber-500" />
                ) : (
                  <Moon className="w-4 h-4 text-slate-700" />
                )}
              </button>

              {/* Status */}
              <div className="flex items-center gap-2 px-2.5 py-1 bg-emerald-500/10 rounded-full border border-emerald-500/20">
                <div className="relative">
                  <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-ping opacity-75"></div>
                  <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full absolute top-0"></div>
                </div>
                <span className="text-xs font-medium text-emerald-600 dark:text-emerald-400 hidden sm:inline">
                  En ligne
                </span>
              </div>

              {/* User avec dropdown */}
              <div className="relative" ref={dropdownRef}>
                <button
                  ref={buttonRef}
                  onClick={() => setShowLogout(!showLogout)}
                  className="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-muted transition-all duration-200"
                >
                  <div className="text-right hidden sm:block">
                    <p className="text-sm font-medium text-foreground">{userData.name}</p>
                    <p className="text-xs text-muted-foreground">Livreur</p>
                  </div>
                  <div className="relative">
                    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary to-primary/80 flex items-center justify-center shadow-md transition-transform group-hover:scale-105 duration-300">
                      <span className="text-sm font-bold text-primary-foreground">
                        {userData.name.charAt(0).toUpperCase()}
                      </span>
                    </div>
                    <div className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 bg-emerald-500 rounded-full border-2 border-card"></div>
                  </div>
                </button>

                {/* Dropdown - Uniquement Déconnexion */}
                {showLogout && (
                  <div className="absolute right-0 top-full mt-2 w-56 bg-popover border border-border rounded-lg shadow-lg py-1 z-50">
                    <div className="px-4 py-2 border-b border-border">
                      <p className="text-sm font-medium text-foreground">{userData.name}</p>
                      <p className="text-xs text-muted-foreground">{userData.email}</p>
                    </div>

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
          </div>
        </header>

        {/* Page content with animation */}
        <main className="p-4 md:p-6 lg:p-8">
          <div className="animate-fade-up">
            <Outlet />
          </div>
        </main>
      </div>

      <style>{`
        @keyframes fade-in {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        .animate-fade-in {
          animation: fade-in 0.2s ease-out both;
        }

        @keyframes fade-up {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        .animate-fade-up {
          animation: fade-up 0.4s ease-out both;
        }

        @keyframes pulse-slow {
          0%, 100% {
            opacity: 1;
            transform: translateX(0);
          }
          50% {
            opacity: 0.5;
            transform: translateX(2px);
          }
        }
        .animate-pulse-slow {
          animation: pulse-slow 2s ease-in-out infinite;
        }
      `}</style>
    </div>
  );
};

export default LivreurLayout;