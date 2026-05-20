import { Laptop, BatteryFull, Monitor, Wifi, Package, Truck } from "lucide-react";

const ITEMS = [
  { icon: <Laptop className="h-4 w-4 text-amber-500 mt-0.5 shrink-0" />, label: "Laptops ThinkPad, Dell Latitude, HP EliteBook" },
  { icon: <BatteryFull className="h-4 w-4 text-amber-500 mt-0.5 shrink-0" />, label: "Autonomie 10 à 14h selon utilisation" },
  { icon: <Monitor className="h-4 w-4 text-amber-500 mt-0.5 shrink-0" />, label: "Écrans IPS anti-reflets pour le travail en extérieur" },
  { icon: <Wifi className="h-4 w-4 text-amber-500 mt-0.5 shrink-0" />, label: "Connectivité 4G/LTE intégrée en option" },
  { icon: <Package className="h-4 w-4 text-amber-500 mt-0.5 shrink-0" />, label: "Livraison avec sacoche de protection incluse" },
];

export const SolutionsMobilesSection = () => (
  <section id="solutions-mobiles" className="py-20 bg-secondary/30">
    <div className="container-x grid md:grid-cols-2 gap-12 items-start">

      {/* Colonne gauche — carte produit */}
      <div className="card-soft p-6 flex flex-col gap-4">
        <div className="flex items-center justify-between">
          <span className="text-sm font-semibold">Solutions Mobiles</span>
          <span className="text-[11px] font-semibold px-3 py-1 rounded-full bg-amber-50 text-amber-700 border border-amber-200">
            Mobilité pro
          </span>
        </div>

        <div className="flex items-center gap-3 p-3 rounded-xl bg-secondary">
          <div className="h-11 w-11 rounded-xl bg-amber-50 border border-amber-200 flex items-center justify-center shrink-0">
            <Laptop className="h-5 w-5 text-amber-600" />
          </div>
          <div>
            <p className="text-sm font-semibold">Laptop professionnel</p>
            <p className="text-xs text-muted-foreground">Léger · autonome · puissant</p>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-2">
          {[
            { label: "À partir de", value: "1 100 000 Ar", gold: true },
            { label: "Autonomie", value: "10–14h" },
            { label: "Poids", value: "< 1,5 kg" },
            { label: "Sacoche", value: "Incluse" },
          ].map((s) => (
            <div key={s.label} className="bg-secondary rounded-xl p-3">
              <p className="text-[11px] uppercase tracking-widest text-muted-foreground mb-1">{s.label}</p>
              <p className={`text-lg font-semibold ${s.gold ? "text-[#c8a96e]" : ""}`}>{s.value}</p>
            </div>
          ))}
        </div>

        <div className="flex items-center gap-2 px-3 py-2.5 rounded-xl border border-[#c8a96e]/30 bg-[#c8a96e]/5 text-sm text-muted-foreground">
          <Truck className="h-4 w-4 text-[#c8a96e] shrink-0" />
          Livraison partout à Madagascar
        </div>
      </div>

      {/* Colonne droite — texte + liste */}
      <div>
        <span className="flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-widest text-amber-500">
          <Laptop className="h-3.5 w-3.5" /> Solutions Mobiles
        </span>
        <h2 className="mt-4 text-3xl font-bold leading-snug">
          Votre bureau dans votre sac, partout à Madagascar.
        </h2>
        <p className="mt-4 text-muted-foreground text-sm leading-relaxed">
          Consultants, commerciaux, freelances en déplacement — nos laptops
          professionnels allient légèreté, autonomie longue durée et puissance
          pour vos outils métier.
        </p>

        <div className="mt-6 rounded-xl border border-border overflow-hidden">
          <div className="px-4 py-3 bg-secondary text-[11px] font-semibold uppercase tracking-widest text-muted-foreground border-b border-border">
            Ce qui est inclus
          </div>
          <ul className="divide-y divide-border">
            {ITEMS.map((item) => (
              <li key={item.label} className="flex items-start gap-3 px-4 py-3 text-sm text-muted-foreground">
                {item.icon}
                <span>{item.label}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>

    </div>
  </section>
);