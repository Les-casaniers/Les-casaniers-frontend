import { Newspaper, Calendar, MapPin, ExternalLink, Sparkles } from "lucide-react";
import { Link } from "react-router-dom";

export const ActualitesTech = () => {
  const actualites = [
    {
      id: 1,
      title: "NVIDIA RTX 50 Series : Date de sortie Europe",
      date: "15 Mars 2026",
      region: "Europe",
      summary: "Les nouvelles cartes graphiques RTX 5090, 5080 et 5070 arrivent en Europe. Performances doublées par rapport à la génération précédente.",
      link: "#",
      tag: "Nouveauté"
    },
    {
      id: 2,
      title: "Intel Core Ultra 300 : Les premiers benchmarks",
      date: "10 Mars 2026",
      region: "Europe",
      summary: "Les nouveaux processeurs Intel Core Ultra 300 Series (Arrow Lake) montrent des performances impressionnantes en jeu et en productivité.",
      link: "#",
      tag: "Test"
    },
    {
      id: 3,
      title: "AMD Ryzen 9000X3D : Disponibilité en Europe",
      date: "5 Mars 2026",
      region: "Europe",
      summary: "Les Ryzen 9 9950X3D et 9900X3D avec technologie 3D V-Cache sont maintenant disponibles chez nos fournisseurs européens.",
      link: "#",
      tag: "Sortie"
    },
    {
      id: 4,
      title: "DDR6 : Quoi de neuf ?",
      date: "28 Février 2026",
      region: "Europe",
      summary: "La prochaine génération de RAM promet des vitesses jusqu'à 12 800 MHz. Arrivée prévue fin 2026 en Europe.",
      link: "#",
      tag: "A venir"
    },
    {
      id: 5,
      title: "Watercooling custom : Les nouvelles tendances",
      date: "20 Février 2026",
      region: "Europe",
      summary: "Découvrez les innovations en matière de refroidissement liquide : radiateurs plus fins, pompes silencieuses et RGB intégré.",
      link: "#",
      tag: "Tendance"
    },
    {
      id: 6,
      title: "Windows 12 : Spécifications requises",
      date: "15 Février 2026",
      region: "Monde",
      summary: "Microsoft dévoile les prérequis pour Windows 12. Focus sur l'IA intégrée et la sécurité renforcée.",
      link: "#",
      tag: "Info"
    }
  ];

  return (
    <section id="actualites-tech" className="py-12 bg-secondary/30 scroll-mt-20">
      <div className="container-x">
        <div className="flex items-center gap-3 mb-8">
          <Newspaper className="h-8 w-8 text-green-500" />
          <h2 className="text-3xl font-bold">Actualités Tech</h2>
        </div>
        <p className="text-muted-foreground mb-8 max-w-3xl">
          Restez informé des dernières sorties et innovations technologiques en Europe. 
          Nous importons directement les derniers composants pour vous.
        </p>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {actualites.map((actu) => (
            <div key={actu.id} className="border border-border rounded-lg overflow-hidden hover:shadow-lg transition-all hover:scale-105 duration-300 bg-background">
              <div className="p-5">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <MapPin className="h-3 w-3 text-muted-foreground" />
                    <span className="text-[10px] text-muted-foreground">{actu.region}</span>
                  </div>
                  <span className="text-[9px] px-2 py-0.5 rounded-full bg-green-500/20 text-green-600 dark:text-green-400">
                    {actu.tag}
                  </span>
                </div>
                
                <h3 className="font-bold text-lg mb-2 line-clamp-2">{actu.title}</h3>
                <p className="text-sm text-muted-foreground mb-3 line-clamp-3">{actu.summary}</p>
                
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1 text-[10px] text-muted-foreground">
                    <Calendar className="h-3 w-3" />
                    <span>{actu.date}</span>
                  </div>
                  <a 
                    href={actu.link} 
                    className="text-xs text-blue-500 hover:underline flex items-center gap-1"
                  >
                    Lire plus <ExternalLink className="h-3 w-3" />
                  </a>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Bandeau importation */}
        <div className="mt-8 bg-gradient-to-r from-blue-500/10 to-cyan-500/5 border border-blue-500/30 rounded-lg p-5 text-center">
          <Sparkles className="h-5 w-5 text-blue-500 mx-auto mb-2" />
          <p className="text-sm">
            <strong>Bon à savoir :</strong> Toutes ces nouveautés sont disponibles à l'importation depuis l'Europe vers Madagascar.
            <Link to="/importation" className="block text-blue-500 hover:underline mt-2">Découvrir nos services d'importation →</Link>
          </p>
        </div>
      </div>
    </section>
  );
};