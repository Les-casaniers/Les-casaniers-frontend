import { CheckCircle, HardDrive } from "lucide-react";

export const ServeursSection = () => (
  <section id="serveurs" className="py-20 border-b border-border">
    <div className="container-x grid md:grid-cols-2 gap-12 items-center">
      <div>
        <span className="text-[11px] font-bold uppercase tracking-widest text-green-500">
          Serveurs NAS & Sauvegarde
        </span>
        <h2 className="mt-3 text-3xl font-bold">
          Vos données en sécurité, accessibles à tout moment.
        </h2>
        <p className="mt-4 text-muted-foreground leading-relaxed">
          Un NAS d'entreprise centralise vos fichiers, automatise vos
          sauvegardes et garantit que vos données critiques ne disparaissent
          jamais — même en cas de panne disque.
        </p>
        <ul className="mt-6 flex flex-col gap-3">
          {[
            "NAS Synology ou QNAP selon vos besoins",
            "Configuration RAID 1/5/6 pour la redondance",
            "Sauvegarde automatique planifiée (règle 3-2-1)",
            "Accès distant sécurisé via VPN",
            "Capacité de 4 To à 100+ To évolutive",
          ].map((item) => (
            <li key={item} className="flex items-start gap-3 text-sm">
              <CheckCircle className="h-4 w-4 text-green-500 mt-0.5 shrink-0" />
              <span>{item}</span>
            </li>
          ))}
        </ul>
      </div>
      <div className="bg-green-500/10 border border-green-500/20 rounded-2xl p-8 flex flex-col items-center justify-center text-center gap-4">
        <HardDrive className="h-16 w-16 text-green-500" />
        <p className="text-sm text-muted-foreground">
          Installation, configuration et formation incluses.
          Audit de vos besoins de stockage offert.
        </p>
      </div>
    </div>
  </section>
);