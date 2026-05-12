import { Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import pcConfig from "@/assets/pc-config.jpg";

const reliques = [
  { label: "CPU", value: "Intel Core i5-12400F", note: "6 cœurs · 12 threads · 4.4 GHz" },
  { label: "Socket", value: "LGA 1700", note: "Compatible chipsets B660 / B760 / Z690 / Z790" },
  { label: "TDP", value: "65 W (jusqu'à 117 W boost)", note: "Ventirad recommandé : 130 W minimum" },
  { label: "iGPU", value: "Aucun (suffixe F)", note: "Carte graphique dédiée obligatoire" },
];

const points = [
  "Excellent rapport performance / prix pour le 1080p compétitif",
  "Idéal pour bureautique avancée, streaming, montage léger",
  "Couplé à une RTX 3060 / 4060, équilibre quasi parfait",
];

export const ProductExample = () => (
  <section className="container-x py-24">
    <div className="card-soft overflow-hidden grid lg:grid-cols-2">
      <div className="relative bg-secondary p-10 flex items-center justify-center">
        <img
          src={pcConfig}
          alt="Intel Core i5-12400F dans une configuration équilibrée"
          loading="lazy" width={1024} height={1024}
          className="w-full max-w-md rounded-2xl shadow-elevated object-cover aspect-square"
        />
        <div className="absolute top-6 left-6 pill bg-card/90">⚜️ Exemple commenté par le Fosa</div>
      </div>

      <div className="p-10 lg:p-12 space-y-6">
        <div>
          <div className="text-xs font-mono uppercase tracking-widest text-accent mb-2">Fiche produit · CPU</div>
          <h3 className="font-display text-3xl lg:text-4xl font-bold tracking-tight">Intel Core i5-12400F</h3>
          <p className="text-muted-foreground mt-3 leading-relaxed">
            La référence rationnelle pour un PC polyvalent. Six cœurs Alder Lake, sobre énergétiquement,
            redoutable en jeu et confortable en multitâche.
          </p>
        </div>

        {/* Tableau "reliques" */}
        <div className="rounded-2xl border border-border divide-y divide-border overflow-hidden">
          {reliques.map((r) => (
            <div key={r.label} className="grid grid-cols-12 gap-3 p-4 hover:bg-secondary/50 transition-colors">
              <div className="col-span-3 text-xs font-mono uppercase tracking-wider text-muted-foreground self-center">{r.label}</div>
              <div className="col-span-9">
                <div className="font-semibold">{r.value}</div>
                <div className="text-xs text-muted-foreground mt-0.5">{r.note}</div>
              </div>
            </div>
          ))}
        </div>

        <ul className="space-y-2">
          {points.map((p) => (
            <li key={p} className="flex gap-3 text-sm text-muted-foreground">
              <Check className="h-4 w-4 text-accent shrink-0 mt-0.5" />
              {p}
            </li>
          ))}
        </ul>

        <div className="flex flex-wrap gap-3 pt-2">
          <Button variant="hero" size="lg">Ajouter au configurateur</Button>
          <Button variant="soft" size="lg">Fiche complète</Button>
        </div>
      </div>
    </div>
  </section>
);
