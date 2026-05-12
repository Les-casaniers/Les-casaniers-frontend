import { Button } from "@/components/ui/button";
import { Briefcase, ArrowRight, Building2, Laptop, Server, Smartphone, HardDrive } from "lucide-react";

const modules = [
  { icon: Building2, title: "Bureautique" },
  { icon: Laptop, title: "Mini PC" },
  { icon: HardDrive, title: "Workstations" },
  { icon: Smartphone, title: "Solutions Mobiles" },
  { icon: Server, title: "NAS" },
];

export const ProSection = () => (
  <section className="bg-secondary/40 border-y border-border">
    <div className="container-x py-24 grid lg:grid-cols-2 gap-12 items-center">
      <div>
        <div className="pill mb-4 bg-card"><Briefcase className="h-3.5 w-3.5 text-tech" /> Espace B2B</div>
        <h2 className="font-display text-4xl lg:text-5xl font-bold tracking-tight leading-[1.05]">
          Des outils à la hauteur de vos <span className="text-tech">ambitions.</span>
        </h2>
        <p className="text-muted-foreground text-lg mt-5 leading-relaxed max-w-lg">
          Parce qu'une heure d'arrêt est une perte de chiffre d'affaires.
        </p>

        <div className="mt-8 grid grid-cols-2 sm:grid-cols-3 gap-2">
          {["Facturation normée", "SAV prioritaire", "Audit de parc", "Importation directe"].map((r) => (
            <div key={r} className="rounded-full border border-border bg-card px-3 py-2 text-xs text-center font-medium">
              {r}
            </div>
          ))}
        </div>

        <div className="flex flex-wrap gap-3 mt-8">
          <Button variant="tech" size="lg">
            Besoin d'un devis pro ? <ArrowRight />
          </Button>
          <Button variant="soft" size="lg">Découvrir l'espace Pro</Button>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3">
        {modules.map((m, i) => (
          <div
            key={m.title}
            className={`card-soft p-6 hover-lift ${i === 4 ? "col-span-2" : ""}`}
          >
            <div className="h-11 w-11 rounded-xl bg-gradient-tech text-tech-foreground flex items-center justify-center mb-4 shadow-tech">
              <m.icon className="h-5 w-5" />
            </div>
            <div className="font-display font-bold">{m.title}</div>
            <div className="text-xs text-muted-foreground mt-1">Configuration sur mesure</div>
          </div>
        ))}
      </div>
    </div>
  </section>
);
