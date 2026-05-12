import { MapPin, Mail, Truck, Shield } from "lucide-react";
import { Link } from "react-router-dom";

export const TopBar = () => (
  <div className="hidden md:block bg-foreground text-background">
    <div className="container-x flex items-center justify-between py-2 text-[11px] uppercase tracking-[0.2em]">
      <div className="flex items-center gap-6">
        <Link to="/nous-trouver" className="flex items-center gap-1.5 hover:opacity-70 transition-opacity">
          <MapPin className="h-3 w-3" /> Nous trouver
        </Link>
        <Link to="/devis-express" className="flex items-center gap-1.5 hover:opacity-70 transition-opacity">
          <Mail className="h-3 w-3" /> Contact
        </Link>
      </div>
      <div className="flex items-center gap-1.5 font-medium">
        <Truck className="h-3 w-3" /> Livraison sécurisée — Madagascar
      </div>
      <div className="flex items-center gap-1.5">
        <Link to="/cgv" className="flex items-center gap-1.5 hover:opacity-70 transition-opacity">
          <Shield className="h-3 w-3" /> Garantie 24 mois
        </Link>
      </div>
    </div>
  </div>
);