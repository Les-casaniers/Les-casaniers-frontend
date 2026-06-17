// src/components/MapPicker.tsx
import React, { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, useMapEvents, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { Map, ExternalLink, Loader2, Search } from 'lucide-react';
import { toast } from 'sonner';

// Correction des icônes Leaflet
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
    iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
    iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
    shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

interface MapPickerProps {
    latitude: number | null;
    longitude: number | null;
    onLocationSelect: (lat: number, lng: number) => void;
    address?: string;
}

// Composant pour le clic sur la carte
const LocationMarker = ({ 
    onLocationSelect, 
    lat, 
    lng 
}: { 
    onLocationSelect: (lat: number, lng: number) => void; 
    lat: number | null; 
    lng: number | null;
}) => {
    const [position, setPosition] = useState<[number, number] | null>(
        lat && lng ? [lat, lng] : null
    );

    const map = useMapEvents({
        click(e) {
            const { lat, lng } = e.latlng;
            setPosition([lat, lng]);
            onLocationSelect(lat, lng);
            toast.success(`Position sélectionnée: ${lat.toFixed(6)}, ${lng.toFixed(6)}`);
        },
    });

    useEffect(() => {
        if (lat && lng) {
            setPosition([lat, lng]);
            map.setView([lat, lng], 15);
        }
    }, [lat, lng, map]);

    return position === null ? null : <Marker position={position} />;
};

// Composant pour centrer la carte
const MapController = ({ center }: { center: [number, number] }) => {
    const map = useMap();
    useEffect(() => {
        map.setView(center, 15);
    }, [center, map]);
    return null;
};

const MapPicker: React.FC<MapPickerProps> = ({
    latitude,
    longitude,
    onLocationSelect,
    address
}) => {
    const [isLoading, setIsLoading] = useState(false);
    const [searchQuery, setSearchQuery] = useState(address || '');
    const defaultCenter: [number, number] = [-18.8792, 47.5079]; // Antananarivo
    const center: [number, number] = (latitude && longitude) 
        ? [Number(latitude), Number(longitude)] 
        : defaultCenter;

    // ✅ Fonction pour rechercher une adresse via l'API Nominatim (OpenStreetMap)
    const searchAddress = async (query: string) => {
        if (!query || query.length < 3) {
            toast.error('Veuillez entrer au moins 3 caractères');
            return;
        }

        setIsLoading(true);
        try {
            const response = await fetch(
                `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}&limit=1`
            );
            const data = await response.json();
            
            if (data && data.length > 0) {
                const { lat, lon } = data[0];
                const latNum = parseFloat(lat);
                const lonNum = parseFloat(lon);
                onLocationSelect(latNum, lonNum);
                toast.success(`Position trouvée: ${latNum.toFixed(6)}, ${lonNum.toFixed(6)}`);
            } else {
                toast.error('Aucun résultat trouvé');
            }
        } catch (error) {
            console.error('Erreur de recherche:', error);
            toast.error('Erreur lors de la recherche');
        } finally {
            setIsLoading(false);
        }
    };

    // ✅ Fonction pour ouvrir Google Maps et récupérer les coordonnées
    const openGoogleMaps = () => {
        let url = 'https://www.google.com/maps';
        
        if (latitude && longitude) {
            url = `https://www.google.com/maps?q=${latitude},${longitude}&z=15`;
        } else if (address) {
            url = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(address)}`;
        } else {
            url = 'https://www.google.com/maps?q=Antananarivo+Madagascar';
        }
        
        // ✅ Ouvrir Google Maps dans un nouvel onglet
        window.open(url, '_blank');
        
        // ✅ Message pour guider l'utilisateur
        toast.info(
            '📌 Sur Google Maps, cliquez sur un lieu, puis copiez les coordonnées dans le champ ci-dessous',
            { duration: 5000 }
        );
    };

    // ✅ Gestion de la recherche
    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        searchAddress(searchQuery);
    };

    return (
        <div className="space-y-3">
            {/* ✅ Barre de recherche d'adresse */}
            <form onSubmit={handleSearch} className="flex gap-2">
                <div className="flex-1 relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <input
                        type="text"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        placeholder="Rechercher une adresse..."
                        className="w-full pl-9 pr-3 py-2 text-sm border border-border rounded-lg bg-background focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                    />
                </div>
                <button
                    type="submit"
                    disabled={isLoading}
                    className="px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition text-sm font-medium disabled:opacity-50"
                >
                    {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Rechercher'}
                </button>
            </form>

            {/* ✅ Carte Leaflet */}
            <div className="relative w-full h-64 rounded-xl overflow-hidden border border-border">
                <MapContainer
                    center={center}
                    zoom={15}
                    scrollWheelZoom={true}
                    style={{ height: '100%', width: '100%' }}
                    className="z-0"
                >
                    <TileLayer
                        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
                        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                    />
                    <LocationMarker 
                        onLocationSelect={onLocationSelect} 
                        lat={latitude ? Number(latitude) : null} 
                        lng={longitude ? Number(longitude) : null} 
                    />
                    <MapController center={center} />
                </MapContainer>
                
                <div className="absolute bottom-2 left-1/2 -translate-x-1/2 bg-black/60 text-white text-xs px-3 py-1.5 rounded-full pointer-events-none">
                    Cliquez sur la carte pour choisir votre position
                </div>
                
                {latitude && longitude && (
                    <div className="absolute top-2 right-2 bg-black/60 text-white text-[10px] px-2 py-1 rounded-lg pointer-events-none">
                        📍 {Number(latitude).toFixed(6)}, {Number(longitude).toFixed(6)}
                    </div>
                )}
            </div>

            {/* ✅ Boutons Google Maps */}
            <div className="flex flex-wrap gap-2">
                <button
                    onClick={openGoogleMaps}
                    className="flex-1 inline-flex items-center justify-center gap-2 px-4 py-2 bg-blue-500 text-white text-sm font-medium rounded-lg hover:bg-blue-600 transition-all"
                >
                    <Map className="h-4 w-4" />
                    Ouvrir dans Google Maps
                    <ExternalLink className="h-3 w-3" />
                </button>
                
                {latitude && longitude && (
                    <button
                        onClick={() => {
                            const url = `https://www.google.com/maps/dir/?api=1&destination=${latitude},${longitude}`;
                            window.open(url, '_blank');
                        }}
                        className="flex-1 px-4 py-2 bg-emerald-500 text-white text-sm font-medium rounded-lg hover:bg-emerald-600 transition-all flex items-center justify-center gap-2"
                    >
                        <Map className="h-4 w-4" />
                        Itinéraire
                    </button>
                )}
            </div>

            {/* ✅ Message d'info pour Google Maps */}
            <div className="text-xs text-muted-foreground bg-secondary/30 p-2 rounded-lg">
                💡 <span className="font-medium">Astuce :</span> Ouvrez Google Maps, trouvez votre position, 
                puis utilisez la <span className="font-medium">barre de recherche</span> ci-dessus ou 
                <span className="font-medium"> cliquez sur la carte</span> pour définir les coordonnées.
            </div>
        </div>
    );
};

export default MapPicker;