// pages/QuiSommesNous.tsx
import { useEffect, useState } from "react";
import { Users, Target, Shield, Heart, Award, Rocket, MapPin, Mail, Phone } from "lucide-react";
import { SiteLayout } from "@/components/site/SiteLayout";
import { MiniHero } from "@/components/layout/MiniHero";
import { Link } from "react-router-dom";

type SectionId = "mission" | "valeurs" | "equipe" | "engagement";

const ANCHORS: { label: string; id: SectionId; color: string; activeColor: string }[] = [
  { label: "Notre Mission", id: "mission", color: "text-blue-500 border-blue-500/30 hover:bg-blue-500/10", activeColor: "bg-blue-500/10 border-blue-500/60" },
  { label: "Nos Valeurs", id: "valeurs", color: "text-purple-500 border-purple-500/30 hover:bg-purple-500/10", activeColor: "bg-purple-500/10 border-purple-500/60" },
  { label: "Notre Équipe", id: "equipe", color: "text-amber-500 border-amber-500/30 hover:bg-amber-500/10", activeColor: "bg-amber-500/10 border-amber-500/60" },
  { label: "Nos Engagements", id: "engagement", color: "text-green-500 border-green-500/30 hover:bg-green-500/10", activeColor: "bg-green-500/10 border-green-500/60" },
];

const valeurs = [
  {
    icon: <Heart className="h-8 w-8" />,
    titre: "Passion",
    description: "Nous sommes avant tout des passionnés de technologie et de gaming. Chaque PC que nous assemblons est le reflet de notre amour pour l'innovation.",
    color: "text-red-500",
    bg: "bg-red-500/10"
  },
  {
    icon: <Target className="h-8 w-8" />,
    titre: "Excellence",
    description: "Nous ne faisons aucun compromis sur la qualité. Chaque composant est soigneusement sélectionné pour offrir les meilleures performances.",
    color: "text-blue-500",
    bg: "bg-blue-500/10"
  },
  {
    icon: <Shield className="h-8 w-8" />,
    titre: "Fiabilité",
    description: "24 mois de garantie, un service après-vente réactif et une assistance technique dédiée pour vous accompagner.",
    color: "text-green-500",
    bg: "bg-green-500/10"
  },
  {
    icon: <Award className="h-8 w-8" />,
    titre: "Innovation",
    description: "Nous restons constamment à l'affût des dernières technologies pour vous proposer des configurations toujours plus performantes.",
    color: "text-amber-500",
    bg: "bg-amber-500/10"
  },
];

const chiffresCles = [
  { valeur: "500+", label: "PC livrés", icon: <Rocket className="h-6 w-6" /> },
  { valeur: "24", label: "Mois de garantie", icon: <Shield className="h-6 w-6" /> },
  { valeur: "4.9/5", label: "Avis clients", icon: <Heart className="h-6 w-6" /> },
  { valeur: "15+", label: "Experts", icon: <Users className="h-6 w-6" /> },
];

const equipe = [
  {
    nom: "Rakoto Andrianina",
    role: "Fondateur & CEO",
    experience: "15 ans d'expérience",
    color: "blue",
  },
  {
    nom: "Rasoa Fara",
    role: "Lead Technicien",
    experience: "10 ans d'expérience",
    color: "purple",
  },
  {
    nom: "Rajaonary Mamy",
    role: "Expert Gaming",
    experience: "8 ans d'expérience",
    color: "amber",
  },
  {
    nom: "Ravelo Njaka",
    role: "Support Client",
    experience: "7 ans d'expérience",
    color: "green",
  },
];

