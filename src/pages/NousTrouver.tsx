import { useLocation } from "react-router-dom";
import { useEffect } from "react";
import { MapPin, Phone, Mail, Clock, Instagram, Facebook, Linkedin, ExternalLink } from "lucide-react";
import { SiteLayout } from "@/components/site/SiteLayout";
import atelierCasanier from "@/assets/atelierCasanier.jpg";

const NousTrouver = () => {
  const location = useLocation();

  useEffect(() => {
    document.title = "Nous trouver — Les Casaniers Madagascar";
    const meta = document.querySelector('meta[name="description"]') ?? document.head.appendChild(
      Object.assign(document.createElement("meta"), { name: "description" })
    );
    meta.setAttribute(
      "content",
      "Visitez notre showroom et atelier à Tananarive. Adresse, carte GPS, horaires et contacts."
    );
  }, []);

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, [location.pathname]);

  return (
    <SiteLayout>
      <section className="py-16 bg-gradient-to-br from-blue-500/10 to-blue-400/5 border-b border-border">
        <div className="container-x text-center">
          <div className="flex items-center justify-center gap-2 mb-4">
            <MapPin className="h-6 w-6 text-blue-500" />
            <h1 className="text-4xl md:text-5xl font-bold">Nous trouver</h1>
          </div>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Venez découvrir notre showroom et notre atelier à Tananarive.
            Nos équipes vous accueillent du lundi au samedi.
          </p>
        </div>
      </section>

      <section className="py-16">
        <div className="container-x">
          <div className="grid lg:grid-cols-2 gap-12">
            {/* Carte Google Maps */}
            <div className="space-y-4">
              <h2 className="text-2xl font-bold flex items-center gap-2">
                <MapPin className="h-5 w-5 text-red-500" />
                Notre adresse
              </h2>
              <div className="bg-secondary/50 p-4 rounded-lg">
                <p className="font-medium">📍 Les Casaniers</p>
                <p className="text-muted-foreground mt-1">
                  Lot IV 68 Andraharo<br />
                  Tananarive 101, Madagascar
                </p>
                <a 
                  href="https://maps.google.com/?q=Andraharo+Tananarive+Madagascar" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 mt-3 text-sm text-blue-500 hover:underline"
                >
                  Ouvrir dans Google Maps <ExternalLink className="h-3 w-3" />
                </a>
              </div>

              <div className="rounded-lg overflow-hidden border border-border shadow-lg h-96">
                <iframe
                  src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d4008.4424475683035!2d47.52933094391013!3d-18.88316924033944!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x21f07e6a5e8a4e3b%3A0x8c9e3d5f2a7e4d33!2sAndraharo%2C%20Antananarivo!5e1!3m2!1sfr!2smg!4v1700000000000!5m2!1sfr!2smg"
                  width="100%"
                  height="100%"
                  style={{ border: 0 }}
                  allowFullScreen
                  loading="lazy"
                  referrerPolicy="no-referrer-when-downgrade"
                  title="Carte Les Casaniers"
                />
              </div>
            </div>

            {/* Infos de contact et atelier */}
            <div className="space-y-8">
                <div>
                <h2 className="text-2xl font-bold mb-4">Notre atelier</h2>
                <div className="rounded-lg overflow-hidden border border-border shadow-lg">
                    <img 
                    src={atelierCasanier}
                    alt="Atelier Les Casaniers - Montage de PC gaming"
                    className="w-full h-auto object-cover hover:scale-105 transition-transform duration-500"
                    />
                </div>
                <p className="text-sm text-muted-foreground mt-2 text-center">
                    Nos techniciens préparent votre PC avec passion
                </p>
                </div>

              <div className="bg-secondary/30 rounded-lg p-6">
                <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
                  📞 Contacts
                </h2>
                <div className="space-y-3">
                  <div className="flex items-center gap-3">
                    <Phone className="h-4 w-4 text-green-500" />
                    <a href="tel:+261341234567" className="hover:underline">+261 34 12 345 67</a>
                  </div>
                  <div className="flex items-center gap-3">
                    <Mail className="h-4 w-4 text-blue-500" />
                    <a href="mailto:contact@lescasaniers.mg" className="hover:underline">contact@lescasaniers.mg</a>
                  </div>
                  <div className="flex items-center gap-3">
                    <Clock className="h-4 w-4 text-amber-500" />
                    <span>Lun - Sam: 9h00 - 18h00</span>
                  </div>
                </div>
              </div>

              <div className="bg-secondary/30 rounded-lg p-6">
                <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
                  🕐 Horaires d'ouverture
                </h2>
                <div className="space-y-2">
                  <div className="flex justify-between py-2 border-b border-border">
                    <span>Lundi - Vendredi</span>
                    <span className="font-medium">9h00 - 18h00</span>
                  </div>
                  <div className="flex justify-between py-2 border-b border-border">
                    <span>Samedi</span>
                    <span className="font-medium">9h00 - 17h00</span>
                  </div>
                  <div className="flex justify-between py-2">
                    <span>Dimanche</span>
                    <span className="text-muted-foreground">Fermé</span>
                  </div>
                </div>
              </div>

              <div className="bg-secondary/30 rounded-lg p-6">
                <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
                  🌐 Suivez-nous
                </h2>
                <div className="flex gap-4">
                  <a href="#" className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition">
                    <Facebook className="h-4 w-4" /> Facebook
                  </a>
                  <a href="#" className="flex items-center gap-2 px-4 py-2 bg-pink-600 text-white rounded-lg hover:bg-pink-700 transition">
                    <Instagram className="h-4 w-4" /> Instagram
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </SiteLayout>
  );
};

export default NousTrouver;