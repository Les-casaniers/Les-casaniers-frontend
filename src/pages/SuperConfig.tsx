import { CornerRightDown } from "lucide-react";
import { Link } from "react-router-dom";
import pcPro from "@/assets/t2.jpg";
import pcGaming from "@/assets/t3.jpg";
import pcConfig from "@/assets/t5.jpg";
import devis from "@/assets/pexels-tara-winstead-7111548.jpg";
import arrow from "@/assets/Curved Arrow Downward.png";
import { SiteLayout } from "@/components/site/SiteLayout";

const doors = [
  {
    image: pcPro,
    label: "Pro & Freelance",
    line1: "GAMER",
    line2: ">>>",
    href: "/config",
    overlay: "bg-black/50",
    labelStyle: "pill" as const,
    labelClass: "bg-white text-black",
  },
  {
    image: pcGaming,
    label: "Gamer",
    line1: "BUREAUTIQUE",
    line2: ">>>",
    href: "/config",
    overlay: "bg-emerald-950/30",
    labelStyle: "pill" as const,
    labelClass: "bg-white text-black",
  },
  {
    image: pcConfig,
    label: "Super Configurateur",
    line1: "CREATEUR",
    line2: ">>>",
    href: "/config",
    overlay: "bg-black/10",
    labelStyle: "pill" as const, 
    labelClass: "bg-orange-500 text-white",
  },
  {
    image: devis,
    label: "Devis Express",
    line1: "MULTIMEDIA",
    line2: ">>>",
    href: "/config",
    overlay: "bg-zinc-900/10",
    labelStyle: "pill" as const,
    labelClass: "bg-white text-black",
  },
];

export const SuperConfig = () => (
    <SiteLayout>
        <div className="mt-4 text-center">
            <h1 className="font-sans text-2xl md:text-3xl font-extrabold tracking-widest text-white mb-1">
              Choisis ton super-pouvoir
            </h1>
            <div className="-mt-4 flex items-center gap-2 w-fit mx-auto">
              <div className="ml-8 w-24 h-[3px] bg-white" />
          
              <div 
                className="w-24 h-1 bg-repeat-x"
                style={{
                  backgroundImage: `url("data:image/svg+xml,%3csvg width='100%25' height='100%25' xmlns='http://www.w3.org/2000/svg'%3e%3cline x1='0' y1='50%25' x2='100%25' y2='50%25' stroke='rgb(255, 255, 255)' stroke-width='2' stroke-dasharray='24%2c 12'/%3e%3c/svg%3e")`
                }}
              />
              <img 
                src={arrow}
                alt="Flèche vers le bas"
                className="mt-[20px] ml-1 -mb-[12px] h-8 w-8 text-white"
              />
        </div>
        </div>
        <section className="bg-black max-w-[1470px] mx-auto px-8 py-12 text-white lg:py-14">
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4 lg:gap-8">
        {doors.map((door) => (
          <Link
            key={door.label}
            to={door.href}
            className="group flex flex-col overflow-hidden rounded-md bg-zinc-900"
          >
            {/* Zone image */}
            <div className="relative aspect-[6/3] w-full overflow-hidden">
              <img
                src={door.image}
                alt={door.label}
                className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
              />
              <div className={`absolute inset-0 ${door.overlay}`} />
            </div>

            {/* Zone texte */}
            <div className="flex h-10 items-center justify-between bg-white px-4">
  <span className="text-lg font-extrabold uppercase leading-none tracking-wide text-black">
    {door.line1}
  </span>
  <span className="text-lg font-extrabold uppercase leading-none tracking-wide text-black">
    {door.line2}
  </span>
</div>
          </Link>
        ))}
      </div>
  </section>

    </SiteLayout>
);