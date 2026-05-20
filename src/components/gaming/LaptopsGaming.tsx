// import { Laptop, Battery, Weight, Eye, Cpu, Zap } from "lucide-react";
// import { useEffect, useState, useRef } from "react";
// import { Link } from "react-router-dom";

// // Données d'exemple pour les laptops gaming
// const laptopsData = [
//   {
//     id: 1,
//     name: "Razer Blade 18",
//     screen: '18" QHD+ 240Hz',
//     processor: "Intel Core i9-14900HX",
//     gpu: "NVIDIA RTX 4090",
//     ram: "32GB DDR5",
//     storage: "2TB NVMe SSD",
//     battery: "Jusqu'à 6h",
//     weight: "3.2 kg",
//     price: 4299,
//     devise: "EUR",
//     description: "Le laptop gaming ultime pour les professionnels et les gamers exigeants.",
//     image: null
//   },
//   {
//     id: 2,
//     name: "ASUS ROG Strix G16",
//     screen: '16" QHD 165Hz',
//     processor: "Intel Core i7-13650HX",
//     gpu: "NVIDIA RTX 4060",
//     ram: "16GB DDR5",
//     storage: "1TB NVMe SSD",
//     battery: "Jusqu'à 5h",
//     weight: "2.5 kg",
//     price: 1699,
//     devise: "EUR",
//     description: "Performance et style pour une expérience de jeu immersive.",
//     image: null
//   },
//   {
//     id: 3,
//     name: "MSI Stealth 14",
//     screen: '14" OLED 120Hz',
//     processor: "Intel Core i7-13700H",
//     gpu: "NVIDIA RTX 4070",
//     ram: "16GB DDR5",
//     storage: "1TB NVMe SSD",
//     battery: "Jusqu'à 7h",
//     weight: "1.7 kg",
//     price: 2299,
//     devise: "EUR",
//     description: "Ultra-portable et puissant, parfait pour le gaming nomade.",
//     image: null
//   },
// ];

// export const LaptopsGaming = () => {
//   const [isVisible, setIsVisible] = useState(false);
//   const sectionRef = useRef(null);

//   useEffect(() => {
//     const observer = new IntersectionObserver(
//       ([entry]) => {
//         if (entry.isIntersecting) {
//           setIsVisible(true);
//           observer.disconnect();
//         }
//       },
//       { threshold: 0.1 }
//     );
    
//     if (sectionRef.current) {
//       observer.observe(sectionRef.current);
//     }
    
//     return () => observer.disconnect();
//   }, []);

//   const formatPrice = (prix: number, devise: string = 'EUR') => {
//     return new Intl.NumberFormat('fr-FR', {
//       style: 'currency',
//       currency: devise,
//       minimumFractionDigits: 0,
//       maximumFractionDigits: 0
//     }).format(prix);
//   };

//   return (
//     <section ref={sectionRef} className="py-12 bg-secondary/30">
//       <div className="container-x">
//         {/* En-tête avec bouton Voir tout */}
//         <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
//           <div>
//             <h2 className="text-3xl font-bold flex items-center gap-3">
//               <Laptop className="h-8 w-8 text-blue-500" />
//               Laptops Gaming
//             </h2>
//             <p className="text-muted-foreground mt-2">
//               La puissance du gaming en mobilité. Des laptops ultra-performants pour jouer partout.
//             </p>
//           </div>
//           <Link to="/catalogue?type=portable">
//             <button className="group inline-flex items-center gap-2 px-5 py-2.5 bg-blue-500/10 text-blue-600 rounded-xl hover:bg-blue-600 hover:text-white transition-all duration-300 font-medium">
//               <span>Voir tout</span>
//               <Eye className="h-4 w-4 transition-transform group-hover:translate-x-1" />
//             </button>
//           </Link>
//         </div>
        
//         {/* Grille des produits */}
//         <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
//           {laptopsData.map((laptop, index) => (
//             <div 
//               key={laptop.id} 
//               className={`group bg-background border border-border rounded-xl overflow-hidden hover:shadow-xl transition-all duration-500 hover:-translate-y-1
//                 ${isVisible ? 'animate-fade-up' : 'opacity-0 translate-y-10'}`}
//               style={{ animationDelay: `${index * 100}ms`, animationFillMode: 'forwards' }}
//             >
//               {/* Image section (placeholder avec icône) */}
//               <Link to={`/produit/${laptop.id}`} className="block relative aspect-[4/3] overflow-hidden bg-gradient-to-br from-blue-500/10 to-secondary">
//                 <div className="w-full h-full flex items-center justify-center">
//                   <Laptop className="h-20 w-20 text-blue-500/30 transition-transform duration-500 group-hover:scale-110" />
//                 </div>
//                 <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
//               </Link>

//               {/* Content */}
//               <div className="p-5">
//                 <h3 className="text-xl font-bold mb-2 line-clamp-1 group-hover:text-blue-600 transition-colors">
//                   {laptop.name}
//                 </h3>
                
