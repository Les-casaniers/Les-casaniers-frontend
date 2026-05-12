import { useLocation } from "react-router-dom";
import { useEffect } from "react";
import { Settings, Sparkles } from "lucide-react";
import { SiteLayout } from "@/components/site/SiteLayout";
import { Etape1Profil } from "@/components/configure/Etape1Profil";
import { Etape2Selection } from "@/components/configure/Etape2Selection";
import { Etape3Mascottes } from "@/components/configure/Etape3Mascottes";
import { Etape4Recap } from "@/components/configure/Etape4Recap";

const Config = () => {
  const location = useLocation();

  useEffect(() => {
    document.title = "Configuration PC — Les Casaniers Madagascar";
    const meta = document.querySelector('meta[name="description"]') ?? document.head.appendChild(
      Object.assign(document.createElement("meta"), { name: "description" })
    );
    meta.setAttribute(
      "content",
      "Configurez votre PC sur-mesure en 4 étapes : choix du profil, sélection assistée, vérification des compatibilités et récapitulatif."
    );
  }, []);

  useEffect(() => {
    if (location.hash) {
      setTimeout(() => {
        const element = document.querySelector(location.hash);
        if (element) {
          element.scrollIntoView({ behavior: "smooth", block: "start" });
        }
      }, 100);
    } else {
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  }, [location.hash]);

  const anchors = [
    { label: "Étape 1 : Profil", href: "#etape1", color: "text-purple-500 border-purple-500/30 hover:bg-purple-500/10" },
    { label: "Étape 2 : Sélection", href: "#etape2", color: "text-blue-500 border-blue-500/30 hover:bg-blue-500/10" },
    { label: "Étape 3 : Alertes", href: "#etape3", color: "text-amber-500 border-amber-500/30 hover:bg-amber-500/10" },
    { label: "Étape 4 : Récap", href: "#etape4", color: "text-green-500 border-green-500/30 hover:bg-green-500/10" }
  ];

  return (
    <SiteLayout>
      {/* Hero */}
      <section className="py-20 bg-gradient-to-r from-amber-500/10 to-orange-500/5 border-b border-border">
        <div className="container-x text-center">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-gradient-to-r from-amber-500/20 to-orange-500/20 border border-amber-500/50 rounded-full mb-6">
            <Settings className="h-4 w-4 text-amber-500" />
            <span className="text-xs font-bold uppercase tracking-widest text-amber-600 dark:text-amber-400">
              Super Configurateur
            </span>
          </div>
          <h1 className="text-4xl md:text-6xl font-bold mb-4">
            Configure ton PC en <span className="text-amber-500">4 étapes</span>
          </h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Du choix du profil au récapitulatif épique, construis la machine de tes rêves
            avec l'aide de nos mascottes !
          </p>

          {/* Boutons d'ancrage */}
          <div className="flex flex-wrap justify-center gap-3 mt-8">
            {anchors.map((a) => (
              <a
                key={a.href}
                href={a.href}
                className={`px-4 py-2 text-xs font-bold uppercase tracking-widest border rounded-full transition-colors ${a.color}`}
              >
                {a.label}
              </a>
            ))}
          </div>
        </div>
      </section>

      {/* Les 4 étapes */}
      <Etape1Profil />
      <Etape2Selection />
      <Etape3Mascottes />
      <Etape4Recap />
    </SiteLayout>
  );
};

export default Config;