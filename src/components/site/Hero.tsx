import { Users } from "lucide-react";
import { Link } from "react-router-dom";
import { useEffect, useState } from "react";
import personIcone from "@/assets/groupe.png";
import t1 from "@/assets/t1.jpg";
import t2 from "@/assets/t2.jpg";
import t3 from "@/assets/t3.jpg";
import mascot from "@/assets/Mascotte_Plan de travail 1.png";
import { BandeauMarques } from "../layout/BandeauMarques";

// Liste des images du carrousel en fond du Hero
const slides = [t1, t2, t3];

export const Hero = () => {
  const [currentSlide, setCurrentSlide] = useState(0);

  // Fait défiler automatiquement les images du carrousel toutes les 5 secondes
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
        <section className="relative mx-auto w-full max-w-7xl overflow-hidden rounded-2xl bg-zinc-950 aspect-[20/8] sm:aspect-[20/7] lg:aspect-[25/8] min-h-[270px] max-h-[68vh]">
          {/* Carrousel d'images — object-cover garde les proportions de la photo sans la déformer */}
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

          
          <div className="absolute inset-0 bg-black/55 pointer-events-none" />
          <div className="absolute inset-0 bg-gradient-to-r from-black/60 via-black/40 to-transparent pointer-events-none" />

          
          <div className="relative z-10 flex h-full w-full items-center px-5 py-8 sm:px-8 lg:px-12">
            <div className="max-w-3xl text-white">
              <h1 className="text-[clamp(1.5rem,2.5vw,2.25rem)] font-black uppercase leading-tight tracking-[0.035em]">
                Construisons ton outil de réussite
              </h1>

              <p className="mt-4 sm:mt-6 w-full text-[clamp(0.875rem,1.2vw,1.125rem)] font-medium italic leading-relaxed tracking-[0.06em] text-white/85">
                &quot; Le meilleur pc n’est pas forcément le plus puissant du marché.
                <span className="block pl-0 sm:pl-8">
                  C’est celui adapté à tes besoins, pour jouer et évoluer sereinement. &quot;
                </span>
              </p>

              <Link
                to="/qui-sommes-nous"
                className="mt-6 inline-flex items-center gap-3 rounded-md bg-white px-3.5 py-3 text-[11px] font-extrabold uppercase tracking-tight text-black transition hover:bg-zinc-200"
              >
                Découvrir l'équipe
                <img
                  src={personIcone}
                  alt="Équipe"
                  className="h-5 w-5 object-contain"
                />
              </Link>
            </div>

            {/* Mascotte affichée uniquement à partir de md (déjà géré en CSS, aucun changement nécessaire) */}
            <img
              src={mascot}
              alt="Mascotte Les Casaniers"
              className="absolute bottom-6 right-5 hidden h-[35%] max-h-44 w-auto object-contain drop-shadow-2xl md:block lg:right-10"
            />
          </div>

          {/* Indicateurs de pagination du carrousel */}
          <div className="absolute bottom-3 left-1/2 z-10 flex -translate-x-1/2 gap-1.5">
            {slides.map((slide, index) => (
              <button
                key={slide}
                type="button"
                aria-label={`Afficher la photo ${index + 1}`}
                onClick={() => setCurrentSlide(index)}
                className={`h-1.5 w-1.5 rounded-full transition-colors ${
                  index === currentSlide ? "bg-white" : "bg-white/60 hover:bg-white"
                }`}
              />
            ))}
          </div>
        </section>
      </div>
      <BandeauMarques />
    </>
  );
};