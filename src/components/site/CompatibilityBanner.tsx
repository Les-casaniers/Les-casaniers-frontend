import fosa from "@/assets/casaniers-mascot.png";
import { Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";

export const CompatibilityBanner = () => (
  <section className="container-x py-24">
    <div className="relative overflow-hidden rounded-[2rem] bg-gradient-tech p-10 lg:p-16 text-primary-foreground shadow-elevated">
      <div className="absolute -top-20 -right-20 h-96 w-96 rounded-full bg-accent/20 blur-3xl" />
      <div className="absolute inset-0 grid-bg opacity-10" />

      <div className="relative grid lg:grid-cols-2 gap-10 items-center">
        <div>
          <div className="inline-flex items-center gap-2 rounded-full border border-primary-foreground/20 px-4 py-1.5 text-xs font-medium mb-5">
            <Sparkles className="h-3.5 w-3.5 text-accent" /> Assistant compatibilité
          </div>
          <h2 className="font-display text-4xl lg:text-5xl font-bold tracking-tight leading-[1.05]">
            On vérifie tout, <span className="text-accent">vous validez sereinement.</span>
          </h2>
          <p className="text-primary-foreground/70 mt-5 max-w-md">
            En temps réel, le Fosa et son équipe analysent votre configuration pour éviter incompatibilités,
            sous-dimensionnements et oublis.
          </p>
          <div className="flex flex-wrap gap-3 mt-7">
            <Button variant="hero" size="lg">Lancer l'assistant</Button>
            <Button variant="soft" size="lg" className="bg-card/10 border-primary-foreground/20 text-primary-foreground hover:bg-card/20">
              Voir un exemple
            </Button>
          </div>
        </div>

        <div className="space-y-3">
          <Recommendation
            mascot="L'Archiviste"
            text="te conseille une carte B760 ou Z790"
          />
          <Recommendation
            mascot="Sub-Zero"
            text="suggère un ventirad de minimum 150W TDP"
          />
          <div className="flex items-center gap-3 pt-2 text-xs text-primary-foreground/60">
            <img src={fosa} alt="" className="h-10 w-10 object-contain" />
            <span>Le Fosa surveille 14 points de compatibilité en parallèle.</span>
          </div>
        </div>
      </div>
    </div>
  </section>
);

const Recommendation = ({ mascot, text }: { mascot: string; text: string }) => (
  <div className="glass rounded-2xl p-4 flex items-start gap-3 border border-primary-foreground/10 bg-card/10">
    <div className="h-9 w-9 rounded-xl bg-accent/20 text-accent flex items-center justify-center text-sm font-bold shrink-0">
      ✓
    </div>
    <p className="text-sm leading-relaxed">
      <strong className="text-accent">{mascot}</strong>{" "}
      <span className="text-primary-foreground/80">{text}</span>
    </p>
  </div>
);
