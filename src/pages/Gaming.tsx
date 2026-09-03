import { useEffect } from "react";
import { Gamepad2 } from "lucide-react";
import { SiteLayout } from "@/components/site/SiteLayout";
import { MiniHero } from "@/components/layout/MiniHero";
import { InfoBar } from "@/components/site/InfoBar";
import { GamingCatalogue } from "@/components/gaming/GamingCatalogue";
import fond from "@/assets/fond2.jpg";
import chien from "@/assets/3.png";

const Gaming = () => {
  useEffect(() => {
    document.title = "Gaming — Les Casaniers Madagascar";
  }, []);

  return (
    <SiteLayout>
     <div className="w-full max-w-[1700px] mx-auto px-4 sm:px-6 lg:px-8 py-4 flex flex-col gap-6">
  {/* 1. Composant MiniHero */}
  <MiniHero
    title={
      <>
        une perfomence a la hauteur de tes ambitions {" "}
        
      </>
    }
    description={
      <div className="flex flex-col">
        <p>« Optimise et améliore tes performances</p>
        <p className="pl-[10.5rem] sm:pl-[12.5rem] md:pl-[14rem]">
          et domine chaque partie. »
        </p>
      </div>
    }
    bg={fond}
    mascot={chien}
    pill={{ icon: <Gamepad2 className="h-3.5 w-3.5" />, label: "Gaming" }}
  />

  {/* 2. InfoBar positionnée en dessous de la bannière */}
  <InfoBar />
</div>
      <GamingCatalogue />
    </SiteLayout>
  );
};

export default Gaming;