import { useLocation } from "react-router-dom";
import { useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import curvedArrow from "@/assets/Curved Arrow Downward.png";
import devisExpressBg from "@/assets/devis_express.png";
import {
  FileText,
  MessageCircle,
} from "lucide-react";
import { SiteLayout } from "@/components/site/SiteLayout";
import api from "@/service/api";

const WHATSAPP_NUMBER = "261348429933";

const initialForm = {
  nom: "",
  email: "",
  telephone: "",
  entreprise: "",
  besoin: "",
  budget: "",
  date_souhaitee: "",
  message: "",
  accepte: false,
};

const buildWhatsAppUrl = (form: typeof initialForm) => {
  const details = [
    `Bonjour, je souhaite demander un devis.`,
    "",
    `Nom : ${form.nom}`,
    `E-mail : ${form.email}`,
    `Téléphone : ${form.telephone}`,
    `Entreprise : ${form.entreprise}`,
    `Besoin : ${form.besoin}`,
    form.budget && `Budget estimé : ${form.budget}`,
    form.date_souhaitee && `Date souhaitée : ${form.date_souhaitee}`,
    form.message && `Message complémentaire : ${form.message}`,
  ].filter(Boolean).join("\n");

  return `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(details)}`;
};

const DevisExpress = () => {
  const location = useLocation();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [form, setForm] = useState(initialForm);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    document.title = "Devis Express — Les Casaniers Madagascar";
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, [location.pathname]);

  const scrollToBesoins = () => {
    document.getElementById("besoins-section")?.scrollIntoView({ behavior: "smooth" });
  };

  const handleChange = (event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, type, value, checked } = event.target as HTMLInputElement;
    setForm((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleWhatsApp = (event: React.MouseEvent<HTMLButtonElement>) => {
    const formElement = event.currentTarget.form;

    if (!formElement?.reportValidity()) {
      return;
    }

    window.open(buildWhatsAppUrl(form), "_blank", "noopener,noreferrer");
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!form.accepte) {
      toast.error("Veuillez accepter d’être contacté pour traiter votre demande.");
      return;
    }

    const whatsappWindow = window.open("about:blank", "_blank");
    setIsSubmitting(true);

    try {
      const response = await api.post("/devis-express", {
        nom: form.nom,
        email: form.email,
        telephone: form.telephone,
        entreprise: form.entreprise,
        besoin: form.besoin,
        budget: form.budget,
        date_souhaitee: form.date_souhaitee,
        message: form.message,
      });

      if (response.data.success) {
        if (whatsappWindow) {
          whatsappWindow.opener = null;
          whatsappWindow.location.href = buildWhatsAppUrl(form);
          toast.success(response.data.message || "Votre demande est enregistrée. WhatsApp va s’ouvrir.");
          setForm(initialForm);
        } else {
          toast.success("Votre demande est enregistrée. Autorisez les fenêtres pop-up puis utilisez le bouton WhatsApp pour envoyer le message.");
        }
      } else {
        whatsappWindow?.close();
        toast.error(response.data.message || "Une erreur est survenue.");
      }
    } catch (error: any) {
      whatsappWindow?.close();
      const message = error?.response?.data?.message || "Impossible d’envoyer votre demande pour le moment.";
      const validationErrors = error?.response?.data?.errors;

      if (validationErrors) {
        const firstError = Object.values(validationErrors)[0];
        toast.error(Array.isArray(firstError) ? firstError[0] : String(firstError));
      } else {
        toast.error(message);
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <SiteLayout>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Poppins:ital,wght@0,300;0,400;0,500;0,600;0,700;1,300;1,400;1,500;1,600&display=swap');

        .devis-page {
          font-family: 'Poppins', sans-serif;
        }

        @keyframes devisPageIn {
          from { opacity: 0; transform: translateY(24px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        .devis-page > * {
          animation: devisPageIn 0.7s ease-out backwards;
        }

        .form-input {
          border: none;
          border-bottom: 1px solid #ccc;
          width: 100%;
          padding: 10px 0;
          font-size: 14px;
          outline: none;
          background: transparent;
          color: black;
          transition: border-color 0.2s ease;
        }
        .form-input::placeholder { color: #666; font-style: italic; font-size: 13px; }
        .form-input:focus { border-bottom: 1px solid black; }

        .btn-orange {
          background-color: #FF5C28;
          color: white;
          border-radius: 30px;
          padding: 10px 24px;
          font-weight: 700;
          border: none;
          font-size: 14px;
          cursor: pointer;
          transition: background-color 0.2s ease, transform 0.1s ease;
          display: inline-flex;
          align-items: center;
          justify-content: center;
        }
        .btn-orange:hover {
          background-color: #e04a18;
        }

        .btn-whatsapp {
          background-color: #25D366;
          color: white;
          border-radius: 50px;
          padding: 10px 24px;
          font-weight: 700;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
          font-size: 14px;
          transition: background-color 0.2s ease;
        }
        .btn-whatsapp:hover {
          background-color: #1ebd59;
        }

        .dashed-underline {
          display: flex;
          gap: 6px;
          margin-top: 10px;
          align-items: center;
        }
        .u-solid { height: 2px; width: 100px; background: white; }
        .u-dash { height: 2px; width: 14px; background: white; }
        @media (min-width: 640px) {
          .u-solid { width: 140px; }
          .u-dash { width: 20px; }
        }
      `}</style>

      <div className="devis-page w-full max-w-[1780px] mx-auto px-4 sm:px-6 lg:px-8 py-6 flex flex-col gap-6 lg:gap-8 text-white">

        {/* Bannière Hero - Inspiré de la Boutique de Misa */}
        <div className="relative w-full rounded-[15px] overflow-hidden min-h-[160px] sm:min-h-[180px] md:min-h-[220px] bg-[#151515] border border-white/10 shadow-2xl flex flex-col justify-between p-5 sm:p-8 md:p-10">
          <div
            className="absolute inset-0 bg-cover bg-center opacity-40 transition-transform duration-700 hover:scale-105"
            style={{ backgroundImage: `url('${devisExpressBg}')` }}
          />
          <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/60 to-black/30" />

          <div className="relative z-10 flex flex-col items-start">
            <h1
              className="text-xl sm:text-2xl md:text-3xl lg:text-[36px] font-bold text-white uppercase tracking-[0.06em] leading-tight mb-3 lg:whitespace-nowrap"
              style={{ fontFamily: '"Glacial Indifference", system-ui, sans-serif' }}
            >
              Besoin d'un equipement a la hauteur de tes projets ?
            </h1>
            <div
              className="flex flex-col text-xs sm:text-sm md:text-base lg:text-[18px] text-white/90 italic font-normal tracking-[0.07em] leading-snug"
              style={{ fontFamily: '"Glacial Indifference", system-ui, sans-serif' }}
            >
              <p>" Explique-nous ton besoin, et notre équipe te prépare</p>
              <p className="pl-[4em] sm:pl-[14em] md:pl-[19.5em]">
                une recommandation et un devis sur mesure "
              </p>
            </div>
          </div>

          <div className="relative z-10 mt-6 md:mt-0 md:absolute md:bottom-8 md:right-8 lg:right-10">
            <button onClick={scrollToBesoins} className="btn-orange text-xs sm:text-sm uppercase tracking-wider shadow-lg">
              Demander un devis
            </button>
          </div>
        </div>

        {/* Grille des fonctionnalités */}
        {/* Chaque bloc est centré sur lui-même ; le 1er colle à gauche, le dernier à droite */}
        <div
          className="grid grid-cols-2 gap-4 -mt-2 lg:-mt-4 pb-3 border-b border-white/10 md:flex md:justify-between md:items-start"
          style={{ fontFamily: '"Glacial Indifference", system-ui, sans-serif' }}
        >
          {[
            { title: "Importation UE", text: "Produits sourcés d'Europe" },
            { title: "Garantie 24 Mois", text: "SAV local réactif" },
            { title: "Showroom Antananarivo", text: "Conseils & démonstration" },
            { title: "Livraison Madagascar", text: "Expédition sécurisée" },
          ].map((item) => (
            <div key={item.title} className="flex flex-col items-center text-center">
              <h4
                className="font-bold text-xs sm:text-sm lg:text-base uppercase tracking-[0.05em] text-white whitespace-nowrap"
                style={{ fontFamily: '"Glacial Indifference", system-ui, sans-serif' }}
              >
                {item.title}
              </h4>
              <p className="mt-1 text-[10px] sm:text-xs lg:text-sm tracking-[0.03em] text-zinc-300">
                {item.text}
              </p>
            </div>
          ))}
        </div>

        {/* Section Pourquoi demander un devis */}
        <div
          className="space-y-3 -mt-4 lg:-mt-6"
          style={{ fontFamily: '"Glacial Indifference", system-ui, sans-serif' }}
        >
          <h3
            className="text-sm sm:text-base lg:text-[17px] font-bold tracking-[0.06em] leading-none text-white"
            style={{ fontFamily: '"Glacial Indifference", system-ui, sans-serif' }}
          >
            Pourquoi demander un devis express ?
          </h3>
          <p className="text-xs sm:text-sm lg:text-base font-normal tracking-[0.04em] text-white/90 leading-snug">
            Parce que certains projets demandent plus qu'un simple produit.
          </p>
          <p className="text-xs sm:text-sm lg:text-base font-normal tracking-[0.04em] text-white/90 leading-snug">
            Notre équipe prend en charge ta demande sous 24 h ouvrées, analyse ton besoin et prépare une proposition adaptée à ton activité, ton budget et tes contraintes.
          </p>
        </div>

        {/* Titre Décris nous tes besoins : trait plein + tirets alignés, flèche au bout */}
        <div className="-mt-2 lg:-mt-4 mb-4" id="besoins-section">
          <h2
            className="relative inline-flex items-end gap-[0.45em] text-lg sm:text-xl md:text-2xl font-bold uppercase tracking-[0.03em] leading-none text-white"
            style={{ fontFamily: '"Glacial Indifference", system-ui, sans-serif' }}
          >
            <span
              className="pb-3"
              style={{
                backgroundImage: "linear-gradient(#fff, #fff)",
                backgroundSize: "100% 2px",
                backgroundPosition: "left bottom",
                backgroundRepeat: "no-repeat",
              }}
            >
              Decris nous
            </span>
            <span
              className="pb-3"
              style={{
                backgroundImage: "repeating-linear-gradient(to right, #fff 0 12px, transparent 12px 20px)",
                backgroundSize: "100% 2px",
                backgroundPosition: "left bottom",
                backgroundRepeat: "no-repeat",
              }}
            >
              tes besoins
            </span>
            <img
              src={curvedArrow}
              alt=""
              aria-hidden="true"
              className="absolute left-full top-[calc(100%-6px)] ml-2 h-6 w-6"
            />
          </h2>
        </div>

        {/* Formulaire Carte Blanche */}
        <div className="rounded-[15px] bg-white text-black p-5 sm:p-8 md:p-12 lg:p-14 shadow-2xl">
          <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-6 sm:gap-8 md:gap-12 lg:gap-16">
            {/* Colonne Gauche */}
            <div className="space-y-5 sm:space-y-6">
              <div>
                <input name="nom" value={form.nom} onChange={handleChange} type="text" placeholder="Nom et prénom(*)" className="form-input" required />
              </div>
              <div>
                <input name="email" value={form.email} onChange={handleChange} type="email" placeholder="Email(*)" className="form-input" required />
              </div>
              <div>
                <input name="budget" value={form.budget} onChange={handleChange} type="text" placeholder="Budget estimé" className="form-input" />
              </div>
              <div>
                <textarea name="besoin" value={form.besoin} onChange={handleChange} placeholder="Besoin spécifique(*)" className="form-input h-20 resize-none" required />
                <p className="text-[10px] text-gray-500 italic mt-2 leading-tight">
                  ex : équiper huit collaborateurs avec un PC Portable. Nos logiciels..., nos contraintes...(*)
                </p>
              </div>
            </div>

            {/* Colonne Droite */}
            <div className="space-y-5 sm:space-y-6">
              <div>
                <input name="telephone" value={form.telephone} onChange={handleChange} type="tel" placeholder="Téléphone(*)" className="form-input" required />
              </div>
              <div>
                <input name="entreprise" value={form.entreprise} onChange={handleChange} type="text" placeholder="Entreprise(*)" className="form-input" required />
              </div>
              <div>
                <input name="date_souhaitee" value={form.date_souhaitee} onChange={handleChange} type="date" className="form-input" />
              </div>

              <div>
                <textarea name="message" value={form.message} onChange={handleChange} placeholder="Message complémentaire" className="form-input h-20 resize-none" />
              </div>

              <div className="flex items-start gap-2 pt-2">
                <input name="accepte" checked={form.accepte} onChange={handleChange} type="checkbox" id="c" className="accent-black mt-1" required />
                <label htmlFor="c" className="text-xs font-medium text-gray-700 leading-snug">
                  J'accepte d'être contacté pour traiter ma demande.
                </label>
              </div>
            </div>

            {/* Section pièces jointes */}
            <div className="pt-4 md:pt-6 border-t border-gray-200">
              <input type="file" ref={fileInputRef} className="hidden" />
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="bg-black text-white px-5 py-2.5 rounded-lg flex items-center justify-center gap-2 text-xs font-bold uppercase tracking-wider hover:bg-black/90 transition-colors w-full sm:w-auto"
              >
                J'ajoute un fichier <FileText size={16} />
              </button>
            </div>

            {/* Section Envoi & WhatsApp */}
            <div className="pt-4 md:pt-6 flex flex-col items-center">
              <button type="submit" disabled={isSubmitting} className="btn-orange w-full max-w-[280px] mb-6 uppercase tracking-wide shadow-md disabled:cursor-not-allowed disabled:opacity-70">
                {isSubmitting ? "Envoi en cours..." : "J'envoie ma demande"}
              </button>
              <div className="flex items-center w-full gap-3 sm:gap-5 mb-6">
                <div className="h-[1px] bg-gray-200 flex-1"></div>
                <span className="text-[10px] sm:text-[11px] uppercase text-gray-400 font-bold tracking-widest whitespace-nowrap">
                  ou contacte nous sur
                </span>
                <div className="h-[1px] bg-gray-200 flex-1"></div>
              </div>
              <button type="button" onClick={handleWhatsApp} className="btn-whatsapp w-full max-w-[280px] justify-center">
                Envoyer via WhatsApp <MessageCircle size={18} />
              </button>
            </div>
          </form>
        </div>

        {/* Footer d'informations */}
        <div className="text-[12px] text-gray-400 italic space-y-1 pt-2">
          <p>" Réponse sous 24h avec devis d'importation "</p>
          <p>*: ces champs doivent être obligatoirement remplis</p>
          <div className="pt-4 font-bold text-white not-italic">
            <p className="mb-1 text-sm">Horaires:</p>
            <p className="text-xs sm:text-sm text-gray-300">Lundi - Vendredi : 8h - 17h</p>
          </div>
        </div>

      </div>
    </SiteLayout>
  );
};

export default DevisExpress;
