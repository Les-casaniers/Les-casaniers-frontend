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
            ? "items-start"
            : isLast
            ? "items-end"
            : "items-center";

          const textAlignClass = isFirst
            ? "text-left"
            : isLast
            ? "text-right"
            : "text-center";

          return (
            <div key={i} className={`flex flex-1 flex-col ${alignClass}`}>
              <p className={`text-xs sm:text-sm font-extrabold tracking-wide uppercase text-white whitespace-nowrap ${textAlignClass}`}>
                {item.title}
              </p>
              <p className={`mt-1 max-w-[220px] text-[11px] sm:text-xs text-zinc-400 leading-tight ${textAlignClass}`}>
                {item.description}
              </p>
            </div>
          );
        })}
      </div>
    </section>
  );
};