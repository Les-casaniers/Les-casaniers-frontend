import { Youtube, Wrench, Cpu, Fan, Trash2, Shield, Play, Clock, CheckCircle } from "lucide-react";
import { Link } from "react-router-dom";

export const TutosMaintenance = () => {
  const tutos = [
    {
      id: 1,
      title: "Nettoyer son PC : Guide complet",
      duration: "10 min",
      level: "Débutant",
      icon: <Trash2 className="h-5 w-5" />,
      color: "text-blue-500",
      steps: [
        "Débrancher tous les câbles",
        "Ouvrir le boîtier",
        "Utiliser une bombe à air comprimé",
        "Nettoyer les ventilateurs",
        "Refermer et rebrancher"
      ],
      videoUrl: "https://www.youtube.com/embed/VIDEO_ID_1"
    },
    {
      id: 2,
      title: "Changer la pâte thermique",
      duration: "15 min",
      level: "Intermédiaire",
      icon: <Cpu className="h-5 w-5" />,
      color: "text-red-500",
      steps: [
        "Démonter le ventirad",
        "Nettoyer l'ancienne pâte",
        "Appliquer la nouvelle pâte",
        "Remonter le ventilateur",
        "Vérifier les températures"
      ],
      videoUrl: "https://www.youtube.com/embed/VIDEO_ID_2"
    },
    {
      id: 3,
      title: "Ajouter de la RAM",
      duration: "5 min",
      level: "Facile",
      icon: <Cpu className="h-5 w-5" />,
      color: "text-green-500",
      steps: [
        "Éteindre et débrancher",
        "Ouvrir le boîtier",
        "Insérer les barrettes RAM",
        "Vérifier le clic",
        "Démarrer et vérifier"
      ],
      videoUrl: "https://www.youtube.com/embed/VIDEO_ID_3"
    },
    {
      id: 4,
      title: "Installer un SSD",
      duration: "10 min",
      level: "Intermédiaire",
      icon: <Fan className="h-5 w-5" />,
      color: "text-purple-500",
      steps: [
        "Identifier le port M.2 ou SATA",
        "Insérer le SSD",
        "Fixer avec la vis",
        "Initialiser dans Windows",
        "Migrer les données"
      ],
      videoUrl: "https://www.youtube.com/embed/VIDEO_ID_4"
    },
    {
      id: 5,
      title: "Maintenance watercooling",
      duration: "30 min",
      level: "Avancé",
      icon: <Wrench className="h-5 w-5" />,
      color: "text-cyan-500",
      steps: [
        "Vidanger le circuit",
        "Nettoyer les blocs",
        "Remplacer le liquide",
        "Vérifier les fuites",
        "Remettre en service"
      ],
      videoUrl: "https://www.youtube.com/embed/VIDEO_ID_5"
    },
    {
      id: 6,
      title: "Optimiser Windows pour le gaming",
      duration: "20 min",
      level: "Débutant",
      icon: <Shield className="h-5 w-5" />,
      color: "text-amber-500",
      steps: [
        "Désactiver les programmes au démarrage",
        "Activer le mode jeu",
        "Mettre à jour les drivers",
        "Optimiser les paramètres GPU",
        "Nettoyer les fichiers temporaires"
      ],
      videoUrl: "https://www.youtube.com/embed/VIDEO_ID_6"
    }
  ];

  return (
    <section id="tutos-maintenance" className="py-12 scroll-mt-20">
      <div className="container-x">
        <div className="flex items-center gap-3 mb-8">
          <Youtube className="h-8 w-8 text-red-500" />
          <h2 className="text-3xl font-bold">Tutos Maintenance</h2>
        </div>
        <p className="text-muted-foreground mb-8 max-w-3xl">
          Des tutoriels simples pour entretenir votre PC à Madagascar. Prolongez la durée de vie de votre machine !
        </p>

        <div className="grid lg:grid-cols-2 gap-8">
          {tutos.map((tuto) => (
            <div key={tuto.id} className={`border rounded-lg overflow-hidden hover:shadow-xl transition-all`}>
              {/* Vidéo YouTube */}
              <div className="relative bg-black aspect-video">
                {tuto.videoUrl.includes("youtube.com/embed/") ? (
                  <iframe
                    src={tuto.videoUrl}
                    title={tuto.title}
                    className="w-full h-full"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                  />
                ) : (
                  <div className="w-full h-full bg-gray-800 flex items-center justify-center">
                    <div className="text-center">
                      <Youtube className="h-12 w-12 text-red-500 mx-auto mb-2" />
                      <p className="text-sm text-muted-foreground">Vidéo à venir</p>
                      <p className="text-xs text-muted-foreground">{tuto.title}</p>
                    </div>
                  </div>
                )}
                <div className="absolute bottom-2 right-2 bg-black/70 text-white text-[10px] px-2 py-1 rounded-full flex items-center gap-1">
                  <Clock className="h-3 w-3" />
                  {tuto.duration}
                </div>
              </div>

              {/* Infos tuto */}
              <div className="p-5">
                <div className="flex items-center gap-3 mb-3">
                  <div className={`p-2 rounded-lg bg-secondary ${tuto.color}`}>
                    {tuto.icon}
                  </div>
                  <div>
                    <h3 className="font-bold text-lg">{tuto.title}</h3>
                    <div className="flex items-center gap-2 mt-1">
                      <span className={`text-[10px] px-2 py-0.5 rounded-full bg-secondary`}>
                        {tuto.level}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Étapes */}
                <div className="space-y-2 mb-4">
                  <p className="text-xs font-medium text-muted-foreground">📝 Étapes :</p>
                  {tuto.steps.slice(0, 3).map((step, idx) => (
                    <div key={idx} className="flex items-center gap-2 text-xs">
                      <CheckCircle className="h-3 w-3 text-green-500" />
                      <span>{step}</span>
                    </div>
                  ))}
                  {tuto.steps.length > 3 && (
                    <p className="text-xs text-muted-foreground mt-1">+ {tuto.steps.length - 3} autres étapes...</p>
                  )}
                </div>

                <div className="flex gap-2">
                  <a 
                    href={tuto.videoUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-1 text-xs px-3 py-1.5 bg-red-500 text-white rounded hover:bg-red-600 transition"
                  >
                    <Play className="h-3 w-3" /> Regarder sur YouTube
                  </a>
                  <Link 
                    to="/configurateur"
                    className="flex items-center gap-1 text-xs px-3 py-1.5 border border-border rounded hover:bg-secondary transition"
                  >
                    <Wrench className="h-3 w-3" /> Voir nos composants
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Aide professionnelle */}
        <div className="mt-8 bg-blue-50 dark:bg-blue-950/20 border border-blue-500/30 rounded-lg p-5 flex flex-col md:flex-row justify-between items-center gap-4">
          <div className="flex items-center gap-3">
            <Wrench className="h-8 w-8 text-blue-500" />
            <div>
              <p className="font-bold">Besoin d'aide pour la maintenance ?</p>
              <p className="text-sm text-muted-foreground">Nos techniciens sont à votre disposition</p>
            </div>
          </div>
          <div className="flex gap-3">
            <Link 
              to="/devis-express" 
              className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition text-sm"
            >
              Demander un devis
            </Link>
            <a 
              href="https://wa.me/261341234567" 
              target="_blank" 
              rel="noopener noreferrer"
              className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition text-sm"
            >
              Contacter WhatsApp
            </a>
          </div>
        </div>
      </div>
    </section>
  );
};