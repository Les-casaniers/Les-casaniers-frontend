import { ShoppingBag, Cpu, Gamepad, Briefcase, Zap, CheckCircle, ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";

export const GuidesAchat = () => {
  const guides = [
    {
      id: "gaming",
      title: "PC Gaming",
      icon: <Gamepad className="h-6 w-6" />,
      color: "text-purple-500",
      bgColor: "bg-purple-500/10",
      description: "Pour les passionnés de jeux vidéo",
      price: "2 490 000 Ar - 8 990 000 Ar",
      features: [
        "Carte graphique performante (RTX 4060 → RTX 4090)",
        "Processeur rapide (Intel i5/i7/i9 ou AMD Ryzen 5/7/9)",
        "RAM 16GB à 32GB DDR5",
        "Stockage SSD NVMe 512GB à 2TB"
      ]
    },
    {
      id: "bureautique",
      title: "PC Bureautique",
      icon: <Briefcase className="h-6 w-6" />,
      color: "text-blue-500",
      bgColor: "bg-blue-500/10",
      description: "Pour le travail et le multitâche",
      price: "1 200 000 Ar - 2 500 000 Ar",
      features: [
        "Processeur économique (Intel i3/i5 ou AMD Ryzen 3/5)",
        "RAM 8GB à 16GB",
        "Stockage SSD 256GB à 512GB",
        "Connectique complète (USB, HDMI, Ethernet)"
      ]
    },
    {
      id: "workstation",
      title: "Station de travail",
      icon: <Cpu className="h-6 w-6" />,
      color: "text-green-500",
      bgColor: "bg-green-500/10",
      description: "Pour les pros (montage, 3D, data)",
      price: "5 000 000 Ar - 15 000 000 Ar",
      features: [
        "Processeur haut de gamme (Intel i9 / AMD Threadripper)",
        "RAM 32GB à 128GB ECC",
        "Stockage SSD NVMe + HDD",
        "Carte graphique professionnelle (RTX / Quadro)"
      ]
    }
  ];

  return (
    <section id="guides-achat" className="py-12 scroll-mt-20">
      <div className="container-x">
        <div className="flex items-center gap-3 mb-8">
          <ShoppingBag className="h-8 w-8 text-blue-500" />
          <h2 className="text-3xl font-bold">Guides d'achat</h2>
        </div>
        <p className="text-muted-foreground mb-8 max-w-3xl">
          Choisir son PC à Madagascar peut être complexe. Voici nos guides pour vous aider à faire le bon choix selon votre budget et vos besoins.
        </p>

        <div className="grid md:grid-cols-3 gap-6">
          {guides.map((guide) => (
            <div key={guide.id} className={`border-l-4 border-blue-500 bg-secondary/20 rounded-r-lg p-6 hover:shadow-lg transition-shadow`}>
              <div className={`inline-flex p-2 rounded-lg ${guide.bgColor} ${guide.color} mb-4`}>
                {guide.icon}
              </div>
              <h3 className="text-xl font-bold mb-2">{guide.title}</h3>
              <p className="text-sm text-muted-foreground mb-3">{guide.description}</p>
              <p className="text-lg font-bold text-primary mb-3">{guide.price}</p>
              <div className="space-y-2 mb-4">
                {guide.features.map((feature, idx) => (
                  <div key={idx} className="flex items-center gap-2 text-sm">
                    <CheckCircle className="h-3 w-3 text-green-500" />
                    <span>{feature}</span>
                  </div>
                ))}
              </div>
              <Link to="/configurateur" className="inline-flex items-center gap-2 text-sm font-medium text-blue-500 hover:underline">
                Configurer mon PC <ArrowRight className="h-3 w-3" />
              </Link>
            </div>
          ))}
        </div>

        {/* Conseil bonus */}
        <div className="mt-8 bg-amber-50 dark:bg-amber-950/20 border border-amber-500/30 rounded-lg p-4">
          <p className="text-sm flex items-center gap-2">
            <Zap className="h-4 w-4 text-amber-500" />
            <strong>Conseil Casanier :</strong> Pour Madagascar, privilégiez les composants avec garantie internationale et un bon service après-vente local !
          </p>
        </div>
      </div>
    </section>
  );
};