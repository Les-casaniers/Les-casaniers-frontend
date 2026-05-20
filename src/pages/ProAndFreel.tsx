import { useLocation } from "react-router-dom";
import { useEffect } from "react";
import { Briefcase } from "lucide-react";
import { Link } from "react-router-dom";
import { SiteLayout } from "@/components/site/SiteLayout";
import { BureautiqueSection } from "@/components/proAndFreel/BureautiqueSection";
import { WorkstationsSection } from "@/components/proAndFreel/WorkstationsSection";
import { ServeursSection } from "@/components/proAndFreel/ServeursSection";
import { SolutionsMobilesSection } from "@/components/proAndFreel/SolutionsMobilesSection";
import { MiniHero } from "@/components/layout/MiniHero";

const ANCHORS = [
  { label: "Bureautique", href: "#bureautique", color: "text-blue-500 border-blue-500/30 hover:bg-blue-500/10" },
  { label: "Workstations", href: "#workstations", color: "text-purple-500 border-purple-500/30 hover:bg-purple-500/10" },
  { label: "Serveurs NAS", href: "#serveurs", color: "text-green-500 border-green-500/30 hover:bg-green-500/10" },
  { label: "Solutions Mobiles", href: "#solutions-mobiles", color: "text-amber-500 border-amber-500/30 hover:bg-amber-500/10" },
];

const ProAndFreel = () => {
  const location = useLocation();

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
        title="Des solutions informatiques taillées pour les professionnels."
        description="Bureautique, création, stockage ou mobilité | nous avons la configuration qu'il vous faut, livrée et installée à Madagascar."
        bg="6.png"
      />

      {/* Les 4 sections */}
      <BureautiqueSection />
      <WorkstationsSection />
      <ServeursSection />
      <SolutionsMobilesSection />
    </SiteLayout>
  );
};

export default ProAndFreel;