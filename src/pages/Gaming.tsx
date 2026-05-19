// Gaming.tsx
import { useEffect, useState } from "react";
import { Monitor, Laptop, Droplet } from "lucide-react";
import { SiteLayout } from "@/components/site/SiteLayout";
import { MiniHero } from "@/components/layout/MiniHero";
import { UnitesCentralesGaming } from "@/components/gaming/UnitesCentralesGaming";
import { LaptopsGaming } from "@/components/gaming/LaptopsGaming";
import { WatercoolingCustom } from "@/components/gaming/WatercoolingCustom";
import { cn } from "@/lib/utils";

const TABS = [
  {
    id: "unites-centrales",
    label: "Unités Centrales",
    description: "PC Gaming sur mesure",
    icon: Monitor,
    accent: "purple",
    accentClasses: {
      bar: "bg-purple-500",
      icon: "text-purple-500",
      dot: "bg-purple-500",
    },
  },
  {
    id: "laptops",
    label: "Laptops Gaming",
    description: "Portables puissants",
    icon: Laptop,
    accent: "blue",
    accentClasses: {
      bar: "bg-blue-500",
      icon: "text-blue-500",
      dot: "bg-blue-500",
    },
  },
  {
    id: "watercooling",
    label: "Watercooling",
    description: "Refroidissement liquide",
    icon: Droplet,
    accent: "cyan",
    accentClasses: {
      bar: "bg-cyan-500",
      icon: "text-cyan-500",
      dot: "bg-cyan-500",
    },
  },
] as const;

type TabId = (typeof TABS)[number]["id"];

const Gaming = () => {
  const [activeTab, setActiveTab] = useState<TabId>("unites-centrales");
  const [visibleTab, setVisibleTab] = useState<TabId>("unites-centrales");
  const [isAnimating, setIsAnimating] = useState(false);

  useEffect(() => {
    document.title = "Gaming — Les Casaniers Madagascar";
  }, []);

  const switchTab = (id: TabId) => {
    if (id === activeTab || isAnimating) return;
    setIsAnimating(true);
    setVisibleTab("" as TabId);
    setTimeout(() => {
      setActiveTab(id);
      requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          setVisibleTab(id);
          setIsAnimating(false);
        });
      });
    }, 200);
  };

  return (
    <SiteLayout>
      <MiniHero
        title="La puissance gaming, là où l'action commence."
        description="Performances extrêmes, refroidissement sur-mesure et design agressif | nos configurations gaming sont prêtes à dominer tous vos jeux."
        bg="5.png"
      />

      <div className="max-w-[1200px] mx-auto px-4 md:px-6 py-10">
        {/* Card wrapper */}
        <div className="rounded-2xl border border-border bg-card shadow-sm overflow-hidden">

          {/* ── Navigation ── */}
          <div className="flex items-center gap-1 px-4 pt-4 pb-0 border-b border-border bg-card">
            {TABS.map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  role="tab"
                  aria-selected={isActive}
                  onClick={() => switchTab(tab.id)}
                  className={cn(
                    "relative flex items-center gap-2 px-4 py-2.5 mb-[-1px]",
                    "text-sm font-medium rounded-t-lg border-x border-t",
                    "transition-all duration-200 focus-visible:outline-none",
                    isActive
                      ? "bg-card border-border text-foreground z-10"
                      : "bg-transparent border-transparent text-muted-foreground hover:text-foreground"
                  )}
                >
                  {/* Accent line on top when active */}
                  {isActive && (
                    <span
                      className={cn(
                        "absolute top-0 left-4 right-4 h-[2px] rounded-full",
                        tab.accentClasses.bar
                      )}
                    />
                  )}

                  <Icon
                    className={cn(
                      "w-3.5 h-3.5 transition-colors",
                      isActive ? tab.accentClasses.icon : "text-muted-foreground"
                    )}
                  />

                  <span>{tab.label}</span>
                </button>
              );
            })}
          </div>

          {/* ── Panel ── */}
          <div className="p-5">
            {TABS.map((tab) => (
              <div
                key={tab.id}
                role="tabpanel"
                className={cn(
                  "transition-all duration-200 ease-out",
                  activeTab === tab.id ? "block" : "hidden",
                  visibleTab === tab.id
                    ? "opacity-100 translate-y-0"
                    : "opacity-0 translate-y-1"
                )}
              >
                {tab.id === "unites-centrales" && <UnitesCentralesGaming />}
                {tab.id === "laptops" && <LaptopsGaming />}
                {tab.id === "watercooling" && <WatercoolingCustom />}
              </div>
            ))}
          </div>

        </div>
      </div>
    </SiteLayout>
  );
};

export default Gaming;