import { ReactNode } from "react";

interface MiniHeroProps {
  title: ReactNode;
  description: string;
  bg: string;
  pill?: { icon: ReactNode; label: string };
}

export const MiniHero = ({ title, description, bg, pill }: MiniHeroProps) => {
  return (
    <section className="relative py-5 border-b border-border text-center overflow-hidden">
      <div
        className="absolute inset-0 bg-cover bg-center bg-no-repeat scale-105"
        style={{ backgroundImage: `url('${bg}')` }}
      />
      {/* Dégradé multi-couche */}
      <div className="absolute inset-0 bg-gradient-to-b from-black/70 via-black/50 to-black/80" />
      {/* Teinte chaude subtile */}
      <div className="absolute inset-0 bg-[#c8a96e]/10 mix-blend-overlay" />

      <div className="relative z-10 container-x flex flex-col items-center gap-5">
        
        <h1 className="text-4xl md:text-5xl font-bold max-w-2xl leading-tight text-white">
          {title}
        </h1>
        <p className="text-white/70 max-w-xl text-sm leading-relaxed">{description}</p>
        {/* Ligne décorative */}
        <div className="flex items-center gap-3 mt-2">
          <div className="h-px w-12 bg-[#c8a96e]/50" />
          <div className="h-1.5 w-1.5 rounded-full bg-[#c8a96e]" />
          <div className="h-px w-12 bg-[#c8a96e]/50" />
        </div>
      </div>
    </section>
  );
};