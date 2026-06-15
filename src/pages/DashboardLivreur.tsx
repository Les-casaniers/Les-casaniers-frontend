// src/pages/DashboardLivreur.tsx
import React, { useState, useEffect } from 'react';
import { 
  Package, 
  CheckCircle, 
  Clock, 
  TrendingUp, 
  Star, 
  MapPin,
  Navigation,
  Phone,
  User,
  DollarSign,
  Award,
  Calendar,
  ChevronRight,
  Zap,
  Battery,
  Target,
  AlertCircle
} from 'lucide-react';

interface Livraison {
  id: string;
  trackingNumber: string;
  clientName: string;
  clientPhone: string;
  clientAddress: string;
  destinationAddress: string;
  status: 'pending' | 'pickup' | 'in_transit' | 'delivered';
  amount: number;
  estimatedDelivery: Date;
}

const DashboardLivreur: React.FC = () => {
  const [stats, setStats] = useState({
    todayDeliveries: 8,
    completedToday: 3,
    remainingToday: 5,
    totalEarnings: 2840,
    averageRating: 4.8,
    onTimeRate: 98,
    totalDeliveries: 342
  });

  const [currentDeliveries, setCurrentDeliveries] = useState<Livraison[]>([
    {
      id: '1',
      trackingNumber: 'TRK-2024-001',
      clientName: 'Marie Martin',
      clientPhone: '+33 6 12 34 56 78',
      clientAddress: '15 Rue de la Paix, 75002 Paris',
      destinationAddress: '45 Avenue des Champs-Élysées, 75008 Paris',
      status: 'pickup',
      amount: 25.90,
      estimatedDelivery: new Date(Date.now() + 3600000)
    },
    {
      id: '2',
      trackingNumber: 'TRK-2024-002',
      clientName: 'Thomas Bernard',
      clientPhone: '+33 6 23 45 67 89',
      clientAddress: '8 Boulevard Saint-Germain, 75005 Paris',
      destinationAddress: '12 Rue de Rivoli, 75004 Paris',
      status: 'in_transit',
      amount: 32.50,
      estimatedDelivery: new Date(Date.now() + 7200000)
    },
    {
      id: '3',
      trackingNumber: 'TRK-2024-003',
      clientName: 'Sophie Dubois',
      clientPhone: '+33 6 34 56 78 90',
      clientAddress: '23 Rue Monge, 75005 Paris',
      destinationAddress: '78 Rue de Sèvres, 75007 Paris',
      status: 'pending',
      amount: 18.75,
      estimatedDelivery: new Date(Date.now() + 10800000)
    }
  ]);

  const [selectedDelivery, setSelectedDelivery] = useState<Livraison | null>(null);
  const [hoveredCard, setHoveredCard] = useState<string | null>(null);

  const getTimeRemaining = (date: Date) => {
    const diff = date.getTime() - Date.now();
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    if (hours > 0) return `${hours}h ${minutes}min`;
    return `${minutes}min`;
  };

  const StatCard = ({ title, value, icon: Icon, color, trend, subtitle }: any) => (
    <div className="group relative overflow-hidden rounded-xl bg-gradient-to-br from-card to-card/50 border border-border/50 p-5 hover:shadow-lg transition-all duration-300 hover:-translate-y-1">
      <div className={`absolute inset-0 bg-gradient-to-br ${color} opacity-0 group-hover:opacity-10 transition-opacity duration-300`} />
      <div className="relative z-10">
        <div className="flex items-center justify-between mb-3">
          <div className={`p-2.5 rounded-xl bg-gradient-to-br ${color} shadow-md group-hover:scale-110 transition-transform duration-300`}>
            <Icon className="w-5 h-5" />
          </div>
          {trend !== undefined && (
            <div className={`flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium backdrop-blur-sm ${
              trend >= 0 ? 'bg-emerald-500/10 text-emerald-600' : 'bg-red-500/10 text-red-600'
            }`}>
              <TrendingUp className={`w-3 h-3 ${trend < 0 ? 'rotate-180' : ''}`} />
              {trend >= 0 ? '+' : ''}{trend}%
            </div>
          )}
        </div>
        <h3 className="text-2xl font-bold font-display tracking-tight">{value}</h3>
        <p className="text-sm text-muted-foreground mt-1">{title}</p>
        {subtitle && (
          <p className="text-xs text-muted-foreground/60 mt-1.5">{subtitle}</p>
        )}
      </div>
    </div>
  );

  const getStatusBadge = (status: string) => {
    const config = {
      pending: { label: 'À prendre', bg: 'bg-amber-500/10', text: 'text-amber-600', icon: Clock },
      pickup: { label: 'Prise en charge', bg: 'bg-blue-500/10', text: 'text-blue-600', icon: MapPin },
      in_transit: { label: 'En transit', bg: 'bg-purple-500/10', text: 'text-purple-600', icon: Navigation },
      delivered: { label: 'Livrée', bg: 'bg-emerald-500/10', text: 'text-emerald-600', icon: CheckCircle }
    };
    const StatusIcon = config[status as keyof typeof config]?.icon || Package;
    return (
      <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${config[status as keyof typeof config]?.bg} ${config[status as keyof typeof config]?.text}`}>
        <StatusIcon className="w-3 h-3" />
        {config[status as keyof typeof config]?.label}
      </span>
    );
  };

  return (
    <div className="space-y-6 animate-fade-up">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center gap-3 mb-1.5">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary to-primary/80 flex items-center justify-center shadow-md">
              <Zap className="w-5 h-5 text-primary-foreground" />
            </div>
            <h1 className="text-2xl md:text-3xl font-display font-bold tracking-tight">
              Bonjour, Jean 👋
            </h1>
          </div>
          <p className="text-sm text-muted-foreground">
            Voici votre tableau de bord personnalisé. Bonne journée !
          </p>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 px-3 py-1.5 bg-emerald-500/10 rounded-full border border-emerald-500/20">
            <div className="relative">
              <div className="w-2 h-2 bg-emerald-500 rounded-full animate-ping absolute"></div>
              <div className="w-2 h-2 bg-emerald-500 rounded-full"></div>
            </div>
            <span className="text-xs font-medium text-emerald-600">En service</span>
          </div>
          <div className="flex items-center gap-2 px-3 py-1.5 bg-card/50 rounded-full border border-border/50">
            <Calendar className="w-4 h-4 text-muted-foreground" />
            <span className="text-sm font-medium">
              {new Date().toLocaleDateString('fr-FR', { day: 'numeric', month: 'long' })}
            </span>
          </div>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Livraisons aujourd'hui"
          value={stats.todayDeliveries}
          icon={Package}
          color="from-primary/20 to-primary/10"
          trend={12}
          subtitle={`${stats.completedToday} complétées`}
        />
        <StatCard
          title="Gains totaux"
          value={`${stats.totalEarnings.toLocaleString()} €`}
          icon={DollarSign}
          color="from-emerald-500/20 to-emerald-500/10"
          trend={8}
          subtitle="Ce mois"
        />
        <StatCard
          title="Note moyenne"
          value={`${stats.averageRating}/5`}
          icon={Star}
          color="from-amber-500/20 to-amber-500/10"
          subtitle="⭐ 128 avis"
        />
        <StatCard
          title="Taux de ponctualité"
          value={`${stats.onTimeRate}%`}
          icon={Award}
          color="from-purple-500/20 to-purple-500/10"
          trend={5}
          subtitle="Excellent"
        />
      </div>

      {/* Progress Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        <div className="lg:col-span-2 rounded-xl bg-gradient-to-br from-card to-card/50 border border-border/50 p-5">
          <div className="flex items-center justify-between mb-5">
            <div className="flex items-center gap-2">
              <Target className="w-5 h-5 text-primary" />
              <h3 className="text-base font-semibold">Progression du jour</h3>
            </div>
            <div className="flex items-center gap-2 text-sm">
              <span className="text-muted-foreground">Objectif:</span>
              <span className="font-semibold text-primary">{stats.todayDeliveries} livraisons</span>
            </div>
          </div>
          
          <div className="space-y-5">
            <div>
              <div className="flex justify-between text-sm mb-2">
                <span className="font-medium">Progression</span>
                <span className="font-semibold text-primary">
                  {((stats.completedToday / stats.todayDeliveries) * 100).toFixed(0)}%
                </span>
              </div>
              <div className="relative w-full h-3 bg-muted/50 rounded-full overflow-hidden">
                <div 
                  className="absolute h-full bg-gradient-to-r from-primary to-primary/70 rounded-full transition-all duration-700"
                  style={{ width: `${(stats.completedToday / stats.todayDeliveries) * 100}%` }}
                />
              </div>
            </div>
            
            <div className="grid grid-cols-3 gap-4">
              {[
                { label: 'Complétées', value: stats.completedToday, color: 'emerald', icon: CheckCircle },
                { label: 'Restantes', value: stats.remainingToday, color: 'amber', icon: Clock },
                { label: 'Taux', value: `${((stats.completedToday / stats.todayDeliveries) * 100).toFixed(0)}%`, color: 'primary', icon: Target }
              ].map((item) => (
                <div key={item.label} className="p-3 rounded-xl bg-gradient-to-br from-muted/30 to-muted/10 text-center group hover:scale-105 transition-transform duration-300">
                  <item.icon className={`w-5 h-5 text-${item.color}-500 mx-auto mb-2 opacity-70 group-hover:opacity-100 transition-opacity`} />
                  <p className="text-2xl font-bold">{item.value}</p>
                  <p className="text-xs text-muted-foreground">{item.label}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="rounded-xl bg-gradient-to-br from-card to-card/50 border border-border/50 p-5">
          <h3 className="text-base font-semibold mb-4 flex items-center gap-2">
            <Battery className="w-5 h-5 text-primary" />
            Performance globale
          </h3>
          <div className="space-y-4">
            {[
              { label: 'Livraisons totales', value: stats.totalDeliveries, icon: Package, color: 'primary' },
              { label: 'Note moyenne', value: `${stats.averageRating}/5`, icon: Star, color: 'amber' },
              { label: 'Taux de réussite', value: `${stats.onTimeRate}%`, icon: Award, color: 'emerald', progress: stats.onTimeRate },
              { label: 'Gain moyen', value: `${(stats.totalEarnings / stats.totalDeliveries).toFixed(2)} €`, icon: DollarSign, color: 'emerald' }
            ].map((item) => (
              <div key={item.label} className="flex items-center justify-between py-2 border-b border-border/50 last:border-0 group">
                <div className="flex items-center gap-2">
                  <item.icon className={`w-4 h-4 text-${item.color}-500 opacity-70 group-hover:opacity-100 transition-opacity`} />
                  <span className="text-sm text-muted-foreground">{item.label}</span>
                </div>
                <div className="flex items-center gap-2">
                  {item.progress && (
                    <div className="w-16 h-1.5 bg-muted rounded-full overflow-hidden">
                      <div className={`h-full bg-${item.color}-500 rounded-full`} style={{ width: `${item.progress}%` }} />
                    </div>
                  )}
                  <span className="font-semibold text-sm flex items-center gap-1">
                    {item.star && <Star className="w-3 h-3 fill-amber-500 text-amber-500" />}
                    {item.value}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Current Deliveries */}
      <div className="rounded-xl bg-gradient-to-br from-card to-card/50 border border-border/50 overflow-hidden">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 p-5 border-b border-border/50">
          <div>
            <h3 className="text-lg font-semibold">Livraisons en cours</h3>
            <p className="text-sm text-muted-foreground mt-1">
              Vous avez {currentDeliveries.length} livraison{currentDeliveries.length > 1 ? 's' : ''} à effectuer
            </p>
          </div>
          <button className="group inline-flex items-center gap-1 px-4 py-2 rounded-lg text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-muted/50 transition-all">
            Voir toutes
            <ChevronRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
          </button>
        </div>

        <div className="divide-y divide-border/50">
          {currentDeliveries.map((delivery, index) => (
            <div 
              key={delivery.id} 
              className={`p-5 transition-all duration-300 hover:bg-muted/20 relative ${hoveredCard === delivery.id ? 'bg-gradient-to-r from-primary/5 to-transparent' : ''}`}
              onMouseEnter={() => setHoveredCard(delivery.id)}
              onMouseLeave={() => setHoveredCard(null)}
            >
              <div className="flex flex-col lg:flex-row justify-between gap-4">
                <div className="flex-1 space-y-3">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="font-mono text-xs font-semibold bg-muted/80 px-2.5 py-1 rounded-lg">
                      #{delivery.trackingNumber}
                    </span>
                    {getStatusBadge(delivery.status)}
                    <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                      <Clock className="w-3 h-3" />
                      <span>{delivery.estimatedDelivery.toLocaleTimeString()}</span>
                      <span className="text-emerald-600 font-medium">
                        ({getTimeRemaining(delivery.estimatedDelivery)})
                      </span>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div className="flex items-start gap-2 p-2 rounded-lg bg-muted/20">
                      <User className="w-4 h-4 text-muted-foreground mt-0.5 flex-shrink-0" />
                      <div className="min-w-0">
                        <p className="text-sm font-medium truncate">{delivery.clientName}</p>
                        <p className="text-xs text-muted-foreground truncate">{delivery.clientPhone}</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-2 p-2 rounded-lg bg-muted/20">
                      <MapPin className="w-4 h-4 text-muted-foreground mt-0.5 flex-shrink-0" />
                      <div className="min-w-0">
                        <p className="text-xs text-muted-foreground">Destination</p>
                        <p className="text-sm font-medium truncate">{delivery.destinationAddress.split(',')[0]}</p>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-4 pt-1">
                    <div className="flex items-center gap-1.5">
                      <span className="text-sm text-muted-foreground">Montant:</span>
                      <span className="text-sm font-semibold text-primary">{delivery.amount.toFixed(2)} €</span>
                    </div>
                    <button 
                      onClick={() => window.location.href = `tel:${delivery.clientPhone}`}
                      className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-primary transition-colors"
                    >
                      <Phone className="w-3.5 h-3.5" />
                      <span className="hidden sm:inline">Appeler</span>
                    </button>
                  </div>
                </div>
                
                <div className="flex items-center gap-3 pt-3 lg:pt-0 border-t lg:border-t-0 border-border/50">
                  <button 
                    onClick={() => setSelectedDelivery(delivery)}
                    className="flex-1 lg:flex-none inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-lg bg-primary text-primary-foreground text-sm font-medium hover:shadow-md hover:-translate-y-0.5 transition-all group"
                  >
                    <Navigation className="w-4 h-4 transition-transform group-hover:translate-x-0.5" />
                    Démarrer
                  </button>
                  <button 
                    className="flex-1 lg:flex-none inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-lg bg-emerald-500 text-white text-sm font-medium hover:shadow-md hover:-translate-y-0.5 transition-all group"
                    onClick={() => console.log('Marquer livrée:', delivery.id)}
                  >
                    <CheckCircle className="w-4 h-4 transition-transform group-hover:scale-110" />
                    Livrée
                  </button>
                </div>
              </div>

              <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-primary/0 via-primary/30 to-primary/0 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
            </div>
          ))}
        </div>

        {currentDeliveries.length === 0 && (
          <div className="text-center py-12">
            <CheckCircle className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
            <p className="text-sm text-muted-foreground">Aucune livraison en cours</p>
            <p className="text-xs text-muted-foreground/60 mt-1">Toutes vos livraisons sont terminées !</p>
          </div>
        )}
      </div>

      {/* Modal */}
      {selectedDelivery && (
        <div 
          className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-fade-in"
          onClick={() => setSelectedDelivery(null)}
        >
          <div 
            className="relative max-w-md w-full rounded-xl bg-card border border-border/50 animate-scale-in overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-primary to-primary/50" />
            
            <div className="p-5">
              <div className="text-center mb-5">
                <div className="w-14 h-14 mx-auto mb-3 rounded-full bg-primary/10 flex items-center justify-center">
                  <Navigation className="w-7 h-7 text-primary" />
                </div>
                <h3 className="text-lg font-semibold">Démarrer la livraison</h3>
                <p className="text-sm text-muted-foreground mt-1">
                  #{selectedDelivery.trackingNumber}
                </p>
              </div>
              
              <div className="space-y-4">
                <div className="p-3 rounded-lg bg-muted/20">
                  <p className="text-xs text-muted-foreground uppercase tracking-wider mb-1.5">Adresse de livraison</p>
                  <p className="text-sm font-medium">{selectedDelivery.destinationAddress}</p>
                  <div className="flex items-center gap-2 mt-2 text-xs text-muted-foreground">
                    <Clock className="w-3 h-3" />
                    <span>Estimation: {selectedDelivery.estimatedDelivery.toLocaleTimeString()}</span>
                    <span className="text-emerald-600 font-medium">
                      ({getTimeRemaining(selectedDelivery.estimatedDelivery)})
                    </span>
                  </div>
                </div>
                
                <div className="p-3 rounded-lg bg-amber-500/10 border border-amber-500/20">
                  <p className="text-xs text-amber-600 font-medium mb-1 flex items-center gap-1.5">
                    <AlertCircle className="w-3 h-3" />
                    Information
                  </p>
                  <p className="text-xs text-muted-foreground">
                    Assurez-vous d'avoir bien tous les colis avant de quitter le point de dépôt.
                  </p>
                </div>
                
                <div className="flex gap-3 pt-2">
                  <button 
                    onClick={() => setSelectedDelivery(null)}
                    className="flex-1 px-4 py-2 rounded-lg border border-border text-sm font-medium hover:bg-muted/30 transition"
                  >
                    Annuler
                  </button>
                  <button 
                    onClick={() => {
                      window.open(`https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(selectedDelivery.destinationAddress)}`);
                      setSelectedDelivery(null);
                    }}
                    className="flex-1 inline-flex items-center justify-center gap-2 px-4 py-2 rounded-lg bg-primary text-primary-foreground text-sm font-medium hover:shadow-md transition-all group"
                  >
                    <MapPin className="w-4 h-4 transition-transform group-hover:scale-110" />
                    Ouvrir Maps
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      <style>{`
        @keyframes fade-in {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        .animate-fade-in { animation: fade-in 0.2s ease-out both; }

        @keyframes fade-up {
          from { opacity: 0; transform: translateY(15px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-fade-up { animation: fade-up 0.4s ease-out both; }

        @keyframes scale-in {
          from { opacity: 0; transform: scale(0.96); }
          to { opacity: 1; transform: scale(1); }
        }
        .animate-scale-in { animation: scale-in 0.2s ease-out both; }
      `}</style>
    </div>
  );
};

export default DashboardLivreur;