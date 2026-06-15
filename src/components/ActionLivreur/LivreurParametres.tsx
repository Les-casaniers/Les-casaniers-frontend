// src/components/ActionLivreur/LivreurParametres.tsx
import React, { useState } from 'react';
import { User, Bell, Shield, Languages, Globe, Save, Camera } from 'lucide-react';

const LivreurParametres: React.FC = () => {
  const [profile, setProfile] = useState({
    name: 'Jean Dupont',
    email: 'jean.dupont@example.com',
    phone: '+33 6 12 34 56 78',
    notifications: true,
    emailAlerts: true,
    smsAlerts: false
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Sauvegarder les modifications
    console.log('Saving profile:', profile);
  };

  return (
    <div className="space-y-6 animate-fade-up">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-display font-bold tracking-tight">Paramètres</h1>
        <p className="text-muted-foreground mt-1">Gérez vos préférences et informations personnelles</p>
      </div>

      {/* Profile Settings */}
      <div className="card p-6">
        <h2 className="text-xl font-semibold mb-6 flex items-center gap-2">
          <User className="w-5 h-5" />
          Informations personnelles
        </h2>
        
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Avatar */}
          <div className="flex items-center gap-6">
            <div className="relative">
              <div className="w-24 h-24 rounded-full bg-gradient-primary flex items-center justify-center">
                <span className="text-white text-2xl font-bold">JD</span>
              </div>
              <button className="absolute bottom-0 right-0 p-2 bg-card border border-border rounded-full hover:bg-muted transition-colors">
                <Camera className="w-4 h-4" />
              </button>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Photo de profil</p>
              <p className="text-xs text-muted-foreground">Formats acceptés: JPG, PNG (max 2MB)</p>
            </div>
          </div>

          {/* Form fields */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium mb-2">Nom complet</label>
              <input
                type="text"
                value={profile.name}
                onChange={(e) => setProfile({ ...profile, name: e.target.value })}
                className="input"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Email</label>
              <input
                type="email"
                value={profile.email}
                onChange={(e) => setProfile({ ...profile, email: e.target.value })}
                className="input"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Téléphone</label>
              <input
                type="tel"
                value={profile.phone}
                onChange={(e) => setProfile({ ...profile, phone: e.target.value })}
                className="input"
              />
            </div>
          </div>

          <button type="submit" className="btn-primary">
            <Save className="w-4 h-4" />
            Sauvegarder les modifications
          </button>
        </form>
      </div>

      {/* Notification Settings */}
      <div className="card p-6">
        <h2 className="text-xl font-semibold mb-6 flex items-center gap-2">
          <Bell className="w-5 h-5" />
          Préférences de notifications
        </h2>
        
        <div className="space-y-4">
          <div className="flex items-center justify-between p-3 bg-muted/30 rounded-lg">
            <div>
              <p className="font-medium">Notifications push</p>
              <p className="text-sm text-muted-foreground">Recevoir les alertes en temps réel</p>
            </div>
            <label className="theme-toggle">
              <input
                type="checkbox"
                checked={profile.notifications}
                onChange={(e) => setProfile({ ...profile, notifications: e.target.checked })}
                className="sr-only"
              />
              <div className="theme-toggle-thumb">
                {profile.notifications ? '🔔' : '🔕'}
              </div>
            </label>
          </div>

          <div className="flex items-center justify-between p-3 bg-muted/30 rounded-lg">
            <div>
              <p className="font-medium">Alertes email</p>
              <p className="text-sm text-muted-foreground">Recevoir les résumés par email</p>
            </div>
            <label className="theme-toggle">
              <input
                type="checkbox"
                checked={profile.emailAlerts}
                onChange={(e) => setProfile({ ...profile, emailAlerts: e.target.checked })}
                className="sr-only"
              />
              <div className="theme-toggle-thumb">
                {profile.emailAlerts ? '📧' : '📧'}
              </div>
            </label>
          </div>

          <div className="flex items-center justify-between p-3 bg-muted/30 rounded-lg">
            <div>
              <p className="font-medium">Notifications SMS</p>
              <p className="text-sm text-muted-foreground">Recevoir les alertes par SMS</p>
            </div>
            <label className="theme-toggle">
              <input
                type="checkbox"
                checked={profile.smsAlerts}
                onChange={(e) => setProfile({ ...profile, smsAlerts: e.target.checked })}
                className="sr-only"
              />
              <div className="theme-toggle-thumb">
                {profile.smsAlerts ? '📱' : '📱'}
              </div>
            </label>
          </div>
        </div>
      </div>

      {/* Language Settings */}
      <div className="card p-6">
        <h2 className="text-xl font-semibold mb-6 flex items-center gap-2">
          <Globe className="w-5 h-5" />
          Langue et région
        </h2>
        
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-2">Langue</label>
            <select className="input w-full md:w-64">
              <option>Français</option>
              <option>English</option>
              <option>Español</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium mb-2">Format de date</label>
            <select className="input w-full md:w-64">
              <option>DD/MM/YYYY</option>
              <option>MM/DD/YYYY</option>
              <option>YYYY-MM-DD</option>
            </select>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LivreurParametres;