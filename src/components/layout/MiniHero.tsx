import { ReactNode } from "react";

interface MiniHeroProps {
  title: ReactNode;
  description?: ReactNode;
  bg: any;
  mascot?: any;
  pill?: { icon: ReactNode; label: string };
}

export const MiniHero = ({ title, description, bg, mascot }: MiniHeroProps) => {
  // Gestion fluide de la source de l'image (import local ou chemin string /public)
  const getImageUrl = (source: any): string => {
    if (!source) return "";
    if (typeof source === "string") return source;
    if (typeof source === "object") {
      return source.src || source.default || "";
    }
    return "";
  };

  const bgUrl = getImageUrl(bg);
  const mascotUrl = getImageUrl(mascot);

  return (
    <section className="relative w-full min-h-[28vh] sm:min-h-[32vh] md:min-h-[36vh] flex items-center border border-zinc-800 rounded-2xl overflow-hidden bg-zinc-900 max-w-[1700px] mx-auto">
      {/* 1. Image de fond */}
      {bgUrl && (
        <div
          className="absolute inset-0 bg-cover bg-center bg-no-repeat z-0 opacity-100"
          style={{ backgroundImage: `url("${bgUrl}")` }}
        />
      )}

      {/* 2. Mascotte plaquée en bas à droite (taille dynamique selon l'écran) */}
      {mascotUrl && (
        <img
          src={mascotUrl}
          alt="Mascotte"
          className="absolute bottom-[-6px] right-[-6px] sm:right-0 z-10 h-20 sm:h-28 md:h-32 lg:h-40 w-auto object-contain pointer-events-none drop-shadow-xl"
        />
      )}

      {/* Overlays d'ambiance */}
      <div className="absolute inset-0 bg-gradient-to-b from-black/50 via-black/30 to-black/60 z-[1]" />
      <div className="absolute inset-0 bg-[#c8a96e]/5 mix-blend-overlay z-[2]" />

      {/* Animation de fond */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none z-[3]">
        <div className="absolute w-[200%] h-[200%] top-[-50%] left-[-50%] bg-[radial-gradient(circle,rgba(59,130,246,0.05)_0%,transparent_70%)] animate-spin-slow" />
        <div className="absolute w-[150%] h-[150%] top-[-25%] left-[-25%] bg-[radial-gradient(circle,rgba(245,158,11,0.03)_0%,transparent_70%)] animate-spin-slow-reverse" />
      </div>

      {/* 3. Conteneur de texte adaptatif */}
      <div className="relative z-20 w-full px-5 sm:px-10 lg:px-12 py-6 sm:py-8 md:py-10 flex items-center justify-between">
        <div className="flex flex-col items-start gap-3 max-w-full lg:max-w-4xl min-w-0 pr-20 sm:pr-32 md:pr-40 lg:pr-44">
          {/* Titre sur une seule ligne avec réduction automatique de la taille si besoin */}
          <h1 className="animate-fade-up text-xs sm:text-base md:text-xl lg:text-2xl font-extrabold tracking-tight text-white uppercase drop-shadow-md leading-none whitespace-nowrap overflow-hidden text-ellipsis">
            {title}
          </h1>

          {/* Description */}
          {description && (
            <div className="animate-fade-up delay-1 text-white text-[11px] sm:text-sm md:text-base font-normal italic leading-relaxed drop-shadow-[0_1.2px_1.2px_rgba(0,0,0,0.8)]">
              {description}
            </div>
          )}

          {/* Ligne décorative */}
          <div className="animate-fade-up delay-2 flex items-center gap-3 mt-1">
            <div className="h-px w-16 sm:w-20 bg-gradient-to-r from-[#c8a96e] to-transparent" />
            <div className="h-1.5 w-1.5 rounded-full bg-[#c8a96e] animate-pulse" />
          </div>
        </div>
      </div>

      {/* Styles CSS inline pour les animations */}
      <style>{`
        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes spin-slow {
          from { opacity: 0; transform: rotate(0deg); }
          to { opacity: 1; transform: rotate(360deg); }
        }
        @keyframes spin-slow-reverse {
          from { opacity: 0; transform: rotate(360deg); }
          to { opacity: 1; transform: rotate(0deg); }
        }
        @keyframes pulse {
          0%, 100% { opacity: 1; transform: scale(1); }
          50% { opacity: 0.5; transform: scale(0.8); }
        }
        .animate-fade-up { animation: fadeUp 0.8s ease-out forwards; opacity: 0; }
        .delay-1 { animation-delay: 0.2s; }
        .delay-2 { animation-delay: 0.4s; }
        .animate-spin-slow { animation: spin-slow 20s linear infinite; }
        .animate-spin-slow-reverse { animation: spin-slow-reverse 15s linear infinite; }
        .animate-pulse { animation: pulse 2s ease-in-out infinite; }
      `}</style>
    </section>
  );
};