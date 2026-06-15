// src/components/layout/Sidebar.tsx
import React, { useState } from 'react';
import { NavLink } from 'react-router-dom';
import { 
  Home, 
  Package, 
  Truck, 
  Users, 
  BarChart3, 
  Settings, 
  LogOut,
  Menu,
  X
} from 'lucide-react';

interface SidebarProps {
  userRole: 'admin' | 'livreur';
  isOpen: boolean;
  onClose: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({ userRole, isOpen, onClose }) => {
  const adminMenuItems = [
    { path: '/admin', icon: Home, label: 'Dashboard' },
    { path: '/admin/livraisons', icon: Package, label: 'Livraisons' },
    { path: '/admin/livreurs', icon: Truck, label: 'Livreurs' },
    { path: '/admin/clients', icon: Users, label: 'Clients' },
    { path: '/admin/stats', icon: BarChart3, label: 'Statistiques' },
    { path: '/admin/settings', icon: Settings, label: 'Paramètres' },
  ];

  const livreurMenuItems = [
    { path: '/livreur', icon: Home, label: 'Dashboard' },
    { path: '/livreur/livraisons', icon: Package, label: 'Mes livraisons' },
    { path: '/livreur/planning', icon: BarChart3, label: 'Planning' },
    { path: '/livreur/settings', icon: Settings, label: 'Paramètres' },
  ];

  const menuItems = userRole === 'admin' ? adminMenuItems : livreurMenuItems;

  return (
    <>
      {/* Mobile overlay */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={onClose}
        />
      )}

      {/* Sidebar */}
      <aside className={`
        fixed top-0 left-0 h-full w-72 bg-card border-r border-border
        transform transition-transform duration-300 z-50
        ${isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
      `}>
        <div className="flex flex-col h-full">
          {/* Logo */}
          <div className="p-6 border-b border-border">
            <div className="flex items-center justify-between">
              <h1 className="text-2xl font-display font-bold tracking-tight">
                Livra<span className="text-primary">Flow</span>
              </h1>
              <button 
                onClick={onClose}
                className="lg:hidden p-2 hover:bg-muted rounded-lg transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Navigation */}
          <nav className="flex-1 p-4 space-y-2">
            {menuItems.map((item) => (
              <NavLink
                key={item.path}
                to={item.path}
                onClick={() => onClose()}
                className={({ isActive }) => `
                  flex items-center gap-3 px-4 py-3 rounded-lg
                  transition-all duration-200 group
                  ${isActive 
                    ? 'bg-primary text-primary-foreground shadow-sm' 
                    : 'text-muted-foreground hover:bg-muted hover:text-foreground'
                  }
                `}
              >
                <item.icon className="w-5 h-5" />
                <span className="font-medium">{item.label}</span>
              </NavLink>
            ))}
          </nav>

          {/* Footer */}
          <div className="p-4 border-t border-border">
            <button className="
              w-full flex items-center gap-3 px-4 py-3 rounded-lg
              text-muted-foreground hover:bg-muted hover:text-foreground
              transition-all duration-200
            ">
              <LogOut className="w-5 h-5" />
              <span className="font-medium">Déconnexion</span>
            </button>
          </div>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;