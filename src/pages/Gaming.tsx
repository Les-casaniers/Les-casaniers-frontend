import { useLocation } from "react-router-dom";
import { useEffect, useState, useRef } from "react";
import { Gamepad2, Monitor, Laptop, Droplet, ChevronRight, Sparkles } from "lucide-react";
import { SiteLayout } from "@/components/site/SiteLayout";
import { UnitesCentralesGaming } from "@/components/gaming/UnitesCentralesGaming";
import { LaptopsGaming } from "@/components/gaming/LaptopsGaming";
import { WatercoolingCustom } from "@/components/gaming/WatercoolingCustom";
import { MiniHero } from "@/components/layout/MiniHero";

const NAV_ITEMS = [
  { 
    id: "unites-centrales",
    label: "Unités Centrales", 
    icon: <Monitor className="h-5 w-5" />,
    description: "PC Gaming sur mesure",
    color: "from-purple-500 to-purple-600",
    bgColor: "bg-purple-500/10",
    borderColor: "border-purple-500/30",
    textColor: "text-purple-500"
  },
  { 
    id: "laptops",
    label: "Laptops Gaming", 
    icon: <Laptop className="h-5 w-5" />,
    description: "Portables puissants",
    color: "from-blue-500 to-blue-600",
    bgColor: "bg-blue-500/10",
    borderColor: "border-blue-500/30",
    textColor: "text-blue-500"
  },
  { 
    id: "watercooling",
    label: "Watercooling", 
    icon: <Droplet className="h-5 w-5" />,
    description: "Refroidissement liquide",
    color: "from-cyan-500 to-cyan-600",
    bgColor: "bg-cyan-500/10",
    borderColor: "border-cyan-500/30",
    textColor: "text-cyan-500"
  },
];

