// src/pages/admin/Dashboard.tsx
import React, { useEffect, useState } from 'react';
import { Package, CheckCircle, Clock, DollarSign, TrendingUp } from 'lucide-react';
import StatCard from '@/components/AdminLivreur/StatCard';
import { DashboardStats, Livraison } from '@/Types/user.types';
import LivraisonTable from '@/components/AdminLivreur/LivraisonTable';


const AdminDashboard: React.FC = () => {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [recentLivraisons, setRecentLivraisons] = useState<Livraison[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Simulate API call
    setTimeout(() => {
      setStats({
        totalDeliveries: 1250,
        completedDeliveries: 980,
        pendingDeliveries: 220,
        cancelledDeliveries: 50,
        revenue: 45230,
        averageDeliveryTime: 2.5,
      });
      
      setRecentLivraisons([
        {
          id: '1',
          trackingNumber: 'TRK-001',
          clientName: 'Jean Dupont',
          clientPhone: '0612345678',
          clientAddress: '123 Rue de Paris',
          destinationAddress: '456 Avenue des Champs',
          status: 'in_transit',
          paymentStatus: 'paid',
          amount: 25.50,
          createdAt: new Date(),
        },
        // Add more mock data...
      ]);
      setLoading(false);
    }, 1000);
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="animate-pulse-slow text-center">
          <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-muted-foreground">Chargement...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-display font-bold tracking-tight">Dashboard</h1>
        <p className="text-muted-foreground mt-1">Bienvenue dans votre espace d'administration</p>
      </div>

      {/* Stats grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="Total des livraisons"
          value={stats?.totalDeliveries || 0}
          icon={Package}
          trend={12}
          color="primary"
        />
        <StatCard
          title="Livraisons complétées"
          value={stats?.completedDeliveries || 0}
          icon={CheckCircle}
          trend={8}
          color="success"
        />
        <StatCard
          title="En attente"
          value={stats?.pendingDeliveries || 0}
          icon={Clock}
          trend={-5}
          color="warning"
        />
        <StatCard
          title="Chiffre d'affaires"
          value={`${stats?.revenue.toLocaleString()} €`}
          icon={DollarSign}
          trend={15}
          color="primary"
        />
      </div>

      {/* Charts section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="card p-6">
          <h3 className="text-lg font-semibold mb-4">Évolution des livraisons</h3>
          <div className="h-64 flex items-center justify-center text-muted-foreground">
            Graphique des livraisons
          </div>
        </div>
        
        <div className="card p-6">
          <h3 className="text-lg font-semibold mb-4">Performance des livreurs</h3>
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="flex items-center justify-between">
                <div>
                  <p className="font-medium">Livreur {i}</p>
                  <p className="text-sm text-muted-foreground">95% de taux de réussite</p>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-32 h-2 bg-muted rounded-full overflow-hidden">
                    <div className="h-full bg-primary rounded-full" style={{ width: '95%' }}></div>
                  </div>
                  <span className="text-sm font-medium">95%</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Recent deliveries table */}
      <LivraisonTable
        livraisons={recentLivraisons}
        onViewDetails={(id) => console.log('View details', id)}
        onUpdateStatus={(id, status) => console.log('Update status', id, status)}
      />
    </div>
  );
};

export default AdminDashboard;