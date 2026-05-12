import { Ship, Shield, CheckCircle } from "lucide-react";

export const ImportationSection = () => (
  <section id="importation" className="py-20 bg-secondary/30">
    <div className="container-x grid md:grid-cols-2 gap-12 items-center">
      <div className="bg-amber-500/10 border border-amber-500/20 rounded-2xl p-8 flex flex-col items-center justify-center text-center gap-4">
        <Ship className="h-16 w-16 text-amber-500" />
        <div className="flex items-center gap-2">
          <Shield className="h-4 w-4 text-amber-500" />
          <span className="text-sm font-bold text-amber-500">Normes CE / RoHS conformes</span>
        </div>
      </div>
      <div>
        <span className="text-[11px] font-bold uppercase tracking-widest text-amber-500">
          Importation Directe
        </span>
        <h2 className="mt-3 text-3xl font-bold">
          Accès aux dernières normes européennes de fiabilité.
        </h2>
        <p className="mt-4 text-muted-foreground leading-relaxed">
          Nous importons directement auprès de distributeurs européens
          certifiés. Zéro intermédiaire, matériel garanti conforme aux normes
          CE, RoHS et aux directives européennes en vigueur.
        </p>
        <ul className="mt-6 flex flex-col gap-3">
          {[
            "Sourcing exclusif chez des distributeurs certifiés EU",
            "Garantie constructeur internationale incluse",
            "Traçabilité complète de chaque composant",
            "Dédouanement et livraison gérés en totalité",
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