//                 <p className="text-sm text-muted-foreground mb-4 line-clamp-2">
//                   {laptop.description}
//                 </p>
                
//                 <div className="space-y-2 mb-4">
//                   <div className="flex items-center gap-2">
//                     <span className="text-sm font-medium w-20">Écran:</span>
//                     <span className="text-sm text-muted-foreground">{laptop.screen}</span>
//                   </div>
//                   <div className="flex items-center gap-2">
//                     <Cpu className="h-4 w-4 text-muted-foreground shrink-0" />
//                     <span className="text-sm text-muted-foreground">{laptop.processor}</span>
//                   </div>
//                   <div className="flex items-center gap-2">
//                     <Zap className="h-4 w-4 text-muted-foreground shrink-0" />
//                     <span className="text-sm text-muted-foreground">{laptop.gpu}</span>
//                   </div>
//                   <div className="flex items-center gap-2">
//                     <span className="text-sm font-medium w-20">RAM:</span>
//                     <span className="text-sm text-muted-foreground">{laptop.ram}</span>
//                   </div>
//                   <div className="flex items-center gap-2">
//                     <span className="text-sm font-medium w-20">Stockage:</span>
//                     <span className="text-sm text-muted-foreground">{laptop.storage}</span>
//                   </div>
//                   <div className="flex items-center gap-2">
//                     <Battery className="h-4 w-4 text-muted-foreground shrink-0" />
//                     <span className="text-sm text-muted-foreground">{laptop.battery}</span>
//                   </div>
//                   <div className="flex items-center gap-2">
//                     <Weight className="h-4 w-4 text-muted-foreground shrink-0" />
//                     <span className="text-sm text-muted-foreground">{laptop.weight}</span>
//                   </div>
//                 </div>
                
//                 <div className="flex items-center justify-between mt-4 pt-2 border-t border-border">
//                   <div>
//                     <span className="text-2xl font-bold text-blue-600">
//                       {formatPrice(laptop.price, laptop.devise)}
//                     </span>
//                   </div>
//                   <Link to={`/produit/${laptop.id}`}>
//                     <button className="bg-blue-600 text-white px-5 py-2.5 rounded-lg hover:bg-blue-700 transition-all duration-300 flex items-center gap-2 group/btn">
//                       <span>Voir détails</span>
//                       <Eye className="h-4 w-4 transition-transform group-hover/btn:scale-110" />
//                     </button>
//                   </Link>
//                 </div>
//               </div>
//             </div>
//           ))}
//         </div>
//       </div>

//       <style>{`
//         @keyframes fade-up {
//           from {
//             opacity: 0;
//             transform: translateY(30px);
//           }
//           to {
//             opacity: 1;
//             transform: translateY(0);
//           }
//         }
//         .animate-fade-up {
//           animation: fade-up 0.6s cubic-bezier(0.2, 0.9, 0.4, 1.1) forwards;
//         }
//       `}</style>
//     </section>
//   );
// };

