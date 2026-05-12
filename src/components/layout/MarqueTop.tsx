export const MarqueTop = () => {
  return (
    <section className="relative bg-background overflow-hidden theme-transition">
      {/* Marquee top */}
      <div className="bg-foreground text-background overflow-hidden border-b border-foreground theme-transition">
        <div className="flex whitespace-nowrap animate-marquee py-2.5 text-[11px] uppercase tracking-[0.3em] font-medium">
          {Array.from({ length: 8 }).map((_, i) => (
            <span key={i} className="px-8 flex items-center gap-3">
              ★ Importation Europe · Garantie 24 mois · Showroom Tananarive · Livraison sécurisée · Code <b>CASA10</b>
            </span>
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