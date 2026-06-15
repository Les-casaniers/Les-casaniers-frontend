// src/pages/DashboardLivreur.tsx
import React, { useEffect, useState } from 'react';
import { MapPin, Package, CheckCircle, Clock, Star, TrendingUp, Phone, Navigation } from 'lucide-react';

// Types
interface LivreurStats {
  totalDeliveries: number;
  completedToday: number;
  rating: number;
  earnings: number;
  onTimeRate: number;
}

interface Livraison {
  id: string;
  trackingNumber: string;
  clientName: string;
  clientPhone: string;
  clientAddress: string;
  destinationAddress: string;
  status: 'pending' | 'pickup' | 'in_transit' | 'delivered';
  paymentStatus: 'pending' | 'paid' | 'failed';
  amount: number;
  createdAt: Date;
  estimatedDelivery?: Date;
}

// StatCard component intégré
const StatCard: React.FC<{
  title: string;
  value: string | number;
  icon: React.ElementType;
  trend?: number;
  color?: 'primary' | 'success' | 'warning' | 'error';
}> = ({ title, value, icon: Icon, trend, color = 'primary' }) => {
  const colorClasses = {
    primary: 'from-primary/10 to-primary/5',
    success: 'from-green-500/10 to-green-500/5',
    warning: 'from-yellow-500/10 to-yellow-500/5',
    error: 'from-red-500/10 to-red-500/5',
  };

  return (
    <div className="card-elevated p-6">
      <div className="flex items-center justify-between mb-4">
        <div className={`p-3 rounded-xl bg-gradient-to-br ${colorClasses[color]}`}>
          <Icon className="w-6 h-6" />
        </div>
        {trend !== undefined && (
          <span className={`text-sm font-medium ${trend >= 0 ? 'text-green-500' : 'text-red-500'}`}>
            {trend >= 0 ? '+' : ''}{trend}%
          </span>
        )}
      </div>
      <h3 className="text-2xl font-bold font-display">{value}</h3>
      <p className="text-sm text-muted-foreground mt-1">{title}</p>
    </div>
  );
};

