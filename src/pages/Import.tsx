import { useLocation } from "react-router-dom";
import { useEffect, useState } from "react";
import { Package, Truck, Clock, Shield, CheckCircle, Plus, Send, Plane, Ship } from "lucide-react";
import { Link } from "react-router-dom";
import { SiteLayout } from "@/components/site/SiteLayout";
import { MiniHero } from "@/components/layout/MiniHero";

const Importation = () => {
  const location = useLocation();
  
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    document.title = "Importation — Les Casaniers Madagascar";
    const meta = document.querySelector('meta[name="description"]') ?? document.head.appendChild(
      Object.assign(document.createElement("meta"), { name: "description" })
    );
    meta.setAttribute(
      "content",
      "Commande de pièces détachées, suivi commande, délais d'importation et normes européennes."
    );
  }, []);

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, [location.pathname]);

  const sections = [
    {
      id: "commande-pieces",
      title: "Commande de pièces détachées",
      icon: <Package className="h-6 w-6" />,
      color: "text-blue-500",
      bgColor: "bg-blue-500/10",
      borderColor: "border-blue-500",
      description: "Commandez vos pièces détachées directement depuis la Chine.",
      content: {
        intro: "Les importations des pièces détachées viennent de Chine. Nous pouvons trouver toutes les appareils électroniques que vous voulez.",
        points: [
          "Accès direct aux fournisseurs chinois",
          "Large choix de composants : CPU, GPU, RAM, cartes mères, alimentations, etc.",
          "Tous types d'appareils électroniques disponibles sur demande",
          "Pièces rares ou en rupture de stock à Madagascar",
          "Livraison sécurisée à Tananarive"
        ],
        process: [
          { step: "1", title: "Demande", desc: "Contactez-nous avec la référence" },
          { step: "2", title: "Devis", desc: "Sous 48h" },
          { step: "3", title: "Commande", desc: "Confirmation" },
          { step: "4", title: "Importation", desc: "Expédition" },
          { step: "5", title: "Livraison", desc: "À domicile" }
        ]
      }
    },
    {
      id: "suivi-commande",
      title: "Suivi commande",
      icon: <Truck className="h-6 w-6" />,
      color: "text-green-500",
      bgColor: "bg-green-500/10",
      borderColor: "border-green-500",
      description: "Suivez votre commande en temps réel.",
      content: {
        intro: "Un suivi transparent pour toutes vos commandes :",
        points: [
          "Numéro de suivi unique pour chaque commande",
          "Notifications par email et SMS à chaque étape",
          "Suivi en temps réel sur notre plateforme",
          "Statut mis à jour : commande confirmée, expédiée, arrivée, prête",
          "Support client disponible pour toute question"
        ],
        steps: [
          { status: "Confirmée", color: "text-green-500" },
          { status: "Préparation", color: "text-blue-500" },
          { status: "Expédié", color: "text-purple-500" },
          { status: "Arrivée", color: "text-amber-500" },
          { status: "Prête", color: "text-green-500" }
        ]
      }
    },
    {
      id: "delais-importation",
      title: "Délais et conditions",
      icon: <Clock className="h-6 w-6" />,
      color: "text-amber-500",
      bgColor: "bg-amber-500/10",
      borderColor: "border-amber-500",
      description: "Tout savoir sur les délais et modes d'expédition.",
      content: {
        intro: "Deux modes d'expédition sont disponibles selon vos besoins :",
        points: [
          "✈️ Expédition par AVION : Paiement de 50% de la marchandise avant envoi",
          "🚢 Expédition par BATEAU : Paiement de 60% de la marchandise avant envoi",
          "Commande passée : 24-48h pour la confirmation",
          "Dédouanement inclus dans nos services",
          "Livraison finale : 24-48h sur Tananarive"
        ],
        transportModes: [
          { mode: "Avion", prepayment: "50%", duration: "2 à 3 semaines", icon: <Plane className="h-5 w-5" /> },
          { mode: "Bateau", prepayment: "60%", duration: "2 à 3 mois", icon: <Ship className="h-5 w-5" /> }
        ],
        note: "Les délais sont donnés à titre indicatif et peuvent varier selon les périodes"
      }
    }
  ];

  return (
    <SiteLayout>
      <MiniHero
        title="Importation Chine - Madagascar."
        description="Importation de pièces détachées et appareils électroniques depuis la Chine. Tous vos équipements sur mesure, livrés à Tananarive."
        bg="7.png"
      />

      <section className="py-16 lg:py-24">
        <div className="container-x">
          <div className="max-w-6xl mx-auto space-y-12 lg:space-y-16">
            {sections.map((section) => (
              <div
                key={section.id}
                id={section.id}
                className="group scroll-mt-20"
              >
                {/* Header simplifié */}
                <div className="flex items-center gap-3 mb-8">
                  <div className={`p-2 rounded-lg ${section.bgColor} ${section.color}`}>
                    {section.icon}
                  </div>
                  <div>
                    <h2 className={`text-xl lg:text-2xl font-semibold ${section.color}`}>
                      {section.title}
                    </h2>
                    <p className="text-sm text-muted-foreground">{section.description}</p>
                  </div>
                </div>

                {/* Carte principale */}
                <div className={`bg-secondary/5 rounded-2xl border ${section.borderColor} border-opacity-30 overflow-hidden`}>
                  <div className="p-6 lg:p-8">
                    {/* Intro */}
                    <p className="text-muted-foreground mb-6">{section.content.intro}</p>

                    {/* Points clés - grille simple */}
                    <div className="grid sm:grid-cols-2 gap-3 mb-8">
                      {section.content.points.map((point, idx) => (
                        <div key={idx} className="flex items-start gap-2 text-sm">
                          <CheckCircle className={`h-4 w-4 ${section.color} shrink-0 mt-0.5`} />
                          <span className="text-muted-foreground">{point}</span>
                        </div>
                      ))}
                    </div>

                    {/* Process - pour commande */}
                    {section.content.process && (
                      <div className="border-t border-border pt-6">
                        <div className="grid grid-cols-5 gap-2">
                          {section.content.process.map((step) => (
                            <div key={step.step} className="text-center">
                              <div className={`w-7 h-7 mx-auto rounded-full ${section.bgColor} ${section.color} flex items-center justify-center text-sm font-medium mb-2`}>
                                {step.step}
                              </div>
                              <p className="text-xs font-medium">{step.title}</p>
                              <p className="text-[11px] text-muted-foreground">{step.desc}</p>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Steps - pour suivi */}
                    {section.content.steps && (
                      <div className="border-t border-border pt-6">
                        <div className="flex items-center justify-between gap-1">
                          {section.content.steps.map((step, idx) => (
                            <div key={idx} className="flex-1 text-center">
                              <div className={`w-1.5 h-1.5 mx-auto rounded-full ${step.color.replace('text', 'bg')} mb-2 opacity-60`} />
                              <p className={`text-[11px] font-medium ${step.color}`}>{step.status}</p>
                              {idx < section.content.steps.length - 1 && (
                                <div className="hidden lg:block text-muted-foreground/30 text-xs mt-1">→</div>
                              )}
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Transport modes - pour délais */}
                    {section.content.transportModes && (
                      <div className="border-t border-border pt-6">
                        <div className="grid sm:grid-cols-2 gap-4">
                          {section.content.transportModes.map((mode, idx) => (
                            <div key={idx} className={`flex items-center gap-4 p-4 rounded-xl ${section.bgColor}`}>
                              <div className={`p-2 rounded-full bg-white/10 ${section.color}`}>
                                {mode.icon}
                              </div>
                              <div>
                                <p className={`font-semibold ${section.color}`}>{mode.mode}</p>
                                <div className="flex gap-3 text-xs mt-1">
                                  <span>Acompte: <span className="font-medium">{mode.prepayment}</span></span>
                                  <span className="text-muted-foreground">Délai: {mode.duration}</span>
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                        <p className="text-xs text-muted-foreground text-center mt-4">{section.content.note}</p>
                      </div>
                    )}
                  </div>

                  {/* Footer avec CTA */}
                  <div className="border-t border-border bg-secondary/10 px-6 lg:px-8 py-4">
                    <Link
                      to="/devis-express"
                      className={`inline-flex items-center gap-2 text-sm font-medium ${section.color} hover:opacity-80 transition-opacity`}
                    >
                      <Send className="h-3.5 w-3.5" />
                      Contactez-nous
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </SiteLayout>
  );
};

export default Importation;