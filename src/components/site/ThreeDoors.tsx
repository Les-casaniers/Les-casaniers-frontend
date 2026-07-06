import { Briefcase, Gamepad2, Wand2, Sparkles, Zap, Compass, ArrowUpRight } from "lucide-react";
import pcPro from "@/assets/pc-pro.jpg";
import pcGaming from "@/assets/pc-gaming.jpg";
import pcConfig from "@/assets/pc-config.jpg";
import { Link } from "react-router-dom";

const portes = [
  {
    id: 1,
    icon: Briefcase,
    image: pcPro,
    tag: "Porte 1 · Rationnel",
    title: "Pro & freelance",
    desc: "Bureautique, mini PC, portables, tablettes. Productivité sans compromis.",
    cta: "Configurateur productivité",
    accent: "from-primary/80 to-primary",
    href: "/pro-freelance",
    color: "blue",
    features: ["300+ configs pro", "Sécurité renforcée", "Livraison express"],
  },
  {
    id: 2,
    icon: Gamepad2,
    image: pcGaming,
    tag: "Porte 2 · Émotionnel",
    title: "Gamer",
    desc: "PC gaming, laptops, périphériques. La performance qui fait vibrer.",
    cta: "Configurateur performance",
    accent: "from-accent to-accent/80",
    href: "/gaming",
    color: "accent",
    features: ["500+ jeux testés", "RTX & Ryzen", "RGB personnalisable"],
  },
  {
    id: 3,
    icon: Sparkles,
    image: pcConfig,
    tag: "Super Configurateur",
    title: "Super Configurateur",
    desc: "Créez la machine de vos rêves. 100% personnalisable, zéro limite. Composants premium, assemblage sur mesure.",
    cta: "Lancer le super configurateur",
    accent: "from-amber-500 to-orange-500",
    href: "/configurateur",
    color: "premium",
    features: ["Choix infini", "Pièces premium", "Devis instantané"],
    isPremium: true,
  },
  {
    id: 4,
    icon: Wand2,
    image: pcConfig,
    tag: "Porte 3 · Expert",
    title: "Devis Express",
    desc: "Accès direct, sans catégorie. Composez librement votre machine idéale.",
    cta: "Lancer le configurateur",
    accent: "from-tech to-tech/70",
    href: "/devis-express",
    color: "tech",
    features: ["Rapide et simple", "Compatibilité auto", "Meilleurs prix"],
  },
];

