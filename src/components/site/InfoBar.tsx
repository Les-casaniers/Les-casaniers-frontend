const INFO_ITEMS = [
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
  return (
    <section className="w-full py-2">
      {/* 
        Utilisation de flex + justify-between : 
        - Le 1er élément se colle tout à gauche (text-left)
        - Le dernier élément se colle tout à droite (text-right)
        - Les éléments du milieu restent centrés (text-center)
      */}
      <div className="flex flex-wrap md:flex-nowrap justify-between items-start gap-4">
        {INFO_ITEMS.map((item, i) => {
          // Détermination de l'alignement selon la position de l'élément
          const isFirst = i === 0;
          const isLast = i === INFO_ITEMS.length - 1;

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