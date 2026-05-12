import { Laptop, Battery, Thermometer, Weight } from "lucide-react";

const laptops = [
  {
    id: 1,
    name: "Razer Blade 18",
    screen: "18\" QHD+ 240Hz",
    processor: "Intel i9-14900HX",
    gpu: "RTX 4090 Laptop",
    battery: "Jusqu'à 6h",
    weight: "3.2 kg",
    price: "4 299 €",
  },
  {
    id: 2,
    name: "ASUS ROG Strix G16",
    screen: "16\" QHD 165Hz",
    processor: "Intel i7-13650HX",
    gpu: "RTX 4060",
    battery: "Jusqu'à 5h",
    weight: "2.5 kg",
    price: "1 699 €",
  },
  {
    id: 3,
    name: "MSI Stealth 14",
    screen: "14\" OLED 120Hz",
    processor: "Intel i7-13700H",
    gpu: "RTX 4070",
    battery: "Jusqu'à 7h",
    weight: "1.7 kg",
    price: "2 299 €",
  },
];

export const LaptopsGaming = () => {
  return (
    <section className="py-12 bg-secondary/30">
      <div className="container-x">
        <h2 className="text-3xl font-bold mb-8 flex items-center gap-3">
          <Laptop className="h-8 w-8 text-blue-500" />
          Laptops Gaming
        </h2>
        <p className="text-muted-foreground mb-8">
          La puissance du gaming en mobilité. Des laptops ultra-performants pour jouer partout.
        </p>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {laptops.map((laptop) => (
            <div key={laptop.id} className="border border-border rounded-lg p-6 bg-background hover:shadow-lg transition-shadow">
              <h3 className="text-xl font-bold mb-4">{laptop.name}</h3>
              <div className="space-y-2 mb-4">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium">Écran:</span>
                  <span className="text-sm text-muted-foreground">{laptop.screen}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium">Processeur:</span>
                  <span className="text-sm text-muted-foreground">{laptop.processor}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium">GPU:</span>
                  <span className="text-sm text-muted-foreground">{laptop.gpu}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Battery className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm">{laptop.battery}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Weight className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm">{laptop.weight}</span>
                </div>
              </div>
              <div className="flex items-center justify-between mt-4">
                <span className="text-2xl font-bold text-primary">{laptop.price}</span>
                <button className="bg-foreground text-background px-4 py-2 hover:opacity-90 transition">
                  Configurer
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};