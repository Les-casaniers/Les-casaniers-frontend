import { Button } from "@/components/ui/button";
import { ArrowRight, Sparkles, ChevronLeft, ChevronRight, Users } from "lucide-react";
import { Link } from "react-router-dom";
import { MarqueTop } from "../layout/MarqueTop";
import { BandeauMarques } from "../layout/BandeauMarques";
import { useState, useEffect } from "react";

import slide1 from "@/assets/4.png";
import slide2 from "@/assets/5.png";
import slide3 from "@/assets/6.png";

import mascotte1 from "@/assets/1.png";
import mascotte2 from "@/assets/2.png";
import mascotte3 from "@/assets/3.png";

const slides = [
  {
    id: 1,
    image: slide1,
    mascotte: mascotte1,
    badge: "Configuration vedette",
    titre: "Aurora Gaming",
    description: "Puissance et élégance pour les gamers exigeants. Équipée du dernier processeur Intel Core i9 et RTX 4090 pour des performances exceptionnelles.",
    prix: "6 990 000 Ar",
    boutonTexte: "Qui sommes-nous ?",
  },
  {
    id: 2,
    image: slide2,
    mascotte: mascotte2,
    badge: "Power user",
    titre: "Workstation Pro",
    description: "La station de travail ultime pour les créatifs et professionnels. 64 Go RAM, stockage NVMe et carte graphique professionnelle.",
    prix: "8 490 000 Ar",
    boutonTexte: "Qui sommes-nous ?",
  },
  {
    id: 3,
    image: slide3,
    mascotte: mascotte3,
    badge: "Meilleur rapport Q/P",
    titre: "Essential Gaming",
    description: "Le meilleur rapport qualité-prix pour découvrir le gaming PC. Performances solides à prix accessible.",
    prix: "3 990 000 Ar",
    boutonTexte: "Qui sommes-nous ?",
  },
];

