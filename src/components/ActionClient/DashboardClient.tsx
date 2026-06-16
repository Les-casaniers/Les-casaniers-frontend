import React, { useState } from 'react';
import { 
  MapPin, 
  Phone, 
  Mail, 
  Calendar, 
  Star, 
  MoreVertical,
  Edit,
  Trash2,
  Eye,
  X,
  Plus,
  Search,
  ChevronLeft,
  ChevronRight,
  Sun,
  Moon,
  CheckCircle,
  Clock,
  AlertCircle,
  Users,
  TrendingUp,
  DollarSign,
  ShoppingBag,
  Filter,
  ArrowUpDown,
  UserCircle,
  Building2,
  Award,
  Activity,
  Save,
  User,
  AtSign,
  Home,
  Globe,
  Camera,
  Upload,
  Navigation,
  Crosshair,
  Map,
  LocateFixed,
  AlertTriangle
} from 'lucide-react';

// Types
interface Client {
  id: string;
  name: string;
  email: string;
  phone: string;
  location: {
    address: string;
    city: string;
    country: string;
    coordinates?: {
      lat: number;
      lng: number;
    };
  };
  image: string;
  status: 'active' | 'inactive' | 'pending';
  joinedDate: string;
  lastActive: string;
  rating: number;
  totalOrders: number;
  totalSpent: number;
}

// Données mockées
const mockClients: Client[] = [
  {
    id: '1',
    name: 'Sophie Martinez',
    email: 'sophie.martinez@email.com',
    phone: '+33 6 12 34 56 78',
    location: {
      address: '15 Rue de la Paix',
      city: 'Paris',
      country: 'France',
      coordinates: { lat: 48.8566, lng: 2.3522 }
    },
    image: 'https://i.pravatar.cc/150?img=1',
    status: 'active',
    joinedDate: '2024-01-15',
    lastActive: '2024-12-10',
    rating: 4.8,
    totalOrders: 47,
    totalSpent: 12580
  },
  {
    id: '2',
    name: 'Thomas Dubois',
    email: 'thomas.dubois@email.com',
    phone: '+33 6 98 76 54 32',
    location: {
      address: '8 Avenue des Champs-Élysées',
      city: 'Paris',
      country: 'France',
      coordinates: { lat: 48.8698, lng: 2.3079 }
    },
    image: 'https://i.pravatar.cc/150?img=3',
    status: 'active',
    joinedDate: '2024-03-22',
    lastActive: '2024-12-11',
    rating: 4.9,
    totalOrders: 32,
    totalSpent: 8940
  },
  {
    id: '3',
    name: 'Emma Laurent',
    email: 'emma.laurent@email.com',
    phone: '+33 7 45 67 89 01',
    location: {
      address: '22 Quai de la Seine',
      city: 'Lyon',
      country: 'France',
      coordinates: { lat: 45.7640, lng: 4.8357 }
    },
    image: 'https://i.pravatar.cc/150?img=5',
    status: 'inactive',
    joinedDate: '2024-06-10',
    lastActive: '2024-11-28',
    rating: 4.2,
    totalOrders: 18,
    totalSpent: 4560
  },
  {
    id: '4',
    name: 'Lucas Petit',
    email: 'lucas.petit@email.com',
    phone: '+33 6 54 32 10 98',
    location: {
      address: '3 Rue de la République',
      city: 'Marseille',
      country: 'France',
      coordinates: { lat: 43.2965, lng: 5.3698 }
    },
    image: 'https://i.pravatar.cc/150?img=8',
    status: 'pending',
    joinedDate: '2024-09-05',
    lastActive: '2024-12-09',
    rating: 3.9,
    totalOrders: 12,
    totalSpent: 3200
  },


];

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
      className="relative inline-flex items-center justify-center w-10 h-10 rounded-full hover:bg-muted transition-colors"
      aria-label="Basculer le thème"
    >
      {isDark ? (
        <Sun className="w-5 h-5 transition-all" />
      ) : (
        <Moon className="w-5 h-5 transition-all" />
      )}
    </button>
  );
};

