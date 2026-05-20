import { Droplet, Eye, Thermometer, Factory, Package, Zap, Gauge, ShoppingCart, X } from "lucide-react";
import { useEffect, useState, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";

// Données d'exemple pour les kits watercooling
const kitsData = [
  {
    id: 1,
    name: "Kit Watercooling Expert",
    type: "Custom Loop",
    compatibility: "Intel LGA1700 / AMD AM5",
    radiator: "360mm",
    pump: "D5 PWM",
    price: 399,
    devise: "EUR",
    description: "Kit watercooling custom complet pour une performance thermique exceptionnelle.",
    features: ["Tubes transparents", "Raccords chromés", "Liquide pré-mixé"]
  },
  {
    id: 2,
    name: "AIO Liquid Freezer III",
    type: "AIO 360mm",
    compatibility: "Universal",
    radiator: "360mm",
    pump: "Intégrée PWM",
    price: 159,
    devise: "EUR",
    description: "Solution tout-en-un facile à installer, performance optimale.",
    features: ["Installation facile", "Ventilateurs haute pression", "Garantie 5 ans"]
  },
  {
    id: 3,
    name: "Kit Hardline Pro",
    type: "Custom Loop - Tubing Rigide",
    compatibility: "Tous sockets",
    radiator: "Double 360mm",
    pump: "Dual D5",
    price: 599,
    devise: "EUR",
    description: "Kit professionnel pour les amateurs de watercooling extrême.",
    features: ["Tubes rigides", "Double radiateur", "RVB adressable"]
  }
];

export const WatercoolingCustom = () => {
  const [isVisible, setIsVisible] = useState(false);
  const [selectedKit, setSelectedKit] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const sectionRef = useRef(null);
  const navigate = useNavigate();

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          observer.disconnect();
        }
      },
      { threshold: 0.1 }
    );
    
    if (sectionRef.current) {
      observer.observe(sectionRef.current);
    }
    
    return () => observer.disconnect();
  }, []);

  const formatPrice = (prix: number, devise: string = 'EUR') => {
    return new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: devise,
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(prix);
  };

  const openModal = (kit) => {
    setSelectedKit(kit);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setSelectedKit(null);
  };

  const handleAddToCart = (kit) => {
    // Ici vous pouvez ajouter la logique pour ajouter au panier (localStorage, context, etc.)
    console.log("Ajout au panier:", kit);
    
    // Rediriger vers la page panier
    navigate("/panier");
  };

  return (
    <>
      <section ref={sectionRef} className="py-12 bg-secondary/30">
        <div className="container-x">
          {/* En-tête avec bouton Voir tout */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
            <div>
              <h2 className="text-3xl font-bold flex items-center gap-3">
                <Droplet className="h-8 w-8 text-cyan-500" />
                Watercooling Custom
              </h2>
              <p className="text-muted-foreground mt-2">
                Le refroidissement liquide haute performance. Silence absolu et températures maîtrisées.
              </p>
            </div>
            <Link to="/catalogue?type=watercooling">
              <button className="group inline-flex items-center gap-2 px-5 py-2.5 bg-cyan-500/10 text-cyan-600 rounded-xl hover:bg-cyan-600 hover:text-white transition-all duration-300 font-medium">
                <span>Voir tout</span>
                <Eye className="h-4 w-4 transition-transform group-hover:translate-x-1" />
              </button>
            </Link>
          </div>
          
          {/* Grille des produits */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {kitsData.map((kit, index) => (
              <div 
                key={kit.id} 
                className={`group bg-background border border-border rounded-xl overflow-hidden hover:shadow-xl transition-all duration-500 hover:-translate-y-1
                  ${isVisible ? 'animate-fade-up' : 'opacity-0 translate-y-10'}`}
                style={{ animationDelay: `${index * 100}ms`, animationFillMode: 'forwards' }}
              >
                {/* Image section */}
                <div className="relative aspect-[4/3] overflow-hidden bg-gradient-to-br from-cyan-500/10 to-secondary">
                  <div className="w-full h-full flex items-center justify-center">
                    <Droplet className="h-20 w-20 text-cyan-500/30 transition-transform duration-500 group-hover:scale-110" />
                  </div>
                  <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                </div>

                {/* Content simplifié */}
                <div className="p-5">
                  {/* Titre avec œil à droite */}
                  <div className="flex items-center justify-between gap-2 mb-2">
                    <h3 className="text-xl font-bold line-clamp-1 group-hover:text-cyan-600 transition-colors">
                      {kit.name}
                    </h3>
                    
                    {/* Bouton œil pour ouvrir le modal */}
                    <button
                      onClick={() => openModal(kit)}
                      className="flex-shrink-0 p-1.5 bg-cyan-500/10 hover:bg-cyan-600 rounded-lg transition-all duration-300 hover:scale-110 group/eye"
                      aria-label="Voir les configurations"
                    >
                      <Eye className="h-4 w-4 text-cyan-600 group-hover/eye:text-white transition-colors" />
                    </button>
                  </div>
                  
                  <p className="text-sm text-muted-foreground mb-4 line-clamp-2">
                    {kit.description}
                  </p>
                  
                  {/* Plus de tags features ici - supprimé */}
                  
                  <div className="flex items-center justify-between mt-4 pt-2 border-t border-border">
                    <div>
                      <span className="text-2xl font-bold text-cyan-600">
                        {formatPrice(kit.price, kit.devise)}
                      </span>
                    </div>
                    
                    {/* Bouton Ajouter au panier - plus petit, fond blanc, texte noir */}
                    <button 
                      onClick={() => handleAddToCart(kit)}
                      className="bg-white text-black px-3 py-1.5 rounded-lg hover:bg-gray-100 transition-all duration-300 flex items-center gap-1.5 text-sm font-medium border border-gray-200 shadow-sm"
                    >
                      <ShoppingCart className="h-3.5 w-3.5" />
                      <span>Ajouter</span>
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <style>{`
          @keyframes fade-up {
            from {
              opacity: 0;
              transform: translateY(30px);
            }
            to {
              opacity: 1;
              transform: translateY(0);
            }
          }
          .animate-fade-up {
            animation: fade-up 0.6s cubic-bezier(0.2, 0.9, 0.4, 1.1) forwards;
          }
        `}</style>
      </section>

      {/* Modal pour afficher les configurations */}
      {isModalOpen && selectedKit && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-fade-in">
          <div className="bg-background rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl animate-scale-up">
            {/* En-tête du modal */}
            <div className="sticky top-0 bg-background border-b border-border p-4 flex justify-between items-center">
              <div className="flex items-center gap-3">
                <Droplet className="h-6 w-6 text-cyan-500" />
                <h3 className="text-xl font-bold">{selectedKit.name}</h3>
              </div>
              <button
                onClick={closeModal}
                className="p-1 hover:bg-secondary rounded-lg transition-colors"
                aria-label="Fermer"
              >
                <X className="h-6 w-6" />
              </button>
            </div>

            {/* Corps du modal avec configurations */}
            <div className="p-6">
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="bg-secondary/30 rounded-lg p-4">
                    <h4 className="font-semibold mb-3 text-cyan-600">Caractéristiques principales</h4>
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span className="text-sm text-muted-foreground">Type :</span>
                        <span className="text-sm font-medium">{selectedKit.type}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-muted-foreground">Compatibilité :</span>
                        <span className="text-sm font-medium">{selectedKit.compatibility}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-muted-foreground">Radiateur :</span>
                        <span className="text-sm font-medium">{selectedKit.radiator}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-muted-foreground">Pompe :</span>
                        <span className="text-sm font-medium">{selectedKit.pump}</span>
                      </div>
                    </div>
                  </div>

                  <div className="bg-secondary/30 rounded-lg p-4">
                    <h4 className="font-semibold mb-3 text-cyan-600">Fonctionnalités</h4>
                    <div className="space-y-2">
                      {selectedKit.features.map((feature, idx) => (
                        <div key={idx} className="flex items-center gap-2">
                          <Zap className="h-3.5 w-3.5 text-cyan-500" />
                          <span className="text-sm text-muted-foreground">{feature}</span>
                        </div>
                      ))}
                      <div className="flex justify-between mt-3 pt-2 border-t border-border">
                        <span className="text-sm text-muted-foreground">Prix :</span>
                        <span className="text-lg font-bold text-cyan-600">{formatPrice(selectedKit.price, selectedKit.devise)}</span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="bg-cyan-500/10 rounded-lg p-4">
                  <p className="text-sm text-foreground">{selectedKit.description}</p>
                </div>
              </div>
            </div>

            {/* Pied du modal */}
            <div className="sticky bottom-0 bg-background border-t border-border p-4 flex gap-3">
              <button
                onClick={closeModal}
                className="flex-1 px-4 py-2 border border-border rounded-lg hover:bg-secondary transition-colors"
              >
                Fermer
              </button>
              <button
                onClick={() => handleAddToCart(selectedKit)}
                className="flex-1 bg-white text-black px-4 py-2 rounded-lg hover:bg-gray-100 transition-colors flex items-center justify-center gap-2 border border-gray-200"
              >
                <ShoppingCart className="h-4 w-4" />
                Ajouter au panier
              </button>
            </div>
          </div>
        </div>
      )}

      <style>{`
        @keyframes fade-in {
          from {
            opacity: 0;
          }
          to {
            opacity: 1;
          }
        }
        
        @keyframes scale-up {
          from {
            opacity: 0;
            transform: scale(0.95);
          }
          to {
            opacity: 1;
            transform: scale(1);
          }
        }
        
        .animate-fade-in {
          animation: fade-in 0.2s ease-out;
        }
        
        .animate-scale-up {
          animation: scale-up 0.3s ease-out;
        }
      `}</style>
    </>
  );
};