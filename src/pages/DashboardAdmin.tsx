import { useState } from "react";
import { Outlet, Link, useLocation } from "react-router-dom";
import {
  LayoutDashboard, Package, ShoppingCart, Users, FileText,
  Bell, Settings, LogOut, ChevronRight, Shield, User
} from "lucide-react";

const AdminLayout = () => {
  const location = useLocation();
  const [showLogout, setShowLogout] = useState(false);

  // Données admin fictives
  const admin = {
    name: "Admin Test",
    email: "admin@lescasaniers.mg"
  };

  const menuItems = [
    { icon: LayoutDashboard, label: "Tableau de bord", path: "/DashboardAdmin" },
    { icon: Package, label: "Produits", path: "/DashboardAdmin/produits" },
    { icon: ShoppingCart, label: "Commandes", path: "/DashboardAdmin/commandes" },
    { icon: Users, label: "Clients", path: "/DashboardAdmin/clients" },
    { icon: FileText, label: "Factures", path: "/DashboardAdmin/factures" },
    { icon: Bell, label: "Notifications", path: "/DashboardAdmin/notifications", badge: "3" },
    { icon: Settings, label: "Paramètres", path: "/DashboardAdmin/parametres" },
  ];

  const isActive = (path: string) => {
    if (path === "/DashboardAdmin") return location.pathname === "/DashboardAdmin";
    return location.pathname.startsWith(path);
  };

  return (
    <div className="flex h-screen bg-gray-50 dark:bg-gray-950">
      {/* Sidebar - fond noir */}
      <aside className="w-64 bg-black border-r border-gray-800 flex flex-col fixed h-full z-30">
        {/* Logo */}
        <div className="p-6 border-b border-gray-800">
          <Link to="/DashboardAdmin" className="flex items-center gap-3">
            <div className="h-10 w-10 bg-white rounded-xl flex items-center justify-center">
              <Shield className="h-5 w-5 text-black" />
            </div>
            <div>
              <h2 className="font-bold text-lg text-white">Admin</h2>
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
              <div className="flex items-center gap-2">
                {item.badge && (
                  <span className="h-5 min-w-5 px-1 rounded-full bg-white text-black text-[10px] font-bold flex items-center justify-center">
                    {item.badge}
                  </span>
                )}
                <ChevronRight className={`h-4 w-4 transition ${isActive(item.path) ? 'translate-x-0.5' : ''}`} />
              </div>
            </Link>
          ))}
        </nav>

        {/* Footer sidebar */}
        <div className="p-4 border-t border-gray-800">
          <p className="text-xs text-gray-500">v1.0.0</p>
        </div>
      </aside>

      {/* Main content area */}
      <div className="flex-1 ml-64">
        {/* Navbar - fond noir */}
        <header className="h-16 bg-black border-b border-gray-800 flex items-center justify-end px-6 sticky top-0 z-20">
          {/* Profil admin avec dropdown */}
          <div 
            className="relative"
            onMouseEnter={() => setShowLogout(true)}
            onMouseLeave={() => setShowLogout(false)}
          >
            <button className="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-gray-800 transition">
              <div className="h-8 w-8 bg-white rounded-full flex items-center justify-center">
                <span className="text-sm font-bold text-black">
                  {admin.name.charAt(0).toUpperCase()}
                </span>
              </div>
              <div className="text-left">
                <p className="text-sm font-medium text-white">{admin.name}</p>
                <p className="text-xs text-gray-400">{admin.email}</p>
              </div>
            </button>

            {/* Dropdown déconnexion */}
            {showLogout && (
              <div className="absolute right-0 top-full mt-1 w-48 bg-black border border-gray-800 rounded-lg shadow-lg py-1 z-50">
                <div className="px-4 py-2 border-b border-gray-800">
                  <p className="text-sm font-medium text-white">{admin.name}</p>
                  <p className="text-xs text-gray-400">{admin.email}</p>
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
        </header>

        {/* Page content */}
        <main className="p-6 overflow-y-auto" style={{ height: 'calc(100vh - 64px)' }}>
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default AdminLayout;