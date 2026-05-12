import { useState } from "react";
import { Outlet, Link, useLocation } from "react-router-dom";
import {
  LayoutDashboard, Package, ShoppingBag, MapPin, Heart, 
  CreditCard, Settings, LogOut, ChevronRight, User, Bell
} from "lucide-react";

const DashboardClientLayout = () => {
  const location = useLocation();
  const [showLogout, setShowLogout] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const user = {
    name: "Jean Dupont",
    email: "jean.dupont@email.com"
  };

  const menuItems = [
    { icon: LayoutDashboard, label: "Aperçu", path: "/DashboardClient" },
    { icon: Package, label: "Mes commandes", path: "/DashboardClient/commandes" },
    { icon: MapPin, label: "Mes adresses", path: "/DashboardClient/adresses" },
    { icon: Heart, label: "Mes favoris", path: "/DashboardClient/favoris" },
    { icon: CreditCard, label: "Paiement", path: "/DashboardClient/paiement" },
    { icon: Settings, label: "Paramètres", path: "/DashboardClient/parametres" },
  ];

  const isActive = (path: string) => {
    if (path === "/DashboardClient") return location.pathname === "/DashboardClient";
    return location.pathname.startsWith(path);
  };

  return (
    <div className="flex h-screen bg-gray-50 dark:bg-gray-950">
      {/* Overlay pour mobile */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-20 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside className={`w-64 bg-black border-r border-gray-800 flex flex-col fixed h-full z-30 transition-transform duration-300 ${
        sidebarOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
      }`}>
        {/* Logo */}
        <div className="p-6 border-b border-gray-800">
          <Link to="/DashboardClient" className="flex items-center gap-3">
            <div className="h-10 w-10 bg-white rounded-xl flex items-center justify-center">
              <User className="h-5 w-5 text-black" />
            </div>
            <div>
              <h2 className="font-bold text-lg text-white">Client</h2>
              <p className="text-xs text-gray-400">Les Casaniers</p>
            </div>
          </Link>
        </div>


        {/* Navigation */}
        <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
          {menuItems.map((item) => (
            <Link
              key={item.path}
              to={item.path}
              onClick={() => setSidebarOpen(false)}
              className={`flex items-center justify-between px-4 py-2.5 rounded-lg text-sm font-medium transition ${
                isActive(item.path)
                  ? "bg-gray-800 text-white"
                  : "text-gray-400 hover:bg-gray-800 hover:text-white"
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

      </aside>

      {/* Main content area */}
      <div className="flex-1 lg:ml-64">
        {/* Navbar */}
        <header className="h-16 bg-black border-b border-gray-800 flex items-center justify-between px-6 sticky top-0 z-10">
          {/* Bouton menu mobile */}
          <button
            onClick={() => setSidebarOpen(true)}
            className="lg:hidden p-2 rounded-lg hover:bg-gray-800 transition"
          >
            <svg className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>

          {/* Profil admin avec dropdown (droite) */}
          <div className="flex items-center gap-4 ml-auto">
            <button className="relative p-2 rounded-lg hover:bg-gray-800 transition">
              <Bell className="h-5 w-5 text-gray-400" />
              <span className="absolute top-1 right-1 h-2 w-2 bg-red-500 rounded-full"></span>
            </button>

            <div 
              className="relative"
              onMouseEnter={() => setShowLogout(true)}
              onMouseLeave={() => setShowLogout(false)}
            >
              <button className="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-gray-800 transition">
                <div className="h-8 w-8 bg-white rounded-full flex items-center justify-center">
                  <span className="text-sm font-bold text-black">
                    {user.name.charAt(0).toUpperCase()}
                  </span>
                </div>
                <div className="text-left hidden sm:block">
                  <p className="text-sm font-medium text-white">{user.name}</p>
                  <p className="text-xs text-gray-400">{user.email}</p>
                </div>
              </button>

              {/* Dropdown déconnexion */}
              {showLogout && (
                <div className="absolute right-0 top-full mt-1 w-48 bg-black border border-gray-800 rounded-lg shadow-lg py-1 z-50">
                  <div className="px-4 py-2 border-b border-gray-800">
                    <p className="text-sm font-medium text-white">{user.name}</p>
                    <p className="text-xs text-gray-400">{user.email}</p>
                  </div>
                  <button
                    onClick={() => window.location.href = "/"}
                    className="w-full flex items-center gap-2 px-4 py-2 text-sm text-red-400 hover:bg-gray-800 transition"
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
        <main className="p-6 overflow-y-auto" style={{ height: 'calc(100vh - 64px)' }}>
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default DashboardClientLayout;