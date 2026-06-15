// src/types/user.types.ts
export type UserRole = 'admin' | 'livreur' | 'client';

export interface User {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  avatar?: string;
  phone: string;
  createdAt: Date;
  updatedAt: Date;
}

// src/types/livraison.types.ts
export type LivraisonStatus = 'pending' | 'pickup' | 'in_transit' | 'delivered' | 'cancelled';
export type PaymentStatus = 'pending' | 'paid' | 'failed';

export interface Livraison {
  id: string;
  trackingNumber: string;
  clientName: string;
  clientPhone: string;
  clientAddress: string;
  destinationAddress: string;
  status: LivraisonStatus;
  paymentStatus: PaymentStatus;
  amount: number;
  livreurId?: string;
  createdAt: Date;
  deliveredAt?: Date;
  estimatedDelivery?: Date;
  notes?: string;
}

// src/types/stats.types.ts
export interface DashboardStats {
  totalDeliveries: number;
  completedDeliveries: number;
  pendingDeliveries: number;
  cancelledDeliveries: number;
  revenue: number;
  averageDeliveryTime: number;
}

export interface LivreurStats {
  totalDeliveries: number;
  completedToday: number;
  rating: number;
  earnings: number;
  onTimeRate: number;
}