import { Link } from "react-router-dom";
import { ArrowRight, Building2, Clock, Headphones, PackageCheck, Shield, Truck, Wrench, Zap, MapPin, Phone, Mail, Users, Award, Briefcase } from "lucide-react";

const ServicesSection = () => {
  const services = [
    {
      id: "showroom",
      title: "Showroom & Atelier",
      description: "Visitez notre showroom à Tananarive pour découvrir et tester nos PC sur mesure avant achat.",
      icon: Building2,
      color: "from-purple-500 to-indigo-500",
      details: "Accueil sur rendez-vous • Espace de démonstration • Conseil personnalisé",
    },
    {
      id: "conseil",
      title: "Accompagnement & Conseil",
      description: "Un expert vous guide du choix des composants à la configuration finale, selon votre usage.",
      icon: Users,
      color: "from-blue-500 to-cyan-500",
      details: "Profil professionnel ou gaming • Configuration adaptée à votre budget • Assistance technique",
    },
    {
      id: "sav",
      title: "SAV Prioritaire",
      description: "Support technique dédié et réparation rapide pour minimiser vos temps d'arrêt.",
      icon: Headphones,
      color: "from-green-500 to-emerald-500",
      details: "Garantie 24 mois • Hotline prioritaire • Pièces de rechange disponibles",
    },
    {
      id: "import",
      title: "Importation Directe UE",
      description: "Accès aux dernières normes européennes de fiabilité et aux composants introuvables à Madagascar.",
      icon: PackageCheck,
      color: "from-amber-500 to-orange-500",
      details: "Sourcing Europe • Conformité CE • Délais maîtrisés • Tarifs transparents",
    },
    {
      id: "audit",
      title: "Audit de Parc",
      description: "Analyse complète de votre infrastructure informatique pour optimiser performances et coûts.",
      icon: Briefcase,
      color: "from-red-500 to-rose-500",
      details: "Diagnostic sur site • Recommandations • Plan d’amélioration • Devis sur mesure",
    },
    {
      id: "livraison",
      title: "Livraison Madagascar",
      description: "Nous livrons votre configuration partout dans la Grande Île, en toute sécurité.",
      icon: Truck,
      color: "from-teal-500 to-cyan-500",
      details: "Emballage renforcé • Transport assuré • Suivi de livraison • Installation possible",
    },
  ];

  const engagements = [
    { label: "Garantie 24 mois", icon: Shield },
    { label: "Importation Europe", icon: Award },
    { label: "SAV Prioritaire", icon: Clock },
    { label: "Conseil & Allié", icon: Zap },
  ];

  return (
    <section className="py-8">
      {/* Hero interne Services */}
      <div className="mb-8 text-center">
        <div className="inline-flex h-12 w-12 rounded-2xl bg-gradient-to-br from-primary/20 to-primary/5 items-center justify-center mb-3">
          <Wrench className="h-6 w-6 text-primary" />
        </div>
        <h1 className="text-2xl font-bold mb-2">Nos Services</h1>
        <p className="text-sm text-muted-foreground max-w-2xl mx-auto">
          Bien plus qu’un simple vendeur de PC. Nous vous accompagnons à chaque étape,<br />
          du choix à l’installation, avec un service pensé pour Madagascar.
        </p>
      </div>

      {/* Grille des services */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {services.map((service) => {
          const Icon = service.icon;
          return (
            <div
              key={service.id}
              className="group bg-card border border-border/50 rounded-xl overflow-hidden hover:shadow-lg hover:-translate-y-1 transition-all duration-300"
            >
              <div className={`h-1 w-full bg-gradient-to-r ${service.color}`} />
              <div className="p-5">
                <div className={`inline-flex h-10 w-10 rounded-lg bg-gradient-to-br ${service.color} items-center justify-center mb-3`}>
                  <Icon className="h-5 w-5 text-white" />
                </div>
                <h3 className="text-lg font-bold mb-1">{service.title}</h3>
                <p className="text-xs text-muted-foreground mb-3 leading-relaxed">
                  {service.description}
                </p>
                <div className="text-[10px] text-muted-foreground border-t border-border/50 pt-3 mt-1">
                  <p className="leading-relaxed">{service.details}</p>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Bloc des engagements */}
      <div className="mt-10 bg-gradient-to-br from-primary/5 to-transparent border border-primary/10 rounded-xl p-5">
        <div className="flex flex-wrap justify-center gap-6">
          {engagements.map((item, idx) => {
            const Icon = item.icon;
            return (
              <div key={idx} className="flex items-center gap-2">
                <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center">
                  <Icon className="h-4 w-4 text-primary" />
                </div>
                    <span className="text-xs font-medium">{item.label}</span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Call to Action vers Showroom */}
      <div className="mt-8 bg-card border border-border/50 rounded-xl p-5 text-center">
        <h3 className="text-md font-bold mb-2 flex items-center justify-center gap-2">
          <MapPin className="h-4 w-4 text-primary" />
          Besoin d’un conseil personnalisé ?
        </h3>
        <p className="text-[10px] text-muted-foreground mb-3">
          Notre showroom à Tananarive vous accueille sur rendez-vous.
        </p>
        <div className="flex flex-wrap justify-center gap-3">
          <Link
            to="/contact"
            className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-primary text-xs font-medium text-primary-foreground rounded-lg hover:-translate-y-0.5 transition-all"
          >
            <Phone className="h-3 w-3" /> Nous appeler
          </Link>
          <Link
            to="/contact"
            className="inline-flex items-center gap-1.5 px-3 py-1.5 border border-border text-xs font-medium rounded-lg hover:bg-secondary transition-all"
          >
            <Mail className="h-3 w-3" /> Écrire
          </Link>
        </div>
      </div>
    </section>
  );
};

export default ServicesSection;