// src/components/ActionLivreur/LivreurNotifications.tsx
import React, { useState } from 'react';
import { Bell, Package, CheckCircle, AlertCircle, MessageCircle, X } from 'lucide-react';

interface Notification {
  id: string;
  title: string;
  message: string;
  type: 'info' | 'success' | 'warning' | 'error';
  read: boolean;
  createdAt: Date;
}

const LivreurNotifications: React.FC = () => {
  const [notifications, setNotifications] = useState<Notification[]>([
    {
      id: '1',
      title: 'Nouvelle livraison',
      message: 'Une nouvelle livraison vous a été assignée',
      type: 'info',
      read: false,
      createdAt: new Date(Date.now() - 3600000)
    },
    {
      id: '2',
      title: 'Livraison complétée',
      message: 'Félicitations ! Vous avez complété 5 livraisons aujourd\'hui',
      type: 'success',
      read: false,
      createdAt: new Date(Date.now() - 7200000)
    },
    {
      id: '3',
      title: 'Alerte retard',
      message: 'Vous êtes en retard sur votre planning actuel',
      type: 'warning',
      read: true,
      createdAt: new Date(Date.now() - 86400000)
    }
  ]);

  const markAsRead = (id: string) => {
    setNotifications(notifications.map(notif => 
      notif.id === id ? { ...notif, read: true } : notif
    ));
  };

  const markAllAsRead = () => {
    setNotifications(notifications.map(notif => ({ ...notif, read: true })));
  };

  const deleteNotification = (id: string) => {
    setNotifications(notifications.filter(notif => notif.id !== id));
  };

  const getTypeStyles = (type: string) => {
    switch(type) {
      case 'success': return 'border-green-500/20 bg-green-500/5';
      case 'warning': return 'border-yellow-500/20 bg-yellow-500/5';
      case 'error': return 'border-red-500/20 bg-red-500/5';
      default: return 'border-blue-500/20 bg-blue-500/5';
    }
  };

  const getTypeIcon = (type: string) => {
    switch(type) {
      case 'success': return <CheckCircle className="w-5 h-5 text-green-500" />;
      case 'warning': return <AlertCircle className="w-5 h-5 text-yellow-500" />;
      case 'error': return <AlertCircle className="w-5 h-5 text-red-500" />;
      default: return <Bell className="w-5 h-5 text-blue-500" />;
    }
  };

  return (
    <div className="space-y-6 animate-fade-up">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-display font-bold tracking-tight">Notifications</h1>
          <p className="text-muted-foreground mt-1">Restez informé de vos activités</p>
        </div>
        {notifications.some(n => !n.read) && (
          <button onClick={markAllAsRead} className="btn-outline text-sm">
            Tout marquer comme lu
          </button>
        )}
      </div>

      {/* Notifications count */}
      <div className="card p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Bell className="w-5 h-5" />
            <span className="font-medium">Notifications</span>
          </div>
          <span className="badge-primary">{notifications.filter(n => !n.read).length} non lues</span>
        </div>
      </div>

      {/* Notifications list */}
      <div className="space-y-3">
        {notifications.length === 0 ? (
          <div className="card p-12 text-center">
            <Bell className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
            <p className="text-muted-foreground">Aucune notification</p>
          </div>
        ) : (
          notifications.map((notification) => (
            <div 
              key={notification.id}
              className={`card p-5 transition-all duration-300 ${!notification.read ? 'border-primary/30 shadow-sm' : ''}`}
            >
              <div className="flex gap-4">
                <div className="flex-shrink-0">
                  {getTypeIcon(notification.type)}
                </div>
                <div className="flex-1">
                  <div className="flex items-start justify-between">
                    <div>
                      <h3 className="font-semibold">{notification.title}</h3>
                      <p className="text-sm text-muted-foreground mt-1">{notification.message}</p>
                      <p className="text-xs text-muted-foreground mt-2">
                        {new Date(notification.createdAt).toLocaleString()}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      {!notification.read && (
                        <button 
                          onClick={() => markAsRead(notification.id)}
                          className="text-xs text-primary hover:underline"
                        >
                          Marquer lu
                        </button>
                      )}
                      <button 
                        onClick={() => deleteNotification(notification.id)}
                        className="p-1 hover:bg-muted rounded-lg transition-colors"
                      >
                        <X className="w-4 h-4 text-muted-foreground" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default LivreurNotifications;