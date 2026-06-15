// src/components/admin/StatCard.tsx
import React from 'react';
import { LucideIcon } from 'lucide-react';

interface StatCardProps {
  title: string;
  value: string | number;
  icon: LucideIcon;
  trend?: number;
  color?: 'primary' | 'success' | 'warning' | 'error';
}

const StatCard: React.FC<StatCardProps> = ({ 
  title, 
  value, 
  icon: Icon, 
  trend, 
  color = 'primary' 
}) => {
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

export default StatCard;