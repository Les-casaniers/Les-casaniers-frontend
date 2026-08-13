import { useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Mail,
  Phone,
  MapPin,
  Calendar,
  User,
  Heart,
  ShoppingBag,
  CreditCard,
  Moon,
  Sun,
  LogOut,
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';

const DashboardProfile = () => {
  const { user, isAuthenticated, loading: authLoading, logout } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      navigate('/login');
    }
  }, [authLoading, isAuthenticated, navigate]);

  const fullName = `${user?.prenom || ''} ${user?.nom || ''}`.trim() || 'Client';
  const initials = fullName
    .split(' ')
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase())
    .slice(0, 2)
    .join('') || 'CL';
  const role = user?.poste
    ? user.poste === 'admin'
      ? 'Administrateur'
      : user.poste === 'livreur'
      ? 'Livreur'
      : 'Client'
    : 'Client';
  const memberSince = user?.date_creation
    ? new Date(user.date_creation).toLocaleDateString('fr-FR', {
        day: 'numeric',
        month: 'long',
        year: 'numeric',
      })
    : 'Inconnu';
  const email = user?.email || 'Non renseigné';
  const phone = user?.telephone || user?.phone || 'Non renseigné';
  const address = user?.adresses?.[0]
    ? `${user.adresses[0].adresse_ligne1 || ''}${user.adresses[0].ville ? `, ${user.adresses[0].ville}` : ''}${user.adresses[0].pays ? `, ${user.adresses[0].pays}` : ''}`
    : 'Aucune adresse enregistrée';
  const statusLabel = user?.statut ? 'Actif' : 'Inactif';

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="space-y-6">
      <div className="rounded-3xl border border-border bg-card p-6 shadow-sm">
        <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <p className="text-xs uppercase tracking-[0.3em] text-muted-foreground mb-3">Profil client</p>
            <h1 className="text-3xl font-bold text-foreground">Bonjour, {user?.prenom || 'Client'}</h1>
            <p className="mt-2 text-sm text-muted-foreground max-w-2xl">
              Retrouvez vos informations de compte, adresses et actions rapides pour gérer votre expérience Casaniers.
            </p>
          </div>
          <div className="flex items-center gap-4 rounded-3xl border border-white/10 bg-gradient-to-br from-primary/10 to-foreground/5 p-4">
            <div className="flex h-16 w-16 items-center justify-center rounded-3xl bg-primary text-white text-2xl font-bold">
              {initials}
            </div>
            <div>
              <p className="text-sm uppercase tracking-[0.3em] text-muted-foreground">Statut</p>
              <p className="text-lg font-semibold text-foreground">{statusLabel}</p>
            </div>
          </div>
        </div>
      </div>

      <div className="grid gap-6 xl:grid-cols-[1.2fr_0.8fr]">
        <div className="space-y-6">
          <div className="rounded-3xl border border-border bg-card p-6 shadow-sm">
            <div className="flex items-center justify-between gap-4 mb-6">
              <div>
                <p className="text-sm uppercase tracking-[0.3em] text-muted-foreground">Informations personnelles</p>
                <h2 className="text-xl font-semibold text-foreground">Détails du compte</h2>
              </div>
              <button
                onClick={() => navigate('/DashboardClient/parametres')}
                className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm font-medium text-foreground transition hover:bg-white/10"
              >
                <Sun className="w-4 h-4" />
                Modifier
              </button>
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="rounded-3xl border border-white/10 bg-white/5 p-4">
                <p className="text-xs uppercase tracking-[0.25em] text-muted-foreground mb-2">Nom complet</p>
                <p className="text-sm font-semibold text-foreground">{fullName}</p>
              </div>
              <div className="rounded-3xl border border-white/10 bg-white/5 p-4">
                <p className="text-xs uppercase tracking-[0.25em] text-muted-foreground mb-2">Email</p>
                <p className="text-sm font-semibold text-foreground">{email}</p>
              </div>
              <div className="rounded-3xl border border-white/10 bg-white/5 p-4">
                <p className="text-xs uppercase tracking-[0.25em] text-muted-foreground mb-2">Téléphone</p>
                <p className="text-sm font-semibold text-foreground">{phone}</p>
              </div>
              <div className="rounded-3xl border border-white/10 bg-white/5 p-4">
                <p className="text-xs uppercase tracking-[0.25em] text-muted-foreground mb-2">Membre depuis</p>
                <p className="text-sm font-semibold text-foreground">{memberSince}</p>
              </div>
            </div>
          </div>

          <div className="rounded-3xl border border-border bg-card p-6 shadow-sm">
            <h2 className="text-xl font-semibold text-foreground mb-4">Actions rapides</h2>
            <div className="grid gap-4 sm:grid-cols-2">
              <Link
                to="/DashboardClient/commandes"
                className="flex items-center gap-3 rounded-3xl border border-white/10 bg-white/5 p-4 text-sm font-semibold transition hover:border-white/20"
              >
                <ShoppingBag className="w-5 h-5 text-foreground" />
                Voir mes commandes
              </Link>
              <Link
                to="/DashboardClient/adresses"
                className="flex items-center gap-3 rounded-3xl border border-white/10 bg-white/5 p-4 text-sm font-semibold transition hover:border-white/20"
              >
                <MapPin className="w-5 h-5 text-foreground" />
                Gérer mes adresses
              </Link>
              <Link
                to="/DashboardClient/favoris"
                className="flex items-center gap-3 rounded-3xl border border-white/10 bg-white/5 p-4 text-sm font-semibold transition hover:border-white/20"
              >
                <Heart className="w-5 h-5 text-foreground" />
                Mes favoris
              </Link>
              <Link
                to="/DashboardClient/paiement"
                className="flex items-center gap-3 rounded-3xl border border-white/10 bg-white/5 p-4 text-sm font-semibold transition hover:border-white/20"
              >
                <CreditCard className="w-5 h-5 text-foreground" />
                Mes factures
              </Link>
            </div>
          </div>
        </div>

        <aside className="space-y-6">
          <div className="rounded-3xl border border-border bg-card p-6 shadow-sm">
            <div className="flex items-center gap-4 mb-5">
              <div className="flex h-14 w-14 items-center justify-center rounded-3xl bg-gradient-to-br from-primary to-primary/80 text-xl font-bold text-white">
                {initials}
              </div>
              <div>
                <p className="text-sm uppercase tracking-[0.3em] text-muted-foreground">Profil</p>
                <h3 className="text-xl font-semibold text-foreground">{fullName}</h3>
              </div>
            </div>
            <div className="space-y-3 text-sm text-muted-foreground">
              <div className="flex items-center gap-2">
                <Mail className="w-4 h-4 text-foreground/60" />
                <span>{email}</span>
              </div>
              <div className="flex items-center gap-2">
                <Phone className="w-4 h-4 text-foreground/60" />
                <span>{phone}</span>
              </div>
              <div className="flex items-center gap-2">
                <MapPin className="w-4 h-4 text-foreground/60" />
                <span>{address}</span>
              </div>
              <div className="flex items-center gap-2">
                <Calendar className="w-4 h-4 text-foreground/60" />
                <span>{memberSince}</span>
              </div>
              <div className="flex items-center gap-2">
                <User className="w-4 h-4 text-foreground/60" />
                <span>{role}</span>
              </div>
            </div>
          </div>

          <div className="rounded-3xl border border-border bg-card p-6 shadow-sm">
            <h3 className="text-sm uppercase tracking-[0.3em] text-muted-foreground mb-4">Préférences</h3>
            <button
              onClick={handleLogout}
              className="flex w-full items-center justify-center gap-2 rounded-3xl bg-destructive text-destructive-foreground px-4 py-4 text-sm font-semibold transition hover:bg-destructive/90"
            >
              <LogOut className="w-4 h-4" />
              Déconnexion
            </button>
          </div>
        </aside>
      </div>
    </div>
  );
};

export default DashboardProfile;
