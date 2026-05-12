import fosa from "@/assets/casaniers-mascot.png";
import { Cpu, CircuitBoard, MemoryStick, Zap, Snowflake, HardDrive, MonitorCog } from "lucide-react";

const mascottes = [
  { name: "Le Cerveau", role: "CPU", icon: Cpu,
    quote: `"Vérifie mon socket (LGA/AM), regarde si j'ai un processeur graphique intégré ou si tu dois acheter un GPU !"` },
  { name: "L'Architecte", role: "Carte mère", icon: CircuitBoard,
    quote: `"Je ne supporte que certaines générations de CPU..."` },
  { name: "Le Titan", role: "GPU", icon: MonitorCog,
    quote: `"Je suis longue ! Mesure ton boîtier..."` },
  { name: "L'Archiviste", role: "RAM", icon: MemoryStick,
    quote: `"DDR4 et DDR5 ne se mélangent jamais !"` },
  { name: "Le Cœur", role: "Alimentation", icon: Zap,
    quote: `"Si tu prends un GPU et un CPU de combat..."` },
  { name: "Sub-Zero", role: "Refroidissement", icon: Snowflake,
    quote: `"Ton CPU chauffe à 150W ?..."` },
  { name: "L'Éclair", role: "Stockage", icon: HardDrive,
    quote: `"Je suis un SSD NVMe ultra-rapide..."` },
];

const etapes = ["Choisir mon super-pouvoir", "Sélection assistée", "Intervention des mascottes", "Le Récapitulatif Épique"];

export const Configurator = () => (
  <section className="container-x py-24">
    <div className="grid lg:grid-cols-12 gap-10 items-start">
      <div className="lg:col-span-5 lg:sticky lg:top-32 space-y-6">
        <div className="pill">Configurateur guidé</div>
        <h2 className="font-display text-4xl lg:text-5xl font-bold tracking-tight">
          Un parcours en 4 étapes, <span className="text-gradient-accent">jamais en solo</span>.
        </h2>
        <p className="text-muted-foreground text-lg leading-relaxed">
          Le Fosa et son équipe de mascottes vous accompagnent à chaque clic. Incompatibilité, déséquilibre,
          oubli&nbsp;? Vous êtes prévenu avec un ton clair et amical.
        </p>

        {/* Progress steps */}
        <ol className="space-y-3 mt-6">
          {etapes.map((e, i) => (
            <li key={e} className="flex items-center gap-4">
              <div className={`h-9 w-9 rounded-full flex items-center justify-center font-display font-bold text-sm shrink-0 ${
                i === 0 ? "bg-gradient-accent text-accent-foreground shadow-glow" : "bg-secondary text-muted-foreground"
              }`}>
                {i + 1}
              </div>
              <div className="flex-1 flex items-center gap-3">
                <span className={`font-medium ${i === 0 ? "text-foreground" : "text-muted-foreground"}`}>{e}</span>
                {i === 0 && <span className="pill bg-accent/10 text-accent border-accent/20">Étape actuelle</span>}
              </div>
            </li>
          ))}
        </ol>

        {/* Progress bar */}
        <div className="h-1.5 rounded-full bg-secondary overflow-hidden">
          <div className="h-full w-1/4 bg-gradient-accent rounded-full" />
        </div>
        <div className="text-xs text-muted-foreground">25% — Vous y êtes presque, on vous tient la patte 🐾</div>
      </div>

      <div className="lg:col-span-7 space-y-3">
        {mascottes.map((m, i) => (
          <div
            key={m.role}
            className="group card-soft p-5 flex gap-4 items-start hover:border-accent/40 transition-colors"
            style={{ animationDelay: `${i * 50}ms` }}
          >
            <div className="relative shrink-0">
              <div className="h-14 w-14 rounded-2xl bg-secondary flex items-center justify-center group-hover:bg-gradient-accent transition-colors">
                <m.icon className="h-6 w-6 text-foreground group-hover:text-accent-foreground transition-colors" />
              </div>
              <img src={fosa} alt="" className="absolute -bottom-2 -right-2 h-7 w-7 object-contain opacity-0 group-hover:opacity-100 transition-opacity" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-baseline gap-2 mb-1.5 flex-wrap">
                <span className="font-display font-bold">{m.name}</span>
                <span className="text-xs text-muted-foreground">·</span>
                <span className="text-xs font-mono uppercase tracking-wider text-accent">{m.role}</span>
              </div>
              <p className="text-sm text-muted-foreground leading-relaxed italic">{m.quote}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  </section>
);