// Composant de carte intégrée
const MapView: React.FC<{ 
  lat: number; 
  lng: number; 
  name: string;
  address: string;
}> = ({ lat, lng, name, address }) => {
  const [isLoading, setIsLoading] = useState(false);

  const openInMaps = () => {
    setIsLoading(true);
    const url = `https://www.google.com/maps/search/?api=1&query=${lat},${lng}`;
    window.open(url, '_blank');
    setTimeout(() => setIsLoading(false), 1000);
  };

  return (
    <div className="relative w-full h-48 rounded-xl overflow-hidden bg-gradient-to-br from-muted to-muted/50 border border-border group">
      <div className="absolute inset-0 bg-grid-pattern opacity-10" />
      
      <div className="absolute inset-0 flex flex-col items-center justify-center p-4">
        <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mb-3 group-hover:scale-110 transition-transform duration-300">
          <MapPin className="w-8 h-8 text-primary/60" />
        </div>
        <p className="text-sm font-medium text-center">{name}</p>
        <p className="text-xs text-muted-foreground text-center mb-3">{address}</p>
        
        <div className="flex items-center gap-4 text-xs text-muted-foreground bg-background/80 backdrop-blur-sm px-3 py-1.5 rounded-full border border-border">
          <span className="flex items-center gap-1">
            <Crosshair className="w-3 h-3" />
            {lat.toFixed(6)}
          </span>
          <span className="w-px h-4 bg-border" />
          <span className="flex items-center gap-1">
            <Crosshair className="w-3 h-3" />
            {lng.toFixed(6)}
          </span>
        </div>
      </div>

      <button
        onClick={openInMaps}
        disabled={isLoading}
        className="absolute bottom-4 right-4 btn-theme-primary btn-sm shadow-lg hover:shadow-xl transition-all duration-300"
      >
        <LocateFixed className="w-4 h-4" />
        {isLoading ? 'Chargement...' : 'Localiser'}
      </button>

      <div className="absolute top-3 left-3 flex items-center gap-1.5 bg-background/80 backdrop-blur-sm px-2.5 py-1 rounded-full border border-border text-[10px] text-muted-foreground">
        <Map className="w-3 h-3" />
        Coordonnées GPS
      </div>
    </div>
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
        className="bg-background rounded-2xl shadow-2xl max-w-md w-full animate-scale-in border border-border"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="p-6 text-center">
          <div className="w-16 h-16 rounded-full bg-destructive/10 flex items-center justify-center mx-auto mb-4">
            <AlertTriangle className="w-8 h-8 text-destructive" />
          </div>
          <h3 className="text-xl font-display font-semibold mb-2">Confirmer la suppression</h3>
          <p className="text-muted-foreground text-sm mb-1">
            Êtes-vous sûr de vouloir supprimer le client
          </p>
          <p className="font-medium text-foreground">{client.name}</p>
          <p className="text-xs text-muted-foreground mt-1">
            Cette action est irréversible et supprimera toutes les données associées.
          </p>
        </div>

        <div className="flex flex-wrap gap-3 p-6 pt-0 border-t border-border">
          <button 
            onClick={onConfirm}
            className="btn-destructive flex-1 min-w-[120px]"
          >
            <Trash2 className="w-4 h-4" />
            Supprimer
          </button>
          <button 
            onClick={onCancel}
            className="btn-secondary flex-1 min-w-[120px]"
          >
            <X className="w-4 h-4" />
            Annuler
          </button>
        </div>
      </div>
    </div>
  );
};

