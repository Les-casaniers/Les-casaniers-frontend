import { ReactNode } from "react";

interface MiniHeroProps {
  title: ReactNode;
  description?: ReactNode; // Accepte aussi du JSX ou du texte simple
  bg: any; 
  mascot?: any;
  pill?: { icon: ReactNode; label: string };
}

export const MiniHero = ({ title, description, bg, mascot }: MiniHeroProps) => {
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
    <section className="relative min-h-[30vh] md:min-h-[35vh] flex items-center border-b border-border overflow-hidden bg-zinc-900">
      {/* 1. Image de fond */}
      {bgUrl && (
        <div
          className="absolute inset-0 bg-cover bg-center bg-no-repeat z-0 opacity-100"
          style={{ backgroundImage: `url("${bgUrl}")` }}
        />
      )}
      
      {/* 2. Mascotte/Image en bas à droite */}
      {mascotUrl && (
        <img
          src={mascotUrl}
          alt="Mascotte"
          className="absolute bottom-0 right-0 z-10 h-28 sm:h-36 md:h-44 lg:h-52 w-auto object-contain pointer-events-none drop-shadow-lg"
        />
      )}

      {/* Overlays */}
      <div className="absolute inset-0 bg-gradient-to-b from-black/20 via-black/10 to-black/30 z-[1]" />
      <div className="absolute inset-0 bg-[#c8a96e]/5 mix-blend-overlay z-[2]" />
      
      {/* Animation du fond */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none z-[3]">
        <div className="absolute w-[200%] h-[200%] top-[-50%] left-[-50%] bg-[radial-gradient(circle,rgba(59,130,246,0.05)_0%,transparent_70%)] animate-spin-slow" />
        <div className="absolute w-[150%] h-[150%] top-[-25%] left-[-25%] bg-[radial-gradient(circle,rgba(245,158,11,0.03)_0%,transparent_70%)] animate-spin-slow-reverse" />
      </div>

      {/* Conteneur du texte */}
      <div className="relative z-20 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 flex items-center justify-between gap-6">
        <div className="flex flex-col items-start gap-3 max-w-4xl min-w-0 pr-4 sm:pr-24">
          <h1 className="animate-fade-up text-xs sm:text-base md:text-xl lg:text-2xl xl:text-3xl font-bold tracking-tight text-white whitespace-nowrap w-full bg-gradient-to-r from-white via-amber-400 to-white bg-clip-text text-transparent drop-shadow-md">
            {title}
          </h1>
          
          {/* Description DYNAMIQUE (Prend la valeur envoyée dans les props) */}
          {description && (
            <div className="animate-fade-up delay-1 text-white text-xs sm:text-sm md:text-base font-normal italic leading-relaxed drop-shadow-[0_1.2px_1.2px_rgba(0,0,0,0.8)]">
              {description}
            </div>
          )}
          
          <div className="animate-fade-up delay-2 flex items-center gap-3 mt-1">
            <div className="h-px w-16 bg-gradient-to-r from-[#c8a96e] to-transparent" />
            <div className="h-1.5 w-1.5 rounded-full bg-[#c8a96e] animate-pulse" />
          </div>
        </div>
      </div>

      <style>{`
        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes spin-slow {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        @keyframes spin-slow-reverse {
          from { transform: rotate(360deg); }
          to { transform: rotate(0deg); }
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