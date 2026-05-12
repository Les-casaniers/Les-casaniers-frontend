import { useLocation } from "react-router-dom";
import { useEffect } from "react";
import { Cpu, Gamepad, MemoryStick, HardDrive, CircuitBoard, Zap, Server } from "lucide-react";
import { Link } from "react-router-dom";
import { SiteLayout } from "@/components/site/SiteLayout";
import { MiniHero } from "@/components/layout/MiniHero";

const Composants = () => {
  const location = useLocation();

  useEffect(() => {
    document.title = "Composants PC — Les Casaniers Madagascar";
    const meta =
      document.querySelector('meta[name="description"]') ??
      document.head.appendChild(
        Object.assign(document.createElement("meta"), { name: "description" })
      );
    meta.setAttribute(
      "content",
      "CPU, GPU, RAM, Stockage et Cartes mères : tous les composants PC pour assembler ou améliorer votre ordinateur à Madagascar."
    );
  }, []);

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

  // Données des composants
  const categories = [
    {
      id: "cpu",
      name: "CPU",
      icon: <Cpu className="h-8 w-8" />,
      color: "text-purple-500",
      bgColor: "bg-purple-500/10",
      borderColor: "border-purple-500",
      description: "Le cerveau de votre ordinateur. Performances et rapidité d'exécution.",
      products: [
        { name: "Intel Core i9-14900K", specs: "24 cœurs, 32 threads, jusqu'à 6.0 GHz", price: "699 €" },
        { name: "Intel Core i7-14700K", specs: "20 cœurs, 28 threads, jusqu'à 5.6 GHz", price: "449 €" },
        { name: "AMD Ryzen 9 7950X3D", specs: "16 cœurs, 32 threads, jusqu'à 5.7 GHz", price: "799 €" },
        { name: "AMD Ryzen 7 7800X3D", specs: "8 cœurs, 16 threads, jusqu'à 5.0 GHz", price: "499 €" },
        { name: "Intel Core i5-14600K", specs: "14 cœurs, 20 threads, jusqu'à 5.3 GHz", price: "329 €" },
      ]
    },
    {
      id: "gpu",
      name: "GPU",
      icon: <Gamepad className="h-8 w-8" />,
      color: "text-green-500",
      bgColor: "bg-green-500/10",
      borderColor: "border-green-500",
      description: "Carte graphique pour le gaming et la création.",
      products: [
        { name: "NVIDIA RTX 4090", specs: "24GB GDDR6X, DLSS 3", price: "1 899 €" },
        { name: "NVIDIA RTX 4080", specs: "16GB GDDR6X, DLSS 3", price: "1 299 €" },
        { name: "NVIDIA RTX 4070 Ti", specs: "12GB GDDR6X, DLSS 3", price: "899 €" },
        { name: "AMD RX 7900 XTX", specs: "24GB GDDR6, FSR 3", price: "1 099 €" },
        { name: "AMD RX 7800 XT", specs: "16GB GDDR6, FSR 3", price: "599 €" },
      ]
    },
    {
      id: "ram",
      name: "RAM",
      icon: <MemoryStick className="h-8 w-8" />,
      color: "text-blue-500",
      bgColor: "bg-blue-500/10",
      borderColor: "border-blue-500",
      description: "Mémoire vive pour le multitâche et la réactivité.",
      products: [
        { name: "DDR5 32GB (2x16GB)", specs: "6000MHz, CL30", price: "149 €" },
        { name: "DDR5 64GB (2x32GB)", specs: "5600MHz, CL36", price: "259 €" },
        { name: "DDR5 16GB (2x8GB)", specs: "5200MHz, CL38", price: "89 €" },
        { name: "DDR4 32GB (2x16GB)", specs: "3600MHz, CL18", price: "99 €" },
        { name: "DDR5 128GB (4x32GB)", specs: "5200MHz, CL40", price: "499 €" },
      ]
    },
    {
      id: "storage",
      name: "Stockage",
      icon: <HardDrive className="h-8 w-8" />,
      color: "text-amber-500",
      bgColor: "bg-amber-500/10",
      borderColor: "border-amber-500",
      description: "SSD et HDD pour vos données et applications.",
      products: [
        { name: "Samsung 990 Pro", specs: "NVMe SSD 1TB, 7450 MB/s", price: "119 €" },
        { name: "Samsung 990 Pro", specs: "NVMe SSD 2TB, 7450 MB/s", price: "199 €" },
        { name: "WD Black SN850X", specs: "NVMe SSD 1TB, 7300 MB/s", price: "109 €" },
        { name: "Crucial P3 Plus", specs: "NVMe SSD 2TB, 5000 MB/s", price: "129 €" },
        { name: "Seagate BarraCuda", specs: "HDD 4TB, 5400 RPM", price: "109 €" },
      ]
    },
    {
      id: "motherboard",
      name: "Cartes mères",
      icon: <CircuitBoard className="h-8 w-8" />,
      color: "text-red-500",
      bgColor: "bg-red-500/10",
      borderColor: "border-red-500",
      description: "La base de votre configuration, compatible avec vos composants.",
      products: [
        { name: "ASUS ROG Maximus Z790", specs: "Intel Z790, ATX, PCIe 5.0, WiFi 7", price: "599 €" },
        { name: "MSI MPG B650 Carbon", specs: "AMD B650, ATX, PCIe 5.0, WiFi 6E", price: "329 €" },
        { name: "Gigabyte Z790 Aorus", specs: "Intel Z790, ATX, PCIe 5.0, RGB", price: "279 €" },
        { name: "ASRock B760M Pro", specs: "Intel B760, mATX, PCIe 4.0", price: "129 €" },
        { name: "ASUS TUF Gaming B650", specs: "AMD B650, mATX, PCIe 5.0, durable", price: "199 €" },
      ]
    }
  ];

  return (
    <SiteLayout>
      {/* Hero */}
      <MiniHero
        title="Tous les composants pour votre PC."
        description="Des processeurs aux cartes mères, en passant par les cartes graphiques et la RAM, trouvez tout ce qu'il vous faut pour une configuration sur mesure."
        bg="7.png"
      />

      {/* Section unique avec tous les composants */}
      <section id="composants" className="py-12 scroll-mt-20">
        <div className="container-x">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold mb-4 flex items-center justify-center gap-3">
              <Server className="h-8 w-8 text-yellow-500" />
              Nos Composants
              <Zap className="h-8 w-8 text-yellow-500" />
            </h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Découvrez notre sélection de composants haute performance pour assembler ou améliorer votre PC.
              CPU, GPU, RAM, stockage et cartes mères : tout ce qu'il vous faut.
            </p>
          </div>

          <div className="space-y-12">
            {categories.map((category) => (
              <div
                key={category.id}
                id={category.id}
                className={`border-l-4 ${category.borderColor} bg-secondary/20 rounded-r-lg p-6 hover:shadow-lg transition-shadow`}
              >
                {/* En-tête de catégorie */}
                <div className="flex items-center gap-4 mb-4">
                  <div className={`p-3 rounded-full ${category.bgColor} ${category.color}`}>
                    {category.icon}
                  </div>
                  <div>
                    <h3 className={`text-2xl font-bold ${category.color}`}>
                      {category.name}
                    </h3>
                    <p className="text-sm text-muted-foreground">{category.description}</p>
                  </div>
                </div>

                {/* Grille des produits */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 mt-6">
                  {category.products.map((product, idx) => (
                    <div key={idx} className="border border-border rounded-lg p-4 hover:bg-background transition-all">
                      <h4 className="font-bold text-lg mb-2">{product.name}</h4>
                      <p className="text-sm text-muted-foreground mb-3">{product.specs}</p>
                      <div className="mt-3 pt-3 border-t border-border flex items-center justify-between">
                        <span className="text-xl font-bold text-primary">{product.price}</span>
                        <button className="px-3 py-1.5 text-sm bg-foreground text-background hover:opacity-90 transition rounded">
                          Ajouter
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </SiteLayout>
  );
};

export default Composants;