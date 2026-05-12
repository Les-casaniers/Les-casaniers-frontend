import { Cpu, Zap, HardDrive, MemoryStick } from "lucide-react";

const products = [
  {
    id: 1,
    name: "Gamer Pro Xtreme",
    processor: "Intel Core i9-14900K",
    ram: "32GB DDR5",
    storage: "1TB NVMe SSD",
    gpu: "RTX 4080",
    price: "2 499 €",
  },
  {
    id: 2,
    name: "Mid-Tier Gaming",
    processor: "AMD Ryzen 7 7800X3D",
    ram: "16GB DDR5",
    storage: "512GB NVMe SSD",
    gpu: "RTX 4070",
    price: "1 799 €",
  },
  {
    id: 3,
    name: "Entry Level Gaming",
    processor: "Intel Core i5-13600K",
    ram: "16GB DDR4",
    storage: "1TB SSD",
    gpu: "RTX 4060",
    price: "1 199 €",
  },
];

export const UnitesCentralesGaming = () => {
  return (
    <section className="py-12">
      <div className="container-x">
        <h2 className="text-3xl font-bold mb-8 flex items-center gap-3">
          <Cpu className="h-8 w-8 text-purple-500" />
          Unités Centrales Gaming
        </h2>
        <p className="text-muted-foreground mb-8">
          Des PC gaming prêts à dominer tous vos jeux. Performance maximale, refroidissement optimisé.
        </p>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {products.map((product) => (
            <div key={product.id} className="border border-border rounded-lg p-6 hover:shadow-lg transition-shadow">
              <h3 className="text-xl font-bold mb-4">{product.name}</h3>
              <div className="space-y-2 mb-4">
                <div className="flex items-center gap-2">
                  <Cpu className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm">{product.processor}</span>
                </div>
                <div className="flex items-center gap-2">
                  <MemoryStick className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm">{product.ram}</span>
                </div>
                <div className="flex items-center gap-2">
                  <HardDrive className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm">{product.storage}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Zap className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm">{product.gpu}</span>
                </div>
              </div>
              <div className="flex items-center justify-between mt-4">
                <span className="text-2xl font-bold text-primary">{product.price}</span>
                <button className="bg-foreground text-background px-4 py-2 hover:opacity-90 transition">
                  Voir détails
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};