// Composant MissionSection
const MissionSection = () => {
  return (
    <section className="py-16 md:py-24">
      <div className="container-x">
        <div className="grid md:grid-cols-2 gap-12 items-center">
          <div className="space-y-6">
            <div className="inline-flex items-center gap-2 bg-blue-500/10 rounded-full px-4 py-2 border border-blue-500/20">
              <Target className="h-4 w-4 text-blue-500" />
              <span className="text-blue-500 text-sm font-semibold">Notre mission</span>
            </div>
            <h2 className="text-4xl md:text-5xl font-bold leading-tight">
              Démocratiser l'accès aux PC haute performance
            </h2>
            <p className="text-gray-300 text-lg leading-relaxed">
              Depuis notre création, nous nous engageons à offrir des ordinateurs 
              puissants, fiables et accessibles à tous les passionnés de gaming 
              et professionnels créatifs à Madagascar.
            </p>
            <div className="flex gap-4 pt-4">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-blue-500" />
                <span className="text-gray-300">Depuis 2020</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-blue-500" />
                <span className="text-gray-300">Antananarivo, Madagascar</span>
              </div>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            {chiffresCles.map((stat, index) => (
              <div key={index} className="bg-gradient-to-br from-gray-800/50 to-gray-900/50 rounded-xl p-6 text-center border border-white/5 hover:border-blue-500/30 transition-all hover:scale-105">
                <div className="text-blue-500 mb-3 flex justify-center">{stat.icon}</div>
                <div className="text-3xl font-bold text-white mb-1">{stat.valeur}</div>
                <div className="text-gray-400 text-sm">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

// Composant ValeursSection
const ValeursSection = () => {
  return (
    <section className="py-16 md:py-24 bg-gradient-to-b from-gray-900/30 to-transparent">
      <div className="container-x">
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-2 bg-purple-500/10 rounded-full px-4 py-2 mb-4 border border-purple-500/20">
            <Award className="h-4 w-4 text-purple-500" />
            <span className="text-purple-500 text-sm font-semibold">Nos valeurs</span>
          </div>
          <h2 className="text-4xl md:text-5xl font-bold mb-4">Ce qui nous anime</h2>
          <p className="text-gray-400 text-lg max-w-2xl mx-auto">
            Des valeurs qui guident chacune de nos actions et décisions
          </p>
        </div>
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          {valeurs.map((valeur, index) => (
            <div key={index} className="group bg-white/5 rounded-xl p-6 text-center border border-white/10 hover:border-purple-500/30 transition-all hover:transform hover:-translate-y-2">
              <div className={`${valeur.bg} rounded-xl p-3 mb-4 inline-flex transition-all group-hover:scale-110`}>
                <div className={valeur.color}>{valeur.icon}</div>
              </div>
              <h3 className="text-xl font-bold mb-3">{valeur.titre}</h3>
              <p className="text-gray-400 text-sm leading-relaxed">
                {valeur.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

// Composant EquipeSection
const EquipeSection = () => {
  return (
    <section className="py-16 md:py-24">
      <div className="container-x">
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-2 bg-amber-500/10 rounded-full px-4 py-2 mb-4 border border-amber-500/20">
            <Users className="h-4 w-4 text-amber-500" />
            <span className="text-amber-500 text-sm font-semibold">Notre équipe</span>
          </div>
          <h2 className="text-4xl md:text-5xl font-bold mb-4">Des experts passionnés</h2>
          <p className="text-gray-400 text-lg max-w-2xl mx-auto">
            Une équipe dévouée à votre service, animée par la passion de la technologie
          </p>
        </div>
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          {equipe.map((membre, index) => (
            <div key={index} className="group bg-white/5 rounded-xl overflow-hidden border border-white/10 hover:border-amber-500/30 transition-all hover:transform hover:-translate-y-2">
              <div className="h-48 bg-gradient-to-br from-gray-700 to-gray-900 flex items-center justify-center relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
                <div className={`w-24 h-24 rounded-full bg-${membre.color}-500/20 flex items-center justify-center border-2 border-${membre.color}-500/50`}>
                  <span className={`text-${membre.color}-500 text-3xl font-bold`}>
                    {membre.nom.charAt(0)}{membre.nom.split(' ')[1]?.charAt(0)}
                  </span>
                </div>
              </div>
              <div className="p-5 text-center">
                <h3 className="text-lg font-bold mb-1">{membre.nom}</h3>
                <p className={`text-${membre.color}-500 text-sm font-semibold mb-2`}>{membre.role}</p>
                <p className="text-gray-500 text-xs">{membre.experience}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

// Composant EngagementSection
const EngagementSection = () => {
  return (
    <section className="py-16 md:py-24 bg-gradient-to-r from-blue-600/10 to-purple-600/10">
      <div className="container-x">
        <div className="grid md:grid-cols-2 gap-12 items-center">
          <div className="space-y-6">
            <div className="inline-flex items-center gap-2 bg-green-500/10 rounded-full px-4 py-2 border border-green-500/20">
              <Heart className="h-4 w-4 text-green-500" />
              <span className="text-green-500 text-sm font-semibold">Notre engagement</span>
            </div>
            <h2 className="text-3xl md:text-4xl font-bold">
              Votre satisfaction, notre priorité absolue
            </h2>
            <p className="text-gray-300 leading-relaxed">
              Nous nous engageons à vous offrir une expérience exceptionnelle, 
              de la configuration initiale jusqu'à l'assistance après-vente. 
              Chaque client est unique et mérite une attention particulière.
            </p>
            <ul className="space-y-3">
              {[
                "✓ Garantie 24 mois sur tous nos PC",
                "✓ Support technique réactif 7j/7",
                "✓ Livraison gratuite à Antananarivo",
                "✓ Configuration 100% personnalisable",
              ].map((item, i) => (
                <li key={i} className="flex items-center gap-2 text-gray-300">
                  <Shield className="h-4 w-4 text-green-500" />
                  {item}
                </li>
              ))}
            </ul>
          </div>
          <div className="bg-black/50 rounded-xl p-8 border border-white/10">
            <h3 className="text-2xl font-bold mb-6 text-center">Contactez-nous</h3>
            <div className="space-y-4">
              <div className="flex items-center gap-4 p-3 rounded-lg hover:bg-white/5 transition">
                <MapPin className="h-5 w-5 text-green-500" />
                <div>
                  <p className="text-sm text-gray-400">Adresse</p>
                  <p className="text-white">Antananarivo, Madagascar</p>
                </div>
              </div>
              <div className="flex items-center gap-4 p-3 rounded-lg hover:bg-white/5 transition">
                <Mail className="h-5 w-5 text-green-500" />
                <div>
                  <p className="text-sm text-gray-400">Email</p>
                  <p className="text-white">contact@pcsurmesure.mg</p>
                </div>
              </div>
              <div className="flex items-center gap-4 p-3 rounded-lg hover:bg-white/5 transition">
                <Phone className="h-5 w-5 text-green-500" />
                <div>
                  <p className="text-sm text-gray-400">Téléphone</p>
                  <p className="text-white">+261 34 12 345 67</p>
                </div>
              </div>
            </div>
            <Link 
              to="/contact"
              className="mt-6 w-full inline-flex justify-center items-center gap-2 bg-green-500 text-black px-6 py-3 rounded-lg font-semibold hover:bg-green-400 transition-colors"
            >
              Nous contacter
              <Mail className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
};

const SECTIONS: { id: SectionId; component: React.ReactNode }[] = [
  { id: "mission", component: <MissionSection /> },
  { id: "valeurs", component: <ValeursSection /> },
  { id: "equipe", component: <EquipeSection /> },
  { id: "engagement", component: <EngagementSection /> },
];

const QuiSommesNous = () => {
  const [activeSection, setActiveSection] = useState<SectionId>("mission");
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    document.title = "Qui sommes-nous ? — Les Casaniers Madagascar";
    const meta =
      document.querySelector('meta[name="description"]') ??
      document.head.appendChild(
        Object.assign(document.createElement("meta"), { name: "description" })
      );
    meta.setAttribute(
      "content",
      "Découvrez l'histoire, les valeurs et l'équipe de PC Sur Mesure Madagascar. Des experts passionnés à votre service depuis 2020."
    );
  }, []);

  const handleNav = (id: SectionId) => {
    if (id === activeSection) return;
    setVisible(false);
    setTimeout(() => {
      setActiveSection(id);
      setVisible(true);
    }, 200);
  };

  const currentSection = SECTIONS.find((s) => s.id === activeSection);

  return (
    <SiteLayout>
      <MiniHero
        title={
          <>
            Des experts passionnés au service de{" "}
            <span className="text-[#c8a96e]">votre performance.</span>
          </>
        }
        description="Depuis 2020, nous assemblons les meilleures configurations gaming et professionnelles à Madagascar. Qualité, fiabilité et passion sont nos maîtres-mots."
        bg="6.png"
        pill={{ icon: <Users className="h-3.5 w-3.5" />, label: "Qui sommes-nous ?" }}
      />

      {/* Barre de navigation sticky */}
      <nav className="sticky top-16 z-30 border-b border-border bg-background/80 backdrop-blur-md">
        <div className="container-x py-3">
          {/* Mobile : grille 2×2 */}
          <div className="grid grid-cols-2 gap-2 sm:hidden">
            {ANCHORS.map((anchor) => {
              const isActive = activeSection === anchor.id;
              return (
                <button
                  key={anchor.id}
                  onClick={() => handleNav(anchor.id)}
                  className={`text-xs font-semibold px-3 py-2 rounded-full border transition-all text-center ${
                    isActive
                      ? `${anchor.color} ${anchor.activeColor} scale-105`
                      : `${anchor.color} opacity-60 hover:opacity-100`
                  }`}
                >
                  {anchor.label}
                </button>
              );
            })}
          </div>

          {/* Desktop : ligne scrollable */}
          <div className="hidden sm:flex items-center gap-2 overflow-x-auto scrollbar-none">
            <Users className="h-4 w-4 text-[#c8a96e] shrink-0 mr-1" />
            {ANCHORS.map((anchor) => {
              const isActive = activeSection === anchor.id;
              return (
                <button
                  key={anchor.id}
                  onClick={() => handleNav(anchor.id)}
                  className={`shrink-0 text-xs font-semibold px-4 py-1.5 rounded-full border transition-all ${
                    isActive
                      ? `${anchor.color} ${anchor.activeColor} scale-sm`
                      : `${anchor.color} opacity-60 hover:opacity-100`
                  }`}
                >
                  {anchor.label}
                </button>
              );
            })}
          </div>
        </div>
      </nav>

      {/* Section active avec transition fade-up */}
      <div
        style={{
          transition: "opacity 200ms ease, transform 200ms ease",
          opacity: visible ? 1 : 0,
          transform: visible ? "translateY(0)" : "translateY(16px)",
        }}
      >
        {currentSection?.component}
      </div>

      {/* CTA Section */}
      <section className="py-16 md:py-20">
        <div className="container-x">
          <div className="bg-gradient-to-r from-amber-500/10 to-orange-500/10 rounded-2xl p-12 text-center border border-amber-500/20">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Prêt à vivre l'expérience PC sur mesure ?
            </h2>
            <p className="text-gray-300 text-lg mb-8 max-w-2xl mx-auto">
              Rejoignez notre communauté de gamers et professionnels satisfaits
            </p>
            <div className="flex flex-wrap gap-4 justify-center">
              <Link 
                to="/configurateur"
                className="inline-flex items-center gap-2 bg-amber-500 text-black px-8 py-3 rounded-lg font-semibold hover:bg-amber-400 transition-colors"
              >
                Configurer mon PC
                <Rocket className="h-4 w-4" />
              </Link>
              <Link 
                to="/devis-express"
                className="inline-flex items-center gap-2 bg-white/10 border border-white/20 px-8 py-3 rounded-lg font-semibold hover:bg-white/20 transition-colors"
              >
                Parler à un expert
                <Users className="h-4 w-4" />
              </Link>
            </div>
          </div>
        </div>
      </section>
    </SiteLayout>
  );
};

export default QuiSommesNous;