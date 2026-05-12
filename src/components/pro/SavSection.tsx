import { Headphones, Clock, CheckCircle } from "lucide-react";

export const SavSection = () => (
  <section id="sav" className="py-20 border-b border-border bg-secondary/30">
    <div className="container-x grid md:grid-cols-2 gap-12 items-center">
      <div className="bg-green-500/10 border border-green-500/20 rounded-2xl p-8 flex flex-col items-center justify-center text-center gap-4">
        <Headphones className="h-16 w-16 text-green-500" />
        <div className="flex items-center gap-2">
          <Clock className="h-4 w-4 text-green-500" />
          <span className="text-sm font-bold text-green-500">Réponse sous 2h ouvrées</span>
        </div>
      </div>
      <div>
        <span className="text-[11px] font-bold uppercase tracking-widest text-green-500">
          SAV Prioritaire
        </span>
        <h2 className="mt-3 text-3xl font-bold">
          Parce qu'une heure d'arrêt est une perte de chiffre d'affaires.
        </h2>
        <p className="mt-4 text-muted-foreground leading-relaxed">
          Vos clients Pro passent en tête de file. Pas d'attente, pas de ticket
          noyé dans la masse — un interlocuteur dédié qui connaît votre parc.
        </p>
        <ul className="mt-6 flex flex-col gap-3">
          {[
            "File d'attente prioritaire dédiée Pro",
            "Technicien référent attribué à votre compte",
            "Intervention sur site possible (selon zone)",
            "Remplacement matériel express sous 24h",
          ].map((item) => (
            <li key={item} className="flex items-start gap-3 text-sm">
              <CheckCircle className="h-4 w-4 text-green-500 mt-0.5 shrink-0" />
              <span>{item}</span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  </section>
);