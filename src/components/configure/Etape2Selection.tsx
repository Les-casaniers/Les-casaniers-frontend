import { useState } from "react";
import { Cpu, Gamepad, MemoryStick, HardDrive, CircuitBoard, Sparkles, ChevronLeft, ChevronRight, CheckCircle } from "lucide-react";

const composantsPreSelectionnes = {
  "gaming-1080p": {
    cpu: "Intel Core i5-14600K / AMD Ryzen 5 7600X",
    gpu: "NVIDIA RTX 4060 Ti / AMD RX 7700 XT",
    ram: "16GB DDR5 6000MHz",
    storage: "1TB NVMe SSD",
    motherboard: "B760 / B650"
  },
  "gaming-4k": {
    cpu: "Intel Core i9-14900K / AMD Ryzen 7 7800X3D",
    gpu: "NVIDIA RTX 4080 / 4090",
    ram: "32GB DDR5 6400MHz",
    storage: "2TB NVMe SSD",
    motherboard: "Z790 / X670"
  },
  "montage-video": {
    cpu: "Intel Core i9-14900K / AMD Ryzen 9 7950X",
    gpu: "NVIDIA RTX 4080 / 4090",
    ram: "64GB DDR5 5600MHz",
    storage: "2TB NVMe SSD + 4TB HDD",
    motherboard: "Z790 / X670"
  },
  "analyse-donnees": {
    cpu: "AMD Threadripper / Intel Xeon",
    gpu: "NVIDIA RTX 4090 / A6000",
    ram: "128GB DDR5 ECC",
    storage: "2TB NVMe SSD + 8TB HDD",
    motherboard: "TRX50 / W790"
  },
  "bureautique": {
    cpu: "Intel Core i5-14400 / AMD Ryzen 5 5600G",
    gpu: "Graphiques intégrés",
    ram: "16GB DDR4/DDR5",
    storage: "512GB SSD",
    motherboard: "B760 / A620"
  }
};

export const Etape2Selection = () => {
  const [selectedProfil] = useState<string>("gaming-1080p");
  const composants = composantsPreSelectionnes[selectedProfil as keyof typeof composantsPreSelectionnes];

  const categories = [
    { name: "Processeur (CPU)", icon: <Cpu className="h-5 w-5" />, value: composants.cpu, color: "text-purple-500" },
    { name: "Carte graphique (GPU)", icon: <Gamepad className="h-5 w-5" />, value: composants.gpu, color: "text-green-500" },
    { name: "Mémoire (RAM)", icon: <MemoryStick className="h-5 w-5" />, value: composants.ram, color: "text-blue-500" },
    { name: "Stockage", icon: <HardDrive className="h-5 w-5" />, value: composants.storage, color: "text-amber-500" },
    { name: "Carte mère", icon: <CircuitBoard className="h-5 w-5" />, value: composants.motherboard, color: "text-red-500" }
  ];

  return (
    <section id="etape2" className="py-12 bg-secondary/30 scroll-mt-20">
      <div className="container-x">
        {/* En-tête */}
        <div className="text-center mb-10">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-gradient-to-r from-amber-500/20 to-orange-500/20 border border-amber-500/50 rounded-full mb-4">
            <Sparkles className="h-4 w-4 text-amber-500" />
            <span className="text-xs font-bold uppercase tracking-widest text-amber-600 dark:text-amber-400">
              Étape 2
            </span>
          </div>
          <h2 className="text-3xl md:text-4xl font-bold mb-3">
            La <span className="text-amber-500">Sélection Assistée</span>
          </h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            🐧 <strong>Le Fosa dit :</strong> "Voici les composants compatibles pour ton profil !"
          </p>
        </div>

        {/* Composants pré-sélectionnés */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4 max-w-3xl mx-auto">
          {categories.map((cat, idx) => (
            <div key={idx} className="border border-border rounded-lg p-4 bg-background hover:shadow-lg transition">
              <div className="flex items-center gap-2 mb-2">
                <div className={cat.color}>{cat.icon}</div>
                <h3 className="font-bold text-sm">{cat.name}</h3>
              </div>
              <p className="text-sm">{cat.value}</p>
              <div className="flex items-center gap-1 mt-2 text-[10px] text-green-500">
                <CheckCircle className="h-3 w-3" />
                <span>Compatible</span>
              </div>
            </div>
          ))}
        </div>

        {/* Message */}
        <div className="bg-green-50 dark:bg-green-950/20 border border-green-500/30 rounded-lg p-4 text-center mt-6">
          <p className="text-sm">
            ✅ Ces composants sont automatiquement sélectionnés selon ton profil.
            Tu peux les modifier manuellement si besoin.
          </p>
        </div>

        {/* Navigation */}
        <div className="flex justify-between mt-6">
          <a
            href="#etape1"
            className="inline-flex items-center gap-2 px-6 py-2 border border-border rounded-lg hover:bg-secondary transition"
          >
            <ChevronLeft className="h-4 w-4" /> Étape précédente
          </a>
          <a
            href="#etape3"
            className="inline-flex items-center gap-2 px-6 py-2 bg-gradient-to-r from-amber-500 to-orange-500 text-black font-bold rounded-lg hover:from-amber-600 hover:to-orange-600 transition"
          >
            Étape suivante <ChevronRight className="h-4 w-4" />
          </a>
        </div>
      </div>
    </section>
  );
};