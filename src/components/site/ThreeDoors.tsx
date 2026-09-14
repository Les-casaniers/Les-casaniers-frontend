import { CornerRightDown } from "lucide-react";
import { Link } from "react-router-dom";
import pcPro from "@/assets/t2.jpg";
import pcGaming from "@/assets/t3.jpg";
import pcConfig from "@/assets/t5.jpg";
import devis from "@/assets/pexels-tara-winstead-7111548.jpg";

const doors = [
  {
    image: pcPro,
    label: "Pro & Freelance",
    line1: "TROUVE TON",
    line2: "ÉQUIPEMENT DE TRAVAIL.",
    href: "/pro-freelance",
    overlay: "bg-black/50",
    labelStyle: "pill" as const,
    labelClass: "bg-white text-black",
  },
  {
    image: pcGaming,
    label: "Gamer",
    line1: "MONTE TON",
    line2: "SETUP DE JEUX.",
    href: "/gaming",
    overlay: "bg-emerald-950/30",
    labelStyle: "pill" as const,
    labelClass: "bg-white text-black",
  },
  {
    image: pcConfig,
    label: "Super Configurateur",
    line1: "COMPOSE TA",
    line2: "MACHINE IDÉALE.",
    href: "/configurateur",
    overlay: "bg-black/10",
    labelStyle: "pill" as const, 
    labelClass: "bg-orange-500 text-white",
  },
  {
    image: devis,
    label: "Devis Express",
    line1: "FAIS-TOI CONSEILLER",
    line2: "PAR UN EXPERT.",
    href: "/devis-express",
    overlay: "bg-zinc-900/10",
    labelStyle: "pill" as const,
    labelClass: "bg-white text-black",
  },
];

export const ThreeDoors = () => (
  <section className="bg-black max-w-[1470px] mx-auto px-8 py-4 text-white lg:py-6">
    <div className="mb-4">
    <h2 className="inline-flex items-end text-[26px] font-black uppercase leading-none tracking-[0.08em] sm:text-[34px]">
    {/* Ligne 1 : soulignement solide */}
      <span className="border-b-2 border-white pb-1 pr-3 whitespace-nowrap">
          Choisis
      </span>
      <span className="mb-[0.35rem] ml-2 whitespace-nowrap">ton</span>
      
        <span className="mb-[0.1rem] relative pb-1 pl-3 font-light italic tracking-[0.04em] whitespace-nowrap">chemin.</span>

        <div 
          className="-ml-[220px] -mb-[0.09rem] w-64 h-1 bg-repeat-x"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3csvg width='100%25' height='100%25' xmlns='http://www.w3.org/2000/svg'%3e%3cline x1='0' y1='50%25' x2='100%25' y2='50%25' stroke='rgb(255, 255, 255)' stroke-width='2' stroke-dasharray='12%2c 8'/%3e%3c/svg%3e")`
          }}
        />
        
        <svg
          className="ml-[2px] -mb-[17px] h-5 w-5 text-white"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path d="M2 2 C10 2 17 6 17 14" />
          <path d="M6 3 C7 8 6 12 6 14" />
          <path d="M1 14 L11 23 L21 14" />
        </svg>
  </h2>
      </div>

      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4 lg:gap-8">
        {doors.map((door) => (
          <Link
            key={door.label}
            to={door.href}
            className="group flex flex-col overflow-hidden rounded-md bg-zinc-900"
          >
            {/* Zone image */}
            <div className="relative aspect-[4/3] w-full overflow-hidden">
              <img
                src={door.image}
                alt={door.label}
                className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
              />
              <div className={`absolute inset-0 ${door.overlay}`} />

              {/* Bouton pastille centré */}
              <span
                className={`absolute bottom-2 left-1/2 -translate-x-1/2 whitespace-nowrap rounded-md px-3 py-1 text-[10px] font-semibold italic shadow-sm ${door.labelClass}`}
              >
                {door.label}
              </span>
            </div>

            {/* Zone texte */}
            <div className="flex h-[80px] flex-col justify-center bg-zinc-900 px-4 text-left">
              <h3 className="text-[11px] font-extrabold uppercase leading-snug tracking-wide text-white sm:text-[12px]">
                {door.line1}
                {/* Indentation augmentée à pl-9 (~36px) pour créer plus de décalage */}
                <span className="block pl-9 mt-0.5">
                  {door.line2}
                </span>
              </h3>
            </div>
          </Link>
        ))}
      </div>
  </section>
);