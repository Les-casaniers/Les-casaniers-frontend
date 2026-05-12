import { Droplets, Thermometer, Factory, Package } from "lucide-react";

const kits = [
  {
    id: 1,
    name: "Kit Watercooling Expert",
    type: "Custom Loop",
    compatibility: "Intel LGA1700 / AMD AM5",
    radiator: "360mm",
    pump: "D5 PWM",
    price: "399 €",
  },
  {
    id: 2,
    name: "AIO Liquid Freezer",
    type: "AIO 360mm",
    compatibility: "Universal",
    radiator: "360mm",
    pump: "Intégrée",
    price: "159 €",
  },
  {
    id: 3,
    name: "Kit Hardline Pro",
    type: "Custom Loop - Tubing Rigide",
    compatibility: "Tous sockets",
    radiator: "Double 360mm",
    pump: "Dual D5",
    price: "599 €",
  },
];

const accessories = [
  "Tubes rigides acétate",
  "Raccords chromés",
  "Liquide coolant RGB",
  "Ventilateurs haute pression",
];

export const WatercoolingCustom = () => {
  return (
    <section className="py-12">
      <div className="container-x">
        <h2 className="text-3xl font-bold mb-8 flex items-center gap-3">
          <Droplets className="h-8 w-8 text-cyan-500" />
          Watercooling Custom
        </h2>
        <p className="text-muted-foreground mb-8">
          Le refroidissement liquide haute performance. Silence absolu et températures maîtrisées.
        </p>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
          {kits.map((kit) => (
            <div key={kit.id} className="border border-border rounded-lg p-6 hover:shadow-lg transition-shadow">
              <h3 className="text-xl font-bold mb-4">{kit.name}</h3>
              <div className="space-y-2 mb-4">
                <div className="flex items-center gap-2">
                  <Package className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm">Type: {kit.type}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Factory className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm">Compatibilité: {kit.compatibility}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Thermometer className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm">Radiateur: {kit.radiator}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Droplets className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm">Pompe: {kit.pump}</span>
                </div>
              </div>
              <div className="flex items-center justify-between mt-4">
                <span className="text-2xl font-bold text-primary">{kit.price}</span>
                <button className="bg-foreground text-background px-4 py-2 hover:opacity-90 transition">
                  Commander
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Accessoires section */}
        <div className="bg-secondary/50 p-6 rounded-lg">
          <h3 className="text-xl font-semibold mb-4">Accessoires disponibles</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {accessories.map((item, index) => (
              <div key={index} className="flex items-center gap-2">
                <div className="h-2 w-2 bg-cyan-500 rounded-full" />
                <span className="text-sm">{item}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};