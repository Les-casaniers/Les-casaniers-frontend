import { CornerRightDown } from "lucide-react";
import { Link } from "react-router-dom";
import pcPro from "@/assets/t2.jpg";
import pcGaming from "@/assets/t3.jpg";
import pcConfig from "@/assets/t5.jpg";
import devis from "@/assets/pexels-tara-winstead-7111548.jpg";
import gamer from "@/assets/ConfigPro/1.png";
import bureautique from "@/assets/ConfigPro/2.png";
import createur from "@/assets/ConfigPro/3.png";
import multimedia from "@/assets/ConfigPro/4.png";
import arrow from "@/assets/Curved Arrow Downward.png";
import { SiteLayout } from "@/components/site/SiteLayout";

const doors = [
  {
    image: pcPro,
    buttonImage: gamer,
    label: "Pro & Freelance",
    line1: "GAMER",
    
    href: "/config",
    overlay: "bg-black/50",
    labelStyle: "pill" as const,
    labelClass: "bg-white text-black",
  },
  {
    image: pcGaming,
    buttonImage: bureautique,
    label: "Gamer",
    line1: "BUREAUTIQUE",
    
    href: "/config",
    overlay: "bg-emerald-950/30",
    labelStyle: "pill" as const,
    labelClass: "bg-white text-black",
  },
  {
    image: pcConfig,
    buttonImage: createur,
    label: "Super Configurateur",
    line1: "CREATEUR",
    
    href: "/config",
    overlay: "bg-black/10",
    labelStyle: "pill" as const, 
    labelClass: "bg-orange-500 text-white",
  },
  {
    image: devis,
    buttonImage: multimedia,
    label: "Devis Express",
    line1: "MULTIMEDIA",
    
    href: "/config",
    overlay: "bg-zinc-900/10",
    labelStyle: "pill" as const,
    labelClass: "bg-white text-black",
  },
];

export const SuperConfig = () => (
    <SiteLayout>
        <div className="mt-2 text-center">
            <h1 className="font-sans text-xs font-extrabold uppercase leading-4 tracking-[0.12em] text-white">
              Choisi ton super-pouvoir
            </h1>
            <div className="mt-1 flex h-3 items-center justify-center gap-1">
              <div className="h-px w-20 bg-white" />
              <div
                className="h-px w-20 bg-repeat-x"
                style={{
                  backgroundImage: `url("data:image/svg+xml,%3csvg width='100%25' height='100%25' xmlns='http://www.w3.org/2000/svg'%3e%3cline x1='0' y1='50%25' x2='100%25' y2='50%25' stroke='rgb(255, 255, 255)' stroke-width='2' stroke-dasharray='24%2c 12'/%3e%3c/svg%3e")`
                }}
              />
              <img 
                src={arrow}
                alt="Flèche vers le bas"
                className="h-3 w-3 text-white"
              />
        </div>
        </div>
        <section className="mx-auto max-w-[1470px] bg-black px-8 pt-4 pb-3 text-white">
      <div className="grid grid-cols-2 gap-4 md:grid-cols-4 md:gap-6">
        {doors.map((door) => (
          <Link
            key={door.label}
            to={door.href}
            className="group flex flex-col overflow-hidden rounded-md bg-zinc-900"
          >
            {/* Zone image */}
            <div className="relative aspect-[3/2] w-full overflow-hidden">
              <img
                src={door.image}
                alt={door.label}
                className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
              />
              <div className={`absolute inset-0 ${door.overlay}`} />
            </div>

            {/* Zone texte */}
            <img
              src={door.buttonImage}
              alt={door.line1}
              className="block aspect-[6.4/1] w-full object-fill"
            />
          </Link>
        ))}
      </div>
  </section>

    </SiteLayout>
);
