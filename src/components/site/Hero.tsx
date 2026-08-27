import { Users } from "lucide-react";
import { Link } from "react-router-dom";
import { useEffect, useState } from "react";
import personIcone from "@/assets/groupe.png";
import t1 from "@/assets/t1.jpg";
import t2 from "@/assets/t2.jpg";
import t3 from "@/assets/t3.jpg";
import mascot from "@/assets/Mascotte_Plan de travail 1.png";
import { BandeauMarques } from "../layout/BandeauMarques";

const slides = [t1, t2, t3];

export const Hero = () => {
  const [currentSlide, setCurrentSlide] = useState(0);

 useEffect(() => {
  const interval = window.setInterval(
    () => setCurrentSlide((index) => (index + 1) % slides.length),
    5000,
  );
  return () => window.clearInterval(interval);
}, [slides.length]); // Dépendance ajoutée pour s'assurer que slides est bien chargé

return (
  <>
    <div className="w-full bg-black">
      {/* Container principal du carrousel */}
      <section className="relative mx-auto w-full max-w-7xl overflow-hidden rounded-2xl bg-zinc-950 min-h-[370px] md:min-h-[390px]">
        {/* Carousel d'images */}
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

          {/* Overlays d'assombrissement */}
          <div className="absolute inset-0 bg-black/55 pointer-events-none" />
          <div className="absolute inset-0 bg-gradient-to-r from-black/60 via-black/40 to-transparent pointer-events-none" />

          {/* Contenu */}
          <div className="relative z-10 flex min-h-[370px] md:min-h-[390px] items-center px-5 py-10 sm:px-8 lg:px-12">
            <div className="max-w-3xl text-white">
              <h1 className="text-[28px] font-black uppercase leading-tight tracking-[0.035em] sm:text-4xl lg:text-[31px]">
                Construisons ton outil de réussite
              </h1>

              <p className="mt-9 w-full text-base font-medium italic leading-relaxed tracking-[0.06em] text-white/85 sm:text-lg">
                &quot; Le meilleur pc n’est pas forcément le plus puissant du marché.
                <span className="block pl-0 sm:pl-10">
                  C’est celui adapté à tes besoins, pour jouer et évoluer sereinement. &quot;
                </span>
              </p>

<Link
  to="/qui-sommes-nous"
  className="mt-8 inline-flex items-center gap-3 rounded-md bg-white px-3.5 py-3 text-[11px] font-extrabold uppercase tracking-tight text-black transition hover:bg-zinc-200"
>
  Découvrir l'équipe
  <img
    src={personIcone}
    alt="Équipe"
    className="h-5 w-5 object-contain"
  />
</Link>
            </div>

            <img
              src={mascot}
              alt="Mascotte Les Casaniers"
              className="absolute bottom-8 right-5 hidden h-36 w-auto object-contain drop-shadow-2xl md:block lg:right-10 lg:h-40"
            />
          </div>

          {/* Indicateurs de pagination */}
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