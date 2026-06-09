// import mascot from "@/assets/casaniers-mascot.png";
// import logoImg from "@/assets/casaniers-logo.jpg";
// import { Facebook, Instagram, Youtube, Twitch, MapPin, Phone, Mail, ArrowUpRight } from "lucide-react";
// import { useState } from "react";
// import { useNavigate } from "react-router-dom";

// const cols = [
//   { title: "Boutique", links: ["Pro & Freelance", "Gaming", "Composants", "Périphériques", "Importation SOS"] },
//   { title: "Services", links: ["Configurateur", "Devis Pro", "SAV & Maintenance", "Audit de parc", "Showroom"] },
//   { title: "Maison", links: ["Guides d'achat", "Actualités Tech", "Tutos Maintenance", "À propos", "Équipe"] },
//   { title: "Légal", links: ["CGV", "CGU", "Mentions légales", "Confidentialité", "Cookies"] },
// ];

// export const Footer = () => (
//   <footer className="bg-foreground text-background relative overflow-hidden">
//     {/* Newsletter band */}
//     <div className="border-b border-background/10">
//       <div className="container-x py-12 grid lg:grid-cols-2 gap-8 items-center">
//         <div>
//           <div className="text-[10px] uppercase tracking-[0.4em] opacity-60 mb-3">La lettre des Casaniers</div>
//           <h3 className="font-display font-black text-3xl lg:text-4xl tracking-tight">
//             Recevez nos nouveautés <span className="italic font-light">avant tout le monde.</span>
//           </h3>
//         </div>
//         <form className="flex gap-0">
//           <input
//             type="email"
//             placeholder="Votre email"
//             className="flex-1 h-14 px-5 bg-transparent border border-background/30 text-background placeholder:text-background/40 focus:border-background focus:outline-none text-sm"
//           />
//           <button className="h-14 px-6 bg-background text-foreground font-bold uppercase tracking-wider text-xs hover:bg-background/80 transition-colors flex items-center gap-2">
//             S'inscrire <ArrowUpRight className="h-4 w-4" />
//           </button>
//         </form>
//       </div>
//     </div>

//     <div className="container-x relative pt-16 pb-10">
//       <div className="grid lg:grid-cols-12 gap-10 mb-14">
//         <div className="lg:col-span-4">
//           <img src={logoImg} alt="Les Casaniers" className="h-16 w-auto object-contain" />
//           <p className="text-sm text-background/70 mt-5 leading-relaxed max-w-sm">
//             PC sur-mesure, conseils d'experts, importation directe d'Europe. La maison qui assemble votre machine idéale.
//           </p>

//           <div className="space-y-2 mt-6 text-sm text-background/80">
//             <div className="flex items-center gap-2"><MapPin className="h-4 w-4" /> Showroom · Tananarive</div>
//             <div className="flex items-center gap-2"><Phone className="h-4 w-4" /> +261 34 00 000 00</div>
//             <div className="flex items-center gap-2"><Mail className="h-4 w-4" /> contact@lescasaniers.mg</div>
//           </div>

//           <div className="flex gap-2 mt-6">
//             {[Facebook, Instagram, Youtube, Twitch].map((Icon, i) => (
//               <a key={i} href="#" className="h-10 w-10 border border-background/20 flex items-center justify-center hover:bg-background hover:text-foreground transition-colors">
//                 <Icon className="h-4 w-4" />
//               </a>
//             ))}
//           </div>
//         </div>

//         <div className="lg:col-span-7 lg:col-start-6 grid grid-cols-2 sm:grid-cols-4 gap-6">
//           {cols.map((c) => (
//             <div key={c.title}>
//               <div className="text-[10px] font-bold uppercase tracking-[0.3em] mb-4">{c.title}</div>
//               <ul className="space-y-2.5">
//                 {c.links.map((l) => (
//                   <li key={l}>
//                     <a href="#" className="text-sm text-background/70 hover:text-background transition-colors">{l}</a>
//                   </li>
//                 ))}
//               </ul>
//             </div>
//           ))}
//         </div>
//       </div>

//       <div className="border-t border-background/10 pt-6 flex flex-col md:flex-row items-center justify-between gap-4 text-xs text-background/60">
//         <div className="flex items-center gap-3">
//           <img src={mascot} alt="" aria-hidden className="h-12 w-12 object-contain -scale-x-100" />
//           <span>À très vite — © 2026 Les Casaniers Madagascar</span>
//         </div>
//         <span>Importation Europe · Garantie 24 mois · Made in Antananarivo</span>
//       </div>
//     </div>
//   </footer>
// );