import { Laptop, Battery, Weight, Eye, Cpu, Zap, ShoppingCart, X } from "lucide-react";
import { useEffect, useState, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";

// Données d'exemple pour les laptops gaming
const laptopsData = [
  {
    id: 1,
    name: "Razer Blade 18",
    screen: '18" QHD+ 240Hz',
    processor: "Intel Core i9-14900HX",
    gpu: "NVIDIA RTX 4090",
    ram: "32GB DDR5",
    storage: "2TB NVMe SSD",
    battery: "Jusqu'à 6h",
    weight: "3.2 kg",
    price: 4299,
    devise: "EUR",
    description: "Le laptop gaming ultime pour les professionnels et les gamers exigeants.",
    image: null
  },
  {
    id: 2,
    name: "ASUS ROG Strix G16",
    screen: '16" QHD 165Hz',
    processor: "Intel Core i7-13650HX",
    gpu: "NVIDIA RTX 4060",
    ram: "16GB DDR5",
    storage: "1TB NVMe SSD",
    battery: "Jusqu'à 5h",
    weight: "2.5 kg",
    price: 1699,
    devise: "EUR",
    description: "Performance et style pour une expérience de jeu immersive.",
    image: null
  },
  {
    id: 3,
    name: "MSI Stealth 14",
    screen: '14" OLED 120Hz',
    processor: "Intel Core i7-13700H",
    gpu: "NVIDIA RTX 4070",
    ram: "16GB DDR5",
    storage: "1TB NVMe SSD",
    battery: "Jusqu'à 7h",
    weight: "1.7 kg",
    price: 2299,
    devise: "EUR",
    description: "Ultra-portable et puissant, parfait pour le gaming nomade.",
    image: null
  },
];

export const LaptopsGaming = () => {
  const [isVisible, setIsVisible] = useState(false);
  const [selectedLaptop, setSelectedLaptop] = useState(null);
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

  const openModal = (laptop) => {
    setSelectedLaptop(laptop);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setSelectedLaptop(null);
  };

  const handleAddToCart = (laptop) => {
    // Ici vous pouvez ajouter la logique pour ajouter au panier (localStorage, context, etc.)
    console.log("Ajout au panier:", laptop);
    
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
                <Laptop className="h-8 w-8 text-blue-500" />
                Laptops Gaming
              </h2>
              <p className="text-muted-foreground mt-2">
                La puissance du gaming en mobilité. Des laptops ultra-performants pour jouer partout.
              </p>
            </div>
            <Link to="/catalogue?type=portable">
              <button className="group inline-flex items-center gap-2 px-5 py-2.5 bg-blue-500/10 text-blue-600 rounded-xl hover:bg-blue-600 hover:text-white transition-all duration-300 font-medium">
                <span>Voir tout</span>
                <Eye className="h-4 w-4 transition-transform group-hover:translate-x-1" />
              </button>
            </Link>
          </div>
          
          {/* Grille des produits */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {laptopsData.map((laptop, index) => (
              <div 
                key={laptop.id} 
                className={`group bg-background border border-border rounded-xl overflow-hidden hover:shadow-xl transition-all duration-500 hover:-translate-y-1
                  ${isVisible ? 'animate-fade-up' : 'opacity-0 translate-y-10'}`}
                style={{ animationDelay: `${index * 100}ms`, animationFillMode: 'forwards' }}
              >
                {/* Image section */}
                <div className="relative aspect-[4/3] overflow-hidden bg-gradient-to-br from-blue-500/10 to-secondary">
                  <div className="w-full h-full flex items-center justify-center">
                    <Laptop className="h-20 w-20 text-blue-500/30 transition-transform duration-500 group-hover:scale-110" />
                  </div>
                  <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                </div>

                {/* Content simplifié */}
                <div className="p-5">
                  {/* Titre avec œil à droite */}
                  <div className="flex items-center justify-between gap-2 mb-2">
                    <h3 className="text-xl font-bold line-clamp-1 group-hover:text-blue-600 transition-colors">
                      {laptop.name}
                    </h3>
                    
                    {/* Bouton œil pour ouvrir le modal */}
                    <button
                      onClick={() => openModal(laptop)}
                      className="flex-shrink-0 p-1.5 bg-blue-500/10 hover:bg-blue-600 rounded-lg transition-all duration-300 hover:scale-110 group/eye"
                      aria-label="Voir les configurations"
                    >
                      <Eye className="h-4 w-4 text-blue-600 group-hover/eye:text-white transition-colors" />
                    </button>
                  </div>
                  
                  <p className="text-sm text-muted-foreground mb-4 line-clamp-2">
                    {laptop.description}
                  </p>
                  
                  <div className="flex items-center justify-between mt-4 pt-2 border-t border-border">
                    <div>
                      <span className="text-2xl font-bold text-blue-600">
                        {formatPrice(laptop.price, laptop.devise)}
                      </span>
                    </div>
                    
                    {/* Bouton Ajouter au panier - plus petit, fond blanc, texte noir */}
                    <button 
                      onClick={() => handleAddToCart(laptop)}
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
      {isModalOpen && selectedLaptop && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-fade-in">
          <div className="bg-background rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl animate-scale-up">
            {/* En-tête du modal */}
            <div className="sticky top-0 bg-background border-b border-border p-4 flex justify-between items-center">
              <div className="flex items-center gap-3">
                <Laptop className="h-6 w-6 text-blue-500" />
                <h3 className="text-xl font-bold">{selectedLaptop.name}</h3>
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
                    <h4 className="font-semibold mb-3 text-blue-600">Caractéristiques principales</h4>
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span className="text-sm text-muted-foreground">Écran :</span>
                        <span className="text-sm font-medium">{selectedLaptop.screen}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-muted-foreground">Processeur :</span>
                        <span className="text-sm font-medium">{selectedLaptop.processor}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-muted-foreground">Carte graphique :</span>
                        <span className="text-sm font-medium">{selectedLaptop.gpu}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-muted-foreground">RAM :</span>
                        <span className="text-sm font-medium">{selectedLaptop.ram}</span>
                      </div>
                    </div>
                  </div>

                  <div className="bg-secondary/30 rounded-lg p-4">
                    <h4 className="font-semibold mb-3 text-blue-600">Stockage & Autonomie</h4>
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span className="text-sm text-muted-foreground">Stockage :</span>
                        <span className="text-sm font-medium">{selectedLaptop.storage}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-muted-foreground">Batterie :</span>
                        <span className="text-sm font-medium">{selectedLaptop.battery}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-muted-foreground">Poids :</span>
                        <span className="text-sm font-medium">{selectedLaptop.weight}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-muted-foreground">Prix :</span>
                        <span className="text-lg font-bold text-blue-600">{formatPrice(selectedLaptop.price, selectedLaptop.devise)}</span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="bg-blue-500/10 rounded-lg p-4">
                  <p className="text-sm text-foreground">{selectedLaptop.description}</p>
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
                onClick={() => handleAddToCart(selectedLaptop)}
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