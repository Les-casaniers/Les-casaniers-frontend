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
        {/* Structure et dimensions conservées à l'identique */}
        <section className="relative mx-auto w-full max-w-7xl overflow-hidden rounded-2xl bg-zinc-950 aspect-[20/8] sm:aspect-[20/7] lg:aspect-[25/8] min-h-[270px] max-h-[68vh]">
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

          <div className="absolute inset-0 bg-black/55 pointer-events-none" />
          <div className="absolute inset-0 bg-gradient-to-r from-black/60 via-black/40 to-transparent pointer-events-none" />

          {/* Rembourrage adapté dynamiquement (vw/cqw) pour conserver les proportions internes */}
          <div className="relative z-10 flex h-full w-full items-center px-[4vw] py-[3vw] lg:px-[3.5cqw] lg:py-[2.5cqw]">
            <div className="max-w-3xl text-white">
              {/* Le clamp monte jusqu'à 3rem pour remplir l'espace à haute résolution */}
              <h1 className="text-[clamp(1.4rem,2.8vw,3rem)] font-black uppercase leading-tight tracking-[0.035em]">
                Construisons ton outil de réussite
              </h1>

              <p className="mt-[2%] w-full text-[clamp(0.85rem,1.35vw,1.35rem)] font-medium italic leading-relaxed tracking-[0.06em] text-white/85">
                &quot; Le meilleur pc n’est pas forcément le plus puissant du marché.
                <span className="block pl-0 sm:pl-[2vw]">
                  C’est celui adapté à tes besoins, pour jouer et évoluer sereinement. &quot;
                </span>
              </p>

              <Link
                to="/qui-sommes-nous"
                className="mt-[3%] inline-flex items-center gap-3 rounded-md bg-white px-[1.4vw] py-[0.8vw] min-px-[14px] min-py-[8px] text-[clamp(0.7rem,0.95vw,0.95rem)] font-extrabold uppercase tracking-tight text-black transition hover:bg-zinc-200"
              >
                Découvrir l'équipe
                <img
                  src={personIcone}
                  alt="Équipe"
                  className="h-[1.2em] w-[1.2em] object-contain"
                />
              </Link>
            </div>

            {/* Mascotte mise à l'échelle automatique selon la hauteur du bloc */}
            <img
              src={mascot}
              alt="Mascotte Les Casaniers"
              className="absolute bottom-[8%] right-[4%] hidden h-[45%] w-auto object-contain drop-shadow-2xl md:block"
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