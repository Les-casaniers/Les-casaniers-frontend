import { Cpu, Zap, Database, ShieldCheck, AppWindow, Truck } from "lucide-react";

const ITEMS = [
  { icon: <Cpu className="h-4 w-4 text-purple-500 mt-0.5 shrink-0" />, label: "Processeurs AMD Threadripper ou Intel Xeon" },
  { icon: <Database className="h-4 w-4 text-purple-500 mt-0.5 shrink-0" />, label: "64 à 128 Go de RAM ECC pour la stabilité" },
  { icon: <Zap className="h-4 w-4 text-purple-500 mt-0.5 shrink-0" />, label: "GPU NVIDIA RTX 4000/6000 pour le rendu et l'IA" },
  { icon: <ShieldCheck className="h-4 w-4 text-purple-500 mt-0.5 shrink-0" />, label: "Stockage NVMe RAID pour la rapidité et la sécurité" },
  { icon: <AppWindow className="h-4 w-4 text-purple-500 mt-0.5 shrink-0" />, label: "Optimisé Adobe Premiere, DaVinci Resolve, Blender" },
];

export const WorkstationsSection = () => (
  <section id="workstations" className="py-20 border-b border-border bg-secondary/30">
    <div className="container-x grid md:grid-cols-2 gap-12 items-start">

      {/* Colonne gauche — carte produit */}
      <div className="card-soft p-6 flex flex-col gap-4">
        <div className="flex items-center justify-between">
          <span className="text-sm font-semibold">Workstation Pro</span>
          <span className="text-[11px] font-semibold px-3 py-1 rounded-full bg-purple-50 text-purple-700 border border-purple-200">
            Haute performance
          </span>
        </div>

        <div className="flex items-center gap-3 p-3 rounded-xl bg-secondary">
          <div className="h-11 w-11 rounded-xl bg-purple-50 border border-purple-200 flex items-center justify-center shrink-0">
            <Cpu className="h-5 w-5 text-purple-600" />
          </div>
          <div>
            <p className="text-sm font-semibold">Tour Workstation</p>
            <p className="text-xs text-muted-foreground">Rendu 3D, montage 4K/8K, IA</p>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-2">
          {[
            { label: "À partir de", value: "2 500 000 Ar", gold: true },
            { label: "Garantie", value: "36 mois" },
            { label: "RAM", value: "64–128 Go" },
            { label: "GPU", value: "RTX 4000+" },
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

      {/* Colonne droite — texte + liste */}
      <div>
        <span className="flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-widest text-purple-500">
          <Cpu className="h-3.5 w-3.5" /> Workstations (Création & Data)
        </span>
        <h2 className="mt-4 text-3xl font-bold leading-snug">
          La puissance brute pour vos projets les plus exigeants.
        </h2>
        <p className="mt-4 text-muted-foreground text-sm leading-relaxed">
          Montage vidéo 4K/8K, modélisation 3D, analyse de données massives —
          nos workstations sont configurées pour les professionnels qui ne
          peuvent pas se permettre d'attendre.
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