export const ThreeDoors = () => (
  <section className="container-x py-24">
    {/* En-tête avec animation */}
    <div className="max-w-2xl mb-14">
      <div className="pill mb-4 gap-2">
        <Compass className="h-3.5 w-3.5 text-accent" />
        3 portes d'entrée + Super configurateur
      </div>
      <h2 className="font-display text-4xl lg:text-5xl font-bold tracking-tight">
        Choisissez votre <span className="text-gradient-accent">chemin</span>.
      </h2>
      <p className="text-muted-foreground mt-3 text-lg">
        Trois parcours pensés pour votre profil — émotionnel ou rationnel, débutant ou expert.
      </p>
    </div>

    <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-5">
      {portes.map((p, i) => (
        <Link
          to={p.href}
          key={p.id}
          className={`group relative card-soft overflow-hidden hover-lift cursor-pointer block transition-all duration-500 ${
            p.isPremium ? 'ring-2 ring-amber-500/50 shadow-glow' : ''
          }`}
          style={{ animationDelay: `${i * 100}ms` }}
        >
          {/* Badge Premium */}
          {p.isPremium && (
            <div className="absolute top-4 right-4 z-20 bg-gradient-to-r from-amber-500 to-orange-500 text-black text-[10px] font-black uppercase px-3 py-1.5 rounded-full shadow-lg animate-pulse flex items-center gap-1">
              <Sparkles className="h-3 w-3" />
              NEW
            </div>
          )}

          {/* Image section */}
          <div className="relative aspect-[4/3] overflow-hidden bg-secondary">
            <img
              src={p.image}
              alt={p.title}
              loading="lazy"
              width={1024}
              height={768}
              className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
            />
            
            {/* Overlay gradient */}
            <div className={`absolute inset-0 bg-gradient-to-t ${p.accent} opacity-30 mix-blend-multiply ${p.isPremium ? 'opacity-40' : ''}`} />
            
            {/* Overlay supplémentaire pour premium */}
            {p.isPremium && (
              <div className="absolute inset-0 bg-gradient-to-r from-amber-500/20 to-transparent" />
            )}
            
            {/* Tag */}
            <div className="absolute top-4 left-4 pill bg-card/90 backdrop-blur z-10">
              <p.icon className={`h-3.5 w-3.5 ${p.isPremium ? 'text-amber-500' : 'text-accent'}`} />
              <span>{p.tag}</span>
            </div>

            {/* Effet de brillance au hover */}
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000 pointer-events-none" />
          </div>

          {/* Contenu */}
          <div className="p-6">
            <h3 className={`font-display text-xl lg:text-2xl font-bold mb-2 flex items-center gap-2 ${
              p.isPremium ? 'text-amber-600 dark:text-amber-400' : ''
            }`}>
              {p.title}
              {p.isPremium && <Zap className="h-4 w-4 text-amber-500 animate-pulse" />}
            </h3>
            <p className="text-muted-foreground text-sm leading-relaxed mb-4">{p.desc}</p>
            
            {/* Features list */}
            <div className="flex flex-wrap gap-1.5 mb-4">
              {p.features.map((feature, idx) => (
                <span key={idx} className="text-[9px] px-2 py-1 rounded-full bg-secondary/50 text-muted-foreground">
                  {feature}
                </span>
              ))}
            </div>
            
            {/* CTA */}
            <div className={`flex items-center justify-between pt-2 border-t ${
              p.isPremium ? 'border-amber-500/30' : 'border-border'
            }`}>
              <span className={`text-xs font-semibold ${
                p.isPremium ? 'text-amber-600 dark:text-amber-400' : 'text-accent'
              }`}>
                {p.cta}
              </span>
              <ArrowUpRight className={`h-5 w-5 transition-transform group-hover:translate-x-1 group-hover:-translate-y-1 ${
                p.isPremium ? 'text-amber-500' : ''
              }`} />
            </div>
          </div>

          {/* Effet de glow pour premium */}
          {p.isPremium && (
            <div className="absolute inset-0 rounded-xl pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity duration-500">
              <div className="absolute -inset-0.5 bg-gradient-to-r from-amber-500 to-orange-500 rounded-xl blur-xl opacity-30" />
            </div>
          )}
        </Link>
      ))}
    </div>

    {/* Section bonus pour le Super Configurateur 
    <div className="mt-16 p-8 rounded-2xl bg-gradient-to-r from-amber-500/10 to-orange-500/10 border border-amber-500/20">
      <div className="flex flex-col md:flex-row items-center justify-between gap-6">
        <div className="flex items-center gap-4">
          <div className="h-16 w-16 rounded-2xl bg-gradient-to-br from-amber-500 to-orange-500 flex items-center justify-center shadow-glow">
            <Wand2 className="h-8 w-8 text-white" />
          </div>
          <div>
            <h3 className="font-display text-2xl font-bold">Super Configurateur Miavaka ⭐</h3>
            <p className="text-muted-foreground text-sm">
              L'expérience ultime de personnalisation. Créez le PC parfait, composant par composant.
            </p>
          </div>
        </div>
        <Link
          to="/configurateur"
          className="group px-6 py-3 bg-gradient-to-r from-amber-500 to-orange-500 text-black font-bold rounded-full flex items-center gap-2 hover:shadow-lg transition-all hover:scale-105"
        >
          <Sparkles className="h-4 w-4" />
          Commencer maintenant
          <ArrowUpRight className="h-4 w-4 transition-transform group-hover:translate-x-1 group-hover:-translate-y-1" />
        </Link>
      </div>
      
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6 pt-6 border-t border-amber-500/20">
        {[
          { icon: "🔧", text: "100% personnalisable" },
          { icon: "⭐", text: "Pièces premium" },
          { icon: "🎯", text: "Devis instantané" },
          { icon: "🚀", text: "Assemblage pro" },
        ].map((item, idx) => (
          <div key={idx} className="flex items-center gap-2 text-sm">
            <span className="text-lg">{item.icon}</span>
            <span className="text-muted-foreground">{item.text}</span>
          </div>
        ))}
      </div>
    </div>
    */}
  </section>
);