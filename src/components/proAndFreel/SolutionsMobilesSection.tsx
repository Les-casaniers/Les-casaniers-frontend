import { CheckCircle, Laptop } from "lucide-react";

export const SolutionsMobilesSection = () => (
  <section id="solutions-mobiles" className="py-20 bg-secondary/30">
    <div className="container-x grid md:grid-cols-2 gap-12 items-center">
      <div className="bg-amber-500/10 border border-amber-500/20 rounded-2xl p-8 flex flex-col items-center justify-center text-center gap-4">
        <Laptop className="h-16 w-16 text-amber-500" />
        <p className="text-sm text-muted-foreground">
          Légers, puissants, autonomes — pensés pour les professionnels
          toujours en déplacement.
        </p>
      </div>
      <div>
        <span className="text-[11px] font-bold uppercase tracking-widest text-amber-500">
          Solutions Mobiles
        </span>
        <h2 className="mt-3 text-3xl font-bold">
          Votre bureau dans votre sac, partout à Madagascar.
        </h2>
        <p className="mt-4 text-muted-foreground leading-relaxed">
          Consultants, commerciaux, freelances en déplacement — nos laptops
          professionnels allient légèreté, autonomie longue durée et puissance
          pour vos outils métier.
        </p>
        <ul className="mt-6 flex flex-col gap-3">
          {[
            "Laptops ThinkPad, Dell Latitude, HP EliteBook",
            "Autonomie 10 à 14h selon utilisation",
            "Écrans IPS anti-reflets pour le travail en extérieur",
            "Connectivité 4G/LTE intégrée en option",
            "Livraison avec sacoche de protection incluse",
          ].map((item) => (
            <li key={item} className="flex items-start gap-3 text-sm">
              <CheckCircle className="h-4 w-4 text-amber-500 mt-0.5 shrink-0" />
              <span>{item}</span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  </section>
);