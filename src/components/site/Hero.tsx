import { Link } from "react-router-dom";
import { useEffect, useState } from "react";
import personIcone from "@/assets/groupe.png";
import t1 from "@/assets/t1.jpg";
import t2 from "@/assets/t2.jpg";
import t3 from "@/assets/t3.jpg";
import mascot from "@/assets/Mascotte_Plan de travail 1.png";

const slides = [t1, t2, t3];

export const Hero = () => {
  const [currentSlide, setCurrentSlide] = useState(0);

  useEffect(() => {
    const interval = window.setInterval(
      () => setCurrentSlide((index) => (index + 1) % slides.length),
      5000,
    );
    return () => window.clearInterval(interval);
  }, [slides.length]);

  return (
    <>
      <div className="w-full bg-black px-3 sm:px-6 lg:px-8">
        <section className="relative mx-auto w-full max-w-7xl overflow-hidden rounded-2xl bg-zinc-950 
          min-h-[280px] sm:min-h-[350px] md:min-h-[400px] lg:min-h-[450px] xl:min-h-[500px] 2xl:min-h-[550px]
          max-h-[75vh]"
        >
          {/* Carrousel d'images */}
          <div className="absolute inset-0">
            {slides.map((slide, index) => (
              <img
                key={index}
                src={slide}
                alt="Espace de travail Les Casaniers"
                className={`absolute inset-0 h-full w-full object-cover object-center transition-opacity duration-700 ${
                  index === currentSlide ? "opacity-100 z-10" : "opacity-0 z-0"
                }`}
              />
            ))}
          </div>

          {/* Overlays */}
          <div className="absolute inset-0 bg-black/55 pointer-events-none" />
          <div className="absolute inset-0 bg-gradient-to-r from-black/70 via-black/45 to-transparent pointer-events-none" />

          {/* Conteneur de contenu */}
          <div className="absolute inset-0 z-10 flex w-full items-center 
            px-4 sm:px-8 md:px-12 lg:px-16 xl:px-20 
            py-6 sm:py-10 md:py-14 lg:py-18 xl:py-24"
          >
            <div className="max-w-sm sm:max-w-xl lg:max-w-none text-white">
              <h1 className="text-lg sm:text-2xl md:text-3xl lg:text-4xl
                font-black uppercase tracking-wide md:whitespace-nowrap">
                Construisons ton outil de réussite
              </h1>

              <p className="mt-4 sm:mt-5 text-xs sm:text-sm md:text-base lg:text-lg xl:text-xl 
                font-medium italic leading-relaxed text-white/90">
                <span>&quot; Le meilleur pc n'est pas forcément le plus puissant du marché.</span>
                <span className="block pl-6 sm:pl-10 mt-1">C'est celui adapté à tes besoins, pour jouer et évoluer sereinement &quot;</span>
              </p>

              <Link
                to="/qui-sommes-nous"
                className="mt-6 sm:mt-7 md:mt-8 inline-flex items-center gap-2 sm:gap-2.5 md:gap-3 
                  rounded-md bg-white 
                  px-3.5 sm:px-5 md:px-6 lg:px-8 
                  py-2 sm:py-2.5 md:py-3 lg:py-3.5 
                  text-xs sm:text-sm md:text-base lg:text-lg 
                  font-extrabold uppercase tracking-tight text-black 
                  transition hover:bg-zinc-200 hover:scale-[1.02] active:scale-95 shadow-lg"
              >
                Découvrir l'équipe
                <img
                  src={personIcone}
                  alt="Équipe"
                  className="h-3.5 w-3.5 sm:h-4 sm:w-4 md:h-5 md:w-5 lg:h-6 lg:w-6 
                    object-contain"
                />
              </Link>
            </div>

            {/* Mascotte */}
            <img
              src={mascot}
              alt="Mascotte Les Casaniers"
              className="absolute bottom-3 right-4 sm:right-8 md:right-12 lg:right-16 
                hidden md:block 
                h-[40%] sm:h-[45%] md:h-[50%] lg:h-[60%] xl:h-[65%] 
                max-h-[200px] sm:max-h-[250px] md:max-h-[300px] lg:max-h-[380px] xl:max-h-[450px] 2xl:max-h-[500px] 
                w-auto object-contain drop-shadow-2xl pointer-events-none"
            />
          </div>

          {/* Indicateurs de pagination */}
          <div className="absolute bottom-2 sm:bottom-3 left-1/2 z-10 flex -translate-x-1/2 gap-1.5 sm:gap-2">
            {slides.map((slide, index) => (
              <button
                key={slide}
                type="button"
                aria-label={`Afficher la photo ${index + 1}`}
                onClick={() => setCurrentSlide(index)}
                className={`h-1.5 sm:h-2 rounded-full transition-all duration-300 ${
                  index === currentSlide 
                    ? "bg-white w-3 sm:w-4" 
                    : "bg-white/50 hover:bg-white/70 w-1.5 sm:w-2"
                }`}
              />
            ))}
          </div>
        </section>
      </div>
    </>
  );
};