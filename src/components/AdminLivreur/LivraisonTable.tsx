// src/components/admin/LivraisonTable.tsx
import React, { useState } from 'react';

import { Eye, MapPin, Clock, CheckCircle, XCircle, Truck } from 'lucide-react';
import { Livraison, LivraisonStatus } from '@/Types/user.types';

interface LivraisonTableProps {
  livraisons: Livraison[];
  onViewDetails: (id: string) => void;
  onUpdateStatus: (id: string, status: LivraisonStatus) => void;
}

const statusConfig = {
  pending: { label: 'En attente', color: 'bg-yellow-500/10 text-yellow-600', icon: Clock },
  pickup: { label: 'Prise en charge', color: 'bg-blue-500/10 text-blue-600', icon: Truck },
  in_transit: { label: 'En transit', color: 'bg-purple-500/10 text-purple-600', icon: MapPin },
  delivered: { label: 'Livrée', color: 'bg-green-500/10 text-green-600', icon: CheckCircle },
  cancelled: { label: 'Annulée', color: 'bg-red-500/10 text-red-600', icon: XCircle },
};

const LivraisonTable: React.FC<LivraisonTableProps> = ({ 
  livraisons, 
  onViewDetails, 
  onUpdateStatus 
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<LivraisonStatus | 'all'>('all');

  const filteredLivraisons = livraisons.filter(livraison => {
    const matchesSearch = livraison.trackingNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          livraison.clientName.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || livraison.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="card p-6">
      <div className="flex flex-col sm:flex-row justify-between gap-4 mb-6">
        <h2 className="text-xl font-display font-bold">Liste des livraisons</h2>
        
        <div className="flex gap-3">
          <input
            type="text"
            placeholder="Rechercher..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="input text-sm"
          />
          
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as LivraisonStatus | 'all')}
            className="input text-sm"
          >
            <option value="all">Tous les statuts</option>
            <option value="pending">En attente</option>
            <option value="pickup">Prise en charge</option>
            <option value="in_transit">En transit</option>
            <option value="delivered">Livrée</option>
            <option value="cancelled">Annulée</option>
          </select>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-border">
              <th className="text-left py-3 px-4 text-sm font-semibold">N° tracking</th>
              <th className="text-left py-3 px-4 text-sm font-semibold">Client</th>
              <th className="text-left py-3 px-4 text-sm font-semibold">Destination</th>
              <th className="text-left py-3 px-4 text-sm font-semibold">Montant</th>
              <th className="text-left py-3 px-4 text-sm font-semibold">Statut</th>
              <th className="text-left py-3 px-4 text-sm font-semibold">Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredLivraisons.map((livraison) => {
              const StatusIcon = statusConfig[livraison.status].icon;
              return (
                <tr key={livraison.id} className="border-b border-border hover:bg-muted/50 transition-colors">
                  <td className="py-3 px-4 font-medium">{livraison.trackingNumber}</td>
                  <td className="py-3 px-4">{livraison.clientName}</td>
                  <td className="py-3 px-4 text-sm text-muted-foreground">
                    {livraison.destinationAddress.substring(0, 30)}...
                  </td>
                  <td className="py-3 px-4 font-medium">{livraison.amount.toFixed(2)} €</td>
                  <td className="py-3 px-4">
                    <span className={`badge ${statusConfig[livraison.status].color}`}>
                      <StatusIcon className="w-3 h-3 mr-1" />
                      {statusConfig[livraison.status].label}
                    </span>
                  </td>
                  <td className="py-3 px-4">
                    <button
                      onClick={() => onViewDetails(livraison.id)}
                      className="p-2 hover:bg-muted rounded-lg transition-colors"
                    >
                      <Eye className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default LivraisonTable;