import mascot from "@/assets/casaniers-mascot.png";
import logoImg from "@/assets/casaniers-logo.jpg";
import { Facebook, Instagram, Youtube, Twitch, MapPin, Phone, Mail, ArrowUpRight } from "lucide-react";
import { useState } from "react";
import { useNavigate } from "react-router-dom";

const cols = [
  { title: "Boutique", links: ["Pro & Freelance", "Gaming", "Composants", "Périphériques", "Importation SOS"] },
  { title: "Services", links: ["Configurateur", "Devis Pro", "SAV & Maintenance", "Audit de parc", "Showroom"] },
  { title: "Maison", links: ["Guides d'achat", "Actualités Tech", "Tutos Maintenance", "À propos", "Équipe"] },
  { title: "Légal", links: ["CGV", "CGU", "Mentions légales", "Confidentialité", "Cookies"] },
];

export const Footer = () => {
  const [newsletterEmail, setNewsletterEmail] = useState("");
  const navigate = useNavigate();

  const handleNewsletterSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (newsletterEmail && newsletterEmail.trim() !== "") {
      sessionStorage.setItem("newsletterEmail", newsletterEmail.trim());
      navigate("/inscription");
    }
  };

  return (
    <footer className="bg-foreground text-background relative overflow-hidden">
      {/* Newsletter band */}
      <div className="border-b border-background/10">
        <div className="container-x py-12 grid lg:grid-cols-2 gap-8 items-center">
          <div>
            <div className="text-[10px] uppercase tracking-[0.4em] opacity-60 mb-3">La lettre des Casaniers</div>
            <h3 className="font-display font-black text-3xl lg:text-4xl tracking-tight">
              Recevez nos nouveautés <span className="italic font-light">avant tout le monde.</span>
            </h3>
          </div>
          <form onSubmit={handleNewsletterSubmit} className="flex gap-0">
            <input
              type="email"
              placeholder="Votre email"
              value={newsletterEmail}
              onChange={(e) => setNewsletterEmail(e.target.value)}
              required
              className="flex-1 h-14 px-5 bg-transparent border border-background/30 text-background placeholder:text-background/40 focus:border-background focus:outline-none text-sm"
            />
            <button className="h-14 px-6 bg-background text-foreground font-bold uppercase tracking-wider text-xs hover:bg-background/80 transition-colors flex items-center gap-2">
              S'inscrire <ArrowUpRight className="h-4 w-4" />
            </button>
          </form>
        </div>
      </div>

      <div className="container-x relative pt-16 pb-10">
        <div className="grid lg:grid-cols-12 gap-10 mb-14">
          <div className="lg:col-span-4">
            <img src={logoImg} alt="Les Casaniers" className="h-16 w-auto object-contain" />
            <p className="text-sm text-background/70 mt-5 leading-relaxed max-w-sm">
              PC sur-mesure, conseils d'experts, importation directe d'Europe. La maison qui assemble votre machine idéale.
            </p>

            <div className="space-y-2 mt-6 text-sm text-background/80">
              <div className="flex items-center gap-2"><MapPin className="h-4 w-4" /> Showroom · Tananarive</div>
              <div className="flex items-center gap-2"><Phone className="h-4 w-4" /> +261 34 00 000 00</div>
              <div className="flex items-center gap-2"><Mail className="h-4 w-4" /> contact@lescasaniers.mg</div>
            </div>

            <div className="flex gap-2 mt-6">
              {[Facebook, Instagram, Youtube, Twitch].map((Icon, i) => (
                <a key={i} href="#" className="h-10 w-10 border border-background/20 flex items-center justify-center hover:bg-background hover:text-foreground transition-colors">
                  <Icon className="h-4 w-4" />
                </a>
              ))}
            </div>
          </div>

          <div className="lg:col-span-7 lg:col-start-6 grid grid-cols-2 sm:grid-cols-4 gap-6">
            {cols.map((c) => (
              <div key={c.title}>
                <div className="text-[10px] font-bold uppercase tracking-[0.3em] mb-4">{c.title}</div>
                <ul className="space-y-2.5">
                  {c.links.map((l) => (
                    <li key={l}>
                      <a href="#" className="text-sm text-background/70 hover:text-background transition-colors">{l}</a>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>

        <div className="border-t border-background/10 pt-6 flex flex-col md:flex-row items-center justify-between gap-4 text-xs text-background/60">
          <div className="flex items-center gap-3">
            <img src={mascot} alt="" aria-hidden className="h-12 w-12 object-contain -scale-x-100" />
            <span>À très vite — © 2026 Les Casaniers Madagascar</span>
          </div>
          <span>Importation Europe · Garantie 24 mois · Made in Antananarivo</span>
        </div>
      </div>
    </footer>
  );
};