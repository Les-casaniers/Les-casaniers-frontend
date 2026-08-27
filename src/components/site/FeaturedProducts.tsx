import type { FC } from "react";
import { useNavigate } from "react-router-dom";
import bannerBg from "../../assets/t11.jpg";
import keyboardImg from "../../assets/clavs.png";
import phoneImg from "../../assets/phone1.png";
import monitorImg from "../../assets/pc.png";
import headsetImg from "../../assets/CASQUE1.png";
import laptopImg from "../../assets/ORDI.png";

interface Product {
  src: string;
  alt: string;
  className: string;
}

interface PromoBannerProps {
  eyebrow?: string;
  title?: string;
  subtitle?: string;
  ctaLabel?: string;
  onCtaClick?: () => void;
  products?: Product[];
  className?: string;
}

const defaultProducts: Product[] = [
  {
    src: keyboardImg,
    alt: "Clavier mécanique RGB",
    className: "left-[3%] bottom-[8%] w-[22%] max-w-[270px]",
  },
  {
    src: phoneImg,
    alt: "Smartphone gaming",
    className: "left-[28%] bottom-[6%] w-[9%] max-w-[125px]",
  },
  {
    src: monitorImg,
    alt: "Écran OLED gaming MSI",
    className: "left-[45%] top-[12%] w-[21%] max-w-[260px]",
  },
  {
    src: headsetImg,
    alt: "Casque gaming RGB",
    className: "right-[24%] bottom-[8%] w-[13%] max-w-[165px]",
  },
  {
    src: laptopImg,
    alt: "PC portable gaming ROG",
    className: "right-[3%] top-[10%] w-[22%] max-w-[280px]",
  },
];

const PromoBanner: FC<PromoBannerProps> = ({
  eyebrow,
  title = "Nos coups de cœur du mois",
  subtitle = "Promis ! ça vaut le détour.",
  ctaLabel = "DÉCOUVRIR LA SÉLECTION",
  onCtaClick,
  products = defaultProducts,
  className = "",
}) => {
  const navigate = useNavigate();

  const handleCtaClick = () => {
    if (onCtaClick) {
      onCtaClick();
      return;
    }
    navigate("/catalogue");
  };

  return (
    <div className="w-full flex justify-center px-2 sm:px-3 my-2">
      <section
        className={`relative w-[96%] max-w-[1600px] overflow-hidden rounded-2xl border border-zinc-800 bg-[#173241] aspect-[16/5.2] min-h-[260px] ${className}`}
      >
        {/* 1. Fond image */}
        <img
          src={bannerBg}
          alt=""
          aria-hidden="true"
          className="absolute inset-0 h-full w-full object-cover z-0"
        />

        {/* 2. Titre à gauche de l'écran sur une ligne */}
        <div className="absolute top-[14%] left-[4%] sm:left-[5%] z-20 flex flex-col gap-1 max-w-[340px] sm:max-w-[400px]">
          {eyebrow && (
            <span className="text-[10px] sm:text-xs font-semibold uppercase tracking-[0.2em] text-white/70">
              {eyebrow}
            </span>
          )}
          <h2 className="font-sans text-sm sm:text-base md:text-lg lg:text-xl font-extrabold leading-none text-white drop-shadow-md whitespace-nowrap">
            {title}
          </h2>
          <p className="font-serif text-xs sm:text-sm md:text-base italic text-white/90 drop-shadow whitespace-nowrap">
            {subtitle}
          </p>
        </div>

        {/* 3. Produits flottants */}
        <div className="pointer-events-none absolute inset-0 z-10">
          {products.map((p) => (
            <img
              key={p.src}
              src={p.src}
              alt={p.alt}
              className={`absolute select-none drop-shadow-[0_15px_20px_rgba(0,0,0,0.55)] object-contain ${p.className}`}
            />
          ))}
        </div>

        {/* 4. Bouton CTA */}
        <button
          type="button"
          onClick={handleCtaClick}
          className="absolute bottom-4 right-4 z-20 rounded-md bg-white px-4 py-2 text-[10px] sm:text-xs font-black uppercase tracking-wider text-black shadow-lg transition hover:bg-zinc-200 hover:scale-105"
        >
          {ctaLabel}
        </button>
      </section>
    </div>
  );
};

export default PromoBanner;