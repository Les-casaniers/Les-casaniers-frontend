// src/components/ActionLivreur/LivreurStats.tsx
import React from 'react';
import { TrendingUp, Award, DollarSign, Package, Clock, Star, Calendar, MapPin } from 'lucide-react';

const LivreurStats: React.FC = () => {
  const stats = {
    weeklyEarnings: [120, 145, 130, 160, 155, 180, 170],
    weeklyDeliveries: [8, 10, 9, 12, 11, 13, 12],
    monthlyStats: {
      totalDeliveries: 342,
      totalEarnings: 2840,
      averageRating: 4.8,
      onTimeRate: 98,
      distanceCovered: 1240,
      hoursWorked: 168
    }
  };

  return (
    <div className="space-y-6 animate-fade-up">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-display font-bold tracking-tight">Mes statistiques</h1>
        <p className="text-muted-foreground mt-1">Analysez vos performances et votre progression</p>
      </div>

      {/* Monthly Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="card p-6 text-center">
          <Package className="w-8 h-8 text-primary mx-auto mb-3" />
          <p className="text-2xl font-bold">{stats.monthlyStats.totalDeliveries}</p>
          <p className="text-sm text-muted-foreground">Livraisons totales</p>
          <p className="text-xs text-green-500 mt-2">+12% vs mois dernier</p>
        </div>
        <div className="card p-6 text-center">
          <DollarSign className="w-8 h-8 text-green-500 mx-auto mb-3" />
          <p className="text-2xl font-bold">{stats.monthlyStats.totalEarnings.toLocaleString()} €</p>
          <p className="text-sm text-muted-foreground">Gains totaux</p>
          <p className="text-xs text-green-500 mt-2">+8% vs mois dernier</p>
        </div>
        <div className="card p-6 text-center">
          <Star className="w-8 h-8 text-yellow-500 mx-auto mb-3" />
          <p className="text-2xl font-bold">{stats.monthlyStats.averageRating}/5</p>
          <p className="text-sm text-muted-foreground">Note moyenne</p>
          <p className="text-xs text-green-500 mt-2">+0.2 point</p>
        </div>
        <div className="card p-6 text-center">
          <Award className="w-8 h-8 text-purple-500 mx-auto mb-3" />
          <p className="text-2xl font-bold">{stats.monthlyStats.onTimeRate}%</p>
          <p className="text-sm text-muted-foreground">Taux de ponctualité</p>
          <p className="text-xs text-green-500 mt-2">Excellent</p>
        </div>
      </div>

      {/* Additional Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="card p-6">
          <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <Calendar className="w-5 h-5" />
            Performance hebdomadaire
          </h3>
          <div className="space-y-3">
            {stats.weeklyEarnings.map((earning, index) => (
              <div key={index}>
                <div className="flex justify-between text-sm mb-1">
                  <span>Jour {index + 1}</span>
                  <span>{earning} €</span>
                </div>
                <div className="w-full h-2 bg-muted rounded-full overflow-hidden">
                  <div className="h-full bg-primary rounded-full" style={{ width: `${(earning / 200) * 100}%` }} />
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="card p-6">
          <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <MapPin className="w-5 h-5" />
            Informations supplémentaires
          </h3>
          <div className="space-y-4">
            <div className="flex justify-between items-center p-3 bg-muted/30 rounded-lg">
              <span className="text-sm">Distance parcourue</span>
              <span className="font-semibold">{stats.monthlyStats.distanceCovered} km</span>
            </div>
            <div className="flex justify-between items-center p-3 bg-muted/30 rounded-lg">
              <span className="text-sm">Heures travaillées</span>
              <span className="font-semibold">{stats.monthlyStats.hoursWorked} h</span>
            </div>
            <div className="flex justify-between items-center p-3 bg-muted/30 rounded-lg">
              <span className="text-sm">Gain moyen / livraison</span>
              <span className="font-semibold">{(stats.monthlyStats.totalEarnings / stats.monthlyStats.totalDeliveries).toFixed(2)} €</span>
            </div>
            <div className="flex justify-between items-center p-3 bg-muted/30 rounded-lg">
              <span className="text-sm">Gain moyen / heure</span>
              <span className="font-semibold">{(stats.monthlyStats.totalEarnings / stats.monthlyStats.hoursWorked).toFixed(2)} €/h</span>
            </div>
          </div>
        </div>
      </div>

      {/* Performance Chart Placeholder */}
      <div className="card p-6">
        <h3 className="text-lg font-semibold mb-4">Évolution des livraisons</h3>
        <div className="h-64 bg-gradient-to-b from-primary/5 to-transparent rounded-lg flex items-center justify-center">
          <div className="text-center">
            <TrendingUp className="w-12 h-12 text-muted-foreground mx-auto mb-2" />
            <p className="text-muted-foreground">Graphique des performances</p>
            <p className="text-xs text-muted-foreground mt-1">Tendance à la hausse 📈</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LivreurStats;