// src/components/layout/LivreurLayout.tsx
import React, { useState, useEffect } from 'react';
import { Outlet, NavLink, useLocation } from 'react-router-dom';
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
  Award
} from 'lucide-react';

const LivreurLayout: React.FC = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(false);
  const location = useLocation();

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

  const menuItems = [
    { path: '/DashboardLivreur', icon: LayoutDashboard, label: 'Dashboard' },
    { path: '/DashboardLivreur/livraisons', icon: Package, label: 'Mes livraisons' },
    { path: '/DashboardLivreur/planning', icon: Calendar, label: 'Planning' },
    { path: '/DashboardLivreur/statistiques', icon: BarChart3, label: 'Statistiques' },
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
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    window.location.href = '/login';
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
                <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-primary to-primary/80 flex items-center justify-center shadow-md transition-transform group-hover:scale-105 duration-300">
                  <Truck className="w-4 h-4 text-primary-foreground" />
                </div>
                <div>
                  <h1 className="text-lg font-bold bg-gradient-to-r from-foreground to-primary bg-clip-text text-transparent">
                    LivraFlow
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
                    <p className="text-[10px] opacity-70">{item.description}</p>
                  </div>
                  {item.badge && (
                    <span className={`text-xs px-1.5 py-0.5 rounded-full ${
                      isActive 
                        ? 'bg-primary-foreground/20 text-primary-foreground' 
                        : 'bg-primary/10 text-primary'
                    }`}>
                      {item.badge}
                    </span>
                  )}
                  {isActive && (
                    <ChevronRight className="w-3 h-3 animate-pulse-slow" />
                  )}
                </NavLink>
              );
            })}
          </nav>

          {/* Footer */}
          <div className="p-3 border-t border-border/50 space-y-2">
            <button 
              onClick={toggleTheme}
              className="w-full flex items-center justify-between px-3 py-2 rounded-lg bg-muted/30 hover:bg-muted/50 transition-all duration-200"
            >
              <span className="text-sm text-muted-foreground">Thème</span>
              <div className="flex items-center gap-2">
                <span className="text-xs">{isDarkMode ? 'Sombre' : 'Clair'}</span>
                {isDarkMode ? (
                  <Sun className="w-4 h-4 text-amber-500" />
                ) : (
                  <Moon className="w-4 h-4 text-slate-700" />
                )}
              </div>
            </button>
            <button 
              onClick={handleLogout}
              className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-muted-foreground hover:bg-red-500/10 hover:text-red-600 transition-all duration-200 group"
            >
              <LogOut className="w-4 h-4 transition-transform group-hover:translate-x-0.5" />
              <span>Déconnexion</span>
            </button>
          </div>
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

              {/* User */}
              <div className="flex items-center gap-2 cursor-pointer group">
                <div className="text-right hidden sm:block">
                  <p className="text-sm font-medium">Jean Dupont</p>
                  <p className="text-xs text-muted-foreground">Livreur</p>
                </div>
                <div className="relative">
                  <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary to-primary/80 flex items-center justify-center shadow-md transition-transform group-hover:scale-105 duration-300">
                    <User className="w-4 h-4 text-primary-foreground" />
                  </div>
                  <div className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 bg-emerald-500 rounded-full border-2 border-card"></div>
                </div>
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