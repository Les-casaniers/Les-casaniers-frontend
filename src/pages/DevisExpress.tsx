import { useLocation } from "react-router-dom";
import { useEffect, useState } from "react";
import {
  Send,
  Phone,
  Mail,
  User,
  FileText,
  MessageCircle,
  CheckCircle,
  AlertCircle,
  Building,
  Calendar,
  Building2,
  Wallet,
  Clock,
  Sparkles,
  Shield,
  Zap,
} from "lucide-react";
import { SiteLayout } from "@/components/site/SiteLayout";
import { Button } from "@/components/ui/button";
import { MiniHero } from "@/components/layout/MiniHero";

const DevisExpress = () => {
  const location = useLocation();
  const [formSubmitted, setFormSubmitted] = useState(false);
  const [formData, setFormData] = useState({
    nom: "",
    email: "",
    telephone: "",
    entreprise: "",
    besoin: "",
    budget: "",
    dateSouhaitee: "",
    message: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    document.title = "Devis Express — Les Casaniers Madagascar";
    const meta =
      document.querySelector('meta[name="description"]') ??
      document.head.appendChild(
        Object.assign(document.createElement("meta"), { name: "description" }),
      );
    meta.setAttribute(
      "content",
      "Devis express pour professionnels. Besoin d'un PC sur-mesure ou d'un service spécifique ? Contactez-nous directement.",
    );
  }, []);

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, [location.pathname]);

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >,
  ) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  // const handleSubmit = async (e: React.FormEvent) => {
  //   e.preventDefault();
  //   setIsSubmitting(true);
  //   setTimeout(() => {
  //     setFormSubmitted(true);
  //     setIsSubmitting(false);
  //   }, 1000);
  // };
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    console.log("Formulaire soumis !"); 
    setIsSubmitting(true);

    const API_URL = import.meta.env.VITE_API_URL || "http://localhost:8000/api";
    console.log("URL appelée:", `${API_URL}/devis-express`); 

    try {
      const response = await fetch(`${API_URL}/devis-express`, {
        method: "POST", 
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        body: JSON.stringify({
          nom: formData.nom,
          email: formData.email,
          telephone: formData.telephone,
          entreprise: formData.entreprise || null,
          besoin: formData.besoin,
          budget: formData.budget || null,
          date_souhaitee: formData.dateSouhaitee || null,
          message: formData.message || null,
        }),
      });

      console.log("Réponse status:", response.status); // ← Ajoutez ceci
      const data = await response.json();
      console.log("Données réponse:", data); // ← Ajoutez ceci

      if (response.ok && data.success) {
        setFormSubmitted(true);
      } else {
        if (data.errors) {
          const errorMessages = Object.values(data.errors).flat().join("\n");
          alert(`Erreurs de validation:\n${errorMessages}`);
        } else {
          alert(data.message || "Une erreur est survenue");
        }
      }
    } catch (error) {
      console.error("Erreur:", error);
      alert("Erreur de connexion au serveur");
    } finally {
      setIsSubmitting(false);
    }
  };

  const whatsappNumber = "261329356242";

  const generateWhatsAppMessage = () => {
    const message = `Bonjour Les Casaniers !%0A%0A*Demande de devis express*%0A%0A*Nom:* ${formData.nom || "Non renseigné"}%0A*Email:* ${formData.email || "Non renseigné"}%0A*Téléphone:* ${formData.telephone || "Non renseigné"}%0A*Entreprise:* ${formData.entreprise || "Non renseigné"}%0A%0A*Besoin:* ${formData.besoin || "Non renseigné"}%0A*Budget:* ${formData.budget || "Non renseigné"}%0A*Date souhaitée:* ${formData.dateSouhaitee || "Non renseignée"}%0A%0A*Message:* ${formData.message || "Non renseigné"}`;
    return `https://wa.me/${whatsappNumber}?text=${message}`;
  };

  return (
    <SiteLayout>
      <MiniHero
        title="Besoin d'un devis rapide ?"
        description="Pour les professionnels pressés ou les demandes spécifiques, contactez-nous directement. Réponse sous 24h ouvrées."
        bg="4.png"
        pill={{ icon: <Zap className="h-3.5 w-3.5" />, label: "Devis Express" }}
      />

      <section className="py-8">
        <div className="container-x">
          <div className="grid lg:grid-cols-2 gap-6">
            {/* Formulaire */}
            <div className="space-y-4">
              <div className="flex items-center gap-2 mb-2">
                <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-amber-500 to-orange-500 flex items-center justify-center">
                  <FileText className="h-4 w-4 text-white" />
                </div>
                <div>
                  <h2 className="text-lg font-bold">Formulaire de devis</h2>
                  <p className="text-[10px] text-muted-foreground">
                    Remplissez et nous vous recontactons sous 24h
                  </p>
                </div>
              </div>

              {formSubmitted ? (
                <div className="rounded-lg bg-green-500/10 border border-green-500/30 p-5 text-center">
                  <div className="inline-flex h-12 w-12 rounded-full bg-green-500/20 items-center justify-center mb-3">
                    <CheckCircle className="h-6 w-6 text-green-500" />
                  </div>
                  <h3 className="text-base font-bold text-green-600 dark:text-green-400 mb-1">
                    Demande envoyée !
                  </h3>
                  <p className="text-xs text-muted-foreground mb-4">
                    Merci pour votre confiance. Réponse sous 24h ouvrées.
                  </p>
                  <div className="flex flex-wrap gap-2 justify-center">
                    <a
                      href={generateWhatsAppMessage()}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-green-600 text-white text-xs rounded-lg hover:bg-green-700 transition"
                    >
                      <MessageCircle className="h-3 w-3" /> WhatsApp
                    </a>
                    <button
                      onClick={() => setFormSubmitted(false)}
                      className="px-3 py-1.5 border border-border text-xs rounded-lg hover:bg-secondary transition"
                    >
                      Nouvelle demande
                    </button>
                  </div>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-3">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[11px] font-medium mb-1 flex items-center gap-1">
                        <User className="h-3 w-3" /> Nom complet *
                      </label>
                      <input
                        type="text"
                        name="nom"
                        required
                        value={formData.nom}
                        onChange={handleChange}
                        className="w-full h-9 px-3 text-sm border border-border rounded-lg focus:border-primary focus:outline-none bg-background"
                        placeholder="Jean Rakoto"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-medium mb-1 flex items-center gap-1">
                        <Mail className="h-3 w-3" /> Email *
                      </label>
                      <input
                        type="email"
                        name="email"
                        required
                        value={formData.email}
                        onChange={handleChange}
                        className="w-full h-9 px-3 text-sm border border-border rounded-lg focus:border-primary focus:outline-none bg-background"
                        placeholder="contact@email.mg"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[11px] font-medium mb-1 flex items-center gap-1">
                        <Phone className="h-3 w-3" /> Téléphone *
                      </label>
                      <input
                        type="tel"
                        name="telephone"
                        required
                        value={formData.telephone}
                        onChange={handleChange}
                        className="w-full h-9 px-3 text-sm border border-border rounded-lg focus:border-primary focus:outline-none bg-background"
                        placeholder="034 12 345 67"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-medium mb-1 flex items-center gap-1">
                        <Building2 className="h-3 w-3" /> Entreprise
                      </label>
                      <input
                        type="text"
                        name="entreprise"
                        value={formData.entreprise}
                        onChange={handleChange}
                        className="w-full h-9 px-3 text-sm border border-border rounded-lg focus:border-primary focus:outline-none bg-background"
                        placeholder="Nom société"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-[11px] font-medium mb-1 flex items-center gap-1">
                      <FileText className="h-3 w-3" /> Besoin spécifique *
                    </label>
                    <select
                      name="besoin"
                      required
                      value={formData.besoin}
                      onChange={handleChange}
                      className="w-full h-9 px-3 text-sm border border-border rounded-lg focus:border-primary focus:outline-none bg-background"
                    >
                      <option value="">Sélectionnez votre besoin</option>
                      <option value="PC Gaming sur-mesure">
                        PC Gaming sur-mesure
                      </option>
                      <option value="Workstation professionnelle">
                        Workstation professionnelle
                      </option>
                      <option value="Serveur / NAS">Serveur / NAS</option>
                      <option value="Watercooling custom">
                        Watercooling custom
                      </option>
                      <option value="Upgrade composants">
                        Upgrade de composants
                      </option>
                      <option value="Parc informatique entreprise">
                        Parc informatique entreprise
                      </option>
                      <option value="Autre service">Autre service</option>
                    </select>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[11px] font-medium mb-1 flex items-center gap-1">
                        <Wallet className="h-3 w-3" /> Budget estimé
                      </label>
                      <select
                        name="budget"
                        value={formData.budget}
                        onChange={handleChange}
                        className="w-full h-9 px-3 text-sm border border-border rounded-lg focus:border-primary focus:outline-none bg-background"
                      >
                        <option value="">Sélectionnez un budget</option>
                        <option value="Moins de 2 000 000 Ar">
                          Moins de 2M Ar
                        </option>
                        <option value="2 000 000 - 3 500 000 Ar">
                          2M - 3.5M Ar
                        </option>
                        <option value="3 500 000 - 5 000 000 Ar">
                          3.5M - 5M Ar
                        </option>
                        <option value="5 000 000 - 8 000 000 Ar">
                          5M - 8M Ar
                        </option>
                        <option value="Plus de 8 000 000 Ar">
                          Plus de 8M Ar
                        </option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-[11px] font-medium mb-1 flex items-center gap-1">
                        <Calendar className="h-3 w-3" /> Date souhaitée
                      </label>
                      <input
                        type="date"
                        name="dateSouhaitee"
                        value={formData.dateSouhaitee}
                        onChange={handleChange}
                        className="w-full h-9 px-3 text-sm border border-border rounded-lg focus:border-primary focus:outline-none bg-background"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-[11px] font-medium mb-1">
                      Message complémentaire
                    </label>
                    <textarea
                      name="message"
                      rows={3}
                      value={formData.message}
                      onChange={handleChange}
                      className="w-full px-3 py-2 text-sm border border-border rounded-lg focus:border-primary focus:outline-none bg-background resize-none"
                      placeholder="Décrivez votre projet..."
                    />
                  </div>

                  <div className="flex flex-wrap gap-2 pt-2">
                    <Button
                      type="submit"
                      className="h-9 px-4 bg-gradient-to-r from-amber-500 to-orange-500 text-black text-xs font-medium hover:from-amber-600 hover:to-orange-600"
                    >
                      <Send className="h-3.5 w-3.5 mr-1.5" />
                      {isSubmitting ? "Envoi..." : "Envoyer ma demande"}
                    </Button>
                    <a
                      href={`https://wa.me/${whatsappNumber}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 border border-green-500/50 text-green-600 text-xs rounded-lg hover:bg-green-500/10 transition"
                    >
                      <MessageCircle className="h-3 w-3" /> WhatsApp
                    </a>
                  </div>

                  <p className="text-[9px] text-muted-foreground">
                    * Champs obligatoires. Vos informations sont
                    confidentielles.
                  </p>
                </form>
              )}
            </div>

            {/* Section information compacte */}
            <div className="space-y-4">
              {/* WhatsApp direct */}
              <div className="rounded-lg bg-gradient-to-r from-green-500/10 to-emerald-500/5 border border-green-500/20 p-4">
                <div className="flex items-center gap-2 mb-2">
                  <div className="h-8 w-8 rounded-full bg-green-500 flex items-center justify-center">
                    <MessageCircle className="h-4 w-4 text-white" />
                  </div>
                  <h3 className="text-sm font-bold">Contact direct WhatsApp</h3>
                </div>
                <p className="text-[10px] text-muted-foreground mb-3">
                  Une question ? Un besoin urgent ? Contactez-nous directement.
                </p>
                <a
                  href={`https://wa.me/${whatsappNumber}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 px-4 py-2 bg-green-600 text-white text-xs font-medium rounded-lg hover:bg-green-700 transition w-full justify-center"
                >
                  <MessageCircle className="h-3.5 w-3.5" /> Écrire sur WhatsApp
                </a>
                <p className="text-[8px] text-muted-foreground mt-2 text-center">
                  Réponse sous 30 min (horaire ouvré)
                </p>
              </div>

              {/* Pourquoi choisir le devis express */}
              <div className="rounded-lg border border-border/50 bg-secondary/20 p-4">
                <div className="flex items-center gap-2 mb-3">
                  <div className="h-7 w-7 rounded-lg bg-amber-500/10 flex items-center justify-center">
                    <Sparkles className="h-3.5 w-3.5 text-amber-500" />
                  </div>
                  <h3 className="text-sm font-bold">
                    Pourquoi Devis Express ?
                  </h3>
                </div>
                <div className="grid grid-cols-1 gap-2">
                  {[
                    "Réponse sous 24h ouvrées",
                    "Devis personnalisé",
                    "Demandes spécifiques",
                    "Solutions professionnelles",
                    "Accompagnement personnalisé",
                  ].map((item, idx) => (
                    <div key={idx} className="flex items-center gap-1.5">
                      <CheckCircle className="h-3 w-3 text-green-500 shrink-0" />
                      <span className="text-[10px] text-muted-foreground">
                        {item}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Horaires de contact */}
              <div className="rounded-lg bg-amber-500/5 border border-amber-500/20 p-4">
                <div className="flex items-center gap-2 mb-2">
                  <Clock className="h-3.5 w-3.5 text-amber-500" />
                  <h3 className="text-sm font-bold">Horaires de réponse</h3>
                </div>
                <div className="space-y-1 text-[10px]">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">
                      Lundi - Vendredi :
                    </span>
                    <span className="font-medium">9h00 - 18h00</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Samedi :</span>
                    <span className="font-medium">9h00 - 17h00</span>
                  </div>
                  <p className="text-[9px] text-muted-foreground mt-2">
                    Hors horaires, laissez un message, réponse dès l'ouverture.
                  </p>
                </div>
              </div>

              {/* Garanties */}
              <div className="rounded-lg border border-border/50 bg-card p-4">
                <div className="flex items-center gap-2 mb-2">
                  <Shield className="h-3.5 w-3.5 text-primary" />
                  <h3 className="text-sm font-bold">Nos garanties</h3>
                </div>
                <div className="flex flex-wrap gap-2">
                  <span className="px-2 py-0.5 bg-primary/10 text-[9px] font-medium rounded-full">
                    Confidentialité
                  </span>
                  <span className="px-2 py-0.5 bg-primary/10 text-[9px] font-medium rounded-full">
                    Sans engagement
                  </span>
                  <span className="px-2 py-0.5 bg-primary/10 text-[9px] font-medium rounded-full">
                    Réponse garantie
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </SiteLayout>
  );
};

export default DevisExpress;
