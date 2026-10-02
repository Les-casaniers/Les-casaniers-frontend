import { useLocation } from "react-router-dom";

const PAGE_ITEMS = {
  "/gaming": [
    {
      title: "CONSEILS PERSONNALISÉS",
      description: (
        <>
          On t'aide à choisir la<br />
          configuration adaptée
        </>
      ),
    },
    {
      title: "LIVRAISON À MADAGASCAR",
      description: (
        <>
          On monte, teste<br />
          et installe ton pc
        </>
      ),
    },
    {
      title: "GARANTIE 24 MOIS",
      description: (
        <>
          Joue l'esprit tranquille,<br />
          ta machine est couverte
        </>
      ),
    },
    {
      title: "SAV ET ENTRETIEN LOCAL",
      description: (
        <>
          On reste à tes côtés pour<br />
          l'entretien durable
        </>
      ),
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
    title: "FACTURATION NORMEE",
    description: (
      <>
        Documents conformes<br />
        avec NIF STAT
      </>
    ),
  },
  {
    title: "SAV PRIORITAIRE",
    description: (
      <>
        Une heure d'arrêt est une perte<br />
        de chiffres d'affaires
      </>
    ),
  },
  {
    title: "AUDIT DE PARC",
    description: (
      <>
        Des offres adaptées<br />
        à ta structure
      </>
    ),
  },
  {
    title: "IMPORTATION DIRECTE",
    description: (
      <>
        Accès aux dernières<br />
        normes européennes
      </>
    ),
  },
];

export const InfoBar = () => {
  const location = useLocation();
  
  // Sélectionne les items selon la page actuelle
  const items = PAGE_ITEMS[location.pathname] || DEFAULT_ITEMS;

  return (
    <section
      className="w-full py-2"
      style={{ fontFamily: '"Glacial Indifference", system-ui, sans-serif' }}
    >
      {/* Chaque bloc est centré sur lui-même ; le 1er colle à gauche, le dernier à droite */}
      <div className="grid grid-cols-2 gap-y-4 gap-x-4 md:flex md:flex-nowrap md:justify-between md:items-start">
        {items.map((item, i) => (
          <div key={i} className="flex flex-col items-center text-center">
            <p className="text-xs sm:text-sm font-bold tracking-[0.03em] uppercase text-white whitespace-nowrap">
              {item.title}
            </p>
            <p className="mt-1 text-[11px] sm:text-xs text-zinc-300 leading-snug tracking-[0.02em]">
              {item.description}
            </p>
          </div>
        ))}
      </div>
    </section>
  );
};