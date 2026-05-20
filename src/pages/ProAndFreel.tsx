import { useEffect, useState } from "react";
import { Briefcase } from "lucide-react";
import { SiteLayout } from "@/components/site/SiteLayout";
import { BureautiqueSection } from "@/components/proAndFreel/BureautiqueSection";
import { WorkstationsSection } from "@/components/proAndFreel/WorkstationsSection";
import { ServeursSection } from "@/components/proAndFreel/ServeursSection";
import { SolutionsMobilesSection } from "@/components/proAndFreel/SolutionsMobilesSection";
import { MiniHero } from "@/components/layout/MiniHero";

type SectionId = "bureautique" | "workstations" | "serveurs" | "solutions-mobiles";

const ANCHORS: { label: string; id: SectionId; color: string; activeColor: string }[] = [
  { label: "Bureautique", id: "bureautique", color: "text-blue-500 border-blue-500/30 hover:bg-blue-500/10", activeColor: "bg-blue-500/10 border-blue-500/60" },
  { label: "Workstations", id: "workstations", color: "text-purple-500 border-purple-500/30 hover:bg-purple-500/10", activeColor: "bg-purple-500/10 border-purple-500/60" },
  { label: "Serveurs NAS", id: "serveurs", color: "text-green-500 border-green-500/30 hover:bg-green-500/10", activeColor: "bg-green-500/10 border-green-500/60" },
  { label: "Solutions Mobiles", id: "solutions-mobiles", color: "text-amber-500 border-amber-500/30 hover:bg-amber-500/10", activeColor: "bg-amber-500/10 border-amber-500/60" },
];

const SECTIONS: { id: SectionId; component: React.ReactNode }[] = [
  { id: "bureautique", component: <BureautiqueSection /> },
  { id: "workstations", component: <WorkstationsSection /> },
  { id: "serveurs", component: <ServeursSection /> },
  { id: "solutions-mobiles", component: <SolutionsMobilesSection /> },
];

const ProAndFreel = () => {
  const [activeSection, setActiveSection] = useState<SectionId>("bureautique");
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    document.title = "Pro & Freelance — Les Casaniers Madagascar";
    const meta =
      document.querySelector('meta[name="description"]') ??
      document.head.appendChild(
        Object.assign(document.createElement("meta"), { name: "description" })
      );
    meta.setAttribute(
      "content",
      "Bureautique, workstations, serveurs NAS et solutions mobiles pour professionnels et freelances à Madagascar."
    );
  }, []);

  const handleNav = (id: SectionId) => {
    if (id === activeSection) return;
    setVisible(false);
    setTimeout(() => {
      setActiveSection(id);
      setVisible(true);
    }, 200);
  };

  const currentSection = SECTIONS.find((s) => s.id === activeSection);

  return (
    <SiteLayout>
      <MiniHero
        title={
          <>
            Des solutions informatiques{" "}
            <span className="text-[#c8a96e]">taillées pour les professionnels.</span>
          </>
        }
        description="Bureautique, création, stockage ou mobilité | Nous avons la configuration qu'il vous faut, livrée et installée à Madagascar."
        bg="6.png"
        pill={{ icon: <Briefcase className="h-3.5 w-3.5" />, label: "Pro & Freelance" }}
      />

      {/* Barre de navigation */}
      <nav className="sticky top-16 z-30 border-b border-border bg-background/80 backdrop-blur-md">
        <div className="container-x py-3">
          {/* Mobile : grille 2×2 */}
          <div className="grid grid-cols-2 gap-2 sm:hidden">
            {ANCHORS.map((anchor) => {
              const isActive = activeSection === anchor.id;
              return (
                <button
                  key={anchor.id}
                  onClick={() => handleNav(anchor.id)}
                  className={`text-xs font-semibold px-3 py-2 rounded-full border transition-all text-center ${isActive
                      ? `${anchor.color} ${anchor.activeColor} scale-105`
                      : `${anchor.color} opacity-60 hover:opacity-100`
                    }`}
                >
                  {anchor.label}
                </button>
              );
            })}
          </div>

          {/* Desktop : ligne scrollable */}
          <div className="hidden sm:flex items-center gap-2 overflow-x-auto scrollbar-none">
            <Briefcase className="h-4 w-4 text-[#c8a96e] shrink-0 mr-1" />
            {ANCHORS.map((anchor) => {
              const isActive = activeSection === anchor.id;
              return (
                <button
                  key={anchor.id}
                  onClick={() => handleNav(anchor.id)}
                  className={`shrink-0 text-xs font-semibold px-4 py-1.5 rounded-full border transition-all ${isActive
                      ? `${anchor.color} ${anchor.activeColor} scale-sm`
                      : `${anchor.color} opacity-60 hover:opacity-100`
                    }`}
                >
                  {anchor.label}
                </button>
              );
            })}
          </div>
        </div>
      </nav>

      {/* Section active avec fade-up */}
      <div
        style={{
          transition: "opacity 200ms ease, transform 200ms ease",
          opacity: visible ? 1 : 0,
          transform: visible ? "translateY(0)" : "translateY(16px)",
        }}
      >
        {currentSection?.component}
      </div>
    </SiteLayout>
  );
};

export default ProAndFreel;