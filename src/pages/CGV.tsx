import { useLocation } from "react-router-dom";
import { useEffect } from "react";
import {
  Shield,
  FileText,
  Clock,
  Truck,
  RefreshCw,
  CreditCard,
  AlertCircle,
  Headset,
  ChartBar,
  Ship,
  CheckCircle,
  MapPin,
  Package,
  RotateCcw,
  Lock,
  Mail,
  Phone,
  Calendar,
  Receipt,
  Building2,
  ListChecks,
  FileBarChart,
  Wrench,
  FileTextIcon,
} from "lucide-react";
import { Link } from "react-router-dom";
import { SiteLayout } from "@/components/site/SiteLayout";
import { MiniHero } from "@/components/layout/MiniHero";

/* ─────────────────────────────────────────────
   Ancres de navigation
───────────────────────────────────────────── */
const ANCHORS = [
  { href: "#facturation", label: "Facturation" },
  { href: "#sav", label: "SAV prioritaire" },
  { href: "#audit", label: "Audit de parc" },
  { href: "#import", label: "Importation" },
  { href: "#cgv", label: "Conditions de vente" },
];

/* ─────────────────────────────────────────────
   Sous-composants réutilisables
───────────────────────────────────────────── */

/** Pill / badge de section */
function SectionLabel({
  icon: Icon,
  children,
}: {
  icon: React.ElementType;
  children: React.ReactNode;
}) {
  return (
    <div className="flex items-center gap-2 mb-3">
      <Icon className="h-4 w-4 text-blue-500" />
      <span className="text-xs font-bold uppercase tracking-widest text-blue-500 font-display">
        {children}
      </span>
    </div>
  );
}

/** Carte d'offre Pro */
function ProCard({
  icon: Icon,
  title,
  description,
}: {
  icon: React.ElementType;
  title: string;
  description: string;
}) {
  return (
    <div className="card p-5 hover:border-blue-500/30 transition-colors duration-200">
      <div className="flex items-center justify-center w-9 h-9 rounded-lg bg-blue-500/10 border border-blue-500/20 mb-4">
        <Icon className="h-4.5 w-4.5 text-blue-500" />
      </div>
      <h3 className="font-semibold text-sm mb-1.5">{title}</h3>
      <p className="text-sm text-muted-foreground leading-relaxed">{description}</p>
    </div>
  );
}

