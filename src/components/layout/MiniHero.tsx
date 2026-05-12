interface MiniHeroProps {
  title: string;
  description: string;
  bg: string;
}

export const MiniHero = ({ title, description, bg }: MiniHeroProps) => {
  return (
    <section className="relative py-24 border-b border-border text-center overflow-hidden">
      {/* Image de fond */}
      <div
        className="absolute inset-0 bg-cover bg-center bg-no-repeat"
        style={{ backgroundImage: `url('${bg}')` }}
      />
      {/* Overlay sombre pour la lisibilité */}
      <div className="absolute inset-0 bg-black/60" />

      {/* Contenu */}
      <div className="relative z-10 container-x flex flex-col items-center gap-6">
        <h1 className="text-4xl md:text-5xl font-bold max-w-2xl leading-tight text-white">
          {title}
        </h1>
        <p className="text-white/75 max-w-xl">{description}</p>
      </div>
    </section>
  );
};