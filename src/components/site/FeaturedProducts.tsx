import type { FC } from "react";
import { useNavigate } from "react-router-dom";
import bannerBg from "../../assets/t11.jpg";
import keyboardImg from "../../assets/clavs.png";
import phoneImg from "../../assets/phone1.png";
import monitorImg from "../../assets/pc.png";
import headsetImg from "../../assets/casque1.png";
import laptopImg from "../../assets/ordi.png";

/**
 * PromoBanner
 * Bannière "coups de cœur du mois" — fond image (assets/t11.jpg) avec
 * produits flottants et CTA.
 *
 * Remplace les URLs dans `products` par tes propres visuels détourés (PNG
 * fond transparent, idéalement même angle 3/4 que sur la maquette).
 */

interface Product {
  src: string;
  alt: string;
  /** Classes Tailwind de positionnement + taille pour ce produit précis */
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
    className: "left-[2%] bottom-[12%] w-[24%] max-w-[260px] rotate-[-3deg]",
  },
  {
    src: phoneImg,
    alt: "Smartphone gaming",
    className: "left-[25%] bottom-[4%] w-[14%] max-w-[160px]",
  },
  {
    src: monitorImg,
    alt: "Écran OLED gaming MSI",
    className: "left-[38%] top-[6%] w-[22%] max-w-[260px]",
  },
  {
    src: headsetImg,
    alt: "Casque gaming RGB",
    className: "left-[62%] bottom-[6%] w-[18%] max-w-[210px]",
  },
  {
    src: laptopImg,
    alt: "PC portable gaming ROG",
    className: "right-[2%] top-[4%] w-[24%] max-w-[280px] rotate-[2deg]",
  },
];

const PromoBanner: FC<PromoBannerProps> = ({
  eyebrow,
  title = "Nos coups de cœur du mois",
  subtitle = "Promis ! ça vaut le détour.",
  ctaLabel = "Découvrir la sélection",
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
    <section
      className={`relative w-full overflow-hidden rounded-2xl border-2 border-black bg-[#173241] aspect-[16/6] min-h-[260px] ${className}`}
    >
      {/* Fond image */}
      <img
        src={bannerBg}
        alt=""
        aria-hidden="true"
        className="absolute inset-0 h-full w-full object-cover"
      />

      {/* Texte */}
      <div className="relative z-10 flex h-full flex-col justify-center gap-2 px-6 sm:px-10">
        {eyebrow && (
          <span className="text-xs font-semibold uppercase tracking-[0.2em] text-white/70">
            {eyebrow}
          </span>
        )}
        <h2 className="max-w-[60%] font-sans text-2xl font-extrabold leading-tight text-white sm:text-3xl md:text-4xl">
          {title}
        </h2>
        <p className="max-w-[50%] font-serif text-sm italic text-white/85 sm:text-base md:text-lg">
          {subtitle}
        </p>
      </div>

      {/* Produits flottants */}
      <div className="pointer-events-none absolute inset-0 z-10">
        {products.map((p) => (
          <img
            key={p.src}
            src={p.src}
            alt={p.alt}
            className={`absolute select-none drop-shadow-[0_18px_25px_rgba(0,0,0,0.55)] ${p.className}`}
          />
        ))}
      </div>

      {/* CTA */}
      <button
        type="button"
        onClick={onCtaClick}
        className="absolute bottom-4 right-4 z-20 rounded-md bg-white px-4 py-2 text-xs font-bold uppercase tracking-wide text-black shadow-md transition hover:bg-white/90 sm:bottom-6 sm:right-6 sm:px-5 sm:py-2.5 sm:text-sm"
      >
        {ctaLabel}
      </button>
    </section>
  );
};

export default PromoBanner;