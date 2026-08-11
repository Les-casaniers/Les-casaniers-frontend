const benefits = [
  { title: "Importation UE", subtitle: "Produits sourcés d'Europe" },
  { title: "Garantie 24 mois", subtitle: "SAV local réactif" },
  { title: "Showroom Antananarivo", subtitle: "Conseils & démonstration" },
  { title: "Livraison Madagascar", subtitle: "Expédition sécurisée" },
];

export const BandeauMarques = () => (
  <section className="bg-black text-white">
    <div className="grid min-h-14 grid-cols-2 divide-x divide-white/10 md:grid-cols-4">
      {benefits.map((benefit) => (
        <div key={benefit.title} className="px-3 py-2 text-center sm:py-2.5">
          <p className="text-[11px] font-extrabold uppercase leading-tight tracking-wide sm:text-xs">
            {benefit.title}
          </p>
          <p className="mt-1 text-[10px] leading-none text-zinc-400 sm:text-[11px]">
            {benefit.subtitle}
          </p>
        </div>
      ))}
    </div>
  </section>
);
