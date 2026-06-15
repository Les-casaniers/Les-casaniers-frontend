// src/components/ActionLivreur/LivreurPlanning.tsx
import React, { useState } from 'react';
import { 
  Calendar as CalendarIcon, 
  Clock, 
  MapPin, 
  CheckCircle, 
  ChevronLeft, 
  ChevronRight,
  Navigation,
  User,
  Package,
  TrendingUp,
  AlertCircle,
  XCircle,
  Phone
} from 'lucide-react';

interface PlanningItem {
  id: string;
  time: string;
  trackingNumber: string;
  clientName: string;
  clientPhone?: string;
  address: string;
  status: 'scheduled' | 'completed' | 'cancelled';
  estimatedDuration: number;
  amount?: number;
}

const LivreurPlanning: React.FC = () => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedItem, setSelectedItem] = useState<PlanningItem | null>(null);
  const [showModal, setShowModal] = useState(false);
  
  const planningItems: PlanningItem[] = [
    {
      id: '1',
      time: '09:00 - 10:00',
      trackingNumber: 'TRK-2024-001',
      clientName: 'Marie Martin',
      clientPhone: '+33 6 12 34 56 78',
      address: '45 Avenue des Champs-Élysées, 75008 Paris',
      status: 'completed',
      estimatedDuration: 60,
      amount: 25.90
    },
    {
      id: '2',
      time: '10:30 - 11:30',
      trackingNumber: 'TRK-2024-002',
      clientName: 'Thomas Bernard',
      clientPhone: '+33 6 23 45 67 89',
      address: '12 Rue de Rivoli, 75004 Paris',
      status: 'scheduled',
      estimatedDuration: 60,
      amount: 32.50
    },
    {
      id: '3',
      time: '14:00 - 15:00',
      trackingNumber: 'TRK-2024-003',
      clientName: 'Sophie Dubois',
      clientPhone: '+33 6 34 56 78 90',
      address: '78 Rue de Sèvres, 75007 Paris',
      status: 'scheduled',
      estimatedDuration: 60,
      amount: 18.75
    }
  ];

  const goToToday = () => {
    setCurrentDate(new Date());
  };

  const goToPreviousDay = () => {
    setCurrentDate(new Date(currentDate.setDate(currentDate.getDate() - 1)));
  };

  const goToNextDay = () => {
    setCurrentDate(new Date(currentDate.setDate(currentDate.getDate() + 1)));
  };

  const getStatusConfig = (status: string) => {
    switch(status) {
      case 'completed':
        return { 
          label: 'Complétée', 
          bg: 'bg-emerald-500/10', 
          text: 'text-emerald-600', 
          icon: CheckCircle,
          border: 'border-emerald-500/20'
        };
      case 'cancelled':
        return { 
          label: 'Annulée', 
          bg: 'bg-red-500/10', 
          text: 'text-red-600', 
          icon: XCircle,
          border: 'border-red-500/20'
        };
      default:
        return { 
          label: 'Planifiée', 
          bg: 'bg-blue-500/10', 
          text: 'text-blue-600', 
          icon: Clock,
          border: 'border-blue-500/20'
        };
    }
  };

  const getTimeOfDay = (timeRange: string) => {
    const hour = parseInt(timeRange.split('-')[0].trim().split(':')[0]);
    if (hour < 12) return 'Matin';
    if (hour < 14) return 'Midi';
    if (hour < 18) return 'Après-midi';
    return 'Soirée';
  };

  const stats = {
    total: planningItems.length,
    completed: planningItems.filter(i => i.status === 'completed').length,
    scheduled: planningItems.filter(i => i.status === 'scheduled').length,
    totalEarnings: planningItems.reduce((sum, i) => sum + (i.amount || 0), 0)
  };

  return (
    <div className="space-y-5 animate-fade-up">
      {/* Header */}
      <div>
        <h1 className="text-xl md:text-2xl font-display font-bold tracking-tight">Planning des tournées</h1>
        <p className="text-sm text-muted-foreground mt-1">Visualisez et organisez vos livraisons</p>
      </div>

      {/* Calendar Navigation */}
      <div className="rounded-xl bg-gradient-to-br from-card to-card/50 border border-border/50 p-4">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <button 
              onClick={goToPreviousDay}
              className="p-2 rounded-lg hover:bg-muted/50 transition-all duration-200 hover:scale-105"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            <div className="text-center min-w-[200px]">
              <p className="text-base font-semibold capitalize">
                {currentDate.toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long' })}
              </p>
            </div>
            <button 
              onClick={goToNextDay}
              className="p-2 rounded-lg hover:bg-muted/50 transition-all duration-200 hover:scale-105"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>
          <button 
            onClick={goToToday}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-primary text-primary-foreground text-sm font-medium hover:shadow-md hover:-translate-y-0.5 transition-all"
          >
            <CalendarIcon className="w-4 h-4" />
            Aujourd'hui
          </button>
        </div>
      </div>

      {/* Stats Summary */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <div className="rounded-xl bg-gradient-to-br from-card to-card/50 border border-border/50 p-3">
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded-lg bg-primary/10">
              <Package className="w-4 h-4 text-primary" />
            </div>
            <div>
              <p className="text-xl font-bold">{stats.total}</p>
              <p className="text-[11px] text-muted-foreground">Total livraisons</p>
            </div>
          </div>
        </div>
        <div className="rounded-xl bg-gradient-to-br from-card to-card/50 border border-border/50 p-3">
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded-lg bg-emerald-500/10">
              <CheckCircle className="w-4 h-4 text-emerald-500" />
            </div>
            <div>
              <p className="text-xl font-bold text-emerald-600">{stats.completed}</p>
              <p className="text-[11px] text-muted-foreground">Complétées</p>
            </div>
          </div>
        </div>
        <div className="rounded-xl bg-gradient-to-br from-card to-card/50 border border-border/50 p-3">
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded-lg bg-blue-500/10">
              <Clock className="w-4 h-4 text-blue-500" />
            </div>
            <div>
              <p className="text-xl font-bold text-blue-600">{stats.scheduled}</p>
              <p className="text-[11px] text-muted-foreground">Restantes</p>
            </div>
          </div>
        </div>
        <div className="rounded-xl bg-gradient-to-br from-card to-card/50 border border-border/50 p-3">
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded-lg bg-primary/10">
              <TrendingUp className="w-4 h-4 text-primary" />
            </div>
            <div>
              <p className="text-xl font-bold">{stats.totalEarnings.toFixed(0)} €</p>
              <p className="text-[11px] text-muted-foreground">Gains estimés</p>
            </div>
          </div>
        </div>
      </div>

      {/* Timeline */}
      <div className="space-y-3">
        {planningItems.map((item, index) => {
          const statusConfig = getStatusConfig(item.status);
          const StatusIcon = statusConfig.icon;
          const timeOfDay = getTimeOfDay(item.time);
          
          return (
            <div 
              key={item.id} 
              className="group rounded-xl bg-gradient-to-br from-card to-card/50 border border-border/50 overflow-hidden hover:border-primary/30 transition-all duration-300 hover:-translate-y-0.5"
              style={{ animationDelay: `${index * 100}ms` }}
            >
              <div className="p-4">
                <div className="flex flex-col lg:flex-row justify-between gap-4">
                  {/* Time section */}
                  <div className="flex items-start gap-3 min-w-[120px]">
                    <div className="p-2 rounded-lg bg-primary/10">
                      <Clock className="w-4 h-4 text-primary" />
                    </div>
                    <div>
                      <p className="text-sm font-semibold">{item.time}</p>
                      <p className="text-[10px] text-muted-foreground">{timeOfDay}</p>
                    </div>
                  </div>

                  {/* Content section */}
                  <div className="flex-1 space-y-2">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="font-mono text-xs font-semibold bg-muted/50 px-2 py-0.5 rounded">
                        #{item.trackingNumber}
                      </span>
                      <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-medium ${statusConfig.bg} ${statusConfig.text}`}>
                        <StatusIcon className="w-2.5 h-2.5" />
                        {statusConfig.label}
                      </span>
                      <span className="text-[10px] text-muted-foreground">
                        Durée: {item.estimatedDuration} min
                      </span>
                    </div>
                    
                    <div>
                      <p className="text-sm font-medium flex items-center gap-1.5">
                        <User className="w-3.5 h-3.5 text-muted-foreground" />
                        {item.clientName}
                      </p>
                      <p className="text-xs text-muted-foreground flex items-center gap-1.5 mt-1">
                        <MapPin className="w-3 h-3" />
                        {item.address}
                      </p>
                      {item.amount && (
                        <p className="text-xs font-semibold text-primary mt-1.5">
                          {item.amount.toFixed(2)} €
                        </p>
                      )}
                    </div>
                  </div>
                  
                  {/* Action button */}
                  <div className="flex items-center gap-2">
                    {item.status === 'scheduled' && (
                      <>
                        <button 
                          onClick={() => {
                            setSelectedItem(item);
                            setShowModal(true);
                          }}
                          className="flex-1 lg:flex-none inline-flex items-center justify-center gap-1.5 px-4 py-2 rounded-lg bg-primary text-primary-foreground text-xs font-medium hover:shadow-md hover:-translate-y-0.5 transition-all group"
                        >
                          <Navigation className="w-3.5 h-3.5 transition-transform group-hover:translate-x-0.5" />
                          Démarrer
                        </button>
                        <button 
                          onClick={() => window.location.href = `tel:${item.clientPhone}`}
                          className="p-2 rounded-lg border border-border hover:bg-muted/50 transition-all"
                          title="Appeler le client"
                        >
                          <Phone className="w-3.5 h-3.5 text-muted-foreground hover:text-emerald-500 transition-colors" />
                        </button>
                      </>
                    )}
                    {item.status === 'completed' && (
                      <span className="inline-flex items-center gap-1.5 text-xs text-emerald-600">
                        <CheckCircle className="w-4 h-4" />
                        Livrée
                      </span>
                    )}
                  </div>
                </div>
              </div>

              {/* Progress bar */}
              {item.status === 'scheduled' && (
                <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-primary/0 via-primary/30 to-primary/0 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
              )}
            </div>
          );
        })}
      </div>

      {/* Empty state */}
      {planningItems.length === 0 && (
        <div className="rounded-xl bg-gradient-to-br from-card to-card/50 border border-border/50 p-12 text-center">
          <CalendarIcon className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
          <p className="text-sm text-muted-foreground">Aucune livraison planifiée</p>
          <p className="text-xs text-muted-foreground/60 mt-1">Profitez de votre journée !</p>
        </div>
      )}

      {/* Modal de confirmation */}
      {showModal && selectedItem && (
        <div 
          className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-fade-in"
          onClick={() => setShowModal(false)}
        >
          <div 
            className="relative max-w-sm w-full rounded-xl bg-card border border-border/50 animate-scale-in overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-primary to-primary/50" />
            
            <div className="p-5">
              <div className="text-center mb-4">
                <div className="w-12 h-12 mx-auto mb-3 rounded-full bg-primary/10 flex items-center justify-center">
                  <Navigation className="w-6 h-6 text-primary" />
                </div>
                <h3 className="text-base font-semibold">Démarrer la livraison</h3>
                <p className="text-xs text-muted-foreground mt-1">
                  #{selectedItem.trackingNumber} - {selectedItem.time}
                </p>
              </div>
              
              <div className="space-y-3">
                <div className="p-3 rounded-lg bg-muted/20">
                  <p className="text-xs text-muted-foreground mb-1">Client</p>
                  <p className="text-sm font-medium">{selectedItem.clientName}</p>
                  <p className="text-xs text-muted-foreground mt-1">{selectedItem.address}</p>
                </div>
                
                <div className="p-3 rounded-lg bg-amber-500/10 border border-amber-500/20">
                  <p className="text-xs text-amber-600 font-medium mb-1 flex items-center gap-1.5">
                    <AlertCircle className="w-3 h-3" />
                    Information
                  </p>
                  <p className="text-xs text-muted-foreground">
                    La navigation va s'ouvrir dans Google Maps
                  </p>
                </div>
                
                <div className="flex gap-3 pt-2">
                  <button 
                    onClick={() => setShowModal(false)}
                    className="flex-1 px-3 py-1.5 rounded-lg border border-border text-xs font-medium hover:bg-muted/30 transition"
                  >
                    Annuler
                  </button>
                  <button 
                    onClick={() => {
                      window.open(`https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(selectedItem.address)}`);
                      setShowModal(false);
                    }}
                    className="flex-1 inline-flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-lg bg-primary text-primary-foreground text-xs font-medium hover:shadow-md transition-all group"
                  >
                    <Navigation className="w-3.5 h-3.5 transition-transform group-hover:translate-x-0.5" />
                    Naviguer
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
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-fade-up { animation: fade-up 0.3s ease-out both; }

        @keyframes scale-in {
          from { opacity: 0; transform: scale(0.96); }
          to { opacity: 1; transform: scale(1); }
        }
        .animate-scale-in { animation: scale-in 0.2s ease-out both; }
      `}</style>
    </div>
  );
};

export default LivreurPlanning;