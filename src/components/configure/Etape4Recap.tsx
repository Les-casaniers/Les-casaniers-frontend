import { Cpu, Gamepad, MemoryStick, HardDrive, CircuitBoard, Zap, Sparkles, ChevronLeft, CheckCircle, ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";

const configRecap = {
  profil: "Gaming 1080p",
  prix: "1 799 000 Ar",
  composants: [
    { name: "Processeur", value: "Intel Core i5-14600K", icon: <Cpu className="h-4 w-4" />, price: "349 000 Ar" },
    { name: "Carte graphique", value: "NVIDIA RTX 4060 Ti", icon: <Gamepad className="h-4 w-4" />, price: "599 000 Ar" },
    { name: "RAM", value: "16GB DDR5 6000MHz", icon: <MemoryStick className="h-4 w-4" />, price: "99 000 Ar" },
    { name: "Stockage", value: "1TB NVMe SSD", icon: <HardDrive className="h-4 w-4" />, price: "79 000 Ar" },
    { name: "Carte mère", value: "MSI B760 Tomahawk", icon: <CircuitBoard className="h-4 w-4" />, price: "199 000 Ar" },
    { name: "Alimentation", value: "650W Gold", icon: <Zap className="h-4 w-4" />, price: "89 000 Ar" },
    { name: "Boîtier", value: "Mid-Tower RGB", icon: <Zap className="h-4 w-4" />, price: "85 000 Ar" }
  ]
};

export const Etape4Recap = () => {
  return (
    <section id="etape4" className="py-12 scroll-mt-20">
      <div className="container-x">
        {/* En-tête */}
        <div className="text-center mb-10">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-gradient-to-r from-amber-500/20 to-orange-500/20 border border-amber-500/50 rounded-full mb-4">
            <Sparkles className="h-4 w-4 text-amber-500" />
            <span className="text-xs font-bold uppercase tracking-widest text-amber-600 dark:text-amber-400">
              Étape 4 - Final
            </span>
          </div>
          <h2 className="text-3xl md:text-4xl font-bold mb-3">
            Le <span className="text-amber-500">Récapitulatif Épique</span>
          </h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            🎉 <strong>Félicitations !</strong> Voici ta configuration personnalisée.
          </p>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Liste des composants */}
          <div className="lg:col-span-2">
            <div className="border border-border rounded-xl overflow-hidden">
              <div className="bg-gradient-to-r from-amber-500/10 to-orange-500/10 p-4 border-b border-border">
                <h3 className="font-bold flex items-center gap-2">
                  <CheckCircle className="h-5 w-5 text-green-500" />
                  Ta configuration sur-mesure
                </h3>
              </div>
              <div className="divide-y divide-border">
                {configRecap.composants.map((comp, idx) => (
                  <div key={idx} className="flex justify-between items-center p-4 hover:bg-secondary/30 transition">
                    <div className="flex items-center gap-3">
                      <div className="text-muted-foreground">{comp.icon}</div>
                      <div>
                        <p className="font-medium text-sm">{comp.name}</p>
                        <p className="text-xs text-muted-foreground">{comp.value}</p>
                      </div>
                    </div>
                    <p className="font-bold text-sm">{comp.price}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Résumé et actions */}
          <div className="space-y-4">
            <div className="bg-gradient-to-r from-amber-500/10 to-orange-500/10 border border-amber-500/30 rounded-xl p-6 text-center">
              <p className="text-sm text-muted-foreground">Profil choisi</p>
              <p className="text-xl font-bold text-amber-500 mb-4">{configRecap.profil}</p>
              <div className="border-t border-amber-500/30 my-4" />
              <p className="text-sm text-muted-foreground">Prix total estimé</p>
              <p className="text-3xl font-bold text-green-600 dark:text-green-400">{configRecap.prix}</p>
              <div className="flex gap-2 mt-6">
                <Link
                  to="/configurateur"
                  className="flex-1 px-4 py-2 bg-gradient-to-r from-amber-500 to-orange-500 text-black font-bold rounded-lg hover:from-amber-600 hover:to-orange-600 transition flex items-center justify-center gap-2"
                >
                  Modifier <ArrowRight className="h-3 w-3" />
                </Link>
              </div>
            </div>

            <div className="border border-border rounded-xl p-4">
              <p className="text-xs text-muted-foreground text-center">
                ✅ Garantie 24 mois inclus<br />
                🚚 Livraison gratuite sur Tananarive<br />
                🔧 Assemblage par nos experts
              </p>
            </div>

            <Link
              to="/devis-express"
              className="w-full px-4 py-3 bg-green-600 text-white font-bold rounded-lg hover:bg-green-700 transition text-center flex items-center justify-center gap-2"
            >
              <CheckCircle className="h-4 w-4" />
              Valider et obtenir un devis
            </Link>
          </div>
        </div>

        {/* Navigation */}
        <div className="flex justify-between mt-8">
          <a
            href="#etape3"
            className="inline-flex items-center gap-2 px-6 py-2 border border-border rounded-lg hover:bg-secondary transition"
          >
            <ChevronLeft className="h-4 w-4" /> Étape précédente
          </a>
        </div>
      </div>
    </section>
  );
};