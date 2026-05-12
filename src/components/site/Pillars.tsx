import { HandshakeIcon, MapPin, ShieldCheck, Wallet } from "lucide-react";

const piliers = [
  { icon: HandshakeIcon, title: "Conseil & Allié", desc: "Un interlocuteur humain qui parle votre langue, jamais en jargon." },
  { icon: MapPin, title: "Proximité", desc: "Showroom à Tananarive, livraison sécurisée dans tout Madagascar." },
  { icon: ShieldCheck, title: "Sécurité", desc: "Importation Europe, garantie 24 mois, SAV réactif." },
  { icon: Wallet, title: "Accessibilité", desc: "Du compact bureautique à la bête de gaming — un budget pour chacun." },
];

export const Pillars = () => (
  <section className="bg-primary text-primary-foreground relative overflow-hidden">
    <div className="absolute inset-0 grid-bg opacity-10" />
    <div className="container-x py-24 relative">
      <div className="max-w-2xl mb-14">
        <div className="inline-flex items-center gap-2 rounded-full border border-primary-foreground/20 px-4 py-1.5 text-xs font-medium text-primary-foreground/70 mb-4">
          Notre manifeste
        </div>
        <h2 className="font-display text-4xl lg:text-5xl font-bold tracking-tight">
          Quatre piliers, une seule promesse&nbsp;: <span className="text-accent">vous équiper juste</span>.
        </h2>
      </div>

      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {piliers.map((p) => (
          <div key={p.title} className="group relative rounded-2xl border border-primary-foreground/10 p-6 hover:border-accent/50 hover:bg-primary-foreground/5 transition-all duration-300">
            <div className="h-12 w-12 rounded-xl bg-accent/15 text-accent flex items-center justify-center mb-5 group-hover:bg-accent group-hover:text-accent-foreground transition-colors">
              <p.icon className="h-5 w-5" />
            </div>
            <h3 className="font-display text-lg font-bold mb-2">{p.title}</h3>
            <p className="text-sm text-primary-foreground/70 leading-relaxed">{p.desc}</p>
          </div>
        ))}
      </div>
    </div>
  </section>
);
