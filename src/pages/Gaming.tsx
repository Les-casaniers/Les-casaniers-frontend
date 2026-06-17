import { useEffect } from "react";
import { Gamepad2 } from "lucide-react";
import { SiteLayout } from "@/components/site/SiteLayout";
import { MiniHero } from "@/components/layout/MiniHero";
import { GamingCatalogue } from "@/components/gaming/GamingCatalogue";

const Gaming = () => {
  useEffect(() => {
    document.title = "Gaming — Les Casaniers Madagascar";
  }, []);

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

      <GamingCatalogue />
    </SiteLayout>
  );
};

export default Gaming;