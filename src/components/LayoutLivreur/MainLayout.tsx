// src/components/layout/MainLayout.tsx
import { Sidebar } from 'lucide-react';
import React, { useState } from 'react';
import { Outlet } from 'react-router-dom';
import Header from '../Livreur/Header';


interface MainLayoutProps {
  userRole: 'admin' | 'livreur';
}

const MainLayout: React.FC<MainLayoutProps> = ({ userRole }) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="min-h-screen bg-background">
      <Sidebar 
        userRole={userRole} 
        isOpen={sidebarOpen} 
        onClose={() => setSidebarOpen(false)} 
      />
      
      <div className="lg:pl-72">
        <Header 
          onMenuClick={() => setSidebarOpen(true)} 
          userRole={userRole}
          userName="Thomas Anderson"
        />
        
        <main className="pt-20 p-6 lg:p-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default MainLayout;