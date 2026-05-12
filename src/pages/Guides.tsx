import { useLocation } from "react-router-dom";
import { useEffect } from "react";
import { BookOpen, ChevronRight } from "lucide-react";
import { SiteLayout } from "@/components/site/SiteLayout";
import { GuidesAchat } from "@/components/guide/GuidesAchat";
import { ActualitesTech } from "@/components/guide/ActualitesTech";
import { TutosMaintenance } from "@/components/guide/TutosMaintenance";
import { MiniHero } from "@/components/layout/MiniHero";

const Guides = () => {
  const location = useLocation();

  useEffect(() => {
    document.title = "Guides — Les Casaniers Madagascar";
    const meta = document.querySelector('meta[name="description"]') ?? document.head.appendChild(
      Object.assign(document.createElement("meta"), { name: "description" })
    );
    meta.setAttribute(
      "content",
      "Guides d'achat, actualités tech et tutos maintenance pour bien choisir et entretenir votre PC à Madagascar."
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

  const anchors = [
    { label: "Guides d'achat", href: "#guides-achat", color: "text-blue-500 border-blue-500/30 hover:bg-blue-500/10" },
    { label: "Actualités Tech", href: "#actualites-tech", color: "text-green-500 border-green-500/30 hover:bg-green-500/10" },
    { label: "Tutos Maintenance", href: "#tutos-maintenance", color: "text-red-500 border-red-500/30 hover:bg-red-500/10" }
  ];

  return (
    <SiteLayout>
      {/* Hero */}
      <MiniHero
        title="Guides, Actualités & Tutos."
        description="Tout ce qu'il vous faut pour bien choisir, suivre l'actualité et entretenir votre PC."
        bg="6.png"
      />

      {/* Les 3 sections */}
      <GuidesAchat />
      <ActualitesTech />
      <TutosMaintenance />
    </SiteLayout>
  );
};

export default Guides;