// src/components/ActionLivreur/LivreurLivraisons.tsx
import React, { useState, useEffect } from 'react';
import {
    Search,
    Eye,
    CheckCircle,
    XCircle,
    Clock,
    MapPin,
    Navigation,
    Phone,
    User,
    DollarSign,
    Filter,
    Package,
    Camera,
    X,
    ChevronLeft,
    ChevronRight,
    Truck,
    Calendar,
    ChevronDown
} from 'lucide-react';

interface Livraison {
    id: string;
    trackingNumber: string;
    clientName: string;
    clientPhone: string;
    clientAddress: string;
    destinationAddress: string;
    status: 'pending' | 'pickup' | 'in_transit' | 'delivered' | 'cancelled';
    amount: number;
    createdAt: Date;
    deliveredAt?: Date;
    estimatedDelivery: Date;
    clientPhotos?: string[];
    deliveryLocation?: {
        lat: number;
        lng: number;
    };
}

const LivreurLivraisons: React.FC = () => {
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState<string>('all');
    const [selectedDelivery, setSelectedDelivery] = useState<Livraison | null>(null);
    const [showDetailsModal, setShowDetailsModal] = useState(false);
    const [hoveredRow, setHoveredRow] = useState<string | null>(null);
    const [selectedPhotoIndex, setSelectedPhotoIndex] = useState<number>(0);
    const [showFullPhoto, setShowFullPhoto] = useState(false);

    const [livraisons] = useState<Livraison[]>([
        {
            id: '1',
            trackingNumber: 'TRK-2024-001',
            clientName: 'Marie Martin',
            clientPhone: '+33 6 12 34 56 78',
            clientAddress: '15 Rue de la Paix, 75002 Paris',
            destinationAddress: '45 Avenue des Champs-Élysées, 75008 Paris',
            status: 'in_transit',
            amount: 25.90,
            createdAt: new Date('2024-01-15'),
            estimatedDelivery: new Date(Date.now() + 3600000),
            deliveryLocation: { lat: 48.8698, lng: 2.3074 },
            clientPhotos: [
                'https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?w=400',
                'https://images.unsplash.com/photo-1566576721346-d4a3b4eaeb55?w=400',
                'https://images.unsplash.com/photo-1560343090-f0409e92791a?w=400',
            ]
        },
        {
            id: '2',
            trackingNumber: 'TRK-2024-002',
            clientName: 'Thomas Bernard',
            clientPhone: '+33 6 23 45 67 89',
            clientAddress: '8 Boulevard Saint-Germain, 75005 Paris',
            destinationAddress: '12 Rue de Rivoli, 75004 Paris',
            status: 'delivered',
            amount: 32.50,
            createdAt: new Date('2024-01-14'),
            deliveredAt: new Date('2024-01-14T16:30:00'),
            estimatedDelivery: new Date('2024-01-14T17:00:00'),
            deliveryLocation: { lat: 48.8566, lng: 2.3522 },
            clientPhotos: [
                'https://images.unsplash.com/photo-1580674285054-bed31e145f59?w=400',
            ]
        },
        {
            id: '3',
            trackingNumber: 'TRK-2024-003',
            clientName: 'Sophie Dubois',
            clientPhone: '+33 6 34 56 78 90',
            clientAddress: '23 Rue Monge, 75005 Paris',
            destinationAddress: '78 Rue de Sèvres, 75007 Paris',
            status: 'pending',
            amount: 18.75,
            createdAt: new Date('2024-01-15'),
            estimatedDelivery: new Date(Date.now() + 7200000),
            deliveryLocation: { lat: 48.8519, lng: 2.3050 },
            clientPhotos: []
        }
    ]);

    useEffect(() => {
        if (showDetailsModal || showFullPhoto) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = 'unset';
        }
        return () => {
            document.body.style.overflow = 'unset';
        };
    }, [showDetailsModal, showFullPhoto]);

    const getStatusConfig = (status: string) => {
        const config: Record<string, { label: string; bg: string; text: string; icon: any }> = {
            pending: { label: 'En attente', bg: 'bg-amber-500/10', text: 'text-amber-600', icon: Clock },
            pickup: { label: 'À prendre', bg: 'bg-blue-500/10', text: 'text-blue-600', icon: MapPin },
            in_transit: { label: 'En transit', bg: 'bg-purple-500/10', text: 'text-purple-600', icon: Navigation },
            delivered: { label: 'Livrée', bg: 'bg-emerald-500/10', text: 'text-emerald-600', icon: CheckCircle },
            cancelled: { label: 'Annulée', bg: 'bg-red-500/10', text: 'text-red-600', icon: XCircle }
        };
        return config[status] || config.pending;
    };

    const getTimeRemaining = (date: Date) => {
        const diff = date.getTime() - Date.now();
        const hours = Math.floor(diff / (1000 * 60 * 60));
        const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
        if (hours > 0) return `${hours}h ${minutes}min`;
        if (minutes > 0) return `${minutes}min`;
        return 'Très bientôt';
    };

    const filteredLivraisons = livraisons.filter(livraison => {
        const matchesSearch = livraison.trackingNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
            livraison.clientName.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesStatus = statusFilter === 'all' || livraison.status === statusFilter;
        return matchesSearch && matchesStatus;
    });

    const statsCards = [
        { label: 'À livrer', value: livraisons.filter(l => l.status === 'pending' || l.status === 'pickup').length, icon: Package, color: 'from-blue-500 to-cyan-500' },
        { label: 'En cours', value: livraisons.filter(l => l.status === 'in_transit').length, icon: Navigation, color: 'from-purple-500 to-indigo-500' },
        { label: 'Livrées', value: livraisons.filter(l => l.status === 'delivered').length, icon: CheckCircle, color: 'from-emerald-500 to-teal-500' },
        { label: 'Gains', value: `${livraisons.reduce((sum, l) => sum + (l.status === 'delivered' ? l.amount : 0), 0)} €`, icon: DollarSign, color: 'from-primary to-primary/80' }
    ];

    const MapView = ({ address }: { address: string }) => {
        const mapUrl = `https://maps.google.com/maps?q=${encodeURIComponent(address)}&output=embed`;

        return (
            <div className="rounded-xl overflow-hidden border border-border/50">
                <iframe
                    title="map"
                    src={mapUrl}
                    width="100%"
                    height="180"
                    style={{ border: 0 }}
                    allowFullScreen
                    loading="lazy"
                />
                <div className="p-2.5 bg-muted/20 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <MapPin className="w-3.5 h-3.5 text-primary" />
                        <p className="text-xs text-muted-foreground truncate max-w-[200px]">{address}</p>
                    </div>
                    <a
                        href={`https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(address)}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-xs text-primary hover:underline flex items-center gap-1"
                    >
                        <Navigation className="w-3 h-3" />
                        Itinéraire
                    </a>
                </div>
            </div>
        );
    };

    const ClientPhotos = ({ photos, clientName }: { photos?: string[]; clientName: string }) => {
        if (!photos || photos.length === 0) {
            return (
                <div className="p-4 rounded-lg bg-muted/20 border border-dashed border-border text-center">
                    <Camera className="w-7 h-7 text-muted-foreground mx-auto mb-2" />
                    <p className="text-sm text-muted-foreground">Aucune photo du client</p>
                </div>
            );
        }

        return (
            <div>
                <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                        <Camera className="w-4 h-4 text-primary" />
                        <span className="text-sm font-medium text-muted-foreground">Photos client</span>
                    </div>
                    <span className="text-xs text-muted-foreground">{photos.length} photo{photos.length > 1 ? 's' : ''}</span>
                </div>
                <div className="grid grid-cols-3 gap-2">
                    {photos.slice(0, 3).map((photo, idx) => (
                        <button
                            key={idx}
                            onClick={() => {
                                setSelectedPhotoIndex(idx);
                                setShowFullPhoto(true);
                            }}
                            className="relative group overflow-hidden rounded-lg aspect-square bg-muted/30 hover:shadow-md transition-all"
                        >
                            <img
                                src={photo}
                                alt={`Photo ${idx + 1}`}
                                className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                            />
                            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-all duration-300 flex items-center justify-center">
                                <Eye className="w-4 h-4 text-white" />
                            </div>
                        </button>
                    ))}
                    {photos.length > 3 && (
                        <button
                            onClick={() => {
                                setSelectedPhotoIndex(0);
                                setShowFullPhoto(true);
                            }}
                            className="rounded-lg bg-gradient-to-br from-primary/20 to-primary/10 flex items-center justify-center text-sm font-bold text-primary hover:scale-105 transition-transform"
                        >
                            +{photos.length - 3}
                        </button>
                    )}
                </div>
            </div>
        );
    };

    return (
        <div className="space-y-5 animate-fade-up">
            {/* Header */}
            <div>
                <h1 className="text-2xl font-display font-bold tracking-tight">Mes livraisons</h1>
                <p className="text-sm text-muted-foreground mt-1">Suivez et gérez toutes vos livraisons</p>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                {statsCards.map((stat, index) => (
                    <div
                        key={stat.label}
                        className="relative overflow-hidden rounded-xl bg-card border border-border/50 p-4 hover:shadow-md transition-all hover:-translate-y-0.5"
                    >
                        <div className="flex items-center gap-3">
                            <div className={`w-10 h-10 rounded-lg bg-gradient-to-br ${stat.color} flex items-center justify-center`}>
                                <stat.icon className="w-5 h-5 text-white" />
                            </div>
                            <div>
                                <p className="text-xl font-bold">{stat.value}</p>
                                <p className="text-xs text-muted-foreground">{stat.label}</p>
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {/* Filters */}
            <div className="rounded-xl bg-card border border-border/50 p-4">
                <div className="flex flex-col sm:flex-row gap-4">
                    <div className="flex-1 relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                        <input
                            type="text"
                            placeholder="Rechercher par n° de suivi ou client..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full pl-9 pr-3 py-2 text-sm rounded-lg bg-muted/30 border border-border/50 focus:border-primary/50 focus:outline-none focus:ring-1 focus:ring-primary/20"
                        />
                    </div>
                    <div className="relative">
                        <Filter className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                        <select
                            value={statusFilter}
                            onChange={(e) => setStatusFilter(e.target.value)}
                            className="pl-9 pr-8 py-2 text-sm rounded-lg bg-muted/30 border border-border/50 focus:border-primary/50 focus:outline-none focus:ring-1 focus:ring-primary/20 appearance-none cursor-pointer sm:w-36"
                        >
                            <option value="all">Tous les statuts</option>
                            <option value="pending">En attente</option>
                            <option value="pickup">À prendre</option>
                            <option value="in_transit">En transit</option>
                            <option value="delivered">Livrées</option>
                            <option value="cancelled">Annulées</option>
                        </select>
                        <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
                    </div>
                </div>
            </div>

            {/* Tableau */}
            <div className="rounded-xl bg-card border border-border/50 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead className="bg-muted/30">
                            <tr>
                                <th className="text-left py-3 px-4 text-xs font-semibold uppercase text-muted-foreground">N° suivi</th>
                                <th className="text-left py-3 px-4 text-xs font-semibold uppercase text-muted-foreground">Client</th>
                                <th className="text-left py-3 px-4 text-xs font-semibold uppercase text-muted-foreground hidden md:table-cell">Destination</th>
                                <th className="text-left py-3 px-4 text-xs font-semibold uppercase text-muted-foreground">Montant</th>
                                <th className="text-left py-3 px-4 text-xs font-semibold uppercase text-muted-foreground">Statut</th>
                                <th className="text-left py-3 px-4 text-xs font-semibold uppercase text-muted-foreground">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredLivraisons.map((livraison) => {
                                const statusConfig = getStatusConfig(livraison.status);
                                const StatusIcon = statusConfig.icon;
                                const isDelivered = livraison.status === 'delivered';
                                const isCancelled = livraison.status === 'cancelled';

                                return (
                                    <tr
                                        key={livraison.id}
                                        className={`border-t border-border/50 transition-all ${hoveredRow === livraison.id ? 'bg-muted/20' : 'hover:bg-muted/10'}`}
                                        onMouseEnter={() => setHoveredRow(livraison.id)}
                                        onMouseLeave={() => setHoveredRow(null)}
                                    >
                                        <td className="py-3 px-4">
                                            <span className="font-mono text-sm font-semibold bg-muted/50 px-2 py-1 rounded">
                                                {livraison.trackingNumber}
                                            </span>
                                        </td>
                                        <td className="py-3 px-4">
                                            <p className="text-sm font-medium">{livraison.clientName}</p>
                                            <p className="text-xs text-muted-foreground">{livraison.clientPhone}</p>
                                        </td>
                                        <td className="py-3 px-4 text-sm text-muted-foreground truncate max-w-[200px] hidden md:table-cell">
                                            {livraison.destinationAddress}
                                        </td>
                                        <td className="py-3 px-4">
                                            <span className="text-sm font-semibold text-primary">{livraison.amount.toFixed(2)} €</span>
                                        </td>
                                        <td className="py-3 px-4">
                                            <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${statusConfig.bg} ${statusConfig.text}`}>
                                                <StatusIcon className="w-3 h-3" />
                                                {statusConfig.label}
                                            </span>
                                            {livraison.status === 'in_transit' && (
                                                <p className="text-[11px] text-muted-foreground mt-1">
                                                    {getTimeRemaining(livraison.estimatedDelivery)}
                                                </p>
                                            )}
                                        </td>
                                        <td className="py-3 px-4">
                                            <div className="flex items-center gap-2">
                                                <button
                                                    onClick={() => {
                                                        setSelectedDelivery(livraison);
                                                        setShowDetailsModal(true);
                                                    }}
                                                    className="p-1.5 rounded-lg hover:bg-muted/50 transition"
                                                    title="Détails"
                                                >
                                                    <Eye className="w-4 h-4 text-muted-foreground hover:text-primary" />
                                                </button>
                                                {!isDelivered && !isCancelled && (
                                                    <>
                                                        <button
                                                            onClick={() => window.open(`https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(livraison.destinationAddress)}`)}
                                                            className="p-1.5 rounded-lg hover:bg-muted/50 transition"
                                                            title="Naviguer"
                                                        >
                                                            <Navigation className="w-4 h-4 text-muted-foreground hover:text-primary" />
                                                        </button>
                                                        <button
                                                            onClick={() => window.location.href = `tel:${livraison.clientPhone}`}
                                                            className="p-1.5 rounded-lg hover:bg-muted/50 transition"
                                                            title="Appeler"
                                                        >
                                                            <Phone className="w-4 h-4 text-muted-foreground hover:text-emerald-500" />
                                                        </button>
                                                    </>
                                                )}
                                            </div>
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>

                {filteredLivraisons.length === 0 && (
                    <div className="text-center py-12">
                        <Package className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
                        <p className="text-sm text-muted-foreground">Aucune livraison trouvée</p>
                        <p className="text-xs text-muted-foreground/60 mt-1">Essayez de modifier vos critères de recherche</p>
                    </div>
                )}
            </div>
<div>
    
</div>
            {/* Modal - réduit avec petite police */}
            {showDetailsModal && selectedDelivery && (
                <div
                    className="fixed inset-0 flex items-start justify-center z-50 p "
                    onClick={() => setShowDetailsModal(false)}
                >
                    <div
                        className="relative w-full max-w-2xl mx-4 bg-card border border-border shadow-lg animate-modal-in"
                        style={{ borderRadius: '0px' }}
                        onClick={(e) => e.stopPropagation()}
                    >
                        {/* Header - réduit */}
                        <div className="absolute top-0 left-0 right-0 h-0.5 bg-primary" />

                        <div className="flex items-center justify-between p-3 border-b border-border">
                            <div>
                                <h3 className="text-base font-semibold">Détails de la livraison</h3>
                                <p className="text-xs text-muted-foreground font-mono mt-0.5">{selectedDelivery.trackingNumber}</p>
                            </div>
                            <button
                                onClick={() => setShowDetailsModal(false)}
                                className="p-1 rounded-lg hover:bg-muted/50 transition-colors"
                            >
                                <X className="w-4 h-4" />
                            </button>
                        </div>

                        {/* Content - police réduite */}
                        <div className="p-3 space-y-3 max-h-[65vh] overflow-y-auto">
                            {/* Status bar - compacte */}
                            <div className="flex items-center justify-between">
                                {['pending', 'pickup', 'in_transit', 'delivered'].map((status, idx) => {
                                    const statusIndex = ['pending', 'pickup', 'in_transit', 'delivered'].indexOf(selectedDelivery.status);
                                    const isCompleted = idx <= statusIndex;
                                    const icons = { pending: Clock, pickup: MapPin, in_transit: Navigation, delivered: CheckCircle };
                                    const Icon = icons[status as keyof typeof icons];
                                    const labels = { pending: 'Prise', pickup: 'Pickup', in_transit: 'Transit', delivered: 'Livrée' };

                                    return (
                                        <div key={status} className="flex-1 text-center">
                                            <div className={`w-7 h-7 mx-auto rounded-full flex items-center justify-center transition-all ${isCompleted ? 'bg-primary text-primary-foreground shadow-sm' : 'bg-muted/50 text-muted-foreground'
                                                }`}>
                                                <Icon className="w-3.5 h-3.5" />
                                            </div>
                                            <p className={`text-[10px] mt-1 font-medium ${isCompleted ? 'text-primary' : 'text-muted-foreground'}`}>
                                                {labels[status as keyof typeof labels]}
                                            </p>
                                        </div>
                                    );
                                })}
                            </div>

                            {/* Map - hauteur réduite */}
                            <div className="rounded-lg overflow-hidden border border-border/50">
                                <iframe
                                    title="map"
                                    src={`https://maps.google.com/maps?q=${encodeURIComponent(selectedDelivery.destinationAddress)}&output=embed`}
                                    width="100%"
                                    height="140"
                                    style={{ border: 0 }}
                                    allowFullScreen
                                    loading="lazy"
                                />
                                <div className="p-2 bg-muted/20 flex items-center justify-between">
                                    <div className="flex items-center gap-1.5">
                                        <MapPin className="w-3 h-3 text-primary" />
                                        <p className="text-[10px] text-muted-foreground truncate max-w-[180px]">{selectedDelivery.destinationAddress}</p>
                                    </div>
                                    <a
                                        href={`https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(selectedDelivery.destinationAddress)}`}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="text-[10px] text-primary hover:underline flex items-center gap-1"
                                    >
                                        <Navigation className="w-2.5 h-2.5" />
                                        Itinéraire
                                    </a>
                                </div>
                            </div>

                            {/* Informations - compactes */}
                            <div className="grid grid-cols-2 gap-2">
                                <div className="p-2 rounded-lg bg-muted/20">
                                    <div className="flex items-center gap-1.5 mb-1.5">
                                        <User className="w-3.5 h-3.5 text-primary" />
                                        <span className="text-[11px] font-medium">Client</span>
                                    </div>
                                    <p className="text-xs font-medium">{selectedDelivery.clientName}</p>
                                    <p className="text-[10px] text-muted-foreground mt-0.5">{selectedDelivery.clientPhone}</p>
                                    <p className="text-[10px] text-muted-foreground mt-1 line-clamp-2">{selectedDelivery.clientAddress}</p>
                                </div>
                                <div className="p-2 rounded-lg bg-muted/20">
                                    <div className="flex items-center gap-1.5 mb-1.5">
                                        <Truck className="w-3.5 h-3.5 text-primary" />
                                        <span className="text-[11px] font-medium">Livraison</span>
                                    </div>
                                    <p className="text-xs font-semibold text-primary">{selectedDelivery.amount.toFixed(2)} €</p>
                                    <p className="text-[10px] text-muted-foreground mt-0.5">
                                        Créée le {selectedDelivery.createdAt.toLocaleDateString()}
                                    </p>
                                    <p className="text-[10px] text-muted-foreground">
                                        Estimée le {selectedDelivery.estimatedDelivery.toLocaleDateString()}
                                    </p>
                                </div>
                            </div>

                            {/* Photos client - compact */}
                            <div className="p-2 rounded-lg bg-muted/20">
                                <div className="flex items-center justify-between mb-1.5">
                                    <div className="flex items-center gap-1.5">
                                        <Camera className="w-3.5 h-3.5 text-primary" />
                                        <span className="text-[11px] font-medium">Photos client</span>
                                    </div>
                                    <span className="text-[9px] text-muted-foreground">
                                        {selectedDelivery.clientPhotos?.length || 0} photo{selectedDelivery.clientPhotos?.length !== 1 ? 's' : ''}
                                    </span>
                                </div>
                                {!selectedDelivery.clientPhotos || selectedDelivery.clientPhotos.length === 0 ? (
                                    <div className="p-3 rounded-lg bg-muted/30 border border-dashed border-border text-center">
                                        <Camera className="w-5 h-5 text-muted-foreground mx-auto mb-1 opacity-50" />
                                        <p className="text-[10px] text-muted-foreground">Aucune photo</p>
                                    </div>
                                ) : (
                                    <div className="grid grid-cols-3 gap-1.5">
                                        {selectedDelivery.clientPhotos.slice(0, 3).map((photo, idx) => (
                                            <button
                                                key={idx}
                                                onClick={() => {
                                                    setSelectedPhotoIndex(idx);
                                                    setShowFullPhoto(true);
                                                }}
                                                className="relative group overflow-hidden rounded-lg aspect-square bg-muted/30 hover:shadow transition-all"
                                            >
                                                <img
                                                    src={photo}
                                                    alt={`Photo ${idx + 1}`}
                                                    className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                                                />
                                                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition flex items-center justify-center">
                                                    <Eye className="w-3 h-3 text-white" />
                                                </div>
                                            </button>
                                        ))}
                                        {selectedDelivery.clientPhotos.length > 3 && (
                                            <button
                                                onClick={() => {
                                                    setSelectedPhotoIndex(0);
                                                    setShowFullPhoto(true);
                                                }}
                                                className="rounded-lg bg-gradient-to-br from-primary/20 to-primary/10 flex items-center justify-center text-xs font-bold text-primary hover:scale-105 transition"
                                            >
                                                +{selectedDelivery.clientPhotos.length - 3}
                                            </button>
                                        )}
                                    </div>
                                )}
                            </div>

                            {/* Temps restant - compact */}
                            {selectedDelivery.status === 'in_transit' && (
                                <div className="p-2 rounded-lg bg-primary/10 border border-primary/20">
                                    <div className="flex items-center gap-1.5">
                                        <Clock className="w-3.5 h-3.5 text-primary" />
                                        <span className="text-[10px] font-medium text-primary">Temps restant</span>
                                    </div>
                                    <p className="text-base font-bold mt-0.5">{getTimeRemaining(selectedDelivery.estimatedDelivery)}</p>
                                </div>
                            )}
                        </div>

                        {/* Footer - compact */}
                        <div className="flex gap-2 p-3 border-t border-border bg-card">
                            <button
                                onClick={() => setShowDetailsModal(false)}
                                className="flex-1 px-3 py-1.5 rounded-lg border border-border text-xs font-medium hover:bg-muted/30 transition-colors"
                            >
                                Fermer
                            </button>
                            {selectedDelivery.status !== 'delivered' && selectedDelivery.status !== 'cancelled' && (
                                <button
                                    onClick={() => window.open(`https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(selectedDelivery.destinationAddress)}`)}
                                    className="flex-1 inline-flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-lg bg-primary text-primary-foreground text-xs font-medium hover:shadow-md hover:-translate-y-0.5 transition-all group"
                                >
                                    <Navigation className="w-3.5 h-3.5 transition-transform group-hover:translate-x-0.5" />
                                    Naviguer
                                </button>
                            )}
                        </div>
                    </div>
                </div>
            )}

            {/* Modal photos plein écran */}
            {showFullPhoto && selectedDelivery && selectedDelivery.clientPhotos && (
                <div
                    className="fixed inset-0 bg-black/80 flex items-center justify-center z-[60] p-4"
                    onClick={() => setShowFullPhoto(false)}
                >
                    <div className="relative max-w-3xl w-full" onClick={(e) => e.stopPropagation()}>
                        <button
                            onClick={() => setShowFullPhoto(false)}
                            className="absolute -top-12 right-0 p-2 rounded-full bg-white/10 hover:bg-white/20 transition"
                        >
                            <X className="w-6 h-6 text-white" />
                        </button>

                        {selectedDelivery.clientPhotos.length > 1 && (
                            <>
                                <button
                                    onClick={() => setSelectedPhotoIndex(prev => prev === 0 ? selectedDelivery.clientPhotos!.length - 1 : prev - 1)}
                                    className="absolute left-2 top-1/2 -translate-y-1/2 p-2 rounded-full bg-black/50 hover:bg-black/70 transition"
                                >
                                    <ChevronLeft className="w-6 h-6 text-white" />
                                </button>
                                <button
                                    onClick={() => setSelectedPhotoIndex(prev => prev === selectedDelivery.clientPhotos!.length - 1 ? 0 : prev + 1)}
                                    className="absolute right-2 top-1/2 -translate-y-1/2 p-2 rounded-full bg-black/50 hover:bg-black/70 transition"
                                >
                                    <ChevronRight className="w-6 h-6 text-white" />
                                </button>
                            </>
                        )}

                        <img
                            src={selectedDelivery.clientPhotos[selectedPhotoIndex]}
                            alt="Photo client"
                            className="w-full h-auto max-h-[85vh] object-contain rounded-xl shadow-2xl"
                        />

                        {selectedDelivery.clientPhotos.length > 1 && (
                            <>
                                <div className="flex justify-center gap-2 mt-4">
                                    {selectedDelivery.clientPhotos.map((_, idx) => (
                                        <button
                                            key={idx}
                                            onClick={() => setSelectedPhotoIndex(idx)}
                                            className={`h-1.5 rounded-full transition-all ${idx === selectedPhotoIndex ? 'bg-white w-6' : 'bg-white/40 w-2'
                                                }`}
                                        />
                                    ))}
                                </div>
                                <p className="text-center text-sm text-white/60 mt-2">
                                    {selectedPhotoIndex + 1} / {selectedDelivery.clientPhotos.length}
                                </p>
                            </>
                        )}
                    </div>
                </div>
            )}

            <style>{`
        @keyframes fade-up {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-fade-up { animation: fade-up 0.3s ease-out both; }

        @keyframes modal-in {
          from { opacity: 0; transform: scale(0.98); }
          to { opacity: 1; transform: scale(1); }
        }
        .animate-modal-in { animation: modal-in 0.25s ease-out both; }
      `}</style>
        </div>
    );
};

export default LivreurLivraisons;