// Composant de formulaire d'ajout de client
const AddClientForm: React.FC<{
  onSave: (client: Client) => void;
  onCancel: () => void;
}> = ({ onSave, onCancel }) => {
  const [formData, setFormData] = useState<Partial<Client>>({
    name: '',
    email: '',
    phone: '',
    location: {
      address: '',
      city: '',
      country: 'France',
      coordinates: { lat: 0, lng: 0 }
    },
    image: 'https://i.pravatar.cc/150?img=' + Math.floor(Math.random() * 70),
    status: 'active',
    joinedDate: new Date().toISOString().split('T')[0],
    lastActive: new Date().toISOString().split('T')[0],
    rating: 0,
    totalOrders: 0,
    totalSpent: 0
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
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

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const newClient: Client = {
      id: Date.now().toString(),
      name: formData.name || '',
      email: formData.email || '',
      phone: formData.phone || '',
      location: formData.location as Client['location'],
      image: formData.image || 'https://i.pravatar.cc/150?img=' + Math.floor(Math.random() * 70),
      status: formData.status as Client['status'] || 'active',
      joinedDate: formData.joinedDate || new Date().toISOString().split('T')[0],
      lastActive: formData.lastActive || new Date().toISOString().split('T')[0],
      rating: 0,
      totalOrders: 0,
      totalSpent: 0
    };
    onSave(newClient);
  };

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in"
      onClick={onCancel}
    >
      <div 
        className="bg-background rounded-2xl shadow-2xl max-w-3xl w-full max-h-[90vh] overflow-y-auto animate-scale-in border border-border"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="sticky top-0 bg-background/95 backdrop-blur-sm border-b border-border p-6 flex items-center justify-between z-10">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-primary/10">
              <Plus className="w-5 h-5 text-primary" />
            </div>
            <div>
              <h2 className="text-xl font-display font-semibold">Ajouter un client</h2>
              <p className="text-sm text-muted-foreground">Créez un nouveau client</p>
            </div>
          </div>
          <button 
            onClick={onCancel}
            className="p-2 rounded-full hover:bg-muted transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <h3 className="font-display font-medium text-sm uppercase tracking-wider text-muted-foreground flex items-center gap-2">
                <User className="w-4 h-4" />
                Informations personnelles
              </h3>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-1.5">Nom complet *</label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <input
                      type="text"
                      name="name"
                      value={formData.name}
                      onChange={handleChange}
                      className="input pl-10"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1.5">Email *</label>
                  <div className="relative">
                    <AtSign className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      className="input pl-10"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1.5">Téléphone *</label>
                  <div className="relative">
                    <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <input
                      type="tel"
                      name="phone"
                      value={formData.phone}
                      onChange={handleChange}
                      className="input pl-10"
                      required
                    />
                  </div>
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
            </div>

            <div className="space-y-4">
              <h3 className="font-display font-medium text-sm uppercase tracking-wider text-muted-foreground flex items-center gap-2">
                <MapPin className="w-4 h-4" />
                Localisation
              </h3>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-1.5">Adresse</label>
                  <div className="relative">
                    <Home className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <input
                      type="text"
                      name="location.address"
                      value={formData.location?.address || ''}
                      onChange={handleChange}
                      className="input pl-10"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1.5">Ville</label>
                  <input
                    type="text"
                    name="location.city"
                    value={formData.location?.city || ''}
                    onChange={handleChange}
                    className="input"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1.5">Pays</label>
                  <div className="relative">
                    <Globe className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <input
                      type="text"
                      name="location.country"
                      value={formData.location?.country || 'France'}
                      onChange={handleChange}
                      className="input pl-10"
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="flex flex-wrap gap-3 pt-4 border-t border-border">
            {/* ✅ Bouton Primary - s'adapte automatiquement au thème */}
            <button 
              type="submit" 
              className="
                flex-1 min-w-[120px] 
                inline-flex items-center justify-center gap-2 
                font-medium transition-all duration-300 
                rounded-lg px-6 py-2.5
                bg-foreground text-background 
                hover:bg-foreground/90 hover:shadow-md hover:-translate-y-0.5
                active:scale-95
                shadow-sm
              "
            >
              <Save className="w-4 h-4" />
              Ajouter le client
            </button>
            
            {/* ✅ Bouton Secondaire */}
            <button 
              type="button" 
              onClick={onCancel}
              className="
                flex-1 min-w-[120px] 
                inline-flex items-center justify-center gap-2 
                font-medium transition-all duration-300 
                rounded-lg px-6 py-2.5
                bg-secondary text-secondary-foreground 
                hover:bg-secondary/80 hover:shadow-sm hover:-translate-y-0.5
                active:scale-95
                border border-border
              "
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

// Composant de formulaire de modification
const EditClientForm: React.FC<{
  client: Client;
  onSave: (updatedClient: Client) => void;
  onCancel: () => void;
}> = ({ client, onSave, onCancel }) => {
  const [formData, setFormData] = useState<Client>({ ...client });
  const [imagePreview, setImagePreview] = useState<string>(client.image);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
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

  const handleCoordinateChange = (type: 'lat' | 'lng', value: string) => {
    const numValue = parseFloat(value);
    if (!isNaN(numValue)) {
      setFormData(prev => ({
        ...prev,
        location: {
          ...prev.location,
          coordinates: {
            ...prev.location.coordinates,
            [type]: numValue
          }
        }
      }));
    }
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
        setFormData(prev => ({ ...prev, image: reader.result as string }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData);
  };

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in"
      onClick={onCancel}
    >
      <div 
        className="bg-background rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto animate-scale-in border border-border"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="sticky top-0 bg-background/95 backdrop-blur-sm border-b border-border p-6 flex items-center justify-between z-10">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-primary/10">
              <Edit className="w-5 h-5 text-primary" />
            </div>
            <div>
              <h2 className="text-xl font-display font-semibold">Modifier le client</h2>
              <p className="text-sm text-muted-foreground">Modifiez les informations du client</p>
            </div>
          </div>
          <button 
            onClick={onCancel}
            className="p-2 rounded-full hover:bg-muted transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          <div className="flex flex-col items-center gap-4 pb-6 border-b border-border">
            <div className="relative">
              <div className="w-24 h-24 rounded-full overflow-hidden ring-4 ring-border">
                <img src={imagePreview} alt="Profile" className="w-full h-full object-cover" />
              </div>
              <label className="absolute bottom-0 right-0 p-2 rounded-full bg-primary text-primary-foreground cursor-pointer hover:bg-primary/90 transition-colors shadow-lg">
                <Camera className="w-4 h-4" />
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageChange}
                  className="hidden"
                />
              </label>
            </div>
            <p className="text-xs text-muted-foreground">Cliquez sur la caméra pour changer la photo</p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="space-y-4">
              <h3 className="font-display font-medium text-sm uppercase tracking-wider text-muted-foreground flex items-center gap-2">
                <User className="w-4 h-4" />
                Informations personnelles
              </h3>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-1.5">Nom complet</label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <input
                      type="text"
                      name="name"
                      value={formData.name}
                      onChange={handleChange}
                      className="input pl-10"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1.5">Email</label>
                  <div className="relative">
                    <AtSign className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      className="input pl-10"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1.5">Téléphone</label>
                  <div className="relative">
                    <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <input
                      type="tel"
                      name="phone"
                      value={formData.phone}
                      onChange={handleChange}
                      className="input pl-10"
                      required
                    />
                  </div>
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
            </div>

            <div className="space-y-4">
              <h3 className="font-display font-medium text-sm uppercase tracking-wider text-muted-foreground flex items-center gap-2">
                <MapPin className="w-4 h-4" />
                Localisation & Coordonnées
              </h3>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-1.5">Adresse</label>
                  <div className="relative">
                    <Home className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <input
                      type="text"
                      name="location.address"
                      value={formData.location.address}
                      onChange={handleChange}
                      className="input pl-10"
                      required
                    />
                  </div>
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
                  <label className="block text-sm font-medium mb-1.5">Pays</label>
                  <div className="relative">
                    <Globe className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <input
                      type="text"
                      name="location.country"
                      value={formData.location.country}
                      onChange={handleChange}
                      className="input pl-10"
                      required
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-sm font-medium mb-1.5 flex items-center gap-1">
                      <Crosshair className="w-3 h-3" />
                      Latitude
                    </label>
                    <input
                      type="number"
                      step="any"
                      value={formData.location.coordinates?.lat || ''}
                      onChange={(e) => handleCoordinateChange('lat', e.target.value)}
                      className="input"
                      placeholder="48.8566"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1.5 flex items-center gap-1">
                      <Crosshair className="w-3 h-3" />
                      Longitude
                    </label>
                    <input
                      type="number"
                      step="any"
                      value={formData.location.coordinates?.lng || ''}
                      onChange={(e) => handleCoordinateChange('lng', e.target.value)}
                      className="input"
                      placeholder="2.3522"
                    />
                  </div>
                </div>

                <button
                  type="button"
                  className="
                    w-full 
                    inline-flex items-center justify-center gap-2 
                    font-medium transition-all duration-300 
                    rounded-lg px-6 py-2.5
                    bg-foreground text-background 
                    hover:bg-foreground/90 hover:shadow-md hover:-translate-y-0.5
                    active:scale-95
                    shadow-sm
                  "
                  onClick={() => {
                    if (navigator.geolocation) {
                      navigator.geolocation.getCurrentPosition(
                        (position) => {
                          setFormData(prev => ({
                            ...prev,
                            location: {
                              ...prev.location,
                              coordinates: {
                                lat: position.coords.latitude,
                                lng: position.coords.longitude
                              }
                            }
                          }));
                        },
                        (error) => {
                          alert('Impossible de récupérer la position: ' + error.message);
                        }
                      );
                    } else {
                      alert('La géolocalisation n\'est pas supportée par votre navigateur');
                    }
                  }}
                >
                  <LocateFixed className="w-4 h-4" />
                  Utiliser ma position actuelle
                </button>
              </div>
            </div>
          </div>

          {formData.location.coordinates?.lat && formData.location.coordinates?.lng && (
            <div className="space-y-3">
              <h3 className="font-display font-medium text-sm uppercase tracking-wider text-muted-foreground flex items-center gap-2">
                <Map className="w-4 h-4" />
                Aperçu de la localisation
              </h3>
              <MapView
                lat={formData.location.coordinates.lat}
                lng={formData.location.coordinates.lng}
                name={formData.name}
                address={`${formData.location.address}, ${formData.location.city}`}
              />
            </div>
          )}

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 p-4 rounded-xl bg-muted/30 border border-border">
            <div className="text-center">
              <p className="text-xs text-muted-foreground">Note</p>
              <div className="flex items-center justify-center gap-1 mt-1">
                <Star className="w-4 h-4 text-yellow-500 fill-yellow-500" />
                <span className="font-medium">{formData.rating}</span>
              </div>
            </div>
            <div className="text-center">
              <p className="text-xs text-muted-foreground">Commandes</p>
              <p className="font-medium mt-1">{formData.totalOrders}</p>
            </div>
            <div className="text-center">
              <p className="text-xs text-muted-foreground">Dépensé</p>
              <p className="font-medium mt-1">{formData.totalSpent.toLocaleString()}€</p>
            </div>
            <div className="text-center">
              <p className="text-xs text-muted-foreground">Inscrit le</p>
              <p className="font-medium mt-1 text-sm">{new Date(formData.joinedDate).toLocaleDateString('fr-FR')}</p>
            </div>
          </div>

          <div className="flex flex-wrap gap-3 pt-4 border-t border-border">
            {/* ✅ Bouton Primary - s'adapte automatiquement au thème */}
            <button 
              type="submit" 
              className="
                flex-1 min-w-[120px] 
                inline-flex items-center justify-center gap-2 
                font-medium transition-all duration-300 
                rounded-lg px-6 py-2.5
                bg-foreground text-background 
                hover:bg-foreground/90 hover:shadow-md hover:-translate-y-0.5
                active:scale-95
                shadow-sm
              "
            >
              <Save className="w-4 h-4" />
              Enregistrer
            </button>
            
            {/* ✅ Bouton Secondaire */}
            <button 
              type="button" 
              onClick={onCancel}
              className="
                flex-1 min-w-[120px] 
                inline-flex items-center justify-center gap-2 
                font-medium transition-all duration-300 
                rounded-lg px-6 py-2.5
                bg-secondary text-secondary-foreground 
                hover:bg-secondary/80 hover:shadow-sm hover:-translate-y-0.5
                active:scale-95
                border border-border
              "
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

// Composant de vue détaillée
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
        className="bg-background rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto animate-scale-in border border-border"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="sticky top-0 bg-background/95 backdrop-blur-sm border-b border-border p-6 flex items-start justify-between z-10">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-full overflow-hidden ring-2 ring-border">
              <img src={client.image} alt={client.name} className="w-full h-full object-cover" />
            </div>
            <div>
              <h2 className="text-2xl font-display font-semibold">{client.name}</h2>
              <p className="text-sm text-muted-foreground">{client.email}</p>
              <div className="flex items-center gap-2 mt-1">
                <span className={`badge ${client.status === 'active' ? 'badge-primary' : client.status === 'pending' ? 'bg-warning/10 text-warning' : 'bg-muted text-muted-foreground'}`}>
                  {client.status === 'active' ? 'Actif' : client.status === 'pending' ? 'En attente' : 'Inactif'}
                </span>
              </div>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="p-2 rounded-full hover:bg-muted transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <h3 className="font-display font-medium text-sm uppercase tracking-wider text-muted-foreground">
                Informations personnelles
              </h3>
              <div className="space-y-3">
                <div className="flex items-center gap-3 text-sm p-3 rounded-lg bg-muted/30">
                  <Phone className="w-4 h-4 text-muted-foreground" />
                  <span>{client.phone}</span>
                </div>
                <div className="flex items-center gap-3 text-sm p-3 rounded-lg bg-muted/30">
                  <Calendar className="w-4 h-4 text-muted-foreground" />
                  <span>Inscrit le {new Date(client.joinedDate).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' })}</span>
                </div>
                <div className="flex items-center gap-3 text-sm p-3 rounded-lg bg-muted/30">
                  <Clock className="w-4 h-4 text-muted-foreground" />
                  <span>Dernière activité : {new Date(client.lastActive).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' })}</span>
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <h3 className="font-display font-medium text-sm uppercase tracking-wider text-muted-foreground">
                Localisation
              </h3>
              <div className="space-y-3">
                <div className="flex items-start gap-3 text-sm p-3 rounded-lg bg-muted/30">
                  <MapPin className="w-4 h-4 text-muted-foreground mt-0.5" />
                  <div>
                    <p className="font-medium">{client.location.address}</p>
                    <p className="text-muted-foreground">{client.location.city}, {client.location.country}</p>
                    {client.location.coordinates && (
                      <div className="flex items-center gap-2 mt-1 text-xs text-muted-foreground">
                        <Crosshair className="w-3 h-3" />
                        <span>{client.location.coordinates.lat.toFixed(6)}, {client.location.coordinates.lng.toFixed(6)}</span>
                      </div>
                    )}
                  </div>
                </div>
                
                {client.location.coordinates && (
                  <MapView
                    lat={client.location.coordinates.lat}
                    lng={client.location.coordinates.lng}
                    name={client.name}
                    address={`${client.location.address}, ${client.location.city}`}
                  />
                )}
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <h3 className="font-display font-medium text-sm uppercase tracking-wider text-muted-foreground">
              Statistiques
            </h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="bg-gradient-to-br from-muted/30 to-muted/10 rounded-xl p-4 text-center border border-border/50">
                <Star className="w-5 h-5 text-yellow-500 fill-yellow-500 mx-auto mb-1" />
                <div className="text-2xl font-display font-semibold">{client.rating}</div>
                <p className="text-xs text-muted-foreground mt-1">Note moyenne</p>
              </div>
              <div className="bg-gradient-to-br from-muted/30 to-muted/10 rounded-xl p-4 text-center border border-border/50">
                <ShoppingBag className="w-5 h-5 text-primary/60 mx-auto mb-1" />
                <div className="text-2xl font-display font-semibold">{client.totalOrders}</div>
                <p className="text-xs text-muted-foreground mt-1">Commandes</p>
              </div>
              <div className="bg-gradient-to-br from-muted/30 to-muted/10 rounded-xl p-4 text-center border border-border/50">
                <DollarSign className="w-5 h-5 text-green-500/60 mx-auto mb-1" />
                <div className="text-2xl font-display font-semibold">{client.totalSpent.toLocaleString()}€</div>
                <p className="text-xs text-muted-foreground mt-1">Total dépensé</p>
              </div>
              <div className="bg-gradient-to-br from-muted/30 to-muted/10 rounded-xl p-4 text-center border border-border/50">
                <TrendingUp className="w-5 h-5 text-blue-500/60 mx-auto mb-1" />
                <div className="text-2xl font-display font-semibold">
                  {Math.round(client.totalSpent / client.totalOrders || 0)}€
                </div>
                <p className="text-xs text-muted-foreground mt-1">Panier moyen</p>
              </div>
            </div>
          </div>

          <div className="flex flex-wrap gap-3 pt-4 border-t border-border">
            {/* ✅ Bouton Primary - s'adapte automatiquement au thème */}
            <button 
              onClick={onEdit}
              className="
                flex-1 min-w-[120px] 
                inline-flex items-center justify-center gap-2 
                font-medium transition-all duration-300 
                rounded-lg px-6 py-2.5
                bg-foreground text-background 
                hover:bg-foreground/90 hover:shadow-md hover:-translate-y-0.5
                active:scale-95
                shadow-sm
              "
            >
              <Edit className="w-4 h-4" />
              Modifier
            </button>
            
            {/* ✅ Bouton Secondaire */}
            <button 
              className="
                flex-1 min-w-[120px] 
                inline-flex items-center justify-center gap-2 
                font-medium transition-all duration-300 
                rounded-lg px-6 py-2.5
                bg-secondary text-secondary-foreground 
                hover:bg-secondary/80 hover:shadow-sm hover:-translate-y-0.5
                active:scale-95
                border border-border
              "
            >
              <Mail className="w-4 h-4" />
              Contacter
            </button>
            
            {/* ✅ Bouton Destructive */}
            <button 
              onClick={onDelete}
              className="
                flex-1 min-w-[120px] 
                inline-flex items-center justify-center gap-2 
                font-medium transition-all duration-300 
                rounded-lg px-6 py-2.5
                bg-destructive text-destructive-foreground 
                hover:bg-destructive/90 hover:shadow-md hover:-translate-y-0.5
                active:scale-95
                shadow-sm
              "
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
const ClientDashboard: React.FC = () => {
  const [clients, setClients] = useState<Client[]>(mockClients);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedClient, setSelectedClient] = useState<Client | null>(null);
  const [editingClient, setEditingClient] = useState<Client | null>(null);
  const [addingClient, setAddingClient] = useState(false);
  const [deletingClient, setDeletingClient] = useState<Client | null>(null);
  const [statusFilter, setStatusFilter] = useState<'all' | Client['status']>('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [sortField, setSortField] = useState<keyof Client>('name');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');
  const clientsPerPage = 10;

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

  // Tri des clients
  const sortedClients = [...filteredClients].sort((a, b) => {
    const aValue = a[sortField];
    const bValue = b[sortField];
    if (typeof aValue === 'string' && typeof bValue === 'string') {
      return sortDirection === 'asc' ? aValue.localeCompare(bValue) : bValue.localeCompare(aValue);
    }
    if (typeof aValue === 'number' && typeof bValue === 'number') {
      return sortDirection === 'asc' ? aValue - bValue : bValue - aValue;
    }
    return 0;
  });

  // Pagination
  const indexOfLastClient = currentPage * clientsPerPage;
  const indexOfFirstClient = indexOfLastClient - clientsPerPage;
  const currentClients = sortedClients.slice(indexOfFirstClient, indexOfLastClient);
  const totalPages = Math.ceil(sortedClients.length / clientsPerPage);

  // Statistiques
  const stats = {
    total: clients.length,
    active: clients.filter(c => c.status === 'active').length,
    inactive: clients.filter(c => c.status === 'inactive').length,
    pending: clients.filter(c => c.status === 'pending').length,
    totalSpent: clients.reduce((acc, c) => acc + c.totalSpent, 0),
    averageRating: clients.reduce((acc, c) => acc + c.rating, 0) / clients.length
  };

  const handleSort = (field: keyof Client) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  const handleEditClient = (client: Client) => {
    setEditingClient(client);
    setSelectedClient(null);
  };

  const handleSaveClient = (updatedClient: Client) => {
    setClients(prev => prev.map(c => 
      c.id === updatedClient.id ? updatedClient : c
    ));
    setEditingClient(null);
    setSelectedClient(updatedClient);
  };

  const handleAddClient = (newClient: Client) => {
    setClients(prev => [...prev, newClient]);
    setAddingClient(false);
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

  const getStatusBadge = (status: Client['status']) => {
    switch (status) {
      case 'active':
        return <span className="badge badge-primary gap-1"><CheckCircle className="w-3 h-3" /> Actif</span>;
      case 'pending':
        return <span className="badge bg-warning/10 text-warning gap-1"><Clock className="w-3 h-3" /> En attente</span>;
      case 'inactive':
        return <span className="badge bg-muted text-muted-foreground gap-1"><AlertCircle className="w-3 h-3" /> Inactif</span>;
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Barre de navigation */}
      <header className="border-b border-border bg-background/95 backdrop-blur-sm sticky top-0 z-40 flex-shrink-0">
        <div className="px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-primary/10">
              <Users className="w-5 h-5 text-primary" />
            </div>
            <div>
              <h1 className="text-xl font-display font-bold tracking-tight">Dashboard Clients</h1>
              <p className="text-xs text-muted-foreground hidden sm:block">Gestion et suivi de votre portefeuille clients</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <ThemeToggle />
            {/* ✅ Bouton Primary - s'adapte automatiquement au thème */}
            <button 
              className="
                inline-flex items-center justify-center gap-2 
                font-medium transition-all duration-300 
                rounded-lg px-4 py-2 text-sm
                bg-foreground text-background 
                hover:bg-foreground/90 hover:shadow-md hover:-translate-y-0.5
                active:scale-95
                shadow-sm
              "
              onClick={() => setAddingClient(true)}
            >
              <Plus className="w-4 h-4" />
              <span className="hidden sm:inline">Ajouter un client</span>
            </button>
          </div>
        </div>
      </header>

      {/* Contenu principal */}
      <div className="flex-1 px-4 sm:px-6 lg:px-8 py-6 overflow-x-auto">
        {/* Statistiques */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-6">
          <div className="card p-4 hover:shadow-md transition-all hover:scale-[1.02]">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-muted-foreground font-medium uppercase tracking-wider">Total</p>
                <p className="text-2xl font-display font-bold">{stats.total}</p>
              </div>
              <Users className="w-8 h-8 text-muted-foreground/30" />
            </div>
          </div>
          <div className="card p-4 border-success/20 hover:shadow-md transition-all hover:scale-[1.02]">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-muted-foreground font-medium uppercase tracking-wider">Actifs</p>
                <p className="text-2xl font-display font-bold text-success">{stats.active}</p>
              </div>
              <Activity className="w-8 h-8 text-success/30" />
            </div>
          </div>
          <div className="card p-4 border-warning/20 hover:shadow-md transition-all hover:scale-[1.02]">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-muted-foreground font-medium uppercase tracking-wider">En attente</p>
                <p className="text-2xl font-display font-bold text-warning">{stats.pending}</p>
              </div>
              <Clock className="w-8 h-8 text-warning/30" />
            </div>
          </div>
          <div className="card p-4 border-muted/20 hover:shadow-md transition-all hover:scale-[1.02]">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-muted-foreground font-medium uppercase tracking-wider">Inactifs</p>
                <p className="text-2xl font-display font-bold text-muted-foreground">{stats.inactive}</p>
              </div>
              <AlertCircle className="w-8 h-8 text-muted-foreground/30" />
            </div>
          </div>
          <div className="card p-4 hover:shadow-md transition-all hover:scale-[1.02]">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-muted-foreground font-medium uppercase tracking-wider">Dépenses</p>
                <p className="text-xl font-display font-bold">{stats.totalSpent.toLocaleString()}€</p>
              </div>
              <DollarSign className="w-8 h-8 text-green-500/30" />
            </div>
          </div>
          <div className="card p-4 hover:shadow-md transition-all hover:scale-[1.02]">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-muted-foreground font-medium uppercase tracking-wider">Note avg</p>
                <div className="flex items-center gap-1">
                  <Star className="w-4 h-4 text-yellow-500 fill-yellow-500" />
                  <p className="text-xl font-display font-bold">{stats.averageRating.toFixed(1)}</p>
                </div>
              </div>
              <Award className="w-8 h-8 text-yellow-500/30" />
            </div>
          </div>
        </div>

        {/* Filtres et recherche */}
        <div className="flex flex-col sm:flex-row gap-4 mb-6">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <input
              type="text"
              placeholder="Rechercher par nom, email, ville ou téléphone..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="input pl-10"
            />
          </div>
          <div className="flex items-center gap-2">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as typeof statusFilter)}
              className="input w-auto min-w-[140px]"
            >
              <option value="all">📊 Tous les statuts</option>
              <option value="active">✅ Actifs</option>
              <option value="pending">⏳ En attente</option>
              <option value="inactive">❌ Inactifs</option>
            </select>
          </div>
        </div>

        {/* Tableau */}
        {sortedClients.length === 0 ? (
          <div className="text-center py-16">
            <Search className="w-12 h-12 text-muted-foreground/30 mx-auto mb-4" />
            <h3 className="text-lg font-display font-medium">Aucun client trouvé</h3>
            <p className="text-muted-foreground text-sm mt-1">Essayez de modifier vos critères de recherche</p>
          </div>
        ) : (
          <>
            <div className="card overflow-hidden border border-border">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-border bg-muted/30">
                      <th className="text-left py-3 px-4 text-xs font-medium uppercase tracking-wider text-muted-foreground">
                        <button 
                          onClick={() => handleSort('name')}
                          className="flex items-center gap-1 hover:text-foreground transition-colors"
                        >
                          Client
                          <ArrowUpDown className="w-3 h-3" />
                        </button>
                      </th>
                      <th className="text-left py-3 px-4 text-xs font-medium uppercase tracking-wider text-muted-foreground hidden md:table-cell">
                        <button 
                          onClick={() => handleSort('email')}
                          className="flex items-center gap-1 hover:text-foreground transition-colors"
                        >
                          Contact
                          <ArrowUpDown className="w-3 h-3" />
                        </button>
                      </th>
                      <th className="text-left py-3 px-4 text-xs font-medium uppercase tracking-wider text-muted-foreground hidden lg:table-cell">
                        <button 
                          onClick={() => handleSort('location')}
                          className="flex items-center gap-1 hover:text-foreground transition-colors"
                        >
                          Localisation
                          <ArrowUpDown className="w-3 h-3" />
                        </button>
                      </th>
                      <th className="text-center py-3 px-4 text-xs font-medium uppercase tracking-wider text-muted-foreground hidden sm:table-cell">
                        <button 
                          onClick={() => handleSort('status')}
                          className="flex items-center gap-1 hover:text-foreground transition-colors"
                        >
                          Statut
                          <ArrowUpDown className="w-3 h-3" />
                        </button>
                      </th>
                      <th className="text-center py-3 px-4 text-xs font-medium uppercase tracking-wider text-muted-foreground">
                        <button 
                          onClick={() => handleSort('rating')}
                          className="flex items-center gap-1 hover:text-foreground transition-colors"
                        >
                          Note
                          <ArrowUpDown className="w-3 h-3" />
                        </button>
                      </th>
                      <th className="text-center py-3 px-4 text-xs font-medium uppercase tracking-wider text-muted-foreground hidden sm:table-cell">
                        <button 
                          onClick={() => handleSort('totalOrders')}
                          className="flex items-center gap-1 hover:text-foreground transition-colors"
                        >
                          Commandes
                          <ArrowUpDown className="w-3 h-3" />
                        </button>
                      </th>
                      <th className="text-center py-3 px-4 text-xs font-medium uppercase tracking-wider text-muted-foreground hidden md:table-cell">
                        <button 
                          onClick={() => handleSort('totalSpent')}
                          className="flex items-center gap-1 hover:text-foreground transition-colors"
                        >
                          Dépensé
                          <ArrowUpDown className="w-3 h-3" />
                        </button>
                      </th>
                      <th className="text-right py-3 px-4 text-xs font-medium uppercase tracking-wider text-muted-foreground">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {currentClients.map((client) => (
                      <tr 
                        key={client.id}
                        className="border-b border-border hover:bg-muted/20 transition-colors cursor-pointer"
                        onClick={() => setSelectedClient(client)}
                      >
                        <td className="py-3 px-4">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full overflow-hidden ring-2 ring-border flex-shrink-0">
                              <img src={client.image} alt={client.name} className="w-full h-full object-cover" />
                            </div>
                            <div>
                              <p className="font-medium text-sm">{client.name}</p>
                              <p className="text-xs text-muted-foreground md:hidden">{client.email}</p>
                            </div>
                          </div>
                        </td>
                        <td className="py-3 px-4 hidden md:table-cell">
                          <div className="space-y-1">
                            <p className="text-sm">{client.email}</p>
                            <p className="text-xs text-muted-foreground">{client.phone}</p>
                          </div>
                        </td>
                        <td className="py-3 px-4 hidden lg:table-cell">
                          <div className="flex items-start gap-2">
                            <MapPin className="w-4 h-4 text-muted-foreground flex-shrink-0 mt-0.5" />
                            <div>
                              <p className="text-sm truncate max-w-[150px]">{client.location.address}</p>
                              <p className="text-xs text-muted-foreground">{client.location.city}</p>
                              {client.location.coordinates && (
                                <p className="text-[10px] text-muted-foreground/60 flex items-center gap-1">
                                  <Crosshair className="w-2.5 h-2.5" />
                                  {client.location.coordinates.lat.toFixed(4)}, {client.location.coordinates.lng.toFixed(4)}
                                </p>
                              )}
                            </div>
                          </div>
                        </td>
                        <td className="py-3 px-4 text-center hidden sm:table-cell">
                          {getStatusBadge(client.status)}
                        </td>
                        <td className="py-3 px-4 text-center">
                          <div className="flex items-center justify-center gap-1">
                            <Star className="w-3.5 h-3.5 text-yellow-500 fill-yellow-500" />
                            <span className="font-medium">{client.rating}</span>
                          </div>
                        </td>
                        <td className="py-3 px-4 text-center hidden sm:table-cell">
                          <span className="font-medium">{client.totalOrders}</span>
                        </td>
                        <td className="py-3 px-4 text-center hidden md:table-cell">
                          <span className="font-medium">{client.totalSpent.toLocaleString()}€</span>
                        </td>
                        <td className="py-3 px-4 text-right">
                          <div className="flex items-center justify-end gap-1">
                            <button 
                              className="p-1.5 rounded-md hover:bg-muted transition-colors"
                              onClick={(e) => {
                                e.stopPropagation();
                                setSelectedClient(client);
                              }}
                            >
                              <Eye className="w-4 h-4 text-muted-foreground hover:text-foreground" />
                            </button>
                            <button 
                              className="p-1.5 rounded-md hover:bg-muted transition-colors"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleEditClient(client);
                              }}
                            >
                              <Edit className="w-4 h-4 text-muted-foreground hover:text-foreground" />
                            </button>
                            <button 
                              className="p-1.5 rounded-md hover:bg-destructive/10 transition-colors"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleDeleteClient(client);
                              }}
                            >
                              <Trash2 className="w-4 h-4 text-muted-foreground hover:text-destructive" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex items-center justify-between mt-6 flex-wrap gap-4">
                <p className="text-sm text-muted-foreground">
                  {indexOfFirstClient + 1} - {Math.min(indexOfLastClient, sortedClients.length)} sur {sortedClients.length} clients
                </p>
                <div className="flex items-center gap-1">
                  <button
                    onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                    disabled={currentPage === 1}
                    className="p-2 rounded-md hover:bg-muted transition-colors disabled:opacity-50 disabled:hover:bg-transparent"
                  >
                    <ChevronLeft className="w-4 h-4" />
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
                        className={`w-8 h-8 rounded-md transition-colors text-sm ${
                          currentPage === pageNum 
                            ? 'bg-foreground text-background font-medium' 
                            : 'hover:bg-muted text-muted-foreground'
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
                        className="w-8 h-8 rounded-md hover:bg-muted transition-colors text-sm text-muted-foreground"
                      >
                        {totalPages}
                      </button>
                    </>
                  )}
                  <button
                    onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                    disabled={currentPage === totalPages}
                    className="p-2 rounded-md hover:bg-muted transition-colors disabled:opacity-50 disabled:hover:bg-transparent"
                  >
                    <ChevronRight className="w-4 h-4" />
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

      {addingClient && (
        <AddClientForm
          onSave={handleAddClient}
          onCancel={() => setAddingClient(false)}
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

export default ClientDashboard;