// DashboardClient.tsx
import React, { useState, useEffect } from 'react';
import { 
  MapPin, 
  Phone, 
  Mail, 
  Calendar, 
  Star, 
  Edit,
  X,
  Sun,
  Moon,
  CheckCircle,
  Clock,
  AlertCircle,
  TrendingUp,
  DollarSign,
  ShoppingBag,
  Award,
  Save,
  User,
  AtSign,
  Home,
  Globe,
  Loader2,
  UserCircle,
  LogOut,
  Trash2,
  Search,
  ChevronLeft,
  ChevronRight,
  Eye,
  Activity,
  Users,
  RefreshCw,
  Menu,
  Building2,
  MailCheck
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';

// Types
interface Client {
  id: string | number;
  name: string;
  prenom?: string;
  nom?: string;
  email: string;
  phone: string;
  telephone?: string;
  location: {
    address: string;
    city: string;
    country: string;
  };
  status: 'active' | 'inactive' | 'pending';
  joinedDate: string;
  date_creation?: string;
  lastActive: string;
  date_modification?: string;
  rating: number;
  totalOrders: number;
  totalSpent: number;
  statut?: boolean;
}

// Composant de bascule de thème
const ThemeToggle: React.FC = () => {
  const [isDark, setIsDark] = useState(() => {
    if (typeof window !== 'undefined') {
      return document.documentElement.classList.contains('dark');
    }
    return false;
  });

  const toggleTheme = () => {
    const newIsDark = !isDark;
    setIsDark(newIsDark);
    document.documentElement.classList.toggle('dark');
  };

  return (
    <button
      onClick={toggleTheme}
      className="relative inline-flex items-center justify-center w-10 h-10 rounded-full hover:bg-muted transition-all duration-300 hover:scale-110"
      aria-label="Basculer le thème"
    >
      {isDark ? (
        <Sun className="w-5 h-5 transition-all duration-500 hover:rotate-90" />
      ) : (
        <Moon className="w-5 h-5 transition-all duration-500 hover:-rotate-90" />
      )}
    </button>
  );
};

// Composant de confirmation de suppression
const DeleteConfirmationModal: React.FC<{
  client: Client;
  onConfirm: () => void;
  onCancel: () => void;
}> = ({ client, onConfirm, onCancel }) => {
  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in"
      onClick={onCancel}
    >
      <div 
        className="bg-card rounded-2xl shadow-2xl max-w-md w-full animate-scale-in border border-border"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="p-6 text-center">
          <div className="w-16 h-16 rounded-full bg-destructive/10 flex items-center justify-center mx-auto mb-4">
            <AlertCircle className="w-8 h-8 text-destructive" />
          </div>
          <h3 className="text-xl font-display font-semibold mb-2">Confirmer la suppression</h3>
          <p className="text-muted-foreground text-sm mb-1">
            Êtes-vous sûr de vouloir supprimer le client
          </p>
          <p className="font-medium text-foreground">{client.name}</p>
          <p className="text-xs text-muted-foreground mt-3 bg-muted/30 p-3 rounded-lg">
            ⚠️ Cette action est irréversible et supprimera toutes les données associées.
          </p>
        </div>

        <div className="flex flex-wrap gap-3 p-6 pt-0 border-t border-border">
          <button 
            onClick={onConfirm}
            className="flex-1 min-w-[120px] bg-destructive text-destructive-foreground hover:bg-destructive/90 font-medium py-2.5 px-6 rounded-lg transition-all duration-300 flex items-center justify-center gap-2 hover:scale-105 active:scale-95"
          >
            <Trash2 className="w-4 h-4" />
            Supprimer
          </button>
          <button 
            onClick={onCancel}
            className="flex-1 min-w-[120px] bg-secondary text-secondary-foreground hover:bg-secondary/80 font-medium py-2.5 px-6 rounded-lg transition-all duration-300 flex items-center justify-center gap-2 border border-border hover:scale-105 active:scale-95"
          >
            <X className="w-4 h-4" />
            Annuler
          </button>
        </div>
      </div>
    </div>
  );
};

