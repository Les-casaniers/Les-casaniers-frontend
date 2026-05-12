import { useLocation } from "react-router-dom";
import { useEffect } from "react";
import { Keyboard, Mouse, Monitor, Armchair, Sparkles, Star, Zap } from "lucide-react";
import { Link } from "react-router-dom";
import { SiteLayout } from "@/components/site/SiteLayout";
import atelierCasanier from "@/assets/atelierCasanier.jpg";
import ecranGameurSimple from "@/assets/ecranGameurSimple.png";
import { MiniHero } from "@/components/layout/MiniHero";

const Peripheriques = () => {
  const location = useLocation();

  useEffect(() => {
    document.title = "Périphériques Gaming — Les Casaniers Madagascar";
    const meta = document.querySelector('meta[name="description"]') ?? document.head.appendChild(
      Object.assign(document.createElement("meta"), { name: "description" })
    );
    meta.setAttribute(
      "content",
      "Découvrez notre sélection de claviers, souris, écrans et chaises gaming pour une expérience optimale."
    );
  }, []);

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, [location.pathname]);

  // Données des produits
  const categories = [
    {
      id: "claviers",
      name: "Claviers Gaming",
      icon: <Keyboard className="h-8 w-8" />,
      color: "text-purple-500",
      bgColor: "bg-purple-500/10",
      borderColor: "border-purple-500",
      description: "Des claviers mécaniques et membranaires pour tous les styles de jeu.",
      products: [
        { name: "Corsair K70 RGB", type: "Mécanique", switches: "Cherry MX Red", rgb: "RGB", price: "249 000 Ar" },
        { name: "Logitech G Pro X", type: "Mécanique", switches: "GX Blue", rgb: "RGB", price: "199 000 Ar" },
        { name: "Razer BlackWidow", type: "Mécanique", switches: "Green", rgb: "Chroma RGB", price: "229 000 Ar" },
        { name: "Keychron K2", type: "Mécanique", switches: "Gateron Brown", rgb: "Blanc", price: "179 000 Ar" },
      ]
    },
    {
      id: "souris",
      name: "Souris Gaming",
      icon: <Mouse className="h-8 w-8" />,
      color: "text-blue-500",
      bgColor: "bg-blue-500/10",
      borderColor: "border-blue-500",
      description: "Précision et rapidité pour dominer vos adversaires.",
      products: [
        { name: "Logitech G502 Hero", dpi: "25 600 DPI", buttons: "11 boutons", weight: "121g", price: "89 000 Ar" },
        { name: "Razer DeathAdder V3", dpi: "30 000 DPI", buttons: "6 boutons", weight: "59g", price: "109 000 Ar" },
        { name: "Corsair Sabre RGB", dpi: "18 000 DPI", buttons: "8 boutons", weight: "74g", price: "79 000 Ar" },
        { name: "SteelSeries Rival 5", dpi: "18 000 DPI", buttons: "9 boutons", weight: "85g", price: "99 000 Ar" },
      ]
    },
    {
      id: "ecrans",
      name: "Écrans Gaming",
      icon: <Monitor className="h-8 w-8" />,
      color: "text-green-500",
      bgColor: "bg-green-500/10",
      borderColor: "border-green-500",
      description: "Des écrans haute fréquence pour une immersion totale.",
      products: [
        { name: "ASUS TUF VG249Q", size: "24 pouces", refresh: "144Hz", resolution: "FHD", price: "449 000 Ar" },
        { name: "AOC C27G2ZE", size: "27 pouces", refresh: "240Hz", resolution: "FHD", price: "549 000 Ar" },
        { name: "MSI Optix MAG274", size: "27 pouces", refresh: "165Hz", resolution: "QHD", price: "699 000 Ar" },
        { name: "Samsung Odyssey G5", size: "32 pouces", refresh: "165Hz", resolution: "QHD", price: "799 000 Ar" },
      ]
    },
    {
      id: "chaises",
      name: "Chaises Gaming",
      icon: <Armchair className="h-8 w-8" />,
      color: "text-red-500",
      bgColor: "bg-red-500/10",
      borderColor: "border-red-500",
      description: "Confort et soutien pour vos longues sessions de jeu.",
      products: [
        { name: "GTPlayer Pro", type: "Bureau", adjustable: "4D", maxWeight: "150kg", price: "399 000 Ar" },
        { name: "Secretlab Titan Evo", type: "Premium", adjustable: "4D", maxWeight: "180kg", price: "699 000 Ar" },
        { name: "Cougar Armor S", type: "Course", adjustable: "3D", maxWeight: "120kg", price: "299 000 Ar" },
        { name: "AKRacing Core X", type: "Bureau", adjustable: "4D", maxWeight: "160kg", price: "499 000 Ar" },
      ]
    }
  ];

  return (
    <SiteLayout>
      {/* Hero */}
      <MiniHero
        title="L'équipement pour dominer."
        description="Claviers, souris, écrans et chaises gaming | tout l'équipement nécessaire pour une expérience de jeu optimale."
        bg="4.png"
      />

      {/* Sections des produits */}
      <section className="py-16">
        <div className="container-x">
          <div className="space-y-16">
            {categories.map((category) => (
              <div
                key={category.id}
                id={category.id}
                className={`border-l-4 ${category.borderColor} bg-secondary/20 rounded-r-lg p-6 scroll-mt-20`}
              >
                {/* En-tête de catégorie */}
                <div className="flex items-center gap-4 mb-6">
                  <div className={`p-3 rounded-full ${category.bgColor} ${category.color}`}>
                    {category.icon}
                  </div>
                  <div>
                    <h2 className={`text-2xl font-bold ${category.color}`}>
                      {category.name}
                    </h2>
                    <p className="text-sm text-muted-foreground">{category.description}</p>
                  </div>
                </div>

                {/* Grille des produits */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                  {category.products.map((product, idx) => (
                    <div key={idx} className="border border-border rounded-lg overflow-hidden hover:shadow-lg transition-all hover:scale-105 duration-300">
                      {/* Image temporaire */}
                      <div className="h-48 overflow-hidden bg-secondary">
                        <img
                          src={ecranGameurSimple}
                          alt={product.name}
                          className="w-full h-full object-cover hover:scale-110 transition-transform duration-500"
                        />
                      </div>

                      {/* Badge */}
                      <div className="absolute mt-2 ml-2">
                        <span className="bg-black/70 text-white text-[10px] px-2 py-1 rounded-full flex items-center gap-1">
                          <Star className="h-2 w-2 fill-yellow-500 text-yellow-500" />
                          Top vente
                        </span>
                      </div>

                      {/* Infos produit */}
                      <div className="p-4">
                        <h3 className="font-bold text-lg mb-2 truncate">{product.name}</h3>
                        <div className="space-y-1 text-sm">
                          {Object.entries(product).map(([key, value]) => {
                            if (key === 'name' || key === 'price') return null;
                            const labels: Record<string, string> = {
                              type: "Type",
                              switches: "Switches",
                              rgb: "RGB",
                              dpi: "DPI",
                              buttons: "Boutons",
                              weight: "Poids",
                              size: "Taille",
                              refresh: "Fréquence",
                              resolution: "Résolution",
                              adjustable: "Réglages",
                              maxWeight: "Poids max"
                            };
                            return (
                              <div key={key} className="flex justify-between">
                                <span className="text-muted-foreground text-xs">{labels[key] || key}:</span>
                                <span className="font-medium text-xs">{value}</span>
                              </div>
                            );
                          })}
                        </div>
                        <div className="mt-3 pt-3 border-t border-border flex items-center justify-between">
                          <span className="text-lg font-bold text-primary">{product.price}</span>
                          <button className="px-3 py-1.5 text-xs bg-foreground text-background hover:opacity-90 transition rounded flex items-center gap-1">
                            <Zap className="h-3 w-3" />
                            Ajouter
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Bandeau avantage */}
      <section className="py-12 bg-gradient-to-r from-purple-500/10 to-blue-500/5 border-y border-border">
        <div className="container-x">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
            <div>
              <div className="text-3xl mb-2">🎮</div>
              <div className="font-bold text-sm">Compatibles PC/Console</div>
            </div>
            <div>
              <div className="text-3xl mb-2">🚚</div>
              <div className="font-bold text-sm">Livraison gratuite</div>
            </div>
            <div>
              <div className="text-3xl mb-2">✅</div>
              <div className="font-bold text-sm">Garantie 24 mois</div>
            </div>
            <div>
              <div className="text-3xl mb-2">⚡</div>
              <div className="font-bold text-sm">Paiement à la livraison</div>
            </div>
          </div>
        </div>
      </section>
    </SiteLayout>
  );
};

export default Peripheriques;