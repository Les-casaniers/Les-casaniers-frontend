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
    title: "Trouve ton équipement de travail.",
    href: "/pro-freelance",
    overlay: "bg-black/50",
    labelStyle: "pill" as const,
    labelClass: "bg-white text-black",
  },
  {
    image: pcGaming,
    label: "Gamer",
    title: "Monte ton setup de jeux.",
    href: "/gaming",
    overlay: "bg-emerald-950/30",
    labelStyle: "pill" as const,
    labelClass: "bg-white text-black",
  },
  {
    image: pcConfig,
    label: "Super Configurateur",
    title: "Compose ta machine idéale.",
    href: "/configurateur",
    overlay: "bg-black/10",
    labelStyle: "bar" as const,
    labelClass: "bg-orange-500 text-white",
  },
  {
    image: devis,
    label: "Devis Express",
    title: "Fais-toi conseiller par un expert.",
    href: "/devis-express",
    overlay: "bg-zinc-900/10",
    labelStyle: "pill" as const,
    labelClass: "bg-white text-black",
  },
];

export const ThreeDoors = () => (
  <section className="bg-black px-3 py-4 text-white sm:px-4 lg:px-3.5 lg:py-6">
    <div className="mb-4">
      <h2 className="flex items-center gap-2 text-[26px] font-black uppercase leading-none tracking-[0.08em] sm:text-[30px]">
        <span className="border-b-2 border-dashed border-white pb-1">Choisis ton</span>
        <span className="font-light italic tracking-[0.04em]">chemin.</span>
        <CornerRightDown className="mt-3 h-5 w-5 stroke-[1.2]" />
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
          <div className="relative aspect-[16/9] w-full overflow-hidden">
            <img
              src={door.image}
              alt={door.label}
              className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
            />
            <div className={`absolute inset-0 ${door.overlay}`} />

            {door.labelStyle === "pill" ? (
              <span
                className={`absolute bottom-2 left-1/2 -translate-x-1/2 whitespace-nowrap rounded-md px-2 py-0.5 text-[9px] font-semibold italic shadow-sm ${door.labelClass}`}
              >
                {door.label}
              </span>
            ) : (
              <span
                className={`absolute bottom-0 left-0 w-full px-3 py-1 text-center text-[10px] font-semibold italic ${door.labelClass}`}
              >
                {door.label}
              </span>
            )}
          </div>

          {/* Zone titre */}
          <div className="flex h-[50px] flex-col items-center justify-center bg-zinc-900 px-3 text-center">
            <h3 className="text-[12px] font-extrabold uppercase leading-tight tracking-wide sm:text-[13px]">
              {door.title.split(" ").length > 2 ? (
                <>
                  {door.title.split(" ").slice(0, 2).join(" ")}
                  <br />
                  {door.title.split(" ").slice(2).join(" ")}
                </>
              ) : (
                door.title
              )}
            </h3>
          </div>
        </Link>
      ))}
    </div>
  </section>
);