// Composant de formulaire de modification
const EditClientForm: React.FC<{
  client: Client;
  onSave: (updatedClient: Client) => void;
  onCancel: () => void;
}> = ({ client, onSave, onCancel }) => {
  const [formData, setFormData] = useState<Client>({ ...client });
  const [loading, setLoading] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    if (name.includes('.')) {
      const [parent, child] = name.split('.');
      setFormData(prev => ({
        ...prev,
        [parent]: {
          ...prev[parent as keyof Client] as any,
          [child]: value
        }
      }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const nameParts = formData.name?.split(' ') || ['', ''];
      const updatedClient = {
        ...formData,
        prenom: nameParts[0] || '',
        nom: nameParts.slice(1).join(' ') || '',
        telephone: formData.phone || '',
        statut: formData.status === 'active'
      };
      await onSave(updatedClient);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in"
      onClick={onCancel}
    >
      <div 
        className="bg-card rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto animate-scale-in border border-border"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="sticky top-0 bg-card/95 backdrop-blur-sm border-b border-border p-6 flex items-center justify-between z-10">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-foreground/10">
              <Edit className="w-5 h-5 text-foreground" />
            </div>
            <div>
              <h2 className="text-xl font-display font-semibold">Modifier le client</h2>
              <p className="text-sm text-muted-foreground">Modifiez les informations du client</p>
            </div>
          </div>
          <button 
            onClick={onCancel}
            className="p-2 rounded-full hover:bg-muted transition-colors hover:rotate-90 duration-300"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1.5">Prénom</label>
              <input
                type="text"
                name="prenom"
                value={formData.prenom || ''}
                onChange={handleChange}
                className="input"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1.5">Nom</label>
              <input
                type="text"
                name="nom"
                value={formData.nom || ''}
                onChange={handleChange}
                className="input"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1.5">Email</label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                className="input"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1.5">Téléphone</label>
              <input
                type="tel"
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                className="input"
                required
              />
            </div>
            <div className="sm:col-span-2">
              <label className="block text-sm font-medium mb-1.5">Adresse</label>
              <input
                type="text"
                name="location.address"
                value={formData.location.address}
                onChange={handleChange}
                className="input"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1.5">Ville</label>
              <input
                type="text"
                name="location.city"
                value={formData.location.city}
                onChange={handleChange}
                className="input"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1.5">Statut</label>
              <select
                name="status"
                value={formData.status}
                onChange={handleChange}
                className="input"
              >
                <option value="active">✅ Actif</option>
                <option value="pending">⏳ En attente</option>
                <option value="inactive">❌ Inactif</option>
              </select>
            </div>
          </div>

          <div className="flex flex-wrap gap-3 pt-4 border-t border-border">
            <button 
              type="submit" 
              disabled={loading}
              className="flex-1 min-w-[120px] bg-foreground text-background hover:bg-foreground/90 font-medium py-2.5 px-6 rounded-lg transition-all duration-300 flex items-center justify-center gap-2 shadow-sm hover:shadow-md hover:scale-105 active:scale-95 disabled:opacity-50 disabled:hover:scale-100"
            >
              {loading ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Save className="w-4 h-4" />
              )}
              {loading ? 'Enregistrement...' : 'Enregistrer'}
            </button>
            <button 
              type="button" 
              onClick={onCancel}
              className="flex-1 min-w-[120px] bg-secondary text-secondary-foreground hover:bg-secondary/80 font-medium py-2.5 px-6 rounded-lg transition-all duration-300 flex items-center justify-center gap-2 border border-border hover:scale-105 active:scale-95"
            >
              <X className="w-4 h-4" />
              Annuler
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

// Composant de vue détaillée du client
const ClientDetailView: React.FC<{ 
  client: Client; 
  onClose: () => void;
  onEdit: () => void;
  onDelete: () => void;
}> = ({ client, onClose, onEdit, onDelete }) => {
  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in"
      onClick={onClose}
    >
      <div 
        className="bg-card rounded-2xl shadow-2xl max-w-3xl w-full max-h-[90vh] overflow-y-auto animate-scale-in border border-border"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="sticky top-0 bg-card/95 backdrop-blur-sm border-b border-border p-6 flex items-start justify-between z-10">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-full bg-gradient-to-br from-foreground/10 to-foreground/5 flex items-center justify-center flex-shrink-0">
              <UserCircle className="w-10 h-10 text-foreground/60" />
            </div>
            <div>
              <h2 className="text-2xl font-display font-semibold">{client.name}</h2>
              <p className="text-sm text-muted-foreground flex items-center gap-2">
                <Mail className="w-3 h-3" />
                {client.email}
              </p>
              <div className="flex items-center gap-2 mt-1">
                <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium ${
                  client.status === 'active' 
                    ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400' 
                    : client.status === 'pending' 
                    ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400' 
                    : 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-400'
                }`}>
                  {client.status === 'active' ? '🟢 Actif' : client.status === 'pending' ? '🟡 En attente' : '🔴 Inactif'}
                </span>
                <span className="flex items-center gap-1 text-xs text-muted-foreground">
                  <Star className="w-3 h-3 text-yellow-500 fill-yellow-500" />
                  {client.rating}
                </span>
              </div>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="p-2 rounded-full hover:bg-muted transition-colors hover:rotate-90 duration-300"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <h3 className="font-display font-medium text-sm uppercase tracking-wider text-muted-foreground flex items-center gap-2">
                <UserCircle className="w-4 h-4" />
                Informations personnelles
              </h3>
              <div className="space-y-3">
                <div className="flex items-center gap-3 text-sm p-3 rounded-lg bg-muted/20 hover:bg-muted/30 transition-colors">
                  <Phone className="w-4 h-4 text-muted-foreground" />
                  <span>{client.phone}</span>
                </div>
                <div className="flex items-center gap-3 text-sm p-3 rounded-lg bg-muted/20 hover:bg-muted/30 transition-colors">
                  <Calendar className="w-4 h-4 text-muted-foreground" />
                  <span>Inscrit le {new Date(client.joinedDate).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' })}</span>
                </div>
                <div className="flex items-center gap-3 text-sm p-3 rounded-lg bg-muted/20 hover:bg-muted/30 transition-colors">
                  <Clock className="w-4 h-4 text-muted-foreground" />
                  <span>Dernière activité : {new Date(client.lastActive).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' })}</span>
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <h3 className="font-display font-medium text-sm uppercase tracking-wider text-muted-foreground flex items-center gap-2">
                <MapPin className="w-4 h-4" />
                Localisation
              </h3>
              <div className="space-y-3">
                <div className="flex items-start gap-3 text-sm p-3 rounded-lg bg-muted/20 hover:bg-muted/30 transition-colors">
                  <MapPin className="w-4 h-4 text-muted-foreground mt-0.5" />
                  <div>
                    <p className="font-medium">{client.location.address}</p>
                    <p className="text-muted-foreground">{client.location.city}, {client.location.country}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="space-y-4">
         
        
          </div>

          <div className="flex flex-wrap gap-3 pt-4 border-t border-border">
            <button 
              onClick={onEdit}
              className="flex-1 min-w-[120px] bg-foreground text-background hover:bg-foreground/90 font-medium py-2.5 px-6 rounded-lg transition-all duration-300 flex items-center justify-center gap-2 shadow-sm hover:shadow-md hover:scale-105 active:scale-95"
            >
              <Edit className="w-4 h-4" />
              Modifier
            </button>
            <button 
              onClick={onDelete}
              className="flex-1 min-w-[120px] bg-destructive text-destructive-foreground hover:bg-destructive/90 font-medium py-2.5 px-6 rounded-lg transition-all duration-300 flex items-center justify-center gap-2 hover:scale-105 active:scale-95"
            >
              <Trash2 className="w-4 h-4" />
              Supprimer
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

// Composant principal du dashboard
const DashboardClient: React.FC = () => {
  const { user, isAuthenticated, logout, loading: authLoading } = useAuth();
  const [clients, setClients] = useState<Client[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedClient, setSelectedClient] = useState<Client | null>(null);
  const [editingClient, setEditingClient] = useState<Client | null>(null);
  const [deletingClient, setDeletingClient] = useState<Client | null>(null);
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'inactive' | 'pending'>('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const clientsPerPage = 5;

  // Charger les utilisateurs
  useEffect(() => {
    if (authLoading) return;

    if (!isAuthenticated || !user) {
      window.location.href = '/login';
      return;
    }

    // Simuler une liste de clients
    const mockClients: Client[] = [
      {
        id: user.id || 1,
        name: `${user.prenom || ''} ${user.nom || ''}`.trim() || 'Utilisateur',
        prenom: user.prenom || 'Jean',
        nom: user.nom || 'Dupont',
        email: user.email || 'jean.dupont@email.com',
        phone: user.telephone || '+33 6 12 34 56 78',
        telephone: user.telephone || '+33 6 12 34 56 78',
        location: {
          address: user.adresses?.[0]?.adresse || '15 Rue de la Paix',
          city: user.adresses?.[0]?.ville || 'Paris',
          country: user.adresses?.[0]?.pays || 'France',
        },
        status: user.statut ? 'active' : 'inactive',
        statut: user.statut || false,
        joinedDate: user.date_creation || '2024-01-15',
        date_creation: user.date_creation || '2024-01-15',
        lastActive: user.date_modification || user.date_creation || '2024-12-10',
        date_modification: user.date_modification || user.date_creation || '2024-12-10',
        rating: 4.8,
        totalOrders: 47,
        totalSpent: 12580
      },
  
    ];

    setClients(mockClients);
    setLoading(false);
  }, [user, isAuthenticated, authLoading]);

  // Filtrage des clients
  const filteredClients = clients.filter(client => {
    const matchesSearch = 
      client.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      client.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      client.location.city.toLowerCase().includes(searchTerm.toLowerCase()) ||
      client.phone.includes(searchTerm);
    
    const matchesStatus = statusFilter === 'all' || client.status === statusFilter;
    
    return matchesSearch && matchesStatus;
  });

  // Pagination
  const indexOfLastClient = currentPage * clientsPerPage;
  const indexOfFirstClient = indexOfLastClient - clientsPerPage;
  const currentClients = filteredClients.slice(indexOfFirstClient, indexOfLastClient);
  const totalPages = Math.ceil(filteredClients.length / clientsPerPage);

  // Statistiques
  const stats = {
    total: clients.length,
    active: clients.filter(c => c.status === 'active').length,
    inactive: clients.filter(c => c.status === 'inactive').length,
    pending: clients.filter(c => c.status === 'pending').length,
  };

  const getStatusBadge = (status: Client['status']) => {
    switch (status) {
      case 'active':
        return <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400"><CheckCircle className="w-3 h-3" /> Actif</span>;
      case 'pending':
        return <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400"><Clock className="w-3 h-3" /> En attente</span>;
      case 'inactive':
        return <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-400"><AlertCircle className="w-3 h-3" /> Inactif</span>;
      default:
        return null;
    }
  };

  const handleEditClient = (client: Client) => {
    setEditingClient(client);
    setSelectedClient(null);
  };

  const handleSaveClient = async (updatedClient: Client) => {
    try {
      setClients(prev => prev.map(c => 
        c.id === updatedClient.id ? updatedClient : c
      ));
      setEditingClient(null);
      setSelectedClient(updatedClient);
    } catch (err: any) {
      setError(err.message || 'Erreur lors de la mise à jour');
    }
  };

  const handleDeleteClient = (client: Client) => {
    setDeletingClient(client);
    setSelectedClient(null);
  };

  const confirmDelete = () => {
    if (deletingClient) {
      setClients(prev => prev.filter(c => c.id !== deletingClient.id));
      setDeletingClient(null);
    }
  };

  const handleLogout = () => {
    logout();
  };

  const refreshData = () => {
    setLoading(true);
    setTimeout(() => setLoading(false), 500);
  };

  if (authLoading || loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-12 h-12 animate-spin text-foreground mx-auto mb-4" />
          <p className="text-muted-foreground">Chargement...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center max-w-md">
          <AlertCircle className="w-16 h-16 text-destructive mx-auto mb-4" />
          <h2 className="text-xl font-semibold mb-2">Erreur</h2>
          <p className="text-muted-foreground">{error}</p>
          <button 
            onClick={() => window.location.reload()}
            className="mt-4 bg-foreground text-background hover:bg-foreground/90 font-medium py-2.5 px-6 rounded-lg transition-all duration-300"
          >
            Réessayer
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Barre de navigation */}
      <header className="border-b border-border bg-background/95 backdrop-blur-sm sticky top-0 z-40 flex-shrink-0">
   

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="md:hidden border-t border-border bg-background/95 backdrop-blur-sm p-4 space-y-3 animate-slide-down">
            <div className="flex items-center justify-between">
              <ThemeToggle />
              <button 
                onClick={refreshData}
                className="p-2 rounded-lg hover:bg-muted transition-colors"
              >
                <RefreshCw className="w-5 h-5" />
              </button>
            </div>
            <button 
              onClick={handleLogout}
              className="w-full bg-foreground text-background hover:bg-foreground/90 font-medium py-2.5 px-4 rounded-lg transition-all duration-300 flex items-center justify-center gap-2 text-sm"
            >
              <LogOut className="w-4 h-4" />
              Déconnexion
            </button>
          </div>
        )}
      </header>

      {/* Contenu principal */}
     <div className="flex-1 w-full px-4 md:px-8 lg:px-12 py-6 bg-gradient-to-br from-background via-background to-muted/20">  
        {/* Statistiques - Responsive Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 mb-4 sm:mb-6">
          <div className="card p-3 sm:p-5 hover:shadow-lg transition-all duration-300 hover:scale-[1.02] border-border/50 group">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-[10px] sm:text-xs text-muted-foreground font-medium uppercase tracking-wider">Total</p>
                <p className="text-xl sm:text-3xl font-display font-bold">{stats.total}</p>
              </div>
              <div className="p-2 sm:p-3 rounded-xl bg-foreground/5 group-hover:bg-foreground/10 transition-colors">
                <Users className="w-4 h-4 sm:w-6 sm:h-6 text-foreground/40 group-hover:text-foreground/60 transition-colors" />
              </div>
            </div>
          </div>
          <div className="card p-3 sm:p-5 hover:shadow-lg transition-all duration-300 hover:scale-[1.02] border-green-200/50 dark:border-green-900/30 group">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-[10px] sm:text-xs text-muted-foreground font-medium uppercase tracking-wider">Actifs</p>
                <p className="text-xl sm:text-3xl font-display font-bold text-green-600 dark:text-green-400">{stats.active}</p>
              </div>
              <div className="p-2 sm:p-3 rounded-xl bg-green-500/10 group-hover:bg-green-500/20 transition-colors">
                <Activity className="w-4 h-4 sm:w-6 sm:h-6 text-green-500 group-hover:scale-110 transition-transform" />
              </div>
            </div>
          </div>
          <div className="card p-3 sm:p-5 hover:shadow-lg transition-all duration-300 hover:scale-[1.02] border-yellow-200/50 dark:border-yellow-900/30 group">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-[10px] sm:text-xs text-muted-foreground font-medium uppercase tracking-wider">En attente</p>
                <p className="text-xl sm:text-3xl font-display font-bold text-yellow-600 dark:text-yellow-400">{stats.pending}</p>
              </div>
              <div className="p-2 sm:p-3 rounded-xl bg-yellow-500/10 group-hover:bg-yellow-500/20 transition-colors">
                <Clock className="w-4 h-4 sm:w-6 sm:h-6 text-yellow-500 group-hover:rotate-12 transition-transform" />
              </div>
            </div>
          </div>
          <div className="card p-3 sm:p-5 hover:shadow-lg transition-all duration-300 hover:scale-[1.02] border-gray-200/50 dark:border-gray-800 group">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-[10px] sm:text-xs text-muted-foreground font-medium uppercase tracking-wider">Inactifs</p>
                <p className="text-xl sm:text-3xl font-display font-bold text-muted-foreground">{stats.inactive}</p>
              </div>
              <div className="p-2 sm:p-3 rounded-xl bg-muted/30 group-hover:bg-muted/50 transition-colors">
                <AlertCircle className="w-4 h-4 sm:w-6 sm:h-6 text-muted-foreground/40 group-hover:text-muted-foreground/60 transition-colors" />
              </div>
            </div>
          </div>
        </div>

        {/* Filtres et recherche - Responsive */}
        <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 mb-4 sm:mb-6">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <input
              type="text"
              placeholder="Rechercher par nom, email, ville ou téléphone..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="input pl-10 text-sm focus:ring-2 focus:ring-foreground/20 transition-all duration-300"
            />
          </div>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as typeof statusFilter)}
            className="input w-full sm:w-auto min-w-[140px] text-sm focus:ring-2 focus:ring-foreground/20 transition-all duration-300"
          >
            <option value="all">📊 Tous les statuts</option>
            <option value="active">✅ Actifs</option>
            <option value="pending">⏳ En attente</option>
            <option value="inactive">❌ Inactifs</option>
          </select>
        </div>

        {/* Tableau - Responsive */}
        {filteredClients.length === 0 ? (
          <div className="text-center py-12 sm:py-16">
            <div className="w-20 h-20 rounded-full bg-muted/30 flex items-center justify-center mx-auto mb-4">
              <Search className="w-10 h-10 text-muted-foreground/30" />
            </div>
            <h3 className="text-lg font-display font-medium">Aucun client trouvé</h3>
            <p className="text-muted-foreground text-sm mt-1">Essayez de modifier vos critères de recherche</p>
          </div>
        ) : (
          <>
            <div className="card overflow-hidden border border-border shadow-sm hover:shadow-md transition-shadow duration-300">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-border bg-muted/30">
                      <th className="text-left py-3 px-3 sm:px-4 text-[10px] sm:text-xs font-semibold uppercase tracking-wider text-muted-foreground">Client</th>
                      <th className="text-left py-3 px-3 sm:px-4 text-[10px] sm:text-xs font-semibold uppercase tracking-wider text-muted-foreground hidden md:table-cell">Contact</th>
                      <th className="text-left py-3 px-3 sm:px-4 text-[10px] sm:text-xs font-semibold uppercase tracking-wider text-muted-foreground hidden lg:table-cell">Localisation</th>
                      <th className="text-center py-3 px-3 sm:px-4 text-[10px] sm:text-xs font-semibold uppercase tracking-wider text-muted-foreground hidden sm:table-cell">Statut</th>
                      <th className="text-center py-3 px-3 sm:px-4 text-[10px] sm:text-xs font-semibold uppercase tracking-wider text-muted-foreground">Note</th>
                      <th className="text-center py-3 px-3 sm:px-4 text-[10px] sm:text-xs font-semibold uppercase tracking-wider text-muted-foreground hidden sm:table-cell">Commandes</th>
                      <th className="text-center py-3 px-3 sm:px-4 text-[10px] sm:text-xs font-semibold uppercase tracking-wider text-muted-foreground hidden md:table-cell">Dépensé</th>
                      <th className="text-right py-3 px-3 sm:px-4 text-[10px] sm:text-xs font-semibold uppercase tracking-wider text-muted-foreground">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {currentClients.map((client, index) => (
                      <tr 
                        key={client.id}
                        className="border-b border-border hover:bg-muted/10 transition-all duration-300 cursor-pointer group"
                        onClick={() => setSelectedClient(client)}
                      >
                        <td className="py-3 px-3 sm:px-4">
                          <div className="flex items-center gap-2 sm:gap-3">
                            <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-gradient-to-br from-foreground/10 to-foreground/5 flex items-center justify-center flex-shrink-0">
                              <UserCircle className="w-4 h-4 sm:w-5 sm:h-5 text-foreground/60" />
                            </div>
                            <div>
                              <p className="font-medium text-sm">{client.name}</p>
                              <p className="text-xs text-muted-foreground md:hidden truncate max-w-[100px]">{client.email}</p>
                            </div>
                          </div>
                        </td>
                        <td className="py-3 px-3 sm:px-4 hidden md:table-cell">
                          <div className="space-y-0.5">
                            <p className="text-sm">{client.email}</p>
                            <p className="text-xs text-muted-foreground">{client.phone}</p>
                          </div>
                        </td>
                        <td className="py-3 px-3 sm:px-4 hidden lg:table-cell">
                          <div className="flex items-start gap-2">
                            <MapPin className="w-4 h-4 text-muted-foreground flex-shrink-0 mt-0.5" />
                            <div>
                              <p className="text-sm truncate max-w-[120px]">{client.location.address}</p>
                              <p className="text-xs text-muted-foreground">{client.location.city}</p>
                            </div>
                          </div>
                        </td>
                        <td className="py-3 px-3 sm:px-4 text-center hidden sm:table-cell">
                          {getStatusBadge(client.status)}
                        </td>
                        <td className="py-3 px-3 sm:px-4 text-center">
                          <div className="flex items-center justify-center gap-1">
                            <Star className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-yellow-500 fill-yellow-500" />
                            <span className="font-medium text-sm">{client.rating}</span>
                          </div>
                        </td>
                        <td className="py-3 px-3 sm:px-4 text-center hidden sm:table-cell">
                          <span className="font-medium text-sm">{client.totalOrders}</span>
                        </td>
                        <td className="py-3 px-3 sm:px-4 text-center hidden md:table-cell">
                          <span className="font-medium text-sm">{client.totalSpent.toLocaleString()}€</span>
                        </td>
                        <td className="py-3 px-3 sm:px-4 text-right">
                          <div className="flex items-center justify-end gap-1">
                            <button 
                              className="p-1.5 sm:p-2 rounded-lg hover:bg-muted transition-all duration-300 hover:scale-110"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleEditClient(client);
                              }}
                              title="Modifier"
                            >
                              <Edit className="w-4 h-4 text-muted-foreground hover:text-foreground" />
                            </button>
                            <button 
                              className="p-1.5 sm:p-2 rounded-lg hover:bg-destructive/10 transition-all duration-300 hover:scale-110"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleDeleteClient(client);
                              }}
                              title="Supprimer"
                            >
                              <Trash2 className="w-4 h-4 text-muted-foreground hover:text-destructive" />
                            </button>
                            <button 
                              className="p-1.5 sm:p-2 rounded-lg hover:bg-muted transition-all duration-300 hover:scale-110"
                              onClick={(e) => {
                                e.stopPropagation();
                                setSelectedClient(client);
                              }}
                              title="Voir"
                            >
                              <Eye className="w-4 h-4 text-muted-foreground hover:text-foreground" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Pagination - Responsive */}
            {totalPages > 1 && (
              <div className="flex flex-col sm:flex-row items-center justify-between mt-4 sm:mt-6 gap-3 sm:gap-4">
                <p className="text-xs sm:text-sm text-muted-foreground">
                  {indexOfFirstClient + 1} - {Math.min(indexOfLastClient, filteredClients.length)} sur {filteredClients.length} clients
                </p>
                <div className="flex items-center gap-1">
                  <button
                    onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                    disabled={currentPage === 1}
                    className="p-2 rounded-lg hover:bg-muted transition-all duration-300 disabled:opacity-50 disabled:hover:bg-transparent hover:scale-110"
                  >
                    <ChevronLeft className="w-4 h-4 sm:w-5 sm:h-5" />
                  </button>
                  {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => {
                    let pageNum;
                    if (totalPages <= 5) {
                      pageNum = i + 1;
                    } else if (currentPage <= 3) {
                      pageNum = i + 1;
                    } else if (currentPage >= totalPages - 2) {
                      pageNum = totalPages - 4 + i;
                    } else {
                      pageNum = currentPage - 2 + i;
                    }
                    return (
                      <button
                        key={pageNum}
                        onClick={() => setCurrentPage(pageNum)}
                        className={`w-7 h-7 sm:w-9 sm:h-9 rounded-lg transition-all duration-300 text-xs sm:text-sm font-medium ${
                          currentPage === pageNum 
                            ? 'bg-foreground text-background shadow-sm' 
                            : 'hover:bg-muted text-muted-foreground hover:scale-110'
                        }`}
                      >
                        {pageNum}
                      </button>
                    );
                  })}
                  {totalPages > 5 && currentPage < totalPages - 2 && (
                    <>
                      <span className="text-muted-foreground">…</span>
                      <button
                        onClick={() => setCurrentPage(totalPages)}
                        className="w-7 h-7 sm:w-9 sm:h-9 rounded-lg hover:bg-muted transition-all duration-300 text-xs sm:text-sm font-medium text-muted-foreground hover:scale-110"
                      >
                        {totalPages}
                      </button>
                    </>
                  )}
                  <button
                    onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                    disabled={currentPage === totalPages}
                    className="p-2 rounded-lg hover:bg-muted transition-all duration-300 disabled:opacity-50 disabled:hover:bg-transparent hover:scale-110"
                  >
                    <ChevronRight className="w-4 h-4 sm:w-5 sm:h-5" />
                  </button>
                </div>
              </div>
            )}
          </>
        )}
      </div>

      {/* Modals */}
      {selectedClient && !editingClient && !deletingClient && (
        <ClientDetailView
          client={selectedClient}
          onClose={() => setSelectedClient(null)}
          onEdit={() => handleEditClient(selectedClient)}
          onDelete={() => handleDeleteClient(selectedClient)}
        />
      )}

      {editingClient && (
        <EditClientForm
          client={editingClient}
          onSave={handleSaveClient}
          onCancel={() => setEditingClient(null)}
        />
      )}

      {deletingClient && (
        <DeleteConfirmationModal
          client={deletingClient}
          onConfirm={confirmDelete}
          onCancel={() => setDeletingClient(null)}
        />
      )}
    </div>
  );
};

export default DashboardClient;