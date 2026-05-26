import { CheckCircle, Monitor } from "lucide-react";

export const BureautiqueSection = () => (
  <section id="bureautique" className="py-20 border-b border-border">
    <div className="container-x grid md:grid-cols-2 gap-12 items-center">
      <div>
        <span className="text-[11px] font-bold uppercase tracking-widest text-blue-500">
          Bureautique & Multitâche
        </span>
        <h2 className="mt-3 text-3xl font-bold">
          Des postes fiables pour votre productivité au quotidien.
        </h2>
        <p className="mt-4 text-muted-foreground leading-relaxed">
          Traitement de texte, tableurs, visioconférences, navigation web intensive —
          nos configurations bureautiques sont optimisées pour encaisser plusieurs
          applications simultanées sans ralentissement.
        </p>
        <ul className="mt-6 flex flex-col gap-3">
          {[
            "Processeurs Intel Core i5/i7 ou AMD Ryzen 5/7",
            "16 à 32 Go de RAM DDR5 pour le multitâche",
            "SSD NVMe 512 Go à 1 To pour un démarrage rapide",
            "Compatible Microsoft 365, Google Workspace, Zoom",
            "Garantie 24 mois pièces et main d'œuvre",
          ].map((item) => (
            <li key={item} className="flex items-start gap-3 text-sm">
              <CheckCircle className="h-4 w-4 text-blue-500 mt-0.5 shrink-0" />
              <span>{item}</span>
            </li>
          ))}
        </ul>
      </div>
      <div className="bg-blue-500/10 border border-blue-500/20 rounded-2xl p-8 flex flex-col items-center justify-center text-center gap-4">
        <Monitor className="h-16 w-16 text-blue-500" />
        <p className="text-sm text-muted-foreground">
          À partir de 850 000 Ar — configuration prête à l'emploi,
          livrée et installée dans vos locaux.
        </p>
      </div>
    </div>
  </section>
);