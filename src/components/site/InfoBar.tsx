

import { useLocation } from "react-router-dom";

const PAGE_ITEMS = {
  "/gaming": [
    {
      title: "CONSEILS PERSONNALISÉS",
      description: "On t'aide à choisir la configuration adapteé" ,
    },
    {
      title: "LIVRAISON A MADAGASCAR",
      description: "On monte, teste et installe ton pc ",
    },
    {
      title: "GARANTIE 24 MOIS",
      description: "Joue l'esprit tranquille, ta machine et couverte",
    },
    {
      title: "SAV ET ENTRETIEN LOCAL",
      description: "On reste à tes côtés pour l'entretien durable",
    },
  ],
  "/bureautique": [
    {
      title: "PRODUCTIVITÉ MAXIMALE",
      description: "Des PC adaptés à ton travail quotidien",
    },
    {
      title: "GARANTIE 3 ANS",
      description: "Un suivi technique personnalisé",
    },
    {
      title: "AUDIT DE PARC",
      description: "Des offres adaptées à ta structure",
    },
    {
      title: "IMPORTATION DIRECTE",
      description: "Accès aux dernières normes européennes",
    },
  ],
};

// Items par défaut
const DEFAULT_ITEMS = [
  {
    title: "FACTURATION NORMÉE",
    description: "Documents conformes avec NIF STAT",
  },
  {
    title: "SAV PRIORITAIRE",
    description: "Une heure d'arrêt est une perte de chiffres d'affaires",
  },
  {
    title: "AUDIT DE PARC",
    description: "Des offres adaptées à ta structure",
  },
  {
    title: "IMPORTATION DIRECTE",
    description: "Accès aux dernières normes européennes",
  },
];

export const InfoBar = () => {
  const location = useLocation();
  
  // Sélectionne les items selon la page actuelle
  const items = PAGE_ITEMS[location.pathname] || DEFAULT_ITEMS;

  return (
    <section className="w-full py-2">
      <div className="flex flex-wrap md:flex-nowrap justify-between items-start gap-4">
        {items.map((item, i) => {
          const isFirst = i === 0;
          const isLast = i === items.length - 1;

          const alignClass = isFirst
            ? "text-left items-start"
            : isLast
            ? "text-right items-end"
            : "text-center items-center";

          return (
            <div key={i} className={`flex flex-col ${alignClass} flex-1`}>
              <p className="text-xs sm:text-sm font-extrabold tracking-wide uppercase text-white">
                {item.title}
              </p>
              <p className="text-[11px] sm:text-xs text-zinc-400 mt-1 max-w-[200px] leading-tight">
                {item.description}
              </p>
            </div>
          );
        })}
      </div>
    </section>
  );
};