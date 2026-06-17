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
  AlertCircle,
  Loader2
} from 'lucide-react';
import api from '@/service/api';
import { toast } from '@/hooks/use-toast';

interface Livraison {
  id: number;
  commande_uuid: string;
  trackingNumber: string;
  clientName: string;
  clientPhone: string;
  clientAddress: string;
  destinationAddress: string;
  status: 'pending' | 'pickup' | 'in_transit' | 'delivered' | 'cancelled';
  amount: number;
  estimatedDelivery: Date;
  createdAt: Date;
  statut_commande: string;
}

interface DashboardStats {
  todayDeliveries: number;
  completedToday: number;
  remainingToday: number;
  totalEarnings: number;
  averageRating: number;
  onTimeRate: number;
  totalDeliveries: number;
}

const DashboardLivreur: React.FC = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [stats, setStats] = useState<DashboardStats>({
    todayDeliveries: 0,
    completedToday: 0,
    remainingToday: 0,
    totalEarnings: 0,
    averageRating: 4.8,
    onTimeRate: 98,
    totalDeliveries: 0
  });

  const [currentDeliveries, setCurrentDeliveries] = useState<Livraison[]>([]);
  const [selectedDelivery, setSelectedDelivery] = useState<Livraison | null>(null);
  const [hoveredCard, setHoveredCard] = useState<string | null>(null);
  const [actionInProgress, setActionInProgress] = useState<number | null>(null);

  // ✅ Récupération des données réelles
  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setIsLoading(true);
      
      // Récupérer les commandes du livreur
      const response = await api.get('/livreur/commandes', {
        params: { per_page: 100 }
      });

      console.log('Données du dashboard:', response.data);

      let commandesData = [];
      if (response.data.data && Array.isArray(response.data.data)) {
        commandesData = response.data.data;
      } else if (Array.isArray(response.data)) {
        commandesData = response.data;
      } else {
        commandesData = [];
      }

      // Transformer les données
      const livraisonsData = commandesData.map((commande: any) => {
        let status: 'pending' | 'pickup' | 'in_transit' | 'delivered' | 'cancelled' = 'pending';
        
        switch (commande.statut) {
          case 'en_attente':
            status = 'pending';
            break;
          case 'payee':
            status = 'pickup';
            break;
          case 'expediee':
          case 'en_traitement':
            status = 'in_transit';
            break;
          case 'terminee':
            status = 'delivered';
            break;
          case 'annulee':
            status = 'cancelled';
            break;
          default:
            status = 'pending';
        }

        const clientName = commande.utilisateur 
          ? `${commande.utilisateur.prenom || ''} ${commande.utilisateur.nom || ''}`.trim() || 'Client inconnu'
          : 'Client inconnu';
        
        const clientPhone = commande.utilisateur?.telephone || 'Téléphone non disponible';
        const clientEmail = commande.utilisateur?.email || 'Email non disponible';

        const adresseLivraison = commande.adresse_livraison || 'Adresse non disponible';
        const createdAt = new Date(commande.date_creation);
        const estimatedDelivery = new Date(createdAt);
        estimatedDelivery.setDate(estimatedDelivery.getDate() + 7);

        return {
          id: commande.id,
          commande_uuid: commande.commande_uuid,
          trackingNumber: commande.commande_uuid,
          clientName: clientName,
          clientPhone: clientPhone,
          clientAddress: clientEmail,
          destinationAddress: adresseLivraison,
          status: status,
          amount: parseFloat(commande.total) || 0,
          estimatedDelivery: estimatedDelivery,
          createdAt: createdAt,
          statut_commande: commande.statut,
        };
      });

      setCurrentDeliveries(livraisonsData);

      // ✅ Calculer les statistiques
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      const todayDeliveries = livraisonsData.filter((l: Livraison) => {
        const deliveryDate = new Date(l.createdAt);
        deliveryDate.setHours(0, 0, 0, 0);
        return deliveryDate.getTime() === today.getTime();
      });

      const completedToday = todayDeliveries.filter((l: Livraison) => l.status === 'delivered').length;
      const totalDeliveries = livraisonsData.length;
      const deliveredDeliveries = livraisonsData.filter((l: Livraison) => l.status === 'delivered');
      
      // Calcul des gains totaux (uniquement les livrées)
      const totalEarnings = deliveredDeliveries.reduce((sum: number, l: Livraison) => sum + l.amount, 0);
      
      // Calcul du taux de ponctualité (simulé pour l'instant)
      const onTimeRate = totalDeliveries > 0 ? Math.round((deliveredDeliveries.length / totalDeliveries) * 100) : 0;

      setStats({
        todayDeliveries: todayDeliveries.length,
        completedToday: completedToday,
        remainingToday: todayDeliveries.length - completedToday,
        totalEarnings: totalEarnings,
        averageRating: 4.8, // À remplacer par des données réelles si disponibles
        onTimeRate: onTimeRate,
        totalDeliveries: totalDeliveries
      });

    } catch (error: any) {
      console.error('Erreur chargement dashboard:', error);
      toast({
        title: 'Erreur',
        description: 'Impossible de charger les données du tableau de bord',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  // ✅ Fonction pour marquer comme livrée
  const marquerLivree = async (commande_uuid: string) => {
    try {
      setActionInProgress(commande_uuid as any);

      const response = await api.patch(
        `/livreur/commandes/${commande_uuid}/statut`,
        {
          statut: 'terminee',
        }
      );

      if (response.data.success) {
        toast({
          title: '✅ Livraison confirmée',
          description: `La commande ${commande_uuid} a été marquée comme livrée`,
        });
        await fetchDashboardData();
      } else {
        throw new Error(response.data.message || 'Erreur lors de la mise à jour');
      }
    } catch (error: any) {
      console.error('Erreur marquage livrée:', error);
      toast({
        title: 'Erreur',
        description: error?.response?.data?.message || 'Impossible de marquer comme livrée',
        variant: 'destructive',
      });
    } finally {
      setActionInProgress(null);
    }
  };

  const getTimeRemaining = (date: Date) => {
    const diff = date.getTime() - Date.now();
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    if (hours > 0) return `${hours}h ${minutes}min`;
    if (minutes > 0) return `${minutes}min`;
    return "Très bientôt";
  };

  const getStatusBadge = (status: string) => {
    const config: Record<string, { label: string; bg: string; text: string; icon: any }> = {
      pending: { label: 'En attente', bg: 'bg-amber-500/10', text: 'text-amber-600', icon: Clock },
      pickup: { label: 'À prendre', bg: 'bg-blue-500/10', text: 'text-blue-600', icon: MapPin },
      in_transit: { label: 'En transit', bg: 'bg-purple-500/10', text: 'text-purple-600', icon: Navigation },
      delivered: { label: 'Livrée', bg: 'bg-emerald-500/10', text: 'text-emerald-600', icon: CheckCircle },
      cancelled: { label: 'Annulée', bg: 'bg-red-500/10', text: 'text-red-600', icon: AlertCircle }
    };
    const StatusIcon = config[status]?.icon || Package;
    return (
      <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${config[status]?.bg} ${config[status]?.text}`}>
        <StatusIcon className="w-3 h-3" />
        {config[status]?.label || status}
      </span>
    );
  };

  const StatCard = ({ title, value, icon: Icon, color, trend, subtitle }: any) => (
    <div className="group relative overflow-hidden rounded-xl bg-gradient-to-br from-card to-card/50 border border-border/50 p-5 hover:shadow-lg transition-all duration-300 hover:-translate-y-1">
      <div className={`absolute inset-0 bg-gradient-to-br ${color} opacity-0 group-hover:opacity-10 transition-opacity duration-300`} />
      <div className="relative z-10">
        <div className="flex items-center justify-between mb-3">
          <div className={`p-2.5 rounded-xl bg-gradient-to-br ${color} shadow-md group-hover:scale-110 transition-transform duration-300`}>
            <Icon className="w-5 h-5 text-white" />
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

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center py-20">
        <Loader2 className="h-12 w-12 animate-spin text-primary mb-4" />
        <p className="text-muted-foreground">Chargement du tableau de bord...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-up">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center gap-3 mb-1.5">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary to-primary/80 flex items-center justify-center shadow-md">
              <Zap className="w-5 h-5 text-white" />
            </div>
            <h1 className="text-2xl md:text-3xl font-display font-bold tracking-tight">
              Tableau de bord
            </h1>
          </div>
          <p className="text-sm text-muted-foreground">
            {currentDeliveries.length > 0 
              ? `Vous avez ${currentDeliveries.length} livraison${currentDeliveries.length > 1 ? 's' : ''} à effectuer`
              : 'Aucune livraison en cours'}
          </p>
        </div>
        <div className="flex items-center gap-3">
          <div className={`flex items-center gap-2 px-3 py-1.5 rounded-full border ${currentDeliveries.length > 0 ? 'bg-emerald-500/10 border-emerald-500/20' : 'bg-muted/20 border-border/50'}`}>
            <div className="relative">
              <div className={`w-2 h-2 rounded-full animate-ping ${currentDeliveries.length > 0 ? 'bg-emerald-500' : 'bg-muted-foreground'}`}></div>
              <div className={`w-2 h-2 rounded-full ${currentDeliveries.length > 0 ? 'bg-emerald-500' : 'bg-muted-foreground'}`}></div>
            </div>
            <span className={`text-xs font-medium ${currentDeliveries.length > 0 ? 'text-emerald-600' : 'text-muted-foreground'}`}>
              {currentDeliveries.length > 0 ? 'En service' : 'Disponible'}
            </span>
          </div>
          <div className="flex items-center gap-2 px-3 py-1.5 bg-card/50 rounded-full border border-border/50">
            <Calendar className="w-4 h-4 text-muted-foreground" />
            <span className="text-sm font-medium">
              {new Date().toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' })}
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
          trend={stats.todayDeliveries > 0 ? 12 : 0}
          subtitle={`${stats.completedToday} complétées`}
        />
        <StatCard
          title="Gains totaux"
          value={`${stats.totalEarnings.toLocaleString()} Ar`}
          icon={DollarSign}
          color="from-emerald-500/20 to-emerald-500/10"
          trend={stats.totalEarnings > 0 ? 8 : 0}
          subtitle="Toutes commandes confondues"
        />
        <StatCard
          title="Note moyenne"
          value={`${stats.averageRating}/5`}
          icon={Star}
          color="from-amber-500/20 to-amber-500/10"
          subtitle="⭐ À venir"
        />
        <StatCard
          title="Taux de ponctualité"
          value={`${stats.onTimeRate}%`}
          icon={Award}
          color="from-purple-500/20 to-purple-500/10"
          trend={stats.onTimeRate > 50 ? 5 : 0}
          subtitle={stats.onTimeRate > 80 ? "Excellent" : "En progression"}
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
                  {stats.todayDeliveries > 0 
                    ? Math.round((stats.completedToday / stats.todayDeliveries) * 100) 
                    : 0}%
                </span>
              </div>
              <div className="relative w-full h-3 bg-muted/50 rounded-full overflow-hidden">
                <div 
                  className="absolute h-full bg-gradient-to-r from-primary to-primary/70 rounded-full transition-all duration-700"
                  style={{ 
                    width: stats.todayDeliveries > 0 
                      ? `${(stats.completedToday / stats.todayDeliveries) * 100}%` 
                      : '0%' 
                  }}
                />
              </div>
            </div>
            
            <div className="grid grid-cols-3 gap-4">
              {[
                { label: 'Complétées', value: stats.completedToday, color: 'emerald', icon: CheckCircle },
                { label: 'Restantes', value: stats.remainingToday, color: 'amber', icon: Clock },
                { label: 'Taux', value: `${stats.todayDeliveries > 0 ? Math.round((stats.completedToday / stats.todayDeliveries) * 100) : 0}%`, color: 'primary', icon: Target }
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
              { label: 'Gain moyen', value: `${stats.totalDeliveries > 0 ? (stats.totalEarnings / stats.totalDeliveries).toFixed(2) : 0} Ar`, icon: DollarSign, color: 'emerald' }
            ].map((item) => (
              <div key={item.label} className="flex items-center justify-between py-2 border-b border-border/50 last:border-0 group">
                <div className="flex items-center gap-2">
                  <item.icon className={`w-4 h-4 text-${item.color}-500 opacity-70 group-hover:opacity-100 transition-opacity`} />
                  <span className="text-sm text-muted-foreground">{item.label}</span>
                </div>
                <div className="flex items-center gap-2">
                  {item.progress !== undefined && (
                    <div className="w-16 h-1.5 bg-muted rounded-full overflow-hidden">
                      <div className={`h-full bg-${item.color}-500 rounded-full`} style={{ width: `${Math.min(item.progress, 100)}%` }} />
                    </div>
                  )}
                  <span className="font-semibold text-sm">
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
              {currentDeliveries.length > 0 
                ? `Vous avez ${currentDeliveries.length} livraison${currentDeliveries.length > 1 ? 's' : ''} à effectuer`
                : 'Aucune livraison en cours'}
            </p>
          </div>
          <button 
            onClick={fetchDashboardData}
            className="group inline-flex items-center gap-1 px-4 py-2 rounded-lg text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-muted/50 transition-all"
          >
            Actualiser
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
                    {delivery.status !== 'delivered' && delivery.status !== 'cancelled' && (
                      <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                        <Clock className="w-3 h-3" />
                        <span>{delivery.estimatedDelivery.toLocaleTimeString()}</span>
                        <span className="text-emerald-600 font-medium">
                          ({getTimeRemaining(delivery.estimatedDelivery)})
                        </span>
                      </div>
                    )}
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
                        <p className="text-sm font-medium truncate">{delivery.destinationAddress}</p>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-4 pt-1">
                    <div className="flex items-center gap-1.5">
                      <span className="text-sm text-muted-foreground">Montant:</span>
                      <span className="text-sm font-semibold text-primary">{delivery.amount.toFixed(2)} Ar</span>
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
                  {delivery.status !== 'delivered' && delivery.status !== 'cancelled' && (
                    <>
                      <button 
                        onClick={() => {
                          const address = encodeURIComponent(delivery.destinationAddress);
                          window.open(`https://www.google.com/maps/dir/?api=1&destination=${address}`);
                        }}
                        className="flex-1 lg:flex-none inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-lg bg-primary text-primary-foreground text-sm font-medium hover:shadow-md hover:-translate-y-0.5 transition-all group"
                      >
                        <Navigation className="w-4 h-4 transition-transform group-hover:translate-x-0.5" />
                        Naviguer
                      </button>
                      <button 
                        onClick={() => marquerLivree(delivery.commande_uuid)}
                        disabled={actionInProgress === delivery.id}
                        className="flex-1 lg:flex-none inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-lg bg-emerald-500 text-white text-sm font-medium hover:shadow-md hover:-translate-y-0.5 transition-all group disabled:opacity-50"
                      >
                        {actionInProgress === delivery.id ? (
                          <Loader2 className="w-4 h-4 animate-spin" />
                        ) : (
                          <CheckCircle className="w-4 h-4 transition-transform group-hover:scale-110" />
                        )}
                        Livrée
                      </button>
                    </>
                  )}
                  {delivery.status === 'delivered' && (
                    <div className="flex-1 lg:flex-none text-center px-5 py-2.5 rounded-lg bg-emerald-500/10 text-emerald-600 text-sm font-medium">
                      <CheckCircle className="w-4 h-4 inline-block mr-2" />
                      Livrée
                    </div>
                  )}
                  {delivery.status === 'cancelled' && (
                    <div className="flex-1 lg:flex-none text-center px-5 py-2.5 rounded-lg bg-red-500/10 text-red-600 text-sm font-medium">
                      <AlertCircle className="w-4 h-4 inline-block mr-2" />
                      Annulée
                    </div>
                  )}
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
                      const address = encodeURIComponent(selectedDelivery.destinationAddress);
                      window.open(`https://www.google.com/maps/dir/?api=1&destination=${address}`);
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