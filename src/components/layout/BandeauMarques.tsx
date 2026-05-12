export const BandeauMarques = () => {
  return (
    <section className="relative bg-background overflow-hidden theme-transition">
      {/* Bandeau marques */}
      <div className="border-y border-border bg-secondary/30 mt-8 theme-transition">
        <div className="container-x grid grid-cols-2 md:grid-cols-4 divide-x divide-border">
          {[
            { t: "Importation", s: "Directe d'Europe" },
            { t: "Showroom", s: "Tananarive" },
            { t: "SAV local", s: "Réactif & humain" },
            { t: "Sur-mesure", s: "100% personnalisé" },
          ].map((i) => (
            <div key={i.s} className="px-4 py-6 text-center">
              <div className="font-display font-black text-base uppercase tracking-wider">
                {i.t}
              </div>
              <div className="text-[11px] uppercase tracking-widest text-muted-foreground mt-1">
                {i.s}
              </div>
            </div>
          ))}
        </div>
      </div>

      <style>{`
        .theme-transition {
          transition: background-color 0.3s ease, color 0.3s ease, border-color 0.3s ease;
        }
      `}</style>
    </section>
  );
};