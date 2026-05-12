import { useLocation } from "react-router-dom";
import { useEffect } from "react";
import { Gamepad2 } from "lucide-react";
import { Link } from "react-router-dom";
import { SiteLayout } from "@/components/site/SiteLayout";
import { UnitesCentralesGaming } from "@/components/gaming/UnitesCentralesGaming";
import { LaptopsGaming } from "@/components/gaming/LaptopsGaming";
import { WatercoolingCustom } from "@/components/gaming/WatercoolingCustom";
import { MiniHero } from "@/components/layout/MiniHero";

const ANCHORS = [
  { label: "Unités Centrales", href: "#unites-centrales", color: "text-purple-500 border-purple-500/30 hover:bg-purple-500/10" },
  { label: "Laptops Gaming", href: "#laptops", color: "text-blue-500 border-blue-500/30 hover:bg-blue-500/10" },
  { label: "Watercooling", href: "#watercooling", color: "text-cyan-500 border-cyan-500/30 hover:bg-cyan-500/10" },
];

const Gaming = () => {
  const location = useLocation();

  useEffect(() => {
    document.title = "Gaming — Les Casaniers Madagascar";
    const meta =
      document.querySelector('meta[name="description"]') ??
      document.head.appendChild(
        Object.assign(document.createElement("meta"), { name: "description" })
      );
    meta.setAttribute(
      "content",
      "Unités Centrales Gaming, Laptops Gaming et Watercooling Custom pour passionnés de jeux vidéo à Madagascar."
    );
  }, []);

  // Scroll automatique vers la section selon le # dans l'URL
  useEffect(() => {
    if (location.hash) {
      setTimeout(() => {
        const element = document.querySelector(location.hash);
        if (element) {
          element.scrollIntoView({ behavior: "smooth", block: "start" });
        }
      }, 100);
    } else {
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  }, [location.hash]);

  return (
    <SiteLayout>
      {/* Hero */}
      <MiniHero
        title="La puissance gaming, là où l'action commence."
        description="Performances extrêmes, refroidissement sur-mesure et design agressif | nos configurations gaming sont prêtes à dominer tous vos jeux."
        bg="5.png"
      />

      {/* Les 3 sections avec ancres */}
      <div id="unites-centrales">
        <UnitesCentralesGaming />
      </div>
      <div id="laptops">
        <LaptopsGaming />
      </div>
      <div id="watercooling">
        <WatercoolingCustom />
      </div>
    </SiteLayout>
  );
};

export default Gaming;