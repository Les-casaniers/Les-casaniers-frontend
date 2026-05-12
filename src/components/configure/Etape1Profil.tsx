import { useState } from "react";
import { Gamepad2, Monitor, Video, BarChart3, Briefcase, Sparkles, ChevronRight } from "lucide-react";
import { Link } from "react-router-dom";

const profils = [
  {
    id: "gaming-1080p",
    name: "Gaming 1080p",
    icon: <Gamepad2 className="h-8 w-8" />,
    color: "text-purple-500",
    bgColor: "bg-purple-500/10",
    borderColor: "border-purple-500",
    description: "Jeux en Full HD, performances fluides",
    specs: ["RTX 4060 / RTX 4070", "Intel i5 / Ryzen 5", "16GB DDR5", "1TB SSD"]
  },
  {
    id: "gaming-4k",
    name: "Gaming 4K",
    icon: <Monitor className="h-8 w-8" />,
    color: "text-blue-500",
    bgColor: "bg-blue-500/10",
    borderColor: "border-blue-500",
    description: "Ultra HD, graphismes max, Ray Tracing",
    specs: ["RTX 4080 / RTX 4090", "Intel i7/i9 / Ryzen 7/9", "32GB DDR5", "2TB SSD NVMe"]
  },
  {
    id: "montage-video",
    name: "Montage Vidéo",
    icon: <Video className="h-8 w-8" />,
    color: "text-red-500",
    bgColor: "bg-red-500/10",
    borderColor: "border-red-500",
    description: "4K, 8K, After Effects, Premiere Pro",
    specs: ["RTX 4070 Ti / 4080", "Intel i7/i9 / Ryzen 9", "64GB DDR5", "2TB SSD + 4TB HDD"]
  },
  {
    id: "analyse-donnees",
    name: "Analyse de données",
    icon: <BarChart3 className="h-8 w-8" />,
    color: "text-green-500",
    bgColor: "bg-green-500/10",
    borderColor: "border-green-500",
    description: "Data Science, IA, Machine Learning",
    specs: ["RTX 4090 / A-Series", "Intel i9 / Threadripper", "128GB DDR5 ECC", "2TB SSD + 4TB HDD"]
  },
  {
    id: "bureautique",
    name: "Bureautique",
    icon: <Briefcase className="h-8 w-8" />,
    color: "text-amber-500",
    bgColor: "bg-amber-500/10",
    borderColor: "border-amber-500",
    description: "Travail quotidien, multitâche léger",
    specs: ["Intel i3/i5 / Ryzen 3/5", "8GB à 16GB DDR4/DDR5", "512GB SSD", "Connectique complète"]
  }
];

export const Etape1Profil = () => {
  const [selectedProfil, setSelectedProfil] = useState<string | null>(null);

  return (
    <section id="etape1" className="py-12 scroll-mt-20">
      <div className="container-x">
        {/* En-tête */}
        <div className="text-center mb-10">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-gradient-to-r from-amber-500/20 to-orange-500/20 border border-amber-500/50 rounded-full mb-4">
            <Sparkles className="h-4 w-4 text-amber-500" />
            <span className="text-xs font-bold uppercase tracking-widest text-amber-600 dark:text-amber-400">
              Étape 1
            </span>
          </div>
          <h2 className="text-3xl md:text-4xl font-bold mb-3">
            Le Choix du <span className="text-amber-500">Profil</span>
          </h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            🐧 <strong>Le Fosa dit :</strong> "Choisis ton super-pouvoir !"
          </p>
        </div>

        {/* Grille des profils */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-6 mb-8">
          {profils.map((profil) => (
            <div
              key={profil.id}
              onClick={() => setSelectedProfil(profil.id)}
              className={`cursor-pointer border-2 rounded-xl p-5 transition-all hover:scale-105 ${
                selectedProfil === profil.id
                  ? `${profil.borderColor} ${profil.bgColor} shadow-lg`
                  : "border-border hover:border-foreground/30"
              }`}
            >
              <div className={`p-3 rounded-full ${profil.bgColor} ${profil.color} inline-block mb-3`}>
                {profil.icon}
              </div>
              <h3 className={`font-bold text-lg mb-1 ${profil.color}`}>{profil.name}</h3>
              <p className="text-xs text-muted-foreground mb-3">{profil.description}</p>
              <div className="space-y-1">
                {profil.specs.map((spec, idx) => (
                  <div key={idx} className="flex items-center gap-1 text-[10px]">
                    <div className="h-1 w-1 rounded-full bg-current" />
                    <span>{spec}</span>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* Message de confirmation */}
        {selectedProfil && (
          <div className="bg-gradient-to-r from-amber-500/10 to-orange-500/10 border border-amber-500/30 rounded-lg p-4 text-center">
            <p className="text-sm">
              🎯 Tu as choisi : <strong>{profils.find(p => p.id === selectedProfil)?.name}</strong> !
              Passe à l'étape suivante pour la sélection assistée.
            </p>
          </div>
        )}

        {/* Navigation */}
        <div className="flex justify-end mt-6">
          <a
            href="#etape2"
            className="inline-flex items-center gap-2 px-6 py-2 bg-gradient-to-r from-amber-500 to-orange-500 text-black font-bold rounded-lg hover:from-amber-600 hover:to-orange-600 transition"
          >
            Étape suivante <ChevronRight className="h-4 w-4" />
          </a>
        </div>
      </div>
    </section>
  );
};