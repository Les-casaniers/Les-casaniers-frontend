import { useLocation } from "react-router-dom";
import { useEffect, useState } from "react";
import { Send, Phone, Mail, User, FileText, MessageCircle, CheckCircle, AlertCircle, Building, Calendar } from "lucide-react";
import { SiteLayout } from "@/components/site/SiteLayout";
import { Button } from "@/components/ui/button";
import { MiniHero } from "@/components/layout/MiniHero";
import api from "@/api/axios"; // Importer axios

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
    message: ""
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  useEffect(() => {
    document.title = "Devis Express — Les Casaniers Madagascar";
    const meta = document.querySelector('meta[name="description"]') ?? document.head.appendChild(
      Object.assign(document.createElement("meta"), { name: "description" })
    );
    meta.setAttribute(
      "content",
      "Devis express pour professionnels. Besoin d'un PC sur-mesure ou d'un service spécifique ? Contactez-nous directement."
    );
  }, []);

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, [location.pathname]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
    // Effacer les messages d'erreur quand l'utilisateur modifie le formulaire
    setErrorMessage("");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setErrorMessage("");
    setSuccessMessage("");

    try {
      const response = await api.post('/devis-express', formData);
      
      if (response.data.success) {
        setSuccessMessage(response.data.message);
        setFormSubmitted(true);
        // Réinitialiser le formulaire
        setFormData({
          nom: "",
          email: "",
          telephone: "",
          entreprise: "",
          besoin: "",
          budget: "",
          dateSouhaitee: "",
          message: ""
        });
      }
    } catch (error: any) {
      console.error('Erreur:', error);
      
      if (error.response?.data?.errors) {
        // Afficher les erreurs de validation
        const errors = error.response.data.errors;
        const firstError = Object.values(errors)[0];
        setErrorMessage(Array.isArray(firstError) ? firstError[0] : firstError);
      } else if (error.response?.data?.message) {
        setErrorMessage(error.response.data.message);
      } else {
        setErrorMessage("Une erreur est survenue. Veuillez réessayer.");
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  // Générer le message WhatsApp avec les données du formulaire
  const generateWhatsAppMessage = () => {
    const message = `Bonjour Les Casaniers !%0A%0A📋 *Demande de devis express*%0A%0A👤 *Nom:* ${formData.nom || "Non renseigné"}%0A📧 *Email:* ${formData.email || "Non renseigné"}%0A📞 *Téléphone:* ${formData.telephone || "Non renseigné"}%0A🏢 *Entreprise:* ${formData.entreprise || "Non renseigné"}%0A%0A🎯 *Besoin:* ${formData.besoin || "Non renseigné"}%0A💰 *Budget:* ${formData.budget || "Non renseigné"}%0A📅 *Date souhaitée:* ${formData.dateSouhaitee || "Non renseignée"}%0A%0A📝 *Message:*%0A${formData.message || "Non renseigné"}`;
    return `https://wa.me/261341234567?text=${message}`;
  };

  const whatsappNumber = "261341234567";

  return (
    <SiteLayout>
      <MiniHero
        title="Besoin d'un devis rapide ?"
        description="Pour les professionnels pressés ou les demandes spécifiques, contactez-nous directement. Réponse sous 24h ouvrées."
        bg="4.png"
      />

      <section className="py-16">
        <div className="container-x">
          <div className="grid lg:grid-cols-2 gap-12">

            {/* Formulaire */}
            <div className="space-y-6">
              <div>
                <h2 className="text-2xl font-bold mb-2">Formulaire de devis</h2>
                <p className="text-muted-foreground">
                  Remplissez ce formulaire et nous vous recontacterons dans les plus brefs délais.
                </p>
              </div>

              {/* Message d'erreur */}
              {errorMessage && (
                <div className="bg-red-50 dark:bg-red-950/20 border border-red-500 rounded-lg p-4">
                  <p className="text-red-600 dark:text-red-400 text-sm">{errorMessage}</p>
                </div>
              )}

              {/* Message de succès */}
              {successMessage && !formSubmitted && (
                <div className="bg-green-50 dark:bg-green-950/20 border border-green-500 rounded-lg p-4">
                  <p className="text-green-600 dark:text-green-400 text-sm">{successMessage}</p>
                </div>
              )}

              {formSubmitted ? (
                <div className="bg-green-50 dark:bg-green-950/20 border border-green-500 rounded-lg p-6 text-center">
                  <CheckCircle className="h-12 w-12 text-green-500 mx-auto mb-3" />
                  <h3 className="text-xl font-bold text-green-600 dark:text-green-400 mb-2">Demande envoyée !</h3>
                  <p className="text-muted-foreground mb-4">
                    Merci pour votre confiance. Nous vous répondrons sous 24h ouvrées.
                  </p>
                  <div className="flex gap-3 justify-center flex-wrap">
                    <a
                      href={generateWhatsAppMessage()}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-2 px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition"
                    >
                      <MessageCircle className="h-4 w-4" />
                      Contacter sur WhatsApp
                    </a>
                    <button
                      onClick={() => {
                        setFormSubmitted(false);
                        setSuccessMessage("");
                      }}
                      className="px-4 py-2 border border-border rounded-lg hover:bg-secondary transition"
                    >
                      Nouvelle demande
                    </button>
                  </div>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium mb-1 flex items-center gap-1">
                        <User className="h-3 w-3" /> Nom et prénom *
                      </label>
                      <input
                        type="text"
                        name="nom"
                        required
                        value={formData.nom}
                        onChange={handleChange}
                        className="w-full px-4 py-2 border border-border rounded-lg focus:outline-none focus:border-amber-500 bg-background"
                        placeholder="Jean Rakoto"
                        disabled={isSubmitting}
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-1 flex items-center gap-1">
                        <Mail className="h-3 w-3" /> Email *
                      </label>
                      <input
                        type="email"
                        name="email"
                        required
                        value={formData.email}
                        onChange={handleChange}
                        className="w-full px-4 py-2 border border-border rounded-lg focus:outline-none focus:border-amber-500 bg-background"
                        placeholder="contact@entreprise.mg"
                        disabled={isSubmitting}
                      />
                    </div>
                  </div>

                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium mb-1 flex items-center gap-1">
                        <Phone className="h-3 w-3" /> Téléphone *
                      </label>
                      <input
                        type="tel"
                        name="telephone"
                        required
                        value={formData.telephone}
                        onChange={handleChange}
                        className="w-full px-4 py-2 border border-border rounded-lg focus:outline-none focus:border-amber-500 bg-background"
                        placeholder="034 12 345 67"
                        disabled={isSubmitting}
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-1 flex items-center gap-1">
                        <Building className="h-3 w-3" /> Entreprise (optionnel)
                      </label>
                      <input
                        type="text"
                        name="entreprise"
                        value={formData.entreprise}
                        onChange={handleChange}
                        className="w-full px-4 py-2 border border-border rounded-lg focus:outline-none focus:border-amber-500 bg-background"
                        placeholder="Nom de votre société"
                        disabled={isSubmitting}
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-1 flex items-center gap-1">
                      <FileText className="h-3 w-3" /> Besoin spécifique *
                    </label>
                    <select
                      name="besoin"
                      required
                      value={formData.besoin}
                      onChange={handleChange}
                      className="w-full px-4 py-2 border border-border rounded-lg focus:outline-none focus:border-amber-500 bg-background"
                      disabled={isSubmitting}
                    >
                      <option value="">Sélectionnez votre besoin</option>
                      <option value="PC Gaming sur-mesure">🎮 PC Gaming sur-mesure</option>
                      <option value="Workstation professionnelle">💼 Workstation professionnelle</option>
                      <option value="Serveur / NAS">🖥️ Serveur / NAS</option>
                      <option value="Watercooling custom">💧 Watercooling custom</option>
                      <option value="Upgrade composants">🔧 Upgrade de composants</option>
                      <option value="Parc informatique entreprise">🏢 Parc informatique entreprise</option>
                      <option value="Autre service">❓ Autre service</option>
                    </select>
                  </div>

                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium mb-1">💰 Budget estimé</label>
                      <select
                        name="budget"
                        value={formData.budget}
                        onChange={handleChange}
                        className="w-full px-4 py-2 border border-border rounded-lg focus:outline-none focus:border-amber-500 bg-background"
                        disabled={isSubmitting}
                      >
                        <option value="">Sélectionnez un budget</option>
                        <option value="Moins de 2 000 000 Ar">Moins de 2 000 000 Ar</option>
                        <option value="2 000 000 - 3 500 000 Ar">2 000 000 - 3 500 000 Ar</option>
                        <option value="3 500 000 - 5 000 000 Ar">3 500 000 - 5 000 000 Ar</option>
                        <option value="5 000 000 - 8 000 000 Ar">5 000 000 - 8 000 000 Ar</option>
                        <option value="Plus de 8 000 000 Ar">Plus de 8 000 000 Ar</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-1 flex items-center gap-1">
                        <Calendar className="h-3 w-3" /> Date souhaitée
                      </label>
                      <input
                        type="date"
                        name="dateSouhaitee"
                        value={formData.dateSouhaitee}
                        onChange={handleChange}
                        className="w-full px-4 py-2 border border-border rounded-lg focus:outline-none focus:border-amber-500 bg-background"
                        disabled={isSubmitting}
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-1">Message complémentaire</label>
                    <textarea
                      name="message"
                      rows={4}
                      value={formData.message}
                      onChange={handleChange}
                      className="w-full px-4 py-2 border border-border rounded-lg focus:outline-none focus:border-amber-500 bg-background"
                      placeholder="Décrivez votre projet en quelques lignes..."
                      disabled={isSubmitting}
                    />
                  </div>

                  <div className="flex gap-3 pt-4 flex-wrap">
                    <Button 
                      type="submit" 
                      className="bg-gradient-to-r from-amber-500 to-orange-500 text-black hover:from-amber-600 hover:to-orange-600 flex items-center gap-2"
                      disabled={isSubmitting}
                    >
                      <Send className="h-4 w-4" />
                      {isSubmitting ? "Envoi en cours..." : "Envoyer ma demande"}
                    </Button>

                    <a
                      href={`https://wa.me/${whatsappNumber}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-2 px-4 py-2 border border-green-500 text-green-600 dark:text-green-400 rounded-lg hover:bg-green-50 dark:hover:bg-green-950/20 transition"
                    >
                      <MessageCircle className="h-4 w-4" />
                      Contacter WhatsApp
                    </a>
                  </div>

                  <p className="text-xs text-muted-foreground">
                    * Champs obligatoires. Vos informations sont confidentielles.
                  </p>
                </form>
              )}
            </div>

            {/* Section information - gardez le même contenu */}
            <div className="space-y-6">
              {/* WhatsApp direct */}
              <div className="bg-green-50 dark:bg-green-950/20 border border-green-500/30 rounded-xl p-6">
                <div className="flex items-center gap-3 mb-4">
                  <div className="p-2 bg-green-500 rounded-full">
                    <MessageCircle className="h-5 w-5 text-white" />
                  </div>
                  <h3 className="text-xl font-bold">Contact direct WhatsApp</h3>
                </div>
                <p className="text-muted-foreground mb-4">
                  Vous préférez nous contacter directement ? C'est par ici !
                </p>
                <a
                  href={`https://wa.me/${whatsappNumber}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 px-5 py-3 bg-green-500 text-white rounded-lg hover:bg-green-600 transition text-lg font-semibold"
                >
                  <MessageCircle className="h-5 w-5" />
                  Écrire sur WhatsApp
                </a>
                <p className="text-xs text-muted-foreground mt-3">
                  Réponse garantie sous 30 minutes pendant les heures d'ouverture
                </p>
              </div>

              {/* Pourquoi choisir le devis express */}
              <div className="bg-secondary/30 rounded-xl p-6">
                <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
                  <AlertCircle className="h-5 w-5 text-amber-500" />
                  Pourquoi utiliser Devis Express ?
                </h3>
                <ul className="space-y-3">
                  <li className="flex items-start gap-2">
                    <CheckCircle className="h-4 w-4 text-green-500 mt-0.5 shrink-0" />
                    <span className="text-sm">Réponse sous 24h ouvrées</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle className="h-4 w-4 text-green-500 mt-0.5 shrink-0" />
                    <span className="text-sm">Devis personnalisé selon votre besoin</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle className="h-4 w-4 text-green-500 mt-0.5 shrink-0" />
                    <span className="text-sm">Pour les demandes spécifiques hors catalogue</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle className="h-4 w-4 text-green-500 mt-0.5 shrink-0" />
                    <span className="text-sm">Solutions pour professionnels (parc informatique)</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle className="h-4 w-4 text-green-500 mt-0.5 shrink-0" />
                    <span className="text-sm">Accompagnement personnalisé</span>
                  </li>
                </ul>
              </div>

              {/* Horaires de contact */}
              <div className="bg-amber-50 dark:bg-amber-950/10 border border-amber-500/30 rounded-xl p-6">
                <h3 className="font-bold mb-3">📞 Nos horaires de réponse</h3>
                <div className="space-y-2 text-sm">
                  <p><strong>Lundi - Vendredi :</strong> 9h00 - 18h00</p>
                  <p><strong>Samedi :</strong> 9h00 - 17h00</p>
                  <p className="text-muted-foreground">Hors de ces horaires, laissez-nous un message, nous vous répondons dès l'ouverture.</p>
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