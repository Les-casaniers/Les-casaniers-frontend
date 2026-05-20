import { HardDrive, Database, Shield, Wifi, Server, Truck } from "lucide-react";

const ITEMS = [
  { icon: <Server className="h-4 w-4 text-green-500 mt-0.5 shrink-0" />, label: "NAS Synology ou QNAP selon vos besoins" },
  { icon: <Shield className="h-4 w-4 text-green-500 mt-0.5 shrink-0" />, label: "Configuration RAID 1/5/6 pour la redondance" },
  { icon: <Database className="h-4 w-4 text-green-500 mt-0.5 shrink-0" />, label: "Sauvegarde automatique planifiée (règle 3-2-1)" },
  { icon: <Wifi className="h-4 w-4 text-green-500 mt-0.5 shrink-0" />, label: "Accès distant sécurisé via VPN" },
  { icon: <HardDrive className="h-4 w-4 text-green-500 mt-0.5 shrink-0" />, label: "Capacité de 4 To à 100+ To évolutive" },
];

export const ServeursSection = () => (
  <section id="serveurs" className="py-20 border-b border-border">
    <div className="container-x grid md:grid-cols-2 gap-12 items-start">

      {/* Colonne gauche — texte + liste */}
      <div>
        <span className="flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-widest text-green-500">
          <HardDrive className="h-3.5 w-3.5" /> Serveurs NAS & Sauvegarde
        </span>
        <h2 className="mt-4 text-3xl font-bold leading-snug">
          Vos données en sécurité, accessibles à tout moment.
        </h2>
        <p className="mt-4 text-muted-foreground text-sm leading-relaxed">
          Un NAS d'entreprise centralise vos fichiers, automatise vos
          sauvegardes et garantit que vos données critiques ne disparaissent
          jamais — même en cas de panne disque.
        </p>

        <div className="mt-6 rounded-xl border border-border overflow-hidden">
          <div className="px-4 py-3 bg-secondary text-[11px] font-semibold uppercase tracking-widest text-muted-foreground border-b border-border">
            Ce qui est inclus
          </div>
          <ul className="divide-y divide-border">
            {ITEMS.map((item) => (
              <li key={item.label} className="flex items-start gap-3 px-4 py-3 text-sm text-muted-foreground">
                {item.icon}
                <span>{item.label}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* Colonne droite — carte produit */}
      <div className="card-soft p-6 flex flex-col gap-4">
        <div className="flex items-center justify-between">
          <span className="text-sm font-semibold">Serveur NAS</span>
          <span className="text-[11px] font-semibold px-3 py-1 rounded-full bg-green-50 text-green-700 border border-green-200">
            Sécurité des données
          </span>
        </div>

        <div className="flex items-center gap-3 p-3 rounded-xl bg-secondary">
          <div className="h-11 w-11 rounded-xl bg-green-50 border border-green-200 flex items-center justify-center shrink-0">
            <HardDrive className="h-5 w-5 text-green-600" />
          </div>
          <div>
            <p className="text-sm font-semibold">NAS Rack ou Desktop</p>
            <p className="text-xs text-muted-foreground">Synology · QNAP · configuration sur mesure</p>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-2">
          {[
            { label: "À partir de", value: "1 200 000 Ar", gold: true },
            { label: "Capacité", value: "4 To → 100+ To" },
            { label: "Redondance", value: "RAID 1/5/6" },
            { label: "Audit", value: "Offert" },
          ].map((s) => (
            <div key={s.label} className="bg-secondary rounded-xl p-3">
              <p className="text-[11px] uppercase tracking-widest text-muted-foreground mb-1">{s.label}</p>
              <p className={`text-lg font-semibold ${s.gold ? "text-[#c8a96e]" : ""}`}>{s.value}</p>
            </div>
          ))}
        </div>

        <div className="flex items-center gap-2 px-3 py-2.5 rounded-xl border border-[#c8a96e]/30 bg-[#c8a96e]/5 text-sm text-muted-foreground">
          <Truck className="h-4 w-4 text-[#c8a96e] shrink-0" />
          Installation, configuration et formation incluses
        </div>
      </div>

    </div>
  </section>
);