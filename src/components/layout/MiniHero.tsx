import { ReactNode } from "react";

interface MiniHeroProps {
  title: ReactNode;
  description: string;
  bg: string;
  pill?: { icon: ReactNode; label: string };
}

export const MiniHero = ({ title, description, bg, pill }: MiniHeroProps) => {
  return (
    <section className="relative min-h-[40vh] flex items-center border-b border-border overflow-hidden">
      {/* Background image avec parallax */}
      <div
        className="absolute inset-0 bg-cover bg-center bg-no-repeat scale-105"
        style={{ backgroundImage: `url('${bg}')` }}
      />
      
      {/* Dégradé multi-couche amélioré */}
      <div className="absolute inset-0 bg-gradient-to-b from-black/80 via-black/60 to-black/85" />
      
      {/* Teinte chaude subtile */}
      <div className="absolute inset-0 bg-[#c8a96e]/10 mix-blend-overlay" />
      
      {/* Animation du fond (cercles rotatifs) */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute w-[200%] h-[200%] top-[-50%] left-[-50%] bg-[radial-gradient(circle,rgba(59,130,246,0.08)_0%,transparent_70%)] animate-spin-slow" />
        <div className="absolute w-[150%] h-[150%] top-[-25%] left-[-25%] bg-[radial-gradient(circle,rgba(245,158,11,0.05)_0%,transparent_70%)] animate-spin-slow-reverse" />
      </div>

      <div className="relative z-10 w-full container-x flex flex-col items-center gap-5 py-16">
        
        {/* Titre avec animation */}
        <h1 className="animate-fade-up text-4xl md:text-6xl font-bold max-w-3xl leading-tight text-white text-center bg-gradient-to-r from-white via-amber-500 to-white bg-clip-text text-transparent">
          {title}
        </h1>
        
        {/* Description avec animation */}
        <p className="animate-fade-up delay-1 text-white/70 max-w-xl text-sm leading-relaxed text-center">
          {description}
        </p>
        
        {/* Ligne décorative animée */}
        <div className="animate-fade-up delay-2 flex items-center gap-3 mt-2">
          <div className="h-px w-12 bg-gradient-to-r from-transparent via-[#c8a96e] to-transparent" />
          <div className="h-1.5 w-1.5 rounded-full bg-[#c8a96e] animate-pulse" />
          <div className="h-px w-12 bg-gradient-to-r from-transparent via-[#c8a96e] to-transparent" />
        </div>
      </div>

      {/* Styles d'animation */}
      <style>{`
        @keyframes fadeUp {
          from {
            opacity: 0;
            transform: translateY(30px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        
        @keyframes spin-slow {
          from {
            transform: rotate(0deg);
          }
          to {
            transform: rotate(360deg);
          }
        }
        
        @keyframes spin-slow-reverse {
          from {
            transform: rotate(360deg);
          }
          to {
            transform: rotate(0deg);
          }
        }
        
        @keyframes pulse {
          0%, 100% {
            opacity: 1;
            transform: scale(1);
          }
          50% {
            opacity: 0.5;
            transform: scale(0.8);
          }
        }
        
        .animate-fade-up {
          animation: fadeUp 0.8s ease-out forwards;
          opacity: 0;
        }
        
        .delay-1 {
          animation-delay: 0.2s;
        }
        
        .delay-2 {
          animation-delay: 0.4s;
        }
        
        .animate-spin-slow {
          animation: spin-slow 20s linear infinite;
        }
        
        .animate-spin-slow-reverse {
          animation: spin-slow-reverse 15s linear infinite;
        }
        
        .animate-pulse {
          animation: pulse 2s ease-in-out infinite;
        }
      `}</style>
    </section>
  );
};