import { useLocation } from "react-router-dom";
import { useEffect, useState } from "react";
// import { Package, Truck, Clock, Shield, CheckCircle, Plus, Send, Plane, Ship } from "lucide-react";
import { Truck, Send, Paperclip } from "lucide-react"; // Garde seulement ce qui est utilisé
// import { Link } from "react-router-dom";
import { SiteLayout } from "@/components/site/SiteLayout";
import { MiniHero } from "@/components/layout/MiniHero";
// import { InfoBar } from "@/components/site/InfoBar";
// import Mascote from "@/assets/3.png";

const Importation = () => {
  const location = useLocation();

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    categorie: "",
    telephone: "",
    societe: "",
    nom: "",
    email: "",
    description: "",
  });
  const [fichier, setFichier] = useState(null);

  const [isSubmittingChine, setIsSubmittingChine] = useState(false);
  const [formDataChine, setFormDataChine] = useState({
    categorie: "",
    telephone: "",
    entreprise: "",
    nom: "",
    email: "",
    description: "",
  });
  const [fichierChine, setFichierChine] = useState(null);

  useEffect(() => {
    document.title = "Importation — Les Casaniers Madagascar";
    const meta = document.querySelector('meta[name="description"]') ?? document.head.appendChild(
      Object.assign(document.createElement("meta"), { name: "description" })
    );
    meta.setAttribute(
      "content",
      "Commande de pièces détachées, suivi commande, délais d'importation et normes européennes."
    );
  }, []);

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, [location.pathname]);

  const handleSubmit = (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    // Logique d'envoi du formulaire
    console.log("Formulaire soumis:", formData, fichier);
    setTimeout(() => setIsSubmitting(false), 2000);
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleFileChange = (e) => {
    const file = e.target.files?.[0] ?? null;
    setFichier(file);
  };

  const handleSubmitChine = (e) => {
    e.preventDefault();
    setIsSubmittingChine(true);
    // Logique d'envoi du formulaire Chine-Madagascar
    console.log("Formulaire Chine soumis:", formDataChine, fichierChine);
    setTimeout(() => setIsSubmittingChine(false), 2000);
  };

  const handleChangeChine = (e) => {
    setFormDataChine({
      ...formDataChine,
      [e.target.name]: e.target.value,
    });
  };

  const handleFileChangeChine = (e) => {
    const file = e.target.files?.[0] ?? null;
    setFichierChine(file);
  };

  /* ============================================
     ANCIENNES SECTIONS COMMENTÉES (contenu détaillé
     commande pièces / suivi / délais) — inchangé,
     conservé au cas où on veuille le réutiliser
     ============================================ */
  /*
  const sections = [
    {
      id: "commande-pieces",
      title: "Commande de pièces détachées",
      icon: <Package className="h-6 w-6" />,
      color: "text-blue-500",
      bgColor: "bg-blue-500/10",
      borderColor: "border-blue-500",
      description: "Commandez vos pièces détachées directement depuis la Chine.",
      content: {
        intro: "Les importations des pièces détachées viennent de Chine. Nous pouvons trouver toutes les appareils électroniques que vous voulez.",
        points: [
          "Accès direct aux fournisseurs chinois",
          "Large choix de composants : CPU, GPU, RAM, cartes mères, alimentations, etc.",
          "Tous types d'appareils électroniques disponibles sur demande",
          "Pièces rares ou en rupture de stock à Madagascar",
          "Livraison sécurisée à Tananarive"
        ],
        process: [
          { step: "1", title: "Demande", desc: "Contactez-nous avec la référence" },
          { step: "2", title: "Devis", desc: "Sous 48h" },
          { step: "3", title: "Commande", desc: "Confirmation" },
          { step: "4", title: "Importation", desc: "Expédition" },
          { step: "5", title: "Livraison", desc: "À domicile" }
        ]
      }
    },
    {
      id: "suivi-commande",
      title: "Suivi commande",
      icon: <Truck className="h-6 w-6" />,
      color: "text-green-500",
      bgColor: "bg-green-500/10",
      borderColor: "border-green-500",
      description: "Suivez votre commande en temps réel.",
      content: {
        intro: "Un suivi transparent pour toutes vos commandes :",
        points: [
          "Numéro de suivi unique pour chaque commande",
          "Notifications par email et SMS à chaque étape",
          "Suivi en temps réel sur notre plateforme",
          "Statut mis à jour : commande confirmée, expédiée, arrivée, prête",
          "Support client disponible pour toute question"
        ],
        steps: [
          { status: "Confirmée", color: "text-green-500" },
          { status: "Préparation", color: "text-blue-500" },
          { status: "Expédié", color: "text-purple-500" },
          { status: "Arrivée", color: "text-amber-500" },
          { status: "Prête", color: "text-green-500" }
        ]
      }
    },
    {
      id: "delais-importation",
      title: "Délais et conditions",
      icon: <Clock className="h-6 w-6" />,
      color: "text-amber-500",
      bgColor: "bg-amber-500/10",
      borderColor: "border-amber-500",
      description: "Tout savoir sur les délais et modes d'expédition.",
      content: {
        intro: "Deux modes d'expédition sont disponibles selon vos besoins :",
        points: [
          "✈️ Expédition par AVION : Paiement de 50% de la marchandise avant envoi",
          "🚢 Expédition par BATEAU : Paiement de 60% de la marchandise avant envoi",
          "Commande passée : 24-48h pour la confirmation",
          "Dédouanement inclus dans nos services",
          "Livraison finale : 24-48h sur Tananarive"
        ],
        transportModes: [
          { mode: "Avion", prepayment: "50%", duration: "2 à 3 semaines", icon: <Plane className="h-5 w-5" /> },
          { mode: "Bateau", prepayment: "60%", duration: "2 à 3 mois", icon: <Ship className="h-5 w-5" /> }
        ],
        note: "Les délais sont donnés à titre indicatif et peuvent varier selon les périodes"
      }
    }
  ];
  */

  return (
    <SiteLayout>
      {/* ==========================================
          MINIHERO
          ========================================== */}
      <div className="w-full max-w-[1700px] mx-auto px-4 sm:px-6 lg:px-8 py-4 flex flex-col gap-6">
        <MiniHero
          title="Importation Europe - Madagascar."
          description={
            <div className="flex flex-col">
              <p>Un produit introuvable dans le catalogue ?</p>
              <p className="pl-[2.5rem] sm:pl-[4.5rem] md:pl-[6rem]">
                On le recherche pour vous
              </p>
            </div>
          }
          bg="/Europe.png"
          pill={{
            icon: <Truck className="h-3.5 w-3.5" />,
            label: "Importation",
          }}
        />

        {/* INFO BAR COMMENTÉE */}
        {/* <InfoBar /> */}
      </div>

      {/* ==========================================
          FORMULAIRE D'IMPORTATION (nouveau design,
          conforme à la capture d'écran : champs
          "underline" sans fond, 2 colonnes, bouton
          d'ajout de fichier, bouton d'envoi orange)
          ========================================== */}
      <section className="py-8 lg:py-12">
        <div className="w-full max-w-[1700px] mx-auto px-4 sm:px-6 lg:px-8">
          {/* Titre principal */}
          <h1 className="text-3xl lg:text-4xl font-bold text-white mb-2">
            IMPORTATION EUROPE-MADAGASCAR
          </h1>

          {/* Sous-titre avec guillemets */}
          <div className="text-lg lg:text-xl text-muted-foreground mb-4 italic">
            <p>" Un produit introuvable dans les catalogues ?</p>
            <p className="pl-6 lg:pl-8">On le cherche pour toi "</p>
          </div>

          {/* Description */}
          <div className="text-sm lg:text-base text-muted-foreground max-w-3xl mb-8">
            <p>
              Tu as repéré un produit qui n'est pas disponible sur le site ? Donne-nous sa référence,
              un lien ou une description de ton besoin. Notre équipe vérifie les possibilités d'approvisionnement,
              le délai et le prix avant toute commande.
            </p>
          </div>

          {/* Titre du formulaire, souligné en pointillés */}
<h2 className="relative inline-block pb-3 mb-8">
  <span className="text-xl lg:text-2xl font-extrabold uppercase text-white tracking-wide">
    DECRIS NOUS{" "}
  </span>
  <span className="text-xl lg:text-2xl font-semibold italic uppercase text-white/90 tracking-wide">
    TES BESOINS
  </span>

  {/* ligne pleine sous "DECRIS NOUS" */}
  <span className="absolute left-0 bottom-0 w-[58%] border-b-2 border-white" />

  {/* ligne pointillée sous "TES BESOINS" */}
  <span className="absolute left-[58%] right-0 bottom-0 border-b-2 border-dashed border-white/70" />

  {/* flèche courbée en bout de ligne */}
  <svg
    className="absolute -bottom-4 -right-6 h-5 w-5 text-white"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M3 3c7 0 13 4 13 13" />
    <path d="M10 12l6 6 6-6" />
  </svg>
</h2>



          {/* Formulaire dans une carte blanche, même largeur/alignement que le MiniHero */}
          <form
            onSubmit={handleSubmit}
            className="w-full mx-auto bg-white rounded-2xl px-5 py-6 sm:px-8 lg:px-10 lg:py-7"
          >
            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-16 gap-y-4">
              {/* Colonne gauche */}
              <div className="flex flex-col gap-4">
                <div>
                  <label className="block text-sm italic text-gray-500 mb-1">
                    Catégorie(*)
                  </label>
                  <input
                    type="text"
                    name="categorie"
                    value={formData.categorie}
                    onChange={handleChange}
                    className="w-full bg-transparent border-0 border-b border-gray-300 px-0 py-2 text-black focus:outline-none focus:border-orange-500"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm italic text-gray-500 mb-1">
                    Nom et prénom(*)
                  </label>
                  <input
                    type="text"
                    name="nom"
                    value={formData.nom}
                    onChange={handleChange}
                    className="w-full bg-transparent border-0 border-b border-gray-300 px-0 py-2 text-black focus:outline-none focus:border-orange-500"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm italic text-gray-500 mb-1">
                    Email(*)
                  </label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    className="w-full bg-transparent border-0 border-b border-gray-300 px-0 py-2 text-black focus:outline-none focus:border-orange-500"
                    required
                  />
                </div>
              </div>

              {/* Colonne droite */}
              <div className="flex flex-col gap-4">
                <div>
                  <label className="block text-sm italic text-gray-500 mb-1">
                    Téléphone(*)
                  </label>
                  <input
                    type="tel"
                    name="telephone"
                    value={formData.telephone}
                    onChange={handleChange}
                    className="w-full bg-transparent border-0 border-b border-gray-300 px-0 py-2 text-black focus:outline-none focus:border-orange-500"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm italic text-gray-500 mb-1">
                    Société
                  </label>
                  <input
                    type="text"
                    name="societe"
                    value={formData.societe}
                    onChange={handleChange}
                    className="w-full bg-transparent border-0 border-b border-gray-300 px-0 py-2 text-black focus:outline-none focus:border-orange-500"
                  />
                </div>

                <div>
                  <label
                    htmlFor="fichier-import"
                    className="inline-flex items-center gap-2 bg-black text-white text-sm font-medium px-4 py-2 rounded-lg cursor-pointer hover:bg-black/80 transition-colors"
                  >
                    J'ajoute un fichier
                    <Paperclip className="h-4 w-4" />
                  </label>
                  <input
                    id="fichier-import"
                    type="file"
                    onChange={handleFileChange}
                    className="hidden"
                  />
                  {fichier && (
                    <p className="text-xs text-gray-500 mt-2 truncate">
                      {fichier.name}
                    </p>
                  )}
                </div>
              </div>

              {/* Description, pleine largeur */}
              <div className="md:col-span-2">
                <label className="block text-sm italic text-gray-500 mb-1">
                  Description des besoins: Marque du portable, Modèle, Pièce recherchée (Batterie, Ecran, Clavier)...(*)
                </label>
                <input
                  type="text"
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  className="w-full bg-transparent border-0 border-b border-gray-300 px-0 py-2 text-black focus:outline-none focus:border-orange-500"
                  required
                />
              </div>
            </div>

            {/* Notes */}
            <div className="text-sm mt-5 mb-4 space-y-1">
              <p className="text-black italic">" Réponse sous 24h avec devis d'importation "</p>
              <p className="text-red-500 italic">*: ces champs doivent être obligatoirement remplis</p>
            </div>

            {/* Bouton d'envoi */}
            <div className="flex justify-end">
              <button
                type="submit"
                disabled={isSubmitting}
                className="inline-flex items-center gap-2 bg-orange-500 hover:bg-orange-600 text-white font-medium px-6 py-3 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSubmitting ? "Envoi en cours..." : "J'envoie ma demande"}
                <Send className="h-4 w-4" />
              </button>
            </div>
          </form>
        </div>
      </section>

      {/* ==========================================
          MINIHERO — IMPORTATION CHINE-MADAGASCAR
          (avant le footer)
          ========================================== */}
      <div className="w-full max-w-[1700px] mx-auto px-4 sm:px-6 lg:px-8 py-4 flex flex-col gap-6">
        <MiniHero
          title="Importation Chine-Madagascar"
          description={
            <div className="flex flex-col">
              <p>" Pour réparer, il faut parfois chercher plus loin "</p>
            </div>
          }
          bg="/Afrique.png" // Image provenant du dossier public/
          pill={{
            icon: <Truck className="h-3.5 w-3.5" />,
            label: "Importation",
          }}
        />
      </div>

      {/* ==========================================
          FORMULAIRE D'IMPORTATION CHINE-MADAGASCAR
          ========================================== */}
      <section className="py-8 lg:py-12">
        <div className="w-full max-w-[1700px] mx-auto px-4 sm:px-6 lg:px-8">
          {/* Description */}
          <div className="text-sm lg:text-base text-muted-foreground max-w-3xl mb-8">
            <p>
              Certaines pièces de rechange pour PC portables, notamment les cartes mères, sont difficiles a trouver en Europe,
              ainsi, on effectue un sourcing cible en Chine afin de trouver la pièce compatible nécessaire a la réparation de ton ordinateur portable.
            </p>
          </div>

          {/* Titre du formulaire, souligné en pointillés */}
<h2 className="relative inline-block pb-3 mb-8">
  <span className="text-xl lg:text-2xl font-extrabold uppercase text-white tracking-wide">
    DECRIS NOUS{" "}
  </span>
  <span className="text-xl lg:text-2xl font-semibold italic uppercase text-white/90 tracking-wide">
    TES BESOINS
  </span>

  {/* ligne pleine sous "DECRIS NOUS" */}
  <span className="absolute left-0 bottom-0 w-[58%] border-b-2 border-white" />

  {/* ligne pointillée sous "TES BESOINS" */}
  <span className="absolute left-[58%] right-0 bottom-0 border-b-2 border-dashed border-white/70" />

  {/* flèche courbée en bout de ligne */}
  <svg
    className="absolute -bottom-4 -right-6 h-5 w-5 text-white"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M3 3c7 0 13 4 13 13" />
    <path d="M10 12l6 6 6-6" />
  </svg>
</h2>

          {/* Formulaire dans une carte blanche, même largeur/alignement que le MiniHero */}
          <form
            onSubmit={handleSubmitChine}
            className="w-full mx-auto bg-white rounded-2xl px-5 py-6 sm:px-8 lg:px-10 lg:py-7"
          >
            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-16 gap-y-4">
              {/* Colonne gauche */}
              <div className="flex flex-col gap-4">
                <div>
                  <label className="block text-sm italic text-gray-500 mb-1">
                    Catégorie(*)
                  </label>
                  <input
                    type="text"
                    name="categorie"
                    value={formDataChine.categorie}
                    onChange={handleChangeChine}
                    className="w-full bg-transparent border-0 border-b border-gray-300 px-0 py-2 text-black focus:outline-none focus:border-orange-500"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm italic text-gray-500 mb-1">
                    Nom et prénom(*)
                  </label>
                  <input
                    type="text"
                    name="nom"
                    value={formDataChine.nom}
                    onChange={handleChangeChine}
                    className="w-full bg-transparent border-0 border-b border-gray-300 px-0 py-2 text-black focus:outline-none focus:border-orange-500"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm italic text-gray-500 mb-1">
                    Email(*)
                  </label>
                  <input
                    type="email"
                    name="email"
                    value={formDataChine.email}
                    onChange={handleChangeChine}
                    className="w-full bg-transparent border-0 border-b border-gray-300 px-0 py-2 text-black focus:outline-none focus:border-orange-500"
                    required
                  />
                </div>
              </div>

              {/* Colonne droite */}
              <div className="flex flex-col gap-4">
                <div>
                  <label className="block text-sm italic text-gray-500 mb-1">
                    Téléphone(*)
                  </label>
                  <input
                    type="tel"
                    name="telephone"
                    value={formDataChine.telephone}
                    onChange={handleChangeChine}
                    className="w-full bg-transparent border-0 border-b border-gray-300 px-0 py-2 text-black focus:outline-none focus:border-orange-500"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm italic text-gray-500 mb-1">
                    Entreprise
                  </label>
                  <input
                    type="text"
                    name="entreprise"
                    value={formDataChine.entreprise}
                    onChange={handleChangeChine}
                    className="w-full bg-transparent border-0 border-b border-gray-300 px-0 py-2 text-black focus:outline-none focus:border-orange-500"
                  />
                </div>

                <div>
                  <label
                    htmlFor="fichier-import-chine"
                    className="inline-flex items-center gap-2 bg-black text-white text-sm font-medium px-4 py-2 rounded-lg cursor-pointer hover:bg-black/80 transition-colors"
                  >
                    J'ajoute un fichier
                    <Paperclip className="h-4 w-4" />
                  </label>
                  <input
                    id="fichier-import-chine"
                    type="file"
                    onChange={handleFileChangeChine}
                    className="hidden"
                  />
                  {fichierChine && (
                    <p className="text-xs text-gray-500 mt-2 truncate">
                      {fichierChine.name}
                    </p>
                  )}
                </div>
              </div>

              {/* Description, pleine largeur */}
              <div className="md:col-span-2">
                <label className="block text-sm italic text-gray-500 mb-1">
                  Description des besoins: Marque du portable, Modèle, Pièce recherchée (Batterie, Ecran, Clavier)...(*)
                </label>
                <input
                  type="text"
                  name="description"
                  value={formDataChine.description}
                  onChange={handleChangeChine}
                  className="w-full bg-transparent border-0 border-b border-gray-300 px-0 py-2 text-black focus:outline-none focus:border-orange-500"
                  required
                />
              </div>
            </div>

            {/* Notes */}
            <div className="text-sm mt-5 mb-4 space-y-1">
              <p className="text-black italic">" Réponse sous 24h avec devis d'importation "</p>
              <p className="text-red-500 italic">*: ces champs doivent être obligatoirement remplis</p>
            </div>

            {/* Bouton d'envoi */}
            <div className="flex justify-end">
              <button
                type="submit"
                disabled={isSubmittingChine}
                className="inline-flex items-center gap-2 bg-orange-500 hover:bg-orange-600 text-white font-medium px-6 py-3 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSubmittingChine ? "Envoi en cours..." : "J'envoie ma demande"}
                <Send className="h-4 w-4" />
              </button>
            </div>
          </form>
        </div>
      </section>

      {/* ==========================================
          ANCIEN FORMULAIRE (boîtes avec fond,
          bordures, 3/2 colonnes, bouton bleu) —
          remplacé par le nouveau design ci-dessus,
          conservé en commentaire pour référence
          ==========================================
      <section className="py-8 lg:py-12">
        <div className="w-full max-w-[1700px] mx-auto px-4 sm:px-6 lg:px-8">
          <form onSubmit={handleSubmit} className="max-w-3xl">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
              <div>
                <label className="block text-sm text-muted-foreground mb-1">
                  Catégorie<span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="categorie"
                  value={formData.categorie}
                  onChange={handleChange}
                  className="w-full bg-secondary/20 border border-border rounded-lg px-4 py-2 text-white focus:outline-none focus:border-blue-500"
                  required
                />
              </div>
              <div>
                <label className="block text-sm text-muted-foreground mb-1">
                  Téléphone<span className="text-red-500">*</span>
                </label>
                <input
                  type="tel"
                  name="telephone"
                  value={formData.telephone}
                  onChange={handleChange}
                  className="w-full bg-secondary/20 border border-border rounded-lg px-4 py-2 text-white focus:outline-none focus:border-blue-500"
                  required
                />
              </div>
              <div>
                <label className="block text-sm text-muted-foreground mb-1">
                  Société
                </label>
                <input
                  type="text"
                  name="societe"
                  value={formData.societe}
                  onChange={handleChange}
                  className="w-full bg-secondary/20 border border-border rounded-lg px-4 py-2 text-white focus:outline-none focus:border-blue-500"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <div>
                <label className="block text-sm text-muted-foreground mb-1">
                  Nom et prénom<span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="nom"
                  value={formData.nom}
                  onChange={handleChange}
                  className="w-full bg-secondary/20 border border-border rounded-lg px-4 py-2 text-white focus:outline-none focus:border-blue-500"
                  required
                />
              </div>
              <div>
                <label className="block text-sm text-muted-foreground mb-1">
                  Email<span className="text-red-500">*</span>
                </label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  className="w-full bg-secondary/20 border border-border rounded-lg px-4 py-2 text-white focus:outline-none focus:border-blue-500"
                  required
                />
              </div>
            </div>

            <div className="mb-6">
              <label className="block text-sm text-muted-foreground mb-1">
                Description des besoins: Marque du portable, Modèle, Pièce recherchée (Batterie, Ecran, Clavier)...<span className="text-red-500">*</span>
              </label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleChange}
                rows={4}
                className="w-full bg-secondary/20 border border-border rounded-lg px-4 py-2 text-white focus:outline-none focus:border-blue-500 resize-none"
                required
              />
            </div>

            <div className="text-sm text-muted-foreground mb-6 space-y-1">
              <p className="text-green-500">✓ Réponse sous 24h avec devis d'importation</p>
              <p className="text-red-500">* Ces champs doivent être obligatoirement remplis</p>
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-medium px-6 py-3 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSubmitting ? "Envoi en cours..." : "Envoyer"}
              <Send className="h-4 w-4" />
            </button>
          </form>
        </div>
      </section>
      */}

      {/* ==========================================
          ANCIEN CONTENU DÉTAILLÉ (sections avec
          process / suivi / modes de transport) —
          déjà commenté dans la version d'origine
          ========================================== */}
      {/*
      <section className="py-16 lg:py-24">
        <div className="w-full max-w-[1700px] mx-auto px-4 sm:px-6 lg:px-8">
          <div className="space-y-12 lg:space-y-16">
            {sections.map((section) => (
              <div
                key={section.id}
                id={section.id}
                className="group scroll-mt-20"
              >
                <div className="flex items-center gap-3 mb-8">
                  <div className={`p-2 rounded-lg ${section.bgColor} ${section.color}`}>
                    {section.icon}
                  </div>
                  <div>
                    <h2 className={`text-xl lg:text-2xl font-semibold ${section.color}`}>
                      {section.title}
                    </h2>
                    <p className="text-sm text-muted-foreground">{section.description}</p>
                  </div>
                </div>

                <div className={`bg-secondary/5 rounded-2xl border ${section.borderColor} border-opacity-30 overflow-hidden`}>
                  <div className="p-6 lg:p-8">
                    <p className="text-muted-foreground mb-6">{section.content.intro}</p>

                    <div className="grid sm:grid-cols-2 gap-3 mb-8">
                      {section.content.points.map((point, idx) => (
                        <div key={idx} className="flex items-start gap-2 text-sm">
                          <CheckCircle className={`h-4 w-4 ${section.color} shrink-0 mt-0.5`} />
                          <span className="text-muted-foreground">{point}</span>
                        </div>
                      ))}
                    </div>

                    {section.content.process && (
                      <div className="border-t border-border pt-6">
                        <div className="grid grid-cols-5 gap-2">
                          {section.content.process.map((step) => (
                            <div key={step.step} className="text-center">
                              <div className={`w-7 h-7 mx-auto rounded-full ${section.bgColor} ${section.color} flex items-center justify-center text-sm font-medium mb-2`}>
                                {step.step}
                              </div>
                              <p className="text-xs font-medium">{step.title}</p>
                              <p className="text-[11px] text-muted-foreground">{step.desc}</p>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {section.content.steps && (
                      <div className="border-t border-border pt-6">
                        <div className="flex items-center justify-between gap-1">
                          {section.content.steps.map((step, idx) => (
                            <div key={idx} className="flex-1 text-center">
                              <div className={`w-1.5 h-1.5 mx-auto rounded-full ${step.color.replace('text', 'bg')} mb-2 opacity-60`} />
                              <p className={`text-[11px] font-medium ${step.color}`}>{step.status}</p>
                              {idx < section.content.steps.length - 1 && (
                                <div className="hidden lg:block text-muted-foreground/30 text-xs mt-1">→</div>
                              )}
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {section.content.transportModes && (
                      <div className="border-t border-border pt-6">
                        <div className="grid sm:grid-cols-2 gap-4">
                          {section.content.transportModes.map((mode, idx) => (
                            <div key={idx} className={`flex items-center gap-4 p-4 rounded-xl ${section.bgColor}`}>
                              <div className={`p-2 rounded-full bg-white/10 ${section.color}`}>
                                {mode.icon}
                              </div>
                              <div>
                                <p className={`font-semibold ${section.color}`}>{mode.mode}</p>
                                <div className="flex gap-3 text-xs mt-1">
                                  <span>Acompte: <span className="font-medium">{mode.prepayment}</span></span>
                                  <span className="text-muted-foreground">Délai: {mode.duration}</span>
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                        <p className="text-xs text-muted-foreground text-center mt-4">{section.content.note}</p>
                      </div>
                    )}
                  </div>

                  <div className="border-t border-border bg-secondary/10 px-6 lg:px-8 py-4">
                    <Link
                      to="/devis-express"
                      className={`inline-flex items-center gap-2 text-sm font-medium ${section.color} hover:opacity-80 transition-opacity`}
                    >
                      <Send className="h-3.5 w-3.5" />
                      Contactez-nous
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
      */}
    </SiteLayout>
  );
};

export default Importation;