const Gaming = () => {
  const location = useLocation();
  const [activeSection, setActiveSection] = useState<string>("unites-centrales");
  const [isVisible, setIsVisible] = useState(false);
  const sectionsRef = useRef<{ [key: string]: HTMLElement | null }>({});

  useEffect(() => {
    document.title = "Gaming — Les Casaniers Madagascar";
    const meta =
      document.querySelector('meta[name="description"]') ??
      document.head.appendChild(
        Object.assign(document.createElement("meta"), { name: "description" })
      );
    meta.setAttribute(
      "content",
      "Unités Centrales Gaming, Laptops Gaming et Watercooling Custom pour passionnés de jeux vidéo à Madagascar."
    );
    
    // Animation d'entrée
    setTimeout(() => setIsVisible(true), 100);
  }, []);

  // Scroll automatique vers la section selon le # dans l'URL
  useEffect(() => {
    if (location.hash) {
      const targetId = location.hash.replace("#", "");
      setActiveSection(targetId);
      setTimeout(() => {
        const element = document.getElementById(targetId);
        if (element) {
          element.scrollIntoView({ behavior: "smooth", block: "start" });
        }
      }, 100);
    }
  }, [location.hash]);

  // Détecter la section visible pendant le scroll
  useEffect(() => {
    const handleScroll = () => {
      const sections = NAV_ITEMS.map(item => document.getElementById(item.id));
      const scrollPosition = window.scrollY + 250;
      
      for (let i = sections.length - 1; i >= 0; i--) {
        const section = sections[i];
        if (section && section.offsetTop <= scrollPosition) {
          setActiveSection(NAV_ITEMS[i].id);
          break;
        }
      }
    };
    
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollToSection = (sectionId: string) => {
    setActiveSection(sectionId);
    const element = document.getElementById(sectionId);
    if (element) {
      const offset = 80;
      const elementPosition = element.getBoundingClientRect().top;
      const offsetPosition = elementPosition + window.pageYOffset - offset;
      
      window.scrollTo({
        top: offsetPosition,
        behavior: "smooth"
      });
    }
    window.history.pushState(null, "", `#${sectionId}`);
  };

  return (
    <SiteLayout>
      {/* Hero */}
      <MiniHero
        title="La puissance gaming, là où l'action commence."
        description="Performances extrêmes, refroidissement sur-mesure et design agressif | nos configurations gaming sont prêtes à dominer tous vos jeux."
        bg="5.png"
      />

      {/* Layout avec sidebar fixe à côté du contenu */}
      <div className="relative max-w-[1400px] mx-auto px-4 md:px-6 py-8">
        <div className="flex flex-col lg:flex-row gap-8">
          
          {/* Sidebar - Fixe à côté du contenu (ne scroll pas) */}
          <aside className="lg:w-72 lg:sticky lg:top-24 self-start">
            <div className={`
              bg-gradient-to-br from-card to-secondary/30 
              border border-border rounded-2xl overflow-hidden
              shadow-lg backdrop-blur-sm
              transition-all duration-700 transform
              ${isVisible ? 'translate-x-0 opacity-100' : '-translate-x-10 opacity-0'}
            `}>
              
              {/* En-tête de la sidebar */}
              <div className="p-5 bg-gradient-to-r from-primary/10 to-transparent border-b border-border">
                <div className="flex items-center gap-3">
                  <div>
                    <h3 className="font-bold text-foreground">Navigation </h3>
                  </div>
                </div>
              </div>

              {/* Liste de navigation */}
              <div className="p-3 space-y-2">
                {NAV_ITEMS.map((item, index) => (
                  <button
                    key={item.id}
                    onClick={() => scrollToSection(item.id)}
                    className={`
                      group relative w-full text-left p-3 rounded-xl
                      transition-all duration-500
                      ${activeSection === item.id 
                        ? `${item.bgColor} ${item.textColor} shadow-md` 
                        : 'text-muted-foreground hover:bg-secondary/50 hover:text-foreground'
                      }
                      transform transition-all duration-500 hover:scale-[1.02]
                      ${isVisible ? `translate-x-0 opacity-100 delay-${index * 100}` : '-translate-x-10 opacity-0'}
                    `}
                    style={{
                      transitionDelay: isVisible ? `${index * 100}ms` : '0ms'
                    }}
                  >
                    <div className="flex items-start gap-3">
                      {/* Icône avec animation */}
                      <div className={`
                        p-2 rounded-lg transition-all duration-300
                        ${activeSection === item.id 
                          ? `${item.bgColor} ${item.textColor} ring-2 ${item.borderColor}` 
                          : 'bg-secondary/50'
                        }
                        group-hover:scale-110 group-hover:rotate-3
                      `}>
                        {item.icon}
                      </div>
                      
                      {/* Texte */}
                      <div className="flex-1">
                        <div className="flex items-center justify-between">
                          <p className={`font-medium text-sm ${activeSection === item.id ? item.textColor : ''}`}>
                            {item.label}
                          </p>
                          {activeSection === item.id && (
                            <ChevronRight className="h-4 w-4 animate-pulse" />
                          )}
                        </div>
                        <p className="text-xs text-muted-foreground mt-0.5">
                          {item.description}
                        </p>
                      </div>
                    </div>

                    {/* Indicateur de progression */}
                    {activeSection === item.id && (
                      <div className={`absolute bottom-0 left-0 h-0.5 bg-gradient-to-r ${item.color} rounded-full transition-all duration-500`} style={{ width: '100%' }} />
                    )}
                  </button>
                ))}
              </div>

              {/* Footer avec effet de brillance */}
              <div className="p-4 border-t border-border/50 bg-gradient-to-r from-transparent via-primary/5 to-transparent">
                <div className="flex items-center justify-center gap-2 text-xs text-muted-foreground">
            
                </div>
              </div>
            </div>
          </aside>

          {/* Contenu principal */}
          <div className="flex-1 space-y-16">
            {/* Section Unités Centrales */}
            <div 
              id="unites-centrales" 
              className="scroll-mt-24 transition-all duration-700 transform"
              style={{
                transitionDelay: '0ms',
                transform: isVisible ? 'translateY(0)' : 'translateY(20px)',
                opacity: isVisible ? 1 : 0
              }}
            >
              <UnitesCentralesGaming />
            </div>

            {/* Section Laptops Gaming */}
            <div 
              id="laptops" 
              className="scroll-mt-24 transition-all duration-700 transform"
              style={{
                transitionDelay: '200ms',
                transform: isVisible ? 'translateY(0)' : 'translateY(20px)',
                opacity: isVisible ? 1 : 0
              }}
            >
              <LaptopsGaming />
            </div>

            {/* Section Watercooling */}
            <div 
              id="watercooling" 
              className="scroll-mt-24 transition-all duration-700 transform"
              style={{
                transitionDelay: '400ms',
                transform: isVisible ? 'translateY(0)' : 'translateY(20px)',
                opacity: isVisible ? 1 : 0
              }}
            >
              <WatercoolingCustom />
            </div>
          </div>
        </div>
      </div>

      <style>{`
        @keyframes fadeSlideIn {
          from {
            opacity: 0;
            transform: translateX(-20px);
          }
          to {
            opacity: 1;
            transform: translateX(0);
          }
        }
        
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.5; }
        }
        
        .animate-fade-slide-in {
          animation: fadeSlideIn 0.5s ease-out forwards;
        }
        
        .delay-0 { transition-delay: 0ms; }
        .delay-100 { transition-delay: 100ms; }
        .delay-200 { transition-delay: 200ms; }
        .delay-300 { transition-delay: 300ms; }
        .delay-400 { transition-delay: 400ms; }
        
        /* Scroll personnalisé pour la sidebar */
        .sidebar-scroll::-webkit-scrollbar {
          width: 4px;
        }
        
        .sidebar-scroll::-webkit-scrollbar-track {
          background: hsl(var(--border));
          border-radius: 4px;
        }
        
        .sidebar-scroll::-webkit-scrollbar-thumb {
          background: hsl(var(--primary));
          border-radius: 4px;
        }
        
        /* Animation de brillance au survol */
        .sidebar-item {
          position: relative;
          overflow: hidden;
        }
        
        .sidebar-item::before {
          content: '';
          position: absolute;
          top: 0;
          left: -100%;
          width: 100%;
          height: 100%;
          background: linear-gradient(90deg, transparent, rgba(255,255,255,0.1), transparent);
          transition: left 0.5s ease;
        }
        
        .sidebar-item:hover::before {
          left: 100%;
        }
      `}</style>
    </SiteLayout>
  );
};

export default Gaming;