const DashboardLivreur: React.FC = () => {
  const [stats, setStats] = useState<LivreurStats | null>(null);
  const [currentDeliveries, setCurrentDeliveries] = useState<Livraison[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Simuler le chargement des données
    setTimeout(() => {
      setStats({
        totalDeliveries: 342,
        completedToday: 5,
        rating: 4.8,
        earnings: 2840,
        onTimeRate: 98,
      });
      
      setCurrentDeliveries([
        {
          id: '1',
          trackingNumber: 'TRK-001',
          clientName: 'Marie Martin',
          clientPhone: '+33 6 12 34 56 78',
          clientAddress: '15 Rue de la Paix, 75002 Paris',
          destinationAddress: '45 Avenue des Champs-Élysées, 75008 Paris',
          status: 'pickup',
          paymentStatus: 'paid',
          amount: 25.90,
          createdAt: new Date(),
          estimatedDelivery: new Date(Date.now() + 3600000),
        },
        {
          id: '2',
          trackingNumber: 'TRK-002',
          clientName: 'Thomas Bernard',
          clientPhone: '+33 6 23 45 67 89',
          clientAddress: '8 Boulevard Saint-Germain, 75005 Paris',
          destinationAddress: '12 Rue de Rivoli, 75004 Paris',
          status: 'in_transit',
          paymentStatus: 'paid',
          amount: 32.50,
          createdAt: new Date(),
          estimatedDelivery: new Date(Date.now() + 7200000),
        },
        {
          id: '3',
          trackingNumber: 'TRK-003',
          clientName: 'Sophie Dubois',
          clientPhone: '+33 6 34 56 78 90',
          clientAddress: '23 Rue Monge, 75005 Paris',
          destinationAddress: '78 Rue de Sèvres, 75007 Paris',
          status: 'pending',
          paymentStatus: 'paid',
          amount: 18.75,
          createdAt: new Date(),
          estimatedDelivery: new Date(Date.now() + 10800000),
        },
      ]);
      setLoading(false);
    }, 1000);
  }, []);

  const getStatusBadge = (status: string) => {
    const config: Record<string, { label: string; color: string }> = {
      pending: { label: 'En attente', color: 'bg-yellow-500/10 text-yellow-600' },
      pickup: { label: 'À prendre', color: 'bg-blue-500/10 text-blue-600' },
      in_transit: { label: 'En transit', color: 'bg-purple-500/10 text-purple-600' },
      delivered: { label: 'Livrée', color: 'bg-green-500/10 text-green-600' },
    };
    const statusConfig = config[status] || config.pending;
    return <span className={`badge ${statusConfig.color}`}>{statusConfig.label}</span>;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full min-h-[400px]">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-muted-foreground">Chargement de votre tableau de bord...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-fade-up">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-display font-bold tracking-tight">Mon tableau de bord</h1>
        <p className="text-muted-foreground mt-1">Gérez vos livraisons et suivez vos performances</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="Livraisons aujourd'hui"
          value={stats?.completedToday || 0}
          icon={Package}
          trend={12}
          color="primary"
        />
        <StatCard
          title="Note moyenne"
          value={`${stats?.rating || 0}/5`}
          icon={Star}
          trend={5}
          color="success"
        />
        <StatCard
          title="Gains totaux"
          value={`${stats?.earnings.toLocaleString()} €`}
          icon={TrendingUp}
          trend={10}
          color="primary"
        />
        <StatCard
          title="Taux de ponctualité"
          value={`${stats?.onTimeRate || 0}%`}
          icon={Clock}
          trend={3}
          color="success"
        />
      </div>

      {/* Progress Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="card p-6 lg:col-span-2">
          <h3 className="text-lg font-semibold mb-4">Progression du jour</h3>
          <div className="space-y-4">
            <div className="flex justify-between text-sm">
              <span>Progression</span>
              <span className="font-medium">{stats?.completedToday || 0}/8 livraisons</span>
            </div>
            <div className="w-full h-3 bg-muted rounded-full overflow-hidden">
              <div 
                className="h-full bg-gradient-to-r from-primary to-primary/70 rounded-full transition-all duration-500"
                style={{ width: `${((stats?.completedToday || 0) / 8) * 100}%` }}
              />
            </div>
            <div className="flex justify-between text-sm text-muted-foreground">
              <span>✅ {stats?.completedToday || 0} complétées</span>
              <span>⏳ {8 - (stats?.completedToday || 0)} restantes</span>
            </div>
          </div>
        </div>

        <div className="card p-6">
          <h3 className="text-lg font-semibold mb-4">Performance</h3>
          <div className="space-y-3">
            <div className="flex justify-between items-center py-2 border-b border-border">
              <span className="text-sm text-muted-foreground">Livraisons totales</span>
              <span className="font-semibold">{stats?.totalDeliveries || 0}</span>
            </div>
            <div className="flex justify-between items-center py-2 border-b border-border">
              <span className="text-sm text-muted-foreground">Taux de réussite</span>
              <span className="font-semibold text-green-500">{stats?.onTimeRate || 0}%</span>
            </div>
            <div className="flex justify-between items-center py-2">
              <span className="text-sm text-muted-foreground">Note moyenne</span>
              <div className="flex items-center gap-1">
                <Star className="w-4 h-4 text-yellow-500 fill-yellow-500" />
                <span className="font-semibold">{stats?.rating || 0}/5</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Current deliveries map placeholder */}
      <div className="card p-6">
        <h3 className="text-lg font-semibold mb-4">Livraisons en cours</h3>
        <div className="h-80 bg-gradient-to-br from-muted/50 to-muted rounded-lg flex items-center justify-center">
          <div className="text-center">
            <MapPin className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
            <p className="text-muted-foreground">Carte des livraisons</p>
            <p className="text-xs text-muted-foreground mt-1">Intégration Google Maps à venir</p>
          </div>
        </div>
      </div>

      {/* Active deliveries list */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-xl font-semibold">Livraisons à effectuer</h3>
          <button className="btn-outline text-sm">
            Voir toutes
          </button>
        </div>

        {currentDeliveries.map((delivery) => (
          <div key={delivery.id} className="card p-5 hover-lift">
            <div className="flex flex-col lg:flex-row justify-between gap-4">
              <div className="flex-1 space-y-3">
                <div className="flex items-center gap-3 flex-wrap">
                  <span className="font-mono text-sm font-semibold bg-muted px-3 py-1 rounded">
                    #{delivery.trackingNumber}
                  </span>
                  {getStatusBadge(delivery.status)}
                  {delivery.estimatedDelivery && (
                    <span className="text-sm text-muted-foreground">
                      <Clock className="w-3 h-3 inline mr-1" />
                      Livraison estimée: {new Date(delivery.estimatedDelivery).toLocaleTimeString()}
                    </span>
                  )}
                </div>
                
                <div>
                  <p className="font-medium text-lg">{delivery.clientName}</p>
                  <p className="text-sm text-muted-foreground flex items-center gap-2 mt-1">
                    <MapPin className="w-3 h-3" />
                    {delivery.destinationAddress}
                  </p>
                </div>
                
                <div className="flex items-center gap-4">
                  <p className="text-sm font-semibold text-primary">
                    {delivery.amount.toFixed(2)} €
                  </p>
                  <button 
                    className="text-sm text-muted-foreground hover:text-foreground transition-colors flex items-center gap-1"
                    onClick={() => window.location.href = `tel:${delivery.clientPhone}`}
                  >
                    <Phone className="w-3 h-3" />
                    {delivery.clientPhone}
                  </button>
                </div>
              </div>
              
              <div className="flex items-center gap-3">
                <button 
                  className="btn-primary"
                  onClick={() => {
                    window.open(`https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(delivery.destinationAddress)}`);
                  }}
                >
                  <Navigation className="w-4 h-4" />
                  Démarrer
                </button>
                <button className="btn-success">
                  <CheckCircle className="w-4 h-4" />
                  Marquer livrée
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default DashboardLivreur;