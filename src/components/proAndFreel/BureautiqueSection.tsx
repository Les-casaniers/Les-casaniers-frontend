import { CheckCircle, Monitor, Briefcase, Truck, ShieldCheck, Cpu, Zap, Database, AppWindow } from "lucide-react";

const ITEMS = [
  { icon: <Cpu className="h-4 w-4 text-blue-500 mt-0.5 shrink-0" />, label: "Processeurs Intel Core i5/i7 ou AMD Ryzen 5/7" },
  { icon: <Database className="h-4 w-4 text-blue-500 mt-0.5 shrink-0" />, label: "16 à 32 Go de RAM DDR5 pour le multitâche" },
  { icon: <Zap className="h-4 w-4 text-blue-500 mt-0.5 shrink-0" />, label: "SSD NVMe 512 Go à 1 To — démarrage rapide" },
  { icon: <AppWindow className="h-4 w-4 text-blue-500 mt-0.5 shrink-0" />, label: "Compatible Microsoft 365, Google Workspace, Zoom" },
  { icon: <ShieldCheck className="h-4 w-4 text-blue-500 mt-0.5 shrink-0" />, label: "Garantie 24 mois pièces et main d'œuvre" },
];

export const BureautiqueSection = () => (
  <section id="bureautique" className="py-20 border-b border-border">
    <div className="container-x grid md:grid-cols-2 gap-12 items-start">

      {/* Colonne gauche */}
      <div>
        <span className="flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-widest text-blue-500">
          <Briefcase className="h-3.5 w-3.5" /> Bureautique & Multitâche
        </span>
        <h2 className="mt-4 text-3xl font-bold leading-snug">
          Des postes fiables pour votre productivité au quotidien.
        </h2>
        <p className="mt-4 text-muted-foreground text-sm leading-relaxed">
          Traitement de texte, tableurs, visioconférences, navigation web intensive —
          nos configurations sont optimisées pour encaisser plusieurs applications
          simultanées sans ralentissement.
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

      {/* Colonne droite */}
      <div className="card-soft p-6 flex flex-col gap-4">
        <div className="flex items-center justify-between">
          <span className="text-sm font-semibold">Config. Bureautique</span>
          <span className="text-[11px] font-semibold px-3 py-1 rounded-full bg-blue-50 text-blue-700 border border-blue-200">
            Prête à l'emploi
          </span>
        </div>

        <div className="flex items-center gap-3 p-3 rounded-xl bg-secondary">
          <div className="h-11 w-11 rounded-xl bg-blue-50 border border-blue-200 flex items-center justify-center shrink-0">
            <Monitor className="h-5 w-5 text-blue-600" />
          </div>
          <div>
            <p className="text-sm font-semibold">Tour ou All-in-One</p>
            <p className="text-xs text-muted-foreground">Livré et installé dans vos locaux</p>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-2">
          {[
            { label: "À partir de", value: "850 000 Ar", gold: true },
            { label: "Garantie", value: "24 mois" },
            { label: "RAM", value: "16–32 Go" },
            { label: "Stockage", value: "512 Go+" },
          ].map((s) => (
            <div key={s.label} className="bg-secondary rounded-xl p-3">
              <p className="text-[11px] uppercase tracking-widest text-muted-foreground mb-1">{s.label}</p>
              <p className={`text-lg font-semibold ${s.gold ? "text-[#c8a96e]" : ""}`}>{s.value}</p>
            </div>
          ))}
        </div>

        <div className="flex items-center gap-2 px-3 py-2.5 rounded-xl border border-[#c8a96e]/30 bg-[#c8a96e]/5 text-sm text-muted-foreground">
          <Truck className="h-4 w-4 text-[#c8a96e] shrink-0" />
          Livraison & installation incluses à Madagascar
        </div>
      </div>

    </div>
  </section>
);