import { useEffect, useState } from "react";
import { Monitor, Laptop, Droplet, Gamepad2 } from "lucide-react";
import { SiteLayout } from "@/components/site/SiteLayout";
import { MiniHero } from "@/components/layout/MiniHero";
import { UnitesCentralesGaming } from "@/components/gaming/UnitesCentralesGaming";
import { LaptopsGaming } from "@/components/gaming/LaptopsGaming";
import { WatercoolingCustom } from "@/components/gaming/WatercoolingCustom";

type TabId = "unites-centrales" | "laptops" | "watercooling";

const TABS: { id: TabId; label: string; color: string; activeColor: string }[] = [
  {
    id: "unites-centrales",
    label: "Unités Centrales",
    color: "text-purple-500 border-purple-500/30 hover:bg-purple-500/10",
    activeColor: "bg-purple-500/10 border-purple-500/60",
  },
  {
    id: "laptops",
    label: "Laptops Gaming",
    color: "text-blue-500 border-blue-500/30 hover:bg-blue-500/10",
    activeColor: "bg-blue-500/10 border-blue-500/60",
  },
  {
    id: "watercooling",
    label: "Watercooling",
    color: "text-cyan-500 border-cyan-500/30 hover:bg-cyan-500/10",
    activeColor: "bg-cyan-500/10 border-cyan-500/60",
  },
];

const SECTIONS: { id: TabId; component: React.ReactNode }[] = [
  { id: "unites-centrales", component: <UnitesCentralesGaming /> },
  { id: "laptops",          component: <LaptopsGaming /> },
  { id: "watercooling",     component: <WatercoolingCustom /> },
];

const Gaming = () => {
  const [activeTab, setActiveTab] = useState<TabId>("unites-centrales");
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    document.title = "Gaming — Les Casaniers Madagascar";
  }, []);

  const switchTab = (id: TabId) => {
    if (id === activeTab) return;
    setVisible(false);
    setTimeout(() => {
      setActiveTab(id);
      setVisible(true);
    }, 200);
  };

  const currentSection = SECTIONS.find((s) => s.id === activeTab);

  return (
    <SiteLayout>
      <MiniHero
        title={
          <>
            La puissance gaming{" "}
            <span className="text-[#c8a96e]">, là où l'action commence.</span>
          </>
        }
        description="Performances extrêmes, refroidissement sur-mesure et design agressif — nos configurations gaming sont prêtes à dominer tous vos jeux."
        bg="5.png"
        pill={{ icon: <Gamepad2 className="h-3.5 w-3.5" />, label: "Gaming" }}
      />

      {/* Barre de navigation */}
      <nav className="sticky top-16 z-30 border-b border-border bg-background/80 backdrop-blur-md">
        <div className="container-x py-3">

          {/* Mobile : grille 3 colonnes */}
          <div className="grid grid-cols-3 gap-2 sm:hidden">
            {TABS.map((tab) => {
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => switchTab(tab.id)}
                  className={`text-xs font-semibold px-2 py-2 rounded-full border transition-all text-center ${
                    isActive
                      ? `${tab.color} ${tab.activeColor}`
                      : `${tab.color} opacity-60 hover:opacity-100`
                  }`}
                >
                  {tab.label}
                </button>
              );
            })}
          </div>

          {/* Desktop : ligne */}
          <div className="hidden sm:flex items-center gap-2 overflow-x-auto scrollbar-none">
            <Gamepad2 className="h-4 w-4 text-[#c8a96e] shrink-0 mr-1" />
            {TABS.map((tab) => {
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => switchTab(tab.id)}
                  className={`shrink-0 text-xs font-semibold px-4 py-1.5 rounded-full border transition-all ${
                    isActive
                      ? `${tab.color} ${tab.activeColor}`
                      : `${tab.color} opacity-60 hover:opacity-100`
                  }`}
                >
                  {tab.label}
                </button>
              );
            })}
          </div>

        </div>
      </nav>

      {/* Contenu avec fade-up */}
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

export default Gaming;