export const Hero = () => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isAutoPlaying, setIsAutoPlaying] = useState(true);
  const [isTransitioning, setIsTransitioning] = useState(false);

  const pauseThenResume = () => {
    setIsAutoPlaying(false);
    setTimeout(() => setIsAutoPlaying(true), 5000);
  };

  const changeSlide = (newIndex: number) => {
    if (isTransitioning) return;
    setIsTransitioning(true);
    setTimeout(() => {
      setCurrentIndex(newIndex);
      setIsTransitioning(false);
    }, 200);
  };

  const goToPrevious = () => {
    pauseThenResume();
    changeSlide(currentIndex === 0 ? slides.length - 1 : currentIndex - 1);
  };

  const goToNext = () => {
    pauseThenResume();
    changeSlide(currentIndex === slides.length - 1 ? 0 : currentIndex + 1);
  };

  const goToSlide = (index: number) => {
    pauseThenResume();
    changeSlide(index);
  };

  useEffect(() => {
    if (!isAutoPlaying) return;
    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev === slides.length - 1 ? 0 : prev + 1));
    }, 5000);
    return () => clearInterval(interval);
  }, [isAutoPlaying]);

  const currentSlide = slides[currentIndex];

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Lato:ital,wght@0,300;0,400;0,700;0,900;1,300;1,400;1,700&display=swap');

        .hero-root {
          font-family: 'Lato', sans-serif;
        }

        .hero-root * {
          font-family: 'Lato', sans-serif;
        }

        .hero-badge {
          font-family: 'Lato', sans-serif;
          font-weight: 700;
          font-size: 9px;
          letter-spacing: 0.4em;
          text-transform: uppercase;
          color: rgba(255,255,255,0.7);
          border-bottom: 2px solid rgba(255,255,255,0.35);
          padding-bottom: 5px;
          display: inline-flex;
          align-items: center;
          gap: 8px;
        }

        .hero-badge::before {
          content: '';
          width: 5px;
          height: 5px;
          border-radius: 50%;
          background: #f59e0b;
          display: inline-block;
          animation: hero-pulse 2s ease-in-out infinite;
        }

        .hero-title-main {
          font-family: 'Lato', sans-serif;
          font-weight: 900;
          font-size: clamp(2rem, 5vw, 3.5rem);
          line-height: 1;
          letter-spacing: -0.03em;
          color: #ffffff;
        }

        .hero-title-sub {
          font-family: 'Lato', sans-serif;
          font-weight: 300;
          font-style: italic;
          font-size: clamp(1.2rem, 3.5vw, 2rem);
          line-height: 1.1;
          color: rgba(255,255,255,0.65);
          margin-top: 4px;
        }

        .hero-description {
          font-family: 'Lato', sans-serif;
          font-weight: 400;
          font-size: 0.85rem;
          line-height: 1.4;
          color: rgba(255,255,255,0.85);
          max-width: 480px;
        }

        .hero-price {
          font-family: 'Lato', sans-serif;
          font-weight: 700;
          font-size: 1.2rem;
          color: #f59e0b;
          letter-spacing: -0.01em;
        }

        .hero-btn-primary {
          display: inline-flex;
          align-items: center;
          gap: 10px;
          padding: 8px 20px;
          background: #ffffff;
          color: #0a0a0a;
          font-family: 'Lato', sans-serif;
          font-weight: 700;
          font-size: 10px;
          letter-spacing: 0.1em;
          text-transform: uppercase;
          border: none;
          cursor: pointer;
          transition: all 0.25s ease;
          text-decoration: none;
          border-radius: 2px;
        }
        .dark .hero-btn-primary {
          background: #ffffff;
          color: #0a0a0a;
        }
        .hero-btn-primary:hover {
          background: #f0f0f0;
          transform: translateY(-2px);
          box-shadow: 0 8px 24px rgba(0,0,0,0.2);
        }

        .hero-btn-about {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          padding: 7px 16px;
          background: linear-gradient(135deg, #3b82f6, #6366f1);
          color: #ffffff;
          font-family: 'Lato', sans-serif;
          font-weight: 700;
          font-size: 10px;
          letter-spacing: 0.15em;
          text-transform: uppercase;
          border: none;
          cursor: pointer;
          transition: all 0.25s ease;
          text-decoration: none;
          border-radius: 2px;
          box-shadow: 0 4px 12px rgba(59,130,246,0.3);
        }
        .hero-btn-about:hover {
          background: linear-gradient(135deg, #2563eb, #4f46e5);
          transform: translateY(-2px);
          box-shadow: 0 6px 16px rgba(59,130,246,0.4);
        }

        .hero-stat-value {
          font-family: 'Lato', sans-serif;
          font-weight: 900;
          font-size: 1.1rem;
          color: #ffffff;
          letter-spacing: -0.02em;
        }

        .hero-stat-label {
          font-family: 'Lato', sans-serif;
          font-weight: 400;
          font-size: 7px;
          letter-spacing: 0.25em;
          text-transform: uppercase;
          color: rgba(255,255,255,0.5);
          margin-top: 2px;
        }

        .hero-dot-active {
          width: 32px;
          height: 3px;
          border-radius: 2px;
          background: #ffffff;
          transition: all 0.3s ease;
        }
        .hero-dot {
          width: 6px;
          height: 3px;
          border-radius: 2px;
          background: rgba(255,255,255,0.35);
          transition: all 0.3s ease;
          cursor: pointer;
        }
        .hero-dot:hover {
          background: rgba(255,255,255,0.6);
        }

        .hero-slide-counter {
          font-family: 'Lato', sans-serif;
          font-weight: 700;
          font-size: 10px;
          letter-spacing: 0.3em;
          color: rgba(255,255,255,0.45);
        }

        @keyframes hero-pulse {
          0%, 100% { opacity: 1; transform: scale(1); }
          50% { opacity: 0.5; transform: scale(0.7); }
        }

        @keyframes hero-fadeUp {
          from { opacity: 0; transform: translateY(20px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        .hero-animate-up {
          animation: hero-fadeUp 0.6s ease-out both;
        }
        .hero-animate-up-delay {
          animation: hero-fadeUp 0.6s ease-out 0.1s both;
        }
        .hero-animate-up-delay2 {
          animation: hero-fadeUp 0.6s ease-out 0.2s both;
        }

        @keyframes hero-float {
          0%, 100% { transform: translateY(0px) rotate(0deg); }
          33% { transform: translateY(-10px) rotate(1.5deg); }
          66% { transform: translateY(-5px) rotate(-1deg); }
        }
        .hero-float { animation: hero-float 4s ease-in-out infinite; }

        .hero-content-transition {
          transition: opacity 0.2s ease, transform 0.2s ease;
        }
        .hero-content-hidden {
          opacity: 0;
          transform: translateY(6px);
        }
      `}</style>

      <section className="hero-root relative min-h-[60vh] overflow-hidden">

        <div className="absolute inset-0 z-0">
          {slides.map((slide, index) => (
            <div
              key={slide.id}
              className={`absolute inset-0 transition-opacity duration-1000 ease-in-out ${index === currentIndex ? "opacity-100" : "opacity-0"
                }`}
            >
              <div className="absolute inset-0 bg-gray-950" />
              <div
                className="absolute inset-0"
                style={{
                  backgroundImage: `url(${slide.image})`,
                  backgroundSize: "cover",
                  backgroundPosition: "center",
                }}
              />
              <div className="absolute inset-0 bg-gradient-to-r from-black/85 via-black/55 to-black/15 dark:from-black/90 dark:via-black/60 dark:to-black/25" />
              <div className="absolute inset-x-0 bottom-0 h-32 bg-gradient-to-t from-black/40 to-transparent" />
            </div>
          ))}
        </div>

        <div className="relative z-20">
          <MarqueTop />
        </div>

        <div className="relative z-10 flex flex-col min-h-[60vh]">
          <div className="flex-1 flex items-center">
            <div className="w-full px-6 md:px-10 lg:px-16 xl:px-20 py-6">
              <div className="w-full flex flex-col lg:flex-row justify-between items-center gap-6 lg:gap-12">

                <div
                  className={`lg:w-1/2 max-w-xl space-y-4 hero-content-transition ${isTransitioning ? "hero-content-hidden" : ""
                    }`}
                >
                  <div className="hero-animate-up">
                    <span className="hero-badge">{currentSlide.badge}</span>
                  </div>

                  <div className="hero-animate-up-delay space-y-0">
                    <h1 className="hero-title-main">{currentSlide.titre}</h1>
                    <p className="hero-title-sub">Le PC, redéfini</p>
                  </div>

                  <p className="hero-description hero-animate-up-delay">
                    {currentSlide.description}
                  </p>

                  <div className="hero-animate-up-delay">
                    <span className="hero-price">À partir de {currentSlide.prix}</span>
                  </div>

                  <div className="hero-animate-up-delay2 flex flex-wrap gap-3 items-center pt-1">
                    <Link
                      to={`/qui-sommes-nous`}
                      className="hero-btn-primary"
                    >
                      {currentSlide.boutonTexte}
                      <ArrowRight className="h-3 w-3" />
                    </Link>

                  </div>

                  <div className="pt-1">
                    <div className="w-10 h-px bg-white/20" />
                  </div>

                  <div className="hero-animate-up-delay2 grid grid-cols-3 gap-0 max-w-md">
                    {[
                      { v: "500+", l: "PC livrés" },
                      { v: "24 mois", l: "Garantie" },
                      { v: "4.9/5", l: "Avis clients" },
                    ].map((s, i) => (
                      <div
                        key={s.l}
                        className={`py-1 ${i > 0 ? "border-l border-white/15 pl-4" : "pr-4"}`}
                      >
                        <div className="hero-stat-value">{s.v}</div>
                        <div className="hero-stat-label">{s.l}</div>
                      </div>
                    ))}
                  </div>
                </div>

                <div
                  className={`lg:w-1/2 flex justify-center lg:justify-end items-center hero-content-transition ${isTransitioning ? "hero-content-hidden" : ""
                    }`}
                >
                  <div className="relative">
                    <div className="absolute inset-0 -m-6 rounded-full bg-amber-500/10 blur-2xl pointer-events-none" />
                    <img
                      key={currentSlide.id}
                      src={currentSlide.mascotte}
                      alt={`Mascotte ${currentSlide.titre}`}
                      className="object-contain drop-shadow-2xl hero-float relative z-10"
                      style={{ width: "clamp(150px, 20vw, 240px)", height: "clamp(150px, 20vw, 240px)" }}
                    />
                    <div className="absolute -bottom-6 left-1/2 -translate-x-1/2 text-center whitespace-nowrap z-10">
                      <p
                        style={{
                          fontFamily: "'Lato', sans-serif",
                          fontSize: "8px",
                          letterSpacing: "0.2em",
                          textTransform: "uppercase",
                          color: "rgba(255,255,255,0.45)",
                          fontWeight: 400,
                        }}
                      >
                        Notre expert
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="relative z-20 pb-4 px-6 md:px-10 lg:px-16 xl:px-20">
            <div className="flex items-center justify-between max-w-md">
              <span className="hero-slide-counter">
                {String(currentIndex + 1).padStart(2, "0")} / {String(slides.length).padStart(2, "0")}
              </span>

              <div className="flex items-center gap-1.5">
                {slides.map((_, index) => (
                  <button
                    key={index}
                    onClick={() => goToSlide(index)}
                    aria-label={`Aller à la slide ${index + 1}`}
                    className={index === currentIndex ? "hero-dot-active" : "hero-dot"}
                  />
                ))}
              </div>

              <div className="flex items-center gap-1.5">
                <button
                  onClick={goToPrevious}
                  aria-label="Slide précédent"
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    width: "28px",
                    height: "28px",
                    borderRadius: "50%",
                    background: "rgba(255,255,255,0.08)",
                    border: "1px solid rgba(255,255,255,0.2)",
                    color: "white",
                    cursor: "pointer",
                    transition: "all 0.2s ease",
                  }}
                >
                  <ChevronLeft className="h-3 w-3" />
                </button>
                <button
                  onClick={goToNext}
                  aria-label="Slide suivant"
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    width: "28px",
                    height: "28px",
                    borderRadius: "50%",
                    background: "rgba(255,255,255,0.08)",
                    border: "1px solid rgba(255,255,255,0.2)",
                    color: "white",
                    cursor: "pointer",
                    transition: "all 0.2s ease",
                  }}
                >
                  <ChevronRight className="h-3 w-3" />
                </button>
              </div>
            </div>
          </div>
        </div>

        <div className="relative z-20">
          <BandeauMarques />
        </div>
      </section>
    </>
  );
};