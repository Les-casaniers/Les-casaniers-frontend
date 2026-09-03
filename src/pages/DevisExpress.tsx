import { useLocation } from "react-router-dom";
import { useEffect, useRef } from "react";
import curvedArrow from "@/assets/Curved Arrow Downward.png";
import {
  FileText,
  MessageCircle,
} from "lucide-react";
import { SiteLayout } from "@/components/site/SiteLayout";

const DevisExpress = () => {
  const location = useLocation();
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    document.title = "Devis Express — Les Casaniers Madagascar";
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, [location.pathname]);

  const scrollToBesoins = () => {
    document.getElementById("besoins-section")?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <SiteLayout footerClassName="bg-white text-black">
      <style>{`
        .devis-page { font-family: 'Inter', sans-serif; background-color: #000; }
        
        .hero-banner {
          background: linear-gradient(rgba(0,0,0,0.5), rgba(0,0,0,0.5)), url('/7.png');
          background-size: cover;
          background-position: center;
          border-radius: 15px;
          padding: 60px;
          min-height: 350px;
          display: flex;
          flex-direction: column;
          justify-content: center;
          position: relative;
          border: 1px solid #333;
        }

        .dashed-underline {
          display: flex;
          gap: 10px;
          margin-top: 15px;
        }
        .u-solid { height: 2px; width: 140px; background: white; }
        .u-dash { height: 2px; width: 20px; background: white; }

        .white-card {
          background: white;
          color: black;
          border-radius: 5px;
          padding: 60px;
          margin-top: 40px;
        }
        .form-input {
          border: none;
          border-bottom: 1px solid #ccc;
          width: 100%;
          padding: 10px 0;
          font-size: 14px;
          outline: none;
          background: transparent;
        }
        .form-input::placeholder { color: #555; font-style: italic; font-size: 13px; }
        .form-input:focus { border-bottom: 1px solid black; }

        .btn-orange {
          background-color: #FF5C28;
          color: white;
          border-radius: 50px;
          padding: 12px 35px;
          font-weight: bold;
          border: none;
          font-size: 14px;
          cursor: pointer;
        }
        .btn-whatsapp {
          background-color: #25D366;
          color: white;
          border-radius: 50px;
          padding: 10px 25px;
          font-weight: bold;
          display: flex;
          align-items: center;
          gap: 8px;
          font-size: 14px;
        }
      `}</style>

      <div className="devis-page text-white pb-20">
        <div className="max-w-[1400px] mx-auto px-6">
          
          <div className="mt-10 hero-banner">
            <h1 className="text-5xl font-bold uppercase leading-tight max-w-4xl">
              Besoin d'un équipement à la hauteur de tes projets ?
            </h1>
            <p className="text-xl italic mt-8 text-gray-200 max-w-3xl">
              " Explique-nous ton besoin, et notre équipe te prépare <br />
              <span className="ml-24">une recommandation et un devis sur mesure "</span>
            </p>
            <button onClick={scrollToBesoins} className="btn-orange absolute bottom-12 right-12">
              Demander un devis
            </button>
          </div>

          <div className="grid grid-cols-4 gap-4 mt-12 py-10 border-b border-gray-800 text-center uppercase">
            <div><h4 className="font-bold text-sm">Importation UE</h4><p className="text-[11px] text-gray-500 lowercase mt-1">Produits sourcés d'Europe</p></div>
            <div><h4 className="font-bold text-sm">Garantie 24 Mois</h4><p className="text-[11px] text-gray-500 lowercase mt-1">SAV local réactif</p></div>
            <div><h4 className="font-bold text-sm">Showroom Antananarivo</h4><p className="text-[11px] text-gray-500 lowercase mt-1">Conseils & démonstration</p></div>
            <div><h4 className="font-bold text-sm">Livraison Madagascar</h4><p className="text-[11px] text-gray-500 lowercase mt-1">Expédition sécurisée</p></div>
          </div>

          <div className="mt-16 max-w-5xl">
            <h3 className="text-lg font-bold mb-6">Pourquoi demander un devis express ?</h3>
            <p className="text-sm text-gray-400 mb-6 leading-relaxed">
              Parce que certains projets demandent plus qu'un simple produit.
            </p>
            <p className="text-sm text-gray-400 leading-relaxed">
              Notre équipe prend en charge ta demande sous 24 h ouvrées, analyse ton besoin et prépare une proposition adaptée à ton activité, ton budget et tes contraintes.
            </p>
          </div>

          <div className="mt-16" id="besoins-section">
            <h2 className="text-2xl font-bold uppercase tracking-widest">Décris nous tes besoins</h2>
            <div className="flex items-center gap-6 mt-4">
              <div className="dashed-underline">
                <div className="u-solid"></div>
                <div className="u-dash"></div><div className="u-dash"></div><div className="u-dash"></div><div className="u-dash"></div><div className="u-dash"></div>
              </div>
              <img 
                src={curvedArrow} 
                alt="Flèche" 
                className="w-8 h-8 object-contain translate-y-5" 
              />
            </div>
          </div>

          <div className="white-card shadow-2xl">
            <form className="grid grid-cols-1 md:grid-cols-2 gap-x-24 gap-y-12">
              <div className="space-y-12">
                <input type="text" placeholder="Nom et prénom(*)" className="form-input" />
                <input type="email" placeholder="Email(*)" className="form-input" />
                <input type="text" placeholder="Budget estimé" className="form-input" />
                <div>
                  <textarea placeholder="Besoin spécifique(*)" className="form-input h-20 resize-none" />
                  <p className="text-[10px] text-gray-400 italic mt-3">ex : équiper huit collaborateurs avec un PC Portable. Nos logiciels..., nos contraintes...(*)</p>
                </div>
                <div className="pt-6">
                  <input type="file" ref={fileInputRef} className="hidden" />
                  <button type="button" onClick={() => fileInputRef.current?.click()} className="bg-black text-white px-5 py-2 rounded flex items-center gap-2 text-xs font-bold uppercase tracking-wider">
                    J'ajoute un fichier <FileText size={14} />
                  </button>
                </div>
              </div>

              <div className="space-y-12 flex flex-col">
                <input type="tel" placeholder="Téléphone(*)" className="form-input" />
                <input type="text" placeholder="Entreprise(*)" className="form-input" />
                <input type="text" placeholder="Date jj/mm/aaaa" className="form-input" />
                
                <div className="flex items-start gap-2 pt-4">
                  <input type="checkbox" id="c" className="mt-1 accent-black" />
                  <label htmlFor="c" className="text-[11px] font-medium text-gray-600">J'accepte d'être contacter pour traiter ma demande.</label>
                </div>

                <div className="mt-auto pt-10 flex flex-col items-center">
                  <button type="submit" className="btn-orange w-full max-w-[280px] mb-8 uppercase tracking-wide">
                    J'envoie ma demande
                  </button>
                  <div className="flex items-center w-full gap-5 mb-8">
                    <div className="h-[1px] bg-gray-200 flex-1"></div>
                    <span className="text-[10px] uppercase text-gray-400 font-bold tracking-widest whitespace-nowrap">ou contacte nous sur</span>
                    <div className="h-[1px] bg-gray-200 flex-1"></div>
                  </div>
                  <a href="#" className="btn-whatsapp">
                    WhatsApp <MessageCircle size={18} />
                  </a>
                </div>
              </div>
            </form>
          </div>

          <div className="mt-10 text-[12px] text-gray-400 italic space-y-1">
            <p>" Réponse sous 24h avec devis d'importation "</p>
            <p>*: ces champs doivent être obligatoirement remplis</p>
            <div className="pt-6 font-bold text-white not-italic">
              <p className="mb-1 text-sm">Horaires:</p>
              <p>Lundi - Vendredi : 8h - 17h</p>
            </div>
          </div>
        </div>
      </div>

    </SiteLayout>
  );
};

export default DevisExpress;