/** Ligne de CGV */
function CgvRow({
  icon: Icon,
  number,
  title,
  children,
}: {
  icon: React.ElementType;
  number: string;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex items-start gap-4 py-5 border-b border-border last:border-b-0">
      <div className="flex items-center justify-center w-8 h-8 rounded-md bg-secondary border border-border flex-shrink-0 mt-0.5">
        <Icon className="h-4 w-4 text-muted-foreground" />
      </div>
      <div className="flex-1 min-w-0">
        <h4 className="text-sm font-semibold mb-1">
          <span className="text-muted-foreground font-normal mr-1.5">{number}.</span>
          {title}
        </h4>
        <div className="text-sm text-muted-foreground leading-relaxed">{children}</div>
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────────
   Page principale
───────────────────────────────────────────── */
const CGV = () => {
  const location = useLocation();

  useEffect(() => {
    document.title = "Conditions de vente — Les Casaniers Madagascar";
    const meta =
      document.querySelector('meta[name="description"]') ??
      document.head.appendChild(
        Object.assign(document.createElement("meta"), { name: "description" })
      );
    meta.setAttribute(
      "content",
      "Facturation normée, SAV prioritaire 24 mois, audit de parc et importation directe. Solutions B2B pour entreprises à Madagascar."
    );
  }, []);

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, [location.pathname]);

  return (
    <SiteLayout>
      <MiniHero
        title="Des solutions pensées pour les professionnels."
        description="Facturation conforme, SAV réactif, audit de parc et importation
            directe | tout ce dont votre entreprise a besoin, au même endroit."
        bg="5.png"
      />

      {/* ── FACTURATION ──────────────────────────────── */}
      <section id="facturation" className="py-20 border-b border-border">
        <div className="container-x max-w-5xl mx-auto">
          <SectionLabel icon={Receipt}>Facturation</SectionLabel>
          <h2 className="text-3xl font-bold mb-3">Facturation normée B2B</h2>
          <p className="text-muted-foreground max-w-xl mb-10">
            Factures conformes aux exigences comptables malgaches, avec NIF,
            STAT et références internes de votre organisation.
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <ProCard
              icon={FileText}
              title="Devis détaillé"
              description="Devis officiel signé avec référence produit, quantité et conditions de paiement adaptées."
            />
            <ProCard
              icon={Building2}
              title="Facture pro forma"
              description="Émise avant livraison pour validation budgétaire ou procédure d'importation."
            />
            <ProCard
              icon={FileTextIcon}
              title="Facture définitive"
              description="Avec NIF/STAT du client, numéro de marché et code analytique si nécessaire."
            />
          </div>
        </div>
      </section>

      {/* ── SAV + GARANTIE ───────────────────────────── */}
      <section id="sav" className="py-20 border-b border-border">
        <div className="container-x max-w-5xl mx-auto">
          <SectionLabel icon={Headset}>SAV</SectionLabel>
          <h2 className="text-3xl font-bold mb-3">SAV prioritaire & garantie 24 mois</h2>
          <p className="text-muted-foreground max-w-xl mb-8">
            Un interlocuteur dédié pour vos demandes techniques, avec engagement
            de délai et couverture complète sur tous nos produits.
          </p>

          {/* Banner garantie */}
          <div className="bg-blue-500/8 border border-blue-500/25 rounded-lg p-6 flex items-start gap-4 mb-8">
            <Shield className="h-7 w-7 text-blue-500 flex-shrink-0 mt-0.5" />
            <div>
              <h3 className="font-bold text-base mb-1">
                Garantie légale 24 mois — pièces &amp; main-d'œuvre
              </h3>
              <p className="text-sm text-muted-foreground leading-relaxed">
                Tous nos produits couvrent les défauts de fabrication et vices
                cachés pendant 24 mois. Le SAV est assuré localement à
                Antananarivo. Engagement de traitement sous 48h ouvrées.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <ProCard
              icon={Clock}
              title="Réponse sous 48h"
              description="Toute demande par email ou téléphone est traitée sous 48 heures ouvrées par notre équipe locale."
            />
            <ProCard
              icon={MapPin}
              title="SAV local à Tana"
              description="Pas d'envoi en dehors de Madagascar — notre atelier est basé à Antananarivo."
            />
          </div>
        </div>
      </section>

      {/* ── AUDIT ────────────────────────────────────── */}
      <section id="audit" className="py-20 border-b border-border">
        <div className="container-x max-w-5xl mx-auto">
          <SectionLabel icon={ChartBar}>Audit</SectionLabel>
          <h2 className="text-3xl font-bold mb-3">Audit de parc informatique</h2>
          <p className="text-muted-foreground max-w-xl mb-10">
            Inventaire, diagnostic et recommandations personnalisées pour votre
            flotte de matériels — livrés sous 5 jours ouvrés.
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <ProCard
              icon={ListChecks}
              title="Inventaire complet"
              description="Recensement de votre parc avec état, âge et criticité de chaque équipement."
            />
            <ProCard
              icon={RotateCcw}
              title="Plan de renouvellement"
              description="Proposition hiérarchisée pour optimiser votre budget matériel sur 12 à 36 mois."
            />
            <ProCard
              icon={FileBarChart}
              title="Rapport détaillé"
              description="Document PDF avec synthèse exécutive et recommandations livrées sous 5 jours."
            />
          </div>
        </div>
      </section>

      {/* ── IMPORTATION ──────────────────────────────── */}
      <section id="import" className="py-20 border-b border-border">
        <div className="container-x max-w-5xl mx-auto">
          <SectionLabel icon={Ship}>Importation</SectionLabel>
          <h2 className="text-3xl font-bold mb-3">Importation directe sur commande</h2>
          <p className="text-muted-foreground max-w-xl mb-10">
            Accès à notre sourcing fournisseur pour des besoins spécifiques non
            disponibles en stock local.
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <ProCard
              icon={Package}
              title="Sourcing sur mesure"
              description="Nous identifions et commandons chez nos partenaires les références hors catalogue pour votre usage professionnel."
            />
            <ProCard
              icon={FileText}
              title="Dossier douanier inclus"
              description="Prise en charge complète des formalités : packing list, certificats d'origine, dédouanement."
            />
          </div>
        </div>
      </section>

      {/* ── CGV ──────────────────────────────────────── */}
      <section id="cgv" className="py-20">
        <div className="container-x max-w-4xl mx-auto">

          {/* En-tête section */}
          <div className="flex items-center gap-2 mb-3">
            <FileText className="h-4 w-4 text-muted-foreground" />
            <span className="text-xs font-bold uppercase tracking-widest text-muted-foreground">
              Conditions générales de vente
            </span>
          </div>
          <h2 className="text-3xl font-bold mb-3">Conditions de vente</h2>
          <p className="text-muted-foreground max-w-xl mb-10">
            Applicables à l'ensemble de nos transactions, B2C et B2B.
          </p>

          {/* Articles CGV */}
          <div className="border border-border rounded-lg overflow-hidden mb-8">
            <div className="divide-y divide-border px-6">

              <CgvRow icon={CreditCard} number="1" title="Prix">
                Indiqués en Ariary (Ar), toutes taxes comprises. Les prix
                peuvent être modifiés à tout moment ; seul le tarif en vigueur
                à la validation de la commande est applicable.
              </CgvRow>

              <CgvRow icon={FileText} number="2" title="Passation de commande">
                La validation de la commande vaut acceptation des présentes CGV.
                Une confirmation est envoyée par email avec le détail complet.
              </CgvRow>

              <CgvRow icon={CreditCard} number="3" title="Modalités de paiement">
                <ul className="space-y-1 mt-1">
                  {[
                    "Paiement en espèces à la livraison",
                    "Virement bancaire",
                    "Mobile Money (MVola, Airtel Money)",
                    "Carte bancaire (via notre plateforme sécurisée)",
                  ].map((item) => (
                    <li key={item} className="flex items-center gap-2">
                      <CheckCircle className="h-3.5 w-3.5 text-blue-500 flex-shrink-0" />
                      {item}
                    </li>
                  ))}
                </ul>
              </CgvRow>

              <CgvRow icon={Truck} number="4" title="Livraison">
                Gratuite sur Antananarivo (délai 48h). Pour le reste de
                Madagascar : 3 à 5 jours ouvrés. Emballage double carton avec
                mousse anti-choc.
              </CgvRow>

              <CgvRow icon={RefreshCw} number="5" title="Droit de rétractation">
                14 jours à compter de la réception pour exercer votre droit de
                rétractation, sans justification ni pénalité, conformément à la
                loi.
              </CgvRow>

              <CgvRow icon={Wrench} number="6" title="Service Après-Vente">
                SAV situé à Antananarivo. Toute demande est traitée sous 48h
                ouvrées. Garantie légale 24 mois (pièces &amp; main-d'œuvre)
                sur l'ensemble de nos produits.
              </CgvRow>

              <CgvRow icon={Lock} number="7" title="Données personnelles">
                Vos données sont collectées uniquement pour le traitement de
                votre commande. Vous disposez d'un droit d'accès, de
                rectification et d'opposition conformément à la loi.
              </CgvRow>

            </div>
          </div>

          {/* Contact */}
          <div className="bg-secondary/30 border border-border rounded-lg p-6 flex flex-wrap items-center justify-between gap-6">
            <div>
              <h3 className="font-bold text-base mb-1">Nous contacter</h3>
              <p className="text-sm text-muted-foreground">
                Pour toute question relative à nos CGV ou à vos commandes pro.
              </p>
            </div>
            <div className="flex flex-col gap-2">
              <a
                href="mailto:contact@lescasaniers.mg"
                className="flex items-center gap-2 text-sm text-blue-500 hover:underline"
              >
                <Mail className="h-4 w-4" />
                contact@lescasaniers.mg
              </a>
              <a
                href="tel:+261341234567"
                className="flex items-center gap-2 text-sm text-blue-500 hover:underline"
              >
                <Phone className="h-4 w-4" />
                +261 34 12 345 67
              </a>
            </div>
          </div>

          {/* Date */}
          <p className="flex items-center gap-1.5 text-xs text-muted-foreground mt-5">
            <Calendar className="h-3.5 w-3.5" />
            Conditions mises à jour le 1ᵉʳ janvier 2026
          </p>

        </div>
      </section>

    </SiteLayout>
  );
};

export default CGV;