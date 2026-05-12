import { SiteLayout } from "@/components/site/SiteLayout";
import { Hero } from "@/components/site/Hero";
import { FeaturedProducts } from "@/components/site/FeaturedProducts";
import { ThreeDoors } from "@/components/site/ThreeDoors";
import { Pillars } from "@/components/site/Pillars";
import { Team } from "@/components/site/Team";
import { Configurator } from "@/components/site/Configurator";
import { ProductExample } from "@/components/site/ProductExample";
import { ProSection } from "@/components/site/ProSection";
import { CompatibilityBanner } from "@/components/site/CompatibilityBanner";
import { useEffect } from "react";

const Index = () => {
  useEffect(() => {
    document.title = "Les Casaniers Madagascar — PC sur-mesure, gaming & pro";
    const meta = document.querySelector('meta[name="description"]') ?? document.head.appendChild(Object.assign(document.createElement("meta"), { name: "description" }));
    meta.setAttribute("content", "PC sur-mesure à Madagascar : configurations gaming, workstations et pro. Importation Europe, garantie 24 mois, showroom à Tananarive.");
  }, []);

  return (
    <SiteLayout>
      <h1 className="sr-only">Les Casaniers Madagascar — PC sur-mesure</h1>
      <Hero />
      <ThreeDoors />
      <FeaturedProducts />
      {/* <Pillars /> 
      <Configurator />
      <ProductExample />
       <Team /> */}
      <ProSection />

    </SiteLayout>
  );
};

export default Index;
