import { FileText, CheckCircle } from "lucide-react";

export const FacturationSection = () => (
  <section id="facturation" className="py-20 border-b border-border">
    <div className="container-x grid md:grid-cols-2 gap-12 items-center">
      <div>
        <span className="text-[11px] font-bold uppercase tracking-widest text-blue-500">
          Facturation Normée
        </span>
        <h2 className="mt-3 text-3xl font-bold">
          Documents conformes pour votre comptabilité d'entreprise.
        </h2>
        <p className="mt-4 text-muted-foreground leading-relaxed">
          Toutes vos factures respectent les normes comptables en vigueur.
          Numérotation séquentielle, TVA détaillée, mentions légales complètes —
          prêt pour votre expert-comptable ou votre logiciel de gestion.
        </p>
        <ul className="mt-6 flex flex-col gap-3">
          {[
            "Factures TVA conformes (20%, taux réduits)",
            "Format PDF et export comptable (CSV, XML)",
            "Numéro SIRET et mentions légales inclus",
            "Historique de facturation accessible en ligne",
          ].map((item) => (
            <li key={item} className="flex items-start gap-3 text-sm">
              <CheckCircle className="h-4 w-4 text-blue-500 mt-0.5 shrink-0" />
              <span>{item}</span>
            </li>
          ))}
        </ul>
      </div>
      <div className="bg-blue-500/10 border border-blue-500/20 rounded-2xl p-8 flex flex-col items-center justify-center text-center gap-4">
        <FileText className="h-16 w-16 text-blue-500" />
        <p className="text-sm text-muted-foreground">
          Chaque commande génère automatiquement une facture conforme,
          disponible dans votre espace Pro.
        </p>
      </div>
    </div>
  </section>
);