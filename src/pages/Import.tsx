import { useLocation } from "react-router-dom";
import { useEffect } from "react";
import { Package, Truck, Clock, Shield, Search, FileText, Globe, CheckCircle, ArrowRight, Plus } from "lucide-react";
import { Link } from "react-router-dom";
import { SiteLayout } from "@/components/site/SiteLayout";
import { MiniHero } from "@/components/layout/MiniHero";

const Importation = () => {
  const location = useLocation();

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
      icon: <Package className="h-8 w-8" />,
      color: "text-blue-500",
      bgColor: "bg-blue-500/10",
      borderColor: "border-blue-500",
      description: "Commandez vos pièces détachées directement depuis l'Europe.",
      content: {
        intro: "Nous vous proposons un service de commande de pièces détachées sur mesure :",
        points: [
          "Accès direct aux fournisseurs européens (France, Allemagne, Pays-Bas)",
          "Large choix de composants : CPU, GPU, RAM, cartes mères, alimentations, etc.",
          "Pièces rares ou en rupture de stock à Madagascar",
          "Garantie constructeur conservée",
          "Livraison sécurisée à Tananarive"
        ],
        process: [
          { step: "1", title: "Demande", desc: "Contactez-nous avec la référence de la pièce" },
          { step: "2", title: "Devis", desc: "Recevez un devis sous 48h" },
          { step: "3", title: "Commande", desc: "Confirmation et paiement" },
          { step: "4", title: "Importation", desc: "Délai de 2-3 semaines" },
          { step: "5", title: "Livraison", desc: "Retrait ou livraison à domicile" }
        ]
      }
    },
    {
      id: "suivi-commande",
      title: "Suivi commande",
      icon: <Truck className="h-8 w-8" />,
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
          { status: "Commande confirmée", icon: "", color: "text-green-500" },
          { status: "Préparation en Europe", icon: "", color: "text-blue-500" },
          { status: "Expédié", icon: "", color: "text-purple-500" },
          { status: "Arrivé à Madagascar", icon: "", color: "text-amber-500" },
          { status: "Prêt pour retrait/livraison", icon: "", color: "text-green-500" }
        ]
      }
    },
    {
      id: "delais-importation",
      title: "Délais d'importation",
      icon: <Clock className="h-8 w-8" />,
      color: "text-amber-500",
      bgColor: "bg-amber-500/10",
      borderColor: "border-amber-500",
      description: "Tout savoir sur les délais de livraison.",
      content: {
        intro: "Nos délais sont transparents et respectés :",
        points: [
          "Commande passée : 24-48h pour la confirmation",
          "Préparation en Europe : 3-5 jours ouvrés",
          "Transport (Europe - Madagascar) : 10-14 jours ouvrés",
          "Dédouanement : 3-5 jours ouvrés",
          "Livraison finale : 24-48h sur Tananarive"
        ],
        total: "Délai total estimé : 3 à 4 semaines",
        note: "Ces délais sont donnés à titre indicatif et peuvent varier selon les périodes (fêtes, grèves, etc.)"
      }
    },
    {
      id: "normes-europeennes",
      title: "Normes européennes",
      icon: <Shield className="h-8 w-8" />,
      color: "text-purple-500",
      bgColor: "bg-purple-500/10",
      borderColor: "border-purple-500",
      description: "Des composants aux normes CE les plus strictes.",
      content: {
        intro: "Nous importons uniquement des composants conformes aux normes :",
        points: [
          "Certification CE (Conformité Européenne)",
          "Normes RoHS (sans substances dangereuses)",
          "Composants neufs sous garantie constructeur",
          "Emballage d'origine certifié",
          "Traçabilité complète des produits",
          "Conformité aux standards de sécurité électrique"
        ],
        garanties: [
          "Garantie constructeur 24 mois",
          "SAV local assuré",
          "Pièces de rechange disponibles",
          "Assistance technique incluse"
        ]
      }
    }
  ];

  return (
    <SiteLayout>
      {/* Hero */}
      <MiniHero
        title="Importation Europe - Madagascar."
        description="Accédez aux meilleurs composants européens avec nos services d'importation sur-mesure. Transparence, qualité et rapidité."
        bg="7.png"
      />

      {/* Sections */}
      <section className="py-16">
        <div className="container-x">
          <div className="space-y-16">
            {sections.map((section) => (
              <div
                key={section.id}
                id={section.id}
                className={`border-l-4 ${section.borderColor} bg-secondary/20 rounded-r-lg p-6 scroll-mt-20`}
              >
                {/* En-tête */}
                <div className="flex items-center gap-4 mb-6">
                  <div className={`p-3 rounded-full ${section.bgColor} ${section.color}`}>
                    {section.icon}
                  </div>
                  <div>
                    <h2 className={`text-2xl font-bold ${section.color}`}>
                      {section.title}
                    </h2>
                    <p className="text-sm text-muted-foreground">{section.description}</p>
                  </div>
                </div>

                {/* Contenu */}
                <div className="space-y-6">
                  <p className="text-muted-foreground">{section.content.intro}</p>

                  {/* Points clés */}
                  <div className="grid md:grid-cols-2 gap-4">
                    {section.content.points.map((point, idx) => (
                      <div key={idx} className="flex items-start gap-2">
                        <CheckCircle className={`h-4 w-4 mt-0.5 ${section.color}`} />
                        <span className="text-sm">{point}</span>
                      </div>
                    ))}
                  </div>

                  {/* Process (pour commande) */}
                  {section.content.process && (
                    <div className="mt-6">
                      <h3 className="font-bold mb-3">Processus de commande :</h3>
                      <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
                        {section.content.process.map((step) => (
                          <div key={step.step} className="text-center">
                            <div className={`w-8 h-8 mx-auto rounded-full ${section.bgColor} ${section.color} flex items-center justify-center font-bold mb-2`}>
                              {step.step}
                            </div>
                            <p className="font-medium text-xs">{step.title}</p>
                            <p className="text-[10px] text-muted-foreground">{step.desc}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Steps (pour suivi) */}
                  {section.content.steps && (
                    <div className="mt-6">
                      <div className="flex flex-wrap justify-between gap-2">
                        {section.content.steps.map((step, idx) => (
                          <div key={idx} className="text-center flex-1 min-w-[80px]">
                            <div className="text-2xl mb-1">{step.icon}</div>
                            <p className={`text-[10px] font-medium ${step.color}`}>{step.status}</p>
                            {idx < section.content.steps.length - 1 && (
                              <div className="hidden md:block text-muted-foreground mt-1">-</div>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Total délai */}
                  {section.content.total && (
                    <div className={`mt-4 p-4 rounded-lg ${section.bgColor}`}>
                      <p className={`font-bold text-center ${section.color}`}>{section.content.total}</p>
                      <p className="text-xs text-muted-foreground text-center mt-1">{section.content.note}</p>
                    </div>
                  )}

                  {/* Garanties */}
                  {section.content.garanties && (
                    <div className="mt-6">
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                        {section.content.garanties.map((garantie, idx) => (
                          <div key={idx} className={`text-center p-2 rounded-lg ${section.bgColor}`}>
                            <CheckCircle className={`h-4 w-4 mx-auto mb-1 ${section.color}`} />
                            <span className="text-[10px]">{garantie}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                {/* Bouton CTA */}
                <div className="mt-6 pt-4 border-t border-border">
                  <Link
                    to="/devis-express"
                    className={`inline-flex items-center gap-2 text-sm font-medium ${section.color} hover:underline`}
                  >
                    En savoir plus <Plus className="h-3 w-3" />
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Bandeau contact */}
      <section className="py-12 bg-gradient-to-r from-blue-500/10 to-cyan-500/5 border-t border-border">
        <div className="container-x text-center">
          <h2 className="text-2xl font-bold mb-2">Besoin d'importer des composants ?</h2>
          <p className="text-muted-foreground mb-4">Contactez-nous pour un devis personnalisé</p>
          <div className="flex gap-3 justify-center">
            <Link
              to="/devis-express"
              className="px-6 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition"
            >
              Demander un devis
            </Link>
            <a
              href="https://wa.me/261341234567"
              target="_blank"
              rel="noopener noreferrer"
              className="px-6 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition"
            >
              Contact WhatsApp
            </a>
          </div>
        </div>
      </section>
    </SiteLayout>
  );
};

export default Importation;