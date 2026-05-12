import fosa from "@/assets/casaniers-mascot.png";
import { Crown, Wrench, ClipboardList, Truck, Twitch } from "lucide-react";

const equipe = [
  { role: "La Fondatrice", desc: "Vision, stratégie, sourcing Europe", icon: Crown, accent: "bg-accent/15 text-accent" },
  { role: "Responsable Maintenance", desc: "SAV, diagnostic, réparation", icon: Wrench, accent: "bg-tech/15 text-tech" },
  { role: "Coordinatrice", desc: "Orchestration projets clients", icon: ClipboardList, accent: "bg-primary/10 text-primary" },
  { role: "Responsable Logistique", desc: "Importation & livraison sécurisée", icon: Truck, accent: "bg-accent/15 text-accent" },
  { role: "Partenaire Streamer", desc: "Tests live & retours terrain", icon: Twitch, accent: "bg-tech/15 text-tech" },
];

export const Team = () => (
  <section className="container-x py-24">
    <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6 mb-12">
      <div className="max-w-2xl">
        <div className="pill mb-4">L'équipe Les Casaniers</div>
        <h2 className="font-display text-4xl lg:text-5xl font-bold tracking-tight">
          Des humains derrière chaque <span className="text-gradient-accent">machine</span>.
        </h2>
      </div>
      <p className="text-muted-foreground max-w-md">
        Une petite équipe passionnée, à votre écoute du premier conseil au dernier câble branché.
      </p>
    </div>

    <div className="grid sm:grid-cols-2 lg:grid-cols-5 gap-4">
      {equipe.map((m) => (
        <div key={m.role} className="card-soft p-6 hover-lift group">
          <div className={`relative h-32 rounded-xl ${m.accent} mb-4 overflow-hidden flex items-center justify-center`}>
            <img src={fosa} alt="" className="h-28 object-contain group-hover:scale-110 transition-transform duration-500" />
          </div>
          <div className="font-display font-bold">{m.role}</div>
          <div className="text-xs text-muted-foreground mt-1">{m.desc}</div>
        </div>
      ))}
    </div>
  </section>
);
