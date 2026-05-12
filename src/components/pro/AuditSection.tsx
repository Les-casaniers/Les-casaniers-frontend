import { BarChart2, CheckCircle } from "lucide-react";

export const AuditSection = () => (
  <section id="audit" className="py-20 border-b border-border">
    <div className="container-x grid md:grid-cols-2 gap-12 items-center">
      <div>
        <span className="text-[11px] font-bold uppercase tracking-widest text-purple-500">
          Audit de Parc
        </span>
        <h2 className="mt-3 text-3xl font-bold">
          De l'unité centrale au parc complet, nous adaptons nos offres à
          votre structure.
        </h2>
        <p className="mt-4 text-muted-foreground leading-relaxed">
          Que vous ayez 1 ou 200 postes, nous établissons un état des lieux
          complet de votre infrastructure informatique et vous proposons un
          plan de renouvellement adapté à votre budget.
        </p>
        <ul className="mt-6 flex flex-col gap-3">
          {[
            "Inventaire complet de votre parc (matériel & logiciel)",
            "Rapport de vétusté et recommandations priorisées",
            "Offres groupées avec remises sur volume",
            "Plan de renouvellement étalé dans le temps",
          ].map((item) => (
            <li key={item} className="flex items-start gap-3 text-sm">
              <CheckCircle className="h-4 w-4 text-purple-500 mt-0.5 shrink-0" />
              <span>{item}</span>
            </li>
          ))}
        </ul>
      </div>
      <div className="bg-purple-500/10 border border-purple-500/20 rounded-2xl p-8 flex flex-col items-center justify-center text-center gap-4">
        <BarChart2 className="h-16 w-16 text-purple-500" />
        <p className="text-sm text-muted-foreground">
          Un audit offert pour toute première commande Pro de plus de 500 000 Ar.
        </p>
      </div>
    </div>
  </section>
);