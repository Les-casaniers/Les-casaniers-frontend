import { useState } from "react";
import { AlertTriangle, CheckCircle, XCircle, Sparkles, ChevronLeft, ChevronRight, MessageCircle } from "lucide-react";
import mascot from "@/assets/casaniers-mascot.png";

const alertes = [
  {
    type: "warning",
    message: "⚠️ Attention : La carte mère choisie n'est pas compatible avec ce processeur !",
    icon: <AlertTriangle className="h-4 w-4 text-amber-500" />,
    solution: "Changer la carte mère vers un modèle Z790/B760",
    resolved: false
  },
  {
    type: "warning",
    message: "⚠️ Le boîtier est trop petit pour cette carte graphique (RTX 4090)",
    icon: <AlertTriangle className="h-4 w-4 text-amber-500" />,
    solution: "Choisir un boîtier moyen tour ou full tower",
    resolved: false
  },
  {
    type: "success",
    message: "✅ Alimentation suffisante pour tous les composants (850W Gold)",
    icon: <CheckCircle className="h-4 w-4 text-green-500" />,
    solution: "",
    resolved: true
  },
  {
    type: "info",
    message: "💡 Conseil : Ajoute un watercooling 360mm pour ce processeur",
    icon: <MessageCircle className="h-4 w-4 text-blue-500" />,
    solution: "Kit AIO Corsair H150i ou équivalent",
    resolved: false
  }
];

export const Etape3Mascottes = () => {
  const [resolvedAlerts, setResolvedAlerts] = useState<boolean[]>([]);

  return (
    <section id="etape3" className="py-12 scroll-mt-20">
      <div className="container-x">
        {/* En-tête */}
        <div className="text-center mb-10">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-gradient-to-r from-amber-500/20 to-orange-500/20 border border-amber-500/50 rounded-full mb-4">
            <Sparkles className="h-4 w-4 text-amber-500" />
            <span className="text-xs font-bold uppercase tracking-widest text-amber-600 dark:text-amber-400">
              Étape 3
            </span>
          </div>
          <h2 className="text-3xl md:text-4xl font-bold mb-3">
            L'Intervention des <span className="text-amber-500">Mascottes</span>
          </h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            🐧 <strong>Le Fosa et Casio veillent sur ta config !</strong> Ils détectent les incompatibilités.
          </p>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Mascotte */}
          <div className="text-center">
            <div className="bg-gradient-to-br from-amber-500/10 to-orange-500/5 rounded-2xl p-6 border border-amber-500/30">
              <img src={mascot} alt="Casio" className="h-48 w-auto mx-auto mb-3" />
              <div className="bg-amber-100 dark:bg-amber-900/30 rounded-lg p-3">
                <p className="text-sm italic">
                  "🐧 Hé hé ! Laisse-moi vérifier ta config mon frère..."
                </p>
              </div>
            </div>
          </div>

          {/* Alertes */}
          <div className="lg:col-span-2">
            <div className="space-y-3">
              <h3 className="font-bold mb-3">📢 Messages d'alerte :</h3>
              {alertes.map((alerte, idx) => (
                <div
                  key={idx}
                  className={`border rounded-lg p-4 transition ${
                    alerte.type === "warning"
                      ? "border-amber-500/50 bg-amber-50 dark:bg-amber-950/20"
                      : alerte.type === "success"
                      ? "border-green-500/50 bg-green-50 dark:bg-green-950/20"
                      : "border-blue-500/50 bg-blue-50 dark:bg-blue-950/20"
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <div className="mt-0.5">{alerte.icon}</div>
                    <div className="flex-1">
                      <p className="text-sm">{alerte.message}</p>
                      {alerte.solution && (
                        <p className="text-xs text-muted-foreground mt-1">
                          🔧 Solution : {alerte.solution}
                        </p>
                      )}
                      {alerte.type === "warning" && (
                        <button className="text-xs mt-2 px-2 py-1 bg-amber-500/20 rounded text-amber-600 dark:text-amber-400 hover:bg-amber-500/30 transition">
                          Appliquer la correction
                        </button>
                      )}
                    </div>
                    {alerte.type === "warning" && (
                      <div className="text-amber-500">
                        <AlertTriangle className="h-5 w-5" />
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>

            {/* Message de validation */}
            <div className="mt-6 bg-gradient-to-r from-green-500/10 to-emerald-500/5 border border-green-500/30 rounded-lg p-4 text-center">
              <CheckCircle className="h-5 w-5 text-green-500 mx-auto mb-2" />
              <p className="text-sm">
                ✅ Une fois toutes les alertes résolues, ta config est prête !
              </p>
            </div>
          </div>
        </div>

        {/* Navigation */}
        <div className="flex justify-between mt-8">
          <a
            href="#etape2"
            className="inline-flex items-center gap-2 px-6 py-2 border border-border rounded-lg hover:bg-secondary transition"
          >
            <ChevronLeft className="h-4 w-4" /> Étape précédente
          </a>
          <a
            href="#etape4"
            className="inline-flex items-center gap-2 px-6 py-2 bg-gradient-to-r from-amber-500 to-orange-500 text-black font-bold rounded-lg hover:from-amber-600 hover:to-orange-600 transition"
          >
            Étape suivante <ChevronRight className="h-4 w-4" />
          </a>
        </div>
      </div>
    </section>
  );
};
