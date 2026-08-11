import { BadgeCheck, Mail, MapPin, Shield, Truck } from "lucide-react";
import { Link } from "react-router-dom";

export const TopBar = () => (
  <div className="hidden md:block h-7 bg-zinc-50 border-b border-zinc-200 text-zinc-400">
    <div className="container-x h-full flex items-center justify-between px-24 text-[9px] font-semibold italic uppercase tracking-wide">
      <div className="flex items-center gap-6">
        <Link to="/livraison" className="flex items-center gap-2 hover:text-zinc-600 transition-colors">
          <Truck className="h-3.5 w-3.5 stroke-[1.4]" /> Livraison sécurisée - Madagascar
        </Link>
        <Link to="/devis-express" className="hidden">
          <Truck className="h-3 w-3" /> Contact
        </Link>
      </div>
      <div className="hidden">
        <Truck className="h-3 w-3" /> Livraison sécurisée — Madagascar
      </div>
      <div className="flex items-center gap-1.5">
        <Link to="/cgv" className="flex items-center gap-2 hover:text-zinc-600 transition-colors">
          <BadgeCheck className="h-3.5 w-3.5 stroke-[1.4]" /> Garantie 24 mois
        </Link>
      </div>
    </div>
  </div>
);
